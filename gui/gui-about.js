'use strict'

const AboutTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "about "+(this.className || ""), this.parent)
		this.dvGameTitle = createElement("div", "title", this.dvDisplay, "Structure")
		this.dvSubtitle = createElement("div", "subtitle", this.dvDisplay, "The incremental game")
		this.dvVersion = createElement("div", "version", this.dvDisplay, "v0.0.1 -- 15 March 2018")
		this.dvAuthor = createElement("div", "author", this.dvDisplay, "by seihoukei")
		this.dvLinks = createElement("div", "links", this.dvDisplay)
		this.dvDiscord = createElement("div", "link", this.dvLinks, "TBA: Discord link")
		this.dvReddit = createElement("div", "link", this.dvLinks, "TBA: Subreddit link")
		this.dvWiki = createElement("div", "link", this.dvLinks, "TBA: Wiki link")
		this.dvFallback = createElement("div", "credits", this.dvDisplay, "Fallback unicode font : 'Symbola' by George Douros")
		this.dvChangelog = createElement("div", "changelog", this.dvDisplay, `Changelog
		
		-- 0.0.1 -- 15 March 2018 --
		- The first public release... I guess?
		`)
	},
	
	onSet() {
		this.update(true)
	},
	
	update(forced) {
	}
})