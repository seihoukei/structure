'use strict'

const StardustTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "stardust "+(this.className || ""), this.parent)
		this.dvSliders = createElement("div", "stardust-growth", this.dvDisplay)
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
				digits : 0,
				steps : game.resources.stardust,
				className : "stardust",
				sliderClass : "bg-"+x,
				onSet : () => {
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
					gui.tabs.setTitle("stardust", freeDust?"Stardust ("+displayNumber(freeDust, 0)+")":"Stardust")
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
			gui.tabs.setTitle("stardust", "Stardust")
		}
	},
	
	onSet() {
		this.dvDisplay.appendChild(gui.map.dvGrowth)
		this.update(true)
	},
	
	update(forced) {
		if (forced) {
			this.dvGrowthTitle.innerText = "Growth boost (Stardust: " + game.resources.stardust + ")"
			this.sliders.map(x => {
				x.setMax(game.resources.stardust)
				x.steps = game.resources.stardust
				x.dvRight.innerText = game.resources.stardust
				x.dvDisplay.classList.toggle("hidden", !game.growth[x.value])
			})
		}
	}
})