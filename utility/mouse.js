'use strict'

const MOUSE_STATE_FREE = 0
const MOUSE_STATE_INFO = 1

const mouse = {
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
		this.mapX = this.start.mapX = viewport.mouseToMapX(this.x)
		this.mapY = this.start.mapY = viewport.mouseToMapY(this.y)
		event.preventDefault()
	},
	
	onmouseup(event) {
		if (!this.down) return
		this.down = false
		this.button = -1
		if (this.moved) {
		} else if (event.button == 2) {
			viewport.setTargetXY(this.mapX, this.mapY)
			gui.target.reset()
		} else if (event.button == 0) {
			if (this.closest) {
				if (this.closest.lock && !this.closest.keyData.keyPoint.owned) {
					let key = this.closest.keyData.keyPoint
					if (key.away == 1) {
						if (key.onscreen)
							key.highlight()
						else
							viewport.setTargetXY(this.closest.keyData.keyPoint.x, this.closest.keyData.keyPoint.y)
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
			this.mapX = (this.x - viewport.halfWidth ) / viewport.current.zoom + this.start.mapX
			this.mapY = (this.y - viewport.halfHeight) / viewport.current.zoom + this.start.mapY
		} else {
			this.mapX = (this.x - viewport.halfWidth ) / viewport.current.zoom + viewport.current.x
			this.mapY = (this.y - viewport.halfHeight) / viewport.current.zoom + viewport.current.y
		}
		
		if (this.down && (Math.abs(this.x - this.start.x) > 5 || Math.abs(this.y - this.start.y) > 5))
			this.moved = true
		
		if (this.state == MOUSE_STATE_FREE) {
			if (this.down && this.moved && this.button == 0) {
				viewport.setTargetXY(
					2 * this.start.mapX - this.mapX,
					2 * this.start.mapY - this.mapY)
			}
		}
				
		if (!this.down) {
			if (game.map.renderedPoints && game.map.renderedPoints.length) {
				let closest = game.map.renderedPoints.filter(x => x.away < 2 || game.dev && game.dev.seeAll).map(pt => [pt, (pt.x - this.mapX) ** 2 + (pt.y - this.mapY) ** 2]).reduce((v,x) => v?(v[1]>x[1]?x:v):x, null)
				this.closest = closest && closest[1] < (closest[0].size * 3) ** 2 && closest[0] != gui.target.point? closest[0] : null
				gui.hover.set(this.closest, this.x, this.y)
			}
		}
	},
	
	onwheel(event) {
		if (game.slowMode) 
			return
		if (event.deltaY && !mouse.down) {
			if (this.state == MOUSE_STATE_FREE) {
				let oldZoom = viewport.current.zoom
				viewport.setZoom(viewport.current.zoom - (viewport.max.zoom - viewport.min.zoom) * (event.deltaY > 0 ? 0.04 : -0.04))
				let shift = (viewport.current.zoom - oldZoom) / viewport.current.zoom
				viewport.setXY(
					viewport.current.x + shift * (mouse.mapX - viewport.current.x),
					viewport.current.y + shift * (mouse.mapY - viewport.current.y))
				game.updateBackground = true
			}
		}
	}
}

