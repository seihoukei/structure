'use strict'

const BASE_STARDUST_CONTROLS = {
	overspend : false,
	autoSpread : false,
	autoEqual : false
}

const StardustTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "stardust "+(this.className || ""), this.parent)
		this.dvSubdisplay = createElement("div", "stardusts ", this.dvDisplay)
		this.dvSliders = createElement("div", "stardust-growth", this.dvSubdisplay)
		this.dvGrowthTitle = createElement("div", "stardust-title", this.dvSliders, "Growth boost")
		this.sliders = POINT_TYPES.slice(3).map((x, n) => {
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
					if (this.stardustControls.overspend) {
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
					} else {
						if (game.stardust[x] + otherTotal > game.resources.stardust)
							this.sliders[n].setValue(game.resources.stardust - otherTotal)
					}
					this.updateStardust()
				}
			})
		})
		this.stardustControls = Object.assign({}, BASE_STARDUST_CONTROLS)
		this.cbOverspend = GuiCheckbox({
			parent : this.dvSliders,
			title : "Redistribute if exceeding total",
			container : this.stardustControls,
			value : "overspend"
		})
		this.cbEqual = GuiCheckbox({
			parent : this.dvSliders,
			title : "Distribute for equal growth on change",
			container : this.stardustControls,
			value : "autoEqual",
			onSet : () => {
				if (this.stardustControls.autoEqual) {
					this.stardustControls.autoSpread = false
					this.cbSpread.update()
				}
			},
			visible : () => game.skills.autoStar
		})
		this.cbSpread = GuiCheckbox({
			parent : this.dvSliders,
			title : "Distribute equally on change",
			container : this.stardustControls,
			value : "autoSpread",
			onSet : () => {
				if (this.stardustControls.autoSpread) {
					this.stardustControls.autoEqual = false
					this.cbEqual.update()
				}
			},
			visible : () => game.skills.autoStar
		})
		this.dvSpreadButtons = createElement("div", "buttons", this.dvSliders)
		this.dvSpread = createElement("div", "equal button", this.dvSpreadButtons, "Equalize amounts")
		this.dvSpread.onclick = (event) => {
			this.spreadStardust()
			this.updateStardust()
		}
		this.dvEqual = createElement("div", "equal button", this.dvSpreadButtons, "Equalize growth")
		this.dvEqual.onclick = (event) => {
			this.equalStardust()
			this.updateStardust()
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
			min : 10,
			max : 20,
			steps : 10,
			shortStep : 1,
			digits : 0,
			onSet : () => {
				this.dvVirtualCreateCost.innerText = "Cost: " + displayNumber(virtualMapCost(this.newMapLevel),0) + " stardust"
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
			if (!game.payStardust(virtualMapCost(this.newMapLevel))) return
			
			game.createMap(name, Math.round(this.newMapLevel), true, this.newMapFocus)
			this.update(true)
		}

		this.dvVirtualMaps = createElement("div", "virtual-maps", this.dvVirtual)
		
		this.dvStatsHolder = createElement("div", "fullscreen-holder hidden", document.body)
		this.dvStatsHolder.onclick = (event) => {
//			if (event.target == this.dvStatsHolder) {
				this.dvStatsHolder.classList.toggle("hidden", true)
				delete this.displayMap
//			}
		}	
		this.dvStats = createElement("div", "dialog", this.dvStatsHolder)
		this.dvStatsTitle = createElement("div", "dialog-title", this.dvStats)
		this.dvStatsTime = createElement("div", "stats-info", this.dvStats)
		this.dvStatsContainer = createElement("div", "stats", this.dvStats)
		this.dvStatsGrowth = createElement("div", "stats-info", this.dvStatsContainer)
		this.dvStatsProduction = createElement("div", "stats-info", this.dvStatsContainer)
		this.dvStatsMulti = createElement("div", "stats-info", this.dvStatsContainer)
		this.dvDiscoveredContainer = createElement("div", "stats", this.dvStats)
		this.dvDiscoveredTypes = createElement("div", "stats-info", this.dvDiscoveredContainer)
		this.dvDiscoveredSpecials = createElement("div", "stats-info", this.dvDiscoveredContainer)
		this.dvDiscoveredInfo = createElement("div", "stats-info", this.dvDiscoveredContainer)

		this.dvCoreSpecials = createElement("div", "special-core-info", this.dvDisplay)
	},
	
	onSet() {
		this.dvDisplay.insertBefore(gui.dvHeader, this.dvDisplay.firstChild)
		gui.setHeader(["clouds", "stardust", "exp", "gold"])
		this.dvDisplay.appendChild(gui.map.dvGrowth)
		this.update(true)
	},
	
	updateMapStats(name) {
		const map = game.maps[name]
		this.displayMap = name
		const stats = map.getStats()
		this.dvStatsTitle.innerText = "Level "+map.level+(map.virtual?" virtual":"")+(map.focus?" "+POINT_TYPES[map.focus]:"")+(map.starfield?" starfield":" map") + (map.evolved?" evolved "+pluralize(map.evolved, ["time", "times"]):"")
		this.dvStatsTime.innerText = "Created: "+stats.created + 
											"\nCompleted: "+stats.completed + 
											"\nTime spent: "+stats.took +
											"\nMap time spent: "+stats.tookLocal
		this.dvStatsGrowth.innerText = "Growth:\n\n"+Object.keys(stats.growth).map(x => x.capitalizeFirst()+": "+stats.growth[x]).join("\n")
		this.dvStatsProduction.innerText = "Production:\n\n"+Object.keys(stats.production).filter(x => x[0] != "_").map(x => x.capitalizeFirst()+": "+stats.production[x]).join("\n")
		this.dvStatsMulti.innerText = "Multipliers:\n\n"+Object.keys(stats.multi).filter(x => x[0] != "_").map(x => x.capitalizeFirst()+": "+stats.multi[x]).join("\n")
		this.dvDiscoveredTypes.innerText = "Point types:\n"+stats.nodeType.map((x,n) => x?"\n"+POINT_TYPES[n].capitalizeFirst()+": "+x:"").join("")
		this.dvDiscoveredSpecials.innerText = "Specials:\n"+stats.nodeSpecial.map((x,n) => x?"\n"+SPECIAL_NAMES[n]+": "+x:"").join("")
		this.dvDiscoveredInfo.innerText = "Other:\n"+
											"\nPoints found: "+stats.totalNodes+
											"\nLocks opened: "+stats.locksOpen+
											"\nMax depth seen: "+stats.maxDepth
											
		this.lastUpdate = performance.now()
	},
	
	spreadStardust() {
		let number = POINT_TYPES.slice(3).reduce((v,x) => v + (game.growth[x]?1:0), 0)
		let whole = game.resources.stardust / number | 0
		let fract = game.resources.stardust % number
		POINT_TYPES.slice(3).map(x => {
			if (game.growth[x]) {
				game.stardust[x] = whole + (fract?1:0)
				fract = fract?fract-1:0
			}
		})
	},
	
	equalStardust() {
		let number = POINT_TYPES.slice(3).reduce((v,x) => v + (game.growth[x]?1:0), 0)
		//let totalGrowth = POINT_TYPES.slice(3).reduce((v,x) => v + (game.growth[x] || 0), 0)
		let shares = POINT_TYPES.slice(3).map(x => game.growth[x]?1 / game.growth[x] : 0, 0)
		let totalShares = shares.reduce((v,x) => v+x, 0)
		shares = shares.map(x => x/totalShares)
		let totalUsed = 0
		POINT_TYPES.slice(3).map((x,n) => totalUsed += (game.stardust[x] = Math.floor(game.resources.stardust * shares[n])))
		let fract = game.resources.stardust - totalUsed
		POINT_TYPES.slice(3).map(x => {
			if (game.growth[x]) {
				game.stardust[x] += (fract?1:0)
				fract = fract?fract-1:0
			}
		})
	},
	
	updateStardust() {
		if (this.stardustControls.autoSpread) {
			this.spreadStardust()
		}
		if (this.stardustControls.autoEqual) {
			this.equalStardust()
		}
		const freeDust = game.resources.stardust - Object.values(game.stardust).reduce((v,x) => v+x, 0)
		this.dvGrowthTitle.innerText = "Growth boost (Stardust: " + displayNumber(game.resources.stardust - freeDust) + "/" + displayNumber(game.resources.stardust) + ")"
		gui.tabs.setTitle("stardust", (game.skills.virtualMaps?"Maps / ":"") + (freeDust?"Stardust ("+displayNumber(freeDust, 0)+")":"Stardust"))
		this.sliders.map(x => {
			x.setMax(game.resources.stardust)
			x.steps = game.resources.stardust
			x.dvRight.innerText = displayNumber(game.resources.stardust)
			x.dvDisplay.classList.toggle("hidden", !game.growth[x.value])
			x.update()
		})
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
			this.updateStardust()
			this.cbOverspend.update()
			this.cbEqual.update()
			this.cbSpread.update()
			if (game.skills.virtualMaps) {
				this.newMapLevelSlider.setMax (game.realMap.level)
				this.newMapLevelSlider.setMin (game.realMap.level / 2 | 0)
				this.newMapLevelSlider.steps = this.newMapLevelSlider.range
				this.newMapLevelSlider.dvRight.innerText = game.realMap.level
				this.newMapLevelSlider.update()
				this.selector.update(true)
				this.dvVirtualCreateCost.innerText = "Cost: " + displayNumber(virtualMapCost(this.newMapLevel),0) + " stardust"
				
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
			
			let specials = ""
			if (game.world.coreStats.evolutionScale) specials += "\nVirtual map evolutions have longer distances"
			if (game.world.coreStats.mapChargeSpeed) specials += "\nCompleted focused virtual maps produce their focus attribute growth at " + Math.floor(game.world.coreStats.mapChargeSpeed / 10) + "% completion speed (capped at 10 minutes)"
			if (game.world.coreStats.goldenMaps) specials += "\nMaximum level virtual maps are created as starfields"
			this.dvCoreSpecials.innerText = specials
		}
		if (this.displayMap && performance.now() - this.lastUpdate > 2000/* == game.activeMap*/) {
			this.updateMapStats(this.displayMap)
		}
		if (gui.stardust && gui.stardust.virtualMaps) {
			const currentMap = gui.stardust.virtualMaps.filter(x => x.name == game.activeMap)[0]
			if (currentMap) {
				const map = game.map
				const stars = map.points.filter(x => x.exit && x.owned).length
				const progress = map.points.filter(x => x.owned).length / map.points.length * 100
				const exits = map.exitsCount
				currentMap.dvLevel.innerText = "Level "+map.level+", "+Math.floor(progress)+(map.name == "main"?"%\nStars: ":"%\nStardust: ")+stars+"/"+((map.level == game.realMap.level && progress < 100)?"???":exits)
				if (currentMap.dvEvolve)
					currentMap.dvEvolve.classList.toggle("enabled", progress == 100 && (map.level > 30 && !map.evolved || map.evolved < 3))
			}
			if (game.world && game.world.coreStats && game.world.coreStats.mapChargeSpeed) {
				gui.stardust.virtualMaps.map(x => {
					const map = game.maps[x.name]
					if (!map.virtual || !map.complete || !map.focus) return
					const chargeMax = Math.max(map.tookTime, 600000)
					const progress = Math.floor(map.chargeTime / chargeMax * 10000)/100
					//x.dvFocus.title = POINT_TYPES[map.focus].capitalizeFirst() + " charge: " + progress.toFixed(2) + "% (" + shortTimeString((map.tookTime - map.chargeTime)/game.world.coreStats.mapChargeSpeed) + ") "
					x.dvFocus.innerText = POINT_TYPES[map.focus].capitalizeFirst() + " (" + shortTimeString((chargeMax - map.chargeTime)/game.world.coreStats.mapChargeSpeed) + ") "
					x.dvCharge.style.transform = "scale("+(progress/100)+",1)"
				})
			}
		}
	}
})

function virtualMapCost(level) {
	if (game.world.coreStats.goldenMaps && game.realMap.level == level) return level * 125e2
	if (game.realMap.level == level) return 0
	if (game.realMap.level == level + 1) return Math.ceil(mapLevel(level).exitsCount / 2)
	return mapLevel(level).exitsCount
}

const mapDisplayHandler = {
	_init() {
		const map = game.maps[this.name]
		this.dvDisplay = createElement("div", "virtual-map"+(game.activeMap == this.name?" active":""), this.parent)
		this.dvTitle = createElement("div", "virtual-map-title", this.dvDisplay, this.name == "main"?"Real":this.name.capitalizeFirst()+(map.starfield?" (Starfield)":"")+(map.evolved?"\nEvolved: "+pluralize(map.evolved,["time","times"]):""))
		const stars = map.points.filter(x => x.exit && x.owned).length
		const progress = map.points.filter(x => x.owned).length / map.points.length * 100
		const exits = map.exitsCount
		this.dvLevel = createElement("div", "virtual-map-level", this.dvDisplay, "Level "+map.level+", "+Math.floor(progress)+(this.name == "main"?"%\nStars: ":"%\nStardust: ")+stars+"/"+((map.level == game.realMap.level && progress < 100)?"???":exits))
		const focus = map.focus?POINT_TYPES[map.focus]:0
		this.dvFocus = createElement("div", "virtual-map-focus"+(focus?" bg-"+focus:""), this.dvDisplay, (focus?focus.capitalizeFirst():""))
		this.dvCharge = createElement("div", "virtual-map-charge", this.dvDisplay)
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

		if (game.skills.evolveVirtual) {
			this.dvEvolve = createElement("div", "button" + ((!map.virtual || map.level < 31 || progress < 100 || map.evolved && map.evolved >= 3)?"":" enabled"), this.dvDisplay, "Evolve")
			this.dvEvolve.onclick = (event) => {
				map.evolve()
				gui.stardust.update(true)
			}
		}

		this.dvStats = createElement("div", "button enabled", this.dvDisplay, "Stats")
		this.dvStats.onclick = (event) => {
			gui.stardust.dvStatsHolder.classList.toggle("hidden", false)
			gui.stardust.updateMapStats(this.name)
		}

		this.dvDelete = createElement("div", "button" + (this.name == "main"?"":" enabled"), this.dvDisplay, "Delete")
		
		if (this.name != "main"){
			this.dvDelete.onclick = (event) => {
				let ask = !game.skills.retainVirtualBonus?"You will lose all bonuses from this virtual map\n":""
				ask += game.maps[this.name].points.some(x => x.exit && !x.owned)?"You have not collected all the stardust on this virtual map\n":""
				if (game.skills.retainVirtualBonus && game.skills.book_enchantments1 && game.maps[this.name].points.some(x => !x.enchanted && (x.manaCosts.enchantDoom != -1 || x.manaCosts.enchantGold != -1 || x.manaCosts.enchantMana != -1 || x.manaCosts.enchantGrowth != -1))) ask += "There are nodes you can enchant.\n"
				if (game.skills.virtualImprint && game.maps[this.name].points.some(x => x.canImprint && !x.harvested && !x.harvestTime)) ask += "There are nodes you can imprint.\n"
				if (game.maps[this.name].points.some(x => x.harvesting)) ask += "There are unfinished imprints that will be lost.\n"
				if (game.maps[this.name].focus && game.maps[this.name].complete && game.world.coreStats.mapChargeSpeed) ask += "Map will stop charging to produce " + POINT_TYPES[game.maps[this.name].focus] + " growth.\n"
				if (game.skills.starfall && game.maps[this.name].complete && game.maps[this.name].evolved) ask += "Map will stop producing stardust.\n"

				if (ask && !confirm(ask+"\nAre you sure you want to delete this map?")) return
				game.deleteMap(this.name, game.skills.retainVirtualBonus)
				gui.stardust.update(true)
			}
		}
	}
}

const MapDisplay = Template(mapDisplayHandler)