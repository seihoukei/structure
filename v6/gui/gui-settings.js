'use strict'

const SettingsTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "settings "+(this.className || ""), this.parent)
		const tabNames = [...Object.values(SETTINGS).reduce((v,x) => (v.add(x.group), v), new Set())]
		const tabGroups = tabNames.reduce((v,x) => (v[x] = [], v), {})
		Object.values(SETTINGS).map(x => tabGroups[x.group].push(x))
		this.tabs = TabGroup({
			parent : this.dvDisplay,
			name : "settings"
		})
		
		tabNames.map(x => this.tabs.addTab(x, x, SettingsSubTab, {
				settings : tabGroups[x]
			}))
			
		this.tabs.setTab(tabNames[0])
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
		Object.values(this.tabs.tabs).map(x => x.update(forced))
	}
})

const settingsSubTabHandler = {
	_init() {
		this.dvDisplay = createElement("div", "settings-tab", this.parent)
		this.items = this.settings.map(setting => ListPicker({
				name : setting.displayName,
				choices : setting.choices,
				className : "setting",
				onSet : () => {
					setting.onSet && setting.onSet()
					localStorage[GAME_PREFIX + "settings"] = JSON.stringify(settings)
				},
				container : settings,
				value : setting.id,
				parent : this.dvDisplay
			}))
	},
	
	update(forced) {
		this.items.map(x => x.update(forced))
	}
}

const SettingsSubTab = Template(settingsSubTabHandler)