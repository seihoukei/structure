'use strict'
const RESOURCES = ["exp","science","stars","gold","mana","stardust","fears","clouds","thunderstone","_0","_1","_2","_3","_4","_5","_6"]
const GAME_ADVANCE_ITERATIONS = 10000
const GAME_ADVANCE_ITERATIONS_MAX = 100000
const GAME_ADVANCE_ITERATIONS_STEP = 200
const GAME_ADVANCE_ITERATIONS_STEP_TIME = 500
const GAME_AUTOMATION_PERIOD = 1000

const BASE_AVAILABLE = {
	buildings : [[],[],[],[],[]],
	spells : [],
}

//l = 1,m = Array(51).fill().map((x,n) => GameMap(mapLevel(n), mapMaker)).map(m => m.points.map(x => x.power * x.length).filter(x => x)).map (x => (k=(Math.min(...x)/l),l=Math.max(...x),k)).slice(1), [Math.max(...m), Math.min(...m)]
const game = {
	updateMapBackground : false,
	updateWorldBackground : false,
	skillCostMult : 1,
	sliders : [],
	sliderPresets : {},
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
	research : {},
	available : Object.assign({}, BASE_AVAILABLE),
	attacked : new Set(),
	harvesting : new Set(),
	stardust : {},
	statistics : {
		onlineTime : 1
	},
	renderData: {},
	story : {},
	lastViewedStory : 0,
	lastSave : performance.now(),
	lastCloudSave : performance.now(),
	
	updateRenderData() {	
		if (!gui.mainViewport.width || !gui.mainViewport.height) return
		if (!this.renderData.radarCV) {
			this.renderData.radarCV = document.createElement("canvas")
		}
		this.renderData.radarCV.width  = gui.mainViewport.width
		this.renderData.radarCV.height = gui.mainViewport.height
		const c = this.renderData.radarCV.getContext("2d")
		const grad = gui.foregroundContext.createRadialGradient(0, 0, 0, 0, 0, 5)
		grad.addColorStop(0, gui.theme.radar)
		grad.addColorStop(1, "transparent")
		c.translate(gui.mainViewport.halfWidth, gui.mainViewport.halfHeight)
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
		
		gui.dvOffline.classList.toggle("hidden", !this.offline)
		
		if (this.offline) {
/*			const time = timeString(this.timeLeft * 1000, 1).split(" ")
			let timeStr = time.slice(0,4).join(" ")
			if (time.length > 4)
				timeStr += "\n"+time.slice(4).join(" ")*/
			gui.dvOfflineCountdown.innerText = shortTimeString(this.timeLeft, 0, 2, false)
		} else {
			if (gui.tabs.activeTab == "map") {
				if (this.slowMode) {
					if (this.updateInterface) 
						gui.map.updateLowLoad()
				} else {
					if (this.updateMapBackground) {
						this.renderBackground(gui.backgroundContext)
						this.updateMapBackground = false
					}
					this.renderForeground(gui.foregroundContext)
					
					if (this.updateInterface) {
						gui.map.dvResources.innerText = Object.entries(game.resources).reduce((v,x) => x[0][0]=="_"?v:x[1]?v+"\n"+x[0].capitalizeFirst() + ": " + displayNumber(x[1]) + (game.real.production[x[0]]?" ("+(game.real.production[x[0]]>0?(x[0] == "science" && game.researching?"Researching ":"+"):"")+displayNumber(game.real.production[x[0]])+"/s)":""):v,"").trim()
						gui.map.updateGrowth()
						gui.map.updateHarvest()
					}
				}
			}
	
			if (gui.tabs.activeTab == "stardust") {
				gui.map.updateGrowth()
			}
		
			if (gui.tabs.activeTab == "world") {
				if (this.updateWorldBackground)
					this.world.renderBackground(gui.world.backgroundContext)
				this.updateWorldBackground = false
				this.world.render(gui.world.foregroundContext)
				if (this.updateInterface) {
					gui.map.updateHarvest()
				}
			}
	
			if (this.updateInterface) {
				gui.update()
			}
	
			if (!(this.frame % 60)) {
				gui.skills.updateExp()
				gui.artifacts.updateTitle()
			}		
	
			this.updateInterface = false
		}
	},
	
	renderBackground(c) {
		c.clearRect(0, 0, gui.mainViewport.width, gui.mainViewport.height)
		c.save()
		c.translate(gui.mainViewport.halfWidth, gui.mainViewport.halfHeight)
		c.scale(gui.mainViewport.current.zoom, gui.mainViewport.current.zoom)
		c.translate(-gui.mainViewport.current.x, -gui.mainViewport.current.y)
		if (this.skills.magic)
			this.renderCircle(c, this.map.ownedRadius)
		//this.renderCircle(c, this.map.size)
		this.map.renderMap(c)
		c.restore()
	},	
	
	renderForeground(c) {
		function drawPing(col, x, y, size) {
			c.save()
			c.translate(x,y)
			if (size)
				c.scale(size/5, size/5)
			else
			c.scale(1/gui.mainViewport.current.zoom, 1/gui.mainViewport.current.zoom)
			const radius = 10 - game.frame % 20 / 2
			c.strokeStyle = col
			for (let i = 0; i < 3; i++) {
				c.globalAlpha = Math.min(1, 2 - 0.66 * i - radius / 15)
				c.beginPath()
				c.lineWidth = (40 - radius - i*10) / 10
				c.moveTo(radius + i * 10, 0)
				c.arc(0, 0, radius + i * 10, 0, 6.29)
				c.stroke()
			}
			c.restore()
		}

		c.clearRect(0, 0, gui.mainViewport.width, gui.mainViewport.height)
		c.save()
		c.lineWidth = Math.max(1, 1.5/gui.mainViewport.current.zoom)
		c.translate(gui.mainViewport.halfWidth, gui.mainViewport.halfHeight)
		c.scale(gui.mainViewport.current.zoom, gui.mainViewport.current.zoom)
		c.translate(-gui.mainViewport.current.x, -gui.mainViewport.current.y)
		c.lineCap = "round"
		this.renderAnimations(c)
		this.sliders.map(x => x.render(c))
		if (gui.mapMouse.closest) {
			c.save()
			c.lineWidth = Math.max(1, 1/gui.mainViewport.current.zoom)
			c.translate(gui.mapMouse.closest.x, gui.mapMouse.closest.y)
			c.strokeStyle = gui.mapMouse.closest.owned?gui.theme.mouseOwned:(gui.mapMouse.closest.lock && !gui.mapMouse.closest.keyData.keyPoint.owned)?gui.theme.shades[11]:gui.theme.mouseEnemy
			c.beginPath()
			let radius = gui.mapMouse.closest.size + (gui.mapMouse.closest.level || 0) * 2 + 1.75 + 0.5 * Math.sin(this.frame / 30) 
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
			
			if (gui.mapMouse.closest.lock) 
				partner = gui.mapMouse.closest.keyData.keyPoint
			if (gui.mapMouse.closest.key) 
				partner = gui.mapMouse.closest.keyData.lockPoint
			
			if (partner && partner.away < 2 && partner.locked < 2) {
				drawPing(partner.owned?gui.theme.mouseOwned:gui.theme.mouseEnemy, partner.x, partner.y, partner.size)
			}

			function drawRegion(point) {
				if (!point.owned) return
				//if (point.locked == 1) return
				c.save()
				c.translate(point.x, point.y)
				const voronoi = point.getVoronoi()
				voronoi.edges.map(edge => {
					c.moveTo(edge.start.x, edge.start.y)
					c.lineTo(edge.end.x, edge.end.y)
/*					c.lineTo(edge.end.x  * 0.8, edge.end.y * 0.8)
					c.lineTo(edge.start.x  * 0.8, edge.start.y * 0.8)
					c.lineTo(edge.start.x, edge.start.y)*/
				})
				c.restore()	
				voronoi.edges.map(edge => {
					c.moveTo(edge.neighbour.x, edge.neighbour.y)
					c.arc(edge.neighbour.x, edge.neighbour.y, 5, 0, 6.29)
					c.arc(edge.neighbour.x, edge.neighbour.y, 7, 0, 6.29)
					c.arc(edge.neighbour.x, edge.neighbour.y, 9, 0, 6.29)
				})
			}
/*			c.beginPath()
			drawRegion(gui.mapMouse.closest)
			c.stroke()//*/
		}
		if (gui.map.hoverSlider && gui.map.hoverSlider.target) {
			const {x,y} = gui.map.hoverSlider.target.coordinatesOn(gui.map.hoverSlider.target.position, true)
			drawPing(gui.map.hoverSlider.color, x, y)
		}
		c.restore()
	},
	
	renderAnimations(c) {
		for (let point of this.animatingPoints) {
			point.render(c)
			if (!point.animating) {
				this.animatingPoints.delete(point)
				this.updateMapBackground = true
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
		function renderQuake(point) {
			c.save()
			const end = {
				x : (point.edx - point.sdx) / 10,
				y : (point.edy - point.sdy) / 10,
			}
			c.moveTo(point.sdx, point.sdy)
			for (let i = 0; i < 10; i++) {
				c.lineTo(point.sdx + i * (end.x + Math.random() - 0.5), point.sdy + i * (end.y + Math.random() - 0.5))
			}
			c.lineTo(point.edx, point.edy)
			
			c.restore()
		}
		function drawHarvest(point) {
			c.save()
			c.translate(point.x, point.y)
			c.moveTo(0, 0)
			c.arc(0, 0, point.renderSize, -1.57, -1.57 + 6.29 * (point.harvestTime / point.harvestTimeTotal))
			c.restore()
		}
		if (settings.meanEffect) {
			c.strokeStyle = gui.theme.lightning
			c.beginPath()
			this.map.renderedPoints.filter(x => !x.owned && x.parent && x.parent.buildings && x.parent.buildings.earthquakeMachine && x.real && x.real.passiveDamage).map(renderQuake)
			c.stroke()
		}
		c.strokeStyle = gui.theme.progress
		c.beginPath()
		this.map.renderedPoints.filter(x => !x.owned && x.progress > 0).map(renderProgress)
		c.stroke()
		if (this.harvesting && this.harvesting.size) {
			c.save()
			c.fillStyle = gui.theme.shades[4]
			c.globalAlpha = 0.7
			c.beginPath()
			this.map.renderedPoints.filter(x => x.harvesting).map(drawHarvest)
			c.fill()
			c.restore()
		}
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
			
			c.translate(-gui.mainViewport.halfWidth, -gui.mainViewport.halfHeight)
			c.stroke()
			c.restore()
		}		
	},
	
	now(precise = false) {
		if (precise)
			return (this.statistics.onlineTime || 0) + (this.statistics.offlineTime || 0)
		return Math.round((this.statistics.onlineTime || 0) + (this.statistics.offlineTime || 0))
	},
	
	setMap(name, retain = false) {
		if (this.map) {
			this.map.destroyDisplays()
		}
	
		const oldMap = this.activeMap
		
//		if (this.maps[this.activeMap] && retain)
//			this.maps[this.activeMap] = JSON.parse(JSON.stringify(this.maps[this.activeMap]))

		this.animatingPoints.clear()
		animations.reset()

		//FIX BEHAVIOR FOR TRANSITION IF CLONES AVAILABLE BY THE TIME
		//VIRTUAL MAPS ARE ON

		const depth = retain ? this.map.points[0].mineDepth || 0 : 0
		const miners = retain ? this.sliders.filter(x => x.target && x.target.index == 0) : []
		if (retain)
			this.production.mana += this.skills.magic?(this.map.manaBase) * (this.map.ownedRadius ** 2):0
				
		if (retain) {
			this.sliders.map(x => x.assignTarget(null))
		}

		this.activeMap = name
		this.map = this.maps[name]// = GameMap(this.maps[name], mapLoader)
		if (name == "main") this.realMap = this.map

		if (retain) {
			this.sliders.filter (x => x.clone == 2).map(x => x.fullDestroy())
			this.production.mana -= this.skills.magic?(this.map.manaBase) * (this.map.ownedRadius ** 2):0
			miners.map(x => x.assignTarget(this.map.points[0]))

			if (name != "main") {
				this.sliders.map(slider => {
					Object.keys(slider.stats).map(x => {
						if (slider.end[name]) {
							slider.start[name][x] += slider.stats[x] - (slider.end[name][x] || slider.start[name][x] || 0)
						}
					})
				})				
			}
			if (oldMap != "main")
				this.sliders.map(slider => slider.end[oldMap] = Object.assign({}, slider.stats))			
			this.maps[oldMap].lastLeft = this.now()
			
			if (this.map.relativeStart && this.map.lastLeft && !this.map.complete)
				this.map.relativeStart += this.now() - this.map.lastLeft

			this.sliders.map(x => x.autoTarget())
			this.map.points[0].mineDepth = depth
		}
		gui.target.reset()
		gui.hover.reset()

		gui.mapMouse.closest = null		
//		this.map.restoreState()
		this.update()
		gui.tabs.setTitle("map", (this.map.virtual?"Virtual map":"Map")+" (Level " + this.map.level + ")")
		gui.skills.updateSkills()
		this.unlockStory((this.map.virtual?"v":"m")+this.map.level.digits(3)+"")
		gui.mainViewport.init(this.map.bounds)
		gui.worldViewport.init(this.world.bounds)
	},
	
	unlockStory(x) {
		if (!x || game.story[x]) return
		game.story[x] = Math.round((this.statistics.onlineTime || 0) + (this.statistics.offlineTime || 0))
		gui.story.updateStory()
		if (STORY[x] && STORY[x].forced >= settings.storyDisplay)
			gui.story.popupStory()
	},
	
	updateAvailable() {
		for (let level = 0; level <= POINT_MAX_LEVEL; level++)
			this.available.buildings[level] = Object.values(BUILDINGS).filter(x => game.skills["build"+x.level] && level >= x.level)
		this.available.spells = Object.values(SPELLS).filter(x => game.skills.spellcasting && game.skills["book_"+x.book])
	},

	update() {
		this.map.update()
		this.world.update()
		this.updateAvailable()
		//this.production.mana = this.skills.magic?(this.map.level ** 2) * (this.map.ownedRadius ** 2) / 1e8:0
		if (!this.offline) {
			gui.mainViewport.getLimits(this.map.bounds)
			this.updateMapBackground = true
			this.updateWorldBackground = true
			gui.updateTabs()
			gui.skills.updateSkills()
			this.updateRenderData()
			this.getFullMoney()
			this.updateHarvesting()
		}
		this.nextTarget = true
	},
	
	updateHarvesting() {
		this.harvesting.clear()
		Object.values(this.maps).map(m => m.points.filter(x => x.harvesting).map(x => this.harvesting.add(x)))
	},
	
	ascend(repeat = false) {
		if (this.map.markers && this.map.markers.length) 
			return
			
		if ((this.resources.stars >= this.map.ascendCost || this.map.virtual) && !this.map.boss || this.map.boss && !this.map.points.filter(x => x.boss == this.map.boss && !x.owned).length) {
			
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
				
				if (this.map.virtual) {
					const summons = game.sliders.filter(x => x.clone == 2).length
					if (summons && !confirm("You have " + pluralize(summons, ["summon", "summons"]) + ". \n Changing map will make "+pluralize(summons, ["it","them"], true)+" disappear. \n Do you really want to go?")) 
						return
				}
				
				if (!this.map.boss && !this.map.virtual) {
					const foundStars = this.map.points.filter(x => x.exit && x.owned).length
					this.resources.stardust += this.resources.stars - foundStars
					this.addStatistic("stardust", this.resources.stars - foundStars)
					this.resources.stars = foundStars - this.map.ascendCost
				}
				if (this.map.complete) this.addStatistic(this.map.virtual?"completed_virtual_maps":"completed_maps")
			
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
		const map = this.maps[name]
		if (this.activeMap == name)
			this.setMap("main", true)
		if (!keepStats) {
			map.points.map(point => point.suspend())
		} else {
			this.production.mana += this.skills.magic?(map.manaBase) * (map.ownedRadius ** 2):0
		}
		map.points.map(point => this.harvesting.delete(point))
		delete this.maps[name]
	},
	
	advance(deltaTime, callback = core.getNextFrame) {
		this.tempOffline = (deltaTime > 60000) && !this.offline
		if (this.tempOffline) this.offline = true
		if (game.dev && game.dev.boost) deltaTime *= game.dev.boost
		
		this.activeRender = !document.hidden && gui.tabs.activeTab == "map" && !this.slowMode && !this.offline
		
		if (settings.slowModeIdle && performance.now() - this.lastAction > settings.slowModeIdle)
			this.enableSlowMode(1)
		
		if (!this.badSave && settings.autosavePeriod && performance.now() - this.lastSave > settings.autosavePeriod) {
			saveState("_Autosave", 1)
			this.lastSave = performance.now()
		}		
		
		if (!this.badSave && settings.cloudPeriod && performance.now() - this.lastCloudSave > settings.cloudPeriod) {
			if (settings.cloudUpdate)
				saveState("_Cloud save", 1)
			this.lastCloudSave = performance.now()
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
		
		if (this.offline) {
			gui.dvOffline.classList.toggle("hidden", false)
			this.timeLeft = deltaTime / 1000
//			gui.dvOfflineCountdown.innerText = "TST"+shortTimeString(deltaTime / 1000)
		}
			
		core.setTimeout(() => {
			this.timeStep(deltaTime / 1000, () => {
					
				if (this.tempOffline && this.offline) {
					this.offline = false
					this.update()
				}
		
				this.updateInterface = true
				
				if (!this.feats.mana1 && this.resources.mana >= 1e13)
					this.feats.mana1 = true

				callback && callback()
			})
		}, 0)
	},
	
	autoUpgrade() {
		const upgradablePoints = this.map.points.filter(x => x.index && x.owned && !x.boss && !x.completed)
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
					if (point.costs[x] > this.resources.gold * this.automation.maxCost * 0.01 || point.costs[x] < 0) return
					point.build(x)
				})
			})
		}
		if (this.autoUpgrading > 1) {
			this.update()
			gui.target.updateUpgrades()
			if (this.autoUpgrading & 2) {
				if (gui.management.sorting.sortOften && gui.tabs.activeTab == "management") gui.management.update(true)
			}
		}
		this.autoUpgrading = 0
	},
	
	getFullMoney() {
//	calculate full autobuild cost
		const buildings = Object.entries(this.automation.buildings).filter(x => x[1]).map(x => x[0])
		const toFinish = this.map.points.filter(x => x.index && x.owned && (!x.level || x.level < 4 || buildings.filter(b => !x.buildings[b] && x.costs[b] > 0).length))
		this.fullMoney = toFinish.reduce((v, point) => v + (point.costs.levelUp || 0) * ([0,1,9,73,585][4-(point.level || 0)]), 0)
		this.fullMoney += toFinish.reduce((v, point) => v + buildings.filter(b => !point.buildings[b] && point.costs[b] > 0).reduce((v,b) => v + point.costs[b],0), 0)
	},
	
	timeStep(time, callback) {
		this.iterations = GAME_ADVANCE_ITERATIONS
		let totalIterations = GAME_ADVANCE_ITERATIONS_MAX
		let stepsDone = 0
		let startTime = performance.now()
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
				
			if (this.harvesting && this.harvesting.size) {
				const harvestTime = deltaTime * this.real.harvestSpeed
				for (let point of this.harvesting) point.advanceHarvest(harvestTime)
			}

			this.sliders.map(slider => slider.advance(deltaTime))
			
			this.sliders.map(slider => slider.grow(mul))
	
			RESOURCES.map(x => {
				if (x == 'science' && this.researching)
					this.research[this.researching].advance(this.real.production[x] * mul * 2)
				else
					this.resources[x] += this.real.production[x] * mul * 2
			})

			RESOURCES.map(x => {
				if (this.resources[x] < 1e-8) this.resources[x] = 0
			})

			this.autoTimer = (this.autoTimer || GAME_AUTOMATION_PERIOD) - deltaTime * (this.offline?10:1000)
			if (this.autoTimer <= 0) {
				this.autoUpgrade()
				this.autoTimer = GAME_AUTOMATION_PERIOD
			}

			this.getReal()
			this.map.points.map (point => point.getReal())
			this.sliders.map (slider => slider.getReal())
	
			time -= deltaTime
			
			if (this.nextTarget) {
				if (game.skills.smartMine)
					this.sliders.filter (x => x.target && !x.target.index).map(x => x.autoTarget())
				this.nextTarget = false
			}
			stepsDone++
//			if (stepsDone == GAME_ADVANCE_ITERATIONS_STEP && !this.cancelTimeStep) {
			if (performance.now() - startTime > GAME_ADVANCE_ITERATIONS_STEP_TIME) {
				if (!this.offline) {
//					this.offline = true
					this.tempOffline = true
				}
				this.advanceCallback = callback
				this.advanceTimeout = core.setTimeout(() => {
					this.timeStep(time, callback)
				}, 0)
				return
			}
			this.timeLeft = time
		}
		this.timeLeft = 0
		delete this.advanceTimeout
		delete this.advanceCallback
		callback()
	},
	
	stopAdvance() {
		if (!this.advanceTimeout) return
		core.clearTimeout(this.advanceTimeout)
		this.advanceCallback()
		delete this.advanceTimeout
		delete this.advanceCallback
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

		this.real.harvestSpeed = this.world.stats.harvestSpeed / this.harvesting.size

		Object.keys(this.growth).map(x => {
			this.real.multi[x] = this.multi[x] * (1 + 1 * (this.stardust[x] || 0) * (this.resources.clouds || 0))
			if (x == "spirit" && this.skills.spiritStar)
				this.real.multi.spirit *= 1 + this.resources.stars * this.resources.stardust
			if (x == "power" && this.real.multi.power > 1e15) {
				this.feats.power1 = 1
				this.real.multi.power = 1e15
			}
			this.real.growth[x] = this.growth[x] * this.real.multi[x]
		})
		
	},
	
	getRealProduction() {
		RESOURCES.map (x => this.real.production[x] = this.production[x])
		this.real.production.mana += this.skills.magic?(this.map.manaBase) * (this.map.ownedRadius ** 2):0
		this.real.production.mana *= this.world.stats.manaSpeed
		this.real.production.mana -= this.sliders.reduce((v,x) => v + (x.real && x.real.usedMana || 0), 0)
		this.real.production.exp += this.sliders.reduce((v,x) => v + (x.real && x.real.expChange || 0), 0)
		this.real.production.gold += this.sliders.reduce((v,x) => x.target && !x.target.index?v + (x.real && x.real.attack || 0):v, 0)
		this.real.production.gold += this.sliders.reduce((v,x) => v + (x.real && x.real.madeGold || 0), 0)
		this.real.production.science *= this.world.stats.scienceSpeed
	},
		
	enableSlowMode(x = 1) {
//		console.log("Set slow mode "+x)
		if (this.slowMode) {
			this.slowMode = Math.max(this.slowMode, x)
			return
		}
		this.slowMode = x
		core.worker.postMessage({
			name : "setFPS",
			value : settings.slowDataFPS
		})
		gui.oldTab = gui.tabs.activeTab
		if (settings.slowModeMap || gui.tabs.activeTab == "map")
			gui.tabs.setTab("map")
//		gui.map.foreground.classList.toggle("hidden", this.slowMode)
//		gui.map.background.classList.toggle("hidden", this.slowMode)
		gui.map.dvGrowth.classList.toggle("hidden", this.slowMode)
		gui.map.dvResources.classList.toggle("hidden", this.slowMode)
//		gui.map.dvAscend.classList.toggle("hidden", this.slowMode)
		gui.map.dvSliders.classList.toggle("hidden", this.slowMode)
		gui.map.dvLowLoad.classList.toggle("hidden", !this.slowMode)
		gui.map.updateLowLoad(true)
		gui.hover.reset()
		gui.target.reset()
	},
	
	disableSlowMode() {
//		console.log("Unset slow mode")
		this.slowMode = 0
		core.worker.postMessage({
			name : "setFPS",
			value : settings.dataFPS
		})
		if (settings.slowModeMap || gui.tabs.activeTab == "map")
			gui.tabs.setTab(gui.oldTab || "map")
//		gui.map.foreground.classList.toggle("hidden", this.slowMode)
//		gui.map.background.classList.toggle("hidden", this.slowMode)
		gui.map.dvLowLoad.classList.toggle("hidden", !this.slowMode)
		gui.map.dvGrowth.classList.toggle("hidden", this.slowMode)
//		gui.map.dvAscend.classList.toggle("hidden", this.slowMode)
		gui.map.dvResources.classList.toggle("hidden", this.slowMode)
		gui.map.dvSliders.classList.toggle("hidden", this.slowMode)
		this.updateMapBackground = true
		this.updateWorldBackground = true
		this.updateInterface = true
		this.updateRenderData()
	},
	
	saveSlidersPreset(name) {
		game.sliders.map(x => x.savePreset(name))
		this.sliderPresets[name] = LZString.compressToBase64(JSON.stringify({
			master : masterSlider
		}))
	},
	
	loadSlidersPreset(name) {
		if (!this.sliderPresets[name]) return
		game.sliders.map(x => {
			if (x.presets[name]) {
				Object.keys(x.artifacts).map(y => x.unequip(y))
				if (x.target) 
					x.targetIndex = x.target.index 
				else 
					delete x.targetIndex
				x.assignTarget(null, true)
				delete x.target
			}
		})
		game.sliders.map(x => x.loadPreset(name))
		const data = JSON.parse(LZString.decompressFromBase64(this.sliderPresets[name]))
		const oldFilter = masterSlider.atFilter
		Object.assign(masterSlider, data.master)
		masterSlider.atFilter = Object.assign(oldFilter, masterSlider.atFilter)
		gui.sliders.onSet()
		gui.sliders.master.update(true)
	},
	
	toJSON() {
		this.saveTime = Date.now()
		let o = Object.assign({}, this)
		o.saveSkills = Object.keys(o.skills).filter(x => o.skills[x])
		o.masterSlider = masterSlider
		o.managementSorting = gui.management.sorting
//		o.tabletSmart = gui.artifacts.smart
		delete o.skills
		delete o.updateMapBackground
		delete o.dev
		delete o.frame
		delete o.lastSave
		delete o.lastCloudSave
		delete o.timeLeft
		delete o.advanceTimeout
		delete o.advanceCallback
		delete o.slowMode
		delete o.nextTarget
		delete o.available
		delete o.activeRender
		delete o.animatingPoints
		delete o.attacked
		delete o.autoTimer
		delete o.real
		delete o.realMap
		delete o.map
		delete o.renderData
		delete o.offline
		delete o.tempOffline
		delete o.autoUpgrading
		delete o.iterations
		delete o.badSave
		delete o.updateInterface
		delete o.fullMoney
		delete o.harvesting
		return o
	},
	
	load(save, hibernated = false, auto = false) {
		if (!save) return
		
		if (!auto)
			saveState("_Autosave before load", 1)

		delete game.badSave

		this.stopAdvance()
		
		animations.reset()
		this.animatingPoints.clear()
		Object.keys(this.skills).map(x => this.skills[x] = 0)
		this.sliders.map(x => x.destroy())
		
		//this.skillCostMult = save.skillCostMult || this.skillCostMult
		this.growth = save.growth || POINT_TYPES.reduce((v, x, n) => (n ? v[x] = 0 : v, v), {}),
		this.multi = save.multi || POINT_TYPES.reduce((v, x, n) => (n ? v[x] = 1 : v, v), {}),
		Object.assign(this.automation, save.automation)

		this.available = Object.assign({},BASE_AVAILABLE)

		this.attacked.clear()
		this.autoTimer = GAME_AUTOMATION_PERIOD

//		gui.artifacts.smart = save.tabletSmart || false

		this.story = save.story || {}
		this.statistics = save.statistics || {}
		this.lastViewedStory = save.lastViewedStory || 0
		gui.story.updateStory()
		
		this.feats = Object.assign({}, save.feats)

		this.world = World(BASE_WORLD, save.world)
				
		RESOURCES.map(x => {
			this.resources[x] = save.resources && save.resources[x] || 0
			this.production[x] = save.production && save.production[x] || 0
		})
		POINT_TYPES.slice(1).map(x => {
			this.stardust[x] = save.stardust && save.stardust[x] || 0
		})
		
		Object.assign(gui.management.sorting, BASE_SORTING, save.managementSorting)

		this.skillCostMult = 1
		save.saveSkills.map(x => {
			this.skills[x] = 1
			this.skillCostMult *= SKILLS[x].mult
		})
		
		this.researching = save.researching

		Object.keys(ARTIFACTS).map(x => {
			this.research[x] = save.research?Research(save.research[x], {name : x}):Research({name : x})//Object.assign({}, createArtifactResearch(x), save.research && save.research[x])
		})

		const done = Object.values(this.research).filter(x => x.done).length
		if (done >= 35) this.feats.science1 = true
		
		this.maps = save.maps || {"main" : save.map}
		Object.keys(this.maps).map(x => this.maps[x] = GameMap(this.maps[x], mapLoader))
		
		const activeMap = save.activeMap || "main"
		
		this.realMap = this.maps["main"]
		this.setMap(activeMap, false)
		
		Object.assign(masterSlider, baseMasterSlider, save.masterSlider)

		this.sliders = save.sliders.map(x => Slider(x))

		Object.keys(this.sliderPresets).map(x => delete this.sliderPresets[x])
		Object.assign(this.sliderPresets, save.sliderPresets)
		
		this.map.getOwnedRadius()
		
		
		this.update()
		gui.skills.updateSkills()
		gui.artifacts.updateTitle()
		this.lastSave = performance.now()
		this.lastCloudSave = performance.now()

		this.getReal()
		this.map.points.map (point => point.getReal())
		this.sliders.map (slider => slider.getReal())
		this.sliders.sort((x,y) => +(y.role == ROLE_LEADER) - +(x.role == ROLE_LEADER)).map(x => x.target && x.autoTarget())
		this.getRealProduction()

//		this.harvesting.clear()
		this.updateHarvesting()

		this.offline = true
		
		const callback = () => {
			this.offline = false
			this.update()
			
			gui.setTheme(settings.theme, this.map.boss?"boss":"main")
			gui.tabs.setTab("map")
	
			gui.stardust.newMapLevelSlider.setMax(this.realMap.level)
			gui.stardust.newMapLevelSlider.steps = this.realMap.level
			gui.stardust.newMapLevelSlider.setValue(this.realMap.level)
			
			gui.sliders.update(true)
			
			core.getNextFrame && core.getNextFrame()
		}
		
		if (save.saveTime && !hibernated) {
			let time = Math.max(1, Date.now() - save.saveTime)
			this.advance(time, callback)
		} else 
			this.advance(1, callback)
	},
	
	reset(auto) {
		if (!auto)
			saveState("_Autosave before reset", 1)
		
		this.stopAdvance()

		animations.reset()
		this.animatingPoints.clear()
		Object.keys(this.skills).map(x => this.skills[x] = this.dev && this.dev.autoSkills && this.dev.autoSkills.includes(x)?1:0)
		this.world = World(BASE_WORLD)
		this.available = Object.assign({},BASE_AVAILABLE)
		RESOURCES.map(x => {
			this.resources[x] = 0
			this.production[x] = 0
		})
		POINT_TYPES.slice(1).map(x => {
			this.stardust[x] = 0
		})
		this.feats = {}
		Object.assign(this.automation, {
			types : [],
			maxLevel : 0,
			maxCost : 100,
			buildings : {}
		})
		Object.assign(gui.management.sorting, BASE_SORTING)
		this.story = {}
		gui.story.updateStory()
		this.lastViewedStory = 0,
		this.statistics = {
			onlineTime : 1
		}
		Object.keys(ARTIFACTS).map(x => this.research[x] = Research({name : x}))
		this.researching = false

		Object.keys(this.growth).map(x => this.growth[x] = 0)
		Object.keys(this.multi).map(x => this.multi[x] = 1)
		Object.keys(this.resources).map(x => this.resources[x] = 0)
		Object.keys(this.stardust).map(x => this.stardust[x] = 0)
		Object.keys(this.production).map(x => this.production[x] = 0)
		this.autoTimer = GAME_AUTOMATION_PERIOD
		this.harvesting.clear()
		
		this.maps = {}
		let map = this.createMap("main", 0, false)
		this.setMap("main", false)

		Object.assign(masterSlider, baseMasterSlider)
		Object.keys(this.sliderPresets).map(x => delete this.sliderPresets[x])
		
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
		gui.artifacts.updateTitle()
		this.attacked.clear()

		this.getReal()
		this.map.points.map (point => point.getReal())
		this.sliders.map (slider => slider.getReal())
		this.getRealProduction()

		this.advance(1, core.getNextFrame)
		this.update()
		gui.setTheme(settings.theme, this.map.boss?"boss":"main")
//		gui.artifacts.smart = false
		gui.tabs.setTab("map")
		gui.sliders.update(true)
	}
}