'use strict'

const guiSliderHandler = {
	_init() {
		this.range = this.max - this.min
		this.dvDisplay = createElement("div", "gui-slider "+(this.className||"")+" " +this.value, this.parent || document.body)
		this.dvLeft = createElement("div", "gui-slider-left", this.dvDisplay, this.leftText)
		this.dvLine = createElement("div", "gui-slider-line "+(this.sliderClass || ""), this.dvDisplay)
		this.dvRunner = createElement("div", "gui-slider-runner "+(this.sliderClass || ""), this.dvLine, this.getValue())
		this.dvRight = createElement("div", "gui-slider-right", this.dvDisplay, this.rightText)
		this.dvDisplay.onmousedown = (event) => {
			this.moving = true
			let position = Math.max(0, Math.min(1, (event.clientX - 15 - this.dvLine.offsetLeft) / (this.dvLine.offsetWidth - 30)))
			position = Math.round(position * this.steps) / this.steps
			this.setPosition(position)
		}
		this.dvDisplay.onmousemove = (event) => {
			if (this.moving) {
				let position = Math.max(0, Math.min(1, (event.clientX - 15 - this.dvLine.offsetLeft) / (this.dvLine.offsetWidth - 30)))
				position = Math.round(position * this.steps) / this.steps
				this.setPosition(position)
			}
		}
		/*this.dvDisplay.onmouseout = */this.dvDisplay.onmouseleave = this.dvDisplay.onmouseup = (event) => {
			this.moving = false
		}
		this.update()
	},
	
	getValue() {
		return this.container[this.value]
	},
	
	setValue(value) {
		this.container[this.value] = value
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
		this.dvRunner.innerText = this.forceText || displayNumber(this.getValue(),2)
		let position = this.forcePosition === undefined?this.getPosition():this.forcePosition
		this.dvRunner.style.left = ((position * (this.dvLine.offsetWidth - this.dvRunner.offsetWidth)) | 0) + "px"
	},
	
	destroy() {
		this.dvDisplay.remove()
		delete this.dvDisplay
		delete this.container
	}
}

const GuiSlider = Template(guiSliderHandler)

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
			attribute.dvDisplay.ondblclick = (event) => {this.reset(), this.switch(n)}
			attribute.dvDisplay.title = x.capitalizeFirst()
			return attribute
		})
		this.update()
	},

	updateVisibility() {
		this.dvDisplay.classList.toggle("hidden", (this.visible && !this.visible())?1:0)
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
	switch(n) {
		if (this.container[this.value].includes(n))
			this.unset(n)
		else
			this.set(n)
	},
	
	set(n) {
		const position = this.container[this.value].indexOf(n)
		if (position == -1) this.container[this.value].push(n)
		this.update()
	},
	
	unset(n) {
		const position = this.container[this.value].indexOf(n)
		if (position > -1) this.container[this.value].splice(position, 1)
		this.update()
	},
	
	reset() {
		this.container[this.value].length = 0
		this.update()
	},
	
	update() {
		this.attributes.map((x,n) => x.dvDisplay.innerText = this.container[this.value].includes(n)?"✓\uFE0E":"")
		this.onUpdate && this.onUpdate()
	},
}

const SingleAttributePicker = Template(attributePickerHandler, singlePickerHandler)
const MultiAttributePicker = Template(attributePickerHandler, multiPickerHandler)

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
	}
}

const pointInfoDisplayHandler = {
	_init() {
		this.dvPoint = createElement("div", "point", this.dvDisplay)
		this.dvInfo1 = createElement("div", "info", this.dvDisplay)
		this.dvInfo2 = createElement("div", "info progress", this.dvDisplay)
	},
	
	update() {
		if (!this.point) return
		
		let knownType = (this.point.index)?(this.point.locked == 1)?"unknown":POINT_TYPES[this.point.type]:"home"
		
		this.dvPoint.className = "point-type bg-" + knownType
		this.dvPoint.innerText = this.point.specialText
		
		knownType = knownType.capitalizeFirst()
		this.dvInfo1.innerText = this.point.index?(
									"Type: " + knownType + "\n" + 
									"Power: " + ((this.point.locked == 1)?"unknown":displayNumber(this.point.power)) + "\n" +
									"Distance: " + (this.point.length || 0).toFixed(3)
								):!game.skills.mining?"The starting point":"Golden mine\n" +
									"Depth: " + displayNumber(this.point.mineDepth || 0) + "\n"
		if (this.point.index && this.point.away && this.point.locked != 1) {
			let width = this.dvInfo2.offsetWidth
			this.dvInfo2.style.backgroundPosition = "0 0, "+Math.round((width * ((this.point.progress || 0) - 1) / 2)) +"px 0"
			this.dvInfo2.innerText = "Remaining defence: " + displayNumber(this.point.real.defence) + "\n" +
									"Local power: " + displayNumber(this.point.real.localPower) + "\n" + 
									"Progress: " + (this.point.progress * 100 || 0).toFixed(3) + "%"
		} else if (this.point.locked == 1) {
			let width = this.dvInfo2.offsetWidth
			this.dvInfo2.style.backgroundPosition = "0 0, " + Math.round(-width/2) + "px 0"
			this.dvInfo2.innerText = this.point.keyData.keyPoint.away == 1 ? "Click to see the key point" : "Key point not found yet"
		} else {
			let width = this.dvInfo2.offsetWidth
			this.dvInfo2.style.backgroundPosition = "0 0, " + Math.round(width/2) + "px 0"
			this.dvInfo2.innerText = (this.point.index?(this.point.type?"Growth: " + displayNumber(this.point.bonus) + "\n":"") +
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
		if (forced)
			this.buttons.map(x => x.dvDisplay.classList.toggle("active", x.value == this.container[this.value]))
		this.onUpdate && this.onUpdate(forced)
	}
}

const ListPicker = Template(listPickerHandler)