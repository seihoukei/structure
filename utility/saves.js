function saveState(slot = "_Autosave", nobackup = false, data = game) {
	const saveData = btoa(compressSaveData(JSON.stringify(data)))+"|"+(data.realMap?data.realMap.level:data.map?data.map.level:data.maps && data.maps.main?data.maps.main.level:0)+"|"+data.saveTime+"|"+Math.round((data.statistics.offlineTime || 0) + (data.statistics.onlineTime || 0))
	if (!nobackup && localStorage[SAVE_PREFIX+slot])
		localStorage[SAVE_PREFIX + "_Last deleted/overwritten save backup"] = localStorage[SAVE_PREFIX+slot]
	localStorage[SAVE_PREFIX+slot] = saveData
	gui.updateSaves()
}

function loadState(slot = "_Autosave", hibernated = false, nobackup = false) {
	let saveData = localStorage[SAVE_PREFIX+slot]
	if (!saveData) return false
	
	try {
		if (saveData[0] != "{")
			saveData = atob(saveData.split("|")[0])
		
		const save = JSON.parse(uncompressSaveData(saveData))
		if (!save) return false
		
		game.load(save, hibernated, nobackup)
		return true
	} catch(e) {
		alert("Invalid save data")
		console.log(e)
		console.log(saveData)
		return false
	}
}

function deleteState(slot = "_Autosave") {
	if (slot != "Save Backup" && localStorage[SAVE_PREFIX+slot])
		localStorage[SAVE_PREFIX + "_Last deleted/overwritten save backup"] = localStorage[SAVE_PREFIX+slot]
	delete localStorage[SAVE_PREFIX+slot]
	let save = gui.menu.saves.saves[slot]
	if (save) {
		save.dvDisplay.remove()
		delete save.dvDisplay
		delete gui.menu.saves.saves[slot]
	}
	gui.updateSaves()
}

function exportState(slot = "_Autosave", decode = 0) {
	return decode == 2?JSON.stringify(JSON.parse(uncompressSaveData(atob(localStorage[SAVE_PREFIX+slot].split("|")[0]))), null, "\t"):
		decode == 1?atob(localStorage[SAVE_PREFIX+slot].split("|")[0]):
		localStorage[SAVE_PREFIX+slot]
}

function importState(saveData) {
	try {
		if (saveData[0] == "{") {
			saveData = JSON.parse(saveData)
			saveState("_Last imported save", true, saveData)
		} else {
			saveData = JSON.parse(uncompressSaveData(atob(saveData.split("|")[0])))
			saveState("_Last imported save", true, saveData)
		}
		gui.updateSaves("_Last imported save")
		return loadState("_Last imported save")
	} catch(e) {
		alert("Invalid save data")
		console.log(e)
	}
}
