'use strict'

const AT_S_RANDOM = 0
const AT_S_CLOSEST = 1
const AT_S_FURTHEST = 2

const AT_F_KEY = 0
const AT_F_LOCK = 1
const AT_F_EXIT = 2
const AT_F_BOSS = 3

const ROLE_FREE = 0
const ROLE_LEADER = 1
const ROLE_FOLLOWER = 2

const SELECTORS = {
	Mining(points) {
		return points[0].map.points[0]
	},
	Random(points) {
		return points[points.length * Math.random() | 0]
	},
	Weakest(points) {
		return points.sort((x, y) => x.power - y.power)[0]
	},
	Strongest(points) {
		return points.sort((x, y) => y.power - x.power)[0]
	},
	["Least defended"](points) {
		return points.sort((x, y) => (x.real?x.real.defence:x.power*x.length) - (y.real?y.real.defence:y.power*y.length))[0]
	},	
	["Most defended"](points) {
		return points.sort((x, y) => (y.real?y.real.defence:y.power*y.length) - (x.real?x.real.defence:x.power*x.length))[0]
	},	
	Closest(points) {
		return points.sort((x, y) => x.distance - y.distance)[0]
	},
	Farthest(points) {
		return points.sort((x, y) => y.distance - x.distance)[0]
	},
	["Least deep"](points) {
		return points.sort((x, y) => x.depth - y.depth)[0]
	},	
	Deepest(points) {
		return points.sort((x, y) => y.depth - x.depth)[0]
	},	
	["Highest damage"](points, slider) {
		return points.map(x => [x, slider.predictDamage(x)]).sort((x,y) => y[1] - x[1])[0][0]
	},	
	["Lowest solo ETA"](points, slider) {
		return points.map(x => [x, slider.predictDamage(x) / (x.real?x.real.defence:x.power*x.length)]).sort((x,y) => y[1] - x[1])[0][0]
	},	
}
		
const sliderHandler = {
	_init() {
		this.color = this.color || (this.element?(gui.theme.typeColors[this.element]):("hsl("+(Math.random()*360|0)+(this.clone?",30%,40%)":",100%,30%)")))
		this.target = null
		if (this.targetIndex !== undefined) this.assignTarget(game.map.points[this.targetIndex])
		if (this.target) this.targetIndex = this.target.index
		this.growth = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:v[x]):v,v),this.growth || {})
		this.level = this.level || 0
		this.multi = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:5**Math.max(0,(this.level - 1))/*Math.max(v[x], 5**Math.max(0,(this.level - 1)))*/):v,v),this.multi || {})
		this.levelMulti = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:Math.min(v[x], 5)):v,v),this.levelMulti || {})
		this.stats = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?0:v[x]):v,v),this.stats || {})
		this.charge = this.charge || 0
		this.imbuement = this.imbuement || 0
		this.safeImbuement = this.safeImbuement || 1
		this.channel = this.channel || []
		this.learn = this.learn || []
		this.start = this.start || {}
		this.presets = this.presets || {}
		this.end = this.end || {}
		this.onSame = this.onSame || 0
		this.victoryTimer = this.victoryTimer || 0
		this.lastTarget = this.lastTarget || this.targetIndex || 0
		this.role = this.role || 0
		this.team = this.team || 0
		this.equipped = 0
		
		this.getLevelStats()
		
		if (game.maps && !this.clone) Object.keys(game.maps).map(x => {
			if (x == "main") return
			this.start[x] = this.start[x] || Object.assign({}, this.stats)
			this.end[x] = this.end[x] || Object.assign({}, this.stats)
		})
		this.artifacts = this.artifacts || {}
		Object.entries(this.artifacts).map(x => this.equip(x[0], x[1]))
		
		this.atFilter = Object.assign({
			types : [],
			neverTypes : [],
			specials : [],
			pointSpecials : [],
			neverSpecials : [],
			disabled : false,
			autoZero : true,
			autoMine : true,
			autoNew : true,
			childNext : false
		}, this.atFilter)
		
		this.atSelector = this.atSelector || "Random"
		
		this.dvTarget = createElement("div", "slider"+(this.clone?" clone":""))
		this.dvTarget.onclick = (event) => {
			if (this.clone == 2 && this.target == gui.target.point) {
				this.fullDestroy()
				game.map.updateSpellCosts()
				if (gui.target.point) gui.target.updateUpgrades(true)
			} else {
				this.target == gui.target.point?(this.assignTarget(null, false, true)):this.assignTarget(gui.target.point, false, true)
			}
		}

		this.dvColor = createElement("div", "slider-color", this.dvTarget)
		this.dvInfo = createElement("div", "slider-info", this.dvTarget)
		this.dvCharge = createElement("div", "slider-charge", this.dvTarget)
		
		this.dvDisplay = createElement("div", "slider"+(this.clone?" clone":""), this.clone?gui.sliders.dvClones:gui.sliders.dvReal)
		this.dvHeader = createElement("div", "slider-header", this.dvDisplay)
		this.dvLevel = createElement("div", "slider-level", this.dvHeader, this.level || "0")
		if (!this.clone)
			this.dvLevel.onclick = (event) => gui.sliders.levelUp.set(this)
		
		this.dvBigColor = createElement("div", "slider-color", this.dvHeader, this.clone?this.clone == 2?"SUMMON":"CLONE":"")
		this.dvBigColor.title = this.clone?this.clone==2?"Summonned clones only exist while attacking specific node":"Mechanical clones don't have concept of growth, learning, ascending or lack of spirit":"Double click to change color"
		this.dvBigColor.ondblclick = (event) => {
/*			this.dvBigColor.style.background = this.clone?'linear-gradient(to right, hsl(0,30%,40%), hsl(120,30%,40%), hsl(240,30%,40%), hsl(360,30%,40%) )':'linear-gradient(to right, hsl(0,100%,30%), hsl(120,100%,30%), hsl(240,100%,30%), hsl(360,100%,30%) )'
			this.dvBigColor.onclick = (event) => {
				this.dvBigColor.onclick = null
				this.dvBigColor.style.background = ""
				this.setColor("hsl("+((event.offsetX / this.dvBigColor.offsetWidth * 360)|0)+(this.clone?",30%,40%)":",100%,30%)"))
			}*/
			gui.colorPicker.display(this, "color", event.clientX, event.clientY)
		}

		this.dvTargetPoint = createElement("div", "slider-target", this.dvHeader)
		this.dvTargetBorder = createElement("img", "slider-target-border", this.dvHeader)
		this.dvTargetPoint.onmousemove = (event) => {
			if (gui.map.slider == this)
				gui.hover.set(this.target, event.clientX, event.clientY)
			else 
				gui.sliders.hover.set(this.target, event.clientX, event.clientY)
			this.hovered = true
			//display point info
		}
		
		this.dvTargetPoint.onmouseleave = this.dvTargetPoint.onmouseout = (event) => {
			if (gui.map.slider == this)
				gui.hover.reset()
			else
				gui.sliders.hover.reset()
			this.hovered = false
			//hide point info
		}
		
		this.rolePicker = ListPicker({
			parent : this.dvDisplay,
			container : this,
			value : "role",
			className : "role team-"+POINT_TYPES[this.team + 3],
			name : "Role",
			values : [ROLE_FREE,ROLE_LEADER,ROLE_FOLLOWER],
			texts : ["Free", "Leader", "Follower"],
			visible : () => game.skills.party && this.clone != 2,
			onSame : () => {
				this.rolePicker.dvDisplay.classList.toggle("team-"+POINT_TYPES[this.team + 3], false)
				this.team = (this.team + 1) % 4
				this.rolePicker.dvDisplay.classList.toggle("team-"+POINT_TYPES[this.team + 3], true)
			}
		})
		
		this.equipList = EquipList({
			parent : this.dvDisplay,
			slider : this,
			visible : () => !(this.clone || !game.skills.artifacts)
		})
		
		this.gild = this.gild || false
		this.cbGild = GuiCheckbox({
			parent : this.dvDisplay,
			container : this,
			value : "gild",
			visible : () => game.skills.gild,
			override : () => masterSlider.masterGild,
			title : "Gilding touch",
			hint : "Spend mana to produce gold while fighting"
		})
		
		this.imbuements = SingleAttributePicker({
			parent : this.dvDisplay,
			container : this,
			value : "imbuement",
			title : "Imbuement: ",
			hint : "Consumes mana to add current power to chosen element",
			attributeVisible(x, n) {
				if (n && n < 3) return false
				return (!n || game.growth[x])
			},
			visible : () =>	!(this.clone || !(game.skills.imbuement)),
			override : () => (masterSlider.masterImbuement),
			onSet : () => game.nextTarget = true
		})
		
		this.safeImbuementsSwitch = GuiCheckbox({
			parent : this.imbuements.dvDisplay,
			container : this,
			value: "safeImbuement",
			title: "Safe",
			hint : "Disable imbuement if less than 10 seconds available"
		})
		
		this.channels = MultiAttributePicker({
			parent : this.dvDisplay,
			container : this,
			value : "channel",
			title : "Channel: ",
			hint : "Halts chosen attributes' growth to give bonus equal to current value to other sliders",
			attributeVisible(x, n) {
				return (n && game.growth[x])
			},
			visible : () =>	!(this.clone || !(game.skills.channel)),
			override : () => (masterSlider.masterChannel),
			onSet : () => game.nextTarget = true,
			onUpdate : () => {
				this.updateSliders()
			},
		})
		
		this.learns = MultiAttributePicker({
			parent : this.dvDisplay,
			container : this,
			value : "learn",
			title : "Growth boost: ",
			hint : "Consumes experience to triple the growth",
			attributeVisible(x, n) {
				return (n && game.growth[x])
			},
			visible : () =>	!(this.clone || !(game.skills.learn)),
			onUpdate : () => {
				this.updateSliders()
			},
		})
		
		this.dvStats = createElement("div", "slider-stats", this.dvDisplay)

		this.displayStats = Object.keys(this.growth).map(x => {
			let stat = {name : x}
			stat.dvDisplay = createElement("div", "slider-stat", this.dvStats)
			stat.dvName = createElement("div", "slider-name", stat.dvDisplay, x.capitalizeFirst()+ ": ")
			stat.dvValue = createElement("div", "slider-value", stat.dvDisplay)
			stat.dvName.onclick = stat.dvValue.onclick = (event) => {
				this.displayStatName = this.displayStatName == x?"":x
				this.displayStats.map(x => x.expSlider.update())
			}
			stat.expSlider = createGrowthSlider(this.growth, x, stat.dvDisplay)			
			stat.expSlider.visible = () => (!this.clone && game.skills.invest) && (settings.showGrowthSliders || this.displayStatName == x)
			return stat
		})
		
		this.dvAutoTarget = createElement("div", "autotarget", this.dvDisplay, "Look for a new target when...")
		
		this.dvATSwitches = createElement("div", "autotarget-switches", this.dvAutoTarget)
		
		this.cbAutoTarget = GuiCheckbox({
			parent : this.dvATSwitches,
			container : this.atFilter,
			value : "disabled",
			reverse : true,
			title : "Free",
			visible : () => game.skills.autoTarget,
			hint : "Enables autotargetting"
		})
		
		this.cbAutoTargetNew = GuiCheckbox({
			parent : this.dvATSwitches,
			container : this.atFilter,
			value : "autoNew",
			title : "Attacking",
			visible : () => game.skills.smartMine,
			hint : "Enables autoretargetting while attacking"
		})
				
		this.cbAutoTargetZero = GuiCheckbox({
			parent : this.dvATSwitches,
			container : this.atFilter,
			value : "autoZero",
			title : "No damage",
			visible : () => game.skills.smartAuto,
			hint : "Enables autotargetting if dealing zero or negative damage"
		})
		
		this.cbAutoTargetMine = GuiCheckbox({
			parent : this.dvATSwitches,
			container : this.atFilter,
			value : "autoMine",
			title : "Mining",
			visible : () => game.skills.smartMine,
			hint : "Enables autotargetting if mining"
		})
				
		this.cbAutoTargetChild = GuiCheckbox({
			parent : this.dvAutoTarget,
			container : this.atFilter,
			value : "childNext",
			title : "Target connected if possible",
//			visible : () => game.skills.smartMine,
			hint : "Targets a new node connected to captured one if possible"
		})
				
		this.priorities = MultiAttributePicker({
			parent : this.dvAutoTarget,
			container : this.atFilter,
			value : "types",
			valueNot : "neverTypes",
			title : "Priorities: ",
			hint : "Prioritizes points of chosen types when autotargetting",
			attributeVisible(x, n) {
				if (n > 2) return game.skills.autoTargetElements && game.growth[x]
				return true
			},
			onSet : () => game.nextTarget = true,
			visible : () =>	game.skills.autoTargetFilter
		})
		
		this.specialPriorities = MultiSpecialPicker({
			parent : this.dvAutoTarget,
			container : this.atFilter,
			value : "pointSpecials",
			valueNot : "neverSpecials",
			title : "Shields: ",
			hint : "Prioritizes points with chosen shields when autotargetting",
			attributeVisible(x, n) {
				return !n || game.statistics[["_","special_blocks","_","special_clones","special_resists","special_nobuilds","special_noclones","special_alones","special_nochannels"][n]]
			},
			onSet : () => game.nextTarget = true,
			visible : () =>	game.skills.autoTargetSelector && game.realMap.level > 12
		})
		
/*		this.specialAvoid = MultiSpecialPicker({
			parent : this.dvAutoTarget,
			container : this.atFilter,
			value : "neverSpecials",
			title : "Avoid: ",
			hint : "Never targets points with chosen shields when autotargetting",
			attributeVisible(x, n) {
				return !n || game.statistics[["_","special_blocks","_","special_clones","special_resists","special_nobuilds","special_noclones","special_alones","special_nochannels"][n]]
			},
			onSet : () => game.nextTarget = true,
			visible : () =>	game.skills.autoTargetSelector && game.realMap.level > 12
		})*/
		
		this.dvATSelector = createElement("div", "selectors", this.dvAutoTarget)
		
		this.selector = ListPicker({
			parent : this.dvATSelector,
			container : this,
			className : "selector",
			value : "atSelector",
			name : "Target",
			values : Object.keys(SELECTORS),
			texts : Object.keys(SELECTORS),
			expanded : false,
			itemVisibility: (x) => (!x.index && game.skills.mining)|| x.index < 6 || game.skills.autoTargetDistance,
			onSet : () => {
				this.selector.expanded = !this.selector.expanded && this.selector.same
				const visibleOptions = this.selector.buttons.filter(x => game.sliders[0].selector.itemVisibility(x)).length
				if (this.selector.expanded) {
					this.selector.buttons.map((x,n) => {
//						if (n != this.selector.index)
						x.dvDisplay.style.top = (-25 * (visibleOptions - n - 1)) + "px"
                        x.dvDisplay.style.height = "15px"
//						x.dvDisplay.classList.toggle("hidden", n > 4 && !game.skills.autoTargetDistance)
					})
				} else {
					this.selector.buttons.map((x,n) => {
						x.dvDisplay.style.height = (this.selector.index == n)?"15px":0
						x.dvDisplay.style.top = 0
					})
				}
			},
		})
		
		this.dvATSelector.onmouseleave = /*this.dvATSelector.onmouseout = */(event) => {
			if (!this.selector.expanded) return
			this.selector.buttons.map((x,n) => {
				x.dvDisplay.style.height = (this.selector.index == n)?"15px":0
				x.dvDisplay.style.top = 0
			})
			this.selector.expanded = false
		}

		this.dvATApply = createElement("div", "apply button", this.dvDisplay, "Autotarget now")
		this.dvATApply.onclick = (event) => {
			this.assignTarget(null)
			this.autoTarget(true)
		}
		
		if (this.clone == 2) {
			this.dvUnsummon = createElement("div", "unsummon button", this.dvDisplay, "Unsummon")
			this.dvUnsummon.onclick = (event) => {
				this.fullDestroy()
				game.map.updateSpellCosts()
				if (gui.target.point) gui.target.updateUpgrades(true)
			}
		}

		this.dvMapIcon = createElement("div", "slider-icon"+(this.clone?" clone":""), gui.map.dvSliders)
		this.dvMapIcon.onmousemove = (event) => {
			gui.map.hoverSlider = this
			gui.hover.set(this.target, event.x, event.y)
		}
		
		this.dvMapIcon.onmousedown = (event) => {
			if (this.target) {
				const {x,y} = this.target.coordinatesOn(this.target.position, true)
				gui.mainViewport.setTargetXY(x, y)
			}
			if (event.shiftKey && this.target) {
				gui.target.set(this.target, event.x, event.y)
			} else {
				if (gui.map.sliderInfo)
					gui.map.sliderInfo.remove()
				if (gui.map.slider == this) {
					delete gui.map.sliderInfo
					delete gui.map.slider
					return
				}
				gui.map.sliderInfo = this.dvDisplay
				gui.map.slider = this
				gui.map.dvSliders.appendChild(this.dvDisplay)
				this.updateFullVisibility()
				this.updateSliders()
				this.dvDisplay.style.left = event.x + "px"
				this.dvDisplay.style.top = event.y + "px"
			}
		}
		
		this.dvMapIcon.onmouseleave = this.dvMapIcon.onmouseout = (event) => {
			delete gui.map.hoverSlider
			gui.hover.reset()
		}
		
		this.sparks = new Set()
		
		this.setColor(this.color || "maroon")
		
		this.dvBigColor.draggable = this.dvMapIcon.draggable = true
		this.dvBigColor.ondragstart = this.dvMapIcon.ondragstart = (event) => {
			event.dataTransfer.effectAllowed = "move"
			event.dataTransfer.setData("game/slider", game.sliders.indexOf(this))
			event.dataTransfer.setData("game/clone", this.clone || 0)
		}

		this.dvDisplay.ondragover = this.dvMapIcon.ondragover = (event) => {
			if ([...event.dataTransfer.types].includes('game/slider'))
				return false
		}
		this.dvDisplay.ondrop = this.dvMapIcon.ondrop = (event) => {
			const clone = +event.dataTransfer.getData("game/clone")
			if (clone != (this.clone || 0)) return
			const index = +event.dataTransfer.getData("game/slider")
			const here = game.sliders.indexOf(this)
			if (here == -1 || index == here) return
			const slider = game.sliders.splice(index, 1)
			game.sliders.splice(here,0,...slider)
			if (gui.tabs.activeTab == "sliders") gui.sliders.onSet()
			game.sliders.map(x => gui.map.dvSliders.appendChild(x.dvMapIcon))
		}

		if (gui && gui.tabs.activeTab == "sliders") {
			this.updateFullVisibility()
		}
		
		if (game && game.map && game.real && !game.loading) {
			game.getReals(this)
/*			if (!this.target && !game.loading)
				this.autoTarget()
			game.getReals(this)*/
		}
	},
	
	getLevelStats() {
		this.artifactSlots = ((1 + this.level || 0) / 2 + 2 )| 0
		this.levelUpCost = 2e46 * 1e3 ** this.level
		this.multiCost = 1e43 * 1e3 ** this.level
	},
	
	getStatTiers() {
		const baseData = Object.keys(this.stats).map(y => [y,((1,Math.log10(this.stats[y]/(this.levelMulti[y]*this.multi[y]*game.real.multi[y]))))]).sort((x,y) => x[1]-y[1])
		const tiers = Array(6).fill(0)
		let tier = 0
		baseData[0].push(tier)
		tiers[tier]++
		for (let i = 1; i < baseData.length; i++) {
			if (baseData[i][1] - baseData[i-1][1] > 1) 
				tier++
			baseData[i].push(tier)
			tiers[tier]++
		}
		const total = tier?tiers.reduce((v,x,n) => v + x * (n), 0):15
		const rate = 15 / total
		let total2 = 0
		baseData.map(x => total2 += (x[2] = Math.floor(tier?(x[2])*rate:2)))
		while (total2 < 15) {
			total2++
			baseData[15-total2][2]++
		}
		
		return baseData.reduce((v,x) => (v[x[0]]=Math.min(5, x[2] * 0.5 + 1.5),v),{})
	},

	canLevel(x) {
		if (this.multiCost > game.resources.exp) return false
		if (!this.levelMulti[x] || !this.level) return false
		if (this.levelMulti[x] >= 5) return false
		return true
	},
	
	canLevelUp() {
		if (this.level && this.level >= 9) return false
		if (this.clone == 2 && game.skills.levelSummons) return true
		if (this.levelUpCost > game.resources.exp) return false
		return true
	},
	
	levelUp() {
		if (!this.canLevelUp()) return
		if (!this.clone) {
			game.resources.exp -= this.levelUpCost
			const data = this.getStatTiers()
			Object.keys(this.multi).map(x => {
				if (this.level)
					this.multi[x] *= 5//this.levelMulti[x]
				this.levelMulti[x] = data && data[x] || 1
			})
			Object.keys(this.stats).map(x => this.stats[x] = 0)
			Object.values(this.start).map(x => Object.assign(x, this.stats))
			Object.values(this.end).map(x => Object.assign(x, this.stats))
			this.level++
			this.getLevelStats()
			gui.sliders.update(true)
			gui.sliders.levelUp.update(true)
		} else if (this.clone == 2) {
			this.level = (this.level || 0) + 1
			if (this.level == 9 && game.map.level >= 34) 
				game.feats.summonLevel9 = 1
			this.stats[POINT_TYPES[this.element]] *= 2.1 - this.level * 0.1 + game.world.coreStats.summonGrowth//(this.level + 1) / this.level
		}
	},
	
	raiseMulti(name) {
		if (!this.canLevel(name)) return
		if (this.multiCost > game.resources.exp) return
		game.resources.exp -= this.multiCost
		this.levelMulti[name] += 0.5
		gui.sliders.update(true)
		gui.sliders.levelUp.update(true)
	},
	
	realign(element, update = true) {
		if (this.clone != 2 || this.element == element) return
		const temp = this.stats[POINT_TYPES[this.element]]
		this.stats[POINT_TYPES[this.element]] = 0
		this.element = element
		this.stats[POINT_TYPES[this.element]] = temp
		if (update) {
			this.setColor(gui.theme.typeColors[this.element])
			this.updateFullVisibility()
		}
	},
	
	autoTarget(forced) {
		if (this.clone == 2) return
		let baseParent = (this.atFilter.childNext && this.lastCapture)?this.lastCapture:null
		delete this.lastCapture
//		if (baseParent) console.log(baseParent)
			
		if (this.target && (!this.target.owned || !this.target.index) && this.customTarget && !forced)
			return

		if (game.skills.mining && this.atSelector == "Mining") {
			this.assignTarget(game.map.points[0])
			if (!game.loading)
				game.getReals()
			return
		}

		if (this.target && !(this.target.index && game.skills.smartMine && this.atFilter.autoNew) && (!this.target.owned || (!game.skills.smartMine || !this.atFilter.autoMine) && !this.target.index && game.skills.mining) && !(game.skills.smartAuto && this.atFilter.autoZero && this.real && (this.real.attack <= 0))) return
		if (this.target && this.target.owned) this.assignTarget(null)
		if ((!game.skills.autoTarget || this.atFilter.disabled) && !forced) {
			this.assignTarget(null)
			if (!game.loading)
				game.getReals()
			return
		}

		const pointFilterFunction = x => x.away == 1 && !x.locked && (!x.boss || x.boss <= game.map.boss) && (!game.skills.smartAuto || !this.atFilter.autoZero || x.real && (this.predictDamage(x) > 0)) && (x.special != SPECIAL_ALONE || !x.attackers.size || (this.target && this.target == x)) && !this.atFilter.neverSpecials.includes(x.special || 0) && !this.atFilter.neverTypes.includes(x.type || 0)
		
		let basePoints = baseParent?[...baseParent.children]:game.map.points
		
		let points = basePoints.filter(pointFilterFunction)
		if (baseParent && !points.length) {
			baseParent = null
			basePoints = game.map.nearbyPoints || game.map.points
			points = basePoints.filter(pointFilterFunction)
		}
		
		points = points.map(x => [x, (this.atFilter.types.includes(x.type)?1:0) +
						(this.atFilter.pointSpecials.includes(x.special || 0)?1:0)+
						(((this.atFilter.specials.includes(AT_F_KEY) && x.key) ||
						(this.atFilter.specials.includes(AT_F_LOCK) && x.lock) ||
						(this.atFilter.specials.includes(AT_F_EXIT) && x.exit) ||
						(this.atFilter.specials.includes(AT_F_BOSS) && x.boss))?1:0)
					]).sort((x,y) => y[1]-x[1])	
		points = points.filter(x => x[1] == points[0][1]).map(x => x[0])
		
		if (!points.length) {
			if (game.skills.mining && game.skills.smartHome && game.map) 
				this.assignTarget(game.map.points[0])
			else
				this.assignTarget(null)
			if (!game.loading)
				game.getReals()
			return
		}
		
		this.assignTarget(SELECTORS[this.atSelector](points, this))
		if (!game.loading)
			game.getReals()
		if (this.target) game.iterations = GAME_ADVANCE_ITERATIONS
	},
	
	setColor(color) {
		this.color = color
		this.dvColor.style.backgroundColor = this.dvBigColor.style.backgroundColor = this.dvMapIcon.style.backgroundColor = color
		const colorData = colorToRGBA(color)
		const colorLevel = colorData[0] * 299 + colorData[1] * 587 + colorData[2] * 114
		const textColor = colorLevel>128000?"black":"white"
		this.dvColor.style.color = this.dvBigColor.style.color = this.dvMapIcon.style.color = textColor
	},
	
	updateTarget(point) {
		this.dvTarget.classList.toggle("active", this.target == point)
		this.dvTarget.classList.toggle("free", this.isFree())
		this.dvTarget.classList.toggle("notransition",false)
		this.dvTarget.classList.toggle("hidden", this.clone == 2 && this.target != point)
		this.dvColor.innerText = this.target?this.target.specialText?this.target.specialText:"⭕\uFE0E":""
		if (this.target) {
			this.dvColor.style.fontSize = (350 / this.target.specialTextSize) + "px"
		}
		
		if (!this.real) console.log(this)
									
		if (this.real.attackTarget === undefined && gui.target.point) {
			if (this.target == gui.target.point) {
				this.real.attackTarget = this.real.attack
				this.real.attackSpirit = this.real.spirit
			} else {
				const real = this.getReal(gui.target.point, true)
				this.getAttack(gui.target.point, real)
				this.real.attackTarget = real.attack
				this.real.attackSpirit = real.spirit
			}
		}
		this.dvInfo.innerText = (!point.index?"Gold: " + displayNumber(this.real.attackTarget):"Attack: " + displayNumber(this.real.attackTarget)) + "/s\n" +
								(this.clone == 2?"Click to unsummon":(point.boss || this.clone || game.skills.power)?"":("Spirit: " + displayNumber(this.real.attackSpirit) + "\n"))

		this.dvTarget.classList.toggle("weak", !game.skills.power && !point.boss && !this.clone && point.real.localPower > this.real.attackSpirit)
		if (game.skills.charge)
			this.dvCharge.style.backgroundPosition = "0 " + ((1 - this.charge) * 44 | 0) + "px"
	},
	
	updateFullInfo() {
		this.displayStats.map((x,n) => {
			x.dvValue.innerText = displayNumber(this.stats[x.name] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x.name] || 0)) + 
								  (this.clone?"":" ("+(this.real.multi[x.name]!=1?"x"+displayNumber(this.real.multi[x.name],0)+" => ":"")+"+" + displayNumber(this.real.growth[x.name]) + "/s)") + 
								  ((this.real && (this.real[x.name] != this.stats[x.name] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x.name] || 0)))?" => " + displayNumber(this.real[x.name]):"")
		})
		if (this.real)
			this.imbuements.attributes.slice(3).map(x => {
				x.dvDisplay.classList.toggle("alert", game.resources.mana / this.real.imbuementCosts[x.name] < 10)
				x.dvDisplay.title = x.name.capitalizeFirst() + ": " + displayNumber(this.real.imbuementCosts[x.name]) + " mana/s"
			})
		this.dvTargetPoint.innerText = this.target?(this.target.specialText||""):""
		if (this.target) {
			this.dvTargetPoint.style.fontSize = (350 / this.target.specialTextSize) + "px"
		}
		this.dvTargetPoint.style.backgroundColor = this.target?(gui.theme.typeColors[this.target.type]):gui.theme.background
		this.dvTargetBorder.src = gui.images.specialBorders[this.target && this.target.special?this.target.special:0]
		this.dvLevel.innerText = this.level || "0"
		if (game.skills.artifacts) this.equipList.updateActive()
	}, 

	updateSliders() {
		if (!this.displayStats) return
		this.displayStats.map((x, n) => {
			const channel = (masterSlider.masterChannel?masterSlider.channel:this.channel).includes(n+1) && !this.artifacts.channelOrb && !this.artifacts.summonOrb
			const boost = this.learn.includes(n+1) && !channel
			x.expSlider.dvDisplay.classList.toggle("boost", boost)
			x.expSlider.dvDisplay.classList.toggle("channel", channel)
			if (boost) x.expSlider.text("Boost", 1)
			else if (channel) x.expSlider.text("Channel", 0.5)
			else x.expSlider.resetText()
			x.expSlider.update()
		})
	},
	
	updateFullVisibility() {
		this.displayStats.map(y => {
			y.dvDisplay.classList.toggle("hidden",!!(!(game.growth[y.name] || this.stats[y.name]) || (this.clone && !this.stats[y.name])))
//			y.expSlider.dvDisplay.classList.toggle("hidden",this.clone || !(game.skills.invest))
		})
		this.dvAutoTarget.classList.toggle("hidden", !(game.skills.autoTarget) || this.clone == 2 || !!(settings.masterHide == 2 && masterSlider.masterAutotarget))
		this.dvLevel.classList.toggle("hidden", !!(!(game.skills.sliderLevels) || this.clone && (this.clone != 2 || !game.skills.levelSummons)))
		this.dvATApply.classList.toggle("hidden", !(game.skills.autoTarget) || this.clone == 2)
		this.dvAutoTarget.classList.toggle("faded", !!(settings.masterHide == 1 && masterSlider.masterAutotarget))
		this.dvATSelector.classList.toggle("hidden", !(game.skills.autoTargetSelector))
		this.equipList.updateVisibility()
		this.equipList.update()
		this.rolePicker.update(true)
//		this.equipList.update()
		this.imbuements.updateVisibility()
		this.channels.updateVisibility()
		this.priorities.updateVisibility()
		this.specialPriorities.updateVisibility()
		this.learns.updateVisibility()
		this.updateSliders()
		this.cbGild.updateVisibility()
		this.cbAutoTarget.updateVisibility()
		this.cbAutoTargetMine.updateVisibility()
		this.cbAutoTargetZero.updateVisibility()
		this.selector.update(true)
	},
	
	render(c) {
		if (this.sparks.size) {
			c.save()
			c.beginPath()
			c.strokeStyle = this.color
			
			for (let spark of this.sparks) {
				spark.render(c)
				spark.advance()
				if (spark.dead) {
					this.sparks.delete(spark)
					animations.freeSpark(spark)
				}
			}
			
			if (gui.mainViewport.current.zoom < 1.5) {
				c.lineWidth = 1.5 / gui.mainViewport.current.zoom
			}
			
			c.stroke()
			c.restore()
		}
		
		if (!this.target || !this.target.onscreen && (!this.target.parent || !this.target.parent.onscreen) || !this.target.index && !settings.minerSparks ) return

		const an = this.target.parent?this.target.direction - 1 + (Math.random() + Math.random()):Math.random()*6.29
		const length = this.target.index?(Math.random() * Math.min(10, Math.abs(this.real.attack / this.target.power)) + 2) * (Math.random() + 0.6):this.target.size * (0.5 + 0.5 * Math.random())
		const {x,y} = this.target.coordinatesOn(this.target.position, true)

		this.sparks.add(animations.Spark(x, y, length, an))
	},
	
	isFree() {
		return !this.target || (this.target.owned && !(!this.index && game.skills.mining))
	},
	
	assignTarget(point, forced, custom) {
		if (this.clone == 2 && !forced) point = this.target || game.map.points[this.targetIndex]
		if (this.target) {
			this.target.attackers.delete(this)
			if (this.target.special == SPECIAL_ALONE) {
				this.target.calculateStats()
				if (gui.target.point == this.target)
					gui.target.updateUpgrades()
			}
		}
		
		if (custom)
			this.customTarget = true
		else
			delete this.customTarget
		
		if (point && point.owned && point.index) point = null
			
		if (point && point.special == SPECIAL_ALONE && point.attackers.size) {
			this.autoTarget()
			return
		}
		
		if (!point) {
			this.target = null
			if (this.hovered) gui.sliders.hover.reset()
		} else if (!(point.away > 1) && !(point.locked == 1)) {
			this.target = point
			if (this.hovered) gui.sliders.hover.set(this.target, -1)
		}
		if (this.target) {
			this.target.attackers.add(this)
			if (this.target.special == SPECIAL_ALONE) {
				this.target.calculateStats()
				if (gui.target.point == this.target)
					gui.target.updateUpgrades()
			}
		}
		if (this.dvMapIcon) {
			this.dvMapIcon.innerText = this.target?(this.target.specialText || "⭕\uFE0E"):""
			if (this.target)
				this.dvMapIcon.style.fontSize = (230 / this.target.specialTextSize) + "px"
		}
		
		if (game.skills.party && this.role == ROLE_LEADER && game.sliders)
			game.sliders.filter(x => x.role == ROLE_FOLLOWER && x.team == this.team).map(x => (!point || point.special != SPECIAL_ALONE)?x.assignTarget(this.target, false, true):x.autoTarget())

		game.world.update(true)
	},
		
	advance (deltaTime) {
		let free = this.isFree()
		
//		if (!free)
//			this.target.attack(this, deltaTime)
		
		let change = deltaTime / (!free && this.artifacts.reloadFlag?60:5)
		if (game.skills.charge)
			this.charge = Math.max(0, Math.min(1, free?this.charge + change:this.charge - change))
		
		if (game.skills.smartAuto && this.atFilter.autoZero && this.target && this.real && this.real.attack <= 0) {
			this.autoTarget()
		}
		
		if (this.target && this.target.owned && this.target.index) {
			this.assignTarget(null)
			this.autoTarget()
		}

		if (this.target && this.target.index && this.target.index == this.lastTarget) {
			this.onSame += deltaTime
		} else {
			this.onSame = 0
			if (this.target && this.target.index != this.lastTarget && this.artifacts.reloadShield)
				this.charge = 1
		}

		this.lastTarget = this.target?this.target.index:0
		
		this.victoryTimer = Math.max(0, (this.victoryTimer || 0) - deltaTime)
	},
	
	grow (mul) {
		if (this.clone) 
			return
		
		for (let n = 1; n < 7; ++n) {
			if ((masterSlider.masterChannel?masterSlider.channel:this.channel).includes(n) && !this.artifacts.channelOrb && !this.artifacts.summonOrb) continue
			const name = POINT_TYPES[n]
			this.stats[name] += this.real.growth[name] * mul
		}
	},
	
	getBaseRealGrowth() {
		if (!this.real) this.real = {}
		const real = this.real
		if (!real.production) real.production = {}
		RESOURCES.map(x => real.production[x] = 0)
		const target = this.target
		real.gotChannel = false
		real.producingExp = false
		if (!real.growth) real.growth = {}
		if (!real.multi) real.multi = {}

		Object.keys(this.stats).map((x,n) => {
			real.growth[x] = game.real.growth[x]
			real.multi[x] = this.multi[x] * this.levelMulti[x] * (this.artifacts.growthOrb?3:1) * (this.artifacts.expScales && game.real && game.real.production && Math.abs(game.real.production.exp) < game.real.growth.power / 1e12?2:1)
			
			if (n > 1) {
				if (this.artifacts.targetOrb && this.target && (this.target.type == n + 1)) this.real.multi[x] *= 5
				if (this.artifacts.masterOrb && this.target && (this.target.type == (n + 1) % 4 + 3)) this.real.multi[x] *= 3
				if (ARTIFACTS.superTargetOrb.equipped && ARTIFACTS.superTargetOrb.equipped.target && (ARTIFACTS.superTargetOrb.equipped.target.type == n + 1)) this.real.multi[x] *= 3
				if (ARTIFACTS.superMasterOrb.equipped && ARTIFACTS.superMasterOrb.equipped.target && (ARTIFACTS.superMasterOrb.equipped.target.type == (n + 3) % 4 + 3)) this.real.multi[x] *= 2
			}
			
			if (target && target.index == 0 && game.world.stats[x+"Boost"]) real.multi[x] *= (game.world.stats[x+"Boost"])
			
			if ((masterSlider.masterChannel?masterSlider.channel:this.channel).includes(n+1) && !this.artifacts.channelOrb && !this.artifacts.summonOrb) {
				real.growth[x] = 0
			} else if (this.learn.includes(n+1)) {
				if (game.resources.exp > 1e-6) {
					real.production.exp -= real.growth[x] * game.world.coreStats.boostCost
					real.multi[x] *= game.world.coreStats.boostMulti
					real.growth[x] *= real.multi[x]
				} else {
					this.learns.reset()
				}				
			} else {
				const gain = real.growth[x] * (1 - this.growth[x]) * (this.artifacts.expOrb?3:1)
				real.production.exp += gain
				if (gain)
					real.producingExp = true
				real.growth[x] *= this.growth[x] * real.multi[x]
			}
		})
	},
	
	applyGrowthArtifacts() {
		const real = this.real

		if (this.artifacts.powerOrb) {
			real.growth.power += real.growth.spirit + real.growth.fire + real.growth.ice + real.growth.blood + real.growth.metal
			real.growth.metal = real.growth.ice = real.growth.blood = real.growth.fire = real.growth.spirit = 0
		}
		
		if (this.artifacts.greatOrb) {
			real.growth.metal += real.growth.power / 4
			real.growth.ice += real.growth.power / 4
			real.growth.blood += real.growth.power / 4
			real.growth.fire += real.growth.power / 4
			real.growth.power = 0
		}
		
		if (this.artifacts.fireOrb) {
			real.growth.fire = real.growth.fire + real.growth.ice + real.growth.blood + real.growth.metal
			real.growth.metal = real.growth.ice = real.growth.blood = 0
		}
		
		if (this.artifacts.iceOrb) {
			real.growth.ice = real.growth.fire + real.growth.ice + real.growth.blood + real.growth.metal
			real.growth.metal = real.growth.blood = real.growth.fire = 0
		}
		
		if (this.artifacts.metalOrb) {
			real.growth.metal = real.growth.fire + real.growth.ice + real.growth.blood + real.growth.metal
			real.growth.ice = real.growth.blood = real.growth.fire = 0
		}
		
		if (this.artifacts.bloodOrb) {
			real.growth.blood = real.growth.fire + real.growth.ice + real.growth.blood + real.growth.metal
			real.growth.metal = real.growth.ice = real.growth.fire = 0
		}
		
	},
	
	getReal(target = this.target, noreal = false) {
		let real = {}
		if (!noreal) {
			if (!this.real) this.real = {}
			real = this.real
		}
		if (!real.imbuementCosts) real.imbuementCosts = {}
//		real.production.mana = 0
//		real.production.gold = 0
		real.imbuement = /*target && target.index?*/(masterSlider.masterImbuement?masterSlider.imbuement:this.imbuement)/*:0*/
		real.gild = target && target.index?(masterSlider.masterGild?masterSlider.gild:this.gild):0

		real.alone = !this.target || !game.sliders.some(x => x != this && x.target === this.target)
		let extraTimes = game.world.coreStats.channelBase
		if (!real.alone && this.target && this.target.index) {
			if (this.artifacts.shareCrown) 
				extraTimes *= 0
			else if (ARTIFACTS.shareCrown.equipped && ARTIFACTS.shareCrown.equipped.target == this.target) 
				extraTimes *= 2
		}
		
		POINT_TYPES.slice(1).map((x,n) => {
			real[x] = this.stats[x] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x] || 0)
		})

		POINT_TYPES.slice(1).map((x,n) => {
			if (extraTimes && (!target || target.channelFactor()))
				game.sliders.map(slider => {
					if (slider == this || slider.clone || slider.artifacts.shareCrown && !(slider.target && slider.target.index)) return
					let times = 0
					if (slider.artifacts.channelCrown && slider.target == target) times++
					if ((masterSlider.masterChannel?masterSlider.channel:slider.channel).includes(n+1)) times++
					if (slider.artifacts.summonOrb)
						times *= (this.clone==2)?2:0
										
					times *= extraTimes * (target?target.channelFactor():1)

					if (times) {
						if (this.artifacts.channelReceiver) times *= 2
						real[this.clone?POINT_TYPES[this.element || 1]:x] += times * (slider.stats[x] - (game.activeMap == "main"?0:slider.start[game.activeMap] && slider.start[game.activeMap][x] || 0))
						real.gotChannel = true
					}
				})
		})
		
		if (game.skills.charge && !this.clone) real.spirit *= this.charge?this.artifacts.reloadFlag?(2+(Math.min(this.charge * 5 | 0, 4))):2:1
		
		real.spirit = target?target.getActiveSpirit(this, real):real.spirit
		
		if (game.skills.fear && !this.clone) {
			real.power += real.spirit * game.resources.fears
		}

		if (game.world.coreStats.spiritElements) {
			const bonus = real.spirit * game.resources.clouds
			real.blood += bonus
			real.fire  += bonus
			real.ice   += bonus
			real.metal += bonus
		}

		POINT_TYPES.slice(3).map(x => real.imbuementCosts[x] = this.artifacts[x+"Ring"]?0:((Math.log10(real.power || 1) ** 4 / 1000) * Math.max(1,Math.min(real.power ** 0.5, real.power / (real[x] || 1) / 10))) || 0)
		
		real.miningPower = real.power
		
		if (real.imbuement) {
			if (game.resources.mana > ((masterSlider.masterImbuement?masterSlider.safeImbuement:this.safeImbuement)?((real.imbuementCosts[POINT_TYPES[real.imbuement]] || 0) * 10):1e-6)) {
				if (target && target.index && real.production)
					real.production.mana -= real.imbuementCosts[POINT_TYPES[real.imbuement]] || 0
				real[POINT_TYPES[real.imbuement]] += real.power
				if (!this.artifacts.imbueRing) real.power = 0
			} else {
				if (!masterSlider.masterImbuement)
					this.imbuements.set(0)
			}
		}
		
		if (this.artifacts.fireBracelet) {
			real.fire = real.fire + real.ice + real.blood + real.metal
			real.metal = real.ice = real.blood = 0
		}
		
		if (this.artifacts.iceBracelet) {
			real.ice = real.fire + real.ice + real.blood + real.metal
			real.metal = real.blood = real.fire = 0
		}
		
		if (this.artifacts.metalBracelet) {
			real.metal = real.fire + real.ice + real.blood + real.metal
			real.ice = real.blood = real.fire = 0
		}
		
		if (this.artifacts.bloodBracelet) {
			real.blood = real.fire + real.ice + real.blood + real.metal
			real.metal = real.ice = real.fire = 0
		}
		
		if (this.artifacts.nullRod && this.target && this.target.type) {
			this.real[POINT_TYPES[this.target.type]] = 0
		}
		
		if (this.artifacts.bloodFlag) real.blood /= 2
		if (this.artifacts.fireFlag)  real.fire  /= 2
		if (this.artifacts.iceFlag)   real.ice   /= 2
		if (this.artifacts.metalFlag) real.metal /= 2
				
		delete real.attackTarget

		if (target && target.real) {
			game.attacked.add(target)
		}
		
		real.elemental = real.blood + real.fire + real.ice + real.metal
		
		return real
	},
	
	getAttack(target = this.target, real = this.real) {
	
		if (this.clone == 2 && this.element && game.real.flagBonus[POINT_TYPES[this.element]] && (!target || target.channelFactor()))
			real[POINT_TYPES[this.element]] += game.real.flagBonus[POINT_TYPES[this.element]] * (target?target.channelFactor():1)

		real.absoluteDamage = 0
		if (this.artifacts.emeraldSword) 	real.absoluteDamage += real.spirit * game.resources.fears
		
		if (this.artifacts.bloodRod)   		real.absoluteDamage += 0.05 * real.blood
		if (this.artifacts.fireRod)    		real.absoluteDamage += 0.05 * real.fire 
		if (this.artifacts.iceRod)     		real.absoluteDamage += 0.05 * real.ice  
		if (this.artifacts.metalRod)   		real.absoluteDamage += 0.05 * real.metal
		
		if (this.artifacts.bloodStaff) 		real.absoluteDamage += real.blood
		if (this.artifacts.fireStaff)  		real.absoluteDamage += real.fire 
		if (this.artifacts.iceStaff)   		real.absoluteDamage += real.ice  
		if (this.artifacts.metalStaff) 		real.absoluteDamage += real.metal
		
		if (this.artifacts.pierceRod)  		real.absoluteDamage += 0.02 * (real.metal + real.blood +  real.fire + real.ice)

				
		if (this.clone == 2 && this.element && target && ARTIFACTS.summonBreaker.equipped && ARTIFACTS.summonBreaker.equipped.target == target) {
			real.absoluteDamage += real[POINT_TYPES[this.element]] * 0.1
		}			

		real.attack = target?target.getActivePower(this, real):0
		
		if (target && target.totalPower && this.clone && real.production) {
			const scale = Math.max(0,real.attack / game.map.basePower / (1 + (game.realMap.level - game.map.level)) ** 3)
			if (game.world.coreStats.summonThunder)
				real.production.thunderstone = game.production.thunderstone * Math.min(game.world.coreStats.summonThunder, scale) * ((this.level || 0) + 1)
			if (game.world.coreStats.summonGold)
				real.production.gold = game.production.gold * game.world.stats.goldSpeed * Math.min(game.world.coreStats.summonGold, scale) * ((this.level || 0) + 1)
			if (game.world.coreStats.summonScience)
				real.production.science = game.production.science * game.world.stats.scienceSpeed * Math.min(game.world.coreStats.summonScience, scale) * ((this.level || 0) + 1)
			if (game.world.coreStats.summonFears)
				real.production.fears = game.production.fears * Math.min(game.world.coreStats.summonFears, scale) * ((this.level || 0) + 1)
			if (game.world.coreStats.summonClouds)
				real.production.clouds = game.production.clouds * Math.min(game.world.coreStats.summonClouds, scale) * ((this.level || 0) + 1)
			if (game.world.coreStats.summonMana)
				real.production.mana = game.production.mana * game.world.stats.manaSpeed * Math.min(game.world.coreStats.summonMana, scale) * ((this.level || 0) + 1)
		}
		
		if (real.gild && game.skills.gild) {
			if (game.resources.mana > 1e-6) {
				if (real.production) {
					real.production.mana -= game.map.level 
					real.production.gold += real.attack ** 0.5
				}
			} else {
				if (masterSlider.masterGild)
					gui.sliders.master.cbGild.set(false)
				else
					this.cbGild.set(false)
			}
		}
		
		return real.attack
	},
	
	predictDamage(target) {
		return this.getAttack(target, this.getReal(target), true)
	},
	
	equip(name, slot = 0) {
		if (this.clone) 
			return 0
		let artifact = ARTIFACTS[name]
		
		if (!artifact || !game.research[name] || !game.research[name].done)
			return 0

		if (this.artifacts[name]){
			artifact.equipped = this
			if (slot) {
				Object.entries(this.artifacts).map(x => {
					if (x[1] == slot) {
						this.artifacts[x[0]] = this.artifacts[name]
					}
				})
				this.artifacts[name] = slot
			}
			this.equipped = Object.values(this.artifacts).some(x => x)
			game.world && game.world.update()
			return this.artifacts[name]
		}

		if (!slot) {
			const freeSlots = Array(this.artifactSlots+1).fill(1)
			Object.values(this.artifacts).map(x => freeSlots[x] = 0)
			slot = freeSlots.reduceRight((v,x,n) => (x && !v)?n:v,0)
		}

		if (!slot) 
			return 0
		
		Object.entries(this.artifacts).map(x => {
			if (x[1] == slot) this.unequip(x[0])
		})
		
		if ((artifact.equipped) && (artifact.equipped.artifacts) && (artifact.equipped.artifacts[name]) && (artifact.equipped.unequip))
			artifact.equipped.unequip(name)
		
		this.artifacts[name] = slot
		artifact.equipped = this
		this.equipped = Object.values(this.artifacts).some(x => x)
		this.updateSliders()
		game.world && game.world.update()

		return slot
//		artifact.onEquip && artifact.onEquip(this)
	},
	
	unequip(name) {
		if (!ARTIFACTS[name])
			return
		
		if (!this.artifacts[name])
			return
				
//		artifact.onUnequip && artifact.onUnequip(this)
		let artifact = ARTIFACTS[name]
		delete artifact.equipped
		delete this.artifacts[name]

		this.equipped = Object.values(this.artifacts).some(x => x)

		game.world && game.world.update()
		this.updateSliders()
	},
	
	unequipSlot(slot) {
		Object.entries(this.artifacts).map(x => {
			if (x[1] == slot)
				this.unequip(x[0])
		})
	},
	
	savePreset(name) {
		const data = {}
		data.color = this.color
		data.growth = this.growth
		data.gild = this.gild
		data.imbuement = this.imbuement
		data.safeImbuement = this.safeImbuement
		data.channel = this.channel
		data.learn = this.learn
		data.atFilter = this.atFilter
		data.atSelector = this.atSelector
		data.artifacts = this.artifacts
		data.role = this.role
		data.team = this.team
		this.presets[name] = LZString.compressToBase64(JSON.stringify(data))
	},
	
	loadPreset(name) {
		if (!this.presets[name]) return
		const data = JSON.parse(LZString.decompressFromBase64(this.presets[name]))
		const index = game.sliders.indexOf(this)
		if (index == -1) return
		const newSlider = Slider (this, data)
		game.sliders[index] = newSlider
//		Object.keys(newSlider.artifacts).map(x => newSlider.equip(x, newSlider.artifacts[x]))
		this.fullDestroy()
/*		this.setColor(data.color)
		this.gild = data.gild
		this.imbuement = data.imbuement
		Object.assign(this.growth, data.growth)
		this.safeImbuement = data.safeImbuement
		this.role = data.role
		this.team = data.team
		this.channel.splice(0, this.channel.length, ...data.channel)
		this.learn.splice(0, this.learn.length, ...data.learn)
		Object.keys(this.artifacts).map(x => this.unequip(x))
		Object.keys(data.artifacts).map(x => this.equip(x, data.artifacts[x]))
		Object.assign(this.atFilter, data.atFilter)*/
		
//		data.atFilter = this.atFilter
	},

	toJSON() {
		let o = Object.assign({}, this)
		delete o.sparks
		delete o.test
		delete o.slots
		delete o.equipList
		delete o.equipped
		delete o.artifactSlots
		delete o.levelUpCost
		delete o.multiCost
		delete o.displayStats
		delete o.imbuements
		delete o.safeImbuementsSwitch
		delete o.priorities
		delete o.specialPriorities
		delete o.specialAvoid
		delete o.selector
		delete o.cbGild
		delete o.cbAutoTarget
		delete o.cbAutoTargetMine
		delete o.cbAutoTargetZero
		delete o.cbAutoTargetChild
		delete o.rolePicker
		delete o.channels
		Object.keys(o).filter(x => x.substr(0,2) == "dv").map (x => {
			delete o[x]
		})
		delete o.targetIndex
		if (o.target) {
			o.targetIndex = o.target.index 
		}
		delete o.target
		delete o.real
		delete o.learns
		delete o.charge
		delete o.hovered
		delete o.lastCapture
		return o
	},
	
	destroy() {
		Object.keys(this.artifacts).map(x => this.unequip(x))
		for (let spark of this.sparks) {
			spark.dead = true
			this.sparks.delete(spark)
			animations.freeSpark(spark)
		}
		this.dvTarget.remove()
		delete this.dvTarget
		this.dvDisplay.remove()
		delete this.dvDisplay
		this.displayStats.map(x => {
			x.expSlider.destroy()
			x.dvDisplay.remove()
			delete x.dvDisplay
		})
		this.dvMapIcon.remove()
		if (gui.map.sliderInfo)
			gui.map.sliderInfo.remove()
		if (gui.map.slider == this) {
			delete gui.map.sliderInfo
			delete gui.map.slider
			return
		}
		delete this.dvMapIcon
		delete this.displayStats
	},
	
	fullDestroy() {
		this.destroy()
		if (this.target)
			this.target.attackers.delete(this)
		const index = game.sliders.indexOf(this)
		if (index > -1)
			game.sliders.splice(index, 1)
		if (gui.target.point) {
			gui.target.update()
			gui.target.updateUpgrades()
		}
		gui.updateTabs()		
	}
}

const Slider = Template(sliderHandler)

function createSummon(target, element) {
	if (!target) return
	let baseStats = {[POINT_TYPES[element || 1]] : 0}
	let sliders = game.sliders.filter(x => !x.clone)
	sliders.map(x => {
		Object.keys(x.stats).map(y => baseStats[POINT_TYPES[element || 1]] += x.stats[y] - (game.activeMap == "main"?0:x.start[game.activeMap][y]))
	})
	const summon = Slider({
		stats : baseStats,
		clone : 2,
		element, target,
		targetIndex : target.index
	})
	game.sliders.push(summon)
	summon.assignTarget(target)
	gui.updateTabs()
	if (gui.target.point == target)
		gui.target.set(target, -1)
}

const baseMasterSlider = {
	masterImbuement : false,
	imbuement : 0,
	safeImbuement : true,
	masterGild : false,
	gild : false,
	masterChannel: false,
	channel : [],
	masterAutotarget : false,
	atFilter : [],
	summonAvoidSame : true,
	summonAvoidNarrow : false
}

const masterSlider = Object.assign({}, baseMasterSlider)
