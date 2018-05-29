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

const SPECIAL_NONE = 0
const SPECIAL_BLOCK = 1
const SPECIAL_COLONY = 2
const SPECIAL_CLONE = 3
const SPECIAL_RESIST = 4
const SPECIAL_NOBUILD = 5
const SPECIAL_NOCLONE = 6
const SPECIAL_ALONE = 7
const SPECIAL_NOCHANNEL = 8

const SPECIALS_COUNT = 9

const SPECIAL_NAMES = [
	"None",
	"Physical shield",
	"Radio wave",
	"Clone factory",
	"Elemental shield",
	"Build shield",
	"Clone shield",
	"Narrow path",
	"Anti-channel"
]
const pointHandler = {
	_init() {
	},
	
	getVoronoi(forced, points) {
		if (!forced && this.voronoi) 
			return this.voronoi
		
		if (!points && this.map) points = this.map.points
		if (!points && this.world) points = this.world.points
		
		this.voronoi = {}
		
		const maxl = this.reach && this.radius?this.radius + this.reach:Math.max(30, ...points.map(x => x.length || 0)) * 1.2
		
		const projections = points.map(point => {
			if (point == this) 
				return point.index?{point, x:Math.cos(point.angle)/maxl, y:Math.sin(point.angle)/maxl}:{point, x:0, y:0}// x : point.x / point.distance, y : point.y / point.distance}
			const dx = point.x - this.x
			const dy = point.y - this.y
			const d = dx ** 2 + dy ** 2
			const l = 2 / d
			return {
				x : dx * l, 
				y : dy * l, 
				point
			}
		})
		
		const start = projections.reduce((v,x) => v.x < x.x?v:x, projections[0])
		projections.splice(projections.indexOf(start),1)
		projections.map(x => x.angle = Math.atan2(x.y - start.y, x.x - start.x))
		
		const hull = [start, ...projections.sort((x,y) => x.angle - y.angle)]
		hull.map((x,n) => {
			const next = hull[n+1] || hull[0]
			x.next = next
			next.last = x
//			x.last = hull[n-1] || hull[hull.length - 1]
		})
		
//		console.log(JSON.stringify(hull.map(x => {return{x:x.x,y:x.y}})))
		
		let current = hull[1]	
		let visited = 0
		while (visited < hull.length || current != hull[0]) {
			visited++
			const dx1 = current.next.x - current.x
			const dy1 = current.next.y - current.y
			const dx2 = current.last.x - current.x
			const dy2 = current.last.y - current.y
			if (dx1 * dy2 > (dy1 * dx2 + 1e-9)){
				current = current.next
				continue
			}
			current.next.last = current.last
			current.last.next = current.next
			current.deleted = true
			current = current.last
		}
		
		this.voronoi.points = hull.filter(x => !x.deleted).map(pt => {
/*			if (pt.point == this || pt.next.point == this) {
				return {
					x : 0,
					y : 0,
					neighbours : [this, this],
				}
			}*/
			const x32 = pt.next.x - pt.x
			const y32 = pt.next.y - pt.y
			const x21 = pt.x
			const y21 = pt.y
			const div = (x32 * y21 - y32 * x21)
			return {
				x : - y32 / div,
				y : + x32 / div,
				neighbours : [pt.point, pt.next.point],
			}
		})
		
		this.voronoi.edges = this.voronoi.points.map((x, n) => {
			const next = this.voronoi.points[n-1] || this.voronoi.points[this.voronoi.points.length - 1]
			return {
				start : x,
				end : next,
				neighbour : x.neighbours[0] == next.neighbours[0] || x.neighbours[0] == next.neighbours[1]?x.neighbours[0]:x.neighbours[1]
			}
		})
		
		return this.voronoi
	},
	
	restoreState() {
		this.x = (this.distance * Math.cos(this.angle)).toDigits(3)
		this.y = (this.distance * Math.sin(this.angle)).toDigits(3)
	}
}

const mapPointHandler = {
	_init() {
		this.temp = {}
	},
	
	restoreState() {
		this.x = (this.distance * Math.cos(this.angle)).toDigits(3)
		this.y = (this.distance * Math.sin(this.angle)).toDigits(3)
		this.owned = this.owned || false
		this.children = this.children || new Set()
		this.parents = this.parents || new Set()
		this.attackers = this.attackers ||new Set()
		this.costs = this.costs || {}
		this.manaCosts = this.manaCosts || {}
		this.displays = this.displays || {}
		this.buildings = this.buildings || {}
		this.production = this.production || {}
		this.harvestTimes = this.harvestTimes || []
		Object.values(BUILDINGS).map(x => this.costs[x.id] = -1)
		Object.values(SPELLS).map(x => this.manaCosts[x.id] = -1)

		
		this.changed = 65535
	},
	
	calculateStats() {
//		if (!this.initialized || this.initialized < 5) {
			this.innerSize = this.size * settings.nodeScale
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
				if (!this.direction)
					this.direction = Math.atan2(this.dy, this.dx)
				if (!this.length)
					this.length = Math.hypot(this.dy, this.dx)
				this.pathLength = this.length - this.innerSize - this.parent.innerSize
			}
			this.sdx = this.edx = this.x + this.dx * (this.innerSize + 0.45) / this.length
			this.sdy = this.edy = this.y + this.dy * (this.innerSize + 0.45) / this.length
			if (this.parent) {
				this.sdx = this.parent.x - this.dx * (this.parent.innerSize + 0.45) / this.length
				this.sdy = this.parent.y - this.dy * (this.parent.innerSize + 0.45) / this.length
			}
			
			let depth = this.depth || 0
			if (!depth) {
				let pt = this
				while (pt.parent && pt.parent != pt) {
					depth++
					pt = pt.parent
					this.parents.add(pt)
				}
				this.depth = depth
			}
			let locks = this.locks
			if (locks === undefined) {
				locks = 0
				let pt = this
				while (pt.parent && pt.parent != pt) {
					if (pt.lock) locks++
					pt = pt.parent
				}				
				this.locks = locks
			}
			if (!this.power)
				this.power = this.customPower || (this.map.basePower * (4 ** (this.distance / this.map.size)) * ((1.1 + 0.005 * this.map.level) ** this.depth) * (1.2 ** locks) * (this.size / 6) * (this.boss?10 ** this.boss:1))
			if (!this.totalPower) 
				this.totalPower = this.power * this.length * 0.5
			this.initialized = (this.initialized || 0) + 1
//		}

		if (!this.bonus)
			this.bonus = Math.sqrt(this.power) * 0.1 * (4 ** (this.level || 0))
		
		if (!this.baseCost)
			this.baseCost = Math.sqrt(this.power) * 25.6
		
		this.outs = [...this.children].filter(x => !x.owned && (!x.boss || x.boss <= this.map.boss)).length
		
		if (this.parent)
			this.available = this.parent.owned

//		if (this.changed & 1 || game.map.changed & 1) {
		if (!this.level || this.level < POINT_MAX_LEVEL)
			this.costs.levelUp = this.bonus * 2 ** (this.level || 0)
		
		this.nobuild = [...this.children].filter(x => x.special == SPECIAL_NOBUILD).length > 0
		game.available.buildings[this.level || 0].map(x => this.costs[x.id] = this.nobuild?-1:x.cost(this))
	
		this.noclone = this.special == SPECIAL_NOCLONE
		this.updateSpellCosts()
		
		this.renderSize = this.level && settings.levelDisplay == 2?this.innerSize + 0.25 + 2 * this.level * settings.nodeScale:this.innerSize
		if (game && game.skills.magicGrowthBoost && this.map.ownedRadius)
			this.bonusMult = (game.skills.magicGrowthBoost && this.type > 2)?Math.max(0, this.map.ownedRadius - this.distance):0
		
		this.production.mana = this.buildings.manalith?BUILDINGS.manalith.production(this):0
		this.production.gold = this.buildings.goldFactory?BUILDINGS.goldFactory.production(this):0
		this.production.science = this.buildings.scienceLab?BUILDINGS.scienceLab.production(this):0
		this.completed = this.level == 4 && !this.nobuild && Object.values(BUILDINGS).reduce((v,x) => {
			if (!v) return false
			if (this.costs[x.id] > 0 && !this.buildings[x.id]) return false
			return true
		}, true)
//		}

//		this.bonusMult = (game.skills.magicGrowthBoost && this.type > 2)?Math.max(0, this.map.ownedRadius - this.distance):0
		this.totalBonus = this.bonus * ((this.bonusMult || 0) + 1) * (this.enchanted == ENCHANT_GROWTH?this.map.level:1) * (this.enchanted == ENCHANT_DOOM?0.2:1)

		if (!this.harvestTimes[1])
			this.harvestTimes[1] = (this.map.level - 26) ** 4
		
		this.canImprint = game.realMap && (game.skills.imprint && (!this.map.virtual || game.skills.virtualImprint && (this.map.level == game.realMap.level && this.exit)) && (!this.boss && this.completed))
		
		if (!game.offline && gui.tabs.activeTab == "management" && this.displays.management && this.displays.management.visible)
			this.updateDisplay("management", true)
		
		this.changed = 0
	},
	
	updateSpellCosts() {
		game.available.spells.map(x => this.manaCosts[x.id] = (!this.noclone || x.book.substr(0,6) != "summon")? x.cost(this) : -1)
	},

	levelUp() {
		if (game.resources.gold < this.costs.levelUp) return
		if (this.level && this.level >= POINT_MAX_LEVEL) return
		
		game.resources.gold -= this.costs.levelUp
		
		this.suspend()
		
		this.level = (this.level || 0) + 1
		this.bonus = Math.sqrt(this.power) * 0.1 * (4 ** (this.level || 0))
		
		this.changed |= 1
		
		game.addStatistic("point_level"+this.level)
		
		this.calculateStats()
				
		this.unsuspend()
		
		if (game.autoUpgrading)
			game.autoUpgrading |= 2
		else {
			game.update()
			gui.target.updateUpgrades()
		}
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

		if (name == "lowLoad") {
			let display = PointInfoDisplay ({
				point : this,
				parent : gui.map.dvLowLoad,
				className : "point-info"
			})
			display.dvDisplay.onclick = (event) => (this.locked || gui.target.point == this)?gui.target.reset():gui.target.set(this, event.x, event.y)
			this.displays["lowLoad"] = display
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
		if (!this.level || this.level < BUILDINGS[name].level) return
		if (!this.costs[name] || this.costs[name] > game.resources.gold || this.costs[name] < 0) return
		game.resources.gold -= this.costs[name]
		BUILDINGS[name].build(this)
		this.changed |= 1
		game.addStatistic("built_"+name)
		this.buildings[name] = 1
		if (game.autoUpgrading)
			game.autoUpgrading |= 4
		else {
			game.update()
			gui.target.updateUpgrades()
			gui.management.update()
		}
	},
	
	cast (name) {
		if (!SPELLS[name]) return
		if (SPELLS[name].type != SPELL_TYPE_POINT) return
		if (this.manaCosts[name] < 0 || this.manaCosts[name] > game.resources.mana) return
		game.resources.mana -= this.manaCosts[name]
		if (SPELLS[name].recalc) this.suspend()
		SPELLS[name].cast(this)
		this.changed |= 1
		if (SPELLS[name].recalc) this.unsuspend()
		if (!game.autoUpgrading) {
			game.update()
			gui.management.update()
		}
		gui.target.updateUpgrades()		
		game.addStatistic("cast_"+name)
	},
	
	suspend() {
//		this.bonusMult = (game.skills.magicGrowthBoost && this.type > 2)?Math.max(0, this.map.ownedRadius - this.distance):0
		if (this.type && this.owned)
			game.growth[POINT_TYPES[this.type]] -= this.totalBonus
		Object.keys(this.buildings).filter(x => this.buildings[x]).map(x => BUILDINGS[x].destroy(this))
	},
	
	unsuspend() {
		this.bonusMult = (game.skills.magicGrowthBoost && this.type > 2)?Math.max(0, this.map.ownedRadius - this.distance):0
		this.totalBonus = this.bonus * ((this.bonusMult || 0) + 1) * (this.enchanted == ENCHANT_GROWTH?this.map.level:1) * (this.enchanted == ENCHANT_DOOM?0.2:1)
		Object.keys(this.buildings).filter(x => this.buildings[x]).map(x => BUILDINGS[x].build(this))
		if (this.type && this.owned)
			game.growth[POINT_TYPES[this.type]] += this.totalBonus
	},

	updateText() {
		const oldText = this.specialText
		let s = []
		if (this.key) s.push("⚷\uFE0E" + this.key)
		if (this.lock) s.push((this.keyData.keyPoint.owned || this.unlocked?"🔓\uFE0E":"🔒\uFE0E") + this.lock)
		if (this.exit) s.push("🌟\uFE0E")
		if (this.boss) s.push("⚔\uFE0E")
		if (!this.index) s.push(game && game.skills.mining?"⛏\uFE0E":"🏠\uFE0E")
		this.specialText = s.join("\n")
		if (this.specialText != oldText) {
			this.specialTextSize = getTextSize(this.specialText || "?\uFE0E")
		}
	},
	
	updateAway() {
		this.away = 0
		let pt = this
		this.locked = (this.lock && !this.unlocked && !this.keyData.keyPoint.owned) ? 1 : 0
		while (!pt.owned && pt.parent && pt.parent != pt) {
			this.away++
			pt = pt.parent
			if (pt.lock && !pt.unlocked && !pt.keyData.keyPoint.owned)
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
		return slider.artifacts.nullRod && this.type==2?0:slider.real.spirit * ((this.parent && this.parent.buildings && this.parent.buildings.obelisk)?(this.parent.level || 0) + 1:1)
	},
	
	getActivePower(slider) {
		let currentPower = this.power * this.progress || 0
		
		if (!this.index) {
			let power = Math.max(0, slider.real.miningPower - (slider.clone?0:Math.max(0, ((this.mineDepth || 0) - slider.real.spirit) * 2)))
			power *= game.world.stats.goldSpeed
			return (power) ** (slider.artifacts.pickaxe?0.63:0.6) / 2e3
		}
		
		let absoluteDamage = slider.real.absoluteDamage
		
		if (slider.artifacts.loneSword && (this.attackers.size == 0 || this.attackers.size == 1 && this.attackers.has(slider))) {
			absoluteDamage += (slider.real.fire  
							+  slider.real.ice   
							+  slider.real.blood 
							+  slider.real.metal)
		}			
		
		const chapter = this.map.level > 20 || this.map.virtual ? 1 : 0
		const weak = chapter ? 0 : 0.5
		const strong = chapter ? 1 : 4
		const neutral = chapter ? 0.1 : 1
		const itself = chapter ? -1 : 0
		const phys = chapter ? ARTIFACTS.powerGem.equipped && ARTIFACTS.powerGem.equipped.target === this?0.01:0.001 : 1
		
		const spirit = slider.real.spirit//getActiveSpirit(slider)
		let spiritPenalty = (this.boss || slider.clone)?0:Math.max(0,(currentPower - spirit) * 2)

		let fire  = slider.artifacts.nullRod && this.type==4?0:slider.real.fire *  [1,1,1, weak, itself, strong, neutral][this.type]
		let ice   = slider.artifacts.nullRod && this.type==5?0:slider.real.ice *   [1,1,1, neutral, weak, itself, strong][this.type]
		let blood = slider.artifacts.nullRod && this.type==3?0:slider.real.blood * [1,1,1, itself, strong, neutral, weak][this.type]
		let metal = slider.artifacts.nullRod && this.type==6?0:slider.real.metal * [1,1,1, strong, neutral, weak, itself][this.type]
		
		let physical = slider.artifacts.nullRod && this.type==1?0:slider.real.power * (this.type > 2 ? phys : 1)
		let superphysical = 0
		
		let elemental = fire + ice + blood + metal
		let superelemental = 0
		
		if (game.skills.fire ) superelemental += fire , elemental -= fire 
		if (game.skills.ice  ) superelemental += ice  , elemental -= ice  
		if (game.skills.blood) superelemental += blood, elemental -= blood
		if (game.skills.metal) superelemental += metal, elemental -= metal
		if (game.skills.power) superphysical = physical, physical = 0
		
/*		if (this.special == SPECIAL_RESIST && game.skills.pierceResist)
			return physical*/

		elemental = Math.max(0, elemental) * (this.special == SPECIAL_RESIST ? 0 : 1)
		physical = Math.max(0, physical) * (this.special == SPECIAL_BLOCK ? 0 : 1)
		
		superelemental = superelemental * (this.special == SPECIAL_RESIST ? 0 : 1)
		superphysical = superphysical * (this.special == SPECIAL_BLOCK ? 0 : 1)
		
		let finalMult = (this.enchanted == ENCHANT_DOOM?this.map.level:1)
		if (slider.artifacts.warAmulet && slider.lastTarget == this.index) finalMult *= 1 + slider.onSame / 600
		if (slider.artifacts.victoryAmulet && slider.victoryTimer) finalMult *= 1 + this.map.level / 10
		if (this.type > 2) {
			const bane = ARTIFACTS[POINT_TYPES[this.type]+"Gem"]
			if (bane.equipped && bane.equipped.target === this) finalMult *= 3
		}
		if (this.attackers.size > 1 && ARTIFACTS.selflessCrown.equipped && ARTIFACTS.selflessCrown.equipped.target == this) {
			finalMult *= ARTIFACTS.selflessCrown.equipped == slider?0.1:2
		}
		if (this.attackers.size > 1 && ARTIFACTS.puppetCrown.equipped && ARTIFACTS.puppetCrown.equipped.target == this) {
			if (slider.clone == 2) 
				finalMult *= 4
			else if (ARTIFACTS.puppetCrown.equipped == slider && [...this.attackers].filter(x => x.clone == 2).length)
				finalMult *= 0.1
		}
		
		if (slider.target == this && absoluteDamage) this.map.failed.noabsolute1 = 1

		return (Math.max(0, physical + elemental - spiritPenalty) + superelemental + superphysical + absoluteDamage)*finalMult
	},
	
	highlight() {
	},

	startHarvest(mode) {
		if (this.harvested && this.harvested >= mode || this.harvesting) 
			return
		this.harvestTimeTotal = this.harvestTimes[mode || 1]
		this.harvestTime = 0
		this.harvesting = mode || 1 
		game.harvesting.add(this)
	},
	
	advanceHarvest(time) {
		this.harvestTime += time
		if (this.harvestTime > this.harvestTimeTotal)
			this.harvest()
	},
	
	harvest() {
		if (!this.harvesting) return
		if (this.harvesting == 1)
			game.resources["_"+(this.type || 0)] += 1
		this.harvested = this.harvesting
		game.update()
		if (gui.target.point == this) gui.target.update(true)
		game.harvesting.delete(this)
		delete this.harvesting
	},
	
	attack(time) {
		if (this.real.loss < 0 || this.index && (this.progress && this.progress >= 1-1e-9 || this.owned)) {
			this.real.loss = 0
			return
		}
/*		if (this.enchanted == ENCHANT_DOOM) {
			this.real.loss *= this.map.level
			this.real.passiveDamage *= this.map.level
		}*/
		
		let power = this.real.loss * time
		
		if (!this.index) {
			this.mineDepth = (this.mineDepth || 0) + power
			return
		}
		
		this.progress = this.progress || 0
		const oldProgress0 = this.progress * 100 | 0
		const start = this.totalPower * this.progress ** 2
		const end = Math.min(this.totalPower, start + power)
		this.progress = (end / this.totalPower) ** 0.5
		const summonsHere = [...this.attackers].filter(x => x.clone == 2)
		let hasSummons = summonsHere.length
		let canSummon = !this.noclone && !hasSummons && this.attackers && this.attackers.has(ARTIFACTS.summonAmulet.equipped) && this.special != SPECIAL_ALONE
		let canMasterSummon = !this.noclone && !hasSummons && this.attackers && this.attackers.has(ARTIFACTS.masterSummonAmulet.equipped) && this.special != SPECIAL_ALONE
		let canGrandmasterSummon = !this.noclone && this.attackers && this.attackers.has(ARTIFACTS.legendarySummonAmulet.equipped) && this.special != SPECIAL_ALONE && this.summon != SPECIAL_RESIST
		if (canSummon || canMasterSummon || canGrandmasterSummon) {
			let oldProgress1 = oldProgress0
			while (oldProgress1 < (this.progress* 100|0)) {
				oldProgress1++
				if (canSummon && (Math.random() * (ARTIFACTS.summonAmulet.equipped.onSame + 900) < ARTIFACTS.summonAmulet.equipped.onSame)) {
					if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) break
					createSummon(this, 1)
					if (gui.target.point == this)
						gui.target.set(this, -1)
					canMasterSummon = canSummon = false
				}
				if (canMasterSummon && (Math.random() * (ARTIFACTS.masterSummonAmulet.equipped.onSame + 1800) < ARTIFACTS.masterSummonAmulet.equipped.onSame)) {
					if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) break
					let element = Math.random() * 4 + 3 | 0
					while (element == this.type || element % 4 + 3 == this.type) element = Math.random() * 4 + 3 | 0
					createSummon(this, element)
					if (gui.target.point == this)
						gui.target.set(this, -1)
					canMasterSummon = canSummon = false
				}
				if (canGrandmasterSummon && (Math.random() * (ARTIFACTS.legendarySummonAmulet.equipped.onSame + 300 * (3 ** hasSummons)) < ARTIFACTS.legendarySummonAmulet.equipped.onSame)) {
					if (game.sliders.filter(x => x.clone == 2).length >= game.world.stats.maxSummons) break
					let element = this.type < 3?Math.random() * 4 + 3 | 0:(this.type)%4+3
//					if (this.special == SPECIAL_RESIST) element = 1
					createSummon(this, element)
					if (gui.target.point == this)
						gui.target.set(this, -1)
					hasSummons++
					canMasterSummon = canSummon = false
				}
			}
		}
		if (this.type > 2 && this.attackers.has(ARTIFACTS.aligner.equipped) && hasSummons) {
			let oldProgress1 = oldProgress0
			const targetElement = (this.type)%4+3
			const elementals = [...this.attackers].filter(x => x.clone == 2 && x.element > 2 && x.element != targetElement)
			while (oldProgress1 < (this.progress* 100|0)) {
				oldProgress1++
				elementals.map(x => {
					if (Math.random() * (ARTIFACTS.aligner.equipped.onSame + 300) < ARTIFACTS.aligner.equipped.onSame) {
						x.realign(targetElement)
						if (gui.target.point == this)
							gui.target.set(this, -1)
					}
				})
			}
		}
		if (this.progress >= 1-1e-9) {
			this.capture()
		}
	},
	
	capture() {
		[this, this.parent, ...this.children].map(x => x?x.changed |= 1:0)
		let attackers = [...this.attackers] //game.sliders.filter(x => x.target == this)

		game.iterations = GAME_ADVANCE_ITERATIONS
		
		if (settings.captureSound == 2 || settings.captureSound == 1 && game.slowMode)
			gui.sounds.capture.play()
		
		game.unlockStory("type_"+POINT_TYPES[this.type])
		if (this.special)
			game.unlockStory("special_"+this.special)

		if (this.exit)
			game.unlockStory("special_star")
		
		if (this.key) 
			game.unlockStory(game.story.special_lock?"special_lock_key":"special_key")
		
		if ([...this.children].filter(x => x.lock).length) 
			game.unlockStory(game.story.special_key?"special_key_lock":"special_lock")

		this.owned = true
		
		if (game.slowMode && this.displays["lowLoad"]) {
			this.displays["lowLoad"].dvDisplay.remove()
			if (gui.target.point == this)
				gui.target.reset()
		}
		
		for (let child of this.children) {
			child.available = true
			if (game.slowMode && (!child.boss || child.boss <= this.map.boss))
				child.getDisplay("lowLoad")
		}
		this.map.updateAways()

		if (gui.target.point == this) {
			if (this.boss || !game.skills.upgradePoints)
				gui.target.reset()
			else
				gui.target.updatePosition()
		}

		if (game.activeRender) {
//			if (slider)
//				animations.Fireworks(this.x, this.y, slider.color, 5 * this.size, this.size * 0.8)
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
			if (this.map.virtual) {
				game.resources.stardust++
				game.addStatistic("stardust")
			} else {
				game.resources.stars++
				game.addStatistic("stars")
				if (game.resources.stars >= this.map.ascendCost)
					game.unlockStory((this.map.virtual?"v":"m")+this.map.level.digits(3)+"_enough")
			}
		}
		if (this.special == SPECIAL_CLONE) {
			let baseStats = {}
			let sliders = game.sliders.filter(x => !x.clone)
			sliders.map(x => {
				Object.keys(x.stats).map(y => baseStats[y] = (y=="power"?(baseStats[y] || 0) + x.stats[y] / sliders.length:0))
			})
			game.sliders.push(Slider({
				stats : baseStats,
				clone : 1
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
			game.unlockStory("s"+game.sliders.filter(x => !x.clone).length.digits(2)+"_join")
		}
		if (this.special == SPECIAL_RESIST) {
			game.addStatistic("special_resists")
		}
		if (this.special == SPECIAL_BLOCK) {
			game.addStatistic("special_blocks")
		}
		if (this.special == SPECIAL_NOCLONE) {
			game.addStatistic("special_noclones")
			this.special = 0
		}
		if (this.special == SPECIAL_NOBUILD) {
			game.addStatistic("special_nobuilds")
			this.special = 0
		}
		if (this.special == SPECIAL_ALONE) {
			game.addStatistic("special_alones")
			this.special = 0
		}
		if (this.special == SPECIAL_NOCHANNEL) {
			game.addStatistic("special_nochannels")
			this.special = 0
		}
		game.addStatistic("points")
		
		if (!this.map.points.filter(x => !x.owned).length)
			game.unlockStory((this.map.virtual?"v":"m")+this.map.level.digits(3)+"_full")
		
		let wantSpecial = 0
		if (!this.special && !this.boss)
			attackers.map(x => {
				if (x.artifacts.magicalShield) wantSpecial |= 1
				if (x.artifacts.physicalShield) wantSpecial |= 2
			})
		
		if (wantSpecial == 3)
			this.special = Math.random() < 0.5?SPECIAL_RESIST:SPECIAL_BLOCK
		else if (wantSpecial == 1)
			this.special = SPECIAL_RESIST
		else if (wantSpecial == 2)
			this.special = SPECIAL_BLOCK

		let wantEnchant = 0
		if (!this.enchanted && !this.boss)
			attackers.map(x => {
				if (x.artifacts.goldShield) wantEnchant |= 1
				if (x.artifacts.manaShield) wantEnchant |= 2
			})
		
		if (wantEnchant == 3)
			this.enchanted = Math.random() < 0.5?ENCHANT_GOLD:ENCHANT_MANA
		else if (wantEnchant == 1)
			this.enchanted = ENCHANT_GOLD
		else if (wantEnchant == 2)
			this.enchanted = ENCHANT_MANA

		if (this.animating) {
			this.animationProgress = 1
			this.animating = 0
		}
		
		if (wantSpecial || wantEnchant)
			this.calculateStats()
			
		if (ARTIFACTS.doomShield.equipped && ARTIFACTS.doomShield.equipped.target == this) {
			const outs = [...this.children].filter(y => !y.locked && (!y.boss || y.boss <= this.map.boss) && y.special != SPECIAL_RESIST)
			const target = outs[Math.random() * outs.length | 0]
			if (target) {
				target.enchanted = ENCHANT_DOOM
				target.calculateStats()
			}
		}

		game.update()
		
		const slidersLength = game.sliders.length
		
		attackers.sort((x,y) => +(y.role == ROLE_LEADER) - +(x.role == ROLE_LEADER)).map(x => {
			if (!x.clone)
				this.map.failed.noreal1 = 1
			x.victoryTimer = 60 * this.map.level
			if (x.clone == 2) {
				const outs = [...this.children].filter(y => !y.locked && (!y.boss || y.boss <= this.map.boss) && (y.special != SPECIAL_ALONE || (!game.skills.smartSummons || (y.type < 3 || x.element == y.type % 4 + 3 ) && y.getActivePower(x)) && !y.attackers.size) && y.special != SPECIAL_NOCLONE && (!game.skills.smartSummons || !x.element || x.element < 3 || y.type != x.element))
				if (!outs.length || game.sliders.filter(x => x.clone == 2).length > game.world.stats.maxSummons)
					x.fullDestroy()
				else {
					if (game.skills.levelSummons) {
						x.levelUp()
					}
					if (game.skills.smartSummons) {
						x.assignTarget(outs.sort((y,z) => z.getActivePower(x) - y.getActivePower(x))[0], true)						
					} else {
						x.assignTarget(outs[outs.length * Math.random() | 0], true)
					}
					if (x.target == this)
						x.fullDestroy()
				}
			} else {
				if (!x.target || x.target == this) {
					x.autoTarget()
					x.getReal(true)
				}
			}
		})
		
		if (slidersLength != game.sliders.length) {
			this.map.updateSpellCosts()
			if (gui.target.point) gui.target.updateUpgrades(true)
		}
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
			c.save()
			if (settings.dashedLines)
				c.setLineDash([5,8])
			const start = this.coordinatesOn(0)
			c.moveTo(start.x, start.y)
			const end = this.coordinatesOn(Math.min(1,this.animationProgress * 1.5))
			c.lineTo(end.x, end.y)
			c.stroke()
			c.restore()
			
			c.beginPath()
			if (this.locked != 1) {
				const arcProgress = Math.min(2 * Math.max(0, this.animationProgress - 0.25),1) * 1.68
				c.moveTo(this.innerSize, 0)
				c.arc(0, 0, this.innerSize, 0, arcProgress)
				c.moveTo(0, this.innerSize)
				c.arc(0, 0, this.innerSize, 1.68, 1.68 + arcProgress)
				c.moveTo(-this.innerSize, 0)
				c.arc(0, 0, this.innerSize, 3.14, 3.14 + arcProgress)
				c.moveTo(0, -this.innerSize)
				c.arc(0, 0, this.innerSize, 4.82, 4.82 + arcProgress)
				c.stroke()
				if (game.skills.sensor && this.animationProgress < 0.5) {
					c.fillStyle = "silver"
					c.globalAlpha = 1 - this.animationProgress * 2
					c.beginPath()
					c.arc(0, 0, this.innerSize * (1 + this.animationProgress), 0, 6.29)
					c.fill()
				}
				if (this.animationProgress > 0.5) {
					c.fillStyle = gui.theme.typeColors[this.type]
					c.globalAlpha = this.animationProgress
					const r = this.innerSize * Math.sin((this.animationProgress - 0.5) * 5) / 0.5985
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
				const r = this.innerSize * Math.sin((this.animationProgress - 0.75) * 10) / 0.5985
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
		this.real.passiveDamage = this.real.loss = (this.special != SPECIAL_BLOCK) && !this.locked && (!this.boss || this.boss <= this.map.boss) && this.parent && this.parent.buildings && this.parent.buildings.earthquakeMachine?
			(this.parent.bonus ** 0.78 * game.resources.thunderstone * game.skillCostMult * (this.special == SPECIAL_RESIST?3:1))
			*(this.enchanted==ENCHANT_DOOM?this.map.level:1)
			*(ARTIFACTS.stormGem.equipped && ARTIFACTS.stormGem.equipped.target === this?this.map.level:1) 
			*(ARTIFACTS.stormStone.equipped && ARTIFACTS.stormStone.equipped.target && ARTIFACTS.stormStone.equipped.target.parent === this.parent?this.map.level:1) 
			* game.world.stats.meanBoost:0
		if (this.real.passiveDamage) this.map.failed.noabsolute1 = 1
		if (this.real.loss && !this.owned) game.attacked.add(this)
	},
	
	destroyDisplays() {
		Object.keys(this.displays).map(x => {
			this.displays[x].destroy()
			delete this.displays[x]
		})
		this.animating = 0
		this.attackers.clear()
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
		delete o.innerSize
		delete o.totalPower
		delete o.index
		delete o.parents
		delete o.parent
		delete o.length
		delete o.direction
		delete o.pathLength
		delete o.children
		delete o.depth
		delete o.available
		delete o.locked
		delete o.away
		delete o.specialText
		delete o.specialTextSize
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
		delete o.manaCosts
		delete o.displays
		delete o.production
		delete o.animationTime
		delete o.animationProgress
		delete o.initialized
		delete o.totalBonus
		delete o.bonusMult
		delete o.baseCost
		delete o.noclone
		delete o.nobuild
		delete o.completed
		delete o.harvestTimes
		delete o.voronoi
		delete o.delaunay
		if (!o.boss) delete o.boss
		if (!o.exit) delete o.exit
		if (!o.owned) delete o.owned
		return o
	},
}

const MapPoint = Template(pointHandler, mapPointHandler)

const worldPointHandler = {
	_init() {
		this.connections = []
		this.deadZone = WORLD_ELEMENTS[this.type].deadZone
		this.radius = WORLD_ELEMENTS[this.type].radius
		this.reach = WORLD_ELEMENTS[this.type].reach
		this.family = WORLD_ELEMENTS[this.type].family
		this.calculateStats()
	},
	
	calculateStats() {
		this.angle = Math.atan(this.y, this.x)
		this.distance = Math.hypot(this.y, this.x)
	},
	
	connect(point) {
		this.connections.push(point)
		point.connections.push(this)
	},
	
	valueString() {
		const element = WORLD_ELEMENTS[this.type]
		if (!element || !element.value) return "None"
		let s = ""
		if (element.effect == WORLD_BONUS_ADD) s += "+"
		if (element.effect == WORLD_BONUS_ADD_MULT) s += "Multiplier +"
		if (element.effect == WORLD_BONUS_MUL) s += "Multiplier x"
		s += element.value(this).toDigits(3)
		return s
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.angle		
		delete o.distance		
		delete o.active
		delete o.connections
		delete o.world
		delete o.voronoi
		delete o.family		
		delete o.radius
		delete o.reach
		delete o.deadZone
		delete o.depth
		delete o.newX
		delete o.newY
		delete o.newDepth
		delete o.newConnections
		return o
	}
}

const WorldPoint = Template(pointHandler, worldPointHandler)