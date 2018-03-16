'use strict'

const StardustTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "stardust "+(this.className || ""), this.parent)
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})