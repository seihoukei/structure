'use strict'

const WorldTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "world "+(this.className || ""), this.parent)
		this.background = createElement("canvas", "background hidden", this.dvDisplay)
		this.foreground = createElement("canvas", "foreground hidden", this.dvDisplay)
		
/*		this.foreground.onmousedown = gui.worldMouse.onmousedown.bind(gui.worldMouse)
		this.foreground.onmousemove = gui.worldMouse.onmousemove.bind(gui.worldMouse)
		this.foreground.onmouseup = this.foreground.onmouseleave = this.foreground.onmouseout = gui.worldMouse.onmouseup.bind(gui.worldMouse)	
		this.foreground.onwheel = gui.worldMouse.onwheel.bind(gui.worldMouse)
		this.foreground.oncontextmenu = (event) => event.preventDefault()*/
		
		this.foregroundContext = this.foreground.getContext("2d")
		this.backgroundContext = this.background.getContext("2d")
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})