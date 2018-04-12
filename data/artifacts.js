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
//
//Shields:
//- Create a magical shield upon conquered point
//- Create a physical shield around conquered point

	const ARTIFACTS = {
	emeraldSword: {
		name : "Emerald Sword",
		desc : "Fear-based damage ignores all kinds of resistance",
		codeLength : 5,
		codeCost : 1e8,
		depth : 1e3,
		iconText : "🗡️\uFE0E",
		iconTextColor : "var(--spirit)"
	},
	channelOrb: {
		name : "Sphere of Time",
		desc : "Channelling does not prevent growth",
		codeLength : 5,
		codeCost : 1e9,
		depth : 1e6,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--foreground)"
	},
	nullRod: {
		name : "Mirror staff",
		desc : "Target node's attribute is zeroed on slider while attacking",
		codeLength : 7,
		codeCost : 1e9,
		depth : 1e9,
		iconText : "/",
		iconTextColor : "var(--shade13)"
	}
}

Object.keys(ARTIFACTS).map(x => ARTIFACTS[x].id = x)

function createArtifactResearch(name) {
	const artifact = ARTIFACTS[name]
	if (!artifact) 
		return
	
	const result = {}

	const a = new Uint8Array(artifact.codeLength)
	crypto.getRandomValues(a, artifact.codeLength)
	
	result.codeword = a.reduce((v,x) => v + String.fromCharCode(x % 26 + 65),"")
	result.tablet = {}
	
	return result
}

function advanceResearch(value) {
	const name = game.researching
	if (!name) return
	const research = game.research[name]
	const artifact = ARTIFACTS[name]
	if (!research || !artifact || research.done) 
		return
	
	research.progress = (research.progress || 0) + value
	
	let advances = research.progress / artifact.codeCost | 0
	
	if (advances) {
		research.progress -= artifact.codeCost * advances
		
		const available = new Set(letterPairs)
		Object.keys(research.tablet).map(x => available.delete(x))
		while (advances--) {
			if (available.size == 0) break
			const pair = [...available][Math.random()*available.size | 0]
			research.tablet[pair] = research.codeword.includes(pair)
			available.delete(pair)
		}
		if (available.size == 0) {
			delete game.researching 
		}
		gui.artifacts.update(true)
	}
	return
}

function finalizeResearch(name, word) {
	const artifact = ARTIFACTS[name]
	const research = game.research[name]
	if (!artifact || !research || !word || word.toUpperCase() != research.codeword) 
		return
	research.done = true
	research.tablet = {}
	gui.artifacts.update(true)
}