'use strict'

const FEATS = {
	science1: {
		desc : "Complete 35 researches.",
		map : 31
	},
	blood1: {
		desc : "Complete evolved blood-focused virtual map.",
		map : 32
	},
	fire1: {
		desc : "Complete evolved fire-focused virtual map.",
		map : 32
	},
	ice1: {
		desc : "Complete evolved ice-focused virtual map.",
		map : 32
	},
	metal1: {
		desc : "Complete evolved metal-focused virtual map.",
		map : 32
	},
	mana1: {
		desc: "10000000000000. Okay, reading that number correctly is a feat already, but you also need that much mana.",
		map : 31
	},
	power1: {
		desc: "Ever heard of billiards? Well, you need power mutliplier equal to what some people would call a billiard. ",
		map : 34
	},
	noreal1 : {
		desc: "Complete evolved virtual map without capturing a single node with real slider.",
		map : 33
	},
	noabsolute1 : {
		desc: "Complete evolved virtual map without using mean machines and unblockable damage from artifacts.",
		map : 33
	},
	summonLevel9 : {
		desc: "Get a level 9 summon.",
		map : 34
	},
	same0 : {
		desc: "Complete a virtual map same level as real one.",
		map : 36
	},
	same1 : {
		desc: "Complete an evolved virtual map same level as real one.",
		map : 36
	},
	same2 : {
		desc: "Complete a virtual map same level as real one evolved twice.",
		map : 36
	},
	same3 : {
		desc: "Complete a third evolution of a virtual map same level as real one.",
		map : 36
	},
}

Object.keys(FEATS).map(x => FEATS[x].id = x)