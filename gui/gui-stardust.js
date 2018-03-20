'use strict'

const StardustTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "stardust "+(this.className || ""), this.parent)
		this.dvSliders = createElement("div", "stardust-growth", this.dvDisplay)
		this.sliders = POINT_TYPES.slice(1).map(x => {
			return GuiSlider({
				parent : this.dvDisplay,
				container : game.stardust,
				value : x,
				leftText : "0",
				rightText : game.resources.stardust,
				max : game.resources.stardust,
				min : 0,
				steps : game.resources.stardust,
				className : "stardust",
				sliderClass : "bg-"+x
			})
		})
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			this.sliders.map(x => {
				x.setMax(game.resources.stardust)
				x.steps = game.resources.stardust
				x.dvRight.innerText = game.resources.stardust
			})
		}
	}
})