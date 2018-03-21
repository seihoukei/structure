'use strict'

const BUILDINGS = {//function context == point
	goldFactory : {
		name : "Gold factory",
		desc : "Produces gold",
		level : 1,
		cost() { 
			return this.depth * 68400
		},
		info() {
			return "Production: " + displayNumber(this.depth * this.map.level ** 2 * ((this.level || 0) + 1) * (game.skills.greed ? this.map.level ** 2 / 16.9 : 1) * (game.skills.magicBoost1 && (this.distance < this.map.ownedRadius)?(this.map.ownedRadius - this.distance + 1):1)) + "/s"
		},
		build() {
			game.production.gold += this.depth * this.map.level ** 2 * ((this.level || 0) + 1) * (game.skills.greed ? this.map.level ** 2 / 16.9 : 1) * (game.skills.magicBoost1 && (this.distance < this.map.ownedRadius)?(this.map.ownedRadius - this.distance + 1):1)
		},
		destroy() {
			game.production.gold -= this.depth * this.map.level ** 2 * ((this.level || 0) + 1) * (game.skills.greed ? this.map.level ** 2 / 16.9 : 1) * (game.skills.magicBoost1 && (this.distance < this.map.ownedRadius)?(this.map.ownedRadius - this.distance + 1):1)
		},
		iconText : "G",
		iconColor : "gold",
	},
	scienceLab : {
		name : "Science lab",
		desc : "Produces science",
		level : 1,
		cost() { 
			return this.depth * 1000000
		},
		info() {
			return "Production: " + displayNumber(this.depth * this.map.level ** 2 / 1e5 * ((this.level || 0) + 1) * (game.skills.magicBoost1 && (this.distance < this.map.ownedRadius)?this.map.ownedRadius * (this.map.ownedRadius - this.distance + 1):1))
		},
		build() {
			game.production.science += this.depth * this.map.level ** 2 / 1e5 * ((this.level || 0) + 1) * (game.skills.magicBoost1 && (this.distance < this.map.ownedRadius)?this.map.ownedRadius * (this.map.ownedRadius - this.distance + 1):1)
		},
		destroy() {
			game.production.science -= this.depth * this.map.level ** 2 / 1e5 * ((this.level || 0) + 1) * (game.skills.magicBoost1 && (this.distance < this.map.ownedRadius)?this.map.ownedRadius * (this.map.ownedRadius - this.distance + 1):1)
		},
		iconText : "S",
		iconColor : "purple",
	},
	obelisk : {
		name : "Ironhearted flag",
		desc : "Increases spirit for nearby sliders",
		level : 1,
		cost() { 
			return (this.depth * this.outs * 1000000) || -1
		},
		info() {
			return "Spirit bonus: x" + ((this.level || 0) + 1)
		},
		build() {},
		destroy() {},
		iconText : "⚑\uFE0E",
		iconColor : "#ADFF2F",
	},
	banner : {
		name : "Flag of punishment",
		desc : "Increases global power growth bonus",
		level : 2,
		cost() {
			return this.depth * 1e9
		},
		info() {
			return "Power bonus: x" + displayNumber((this.depth * this.bonus) ** 0.5 / 1e5)
		},
		build() {
			game.multi.power = (game.multi.power || 1) + (this.depth * this.bonus) ** 0.5 / 1e5
		},
		destroy() {
			game.multi.power = (game.multi.power || 1) - (this.depth * this.bonus) ** 0.5 / 1e5
		},
		iconText : "⚑\uFE0E",
		iconColor : "#FFFF55"
	},
	hopeFactory : {
		name : "Fear factory",
		desc : "Extracts fears from physically protected points",
		level : 2,
		cost() {
			return (this.special == SPECIAL_BLOCK)?100e9:-1
		},
		info() {
			return "Production: " + displayNumber(1e-10 * this.map.level ** 6)
		},
		build() {
			game.production.fears += 1e-10 * this.map.level ** 6
		}, 
		destroy() {
			game.production.fears -= 1e-10 * this.map.level ** 6
		},
		iconText : "F",
		iconColor : "#FF44CC"
	},
	cloudFactory : {
		name : "Cloud factory",
		desc : "Collects clouds from magically protected points",
		level : 2,
		cost() {
			return (this.special == SPECIAL_RESIST)?100e9:-1
		},
		info() {
			return "Production: " + displayNumber(2e-11 * this.map.level ** 6)
		},
		build() {
			game.production.clouds += 2e-11 * this.map.level ** 6
		}, 
		destroy() {
			game.production.clouds -= 2e-11 * this.map.level ** 6
		},
		iconText : "C",
		iconColor : "#44CCFF"
	},
	manalith : {
		name : "Black obelisk",
		desc : "Produces mana",
		level : 3,
		cost() {
			return this.distance < this.map.ownedRadius?1e15:-1
		},
		info() {
			return "Production: " + displayNumber(this.depth * this.map.level / 1000 * (1 + (this.map.ownedRadius - this.distance) / 100))
		},
		build() {
			game.production.mana += this.depth * this.map.level / 1000 * (1 + (this.map.ownedRadius - this.distance) / 100)
		},
		destroy() {
			game.production.mana -= this.depth * this.map.level / 1000 * (1 + (this.map.ownedRadius - this.distance) / 100)
		},
		iconText : "M",
		iconColor : "#113388"
	}
}

Object.keys(BUILDINGS).map(x => BUILDINGS[x].id = x)

function BuildingIcon(x, parent) {
	let icon = {
		id : x,
		building : BUILDINGS[x]
	}
	icon.dvDisplay = createElement("div", "icon", parent)
	icon.dvDisplay.innerText = getString(icon.building.iconText)
	icon.dvDisplay.style.backgroundColor = icon.building.iconColor
	return icon
}