'use strict'

const WorldTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "about "+(this.className || ""), this.parent)
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})