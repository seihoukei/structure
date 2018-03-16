'use strict'

const AchievementsTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "achievements "+(this.className || ""), this.parent)
		this.dvInfo = createElement("div", "info", this.dvDisplay)
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})