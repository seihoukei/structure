"use strict"

importScripts("../import/lz-string.min.js")
importScripts("../utility/savecompress.js")

onmessage = (event) => {
	const data = event.data
	if (data.name = "compress") {
		data.name = "done"
		data.data = LZString.compressToBase64("lzstr"+compressSaveData(data.data))
		postMessage(data)
	}
}