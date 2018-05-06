"use strict"

const BASE_WORLD = {
}

const BASE_WORLD_STATS = {
	goldSpeed : 1,
	harvestSpeed : 1,
	scienceSpeed : 1,
	bloodBoost : 1,
	fireBoost : 1,
	iceBoost : 1,
	metalBoost : 1,
	manaSpeed : 1,
	maxSummons : 10,
	meanBoost : 1	
}

const worldHandler = {
	_init() {
		this.edges = []
		this.active = {}
		this.stats = Object.assign({},BASE_WORLD_STATS)
		this.activePoints = new Set()
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
			this.restoreState()
		}
		this.update()
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
			this.points.map(renderReach)
			c.stroke()
		}
		c.restore()

		const renderEdges = this.edges.filter(x => x.points[0] != gui.worldMouse.target && x.points[1] != gui.worldMouse.target)
		c.strokeStyle = gui.theme.foreground
		c.beginPath()
		renderEdges.filter(x => x.points[0].active && x.points[1].active).map(renderEdge)
		c.stroke()
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
		this.updateConnections()
	},
		
	canAfford(name) {
		const building = WORLD_ELEMENTS[name]
		if (!building) return false
		if (building.cost) {
			if (Object.keys(building.cost).reduce((v,x) => v || (game.resources[x] < building.cost[x]), false)) return false
		}
		return true
	},
	
	pay(name) {
		const building = WORLD_ELEMENTS[name]
		if (!building) return false
		if (building.cost) {
			Object.keys(building.cost).map(x => {
				game.resources[x] -= building.cost[x]
			})
		}
		return true
	},
	
	build(data) {
		if (!data || !data.type || !WORLD_ELEMENTS[data.type]) 
			return
		
		if (!data.free) {
			if (!this.canAfford(data.type)) return
		}
		
		const point = WorldPoint({
			x : data.x,
			y : data.y,
			type : data.type,
			world : this
		})
		
		const canBuild = this.points.reduce((v,pt) => {
//			console.log(v, Math.hypot(point.x - pt.x, point.y - pt.y) , point.radius + pt.radius + 10)
			return v && Math.hypot(point.x - pt.x, point.y - pt.y) > Math.max(point.deadZone + pt.radius, pt.deadZone + point.radius)
		}, true)
		
		if (!canBuild) return false
		
		if (!data.free) {
			this.pay(data.type)
		}
		
		point.x = point.x.toDigits(3)
		point.y = point.y.toDigits(3)
		this.points.push(point)		
		this.updateConnections()
		this.update()
		game.updateWorldBackground = true
	},
	
	free(point) {
		if (point.type == "entryPoint") return
		const index = this.points.indexOf(point)
		if (index < 0) return
		this.points.splice(index, 1)
		const cost = WORLD_ELEMENTS[point.type].cost
		if (cost) 
			Object.keys(cost).map(x => game.resources[x] += cost[x])
		if (gui.worldMouse.closest == point)
			delete gui.worldMouse.closest
		this.updateConnections()
		this.update()
		game.updateWorldBackground = true
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
				if (length < point1.reach + point2.reach) {
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
		while (this.points.reduce((v,pt) => (pt.depth != (pt.depth = Math.min(pt.depth,...pt.connections.map(x => (x.depth + 1))))) || v, false));
	},
	
	predictConnections(point) {
		const connectedPoints = this.points.filter(pt => pt != point && Math.hypot(point.newX - pt.x, point.newY - pt.y) < point.reach + pt.reach)
		const intersectPoints = this.points.filter(pt => pt != point && Math.hypot(point.newX - pt.x, point.newY - pt.y) < Math.max(pt.deadZone + point.radius, point.deadZone + pt.radius))
		this.points.map(pt => pt.newDepth = 100)
		point.newDepth = 100
		this.points[0].newDepth = 0
		while ([point,...this.points].reduce((v,pt) => (pt.newDepth != (pt.newDepth = Math.min((connectedPoints.includes(pt)?point.newDepth+1:100),pt.newDepth,...(pt==point?connectedPoints:pt.connections).filter(y => y != point).map(x => (x.newDepth + 1))))) || v, false));
//		const maxDepth = Math.max(...this.points.map(pt => pt.newDepth))
		return {
			points : connectedPoints,
			possible : connectedPoints.length && !intersectPoints.length/* && maxDepth < 100*/ && !connectedPoints.filter(x => x.family == point.family).length
		}
	},
	
	update() {
		this.workers = game.sliders.filter(x => x.target && x.target.index == 0)	
		this.activePoints.clear()
		this.points.map(x => (x.active = x.depth <= this.workers.length)?this.activePoints.add(x):0)
		Object.keys(WORLD_ELEMENTS).map(x => this.active[x] = 0)
		;[...this.activePoints].map(x => this.active[x.type]++)
/*		this.harvestSpeed = 2 ** this.active.imprinter
		this.goldSpeed = 2 ** this.active.goldMine
		this.scienceSpeed = 1 + this.active.library
		this.manaSpeed = 1.5 ** this.active.manaPool
		this.maxSummons = 10 + this.active.stabilizer
		this.meanBoost = 1 + this.active.charger//2 ** this.active.charger*/
		
		Object.assign(this.stats, BASE_WORLD_STATS)

		this.points.filter(x => WORLD_ELEMENTS[x.type].stat).sort((x,y) => WORLD_ELEMENTS[x.type].effect - WORLD_ELEMENTS[y.type].effect).map(x => {
			const element = WORLD_ELEMENTS[x.type]
			if (!element.stat || !this.stats[element.stat]) return
			if (element.effect == WORLD_BONUS_MUL)
				this.stats[element.stat] *= element.value(x)
			if (element.effect == WORLD_BONUS_ADD)
				this.stats[element.stat] += element.value(x)
		})
		
		this.updateBounds()
		gui.worldViewport.getLimits(this.bounds)
		game.updateWorldBackground = true
	},
	
	updateBounds() {
		if (!this.bounds)
			this.bounds = {}
		this.bounds.left = Math.min(...this.points.map(pt => pt.x - pt.radius)) - 50
		this.bounds.right = Math.max(...this.points.map(pt => pt.x + pt.radius)) + 50
		this.bounds.top = Math.min(...this.points.map(pt => pt.y - pt.radius)) - 50
		this.bounds.bottom = Math.max(...this.points.map(pt => pt.y + pt.radius)) + 50
		this.bounds.width = this.bounds.right - this.bounds.left
		this.bounds.height = this.bounds.bottom - this.bounds.top
	},

	toJSON() {
		let o = Object.assign({}, this)
		delete o.edges
		delete o.workers
		delete o.active
		delete o.stats
		delete o.activePoints
		return o
	},
	
	sellAll() {
		this.points.slice(1).map(x => this.free(x))
	},
	
	savePreset(name) {
		const data = JSON.stringify(this.points.slice(1))
		this.presets[name] = LZString.compressToBase64(data)
	},
	
	loadPreset(name) {
		const data = JSON.parse(LZString.decompressFromBase64(this.presets[name]))
		const resources = this.points.slice(1).reduce((v,x) => (WORLD_ELEMENTS[x.type].cost?Object.entries(WORLD_ELEMENTS[x.type].cost).map(x => v[x[0]] = (v[x[0]] || 0) + x[1]):0,v),Object.keys(game.resources).filter(x => x[0] == "_").reduce((v,x) => (v[x] = game.resources[x],v),{}))
		const cost = data.reduce((v,x) => (WORLD_ELEMENTS[x.type].cost?Object.entries(WORLD_ELEMENTS[x.type].cost).map(x => v[x[0]] = (v[x[0]] || 0) + x[1]):0,v),{})
		const missing = Object.entries(cost).filter(x => x[1] && !resources[x[0]] || resources[x[0]] < x[1])
		if (missing.length && !confirm("You don't have enough memories for this preset:\n"+missing.map(x => POINT_TYPES[x[0].slice(1)].capitalizeFirst() +": "+(x[1] - (resources[x[0]] || 0))).join("\n")+"\nDo you still want to load it?")) return
		
		this.sellAll()
		data.map(x => this.build(x))
	},
}

const World = Template(worldHandler)