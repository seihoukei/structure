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
						gui.target.set(key, this.x, this.y)
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
					game.world.updateConnections()
					game.world.update()
					game.updateWorldBackground = true
				}
			} else if (this.state == MOUSE_STATE_BUILD) {
				const connections = game.world.predictConnections(this.target)
				if (connections.possible) {//if can move
					this.state = MOUSE_STATE_FREE
					game.world.build({
						x : this.mapX,
						y : this.mapY,
						type : this.target.type,
						world : game.world
					})
					delete this.target
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
				this.target.newX = this.mapX
				this.target.newY = this.mapY
				this.target.newConnections = game.world.predictConnections(this.target)
//				this.target.calculateStats()
//				game.world.updateConnections()
//				game.updateWorldBackground = true
			}
		}
	},
	
	onwheel(event) {
		if (game.slowMode) 
			return
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