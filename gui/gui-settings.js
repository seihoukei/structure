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

const listPickerHandler = {
	_init() {
		this.dvDisplay = createElement("div", "setting", this.parent)
		this.dvName = createElement("div", "title", this.dvDisplay, this.name + ":")
		this.dvChoices = createElement("div", "choices", this.dvDisplay)
		if (!this.values) {
			if (!this.choices) return
			this.values = this.choices.map(x => x.value)
			this.texts = this.choices.map(x => x.text || x.value)
		}
		this.buttons = this.values.map ((x,n) => {
			let button = {
				name : this.texts[n],
				value : x,
			}
			button.dvDisplay = createElement("div", "choice", this.dvChoices)
			button.dvDisplay.innerText = button.name
			button.dvDisplay.onclick = (event) => {
				this.set(x)
			}
			return button
		})
	},
	
	set(x) {
		this.container[this.value] = x
		this.onSet && this.onSet()
		this.update(true)
	},
	
	update(forced) {
		if (forced)
			this.buttons.map(x => x.dvDisplay.classList.toggle("active", x.value == this.container[this.value]))
	}
}

const ListPicker = Template(listPickerHandler)