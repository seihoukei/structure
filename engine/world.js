"use strict"

const BASE_WORLD = {
	harvestSpeed : 1,
	goldSpeed : 1,
	goldMine : 0,
	imprinter : 0
}

const worldHandler = {
	_init() {
	},
	
	update() {
		this.harvestSpeed = 1 + this.imprinter * 0.4
		this.goldSpeed = 1 + this.goldMine * 0.2
	},
}

const World = Template(worldHandler)