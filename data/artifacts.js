'use strict'

const ARTIFACTS = {
	expOrb: {
		name : "Orb of experience",
		desc : "Triples equipped slider's gained experience",
		codeLength : 5,
		codeCost : 1e7,
		depth : 1.43e2,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--foreground)"
	},
	pickaxe: {
		name: "Radiant pickaxe",
		desc: "Slider digs a lot more efficiently",
		codeLength : 5,
		codeCost : 3e7,
		depth : 2.341e4,
		iconText: "⛏️\uFE0E",
		iconTextColor: "var(--foreground)"
	},
	powerOrb: {
		name : "Orb of power",
		desc : "All the slider's growth is focused in power",
		codeLength : 6,
		codeCost : 1e8,
		depth : 3.141e6,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-power)"
	},
	iceRod: {
		name : "Rod of ice",
		desc : "Deals unblockable 5% of slider's ice damage",
		codeLength : 6,
		codeCost : 3e8,
		depth : 8.231e8,
		iconText: "/️",
		iconTextColor : "var(--bg-ice)"
	},
	channelReceiver: {
		name: "Student's amulet",
		desc: "Slider receives double bonus from channelling",
		codeLength : 7,
		codeCost : 5e8,
		depth : 2.515e10,
		iconText: "V",
		iconTextColor: "var(--foreground)"
	},
	fireRod: {
		name : "Rod of fire",
		desc : "Deals unblockable 5% of slider's fire damage",
		codeLength : 8,
		codeCost : 3e8,
		depth : 8.326e11,
		iconText: "/️",
		iconTextColor : "var(--bg-fire)"
	},
	bloodOrb: {
		name : "Orb of blood",
		desc : "All the slider's elemental growth is focused in blood",
		codeLength : 8,
		codeCost : 3e8,
		depth : 6.264e12,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},
	metalRod: {
		name : "Rod of metal",
		desc : "Deals unblockable 5% of slider's metal damage",
		codeLength : 9,
		codeCost : 4e8,
		depth : 7.272e13,
		iconText: "/️",
		iconTextColor : "var(--bg-metal)"
	},
	iceOrb: {
		name : "Orb of ice",
		desc : "All the slider's elemental growth is focused in ice",
		codeLength : 9,
		codeCost : 5e8,
		depth : 9.326e14,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-ice)"
	},
	bloodRod: {
		name : "Rod of blood",
		desc : "Deals unblockable 5% of slider's blood damage",
		codeLength : 9,
		codeCost : 5e8,
		depth : 5.251e15,
		iconText: "/️",
		iconTextColor : "var(--bg-blood)"
	},
	channelOrb: {
		name : "Channeller's orb",
		desc : "Channelling does not prevent growth",
		codeLength : 12,
		codeCost : 2e9,
		depth : 7.777e16,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--foreground)"
	},
	fireOrb: {
		name : "Orb of fire",
		desc : "All the slider's elemental growth is focused in fire",
		codeLength : 9,
		codeCost : 4e8,
		depth : 4.91e17,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},
	metalOrb: {
		name : "Orb of metal",
		desc : "All the slider's elemental growth is focused in metal",
		codeLength : 9,
		codeCost : 6e8,
		depth : 1.61e18,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-metal)"
	},
	emeraldSword: {
		name : "Emerald sword",
		desc : "Deals extra spirit and fear based damage that ignores all kinds of resistance",
		codeLength : 11,
		codeCost : 23e9,
		depth : 6.666e19,
		iconText : "T",
		iconTextColor : "var(--bg-spirit)"
	},
	growthOrb: {
		name : "Orb of growth",
		desc : "Triples equipped slider's actual growth",
		codeLength : 13,
		codeCost : 32e9,
		depth : 2.627e21,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--enchantgrowth)"
	},
	pierceRod: {
		name : "Rod of elements",
		desc : "Deals unblockable 2% of slider's elemental damage",
		codeLength : 14,
		codeCost : 3e9,
		depth : 1.234e23,
		iconText: "/️",
		iconTextColor : "var(--foreground)"
	},
	channelCrown: {
		name : "Leader's crown",
		desc : "Sliders attacking same point as this slider get channelling bonus from this slider",
		codeLength : 10,
		codeCost : 25e9,
		depth : 7.651e25,
		iconText : "👑\uFE0E",
		iconTextColor : "var(--foreground)"
	},
	nullRod: {
		name : "Staff of suppression",
		desc : "Target node's attribute is zeroed on slider while attacking",
		codeLength : 20,
		codeCost : 1e11,
		depth : 1.51e27,
		iconText : "/",
		iconTextColor : "var(--shade13)"
	},
	goldShield: {
		name : "Shield of gold",
		desc : "Points captured with the slider get enchanted for gold",
		codeLength : 12,
		codeCost : 5e9,
		depth : 5.015e27,
		iconText : "O",
		iconTextColor : "var(--enchantgold)"
	},
	manaShield: {
		name : "Shield of mana",
		desc : "Points captured with the slider get enchanted for mana",
		codeLength : 12,
		codeCost : 5e9,
		depth : 1.724e28,
		iconText : "O",
		iconTextColor : "var(--enchantmana)"
	},	
	warAmulet: {
		name : "Amulet of endless battles",
		desc : "Slider accumulates bonus damage while attacking same point",
		codeLength : 12,
		codeCost : 1e10,
		depth : 3.126e28,
		iconText : "V",
		iconTextColor : "var(--bg-power)"
	},
	victoryAmulet: {
		name : "Amulet of victory",
		desc : "Slider deals bonus damage after capturing a point for a minute per map level",
		codeLength : 11,
		codeCost : 12e9,
		depth : 6.654e28,
		iconText : "V",
		iconTextColor : "var(--bg-blood)"
	},
	physicalShield: {
		name : "Shield of fears",
		desc : "Unprotected points captured with the slider gain a physical shield",
		codeLength : 17,
		codeCost : 1e10,
		depth : 1.313e29,
		iconText : "O",
		iconTextColor : "#DD88DD"
	},
	magicalShield: {
		name : "Shield of clouds",
		desc : "Unprotected points captured with the slider gain a magical shield",
		codeLength : 16,
		codeCost : 12e9,
		depth : 7.663e29,
		iconText : "O",
		iconTextColor : "#DD55DD"
	},
}

Object.keys(ARTIFACTS).map(x => ARTIFACTS[x].id = x)

function createArtifactResearch(name, baseTablet) {
	const artifact = ARTIFACTS[name]
	if (!artifact) 
		return
	
	const result = {}

	const a = new Uint8Array(artifact.codeLength)
	
	while (!result.codeword || badCodeWord(result.codeword)) {
		crypto.getRandomValues(a, artifact.codeLength)
		result.codeword = a.reduce((v,x) => v + String.fromCharCode(x % 26 + 65),"")
	} 
		
	result.tablet = {}
	if (baseTablet)
		Object.keys(baseTablet).map(x => result.tablet[x] = result.codeword.includes(x))
	
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
			research.progress = 0
			delete game.researching 
		}
		gui.artifacts.update(true)
		gui.artifacts.updateTablet(name)
	}
	return
}

function finalizeResearch(name, word) {
	const artifact = ARTIFACTS[name]
	const research = game.research[name]
	if (!artifact || !research || !word || word.toUpperCase() != research.codeword) 
		return false
	research.done = true
	research.tablet = {}
	research.progress = 0
	if (game.researching == name) 
		game.researching = ""
	return true
}

function badCodeWord(s) {
	if (s[0] == s[s.length-1]) return true
	if (Math.max(...letters.map(x => (s.match(RegExp(x, "g")) || []).length)) > 2) return true
	return false
}