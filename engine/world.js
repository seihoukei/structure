"use strict"

const BASE_WORLD = {
	harvestSpeed : 1,
	goldSpeed : 1,
	goldMine : 0,
	imprinter : 0
}

const worldHandler = {
	_init() {
		this.edges = []
		if (!this.points) {
			this.points = []
			this.build({
				name : "goldMine",
				x : 0,
				y : 0,
				free : true
			})
		} else {
			this.points = this.points.map(x => WorldPoint(x))
			this.restoreState()
		}
		this.updateBounds()
	},

	render(c) {
		c.clearRect(0, 0, gui.worldViewport.width, gui.worldViewport.height)
		c.save()
		c.translate(gui.worldViewport.halfWidth, gui.worldViewport.halfHeight)
		c.scale(gui.worldViewport.current.zoom, gui.worldViewport.current.zoom)
		c.translate(-gui.worldViewport.current.x, -gui.worldViewport.current.y)
		
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
			c.beginPath()
			c.strokeStyle = connections.possible?gui.theme.mouseOwned:gui.theme.mouseEnemy
//			c.setLineDash([5,8])
			c.globalAlpha = 0.5
			connections.points.map(point => {
				c.moveTo(target.newX, target.newY)
				c.lineTo(point.x, point.y)
			})
			c.translate(target.newX, target.newY)
			c.moveTo(target.radius,0)
			c.arc(0,0,target.radius,0,6.29)
			c.stroke()
//			if (!connections.possible) {
				c.arc(0, 0, target.radius + 10, 0, 6.29)
				c.globalAlpha = 0.25
				c.fillStyle = connections.possible?gui.theme.mouseOwned:gui.theme.mouseEnemy
				c.fill()
//			}
			c.restore()
		}
		
		[gui.worldMouse.target,...this.points].map(point => {
			if (!point) return
			c.save()
			c.translate(point.newX || point.x, point.newY || point.y)
			c.fillStyle = gui.theme.foreground
			c.fillText(point.newDepth || point.depth, 0, 0)
			c.restore()
		})
		c.restore()
	},
	
	renderBackground(c) {
		
		function renderEdge(edge) {
			c.moveTo(edge.points[0].x, edge.points[0].y)
			c.lineTo(edge.points[1].x, edge.points[1].y)
		}
		
		function renderPoint(point) {
			c.save()
			c.beginPath()
			c.translate(point.x, point.y)
			if (gui.worldMouse.target && point == gui.worldMouse.target) c.globalAlpha = 0.25
			c.moveTo(point.radius, 0)
			c.arc(0, 0, point.radius, 0, 6.29)
			c.stroke()
			c.fillStyle = gui.theme[point.type] || gui.theme.background
			c.fill()
//			c.fillStyle = gui.theme.foreground
//			c.fillText(point.newDepth, 0, 0)
			c.restore()
		}
		c.clearRect(0, 0, gui.worldViewport.width, gui.worldViewport.height)
		c.save()
		c.translate(gui.worldViewport.halfWidth, gui.worldViewport.halfHeight)
		c.scale(gui.worldViewport.current.zoom, gui.worldViewport.current.zoom)
		c.translate(-gui.worldViewport.current.x, -gui.worldViewport.current.y)

		c.strokeStyle = gui.theme.foreground
		c.beginPath()
		this.edges.filter(x => x.points[0] != gui.worldMouse.target && x.points[1] != gui.worldMouse.target).map(renderEdge)
		c.stroke()
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
			point.index = index
			point.world = this
		})
		this.updateConnections()
	},
		
	build(data) {
		if (!data.free) {
			//check cost
		}
		
		const point = WorldPoint({
			x : data.x,
			y : data.y,
			type : data.name,
			world : this
		})
		
		const canBuild = this.points.reduce((v,pt) => {
//			console.log(v, Math.hypot(point.x - pt.x, point.y - pt.y) , point.radius + pt.radius + 10)
			return v && Math.hypot(point.x - pt.x, point.y - pt.y) > point.radius + pt.radius + 10
		}, true)
		
		if (!canBuild) return false
		
		if (!data.free) {
			//pay cost
		}
		
		this.points.push(point)		
		this.updateBounds()
		this.updateConnections()
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
				if (length < point1.radius + point1.reach + point2.reach + point2.radius) {
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
		const connectedPoints = this.points.filter(pt => pt != point && Math.hypot(point.newX - pt.x, point.newY - pt.y) < point.radius + point.reach + pt.reach + pt.radius)
		const intersectPoints = this.points.filter(pt => pt != point && Math.hypot(point.newX - pt.x, point.newY - pt.y) < point.radius + 10 + pt.radius)
		this.points.map(pt => pt.newDepth = 100)
		point.newDepth = 100
		this.points[0].newDepth = 0
		while ([point,...this.points].reduce((v,pt) => (pt.newDepth != (pt.newDepth = Math.min((connectedPoints.includes(pt)?point.newDepth+1:100),pt.newDepth,...(pt==point?connectedPoints:pt.connections).filter(y => y != point).map(x => (x.newDepth + 1))))) || v, false));
		const maxDepth = Math.max(...this.points.map(pt => pt.newDepth))
		return {
			points : connectedPoints,
			possible : connectedPoints.length && !intersectPoints.length && maxDepth < 100
		}
	},
	
	update() {
		this.harvestSpeed = 1 + this.imprinter * 0.4
		this.goldSpeed = 1 + this.goldMine * 0.2
		this.updateBounds()
		gui.worldViewport.getLimits(this.bounds)
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
		return o
	},
}

const World = Template(worldHandler)