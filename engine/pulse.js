'use strict'

const pulseHandler = {
	_init() {
		this.power = this.power || 0
		this.element = this.element || 0
		this.target = this.target || this.targetIndex && game.map && game.map.points[this.targetIndex] || 0
		if (!this.target) 
			this.dead = true
		this.progress = this.progress || 0
		this.speed = this.speed || 1
	},
	
	advance(x) {
		const shift = this.speed * game.world.coreStats.pulseSpeed / this.target.distance 
	},
}