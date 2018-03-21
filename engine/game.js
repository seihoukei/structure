'use strict'
const RESOURCES = ["exp","science","stars","gold","mana","stardust","fears","clouds"]

//l = 1,m = Array(51).fill().map((x,n) => Map(mapLevel(n), mapMaker)).map(m => m.points.map(x => x.power * x.length).filter(x => x)).map (x => (k=(Math.min(...x)/l),l=Math.max(...x),k)).slice(1), [Math.max(...m), Math.min(...m)]
const game = {
	updateBackground : false,
	skillCostMult : 1,
	sliders : [],
	animatingPoints : new Set(),
	frame : 0,
	frameTime : 100,
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
	stardust : {},
	statistics : {
		onlineTime : 1
	},
	renderData: {},
	story : {},
	lastSave : performance.now(),
	
	updateRenderData() {	
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
	
	setMap(map) {
		if (this.map)
			this.map.destroyDisplays()
		this.map = map
		this.sliders.map(x => x.target = null)
		mouse.closest = null		
		this.update()
		gui.tabs.setTitle("map", "Map (Level " + map.level + ")")
		gui.skills.updateSkills()
		this.unlockStory("m"+this.map.level.digits(3)+"")
		viewport.init()
	},
	
	unlockStory(x) {
		if (!x || game.story[x]) return
		game.story[x] = (this.statistics.onlineTime || 0) + (this.statistics.offlineTime || 0)
		if (gui.tabs.activeTab == "story") {
			gui.story.updateStory()
		}
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
	
	ascend() {
		if (this.map.markers && this.map.markers.length) 
			return
			
		if (this.resources.stars >= this.map.ascendCost && !this.map.boss || this.map.boss && !this.map.points.filter(x => x.boss == this.map.boss && !x.owned).length) {
			
			if (!confirm("Ascend to the next map?")) 
				return
			
			gui.hover.reset()
			gui.target.reset()

			let bossPoints = this.map.points.filter(x => x.boss && x.boss > game.map.boss && !x.owned)
			if (bossPoints.length) {
				if (!this.map.boss) {
					const foundStars = this.map.points.filter(x => x.exit && x.owned).length
					this.resources.stardust += this.resources.stars - foundStars
					game.addStatistic("stardust", this.resources.stars - foundStars)
					this.resources.stars = foundStars - this.map.ascendCost
				}
				
				this.map.boss++
				this.map.points.filter(x => x.boss == this.map.boss && x.away == 1).map(x => x.animate(1, 120))
				if (game.skills.sensor)
					this.map.points.filter(x => x.away == 2 && (!x.boss || x.boss <= x.map.boss) && x.parent && x.parent.boss && (x.parent.boss == this.map.boss)).map(x => x.animate(2, 120))
				this.update()
				this.unlockStory("m"+this.map.level.digits(3)+"b"+this.map.boss.digits(1)+"a")
			} else {
				saveState("_Autosave before ascension")
				
				if (!this.map.boss) {
					const foundStars = this.map.points.filter(x => x.exit && x.owned).length
					this.resources.stardust += this.resources.stars - foundStars
					game.addStatistic("stardust", this.resources.stars - foundStars)
					this.resources.stars = foundStars - this.map.ascendCost
				}
				if (game.map.complete) game.addStatistic("comleted_maps")
					
				this.sliders.filter(x => x.clone).map (x => x.destroy())
				this.sliders = this.sliders.filter (x => !x.clone)
				const depth = this.map.points[0].mineDepth
				const miners = this.sliders.filter(x => x.target && x.target.index == 0)

				this.production.mana += this.skills.magic?(this.map.level ** 2) * (this.map.ownedRadius ** 2) / 1e8:0
				this.setMap(Map(mapLevel(this.map.level+1), mapMaker))
				this.map.points[0].mineDepth = depth
				miners.map(x => x.assignTarget(this.map.points[0]))
				gui.target.reset()
				gui.hover.reset()
			}
			this.map.points.map(x => x.getReal())
			this.sliders.map(x => x.autoTarget())
			gui.skills.updateSkills()
			gui.setTheme(settings.theme, this.map.boss?"boss":"main")
		}
	},
	
	advance(deltaTime) {
		if (game.dev && game.dev.boost) deltaTime *= game.dev.boost
		
		this.activeRender = !document.hidden && gui.tabs.activeTab == "map"
		
		if (performance.now() - this.lastSave > 5000) {
			this.autoUpgrade()
			saveState("_Autosave", 1)
			this.lastSave = performance.now()
		}		
		
		if (this.offline)
			this.addStatistic("offlineTime", deltaTime)
		else
			this.addStatistic("onlineTime", deltaTime)
		
		this.timeStep(deltaTime / 1000)
				
		this.updateInterface = true
	},
	
	autoUpgrade() {
		const upgradablePoints = this.map.points.filter(x => x.index && x.owned && !x.boss)
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
	},
	
	timeStep(time) {
		this.iterations = 100
		while (time > 1e-6) {
			this.iterations--
		
			const manaTime = (!this.resources.mana || this.real.production.mana >= 0) ? time : -(this.resources.mana / this.real.production.mana)
			const expTime = (!this.resources.exp || this.real.production.exp >= 0) ? time : -(this.resources.exp / this.real.production.exp)
			const deltaTime = this.iterations?Math.min(this.iterations < 50?this.iterations < 20?100:10:1, time, manaTime, expTime):time
						
			const mul = deltaTime / 2
			this.sliders.map(slider => slider.grow(mul))

			this.getReal()
			this.map.points.map (point => point.getReal())
			this.sliders.map (slider => slider.getReal())
			this.getRealProduction()

			this.sliders.map(slider => slider.advance(deltaTime))
			
			this.sliders.map(slider => slider.grow(mul))
	
			RESOURCES.map(x => this.resources[x] += this.real.production[x] * mul * 2)

			RESOURCES.map(x => {
				if (this.resources[x] < 1e-8) this.resources[x] = 0
			})
			

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
			if (SKILLS[skill].map && game.map.level < SKILLS[skill].map) 
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
			this.real.multi[x] = this.multi[x] * (1 + 1 * this.stardust[x] * this.resources.clouds)
			this.real.growth[x] = this.growth[x] * this.real.multi[x]
		})
	},
	
	getRealProduction() {
		RESOURCES.map (x => this.real.production[x] = this.production[x])
		this.real.production.mana += this.skills.magic?(this.map.level ** 2) * (this.map.ownedRadius ** 2) / 1e8:0
		this.real.production.mana -= this.sliders.reduce((v,x) => v + (x.real && x.real.usedMana || 0), 0)
		this.real.production.exp += this.sliders.reduce((v,x) => v + (x.real && x.real.expChange || 0), 0)
		this.real.production.gold += this.sliders.reduce((v,x) => x.target && !x.target.index?v + (x.real && x.real.attack || 0):v, 0)
	},
		
	toJSON() {
		this.saveTime = Date.now()
		let o = Object.assign({}, this)
		o.saveSkills = Object.keys(o.skills).filter(x => o.skills[x])
		delete o.skills
		delete o.updateBackground
		delete o.dev
		delete o.frame
		delete o.frameTime
		delete o.lastSave
		delete o.activeRender
		delete o.animatingPoints
		delete o.real
		delete o.renderData
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

		this.story = save.story || {}
		this.statistics = save.statistics || {}
		gui.story.updateStory()
		RESOURCES.map(x => {
			this.resources[x] = save.resources && save.resources[x] || 0
			this.production[x] = save.production && save.production[x] || 0
		})
		POINT_TYPES.slice(1).map(x => {
			this.stardust[x] = save.stardust && save.stardust[x] || 0
		})
		
		this.setMap(Map(save.map, mapLoader))
		save.saveSkills.map(x => this.skills[x] = 1)
		this.sliders = save.sliders.map(x => Slider(x))

		this.sliders.map(x => x.target && x.autoTarget())

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
		this.statistics = {
			onlineTime : 1
		}
		Object.keys(this.growth).map(x => this.growth[x] = 0)
		Object.keys(this.multi).map(x => this.multi[x] = 1)
		Object.keys(this.resources).map(x => this.resources[x] = 0)
		Object.keys(this.stardust).map(x => this.stardust[x] = 0)
		Object.keys(this.production).map(x => this.production[x] = 0)
		let map = Map(mapLevel(0), mapMaker)
	
		this.setMap(map)
	
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

		this.getReal()
		this.map.points.map (point => point.getReal())
		this.sliders.map (slider => slider.getReal())
		this.getRealProduction()

		this.advance(1)
		gui.setTheme(settings.theme, this.map.boss?"boss":"main")
		gui.tabs.setTab("map")
	}
}