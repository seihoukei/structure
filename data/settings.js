'use strict'

const settings = {}

const SETTINGS = {
	numberFormat :{
		group : "Numbers",
		displayName : "Short number format",
		default : 0,
		choices : [{
			text : "Natural",
			value : 0
		}, {
			text : "Scientific",
			value : 1
		}, {
			text : "Engineering",
			value : 2
		}, {
			text : "ABCD",
			value : 3
		}]
	}, 
	numberDelimiter :{
		group : "Numbers",
		displayName : "Scientific number display",
		default : 0,
		choices : [{
			text : "1.23e6",
			value : 0
		},{
			text : "1.23e+6",
			value : 1
		},{
			text : "1.23×10⁶",
			value : 2
		}]
	}, 
	numberMax : {
		group : "Numbers",
		displayName : "Upper bound for full numbers",
		default : 1000,
		choices : [{
			value : 10
		},{
			value : 1000
		},{
			value : 10000
		},{
			value : 100000
		},{
			value : 1000000
		}]
	}, 
	numberMin :{
		group : "Numbers",
		displayName : "Lower bound for full numbers",
		default : 0.01,
		choices : [{
			value : 1
		},{
			value : 0.1
		},{
			value : 0.01
		},{
			value : 0.001
		}]
	}, 
	numberPrecision : {
		group : "Numbers",
		displayName : "Precision of short numbers",
		default : 2,
		choices : [{
			text : "12M",
			value : 0
		},{
			text : "12.3M",
			value : 1
		},{
			text : "12.34M",
			value : 2
		},{
			text : "12.345M",
			value : 3
		}]
	},
	invert : {
		group : "Display",
		displayName : "Color theme",
		default : 0,
		choices : [{
			text : "Original",
			value : 0
		},{
			text : "Inverted",
			value : 1
		}],
		onSet () {
			document.body.classList.toggle("invert", settings.invert)
		}
	},
	colorBlind : {
		group : "Display",
		displayName : "Color blind mode",
		default : 0,
		choices : [{
			text : "Off",
			value : 0
		},{
			text : "On",
			value : 1
		}],
		onSet () {
			game.updateBackground = true
		}
	},
}

Object.keys(SETTINGS).map(x => {
	SETTINGS[x].id = x
	settings[x] = SETTINGS[x].default
})