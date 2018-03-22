'use strict'

const StatisticsTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "statistics "+(this.className || ""), this.parent)
		
		this.dvStats = createElement("div", "statistics", this.dvDisplay)
		
		this.stats = Object.keys(STATISTICS).map(id => StatDisplay({
			id,
			stat : STATISTICS[id],
			parent : this.dvStats
		}))
		
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
		this.stats.map(x => x.update(forced))
	}
})

const statDisplayHandler = {
	_init() {
		this.dvDisplay = createElement("div", "stat "+this.id, this.parent)
		this.dvTitle = createElement("div", "name", this.dvDisplay, this.stat.name + ":")
		this.dvValue = createElement("div", "value", this.dvDisplay)
		this.update(true)
	},
	
	update(forced) {
		const value = game.statistics[this.id]
		const visible = !this.stat.visible || this.stat.visible(value)
		this.dvDisplay.classList.toggle("hidden", !visible)
		if (visible)
			this.dvValue.innerText = this.stat.display(game.statistics[this.id])
	}
}

const StatDisplay = Template(statDisplayHandler)

const STATISTICS = {
	onlineTime : {
		name : "Online time",
		display : (x) => timeString(x),
	},
	offlineTime : {
		name : "Offline time",
		display : (x) => timeString(x),
		visible : (x) => x?1:0
	},
	points : {
		name : "Captured points",
		display : (x) => displayNumber(x, 0),
		visible : (x) => x?1:0
	},		
	stars : {
		name : "Found stars",
		display : (x) => displayNumber(x, 0),
		visible : (x) => x?1:0
	},		
/*	template : {
		name : "",
		display : (x) => displayNumber(x),
		visible : (x) => x?1:0
	},		*/
}

for (let i = 1; i <= POINT_MAX_LEVEL; i++) {
	STATISTICS["point_level"+i] = {
		name : "Points up to level "+i,
		display : (x) => x?displayNumber(x):"0",
		visible : (x) => game.skills.upgradePoints
	}
}

Object.keys(BUILDINGS).map(x => {
	const building = BUILDINGS[x]
	STATISTICS["built_"+x] = {
		name : "Built " + building.name,
		display : (x) => pluralize(x, [" time"," times"]),
		visible : (x) => game.skills["build"+building.level] && x,
	}
})

Object.keys(STATISTICS).map(x => STATISTICS[x].id = x)
