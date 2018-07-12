'use strict'

const MOUSE_STATE_FREE = 0
const MOUSE_STATE_INFO = 1
const MOUSE_STATE_BUILD = 2
const MOUSE_STATE_MOVE = 3

const MapMouse = {
	x : 0,
	y : 0,
	mapX : 0,
	mapY : 0,
	button : -1,
	down : false,
	moved : false,
	state : MOUSE_STATE_FREE,
	start : {
		x : 0,
		y : 0,
		mapX : 0,
		mapY : 0,
	},
	
	onmousedown(event) {
		if (gui.map.sliderInfo) gui.map.sliderInfo.remove()
		if (gui.map.slider) delete gui.map.slider
		if (game.slowMode) {
			gui.target.reset()
			return
		}
		this.down = true
		this.moved = false
		this.button = event.button
		this.x = this.start.x = event.offsetX
		this.y = this.start.y = event.offsetY
		this.mapX = this.start.mapX = gui.mainViewport.mouseToMapX(this.x)
		this.mapY = this.start.mapY = gui.mainViewport.mouseToMapY(this.y)
		event.preventDefault()
	},
	
	onmouseup(event) {
		if (!this.down) return
		this.down = false
		this.button = -1
		if (this.moved) {
		} else if (event.button == 2) {
			gui.mainViewport.setTargetXY(this.mapX, this.mapY)
			gui.target.reset()
		} else if (event.button == 0) {
			if (this.closest) {
				if (this.closest.locked == 1 && !this.closest.keyData.keyPoint.owned) {
					let key = this.closest.keyData.keyPoint
					if (key.away == 1) {
						if (key.onscreen)
							key.highlight()
						else
							gui.mainViewport.setTargetXY(this.closest.keyData.keyPoint.x, this.closest.keyData.keyPoint.y)
						gui.hover.reset()
						gui.target.set(key, ...gui.mainViewport.getTargetMapXY(this.closest.keyData.keyPoint.x, this.closest.keyData.keyPoint.y))
					}
				} else if (!this.closest.owned || !this.closest.boss && game.skills.upgradePoints && this.closest.index || game.skills.mining && !this.closest.index) {
						gui.hover.reset()
					gui.target.set(this.closest, this.x, this.y)
				}
			} else
				gui.target.reset()
		}

		this.moved = false
		event.preventDefault()
	},
	
	onmousemove(event) {
		this.x = event.offsetX
		this.y = event.offsetY
		if (game.slowMode) 
			return
		if (this.down) {
			this.mapX = (this.x - gui.mainViewport.halfWidth ) / gui.mainViewport.current.zoom + this.start.mapX
			this.mapY = (this.y - gui.mainViewport.halfHeight) / gui.mainViewport.current.zoom + this.start.mapY
		} else {
			this.mapX = (this.x - gui.mainViewport.halfWidth ) / gui.mainViewport.current.zoom + gui.mainViewport.current.x
			this.mapY = (this.y - gui.mainViewport.halfHeight) / gui.mainViewport.current.zoom + gui.mainViewport.current.y
		}
		
		if (this.down && (Math.abs(this.x - this.start.x) > 5 || Math.abs(this.y - this.start.y) > 5))
			this.moved = true
		
		if (this.state == MOUSE_STATE_FREE) {
			if (this.down && this.moved && this.button == 0) {
				gui.mainViewport.setTargetXY(
					2 * this.start.mapX - this.mapX,
					2 * this.start.mapY - this.mapY)
			}
		}
				
		if (!this.down) {
			if (game.map.renderedPoints && game.map.renderedPoints.length) {
				let closest = game.map.renderedPoints.filter(x => x.away < 2 || game.dev && game.dev.seeAll).map(pt => [pt, (pt.x - this.mapX) ** 2 + (pt.y - this.mapY) ** 2]).reduce((v,x) => v?(v[1]>x[1]?x:v):x, null)
				window.tmpv = game.map.renderedPoints.filter(x => x.away < 2 || game.dev && game.dev.seeAll).map(pt => [pt, (pt.x - this.mapX) ** 2 + (pt.y - this.mapY) ** 2])
				window.lastc = closest
				this.closest = closest && closest[1] < (closest[0].size * 3) ** 2 && closest[0] != gui.target.point? closest[0] : null
				gui.hover.set(this.closest, this.x, this.y)
			}
		}
	},
	
	onwheel(event) {
		if (game.slowMode) 
			return
		if (event.deltaY && !this.down) {
			if (this.state == MOUSE_STATE_FREE) {
				let oldZoom = gui.mainViewport.current.zoom
				gui.mainViewport.setZoom(gui.mainViewport.current.zoom - (gui.mainViewport.max.zoom - gui.mainViewport.min.zoom) * (event.deltaY > 0 ? 0.04 : -0.04))
				let shift = (gui.mainViewport.current.zoom - oldZoom) / gui.mainViewport.current.zoom
				gui.mainViewport.setXY(
					gui.mainViewport.current.x + shift * (this.mapX - gui.mainViewport.current.x),
					gui.mainViewport.current.y + shift * (this.mapY - gui.mainViewport.current.y))
				game.updateMapBackground = true
			}
		}
	}
}

const WorldMouse = {
	x : 0,
	y : 0,
	mapX : 0,
	mapY : 0,
	button : -1,
	down : false,
	moved : false,
	state : MOUSE_STATE_FREE,
	start : {
		x : 0,
		y : 0,
		mapX : 0,
		mapY : 0,
	},
	
	onmousedown(event) {
		this.down = true
		this.moved = false
		this.button = event.button
		this.x = this.start.x = event.offsetX
		this.y = this.start.y = event.offsetY
//		this.mapX = this.start.mapX = gui.worldViewport.mouseToMapX(this.x)
//		this.mapY = this.start.mapY = gui.worldViewport.mouseToMapY(this.y)
		this.mapX = this.start.mapX = (this.x - gui.worldViewport.halfWidth ) / gui.worldViewport.current.zoom + gui.worldViewport.current.x
		this.mapY = this.start.mapY = (this.y - gui.worldViewport.halfHeight) / gui.worldViewport.current.zoom + gui.worldViewport.current.y
		event.preventDefault()
	},
	
	onmouseup(event) {
		if (!this.down) return
		this.down = false
		this.button = -1
		if (this.moved) {
		} else if (event.button == 2) {
			if (this.state == MOUSE_STATE_FREE) {
				gui.worldViewport.setTargetXY(this.mapX, this.mapY)
			} else if (this.state == MOUSE_STATE_MOVE || this.state == MOUSE_STATE_BUILD) {
				this.state = MOUSE_STATE_FREE
				gui.world.dvControlHint.classList.toggle("hidden", this.state == MOUSE_STATE_FREE)
				game.updateWorldBackground = true
				delete this.target
			}
		} else if (event.button == 0) {
			//main onclick
			if (this.state == MOUSE_STATE_FREE && this.closest) {
				if (gui.world.target.point) 
					gui.world.target.reset()
				else
					gui.world.target.set(this.closest, this.x, this.y)
			} else if (this.state == MOUSE_STATE_FREE && !this.closest) {
				if (gui.world.target.point) 
					gui.world.target.reset()
			} else if (this.state == MOUSE_STATE_MOVE) {
				const connections = game.world.predictConnections(this.target)
				if (connections.possible) {//if can move
					this.state = MOUSE_STATE_FREE
					this.target.x = this.target.newX.toDigits(3)
					this.target.y = this.target.newY.toDigits(3)
					this.target.calculateStats()
					delete this.target
					gui.world.dvControlHint.classList.toggle("hidden", this.state == MOUSE_STATE_FREE)
					game.world.updateConnections()
					game.world.update()
					game.updateWorldBackground = true
				}
			} else if (this.state == MOUSE_STATE_BUILD) {
				const connections = game.world.predictConnections(this.target)
				if (connections.possible) {//if can move
					game.world.build({
						x : this.target.newX,
						y : this.target.newY,
						type : this.target.type,
						projected : true,
						world : game.world
					})
					gui.world.update(true)
					if (!event.shiftKey/* || !game.world.canAfford(this.target.type)*/) {
						this.state = MOUSE_STATE_FREE
						delete this.target
					} else {
						this.target.newConnections = game.world.predictConnections(this.target)
					}
					gui.world.dvControlHint.classList.toggle("hidden", this.state == MOUSE_STATE_FREE)
/*					game.world.updateConnections()
					game.world.update()
					game.updateWorldBackground = true*/
				}
			}
		}

		this.moved = false
		event.preventDefault()
	},
	
	onmousemove(event) {
		this.x = event.offsetX
		this.y = event.offsetY
		if (this.down) {
			this.mapX = (this.x - gui.worldViewport.halfWidth ) / gui.worldViewport.current.zoom + this.start.mapX
			this.mapY = (this.y - gui.worldViewport.halfHeight) / gui.worldViewport.current.zoom + this.start.mapY
		} else {
			this.mapX = (this.x - gui.worldViewport.halfWidth ) / gui.worldViewport.current.zoom + gui.worldViewport.current.x
			this.mapY = (this.y - gui.worldViewport.halfHeight) / gui.worldViewport.current.zoom + gui.worldViewport.current.y
		}
		
		if (this.down && (Math.abs(this.x - this.start.x) > 5 || Math.abs(this.y - this.start.y) > 5))
			this.moved = true
		
		if (this.state == MOUSE_STATE_FREE) {
			if (this.down && this.moved && this.button == 0) {
				gui.worldViewport.setTargetXY(
					2 * this.start.mapX - this.mapX,
					2 * this.start.mapY - this.mapY)
			}
		}
				
		if (!this.down) {
			//Main onmousemove
			if (this.state == MOUSE_STATE_FREE) {
				let closest = game.world.points.map(pt => [pt, (pt.x - this.mapX) ** 2 + (pt.y - this.mapY) ** 2]).reduce((v,x) => v?(v[1]>x[1]?x:v):x, null)
				this.closest = closest && closest[1] < (closest[0].radius * 3) ** 2 ? closest[0] : null
				if (this.closest) 
					gui.world.hover.set(this.closest, this.x, this.y) 
				else 
					gui.world.hover.reset()
			} else if (this.state == MOUSE_STATE_MOVE || this.state == MOUSE_STATE_BUILD) {
				if (event.ctrlKey) {
					const snapTarget = game.world.points.map(x => {
						if (x == this.target) return [x, 1e5]
						const r1 = x.reach
						const r2 = this.target.reach
						const d = Math.hypot(x.x - this.mapX, x.y - this.mapY)
						return [x, Math.min(Math.abs(r1-r2-d), Math.abs(r2-d-r1), Math.abs(d-r1-r2))]
					}).sort((x,y) => x[1]-y[1])[0][0]
					if (snapTarget == this.target) {
						this.target.newX = this.mapX.toDigits(3)
						this.target.newY = this.mapY.toDigits(3)
					} else {
						let distance = Math.hypot(snapTarget.x - this.mapX, snapTarget.y - this.mapY)
						const angle = Math.atan2(this.mapY - snapTarget.y, this.mapX - snapTarget.x)
						const delta = this.target.reach + (this.target.family == snapTarget.family && distance > Math.min(snapTarget.reach, this.target.reach)?0.1:-0.1)
						distance = snapTarget.reach + (distance > snapTarget.reach?delta:-delta)
						this.target.newX = snapTarget.x + distance * Math.cos(angle).toDigits(3)
						this.target.newY = snapTarget.y + distance * Math.sin(angle).toDigits(3)
					}
				} else if (event.altKey && game.world.points.length > 1) {
					const snapTargets = game.world.points.map(x => {
						if (x == this.target) return [x, 1e5]
						const r1 = x.reach
						const r2 = this.target.reach
						const d = Math.hypot(x.x - this.mapX, x.y - this.mapY)
						return [x, Math.min(Math.abs(r1-r2-d), Math.abs(r2-d-r1), Math.abs(d-r1-r2))]
					}).sort((x,y) => x[1]-y[1]).slice(0,2).map(x => x[0])
					const mx = this.mapX
					const my = this.mapY
					const x1 = snapTargets[0].x
					const y1 = snapTargets[0].y
					const x2 = snapTargets[1].x
					const y2 = snapTargets[1].y
					const d1 = Math.hypot(mx-x1, my-y1)
					const d2 = Math.hypot(mx-x2, my-y2)
					const delta1 = this.target.reach + (this.target.family == snapTargets[0].family && d1 > Math.min(snapTargets[0].reach, this.target.reach)?0.1:-0.1)
					const delta2 = this.target.reach + (this.target.family == snapTargets[1].family && d2 > Math.min(snapTargets[1].reach, this.target.reach)?0.1:-0.1)
					const td1 = snapTargets[0].reach + (d1 > snapTargets[0].reach?delta1:-delta1)
					const td2 = snapTargets[1].reach + (d2 > snapTargets[0].reach?delta2:-delta2)
					const inter = intersectCircles(x1,y1,td1,x2,y2,td2,mx,my)
					this.target.newX = inter.x.toDigits(3)
					this.target.newY = inter.y.toDigits(3)
				} else {
					this.target.newX = this.mapX.toDigits(3)
					this.target.newY = this.mapY.toDigits(3)
				}
				this.target.newConnections = game.world.predictConnections(this.target)
//				this.target.calculateStats()
//				game.world.updateConnections()
//				game.updateWorldBackground = true
			}
		}
	},
	
	onwheel(event) {
		if (event.deltaY && !this.down) {
			if (this.state == MOUSE_STATE_FREE) {
				let oldZoom = gui.worldViewport.current.zoom
				gui.worldViewport.setZoom(gui.worldViewport.current.zoom - (gui.worldViewport.max.zoom - gui.worldViewport.min.zoom) * (event.deltaY > 0 ? 0.04 : -0.04))
				let shift = (gui.worldViewport.current.zoom - oldZoom) / gui.worldViewport.current.zoom
				gui.worldViewport.setXY(
					gui.worldViewport.current.x + shift * (this.mapX - gui.worldViewport.current.x),
					gui.worldViewport.current.y + shift * (this.mapY - gui.worldViewport.current.y))
				game.updateWorldBackground = true
			}
		}
	}
}