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
	theme : {
		group : "Display",
		displayName : "Color theme",
		default : "light",
		choices : [{
			text : "Light",
			value : "light"
		}, {
			text : "Dark",
			value : "dark"
		}],
		onSet () {
			gui.setTheme(settings.theme, game.map.boss?"boss":"main")
		}
	},
	invert : {
		group : "Display",
		displayName : "Invert lightness",
		default : 0,
		choices : [{
			text : "Off",
			value : 0
		}, {
			text : "On",
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
			game.updateMapBackground = true
		}
	},
	eta : {
		group : "Display",
		displayName : "Rough ETA display",
		default : 1,
		choices : [{
			text : "Off",
			value : 0
		},{
			text : "On",
			value : 1
		}],
	},
	masterHide : {
		group : "Display",
		displayName : "Show overriden controls",
		default : 1,
		choices : [{
			text : "Show",
			value : 0
		},{
			text : "Fade",
			value : 1
		},{
			text : "Hide",
			value : 2
		}],
	},
	levelDisplay : {
		group : "Map",
		displayName : "Node level display",
		default : 2,
		choices: [{
			text: "None",
			value : 0
		},{
			text: "Number",
			value : 1
		},{
			text: "Circles",
			value : 2
		}],
		onSet() {
			game.update()
			game.updateMapBackground = true
		}
	},
	nodeScale : {
		group : "Map",
		displayName : "Node size scale",
		default : 1,
		choices: [{
			text: "x0.25",
			value : 0.25
		},{
			text: "x0.5",
			value : 0.5
		},{
			text: "x0.75",
			value : 0.75
		},{
			text: "x1",
			value : 1
		}],
		onSet() {
			game.update()
			game.updateMapBackground = true
		}
	},
	dashedLines: {
		group : "Map",
		displayName : "Uncaptured node lines",
		default : true,
		choices: [{
			text: "Dashed",
			value : true
		},{
			text: "Solid",
			value : false
		}],
		onSet() {
			game.updateMapBackground = true
		}
	},
	meanEffect: {
		group : "Map",
		displayName : "Lightning effects",
		default : true,
		choices: [{
			text: "On",
			value : true
		},{
			text: "Off",
			value : false
		}],
/*		onSet() {
			game.updateMapBackground = true
		}*/
	},
	fireworks: {
		group : "Map",
		displayName : "Fireworks",
		default : true,
		choices: [{
			text: "On",
			value : true
		},{
			text: "Off",
			value : false
		}],
/*		onSet() {
			game.updateMapBackground = true
		}*/
	},
	minerSparks: {
		group : "Map",
		displayName : "Miner/worker sparks",
		default : true,
		choices: [{
			text: "On",
			value : true
		},{
			text: "Off",
			value : false
		}],
/*		onSet() {
			game.updateMapBackground = true
		}*/
	},
	renderDeadZone : {
		group : "World",
		displayName: "Display dead zones",
		default : true,
		choices: [{
			text: "On",
			value : true
		},{
			text: "Off",
			value : false
		}],
		onSet() {
			game.updateWorldBackground = true
		}
	},
	renderReach : {
		group : "World",
		displayName: "Display connectable distance",
		default : true,
		choices: [{
			text: "On",
			value : true
		},{
			text: "Off",
			value : false
		}],
		onSet() {
			game.updateWorldBackground = true
		}
	},
	storyMainDisplay : {
		group : "Story",
		displayName : "Main story display",
		default : 2,
		choices : [{
			text : "Hide",
			value : 0
		},{
			text : "Log",
			value : 1
		},{
			text : "Popup",
			value : 2
		}],
	},
	storySideDisplay : {
		group : "Story",
		displayName : "Side story display",
		default : 2,
		choices : [{
			text : "Hide",
			value : 0
		},{
			text : "Log",
			value : 1
		},{
			text : "Popup",
			value : 2
		}],
	},
	mechanicsDisplay : {
		group : "Story",
		displayName : "Mechanics guide display",
		default : 2,
		choices : [{
			text : "Hide",
			value : 0
		},{
			text : "Log",
			value : 1
		},{
			text : "Popup",
			value : 2
		}],
	},
	storyTime : {
		group : "Story",
		displayName : "Story timing",
		default : 60,
		choices : [{
			text : "World time",
			value : 60
		},{
			text : "Game time",
			value : 1
		}],
	},
	dataFPS: {
		group : "Performance",
		displayName : "Game processing speed",
		default : 10,
		choices: [{
			text : "Once per second",
			value : 1
		},{
			text : "Ten times per second",
			value : 10
		},{
			text : "Thirty times per second",
			value : 30
		}],
		onSet () {
			if (!game.slowMode)
				game.worker.postMessage({
					name : "setFPS",
					value : settings.dataFPS
				})
		}
	},
	slowDataFPS: {
		group : "Performance",
		displayName : "Slow mode processing speed",
		default : 1,
		choices: [{
			text : "Once per five seconds",
			value : 0.2
		},{
			text : "Once per second",
			value : 1
		},{
			text : "Ten times per second",
			value : 10
		}],
		onSet () {
			if (game.slowMode)
				game.worker.postMessage({
					name : "setFPS",
					value : settings.slowDataFPS
				})
		}
	},
	slowModeBackground : {
		group : "Performance",
		displayName : "Automatic low load mode when not active window",
		default : 1,
		choices: [{
			text : "Off",
			value : 0
		},{
			text : "On",
			value : 1
		}],
	},
	slowModeIdle : {
		group : "Performance",
		displayName : "Automatic low load mode when idling",
		default : 60000,
		choices: [{
			text : "Off",
			value : 0
		},{
			text : "1 minute",
			value : 60000
		},{
			text : "5 minutes",
			value : 300000
		},{
			text : "30 minutes",
			value : 1800000
		},{
			text : "1 hour",
			value : 3600000
		}],
	},
	slowModeMap : {
		group : "Performance",
		displayName : "Display map progress while in automatic low load mode",
		default : 1,
		choices: [{
			text : "From Map tab only",
			value : 0
		},{
			text : "From any tab",
			value : 1
		}]
	},
	autosavePeriod : {
		group : "Saves",
		displayName: "Autosave period",
		default : 15000,
		choices : [{
			text : "Off",
			value : 0,
		},{
			text : "15 seconds",
			value : 15000,
		},{
			text : "1 minute",
			value : 60000,
		},{
			text : "10 minutes",
			value : 600000,
		}]
	},
	cloudPeriod : {
		group : "Saves",
		displayName: "Cloud save period",
		default : 600000,
		choices : [{
			text : "Off",
			value : 0,
		},{
			text : "10 minutes",
			value : 600000,
		},{
			text : "30 minutes",
			value : 1800000,
		},{
			text : "1 hour",
			value : 3600000,
		}]
	},
	cloudUpdate : {
		group : "Saves",
		displayName: "Upload cloud saves if logged in",
		default : true,
		choices : [{
			text : "On",
			value : true,
		},{
			text : "Off",
			value : false,
		}]
	},
	cloudAutoload : {
		group : "Saves",
		displayName: "Autoload cloud save if newer one found",
		default : 1,
		choices : [{
			text : "Off",
			value : 0,
		},{
			text : "On",
			value : 1,
		},{
			text : "Hiberload",
			value : 2,
		}]
	},
}

Object.keys(SETTINGS).map(x => {
	SETTINGS[x].id = x
	settings[x] = SETTINGS[x].default
})