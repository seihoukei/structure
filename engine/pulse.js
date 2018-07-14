'use strict'

const pulseHandler = {
	_init() {
		this.power = this.power || 0
		this.element = this.element?[1,1,1,3,4,5,6][this.element]:1
		this.target = this.target || this.targetIndex && game.map && game.map.points[this.targetIndex] || 0
		if (!this.target) 
			this.dead = true
		this.progress = this.progress || 0
		this.speed = this.speed || 1

		this.sparks = new Set()
	},
	
	render(c) {
		if (this.sparks.size) {
			c.save()
			c.beginPath()
			c.strokeStyle = gui.theme.typeColors[this.element]
			
			for (let spark of this.sparks) {
				spark.render(c)
				spark.advance()
				if (spark.dead) {
					this.sparks.delete(spark)
					animations.freeSpark(spark)
				}
			}
			
			if (gui.mainViewport.current.zoom < 1.5) {
				c.lineWidth = 1.5 / gui.mainViewport.current.zoom
			}
			
			c.stroke()
			c.restore()
		}
		
		if (!this.target || !this.target.onscreen && (!this.target.parent || !this.target.parent.onscreen)) return

		const an = this.target.parent?this.target.direction - 1 + (Math.random() + Math.random()) + (Math.random() > 0.5?1.5:-1.5):Math.random()*6.29
		const length = this.target.index?(Math.random() * Math.min(10, Math.abs(this.power / this.target.power)) + 2) * (Math.random() + 0.6):this.target.size * (0.5 + 0.5 * Math.random())
		const {x,y} = this.target.coordinatesOn(this.progress / this.target.distance, true)

		this.sparks.add(animations.Spark(x, y, length, an))
	},
	
	advance(x) {
		const shift = this.speed * game.world.coreStats.pulseSpeed
		this.progress += shift
		while (this.power && this.target && this.progress > this.target.distance) {
			if (this.target.owned) {
				const outs = [...this.target.children].filter(y => !y.locked && (!y.boss || y.boss <= this.map.boss))
				if (!outs.length) {
					this.destroy(this.power + 1)
					return
				}
				this.progress -= this.target.distance
				this.power += this.target.power
				this.element = [1,1,1,3,4,5,6][this.target.type]
				this.target = outs[Math.random() * outs.length | 0]
			} else {
				const damage = Math.max(0, game.alignDamage(this.power, this.element, this.target.type, 1))
				this.power = this.target.dealDamage(damage)
				if (!this.power) {
					this.destroy(damage + 1)
					return
				}
			}
		}
	},
	
	destroy(damage) {
		if (game.activeRender && damage) {
			const {x,y} = this.target.coordinatesOn(1, true)
			const length = (Math.random() * Math.min(10, Math.abs(damage / this.target.power)) + 2) * (Math.random() + 0.6)
			const fireworks = animations.Fireworks(x, y, gui.theme.typeColors[this.element], 20, length)
			if (fireworks)
				for (let spark of this.sparks) {
					fireworks.sparks.add(spark)
					this.sparks.delete(spark)
				}
		}
		for (let spark of this.sparks) {
			spark.dead = true
			this.sparks.delete(spark)
			animations.freeSpark(spark)
		}
		const index = game.pulses.indexOf(this)
		if (index > -1)
			game.pulses.splice(index, 1)
		
	},
	
	toJSON() {
		return {
			targetIndex : this.target.index,
			power: this.power,
			element: this.element,
			progress : this.progress,
			speed : this.speed,
		}
	},
}

const Pulse = Template(pulseHandler)