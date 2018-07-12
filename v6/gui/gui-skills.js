'use strict'

const SkillsTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "skills "+(this.className || ""), this.parent)
		
		this.dvSkills = createElement("div", "skills", this.dvDisplay)
		this.skills = {}
		this.scienceSkills = []
		this.expSkills = []
		
		Object.keys(SKILLS).map(x => {
			let skill = Object.assign({} , SKILLS[x])
			skill.dvDisplay = createElement("div", "skill", this.dvSkills)
			skill.dvTitle = createElement("div", "title", skill.dvDisplay, skill.name)
			skill.dvDesc = createElement("div", "desc", skill.dvDisplay, skill.desc)
			skill.dvCost = createElement("div", "cost", skill.dvDisplay, "EXP: " + skill.cost)
			
			skill.dvDisplay.onclick = (event) => game.getSkill(skill.id)
			skill.id = x
			this.skills[x] = skill
		})
	},
	
	onSet() {
		this.dvDisplay.insertBefore(gui.dvHeader, this.dvDisplay.firstChild)
		this.updateSkills()
	},
	
	updateExp() {
		let total = 0
		Object.values(this.skills).map(skill => {
			let available = !game.skills[skill.id] && 
							(game.resources.exp >= skill.exp * game.skillCostMult) && 
							(!skill.map || game.realMap.level >= skill.map) && 
							(!skill.sliders || game.sliders.filter(x => !x.clone).length >= skill.sliders) && 
							(!skill.science || game.resources.science >= skill.science) &&
							(!skill.feat || game.feats[skill.feat] && FEATS[skill.feat].map <= game.realMap.level) &&
							(!skill.req || skill.req.reduce((v,x) => v && game.skills[x], true)) &&
							(!skill.res || skill.res.reduce((v,x) => v && game.resources[x], true))
			skill.dvDisplay.classList.toggle("available", !!available)
			if (skill.unknown && skill.science <= game.resources.science) {
				skill.unknown = false
				skill.dvDesc.innerText = skill.desc
				skill.dvCost.innerText = game.skills[skill.id]?"Unlocked":"EXP: " + displayNumber(skill.exp * game.skillCostMult, 0) + " / x" + (skill.mult || 1)
			}
			if (available) {
				total++
			}
		})
		gui.tabs.setTitle("skills", total?"Skills ("+total+")":"Skills")
	},
	
	updateSkills() {
		this.scienceSkills.length = 0
		this.expSkills.length = 0
		Object.values(this.skills).map(skill => {
			let visible = true
			if (visible && skill.map) visible = game.realMap.level >= skill.map
			if (visible && skill.req) visible = skill.req.reduce((v,x) => v && game.skills[x], visible)
			if (visible && skill.feat) visible = game.feats[skill.feat] && FEATS[skill.feat].map <= game.realMap.level
			if (visible && skill.res) visible = skill.res.reduce((v,x) => v && game.resources[x], visible)
			if (visible && skill.sliders) visible = game.sliders.filter(x => !x.clone).length >= skill.sliders
			skill.dvDisplay.classList.toggle("hidden", !visible)
			if (visible) {
				skill.dvDisplay.classList.toggle("owned", !!game.skills[skill.id])
				skill.unknown = skill.science && game.resources.science < skill.science
				if (skill.unknown) 
					this.scienceSkills.push(skill) 
				else if (!game.skills[skill.id]) 
					this.expSkills.push(skill)
				
				skill.dvDesc.innerText = skill.unknown?"???":skill.desc
				skill.dvCost.innerText = game.skills[skill.id]?"Unlocked":skill.unknown?"Science: "+displayNumber(skill.science):"EXP: " + displayNumber(skill.exp * game.skillCostMult, 0) + " / x" + (skill.mult || 1)
			}
		})
		gui.dvExpMult.innerText = "Cost multiplier: x" + displayNumber(game.skillCostMult)
	},
	
	update(forced) {
		this.scienceSkills.map(skill => {
			if (game.real)
				skill.dvCost.innerText = "Science: "+displayNumber(skill.science) + " (" + shortTimeString((skill.science - game.resources.science) / game.real.production.science) + ")"
		})
		this.expSkills.map(skill => {
			if (game.real)
				skill.dvCost.innerText = "EXP: " + displayNumber(skill.exp * game.skillCostMult, 0) + ETAString(skill.exp * game.skillCostMult, "exp", true) +" / x" + (skill.mult || 1)
		})
	}
})