'use strict'

function getSize() {
	if (gui.tabs.activeTab != "map") {
		gui.resized = true
		return
	}
	let width = gui.map.background.offsetWidth
	let height = gui.map.background.offsetHeight
	gui.map.background.width  = gui.map.foreground.width  = width
	gui.map.background.height = gui.map.foreground.height = height
	viewport.setSize(width, height)
	if (game.map)
		game.updateRenderData()
	game.updateBackground = true
}

let viewport = {
	width : 600,
	height : 600,
	halfWidth : 300,
	halfHeight : 300,
	minSize : 600,
	maxSize : 600,
	halfMinSize : 300,
	halfMaxSize : 300,
	
	min : {
		x : -50,
		y : -50,
		zoom : 0.00001
	},
	max : {
		x : 50,
		y : 50,
		zoom : 0.02
	},
	target : {
		x : 0,
		y : 0,
		zoom : 0.00001
	},
	current : {
		x : 0,
		y : 0,
		zoom : 0
	},
	window : {
		left : -300,
		right : 300,
		top : -300,
		bottom : 300
	},
	
	init() {
		this.getLimits(game.map.bounds)
		this.setXY(
			(this.min.x + this.max.x) / 2,
			(this.min.y + this.max.y) / 2)
		this.setZoom(this.max.zoom)
		this.setTargetZoom(this.min.zoom)
	},
	
	set (name, value) {
		this.current[name] = this.target[name] = Math.min(this.max[name], Math.max (this.min[name], value))
		this.updateWindow()
	},
	setXY (x, y) {
		this.set("x", x)
		this.set("y", y)
	},
	setZoom (zoom) {
		this.set("zoom", zoom)
		this.updateLimits()		
	},
	
	setTarget (name, value) {
		this.target[name] = Math.min(this.max[name], Math.max (this.min[name], value))		
	},
	setTargetXY (x, y) {
		this.setTarget("x", x)
		this.setTarget("y", y)
	},
	setTargetZoom (zoom) {
		this.setTarget("zoom", zoom)
		this.updateLimits()
	},
	
	restrict (name, min, max) {
		this.min[name] = min
		this.max[name] = max
		this.setTarget(name, this.target[name])
	},
	
	advance (name, step = 0.3, limit = 0.0001) {
		if (this.current[name] != this.target[name]) {
			if (Math.abs(this.current[name] - this.target[name]) < limit)
				this.current[name] = this.target[name]
			else
				this.current[name] += (this.target[name] - this.current[name]) * step
			game.updateBackground = true
			this.updateWindow()
		}
	},
	advanceView (step = 0.3, limit = 0.5) {
		this.advance ("x", step, limit)
		this.advance ("y", step, limit)
		this.advance ("zoom", step, limit)
	},
	
	setSize(width, height) {
		this.width = width
		this.height = height
		let oldMinSize = this.halfMinSize
		this.minSize = Math.min(this.width, this.height)
		this.halfWidth = this.width / 2
		this.halfHeight = this.height / 2
		this.halfMinSize = this.minSize / 2
		oldMinSize = this.halfMinSize / oldMinSize
		this.restrict("zoom",
			this.min.zoom * oldMinSize,
			this.max.zoom * oldMinSize)
		this.setTargetZoom(this.target.zoom * oldMinSize)
	},
	
	getLimits (bounds) {
		let oldMin = this.min.zoom == this.target.zoom
		this.bounds = bounds
		this.restrict("zoom", 
			Math.min(this.halfMinSize / (50 + MAP_MINIMUM_POINT_SIZE + 1),
				this.halfWidth / (bounds.width / 2 + MAP_MINIMUM_POINT_SIZE + 1),
				this.halfHeight / (bounds.height / 2 + MAP_MINIMUM_POINT_SIZE + 1)),
			this.halfMinSize / 25)
		if (oldMin) 
			this.setTargetZoom(this.min.zoom)
		this.updateLimits()
	},
	
	updateLimits() {
		if (!this.bounds) 
			return
		this.restrict("x",
			Math.min(this.bounds.left + this.bounds.width / 2, this.bounds.left - MAP_MINIMUM_POINT_SIZE - 1 + this.halfWidth / this.target.zoom),
			Math.max(this.bounds.left + this.bounds.width / 2, this.bounds.right + MAP_MINIMUM_POINT_SIZE + 1 - this.halfWidth / this.target.zoom),
		)
		this.restrict("y",
			Math.min(this.bounds.top + this.bounds.height / 2, this.bounds.top - MAP_MINIMUM_POINT_SIZE - 1 + this.halfHeight / this.target.zoom),
			Math.max(this.bounds.top + this.bounds.height / 2, this.bounds.bottom + MAP_MINIMUM_POINT_SIZE + 1 - this.halfHeight / this.target.zoom),
		)
	},
	
	updateWindow() {
		this.window.top = this.current.y - this.halfHeight / this.current.zoom
		this.window.bottom = this.current.y + this.halfHeight / this.current.zoom
		this.window.left = this.current.x - this.halfWidth / this.current.zoom
		this.window.right = this.current.x + this.halfWidth / this.current.zoom
	},

	mouseToMapX(x) {
		return (x - this.halfWidth) / this.current.zoom + this.current.x
	},
	
	mouseToMapY(y) {
		return (y - this.halfHeight) / this.current.zoom + this.current.y
	},
}