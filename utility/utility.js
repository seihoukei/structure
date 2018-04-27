'use strict'

function fixHomeAtLastBug() {
	game.map.points[0].mineDepth = game.map.points.reduce((v,x) => v + x.level?x.bonus * 8 ** x.level / 2:0, 0) + game.resources.gold
}

function createElement(typ = "div", clas, parent, text) {
	let element = document.createElement(typ)
	if (clas) element.className = clas
	if (text) element.innerText = text
	if (parent) parent.appendChild(element)
	return element
}

function getString(x, def = "") {
	if (typeof(x) === 'function')
		return x()
	return x || def
}

function getNumber(x, def = 0) {
	if (typeof(x) === 'function')
		return +x() || def
	return +x || def
}

Number.prototype.toDigits = function(n) {
	return Math.round(this * 10 ** n) / 10**n
}

Number.prototype.digits = function(n) {
	let s = ""
	if (!n) return
	let temp = Math.floor(this)
	while (n--) {
		s = (temp % 10) + s
		temp = Math.floor(temp / 10)
	}
	return s
}

let memoize = function(factory, ctx) {
    let cache = {};
    return function(key) {
        if (!(key in cache)) {
            cache[key] = factory.call(ctx, key);
        }
        return cache[key];
    };
};

let colorToRGBA = (function() {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    let ctx = canvas.getContext('2d');

    return memoize(function(col) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = col;
        ctx.fillRect(0, 0, 1, 1);
        return [ ... ctx.getImageData(0, 0, 1, 1).data ];
    });
})();

String.prototype.capitalizeFirst = function(n) {
	return this.charAt(0).toUpperCase() + this.slice(1)
}

function Entity(...data) {
	let entity = Object.assign({}, ...data)
	data.map(x => x && x._init && x._init.bind(entity)())
	delete entity._init
	return entity
}

function Template(...data) {
	return function(...more) {
		return Entity(...data, ...more)
	}
}

function httpStatus(response) {  
	if (response.status >= 200 && response.status < 300) {  
		return Promise.resolve(response)  
	} else {  
		return Promise.reject(new Error(response.statusText))  
	}  
}

const saveCompression = {
	"#01" : `"goldFactory"`,
	"#02" : `"scienceLab"`,
	"#03" : `"obelisk"`,
	"#04" : `"banner"`,
	"#05" : `"hopeFactory"`,
	"#06" : `"cloudFactory"`,
	"#07" : `"manalith"`,
	"#08" : `"powerTower"`,
	"#09" : `"spiritTower"`,
	"#10" : `"rainbowTower"`,
	"#11" : `"thunderstoneFactory"`,
	"#12" : `"earthquakeMachine"`,
	"#A" : `"angle":`,
	"#B" : `"buildings":`,
	"#b" : `"blood":`,
	"#C" : `"progress":`,
	"#c" : `"color":"hsl`,
	"#_C": `"customPower":`,
	"#D" : `"distance":`,
	"#E" : `"exit":true`,
	"#f" : `"fire":`,
	"#G" : `"growth":`,
	"#i" : `"ice":`,
	"#K" : `"key":`,
	"#L" : `"lock":`,
	"#l" : `"level":`,
	"#M" : `"bonusMult":`,
	"#m" : `"metal":`,
	"#O" : `"owned":true`,
	"#P" : `"parentIndex":`,
	"#p" : `"power":`,
	"#S" : `"size":`,
	"#s" : `"spirit":`,
	"#_S": `"special":`,
	"#T" : `"type":`,
}

function compressSaveData(s) {
	s = s.replace(RegExp("#","g"), "&&")
	for (let [s2, s1] of Object.entries(saveCompression))
		s = s.replace(RegExp(s1,"g"), s2)
	return s
}

function uncompressSaveData(s) {
	for (let [s1, s2] of Object.entries(saveCompression))
		s = s.replace(RegExp(s1,"g"), s2)
	s = s.replace(RegExp("&&","g"), "#")
	return s
}

function pluralize(value, forms, noValue = false) {
	let form = forms[value == 1?0:1]
	if (noValue)
		return form
	
	return `${value} ${form}`
}

let timeStringCodes = [{
	divisor : 1000,
	name : ["millisecond","milliseconds"]
},{
	divisor : 60,
	name : ["second","seconds"]
},{
	divisor : 60,
	name : ["minute","minutes"]
},{
	divisor : 24,
	name : ["hour","hours"]
},{
	divisor : 7,
	name : ["day","days"]
},{
	name : ["week","weeks"]
}]
	
function timeString(t = 0, start = 1) {
	let step = 0
	let value
	let result = ""
	for (let timeCode of timeStringCodes) {
		if (t == 0 && step > start) 
			break
		
		if (timeCode.divisor) {
			value = t % timeCode.divisor
			t = ~~(t /  timeCode.divisor)
		} else {
			value = t
		}
		
		if (step >= start && value) 
			result = `${pluralize(value,timeCode.name)}${result?" ":""}${result}`
		
		step++
	}
	return result
}

let shortTimeStringCodes = [{
	divisor : 60,
	name : "s"
},{
	divisor : 60,
	name : "m"
},{
	divisor : 24,
	name : "h"
},{
	divisor : 7,
	name : "d"
},{
	name : "w"
}]
const shortTimeResult = []
	
function shortTimeString(t = 0, start = 0, length = 2) {
	let step = 0
	let value
	if (t > 24.192e5) return "months"
	shortTimeResult.length = 0
	
	if (t == Infinity || t == -Infinity) return "No damage dealt"
	
	for (let timeCode of shortTimeStringCodes) {
		if (t == 0 && step > start) 
			break
		
		if (timeCode.divisor) {
			value = ~~(t % timeCode.divisor)
			t = ~~(t /  timeCode.divisor)
		} else {
			value = ~~(t)
		}
		
		if (step >= start && value) 
			shortTimeResult.unshift(value + timeCode.name)
		
		step++
	}
	return shortTimeResult.slice(0, length).join(" ") || "<1s"
}

const displayValueTempLength = 5, displayValueRoundFix = 0.4999999 / 10 ** displayValueTempLength
function toFixed(value, digits) {
	let trailingZeroes = digits >= 0
	digits = Math.abs(digits)
	value = Math.abs(value-displayValueRoundFix)
	let displayValue = value.toFixed(5).slice(0,digits - displayValueTempLength - (digits?0:1))
	return trailingZeroes?displayValue:displayValue.replace(/\.?0+$/, "")
}

const positiveOrders = [["",	"K",	"M",	"B",	"T",	"Qa",	"Qi",	"Sx",	"Sp",	"Oc",	"No",
			"Dc",	"Ud",	"Dd",	"Td",	"Qad",	"Qid",	"Sxd",	"Spd",	"Ocd",	"Nod",
			"Vg",	"Uvg",	"Dvg",	"Tvg",	"Qavg",	"Qivg",	"Sxvg",	"Spvg",	"Ocvg",	"Novg",
			"Tg",	"Utg",	"Dtg",	"Ttg",	"Qatg",	"Qitg",	"Sxtg",	"Sptg",	"Octg",	"Notg"],
			[""], [""], ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
			"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", 
			"AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", 
			"AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ", "BA", "BB", "BC", "BD", 
			"BE", "BF", "BG", "BH", "BI", "BJ", "BK", "BL", "BM", "BN", "BO", "BP", "BQ", 
			"BR", "BS", "BT", "BU", "BV", "BW", "BX", "BY", "BZ", "CA", "CB", "CC", "CD", 
			"CE", "CF", "CG", "CH", "CI", "CJ", "CK", "CL", "CM", "CN", "CO", "CP", "CQ", 
			"CR", "CS", "CT", "CU", "CV", "CW", "CX", "CY", "CZ", "DA", "DB", "DC", "DD", 
			"DE", "DF", "DG", "DH", "DI", "DJ", "DK", "DL", "DM", "DN", "DO", "DP", "DQ", 
			"DR", "DS", "DT", "DU", "DV", "DW", "DX", "DY", "DZ", "EA", "EB", "EC", "ED", 
			"EE", "EF", "EG", "EH", "EI", "EJ", "EK", "EL", "EM", "EN", "EO", "EP", "EQ", 
			"ER", "ES", "ET", "EU", "EV", "EW", "EX", "EY", "EZ"]]
			
const negativeOrders = [[""],[""],[""],[""]]

function displayNumber(value, digits = -1, minimum = 1e-308) {
	if (Math.abs(value) == Infinity)
		return `${Infinity}`

	if (digits == -1)
		digits = settings.numberPrecision
	
	let minus = value < 0 ? "-" : ""
	value = Math.abs(value)
	
	if (value < minimum || value >= settings.numberMin && value < settings.numberMax)
		return minus + toFixed(value, digits)
			
	let order = Math.floor(Math.log10(value))

	let order3 = Math.floor(order / 3)
	if (settings.numberFormat == 0 || settings.numberFormat == 3) {//natural
		let prefix = (order3 > 0 ? positiveOrders : negativeOrders)[settings.numberFormat][Math.abs(order3)]
		if (prefix !== undefined) {
			order3 *= 3
			value *= 10 ** -order3
		
			return `${minus}${toFixed(value, settings.numberPrecision)}${prefix}`
		}
	}
	
	if (settings.numberFormat != 1)
		order = order3 * 3
	
	value *= 10 ** -order
	
	let prefix = ""
	if (order)
		switch (settings.numberDelimiter) {
			case 0:
				prefix = `e${order}`
				break
			case 1:
				prefix = `e${order>0?"+":""}${order}`
				break
			case 2:
				prefix = `×10${superScript(order)}`
				break
		}
		
	return `${minus}${toFixed(value, settings.numberPrecision)}${prefix}`
}

function storyTime(n) {
	return timeString(n * settings.storyTime)
}

const superScripts = "⁰¹²³⁴⁵⁶⁷⁸⁹"
function superScript(n) {
	if (n == 0) return "⁰"
	let result = ""
	let k = ~~(n > 0 ? n : -n)
	while (k > 0) {
		result = superScripts[k%10] + result
		k = ~~(k / 10)
	}
	return n > 0 ? result : ("⁻" + result)
}
		
///\uFE0E - selector
//✓ - tick
//⭕ - circle (plain point)
//🌟 - star (exit)
//⚷ - key
//🔒 - locked lock
//🔓 - unlocked lock
//⚔ - crossed swords (boss)
//🏠 - home
//⛏ - pick (pickaxe)
//📡 - satellite (radar)
//⇮ - double arrow up (level up)
//⇓ - export
//⇑ - import
//× - multi
//⁰¹²³⁴⁵⁶⁷⁸⁹ - superscripts
//⚑ - flag 
//🗡️ - knife/sword
//🔮 - orb
//👑 - crown
//💍 - ring
//💎 - gem
//✓⭕🌟⚷🔒🔓⚔🏠⛏📡⇮⇓⇑⁰¹²³⁴⁵⁶⁷⁸⁹×⚑🗡️🔮👑💍💎