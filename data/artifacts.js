'use strict'

//Emerald sword - spirit => unblockable damage
//
//Staffs:
//- All elements 2% pierce resist
//- Fire 5% pierce resist
//- Ice 5% pierce resist
//- Blood 5% pierce resist
//- Metal 5% pierce resist
//- Null target node's element on self
//
//Orbs: 
//- Grow through chanelling
//- Focus growth in power
//- All elemental growth => fire
//- All elemental growth => ice
//- All elemental growth => blood
//- All elemental growth => metal

	const ARTIFACTS = {
	emeraldSword: {
		name : "Emerald Sword",
		desc : "Use your spirit to deal unblockable damage",
		codeLength : 5,
		codeCost : 1e8,
		depth : 1e3
	},
}

Object.keys(ARTIFACTS).map(x => ARTIFACTS[x].id = x)
