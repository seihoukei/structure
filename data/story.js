'use strict'

const STORY = {
	m000: {
		title: "Nothing to see here",
		text: `Move on.
		On.
		On.`
	}
}

Object.keys(STORY).map(x => STORY[x].id = x)