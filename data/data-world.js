'use strict'

const WORLD_POINT_CORE = 0
const WORLD_POINT_ACTIVE = 1
const WORLD_POINT_PASSIVE = 2

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
		desc : "Doubles mining speed",
		type : WORLD_POINT_PASSIVE,
		family : "resource",
		radius : 5,
		deadZone : 10,
		reach : 20,
		cost : {
			_1 : 3,
			_2 : 3,
		},
		iconText : "⛏\uFE0E"
	},
	imprinter: {
		name : "Memory pool",
		desc : "Doubles imprinting speed",
		type : WORLD_POINT_PASSIVE,
		family : "imprint",
		radius : 5,
		reach : 25,
		deadZone : 15,
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
		cost : {
			_3 : 15
		}	
	},
	fireSelf: {
		name : "Volcano",
		desc : "Boosts workers' metal growth",
		type : WORLD_POINT_ACTIVE,
		family : "fire",
		blueprint : "fire1",
		radius : 10,
		deadZone : 25,
		reach : 30,
		iconText : "F",
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
		cost : {
			_6 : 15
		}	
	},
}

Object.keys(WORLD_ELEMENTS).map(x => WORLD_ELEMENTS[x].id = x)