'use strict'

const SlidersTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "sliders "+(this.className || ""), this.parent)
		this.dvSliders = createElement("div", "sliders", this.dvDisplay)
		this.dvReal = createElement("div", "sliders-real", this.dvSliders)
		this.dvClones = createElement("div", "sliders-clones", this.dvSliders)
		this.hover = PointInfoDisplay({
			parent : this.dvDisplay,
			className : "point-info hidden",
			align(x, y) {
				if (x == -1) return
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				x = ((x + width + 5< viewport.width) ? (x + 5) : (x - 5 - width))
				y = y - height / 2
				x = Math.max(1, Math.min(viewport.width - width - 1, x))
				y = Math.max(1, Math.min(viewport.height - height - 1, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y+"px"
			},
			
		})
		this.hover.dvDisplay.style.position = "absolute"
	},
	
	onSet() {
		this.dvDisplay.insertBefore(gui.dvHeader, this.dvDisplay.firstChild)
		game.sliders.map(slider => {
			//this.dvSliders.appendChild(slider.dvDisplay)
			if (slider.clone)
				this.dvClones.appendChild(slider.dvDisplay)
			else
				this.dvReal.appendChild(slider.dvDisplay)
			slider.updateFullVisibility()
			slider.displayStats.map(y => {
				y.expSlider.update()
			})
		})
	},
	
	update() {
		game.sliders.map(slider => {
			slider.updateFullInfo()
		})
		this.hover.update()
	}
})