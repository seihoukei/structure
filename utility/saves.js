function saveState(slot = "_Autosave", nobackup = false, data = game, async = true) {
//	const saveData = btoa(compressSaveData(JSON.stringify(data)))+"|"+(data.realMap?data.realMap.level:data.map?data.map.level:data.maps && data.maps.main?data.maps.main.level:0)+"|"+data.saveTime+"|"+Math.round((data.statistics.offlineTime || 0) + (data.statistics.onlineTime || 0))
//	const saveData = LZString.compressToBase64("lzstr"+compressSaveData(JSON.stringify(data)))
	const postfix = "|"+(data.realMap?data.realMap.level:data.map?data.map.level:data.maps && data.maps.main?data.maps.main.level:0)+"|"+(data.saveTime || Date.now())+"|"+Math.round((data.statistics.offlineTime || 0) + (data.statistics.onlineTime || 0))
	if (async) {
		if (core.saving) return false
		core.saving = true
		core.lzWorker.postMessage({
			name : "compress",
			data : JSON.stringify(data),
			postfix, nobackup, slot
		})
	} else {
		const saveData = LZString.compressToBase64("lzstr"+compressSaveData(JSON.stringify(data)))		
		finalizeSave(slot, saveData, postfix, nobackup)
	}
	delete game.badSave
}

function finalizeSave(slot, data, postfix, nobackup) {
	const saveData = data + postfix
	if (!nobackup && localStorage[SAVE_PREFIX+slot])
		localStorage[SAVE_PREFIX + "_Last deleted/overwritten save backup"] = localStorage[SAVE_PREFIX+slot]
	localStorage[SAVE_PREFIX+slot] = saveData
	if (slot == "_Cloud save" && settings.cloudUpdate)
		cloud.save()
	core.saving = false
	gui.updateSaves()
}

function loadState(slot = "_Autosave", hibernated = false, nobackup = false) {
	let saveData = localStorage[SAVE_PREFIX+slot]
	if (!saveData) return false
	
	try {
		let uSaveData = saveData
		if (saveData[0] != "{") {
			uSaveData = LZString.decompressFromBase64(saveData.split("|")[0])
			if (uSaveData.substr(0, 5) != "lzstr")
				uSaveData = atob(saveData.split("|")[0])
			else
				uSaveData = uSaveData.substr(5)
		}
		
		saveData = uSaveData
		
		const save = JSON.parse(uncompressSaveData(saveData))
		if (!save) return false
		
		game.load(save, hibernated, nobackup)
		return true
	} catch(e) {
		game.badSave = true
		console.log(e)
		localStorage[SAVE_PREFIX+"__Possibly corrupted save"] = localStorage[SAVE_PREFIX+slot]
		alert("Invalid save data.\nTry refreshing with CTRL+F5.\nIf error persists, contact developer.")
		game.reset()
//		console.log(saveData)
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
	return decode == 2?JSON.stringify(JSON.parse(uncompressSaveData(LZString.decompressFromBase64(localStorage[SAVE_PREFIX+slot].split("|")[0]).substr(5))), null, "\t"):
		decode == 1?LZString.decompressFromBase64(localStorage[SAVE_PREFIX+slot].split("|")[0]).substr(5):
		localStorage[SAVE_PREFIX+slot]
}

function importState(saveData) {
	if (!saveData) return
	saveData = saveData.trim()
	if (saveData.slice(0,10) == "structure:"){
		cloud.fetchSave(saveData.split("\n")[0].slice(10).trim())
		return
	}
	try {
		let uSaveData = saveData
		if (saveData[0] != "{") {
			uSaveData = LZString.decompressFromBase64(saveData.split("|")[0])
			if (uSaveData.substr(0, 5) != "lzstr")
				uSaveData = atob(saveData.split("|")[0])
			else
				uSaveData = uSaveData.substr(5)
			uSaveData = uncompressSaveData(uSaveData)
		}
		
		saveData = uSaveData

		if (saveData[0] == "{") {
			saveData = JSON.parse(saveData)
			saveState("_Last imported save", true, saveData, false)
		}
		gui.updateSaves("_Last imported save")
		return loadState("_Last imported save")
	} catch(e) {
		game.badSave = true
		console.log(e)
		alert("Invalid save data.\nTry refreshing with CTRL+F5.\nIf error persists, contact developer.")
		game.reset()
//		console.log(saveData)
	}
}

const cloud = {
	server : location.protocol+"//cloud.seihoukei.games/structure/",
	local : {},
	
	saveLocal() {
		localStorage[GAME_PREFIX + "cloud"] = JSON.stringify(this.local)
	},
	
	init() {
		const cloudData = localStorage[GAME_PREFIX + "cloud"]
		if (cloudData) 
			Object.assign(this.local, JSON.parse(cloudData))
			
		if (!this.local.deviceid) {
			const a = new Uint8Array(16)
			crypto.getRandomValues(a, 16)
			this.local.deviceid = a.reduce((v,x) => v + x.toString(16),"")
		}
			
		if (this.local.token)
			this.loginToken()
			
		this.saveLocal()
	},
	
	_login(data) {
		fetch(this.server+"login.php", {
				method: "POST",
				body: JSON.stringify(data)
			}).then(httpStatus)
				.then((res) => res.json())
				.then((data) => {
					gui.menu.saves.loggingin = false
					if (!data.success) {
						console.log("Cloud login error: " + data.error)
						gui.menu.saves.dvLoginStatus.innerText = data.error
						gui.menu.saves.dvCloudUpdate.innerText = "Failed to login to cloud"
						return
					}
					this.local.username = data.username
					this.local.token = data.token
//					this.local.lastLocalSave = data.thissavetime
					this.local.lastCloudSave = data.lastsavetime
					this.local.lastCloudSaveID = data.lastsaveid
					
					gui.menu.saves.dvCloudUpdate.innerText = this.local.lastCloudSave?"Latest cloud save found: "+(new Date((+this.local.lastCloudSave + (new Date().getTimezoneOffset())) * 1000).toString().split(" ").slice(1,5).join(" ")):"No cloud save found, trying to create..."
					
					if (!this.local.lastCloudSave) {
						saveState("_Cloud save")
					}
					
					if (this.local.lastCloudSave && (!this.local.lastLocalSave || this.local.lastLocalSave < this.local.lastCloudSave))
						this.load(this.local.lastCloudSaveID)
					this.saveLocal()

					gui.menu.saves.dvLoginHolder.classList.toggle("hidden", true)

					gui.menu.saves.dvCloudStatus.innerText = "Currently connected as"
					gui.menu.saves.dvCloudName.innerText = this.local.username
					gui.menu.saves.dvCloudLogin.innerText = "Disconnect"
				})
				.catch(x => {
					gui.menu.saves.loggingin = false
					gui.menu.saves.dvLoginStatus.innerText = "Error occured. Try again later."
					gui.menu.saves.dvCloudUpdate.innerText = "Failed to login to cloud"
					console.log(x)
				})					
	},
	
	login(username, password, register) {
		this._login({
					username, password : forge_sha256(password),
					deviceid : this.local.deviceid,
					register : !!register
				})
	},
	
	loginToken(token = this.local.token) {
		this._login({
					token,
					deviceid : this.local.deviceid
				})
	},
	
	save() {
		if (!this.local.token) 
			return false
		const data = localStorage[SAVE_PREFIX+"_Cloud save"]
		if (!data) 
			return false
		
		fetch(this.server+"store.php", {
				method: "POST",
				body: JSON.stringify({
					token : this.local.token , data
				})
			}).then(httpStatus)
				.then((res) => res.json())
				.then((data) => {
					if (!data.success) {
						console.log(data.error)
						return
					}
					this.local.lastLocalSave = data.lastsave
					gui.menu.saves.dvCloudUpdate.innerText = "Successfully updated cloud ("+(new Date((+this.local.lastLocalSave + (new Date().getTimezoneOffset())) * 1000).toString().split(" ").slice(1,5).join(" "))+")"
					this.saveLocal()
				})
				.catch(x => {
					gui.menu.saves.dvCloudUpdate.innerText = "Failed to update to cloud"
					console.log(x)
				})
	},
	
	load(id = this.local.id) {
		if (!this.local.token) 
			return false		
		fetch(this.server+"restore.php", {
				method: "POST",
				body: JSON.stringify({
					token : this.local.token, id
				})
			}).then(httpStatus)
				.then((res) => res.json())
				.then((data) => {
					if (!data.success) {
						console.log(data.error)
						return
					}
					localStorage[SAVE_PREFIX+"_Cloud save"] = data.savedata
					this.local.lastLocalSave = data.savetime
					if (settings.cloudAutoload) {
						loadState("_Cloud save", settings.cloudAutoload == 2, true)
					}
					this.saveLocal()
				})
				.catch(x => {
					gui.menu.saves.dvCloudUpdate.innerText = "Failed to load from cloud"
					console.log(x)
				})
	},
	
	logout() {
		delete this.local.token
		delete this.local.username
		this.saveLocal()
		gui.menu.saves.dvCloudStatus.innerText = "Currently not connected to the cloud"
		gui.menu.saves.dvCloudName.innerText = ""
		gui.menu.saves.dvCloudLogin.innerText = "Connect"
	},
	
	shareSave(slot = "_Autosave") {
		const data = localStorage[SAVE_PREFIX+slot]
		gui.menu.saves.dvTextSave.value = "Uploading "+slot
		fetch(this.server+"share.php", {
				method: "POST",
				body: JSON.stringify({
					data
				})
			}).then(httpStatus)
				.then((res) => res.json())
				.then((data) => {
					if (!data.success) {
						console.log(data.error)
						gui.menu.saves.dvTextSave.value = "Failed to upload save: " + data.error
						return
					}
					gui.menu.saves.dvTextSave.value = "structure:"+data.code+ "\n\n\nImport the line above to load shared save\nSave expires in 24 hours"
				})
				.catch(x => {
					gui.menu.saves.dvTextSave.value = "Failed to upload save: " + x
					console.log(x)
				})
	},
	
	fetchSave(code) {
		if (!code) 
			return false		
		fetch(this.server+"fetch.php", {
				method: "POST",
				body: JSON.stringify({
					code
				})
			}).then(httpStatus)
				.then((res) => res.json())
				.then((data) => {
					if (!data.success) {
						console.log(data.error)
						gui.menu.saves.dvTextSave.value = gui.menu.saves.dvTextSave.value.split("\n")[0]+"\n\nFailed to fetch save: " + data.error
						return
					}
					importState(data.savedata)
				})
				.catch(x => {
					gui.menu.saves.dvTextSave.value = gui.menu.saves.dvTextSave.value.split("\n")[0]+"\n\nFailed to fetch save: " + x
					console.log(x)
				})
	},
}
