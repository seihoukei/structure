'use strict'

const StardustTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "stardust "+(this.className || ""), this.parent)
		this.dvSubdisplay = createElement("div", "stardusts ", this.dvDisplay)
		this.dvSliders = createElement("div", "stardust-growth", this.dvSubdisplay)
		this.dvGrowthTitle = createElement("div", "stardust-title", this.dvSliders, "Growth boost")
		this.sliders = POINT_TYPES.slice(3).map(x => {
			return GuiSlider({
				parent : this.dvSliders,
				container : game.stardust,
				value : x,
				leftText : x.capitalizeFirst(),
				rightText : game.resources.stardust,
				max : game.resources.stardust,
				min : 0,
				shortStep : 1,
				digits : 0,
				steps : game.resources.stardust,
				className : "stardust",
				sliderClass : "bg-"+x,
				onSet : () => {
					game.stardust[x] = Math.round(game.stardust[x])
					const otherTotal = POINT_TYPES.slice(1).reduce((v, y) => y != x?v + game.stardust[y]:v, 0)
					let otherDust = game.resources.stardust - game.stardust[x]
					const scale = otherDust / otherTotal
					if (scale < 1) {
						POINT_TYPES.slice(3).map(y => {
							if (y != x) {
								game.stardust[y] *= scale
								game.stardust[y] |= 0
								otherDust -= game.stardust[y]
							}
						})
						if (otherDust > 0) {
							POINT_TYPES.slice(3).map(y => {
								if (y != x && otherDust) {
									otherDust--
									game.stardust[y]++
								}
							})						
						}
						this.sliders.map(y => y.update())
					}
					const freeDust = game.resources.stardust - Object.values(game.stardust).reduce((v,x) => v+x, 0)
					this.dvGrowthTitle.innerText = "Growth boost (Stardust: " + (game.resources.stardust - freeDust) + "/" + game.resources.stardust + ")"
					gui.tabs.setTitle("stardust", (game.skills.virtualMaps?"Maps / ":"") + (freeDust?"Stardust ("+displayNumber(freeDust, 0)+")":"Stardust"))
				}
			})
		})
		this.dvEqual = createElement("div", "equal button", this.dvSliders, "Distribute equally")
		this.dvEqual.onclick = (event) => {
			let number = POINT_TYPES.slice(3).reduce((v,x) => v + (game.growth[x]?1:0), 0)
			let whole = game.resources.stardust / number | 0
			let fract = game.resources.stardust % number
			POINT_TYPES.slice(3).map(x => {
				if (game.growth[x]) {
					game.stardust[x] = whole + (fract?1:0)
					fract = fract?fract-1:0
				}
			})
			this.sliders.map(y => y.update())
			this.dvGrowthTitle.innerText = "Growth boost (Stardust: " + game.resources.stardust + "/" + game.resources.stardust + ")"
			gui.tabs.setTitle("stardust", (game.skills.virtualMaps?"Maps / ":"") + ("Stardust"))
		}
		
		this.dvVirtual = createElement("div", "virtual", this.dvSubdisplay)
		this.dvVirtualTitle = createElement("div", "virtual-title", this.dvVirtual, "Virtual maps")
		this.dvVirtualHint = createElement("div", "virtual-hint", this.dvVirtual, ``)
		this.dvVirtualCreate = createElement("div", "virtual-create", this.dvVirtual)
		
		this.newMapLevel = 20
		this.newMapFocus = 0
		
		this.dvVirtualCreateTitle = createElement("div", "virtual-create-title", this.dvVirtualCreate, "Virtual map level:")
		
		this.newMapLevelSlider = GuiSlider({
			parent : this.dvVirtualCreate,
			container : this,
			value : "newMapLevel",
			min : 0,
			max : 20,
			steps : 20,
			shortStep : 1,
			digits : 0,
			onSet : () => {
				this.dvVirtualCreateCost.innerText = "Cost: " + virtualMapCost(this.newMapLevel) + " stardust"
			}
		})
		
		this.dvFocusSelector = createElement("div", "selectors", this.dvVirtualCreate)
		
		this.selector = ListPicker({
			parent : this.dvFocusSelector,
			container : this,
			className : "selector",
			value : "newMapFocus",
			name : "Focus",
			values : Object.keys(POINT_TYPES),
			texts : POINT_TYPES.map(x => x.capitalizeFirst()),
			expanded : false,
			onSet : () => {
				this.selector.expanded = !this.selector.expanded && this.selector.same
				if (this.selector.expanded) {
					this.selector.buttons.map((x,n) => {
						if (n != this.selector.index)
							x.dvDisplay.style.top = -25 * (this.selector.index - n) + "px"
                        x.dvDisplay.style.height = "15px"
//						x.dvDisplay.classList.toggle("bg-"+POINT_TYPES[n], true)
					})
				} else {
					this.selector.buttons.map((x,n) => {
						x.dvDisplay.style.height = (this.selector.index == n)?"15px":0
						x.dvDisplay.style.top = 0
					})
				}
			},
		})
		
		this.dvFocusSelector.onmouseleave = /*this.dvATSelector.onmouseout = */(event) => {
			if (!this.selector.expanded) return
			this.selector.buttons.map((x,n) => {
				x.dvDisplay.style.height = (this.selector.index == n)?"15px":0
				x.dvDisplay.style.top = 0
			})
			this.selector.expanded = false
		}

		this.dvVirtualCreateCost = createElement("div", "virtual-create-cost", this.dvVirtualCreate, "Cost:")
		this.dvVirtualCreateButton = createElement("div", "button", this.dvVirtualCreate, "Create")
		
		this.dvVirtualCreateButton.onclick = (event) => {
			const name = Array(Math.min(5, game.realMap.level - 20)).fill().map((x,n) => "virtual"+n).filter(x => !game.maps[x])[0]
			if (!name) return
			if (game.resources.stardust < virtualMapCost(this.newMapLevel)) return
			game.resources.stardust -= virtualMapCost(this.newMapLevel)
			
			let stardustTotal = POINT_TYPES.slice(1).reduce((v, y) => v + game.stardust[y], 0)
			
			let n = -1
			while (stardustTotal > game.resources.stardust) {
				n++
				if (!game.stardust[POINT_TYPES[n % 4 + 2]]) continue
				game.stardust[POINT_TYPES[n % 4 + 2]]--
				stardustTotal--
			}
			
			game.createMap(name, Math.round(this.newMapLevel), true, this.newMapFocus)
			this.update(true)
		}

		this.dvVirtualMaps = createElement("div", "virtual-maps", this.dvVirtual)
		
		this.dvStatsHolder = createElement("div", "fullscreen-holder hidden", document.body)
		this.dvStatsHolder.onclick = (event) => {
//			if (event.target == this.dvStatsHolder) {
				this.dvStatsHolder.classList.toggle("hidden", true)
//			}
		}	
		this.dvStats = createElement("div", "dialog", this.dvStatsHolder)
		this.dvStatsTitle = createElement("div", "dialog-title", this.dvStats)
		this.dvStatsTime = createElement("div", "stats-info", this.dvStats)
		this.dvStatsContainer = createElement("div", "stats", this.dvStats)
		this.dvStatsGrowth = createElement("div", "stats-info", this.dvStatsContainer)
		this.dvStatsProduction = createElement("div", "stats-info", this.dvStatsContainer)
	},
	
	onSet() {
		this.dvDisplay.appendChild(gui.map.dvGrowth)
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			const maxMaps = Math.max(0,Math.min(5, game.realMap.level - 20))
			const freeMaps = Array(maxMaps).fill().map((x,n) => "virtual"+n).filter(x => !game.maps[x]).length
			this.dvVirtualTitle.innerText = "Virtual maps (" + (maxMaps - freeMaps) + "/" + maxMaps + ")"
			this.dvVirtual.classList.toggle("hidden", !game.skills.virtualMaps)
			if (game.skills.virtualMaps) {
				this.dvVirtualCreateButton.classList.toggle("enabled", !!freeMaps)
			}
			this.dvFocusSelector.classList.toggle("hidden", !game.skills.virtualMapFocus)
			if (!game.skills.virtualMapFocus) this.newMapFocus = 0
			const freeDust = game.resources.stardust - Object.values(game.stardust).reduce((v,x) => v+x, 0)
			this.dvGrowthTitle.innerText = "Growth boost (Stardust: " + (game.resources.stardust - freeDust) + "/" + game.resources.stardust + ")"
			gui.tabs.setTitle("stardust", (game.skills.virtualMaps?"Maps / ":"") + (freeDust?"Stardust ("+displayNumber(freeDust, 0)+")":"Stardust"))
			this.sliders.map(x => {
				x.setMax(game.resources.stardust)
				x.steps = game.resources.stardust
				x.dvRight.innerText = game.resources.stardust
				x.dvDisplay.classList.toggle("hidden", !game.growth[x.value])
				x.update()
			})
			if (game.skills.virtualMaps) {
				this.newMapLevelSlider.setMax (game.realMap.level)
				this.newMapLevelSlider.steps = game.realMap.level
				this.newMapLevelSlider.dvRight.innerText = game.realMap.level
				this.newMapLevelSlider.update()
				this.selector.update(true)
				this.dvVirtualCreateCost.innerText = "Cost: " + virtualMapCost(this.newMapLevel) + " stardust"
				
				while (this.dvVirtualMaps.firstChild)
					this.dvVirtualMaps.firstChild.remove()
				
				this.realMap = MapDisplay({
					parent : this.dvVirtualMaps,
					name : "main"
				})
				
				this.virtualMaps = Object.keys(game.maps).filter(x => x.substr(0,7) == "virtual").map(x => MapDisplay({
					parent : this.dvVirtualMaps,
					name : x
				}))
			}
		}
	}
})

function virtualMapCost(level) {
	if (game.realMap.level == level) return 0
	if (game.realMap.level == level + 1) return Math.ceil(mapLevel(level).exitsCount / 2)
	return mapLevel(level).exitsCount
}

const mapDisplayHandler = {
	_init() {
		this.dvDisplay = createElement("div", "virtual-map"+(game.activeMap == this.name?" active":""), this.parent)
		this.dvTitle = createElement("div", "virtual-map-title", this.dvDisplay, this.name == "main"?"Real":this.name.capitalizeFirst())
		const stars = game.maps[this.name].points.filter(x => x.exit && x.owned).length
		const progress = game.maps[this.name].points.filter(x => x.owned).length / game.maps[this.name].points.length * 100
		const exits = game.maps[this.name].exitsCount
		this.dvLevel = createElement("div", "virtual-map-level", this.dvDisplay, "Level "+game.maps[this.name].level+", "+progress.toFixed(0)+(this.name == "main"?"%\nStars: ":"%\nStardust: ")+stars+"/"+(game.maps[this.name].level == game.realMap.level?"???":exits))
		const focus = game.maps[this.name].focus?POINT_TYPES[game.maps[this.name].focus]:0
		this.dvFocus = createElement("div", "virtual-map-focus"+(focus?" bg-"+focus:""), this.dvDisplay, focus?focus.capitalizeFirst():"")
		this.dvGo = createElement("div", "button" + (game.activeMap == this.name?"":" enabled"), this.dvDisplay, "Visit")
		if (this.name != game.activeMap) {
			this.dvGo.onclick = (event) => {
				const summons = game.sliders.filter(x => x.clone == 2).length
				if (summons && !confirm("You have " + pluralize(summons, ["summon", "summons"]) + ". \n Changing map will make "+pluralize(summons, ["it","them"], true)+" disappear. \n Do you really want to go?")) 
					return
				game.setMap(this.name, true)
				gui.tabs.setTab("map")
			}
		}

		this.dvStats = createElement("div", "button enabled", this.dvDisplay, "Stats")
		this.dvStats.onclick = (event) => {
			const map = game.maps[this.name]
			const stats = map.getStats()
			gui.stardust.dvStatsHolder.classList.toggle("hidden", false)
			gui.stardust.dvStatsTitle.innerText = "Level "+map.level+(map.virtual?" virtual":"")+(map.focus?" "+POINT_TYPES[map.focus]:"")+" map"
			gui.stardust.dvStatsTime.innerText = "Created: "+stats.created + 
												"\nCompleted: "+stats.completed + 
												"\nTime spent: "+stats.took
			gui.stardust.dvStatsGrowth.innerText = "Growth:\n\n"+Object.keys(stats.growth).map(x => x.capitalizeFirst()+": "+stats.growth[x]).join("\n")
			gui.stardust.dvStatsProduction.innerText = "Production:\n\n"+Object.keys(stats.production).filter(x => x[0] != "_").map(x => x.capitalizeFirst()+": "+stats.production[x]).join("\n")
		}

		this.dvDelete = createElement("div", "button" + (this.name == "main"?"":" enabled"), this.dvDisplay, "Delete")
		
		if (this.name != "main"){
			this.dvDelete.onclick = (event) => {
				let ask = !game.skills.retainVirtualBonus?"You will lose all bonuses from this virtual map\n":""
				ask += game.maps[this.name].points.filter(x => x.exit && !x.owned).length?"You have not collected all the stardust on this virtual map\n":""
				if (ask && !confirm(ask+"Are you sure you want to delete it?")) return
				game.deleteMap(this.name, game.skills.retainVirtualBonus)
				gui.stardust.update(true)
			}
		}
	}
}

const MapDisplay = Template(mapDisplayHandler)

