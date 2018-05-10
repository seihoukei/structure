'use strict'

const guiSliderHandler = {
	_init() {
		this.range = this.max - this.min
		this.dvDisplay = createElement("div", "gui-slider "+(this.className||"")+" " +this.value, this.parent || document.body)
		this.dvLeft = createElement("div", "gui-slider-left", this.dvDisplay, this.leftText)
		if (this.shortStep) {
			this.dvLeftStep = createElement("div", "gui-slider-step", this.dvDisplay, "-")
			this.dvLeftStep.onclick = (event) => this.setValue (Math.max(this.min, this.container[this.value] - this.shortStep))
		}
		this.dvLine = createElement("div", "gui-slider-line "+(this.sliderClass || ""), this.dvDisplay)
		this.dvRunner = createElement("div", "gui-slider-runner "+(this.sliderClass || ""), this.dvLine, displayNumber(this.getValue(), this.digits))
		if (this.shortStep) {
			this.dvRightStep = createElement("div", "gui-slider-step", this.dvDisplay, "+")
			this.dvRightStep.onclick = (event) => this.setValue (Math.min(this.max, this.container[this.value] + this.shortStep))
		}
		this.dvRight = createElement("div", "gui-slider-right", this.dvDisplay, this.rightText)
		this.dvDisplay.onmousedown = (event) => {
			if (this.shortStep && event.target == this.dvLeftStep || event.target == this.dvRightStep)
				return
			this.moving = true
			this.rect = this.dvLine.getBoundingClientRect()
			let position = Math.max(0, Math.min(1, (event.clientX - 15 - this.rect.left) / (this.rect.width - 30)))
			position = Math.round(position * this.steps) / this.steps
			this.setPosition(position)
		}
		this.dvDisplay.onmousemove = (event) => {
			if (this.moving) {
			let position = Math.max(0, Math.min(1, (event.clientX - 15 - this.rect.left) / (this.rect.width - 30)))
				position = Math.round(position * this.steps) / this.steps
				this.setPosition(position)
			}
		}
		/*this.dvDisplay.onmouseout = */this.dvDisplay.onmouseleave = this.dvDisplay.onmouseup = (event) => {
			this.moving = false
		}
		this.update()
	},
	
	setMax(max) {
		this.max = max
		this.range = this.max - this.min
		this.update()
	},
	
	getValue() {
		return this.container[this.value]
	},
	
	setValue(value) {
		this.container[this.value] = value
		this.onSet && this.onSet()
		this.update()		
		return value
	},
	
	getPosition() {
		return (this.getValue() - this.min) / this.range
	},

	setPosition(position) {
		return this.setValue(position * this.range + this.min)
	},
	
	text(text, position = -1) {
		this.forceText = text
		if (position > -1) this.forcePosition = position
	},
	
	resetText() {
		delete this.forceText
		delete this.forcePosition
	},
	
	update() {
		this.dvRunner.innerText = this.forceText || displayNumber(this.getValue(), this.digits)
		let position = this.forcePosition === undefined?this.getPosition():this.forcePosition
		this.dvRunner.style.left = ((position * (this.dvLine.offsetWidth - this.dvRunner.offsetWidth)) | 0) + "px"
		this.onUpdate && this.onUpdate()
	},
	
	destroy() {
		this.dvDisplay.remove()
		delete this.dvDisplay
		delete this.container
	}
}

const GuiSlider = Template(guiSliderHandler)

const guiCheckboxHandler = {
	_init() {
		this.dvDisplay = createElement("div", "gui-checkbox " + (this.className || 0), this.parent)
		this.dvDisplay.title = this.hint || ""
		this.dvCheckbox = createElement("div", "checkbox", this.dvDisplay)
		this.dvLabel = createElement("div", "caption", this.dvDisplay, this.title)
		
		this.dvDisplay.onclick = (event) => {
			this.switch()
		}
		
		this.update()
	},
	
	update() {
		this.dvCheckbox.innerText = this.container[this.value] ^ this.reverse?"✓\uFE0E":""
		this.dvDisplay.classList.toggle("hidden", !(!this.visible || this.visible()) || !!(settings.masterHide == 2 && this.override && this.override()))
		this.dvDisplay.classList.toggle("faded", !!(settings.masterHide == 1 && this.override && this.override()))
	},
	
	switch() {
		this.set(!this.container[this.value])
	},
	
	set(x) {
		this.container[this.value] = x
		
		this.onSet && this.onSet(x)
		this.update()
	},

	updateVisibility() {
		this.dvDisplay.classList.toggle("hidden", !!(this.visible && !this.visible()) || !!(settings.masterHide == 2 && this.override && this.override()))
		this.dvDisplay.classList.toggle("faded", !!(settings.masterHide == 1 && this.override && this.override()))
	}
}

const GuiCheckbox = Template(guiCheckboxHandler)

function createGrowthSlider(container, value, parent) {
	return GuiSlider({
		parent : parent,
		container : container,
		leftText : "Exp",
		rightText : "Growth",
		value : value,
		max : 1,
		min : 0,
		steps : 20,
		digits : 2,
		className : "growth",
		sliderClass : "bg-"+value
	})
}

const attributePickerHandler = {
	_init() {
		this.dvDisplay = createElement("div", "gui-picker "+(this.className||"")+" " +this.value, this.parent || document.body)
		this.dvDisplay.title = this.hint || ""
		this.dvTitle = createElement("div", "name", this.dvDisplay, this.title)
		this.dvAttributes = createElement("div", "attributes", this.dvDisplay)
		this.attributes = POINT_TYPES.map((x,n) => {
			let attribute = {
				name : x,
				index : n
			}			
			attribute.dvDisplay = createElement("div", "attribute bg-"+x, this.dvAttributes)
			attribute.dvDisplay.onclick = (event) => {this.switch(n)}
			if (!this.valueNot)
				attribute.dvDisplay.ondblclick = (event) => {this.reset(), this.switch(n)}
			attribute.dvDisplay.title = x.capitalizeFirst()
			return attribute
		})
		this.update()
	},

	updateVisibility() {
		this.dvDisplay.classList.toggle("hidden", !(!this.visible || this.visible()) || !!(settings.masterHide == 2 && this.override && this.override()))
		this.dvDisplay.classList.toggle("faded", !!(settings.masterHide == 1 && this.override && this.override()))
		this.attributes.map((x, n) => x.dvDisplay.classList.toggle("hidden", this.attributeVisible && !this.attributeVisible(x.name, n)))
	},
}

const specialPickerHandler = {
	_init() {
		this.dvDisplay = createElement("div", "gui-picker "+(this.className||"")+" " +this.value, this.parent || document.body)
		this.dvDisplay.title = this.hint || ""
		this.dvTitle = createElement("div", "name", this.dvDisplay, this.title)
		this.dvAttributes = createElement("div", "attributes", this.dvDisplay)
		this.attributes = SPECIAL_NAMES.map((x,n) => {
			let attribute = {
				name : x,
				index : n
			}			
			attribute.dvDisplay = createElement("div", "special", this.dvAttributes)
			attribute.dvDisplay.style.backgroundImage = "url("+gui.images.specialBorders[n]+")"
			attribute.dvDisplay.onclick = (event) => {this.switch(n)}
			if (!this.valueNot)
				attribute.dvDisplay.ondblclick = (event) => {this.reset(), this.switch(n)}
			attribute.dvDisplay.title = x.capitalizeFirst()
			return attribute
		})
		this.update()
	},

	updateImages() {
		this.attributes.map((x,n) => x.dvDisplay.style.backgroundImage = "url("+gui.images.specialBorders[n]+")")
	},
	
	updateVisibility() {
		this.dvDisplay.classList.toggle("hidden", !(!this.visible || this.visible()) || !!(settings.masterHide == 2 && this.override && this.override()))
		this.dvDisplay.classList.toggle("faded", !!(settings.masterHide == 1 && this.override && this.override()))
		this.attributes.map((x, n) => x.dvDisplay.classList.toggle("hidden", this.attributeVisible && !this.attributeVisible(x.name, n)))
	},
}

const singlePickerHandler = {
	switch(n) {
		if (this.container[this.value] == n)
			this.reset()
		else
			this.set(n)
	},
	
	set(n) {
		this.container[this.value] = n
		this.onSet && this.onSet()
		this.update()
	},
	
	unset(n) {
		if (this.container[this.value] == n)
			this.unset(n)
	},
	
	reset() {
		this.set(0)
	},
	
	update() {
		this.attributes.map((x,n) => x.dvDisplay.innerText = (this.container[this.value] == n)?"✓\uFE0E":"")
		this.onUpdate && this.onUpdate()
	},
}

const multiPickerHandler = {
	_init() {
		this.dvAll = createElement("div", "all", this.dvDisplay, "All")
		this.dvAll.onclick = (event) => {
			const visibles = this.attributes.filter((x, n) => !this.attributeVisible || this.attributeVisible(x.name, n))
			if (this.container[this.value].length < visibles.length) {
				visibles.map(x => this.set(x.index))
			} else {
				this.reset()
			}
		}
	},
	
	switch(n) {
		if (this.container[this.value].includes(n) && !this.valueNot || this.valueNot && this.container[this.valueNot].includes(n))
			this.unset(n)
		else if (this.valueNot && this.container[this.value].includes(n))
			this.setNot(n)
		else
			this.set(n)
	},
	
	set(n) {
		const position = this.container[this.value].indexOf(n)
		if (position == -1) this.container[this.value].push(n)
		this.onSet && this.onSet()
		this.update()
	},
	
	setNot(n) {		
		if (!this.valueNot) {
			this.unset(n)
			return
		}
		const position = this.container[this.value].indexOf(n)
		if (position > -1) this.container[this.value].splice(position, 1)
		const positionNot = this.container[this.valueNot].indexOf(n)
		if (positionNot == -1) this.container[this.valueNot].push(n)
		this.onSet && this.onSet()
		this.update()
	},
	
	unset(n) {
		const position = this.container[this.value].indexOf(n)
		if (position > -1) this.container[this.value].splice(position, 1)
		if (this.valueNot) {
			const positionNot = this.container[this.valueNot].indexOf(n)
			if (positionNot > -1) this.container[this.valueNot].splice(positionNot, 1)
		}
		this.update()
	},
	
	reset() {
		this.container[this.value].length = 0
		this.update()
	},
	
	update() {
		this.attributes.map((x,n) => x.dvDisplay.innerText = (this.valueNot && this.container[this.valueNot].includes(n))?"X":this.container[this.value].includes(n)?"✓\uFE0E":"")
		this.onUpdate && this.onUpdate()
	},
}

const SingleAttributePicker = Template(attributePickerHandler, singlePickerHandler)
const MultiAttributePicker = Template(attributePickerHandler, multiPickerHandler)

const SingleSpecialPicker = Template(specialPickerHandler, singlePickerHandler)
const MultiSpecialPicker = Template(specialPickerHandler, multiPickerHandler)

const iconButtonHandler = {
	_init() {
		this.dvDisplay = createElement("div", "icon-button " + (this.className || ""), this.parent || document.body)
		this.dvDisplay.onclick = this.onclick
		this.dvDisplay.title = getString(this.desc)
		this.dvIcon = createElement("div", "icon", this.dvDisplay, getString(this.iconText))
		this.dvIcon.style.backgroundColor = getString(this.iconColor)
		this.dvText = createElement("div", "text", this.dvDisplay, getString(this.text))
	},
	
	update() {
		this.visible && this.dvDisplay.classList.toggle("hidden", !this.visible())
		this.owned && this.dvDisplay.classList.toggle("owned", !!this.owned())
		this.desc && typeof(this.desc) === 'function' && (this.dvDisplay.title = this.desc())
		this.iconText && typeof(this.iconText) === 'function' && (this.dvIcon.innerText = this.iconText())
		this.iconColor && typeof(this.iconColor) === 'function' && (this.dvIcon.style.backgroundColor = this.iconColor())
		this.text && typeof(this.text) === 'function' && (this.dvText.innerText = this.text())
	},
	
	updateAvailability (){
		this.available && this.dvDisplay.classList.toggle("available", !!this.available())
	}
}

const IconButton = Template(iconButtonHandler)

const tabGroupHandler = {
	_init() {
		this.dvTitles = createElement("div", "titles "+(this.className || this.name || ""), this.tabParent || this.parent || document.body)
		this.dvTabs = createElement("div", "tabs "+(this.className || this.name || ""), this.parent || document.body)
		this.tabs = {}
		this.activeTab = ""
	},
	
	addTab(name, title, baseClass, ...args) {
		let tab = {name, title}

		tab.dvRadio = createElement("input", "hidden", this.dvTitles)
		tab.dvRadio.type = "radio"
		tab.dvRadio.name = this.name
		tab.dvRadio.id = this.name + "-titles" + Object.keys(this.tabs).length

		tab.dvTitle = createElement("label", "title " + (this.titleClass || "") + " " + name, this.dvTitles, title)
		tab.dvTitle.htmlFor = tab.dvRadio.id
		tab.dvTitle.onclick = (event) => this.setTab(name)

		if (baseClass)
			tab = baseClass(tab, ...args, {
				parent : this.dvTabs,
				className : "tab hidden"
			})
		else
			tab.dvDisplay = createElement("div", "tab hidden " + (this.tabClass || "") + " " + name, this.dvTabs)
		
		this.tabs[name] = tab
		return tab
	},
	
	addFiller(name) {
		let tab = {name}
		tab.dvTitle = createElement("div", "filler " + (this.titleClass || "") + " " + name, this.dvTitles)				
	},
	
	setTab(name) {
		if (!this.tabs[name]) return
		Object.values(this.tabs).map(tab => {
			tab.dvDisplay && tab.dvDisplay.classList.toggle("hidden", tab.name != name)
			tab.dvTitle && tab.dvTitle.classList.toggle("active", tab.name == name)			
		})
		this.activeTab = name
		this.tabs[name].onSet && this.tabs[name].onSet()
	},
	
	setTitle(name, title) {
		if (!this.tabs[name]) return
		if (this.tabs[name].title == title) return
		this.tabs[name].dvTitle.innerText = this.tabs[name].title = title
	},
	
	toggleDisplay(name, value) {
		if (!this.tabs[name]) return
		this.tabs[name].dvTitle.classList.toggle("hidden", !value)
	},
}

const TabGroup = Template(tabGroupHandler)

const guiPointElementHandler = {
	_init() {
		this.dvDisplay = createElement("div", this.className, this.parent)
	},

	set(point, x, y) {
		if (this.point && this.point != point)
			this.reset()
		
		this.point = point
		
		this.dvDisplay.classList.toggle("hidden", !this.point)
		
		this.update && this.update()
		
		this.onSet && this.onSet(point, x, y)
		
		this.align && this.align(x, y)
	},

	reset(force) {
		if (!this.point && !force) return
		this.point = null
		this.dvDisplay.classList.toggle("hidden", true)
		
		this.onReset && this.onReset()
	},
	
	destroy() {
		this.dvDisplay.remove()
		delete this.dvDisplay
	}
}

const pointInfoDisplayHandler = {
	_init() {
		this.dvPoint = createElement("div", "point", this.dvDisplay)
		this.imBorder = createElement("img", "point-border", this.dvDisplay)
		this.dvInfo1 = createElement("div", "info", this.dvDisplay)
		this.dvInfo2 = createElement("div", "info progress", this.dvDisplay)
	},
	
	update() {
		if (!this.point) return
		if (!this.point.real) return
		
		this.imBorder.src = gui.images.specialBorders[this.point.locked?0:this.point.special || 0]
		
		let knownType = (this.point.index)?(this.point.locked == 1)?"unknown":POINT_TYPES[this.point.type]:"home"
		
		this.dvPoint.className = "point-type bg-" + knownType
		this.dvPoint.innerText = this.point.specialText
		if (this.point) {
			this.dvPoint.style.fontSize = ((this.point.special?400:500) / this.point.specialTextSize) + "px"
		}
		
		knownType = knownType.capitalizeFirst()
		
		this.dvDisplay.classList.toggle("locked", !!(this.point && this.point.locked))

		this.dvInfo1.innerText = this.point.index?(
									"Type: " + knownType + "\n" + 
									"Power: " + ((this.point.locked == 1)?"Unknown":displayNumber(this.point.power)) + "\n" +
									(this.point.owned && this.point.enchanted?"Enchanted: "+["None", "Gold", "Growth", "Mana", "Doom"][this.point.enchanted]:this.point.real.loss > 0 && settings.eta && !this.point.owned?"Rough ETA: " + shortTimeString(this.point.real.defence / this.point.real.loss):"")
								):!game.skills.mining?"The starting point":"Golden mine\n" +
									"Depth: " + displayNumber(this.point.mineDepth || 0) + "\n"
		if (this.point.index && this.point.away && this.point.locked != 1) {
			let width = this.dvInfo2.offsetWidth
			this.dvInfo2.style.backgroundPosition = "0 0, "+Math.round((width * ((this.point.progress || 0) - 1) / 2)) +"px 0"
			this.dvInfo2.innerText = "Barrier: " + displayNumber(this.point.real.defence) + "\n" +
									(game.skills.power || this.point.boss?this.point.real && this.point.real.passiveDamage?"Passive damage: "+displayNumber(this.point.real.passiveDamage)+"/s":"":"Barrier power: " + displayNumber(this.point.real.localPower)) + "\n" + 
									"Progress: " + (this.point.progress * 100 || 0).toFixed(3) + "%"
		} else if (this.point.locked == 1) {
			let width = this.dvInfo2.offsetWidth
			this.dvInfo2.style.backgroundPosition = "0 0, " + Math.round(-width/2) + "px 0"
			this.dvInfo2.innerText = this.point.keyData.keyPoint.away == 1 ? "Click to see the key point" : "Key point not found yet"
		} else {
			let width = this.dvInfo2.offsetWidth
			this.dvInfo2.style.backgroundPosition = "0 0, " + Math.round(width/2) + "px 0"
			this.dvInfo2.innerText = (this.point.index?(this.point.type?"Growth: " + displayNumber(this.point.totalBonus) + "\n":"") +
									(game.skills.upgradePoints?"Level: " + (this.point.level || 0) + "\n":""):"")										 
		}
	}				
}

const GuiPointElement = Template(guiPointElementHandler)
const PointInfoDisplay = Template(guiPointElementHandler, pointInfoDisplayHandler)

const listPickerHandler = {
	_init() {
		this.dvDisplay = createElement("div", "list-picker " + (this.className || "") , this.parent)
		this.dvName = createElement("div", "title", this.dvDisplay, this.name + ":")
		this.dvChoices = createElement("div", "choices", this.dvDisplay)
		if (!this.values) {
			if (!this.choices) return
			this.values = this.choices.map(x => x.value)
			this.texts = this.choices.map(x => x.text || x.value)
		}
		this.index = this.values.indexOf(this.container[this.value])
		this.buttons = this.values.map ((x,n) => {
			let button = {
				index : n,
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
		this.same = (this.container[this.value] == x)
		this.index = this.values.indexOf(x)
		this.container[this.value] = x
		this.onSet && this.onSet()
		if (this.same && this.onSame) this.onSame()
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			this.dvDisplay.classList.toggle("hidden", !(!this.visible || this.visible()))
			this.buttons.map(x => {
				x.dvDisplay.classList.toggle("active", x.value == this.container[this.value])
				x.dvDisplay.classList.toggle("hidden", !!(this.itemVisibility && !this.itemVisibility(x)))
			})
		}
		this.onUpdate && this.onUpdate(forced)
	}
}

const ListPicker = Template(listPickerHandler)

const colorPickerHandler = {
	_init() {
		this.dvHolder = createElement("div", "holder hidden", document.body)
		this.dvHolder.onclick = (event) => {
			if (event.target == this.dvHolder) {
				this.dvHolder.classList.toggle("hidden", true)
			}
		}

		this.dvDisplay = createElement("div", "color-picker", this.dvHolder)
		this.color = {
			red : 0,
			green : 0,
			blue : 0
		}
		this.red = GuiSlider({
			container : this.color,
			value : "red",
			parent : this.dvDisplay,
			leftText : "Red",
			max : 255,
			min : 0,
			steps : 255,
			digits : 0,
			onSet : () => {
				this.green.update()
				this.blue.update()
				const newColor = "rgb("+this.color.red+","+this.color.green+","+this.color.blue+")"
				this.updateColor(newColor)
			},
			onUpdate : () => {
				if (this.red)
					this.red.dvLine.style.background = "linear-gradient(to right, rgb(0,"+this.color.green+","+this.color.blue+"), rgb(255,"+this.color.green+","+this.color.blue+"))"
			},
			className : "color"
		})
		this.green = GuiSlider({
			container : this.color,
			value : "green",
			parent : this.dvDisplay,
			leftText : "Green",
			max : 255,
			min : 0,
			steps : 255,
			digits : 0,
			onSet : () => {
				this.green.update()
				this.blue.update()
				const newColor = "rgb("+this.color.red+","+this.color.green+","+this.color.blue+")"
				this.updateColor(newColor)
			},
			onUpdate : () => {
				if (this.green)
					this.green.dvLine.style.background = "linear-gradient(to right, rgb("+this.color.red+",0,"+this.color.blue+"), rgb("+this.color.red+",255,"+this.color.blue+"))"
			},
			className : "color"
		})
		this.blue = GuiSlider({
			container : this.color,
			value : "blue",
			parent : this.dvDisplay,
			leftText : "Blue",
			max : 255,
			min : 0,
			steps : 255,
			digits : 0,
			onSet : () => {
				this.green.update()
				this.red.update()
				const newColor = "rgb("+this.color.red+","+this.color.green+","+this.color.blue+")"
				this.updateColor(newColor)
			},
			onUpdate : () => {
				if (this.blue)
					this.blue.dvLine.style.background = "linear-gradient(to right, rgb("+this.color.red+","+this.color.green+",0), rgb("+this.color.red+","+this.color.green+",255))"
			},
			className : "color"
		})
		this.dvButtons = createElement("div", "buttons", this.dvDisplay)
		this.dvSet = createElement("div", "button", this.dvButtons, "OK")
		this.dvSet.onclick = (event) => {
			this.dvHolder.classList.toggle("hidden", true)
		}

		this.dvUndo = createElement("div", "button", this.dvButtons, "Cancel")
		this.dvUndo.onclick = (event) => {
			this.updateColor(this.oldColor)
			this.dvHolder.classList.toggle("hidden", true)
		}
	},
	
	display(container, value, x, y) {
		const input = colorToRGBA(container[value])
		this.container = container
		this.value = value
		this.oldColor = container[value]
		this.color.red = input[0]
		this.color.green = input[1]
		this.color.blue = input[2]
		this.dvHolder.classList.toggle("hidden",false)
		this.red.update()
		this.green.update()
		this.blue.update()
		this.updateColor(this.oldColor)
		this.dvDisplay.style.left = Math.min(gui.mainViewport.width - this.dvDisplay.offsetWidth - 5, x) + "px"
		this.dvDisplay.style.top = Math.min(gui.mainViewport.height - this.dvDisplay.offsetHeight - 5, y) + "px"
	},
	
	updateColor(newColor) {
		this.red.dvRunner.style.backgroundColor = this.green.dvRunner.style.backgroundColor = this.blue.dvRunner.style.backgroundColor = newColor
		const colorLevel = this.color.red * 299 + this.color.green * 587 + this.color.blue * 114
		this.red.dvRunner.style.color = this.green.dvRunner.style.color = this.blue.dvRunner.style.color = colorLevel > 128000?"black":"white"
		if (this.container.setColor)
			this.container.setColor(newColor)
		else
			this.container[this.value] = newColor
	}
}

const ColorPicker = Template(colorPickerHandler)

const presetMenuHandler = {
	_init() {
		this.prefix = this.prefix || "p_"
		this.dvHolder = createElement("div", "holder hidden", this.parent || document.body)
		this.dvHolder.onclick = (event) => {
			if (event.target == this.dvHolder) {
				this.dvHolder.classList.toggle("hidden", true)
			}
		}	
		this.dvDisplay = createElement("div", "presets", this.dvHolder)
		this.dvPresets = createElement("div", "presets-list", this.dvDisplay)
		this.dvButtons = createElement("div", "presets-buttons", this.dvDisplay)

		this.dvSave = createElement("div", "button", this.dvButtons, "Save")
		this.dvSave.onclick = (event) => {
			let name = this.activePreset
			if (name == this.newName) {
				name = prompt("Name a preset:", "Preset "+Object.keys(this.presets).length)
				if (!name) return
				name = this.prefix + name
			}
			this.save(name)
			this.activePreset = name
			this.update()
		}

		this.dvLoad = createElement("div", "button", this.dvButtons, "Load")
		this.dvLoad.onclick = (event) => {
			if (this.presets[this.activePreset]) {
				this.load(this.activePreset)
				this.update()
			}
		}

		this.dvDelete = createElement("div", "button", this.dvButtons, "Delete")
		this.dvDelete.onclick = (event) => {
			if (this.presets[this.activePreset] && confirm("Really delete?")) {
				delete this.presets[this.activePreset]
				this.activePreset = this.newName
				this.update()
			}
		}

		if (this.reset) {
			this.dvReset = createElement("div", "button", this.dvButtons, "Reset")
			this.dvReset.onclick = (event) => {
				if (confirm("Really reset?"))
					this.reset()
			}
		}
		this.activePreset = this.newName = this.prefix + "-- New --"
	},
	
	show(x, y) {
		this.dvHolder.classList.toggle("hidden", false)
		this.dvDisplay.style.left = x + "px"
		this.dvDisplay.style.top = y + "px"
		this.update(true)
	},
	
	update(forced) {
		while (this.dvPresets.firstChild) {
			this.dvPresets.firstChild.remove()
		}			
		this.presetItems = [this.newName, ...Object.keys(this.presets).sort()].map(x => {
			const display = createElement("div", "presets-item "+(x == this.activePreset?"active":""), this.dvPresets, x.slice(this.prefix.length))
			display.onclick = (event) => {
				this.activePreset = x
				this.presetItems.map(y => y.classList.toggle("active", y == display))
			}
			return display
		})
	}
}

const PresetMenu = Template(presetMenuHandler)