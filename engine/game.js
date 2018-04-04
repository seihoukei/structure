'use strict'
const RESOURCES = ["exp","science","stars","gold","mana","stardust","fears","clouds","thunderstone"]
const GAME_ADVANCE_ITERATIONS = 1000
const GAME_ADVANCE_ITERATIONS_MAX = 100000
const GAME_AUTOMATION_PERIOD = 1000

//l = 1,m = Array(51).fill().map((x,n) => GameMap(mapLevel(n), mapMaker)).map(m => m.points.map(x => x.power * x.length).filter(x => x)).map (x => (k=(Math.min(...x)/l),l=Math.max(...x),k)).slice(1), [Math.max(...m), Math.min(...m)]
const game = {
	updateBackground : false,
	skillCostMult : 1,
	sliders : [],
	animatingPoints : new Set(),
	frame : 0,
	growth : POINT_TYPES.reduce((v, x, n) => (n ? v[x] = 0 : v, v), {}),
	multi : POINT_TYPES.reduce((v, x, n) => (n ? v[x] = 1 : v, v), {}),
	skills : Object.keys(SKILLS).reduce((v,x) => (v[x] = 0,v),{}),
	resources : {},
	automation : {
		types : [],
		maxLevel : 0,
		maxCost : 100,
		buildings: {}
	},
	production : {},
	attacked : new Set(),
	stardust : {},
	statistics : {
		onlineTime : 1
	},
	renderData: {},
	story : {},
	lastViewedStory : 0,
	lastSave : performance.now(),
	
	updateRenderData() {	
		if (!viewport.width || !viewport.height) return
		if (!this.renderData.radarCV) {
			this.renderData.radarCV = document.createElement("canvas")
		}
		this.renderData.radarCV.width  = viewport.width
		this.renderData.radarCV.height = viewport.height
		const c = this.renderData.radarCV.getContext("2d")
		const grad = gui.foregroundContext.createRadialGradient(0, 0, 0, 0, 0, 5)
		grad.addColorStop(0, gui.theme.radar)
		grad.addColorStop(1, "transparent")
		c.translate(viewport.halfWidth, viewport.halfHeight)
		c.fillStyle = grad
		this.map.points.filter(pt => pt.owned).map(pt => {
			c.save()
			c.beginPath()
			c.translate(pt.x, pt.y)
			c.scale(pt.size, pt.size)
			c.moveTo(5, pt.y)
			c.arc(0, 0, 5, 0, 6.29)
			c.fill()
			c.restore()
		})
		this.renderData.radar = gui.foregroundContext.createPattern(this.renderData.radarCV, "repeat")
	},
	
	render() {
		this.frame++

		if (gui.tabs.activeTab == "map") {
			if (this.slowMode) {
				if (this.updateInterface) 
					gui.map.updateLowLoad()
			} else {
				if (this.updateBackground) {
					this.renderBackground(gui.backgroundContext)
					this.updateBackground = false
				}
				this.renderForeground(gui.foregroundContext)
				
				if (this.updateInterface) {
					gui.map.dvResources.innerText = Object.entries(game.resources).reduce((v,x) => x[1]?v+"\n"+x[0].capitalizeFirst() + ": " + displayNumber(x[1]) + (game.real.production[x[0]]?" ("+(game.real.production[x[0]]>0?"+":"")+displayNumber(game.real.production[x[0]])+"/s)":""):v,"").trim()
					gui.map.updateGrowth()
				}
			}
		}

		if (gui.tabs.activeTab == "stardust") {
			gui.map.updateGrowth()
		}
		
		if (this.updateInterface) {
			gui.update()
		}

		if (!(this.frame % 60)) {
			gui.skills.updateExp()
		}		

		this.updateInterface = false
	},
	
	renderBackground(c) {
		c.clearRect(0, 0, viewport.width, viewport.height)
		c.save()
		c.translate(viewport.halfWidth, viewport.halfHeight)
		c.scale(viewport.current.zoom, viewport.current.zoom)
		c.translate(-viewport.current.x, -viewport.current.y)
		if (this.skills.magic)
			this.renderCircle(c, this.map.ownedRadius)
		//this.renderCircle(c, this.map.size)
		this.map.renderMap(c)
		c.restore()
	},	
	
	renderForeground(c) {
		c.clearRect(0, 0, viewport.width, viewport.height)
		c.save()
		c.translate(viewport.halfWidth, viewport.halfHeight)
		c.scale(viewport.current.zoom, viewport.current.zoom)
		c.translate(-viewport.current.x, -viewport.current.y)
		c.lineCap = "round"
		this.renderAnimations(c)
		this.sliders.map(x => x.render(c))
		if (mouse.closest) {
			c.save()
			c.translate(mouse.closest.x, mouse.closest.y)
			c.strokeStyle = mouse.closest.owned?gui.theme.mouseOwned:(mouse.closest.lock && !mouse.closest.keyData.keyPoint.owned)?gui.theme.shades[11]:gui.theme.mouseEnemy
			c.beginPath()
			let radius = mouse.closest.size + (mouse.closest.level || 0) * 2 + 1.75 + 0.5 * Math.sin(this.frame / 30) 
			let angle = this.frame / 50
			c.arc(0, 0, radius, angle, angle + 0.5)
			c.stroke()
			c.beginPath()
			c.arc(0, 0, radius, angle + Math.PI / 3 * 2, angle + 0.5 + Math.PI / 3 * 2)
			c.stroke()
			c.beginPath()
			c.arc(0, 0, radius, angle + Math.PI / 3 * 4, angle + 0.5 + Math.PI / 3 * 4)
			c.stroke()
			c.restore()
			
			let partner
			
			if (mouse.closest.lock) 
				partner = mouse.closest.keyData.keyPoint
			if (mouse.closest.key) 
				partner = mouse.closest.keyData.lockPoint
			
			if (partner && partner.away < 2 && partner.locked < 2) {
				c.save()
				c.translate(partner.x, partner.y)
				c.strokeStyle = partner.owned?gui.theme.mouseOwned:gui.theme.mouseEnemy
				c.beginPath()
				let radius = partner.size + (partner.level||0) * 2 + 1.75 + 0.5 * Math.sin(this.frame / 30) 
				c.arc(0, 0, radius, 0, 6.29)
				c.stroke()
				c.restore()
			}
		}
		c.restore()
	},
	
	renderAnimations(c) {
		for (let point of this.animatingPoints) {
			point.render(c)
			if (!point.animating) {
				this.animatingPoints.delete(point)
				this.updateBackground = true
			}
		}
		function renderProgress(point) {
			c.save()
			c.translate(point.x, point.y)
			const end = point.coordinatesOn(point.progress)
			c.moveTo(point.sdx - point.x, point.sdy - point.y)
			c.lineTo(end.x, end.y)
			c.restore()
		}
		c.strokeStyle = gui.theme.progress
		c.beginPath()
		this.map.renderedPoints.filter(x => !x.owned && x.progress > 0).map(renderProgress)
		c.stroke()
		this.renderMarkers(c)
		animations.render(c)
	},
	
	renderCircle(c, radius) {
		c.save()
		c.fillStyle = gui.theme.magicbg
		c.strokeStyle = gui.theme.magic
		c.lineWidth = 5
		c.beginPath()
		c.moveTo(radius, 0)
		c.arc(0, 0, radius, 0, 6.29)
		c.fill()
		if (radius > 50) {
			c.moveTo(radius-15, 0)
			c.arc(0, 0, radius - 15, 0, 6.29)
			const length = (radius - 7.5) / 10 | 0
			const step = Math.PI / length
			let angle = 0
			for (let i = 0; i < length; i++) {
				angle += step
				c.lineTo(radius * Math.cos(angle), radius * Math.sin(angle))
				angle += step
				c.lineTo((radius - 15) * Math.cos(angle), (radius - 15) * Math.sin(angle))
			}
		}
		c.stroke()
		c.restore()
	},
	
	renderMarkers(c) {
		if (!this.map.markers) 
			return
		
		const frame = this.frame % 1000

		if (this.renderData.radar && frame < 250) {
			c.save()
			c.beginPath()

			c.globalAlpha = 1 - (frame / 250)
			c.strokeStyle = this.renderData.radar
						
			this.map.markers.map(pt => {
				c.moveTo(pt.x + frame, pt.y)
				c.arc(pt.x, pt.y, frame, 0, 6.29)
			})
			
			c.translate(-viewport.halfWidth, -viewport.halfHeight)
			c.stroke()
			c.restore()
		}		
	},
	
	setMap(name, retain = false) {
		if (this.map) {
			this.map.destroyDisplays()
		}
	
		const oldMap = this.activeMap
		
		if (this.maps[this.activeMap] && retain)
			this.maps[this.activeMap] = JSON.parse(JSON.stringify(this.maps[this.activeMap]))

		this.animatingPoints.clear()
		animations.reset()

		//FIX BEHAVIOR FOR TRANSITION IF CLONES AVAILABLE BY THE TIME
		//VIRTUAL MAPS ARE ON

		const depth = retain ? this.map.points[0].mineDepth || 0 : 0
		const miners = retain ? this.sliders.filter(x => x.target && x.target.index == 0) : []
		if (retain)
			this.production.mana += this.skills.magic?(this.map.manaBase) * (this.map.ownedRadius ** 2):0
				
		this.activeMap = name
		this.maps[name] = this.map = GameMap(this.maps[name], mapLoader)
		if (name == "main") this.realMap = this.map

		if (retain) {
			this.sliders.filter (x => x.clone == 2).map(x => x.fullDestroy())
			this.production.mana -= this.skills.magic?(this.map.manaBase) * (this.map.ownedRadius ** 2):0
			this.sliders.map(x => x.assignTarget(null))
			miners.map(x => x.assignTarget(this.map.points[0]))

			if (name != "main") {
				this.sliders.map(slider => {
					Object.keys(slider.stats).map(x => {
						if (slider.end[name] && slider.end[name][x]) {
							slider.start[name][x] += slider.stats[x] - slider.end[name][x]
						}
					})
				})				
			}
			if (oldMap != "main")
				this.sliders.map(slider => slider.end[oldMap] = Object.assign({}, slider.stats))			

			this.sliders.map(x => x.autoTarget())
			this.map.points[0].mineDepth = depth
		}
		gui.target.reset()
		gui.hover.reset()

		mouse.closest = null		
		this.update()
		gui.tabs.setTitle("map", (this.map.virtual?"Virtual map":"Map")+" (Level " + this.map.level + ")")
		gui.skills.updateSkills()
		this.unlockStory((this.map.virtual?"v":"m")+this.map.level.digits(3)+"")
		viewport.init()
	},
	
	unlockStory(x) {
		if (!x || game.story[x]) return
		game.story[x] = Math.round((this.statistics.onlineTime || 0) + (this.statistics.offlineTime || 0))
		gui.story.updateStory()
		if (STORY[x] && STORY[x].forced >= settings.storyDisplay)
			gui.story.popupStory()
	},

	update() {
		this.map.update()
		//this.production.mana = this.skills.magic?(this.map.level ** 2) * (this.map.ownedRadius ** 2) / 1e8:0
		viewport.getLimits(this.map.bounds)
		this.updateBackground = true
		gui.updateTabs()
		gui.skills.updateSkills()
		this.updateRenderData()
	},
	
	ascend(repeat = false) {
		if (this.map.markers && this.map.markers.length) 
			return
			
		if (this.resources.stars >= this.map.ascendCost && !this.map.boss || this.map.boss && !this.map.points.filter(x => x.boss == this.map.boss && !x.owned).length) {
			
			if (!this.map.virtual && !confirm(this.map.virtual?"Abandon this virtual map?":"Ascend to the next map?")) 
				return
			
			gui.hover.reset()
			gui.target.reset()

			let bossPoints = this.map.points.filter(x => x.boss && x.boss > this.map.boss && !x.owned)
			if (bossPoints.length) {
				if (!this.map.boss && !this.map.virtual) {
					const foundStars = this.map.points.filter(x => x.exit && x.owned).length
					this.resources.stardust += this.resources.stars - foundStars
					this.addStatistic("stardust", this.resources.stars - foundStars)
					this.resources.stars = foundStars - this.map.ascendCost
				}
				
				this.map.boss++
				this.map.points.filter(x => x.boss == this.map.boss && x.away == 1).map(x => x.animate(1, 120))
				if (game.skills.sensor)
					this.map.points.filter(x => x.away == 2 && (!x.boss || x.boss <= x.map.boss) && x.parent && x.parent.boss && (x.parent.boss == this.map.boss)).map(x => x.animate(2, 120))
				this.update()
				this.unlockStory((this.map.virtual?"v":"m")+this.map.level.digits(3)+"b"+this.map.boss.digits(1)+"a")
			} else {
				if (!this.map.virtual)
					saveState("_Autosave before ascension")
				
				if (!this.map.boss && !this.map.virtual) {
					const foundStars = this.map.points.filter(x => x.exit && x.owned).length
					this.resources.stardust += this.resources.stars - foundStars
					this.addStatistic("stardust", this.resources.stars - foundStars)
					this.resources.stars = foundStars - this.map.ascendCost
				}
				if (this.map.complete) this.addStatistic(this.virtual?"comleted_virtual_maps":"comleted_maps")
			
				if (this.map.virtual) {
					if (repeat) {
						let name = this.activeMap
						let level = this.map.level
						this.deleteMap(name, true)
						this.createMap(name, level, true)
						this.setMap(name)
					} else {
						this.setMap("main", true)
					}
				} else {
					this.sliders.filter(x => x.clone).map (x => x.fullDestroy())
					this.createMap("main", this.realMap.level+(repeat?0:1), false)
					this.setMap("main", true)
				}
			}
			this.map.points.map(x => x.getReal())
			this.sliders.map(x => x.autoTarget())
			gui.skills.updateSkills()
			gui.setTheme(settings.theme, this.map.boss?"boss":"main")
		}
	},
	
	createMap(name, level, virtual, focus) {
		this.maps[name] = GameMap(mapLevel(level, virtual), {focus}, mapMaker)	
		this.sliders.map (x => {
			x.start[name] = Object.assign({}, x.stats)
			x.end[name] = Object.assign({}, x.stats)
		})
		return this.maps[name]
	},
	
	deleteMap(name, keepStats = false) {
		if (this.activeMap == name)
			this.setMap("main", true)
		if (!keepStats) {
			const map = GameMap(this.maps[name], mapLoader)
			map.points.map(point => point.suspend())
		} else {
			const map = GameMap(this.maps[name], mapLoader)
			this.production.mana += this.skills.magic?(map.manaBase) * (map.ownedRadius ** 2):0
		}
		delete this.maps[name]
	},
	
	advance(deltaTime) {
		const tempOffline = (deltaTime > 60000) && !this.offline
		if (tempOffline) this.offline = true
		if (game.dev && game.dev.boost) deltaTime *= game.dev.boost
		
		this.activeRender = !document.hidden && gui.tabs.activeTab == "map" && !this.slowMode
		
		if (settings.slowModeIdle && performance.now() - this.lastAction > settings.slowModeIdle)
			this.enableSlowMode(1)
		
		if (performance.now() - this.lastSave > 5000) {
			saveState("_Autosave", 1)
			this.lastSave = performance.now()
		}		
		
/*		this.autoTimer = (this.autoTimer || GAME_AUTOMATION_PERIOD) - deltaTime
		if (this.autoTimer <= 0) {
			this.autoUpgrade()
			this.autoTimer = GAME_AUTOMATION_PERIOD
		}*/

		if (this.offline)
			this.addStatistic("offlineTime", deltaTime)
		else
			this.addStatistic("onlineTime", deltaTime)
		
		this.timeStep(deltaTime / 1000)
				
		if (tempOffline) this.offline = false

		this.updateInterface = true
	},
	
	autoUpgrade() {
		const upgradablePoints = this.map.points.filter(x => x.index && x.owned && !x.boss)
		this.autoUpgrading = 1
		if (game.skills.automation){
			let points = upgradablePoints.filter(x => this.automation.types.includes(x.type) && ((x.level || 0) < this.automation.maxLevel) && (x.costs.levelUp >= 0)).sort((x,y) => x.costs.levelUp - y.costs.levelUp)
			while (points[0] && points[0].costs.levelUp <= this.resources.gold * this.automation.maxCost * 0.01) points.shift().levelUp()
		}
		if (game.skills.buildAutomation) {
			Object.keys(BUILDINGS).map(x => {
				if (!game.automation.buildings[x]) return
				upgradablePoints.map(point => {
					if (point.level < BUILDINGS[x].level) return
					if (point.costs[x] > this.resources.gold || point.costs[x] < 0) return
					point.build(x)
				})
			})
		}
		if (this.autoUpgrading > 1) {
			this.update()
			gui.target.updateUpgrades()
			if (this.autoUpgrading & 2) {
				if (gui.management.sortOften && gui.tabs.activeTab == "management") gui.management.update(true)
			}
		}
		this.autoUpgrading = 0
	},
	
	timeStep(time) {
		this.iterations = GAME_ADVANCE_ITERATIONS
		let totalIterations = GAME_ADVANCE_ITERATIONS_MAX
		while (time > 1e-6) {
			this.iterations--
			if (!--totalIterations)
				this.iterations = 0
		
			const manaTime = (!this.resources.mana || this.real.production.mana >= 0) ? time : -(this.resources.mana / this.real.production.mana)
			const expTime = (!this.resources.exp || this.real.production.exp >= 0) ? time : -(this.resources.exp / this.real.production.exp)
			const damageTime = [...this.attacked].reduce((v, point) => {
				if (!point.index || !point.real || point.real.loss <= 0) {
					point.real.loss = 0
					return v
				}
				return Math.min(v, Math.max(0.1, point.real.defence / point.real.loss / 10))
			}, 60)
			
			const deltaTime = this.iterations?Math.min(damageTime, time, manaTime, expTime):time
						
			const mul = deltaTime / 2
			this.sliders.map(slider => slider.grow(mul))

			this.getReal()
			
			this.attacked.clear()
			this.map.points.map (point => point.getReal())
			this.sliders.map (slider => slider.getReal())
			this.getRealProduction()
			
			for (let point of this.attacked) point.attack(deltaTime)

			this.sliders.map(slider => slider.advance(deltaTime))
			
			this.sliders.map(slider => slider.grow(mul))
	
			RESOURCES.map(x => this.resources[x] += this.real.production[x] * mul * 2)

			RESOURCES.map(x => {
				if (this.resources[x] < 1e-8) this.resources[x] = 0
			})
			

			this.autoTimer = (this.autoTimer || GAME_AUTOMATION_PERIOD) - deltaTime * (this.offline?100000:1000)
			if (this.autoTimer <= 0) {
				this.autoUpgrade()
				this.autoTimer = GAME_AUTOMATION_PERIOD
			}

			this.getReal()
			this.map.points.map (point => point.getReal())
			this.sliders.map (slider => slider.getReal())
	
			time -= deltaTime
		}
	},
	
	getSkill(skill, free) {
		if (!skill || !SKILLS[skill] || game.skills[skill]) 
			return
		if (!free) {
			if (game.resources.exp < SKILLS[skill].exp * game.skillCostMult) 
				return
			if (SKILLS[skill].map && game.realMap.level < SKILLS[skill].map) 
				return
			if (SKILLS[skill].sliders && game.sliders.length < SKILLS[skill].sliders) 
				return
			if (SKILLS[skill].science && game.resources.science < SKILLS[skill].science)
				return
			game.resources.exp -= SKILLS[skill].exp * game.skillCostMult
		}
		this.map.points.map(point => point.suspend())
		this.skills[skill] = 1
		this.skillCostMult *= SKILLS[skill].mult || 1
		SKILLS[skill].onGet && SKILLS[skill].onGet()
		this.map.points.map(point => point.unsuspend())
		this.update()
		gui.skills.updateSkills()
		gui.skills.updateExp()
		this.unlockStory("s_"+skill)
	},
		
	addStatistic(name, value = 1) {
		this.statistics[name] = (this.statistics[name] || 0) + value
	},
	
	getReal() {
		if (!this.real) this.real = {}
		if (!this.real.multi) this.real.multi = {}
		if (!this.real.growth) this.real.growth = {}
		if (!this.real.production) this.real.production = {}
		
		Object.keys(this.growth).map(x => {
			this.real.multi[x] = this.multi[x] * (1 + 1 * (this.stardust[x] || 0) * (this.resources.clouds || 0))
			this.real.growth[x] = this.growth[x] * this.real.multi[x]
		})
	},
	
	getRealProduction() {
		RESOURCES.map (x => this.real.production[x] = this.production[x])
		this.real.production.mana += this.skills.magic?(this.map.manaBase) * (this.map.ownedRadius ** 2):0
		this.real.production.mana -= this.sliders.reduce((v,x) => v + (x.real && x.real.usedMana || 0), 0)
		this.real.production.exp += this.sliders.reduce((v,x) => v + (x.real && x.real.expChange || 0), 0)
		this.real.production.gold += this.sliders.reduce((v,x) => x.target && !x.target.index?v + (x.real && x.real.attack || 0):v, 0)
		this.real.production.gold += this.sliders.reduce((v,x) => v + (x.real && x.real.madeGold || 0), 0)
	},
		
	enableSlowMode(x = 1) {
//		console.log("Set slow mode "+x)
		if (this.slowMode) {
			this.slowMode = Math.max(this.slowMode, x)
			return
		}
		this.slowMode = x
		this.worker.postMessage({
			name : "setFPS",
			value : settings.slowDataFPS
		})
		gui.oldTab = gui.tabs.activeTab
		gui.tabs.setTab("map")
//		gui.map.foreground.classList.toggle("hidden", this.slowMode)
//		gui.map.background.classList.toggle("hidden", this.slowMode)
		gui.map.dvGrowth.classList.toggle("hidden", this.slowMode)
		gui.map.dvResources.classList.toggle("hidden", this.slowMode)
		gui.map.dvAscend.classList.toggle("hidden", this.slowMode)
		gui.map.dvSliders.classList.toggle("hidden", this.slowMode)
		gui.map.dvLowLoad.classList.toggle("hidden", !this.slowMode)
		gui.map.updateLowLoad(true)
		gui.hover.reset()
		gui.target.reset()
	},
	
	disableSlowMode() {
//		console.log("Unset slow mode")
		this.slowMode = 0
		this.worker.postMessage({
			name : "setFPS",
			value : settings.dataFPS
		})
		gui.tabs.setTab(gui.oldTab || "map")
//		gui.map.foreground.classList.toggle("hidden", this.slowMode)
//		gui.map.background.classList.toggle("hidden", this.slowMode)
		gui.map.dvLowLoad.classList.toggle("hidden", !this.slowMode)
		gui.map.dvGrowth.classList.toggle("hidden", this.slowMode)
		gui.map.dvAscend.classList.toggle("hidden", this.slowMode)
		gui.map.dvResources.classList.toggle("hidden", this.slowMode)
		gui.map.dvSliders.classList.toggle("hidden", this.slowMode)
		this.updateBackground = true
		this.updateInterface = true
		this.updateRenderData()
	},
	
	toJSON() {
		this.saveTime = Date.now()
		let o = Object.assign({}, this)
		o.saveSkills = Object.keys(o.skills).filter(x => o.skills[x])
		delete o.skills
		delete o.updateBackground
		delete o.dev
		delete o.frame
		delete o.lastSave
		delete o.slowMode
		delete o.activeRender
		delete o.animatingPoints
		delete o.attacked
		delete o.autoTimer
		delete o.real
		delete o.realMap
		delete o.map
		delete o.renderData
		delete o.offline
		delete o.autoUpgrading
		delete o.iterations
		delete o.updateInterface
		return o
	},
	
	load(save, hibernated = false, auto = false) {
		if (!save) return
		
		if (!auto)
			saveState("_Autosave before load", 1)

		animations.reset()
		this.animatingPoints.clear()
		Object.keys(this.skills).map(x => this.skills[x] = 0)
		this.sliders.map(x => x.destroy())
		
		this.skillCostMult = save.skillCostMult || this.skillCostMult
		this.growth = save.growth || POINT_TYPES.reduce((v, x, n) => (n ? v[x] = 0 : v, v), {}),
		this.multi = save.multi || POINT_TYPES.reduce((v, x, n) => (n ? v[x] = 1 : v, v), {}),
		Object.assign(this.automation, save.automation)

		this.attacked.clear()
		this.autoTimer = GAME_AUTOMATION_PERIOD

		this.story = save.story || {}
		this.statistics = save.statistics || {}
		this.lastViewedStory = save.lastViewedStory || 0
		gui.story.updateStory()
		RESOURCES.map(x => {
			this.resources[x] = save.resources && save.resources[x] || 0
			this.production[x] = save.production && save.production[x] || 0
		})
		POINT_TYPES.slice(1).map(x => {
			this.stardust[x] = save.stardust && save.stardust[x] || 0
		})
		
		save.saveSkills.map(x => this.skills[x] = 1)

		this.maps = save.maps || {"main" : save.map}
		const activeMap = save.activeMap || "main"
		
		this.realMap = this.maps["main"]
		this.setMap(activeMap, false)
		
		this.sliders = save.sliders.map(x => Slider(x))

		this.sliders.map(x => x.target && x.autoTarget())

		this.map.getOwnedRadius()
		
		this.update()
		gui.skills.updateSkills()
		this.lastSave = performance.now()

		this.getReal()
		this.map.points.map (point => point.getReal())
		this.sliders.map (slider => slider.getReal())
		this.getRealProduction()

		this.offline = true
		if (save.saveTime && !hibernated) {
			let time = Math.max(1, Date.now() - save.saveTime)
			if (time > 5001) {
				this.advance(5001)
				time -= 5001
			}
			this.advance(time)
		} else 
			this.advance(1)
		this.offline = false
		
		gui.setTheme(settings.theme, this.map.boss?"boss":"main")
		gui.tabs.setTab("map")

		gui.stardust.newMapLevelSlider.setMax(this.realMap.level)
		gui.stardust.newMapLevelSlider.steps = this.realMap.level
		gui.stardust.newMapLevelSlider.setValue(this.realMap.level)
	},
	
	reset(auto) {
		if (!auto)
			saveState("_Autosave before reset", 1)

		animations.reset()
		this.animatingPoints.clear()
		Object.keys(this.skills).map(x => this.skills[x] = this.dev && this.dev.autoSkills && this.dev.autoSkills.includes(x)?1:0)
		RESOURCES.map(x => {
			this.resources[x] = 0
			this.production[x] = 0
		})
		POINT_TYPES.slice(1).map(x => {
			this.stardust[x] = 0
		})
		Object.assign(this.automation, {
			types : [],
			maxLevel : 0,
			maxCost : 100,
			buildings : {}
		})
		this.story = {}
		gui.story.updateStory()
		this.lastViewedStory = 0,
		this.statistics = {
			onlineTime : 1
		}
		Object.keys(this.growth).map(x => this.growth[x] = 0)
		Object.keys(this.multi).map(x => this.multi[x] = 1)
		Object.keys(this.resources).map(x => this.resources[x] = 0)
		Object.keys(this.stardust).map(x => this.stardust[x] = 0)
		Object.keys(this.production).map(x => this.production[x] = 0)
		this.autoTimer = GAME_AUTOMATION_PERIOD
		
		this.maps = {}
		let map = this.createMap("main", 0, false)
		this.setMap("main", false)
	
		let sliders = Array(1).fill().map(x => Slider({
			stats : {
				power : map.basePower,
				spirit : map.basePower * 5,
			}
		}))
		this.sliders && this.sliders.map(x => x.destroy())
		this.sliders = sliders
		
		let firstTarget = [...this.map.points[0].children][0]
		firstTarget.type = 1
		this.sliders[0].assignTarget(firstTarget)
		this.growth.power = this.map.basePower / 500

		this.skillCostMult = 1
		gui.skills.updateSkills()
		this.attacked.clear()

		this.getReal()
		this.map.points.map (point => point.getReal())
		this.sliders.map (slider => slider.getReal())
		this.getRealProduction()

		this.advance(1)
		gui.setTheme(settings.theme, this.map.boss?"boss":"main")
		gui.tabs.setTab("map")
	}
}