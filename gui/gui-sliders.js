'use strict'

const SlidersTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "sliders "+(this.className || ""), this.parent)
		
		this.master = MasterSlider({
			parent : this.dvDisplay
		})

		this.dvSliders = createElement("div", "sliders", this.dvDisplay)
		this.dvReal = createElement("div", "sliders-real", this.dvSliders)
		this.dvClones = createElement("div", "sliders-clones", this.dvSliders)
		this.hover = PointInfoDisplay({
			parent : this.dvDisplay,
			className : "point-info hidden",
			align(x, y) {
				if (x == -1) return
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				x = ((x + width + 5< viewport.width) ? (x + 5) : (x - 5 - width))
				y = y - height / 2
				x = Math.max(1, Math.min(viewport.width - width - 1, x))
				y = Math.max(1, Math.min(viewport.height - height - 1, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y+"px"
			},
			
		})
		this.hover.dvDisplay.style.position = "absolute"
	},
	
	onSet() {
		this.dvDisplay.insertBefore(gui.dvHeader, this.dvDisplay.firstChild)
		game.sliders.map(slider => {
			//this.dvSliders.appendChild(slider.dvDisplay)
			if (slider.clone)
				this.dvClones.appendChild(slider.dvDisplay)
			else
				this.dvReal.appendChild(slider.dvDisplay)
			slider.displayStats.map(y => {
				y.expSlider.update()
			})
			slider.equipList.update()
		})
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			game.sliders.map(slider => {
				slider.updateFullVisibility()
			})
			this.master.update()
		}
		game.sliders.map(slider => {
			slider.updateFullInfo()
		})
		this.hover.update()
	}
})

const masterSliderHandler = {
	_init() {
		this.dvDisplay = createElement("div", "master", this.parent)

		this.dvGild = createElement("div", "master-pair", this.dvDisplay)
		this.cbMasterGild = GuiCheckbox({
			parent : this.dvGild,
			container : masterSlider,
			value : "masterGild",
			onSet : () => {
				gui.sliders.update(true)
			},
			title : "Master gilding touch control"
		})

		this.cbGild = GuiCheckbox({
			parent : this.dvGild,
			container : masterSlider,
			value : "gild",
			onSet() {
				gui.sliders.update(true)
			},
			title : "Gilding touch",
			override : () => !masterSlider.masterGild
		})
		
		this.dvImbuement = createElement("div", "master-pair", this.dvDisplay)
		this.cbMasterImbuement = GuiCheckbox({
			parent : this.dvImbuement,
			container : masterSlider,
			value : "masterImbuement",
			onSet : () => {
				gui.sliders.update(true)
			},
			title : "Master imbuement control"
		})

		this.imbuements = SingleAttributePicker({
			parent : this.dvImbuement,
			container : masterSlider,
			value : "imbuement",
			title : "",
			hint : "Consumes mana to add current power to chosen element",
			attributeVisible(x, n) {
				if (n && n < 3) return false
				return (!n || game.growth[x])
			},
			onSet : () => {
				gui.sliders.update(true)
			},
			override : () => !(masterSlider.masterImbuement),
		})
		
		this.safeImbuementsSwitch = GuiCheckbox({
			parent : this.imbuements.dvDisplay,
			container : masterSlider,
			value: "safeImbuement",
			title: "Safe",
			hint : "Disable imbuement if less than 10 seconds available"
		})
		
		this.dvChannels = createElement("div", "master-pair", this.dvDisplay)
		this.cbMasterChannels = GuiCheckbox({
			parent : this.dvChannels,
			container : masterSlider,
			value : "masterChannel",
			onSet : () => {
				gui.sliders.update(true)
			},
			title : "Master channel control"
		})

		this.channels = MultiAttributePicker({
			parent : this.dvChannels,
			container : masterSlider,
			value : "channel",
			title : "",
			hint : "Halts chosen attributes' growth to give bonus equal to current value to other sliders",
			attributeVisible(x, n) {
				return (n && game.growth[x])
			},
			override : () => !(masterSlider.masterChannel),
			onUpdate : () => {
				game.sliders.map(x => {
					x.updateSliders()
				})
			},
		})
		
/*		this.dvAutotarget = createElement("div", "master-autotarget", this.dvDisplay)
		this.cbMasterAutotarget = GuiCheckbox({
			parent : this.dvAutotarget,
			container : masterSlider,
			value : "masterAutotarget",
			onSet : () => {
				gui.sliders.update(true)
			},
			title : "Master autotarget control"
		})*/
		
		this.dvAutotargetAll = createElement("div", "master-apply apply button", this.dvDisplay, "Autotarget all")
		this.dvAutotargetAll.onclick = (event) => {
			game.sliders.map(x => {
				if (x.clone != 2)
					x.dvATApply.click()
			})
		}

	},
	
	update() {
		this.dvDisplay.classList.toggle("hidden", !game.skills.masterSlider)
		if (game.skills.masterSlider) {
			this.dvGild.classList.toggle("hidden", !game.skills.gild)
			this.dvImbuement.classList.toggle("hidden", !game.skills.imbuement)
			this.dvChannels.classList.toggle("hidden", !game.skills.channel)
//			this.dvAutotarget.classList.toggle("hidden", !game.skills.autoTarget)
			this.dvAutotargetAll.classList.toggle("hidden", !game.skills.autoTarget)

			this.cbMasterGild.update()
			this.cbMasterImbuement.update()
			this.cbMasterChannels.update()
//			this.cbMasterAutotarget.update()
			this.cbGild.update()
			this.safeImbuementsSwitch.update()
			this.imbuements.update()
			this.channels.update()
			this.imbuements.updateVisibility()
			this.channels.updateVisibility()
		}
	},
}

const MasterSlider = Template(masterSliderHandler)