'use strict'

const MAP_MINIMUM_POINT_SIZE = 5
const MAP_MINIMUM_DISTANCE = 16

function mapLevel(level) {
	return {
		level,
		pointsCount : Math.round(25 * 1.07 ** level),
		exitsCount : Math.round(3 * 1.07 ** level) + 1,
		ascendCost : Math.round(2.4 * 1.05 ** level),
		basePower : 20 * 8 ** level * ((1.09 + (level / 700) ** 2) ** level ** (1.55 + 0.25 * 1.01 ** (level ** 0.98 ))),
		size : 100 * 1.07 ** (level / 1.8),
		boss : 0,
	}
}
//Balance data: Array(51).fill().map((x,n) => Map(mapLevel(n), mapMaker)).map(x => x.points.map(y => y.power)).map(x => [Math.min(...x), Math.max(...x),x.length]).map((x,n,a) => n+":  \t"+[x[2],x[0] / (a[n-1]||[0,0])[1], x[1]/x[0], x[1] / (a[n-1]||[0,0])[1]].map(y => y.toFixed(2)).join(",  \t")).join("\n")
//Mean balance data: 
//stats = Array(10).fill().map(z => Array(51).fill().map((x,n) => Map(mapLevel(n), mapMaker)).map(x => x.points.map(y => y.power)).map(x => [Math.min(...x), Math.max(...x),x.length]).map((x,n,a) => [x[2],x[0] / (a[n-1]||[0,0])[1], x[1]/x[0], x[1] / (a[n-1]||[0,0])[1]]))
//stats[0].map((x,n) => n + ":  \t" + x.map((y,m) => (stats.reduce((v,z) => v + z[n][m], 0)/stats.length).toFixed(2)).join(" \t")).join("\n")


const mapHandler = {
	renderMap(c) {
		const fontName = " 'Open Sans', 'Arial Unicode MS', 'Segoe UI Symbol', 'Symbols', sans-serif"

		function drawOutline(point) {
			c.save()
			c.translate(point.x, point.y)
			c.moveTo(0, 0)
			c.lineTo(point.dx, point.dy)
			if (point.locked != 1 || game.dev && game.dev.seeAll) {
				c.moveTo(point.size, 0)
				c.arc(0, 0, point.size, 0, 6.29)
				if (point.special == SPECIAL_COLONY) {
					const an = 0.5
					const ac = Math.cos(an)
					const as = Math.sin(an)
					c.moveTo(ac * (2 + point.renderSize), -as * (2 + point.renderSize))
					c.arc(0, 0, 2 + point.renderSize, -an, an)		
					c.moveTo(ac * (4 + point.renderSize), -as * (4 + point.renderSize))
					c.arc(0, 0, 4 + point.renderSize, -an, an)		
					c.moveTo(ac * (6 + point.renderSize), -as * (6 + point.renderSize))
					c.arc(0, 0, 6 + point.renderSize, -an, an)		
					c.moveTo(-ac * (2 + point.renderSize), as * (2 + point.renderSize))
					c.arc(0, 0, 2 + point.renderSize, 3.1415-an, 3.1415+an)		
					c.moveTo(-ac * (4 + point.renderSize), as * (4 + point.renderSize))
					c.arc(0, 0, 4 + point.renderSize, 3.1415-an, 3.1415+an)		
					c.moveTo(-ac * (6 + point.renderSize), as * (6 + point.renderSize))
					c.arc(0, 0, 6 + point.renderSize, 3.1415-an, 3.1415+an)		
				}
				if (point.special == SPECIAL_CLONE) {
					c.moveTo(point.renderSize * 1.2, 0)
					for (let i = 0; i < 19; i++) {
						c.arc(0, 0, point.renderSize * (i&1?1.5:1.2), 2 * i * 3.1415 / 18, (2 * i+1) * 3.1415/18)
					}
				}
				if (point.special == SPECIAL_RESIST) {
					c.moveTo(point.renderSize, 0)
					c.arc(0, 0, point.renderSize, 0, 6.29)
					c.moveTo(point.renderSize * 1.35, 0)
					c.arc(0, 0, point.renderSize* 1.35, 6.29, 0)
					for (let i = 0; i < 19; i++) {
						c.lineTo((point.renderSize * (i&1?1:1.3)) * Math.cos(i * 3.1415 / 9), (point.renderSize * (i&1?1:1.3)) * Math.sin(i * 3.1415 / 9))
					}
				}
				if (point.special == SPECIAL_BLOCK) {
					const pi3 = Math.PI / 3
					const size3 = point.renderSize * Math.sqrt(3)
					c.moveTo(-size3 * 0.75, -point.renderSize * 0.75)
					c.arc(0, point.renderSize * 1.5, size3 * 1.5, 4 * pi3, 5 * pi3)
					c.arc(-size3 * 0.75, -point.renderSize * 0.75, size3 * 1.5, 0, pi3)
					c.arc(size3 * 0.75, -point.renderSize * 0.75, size3 * 1.5, 2 * pi3, 3 * pi3)
					c.arc(0, point.renderSize * 1.5, size3 * 1.5, 4 * pi3, 5 * pi3)
				}
			}
			c.restore()
		}
		function drawLevel(point) {
			if (point.locked == 1) return
			c.save()
			c.translate(point.x, point.y)
			for (let i = 1; i <= point.level; i++) {
				c.moveTo(point.size + 0.25 + i * 2, 0)
				c.arc(0, 0, point.size + 0.25 + i * 2, 0, 6.29)
			}
			c.restore()
		}
		function drawPoint(point) {
			if (point.locked == 1) return
			c.save()
			c.translate(point.x, point.y)
			c.moveTo(point.size, 0)
			c.arc(0, 0, point.size, 0, 6.29)
			c.restore()	
		}
		function drawSpecial(point) {
			c.save()
			c.translate(point.x, point.y)
			if (point.owned && point.index && (point.key && point.keyData.lockPoint.owned || point.lock || point.exit || point.boss))
				c.globalAlpha = 0.55
			const w = c.measureText(point.specialText).width
			c.font = (point.size / w * 12).toFixed(2)+"px" + fontName
			c.fillText(point.specialText, 0, 0)
			c.restore()
		}
		function fillPoints(points, filter, color) {
			c.beginPath()
			c.fillStyle = color
			points.filter(filter).map(drawPoint)
			c.fill()			
		}

		if (game.dev && game.dev.seeAll)
			this.renderedPoints = this.points
		else
			this.renderedPoints = this.points.filter(x => x.away < (game.skills.sensor?3:2) && x.locked < 2 && (!x.boss || x.boss <= this.boss))
		
		this.renderedPoints.map(pt => pt.onscreen = 
				pt.x < viewport.window.right + pt.size + 1&&
				pt.x > viewport.window.left - pt.size - 1 &&
				pt.y < viewport.window.bottom + pt.size + 1&&
				pt.y > viewport.window.top - pt.size - 1)
		this.renderedPoints = this.renderedPoints.filter(pt => (pt.onscreen || pt.parent && pt.parent.onscreen) && !pt.animating)
		
		c.save()
		c.beginPath()
		c.lineWidth = 0.5
		c.strokeStyle = gui.theme.shades[7]
		this.renderedPoints.filter(x => x.owned && x.level).map(drawLevel)
		c.stroke()
		c.restore()

		c.beginPath()
		c.strokeStyle = gui.theme.shades[11]
		if (game.dev && game.dev.seeAll)
			this.renderedPoints.filter(x => x.away).map(drawOutline)
		else
			this.renderedPoints.filter(x => x.away == 1).map(drawOutline)
		c.stroke()
		
		c.beginPath()
		c.strokeStyle = gui.theme.shades[0]
		this.renderedPoints.filter(x => x.owned).map(drawOutline)
		c.stroke()		
		
		gui.theme.typeColors.map((color, n) => {
			fillPoints(this.renderedPoints, x => (x.away < 2 && !x.locked || game.dev && game.dev.seeAll) && x.type == n, color)
		})
		
		if (settings.colorBlind) {
			c.save()
			c.fillStyle = gui.foreground
			c.textAlign = "center",
			c.textBaseline = "top",
			c.font = "4px"+fontName
			this.renderedPoints.map(point => {
				c.save()
				c.translate(point.x, point.y)
				c.fillText(POINT_TYPES[point.type].capitalizeFirst()[0],0, -point.size)
				c.restore()
			})
			c.restore()
		}
		
		fillPoints(this.renderedPoints, x => x.index == 0, gui.theme.shades[7])

		if (game.dev && game.dev.seeAll)
			fillPoints(this.renderedPoints, x => x.away > 1, "rgba(255,255,255,0.7)")
		else
			fillPoints(this.renderedPoints, x => x.away == 2, gui.theme.shades[11])

//		c.font = "3.5px" + fontName
		c.textBaseline = "middle"
		c.textAlign = "center"
		c.fillStyle = gui.theme.special
		
		if (game.dev && game.dev.seeAll)
			this.renderedPoints.filter(pt => (pt.specialText)).map(drawSpecial)
		else {
			this.renderedPoints.filter(pt => (pt.away < 2) && !pt.locked && (pt.specialText)).map(drawSpecial)
			c.fillStyle = gui.theme.foreground
			this.renderedPoints.filter(pt => (pt.away < 2) && pt.locked && (pt.specialText)).map(drawSpecial)
		}
	},
	
	getOwnedRadius() {
		let n = 1
		let lastRadius = 0
		while (this.points[n] && (this.points[n].owned || this.points[n].boss)) {
			lastRadius = this.points[n].distance - this.points[n].size
			n++
		}
		this.points.map(point => point.suspend())
		this.ownedRadius = Math.max(20, this.points[n]?this.points[n].distance - this.points[n].size:this.points[this.points.length-1].distance + this.points[this.points.length-1].size + MAP_MINIMUM_POINT_SIZE)
		this.points.map(point => point.unsuspend())
		
		return this.ownedRadius
	},
	
	restoreState() {
		this.keys = Array(this.level + 1).fill().map(x => ({}))
		this.points.map((point,index) => {
			point.index = index
			point.map = this
			if (point.parentIndex != index)
				point.parent = this.points[point.parentIndex]
			point.restoreState()
		})
		this.update()
	},

	updatePoints() {
		this.points.map((point,index) => {
			point.calculateStats()
		})		
		this.points.map((point,index) => {
			point.updateText()
		})		
		this.complete = !this.points.filter(pt => (!pt.boss || pt.boss <= this.boss) && !pt.owned).length
		if (this.complete) game.unlockStory("m"+this.level.digits(3)+"b"+this.boss.digits(1)+"b")
		this.updateAways()
	},
	
	updateAways() {
		this.points.map (x => x.updateAway())
	},
	
	updateBounds() {
		if (!this.bounds)
			this.bounds = {}
		let visiblePoints
		if (game && game.dev && game.dev.seeAll)
			visiblePoints = this.points
		else
			visiblePoints = this.points.filter(x => (x.away < (game.skills.sensor?3:2)) && (x.locked < 2) && !(x.locked && x.away == 2) && (!x.boss || x.boss <= this.boss))
		this.bounds.left = Math.min(...visiblePoints.map(pt => pt.x - pt.size))
		this.bounds.right = Math.max(...visiblePoints.map(pt => pt.x + pt.size))
		this.bounds.top = Math.min(...visiblePoints.map(pt => pt.y - pt.size))
		this.bounds.bottom = Math.max(...visiblePoints.map(pt => pt.y + pt.size))
		this.bounds.width = this.bounds.right - this.bounds.left
		this.bounds.height = this.bounds.bottom - this.bounds.top
	},
	
	update() {
		this.updatePoints()
		this.updateBounds()
		this.getOwnedRadius()
	},
	
	destroyDisplays() {
		this.points.map(x => x.destroyDisplays())
	},
	
	toJSON() {
		let o = Object.assign({},this)
		delete o.bounds
		delete o.renderedPoints
		delete o.keys
		delete o.markers
		delete o.complete
		return o
	}
}

const mapLoader = {
	_init() {
		this.points = this.points.map(x => Point(x))
		if (this.markerIndexes)
			this.markers = this.markerIndexes.map(x => this.points[x])
			
		this.restoreState()
	}
}

const mapMaker = {
	_init() {
		this.points = []
		this.boss = 0
		let n = this.pointsCount - 1
		this.points.push(Point({
			x : 0,
			y : 0,
			distance : 0,
			angle : 0,
			size : MAP_MINIMUM_POINT_SIZE,
			power : this.basePower,
			parentIndex : 0,
			type : 0,
			owned : true,
			available : true,
		}))
		function createPoint(points, size, angle, spacing, type, customPower) {
			let c = Math.cos(angle)
			let s = Math.sin(angle)
			let r = (size + spacing)
			let distances = points.map(point => {
				let distance = 0
				if (c * point.x + s * point.y < 0) return [0, point]
//				if (Math.abs (angle - point.angle) > 1.6 && Math.abs (angle - 6.29 - point.angle) > 1.6 && Math.abs (angle + 6.29 - point.angle) > 1.6 && point.distance > 0) return [0, point]
				let a = point.y * c - point.x * s
				let b = point.dy * c - point.dx * s
				let h = a ** 2
				let r2 = (r + point.size) ** 2
				if (h <= r2) 
					distance = Math.sqrt((point.distance) ** 2 - h) + Math.sqrt(r2 - h)
				else {
				}
				
				if (a * b > a * a && point.parent && point.parent.distance > 0) {
					let d = Math.abs((point.dx * point.y - point.dy * point.x) / point.length)
					distance = Math.min((point.y * point.dx / point.dy - point.x) / (s * point.dx / point.dy - c) * (d + r) / d, point.distance + r)
				}
				
				return [distance, point]
			})
			let farthest = distances[0]
			distances.map(x => (farthest = ((x[0]>farthest[0])?x:farthest)))
			let distance = (farthest[0]+0.001).toDigits(3)
			let x = (distance * Math.cos(angle))
			let y = (distance * Math.sin(angle))
			let ok = true
			let output = Point({
				x, y, distance, angle, size, type, customPower,
				owned : false,
				available : false,
				parent : farthest[1],
				depth : (farthest[1].depth || 0) + 1,
				dx : farthest[1].x - x,
				dy : farthest[1].y - y,
				length : Math.hypot(farthest[1].x - x, farthest[1].y - y)
			})
			points.push(output)	
			return output
		}
		if (this.level == 20) {
			this.ascendCost = 0
			let m = n/3 | 0
			while(m--) {
				const angle = Math.PI * (14 / 12 + Math.random() * 8 / 12 )
				const size = 30
				const spacing = 60
				const type = 2
				const point = createPoint(this.points, size, angle, spacing, type)
				point.special = SPECIAL_RESIST
			}
			m = n - (n/3 | 0)
			while(m--) {
				const angle = Math.PI * (1 / 12 + Math.random() * 10 / 12 )
				const size = 10
				const spacing = 40
				const type = m%4+3
				const point = createPoint(this.points, size, angle, spacing, type)
				point.special = m%10?SPECIAL_BLOCK:SPECIAL_CLONE
			}
			
			for(let i = 0; i < 4; i++) {
				const angle = Math.PI * (14 / 12 + i * 8 / 36)
				const size = 100
				const spacing = 120
				const type = i + 3
				const point = createPoint(this.points, size, angle, spacing, type, 1e33)
				point.special = SPECIAL_RESIST				
				point.key = i + 1
			}

			let lastPoint = null

			for(let i = 0; i < 4; i++) {
				const angle = 0
				const size = 10
				const spacing = i?12:400
				const type = 0
				const point = createPoint(this.points, size, angle, spacing, type, i?5e33:1e33)
				point.lock = i + 1
				if (lastPoint)
					point.parent = lastPoint
				lastPoint = point
			}
			
			for(let i = 0; i < 10; i++) {
				const angle = 0
				const size = 10
				const spacing = 12
				const type = 0
				const point = createPoint(this.points, size, angle, spacing, type, 10e33)
				point.exit = 1
				point.parent = lastPoint
				lastPoint = point
			}

			{
				const angle = 0
				const size = 1000
				const spacing = 750
				const type = 1
				const point = createPoint(this.points, size, angle, spacing, type, 10e33)
				point.boss = 1
				point.parent = lastPoint
				lastPoint = point
			}
			this.boss = 1
			this.points.sort((x,y) => x.distance - y.distance)
			this.points.map((x,n) => x.index = n)
			this.points.map((x,n) => x.parentIndex = x.parent && x.parent.index || 0)
			this.restoreState()
		} else {
			while (n--) {
				let size = (MAP_MINIMUM_POINT_SIZE + ((this.pointsCount - n) ** 0.4) * Math.random()).toDigits(3)
				let angle, spacing
				
				if (this.level == 5) {
					//dark world 1
					angle = n * 0.3
					angle += (angle / 3.1415 | 0) * 3.1415
					spacing = MAP_MINIMUM_DISTANCE 
				
				} else if (this.level == 10) {
					angle = (n + 1) * 0.3
					angle += (angle / (3.1415 * (0.4)) | 0) * 3.1415 * (0.6)
					spacing = MAP_MINIMUM_DISTANCE 
					
				} else if (this.level == 15) {
					angle = ((n - 2) * 2 + ((n - 2) / 3 | 0 % 1)) * Math.PI / 3
					spacing = MAP_MINIMUM_DISTANCE 
					
				} else {
					angle = (Math.random() * 6.29).toDigits(3)
					spacing = MAP_MINIMUM_DISTANCE * (1 + 2 * Math.random())
				}
				let type = n % 3
				if (!type && this.level > 5) if ((n / 3 | 0) % 4 == 0) type = 4
				if (!type && this.level > 10) if ((n / 3 | 0) % 4 == 1) type = 5
				if (!type && this.level > 15) if ((n / 3 | 0) % 4 == 2) type = 3
				if (!type && this.level > 15) if ((n / 3 | 0) % 4 == 3) type = 6
				const point = createPoint(this.points, size, angle, spacing, type)
				if (point.parent == this.points[0] && point.type > 2 && this.level < 12 && !point.boss) point.type = 0
			}
			
			if (this.level == 5) {
				//dark world
				for (let n = 0; n <= 5; n++) {
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + n ** 2, -1.5708, MAP_MINIMUM_DISTANCE, [0,0,0,2,1,4][n]).boss = 1
				}
			}
							
			if (this.level == 10) {
				//dark world
				for (let n = 0; n <= 3; n++) {
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + ((n >> 1) * 2) ** 2, - Math.PI/4 + Math.PI * (n & 1), MAP_MINIMUM_DISTANCE, 0, this.basePower * (n > 1 ? 25 : 10)).boss = 1
				}
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, - Math.PI/4 , MAP_MINIMUM_DISTANCE * 1.5, 4, this.basePower * 50).boss = 1
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, - Math.PI/4 + Math.PI/8 , MAP_MINIMUM_DISTANCE, 1, this.basePower * 50).boss = 1
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, - Math.PI/4 - Math.PI/8 , MAP_MINIMUM_DISTANCE, 2, this.basePower * 50).boss = 1
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, 3*Math.PI/4 , MAP_MINIMUM_DISTANCE * 1.5, 4, this.basePower * 50).boss = 1
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, 3*Math.PI/4 + Math.PI/8 , MAP_MINIMUM_DISTANCE, 1, this.basePower * 50).boss = 1
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, 3*Math.PI/4 - Math.PI/8 , MAP_MINIMUM_DISTANCE, 2, this.basePower * 50).boss = 1
	
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 15, - Math.PI/4 , MAP_MINIMUM_DISTANCE, 5, this.basePower * 200).boss = 2
				createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 15, 3*Math.PI/4 , MAP_MINIMUM_DISTANCE, 5, this.basePower * 200).boss = 2
			}
							
			if (this.level == 15) {
				//dark world
				for (let n = 0; n <= 5; n++) {
					const point1 = createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 5, Math.PI/6 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE, 1)
					point1.boss = 1
					point1.special = SPECIAL_RESIST
					const point2 = createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 6, Math.PI/6 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE * 1.5, 2, 1e21)
					point2.boss = 1
					point2.special = SPECIAL_BLOCK
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 7, Math.PI/6 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE * 1.5, 4, 200e21).boss = 1
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 8, Math.PI/6 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE * 2, 5, 200e21).boss = 1
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 9, Math.PI/12+ Math.PI / 3 * n, MAP_MINIMUM_DISTANCE, 6, 500e21).boss = 2
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 9, Math.PI/4 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE, 6, 500e21).boss = 2
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 10, Math.PI/12+ Math.PI / 3 * n, MAP_MINIMUM_DISTANCE * 1.5, 3, 1e24).boss = 3
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 10, Math.PI/4 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE * 1.5, 3, 1e24).boss = 3
					createPoint(this.points, MAP_MINIMUM_POINT_SIZE + 35, Math.PI/6 + Math.PI / 3 * n, MAP_MINIMUM_DISTANCE * 2, 0, 1.5e24).boss = 3
				}
			}

			this.points.sort((x,y) => x.distance - y.distance)
			this.points.map((x,n) => x.index = n)
			this.points.map((x,n) => x.parentIndex = x.parent && x.parent.index || 0)
			this.restoreState()

			if (this.level > 5 && this.level % 5 == 1) {
				const colonyIndex = this.points.length * 0.75 | 0
				const colony = this.points[colonyIndex]
				colony.special = SPECIAL_COLONY
				this.markerIndexes = [colonyIndex]
				this.markers = [colony]
			}
			
			if (this.level > 12) {
				const canBlock = new Set(this.points.filter (x => x.index && x.parent && x.parent.index && x.depth > 2 && !x.special && !x.boss))
				
//				if (this.level < 15)
				for (let i = 0; i < (this.level / 6 | 0) - 1; i++) {
					const points = this.points.filter (x => !x.special && !x.boss && x.depth > 2)
					const colony = points[points.length * Math.random() | 0]
					colony.special = SPECIAL_CLONE
					canBlock.delete(colony)
					let point = colony
					while (point.parent && point.parent.index) 
						canBlock.delete(point = point.parent)
				}		
				
				for (let i = 0; i < (this.level | 0) - 10; i++) {
					const point = [...canBlock][canBlock.size * Math.random()|0]
					point.special = i&1?SPECIAL_RESIST:SPECIAL_BLOCK
					canBlock.delete(point)
				}
			}		
			
			let ends = this.points.filter(x => !x.boss && !([...x.children].filter(y => !y.boss).length))
			ends = ends.slice(Math.floor(ends.length / 2))
			this.size = ends.reduce((v,x) => v + x.distance, 0)/ends.length
			let sorted = [...this.points].filter(x => !x.boss).sort((x,y) => (y.depth * 5 - y.children.size * 100) - (x.depth * 5 - x.children.size * 100))
			sorted.slice(0,this.exitsCount).map((pt,n) => pt.exit = true)
			let free = new Set(sorted.filter(x => !x.exit && !x.boss))
			
			let clonePoint = this.points.filter(x => x.special == SPECIAL_CLONE).sort((x,y) => x.depth - y.depth)[0]
			while (clonePoint && clonePoint.parent && clonePoint.parent.index) {
				free.delete(clonePoint)
				clonePoint = clonePoint.parent
			}
			
			for (let k = 0; k < this.level; k++) {
				let point1 = [...free][Math.floor(Math.random() * free.size)]
				free.delete(point1)
				let possible = new Set([...free].filter(x => x.depth > 1 && x.children.size && x.depth > point1.depth - 3 && !x.parents.has(point1)))
				let point = point1
				let clearPossible = (point) => {
					while (point.parent && point.parent.index) {
						point = point.parent
						possible.delete(point)
						if (point.lock) clearPossible(this.points.filter(x => x.key == point.lock)[0])
					}
				}
				clearPossible(point)
				let point2 = [...possible][Math.floor(Math.random() * possible.size)]
				if (!point2) {
					k--
					continue
				}
				free.delete(point2)
				point1.key = k+1
				point2.lock = k+1
			}
			let modified = true
			while (modified) {
				modified = false
				this.points.map (point => {
					if (point.key || point.lock || point.exit || point.boss || !point.parent || !point.parent.key) return
					let lock = this.points.filter(x => x.lock == point.parent.key)[0]
					if (lock.depth  + 3 < point.depth) return
					point.key = point.parent.key
					delete point.parent.key
					modified = true
				})
			}
			this.restoreState()
		}
	},
}

const Map = Template(mapHandler)