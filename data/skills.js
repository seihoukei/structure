'use strict'

const SKILLS = {
	autoTarget: {
		name: "Hunting high and low",
		desc: "Sliders choose new targets after capturing a point",
		map : 1,
		mult : 5,
		exp : 500
	},
	sensor: {
		name: "Over the hills and far away",
		desc: "Ability to sense surrounding points",
		map : 1,
		mult : 1.2,
		exp : 500
	},
	mining: {
		name: "The deep & the dark",
		desc: "Ability to mine gold at starting point",
		map : 2,
		mult: 2,
		exp : 500
	},
	charge: {
		name: "ReLoad",
		desc: "Ability to charge spirit by resting",
		map : 3,
		mult : 2,
		exp : 2500
	},
	autoTargetFilter: {
		name: "Destination set to nowhere",
		desc: "Set basic priorities for autotargetting",
		req : ["autoTarget"],
		map : 3,
		mult : 1.5,
		exp : 2500
	},
	invest: {
		name: "No sacrifice, no victory",
		desc: "Ability to use growth for experience",
		map : 3,
		mult : 10,
		exp : 7500
	},
	autoTargetSelector: {
		name: "Journey of souls",
		desc: "Add advanced priorities for autotargetting",
		map : 5,
		req : ['autoTargetFilter'],
		mult: 1.5,
		exp : 10000
	},
	learn: {
		name: "Show me how to live",
		desc: "Ability to triple the attribute growth for the growth worth of experience",
		sliders : 2,
		req : ['invest'],
		mult: 3,
		exp : 55555.55556
	},
	upgradePoints: {
		name: "Symphony of enchanted lands",
		desc: "Ability to upgrade captured points",
		map : 7,
		mult: 2,
		exp : 92592.592593
	},
	fire: {
		name: "Through the fire and flames",
		desc: "Fire damage ignores spirit penalty",
		map : 8,
		mult: 3,
		exp : 200000
	},
	build1: {
		name: "Megatropolis",
		desc: "Ability to build at level 1 points",
		map : 9,
		req : ['upgradePoints'],
		mult: 2,
		exp : 3086419.75308644
	},
	autoTargetElements: {
		name: "Elements, pt.1",
		desc: "Add elements to autotargetting priorities",
		map : 11,
		req : ['autoTargetFilter'],
		mult: 1.5,
		exp : 15432098.7654323
	},
	channel: {
		name: "Battle hymns",
		desc: "Ability to channel attributes to other sliders instead of growing",
		mult: 2,
		exp : 257201646.09053498,
		sliders : 3
	},
	management: {
		name: "Kingmaker",
		desc: "Manage captured points all in one place",
		req : ['upgradePoints'],
		map : 12,
		mult: 1.2,
		exp : 128600823.0452675,
		science : 100000
	},
	ice : {
		name: "Iced earth",
		desc: "Ice damage ignores spirit penalty",
		map : 12,
		mult: 2.5, 
		exp : 1286008230.452675
	},
	build2 : {
		name: "Megatropolis 2.0",
		desc: "Unlock level 2 buildings",
		map : 12,
		mult: 5, 
		exp : 1286008230.452675,
		req : ['upgradePoints'],
		science : 150000
	},
	greed : {
		name: "Power gold",
		desc: "Gold factories produce more gold",
		map : 13,
		mult: 1.3, 
		exp : 1286008230.452675,
		req : ['build1'],
		onGet: () => game.production.gold *= game.map.level ** 2 / 16.9,
		science : 300000
	},
	fear : {
		name : "Reign of fear",
		desc : "Spirit multiplied by fear is added to sliders power",
		map : 14,
		mult : 2.4,
		exp : 98923710034.82115 / 3,
		req : ['build2'],
		res : ['fears'],
		science : 750000
	},
	automation: {
		name : "The grand design",
		desc : "Unlock point levelup automation",
		map : 15,
		mult : 3,
		exp : 12860082304.52675,
		req : ["management"],
		science : 1e6
	},
	stardust: {
		name: "Ride the sky",
		desc: "Use stardust to grow elements 100% faster for each cloud",
		map : 15,
		mult : 5,
		req : ['build2'],
		res : ['clouds', 'stardust'],
		exp : 98923710034.82115 / 3,
		science : 1200000
	},
	magic: {
		name: "Heroes of mighty magic",
		desc: "Unlocks the whole new world of magic",
		map : 16,
		mult : 2,
		sliders : 4,
		exp : 98923710034.82115,
	},
	magicBoost1: {
		name: "Magic kingdom",
		desc: "Level 1 buildings production boosted within magic circle",
		map : 16,
		mult : 3,
		req : ["magic"],
		exp : 2e10,
		science : 1.5e6,
	},
	buildAutomation: {
		name : "Built to last",
		desc : "Unlock building automation",
		map : 16,
		mult : 3,
		exp : 2e10,
		req : ["management"],
		science : 2e6
	},
	autoTargetDistance: {
		name: "Far from the end of the world",
		desc: "Set distance-based priorities for autotargetting",
		req : ["autoTargetSelector"],
		map : 17,
		mult : 1.5,
		exp : 2e10,
		science : 3e6,
	},
	imbuement: {
		name: "Elements, pt.2",
		desc: "Use mana to imbue power with element",
		req : ["magic"],
		map : 17,
		mult: 2,
		science : 5e6,
		exp : 2e10
	},
	blood: {
		name: "Halo of blood",
		desc: "Blood damage ignores spirit penalty",
		map : 17,
		mult : 2,
		exp : 2e10,
	},
	metal: {
		name: "Metal mass",
		desc: "Metal damage ignores spirit penalty",
		map : 17,
		mult : 2,
		exp : 2e10,
	},
	magicGrowthBoost: {
		name: "Magic forest",
		desc: "Elemental growth bonus boosted within magic circle",
		map : 18,
		mult : 3,
		req : ["magic"],
		exp : 2e10,
		science : 30e6,
	},
	build3: {
		name: "Tomorrowland",
		desc: "Unlock level 3 buildings",
		req : ["build2"],
		map : 19,
		mult: 2,
		science : 100e6,
		exp : 2e10
	},
	pierceResist: {
		name : "Witchbane", //rename
		desc : "Remove spirit penalty from points with elemental resistance",
		map : 50,
		mult : 2,
		exp : 2e10
	},
	modifyPoints: {
		name: "Paint it black",
		desc: "Ability to convert point types",
		map : 50,
		mult : 2,
		exp : 1e16
	}
}

Object.keys(SKILLS).map(x => SKILLS[x].id = x)
