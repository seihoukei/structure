'use strict'

const FEATS = {
	science1: {
		desc : "Complete 35 researches.",
		map : 31
	},
	mana1: {
		desc: "10000000000000. Okay, reading that number correctly is a feat already, but you also need that much mana.",
		map : 31
	},
	blood1: {
		desc : "Complete evolved blood-focused virtual map.",
		minMap : 31,
		map : 32
	},
	fire1: {
		desc : "Complete evolved fire-focused virtual map.",
		minMap : 31,
		map : 32
	},
	ice1: {
		desc : "Complete evolved ice-focused virtual map.",
		minMap : 31,
		map : 32
	},
	metal1: {
		desc : "Complete evolved metal-focused virtual map.",
		minMap : 31,
		map : 32
	},
	noreal1 : {
		desc: "Complete evolved virtual map without capturing a single node with real slider.",
		minMap : 31,
		map : 33
	},
	noabsolute1 : {
		desc: "Complete evolved virtual map without using mean machines and unblockable damage from artifacts.",
		minMap : 31,
		map : 33
	},
	power1: {
		desc: "Ever heard of billiards? Well, you need power mutliplier equal to what some people would call a billiard. ",
		map : 34
	},
	summonLevel9 : {
		desc: "Get a level 9 summon.",
		minMap : 34,
		map : 34
	},
	same0 : {
		desc: "Complete a virtual map same level as real one.",
		minMap : 36,
		map : 36
	},
	same1 : {
		desc: "Complete an evolved virtual map same level as real one.",
		minMap : 36,
		map : 36
	},
	same2 : {
		desc: "Complete a virtual map same level as real one evolved twice.",
		minMap : 36,
		map : 36
	},
	same3 : {
		desc: "Complete a third evolution of a virtual map same level as real one.",
		minMap : 36,
		map : 36
	},
	elemental1 : {
		desc: "Reach multiplier cap for all elements.",
		map : 37
	},
	null1 : {
		desc: "Beat a spirit-focused virtual map using only a single slider with Staff of suppression equipped to it.",
		minMap : 38,
		map : 38
	},
	mistery1 : {
		desc : "???",
		map : 100,
		minMap : 39
	},
	stars1 : {
		desc : "Get stardust production up to 15 / sec",
		map : 38,
		minMap : 38
	},
	memories1 : {
		desc : "Get at least 1000 of each kind of memory",
		minMap : 39,
		map : 39,
	},
	speedrun1 : {
		desc : "Complete a virtual map in under 15 minutes",
		minMap : 39,
		map : 39,
	},
}

Object.keys(FEATS).map(x => FEATS[x].id = x)
