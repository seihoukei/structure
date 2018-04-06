'use strict'

const BUILDINGS = {//function context == point
	goldFactory : {
		name : "Gold factory",
		desc : "Produces gold",
		level : 1,
		production(point) {
			return(point.depth * point.map.level ** 2 * ((point.level || 0) + 1) * (game.skills.greed ? point.map.level ** 2 / 16.9 : 1) * (game.skills.magicBoost1 && (point.distance < point.map.ownedRadius)?(point.map.ownedRadius - point.distance + 1):1))**(point.enchanted == ENCHANT_GOLD?point.map.level/10:1)
		},
		cost(point) { 
			return point.depth * 68400
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point)) + "/s"
		},
		build(point) {
			game.production.gold += this.production(point)
		},
		destroy(point) {
			game.production.gold -= this.production(point)
		},
		iconText : "G",
		iconColor : "gold",
	},
	scienceLab : {
		name : "Science lab",
		desc : "Produces science",
		level : 1,
		cost(point) { 
			return point.depth * 1000000
		},
		production(point) {
			return point.depth * point.map.level ** 2 / 1e5 * ((point.level || 0) + 1) * (game.skills.magicBoost1 && (point.distance < point.map.ownedRadius)?point.map.ownedRadius * (point.map.ownedRadius - point.distance + 1):1)
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.production.science += this.production(point)
		},
		destroy(point) {
			game.production.science -= this.production(point)
		},
		iconText : "S",
		iconColor : "purple",
	},
	obelisk : {
		name : "Ironhearted flag",
		desc : "Increases spirit for nearby sliders",
		level : 1,
		cost(point) { 
			return (point.depth * point.outs * 1000000) || -1
		},
		info(point) {
			return "Spirit bonus: x" + ((point.level || 0) + 1)
		},
		build(point) {},
		destroy(point) {},
		iconText : "⚑\uFE0E",
		iconColor : "#ADFF2F",
	},
	banner : {
		name : "Flag of punishment",
		desc : "Increases global power growth bonus",
		level : 2,
		cost(point) {
			return point.depth * 1e9
		},
		production (point) {
			return (point.depth * point.bonus) ** 0.5 / 1e5
		},
		info(point) {
			return "Power bonus: x" + displayNumber(this.production(point))
		},
		build(point) {
			game.multi.power = (game.multi.power || 1) + this.production(point)
		},
		destroy(point) {
			game.multi.power = (game.multi.power || 1) - this.production(point)
		},
		iconText : "⚑\uFE0E",
		iconColor : "#FFFF55"
	},
	hopeFactory : {
		name : "Fear factory",
		desc : "Extracts fears from physically protected points",
		level : 2,
		cost(point) {
			return (point.special == SPECIAL_BLOCK)?100e9:-1
		},
		production(point){
			return 1e-10 * point.map.level ** 6
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.production.fears += this.production(point)
		}, 
		destroy(point) {
			game.production.fears -= this.production(point)
		},
		iconText : "F",
		iconColor : "#FF44CC"
	},
	cloudFactory : {
		name : "Cloud factory",
		desc : "Collects clouds from magically protected points",
		level : 2,
		cost(point) {
			return (point.special == SPECIAL_RESIST)?100e9:-1
		},
		production(point){
			return 2e-11 * point.map.level ** 6
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.production.clouds += this.production(point)
		}, 
		destroy(point) {
			game.production.clouds -= this.production(point)
		},
		iconText : "C",
		iconColor : "#44CCFF"
	},
	manalith : {
		name : "Black obelisk",
		desc : "Produces mana",
		level : 3,
		production(point) {
			return point.depth * point.map.level / 1000 * (1 + (point.map.ownedRadius - point.distance) / 100) * (point.enchanted == ENCHANT_MANA?point.map.level ** (point.map.level / 10):1)
		},
		cost(point) {
			return point.distance < point.map.ownedRadius?1e15:-1
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.production.mana += this.production(point)
		},
		destroy(point) {
			game.production.mana -= this.production(point)
		},
		iconText : "M",
		iconColor : "#113388"
	},
	powerTower : {
		name : "The ivory tower",
		desc : "Produces power equal to growth",
		level : 3,
		cost(point) {
			return point.children.size?-1:point.power ** 0.5
		},
		production(point){
			return point.bonus * ((point.bonusMult || 0) + 1)
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.growth["power"] += this.production(point)
		},
		destroy(point) {
			game.growth["power"] -= this.production(point)
		},
		iconText : "P",
		iconColor : "#888833"
	},
	spiritTower : {
		name : "Tower of infinity",
		desc : "Produces spirit equal to growth",
		level : 3,
		cost(point) {
			return point.children.size?point.power ** 0.5:-1
		},
		production(point){
			return point.bonus * ((point.bonusMult || 0) + 1)
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.growth["spirit"] += this.production(point)
		},
		destroy(point) {
			game.growth["spirit"] -= this.production(point)
		},
		iconText : "S",
		iconColor : "#338833"
	},
	rainbowTower : {
		name : "Rainbow tower",
		desc : "Produces all 4 elements equal to growth",
		level : 4,
		cost(point) {
			return (point.children.size == 1)?point.power ** 0.6:-1
		},
		production(point){
			return point.bonus * ((point.bonusMult || 0) + 1)
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			const value = this.production(point)
			game.growth["fire"]  += value
			game.growth["ice"]   += value
			game.growth["blood"] += value
			game.growth["metal"] += value
		},
		destroy(point) {
			const value = this.production(point)
			game.growth["fire"]  -= value
			game.growth["ice"]   -= value
			game.growth["blood"] -= value
			game.growth["metal"] -= value
		},
		iconText : "R",
		iconColor : "#FF8844"
	},
	thunderstoneFactory : {
		name : "Thunder spire",
		desc : "Collects thunderstone power",
		level : 4,
		cost(point) {
			return 1e22
		},
		production(point){
			return (point.map.level - 10) ** 5 / 1e6 * point.depth
		},
		info(point) {
			return "Production: " + displayNumber(this.production(point))
		},
		build(point) {
			game.production.thunderstone += this.production(point) 
		}, 
		destroy(point) {
			game.production.thunderstone -= this.production(point)
		},
		iconText : "T",
		iconColor : "#4488FF"
	},
	earthquakeMachine : {
		name : "Mean machine",
		desc : "Constantly deals damage to nearby points proportional to thunderstone power and experience multiplier",
		level : 4,
		cost(point) {
			return [...point.children].filter(x => !x.owned && (x.special != SPECIAL_BLOCK) && !x.locked && (!x.boss || x.boss <= x.map.level) ).length?10 ** (10 + (point.map.level) / 2):-1
		},
		info(point) {
			return ""
		},
		build(point) {
		},
		destroy(point) {
		},
		iconText : "M",
		iconColor : "#883333"
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