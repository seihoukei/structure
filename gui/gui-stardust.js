'use strict'

const StardustTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "stardust "+(this.className || ""), this.parent)
		this.dvSliders = createElement("div", "stardust-growth", this.dvDisplay)
		this.sliders = POINT_TYPES.slice(1).map(x => {
		})
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})