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
		return points.sort((x, y) => x.real.defence - y.real.defence)[0]
	},	
	["Most defended"](points) {
		return points.sort((x, y) => y.real.defence - x.real.defence)[0]
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
		this.stats = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?0:v[x]):v,v),this.stats || {})
		this.charge = this.charge || 0
		this.imbuement = this.imbuement || 0
		this.safeImbuement = this.safeImbuement || 1
		this.channel = this.channel || []
		this.learn = this.learn || []
		this.start = this.start || {}
		this.end = this.end || {}
		
		this.atFilter = this.atFilter || {
			types : [],
			specials : [],
			disabled : false
		}
		
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
		this.dvBigColor = createElement("div", "slider-color", this.dvHeader, this.clone?this.clone == 2?"SUMMON":"CLONE":"")
		this.dvBigColor.title = this.clone?this.clone==2?"Summonned clones only exist while attacking specific node":"Mechanical clones don't have concept of growth, learning, ascending or lack of spirit":"Double click to change color"
		this.dvBigColor.ondblclick = (event) => {
			this.dvBigColor.style.background = this.clone?'linear-gradient(to right, hsl(0,30%,40%), hsl(120,30%,40%), hsl(240,30%,40%), hsl(360,30%,40%) )':'linear-gradient(to right, hsl(0,100%,30%), hsl(120,100%,30%), hsl(240,100%,30%), hsl(360,100%,30%) )'
			this.dvBigColor.onclick = (event) => {
				this.dvBigColor.onclick = null
				this.dvBigColor.style.background = ""
				this.setColor("hsl("+((event.offsetX / this.dvBigColor.offsetWidth * 360)|0)+(this.clone?",30%,40%)":",100%,30%)"))
			}
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
		
		this.gild = this.gild || false

		this.cbGild = GuiCheckbox({
			parent : this.dvDisplay,
			container : this,
			value : "gild",
			visible : () => game.skills.gild,
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
			visible : () =>	!(this.clone || !(game.skills.imbuement))
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

		this.dvATApply = createElement("div", "apply button", this.dvATSelector, "Autotarget now")
		this.dvATApply.onclick = (event) => {
			this.assignTarget(null)
			this.autoTarget()
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
			this.getReal()
			if (!this.target)
				this.autoTarget()
			this.getReal()
		}
	},
	
	autoTarget() {
		if (this.clone == 2) return
		if (this.target && (!this.target.owned || !this.target.index && game.skills.mining) && !(game.skills.smartAuto && this.real && (this.real.attack <= 0))) return
		if (this.target && this.target.owned) this.assignTarget(null)
		if (!game.skills.autoTarget || this.atFilter.disabled) {
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
		this.dvColor.style.backgroundColor = color
		this.dvBigColor.style.backgroundColor = color
		this.dvMapIcon.style.backgroundColor = color
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
								  (this.clone?"":" (+" + displayNumber(this.real.growth[x.name]) + "/s)") + 
								  ((this.real && (this.real[x.name] != this.stats[x.name] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x.name] || 0)))?" => " + displayNumber(this.real[x.name]):"")
		})
		if (this.real)
			this.imbuements.attributes.slice(3).map(x => {
				x.dvDisplay.classList.toggle("alert", game.resources.mana / this.real.imbuementCosts[x.name] < 10)
				x.dvDisplay.title = x.name.capitalizeFirst() + ": " + displayNumber(this.real.imbuementCosts[x.name]) + " mana/s"
			})
		this.dvTargetPoint.innerText = this.target?(this.target.specialText||""):""
		this.dvTargetPoint.style.backgroundColor = this.target?(gui.theme.typeColors[this.target.type]):gui.theme.background
	}, 

	updateSliders() {
		if (!this.displayStats) return
		this.displayStats.map((x, n) => {
			const channel = this.channel.includes(n+1)
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
		this.dvAutoTarget.classList.toggle("hidden", !(game.skills.autoTarget) || this.clone == 2)
		this.dvATSelector.classList.toggle("hidden", !(game.skills.autoTargetSelector))
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
		
		const an = Math.random() * 6.29
		const length = this.target.index?(Math.random() * Math.min(10, (this.real.attack / this.target.power)) + 2) * (Math.random() * 0.5 + 0.5):this.target.size * (0.5 + 0.5 * Math.random())
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
	},
	
	grow (mul) {
		if (this.clone) 
			return
		
		POINT_TYPES.map((x,n) => {
			if (!n) return
			if (this.channel.includes(n)) return
			this.stats[x] += this.real.growth[x] * mul
		})
	},
	
	getReal(noloss = false) { //noloss for updating amidst damage application
		if (!this.real) this.real = {}
		if (!this.real.growth) this.real.growth = {}
		if (!this.real.imbuementCosts) this.real.imbuementCosts = {}
		this.real.usedMana = 0
		this.real.madeGold = 0
		this.real.expChange = 0
		this.real.imbuement = this.target && this.target.index?this.imbuement:0
		this.real.gild = this.target && this.target.index?this.gild:0
		
		Object.keys(this.stats).map((x,n) => {
			this.real.growth[x] = game.real.growth[x]
			this.real[x] = this.stats[x] - (game.activeMap == "main"?0:this.start[game.activeMap] && this.start[game.activeMap][x] || 0)
			game.sliders.map(slider => {
				if (slider == this || slider.clone) return
				if (slider.channel.includes(n+1))
					this.real[this.clone?POINT_TYPES[this.element || 1]:x] += slider.stats[x] - (game.activeMap == "main"?0:slider.start[game.activeMap] && slider.start[game.activeMap][x] || 0)
			})
			
			if (this.channel.includes(n+1)) {
				this.real.growth[x] = 0
			} else if (this.learn.includes(n+1)) {
				if (game.resources.exp > 1e-6) {
					this.real.expChange -= this.real.growth[x]
					this.real.growth[x] *= 3
				} else {
					this.learns.reset()
				}				
			} else {
				this.real.expChange += this.real.growth[x] * (1 - this.growth[x])
				this.real.growth[x] *= this.growth[x]
			}
		})
		if (game.skills.charge && !this.clone) this.real.spirit *= this.charge?2:1
		
		this.real.attackSpirit = gui.target.point?gui.target.point.getActiveSpirit(this):0
		this.real.spirit = this.target?this.target.getActiveSpirit(this):this.real.spirit
		
		if (game.skills.fear && !this.clone) this.real.power += this.real.spirit * game.resources.fears
		
		POINT_TYPES.slice(3).map(x => this.real.imbuementCosts[x] = (Math.log10(this.real.power || 1) ** 4 / 1000) * Math.max(1,Math.min(this.real.power ** 0.5, this.real.power / (this.real[x] || 1) / 10))) || 0
		
		if (this.real.imbuement) {
			if (game.resources.mana > (this.safeImbuement?(this.real.imbuementCosts[POINT_TYPES[this.real.imbuement]] || 0 * 10):1e-6)) {
				this.real.usedMana += this.real.imbuementCosts[POINT_TYPES[this.real.imbuement]] || 0
				this.real[POINT_TYPES[this.real.imbuement]] += this.real.power
				this.real.power = 0
			} else {
				this.imbuements.set(0)
			}
		}
		
		this.real.attack = this.target?this.target.getActivePower(this):0
		
		if (this.real.gild && game.skills.gild) {
			if (game.resources.mana > 1e-6) {
				this.real.usedMana += game.map.level 
				this.real.madeGold += this.real.attack ** 0.5
			} else {
				this.cbGild.set(false)
			}
		}		
		
		this.real.attackTarget = gui.target.point?gui.target.point.getActivePower(this):0
		if (this.target && this.target.real && !noloss) {
			game.attacked.add(this.target)
			this.target.real.loss += this.real.attack
		}
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.sparks
		delete o.test
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