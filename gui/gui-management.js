'use strict'

const SORT_METHODS = {
	"Power" : (x,y) => x.power - y.power,
	"Level" : (x,y) => (x.level || 0) - (y.level || 0),
	"Growth" : (x,y) => x.bonus - y.bonus,
	"Depth" : (x,y) => x.depth - y.depth,
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
		this.dvText = createElement("div", "text", this.dvMaxLevel, "Maximum level:")

		this.maxLevel = GuiSlider({
			parent : this.dvAutomation,
			container : game.automation,
			leftText : "0",
			rightText : "4",
			value : "maxLevel",
			max : 4,
			min : 0,
			steps : 4,
			className : "automation"
		})
		
		this.dvMaxCost = createElement("div", "slider", this.dvAutomation)
		this.dvText2 = createElement("div", "text", this.dvMaxCost, "Maximum cost:")

		this.maxCost = GuiSlider({
			parent : this.dvAutomation,
			container : game.automation,
			leftText : "0",
			rightText : "100%",
			value : "maxCost",
			max : 100,
			min : 0,
			steps : 100,
			className : "automation"
		})
		
		this.sorting = {
			minLevel : 0,
			maxLevel : 4,
			types : [],
			sortBy : SORT_METHODS["Level"],
			sortDir : -1
		}
		
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
				game && game.map && game.map.points.filter(x => x.owned && x.index).map(x => x.getDisplay("management").dvDisplay.classList.toggle("hidden", this.sorting.types.length && !this.sorting.types.includes(x.type)))
			}
		})
		
		this.sortSorter = ListPicker({
			parent : this.dvSort,
			container : this.sorting,
			className : "sorter",
			value : "sortBy",
			name : "Sort by",
			values : Object.values(SORT_METHODS),
			texts : Object.keys(SORT_METHODS),
			onSame : () => {
				this.sorting.sortDir = -this.sorting.sortDir
				this.sortSorter.dvDisplay.classList.toggle("reverse", this.sorting.sortDir < 0)
			},
			onUpdate : () => {
				game && game.map && game.map.points.filter(x => x.owned && x.index).sort((x, y) => this.sorting.sortBy(x, y) * this.sorting.sortDir).map(x => x.getDisplay("management").dvDisplay.parentElement.appendChild(x.getDisplay("management").dvDisplay))
			}
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
			if (game.skills.automation) {
				this.maxLevel.update()
				this.maxCost.update()
				this.autoTypes.update()
				this.autoTypes.updateVisibility()
			}
			this.sortTypes.update()
			this.sortTypes.updateVisibility()
			this.sortSorter.update(true)
			game.map.points.filter(x => x.owned && x.index).map(x => x.getDisplay("management").update(forced))
		}
		game.map.points.filter(x => x.owned && x.index).map(x => x.getDisplay("management").update())		
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
				gui.management.dvHover.classList.toggle("bought", !!x.bought)
				gui.management.dvHover.classList.toggle("available", !!x.available)
				gui.management.dvHover.innerText = x.building.name + "\n" + x.building.desc + "\n" + (this.point?this.point.buildings[x.id]?x.building.info.call(this.point):"Gold: "+displayNumber(this.point.costs[x.id]):"?")
			}
			x.dvDisplay.onmouseenter = (event) => {
				gui.management.dvHover.classList.toggle("hidden", false)
				gui.management.dvHover.classList.toggle("bought", !!x.bought)
				gui.management.dvHover.classList.toggle("available", !!x.available)
				gui.management.dvHover.innerText = x.building.name + "\n" + x.building.desc + "\n" +  (this.point?this.point.buildings[x.id]?x.building.info.call(this.point):"Gold: "+displayNumber(this.point.costs[x.id]):"?")
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
			this.dvInfo.innerText = "Power : " + displayNumber(this.point.power) + "\n" +
									"Growth : " + displayNumber(this.point.bonus) + "\n" +
									"Depth : " + this.point.depth
			this.dvIcon.innerText = this.point.level || "0"
			this.dvLevelUp.classList.toggle("visible", !this.point.level || this.point.level < POINT_MAX_LEVEL)
			this.icons.map(x => {
				x.visible = this.point.level && this.point.level >= x.building.level && (this.point.costs[x.id] > -1) && (game.skills["build"+x.building.level])
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
	},
	
	destroy() {
		this.dvDisplay.remove()
		delete this.dvDisplay
	}
}

const ManagementPointElement = Template(managementPointElementHandler)