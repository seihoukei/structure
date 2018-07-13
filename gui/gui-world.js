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
		
		this.dvHelp = createElement ("div", "help-button float-top-right", this.dvDisplay, "?")
		this.dvHelp.onclick = (event) => gui.guide.show("world")

		this.dvWorkers = createElement("div", "workers", this.dvDisplay)
		this.dvBonus = createElement("div", "bonus", this.dvDisplay)
		
		this.dvBuildButton = createElement("div", "build-button", this.dvDisplay, "Build")
		this.dvBuildButton.onclick = (event) => {
			this.build.dvHolder.classList.toggle("hidden", false)
			this.build.update(true)
			this.build.dvDisplay.style.left = event.clientX + "px"
			this.build.dvDisplay.style.top = event.clientY + "px"
		}

/*		this.presetMenu = PresetMenu({
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
		})*/
		
		this.dvWorldsButton = createElement("div", "worlds-button", this.dvDisplay, "Worlds")
		this.dvWorldsButton.onclick = (event) => {
			this.worldList.show()
//			this.presetMenu.presets = game.world.presets,
//			this.presetMenu.show(event.clientX, event.clientY)
		}
		this.build = BuildList()
		
		this.dvFeatsButton = createElement("div", "feats-button", this.dvDisplay, "Feats")
		this.dvFeatsButton.onclick = (event) => {
			this.showingFeats = true
			this.updateFeats()
			this.dvFeatsHolder.classList.toggle("hidden", false)
		}

		this.dvCoreButton = createElement("div", "core-button", this.dvDisplay, "Core")
		this.dvCoreButton.onclick = (event) => {
			this.coreScreen.show()
//			this.showingCore = true
//			this.updateCore()
//			this.dvCoreHolder.classList.toggle("hidden", false)
		}

		this.dvApproveButton = createElement("div", "approve-button", this.dvDisplay, "Buy all")
		this.dvApproveButton.onclick = (event) => {
			game.world.finalizeProject()
			this.update(true)
//			this.dvApproveButton.classList.toggle("hidden", true)
//			this.dvCancelButton.classList.toggle("hidden", true)
		}

		this.dvCancelButton = createElement("div", "cancel-button", this.dvDisplay, "Cancel")
		this.dvCancelButton.onclick = (event) => {
			game.world.cancelProject()
			this.dvApproveButton.classList.toggle("hidden", true)
			this.dvCancelButton.classList.toggle("hidden", true)
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
			display.dvDisplay = createElement("div", "feat", this.dvFeatsList, x.desc + (x.minMap?"\nMinimum map level: "+x.minMap:""))
			return display
		})
		
		this.dvControlHint = createElement("div", "world-hint hidden", this.dvDisplay, `
			Right-click - Cancel
			Hold Shift - Build multiple
			Hold Ctrl - Snap to closest
			Hold Alt - Snap to closest two
		`)
		
		this.hover = WorldPointInfo({
			parent : this.dvDisplay
		})
		
		this.target = WorldPointTarget({
			parent : this.dvDisplay
		})
		
		this.worldList = WorldList()
		this.importer = PresetImporter()
		this.coreScreen = CoreScreen()
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
			x.dvDisplay.classList.toggle("hidden", !(game.realMap.level >= x.feat.map))
		})
	},
	
	update(forced) {
		this.build.update()
		this.dvWorkers.innerText = "Workers: "+game.world.workers
		if (this.hover.point)
			this.hover.update()
		if (this.showingFeats) 
			this.updateFeats()
		if (this.worldList.visible)
			this.worldList.update()
		
		if (forced) {
			const project = game.world.points.filter(x => x.projected).length
			this.dvApproveButton.classList.toggle("hidden", !project)
			this.dvCancelButton.classList.toggle("hidden", !project)
			this.dvCoreButton.classList.toggle("hidden", !game.skills.worldCore)
		}
		
		this.dvBonus.innerText = Object.keys(WORLD_STATS).filter(x => game.world.projectedStats[x] != WORLD_STATS[x].default).map(x => WORLD_STATS[x].name + displayNumber(game.world.stats[x]) + (game.world.stats[x] != game.world.projectedStats[x]?" => "+displayNumber(game.world.projectedStats[x]):"")).join("\n")
		if (this.coreScreen.visible)
			this.coreScreen.update()
	},
	
	importPresets() {
		this.importer.show()
	}
})

const presetImporterHandler = {
	_init() {
		this.dvHolder = createElement("div", "fullscreen-holder hidden", document.body)
		this.dvDisplay = createElement("div", "dialog", this.dvHolder)		
		this.dvTitle = createElement("div", "dialog-title", this.dvDisplay, "World conversion")
		this.dvMessage = createElement("div", "", this.dvDisplay, `
		Hi there! We've learned recently that communism is not a thing anymore, and capitalism is all the hype now.
		Map presets are now thing of the past as the rules change, map editing became more restrictive, you can't 
		delete nodes (still can move them) and new maps now cost stardust. Capitalism, ho!
		Also, power stations were too strong and they all eventually collapsed into the void.
		We understand it would be sad to lose your precious builds all of sudden, so we've carried your last world 
		over, and you have an option to take some presets with you as well. While the first one you choose is free, 
		the rest have a real cost. 
		
		If you have any regrets, you have a last chance to visit old version by adding /v6/ to URL. It won't be available for long.
		`);
		this.dvPresets = createElement("div", "presets-list",this.dvDisplay)
		this.presets = []
		this.dvFinish = createElement("div", "button",this.dvDisplay, "Import")
		this.dvFinish.onclick = (event) => {
			if (!game.payStardust(this.totalCost)) return
			const imports = this.presets.filter(x => x.chosen)
			if (!imports.length && !confirm("It's your only chance to import your old presets. \n\nDo you really want to discard them all?")) return
			if (imports.length) delete game.worlds[1]
			
			imports.map((data,n) => {
				game.worlds[n+1] = World(BASE_WORLD,{presets:{base:data.preset}, title : data.id.slice(2), id:n+1})
				game.worlds[n+1].loadPreset("base")
			})
			
			Object.entries(game.worlds).map(x => x.presets?Object.keys(x.presets).map(y => delete x.presets[y]):0)
			
			this.dvHolder.classList.toggle("hidden", true)
			delete game.badSave
		}
		this.totalCost = 0
	},

	updateCost() {
		let items = this.presets.filter(x => x.chosen).length
		if (!items) {
			this.totalCost = 0
			this.dvFinish.innerText = "Leave everything behind"
			this.dvFinish.classList.toggle("available", true)
			return
		}
		items--
		this.totalCost = 0
		while (items > 0) {
			this.totalCost += 50 * 2 ** items
			items--
		}
		this.dvFinish.innerText = "Import - "+displayNumber(this.totalCost, 0)+" stardust (You have "+displayNumber(game.resources.stardust,0)+")"
		this.dvFinish.classList.toggle("available", this.totalCost <= game.resources.stardust)
	},
	
	show() {
		this.dvHolder.classList.toggle("hidden", false)
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			this.presets.map(x => x.dvDisplay.remove())
			this.presets = Object.keys(game.worlds[0].presets).map(x => {
				let display = {
					preset : game.worlds[0].presets[x],
					id : x,
					chosen : false
				}
				display.dvDisplay = createElement("div", "presets-item", this.dvPresets, x.slice(2))
				display.dvDisplay.onclick = (event) => {
					display.chosen = !display.chosen
					display.dvDisplay.classList.toggle("active", display.chosen)
					this.updateCost()
				}
				return display
			})	
			this.updateCost()
		}
	},
}

const PresetImporter = Template(presetImporterHandler)

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
		this.dvStored = createElement("div", "building-stored", this.dvDisplay, "Stored: 0")
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
//			if (!game.world.canAfford(this.building.id)) return
			gui.world.build.dvHolder.classList.toggle("hidden", true)
			gui.worldMouse.state = MOUSE_STATE_BUILD
			gui.world.dvControlHint.classList.toggle("hidden", false)
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
//		const canAfford = game.world.canAfford(this.building.id)
		let canAfford = true
		if (this.building.cost) {
			this.costs.map(x => {
				const enough = game.world.getResource(x.id) >= this.building.cost[x.id]
				x.dvValue.classList.toggle("enough", enough)
//				canAfford = canAfford && enough
			})
		}
		this.dvDisplay.classList.toggle("active", canAfford)
		this.dvStored.innerText = game.world.stored[this.building.id]?"Stored: "+game.world.stored[this.building.id]:""
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
		const depth = this.point.depth < 100?this.point.depth + (this.point.depth == this.point.world.workers && this.point.world.coreStats.finalLayer && this.point.depth > 1?" - 1":""):"Detached"
		const projectedDepth = this.point.projectedDepth < 100?this.point.projectedDepth + (this.point.projectedDepth == this.point.world.workers && this.point.world.coreStats.finalLayer && this.point.projectedDepth > 1?" - 1":""):"Detached"
		this.dvInfo.innerText = "Type: " + this.building.name + "\nDepth: " + (depth + (depth != projectedDepth?" => "+projectedDepth:"")) + "\n" + ("Effect: "+this.point.valueString()+(this.point.valueString() != this.point.valueString(1)?" => "+this.point.valueString(1):""))
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

		this.dvBuy = createElement("div", "world-target-button active", this.dvButtons, "Buy") 
		
		this.dvBuy.onclick = (event) => {
			game.world.finalize(this.point)
			gui.stardust.update(true)
			this.update()	
		}

		this.dvMove = createElement("div", "world-target-button active", this.dvButtons, "Move")
		
		this.dvMove.onclick = (event) => {
//			this.dvDisplay.classList.toggle("hidden", true)
			gui.worldMouse.state = MOUSE_STATE_MOVE
			gui.world.dvControlHint.classList.toggle("hidden", false)
			gui.worldMouse.target = this.point
			gui.worldMouse.target.newX = gui.worldMouse.mapX
			gui.worldMouse.target.newY = gui.worldMouse.mapY
			gui.worldMouse.target.newConnections = game.world.predictConnections(gui.worldMouse.target)
			game.world.updateBounds()
			game.updateWorldBackground = true
			this.reset()
			gui.world.hover.reset()
		}
		
		this.dvFree = createElement("div", "world-target-button active", this.dvButtons, "Remove") 
		
		this.dvFree.onclick = (event) => {
			game.world.free(this.point)
			this.reset()
			gui.world.hover.reset()
		}
		
		this.dvStore = createElement("div", "world-target-button active", this.dvButtons, "Store") 
		
		this.dvStore.onclick = (event) => {
			game.world.store(this.point)
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
		if (this.point) {
			this.info.update()
			this.dvBuy.classList.toggle("active", game.world.canAfford(this.point.type))
			this.dvBuy.classList.toggle("hidden", !this.point.projected)
			this.dvFree.classList.toggle("active", this.point.depth)
			this.dvFree.classList.toggle("hidden", !this.point.projected)
			this.dvStore.classList.toggle("hidden", !!this.point.projected || this.point.type == "entryPoint")
		}
	}
}

const WorldPointTarget = Template(worldPointTargetHandler)

const worldListHandler = {
	_init() {
		this.dvHolder = createElement("div", "fullscreen-holder hidden", this.parent || document.body)
		this.dvHolder.onclick = (event) => {
			if (event.target == this.dvHolder)
				this.hide()
		}
		this.dvDisplay = createElement("div", "dialog", this.dvHolder)
		this.dvTitle = createElement("div", "dialog-title", this.dvDisplay, "Worlds")
		this.dvWorlds = createElement("div", "world-list", this.dvDisplay)
		this.worlds = []
		this.dvButtons = createElement("div", "buttons", this.dvDisplay)
		this.dvCreate = createElement("div", "button", this.dvButtons, "Create new world (X stardust)")
		this.dvCreate.onclick = (event) => {
			const newWorldCost = 50 * 2 ** (Object.entries(game.worlds).length - 1)
			if (!game.payStardust(newWorldCost)) return
			
			let n = 0
			while (game.worlds[n]) n++
			game.worlds[n] = World(BASE_WORLD, {id : n})
			game.setWorld(n)
			this.hide()
		}
	},
	
	show() {
		this.dvHolder.classList.toggle("hidden", false)
		this.update(true)
		this.visible = true
	},
	
	hide() {
		this.dvHolder.classList.toggle("hidden", true)
		this.visible = false
	},
	
	update(forced) {
		const newWorldCost = 50 * 2 ** (Object.entries(game.worlds).length - 1)
		if (forced) {
			this.worlds.map(x => {
				x.destroy()
			})
			this.worlds = Object.values(game.worlds).sort((x,y) => x.title > y.title?1:-1).map(x => WorldInfo({
				parent : this.dvWorlds,
				world : x
			}))
		}
		this.dvCreate.innerText = "Create new world - "+displayNumber(newWorldCost,0)+" stardust "+ETAString(newWorldCost, "stardust", 2)
		this.dvCreate.classList.toggle("available", newWorldCost <= game.resources.stardust)
	},
}

const WorldList = Template(worldListHandler)

const worldInfoHandler = {
	_init() {
		this.dvDisplay = createElement("div", "world-info"+(this.world == game.world?" active":""), this.parent)
		this.dvTitle = createElement("div", "world-title", this.dvDisplay, this.world.title)
		if (this.world != game.world)
			this.dvDisplay.onclick = (event) => {
				if (event.target == this.dvTitle || event.target == this.dvDisplay) {
					game.setWorld(this.world.id)
					gui.world.worldList.hide()
				}
			}
		this.dvRename = createElement("div", "button available", this.dvDisplay, "Rename")
		this.dvRename.onclick = (event) => {
			const newName = prompt("Enter new name:", this.world.title)
			if (newName !== null)
				this.world.title = newName
			gui.world.worldList.update(true)
		}
		this.dvDelete = createElement("div", "button" + ((this.world != game.world && Object.entries(game.worlds).length > 1)?" available":""), this.dvDisplay, "Delete")
		this.dvDelete.onclick = (event) => {
			if (Object.entries(game.worlds).length < 2 || this.world == game.world) return
			if (!confirm("While new map price will drop, you won't get refunded for deleting a world.\n\nDo you want to delete it?")) return
			delete game.worlds[this.world.id]
			gui.world.worldList.update(true)
		}
	},
	
	destroy() {
		this.dvDisplay.remove()
	},
}

const WorldInfo = Template(worldInfoHandler)

const coreScreenHandler = {
	_init() {
		this.dvHolder = createElement("div", "fullscreen-holder hidden", this.parent || document.body)
		this.dvHolder.onclick = (event) => {
			if (event.target == this.dvHolder)
				this.hide()
		}
		this.dvDisplay = createElement("div", "dialog", this.dvHolder)
		this.dvTitle = createElement("div", "dialog-title", this.dvDisplay, "Core")
		this.dvBoard = createElement("div", "core-board", this.dvDisplay)
		this.cells = {}
		this.columns = {}
		for (let x = -7; x <= 7; ++x) {
			this.cells[x] = {}
			this.columns[x] = createElement("div", "core-column", this.dvBoard)
			for (let y = (-5 - x / 2) | 0; y <= (5 - x / 2)| 0; y++) {
				const cellName = x + "," + y
				const holder = createElement("div", "core-element-holder", this.columns[x])
				const background = createElement("div", "core-element-bg", holder)
				const display = createElement("div", "core-element", holder, cellName)
				const cell = WORLD_CORE_CELLS[cellName]
				if (cell) {
					display.innerText = cell.iconText
					background.style.backgroundColor = background.style.borderColor = cell.iconColor
				} else {
//					display.innerText = "🔒"
					background.style.backgroundColor = background.style.borderColor = "var(--shade14)"
				}
				this.cells[x][y] = Object.assign({}, cell, {name: cellName, display, holder, background, cell})
//				if (game.world.core[cellName]) this.cells[x][y].active = 1
				
				holder.onclick = (event) => {
					if (!this.cells[x][y].available || this.cells[x][y].active) return
					game.world.getCore(cellName)
					this.cells[x][y].active = !!game.world.core[cellName]
					this.update(true)
					//game.world.toggleCore(cellName)
				}
				if (cell) {
					holder.onmousemove = (event) => {
						this.hover.show(this.cells[x][y], event.clientX, event.clientY)
					}
					holder.onmouseleave = holder.onmouseout = (event) => {
						this.hover.hide()
					}
				}
			}
		}
		
		this.dvButtons = createElement("div", "buttons", this.dvDisplay)
		this.dvResetButton = createElement("div", "button", this.dvButtons, "Reset ()")
		this.dvResetButton.onclick = (event) => {
			if (game.world.coreResetCost && game.resources.stardust >= game.world.coreResetCost) {
				game.payStardust(game.world.coreResetCost)
				game.world.clearCore()
			}
		}
		
		this.dvCloseButton = createElement("div", "button available", this.dvButtons, "Close")
		this.dvCloseButton.onclick = (event) => {
			this.hide()
		}
		
		this.hover = CoreScreenHover({
			parent : this.dvDisplay
		})
	},
	
	show() {
		this.dvHolder.classList.toggle("hidden", false)
		this.update(true)
		this.visible = true
	},
	
	hide() {
		this.dvHolder.classList.toggle("hidden", true)
		this.visible = false
	},
	
	update(forced) {
		if (forced) {
			Object.entries(this.cells).map(([cx,column]) =>
				Object.entries(column).map(([cy,cell]) => {
					cx = +cx, cy = +cy
					const neighbours = [
						this.cells[cx-1] && this.cells[cx-1][cy],
						this.cells[cx-1] && this.cells[cx-1][cy+1],
						this.cells[cx] && this.cells[cx][cy+1],
						this.cells[cx+1] && this.cells[cx+1][cy],
						this.cells[cx+1] && this.cells[cx+1][cy-1],
						this.cells[cx] && this.cells[cx][cy-1],
						this.cells[cx-1] && this.cells[cx-1][cy],
					]
					cell.active = game.world.core[cell.name]//!cell.blocked && Math.random() > 0.85
					const feat = FEATS[cell.feat]
					cell.empty = ((feat && feat.map > game.realMap.level) || !WORLD_CORE_CELLS[cell.name]) && (!game.dev || !game.dev.coreCoordinates)
					cell.locked = cell.feat && !game.feats[cell.feat] || cell.empty
					cell.available = !cell.locked && neighbours.some((x,n) => x && game.world.core[x.name])
					cell.blocked = cell.available && neighbours.slice(0,6).some((x,n) => x && neighbours[n+1] && game.world.core[x.name] && game.world.core[neighbours[n+1].name])
					if (cell.blocked || cell.locked) cell.available = false
					cell.expensive = cell.available && !cell.active && !game.world.canAffordCore(cell.name)
//					if (cell.expensive) cell.available = false
					cell.display.innerText = cell.empty?" ":cell.locked?"🔒\uFE0E":(cell.iconText||((cx>0?"+":cx==0?"0":"")+cx+'\n'+(cy>0?"+":cy==0?"0":"")+cy))
					cell.background.style.backgroundColor = cell.background.style.borderColor = cell.locked?"var(--shade14)":cell.iconColor
					cell.holder.classList.toggle("active", !!cell.active)
					cell.holder.classList.toggle("blocked", !!cell.blocked)
//					if (!cell.active && !cell.blocked)
					cell.holder.classList.toggle("available", !!cell.available)
					cell.holder.classList.toggle("expensive", !!cell.expensive)
					cell.holder.classList.toggle("locked", !!cell.locked)
				})
			)
			this.dvResetButton.innerText = "Reset core ("+displayNumber(game.world.coreResetCost)+" stardust)"
		}
		this.dvResetButton.classList.toggle("available", game.world.coreResetCost && game.resources.stardust >= game.world.coreResetCost)
	},
}

const CoreScreen = Template(coreScreenHandler)

const coreScreenHoverHandler = {
	_init() {
		this.dvDisplay = createElement("div", "cell-hover hidden", this.parent)
		this.dvTitle = createElement("div", "cell-hover-title", this.dvDisplay)
		this.dvIcon = createElement("div", "cell-hover-icon-holder", this.dvTitle)
		this.dvIconBG = createElement("div", "cell-hover-icon-bg", this.dvIcon)
		this.dvIconFG = createElement("div", "cell-hover-icon", this.dvIcon)
		this.dvDesc = createElement("div", "cell-hover-desc", this.dvTitle)
		this.dvCosts = createElement("div", "cell-hover-costs", this.dvDisplay)
		this.dvEnablers = createElement("div", "cell-hover-enablers", this.dvDisplay)
	},
	
	show(cell, x, y) {
		const oldCell = this.cell
		this.cell = cell
		this.dvDisplay.classList.toggle("hidden", false)
		
		if (oldCell != this.cell)
			this.update(true)
		
		if (x != -1) {
			if (x < gui.mainViewport.halfWidth) 
				this.dvDisplay.style.left = (x + 10) + "px"
			else
				this.dvDisplay.style.left = (x - 10 - this.dvDisplay.offsetWidth) + "px"
			if (y < gui.mainViewport.halfHeight) 
				this.dvDisplay.style.top = y + "px"
			else
				this.dvDisplay.style.top = (y - this.dvDisplay.offsetHeight) + "px"
		}
	},
	
	hide() {
		this.dvDisplay.classList.toggle("hidden", true)
		this.cell = null
	},
	
	update(forced) {
		if (forced) {
			if (this.cell.locked) {
				const feat = FEATS[this.cell.feat]
				this.dvDesc.innerText = (!feat || feat.minMap > game.realMap.level)?"Unknown":feat.desc
				this.dvIconFG.innerText = (!feat || feat.minMap > game.realMap.level)?"?":"🔒\uFE0E"
			} else {
				this.dvDesc.innerText = this.cell.desc
				this.dvIconFG.innerText = this.cell.iconText || "?"
			}
			this.dvIconBG.style.backgroundColor = this.dvIconBG.style.borderColor = this.cell.locked?"var(--shade14)":this.cell.iconColor
			while (this.dvCosts.firstChild) this.dvCosts.firstChild.remove()
			if (this.cell.cost && !this.cell.locked)  {
				this.dvCosts.classList.toggle("hidden", false)
				this.dvCostsHeader = createElement("div", "cell-hover-costs-header", this.dvCosts, "Costs:")
				this.costs = Object.keys(this.cell.cost).map(x => {
					const display = {
						id : x,
					}
					display.dvDisplay = createElement("div", this.cell.active?"cell-hover-cost-paid":"cell-hover-cost", this.dvCosts)
					display.dvResource = createElement("div", "harvest-icon bg-"+POINT_TYPES[+x.slice(1)], display.dvDisplay)
					const currentMax = game.world.getMaxResource(x)
					const currentHave = game.world.getResource(x)
					const willMax = game.world.getMaxResource(x, this.cell.cost[x])
					const willHave = game.world.getResource(x, 0, this.cell.cost[x])
					display.dvValue = createElement("div", "cell-hover-cost-value", display.dvDisplay, 
						(this.cell.cost[x] * 100).toFixed(0)+"%" + (!this.cell.active?" (" + displayNumber(currentHave, 0) + "/" + displayNumber(currentMax, 0) + " => " + displayNumber(willHave, 0) + "/" + displayNumber(willMax, 0) + ")":"")
					)
					display.dvValue.classList.toggle("missing", willHave < 0)
					return display
				})
			} else {
				this.dvCosts.classList.toggle("hidden", true)
			}
//			console.log(this.cell.cost)
			while (this.dvEnablers.firstChild) this.dvEnablers.firstChild.remove()
			if (this.cell.enablers && !this.cell.locked)  {
				this.dvEnablers.classList.toggle("hidden", false)
				this.dvEnablersHeader = createElement("div", "cell-hover-enablers-header", this.dvEnablers, "Requirements:")
				this.enablers = Object.keys(this.cell.enablers).map(x => {
					const display = {
						id : x,
					}
					display.dvDisplay = createElement("div", "cell-hover-enabler", this.dvEnablers)
					display.dvResource = createElement("div", "building-icon", display.dvDisplay, WORLD_ELEMENTS[x].iconText)
					display.dvResource.style.backgroundColor = gui.theme.world[WORLD_ELEMENTS[x].family]
					display.dvValue = createElement("div", "cell-hover-enabler-value", display.dvDisplay, this.cell.enablers[x])
					display.dvValue.classList.toggle("missing", game.world.owned[x] + (game.world.stored[x] || 0) < this.cell.enablers[x])
					return display
				})
			} else {
				this.dvEnablers.classList.toggle("hidden", true)
			}
//			console.log(this.cell.enablers)
		}
	},
}

const CoreScreenHover = Template(coreScreenHoverHandler)