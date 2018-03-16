'use strict'

const StoryTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "story "+(this.className || ""), this.parent)
	},
	
	onSet() {
		this.update(true)
		this.updateStory()
	},
	
	updateStory() {
		if (!game.story) return
		Object.values(STORY).map(story => {
			if (game.story[story.id]) return
			if (!story.dvDisplay) return
			story.dvDisplay.remove()
		})
		Object.keys(game.story).map(x => {
			if (!STORY[x]) return
			const story = STORY[x]
			if (!story.dvDisplay) {
				story.dvDisplay = createElement("div", "record", this.dvDisplay)
				story.dvTitle = createElement("div", "title", story.dvDisplay, story.title)
				story.dvText = createElement("div", "text", story.dvDisplay, story.text)
				story.dvTime = createElement("div", "time", story.dvDisplay)
			}
			story.dvTime.innerText = storyTime(game.story[x])
			this.dvDisplay.appendChild(story.dvDisplay)
		})
	},

	update(forced) {
	}
})