'use strict'

const ARTIFACTS = {
	pickaxe: {
		name: "Radiant pickaxe",
		desc: "Slider digs a lot more efficiently",
		codeLength : 5,
		codeCost : 3e7,
		depth : 2.341e4,
		iconText: "⛏️\uFE0E",
		iconTextColor: "var(--foreground)"
	},
	expOrb: {
		name : "Orb of experience",
		desc : "Triples equipped slider's gained experience",
		codeLength : 5,
		codeCost : 1e7,
		depth : 1.43e2,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--shade5)"
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
	growthOrb: {
		name : "Orb of growth",
		desc : "Triples equipped slider's actual growth",
		codeLength : 13,
		codeCost : 32e9,
		depth : 2.627e21,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--enchantgrowth)"
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
	bloodOrb: {
		name : "Orb of blood",
		desc : "All the slider's elemental growth is focused in blood",
		codeLength : 8,
		codeCost : 3e8,
		depth : 6.264e12,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-blood)"
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
	iceOrb: {
		name : "Orb of ice",
		desc : "All the slider's elemental growth is focused in ice",
		codeLength : 9,
		codeCost : 5e8,
		depth : 9.326e14,
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-ice)"
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
	bloodRod: {
		name : "Rod of blood",
		desc : "Deals unblockable 5% of slider's blood damage",
		codeLength : 9,
		codeCost : 5e8,
		depth : 5.251e15,
		iconText: "/️",
		iconTextColor : "var(--bg-blood)"
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
	iceRod: {
		name : "Rod of ice",
		desc : "Deals unblockable 5% of slider's ice damage",
		codeLength : 6,
		codeCost : 3e8,
		depth : 8.231e8,
		iconText: "/️",
		iconTextColor : "var(--bg-ice)"
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
	pierceRod: {
		name : "Rod of elements",
		desc : "Deals unblockable 2% of slider's elemental damage",
		codeLength : 14,
		codeCost : 3e9,
		depth : 1.234e23,
		iconText: "/️",
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
	channelReceiver: {
		name: "Student's amulet",
		desc: "Slider receives double bonus from channelling",
		codeLength : 7,
		codeCost : 5e8,
		depth : 2.515e10,
		iconText: "V",
		iconTextColor: "var(--foreground)"
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
	summonAmulet: {
		name : "Apprentice's amulet",
		desc : "Slider has a chance to summon power clone for free if there are no summons attacking same target",
		codeLength : 24,
		codeCost : 1e11,
		depth : 1.220e30,
		iconText : "V",
		iconTextColor : "var(--bg-spirit)"
	},
	masterSummonAmulet: {
		name : "Master's amulet",
		desc : "Slider has a chance to summon elemental clone for free if there are no summons attacking same target",
		codeLength : 28,
		codeCost : 3e11,
		depth : 8.131e30,
		iconText : "V",
		iconTextColor : "var(--bg-fire)"
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
	loneSword: {
		name : "Sword of the stranger",
		desc : "Slider deals additional unblockable elemental damage if attacking alone.",
		codeLength : 20,
		codeCost : 5e10,
		depth : 3.654e29,
		iconText : "T",
		iconTextColor : "var(--bg-foreground)"
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
	selflessCrown: {
		name : "Crown of the selfless",
		desc : "If not attacking alone, deals reduced damage but doubles damage of others",
		codeLength : 17,
		codeCost : 42e10,
		depth : 9.364e33,
		iconText : "👑\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},	
	puppetCrown: {
		name : "Crown of the puppeteer",
		desc : "If attacking alongside summons, deals reduced damage but quadruples damage of summons",
		codeLength : 19,
		codeCost : 50e10,
		depth : 2.46e34,
		iconText : "👑\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},	
	bloodRing: {
		name : "Bleeding ring",
		desc : "Imbuing slider with blood costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 2.197e32,
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},
	fireRing: {
		name : "Burning ring",
		desc : "Imbuing slider with fire costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 4.623e30,
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},
	iceRing: {
		name : "Frozen ring",
		desc : "Imbuing slider with ice costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 2.316e31,
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-ice)"
	},
	metalRing: {
		name : "Darksteel ring",
		desc : "Imbuing slider with metal costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 8.147e32,
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-metal)"
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
	stormGem: {
		name : "Gem of storms",
		desc : "Boosts Mean machine damage to slider's target",
		codeLength : 15,
		codeCost : 17e10,
		depth : 5.794e31,
		iconText : "💎\uFE0E",
		iconTextColor : "#5588DD"
	},	
	powerGem: {
		name : "Gem of light",
		desc : "Elemental nodes block less physical damage",
		codeLength : 20,
		codeCost : 26e10,
		depth : 1.613e33,
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-power)"
	},	
	bloodGem: {
		name : "Gem of metallic blood",
		desc : "Triples slider's damage to blood nodes",
		codeLength : 20,
		codeCost : 26e10,
		depth : 3.582e31,
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},	
	fireGem: {
		name : "Gem of bloody fire",
		desc : "Triples slider's damage to fire nodes",
		codeLength : 20,
		codeCost : 26e10,
		depth : 5.622e32,
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},	
	iceGem: {
		name : "Gem of fiery ice",
		desc : "Triples slider's damage to ice nodes",
		codeLength : 20,
		codeCost : 26e10,
		depth : 9.412e31,
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-ice)"
	},	
	metalGem: {
		name : "Gem of icy metal",
		desc : "Triples slider's damage to metal nodes",
		codeLength : 20,
		codeCost : 26e10,
		depth : 3.179e33,
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-metal)"
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
	if (Math.max(...letterPairs.map(x => (s.match(RegExp(x, "g")) || []).length)) > 1) return true
	return false
}