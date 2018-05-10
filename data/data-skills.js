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
		res : ['science'],
		map : 9,
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
	},
	greed : {
		name: "Power gold",
		desc: "Gold factories produce more gold",
		map : 13,
		mult: 1.3, 
		exp : 1286008230.452675,
		req : ['build1'],
		onGet: () => game.production.gold *= game.realMap.level ** 2 / 16.9,
	},
	fear : {
		name : "Reign of fear",
		desc : "Spirit multiplied by fear is added to sliders power",
		map : 14,
		mult : 2.4,
		exp : 98923710034.82115 / 3,
		req : ['build2'],
		res : ['fears'],
	},
	automation: {
		name : "The grand design",
		desc : "Unlock point levelup automation",
		map : 9,
		mult : 3,
		exp : 12860082304.52675,
		req : ["management"],
		res : ['science'],
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
	},
	smartHome: {
		name: "Home at last",
		desc: "Sliders unable to find a target go to mine automatically",
		req : ["autoTarget"],
		res : ['science'],
		map : 9,
		mult : 1.1,
		exp : 2e10,
		science : 1.75e6,
	},
	smartMine: {
		name: "Little look back",
		desc: "Mining sliders keep checking for new available targets",
		req : ["smartHome"],
		res : ['science'],
		map : 9,
		mult : 1.0,
		exp : 2e10,
		science : 2e6,
	},
	buildAutomation: {
		name : "Built to last",
		desc : "Unlock building automation",
		map : 9,
		mult : 3,
		exp : 2e10,
		req : ["management"],
		res : ['science'],
		science : 2.5e6
	},
	smartAuto: {
		name: "Walk away in silence",
		desc: "Sliders change target when dealing no damage and avoid such strong points when autotargetting",
		req : ["autoTarget", "mining"],
		res : ['science'],
		map : 9,
		mult : 1.1,
		exp : 2e10,
		science : 1e7,
	},
	autoTargetDistance: {
		name: "Far from the end of the world",
		desc: "Set distance-based priorities for autotargetting",
		req : ["smartAuto","autoTargetSelector"],
		res : ['science'],
		map : 9,
		mult : 1.5,
		exp : 2e10,
		science : 1e10,
	},
	imbuement: {
		name: "Elements, pt.2",
		desc: "Use mana to imbue power with element",
		req : ["magic"],
		map : 17,
		mult: 4,
		exp : 4e12
	},
	blood: {
		name: "Halo of blood",
		desc: "Blood damage ignores spirit penalty",
		map : 17,
		mult : 2,
		exp : 2e11,
	},
	metal: {
		name: "Metal mass",
		desc: "Metal damage ignores spirit penalty",
		map : 17,
		mult : 2,
		exp : 2e11,
	},
	magicGrowthBoost: {
		name: "Magic forest",
		desc: "Elemental growth bonus boosted within magic circle",
		map : 18,
		mult : 3,
		req : ["magic"],
		exp : 4e12,
	},
	gild: {
		name: "Golden Dawn",
		desc: "Sliders produce gold by fighting and spending mana",
		map : 18,
		mult : 1.5,
		req : ["magic"],
		exp : 2e12,
	},
	build3: {
		name: "Tomorrowland",
		desc: "Unlock level 3 buildings",
		req : ["build2"],
		map : 19,
		mult: 2,
		exp : 1e13
	},
	power: {
		name: "Absolute power",
		desc: "Physical attack ignores spirit penalty",
		map : 21,
		mult: 2,
		exp : 1e17
	},
	spellcasting : {
		name: "Secrets of the Magick Grimoire",
		desc: "Ability to learn and cast spells",
		sliders : 5,
		mult : 2,
		exp : 1e18
	},
	book_summons1 : {
		name: "The warrior's spell",
		desc: "Spellbook - Summon clones to attack chosen point",
		req : ["spellcasting"],
		science : 10e12,
		exp : 1e19,
		mult : 1,
	},
	virtualMaps: {
		name : "Virtual empire",
		desc : "Use stardust to create and explore virtual maps",
		map : 22,
		mult : 2,
		exp : 2e20
	},
	book_dispels1 : {
		name: "Breaking the law",
		desc: "Spellbook - Break protected point shields",
		req : ["spellcasting"],
		map : 23,
		science : 30e12,
		exp : 1e19,
		mult : 1,
	},
	build4: {
		name : "Angry machines",
		desc : "Build at level 4 points",
		map : 24,
		mult : 3,
		exp : 1e22
	},
	book_enchantments1: {
		name : "Symphony of enchanted lands II",
		desc : "Spellbook - Use mana to enchant captured points",
		map : 25,
		req : ["spellcasting"],
		science : 1e14,
		exp : 2e21,
		mult : 1		
	},
	masterSlider : {
		name : "The art of war",
		desc : "Add tools to control all sliders at once",
		req : ["channel", "imbuement", "gild"],
		sliders : 4,
		science : 2e14,
		exp : 1e18,
		mult : 1.05
	},
	magicManagement : {
		name : "Wishmaster",
		desc : "Add magic elements to management",
		req : ["book_enchantments1", "management"],
		science : 4e14,
		exp : 1e22,
		mult : 1.5
	},
	massEnchant : {
		name : "Every last thing",
		desc : "Add mass enchantment to management",
		req : ["magicManagement"],
		science : 6.5e14,
		exp : 1e22,
		mult : 1.5
	},
	smartSummons : {
		name : "For those who walk the path forlorn",
		desc : "Summons choose new target in a more smart way",
		req : ["book_summons1"],
		science : 3e14,
		map : 27,
		exp : 1e22,
		mult : 1.1
	},
	artifacts: {
		name : "Hidden treasure",
		desc : "Research artifacts found during mining",
		sliders : 6,
		mult : 2,
		exp : 5e22
	},
	virtualMapFocus: {
		name : "Heavenseeker",
		desc : "Create virtual maps focused on specific attribute",
		map : 26,
		mult : 2,
		exp : 5e22
	},
	retainVirtualBonus: {
		name : "Beyond reality",
		desc : "Retain virtual map bonuses when deleting them",
		map : 27,
		mult : 2,
		exp : 2e22
	},
	book_summons2 : {
		name: "Master of puppets",
		desc: "Spellbook - Summon specific elementals to attack chosen point",
		req : ["spellcasting"],
		map : 27,
		science : 2e14,
		exp : 1e19,
		mult : 1,
	},
	book_enchantments2: {
		name : "Into the enchanted chamber",
		desc : "Spellbook - More enchantments for points",
		map : 28,
		req : ["book_enchantments1","spellcasting"],
		science : 5e14,
		exp : 2e20,
		mult : 1.5
	},
	book_dispels2 : {
		name: "Break the silence",
		desc: "Spellbook - Break advanced point shields",
		req : ["spellcasting"],
		map : 28,
		science : 6e14,
		exp : 2e19,
		mult : 1.5,
	},
	book_unlocks1 : {
		name: "Keeper of the seven keys",
		desc: "Spellbook - Unlock all the ways from chosen point",
		req : ["spellcasting"],
		map : 28,
		science : 1e15,
		exp : 2e19,
		mult : 1.5,
	},
	spiritStar : {
		name : "Stargazer",
		desc : "Spirit growth is boosted by stars times stardust",
		map : 28,
		exp : 2e28,
		mult : 2
	},
	sliderLevels : {
		name : "Evolution 4.0",
		desc : "Invest experience into levelling up sliders",
		map : 29,
		exp : 1e30,
		mult : 5.203
	},
	smartTablet : {
		name : "Carved in stone",
		desc : "Smart input for artifact research",
		req : ["artifacts"],
		map : 29,
		exp : 1e28,
		science : 5e14,
		mult : 2
	},
	party : {
		name : "As one",
		desc : "Assign leader and follower roles to sliders to form teams",
		map : 30,
		exp : 1e30,
		mult : 2
	},
	imprint : {
		name : "Memories of a time to come",
		desc : "Imprint nodes information in your memory",
		req : ["build4"],
		sliders : 7,
		science : 7.5e14,
		exp : 1e30,
		mult : 2
	},
	virtualImprint : {
		name : "Memories of a dream",
		desc : "Imprint stardust nodes from current-level virtual maps",
		req : ["imprint"],
		science : 8.5e14,
		map : 33,
		exp : 1e30,
		mult : 2
	},
	world : {
		name : "Brave new world",
		desc : "Build a new world based on your memories",
		req : ["imprint"],
		map : 31,
		res : ["_1","_2","_3","_4","_5","_6"],
		exp : 1e30,
		mult : 2
	},
	evolveVirtual : {
		name : "Land beyond the edge",
		desc : "Evolve completed virtual maps of level 31 and above",
		req : ["virtualMaps"],
		map : 32,
		exp : 1e30,
		mult : 2
	},
	levelSummons : {
		name : "Rising force",
		desc : "Summons gain a level and build up strength upon capturing a point",
		req : ["smartSummons"],
		map : 34,
		exp : 1e30,
		mult : 2
	},

	world_blood1 : {
		name : "Upon haunted battlefields",
		desc : "Blueprint - Battlefield",
		req : ["world"],
		feat : "blood1",
		exp : 0,
		mult : 2
	},
	world_science1 : {
		name : "Rise of the wise",
		desc : "Blueprint - Library",
		req : ["world"],
		feat : "science1",
		exp : 0,
		mult : 2
	},
	world_fire1 : {
		name : "Forged in fire",
		desc : "Blueprint - Volcano",
		req : ["world"],
		feat : "fire1",
		exp : 0,
		mult : 2
	},
	world_ice1 : {
		name : "World of ice",
		desc : "Blueprint - Glacier",
		req : ["world"],
		feat : "ice1",
		exp : 0,
		mult : 2
	},
	world_metal1 : {
		name : "Metallic tragedy",
		desc : "Blueprint - Scrapyard",
		req : ["world"],
		feat : "metal1",
		exp : 0,
		mult : 2
	},
	world_mana1 : {
		name : "Magic moments",
		desc : "Blueprint - Mana pool",
		req : ["world"],
		feat : "mana1",
		exp : 0,
		mult : 2
	},
	world_summon1 : {
		name : "Wild beast show",
		desc : "Blueprint - Stabilizer",
		req : ["world"],
		feat : "noabsolute1",
		exp : 0,
		mult : 2
	},
	world_mean1 : {
		name : "A storm to come",
		desc : "Blueprint - Thunder station",
		req : ["world"],
		feat : "noreal1",
		exp : 0,
		mult : 2
	},
}

Object.keys(SKILLS).map(x => SKILLS[x].id = x)
