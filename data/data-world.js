'use strict'

const WORLD_POINT_CORE = 0
const WORLD_POINT_ACTIVE = 1
const WORLD_POINT_PASSIVE = 2

const WORLD_BONUS_ADD = 1
const WORLD_BONUS_MUL = 2
const WORLD_BONUS_ADD_MULT = 3

const WORLD_STATS = {
	goldSpeed : {
		name: "Mining speed x",
		default: 1
	},
	harvestSpeed : {
		name: "Imprinting speed x",
		default: 1
	},
	scienceSpeed : {
		name: "Research speed x",
		default: 1
	},
	bloodBoost : {
		name: "Workers' blood growth x",
		default: 1
	},
	fireBoost : {
		name: "Workers' fire growth x",
		default: 1
	},
	iceBoost : {
		name: "Workers' ice growth x",
		default: 1
	},
	metalBoost : {
		name: "Workers' metal growth x",
		default: 1
	},
	manaSpeed : {
		name: "Mana production x",
		default: 1
	},
	maxSummons : {
		name: "Summon limit: ",
		default: 10
	},
	meanBoost : {
		name: "Mean machine damage x",
		default: 1
	},
}

const BASE_WORLD_STATS = Object.keys(WORLD_STATS).reduce((v,x) => (v[x]=WORLD_STATS[x].default, v), {})

const WORLD_ELEMENTS = {
	entryPoint: {
		name : "World core",
		desc : "Holds the world together",
		type : WORLD_POINT_CORE,
		family : "core",
		radius : 5,
		deadZone : 10,
		reach : 15,
		iconText : "🏠\uFE0E",
	},
	goldMine: {
		name : "Gold mine",
		desc : "Multiplies mining speed",
		type : WORLD_POINT_PASSIVE,
		family : "resource",
		radius : 5,
		deadZone : 10,
		reach : 20,
		effect : WORLD_BONUS_MUL,
		value : (point) => 1 + 2 ** (0.5 - point.depth / 2),
		stat : "goldSpeed",
		cost : {
			_1 : 3,
			_2 : 3,
		},
		iconText : "⛏\uFE0E"
	},
	imprinter: {
		name : "Memory pool",
		desc : "Multiplies imprinting speed",
		type : WORLD_POINT_PASSIVE,
		family : "imprint",
		radius : 5,
		reach : 25,
		deadZone : 15,
		effect : WORLD_BONUS_MUL,
		value : (point) => 1 + 2 ** (0.5 - point.depth / 2),
		stat : "harvestSpeed",
		cost : {
			_1 : 5,
			_2 : 5,
			_3 : 5,
			_4 : 5,
			_5 : 5,
			_6 : 5,
		},
		iconText : "M",
	},
	library : {
		name : "Library",
		desc : "Boosts research speed",
		type : WORLD_POINT_PASSIVE,
		family : "resource",
		blueprint : "science1",
		radius : 7,
		deadZone : 20, 
		reach : 25,
		iconText : "🔍\uFE0E",
		effect : WORLD_BONUS_ADD_MULT,
		stat : "scienceSpeed",
		value : (point) => 1,
		cost : {
			_1 : 5,
			_2 : 5,
			_3 : 1,
			_4 : 1,
			_5 : 1,
			_6 : 1,
		}
	},
	bloodSelf: {
		name : "Battlefield",
		desc : "Boosts workers' blood growth",
		type : WORLD_POINT_ACTIVE,
		family : "blood",
		blueprint : "blood1",
		radius : 10,
		deadZone : 25,
		reach : 30,
		iconText : "B",
		effect : WORLD_BONUS_ADD_MULT,
		value : (point) => 1,
		stat : "bloodBoost",
		cost : {
			_3 : 15
		}	
	},
	fireSelf: {
		name : "Volcano",
		desc : "Boosts workers' fire growth",
		type : WORLD_POINT_ACTIVE,
		family : "fire",
		blueprint : "fire1",
		radius : 10,
		deadZone : 25,
		reach : 30,
		iconText : "F",
		effect : WORLD_BONUS_ADD_MULT,
		value : (point) => 1,
		stat : "fireBoost",
		cost : {
			_4 : 15
		}	
	},
	iceSelf: {
		name : "Glacier",
		desc : "Boosts workers' ice growth",
		type : WORLD_POINT_ACTIVE,
		family : "ice",
		blueprint : "ice1",
		radius : 10,
		deadZone : 25,
		reach : 30,
		iconText : "I",
		effect : WORLD_BONUS_ADD_MULT,
		value : (point) => 1,
		stat : "iceBoost",
		cost : {
			_5 : 15
		}	
	},
	metalSelf: {
		name : "Scrapyard",
		desc : "Boosts workers' metal growth",
		type : WORLD_POINT_ACTIVE,
		family : "metal",
		blueprint : "metal1",
		radius : 10,
		deadZone : 25,
		reach : 30,
		iconText : "M",
		effect : WORLD_BONUS_ADD_MULT,
		value : (point) => 1,
		stat : "metalBoost",
		cost : {
			_6 : 15
		}	
	},
	manaPool: {
		name : "Mana pool",
		desc : "Multiplies mana production",
		type : WORLD_POINT_ACTIVE,
		family : "imprint",
		blueprint : "mana1",
		radius : 15,
		deadZone : 25,
		reach : 45,
		iconText : "✨\uFE0E",
		effect : WORLD_BONUS_MUL,
		value : (point) => 1 + 2 ** (0.5 - point.depth / 2),
		stat : "manaSpeed",
		cost : {
			_3 : 4,
			_4 : 4,
			_5 : 4,
			_6 : 4
		}
	},
	stabilizer: {
		name : "Stabilizer",
		desc : "Supports one extra summon",
		type : WORLD_POINT_ACTIVE,
		family : "summon",
		blueprint : "summon1",
		radius : 10,
		deadZone : 20,
		reach : 25,
		iconText : "S",
		effect : WORLD_BONUS_ADD,
		value : (point) => 1,
		stat : "maxSummons",
		cost : {
			_1 : 4,
			_2 : 4,
			_3 : 2,
			_4 : 2,
			_5 : 2,
			_6 : 2
		}
	},
	charger: {
		name : "Thunder station",
		desc : "Multiplies Mean machine damage",
		type : WORLD_POINT_ACTIVE,
		family : "summon",
		blueprint : "mean1",
		radius : 5,
		deadZone : 35,
		reach : 40,
		iconText : "T",
		effect : WORLD_BONUS_MUL,
		value : (point) => 1 + 2 ** (0.5 - point.depth / 2),
		stat : "meanBoost",
		cost : {
			_1 : 5,
			_2 : 5,
			_3 : 8,
			_4 : 8,
			_5 : 8,
			_6 : 8
		}
	},
}

Object.keys(WORLD_ELEMENTS).map(x => WORLD_ELEMENTS[x].id = x)