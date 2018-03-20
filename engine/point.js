'use strict'

const POINT_TYPES = [
	"none",
	"power",
	"spirit",
	"blood",
	"fire",
	"ice",
	"metal"
]

const POINT_COLORS = [
	"#EEEEEE",
	"#FFFF55",
	"#ADFF2F",
	"#DC143C",
	"#FF8C00",
	"#00FFFF",
	"#BBBBBB",
]

const POINT_MAX_LEVEL = 4

const SPECIAL_BLOCK = 1
const SPECIAL_COLONY = 2
const SPECIAL_CLONE = 3
const SPECIAL_RESIST = 4

const pointHandler = {
	_init() {
		this.temp = {}
	},
	
	restoreState() {
		this.x = (this.distance * Math.cos(this.angle)).toDigits(3)
		this.y = (this.distance * Math.sin(this.angle)).toDigits(3)
		this.owned = this.owned || false
		this.children = new Set()
		this.parents = new Set()
		this.attackers = new Set()
		this.costs = this.costs || {}
		this.displays = this.displays || {}
		this.buildings = this.buildings || {}
	},
	
	calculateStats() {
		if (this.key) {
			this.keyData = this.map.keys[this.key]
			this.keyData.keyPoint = this
		}
		if (this.lock) {
			this.keyData = this.map.keys[this.lock]
			this.keyData.lockPoint = this
		}
		if (this.parent) {
			this.parent.children.add(this)
			this.dx = this.parent.x - this.x
			this.dy = this.parent.y - this.y
			this.length = Math.hypot(this.dy, this.dx)
			this.pathLength = this.length - this.size - this.parent.size
			this.available = this.parent.owned
		}
		this.sdx = this.edx = this.x + this.dx * (this.size + 0.45) / this.length
		this.sdy = this.edy = this.y + this.dy * (this.size + 0.45) / this.length
		if (this.parent) {
			this.sdx = this.parent.x - this.dx * (this.parent.size + 0.45) / this.length
			this.sdy = this.parent.y - this.dy * (this.parent.size + 0.45) / this.length
		}
		let depth = 0
		let pt = this
		while (pt.parent && pt.parent != pt) {
			depth++
			pt = pt.parent
			this.parents.add(pt)
		}
		this.depth = depth
		let locks = 0
		pt = this
		while (pt.parent && pt.parent != pt) {
			if (pt.lock) locks++
			pt = pt.parent
		}				
		this.power = this.customPower || (this.map.basePower * (4 ** (this.distance / this.map.size)) * ((1.1 + 0.005 * this.map.level) ** this.depth) * (1.2 ** locks) * (this.size / 6) * (this.boss?10 ** this.boss:1))
		this.totalPower = this.power * this.length * 0.5
		this.bonus = Math.sqrt(this.power) * 0.1 * (4 ** (this.level || 0))
		
		this.outs = [...this.children].filter(x => !x.owned && (!x.boss || x.boss <= this.map.boss)).length
		
		this.costs.levelUp = this.bonus * 2 ** (this.level || 0)
		Object.values(BUILDINGS).map(x => this.costs[x.id] = x.cost.call(this))
		this.renderSize = this.level?this.size + 0.25 + 2 * this.level:this.size
		if (game && game.skills.magicGrowthBoost && this.map.ownedRadius)
			this.bonusMult = game.skills.magicGrowthBoost?Math.max(0, this.map.ownedRadius - this.distance):0

		this.updateDisplay("management", true)
	},
	
	levelUp() {
		if (game.resources.gold < this.costs.levelUp) return
		if (this.level && this.level >= POINT_MAX_LEVEL) return
		
		game.resources.gold -= this.costs.levelUp
		
		this.suspend()
		
		this.level = (this.level || 0) + 1
		
		game.addStatistic("point_level"+this.level)
		
		this.calculateStats()
				
		this.unsuspend()
		
		game.update()
		gui.target.updateUpgrades()
	},
	
	getDisplay(name) {
		if (this.displays[name]) 
			return this.displays[name]
		
		if (name == "management") {
			let display = ManagementPointElement ({
				point : this,
				parent : gui.management.dvList
			})
			this.displays["management"] = display
			return display
		}
	},
	
	updateDisplay(name, forced) {
		if (this.displays[name])
			this.displays[name].update(forced)		
	},
	
	build (name) {
		if (!BUILDINGS[name]) return
		if (this.buildings[name]) return
		if (!this.costs[name] || this.costs[name] > game.resources.gold || this.costs[name] < 0) return
		game.resources.gold -= this.costs[name]
		BUILDINGS[name].build.call(this)
		game.addStatistic("built_"+name)
		this.buildings[name] = 1
		game.update()
		gui.target.updateUpgrades()
	},
	
	suspend() {
		this.bonusMult = (game.skills.magicGrowthBoost ** this.type > 2)?Math.max(0, this.map.ownedRadius - this.distance):0
		if (this.type && this.owned)
			game.growth[POINT_TYPES[this.type]] -= this.bonus * ((this.bonusMult || 0) + 1)
		Object.keys(this.buildings).filter(x => this.buildings[x]).map(x => BUILDINGS[x].destroy.call(this))
	},
	
	unsuspend() {
		this.bonusMult = (game.skills.magicGrowthBoost ** this.type > 2)?Math.max(0, this.map.ownedRadius - this.distance):0
		Object.keys(this.buildings).filter(x => this.buildings[x]).map(x => BUILDINGS[x].build.call(this))
		if (this.type && this.owned)
			game.growth[POINT_TYPES[this.type]] += this.bonus * ((this.bonusMult || 0) + 1)
	},

	updateText() {
		let s = []
		if (this.key) s.push("⚷\uFE0E" + this.key)
		if (this.lock) s.push((this.keyData.keyPoint.owned?"🔓\uFE0E":"🔒\uFE0E") + this.lock)
		if (this.exit) s.push("🌟\uFE0E")
		if (this.boss) s.push("⚔\uFE0E")
		if (!this.index) s.push(game && game.skills.mining?"⛏\uFE0E":"🏠\uFE0E")
		this.specialText = s.join("\n")
	},
	
	updateAway() {
		this.away = 0
		let pt = this
		this.locked = (this.lock && !this.keyData.keyPoint.owned) ? 1 : 0
		while (!pt.owned && pt.parent && pt.parent != pt) {
			this.away++
			pt = pt.parent
			if (pt.lock && !pt.keyData.keyPoint.owned)
				this.locked = 2
		}
		return this.away
	},
	
	coordinatesOn(position = this.progress || 0, absolute = false) {
		this.temp.x = this.index?this.sdx + (this.edx - this.sdx) * position - (absolute?0:this.x):0
		this.temp.y = this.index?this.sdy + (this.edy - this.sdy) * position - (absolute?0:this.y):0
		return this.temp
	},
	
	getActiveSpirit(slider) {
		return slider.real.spirit * ((this.parent && this.parent.buildings && this.parent.buildings.obelisk)?(this.parent.level || 0) + 1:1)
	},
	
	getActivePower(slider) {
		let currentPower = this.power * this.progress || 0
		
		if (!this.index) {
			let power = Math.max(0, slider.real.power - 2 * Math.max(0, ((this.mineDepth || 0) - slider.real.spirit) * 2))
			return (power) ** 0.6 / 2e3
		}
		
		const spirit = slider.real.spirit//getActiveSpirit(slider)
		let spiritPenalty = (this.boss || slider.clone)?0:Math.max(0,(currentPower - spirit) * 2)
		let fire = slider.real.fire * [1,1,1,0.5,0,4,1][this.type]
		let ice = slider.real.ice * [1,1,1,1,0.5,0,4][this.type]
		let blood = slider.real.blood * [1,1,1,0,4,1,0.5][this.type]
		let metal = slider.real.metal * [1,1,1,4,1,0.5,0][this.type]
		
		let physical = slider.real.power		
		
		let elemental = fire + ice + blood + metal
		let superelemental = 0
		
		if (game.skills.fire ) superelemental += fire , elemental -= fire 
		if (game.skills.ice  ) superelemental += ice  , elemental -= ice  
		if (game.skills.blood) superelemental += blood, elemental -= blood
		if (game.skills.metal) superelemental += metal, elemental -= metal
		
		if (this.special == SPECIAL_RESIST && game.skills.pierceResist)
			return physical

		elemental = Math.max(0, elemental) * (this.special == SPECIAL_RESIST ? 0 : 1)
		superelemental = Math.max(0, superelemental) * (this.special == SPECIAL_RESIST ? 0 : 1)
		physical = Math.max(0, physical + elemental - spiritPenalty)

		return this.special == SPECIAL_BLOCK?elemental + superelemental:(physical + superelemental)
	},
	
	highlight() {
	},
	
	attack(slider, time) {
		let power = slider.real.attack * time
		if (!this.index) {
			this.mineDepth = (this.mineDepth || 0) + power
			return
		}
		this.progress = this.progress || 0
		const start = this.totalPower * this.progress ** 2
		const end = Math.min(this.totalPower, start + power)
		this.progress = (end / this.totalPower) ** 0.5
		if (this.progress >= 1-1e-9) {
			this.capture(slider)
		}
	},
	
	capture(slider) {
		let attackers = [...this.attackers] //game.sliders.filter(x => x.target == this)

		game.iterations = 100
		
		this.owned = true
		for (let child of this.children) 
			child.available = true
		this.map.updateAways()

		if (gui.target.point == this) {
			if (this.boss || !game.skills.upgradePoints)
				gui.target.reset()
			else
				gui.target.updatePosition()
		}

		if (game.activeRender) {
			if (slider)
				animations.Fireworks(this.x, this.y, slider.color, 5 * this.size, this.size * 0.8)
			animations.Fireworks(this.x, this.y, gui.theme.typeColors[this.type], 15 * this.size, this.size)
			
			for (let child of this.children) {
				if (child.boss > this.map.boss) continue
				child.animate(1, 120)
				if (game.skills.sensor)
					for (let grandchild of child.children)
						if ((!grandchild.boss || grandchild.boss <= game.map.boss) && !grandchild.locked)
							grandchild.animate(2, 120)
			}
		}
		
		this.unsuspend()

		game.resources.exp += (this.power * this.length) ** 0.5

		if (this.exit) {
			game.resources.stars++
			game.addStatistic("stars")
		}
		if (this.special == SPECIAL_CLONE) {
			let baseStats = {}
			let sliders = game.sliders.filter(x => !x.clone)
			sliders.map(x => {
				Object.keys(x.stats).map(y => baseStats[y] = (baseStats[y] || 0) + x.stats[y] / sliders.length)
			})
			game.sliders.push(Slider({
				stats : baseStats,
				clone : true
			}))
			this.special = 0
			game.addStatistic("special_clones")
			game.unlockStory("sc_join")
		}
		if (this.special == SPECIAL_COLONY) {
			game.sliders.push(Slider())
			gui.updateTabs()
			this.special = 0
			let i = this.map.markerIndexes.indexOf(this.index)
			if (i > -1) {
				this.map.markerIndexes.splice(i, 1)
				this.map.markers.splice(i, 1)
			}
			game.unlockStory("s"+game.sliders.length.digits(2)+"_join")
		}
		if (this.special == SPECIAL_RESIST) {
			game.addStatistic("special_resists")
		}
		if (this.special == SPECIAL_BLOCK) {
			game.addStatistic("special_blocks")
		}
		game.addStatistic("points")
		
		if (!this.map.points.filter(x => !x.owned).length)
			game.unlockStory("m"+this.map.level.digits(3)+"_full")
		
		game.update()
		attackers.map(x => x.autoTarget())
	},

	animate (id, time) {
		this.animating = id
		this.animationTime = time
		this.animationProgress = 0
		game.animatingPoints.add(this)
	},
	
	render(c) {
		if (this.animating == 1) {
			c.save()
			c.translate(this.x, this.y)
			c.beginPath()
			c.strokeStyle = this.map.boss?"gray":"silver"
			const start = this.coordinatesOn(0)
			c.moveTo(start.x, start.y)
			const end = this.coordinatesOn(Math.min(1,this.animationProgress * 1.5))
			c.lineTo(end.x, end.y)
			
			if (this.locked != 1) {
				const arcProgress = Math.min(2 * Math.max(0, this.animationProgress - 0.25),1) * 1.68
				c.moveTo(this.size, 0)
				c.arc(0, 0, this.size, 0, arcProgress)
				c.moveTo(0, this.size)
				c.arc(0, 0, this.size, 1.68, 1.68 + arcProgress)
				c.moveTo(-this.size, 0)
				c.arc(0, 0, this.size, 3.14, 3.14 + arcProgress)
				c.moveTo(0, -this.size)
				c.arc(0, 0, this.size, 4.82, 4.82 + arcProgress)
				c.stroke()
				if (game.skills.sensor && this.animationProgress < 0.5) {
					c.fillStyle = "silver"
					c.globalAlpha = 1 - this.animationProgress * 2
					c.beginPath()
					c.arc(0, 0, this.size * (1 + this.animationProgress), 0, 6.29)
					c.fill()
				}
				if (this.animationProgress > 0.5) {
					c.fillStyle = gui.theme.typeColors[this.type]
					c.globalAlpha = this.animationProgress
					const r = this.size * Math.sin((this.animationProgress - 0.5) * 5) / 0.5985
					c.beginPath()
					c.arc(0, 0, r, 0, 6.29)
					c.fill()
				}
				if (this.progress) {
					c.strokeStyle = "maroon"
					c.beginPath()
					c.globalAlpha = 1
					const start = this.coordinatesOn(0)
					c.moveTo(start.x, start.y)
					const end = this.coordinatesOn(this.progress)
					c.lineTo(end.x, end.y)
					c.stroke()
				}
			} else 
				c.stroke()
			c.restore()
		} else if (this.animating == 2) {
			if (this.animationProgress >= 0.75) {
				c.save()
				c.translate(this.x, this.y)
				c.beginPath()
				c.globalAlpha = this.animateProgress
				c.fillStyle = this.map.boss?"rgb(128,128,225)":"silver"
				const r = this.size * Math.sin((this.animationProgress - 0.75) * 10) / 0.5985
				c.arc(0, 0, r, 0, 6.29)			
				c.fill()
				c.restore()			
			}
		}

		this.animationProgress += 1 / this.animationTime
		if (this.animationProgress >= 1) {
			this.animationProgress = 1
			this.animating = 0
		}
	},

	getReal() {
		if (!this.real) this.real = {}
		this.real.localPower = this.index?(this.progress || 0) * this.power:(this.mineDepth || 0)
		this.real.defence = this.totalPower * (1 - (this.progress || 0) ** 2)
	},
	
	destroyDisplays() {
		Object.values(this.displays).map(x => x.destroy())
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.x
		delete o.y
		delete o.dx
		delete o.dy
		delete o.sdx
		delete o.sdy
		delete o.edx
		delete o.edy
		delete o.power
		delete o.renderSize
		delete o.totalPower
		delete o.index
		delete o.parents
		delete o.parent
		delete o.length
		delete o.pathLength
		delete o.children
		delete o.depth
		delete o.available
		delete o.locked
		delete o.away
		delete o.specialText
		delete o.onscreen
		delete o.keyData
		delete o.bonus
		delete o.map
		delete o.real
		delete o.temp
		delete o.outs
		delete o.animating
		delete o.attackers
		delete o.costs
		delete o.displays
		delete o.animationTime
		delete o.animationProgress
		if (!o.owned) delete o.owned
		return o
	},
}

const Point = Template(pointHandler)