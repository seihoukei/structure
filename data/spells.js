'use strict'

const SPELL_TYPE_POINT = 1
const SPELL_TYPE_GLOBAL = 2

const ENCHANT_GOLD = 1
const ENCHANT_GROWTH = 2
const ENCHANT_MANA = 3

const SPELLS = {//function context == point
	summonPower : {
		name : "Power elemental",
		desc : "Summons a clone to attack point node",
		book : "summons1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 100)
		},
		cast(point) {
			createSummon(point, 1)
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "P",
		iconColor : "gray",
	},
	summonRandom : {
		name : "Random elemental",
		desc : "Summons random elemental clone to attack point node",
		book : "summons1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 50)
		},
		cast(point) {
			createSummon(point, 3 + Math.random() * 4 | 0)
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "R",
		iconColor : "gray",
	},
	destroyResist : {
		name : "Dispel magical shield",
		desc : "Removes shield from magically protected point",
		book : "dispels1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			return point.owned?-1:point.special == SPECIAL_RESIST?(point.bonus ** 0.5 / 10):-1
		},
		cast(point) {
			delete point.special
			game.updateBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},
	destroyBlock : {
		name : "Dispel physical shield",
		desc : "Removes shield from physically protected point",
		book : "dispels1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			return point.owned?-1:point.special == SPECIAL_BLOCK?(point.bonus ** 0.5 / 10):-1
		},
		cast(point) {
			delete point.special
			game.updateBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},
	summonBlood : {
		name : "Blood elemental",
		desc : "Summons blood elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 3)
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "B",
		iconColor : "gray",
	},
	summonFire : {
		name : "Fire elemental",
		desc : "Summons fire elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 4)
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "F",
		iconColor : "gray",
	},
	summonIce : {
		name : "Ice elemental",
		desc : "Summons ice elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 5)
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "I",
		iconColor : "gray",
	},
	summonMetal : {
		name : "Metal elemental",
		desc : "Summons metal elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 6)
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "M",
		iconColor : "gray",
	},
	destroyNoclone : {
		name : "Dispel summon shield",
		desc : "Removes shield from summon-protected point",
		book : "dispels2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			return point.owned?-1:point.special == SPECIAL_NOCLONE?(point.bonus ** 0.5 / 10):-1
		},
		cast(point) {
			delete point.special
			game.updateBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},
	destroyNobuild : {
		name : "Dispel build shield",
		desc : "Removes shield from building-preventing point",
		book : "dispels2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			return point.owned?-1:point.special == SPECIAL_NOBUILD?(point.bonus ** 0.5 / 10):-1
		},
		cast(point) {
			delete point.special
			game.updateBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},
	destroyLock : {
		name : "Rest in keys",
		desc : "Unlock the nearby locked points",
		book : "unlocks1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			const locks = [...point.children].filter(x => !x.owned && x.locked == 1).length
			return point.owned && locks?(point.bonus ** 0.5 / 10)* 1.5 ** ((point.map.unlocked || 0) + locks - 1):-1
		},
		cast(point) {
			for (let child of point.children)
				if (child.locked == 1) child.unlocked = true
			game.update()
		},
		iconText : "⚷\uFE0E",
		iconColor : "#DD55DD",
	},
	enchantGold: {
		name: "Land of gold",
		desc: "Factory produces more gold",
		book: "enchantments1",
		type: SPELL_TYPE_POINT,
		recalc : true,
		cost(point) {
			return point.owned && !point.enchanted && point.buildings.goldFactory?point.bonus ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_GOLD
		},
		iconText : "G",
		iconColor : "#888866"
	},
	enchantGrowth: {
		name: "Land of growth",
		desc: "Growth production is boosted",
		book: "enchantments2",
		type: SPELL_TYPE_POINT,
		recalc : true,
		cost(point) {
			return point.owned && !point.enchanted?point.bonus ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_GROWTH
		},
		iconText : "G",
		iconColor : "#668888"
	},
	enchantMana: {
		name: "Land of mana",
		desc: "Obelisk mana production is boosted",
		book: "enchantments1",
		type: SPELL_TYPE_POINT,
		recalc : true,
		cost(point) {
			return point.owned && !point.enchanted && point.buildings.manalith?point.bonus ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_MANA
		},
		iconText : "M",
		iconColor : "#886688"
	},
}

Object.keys(SPELLS).map(x => SPELLS[x].id = x)

function SpellIcon(x, parent) {
	let icon = {
		id : x,
		spell : SPELLS[x]
	}
	icon.dvDisplay = createElement("div", "icon spell", parent)
	icon.dvDisplay.innerText = getString(icon.spell.iconText)
	icon.dvDisplay.style.backgroundColor = icon.spell.iconColor
	return icon
}