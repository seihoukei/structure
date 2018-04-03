'use strict'

const sparkHandler = {
	spawn(x, y, length, an) {
		this.x = x
		this.y = y
		this.l = length
		this.dx = length * Math.cos(an)
		this.dy = length * Math.sin(an)
		this.dead = false
	},
	
	advance() {
		this.dx *= 0.95
		this.dy *= 0.95
		this.l *= 0.8
		this.x += this.dx * 0.4
		this.y += this.dy * 0.4
		if (this.l < 0.01) this.dead = true
	},
	
	render(c) {
		if (this.dead) return
		c.moveTo(this.x, this.y)
		c.lineTo(this.x + this.dx, this.y + this.dy)
	},
}

const Spark = Template(sparkHandler)

const fireworksHandler = {
	_init() {
		this.sparks = new Set()
		for (let i = 0; i < this.count; i++) {
			const an = Math.random() * 6.29
			const length = (1 - Math.random() ** 2) * this.power
			this.sparks.add(animations.Spark(this.x, this.y, length, an))
		}
		this.dead = false
	},
	
	render(c) {
		if (this.dead) return
		c.save()
		c.strokeStyle = this.color
		c.beginPath()
		for (let spark of this.sparks) {
			spark.render(c)
			spark.advance()
			if (spark.dead) {
				this.sparks.delete(spark)
				animations.freeSpark(spark)
			}
		}
		c.stroke()
		c.restore()
		this.dead = !this.sparks.size
	},
}

const Fireworks = Template(fireworksHandler)

const animations = {
	init() {
		this.sparkPool = []
		this.effects = new Set()
	},
	
	Spark(x, y, length, an) {
		let spark = this.sparkPool.pop() || Spark()
		spark.spawn(x, y, length, an)
		return spark
	},
	
	freeSpark(spark) {
		if (this.sparkPool.length < 100)
		this.sparkPool.push(spark)
	},
	
	Fireworks(x, y, color, sparks, power) {
		this.effects.add(Fireworks({
			x, y, color, count : sparks, power
		}))
	},
	
	render(c) {
		for (let effect of this.effects) {
			effect.render(c)
			if (effect.dead) this.effects.delete(effect)
		}
	},
	
	reset() {
		this.effects.clear()
	},
}