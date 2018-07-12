'use strict'

const RESEARCH_LETTERS = 0
const RESEARCH_NUMBERS = 1

const LETTERS = Array(26).fill(0).map((x,n) => String.fromCharCode(n+65))
const LETTER_PAIRS = Array(26*26).fill(0).map((x,n) => LETTERS[n/26|0]+LETTERS[n%26])

const ARTIFACTS = {
	pickaxe: {
		name: "Radiant pickaxe",
		desc: "Slider digs a lot more efficiently",
		codeLength : 5,
		codeCost : 3e7,
		depth : 2.341e4,
		iconText: "⛏️\uFE0E",
		iconTextColor: "var(--foreground)",
		glyph : "none-pickaxe",
		active() {
			return this.equipped && this.equipped.target && !this.equipped.target.index
		}
	},
	doublePickaxe: {
		name : "Double work pickaxe",
		desc : "Slider mines less efficiently but counts as two workers",
		researchType : RESEARCH_NUMBERS,
		codeLength : 5,
		codeCost : 1e15,
		codeDigits : 2,
		depth : 8.645e45,
		active() {
			return this.equipped && this.equipped.target && !this.equipped.target.index
		},
		glyph : "power-pickaxe",
		iconText: "⛏️\uFE0E",
		iconTextColor: "var(--bg-power)",		
	},
	alwaysPickaxe: {
		name : "Automatic pickaxe",
		desc : "Slider counts as a worker even when not mining",
		researchType : RESEARCH_NUMBERS,
		codeLength : 5,
		codeCost : 1e15,
		codeDigits : 2,
		depth : 3.165e48,
		active() {
			return this.equipped && (!this.equipped.target || this.equipped.target.index)
		},
		glyph : "spirit-pickaxe",
		iconText: "⛏️\uFE0E",
		iconTextColor: "var(--bg-spirit)",		
	},
	expOrb: {
		name : "Orb of experience",
		desc : "Triples equipped slider's gained experience",
		codeLength : 5,
		codeCost : 1e7,
		depth : 1.43e2,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.producingExp
		},
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--shade5)",
		glyph : "none-emptyorb",
	},
	channelOrb: {
		name : "Channeller's orb",
		desc : "Channelling does not prevent growth",
		codeLength : 12,
		codeCost : 2e9,
		depth : 7.777e16,
		active() {
			return this.equipped && (masterSlider.masterChannel?masterSlider:this.equipped).channel.length
		},
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--foreground)",
		glyph : "none-orb",
	},
	summonOrb: {
		name : "Summonner's orb",
		desc : "Channelling is doubled and does not prevent growth, but only affects summons",
		codeLength : 29,
		codeCost : 75e12,
		depth : 2.456e39,
		active() {
			return this.equipped && (masterSlider.masterChannel?masterSlider:this.equipped).channel.length && game.sliders.filter(x => x.clone == 2).length
		},
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--enchantdoom)",
		glyph : "mana-emptyorb",
	},
	growthOrb: {
		name : "Orb of growth",
		desc : "Triples equipped slider's actual growth",
		codeLength : 13,
		codeCost : 32e9,
		depth : 2.627e21,
		active() {
			return this.equipped && this.equipped.real && Object.values(this.equipped.real.growth).reduce((v,x) => v+x, 0)
		},
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--enchantgrowth)",
		glyph : "storm-emptyorb",
	},
	powerOrb: {
		name : "Orb of power",
		desc : "All the slider's growth is focused in power",
		codeLength : 6,
		codeCost : 1e8,
		depth : 3.141e6,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.growth.power
		},
		glyph : "power-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-power)"
	},
	bloodOrb: {
		name : "Orb of blood",
		desc : "All the slider's elemental growth is focused in blood",
		codeLength : 8,
		codeCost : 3e8,
		depth : 6.264e12,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.growth.blood
		},
		glyph : "blood-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},
	fireOrb: {
		name : "Orb of fire",
		desc : "All the slider's elemental growth is focused in fire",
		codeLength : 9,
		codeCost : 4e8,
		depth : 4.91e17,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.growth.fire
		},
		glyph : "fire-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},
	iceOrb: {
		name : "Orb of ice",
		desc : "All the slider's elemental growth is focused in ice",
		codeLength : 9,
		codeCost : 5e8,
		depth : 9.326e14,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.growth.ice
		},
		glyph : "ice-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-ice)"
	},
	metalOrb: {
		name : "Orb of metal",
		desc : "All the slider's elemental growth is focused in metal",
		codeLength : 9,
		codeCost : 6e8,
		depth : 1.61e18,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.growth.metal
		},
		glyph : "metal-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-metal)"
	},
	greatOrb: {
		name : "Great orb of elements",
		desc : "Redistributes power growth among elements",
		codeLength : 21,
		codeCost : 5e12,
		depth : 7.634e35,
		active() {
			return this.equipped && (this.equipped.growth.power || this.equipped.learn.includes(1))
		},
		glyph : "storm-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--foreground)"
	},	
	targetOrb: {
		name : "Orb of draining",
		desc : "When targetting an elemental node, target element growth is boosted on this slider",
		researchType : RESEARCH_NUMBERS,
		codeLength : 5,
		codeCost : 1e15,
		codeDigits : 3,
		depth : 3.606e46,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.type > 2
		},
		glyph : "spirit-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-spirit)"
	},
	superTargetOrb: {
		name : "Supreme orb of draining",
		desc : "When targetting an elemental node, target element growth is boosted on every slider",
		researchType : RESEARCH_NUMBERS,
		codeLength : 6,
		codeCost : 2e16,
		codeDigits : 4,
		depth : 5.222e54,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.type > 2
		},
		glyph : "spirit-emptyorb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-spirit)"
	},
	masterOrb: {
		name : "Orb of domination",
		desc : "When targetting an elemental node, element target is weak to growth is boosted on this slider",
		researchType : RESEARCH_NUMBERS,
		codeLength : 7,
		codeCost : 7e15,
		codeDigits : 3,
		depth : 2.157e50,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.type > 2
		},
		glyph : "dark-orb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--shade8)"
	},
	superMasterOrb: {
		name : "Supreme orb of domination",
		desc : "When targetting an elemental node, element target is weak to growth is boosted on every slider",
		researchType : RESEARCH_NUMBERS,
		codeLength : 7,
		codeCost : 2e16,
		codeDigits : 4,
		depth : 9.455e55,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.type > 2
		},
		glyph : "dark-emptyorb",
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--shade8)"
	},
	bloodRod: {
		name : "Rod of blood",
		desc : "Deals unblockable 5% of slider's blood damage",
		codeLength : 9,
		codeCost : 5e8,
		depth : 5.251e15,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.real.blood
		},
		glyph : "blood-rod",
		iconText: "/️",
		iconTextColor : "var(--bg-blood)"
	},
	fireRod: {
		name : "Rod of fire",
		desc : "Deals unblockable 5% of slider's fire damage",
		codeLength : 8,
		codeCost : 3e8,
		depth : 8.326e11,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.real.fire
		},
		glyph : "fire-rod",
		iconText: "/️",
		iconTextColor : "var(--bg-fire)"
	},
	iceRod: {
		name : "Rod of ice",
		desc : "Deals unblockable 5% of slider's ice damage",
		codeLength : 6,
		codeCost : 3e8,
		depth : 8.231e8,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.real.ice
		},
		glyph : "ice-rod",
		iconText: "/️",
		iconTextColor : "var(--bg-ice)"
	},
	metalRod: {
		name : "Rod of metal",
		desc : "Deals unblockable 5% of slider's metal damage",
		codeLength : 9,
		codeCost : 4e8,
		depth : 7.272e13,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.real.metal
		},
		glyph : "metal-rod",
		iconText: "/️",
		iconTextColor : "var(--bg-metal)"
	},
	pierceRod: {
		name : "Rod of elements",
		desc : "Deals unblockable 2% of slider's elemental damage",
		codeLength : 14,
		codeCost : 3e9,
		depth : 1.234e23,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && (this.equipped.real.metal + this.equipped.real.ice + this.equipped.real.fire + this.equipped.real.blood)
		},
		glyph : "storm-rod",
		iconText: "/️",
		iconTextColor : "var(--foreground)"
	},
	nullRod: {
		name : "Staff of suppression",
		desc : "Target node's attribute is zeroed on slider while attacking",
		codeLength : 20,
		codeCost : 1e11,
		depth : 1.51e27,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index
		},
		glyph : "dark-staff",
		iconText : "/",
		iconTextColor : "var(--shade13)"
	},
	bloodStaff: {
		name : "Staff of wounds",
		desc : "Deals unblockable blood damage",
		codeLength : 23,
		codeCost : 15e12,
		depth : 1.743e45,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.blood && this.equipped.target && this.equipped.target.index
		},
		glyph : "blood-staff",
		iconText : "╱",
		iconTextColor : "var(--bg-blood)"
	},
	fireStaff: {
		name : "Staff of burns",
		desc : "Deals unblockable fire damage",
		codeLength : 23,
		codeCost : 15e12,
		depth : 3.764e37,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.fire && this.equipped.target && this.equipped.target.index
		},
		glyph : "fire-staff",
		iconText : "╱",
		iconTextColor : "var(--bg-fire)"
	},
	iceStaff: {
		name : "Staff of chilblains",
		desc : "Deals unblockable ice damage",
		codeLength : 23,
		codeCost : 15e12,
		depth : 4.335e42,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.ice && this.equipped.target && this.equipped.target.index
		},
		glyph : "ice-staff",
		iconText : "╱",
		iconTextColor : "var(--bg-ice)"
	},
	metalStaff: {
		name : "Staff of cuts",
		desc : "Deals unblockable metal damage",
		codeLength : 23,
		codeCost : 15e12,
		depth : 9.985e39,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.metal && this.equipped.target && this.equipped.target.index
		},
		glyph : "metal-staff",
		iconText : "╱",
		iconTextColor : "var(--bg-metal)"
	},
	stormStaff: {
		name : "Staff of storms",
		desc : "Sliders elemental power boosts every Mean machine on the shortest path from core to target",
		researchType : RESEARCH_NUMBERS,
		codeLength : 4,
		codeCost : 2e16,
		codeDigits : 4,
		depth : 2.046e55,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.parent && this.equipped.target.parent.buildings && this.equipped.target.parent.buildings["earthquakeMachine"]
		},
		glyph : "storm-staff",
		iconText : "/",
		iconTextColor : "#5588DD"
	},
	channelReceiver: {
		name: "Student's amulet",
		desc: "Slider receives double bonus from channelling",
		codeLength : 7,
		codeCost : 5e8,
		depth : 2.515e10,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.gotChannel
		},
		glyph : "none-amulet",
		iconText: "V",
		iconTextColor: "var(--foreground)"
	},
	warAmulet: {
		name : "Amulet of endless battles",
		desc : "Slider accumulates bonus damage while attacking same point",
		codeLength : 12,
		codeCost : 1e10,
		depth : 3.126e28,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index
		},
		glyph : "power-amulet",
		iconText : "V",
		iconTextColor : "var(--bg-power)"
	},
	victoryAmulet: {
		name : "Amulet of victory",
		desc : "Slider deals bonus damage after capturing a point for a minute per map level",
		codeLength : 11,
		codeCost : 12e9,
		depth : 6.654e28,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.victoryTimer
		},
		glyph : "blood-amulet",
		iconText : "V",
		iconTextColor : "var(--bg-blood)"
	},
	summonAmulet: {
		name : "Apprentice's amulet",
		desc : "Slider has a chance to summon power clone for free if there are no summons attacking same target",
		codeLength : 24,
		codeCost : 1e11,
		depth : 1.220e30,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && [...this.equipped.target.attackers].filter(x => x.clone == 2).length == 0
		},
		glyph : "spirit-amulet",
		iconText : "V",
		iconTextColor : "var(--bg-spirit)"
	},
	masterSummonAmulet: {
		name : "Master's amulet",
		desc : "Slider has a chance to summon elemental clone for free if there are no summons attacking same target",
		codeLength : 28,
		codeCost : 3e11,
		depth : 8.131e30,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && [...this.equipped.target.attackers].filter(x => x.clone == 2).length == 0
		},
		glyph : "fire-amulet",
		iconText : "V",
		iconTextColor : "var(--bg-fire)"
	},
	legendarySummonAmulet: {
		name : "Grandmaster's amulet",
		desc : "Slider has a chance to summon strong elemental",
		codeLength : 30,
		codeCost : 5e13,
		depth : 1.481e43,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index
		},
		glyph : "ice-amulet",
		iconText : "V",
		iconTextColor : "var(--bg-ice)"
	},
	emeraldSword: {
		name : "Emerald sword",
		desc : "Deals extra spirit and fear based damage that ignores all kinds of resistance",
		codeLength : 11,
		codeCost : 23e9,
		depth : 6.666e19,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.real.spirit && game.resources.fears
		},
		iconText : "T",
		iconTextColor : "var(--bg-spirit)",
		glyph : "spirit-sword"
	},
	loneSword: {
		name : "Sword of the stranger",
		desc : "Slider deals additional unblockable elemental damage if attacking alone.",
		codeLength : 20,
		codeCost : 5e10,
		depth : 3.654e29,
		active() {
			return !!(this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && this.equipped.target.attackers.size == 1 && (this.equipped.real.metal + this.equipped.real.ice + this.equipped.real.fire + this.equipped.real.blood))
		},
		glyph : "none-sword",
		iconText : "T",
		iconTextColor : "var(--	foreground)"
	},
	channelSword: {
		name : "Conductive sword",
		desc : "When attacking a node with anti-channel shield, deals reduced damage but lets 10% of channelling through",
		researchType : RESEARCH_NUMBERS,
		codeLength : 4,
		codeCost : 6e15,
		codeDigits : 4,
		depth : 5.170e51,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.special == SPECIAL_NOCHANNEL
		},
		glyph : "power-sword",
		iconText : "T",
		iconTextColor : "var(--bg-power)"
	},
	stormSword: {
		name : "Sword of holy thunderforce",
		desc : "Sliders elemental power boosts nearby Mean machine",
		researchType : RESEARCH_NUMBERS,
		codeLength : 4,
		codeCost : 2e15,
		codeDigits : 3,
		depth : 1.775e47,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.parent && this.equipped.target.parent.buildings && this.equipped.target.parent.buildings["earthquakeMachine"]
		},
		glyph : "storm-sword",
		iconText : "T",
		iconTextColor : "#5588DD"
	},
	channelCrown: {
		name : "Leader's crown",
		desc : "Sliders attacking same point as this slider get additional channelling bonus from this slider",
		codeLength : 10,
		codeCost : 25e9,
		depth : 7.651e25,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.attackers && this.equipped.target.attackers.size > 1
		},
		glyph : "none-crown",
		iconText : "👑\uFE0E",
		iconTextColor : "var(--foreground)"
	},
	selflessCrown: {
		name : "Crown of the selfless",
		desc : "If not attacking alone, deals reduced damage but doubles damage of others",
		codeLength : 17,
		codeCost : 42e10,
		depth : 9.364e33,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && this.equipped.target.attackers.size > 1
		},
		glyph : "blood-crown",
		iconText : "👑\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},	
	puppetCrown: {
		name : "Crown of the puppeteer",
		desc : "If attacking alongside summons, deals reduced damage but quadruples damage of summons",
		codeLength : 19,
		codeCost : 50e10,
		depth : 2.46e34,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && [...this.equipped.target.attackers].filter(x => x.clone == 2).length
		},
		glyph : "fire-crown",
		iconText : "👑\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},	
	soloCrown: {
		name : "Crown of the egoist",
		desc : "If not attacking alone, reduces damage of others but deals doubled damage",
		researchType : RESEARCH_NUMBERS,
		codeLength : 5,
		codeCost : 5e15,
		codeDigits : 3,
		depth : 5.406e49,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && this.equipped.target.attackers.size > 1
		},
		glyph : "dark-crown",
		iconText : "👑\uFE0E",
		iconTextColor : "var(--shade8)"
	},
	shareCrown: {
		name : "Conductive crown",
		desc : "If not attacking alone, receives and sends no channel bonus but others get doubled channel bonus",
		researchType : RESEARCH_NUMBERS,
		codeLength : 7,
		codeCost : 3e15,
		codeDigits : 2,
		depth : 7.498e47,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && this.equipped.target.attackers.size > 1
		},
		glyph : "power-crown",
		iconText : "👑\uFE0E",
		iconTextColor : "var(--bg-power)"
	},
	bloodRing: {
		name : "Bleeding ring",
		desc : "Imbuing slider with blood costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 2.197e32,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.imbuement == 3
		},
		glyph : "blood-ring",
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},
	fireRing: {
		name : "Burning ring",
		desc : "Imbuing slider with fire costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 4.623e30,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.imbuement == 4
		},
		glyph : "fire-ring",
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},
	iceRing: {
		name : "Frozen ring",
		desc : "Imbuing slider with ice costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 2.316e31,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.imbuement == 5
		},
		glyph : "ice-ring",
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-ice)"
	},
	metalRing: {
		name : "Darksteel ring",
		desc : "Imbuing slider with metal costs nothing",
		codeLength : 18,
		codeCost : 5e10,
		depth : 8.147e32,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.imbuement == 6
		},
		glyph : "metal-ring",
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-metal)"
	},
	imbueRing: {
		name : "Ring of magic power",
		desc : "Slider retains its power while imbuement is active",
		researchType : RESEARCH_NUMBERS,
		codeLength : 5,
		codeCost : 2e16,
		codeDigits : 3,
		depth : 3.292e53,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.imbuement
		},
		glyph : "power-ring",
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-power)"
	},
	goldShield: {
		name : "Shield of gold",
		desc : "Points captured with the slider get enchanted for gold",
		codeLength : 12,
		codeCost : 5e9,
		depth : 5.015e27,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && !this.equipped.target.enchanted
		},
		glyph : "power-shield",
		iconText : "O",
		iconTextColor : "var(--enchantgold)"
	},
	manaShield: {
		name : "Shield of mana",
		desc : "Points captured with the slider get enchanted for mana",
		codeLength : 12,
		codeCost : 5e9,
		depth : 1.724e28,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && !this.equipped.target.enchanted
		},
		glyph : "mana-shield",
		iconText : "O",
		iconTextColor : "var(--enchantmana)"
	},	
	physicalShield: {
		name : "Shield of fears",
		desc : "Unprotected points captured with the slider gain a physical shield",
		codeLength : 17,
		codeCost : 1e10,
		depth : 1.313e29,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && !this.equipped.target.special
		},
		glyph : "none-shield",
		iconText : "O",
		iconTextColor : "#DD88DD"
	},
	magicalShield: {
		name : "Shield of clouds",
		desc : "Unprotected points captured with the slider gain a magical shield",
		codeLength : 16,
		codeCost : 12e9,
		depth : 7.663e29,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && !this.equipped.target.special
		},
		glyph : "storm-shield",
		iconText : "O",
		iconTextColor : "#DD55DD"
	},
	doomShield: {
		name : "Shield of doom",
		desc : "Whenever slider captures a point, random uncaptured point connected to it gets doomed",
		codeLength : 15,
		codeCost : 4e13,
		depth : 6.498e37,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index
		},
		glyph : "dark-shield",
		iconText : "O",
		iconTextColor : "var(--enchantdoom)"
	},
	reloadShield: {
		name : "Shield of acclaim",
		desc : "Slider refills full spirit charge when it changes target",
		researchType : RESEARCH_NUMBERS,
		codeLength : 4,
		codeCost : 1e16,
		codeDigits : 4,
		depth : 1.060e53,
		active() {
			return this.equipped
		},
		glyph : "spirit-shield",
		iconText : "O\uFE0E",
		iconTextColor : "var(--bg-spirit)"
	},
	stormGem: {
		name : "Gem of storms",
		desc : "Boosts Mean machine damage to slider's target",
		codeLength : 15,
		codeCost : 17e10,
		depth : 5.794e31,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.special != SPECIAL_BLOCK && this.equipped.target.parent && this.equipped.target.parent.buildings && this.equipped.target.parent.buildings["earthquakeMachine"]
		},
		glyph : "storm-gem",
		iconText : "💎\uFE0E",
		iconTextColor : "#5588DD"
	},	
	powerGem: {
		name : "Gem of light",
		desc : "Elemental nodes block less physical damage",
		codeLength : 20,
		codeCost : 26e10,
		depth : 1.613e33,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.type > 2
		},
		glyph : "power-gem",
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-power)"
	},	
	bloodGem: {
		name : "Gem of metallic blood",
		desc : "Triples damage to target blood node",
		codeLength : 20,
		codeCost : 26e10,
		depth : 3.582e31,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.type == 3
		},
		glyph : "blood-gem",
		iconText : "💎\uFE0E",
		shineColor : "var(--bg-metal)",
		iconTextColor : "var(--bg-blood)"
	},	
	fireGem: {
		name : "Gem of bloody fire",
		desc : "Triples damage to target fire node",
		codeLength : 20,
		codeCost : 26e10,
		depth : 5.622e32,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.type == 4
		},
		glyph : "fire-gem",
		iconText : "💎\uFE0E",
		shineColor : "var(--bg-blood)",
		iconTextColor : "var(--bg-fire)"
	},	
	iceGem: {
		name : "Gem of fiery ice",
		desc : "Triples damage to target ice node",
		codeLength : 20,
		codeCost : 26e10,
		depth : 9.412e31,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.type == 5
		},
		glyph : "ice-gem",
		iconText : "💎\uFE0E",
		shineColor : "var(--bg-fire)",
		iconTextColor : "var(--bg-ice)"
	},	
	metalGem: {
		name : "Gem of icy metal",
		desc : "Triples damage to target metal node",
		codeLength : 20,
		codeCost : 26e10,
		depth : 3.179e33,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.type == 6
		},
		glyph : "metal-gem",
		iconText : "💎\uFE0E",
		shineColor : "var(--bg-ice)",
		iconTextColor : "var(--bg-metal)"
	},	
	expScales: {
		name : "Scales of rogue decimals",
		desc : "Doubles growth if your exp change speed is zero or negligibly small",
		codeLength : 16,
		codeCost : 5e11,
		depth : 1.623e35,
		active() {
			return this.equipped && game.real && game.real.production && Math.abs(game.real.production.exp) < game.real.growth.power / 1e12
		},
		glyph : "storm-scales",
		iconText : "⚖\uFE0E",
		iconTextColor : "var(--foreground)"
	},	
	bloodBracelet: {
		name : "Bracelet of blood knight",
		desc : "Focus all the elemental power in blood",
		codeLength : 25,
		codeCost : 1e13,
		depth : 2.608e36,
		active() {
			return this.equipped
		},
		glyph : "blood-bracelet",
		iconText : "o",
		iconTextColor : "var(--bg-blood)"
	},
	fireBracelet: {
		name : "Bracelet of keeper of fire",
		desc : "Focus all the elemental power in fire",
		codeLength : 25,
		codeCost : 1e13,
		depth : 5.377e38,
		active() {
			return this.equipped
		},
		glyph : "fire-bracelet",
		iconText : "o",
		iconTextColor : "var(--bg-fire)"
	},
	iceBracelet: {
		name : "Bracelet of icepicker",
		desc : "Focus all the elemental power in ice",
		codeLength : 25,
		codeCost : 1e13,
		depth : 2.623e41,
		active() {
			return this.equipped
		},
		glyph : "ice-bracelet",
		iconText : "o",
		iconTextColor : "var(--bg-ice)"
	},
	metalBracelet: {
		name : "Bracelet of metallurgist",
		desc : "Focus all the elemental power in metal",
		codeLength : 25,
		codeCost : 1e13,
		depth : 8.261e43,
		active() {
			return this.equipped
		},
		glyph : "metal-bracelet",
		iconText : "o",
		iconTextColor : "var(--bg-metal)"
	},
	reloadFlag: {
		name : "Flag of high spirits",
		desc : "Spirit charge lasts longer and provides higher bonus with high charge",
		codeLength : 22,
		codeCost : 3e13,
		depth : 7.754e41,
		active() {
			return this.equipped && this.equipped.charge
		},
		glyph : "spirit-flag",
		iconText : "⚑\uFE0E",
		iconTextColor : "var(--bg-spirit)"
	},
	bloodFlag: {
		name : "Banner of infliction",
		desc : "Halves slider's final blood attribute, channelling the other half to every blood elemental",
		researchType : RESEARCH_NUMBERS,
		codeLength : 6,
		codeCost : 4e15,
		codeDigits : 3,
		depth : 1.168e49,
		active() {
			return this.equipped
		},
		glyph : "blood-flag",
		iconText : "⚑\uFE0E",
		iconTextColor : "var(--bg-blood)"
	},
	fireFlag: {
		name : "Banner of ignition",
		desc : "Halves slider's final fire attribute, channelling the other half to every fire elemental",
		researchType : RESEARCH_NUMBERS,
		codeLength : 6,
		codeCost : 4e15,
		codeDigits : 3,
		depth : 1.076e51,
		active() {
			return this.equipped
		},
		glyph : "fire-flag",
		iconText : "⚑\uFE0E",
		iconTextColor : "var(--bg-fire)"
	},
	iceFlag: {
		name : "Banner of cooling",
		desc : "Halves slider's final ice attribute, channelling the other half to every ice elemental",
		researchType : RESEARCH_NUMBERS,
		codeLength : 6,
		codeCost : 4e15,
		codeDigits : 3,
		depth : 2.314e52,
		active() {
			return this.equipped
		},
		glyph : "ice-flag",
		iconText : "⚑\uFE0E",
		iconTextColor : "var(--bg-ice)"
	},
	metalFlag: {
		name : "Banner of quenching",
		desc : "Halves slider's final metal attribute, channelling the other half to every metal elemental",
		researchType : RESEARCH_NUMBERS,
		codeLength : 6,
		codeCost : 4e15,
		codeDigits : 3,
		depth : 1.099e54,
		active() {
			return this.equipped
		},
		glyph : "metal-flag",
		iconText : "⚑\uFE0E",
		iconTextColor : "var(--bg-metal)"
	},
	aligner: {
		name : "Radiant stone",
		desc : "Slider has a chance to realign accompanying elementals to strong element",
		codeLength : 20,
		codeCost : 3e13,
		depth : 9.797e36,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.type > 2 && this.equipped.target.index && this.equipped.target.attackers && [...this.equipped.target.attackers].filter(x => x.clone == 2 && x.element > 2).length
		},
		glyph : "power-stone",
		iconText : "☀\uFE0E",
		iconTextColor : "var(--bg-power)"
	},
	summonBreaker: {
		name : "Oblivion stone",
		desc : "Accompanying summons deal 10% unblockable damage",
		codeLength : 20,
		codeCost : 85e12,
		depth : 5.546e44,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && [...this.equipped.target.attackers].filter(x => x.clone == 2).length
		},
		glyph : "spirit-stone",
		iconText : "☀\uFE0E",
		iconTextColor : "var(--bg-spirit)"
	},
	stormStone: {
		name : "Thunderstone shard",
		desc : "Boosts power of Mean machine on a nearby node",
		codeLength : 15,
		codeCost : 1e13,
		depth : 3.004e40,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.parent && this.equipped.target.parent.buildings && this.equipped.target.parent.buildings["earthquakeMachine"]
		},
		glyph : "storm-stone",
		iconText : "☀\uFE0E",
		iconTextColor : "#5588DD"
	},
}

Object.keys(ARTIFACTS).map(x => ARTIFACTS[x].id = x)