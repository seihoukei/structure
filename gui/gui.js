'use strict'

const gui = {
	init() {

		this.setTheme(settings.theme, "main")
		
		this.tabs = TabGroup({
			name : "main"
		})
		
//		this.dvTabs = createElement("div", "tabs", document.body)
		
		this.map = this.tabs.addTab("map", "Map", MapTab)
		this.sliders = this.tabs.addTab("sliders", "Sliders", SlidersTab)
		this.skills = this.tabs.addTab("skills", "Skills", SkillsTab)
		this.management = this.tabs.addTab("management", "Management", ManagementTab)	
		
		this.stardust = this.tabs.addTab("stardust", "Stardust", StardustTab)
		this.artifacts = this.tabs.addTab("artifacts", "Artifacts", ArtifactsTab)
		//this.tabs.addTab("magic", "Magic")
		this.tabs.addFiller()

		this.story = this.tabs.addTab("story", "Story", StoryTab)
		this.menu = this.tabs.addTab("menu", "Menu", MenuTab)
		
			this.tabs.toggleDisplay("story", false)
		
		//Header
		this.dvHeader = createElement("div", "header", this.skills.dvDisplay)
		this.dvGold = createElement("div", "gold", this.dvHeader)
		this.dvExp = createElement("div", "exp", this.dvHeader)
		this.dvExpMult = createElement("div", "exp-mult", this.dvHeader)
		this.dvMana = createElement("div", "mana", this.dvHeader)
		this.dvScience = createElement("div", "science", this.dvHeader)
		
		this.backgroundContext = this.map.background.getContext("2d")
		this.foregroundContext = this.map.foreground.getContext("2d")
		
		this.tabs.setTab("map")

		this.target = GuiPointElement({
			className : "target", 
			parent : this.map.dvDisplay,
			
			_init() {
				this.dvDisplay.onmousemove = (event) => gui.hover.reset()
				this.dvDisplay.onclick = (event) => event.target == this.dvDisplay?this.reset():0
				
				this.pointDisplay = PointInfoDisplay({
					className : "point-info",
					parent : this.dvDisplay,
				})
				this.dvButtons = createElement("div", "buttons", this.dvDisplay)
				this.dvSliders = createElement("div", "sliders", this.dvButtons)
				this.dvSliders.onclick = (event) => event.target == this.dvSliders?this.reset():0
				
				this.dvHint = createElement("div", "target-hint", this.dvSliders, "Click to assign/free:")
				this.dvAll = createElement("div", "target-all", this.dvHint, "All")
				this.dvAll.onclick = (event) => this.targetAll(game.sliders)
				this.dvReal = createElement("div", "target-all", this.dvHint, "Real")
				this.dvReal.onclick = (event) => this.targetAll(game.sliders.filter(x => !x.clone))
				this.dvClones = createElement("div", "target-all", this.dvHint, "Clones")
				this.dvClones.onclick = (event) => this.targetAll(game.sliders.filter(x => x.clone))
				this.dvUpgrades = createElement("div", "upgrades", this.dvButtons)
				this.dvUpgrades.onclick = (event) => event.target == this.dvUpgrades?this.reset():0
				
				this.buttons = {}
				
				this.buttons.levelUp = IconButton({
					parent: this.dvUpgrades, 
					onclick: (event) => {
						if (this.point) {
							this.point.levelUp()
							this.updatePosition()
						}
					},
					available: () => (this.point.level || 0) < POINT_MAX_LEVEL && game.resources.gold >= this.point.costs.levelUp,
					visible: () => game.skills.upgradePoints && (!this.point || !this.point.boss && (!this.point.level || this.point.level < POINT_MAX_LEVEL)),
					iconText: "⇮", 
					iconColor: "#003300",
					text: () => this.point?"Level up\nGold: " + displayNumber(this.point.costs.levelUp):""
				})
				
				this.buttons.imprint = IconButton({
					parent: this.dvUpgrades, 
					onclick: (event) => {
						if (this.point) {
							this.point.startHarvest(1)
							this.updatePosition()
						}
					},
					available: () => !this.point.harvesting,
					visible: () => game.skills.imprint && this.point && (!this.point.map.virtual || game.skills.virtualImprint && this.point.map.level > game.realMap.level - 2) && (this.point && !this.point.boss && this.point.completed && !this.point.harvested),
					iconText: "M", 
					iconColor: "#3399FF",
					text: () => this.point?this.point.harvesting?"Imprinting\n"+(100 * this.point.harvestTime / this.point.harvestTimeTotal).toFixed(3)+"% ("+shortTimeString((this.point.harvestTimeTotal - this.point.harvestTime) / game.real.harvestSpeed)+")":"Imprint ("+shortTimeString(this.point.harvestTimes[1]*(game.harvesting.size+1)/(game.world.harvestSpeed))+")\nImprinting: "+game.harvesting.size:""
				})
				
				this.dvBuildings = createElement("div", "buildings", this.dvUpgrades)
				this.dvBuildings.onclick = (event) => event.target == this.dvBuildings?this.reset():0
	
				Object.values(BUILDINGS).map(x => {
					this.buttons[x.id] = IconButton({
						parent: this.dvBuildings,
						onclick: (event) => {
							if (this.point) {
								this.point.build(x.id)
								this.updateUpgrades()
							}
						},
						available: () => (this.point && this.point.costs[x.id] <= game.resources.gold),
						visible: () => game.skills["build"+x.level] && this.point && this.point.level && this.point.level >= x.level && (this.point.buildings[x.id] || this.point.costs[x.id] >= 0),
						owned: () => this.point && this.point.buildings[x.id],
						iconText: x.iconText,
						iconColor: x.iconColor,
						desc : x.desc,
						text: () => x.name + "\n" + (this.point?this.point.buildings[x.id]?x.info(this.point):"Gold: "+displayNumber(this.point.costs[x.id]):"?")
					})
				})

				this.dvSpells = createElement("div", "spells", this.dvButtons)
				this.dvSpells.onclick = (event) => event.target == this.dvSpells?this.reset():0
				
				this.spellButtons = {}

				Object.values(SPELLS).map(x => {
					if (x.type != SPELL_TYPE_POINT) return
					this.spellButtons[x.id] = IconButton({
						parent: this.dvSpells,
						onclick: (event) => {
							if (this.point) {
								this.point.cast(x.id)
							}
						},
						available: () => (this.point && this.point.manaCosts[x.id] <= game.resources.mana),
						visible: () => game.skills["book_"+x.book] && this.point && (this.point.manaCosts[x.id] >= 0),
						owned: () => false,
						iconText: x.iconText,
						iconColor: x.iconColor,
						desc : x.desc,
						text: () => this.point?x.name + "\n" + "Mana: "+displayNumber(this.point.manaCosts[x.id]):""
					})
				})

			},
			
			align(x, y) {
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				if (x == -1) {
					x = parseInt(this.dvDisplay.style.left || "0")
					y = parseInt(this.dvDisplay.style.top || "0")
				} else {
					x = ((x + width + 5 < viewport.width) ? (x + 5) : (x - 5 - width))
					y = y - height / 2
				}
				x = Math.max(1, Math.min(viewport.width - width - 1, x))
				y = Math.max(1, Math.min(viewport.height - height - 1, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y+"px"
			},
			
			updatePosition() {
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				let x = this.dvDisplay.offsetLeft
				let y = this.dvDisplay.offsetTop
				if (!y) return
				x = Math.max(0, Math.min(viewport.width - width, x))
				y = Math.max(0, Math.min(viewport.height - height, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y+"px"			
			},
	
			onSet () {
				mouse.state = MOUSE_STATE_INFO
				this.pointDisplay.set(this.point)
				
				game.sliders.map((slider, n) => {
					slider.getReal()
					slider.dvTarget.classList.toggle("notransition",true)
					this.dvSliders.appendChild(slider.dvTarget)
					slider.dvTarget.offsetWidth && slider.dvTarget.classList.toggle("notransition",false)
					slider.getReal(true)
					slider.updateTarget(this.point)
				})
				
				Object.values(this.buttons).map (x => x.dvDisplay.classList.toggle("notransition", true))
				this.updateUpgrades()
				Object.values(this.buttons).map (x => x.dvDisplay.offsetWidth && x.dvDisplay.classList.toggle("notransition", false))
			},

			targetAll(sliders) {
				var target = this.point || null
				if (!sliders.filter(x => x.target != target).length)
					target = null
				sliders.map(x => x.assignTarget(target))
			},
			
			update() {
				if (!this.point) return
				this.pointDisplay.update()

				const mode = (this.point.away == 1)?1:
							(game.skills.mining && !this.point.index)?2:
							(game.skills.upgradePoints && this.point.index)?3:
							0
				
				const displaySliders = mode == 1 || mode == 2
				this.dvAll.classList.toggle("hidden", !displaySliders || game.sliders.length < 2)
				this.dvReal.classList.toggle("hidden", !displaySliders || !game.sliders.filter(x => x.clone == 1).length)
				this.dvClones.classList.toggle("hidden", !displaySliders || !game.sliders.filter(x => x.clone == 1).length)
				this.dvSliders.classList.toggle("hidden", !displaySliders)
				this.dvSpells.classList.toggle("hidden", !game.skills.spellcasting || !this.point || !(Object.values(this.point.manaCosts).filter(x => x > -1).length))
				
				if (this.point.harvesting == 1)
					this.buttons.imprint.update()
				
				if (displaySliders)
					game.sliders.map(slider => slider.updateTarget(this.point))
				
				this.dvUpgrades.classList.toggle("hidden", mode != 3)
				if (mode == 3) {
					Object.values(this.buttons).map(x => x.updateAvailability())
				}
				Object.values(this.spellButtons).map(x => x.updateAvailability())
			},
			
			updateUpgrades() {
				Object.values(this.buttons).map(x => x.update())
				Object.values(this.spellButtons).map(x => x.update())
			},
			
			onReset() {
				if (mouse.state == MOUSE_STATE_INFO)
					mouse.state = MOUSE_STATE_FREE
				game.sliders.map((slider, n) => {
					slider.dvTarget && slider.dvTarget.remove()
				})
				this.pointDisplay.reset()
			}
		})
	
		this.hover = GuiPointElement({
			className : "hover",
			parent : this.map.dvDisplay,
			
			_init() {
				this.pointDisplay = PointInfoDisplay({
					className : "point-info",
					parent : this.dvDisplay,
				})
				this.dvBuildings = createElement("div", "icons", this.dvDisplay)
				this.icons = Object.keys(BUILDINGS).map(x => BuildingIcon(x, this.dvBuildings))
			},

			align(x, y) {
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				x = ((x + width + 5 < viewport.width) ? (x + 5) : (x - 5 - width))
				y = y
				x = Math.max(0, Math.min(viewport.width - width, x))
				y = Math.max(0, Math.min(viewport.height - height, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y + "px"			
			},
	
			update() {
				this.pointDisplay.update()
			}, 
			
			onSet() {
				this.pointDisplay.set(this.point)
				if (this.point) {
					this.icons.map (x => {
						x.dvDisplay.classList.toggle("hidden", !(this.point.buildings && this.point.buildings[x.id] || (this.point.costs && this.point.level && this.point.level >= x.building.level && game.skills["build" + x.building.level] && this.point.costs[x.id] > -1)))
						x.dvDisplay.classList.toggle("unbought", !(this.point.buildings && this.point.buildings[x.id]))
					})
				}
			},

			onReset() {
				this.pointDisplay.reset()
			},
		})
		
		this.target.reset(true)
		this.hover.reset(true)
		this.colorPicker = ColorPicker()
	},	
	
	setTheme(theme, subtheme) {
		this.theme = (THEMES[theme] || THEMES["light"])[subtheme || "main"] || THEMES.light.main
		document.body.className = theme + " " + theme + "-" + subtheme
	},

	updateTabs() {
		let distress = game.map.markers && game.map.markers.length
		this.map.dvAscend.innerText = game.map.virtual?"Leave":distress?"Ascend(📡\uFE0E"+game.map.markers.length+")":game.map.boss?"Ascend(⚔\uFE0E)":"Ascend (🌟\uFE0E" + game.map.ascendCost + ")"
		this.map.dvAscend.classList.toggle("disabled",!game.map.virtual && (distress || game.resources.stars < game.map.ascendCost && !game.map.boss || game.map.boss && game.map.points.filter(x => !x.owned && x.boss == game.map.boss).length))
		this.map.dvAscend.classList.toggle("hidden", !game.statistics.stars)
		this.dvMana.classList.toggle("hidden", !game.skills.magic)
		this.dvScience.classList.toggle("hidden", !game.resources.science)
		this.map.dvDisplay.classList.toggle("dark", !!game.map.boss)
		this.map.dvDisplay.classList.toggle("complete", !!game.map.complete)
		this.tabs.setTitle("sliders", game.sliders.length > 1?game.sliders.length+" "+"Sliders":"Slider")
		this.tabs.toggleDisplay("skills", game.realMap.level)
		this.tabs.toggleDisplay("management", game.skills.management)
		this.tabs.toggleDisplay("stardust", game.skills.stardust)
		this.tabs.toggleDisplay("artifacts", game.skills.artifacts)
		if (game.skills.stardust) {
			const freeDust = game.resources.stardust - Object.values(game.stardust).reduce((v,x) => v+x, 0)
			gui.tabs.setTitle("stardust", (game.skills.virtualMaps?"Maps / ":"") + (freeDust?"Stardust ("+displayNumber(freeDust, 0)+")":"Stardust"))
		}
//		this.tabs.toggleDisplay("magic", game.skills.magic)
	},
	
	updateSaves(target) {
		this.menu.saves.update(true, target)
	},
	
	update() {
		const activeTab = this[this.tabs.activeTab]
		
		activeTab && activeTab.update && activeTab.update()
		
		if (this.tabs.activeTab == "sliders" || this.tabs.activeTab == "skills" || this.tabs.activeTab == "management") {
			this.dvExp.innerText = "Exp: " + displayNumber(game.resources.exp) + (game.real.production.exp?(game.real.production.exp>0?" (+":" (")+displayNumber(game.real.production.exp)+"/s)":"")
			if (game.skills.magic)
				this.dvMana.innerText = "Mana: " + displayNumber(game.resources.mana) + (game.real.production.mana?(game.real.production.mana>0?" (+":" (")+displayNumber(game.real.production.mana)+"/s)":"")
			if (game.resources.science)
				this.dvScience.innerText = "Science: " + displayNumber(game.resources.science) + (game.real.production.science?(game.real.production.science>0?" (+":" (")+displayNumber(game.real.production.science)+"/s)":"")
		}
		
		if (this.tabs.activeTab == "management" || this.tabs.activeTab == "sliders")
			this.dvGold.innerText = "Gold: " + displayNumber(game.resources.gold) + (game.real.production.gold?(game.real.production.gold>0?" (+":" (")+displayNumber(game.real.production.gold)+"/s)":"")
		
		this.target.update()
		this.hover.update()
	},
}

const colorPickerHandler = {
	_init() {
		this.dvHolder = createElement("div", "holder hidden", document.body)
		this.dvHolder.onclick = (event) => {
			if (event.target == this.dvHolder) {
				this.dvHolder.classList.toggle("hidden", true)
			}
		}

		this.dvDisplay = createElement("div", "color-picker", this.dvHolder)
		this.color = {
			red : 0,
			green : 0,
			blue : 0
		}
		this.red = GuiSlider({
			container : this.color,
			value : "red",
			parent : this.dvDisplay,
			leftText : "Red",
			max : 255,
			min : 0,
			steps : 255,
			digits : 0,
			onSet : () => {
				this.green.update()
				this.blue.update()
				const newColor = "rgb("+this.color.red+","+this.color.green+","+this.color.blue+")"
				this.updateColor(newColor)
			},
			onUpdate : () => {
				if (this.red)
					this.red.dvLine.style.background = "linear-gradient(to right, rgb(0,"+this.color.green+","+this.color.blue+"), rgb(255,"+this.color.green+","+this.color.blue+"))"
			},
			className : "color"
		})
		this.green = GuiSlider({
			container : this.color,
			value : "green",
			parent : this.dvDisplay,
			leftText : "Green",
			max : 255,
			min : 0,
			steps : 255,
			digits : 0,
			onSet : () => {
				this.green.update()
				this.blue.update()
				const newColor = "rgb("+this.color.red+","+this.color.green+","+this.color.blue+")"
				this.updateColor(newColor)
			},
			onUpdate : () => {
				if (this.green)
					this.green.dvLine.style.background = "linear-gradient(to right, rgb("+this.color.red+",0,"+this.color.blue+"), rgb("+this.color.red+",255,"+this.color.blue+"))"
			},
			className : "color"
		})
		this.blue = GuiSlider({
			container : this.color,
			value : "blue",
			parent : this.dvDisplay,
			leftText : "Blue",
			max : 255,
			min : 0,
			steps : 255,
			digits : 0,
			onSet : () => {
				this.green.update()
				this.blue.update()
				const newColor = "rgb("+this.color.red+","+this.color.green+","+this.color.blue+")"
				this.updateColor(newColor)
			},
			onUpdate : () => {
				if (this.blue)
					this.blue.dvLine.style.background = "linear-gradient(to right, rgb("+this.color.red+","+this.color.green+",0), rgb("+this.color.red+","+this.color.green+",255))"
			},
			className : "color"
		})
		this.dvButtons = createElement("div", "buttons", this.dvDisplay)
		this.dvSet = createElement("div", "button", this.dvButtons, "OK")
		this.dvSet.onclick = (event) => {
			this.dvHolder.classList.toggle("hidden", true)
		}

		this.dvUndo = createElement("div", "button", this.dvButtons, "Cancel")
		this.dvUndo.onclick = (event) => {
			this.updateColor(this.oldColor)
			this.dvHolder.classList.toggle("hidden", true)
		}
	},
	
	display(container, value, x, y) {
		const input = colorToRGBA(container[value])
		this.container = container
		this.value = value
		this.oldColor = container[value]
		this.color.red = input[0]
		this.color.green = input[1]
		this.color.blue = input[2]
		this.dvHolder.classList.toggle("hidden",false)
		this.red.update()
		this.green.update()
		this.blue.update()
		this.updateColor(this.oldColor)
		this.dvDisplay.style.left = Math.min(viewport.width - this.dvDisplay.offsetWidth - 5, x) + "px"
		this.dvDisplay.style.top = Math.min(viewport.height - this.dvDisplay.offsetHeight - 5, y) + "px"
	},
	
	updateColor(newColor) {
		this.red.dvRunner.style.backgroundColor = this.green.dvRunner.style.backgroundColor = this.blue.dvRunner.style.backgroundColor = newColor
		const colorLevel = this.color.red * 299 + this.color.green * 587 + this.color.blue * 114
		this.red.dvRunner.style.color = this.green.dvRunner.style.color = this.blue.dvRunner.style.color = colorLevel > 128000?"black":"white"
		if (this.container.setColor)
			this.container.setColor(newColor)
		else
			this.container[this.value] = newColor
	}
}

const ColorPicker = Template(colorPickerHandler)
