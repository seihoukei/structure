'use strict'

const WORLD_CORE_STAT_TOGGLE = 0
const WORLD_CORE_STAT_VALUE = 1

const WORLD_CORE_STATS = {
	fireShare : {
		name: "Shared fire growth",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	metalShare : {
		name: "Shared metal growth",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	iceShare : {
		name: "Shared ice growth",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	bloodShare : {
		name: "Shared blood growth",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	spiritElements : {
		name : "Spirit x Clouds boost to elements",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	powerCap : {
		name: "Power multiplier cap x",
		type: WORLD_CORE_STAT_VALUE,
		default: 1e15
	},
	elementalCap : {
		name: "Elemental multiplier cap x",
		type: WORLD_CORE_STAT_VALUE,
		default: 1e15
	},
	channelBase : {
		name: "Channelling efficiency boost",
		type: WORLD_CORE_STAT_VALUE,
		default : 1		
	},
	boostCost : {
		name: "Growth boost cost multiplier",
		type: WORLD_CORE_STAT_VALUE,
		default: 1
	},
	boostMulti : {
		name: "Growth boost multiplier",
		type: WORLD_CORE_STAT_VALUE,
		default: 3
	},
	autoImprint : {
		name: "Imprint nodes automatically",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	finalLayer : {
		name: "World buildings at maximum active depth have effect as if their depth was 1 less",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	superCharge : {
		name: "Capturing a node gives random spirit charge to every slider",
		type: WORLD_CORE_STAT_TOGGLE,
		default: 0
	},
	summonGrowth : {
		name: "Summons boost on levelup increased", 	
		type: WORLD_CORE_STAT_VALUE,
		default : 0
	},
	extraStars : {
		name : "Fully evolved maps produce more stars",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	summonGold : {
		name : "Summons produce gold while attacking",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	summonMana : {
		name : "Summons produce mana while attacking",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	summonClouds : {
		name : "Summons produce clouds while attacking",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	summonScience : {
		name : "Summons produce science while attacking",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	summonThunder : {
		name : "Summons produce thunderstone while attacking",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	summonFears : {
		name : "Summons produce fears while attacking",
		type: WORLD_CORE_STAT_VALUE,
		default : 0		
	},
	goldenMaps : {
		name : "Newly-created current-level virtual maps are very expensive starfields",
		type: WORLD_CORE_STAT_TOGGLE,
		default : 0		
	},
	mapChargeSpeed : {
		name : "Completed focused vmaps produce focused growth at time intervals",
		type : WORLD_CORE_STAT_VALUE,
		default : 0
	},
	evolutionScale : {
		name : "Virtual map evolutions reach farther",
		type : WORLD_CORE_STAT_VALUE,
		default : 0
	},
	pulseSpeed : {
		name : "Pulse speed multiplier",
		type : WORLD_CORE_STAT_VALUE,
		default : 1
	}
	//unimplemented
}

const BASE_WORLD_CORE_STATS = Object.keys(WORLD_CORE_STATS).reduce((v,x) => (v[x]=WORLD_CORE_STATS[x].default, v), {})

const WORLD_CORE_CELLS = {
	"0,0" : {
		name : "Core",
		desc : "The world core",
		iconText : "CORE",
		iconColor : "var(--bg-home)",
	},

	//Shared elements
	"-3,0" : {
		name : "Shared fire",
		desc : "Each real slider gains total fire growth of every slider",
		iconText : "SHFR",
		iconColor : "var(--bg-fire)",
		feat : "elemental1",
		enablers : {
			fireSelf : 3
		},
		cost : {
			_3 : 0.16,
			_5 : 0.16,
			_6 : 0.16,		
		},
		effect : WORLD_BONUS_ADD,
		stat : "fireShare",
		value : 1
	},
	"-3,3" : {
		name : "Shared metal",
		desc : "Each real slider gains total metal growth of every slider",
		iconText : "SHMT",
		iconColor : "var(--bg-metal)",
		feat : "elemental1",
		enablers : {
			metalSelf : 3
		},
		cost : {
			_3 : 0.16,
			_4 : 0.16,
			_5 : 0.16,
		},
		effect : WORLD_BONUS_ADD,
		stat : "metalShare",
		value : 1
	},
	"3,-3" : {
		name : "Shared ice",
		desc : "Each real slider gains total ice growth of every slider",
		iconText : "SHIC",
		iconColor : "var(--bg-ice)",
		feat : "elemental1",
		enablers : {
			iceSelf : 3
		},
		cost : {
			_3 : 0.16,
			_4 : 0.16,
			_6 : 0.16,
		},
		effect : WORLD_BONUS_ADD,
		stat : "iceShare",
		value : 1
	},
	"3,0" : {
		name : "Shared blood",
		desc : "Each real slider gains total blood growth of every slider",
		iconText : "SHBL",
		iconColor : "var(--bg-blood)",
		feat : "elemental1",
		enablers : {
			bloodSelf : 3,
		},
		cost : {
			_4 : 0.16,
			_5 : 0.16,
			_6 : 0.16,
		},
		effect : WORLD_BONUS_ADD,
		stat : "bloodShare",
		value : 1
	},

	"0,-3" : {
		name : "Spirit elements",
		desc : "Spirit x Clouds bonus is added to each element",
		iconText : "SCEM",
		iconColor : "var(--bg-spirit)",
		feat : "null1",
		enablers : {
			manaPool : 3,
			bloodSelf : 3,
			fireSelf : 3,
			iceSelf : 3,
			metalSelf : 3
		},
		cost : {
			_2 : 0.4,
			_3 : 0.25,
			_4 : 0.25,
			_5 : 0.25,
			_6 : 0.25
		},
		effect : WORLD_BONUS_ADD,
		stat : "spiritElements",
		value : 1
	},	
	
	"2,-1" : {
		name : "Power cap boost",
		desc : "Power growth cap doubled",
		iconText : "PCX2",
		iconColor : "var(--bg-power)",
		feat: "power1",
		enablers : {
			goldMine : 6,
			minorConnector : 1
		},
		cost : {
			_1 : 0.3,
			_2 : 0.3,
		},
		effect : WORLD_BONUS_MUL,
		stat : "powerCap",
		value : 2,
	},	
	"-2,1" : {
		name : "Elemental cap boost",
		desc : "Elemental growth cap doubled",
		iconText : "ECX2",
		iconColor : "var(--enchantgrowth)",
		feat: "elemental1",
		enablers : {
			manaPool : 5,
			minorConnector : 1
		},
		cost : {
			_3 : 0.3,
			_4 : 0.3,
			_5 : 0.3,
			_6 : 0.3,
		},
		effect : WORLD_BONUS_MUL,
		stat : "elementalCap",
		value : 2,
	},	
	"0,-2" : {
		name : "Stardust production boost",
		desc : "Fully evolved maps produce more stardust",
		iconText : "SD+2",
		iconColor : "var(--bg-power)",
		feat: "stars1",
		enablers : {
			manaPool : 5,
			imprinter : 5,
		},
		cost : {
			_2 : 0.1,
			_3 : 0.05,
			_4 : 0.05,
			_5 : 0.05,
			_6 : 0.05,
		},
		effect : WORLD_BONUS_ADD,
		stat : "extraStars",
		value : 2,
	},	
	
	"-1,-2" : {
		name : "Summon clouds production",
		desc : "Summons produce clouds while fighting (Additive: cap)",
		iconText : "SMCL",
		iconColor : "var(--enchantgrowth)",
		enablers : {
			stabilizer : 5,
			fireSelf : 3,
			bloodSelf : 3,
			iceSelf : 3, 
			metalSelf : 3
		},
		cost : {
			_2 : 0.1,
			_4 : 0.2,
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonClouds",
		value : 0.1,
	},
	"1,-3" : {
		name : "Summon clouds production",
		desc : "Summons produce clouds while fighting (Additive: cap)",
		iconText : "SMCL",
		iconColor : "var(--enchantgrowth)",
		enablers : {
			stabilizer : 5,
			fireSelf : 3,
			bloodSelf : 3,
			iceSelf : 3, 
			metalSelf : 3
		},
		cost : {
			_2 : 0.1,
			_5 : 0.2,
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonClouds",
		value : 0.1,
	},
	"-2,-1" : {
		name : "Summon gold production",
		desc : "Summons produce gold while fighting (Additive: cap)",
		iconText : "SMGL",
		iconColor : "var(--enchantgold)",
		enablers : {
			stabilizer : 5,
			goldMine : 10,
		},
		cost : {
			_4 : 0.2,
			_6 : 0.05
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonGold",
		value : 1,
	},
	"2,1" : {
		name : "Summon gold production",
		desc : "Summons produce gold while fighting (Additive: cap)",
		iconText : "SMGL",
		iconColor : "var(--enchantgold)",
		enablers : {
			stabilizer : 5,
			goldMine : 10,
		},
		cost : {
			_5 : 0.2,
			_3 : 0.05
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonGold",
		value : 1,
	},
	"-3,1" : {
		name : "Summon mana production",
		desc : "Summons produce mana while fighting (Additive: cap)",
		iconText : "SMMN",
		iconColor : "var(--enchantmana)",
		enablers : {
			stabilizer : 5,
			manaPool : 7,
		},
		cost : {
			_4 : 0.15,
			_6 : 0.1
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonMana",
		value : 1,
	},
	"3,-1" : {
		name : "Summon mana production",
		desc : "Summons produce mana while fighting (Additive: cap)",
		iconText : "SMMN",
		iconColor : "var(--enchantmana)",
		enablers : {
			stabilizer : 5,
			manaPool : 7,
		},
		cost : {
			_5 : 0.15,
			_3 : 0.1
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonMana",
		value : 1,
	},
	"-3,2" : {
		name : "Summon science production",
		desc : "Summons produce science while fighting (Additive: cap)",
		iconText : "SMSC",
		iconColor : "var(--enchantdoom)",
		enablers : {
			stabilizer : 5,
			library : 6,
		},
		cost : {
			_4 : 0.1,
			_6 : 0.15
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonScience",
		value : 1,
	},
	"3,-2" : {
		name : "Summon science production",
		desc : "Summons produce science while fighting (Additive: cap)",
		iconText : "SMSC",
		iconColor : "var(--enchantdoom)",
		enablers : {
			stabilizer : 5,
			library : 6,
		},
		cost : {
			_5 : 0.1,
			_3 : 0.15
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonScience",
		value : 1,
	},
	"-2,3" : {
		name : "Summon thunderstone production",
		desc : "Summons produce thunderstone while fighting (Additive: cap)",
		iconText : "SMTH",
		iconColor : "var(--artifact-active)",
		enablers : {
			stabilizer : 5,
			charger : 5
		},
		cost : {
			_4 : 0.05,
			_6 : 0.2
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonThunder",
		value : 0.2,
	},
	"2,-3" : {
		name : "Summon thunderstone production",
		desc : "Summons produce thunderstone while fighting (Additive: cap)",
		iconText : "SMTH",
		iconColor : "var(--artifact-active)",
		enablers : {
			stabilizer : 5,
			charger : 5
		},
		cost : {
			_5 : 0.05,
			_3 : 0.2
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonThunder",
		value : 0.2,
	},
	"-1,3" : {
		name : "Summon fears production",
		desc : "Summons produce fears while fighting (Additive: cap)",
		iconText : "SMFR",
		iconColor : "var(--tablet-absent)",
		enablers : {
			stabilizer : 5,
			minorConnector : 2
		},
		cost : {
			_2 : 0.1,
			_6 : 0.2
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonFears",
		value : 0.1,
	},
	"1,2" : {
		name : "Summon fears production",
		desc : "Summons produce fears while fighting (Additive: cap)",
		iconText : "SMFR",
		iconColor : "var(--tablet-absent)",
		enablers : {
			stabilizer : 5,
			minorConnector : 2
		},
		cost : {
			_2 : 0.1,
			_3 : 0.2
		},
		feat : "summonLevel9",
		effect : WORLD_BONUS_ADD,
		stat : "summonFears",
		value : 0.1,
	},
	"-1,2" : {
		name : "Starfields",
		desc : "Newly-created current-level virtual maps are very expensive starfields",
		iconText : "VMST",
		iconColor : "var(--enchantgrowth)",
		feat : "memories1",
		enablers : {
			minusConnector : 2
		},
		cost : {
			_1 : 0.5,
			_2 : 0.5,
		},
		effect : WORLD_BONUS_ADD,
		stat : "goldenMaps",
		value : 1,
	},	
	"-2,2" : {
		name : "Charged virtual maps",
		desc : "Completed focused virtual maps charge to provide extra growth in focused attribute (Additive: speed)",
		iconText : "VMCH",
		iconColor : "var(--shade10)",
		feat : "speedrun1",
		enablers : {
			fireSelf : 7,
			bloodSelf : 7,
		},
		cost : {
			_5 : 0.25,
			_6 : 0.1
		},
		effect : WORLD_BONUS_ADD,
		stat : "mapChargeSpeed",
		value : 250,
	},	
	"-2,0" : {
		name : "Charged virtual maps",
		desc : "Completed focused virtual maps charge to provide extra growth in focused attribute (Additive: speed)",
		iconText : "VMCH",
		iconColor : "var(--shade10)",
		feat : "speedrun1",
		enablers : {
			iceSelf : 7,
			metalSelf : 7,
		},
		cost : {
			_3 : 0.25,
			_4 : 0.1
		},
		effect : WORLD_BONUS_ADD,
		stat : "mapChargeSpeed",
		value : 250,
	},	
	"2,-2" : {
		name : "Charged virtual maps",
		desc : "Completed focused virtual maps charge to provide extra growth in focused attribute (Additive: speed)",
		iconText : "VMCH",
		iconColor : "var(--shade10)",
		feat : "speedrun1",
		enablers : {
			fireSelf : 7,
			bloodSelf : 7,
		},
		cost : {
			_6 : 0.25,
			_5 : 0.1
		},
		effect : WORLD_BONUS_ADD,
		stat : "mapChargeSpeed",
		value : 250,
	},	
	"2,0" : {
		name : "Charged virtual maps",
		desc : "Completed focused virtual maps charge to provide extra growth in focused attribute (Additive: speed)",
		iconText : "VMCH",
		iconColor : "var(--shade10)",
		feat : "speedrun1",
		enablers : {
			iceSelf : 7,
			metalSelf : 7,
		},
		cost : {
			_4 : 0.25,
			_3 : 0.1
		},
		effect : WORLD_BONUS_ADD,
		stat : "mapChargeSpeed",
		value : 250,
	},	

	"0,2" : {
		name : "Autoimprint",
		desc : "Imprintable nodes start imprinting as soon as possible",
		iconText : "ATIM",
		iconColor : "var(--shade8)",
		enablers : {
			imprinter : 6,
		},
		cost : {
			_1 : 0.1,
			_2 : 0.1,
			_3 : 0.05,
			_4 : 0.05,
			_5 : 0.05,
			_6 : 0.05
		},
		feat : "same2",
		effect : WORLD_BONUS_ADD,
		stat : "autoImprint",
		value : 1,
	},	
	"-1,-1" : {
		name : "Evolutional reach",
		desc : "Virtual map evolutions reach farther",
		iconText : "EVDS",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.05,
			_2 : 0.05,
			_3 : 0.05,
			_4 : 0.05,
			_5 : 0.05,
			_6 : 0.05,
		},
		enablers : {
			minorConnector : 1,
			minusConnector : 1
		},
		feat : "same3",
		effect : WORLD_BONUS_ADD,
		stat : "evolutionScale",
		value : 0.5,
	},	

	"1,-2" : {
		name : "Improved final layer",
		desc : "Last active depth nodes are treated as depth-1",
		iconText : "FLDD",
		iconColor : "var(--shade10)",
		enablers : {
			minorConnector : 3,
		},
		cost : {
			_1 : 0.1,
			_2 : 0.1,
		},
		feat : "same1",
		effect : WORLD_BONUS_ADD,
		stat : "finalLayer",
		value : 1,
	},	
	//featless so far	
	"0,3" : {
		name : "Supercharger",
		desc : "Sliders get random spirit charge boost whenever a point is captured",
		iconText : "SSCH",
		iconColor : "var(--bg-spirit)",
		enablers : {
			charger : 3,
		},
		cost : {
			_2 : 0.2,
		},
		effect : WORLD_BONUS_ADD,
		stat : "superCharge",
		value : 1,
	},	
	
	"0,-1" : {
		name : "Channel effect bonus",
		desc : "Channelling is 50% more effective (Multiplicative)",
		iconText : "CHEF",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.02,
			_2 : 0.02,
			_3 : 0.02,
			_4 : 0.02,
			_5 : 0.02,
			_6 : 0.02,
		},
		effect : WORLD_BONUS_MUL,
		stat : "channelBase",
		value : 1.5,
	},	
	"0,1" : {
		name : "Channel effect bonus",
		desc : "Channelling is 50% more effective (Multiplicative)",
		iconText : "CHEF",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.04,
			_2 : 0.04,
			_3 : 0.01,
			_4 : 0.01,
			_5 : 0.01,
			_6 : 0.01,
		},
		effect : WORLD_BONUS_MUL,
		stat : "channelBase",
		value : 1.5,
	},	
	
	"1,-1" : {
		name : "Boost multiplier bonus",
		desc : "Increases growth boost multiplier by 1 (Additive)",
		iconText : "BM+1",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.03,
			_2 : 0.03,
			_3 : 0.01,
			_4 : 0.01,
			_5 : 0.01,
			_6 : 0.01,
		},
		effect : WORLD_BONUS_ADD,
		stat : "boostMulti",
		value : 1,
	},	
	"-1,0" : {
		name : "Boost multiplier bonus",
		desc : "Increases growth boost multiplier by 1 (Additive)",
		iconText : "BM+1",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.01,
			_2 : 0.01,
			_3 : 0.03,
			_4 : 0.03,
			_5 : 0.03,
			_6 : 0.03,
		},
		effect : WORLD_BONUS_ADD,
		stat : "boostMulti",
		value : 1,
	},	
	"1,0" : {
		name : "Cheaper boost",
		desc : "Boosting growth cost 25% cheaper (Additive)",
		iconText : "BC-Q",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.03,
			_2 : 0.03,
			_3 : 0.01,
			_4 : 0.01,
			_5 : 0.01,
			_6 : 0.01,
		},
		effect : WORLD_BONUS_ADD,
		stat : "boostCost",
		value : -0.25,
	},	
	"-1,1" : {
		name : "Cheaper boost",
		desc : "Boosting growth cost 25% cheaper (Additive)",
		iconText : "BC-Q",
		iconColor : "var(--shade10)",
		cost : {
			_1 : 0.01,
			_2 : 0.01,
			_3 : 0.03,
			_4 : 0.03,
			_5 : 0.03,
			_6 : 0.03,
		},
		effect : WORLD_BONUS_ADD,
		stat : "boostCost",
		value : -0.25,
	},	
	"1,1" : {
		name : "Summon growth",
		desc : "Summons grow much stronger on levelup",
		iconText : "SMLV",
		iconColor : "var(--shade10)",
		cost : {
			_3 : 0.1,
			_4 : 0.1,
			_5 : 0.1,
			_6 : 0.1,
		},
		enablers : {
			stabilizer : 10
		},
		effect : WORLD_BONUS_ADD,
		stat : "summonGrowth",
		value : 0.9,
	},	
}

Object.keys(WORLD_CORE_CELLS).map(x => {
	WORLD_CORE_CELLS[x].id = x
	if (WORLD_CORE_CELLS[x].iconText.length == 4)
		WORLD_CORE_CELLS[x].iconText = WORLD_CORE_CELLS[x].iconText.slice(0,2)+"\n"+WORLD_CORE_CELLS[x].iconText.slice(2,4)
})