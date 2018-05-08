'use strict'

const WorldTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "world "+(this.className || ""), this.parent)
		this.background = createElement("canvas", "background", this.dvDisplay)
		this.foreground = createElement("canvas", "foreground", this.dvDisplay)
		
		this.foreground.onmousedown = gui.worldMouse.onmousedown.bind(gui.worldMouse)
		this.foreground.onmousemove = gui.worldMouse.onmousemove.bind(gui.worldMouse)
		this.foreground.onmouseup = this.foreground.onmouseleave = this.foreground.onmouseout = gui.worldMouse.onmouseup.bind(gui.worldMouse)	
		this.foreground.onwheel = gui.worldMouse.onwheel.bind(gui.worldMouse)
		this.foreground.oncontextmenu = (event) => event.preventDefault()
		
		this.foregroundContext = this.foreground.getContext("2d")
		this.backgroundContext = this.background.getContext("2d")
		
		this.dvWorkers = createElement("div", "workers", this.dvDisplay)
		
		this.dvBuildButton = createElement("div", "build-button", this.dvDisplay, "Build")
		this.dvBuildButton.onclick = (event) => {
			this.build.dvHolder.classList.toggle("hidden", false)
			this.build.update(true)
			this.build.dvDisplay.style.left = event.clientX + "px"
			this.build.dvDisplay.style.top = event.clientY + "px"
		}

		this.presetMenu = PresetMenu({
			prefix : "w_",
			save(name) {
				game.world.savePreset(name)
			},
			load(name) {
				game.world.loadPreset(name)
			},
			reset() {
				game.world.sellAll()
			}
		})
		
		this.dvPresetsButton = createElement("div", "presets-button", this.dvDisplay, "Presets")
		this.dvPresetsButton.onclick = (event) => {
			this.presetMenu.presets = game.world.presets,
			this.presetMenu.show(event.clientX, event.clientY)
		}
		this.build = BuildList()
		
		this.dvFeatsButton = createElement("div", "feats-button", this.dvDisplay, "Feats")
		this.dvFeatsButton.onclick = (event) => {
			this.showingFeats = true
			this.updateFeats()
			this.dvFeatsHolder.classList.toggle("hidden", false)
		}

		this.dvFeatsHolder = createElement("div", "fullscreen-holder hidden", document.body)
		this.dvFeatsHolder.onclick = (event) => {
			if (event.target == this.dvFeatsHolder) {
				this.showingFeats = false
				this.dvFeatsHolder.classList.toggle("hidden", true)
			}
		}
		
		this.dvFeats = createElement("div", "dialog", this.dvFeatsHolder)
		this.dvFeatsTitle = createElement("div", "dialog-title", this.dvFeats, "Feats")
		this.dvFeatsList = createElement("div", "feats", this.dvFeats)
		
		this.feats = Object.values(FEATS).map(x => {
			const display = {id : x.id, feat : x}
			display.dvDisplay = createElement("div", "feat", this.dvFeatsList, x.desc)
			return display
		})
		
		this.hover = WorldPointInfo({
			parent : this.dvDisplay
		})
		
		this.target = WorldPointTarget({
			parent : this.dvDisplay
		})
	},
	
	onSet() {
		this.dvDisplay.appendChild(gui.map.dvHarvest)
		this.update(true)
		getSize()
	},
	
	updateFeats() {
		this.feats.map(x => {
			const done = game.feats[x.id]
			const failed = !done && game.map.failed[x.id]
			x.dvDisplay.classList.toggle("done", !!done)
			x.dvDisplay.classList.toggle("failed", !!failed)
		})
	},
	
	update(forced) {
		this.build.update()
		this.dvWorkers.innerText = "Workers: "+game.world.workers.length
		if (this.hover.point)
			this.hover.update()
		if (this.showingFeats) 
			this.updateFeats()
	}
})

const buildListHandler = {
	_init() {
		this.dvHolder = createElement("div", "holder hidden", document.body)
		this.dvHolder.onclick = (event) => {
			if (event.target == this.dvHolder)
				this.dvHolder.classList.toggle("hidden", true)
		}
		this.dvDisplay = createElement("div", "build", this.dvHolder)
		this.buildings = Object.values(WORLD_ELEMENTS).filter(x => x.type != WORLD_POINT_CORE).map(x => WorldBuilding({
			parent : this.dvDisplay,
			id : x.id,
			building : x
		}))
	},
	
	update(forced) {
		this.buildings.map(x => x.update(forced))
	},
}

const BuildList = Template(buildListHandler)

const worldBuildingHandler = {
	_init() {
		this.dvDisplay = createElement("div", "building", this.parent)
		this.dvHeader = createElement("div", "building-header", this.dvDisplay)
		this.dvIcon = createElement("div", "building-icon", this.dvHeader, this.building.iconText)
		this.dvIcon.style.backgroundColor = gui.theme.world[this.building.family]
		this.dvTitle = createElement("div", "building-title", this.dvHeader, this.building.name)
		this.dvDesc = createElement("div", "building-desc", this.dvDisplay, this.building.desc)
		if (this.building.cost) {
			this.dvCost = createElement("div", "building-cost", this.dvDisplay)
			this.costs = Object.keys(this.building.cost).map(x => {
				const display = {
					id : x
				}
				display.dvDisplay = createElement("div", "building-cost-holder", this.dvCost)
				display.dvType = createElement("div", "building-cost-icon bg-"+POINT_TYPES[+x.slice(1)], display.dvDisplay)
				display.dvValue = createElement("div", "building-cost-value", display.dvDisplay, this.building.cost[x])
				return display
			})
		}
		
		this.dvDisplay.onclick = (event) => {
			if (!game.world.canAfford(this.building.id)) return
			gui.world.build.dvHolder.classList.toggle("hidden", true)
			gui.worldMouse.state = MOUSE_STATE_BUILD
			gui.worldMouse.target = WorldPoint({
				type : this.building.id,
				x : gui.worldMouse.mapX,
				y : gui.worldMouse.mapY,
				newX : gui.worldMouse.mapX,
				newY : gui.worldMouse.mapY,
				world : game.world
			})
			gui.worldMouse.target.newConnections = game.world.predictConnections(gui.worldMouse.target)
		}
	},
	
	update(forced) {
		if (forced) {
			this.dvDisplay.classList.toggle("hidden", !(!this.building.blueprint || game.skills["world_"+this.building.blueprint]))
		}
		let canAfford = true
		if (this.building.cost) {
			this.costs.map(x => {
				const enough = game.resources[x.id] >= this.building.cost[x.id]
				x.dvValue.classList.toggle("enough", enough)
				canAfford = canAfford && enough
			})
		}
		this.dvDisplay.classList.toggle("active", canAfford)
	}
}

const WorldBuilding = Template(worldBuildingHandler)

const worldPointInfoHandler = {
	_init() {
		this.dvDisplay = createElement("div", "world-point hidden", this.parent)
		this.dvIcon = createElement("div", "world-point-icon", this.dvDisplay)
		this.dvInfo = createElement("div", "world-point-info", this.dvDisplay)
	},
	
	set(point, x, y) {
		if (!point) {
			delete this.point
			this.dvDisplay.classList.toggle("hidden", true)
			return
		}
		if (point != this.point) {
			this.point = point
			this.dvDisplay.classList.toggle("hidden", false)
			this.building = WORLD_ELEMENTS[this.point.type]
			this.update(true)
		}
		if (x > -1) {
			this.dvDisplay.style.left = (x + 5) + "px"
			this.dvDisplay.style.top = (y - 30) + "px"
		}
	},
	
	reset() {
		this.set(null)
	},
	
	update(forced) {
		if (forced) {
			this.dvIcon.innerText = this.building.iconText
			this.dvIcon.style.backgroundColor = gui.theme.world[this.point.family]
		}
		this.dvInfo.innerText = "Type: " + this.building.name + (this.point.depth < 100?"\nDepth: " + this.point.depth:"\nDetached") + "\n" + (this.point.active?"Effect: "+this.point.valueString():"Inactive")
	}
}

const WorldPointInfo = Template(worldPointInfoHandler)

const worldPointTargetHandler = {
	_init() {
		this.dvDisplay = createElement("div", "world-target hidden", this.parent)
		this.info = WorldPointInfo({
			parent : this.dvDisplay
		})
		this.dvButtons = createElement("div", "world-target-buttons", this.dvDisplay)
		this.dvMove = createElement("div", "world-target-button active", this.dvButtons, "Move")
		
		this.dvMove.onclick = (event) => {
//			this.dvDisplay.classList.toggle("hidden", true)
			gui.worldMouse.state = MOUSE_STATE_MOVE
			gui.worldMouse.target = this.point
			gui.worldMouse.target.newX = gui.worldMouse.mapX
			gui.worldMouse.target.newY = gui.worldMouse.mapY
			gui.worldMouse.target.newConnections = game.world.predictConnections(gui.worldMouse.target)
			game.world.updateBounds()
			game.updateWorldBackground = true
			this.reset()
			gui.world.hover.reset()
		}
		
		this.dvFree = createElement("div", "world-target-button active", this.dvButtons, "Free") 
		
		this.dvFree.onclick = (event) => {
			game.world.free(this.point)
			this.reset()
			gui.world.hover.reset()
		}
	},
	
	set(point, x, y) {
		if (!point) {
			delete this.point
			this.info.reset()
			this.dvDisplay.classList.toggle("hidden", true)
			return
		}
		if (point != this.point) {
			this.point = point
			this.dvDisplay.classList.toggle("hidden", false)
			this.building = WORLD_ELEMENTS[this.point.type]
			this.dvFree.classList.toggle("active", this.point.depth)
			this.info.set(point)
			this.update(true)
		}
		if (x > -1) {
			this.dvDisplay.style.left = (x + 5) + "px"
			this.dvDisplay.style.top = (y - 30) + "px"
		}
	},
	
	reset() {
		this.set(null)
	},
	
	update() {
		if (this.point)
			this.info.update()
	}
}

const WorldPointTarget = Template(worldPointTargetHandler)