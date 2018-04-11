'use strict'

const ArtifactsTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "artifacts "+(this.className || ""), this.parent)		
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})