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
					const scale = (game.resources.stardust - game.stardust[x]) / otherTotal
					if (scale < 1) {
						POINT_TYPES.slice(3).map(y => {
							if (y != x) {
								game.stardust[y] *= scale
								if (game.stardust[y] < 1e-2)
									game.stardust[y] = 0
							}
						})
						this.sliders.map(y => y.update())
					}
				}
			})
		})
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