"use strict"

let lastTime = performance.now()
let frameTime = 16.66
let timeout = 0

function nextFrame() {
	let timeSince = performance.now() - lastTime

	clearTimeout(timeout)
	
	timeout = setTimeout(() => {
		lastTime = performance.now()
		postMessage({
			name : "advance", 
			time : Math.max(frameTime, timeSince)
		})
	}, Math.max(0, frameTime - timeSince))
}

onmessage = function(event) {
	let data = event.data
	switch (data.name) {
		case "start":
			lastTime = performance.now()
			frameTime = data.frameTime || frameTime
			
			nextFrame()
			
			break
			
		case "ready":
			nextFrame()	

			break
			
		case "setFPS":
			frameTime = 1000 / data.value

			break
	}
}