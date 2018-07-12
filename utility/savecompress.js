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
	"#e" : `"enchanted":`,
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