'use strict'

const STORY = {
	m000: {
		title: "Nothing to see here",
		text: `Move on.
		On.
		On.`,
		forced : 1,
	},
	m020b1b: {
		title: "You have done it!",
		text: `As of now, this is the end of the game. I hope you enjoyed your adventure and will return when there's more. Please make and backup a save state at this point. You can ascend and keep playing, but there will be nothing new past this point.
		
		Congratulations on your victory!`,
		forced : 5,
	}
}

Object.keys(STORY).map(x => STORY[x].id = x)