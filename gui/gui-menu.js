'use strict'

const MenuTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "menu "+(this.className || ""), this.parent)

		this.tabs = TabGroup({
			parent : this.dvDisplay,
			name : "menu",
		})

		this.about = this.tabs.addTab("about", "About Structure", AboutTab)
		this.saves = this.tabs.addTab("saves", "Save game management", SavesTab)
		this.settings = this.tabs.addTab("settings", "Settings", SettingsTab)
		this.statistics = this.tabs.addTab("statistics", "Statistics", StatisticsTab)
		this.achievements = this.tabs.addTab("achievements", "Achievements", AchievementsTab)

		this.tabs.setTab("saves")
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
		if (this.tabs.activeTab == "statistics")
			this.statistics.update(forced)
	}
})