'use strict'

const WORLD_POINT_ACTIVE = 0
const WORLD_POINT_PASSIVE = 1

const WORLD_ELEMENTS = {
	goldMine: {
		name : "Gold mine",
		desc : "Produces gold",
		type : WORLD_POINT_ACTIVE,
		radius : 5,
		reach : 15,
		cost : {
			_1 : 2,
			_2 : 2,
		},
		upgradeCost : {
			_1 : {
				base : 1,
				add : 1,
			},
		},
		iconText : "⛏\uFE0E"
	},
	imprinter: {
		name : "Memory pool",
		desc : "Speeds up imprinting",
		type : WORLD_POINT_PASSIVE,
		radius : 5,
		reach : 15,
		cost : {
			_1 : 4,
			_2 : 4,
			_3 : 1,
			_4 : 1,
			_5 : 1,
			_6 : 1,
		},
		upgradeCost : {
			_3 : 1,
			_4 : 1,
			_5 : 1,
			_6 : 1,
		},
		iconText : "M",
	},
}