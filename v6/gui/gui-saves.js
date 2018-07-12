'use strict'

const SavesTab = Template({
	_init() {
		this.saves = {}
		this.dvDisplay = createElement("div", "saves "+(this.className || ""), this.parent)
		
		this.dvCloud = createElement("div", "cloud", this.dvDisplay)
		this.dvCloudLogin = createElement("div", "cloud-login button", this.dvCloud, "Connect")
		this.dvCloudStatus = createElement("div", "cloud-status", this.dvCloud, "Currently not connected to the cloud")
		this.dvCloudName = createElement("div", "cloud-username", this.dvCloud)
		this.dvCloudUpdate = createElement("div", "cloud-update", this.dvCloud)
		this.dvCloudLogin.onclick = (event) => {
			if (cloud.local.token)
				cloud.logout()
			else
				this.dvLoginHolder.classList.toggle("hidden", false)
			//	cloud.login("seihoukei", "structure31415")
		}
		
		this.dvLoginHolder = createElement("div", "login-holder hidden", document.body)
		this.dvLoginHolder.onclick = (event) => {
			if (event.target == this.dvLoginHolder)
				this.dvLoginHolder.classList.toggle("hidden", true)				
		}
		this.dvLoginForm = createElement("div", "login-form", this.dvLoginHolder)
		this.dvLoginNameTitle = createElement("div", "login-caption", this.dvLoginForm, "Login")
		this.dvLoginName = createElement("input", "login-input", this.dvLoginForm)
		this.dvLoginPassTitle = createElement("div", "login-caption", this.dvLoginForm, "Password")
		this.dvLoginPass = createElement("input", "login-input", this.dvLoginForm)
		this.dvLoginPass.type = "password"
		this.dvLoginStatus = createElement("div", "login-status", this.dvLoginForm)
		this.dvLoginButtons = createElement("div", "login-buttons", this.dvLoginForm)
		this.dvLoginLogin = createElement("div", "button", this.dvLoginButtons, "Log in")
		this.dvLoginRegister = createElement("div", "button", this.dvLoginButtons, "Register")
		
		this.dvLoginLogin.onclick = (event) => {
			if (this.loggingin) return
			this.dvLoginStatus.innerText = "Attempting login..."
			this.loggingin = true
			cloud.login(this.dvLoginName.value, this.dvLoginPass.value)
		}
		
		this.dvLoginRegister.onclick = (event) => {
			if (this.loggingin) return
			this.dvLoginStatus.innerText = "Attempting register..."
			this.loggingin = true
			cloud.login(this.dvLoginName.value, this.dvLoginPass.value, true)
		}
		
		this.dvSaveList = createElement("div", "savelist", this.dvDisplay)

		this.dvSaveButtons = createElement("div", "buttons", this.dvDisplay)

		this.dvCreateSave = createElement("div", "button", this.dvSaveButtons, "Add slot")
		this.dvCreateSave.onclick = (event) => {
			let n = 0
			while (this.saves["Slot "+n]) n++
			let name = prompt("Choose new slot name:", "Slot " + n)
			if (name && this.saves[name]) {
				alert("Name already taken")
				this.updateSaves(name)
				return
			}
			if (name)
				saveState(name)
		}

		this.dvSave = createElement("div", "button", this.dvSaveButtons, "Save game")
		this.dvSave.onclick = (event) => saveState(this.activeSave.name)

		this.dvLoad = createElement("div", "button", this.dvSaveButtons, "Load game")
		this.dvLoad.onclick = (event) => loadState(this.activeSave.name)

		this.dvLoad2 = createElement("div", "button", this.dvSaveButtons, "Hiberload game")
		this.dvLoad2.onclick = (event) => loadState(this.activeSave.name, 1)
		this.dvLoad2.title = "Load game without offline progress"

		this.dvDeleteSave = createElement("div", "button", this.dvSaveButtons, "Delete slot")
		this.dvDeleteSave.onclick = (event) => confirm("Really delete "+this.activeSave.name+"?")?deleteState(this.activeSave.name):0

		this.dvExport = createElement("div", "button", this.dvSaveButtons, "⇓\uFE0E Export save ⇓\uFE0E")
		this.dvExport.onclick = (event) => this.dvTextSave.value = exportState(this.activeSave.name, event.shiftKey?1:event.ctrlKey?2:0)

		this.dvImport = createElement("div", "button", this.dvSaveButtons, "⇑\uFE0E Import save ⇑\uFE0E")
		this.dvImport.onclick = (event) => importState(this.dvTextSave.value)
		
		this.dvReset = createElement("div", "button reset", this.dvSaveButtons, "Reset game")
		this.dvReset.onclick = (event) => confirm("Really reset? All unsaved progress will be lost!")?game.reset():0
		
		this.dvTextSave = createElement("textarea", "export", this.dvDisplay, "Paste save here")
		this.dvTextSave.onclick = (event) => this.dvTextSave.value == "Paste save here"?this.dvTextSave.value = "":0		
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced, target) {
		if (forced) {
			const progress = []
			Object.keys(localStorage).filter(x => x.substr(0, SAVE_PREFIX.length) == SAVE_PREFIX).sort((x,y) => x[SAVE_PREFIX_LENGTH] == "_" || !y[SAVE_PREFIX_LENGTH] == "_").map(saveName => {
				const name = saveName.substr(SAVE_PREFIX_LENGTH)
				const saveData = localStorage[saveName]
				let save = this.saves[name]
				if (!save) {
					save = this.saves[name] = {name}
					save.dvDisplay = createElement("div", "save", this.dvSaveList)
					save.dvDisplay.onclick = (event) => {
						this.update(true, name)
					}
					save.dvDate = createElement("div", "date", save.dvDisplay)
					save.dvName = createElement("div", "name", save.dvDisplay, name)
					save.dvProgress = createElement("div", "progress", save.dvDisplay)
				}
				
				let time, level, totalTime = 0
				if (saveData[0] == "{") {
					time = saveData.match(/"saveTime":\s*([0-9]*)/)[1]
					level = saveData.match(/"map":\s*{.*?"level":\s*([0-9]*)/)[1]
					const onTime = saveData.match(/"onlineTime":\s*([0-9\.]*)/)
					const offTime = saveData.match(/"offlineTime":\s*([0-9\.]*)/)
					if (onTime) totalTime += +onTime[1]
					if (offTime) totalTime += +offTime[1]
				} else {
					const data = saveData.split("|")
					level = +data[1]
					time = +data[2]
					totalTime = +data[3]
				}
				progress.length = 0
				
				if (time) {
					save.dvDate.innerText = new Date(+time).toString().split(" ").slice(1,5).join(" ")
				}
				if (level) progress.push("Map level: "+level)
				if (totalTime) progress.push("Time played: " + timeString(totalTime))
				save.dvProgress.innerText = "(" + progress.join(", ") + ")"
				this.dvSaveList.appendChild(save.dvDisplay)
			})
			if (target) this.activeSave = this.saves[target]
			if (!this.activeSave) this.activeSave = this.saves["_Autosave"]
			Object.values(this.saves).map(save => save.dvDisplay.classList.toggle("active", this.activeSave == save))
		}
	}
})