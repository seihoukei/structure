'use strict'

const FEATS = {
	science1: {
		desc : "Complete 35 researches",
		map : 31
	},
	blood1: {
		desc : "Complete evolved blood-focused firtual map",
		map : 32
	},
	fire1: {
		desc : "Complete evolved fire-focused firtual map",
		map : 32
	},
	ice1: {
		desc : "Complete evolved ice-focused firtual map",
		map : 32
	},
	metal1: {
		desc : "Complete evolved metal-focused firtual map",
		map : 32
	},
	mana1: {
		desc: "Accumulate 10000000000000 (that's 13 zeroes, Ive counted. twice.) mana",
		map : 31
	},
	noreal1 : {
		desc: "Complete evolved virtual map without capturing a single node with real slider",
		map : 33
	},
	noabsolute1 : {
		desc: "Complete evolved virtual map without using mean machines and unblockable damage from aftifacts",
		map : 33
	},
}

Object.keys(FEATS).map(x => FEATS[x].id = x)