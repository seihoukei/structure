'use strict'

const STORY = {
	m000: {
		forced : 1,
		title: "Chapter 1: I want out",
		text: `This can't go on any longer. I've been stranded on this small fragment of what used to be my world for too long. That... wall, the barrier, the only source of light I have... it feels weaker every time I touch it. I could already push my hand through for a bit yesterday. Maybe today is the day to take a look at what's out there.`,
	},
	type_power: {
		forced : 2,
		text: `
			God, this is disapointing. It's just another shard. Vastly different from the one I came from, to the point where I'm not sure it's from my world at all. Just what has happened out there? I should find out somehow...
			Is it just me or am I becoming stronger all of sudden? It feels like this land is pumping me up. I should try to explore more...
		`,
		guide: `
			Nodes increase your growth of their type.
			Power determines your attack.
			You have to choose a new destination to fight your way into.
		`,
	},
	type_spirit: {
		forced : 2,
		text: `
			Yup, another small fragment. It's not the world I used to see. Words from my world can't even describe it. Except for may be that one, "beautiful". Yeah, this is beautiful. Inspiring. Now I wonder what else can I find?..
		`,
		guide: `		
			Spirit is important when fighting for higher power nodes.
			Whenever your spirit is lower than barrier power, your attack is decreased.
		`,
	},
	type_none: {
		forced : 1,
		text: `
			So boring... just another uninhabited section. These worlds are so different though. It's like I'm actually sliding between the worlds, traversing the planes... At least my power is not attached to some timer. 
			I guess I should just move on...
		`,
	},
	special_star: {
		forced : 1,
		text: `
			Hey-hey-hey, what's this thing brimming with energy? It looks like a star! I know stars don't fall from the sky, but whatever this is, theres no better description. It's shiny, it's star-shaped, and it feels so powerful. I wonder if there are any other like this...
		`,
	},
	m000_enough: {
		forced : 2,
		text: `
			Another star. As soon as I touched it, the sky cleared. Well, you'd imagine clouds to move away or something, but the thing is - there are no clouds. There's no real "sky" either. Just infinite darkness out there. And now it just turned bright. The barrier is suddenly not the only thing that gives me light anymore.
			And now what's this? I'm not touching the ground anymore. The gravity has released me. From the very beginning I've feltt like a victim of fate, and now I could fly high and touch the sky. I should probably look around a bit more though, there might be even more stars to get.
		`,
		guide: `
			You can spend stars to ascend to the next map.
			It's a good idea to gather all the stars on the map.
		`,
	},
	m000_full: {
		forced : 0,
		title : "Log record #0001",
		text : `
			Straight out of hell. That thing must have come straight out of hell, I tell ya. That reverse piramyd thingy hit the Moon and fell apart like a Millenium puzzle! Honestly, the pieces looked harmless. Except we could not get close to them. Scientists were spitting out some mumbo-jumbo about falling through space and time that did not make much sense, and in the end we did not make any progress towards it.
			However, that thing.. whatever it is... it was slowly making its progress towards us. It took us some time to notice. The flight times were off. The long-term forecasts were getting less and less accurate. The distances... became inconsistent. Soon, we were able to track some lines where anomalies happened. We figured out the pattern. We saw it before. The pieces of that thing on the moon were casting their evl shadow onto Earth.
		`,
	},
	m001: {
		forced : 1,
		text : `
			I'm at my house. Again. But something have changed. The barrier is still there, but it looks different somehow. I think I'm getting hang of this sliding thing. Some more practice and I can navigate these worlds without hassle.
		`,
	},
	special_key: {
		forced : 0,
		text: `
			As I broke into this world, swarm of small shiny particles engulfed me. Whatever happened, I feel like I understand this world a bit better.
		`,
	},
	special_lock: {		
		forced : 0,
		text: `
			That barrier definitely looks different from the others. I can't even fathom whan could be there. 
		`,
	},
	special_key_lock: {
		forced : 2,
		text: `
			That barrier... It looks different. As I noticed that, the stream of shining lights that followed me flew right through it. It sure looks gloomer than what I've seen before, but it does feel passable.
		`,
		guide: `
			Numbered locks are opened by obtaining the key that has the same number.
		`		
	},
	special_lock_key: {		
		forced : 2,
		text: `
			As soon as I broke in, stream of light has surrounded me. The light is strange, it feels like I've felt something like this before... In that room with a solid barrier. Maybe I can get through now...
		`,
		guide: `
			Numbered locks are opened by obtaining the key that has the same number.
		`		
	},
	m002: {
		forced : 2,
		text : `
			It's getting harder. The barrier is responding, it's pushing me back slowly. I definitely deal better with it when in high spirits...
		`
	},
	s_autoTarget: {
		forced : 2,
		text: `
			This world chasing thing is becoming addictive. I can really see myself chasing worlds without a rest now.
		`,
		guide: `
			You don't have to choose a target for you slider every time he finishes breaking a barrier anymore. 
			You can toggle this on Slider tab.
		`,
	},
	s_sensor: {
		forced : 2,
		text: `
			The barriers... they are not identical. I've seen so many already that I can tell if there's anything behind the world I'm breaking into before I get there. Now I can see which worlds give me more directions to go and which are just dead ends.
		`,
		guide: `
			You can now see whether there's anything in different directions.
			It's pretty useful to know where you unveil more nodes when you are looking for something.
		`
	},
	s_mining: {
		forced : 2,
		text: `
			I havent been to my cellar for ages, but curiousity got me: if there's no sky and walls around, there should be something strange down there too. Well guess what? It's there. It looks like a barrier, but it is not. I can dig it. It feels like some metallic material. If anything, it resembles gold, so I'll just call it that. Dunno if I'll ever need it later, but having some definitely won't hurt.
		`,
		guide: `
			You can now mine gold by assigning Slider to your starting point
		`
	},
	m001_full: {
		forced : 0,
		title : "Log record #0002",
		text : `
			A lot of things could happen at those lines. You know how people used to claim to have seen some weird stuff and never able to capture it on camera? Well, the cameras worked. The first video of some unknown landscape in the middle of interstate highway was bashed for being a fake, but then others came, the most weird things out of nowhere, all of them seen around anomaly lines. Well, you know how it goes in a horror movie: people go missing, then other people claim to have seen them... there. 
			And then the first crack happened. The Earth was divited into two parts. It was not "torn apart", it was more like day and night, with a terminator line following the moon. Nothing faster than sound could break the wall. It would be just gone... somewhere else. Radio waves. Electronic signals. Planes. Light. All gone.
		`
	},
	m002_full: {
		forced : 0,
		title : "Log record #0003",
		text : `
			And we adapted. We've had no choice. We've called the sector without direct sunlight "The Dead sector". It was not really dead, neither was it cold while I'd definitely expect that from sunless world. 
			And then one day it just happened. The line stopped. The border turned into a bright wall. Nothing could get through anymore. 
		`,
	},
	m003_full: {
		forced : 0,
		title : "Log record #0004",
		text : `
			I've been at home when it happened. I just woke up to the bright light. The barrier was in my backyard. The barrier was on the street. I've been surrounded with it. That was hella scary. The barrier was bright and felt very solid. I could not contact anyone, I've only had myself to rely on...
		`,
	},
	m020b1b: {
		forced : 5,
		title: "You have done it!",
		text: `
			As of now, this is the end of the game. I hope you enjoyed your adventure and will return when there's more. Please make and backup a save state at this point. You can ascend and keep playing, but there will be nothing new past this point.
			Congratulations on your victory!
		`,
	}
}

Object.keys(STORY).map(x => STORY[x].id = x)