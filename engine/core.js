'use strict'

const GAME_PREFIX = "sliders_"
const SAVE_PREFIX = GAME_PREFIX + "saveData"
const SAVE_PREFIX_LENGTH = SAVE_PREFIX.length

function frame() {
	viewport.advanceView()
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
			setMap(n, v) {
				game.setMap(Map(mapLevel(n, v), mapMaker))
			},
		}

	gui.init()
	animations.init()
	
	if (!loadState("_Autosave", false, true))
		game.reset(true)

//	viewport.init()

	let worker = new Worker ("./utility/worker.js")
	
	let readyMessage = {
		name : "ready"
	}
	
	worker.onmessage = (event) => {
		let data = event.data

		switch (data.name) {
			case "advance":
				
				if (!game.offline) {
					let time = performance.now()
					game.advance(data.time)
				}
				
				worker.postMessage(readyMessage)
				break
		}
	}

	worker.postMessage({
		name : "start",
		frameTime : game.frameTime
	})

	requestAnimationFrame(frame)
}

window.onresize = (event) => {
	getSize()
	game.updateBackground = true
}