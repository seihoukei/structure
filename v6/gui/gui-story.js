'use strict'

const StoryTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "story "+(this.className || ""), this.parent)
		this.dvRecords = createElement("div", "story records", this.dvDisplay)
		this.dvPopup = createElement("div", "popup hidden", document.body)
		this.dvFrame = createElement("div", "frame", this.dvPopup)
		this.dvFrameTitle = createElement("div", "title", this.dvFrame, "Story")
		this.dvClose = createElement("div", "button", this.dvFrame, "Close")
		this.dvHint = createElement("div", "hint", this.dvFrame, "You can change story display mode in settings")

		this.dvPopup.onclick = this.dvClose.onclick = (event) => {
			game.lastViewedStory = Math.round((game.statistics.onlineTime || 0) + (game.statistics.offlineTime || 0))
			this.dvPopup.classList.toggle("hidden", true)
			this.popped = false
		}
		this.dvFrame.onclick = (event) => event.stopPropagation()
		
	},
	
	onSet() {
		this.updateStory()
		this.update(true)
	},
	
	updateStory() {
		if (!game.story) return
		let unread = 0
		Object.values(STORY).map(story => {
			if (game.story[story.id]) return
			if (!story.dvDisplay) return
			story.dvDisplay.remove()
		})
		Object.keys(game.story).map(x => {
			if (!STORY[x]) return
			if (game.story[x] > game.lastViewedStory) unread++
			const story = STORY[x]
			if (!story.dvDisplay) {
				story.dvDisplay = createElement("div", "record "+(game.story[x] > game.lastViewedStory?"unread":""), this.dvDisplay)
				story.dvTitle = createElement("div", "title", story.dvDisplay, story.title)
				if (story.text) {
					story.dvTexts = createElement("div", "texts", story.dvDisplay)
					story.dvText = []
					for (let line of story.text.trim().split("\n")) {
						story.dvText.push(createElement("div", "text", story.dvTexts, line.trim()))
					}
				}
				if (story.guide) {
					story.dvGuides = createElement("div", "guides", story.dvDisplay)
					story.dvGuide = []
					for (let line of story.guide.trim().split("\n")) {
						story.dvGuide.push(createElement("div", "guide", story.dvTexts, line.trim()))
					}
				}
				story.dvTime = createElement("div", "time", story.dvDisplay)
			}
			if (!this.popped)
				story.dvDisplay.classList.toggle("unread", game.story[x] > game.lastViewedStory)
			story.dvTime.innerText = storyTime(game.story[x])
			this.dvRecords.appendChild(story.dvDisplay)
		})
		this.dvTitle.innerText = unread?"Story ("+unread+")":"Story"
//		console.log(game.lastViewedStory, game.story, unread)
	},
	
	popupStory() {
		return //REL_REMOVE
		this.popped = true
		this.dvPopup.classList.toggle("hidden", 0)
		this.dvFrame.insertBefore(this.dvRecords, this.dvClose)
		game.lastViewedStory = Math.round((game.statistics.onlineTime || 0) + (game.statistics.offlineTime || 0))
		this.dvTitle.innerText = "Story"
	},

	update(forced) {
		game.lastViewedStory = Math.round((game.statistics.onlineTime || 0) + (game.statistics.offlineTime || 0))
		this.dvTitle.innerText = "Story"
		if (forced) {
			this.dvDisplay.appendChild(this.dvRecords)
			const records = document.getElementsByClassName("record unread")
			if (records[0]) 
				records[0].scrollIntoView()
			else
				this.dvRecords.scrollTop = this.dvRecords.scrollHeight
		}
	}
})