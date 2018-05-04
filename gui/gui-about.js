'use strict'

const AboutTab = Template({
	_init() {
		this.dvDisplay = createElement("div", "about "+(this.className || ""), this.parent)
		this.dvGameTitle = createElement("div", "title", this.dvDisplay, "Structure")
		this.dvSubtitle = createElement("div", "subtitle", this.dvDisplay, "The incremental game")
		this.dvVersion = createElement("div", "version", this.dvDisplay, "v0.0.5 -- 4 May 2018")
		//this.dvVersion = createElement("div", "version", this.dvDisplay, "v0.0.2 -- 25 March 2018")
		this.dvAuthor = createElement("div", "author", this.dvDisplay, "by seihoukei")
		this.dvLinks = createElement("div", "links", this.dvDisplay)
		this.dvDiscord = createElement("div", "link", this.dvLinks, "TBA: Discord link")
		this.dvDiscord.innerHTML = "<a href='https://discord.gg/FpxEvVk'>Discord</a>"
		this.dvReddit = createElement("div", "link", this.dvLinks, "TBA: Subreddit link")
		this.dvReddit.innerHTML = "<a href='https://www.reddit.com/r/structure_idle/'>Reddit</a>"
		this.dvWiki = createElement("div", "link", this.dvLinks, "TBA: Wiki link")
		this.dvWiki.innerHTML = "<a href='https://www.reddit.com/r/structure_idle/wiki/'>Wiki</a>"
		this.dvFallback = createElement("div", "credits", this.dvDisplay, "Fallback unicode font : 'Symbola' by George Douros")
		this.dvChangelog = createElement("div", "changelog", this.dvDisplay, `Changelog
		
		-- 0.0.5 -- 04 May 2018 --
		- Maps up to 39 are safe to go to, map-specific content ends at ~35
		- Lots of UI changes and content updates, including:
			- New QoL upgrades for mid- and late-game mechanics
			- Refined tablet puzzles
			- Visible passive damage effect
			- Full-range color picker for sliders
			- Sliders can be reordered by dragging icons or headers
			- Hovering slider preview shows its position on the map
			- Improved autotargetting
			- ETA for lots of stuff
			- Map stats for mid-game mechanics
			- Custom level 35 map design
			- Two major mid-to-late-game mechanics
		- More settings to adjust game's look and behavior
		- Lots of bugfixes (still some hunt to do
		Note : I more or less actively report changes on #changelog channel 
		of our official discord server, this changelog can be outdated.

		-- 0.0.4 -- 11 April 2018 --
		- Maps up to 34 are "safe" (no more content after 28 though)
		- Cloud saves and save compression
		
		-- 0.0.3 -- 03 April 2018 --
		- UI improvements
		- Low load mode
		- Improved offline progress calculation
		- Content up to Map 27 (maps up to 29 are safe)
		
		-- 0.0.2 -- 24 March 2018 --
		- Content up to Map level 20
		- Rough ETA display
		- Proper dark theme
		
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