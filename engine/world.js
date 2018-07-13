"use strict"

const BASE_WORLD = {
}

const worldHandler = {
	_init() {
		this.edges = []
		this.active = {}
		this.stored = this.stored || {}
		this.owned = this.owned || {}
		this.coreStats = Object.assign({},BASE_WORLD_CORE_STATS)
		this.stats = Object.assign({},BASE_WORLD_STATS)
		this.projectedStats = Object.assign({},BASE_WORLD_STATS)
		this.activePoints = new Set()
		if (this.title === undefined) {
			const pos = game.worlds?Object.values(game.worlds).filter(x => x.title !== undefined).length + 1:0
			this.title = "World " + pos
		}
		this.core = this.core || {}
		if (!this.core["0,0"])
			this.core["0,0"] = 1
		Object.keys(this.core).map(x => {
			if (!WORLD_CORE_CELLS[x])
				delete this.core[x]
		})
		this.presets = this.presets || {}
		if (!this.points || this.points.filter(x => x.type == "entryPoint").length != 1) {
			this.points = []
			this.build({
				type : "entryPoint",
				x : 0,
				y : 0,
				free : true
			})
		} else {
			this.points = this.points.map(x => WorldPoint(x))
			if (!this.version) {
				this.points.map(point => {
					const cost = WORLD_ELEMENTS[point.type].legacyCost || WORLD_ELEMENTS[point.type].cost
					if (cost) 
						Object.keys(cost).map(x => game.resources[x] += cost[x])
				})
				this.version = 2
			}
			this.restoreState()
		}
		this.version = 2
		this.updateCore()
		this.update()
		this.updateCoreCost()
		this.updateCost()
	},

	render(c) {
		c.clearRect(0, 0, gui.worldViewport.width, gui.worldViewport.height)
		c.save()
		c.translate(gui.worldViewport.halfWidth, gui.worldViewport.halfHeight)
		c.scale(gui.worldViewport.current.zoom, gui.worldViewport.current.zoom)
		c.translate(-gui.worldViewport.current.x, -gui.worldViewport.current.y)
		c.textAlign = "center"
		c.textBaseline = "middle"
		
		if (gui.worldMouse.closest && gui.worldMouse.state == MOUSE_STATE_FREE) {
			const closest = gui.worldMouse.closest
			c.save()
			c.strokeStyle = gui.theme.mouseOwned
			c.translate(closest.x, closest.y)
			const r = closest.radius + Math.sin(game.frame / 20)/2 + 1
			c.beginPath()
			c.moveTo(r,0)
			c.arc(0,0,r,0,6.29)
			c.stroke()
			c.restore()
		}
		
		if (gui.worldMouse.target) {
			const target = gui.worldMouse.target
			const connections = target.newConnections
			c.save()
			c.globalAlpha = 0.5

			if (!connections.possible) {
				c.beginPath()
				c.strokeStyle = gui.theme.mouseEnemy
				connections.points.filter(x => x.family == target.family).map(point => {
					c.moveTo(target.newX, target.newY)
					c.lineTo(point.x, point.y)
				})
				c.stroke()
			}
			c.beginPath()
			c.strokeStyle = gui.theme.mouseOwned
			connections.points.filter(x => x.family != target.family).map(point => {
				c.moveTo(target.newX, target.newY)
				c.lineTo(point.x, point.y)
			})
			c.stroke()
			c.beginPath()
			c.strokeStyle = connections.possible?gui.theme.mouseOwned:gui.theme.mouseEnemy
			c.translate(target.newX, target.newY)
			if (settings.renderReach) {
				c.save()
				c.lineWidth = 1/gui.worldViewport.current.zoom
				c.moveTo(target.reach,0)
				c.arc(0,0,target.reach,0,6.29)			
				c.stroke()
				c.restore()
			}
			c.beginPath()
			c.moveTo(target.radius,0)
			c.arc(0,0,target.radius,0,6.29)
			c.stroke()
			if (settings.renderDeadZone || !connections.possible) {
				c.arc(0, 0, target.deadZone, 0, 6.29)
				c.globalAlpha = 0.25
				c.fillStyle = connections.possible?gui.theme.mouseOwned:gui.theme.mouseEnemy
				c.fill()
			}
			c.restore()
		}
		
/*		[gui.worldMouse.target,...this.points].map(point => {
			if (!point) return
			c.save()
			c.translate(point.newX || point.x, point.newY || point.y)
			c.fillStyle = gui.theme.foreground
			c.fillText(point.newDepth || point.depth, 0, 0)
			c.restore()
		})*/
		c.restore()
	},
	
	renderBackground(c) {
		
		function renderEdge(edge) {
			c.moveTo(edge.points[0].x, edge.points[0].y)
			c.lineTo(edge.points[1].x, edge.points[1].y)
		}
		
		function renderDeadZone(point) {
			c.save()
			c.translate(point.x, point.y)
			c.moveTo(point.deadZone, 0)
			c.arc(0, 0, point.deadZone, 0, 6.29)
			c.restore()
		}

		function renderReach(point) {
			c.save()
			c.translate(point.x, point.y)
			c.moveTo(point.reach, 0)
			c.arc(0, 0, point.reach, 0, 6.29)
			c.restore()
		}

		function renderPoint(point) {
			c.save()
			c.translate(point.x, point.y)
			if (!point.active) {
				c.beginPath()
				c.fillStyle = gui.theme.background
				c.moveTo(point.radius, 0)
				c.arc(0, 0, point.radius, 0, 6.29)
				c.fill()
				c.globalAlpha = 0.5
			}
			if (point.projected) {
				c.setLineDash([2,2])
			}
			c.beginPath()
			if (gui.worldMouse.target && point == gui.worldMouse.target) c.globalAlpha = 0.25
			c.moveTo(point.radius, 0)
			c.arc(0, 0, point.radius, 0, 6.29)
			c.stroke()
			c.fillStyle = gui.theme.world[point.family] || gui.theme.background
			c.fill()
			if (WORLD_ELEMENTS[point.type].iconText) {
				c.font = point.radius + "px" + fontName
				c.fillStyle = gui.theme.foreground
				c.fillText(WORLD_ELEMENTS[point.type].iconText, 0, 0)
			}
//			c.fillStyle = gui.theme.foreground
//			c.fillText(point.newDepth, 0, 0)
			c.restore()
		}
		c.clearRect(0, 0, gui.worldViewport.width, gui.worldViewport.height)
		c.save()
		c.translate(gui.worldViewport.halfWidth, gui.worldViewport.halfHeight)
		c.scale(gui.worldViewport.current.zoom, gui.worldViewport.current.zoom)
		c.translate(-gui.worldViewport.current.x, -gui.worldViewport.current.y)
		c.textAlign = "center"
		c.textBaseline = "middle"
		
		c.save()
		if (settings.renderDeadZone) {
			c.fillStyle = gui.theme.shades[13]
			c.beginPath()
			this.points.map(renderDeadZone)
			c.fill()
		}
		if (settings.renderReach) {
			c.lineWidth = 1/gui.worldViewport.current.zoom
			c.strokeStyle = gui.theme.shades[13]
			c.beginPath()
			this.points.filter(x => x.reach > x.deadZone).map(renderReach)
			c.stroke()
			c.strokeStyle = settings.renderDeadZone?gui.theme.background:gui.theme.shades[13]
			c.beginPath()
			this.points.filter(x => x.reach < x.deadZone).map(renderReach)
			c.stroke()
		}
		c.restore()

		const renderEdges = this.edges.filter(x => x.points[0] != gui.worldMouse.target && x.points[1] != gui.worldMouse.target)
		c.strokeStyle = gui.theme.foreground
		c.beginPath()
		renderEdges.filter(x => x.points[0].active && x.points[1].active && !x.points[0].projected && !x.points[1].projected).map(renderEdge)
		c.stroke()
		c.save()
		c.beginPath()
		c.setLineDash([2,2])
		renderEdges.filter(x => x.points[0].projected || x.points[1].projected).map(renderEdge)
		c.stroke()
		c.restore()
		c.save()
		c.beginPath()
		c.globalAlpha = 0.5
		renderEdges.filter(x => !x.points[0].active || !x.points[1].active).map(renderEdge)
		c.stroke()
		c.restore()
		if (gui.worldMouse.target) {
			c.save()
			c.beginPath()
			c.globalAlpha = 0.25
			this.edges.filter(x => x.points[0] == gui.worldMouse.target || x.points[1] == gui.worldMouse.target).map(renderEdge)
			c.stroke()
			c.restore()
		}
		this.points.map(renderPoint)
		
		c.restore()
	},
	
	restoreState() {
		this.points.map((point,index) => {
			point.world = this
		})
		this.updateCost()
		this.updateConnections()
	},
	
	getResource(name, projected = false, extraCost = 0) {
		return Math.floor(game.resources[name] * (1 - this.coreCost[name]) * (1 - extraCost)) - (projected?this.projectedCost[name]:this.cost[name]) || 0
	},
		
	getMaxResource(name, extraCost = 0) {
		return Math.floor(game.resources[name] * (1 - this.coreCost[name]) * (1 - extraCost))
	},
		
	canAfford(name) {
		const building = WORLD_ELEMENTS[name]
		if (!building) return false
		if (this.stored[name]) return true
		if (building.cost) {
			if (Object.keys(building.cost).reduce((v,x) => v || (this.getResource(x) < building.cost[x]), false)) return false
		}
		return true
	},
	
	build(data) {
		if (!data || !data.type || !WORLD_ELEMENTS[data.type]) 
			return
		
		if (!data.free && !data.projected) {
			if (!this.canAfford(data.type)) return
		}
		
		const point = WorldPoint({
			x : data.x,
			y : data.y,
			type : data.type,
			world : this
		})
		if (data.projected)
			point.projected = true
		
		const canBuild = this.points.reduce((v,pt) => {
//			console.log(v, Math.hypot(point.x - pt.x, point.y - pt.y) , point.radius + pt.radius + 10)
			return v && Math.hypot(point.x - pt.x, point.y - pt.y) > Math.max(point.deadZone + pt.radius, pt.deadZone + point.radius)
		}, true)
		
		if (!canBuild) return false
		
/*		if (!data.free) {
			this.pay(data.type)
		}*/
		
		point.x = point.x.toDigits(3)
		point.y = point.y.toDigits(3)
		if (this.stored[data.type] && point.projected) {
			delete point.projected
			this.stored[data.type]--
			if (!this.stored[data.type])
				delete this.stored[data.type]
		}
		this.points.push(point)		
		this.updateConnections()
		this.updateCost()
		this.update()
		game.updateWorldBackground = true
	},
	
	finalize(point, update = true) {
		if (!point.projected) return
		if (!this.canAfford(point.type)) return
		delete point.projected
		if (this.stored[point.type]) {
			this.stored[point.type]--
			if (!this.stored[point.type])
				delete this.stored[point.type]
		}		
		this.updateCost()
		if (update) {
			this.updateConnections()
			this.update()
		}
	},
	
	free(point) {
		if (point.type == "entryPoint") return
		const index = this.points.indexOf(point)
		if (index < 0) return
		this.points.splice(index, 1)
		if (gui.worldMouse.closest == point)
			delete gui.worldMouse.closest
		this.updateConnections()
		this.updateCost()
		this.update()
		game.updateWorldBackground = true
	},
	
	store(point) {
		if (point.type == "entryPoint") return
		this.stored[point.type] = (this.stored[point.type] || 0) + 1
		this.free(point)		
	},
	
	updateConnections() {
		this.edges.length = 0
		const pointsLength = this.points.length
		this.points.map(pt => pt.connections.length = 0)
		for (let i = 0; i < pointsLength; i++) {
			const point1 = this.points[i]
			for (let j = i+1; j < pointsLength; j++) {
				const point2 = this.points[j]
				const length = Math.hypot(point1.x - point2.x, point1.y - point2.y)
				if (length < point1.reach + point2.reach && length > Math.abs(point1.reach - point2.reach)) {
					point1.connect(point2)
					this.edges.push({
						points : [point1, point2],
						length
					})
				}
			}
		}
		this.points.map(pt => pt.depth = 100)
		this.points[0].depth = 0
		while (this.points.filter(x => !x.projected).reduce((v,pt) => (pt.depth != (pt.depth = Math.min(pt.depth,...pt.connections.map(x => (x.depth + (WORLD_ELEMENTS[pt.type].nodepth?0:1)))))) || v, false));
		this.points.map(pt => pt.projectedDepth = 100)
		this.points[0].projectedDepth = 0
		while (this.points.reduce((v,pt) => (pt.projectedDepth != (pt.projectedDepth = Math.min(pt.projectedDepth,...pt.connections.map(x => (x.projectedDepth + (WORLD_ELEMENTS[pt.type].nodepth?0:1)))))) || v, false));
	},
	
	predictConnections(point) {
		const connectedPoints = this.points.filter(pt => pt != point && Math.hypot(point.newX - pt.x, point.newY - pt.y) < point.reach + pt.reach && Math.hypot(point.newX - pt.x, point.newY - pt.y) > Math.abs(point.reach - pt.reach))
		const intersectPoints = this.points.filter(pt => pt != point && Math.hypot(point.newX - pt.x, point.newY - pt.y) < Math.max(pt.deadZone + point.radius, point.deadZone + pt.radius))
		this.points.map(pt => pt.newDepth = 100)
		point.newDepth = 100
		this.points[0].newDepth = 0
		while ([point,...this.points].reduce((v,pt) => (pt.newDepth != (pt.newDepth = Math.min((connectedPoints.includes(pt)?point.newDepth+1:100),pt.newDepth,...(pt==point?connectedPoints:pt.connections).filter(y => y != point).map(x => (x.newDepth + 1))))) || v, false));
//		const maxDepth = Math.max(...this.points.map(pt => pt.newDepth))
		return {
			points : connectedPoints,
			possible : (settings.allowDetached || connectedPoints.length) && !intersectPoints.length/* && maxDepth < 100*/ && !connectedPoints.filter(x => x.family == point.family).length
		}
	},
	
	canAffordCore(name) {
		const cell = WORLD_CORE_CELLS[name]
		if (!cell) return false
		if (cell.feat && !game.feats[cell.feat]) return false
		const cost = cell.cost
		if (cost) {
			if (!Object.keys(cost).every(x => this.getResource(x, 0, cost[x]) >= 0)) return false
		}
		const enablers = cell.enablers
		if (enablers) {
			if (!Object.keys(enablers).every(x => this.owned[x] + (this.stored[x] || 0) >= enablers[x])) return false
		}
		return true
	},
	
	clearCore() {
		Object.keys(this.core).map(x => delete this.core[x])
		this.core["0,0"] = 1
		this.updateCore()
		this.update()
		gui.world.coreScreen.update(true)
	},
	
	getCore(name) {
		if (!this.canAffordCore(name)) return false
		if (this.core[name]) 
			delete this.core[name]
		else
			this.core[name] = 1
		this.updateCore()
		this.update()
	},
	
	updateCore() {
		this.coreResetCost = 50 * 2 ** (Object.entries(game.worlds).length - 2)
		Object.keys(this.coreStats).map(x => this.coreStats[x] = BASE_WORLD_CORE_STATS[x])
		Object.keys(this.core).map(x => {
			if (!this.core[x]) return
			if (!WORLD_CORE_CELLS[x]) return
			if (!WORLD_CORE_CELLS[x].stat) return
			if (WORLD_CORE_CELLS[x].effect == WORLD_BONUS_ADD)
				this.coreStats[WORLD_CORE_CELLS[x].stat] += WORLD_CORE_CELLS[x].value
			if (WORLD_CORE_CELLS[x].effect == WORLD_BONUS_MUL)
				this.coreStats[WORLD_CORE_CELLS[x].stat] *= WORLD_CORE_CELLS[x].value
		})
		this.updateCoreCost()
	},
	
	updateCost() {
		if (!this.cost)
			this.cost = {}
		if (!this.projectedCost)
			this.projectedCost = {}
		for (let i = 1; i <= 6; i++) 
			this.cost["_"+i] = this.projectedCost["_"+i] = 0
//		this.workers = game.sliders.filter(x => x.target && x.target.index == 0)	
		this.activePoints.clear()
		this.points.map(point => {
			const cost = WORLD_ELEMENTS[point.type].cost
			if (cost) {
				if (!point.projected)
					Object.keys(cost).map(x => this.cost[x] += cost[x])			
				Object.keys(cost).map(x => this.projectedCost[x] += cost[x])			
			}
		})
		Object.keys(this.stored).map(type => {
			if (!this.stored[type]) return
			const cost = WORLD_ELEMENTS[type].cost
			if (cost) {
				Object.keys(cost).map(x => {
					this.projectedCost[x] += cost[x] * this.stored[type]
					this.cost[x] += cost[x] * this.stored[type]
				})
			}
		})
	},
	
	updateCoreCost() {
		if (!this.coreCost)
			this.coreCost = {}
		for (let i = 1; i <= 6; i++) 
			this.coreCost["_"+i] = 0
		this.coreResetCost = 50 * 2 ** (Object.entries(game.worlds).length - 1)
		
		Object.keys(this.core).map(x => {
			if (!this.core[x]) return
//			this.coreResetCost += 1e4
			if (!WORLD_CORE_CELLS[x]) return
			const cost = WORLD_CORE_CELLS[x].cost
			if (!cost) return
			Object.keys(cost).map(x => this.coreCost[x] = 1 - (1-this.coreCost[x]) * (1-cost[x]))
		})
		if (Object.keys(this.core).length == 1)
			this.coreResetCost = 0
//		this.coreResetCost -= 1e4 //0,0
/*		this.coreCost._1 = 0.6
		this.coreCost._2 = 0.5
		this.coreCost._3 = 0.4
		this.coreCost._4 = 0.3
		this.coreCost._5 = 0.2
		this.coreCost._6 = 0.1*/
	},
	
	update() {
		this.workers = game.sliders.filter(x => x.target && x.target.index == 0).length
		if (ARTIFACTS.doublePickaxe.equipped && ARTIFACTS.doublePickaxe.equipped.target && !ARTIFACTS.doublePickaxe.equipped.target.index) this.workers++
		if (ARTIFACTS.alwaysPickaxe.equipped && (!ARTIFACTS.alwaysPickaxe.equipped.target || ARTIFACTS.alwaysPickaxe.equipped.target.index)) this.workers++
		this.activePoints.clear()
		this.points.map(x => (x.active = x.depth <= this.workers) && !x.projected?this.activePoints.add(x):0)
		this.points.map(x => (x.projectedActive = x.projectedDepth <= this.workers))
		Object.keys(WORLD_ELEMENTS).map(x => this.owned[x] = this.active[x] = 0)
		;[...this.activePoints].map(x => this.active[x.type]++)
		this.points.map(x => !x.projected?this.owned[x.type]++:0)
		
		Object.assign(this.stats, BASE_WORLD_STATS)
		Object.assign(this.projectedStats, BASE_WORLD_STATS)

		this.points.filter(x => (x.active || x.projectedActive) && WORLD_ELEMENTS[x.type].stat).sort((x,y) => WORLD_ELEMENTS[x.type].effect - WORLD_ELEMENTS[y.type].effect).map(x => {
			const element = WORLD_ELEMENTS[x.type]
			const minus = (this.coreStats.finalLayer && x.depth == this.workers && x.depth > 1)?1:0
			if (!element.stat || !this.stats[element.stat]) return
			if (element.effect == WORLD_BONUS_MUL) {
				this.projectedStats[element.stat] *= element.value(x.projectedDepth - minus)
				if (!x.projected && x.active)
					this.stats[element.stat] *= element.value(x.depth - minus)
			}
			if (element.effect == WORLD_BONUS_ADD || element.effect == WORLD_BONUS_ADD_MULT) {
				this.projectedStats[element.stat] += element.value(x.projectedDepth - minus)
				if (!x.projected && x.active)
					this.stats[element.stat] += element.value(x.depth - minus)
			}
		})
		
		this.updateBounds()
		gui.worldViewport.getLimits(this.bounds)
		game.updateWorldBackground = true
	},
	
	updateBounds() {
		if (!this.bounds)
			this.bounds = {}
		this.bounds.left = Math.min(...this.points.map(pt => pt.x - pt.radius)) - 100
		this.bounds.right = Math.max(...this.points.map(pt => pt.x + pt.radius)) + 100
		this.bounds.top = Math.min(...this.points.map(pt => pt.y - pt.radius)) - 100
		this.bounds.bottom = Math.max(...this.points.map(pt => pt.y + pt.radius)) + 100
		this.bounds.width = this.bounds.right - this.bounds.left
		this.bounds.height = this.bounds.bottom - this.bounds.top
	},

	toJSON() {
		let o = Object.assign({}, this)
		delete o.edges
		delete o.workers
		delete o.active
		delete o.projectedActive
		delete o.owned
		delete o.stats
		delete o.projectedStats
		delete o.activePoints
		delete o.cost
		delete o.projectedCost
		return o
	},
	
	cancelProject() {
		this.points.filter(x => x.projected).map(x => this.free(x))
	},
	
	finalizeProject() {
		this.points.filter(x => x.projected).sort((x,y) => x.depth - y.depth).map(x => this.finalize(x, false))
		this.updateConnections()
		this.update()		
	},
	
	sellAll() {
		this.points.slice(1).map(x => this.free(x))
	},
	
	savePreset(name) {
		const data = JSON.stringify(this.points)
		this.presets[name] = LZString.compressToBase64(data)
	},
	
	loadPreset(name) {
		const data = JSON.parse(LZString.decompressFromBase64(this.presets[name]))
		const resources = this.points.slice(1).reduce((v,x) => (WORLD_ELEMENTS[x.type].cost?Object.entries(WORLD_ELEMENTS[x.type].cost).map(x => v[x[0]] = (v[x[0]] || 0) + x[1]):0,v),Object.keys(game.resources).filter(x => x[0] == "_").reduce((v,x) => (v[x] = game.resources[x],v),{}))
		const cost = data.reduce((v,x) => (WORLD_ELEMENTS[x.type].cost?Object.entries(WORLD_ELEMENTS[x.type].cost).map(x => v[x[0]] = (v[x[0]] || 0) + x[1]):0,v),{})
		const missing = Object.entries(cost).filter(x => x[1] && !resources[x[0]] || resources[x[0]] < x[1])
		if (missing.length && !confirm("You don't have enough memories for this preset:\n"+missing.map(x => POINT_TYPES[x[0].slice(1)].capitalizeFirst() +": "+(x[1] - (resources[x[0]] || 0))).join("\n")+"\nDo you still want to load it?")) return
		
		this.sellAll()
		data.map(x => {
			if (x.type == "entryPoint") {
				this.points[0].x = x.x
				this.points[0].y = x.y
			} else
				this.build(x)
		})
	},
}

const World = Template(worldHandler)