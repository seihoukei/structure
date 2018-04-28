'use strict'

const ARTIFACTS = {
	pickaxe: {
		name: "Radiant pickaxe",
		desc: "Slider digs a lot more efficiently",
		codeLength : 5,
		codeCost : 3e7,
		depth : 2.341e4,
		iconText: "⛏️\uFE0E",
		iconTextColor: "var(--foreground)",
		active() {
			return this.equipped && this.equipped.target && !this.equipped.target.index
		}
	},
	expOrb: {
		name : "Orb of experience",
		desc : "Triples equipped slider's gained experience",
		codeLength : 5,
		codeCost : 1e7,
		depth : 1.43e2,
		active() {
			return this.equipped && this.equipped.real && this.equipped.real.expChange > 0
		},
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--shade5)"
	},
	channelOrb: {
		name : "Channeller's orb",
		desc : "Channelling does not prevent growth",
		codeLength : 12,
		codeCost : 2e9,
		depth : 7.777e16,
		active() {
			return this.equipped && this.equipped.channel.length
		},
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--foreground)"
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
		iconTextColor : "var(--enchantgrowth)"
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
		iconText : "🔮️\uFE0E",
		iconTextColor : "var(--bg-metal)"
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
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.real[POINT_TYPES[this.equipped.target.type]]
		},
		iconText : "/",
		iconTextColor : "var(--shade13)"
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
		iconText : "V",
		iconTextColor : "var(--bg-fire)"
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
		iconTextColor : "var(--bg-spirit)"
	},
	loneSword: {
		name : "Sword of the stranger",
		desc : "Slider deals additional unblockable elemental damage if attacking alone.",
		codeLength : 20,
		codeCost : 5e10,
		depth : 3.654e29,
		active() {
			return this.equipped && this.equipped.real && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && this.equipped.target.attackers.size == 1 && (this.equipped.real.metal + this.equipped.real.ice + this.equipped.real.fire + this.equipped.real.blood)
		},
		iconText : "T",
		iconTextColor : "var(--bg-foreground)"
	},
	channelCrown: {
		name : "Leader's crown",
		desc : "Sliders attacking same point as this slider get additional channelling bonus from this slider",
		codeLength : 10,
		codeCost : 25e9,
		depth : 7.651e25,
		active() {
			return this.equipped && this.equipped.target && this.equipped.target.index && this.equipped.target.attackers && this.equipped.target.attackers.size > 1
		},
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
		iconText : "👑\uFE0E",
		iconTextColor : "var(--bg-fire)"
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
		iconText : "💍\uFE0E",
		iconTextColor : "var(--bg-metal)"
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
		iconText : "O",
		iconTextColor : "#DD55DD"
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
		iconText : "💎\uFE0E",
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
		iconText : "💎\uFE0E",
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
		iconText : "💎\uFE0E",
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
		iconText : "💎\uFE0E",
		iconTextColor : "var(--bg-metal)"
	},	
}

Object.keys(ARTIFACTS).map(x => ARTIFACTS[x].id = x)