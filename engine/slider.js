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
		this.color = this.color || ("hsl("+(Math.random()*360|0)+(this.clone?",30%,40%)":",100%,30%)"))
		if (this.targetIndex !== undefined) this.assignTarget(game.map.points[this.targetIndex])
		this.growth = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?1:v[x]):v,v),this.growth || {})
		this.stats = POINT_TYPES.reduce((v,x,n) => (n?v[x]=(v[x]===undefined?0:v[x]):v,v),this.stats || {})
		this.charge = this.charge || 0
		this.imbuement = this.imbuement || 0
		this.channel = this.channel || []
		this.learn = this.learn || []
		
		this.atFilter = this.atFilter || {
			types : [],
			specials : [],
			disabled : false
		}
		
		this.atSelector = this.atSelector || "Random"
		
		this.dvTarget = createElement("div", "slider")
		this.dvTarget.onclick = (event) => {
			this.target == gui.target.point?(this.target = null):this.assignTarget(gui.target.point)
		}

		this.dvColor = createElement("div", "slider-color", this.dvTarget)
		this.dvInfo = createElement("div", "slider-info", this.dvTarget)
		this.dvCharge = createElement("div", "slider-charge", this.dvTarget)
		
		this.dvDisplay = createElement("div", "slider", gui.sliders.dvSliders)
		this.dvHeader = createElement("div", "slider-header", this.dvDisplay)
		this.dvBigColor = createElement("div", "slider-color", this.dvHeader, this.clone?"CLONE":"")
		this.dvBigColor.title = this.clone?"Mechanical clones don't have concept of growth, learning, ascending or lack of spirit":"Double click to change color"
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
			gui.sliders.hover.set(this.target, event.clientX, event.clientY)
			//display point info
		}
		
		this.dvTargetPoint.onmouseleave = this.dvTargetPoint.onmouseout = (event) => {
			gui.sliders.hover.reset()
			//hide point info
		}
		
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
		
		this.dvAutoTarget = createElement("div", "slider-switch", this.dvDisplay)
		this.dvATSwitch = createElement("input", "slider-checkbox", this.dvAutoTarget)
		this.dvATLabel = createElement("label", "slider-checkbox-label", this.dvAutoTarget, "Autotarget when free")
		this.dvATSwitch.id = "slider"+Math.random()
		this.dvATSwitch.type = "checkbox"
		this.dvATLabel.htmlFor = this.dvATSwitch.id
		this.dvATSwitch.checked = !this.atFilter.disabled
		this.dvATSwitch.onclick = (event) => {
			this.atFilter.disabled = !this.dvATSwitch.checked
			return true
		}
		
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
			onSet : () => {
				this.selector.expanded = !this.selector.expanded && this.selector.same
				if (this.selector.expanded) {
					this.selector.buttons.map((x,n) => {
						if (n != this.selector.index)
							x.dvDisplay.style.top = -25 * (this.selector.index - n) + "px"
                        x.dvDisplay.style.height = "15px"
						x.dvDisplay.classList.toggle("hidden", n > 4 && !game.skills.autoTargetDistance)
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
		if (this.target && (!this.target.owned || !this.target.index && game.skills.mining) && !(game.skills.smartAuto && this.real && !this.real.attack)) return
		if (this.target && this.target.owned) this.assignTarget(null)
		if (!game.skills.autoTarget || this.atFilter.disabled) {
			this.assignTarget(null)
			return
		}
		
		let points = game.map.points.filter(x => x.away == 1 && !x.locked && (!x.boss || x.boss <= game.map.boss) && (!game.skills.smartAuto || x.real && x.getActivePower(this))).map(x => [x, (this.atFilter.types.includes(x.type)?1:0) + 
												(((this.atFilter.specials.includes(AT_F_KEY) && x.key) ||
												(this.atFilter.specials.includes(AT_F_LOCK) && x.lock) ||
												(this.atFilter.specials.includes(AT_F_EXIT) && x.exit) ||
												(this.atFilter.specials.includes(AT_F_BOSS) && x.boss))?1:0)
											]).sort((x,y) => y[1]-x[1])	
		points = points.filter(x => x[1] == points[0][1]).map(x => x[0])
		
		if (!points.length) {
			this.assignTarget(null)
			return
		}
		
		this.assignTarget(SELECTORS[this.atSelector](points))
		if (this.target) game.iterations = 25000
	},
	
	setColor(color) {
		this.color = color
		this.dvColor.style.backgroundColor = color
		this.dvBigColor.style.backgroundColor = color
	},
	
	updateTarget(point) {
		this.dvTarget.classList.toggle("active", this.target == point)
		this.dvTarget.classList.toggle("free", this.isFree())
		this.dvTarget.classList.toggle("notransition",false)
		this.dvColor.innerText = this.target?this.target.specialText?this.target.specialText:"⭕\uFE0E":""
									
		this.dvInfo.innerText = (!point.index?"Gold:" + displayNumber(this.real.attackTarget):"Attack: " + displayNumber(this.real.attackTarget)) + "/s\n" +
								((point.boss || this.clone)?"":("Spirit: " + displayNumber(this.real.attackSpirit) + "\n"))

		this.dvTarget.classList.toggle("weak", !point.boss && !this.clone && point.real.localPower > this.real.attackSpirit)
		if (game.skills.charge)
			this.dvCharge.style.backgroundPosition = "0 " + ((1 - this.charge) * this.dvCharge.offsetHeight | 0) + "px"
	},
	
	updateFullInfo() {
		this.displayStats.map((x,n) => {
			x.dvValue.innerText = displayNumber(this.stats[x.name]) + 
								  (this.clone?"":" (+" + displayNumber(this.real.growth[x.name]) + "/s)") + 
								  ((this.real && (this.real[x.name] != this.stats[x.name]))?" => " + displayNumber(this.real[x.name]):"")
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
		this.dvAutoTarget.classList.toggle("hidden", !(game.skills.autoTarget))
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
		const length = this.target.index?Math.random() * Math.min(10, (this.real.attack / this.target.power)) + 2:this.target.size * 0.75
		const {x,y} = this.target.coordinatesOn(this.target.position, true)

		this.sparks.add(animations.Spark(x, y, length, an))
	},
	
	isFree() {
		return !this.target || (this.target.owned && !(!this.index && game.skills.mining))
	},
	
	assignTarget(point) {
		if (this.target) this.target.attackers.delete(this)
		
		if (!point) {
			this.target = null
			return
		}

		if (point.away > 1)
			return

		if (point.lock && !point.keyData.keyPoint.owned)
			return

		this.target = point
		if (this.target) this.target.attackers.add(this)
	},
		
	advance (deltaTime) {
		let free = this.isFree()
		
		if (!free)
			this.target.attack(this, deltaTime)
		
		let change = deltaTime / 5
		if (game.skills.charge)
			this.charge = Math.max(0, Math.min(1, free?this.charge + change:this.charge - change))
		
		if (game.skills.smartAuto && this.target && !this.real.attack) {
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
	
	getReal() {
		if (!this.real) this.real = {}
		if (!this.real.growth) this.real.growth = {}
		this.real.usedMana = 0
		this.real.expChange = 0
		this.real.imbuement = this.target && this.target.index?this.imbuement:0
		
		Object.keys(this.stats).map((x,n) => {
			this.real.growth[x] = game.real.growth[x]
			this.real[x] = this.stats[x]
			game.sliders.map(slider => {
				if (slider == this || slider.clone) return
				if (slider.channel.includes(n+1))
					this.real[this.clone?"power":x] += slider.stats[x]
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
		
		if (this.real.imbuement) {
			if (game.resources.mana > 1e-6) {
				this.real.usedMana += Math.log10(this.real.power) ** 4 / 1000
				this.real[POINT_TYPES[this.real.imbuement]] += this.real.power
				this.real.power = 0
			} else {
				this.imbuements.set(0)
			}
		}
		
		this.real.attack = this.target?this.target.getActivePower(this):0
		
		this.real.attackTarget = gui.target.point?gui.target.point.getActivePower(this):0
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.sparks
		delete o.test
		delete o.displayStats
		delete o.imbuements
		delete o.priorities
		delete o.selector
		delete o.channels
		Object.keys(o).filter(x => x.substr(0,2) == "dv").map (x => {
			delete o[x]
		})
		if (o.target) o.targetIndex = o.target.index
		delete o.target
		delete o.real
		delete o.learns
		delete o.charge
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
		delete this.displayStats
	}
}

const Slider = Template(sliderHandler)