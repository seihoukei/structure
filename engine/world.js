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
	},
	
	predictConnections(point) {
		return this.points.filter(pt => Math.hypot(point.x - pt.x, point.y - pt.y) < point.radius + point.reach + pt.reach + pt.radius)
	},
	
	update() {
		this.harvestSpeed = 1 + this.imprinter * 0.4
		this.goldSpeed = 1 + this.goldMine * 0.2
		gui.worldViewport.getLimits(this.bounds)
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
		return o
	},
}

const World = Template(worldHandler)