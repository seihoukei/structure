'use strict'

const MapTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "map "+(this.className || ""), this.parent)
		
		this.dvAscend = createElement("div", "ascend", this.dvDisplay)
		this.dvAscend.onclick = (event) => game.map.virtual?game.map.evolve():game.ascend()
		
		this.dvHarvest = createElement("div", "harvest",  this.dvDisplay)
		this.displayHarvest = POINT_TYPES.map((x,n) => {
			const display = {
				id : x,
				name : "_"+n,
				index : n,
				lastValue : "",
				visible : false
			}
			display.dvDisplay = createElement("div","harvest-line hidden", this.dvHarvest)
			display.dvValue = createElement("div","harvest-value", display.dvDisplay)
			display.dvIcon = createElement("div","harvest-icon bg-"+x, display.dvDisplay)
			return display
		})

		this.dvResources = createElement("div", "resources",  this.dvDisplay)
		this.resources = RESOURCES.filter(x => x.slice(0,1) != "_").map(x => {
			const display = {
				name : x,
				lastValue : "",
				visible : false
			}
			display.dvDisplay = createElement("div", "resource-line hidden", this.dvResources)
			display.dvIcon = createElement("img", "resource-icon", display.dvDisplay)
			display.dvIcon.src = GUI_RESOURCE_IMAGES+x+".png"
//			display.dvIcon.title = x.capitalizeFirst()
			display.dvValue = createElement("div", "resource-value", display.dvDisplay)
			
			display.dvDisplay.onmousemove = (event) => {
				this.resourceData.show(x, event.clientX, event.clientY)
			}
			display.dvDisplay.onmouseout = display.dvIcon.onmouseleave = (event) => {
				this.resourceData.hide()
			}
			return display
		})
		this.dvResourceHelp = createElement ("div", "help-button hidden", this.dvResources, "?")
		this.dvResourceHelp.onclick = (event) => gui.guide.show("resources")

		this.dvGrowth = createElement("div", "growth",  this.dvDisplay)
		this.dvGrowthTitle = createElement("div", "growth-title", this.dvGrowth)
		this.dvGrowthSubtitle = createElement ("div", "growth-subtitle", this.dvGrowthTitle, "Growth: ")
		this.dvGrowthHelp = createElement ("div", "help-button", this.dvGrowthTitle, "?")
		this.dvGrowthHelp.onclick = (event) => gui.guide.show("growth")
		
		this.displayGrowth = POINT_TYPES.slice(1).map((x,n) => {
			let display = {
				name : x,
				oldValue : "",
				visible : false
			}
			display.dvDisplay = createElement("div", "growth-line hidden", this.dvGrowth)
			display.dvDisplay.title = x.capitalizeFirst()
			display.dvName = createElement("div", "growth-type bg-"+x, display.dvDisplay)
			display.dvValue = createElement("div", "growth-value", display.dvDisplay)
			return display
		})
		
		this.dvSliders = createElement("div", "sliders", this.dvDisplay)
		this.dvSlidersSpace = createElement("div", "sliders-space", this.dvSliders)
		
		this.background = createElement("canvas", "background", this.dvDisplay)
		this.foreground = createElement("canvas", "foreground", this.dvDisplay)
		
		this.foreground.onmousedown = gui.mapMouse.onmousedown.bind(gui.mapMouse)
		this.foreground.onmousemove = gui.mapMouse.onmousemove.bind(gui.mapMouse)
		this.foreground.onmouseup = this.foreground.onmouseleave = this.foreground.onmouseout = gui.mapMouse.onmouseup.bind(gui.mapMouse)	
		this.foreground.onwheel = gui.mapMouse.onwheel.bind(gui.mapMouse)
		this.foreground.oncontextmenu = (event) => event.preventDefault()
		
		this.dvLowLoad = createElement("div", "low-load", this.dvDisplay)
		this.dvLowLoad.onclick = (event) => {
			if (event.target == this.dvLowLoad)
				gui.target.reset()
		}
		
		this.dvHelp = createElement ("div", "help-button float-top-right", this.dvDisplay, "?")
		this.dvHelp.onclick = (event) => gui.guide.show("map")
		
		const temp = {slow : false}
		this.lowLoad = GuiCheckbox({
			parent : this.dvDisplay,
			container : temp,
			className : "low-load-checkbox",
			value : "slow",
			title : "Low load mode",
			onSet(x) {
				if (x) 
					game.enableSlowMode(3) 
				else
					game.disableSlowMode()
			}
		})
		
		this.resourceData = ResourceData()
	},
	
	onSet() {
		this.dvDisplay.appendChild(this.dvGrowth)
		this.dvDisplay.appendChild(this.dvHarvest)
		this.resources.map(x => this.dvResources.appendChild(x.dvDisplay))
		this.dvResources.appendChild(this.dvResourceHelp)
		this.update(true)
		getSize()
	},
	
	onUnset() {
		gui.target.reset()
		gui.hover.reset()
	},
	
	updateGrowth() {
		this.displayGrowth.map((x, n) => {
			const visible = !!game.growth[x.name]
			if (visible != x.visible) 
				x.dvDisplay.classList.toggle("hidden", !(x.visible = visible))
			if (visible) {
				const newValue = displayNumber(game.growth[x.name]) + (game.real.multi[x.name] != 1?" × "+displayNumber(game.real.multi[x.name]) + (x.name == "power" && game.real.multi[x.name] == game.world.coreStats.powerCap || n>1 && game.real.multi[x.name] == game.world.coreStats.elementalCap?" (CAP)":"")+" = "+displayNumber(game.real.growth[x.name]):"")
				if (newValue != x.oldValue)
					x.dvValue.innerText = x.oldValue = newValue
			}
			if (settings.colorBlind != x.colorBlind) {
				x.dvName.innerText = settings.colorBlind?x.name.capitalizeFirst()[0]:""
				x.colorBlind = settings.colorBlind
			}
		})
	},
	
	updateHarvest() {
		this.displayHarvest.map(x => {
			const value = game.world.getResource(x.name)
			const projectedValue = game.world.getResource(x.name, 1)
			const visible = x.index && (value || projectedValue)
			if (visible != x.visible) 
				x.dvDisplay.classList.toggle("hidden", !(x.visible = visible))
			if (visible) {
				const maxValue = game.world.getMaxResource(x.name, 0)
				const ownedValue = game.resources[x.name]
				const newValue = displayNumber(value, 0) + (projectedValue != value?" => "+displayNumber(projectedValue,0):"")+" / "+displayNumber(maxValue, 0) + (maxValue != ownedValue?" ("+displayNumber(ownedValue, 0)+")":"")
				if (newValue != x.oldValue)
					x.dvValue.innerText = x.oldValue = newValue
			}
		})
		if (game.resources._1 >= 1000 && 
			game.resources._2 >= 1000 && 
			game.resources._3 >= 1000 && 
			game.resources._4 >= 1000 && 
			game.resources._5 >= 1000 && 
			game.resources._6 >= 1000 &&
			game.realMap.level >= FEATS.memories1.map)
			game.feats.memories1 = 1
			
		//memories1 feat
	},
	
	updateResources() {
		let visibles = 0, vischange = false
		this.resources.map(x => {
			const visible = !!(game.resources[x.name] || game.production[x.name])
			if (visible != x.visible) {
				vischange = true
				x.dvDisplay.classList.toggle("hidden", !(x.visible = visible))
			}
			if (visible) {
				visibles++
				const value = game.resources[x.name]
				const production = x.name == "stardust"?game.real.stardustChange:game.real.production[x.name]
				const newValue = displayNumber(value) + (production?" ("+(production>0?(x.name == "science" && game.researching?"Researching ":"+"):"")+displayNumber(production)+"/s)":"")
				if (newValue != x.oldValue)
					x.dvValue.innerText = x.oldValue = newValue
			}
		})
		if (vischange)
			this.dvResourceHelp.classList.toggle("hidden", !visibles)
		this.resourceData.update()
	},
	
	update(forced) {
		if (this.slider) {
			this.slider.updateFullInfo()
		}
		if (forced && game.sliders)
			game.sliders.map(slider => {
				slider.dvMapIcon.innerText = slider.target?(slider.target.specialText || "⭕\uFE0E"):""
				if (slider.target) {
					slider.dvMapIcon.style.fontSize = (230 / slider.target.specialTextSize) + "px"
				}
			})
	},
	
	updateLowLoad(forced) {
		if (forced) {
			while (this.dvLowLoad.firstChild) {
				this.dvLowLoad.firstChild.remove()
			}			
			game.map.nearbyPoints.map(point => this.dvLowLoad.appendChild(point.getDisplay("lowLoad").dvDisplay))
		}
		game.map.nearbyPoints.map(point => point.getDisplay("lowLoad").update())
	}
})

const resourceDataHandler = {
	_init () {
		this.dvDisplay = createElement("div", "map-hover hidden", document.body)
		this.oldValue = ""
		this.visible = false
	},
	
	show(resource, x, y) {
		if (!this.visible)
		this.dvDisplay.classList.toggle("hidden", false)
		this.visible = true
		this.resource = resource
		this.dvDisplay.style.left = (x + 20) + "px"
		this.dvDisplay.style.top = y + "px"
		this.update()
	},
	
	hide() {
		this.visible = false
		this.dvDisplay.classList.toggle("hidden", true)
	},
	
	update() {
		if (!this.visible) return
		let newValue = this.resource == "exp"?"Experience":this.resource.capitalizeFirst()
		newValue += "\nAvailable: " + displayNumber(game.resources[this.resource])

		const production = game.real?this.resource=="stardust"?game.real.stardustChange:game.real.production[this.resource]:game.production[this.resource]
		if (production)
			newValue += "\nTotal production: " + displayNumber(production) + "/s"

		delete this.source
		
		if (this.resource == "gold") this.source = "goldFactory"
		if (this.resource == "science") this.source = "scienceLab"
		if (this.resource == "fears") this.source = "hopeFactory"
		if (this.resource == "clouds") this.source = "cloudFactory"
		if (this.resource == "mana") this.source = "manalith"
		if (this.resource == "thunderstone") this.source = "thunderstoneFactory"

		const manaCircle = 0
		
		const mapProductions = Object.entries(game.maps).map(([name, map]) => {
			const mapData = {
				name : name == "main"?game.skills.virtualMaps?"Real":"This map":name.capitalizeFirst(),
				value : this.source?map.points.reduce((v,x) => x.buildings && x.buildings[this.source]?v+BUILDINGS[this.source].production(x):v, 0):0
			}
			
			if (this.resource == "stardust" && game.skills.starfall && map.level == game.realMap.level && map.complete && map.evolved)
				mapData.value += map.evolved + (map.evolved >= 3?game.world.coreStats.extraStars:0)
							
			return mapData
		})
		
		const imported = mapProductions.reduce((v,x) => v + x.value, 0)
		const inherited = this.resource == "stardust"?0:game.production[this.resource] - imported
		
		if (imported) {
			if (this.source && game.statistics["built_"+this.source])
				newValue += "\n\nBuilding: " + BUILDINGS[this.source].name
			newValue += "\n"
			if (inherited)
				newValue += "\nOld maps: " + displayNumber(inherited) + "/s"
			mapProductions.filter(x => x.value).map(x => {
				newValue += "\n" + x.name + ": " + displayNumber(x.value) + "/s"
			})
		} else if (inherited) {
			newValue += "\n\nAccumulated income: " + displayNumber(inherited) + "/s"
		}
		
		if (this.resource == "mana" && game.skills.magic)
			newValue += "\n\nMagic circle: " + displayNumber((game.map.manaBase) * (game.map.ownedRadius ** 2)) + "/s"
		
		if (this.resource != "gold" && game.world.stats[this.resource+"Speed"] && game.world.stats[this.resource+"Speed"] !== 1)
			newValue += "\n\nWorld boost: x" + displayNumber(game.world.stats[this.resource+"Speed"])

		if (this.resource == "gold" && (game.world.stats["goldSpeed"] !== 1))
			newValue += "\n\nWorld mining power boost: x" + displayNumber(game.world.stats["goldSpeed"])

		const sliderProduction = game.sliders.reduce((v,x) => !x.clone?v + ((x.real && x.real.production)?x.real.production[this.resource]:0) + (this.resource == "gold" && x.target && !x.target.index?x.real.attack:0):v, 0)
		const cloneProduction = game.sliders.reduce((v,x) => (x.clone == 1)?v + ((x.real && x.real.production)?x.real.production[this.resource]:0) + (this.resource == "gold" && x.target && !x.target.index?x.real.attack:0):v, 0)
		const summonProduction = game.sliders.reduce((v,x) => (x.clone == 2)?v + ((x.real && x.real.production)?x.real.production[this.resource]:0) + (this.resource == "gold" && x.target && !x.target.index?x.real.attack:0):v, 0)
		
		if (sliderProduction || cloneProduction || summonProduction) newValue += "\n"
		
		if (sliderProduction) {
			newValue += "\nSliders: " + displayNumber(sliderProduction) + "/s"
		}
		if (cloneProduction) {
			newValue += "\nClones: " + displayNumber(cloneProduction) + "/s"
		}
		if (summonProduction) {
			newValue += "\nSummons: " + displayNumber(summonProduction) + "/s"
		}

		if (newValue != this.oldValue)
			this.dvDisplay.innerText = this.oldText = newValue
	},
}

const ResourceData = Template(resourceDataHandler)