'use strict'

const ArtifactsTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "artifacts "+(this.className || ""), this.parent)		
		this.dvArtifacts = createElement("div", "artifacts", this.dvDisplay)		
		this.dvTabletHolder = createElement("div", "tablet-holder hidden", this.dvDisplay)
		this.dvTabletHolder.onclick = (event) => {
			if (event.target == this.dvTabletHolder) {
				this.dvTabletHolder.classList.toggle("hidden", true)
				this.displayedTablet = ""
			}
		}
		this.dvTablet = createElement("div", "tablet", this.dvTabletHolder)
		this.dvTabletTitle = createElement("div", "tablet-title", this.dvTablet)
		this.dvTabletGlyphs = createElement("div", "tablet-glyphs", this.dvTablet)
		this.dvTabletControls = createElement("div", "tablet-controls", this.dvTablet)
/*		this.smart = true
		this.cbTabletSmart = GuiCheckbox({
			parent : this.dvTabletControls,
			container : this,
			value : "smart",
			visible : () => game.skills.smartTablet,
			title : "Smart",
			className : "tablet-checkbox"
		})*/
		this.dvTabletInput = createElement("input", "tablet-input", this.dvTabletControls)
		this.dvTabletInput.oninput = (event) => {
				this.updateTabletPairs()
		}
		this.dvTabletAttempt = createElement("div", "button", this.dvTabletControls, "Try code")
		this.dvTabletAttempt.onclick = (event) => {
			const result = this.dvTabletInput.value && game.research[this.displayedTablet].finalize(this.dvTabletInput.value)
			if (result) {
				this.dvTabletHolder.classList.toggle("hidden", true)
				this.displayedTablet = ""
				this.update(true)
			} else {
				this.dvTabletInput.animate({
					backgroundColor: ["var(--tablet-absent)", "var(--background)"]
				}, 200)
			}
		}
		this.dvTabletInput.onkeypress = (event) => {
			if (event.keyCode == 13) {
				this.dvTabletAttempt.click()
			}
		}
		this.dvTabletClose = createElement("div", "button", this.dvTabletControls, "Close")
		this.dvTabletClose.onclick = (event) => {
			this.dvTabletHolder.classList.toggle("hidden", true)
			this.displayedTablet = ""
		}
		this.glyphLines = {}
		letters.map(x => this.glyphLines[x] = createElement("div", "tablet-row", this.dvTabletGlyphs))
		this.glyphs = {}
		letterPairs.map(x => {
			this.glyphs[x] = createElement("div", "tablet-cell", this.glyphLines[x[0]], x)
			this.glyphs[x].onclick = (event) => {
				if (!game.research[this.displayedTablet].tablet[x]) return
				if (!game.skills.smartTablet) return
				const input = this.dvTabletInput.value.toUpperCase()
				const pos = input.indexOf(x)
				if (!input)
					this.dvTabletInput.value += x
				else if (pos > -1) {
					if (pos)
						this.dvTabletInput.value = this.dvTabletInput.value.slice(0,pos + 1)
					else
						this.dvTabletInput.value = ""
				} else if (input.slice(-1) == x[0])
					this.dvTabletInput.value += x[1]
				else return
				this.animateGlyph(x, 0)
//				if (game.skills.smartTablet && this.smart)
					this.advanceTablet()
				this.updateTabletPairs()
			}
		})
		this.artifacts = Object.values(ARTIFACTS).map(artifact => {
			const display = {artifact, id : artifact.id}
			artifact.display = display
			display.dvDisplay = createElement("div", "artifact", this.dvArtifacts)
			display.dvHeader = createElement("div", "artifact-header", display.dvDisplay)
			display.dvIconHolder = createElement("div", "artifact-icon-holder", display.dvHeader)
			display.dvIcon = createElement("div", "artifact-icon", display.dvIconHolder, artifact.iconText)
			display.dvIcon.style.color = artifact.iconTextColor
			display.dvTitle = createElement("div", "artifact-title", display.dvHeader, "???")
			display.dvEffect = createElement("div", "artifact-effect", display.dvDisplay, "Effect: ???")
			display.dvResearchHolder = createElement("div", "artifact-research", display.dvDisplay)
			display.dvResearchCost = createElement("div", "artifact-info", display.dvResearchHolder, "Research cost: "+displayNumber(artifact.codeCost)+" science per glyph")
//			display.dvResearchProgress = createElement("div", "artifact-info", display.dvResearchHolder, "Current glyph progress: 0%")
			display.dvLength = createElement("div", "artifact-info", display.dvResearchHolder, "Code length: "+artifact.codeLength+" symbols")
			display.researched = false
			display.cbResearched = GuiCheckbox({
				parent : display.dvResearchHolder,
				container : display,
				value : "researched",
				title : "Research this",
				className : "artifact-this",
				onSet : () => {
					game.researching = (game.researching == artifact.id)?"":artifact.id
					this.artifacts.map(x => {
						x.researched = (game.researching == x.id)
						x.cbResearched.update(true)
					})
				},
				visible : () => game.research && game.research[artifact.id] && Object.keys(game.research[artifact.id].tablet).length < letterPairs.length
			})
			
			display.dvProgressInfo = createElement("div", "button artifact-progress", display.dvResearchHolder)
			display.dvProgressInfo.onclick = (event) => {
				this.dvTabletInput.value = ""
				this.updateTablet(artifact.id, 1)
				this.dvTabletHolder.classList.toggle("hidden", false)
				this.dvTabletInput.focus()
			}

			display.dvDepth = createElement("div", "artifact-info", display.dvDisplay, "Found at depth: "+displayNumber(artifact.depth))
			return display
		})
		
		this.dvEquipMenuHolder = createElement("div", "equip-holder hidden", document.body)
		this.dvEquipMenuHolder.onclick = (event) => {
			if (event.target == this.dvEquipMenuHolder) {
				this.dvEquipMenuHolder.classList.toggle("hidden", true)
				delete this.equipSlider
				delete this.equipSlot
			}
		}
		this.dvEquipMenu = createElement("div", "equip-menu", this.dvEquipMenuHolder)
		this.dvUnequip = createElement("div", "equip-item", this.dvEquipMenu, "- Nothing -")
		this.dvUnequip.onclick = (event) => {
			if (!this.equipSlider) return
			this.equipSlider.unequipSlot(this.equipSlot)
			this.dvEquipMenuHolder.classList.toggle("hidden", true)
			game.sliders.map(x => x.equipList.update())
			delete this.equipSlider
			delete this.equipSlot
		}
		this.equipMenu = Object.values(ARTIFACTS).map(artifact => {
			const menuItem = {artifact, id : artifact.id}
			artifact.menuItem = menuItem
			menuItem.dvDisplay = createElement("div", "equip-item", this.dvEquipMenu)
			menuItem.dvDisplay.title = artifact.desc || ""
			menuItem.dvIcon = createElement("div", "equip-icon", menuItem.dvDisplay, artifact.iconText)
			menuItem.dvIcon.style.color = artifact.iconTextColor
			menuItem.dvTitle = createElement("div", "equip-title", menuItem.dvDisplay, artifact.name)
			
			menuItem.dvDisplay.onclick = (event) => {
				if (!this.equipSlider) return
				this.equipSlider.equip(artifact.id, this.equipSlot)
				this.dvEquipMenuHolder.classList.toggle("hidden", true)
				game.sliders.map(x => x.equipList.update())
				delete this.equipSlider
				delete this.equipSlot
			}
			return menuItem
		})
	},
	
	onSet() {
		this.update(true)
	},
	
	updateTablet(name, forced) {
		const artifact = ARTIFACTS[name]
		if (!artifact) return
		
		const research = game.research[name]
		if (!research) return
		artifact.display.dvProgressInfo.innerText = research.done?"Researched":("Glyphs: "+research.goodGlyphs+" ("+Object.keys(research.tablet).length+"/"+letterPairs.length +")"+ (research.progress?" (Next: "+displayNumber(100*(research.progress || 0)/artifact.codeCost, 1) + "%)":""))

		if (research.done) return
		
		if (name != this.displayedTablet) {
			if (forced) {
				this.displayedTablet = name
				this.dvTabletTitle.innerText = "Tablet (Code length: "+artifact.codeLength+" symbols)"
			} else
				return
		}
		
//		this.cbTabletSmart.update()
		this.updateTabletPairs()
	},
	
	advanceTablet() {
		const research = game.research[this.displayedTablet]
		if (!research) return
		let input = this.dvTabletInput.value.toUpperCase()
		if (!input) return
		const pairs = Object.keys(research.tablet).filter(x => research.tablet[x] && input.indexOf(x) == -1)
		let currentPairs = pairs.filter(x => input.indexOf(x) == -1 && input.slice(-1) == x[0])
		let step = 0
		while (currentPairs.length == 1) {
			input += currentPairs[0][1]
			step++
			this.animateGlyph(currentPairs[0], step * 200)
			currentPairs = pairs.filter(x => input.indexOf(x) == -1 && input.slice(-1) == x[0])
		}	
		this.dvTabletInput.value = input
	},
	
	animateGlyph(name, delay) {
		setTimeout(() => {
			this.glyphs[name].animate({
				transform : ["scale(1, 1)","scale(0.7, 0.7)","scale(1, 1)"],
				backgroundColor : ["var(--background)", "var(--foreground)", "var(--background)"]
			}, 1000)
		}, delay)
	},
	
	updateTabletPairs() {
		const input = this.dvTabletInput.value.toUpperCase()
		const research = game.research[this.displayedTablet]
		letterPairs.map(x => {
			this.glyphs[x].classList.toggle("present", research.tablet[x] === true)
			this.glyphs[x].classList.toggle("absent", research.tablet[x] === false)
			this.glyphs[x].classList.toggle("used", !!(game.skills.smartTablet && research.tablet[x] === true && input.indexOf(x) > -1))
			this.glyphs[x].classList.toggle("possible", !!(game.skills.smartTablet && research.tablet[x] === true && input.indexOf(x) == -1 && !!(!input || input.slice(-1) == x[0])))
		})
	},
	
	update(forced) {
		if (forced) {
			if (this.displayedTablet && game.research[this.displayedTablet] && game.research[this.displayedTablet].done) {
				this.dvTabletHolder.classList.toggle("hidden", true)
				this.displayedTablet = ""
			}
			this.artifacts.map(display => {
				display.dvDisplay.classList.toggle("hidden",!!(!game || !game.map || !game.map.points || !game.map.points[0] || !game.map.points[0].mineDepth || game.map.points[0].mineDepth < display.artifact.depth))
				const research = game.research[display.id]
				display.dvDisplay.classList.toggle("researched", !!research.done)
//				display.dvDisplay.classList.toggle("researching", game.researching === display.id)
				display.dvTitle.innerText = research.done?display.artifact.name:"???"

				display.dvEffect.classList.toggle("hidden", !research.done)
				display.dvEffect.innerText = "Effect: "+(research.done?display.artifact.desc:"???")
				display.dvResearchHolder.classList.toggle("hidden", !!research.done)
				display.researched = (game.researching == display.id)
				display.cbResearched.update()
				display.cbResearched.dvLabel.innerText = "Research this (" + shortTimeString(((letterPairs.length - Object.keys(research.tablet).length) * display.artifact.codeCost - (research.progress || 0))/game.real.production.science) + ")"
				display.dvProgressInfo.innerText = research.done?"Researched":("Glyphs: "+research.goodGlyphs+" ("+Object.keys(research.tablet).length+"/"+letterPairs.length +")"+ (research.progress?" (Next: "+displayNumber(100*(research.progress || 0)/display.artifact.codeCost,1) + "%)":""))
				this.updateTablet(display.id)
			})
		}
		if (game.researching && game.research[game.researching]) {
			const research = game.research[game.researching]
			const artifact = ARTIFACTS[game.researching]
			artifact.display.cbResearched.dvLabel.innerText = "Research this (" + shortTimeString(((letterPairs.length - Object.keys(research.tablet).length) * artifact.codeCost - (research.progress || 0))/game.real.production.science) + ")"
			artifact.display.dvProgressInfo.innerText = research.done?"Researched":("Glyphs: "+research.goodGlyphs+" ("+Object.keys(research.tablet).length+"/"+letterPairs.length +")"+ (research.progress?" (Next: "+displayNumber(100*(research.progress || 0)/artifact.codeCost,1) + "%)":""))
		}
	},
	
	showEquipMenu(slider, slot, x, y) {
		this.equipSlider = slider
		this.equipSlot = slot
		this.dvEquipMenuHolder.classList.toggle("hidden", false)
		this.dvEquipMenu.style.left = Math.min(gui.mainViewport.width - this.dvEquipMenu.offsetWidth - 5, x) + "px"
		this.dvEquipMenu.style.top = Math.min(gui.mainViewport.height - this.dvEquipMenu.offsetHeight - 5, y) + "px"
		Object.values(ARTIFACTS).map(artifact => {
			const research = game.research[artifact.id]
			artifact.menuItem.dvDisplay.classList.toggle("hidden", !research.done)
			artifact.menuItem.dvTitle.innerText = artifact.name + (artifact.equipped == slider?" (T)":artifact.equipped?" (E)":"")
		})
	},
	
	updateTitle() {
		if (!game || !game.map || !game.map.points || !game.map.points[0]) return
		if (game.map.points[0].mineDepth)
			Object.values(ARTIFACTS).filter(x => x.depth < game.map.points[0].mineDepth).map(x => game.unlockStory("digged_"+x.id))
		const toResearch = Object.values(ARTIFACTS).filter(x => x.depth < game.map.points[0].mineDepth && !game.research[x.id].done).length
		gui.tabs.setTitle("artifacts", "Artifacts" + (toResearch?" ("+toResearch+")":""))
	}
})

const equipListHandler = {
	_init() {
		this.dvDisplay = createElement("div", "equipment", this.parent || document.body)
		this.slots = Array(7).fill(0).map((x,n) => {
			const slot = {index : n+1}
			slot.dvDisplay = createElement("div", "equipment-slot", this.dvDisplay)
			slot.dvIcon = createElement("div", "equipment-icon", slot.dvDisplay)
			slot.dvDisplay.onclick = (event) => {
				gui.artifacts.showEquipMenu(this.slider, slot.index, event.clientX, event.clientY)
			}
			return slot
		})
	},
	
	update() {
		this.dvDisplay.classList.toggle("hidden", !(!this.visible || this.visible()))
		this.slots.map(slot => {
			slot.dvDisplay.classList.toggle("hidden", slot.index > this.slider.artifactSlots)
			if (!slot.artifact || this.slider.artifacts[slot.artifact] != slot.index) {
				slot.dvIcon.innerText = ""
				slot.dvDisplay.title = "Empty slot - click to equip an artifact"
			}
		})
		Object.entries(this.slider.artifacts).map(x => {
			const slot = this.slots[x[1]-1]
			const artifact = ARTIFACTS[x[0]]
			if (!slot || !artifact) return
			slot.dvIcon.innerText = artifact.iconText
			slot.dvIcon.style.color = artifact.iconTextColor
			slot.dvIcon.classList.toggle("active", !!(!artifact.active || artifact.active()))
			slot.dvDisplay.title = artifact.name + " - " + artifact.desc
		})
	},

	updateActive() {
		Object.entries(this.slider.artifacts).map(x => {
			const slot = this.slots[x[1]-1]
			const artifact = ARTIFACTS[x[0]]
			if (!slot || !artifact) return
			slot.dvIcon.classList.toggle("active", !!(!artifact.active || artifact.active()))
		})
	},
	
	updateVisibility() {
		this.dvDisplay.classList.toggle("hidden", !(!this.visible || this.visible()))
	},
	
}

const EquipList = Template(equipListHandler)