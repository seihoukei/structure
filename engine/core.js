'use strict'

const GAME_PREFIX = "sliders_"
const SAVE_PREFIX = GAME_PREFIX + "saveData"
const SAVE_PREFIX_LENGTH = SAVE_PREFIX.length

const core = {}

function frame() {
	if (!game.offline && !game.tempOffline) {
		gui.mainViewport.advanceView()
		gui.worldViewport.advanceView()
	}
	game.render()
	
	requestAnimationFrame(frame)
}

window.onload = (event) => {
	const settingsData = localStorage[GAME_PREFIX + "settings"]
	
	if (settingsData) 
		Object.assign(settings, JSON.parse(settingsData))
	
	if (settings.invert) 
		document.body.classList.add("invert")

	if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
		game.dev = {
//			display : createElement("div", "dev", document.body),
//			boost : 60,
//			autoSkills : ["autoTarget", "sensor"],
//			seeAll : true,
			coreCoordinates : true,
			setMap(n, v, f) {
				game.createMap("dev", n, v, f)
				game.setMap("dev", 1)
			},
		}
		
	core.lastStarfield = localStorage[GAME_PREFIX + "starfield"] || Date.now()

	core.worker = new Worker ("./utility/worker.js")
	core.lzWorker = new Worker ("./utility/lzworker.js")
	
	core.callbacks = {}
	
	core.setTimeout = (callback, time) => {
		const id = Math.random()+"-"+performance.now()
		core.callbacks[id] = callback
		core.worker.postMessage({
			name : "delay",
			id : id,
			delay : time
		})
		return id
	}
	
	core.clearTimeout = (id) => {
		delete core.callbacks[id]
	}
	
	core.readyMessage = {
		name : "ready"
	}
	
	core.getNextFrame = () => {
		core.worker.postMessage(core.readyMessage)
	}
	
	core.worker.onmessage = (event) => {
		let data = event.data

		switch (data.name) {
			case "advance":
				
				if (!game.offline) {
					let time = performance.now()
					game.advance(data.time, core.getNextFrame)
				}
				
				break
			case "delay": {
				const callback = core.callbacks[data.id]
				callback && callback()
				delete core.callbacks[data.id]
			}
		}
	}

	core.lzWorker.onmessage = (event) => {
		const data = event.data
		if (data.name == "done") {
			finalizeSave(data.slot, data.data, data.postfix, data.nobackup)
		}
	}
	
	gui.init()
	cloud.init()
	animations.init()
	
	if (!loadState("_Autosave", false, true))
		game.reset(true)

	initEvents()
//	gui.mainViewport.init()

	core.worker.postMessage({
		name : "start",
		frameTime : 1000 / settings.dataFPS
	})
	
	requestAnimationFrame(frame)
}

function initEvents() {
	window.onresize = (event) => {
		getSize()
		game.updateMapBackground = true
		game.updateWorldBackground = true
		game.lastAction = performance.now()
	}
	
	window.onblur = (event) => {
		if (game && settings.slowModeBackground)
			game.enableSlowMode(2)
	}
	
	window.onmousemove = (event) => {
		game.lastAction = performance.now()
		if (game.slowMode == 1)
			game.disableSlowMode()
	}
	
	window.onkeydown = (event) => {
		game.lastAction = performance.now()
		if (game.slowMode == 1)
			game.disableSlowMode()
	}
	
	window.onfocus = (event) => {
		game.lastAction = performance.now()
		if (game.slowMode == 2 || game.slowMode == 1)
			game.disableSlowMode()
	}
}

