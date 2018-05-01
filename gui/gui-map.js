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
				index : n
			}
			display.dvDisplay = createElement("div","harvest-line", this.dvHarvest)
			display.dvValue = createElement("div","harvest-value", display.dvDisplay)
			display.dvIcon = createElement("div","harvest-icon bg-"+x, display.dvDisplay)
			return display
		})
		this.dvResources = createElement("div", "resources",  this.dvDisplay)
		this.dvGrowth = createElement("div", "growth",  this.dvDisplay, "Growth:")
		
		this.displayGrowth = POINT_TYPES.slice(1).map((x,n) => {
			let display = {name : x}
			display.dvDisplay = createElement("div", "growth-line", this.dvGrowth)
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
	},
	
	onSet() {
		this.dvDisplay.appendChild(this.dvGrowth)
		this.dvDisplay.appendChild(this.dvHarvest)
		this.update(true)
		getSize()
	},
	
	updateGrowth() {
		this.displayGrowth.map(x => {
			x.dvDisplay.classList.toggle("hidden", !game.growth[x.name])
			x.dvValue.innerText = displayNumber(game.growth[x.name]) + (game.real.multi[x.name] != 1?" × "+displayNumber(game.real.multi[x.name])+" = "+displayNumber(game.real.growth[x.name]):"")
			x.dvName.innerText = settings.colorBlind?x.name.capitalizeFirst()[0]:""
		})
	},
	
	updateHarvest() {
		this.displayHarvest.map(x => {
			x.dvDisplay.classList.toggle("hidden", !x.index || !game.resources[x.name])
			x.dvValue.innerText = displayNumber(game.resources[x.name], 0)
		})
	},
	
	update(forced) {
		if (this.slider) {
			this.slider.updateFullInfo()
		}
		if (forced && game.sliders)
			game.sliders.map(slider => slider.dvMapIcon.innerText = slider.target?(slider.target.specialText || "⭕\uFE0E"):"")
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