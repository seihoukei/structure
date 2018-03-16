'use strict'

const SlidersTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "sliders "+(this.className || ""), this.parent)
		this.dvSliders = createElement("div", "sliders", this.dvDisplay)
	},
	
	onSet() {
		this.dvDisplay.insertBefore(gui.dvHeader, this.dvDisplay.firstChild)
		game.sliders.map(slider => {
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
	}
})