'use strict'

const SPELL_TYPE_POINT = 1
const SPELL_TYPE_GLOBAL = 2

const SPELLS = {//function context == point
	summonPower : {
		name : "Power elemental",
		desc : "Summons a clone to attack this node",
		book : "summons1",
		type : SPELL_TYPE_POINT,
		cost() { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return this.owned?-1:(this.bonus ** 0.5 / 100)
		},
		cast() {
			createSummon(this, 1)
			if (gui.target.point == this)
				gui.target.set(this, -1)
		},
		iconText : "P",
		iconColor : "gray",
	},
	summonRandom : {
		name : "Random elemental",
		desc : "Summons random elemental clone to attack this node",
		book : "summons1",
		type : SPELL_TYPE_POINT,
		cost() { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return this.owned?-1:(this.bonus ** 0.5 / 50)
		},
		cast() {
			createSummon(this, 3 + Math.random() * 4 | 0)
			if (gui.target.point == this)
				gui.target.set(this, -1)
		},
		iconText : "R",
		iconColor : "gray",
	},
	destroyResist : {
		name : "Dispel magical shield",
		desc : "Removes shield from magically protected point",
		book : "dispels1",
		type : SPELL_TYPE_POINT,
		cost() { 
			return this.owned?-1:this.special == SPECIAL_RESIST?(this.bonus ** 0.5 / 10):-1
		},
		cast() {
			delete this.special
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
		cost() { 
			return this.owned?-1:this.special == SPECIAL_BLOCK?(this.bonus ** 0.5 / 10):-1
		},
		cast() {
			delete this.special
			game.updateBackground = true
		},
		iconText : "D",
		iconColor : "#DD55DD",
	},
	summonBlood : {
		name : "Blood elemental",
		desc : "Summons blood elemental clone to attack this node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost() { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return this.owned?-1:(this.bonus ** 0.5 / 10)
		},
		cast() {
			createSummon(this, 3)
			if (gui.target.point == this)
				gui.target.set(this, -1)
		},
		iconText : "B",
		iconColor : "gray",
	},
	summonFire : {
		name : "Fire elemental",
		desc : "Summons fire elemental clone to attack this node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost() { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return this.owned?-1:(this.bonus ** 0.5 / 10)
		},
		cast() {
			createSummon(this, 4)
			if (gui.target.point == this)
				gui.target.set(this, -1)
		},
		iconText : "F",
		iconColor : "gray",
	},
	summonIce : {
		name : "Ice elemental",
		desc : "Summons ice elemental clone to attack this node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost() { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return this.owned?-1:(this.bonus ** 0.5 / 10)
		},
		cast() {
			createSummon(this, 5)
			if (gui.target.point == this)
				gui.target.set(this, -1)
		},
		iconText : "I",
		iconColor : "gray",
	},
	summonMetal : {
		name : "Metal elemental",
		desc : "Summons metal elemental clone to attack this node",
		book : "summons2",
		type : SPELL_TYPE_POINT,
		cost() { 
			if (game.sliders.filter(x => x.clone == 2).length >= 10) return -1
			return this.owned?-1:(this.bonus ** 0.5 / 10)
		},
		cast() {
			createSummon(this, 6)
			if (gui.target.point == this)
				gui.target.set(this, -1)
		},
		iconText : "M",
		iconColor : "gray",
	},
	destroyNoclone : {
		name : "Dispel summon shield",
		desc : "Removes shield from summon-protected point",
		book : "dispels2",
		type : SPELL_TYPE_POINT,
		cost() { 
			return this.owned?-1:this.special == SPECIAL_NOCLONE?(this.bonus ** 0.5 / 10):-1
		},
		cast() {
			delete this.special
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
		cost() { 
			return this.owned?-1:this.special == SPECIAL_NOBUILD?(this.bonus ** 0.5 / 10):-1
		},
		cast() {
			delete this.special
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
		cost() { 
			const locks = [...this.children].filter(x => !x.owned && x.locked == 1).length
			return this.owned && locks?(this.bonus ** 0.5 / 10)* 1.5 ** ((this.map.unlocked || 0) + locks - 1):-1
		},
		cast() {
			for (let child of this.children)
				if (child.locked == 1) child.unlocked = true
			game.update()
		},
		iconText : "⚷\uFE0E",
		iconColor : "#DD55DD",
	},
}

Object.keys(SPELLS).map(x => SPELLS[x].id = x)

function SpellIcon(x, parent) {
	let icon = {
		id : x,
		spell : SPELLS[x]
	}
	icon.dvDisplay = createElement("div", "icon", parent)
	icon.dvDisplay.innerText = getString(icon.spell.iconText)
	icon.dvDisplay.style.backgroundColor = icon.spell.iconColor
	return icon
}