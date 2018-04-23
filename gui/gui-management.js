'use strict'

const SORT_METHODS = {
	"Power" : (x,y) => x.power - y.power,
	"Level" : (x,y) => ((x.level || 0) - (y.level || 0)) || (x.depth - y.depth) || (x.bonus - y.bonus),
	"Growth" : (x,y) => (x.totalBonus) - (y.totalBonus),
	"Depth" : (x,y) => (x.depth - y.depth) || (x.bonus - y.bonus),
	"Gold" : (x,y) => (x.production.gold || 0) - (y.production.gold || 0),
	"Mana" : (x,y) => (x.production.mana || 0) - (y.production.mana || 0),
	"Science" : (x,y) => (x.production.science || 0) - (y.production.science || 0),
}

const BASE_SORTING = {
	minLevel : 0,
	maxLevel : 4,
	types : [],
	sortBy : "Level",
	sortDir : -1,
	sortOften : false,
	hideEnchanted : false
}

const ManagementTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "management "+(this.className || ""), this.parent)
		
		this.dvAutomation = createElement("div", "automation", this.dvDisplay)
		
		this.autoTypes = MultiAttributePicker({
			parent : this.dvAutomation,
			container : game.automation,
			value : "types",
			title : "Autoupgrade: ",
			hint : "Automatically upgrades points as soon as possible",
			attributeVisible(x, n) {
				if (n > 2) return game.growth[x]?1:0
				return true
			},
		})
		
		this.dvMaxLevel = createElement("div", "slider", this.dvAutomation)

		this.maxLevel = ListPicker({
			parent : this.dvAutomation,
			container : game.automation,
			value : "maxLevel",
			className : "sorter reverse",
			name : "Maximum level",
			values : [0,1,2,3,4],
			texts : [0,1,2,3,4],
		})
		
		this.dvMaxCost = createElement("div", "slider", this.dvAutomation)
		this.dvText2 = createElement("div", "text", this.dvMaxCost, "Maximum gold:")

		this.maxCost = GuiSlider({
			parent : this.dvAutomation,
			container : game.automation,
			leftText : "0",
			rightText : "100%",
			value : "maxCost",
			max : 100,
			min : 0,
			steps : 100,
			digits : 0,
			className : "automation"
		})
		
		this.dvBuildAutomation = createElement("div", "automation", this.dvDisplay)
		this.dvBuildAutomationText = createElement("div", "automation-text", this.dvBuildAutomation, "Autobuild: ")

		this.buildings = Object.keys(BUILDINGS).map(x => BuildingIcon(x, this.dvBuildAutomation))
		this.buildings.map(x => {
			x.dvDisplay.onclick = (event) => {
				game.automation.buildings[x.id] = game.automation.buildings[x.id]?0:1
				game.getFullMoney()
				this.update(true)
			}
		})
		this.dvBuildAutomationETA = createElement("div", "automation-eta", this.dvBuildAutomation)

		this.sorting = BASE_SORTING
		
		this.dvSort = createElement("div", "sort", this.dvDisplay)

		this.sortTypes = MultiAttributePicker({
			parent : this.dvSort,
			container : this.sorting,
			className : "filter",
			value : "types",
			title : "Filter: ",
			hint : "Only display points of chosen types:",
			attributeVisible(x, n) {
				if (n > 2) return game.growth[x]?1:0
				return true
			},
			onUpdate : () => {
				game && game.map && game.map.points.filter(x => x.owned && x.index).map(x => x.getDisplay("management").dvDisplay.classList.toggle("hidden", x.boss || this.sorting.types.length && !this.sorting.types.includes(x.type)))
			}
		})
		
		this.sortSorter = ListPicker({
			parent : this.dvSort,
			container : this.sorting,
			className : "sorter",
			value : "sortBy",
			name : "Sort by",
			values : Object.keys(SORT_METHODS),
			texts : Object.keys(SORT_METHODS),
			itemVisibility : (x) => x.index < 4 || game.skills.magicManagement,
			onSame : () => {
				this.sorting.sortDir = -this.sorting.sortDir
				this.sortSorter.dvDisplay.classList.toggle("reverse", this.sorting.sortDir < 0)
			},
			onUpdate : () => {
				game && game.map && game.map.points.filter(x => x.owned && x.index).sort((x, y) => (SORT_METHODS[this.sorting.sortBy](x, y)) * this.sorting.sortDir).map(x => x.getDisplay("management").dvDisplay.parentElement.appendChild(x.getDisplay("management").dvDisplay))
			}
		})

		this.sortSorter.dvDisplay.classList.toggle("reverse", this.sorting.sortDir < 0)
		
		this.cbSortOften = GuiCheckbox({
			parent : this.dvSort,
			title : "Re-sort upon change",
			container : this.sorting,
			value : "sortOften"
		})
		
		this.cbHideEnchanted = GuiCheckbox({
			parent : this.dvSort,
			title : "Hide enchanted",
			container : this.sorting,
			visibility : () => !!game.skills.magicManagement,
			value : "hideEnchanted",
			onSet : () => this.update(true)
		})
		
		this.dvList = createElement("div", "list", this.dvDisplay)
		
		this.dvHover = createElement("div", "list-hover hidden", this.dvDisplay)
	},
	
	onSet() {
		this.dvDisplay.insertBefore(gui.dvHeader, this.dvDisplay.firstChild)
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			this.dvAutomation.classList.toggle("hidden", !game.skills.automation)
			this.dvBuildAutomation.classList.toggle("hidden", !game.skills.buildAutomation)
			this.dvBuildAutomation.classList.toggle("hidden", !game.skills.buildAutomation)
			if (game.skills.automation) {
				this.maxLevel.update(true)
				this.maxCost.update()
				this.autoTypes.update()
				this.autoTypes.updateVisibility()
			}
			this.sortTypes.update()
			this.sortTypes.updateVisibility()
			this.sortSorter.update(true)
			this.cbHideEnchanted.update()
			this.cbSortOften.update()
			game.map.points.filter(x => x.owned && x.index).map(x => x.getDisplay("management").update(forced))
			this.buildings.map(x => {
				let visible = game.statistics["built_"+x.id]
				x.dvDisplay.classList.toggle("visible", !!visible)
				if (visible)
					x.dvDisplay.classList.toggle("active", !!game.automation.buildings[x.id])
			})
		}
		game.map.points.filter(x => x.owned && x.index).map(x => x.getDisplay("management").update())		
		this.dvBuildAutomationETA.innerText = (game.fullMoney && game.fullMoney < game.resources.gold && game.real && game.real.production.gold && game.real.production.gold > 0?"Estimated finish time: "+shortTimeString((game.fullMoney - game.resources.gold)/game.real.production.gold):"")
	}
})

const managementPointElementHandler = {
	_init() {
		this.dvDisplay = createElement("div", "point "+(this.className || ""), this.parent)
		this.dvIcon = createElement("div", "level bg-"+POINT_TYPES[this.point.type], this.dvDisplay, this.point.level || "0")
		this.dvInfo = createElement("div", "info", this.dvDisplay)
		this.dvIcons = createElement("div", "icons", this.dvDisplay)
		this.dvLevelUp = createElement("div", "icon", this.dvIcons, "⇮\uFE0E")
		this.dvLevelUp.style.backgroundColor = gui.theme.icons.levelUp
		this.dvLevelUp.onclick = (event) => {
			if (this.point.costs.levelUp > game.resources.gold) return
			this.point.levelUp()
			if (gui.management.sorting.sortOften) gui.management.update(true)
			this.dvLevelUp.animate([
				{
					transform : "scale(0.8)",
					display : "flex",
					opacity : 1
				}, {
					transform : "scale(1)",
					display : "flex",
					opacity : 1
				}, this.point.level < POINT_MAX_LEVEL ? 
					{
						transform : "scale(0.8)",
						display : "flex",
						opacity : 1
					}:{
						transform : "scale(1.5)",
						display : "flex",
						opacity : 0
					}
			], 200)
			gui.management.dvHover.innerText = "Level up\nGold: "+displayNumber(this.point.costs.levelUp)
		}
		this.dvLevelUp.onmouseenter = (event) => {
			gui.management.dvHover.classList.toggle("hidden", false)
			gui.management.dvHover.classList.toggle("available", this.point.costs.levelUp <= game.resources.gold)
			gui.management.dvHover.classList.toggle("bought", false)
			gui.management.dvHover.innerText = "Level up\nGold: "+displayNumber(this.point.costs.levelUp)
		}
		this.dvLevelUp.onmousemove = (event) => {
			gui.management.dvHover.style.left = (event.clientX + 15 - (event.clientX > viewport.halfWidth?gui.management.dvHover.offsetWidth:0)) + "px"
			gui.management.dvHover.style.top  = (event.clientY - 15 - (event.clientY > viewport.halfHeight?gui.management.dvHover.offsetHeight:0)) + "px"
		}
		this.dvLevelUp.onmouseleave = this.dvLevelUp.onmouseout = (event) => gui.management.dvHover.classList.toggle("hidden", true)

		this.icons = Object.keys(BUILDINGS).map(x => BuildingIcon(x, this.dvIcons))
		this.icons.map(x => {
			x.dvDisplay.onclick = (event) => {
				this.point.build(x.id)
				if (gui.management.sorting.sortOften) gui.management.update(true)
				gui.management.dvHover.classList.toggle("bought", !!x.bought)
				gui.management.dvHover.classList.toggle("available", !!x.available)
				gui.management.dvHover.innerText = x.building.name + "\n" + x.building.desc + "\n" + (this.point?this.point.buildings[x.id]?x.building.info(this.point):"Gold: "+displayNumber(this.point.costs[x.id]):"?")
			}
			x.dvDisplay.onmouseenter = (event) => {
				gui.management.dvHover.classList.toggle("hidden", false)
				gui.management.dvHover.classList.toggle("bought", !!x.bought)
				gui.management.dvHover.classList.toggle("available", !!x.available)
				gui.management.dvHover.innerText = x.building.name + "\n" + x.building.desc + "\n" +  (this.point?this.point.buildings[x.id]?x.building.info(this.point):"Gold: "+displayNumber(this.point.costs[x.id]):"?")
			}
			x.dvDisplay.onmousemove = (event) => {
				gui.management.dvHover.style.left = (event.clientX + 15 - (event.clientX > viewport.halfWidth?gui.management.dvHover.offsetWidth:0)) + "px"
				gui.management.dvHover.style.top  = (event.clientY - 15 - (event.clientY > viewport.halfHeight?gui.management.dvHover.offsetHeight:0)) + "px"
			}
			x.dvDisplay.onmouseleave = x.dvDisplay.onmouseout = (event) => gui.management.dvHover.classList.toggle("hidden", true)
		})

		this.dvDivider = createElement("div", "divider", this.dvIcons)

		this.spellIcons = Object.keys(SPELLS).filter(x => SPELLS[x].managed).map(x => SpellIcon(x, this.dvIcons))
		this.spellIcons.map(x => {
			x.dvDisplay.onclick = (event) => {
				this.point.cast(x.id)
				if (gui.management.sorting.sortOften) gui.management.update(true)
				gui.management.dvHover.classList.toggle("bought", !!x.bought)
				gui.management.dvHover.classList.toggle("available", !!x.available)
				gui.management.dvHover.innerText = x.spell.name + "\n" + x.spell.desc + "\n" + (this.point?"Mana: "+displayNumber(x.spell.cost(this.point)):"?")
			}
			x.dvDisplay.onmouseenter = (event) => {
				gui.management.dvHover.classList.toggle("hidden", false)
				gui.management.dvHover.classList.toggle("bought", !!x.bought)
				gui.management.dvHover.classList.toggle("available", !!x.available)
				gui.management.dvHover.innerText = x.spell.name + "\n" + x.spell.desc + "\n" + (this.point?"Mana: "+displayNumber(x.spell.cost(this.point)):"?")
			}
			x.dvDisplay.onmousemove = (event) => {
				gui.management.dvHover.style.left = (event.clientX + 15 - (event.clientX > viewport.halfWidth?gui.management.dvHover.offsetWidth:0)) + "px"
				gui.management.dvHover.style.top  = (event.clientY - 15 - (event.clientY > viewport.halfHeight?gui.management.dvHover.offsetHeight:0)) + "px"
			}
			x.dvDisplay.onmouseleave = x.dvDisplay.onmouseout = (event) => gui.management.dvHover.classList.toggle("hidden", true)
		})

		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			if (this.point.enchanted && gui.management.sorting.hideEnchanted || this.point.boss || gui.management.sorting.types.length && !gui.management.sorting.types.includes(this.point.type)) {
				this.dvDisplay.classList.toggle("hidden", true)
				return
			} else {
				this.dvDisplay.classList.toggle("hidden", false)
			}
			this.dvInfo.innerText = "Power : " + displayNumber(this.point.power) + "\n" +
									"Growth : " + displayNumber(this.point.totalBonus) + "\n" +
									"Depth : " + this.point.depth// + (this.point.enchanted?" ("+["None", "Gold", "Growth", "Mana"][this.point.enchanted]+")":"")
			this.dvIcon.innerText = this.point.level || "0"
			if (game.skills.magicManagement)
				this.dvIcon.classList.toggle(["enchant-none", "enchant-gold", "enchant-growth", "enchant-mana", "enchant-doom"][this.point.enchanted || 0], 1)
			this.dvLevelUp.classList.toggle("visible", !this.point.boss && (!this.point.level || this.point.level < POINT_MAX_LEVEL))
			this.icons.map(x => {
				x.visible = this.point.buildings && this.point.buildings[x.id] || !this.point.boss && this.point.level && this.point.level >= x.building.level && (this.point.costs[x.id] > -1) && (game.skills["build"+x.building.level])
				x.dvDisplay.classList.toggle("visible", !!x.visible)
			})
			this.spellIcons.map(x => {
				x.visible = !this.point.boss && game.skills.magicManagement && (this.point.manaCosts[x.id] > -1) && (game.skills["book_"+x.spell.book])
				x.dvDisplay.classList.toggle("visible", !!x.visible)
			})
		}
		this.dvLevelUp.classList.toggle("available", this.point.costs.levelUp <= game.resources.gold)
		this.icons.map(x => {
			if (!x.visible) return
			x.bought = this.point.buildings && this.point.buildings[x.id]
			x.available = !x.bought && (this.point.costs[x.id] <= game.resources.gold)
			x.dvDisplay.classList.toggle("bought", !!x.bought)
			x.dvDisplay.classList.toggle("available", !!x.available)
		})
		this.spellIcons.map(x => {
			if (!x.visible) return
			x.available = (this.point.manaCosts[x.id] <= game.resources.mana)
			x.dvDisplay.classList.toggle("available", !!x.available)
		})
	},
	
	destroy() {
		this.dvDisplay.remove()
		delete this.dvDisplay
	}
}

const ManagementPointElement = Template(managementPointElementHandler)