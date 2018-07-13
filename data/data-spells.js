'use strict'

const SPELL_TYPE_POINT = 1
const SPELL_TYPE_GLOBAL = 2

const ENCHANT_GOLD = 1
const ENCHANT_GROWTH = 2
const ENCHANT_MANA = 3
const ENCHANT_DOOM = 4

const SPELLS = {//function context == point
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
			game.updateMapBackground = true
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
			game.updateMapBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
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
			game.updateMapBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},
/*	destroyNobuild : {
		name : "Dispel build shield",
		desc : "Removes shield from building-preventing point",
		book : "dispels2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			return point.owned?-1:point.special == SPECIAL_NOBUILD?(point.bonus ** 0.5 / 10):-1
		},
		cast(point) {
			delete point.special
			game.updateMapBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},*/
	destroyLock : {
		name : "Rest in keys",
		desc : "Unlock the nearby locked points",
		book : "unlocks1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			const locks = [...point.children].filter(x => !x.owned && x.locked == 1).length
			return point.owned && locks?(point.baseCost ** 0.5 / 10)* 1.5 ** ((point.map.unlocked || 0) + locks - 1):-1
		},
		cast(point) {
			for (let child of point.children)
				if (child.locked == 1) child.unlocked = true
			game.update()
		},
		iconText : "⚷\uFE0E",
		iconColor : "#DD55DD",
	},
	summonPower : {
		name : "Power elemental",
		desc : "Summons a clone to attack point node",
		book : "summons1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (point.noclone || point.special == SPECIAL_ALONE && point.attackers.size) return -1
			if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 100)
		},
		cast(point) {
			createSummon(point, 1)
		},
		iconText : "P",
		iconColor : "var(--bg-power)",
	},
	summonRandom : {
		name : "Random elemental",
		desc : "Summons random elemental clone to attack point node",
		book : "summons1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (point.noclone || point.special == SPECIAL_ALONE && point.attackers.size) return -1
			if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 50)
		},
		cast(point) {
			createSummon(point, 3 + Math.random() * 4 | 0)
		},
		iconText : "R",
		iconColor : "gray",
	},
	summonBlood : {
		name : "Blood elemental",
		desc : "Summons blood elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (point.noclone || point.special == SPECIAL_ALONE && point.attackers.size) return -1
			if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 3)
		},
		iconText : "B",
		iconColor : "var(--bg-blood)",
	},
	summonFire : {
		name : "Fire elemental",
		desc : "Summons fire elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (point.noclone || point.special == SPECIAL_ALONE && point.attackers.size) return -1
			if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 4)
		},
		iconText : "F",
		iconColor : "var(--bg-fire)",
	},
	summonIce : {
		name : "Ice elemental",
		desc : "Summons ice elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (point.noclone || point.special == SPECIAL_ALONE && point.attackers.size) return -1
			if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 5)
		},
		iconText : "I",
		iconColor : "var(--bg-ice)",
	},
	summonMetal : {
		name : "Metal elemental",
		desc : "Summons metal elemental clone to attack point node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			if (point.noclone || point.special == SPECIAL_ALONE && point.attackers.size) return -1
			if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) return -1
			return point.owned?-1:(point.bonus ** 0.5 / 10)
		},
		cast(point) {
			createSummon(point, 6)
		},
		iconText : "M",
		iconColor : "var(--bg-metal)",
	},
	summonExplosion : {
		name : "Summon explosion",
		desc : "Summons attacking this point explode, reducing remaining barrier by 5% + 5% per slider level",
		book : "explosive1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			const clones = [...point.attackers].reduce((v,x) => x.clone==2?v+(x.level || 0)+1:v,0)
			if (!clones) return -1
			return clones * point.baseCost ** 0.4/25
		},
		cast(point) {
			[...point.attackers].filter(x => x.clone == 2).map(slider => {
				const level = 5 + (slider.level || 0) * 5
				point.dealDamage(level, true)
				const {x,y} = point.coordinatesOn(point.progress, true)
				animations.Fireworks(x, y, gui.theme.typeColors[slider.element], level * 3, level * 3)
				slider.fullDestroy()
			})
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "X",
		iconColor : "var(--bg-fire)",
	},
	summonAlignment : {
		name : "Summon conversion",
		desc : "Summons attacking this point change element to most efficient one",
		book : "realign1",
		type : SPELL_TYPE_POINT,
		cost(point) { 
			const clones = [...point.attackers].reduce((v,x) => x.clone==2?v+1:v,0)
			if (!clones) return -1
			return (clones ** 0.9) * point.bonus ** 0.5/10
		},
		cast(point) {
			[...point.attackers].filter(x => x.clone == 2).map(slider => {
				slider.realign([1,3,4,5,6].map(element => {
					slider.realign(element, false)
					return [element, slider.predictDamage(point)]
				}).sort((x,y) => y[1]-x[1])[0][0], false)
				slider.setColor(gui.theme.typeColors[slider.element])
				slider.updateFullVisibility()
			})
			if (gui.target.point == point)
				gui.target.set(point, -1)
		},
		iconText : "C",
		iconColor : "#111111",
	},
	enchantGold: {
		name: "Land of gold",
		desc: "Factory produces more gold",
		book: "enchantments1",
		type: SPELL_TYPE_POINT,
		managed :true,
		recalc : true,
		cost(point) {
			return point.owned && !point.enchanted && point.buildings.goldFactory?point.baseCost ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_GOLD
		},
		iconText : "G",
		iconColor : "#888866"
	},
	enchantMana: {
		name: "Land of mana",
		desc: "Obelisk mana production is boosted",
		book: "enchantments1",
		type: SPELL_TYPE_POINT,
		managed :true,
		recalc : true,
		cost(point) {
			return point.owned && !point.enchanted && point.buildings.manalith?point.baseCost ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_MANA
		},
		iconText : "M",
		iconColor : "#886688"
	},
	enchantGrowth: {
		name: "Land of growth",
		desc: "Growth production is boosted",
		book: "enchantments2",
		type: SPELL_TYPE_POINT,
		managed :true,
		recalc : true,
		cost(point) {
			return !point.boss && point.index && point.owned && !point.enchanted?point.baseCost ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_GROWTH
		},
		iconText : "G",
		iconColor : "#668888"
	},
	enchantDoom: {
		name: "Land of doom",
		desc: "Damage dealt to the point is greatly boosted. Doomed points provide less growth but more science.",
		book: "enchantments2",
		type: SPELL_TYPE_POINT,
		managed :true,
		recalc : true,
		cost(point) {
			return !point.boss && (point.special != SPECIAL_RESIST || point.owned) && point.index && !point.enchanted?point.baseCost ** 0.4/10:-1
		},
		cast(point) {
			point.enchanted = ENCHANT_DOOM
		},
		iconText : "D",
		iconColor : "#330000"
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
