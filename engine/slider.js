'use strict'

const AT_S_RANDOM = 0
const AT_S_CLOSEST = 1
const AT_S_FURTHEST = 2

const AT_F_KEY = 0
const AT_F_LOCK = 1
const AT_F_EXIT = 2
const AT_F_BOSS = 3

const SELECTORS = {
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
}

const sliderHandler = {
	_init() {
		this.color = this.color || (this.element?(gui.theme.typeColors[this.element]):("hsl("+(Math.random()*360|0)+(this.clone?",30%,40%)":",100%,30%)")))
		if (this.targetIndex !== undefined) this.assignTarget(game.map.points[this.targetIndex])
		if (this.target) this.targetIndex = this.target.index
		this.growth = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:v[x]):v,v),this.growth || {})
		this.multi = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:v[x]):v,v),this.multi || {})
		this.levelMulti = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:v[x]):v,v),this.levelMulti || {})
		this.stats = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?0:v[x]):v,v),this.stats || {})
		this.charge = this.charge || 0
		this.imbuement = this.imbuement || 0
		this.safeImbuement = this.safeImbuement || 1
		this.channel = this.channel || []
		this.learn = this.learn || []
		this.start = this.start || {}
		this.end = this.end || {}
		this.onSame = this.onSame || 0
		this.victoryTimer = this.victoryTimer || 0
		this.lastTarget = this.lastTarget || this.targetIndex
		
		this.level = this.level || 0
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
			specials : [],
			disabled : false
		}, this.atFilter)
		
		this.atSelector = this.atSelector || "Random"
		
		this.dvTarget = createElement("div", "slider"+(this.clone?" clone":""))
		this.dvTarget.onclick = (event) => {
			if (this.clone == 2 && this.target == gui.target.point) {
				this.fullDestroy()
			} else
				this.target == gui.target.point?(this.assignTarget(null)):this.assignTarget(gui.target.point)
		}

		this.dvColor = createElement("div", "slider-color", this.dvTarget)
		this.dvInfo = createElement("div", "slider-info", this.dvTarget)
		this.dvCharge = createElement("div", "slider-charge", this.dvTarget)
		
		this.dvDisplay = createElement("div", "slider"+(this.clone?" clone":""), this.clone?gui.sliders.dvClones:gui.sliders.dvReal)
		this.dvHeader = createElement("div", "slider-header", this.dvDisplay)
		this.dvLevel = createElement("div", "slider-level", this.dvHeader, this.level || "0")
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
			override : () => (masterSlider.masterImbuement)
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
			stat.expSlider = createGrowthSlider(this.growth, x, stat.dvDisplay)			
			return stat
		})
		
		this.dvAutoTarget = createElement("div", "autotarget", this.dvDisplay)
		
		this.cbAutoTarget = GuiCheckbox({
			parent : this.dvAutoTarget,
			container : this.atFilter,
			value : "disabled",
			reverse : true,
			title : "Autotarget when free",
			visible : () => game.skills.autoTarget,
			hint : "Enables autotargetting"
		})
		
		this.priorities = MultiAttributePicker({
			parent : this.dvAutoTarget,
			container : this.atFilter,
			value : "types",
			title : "Priorities: ",
			hint : "Prioritizes points of chosen types when autotargetting",
			attributeVisible(x, n) {
				if (n > 2) return game.skills.autoTargetElements && game.growth[x]
				return true
			},
			visible : () =>	game.skills.autoTargetFilter
		})
		
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
			itemVisibility: (x) => (x.index < 5 || game.skills.autoTargetDistance),
			onSet : () => {
				this.selector.expanded = !this.selector.expanded && this.selector.same
				if (this.selector.expanded) {
					this.selector.buttons.map((x,n) => {
						if (n != this.selector.index)
							x.dvDisplay.style.top = -25 * (this.selector.index - n) + "px"
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
		
		this.dvMapIcon = createElement("div", "slider-icon"+(this.clone?" clone":""), gui.map.dvSliders)
		this.dvMapIcon.onmousemove = (event) => {
			gui.hover.set(this.target, event.x, event.y)
		}
		
		this.dvMapIcon.onmousedown = (event) => {
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
		
		this.dvMapIcon.onmouseleave = this.dvMapIcon.onmouseout = (event) => {
			gui.hover.reset()
		}
		
		this.sparks = new Set()
		
		this.setColor(this.color || "maroon")
		
		if (gui && gui.tabs.activeTab == "sliders") {
			this.updateFullVisibility()
		}
		
		if (game && game.map && game.real) {
			this.getReal(true)
			if (!this.target)
				this.autoTarget()
			this.getReal()
		}
	},
	
	getLevelStats() {
		this.artifactSlots = ((1 + this.level || 0) / 2 + 2 )| 0
		this.levelUpCost = 2e45 * 10e3 ** this.level
		this.multiCost = 1e42 * 10e3 ** this.level
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
		return baseData.reduce((v,x) => (v[x[0]]=x[2] * 0.5 + 1.5,v),{})
	},

	canLevel(x) {
		if (this.multiCost > game.resources.exp) return false
		if (!this.levelMulti[x] || !this.level) return false
		if (this.levelMulti[x] >= 5) return false
		return true
	},
	
	canLevelUp() {
		if (this.levelUpCost > game.resources.exp) return false
		if (this.level >= 9) return false
		return true
	},
	
	levelUp() {
		if (!this.canLevelUp()) return
		game.resources.exp -= this.levelUpCost
		const data = this.getStatTiers()
		Object.keys(this.multi).map(x => {
			this.multi[x] *= this.levelMulti[x]
			this.levelMulti[x] = data && data[x] || 1
		})
		Object.keys(this.stats).map(x => this.stats[x] = 0)
		Object.values(this.start).map(x => Object.assign(x, this.stats))
		Object.values(this.end).map(x => Object.assign(x, this.stats))
		this.level++
		this.getLevelStats()
		gui.sliders.update(true)
		gui.sliders.levelUp.update(true)
	},
	
	raiseMulti(name) {
		if (!this.canLevel(name)) return
		if (this.multiCost > game.resources.exp) return
		game.resources.exp -= this.multiCost
		this.levelMulti[name] += 0.5
		gui.sliders.update(true)
		gui.sliders.levelUp.update(true)
	},
	
	autoTarget(forced) {
		if (this.clone == 2) return
		if (this.target && (!this.target.owned || !this.target.index && game.skills.mining) && !(game.skills.smartAuto && this.real && (this.real.attack <= 0))) return
		if (this.target && this.target.owned) this.assignTarget(null)
		if ((!game.skills.autoTarget || this.atFilter.disabled) && !forced) {
			this.assignTarget(null)
			return
		}
		
		let points = game.map.points.filter(x => x.away == 1 && !x.locked && (!x.boss || x.boss <= game.map.boss) && (!game.skills.smartAuto || x.real && (x.getActivePower(this) > 0))).map(x => [x, (this.atFilter.types.includes(x.type)?1:0) + 
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
			return
		}
		
		this.assignTarget(SELECTORS[this.atSelector](points))
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
									
		this.dvInfo.innerText = (!point.index?"Gold:" + displayNumber(this.real.attackTarget):"Attack: " + displayNumber(this.real.attackTarget)) + "/s\n" +
								(this.clone == 2?"Click to unsummon":(point.boss || this.clone || game.skills.power)?"":("Spirit: " + displayNumber(this.real.attackSpirit) + "\n"))

		this.dvTarget.classList.toggle("weak", !game.skills.power && !point.boss && !this.clone && point.real.localPower > this.real.attackSpirit)
		if (game.skills.charge)
			this.dvCharge.style.backgroundPosition = "0 " + ((1 - this.charge) * this.dvCharge.offsetHeight | 0) + "px"
	},
	
	updateFullInfo() {
		this.displayStats.map((x,n) => {
			x.dvValue.innerText = displayNumber(this.stats[x.name] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x.name] || 0)) + 
								  (this.clone?"":" ("+(this.real.multi[x.name]!=1?"x"+this.real.multi[x.name]+" => ":"")+"+" + displayNumber(this.real.growth[x.name]) + "/s)") + 
								  ((this.real && (this.real[x.name] != this.stats[x.name] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x.name] || 0)))?" => " + displayNumber(this.real[x.name]):"")
		})
		if (this.real)
			this.imbuements.attributes.slice(3).map(x => {
				x.dvDisplay.classList.toggle("alert", game.resources.mana / this.real.imbuementCosts[x.name] < 10)
				x.dvDisplay.title = x.name.capitalizeFirst() + ": " + displayNumber(this.real.imbuementCosts[x.name]) + " mana/s"
			})
		this.dvTargetPoint.innerText = this.target?(this.target.specialText||""):""
		this.dvTargetPoint.style.backgroundColor = this.target?(gui.theme.typeColors[this.target.type]):gui.theme.background
		this.dvLevel.innerText = this.level || "0"
	}, 

	updateSliders() {
		if (!this.displayStats) return
		this.displayStats.map((x, n) => {
			const channel = (masterSlider.masterChannel?masterSlider.channel:this.channel).includes(n+1) && !this.artifacts.channelOrb
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
			y.expSlider.dvDisplay.classList.toggle("hidden",this.clone || !(game.skills.invest))
		})
		this.cbGild.updateVisibility()
		this.dvAutoTarget.classList.toggle("hidden", !(game.skills.autoTarget) || this.clone == 2 || !!(settings.masterHide == 2 && masterSlider.masterAutotarget))
		this.dvLevel.classList.toggle("hidden", !!(!(game.skills.sliderLevels) || this.clone))
		this.dvATApply.classList.toggle("hidden", !(game.skills.autoTarget) || this.clone == 2)
		this.dvAutoTarget.classList.toggle("faded", !!(settings.masterHide == 1 && masterSlider.masterAutotarget))
		this.dvATSelector.classList.toggle("hidden", !(game.skills.autoTargetSelector))
		this.equipList.updateVisibility()
		this.equipList.update()
		this.imbuements.updateVisibility()
		this.channels.updateVisibility()
		this.priorities.updateVisibility()
		this.learns.updateVisibility()
		this.updateSliders()
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
			
			if (viewport.current.zoom < 1.5) {
				c.lineWidth = 1.5 / viewport.current.zoom
			}
			
			c.stroke()
			c.restore()
		}
		
		if (!this.target || !this.target.onscreen && (!this.target.parent || !this.target.parent.onscreen)) return
		
		const an = this.target.parent?this.target.direction - 1 + (Math.random() + Math.random()):Math.random()*6.29
		const length = this.target.index?(Math.random() * Math.min(10, Math.abs(this.real.attack / this.target.power)) + 2) * (Math.random() + 0.6):this.target.size * (0.5 + 0.5 * Math.random())
		const {x,y} = this.target.coordinatesOn(this.target.position, true)

		this.sparks.add(animations.Spark(x, y, length, an))
	},
	
	isFree() {
		return !this.target || (this.target.owned && !(!this.index && game.skills.mining))
	},
	
	assignTarget(point, forced ) {
		if (this.clone == 2 && !forced) point = this.target || game.map.points[this.targetIndex]
		if (this.target) this.target.attackers.delete(this)
		
		if (!point) {
			this.target = null
			if (this.hovered) gui.sliders.hover.reset()
		} else if (!(point.away > 1) && !(point.locked == 1)) {
			this.target = point
			if (this.hovered) gui.sliders.hover.set(this.target, -1)
		}
		if (this.target) this.target.attackers.add(this)
		if (this.dvMapIcon)
			this.dvMapIcon.innerText = this.target?(this.target.specialText || "⭕\uFE0E"):""
	},
		
	advance (deltaTime) {
		let free = this.isFree()
		
//		if (!free)
//			this.target.attack(this, deltaTime)
		
		let change = deltaTime / 5
		if (game.skills.charge)
			this.charge = Math.max(0, Math.min(1, free?this.charge + change:this.charge - change))
		
		if (game.skills.smartAuto && this.target && this.real.attack <= 0) {
			this.autoTarget()
		}

		if (this.target && this.target.index && this.target.index == this.lastTarget) {
			this.onSame += deltaTime
		} else {
			this.onSame = 0
		}
		this.lastTarget = this.target?this.target.index:0
		
		this.victoryTimer = Math.max(0, (this.victoryTimer || 0) - deltaTime)
	},
	
	grow (mul) {
		if (this.clone) 
			return
		
		POINT_TYPES.map((x,n) => {
			if (!n) return
			if ((masterSlider.masterChannel?masterSlider.channel:this.channel).includes(n) && !this.artifacts.channelOrb) return
			this.stats[x] += this.real.growth[x] * mul
		})
	},
	
	getReal(noloss = false) { //noloss for updating amidst damage application
		if (!this.real) this.real = {}
		if (!this.real.growth) this.real.growth = {}
		if (!this.real.multi) this.real.multi = {}
		if (!this.real.imbuementCosts) this.real.imbuementCosts = {}
		this.real.usedMana = 0
		this.real.madeGold = 0
		this.real.expChange = 0
		this.real.imbuement = this.target && this.target.index?(masterSlider.masterImbuement?masterSlider.imbuement:this.imbuement):0
		this.real.gild = this.target && this.target.index?(masterSlider.masterGild?masterSlider.gild:this.gild):0
		this.real.absoluteDamage = 0
		
		Object.keys(this.stats).map((x,n) => {
			this.real.growth[x] = game.real.growth[x]
			this.real.multi[x] = this.multi[x] * this.levelMulti[x] * (this.artifacts.growthOrb?3:1)
			this.real[x] = this.stats[x] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x] || 0)
			game.sliders.map(slider => {
				if (slider == this || slider.clone) return
				let times = 0
				if (slider.artifacts.channelCrown && slider.target == this.target) times++
				if ((masterSlider.masterChannel?masterSlider.channel:slider.channel).includes(n+1)) times++
				if (times) {
					if (this.artifacts.channelReceiver) times *= 2
					this.real[this.clone?POINT_TYPES[this.element || 1]:x] += times * (slider.stats[x] - (game.activeMap == "main"?0:slider.start[game.activeMap] && slider.start[game.activeMap][x] || 0))
				}
			})
			
			if ((masterSlider.masterChannel?masterSlider.channel:this.channel).includes(n+1) && !this.artifacts.channelOrb) {
				this.real.growth[x] = 0
			} else if (this.learn.includes(n+1)) {
				if (game.resources.exp > 1e-6) {
					this.real.expChange -= this.real.growth[x]
					this.real.growth[x] *= 3 * this.real.multi[x]
				} else {
					this.learns.reset()
				}				
			} else {
				this.real.expChange += this.real.growth[x] * (1 - this.growth[x]) * (this.artifacts.expOrb?3:1)
				this.real.growth[x] *= this.growth[x] * this.real.multi[x]
			}
		})
		if (game.skills.charge && !this.clone) this.real.spirit *= this.charge?2:1
		
		this.real.attackSpirit = gui.target.point?gui.target.point.getActiveSpirit(this):0
		this.real.spirit = this.target?this.target.getActiveSpirit(this):this.real.spirit
		
		if (game.skills.fear && !this.clone) {
			this.real.power += this.real.spirit * game.resources.fears
			if (this.artifacts.emeraldSword)
				this.real.absoluteDamage += this.real.spirit * game.resources.fears
		}
		
		POINT_TYPES.slice(3).map(x => this.real.imbuementCosts[x] = (Math.log10(this.real.power || 1) ** 4 / 1000) * Math.max(1,Math.min(this.real.power ** 0.5, this.real.power / (this.real[x] || 1) / 10))) || 0
		
		if (this.real.imbuement) {
			if (game.resources.mana > ((masterSlider.masterImbuement?masterSlider.safeImbuement:this.safeImbuement)?(this.real.imbuementCosts[POINT_TYPES[this.real.imbuement]] || 0 * 10):1e-6)) {
				this.real.usedMana += this.real.imbuementCosts[POINT_TYPES[this.real.imbuement]] || 0
				this.real[POINT_TYPES[this.real.imbuement]] += this.real.power
				this.real.power = 0
			} else {
				if (!masterSlider.masterImbuement)
					this.imbuements.set(0)
			}
		}
		
		if (this.artifacts.fireRod)   {this.real.absoluteDamage += 0.05 * this.real.fire }
		if (this.artifacts.iceRod)    {this.real.absoluteDamage += 0.05 * this.real.ice  }
		if (this.artifacts.bloodRod)  {this.real.absoluteDamage += 0.05 * this.real.blood}
		if (this.artifacts.metalRod)  {this.real.absoluteDamage += 0.05 * this.real.metal}
		if (this.artifacts.pierceRod) {this.real.absoluteDamage += 0.02 * (this.real.metal + this.real.blood +  this.real.fire + this.real.ice) * 0.02}
		
		if (this.artifacts.powerOrb) {
			this.real.growth.power += this.real.growth.spirit + this.real.growth.fire + this.real.growth.ice + this.real.growth.blood + this.real.growth.metal
			this.real.growth.metal = this.real.growth.ice = this.real.growth.blood = this.real.growth.fire = this.real.growth.spirit = 0
		}
		
		if (this.artifacts.fireOrb) {
			this.real.growth.fire = this.real.growth.fire + this.real.growth.ice + this.real.growth.blood + this.real.growth.metal
			this.real.growth.metal = this.real.growth.ice = this.real.growth.blood = 0
		}
		
		if (this.artifacts.iceOrb) {
			this.real.growth.ice = this.real.growth.fire + this.real.growth.ice + this.real.growth.blood + this.real.growth.metal
			this.real.growth.metal = this.real.growth.blood = this.real.growth.fire = 0
		}
		
		if (this.artifacts.metalOrb) {
			this.real.growth.metal = this.real.growth.fire + this.real.growth.ice + this.real.growth.blood + this.real.growth.metal
			this.real.growth.ice = this.real.growth.blood = this.real.growth.fire = 0
		}
		
		if (this.artifacts.bloodOrb) {
			this.real.growth.blood = this.real.growth.fire + this.real.growth.ice + this.real.growth.blood + this.real.growth.metal
			this.real.growth.metal = this.real.growth.ice = this.real.growth.fire = 0
		}
		
		
		this.real.attack = this.target?this.target.getActivePower(this):0
		
		if (this.real.gild && game.skills.gild) {
			if (game.resources.mana > 1e-6) {
				this.real.usedMana += game.map.level 
				this.real.madeGold += this.real.attack ** 0.5
			} else {
				if (masterSlider.masterGild)
					gui.sliders.master.cbGild.set(false)
				else
					this.cbGild.set(false)
			}
		}		
		
		this.real.attackTarget = gui.target.point?gui.target.point.getActivePower(this):0
		if (this.target && this.target.real && !noloss) {
			game.attacked.add(this.target)
			this.target.real.loss += this.real.attack
		}
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
		this.updateSliders()
		
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
		this.updateSliders()
	},
	
	unequipSlot(slot) {
		Object.entries(this.artifacts).map(x => {
			if (x[1] == slot)
				this.unequip(x[0])
		})
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.sparks
		delete o.test
		delete o.slots
		delete o.equipList
		delete o.artifactSlots
		delete o.levelUpCost
		delete o.multiCost
		delete o.displayStats
		delete o.imbuements
		delete o.safeImbuementsSwitch
		delete o.priorities
		delete o.selector
		delete o.cbGild
		delete o.cbAutoTarget
		delete o.channels
		Object.keys(o).filter(x => x.substr(0,2) == "dv").map (x => {
			delete o[x]
		})
		if (o.target) o.targetIndex = o.target.index
		delete o.target
		delete o.real
		delete o.learns
		delete o.charge
		delete o.hovered
		return o
	},
	
	destroy() {
		Object.keys(this.artifacts).map(x => this.unequip(x))
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
		game.map.update()
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
}

const masterSlider = Object.assign({}, baseMasterSlider)