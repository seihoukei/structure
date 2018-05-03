const letters = Array(26).fill(0).map((x,n) => String.fromCharCode(n+65))
const letterPairs = Array(26*26).fill(0).map((x,n) => letters[n/26|0]+letters[n%26])

const researchHandler = {
	_init() {
		this.artifact = ARTIFACTS[this.name]
		if (!this.artifact) {
			console.log("Can't research "+this.name)
			return
		}
		
		if (!this.done && ((!this.codeword) || (this.badCodeWord(this.codeword)))) {
			this.initCodeWord()
		}
	
		this.goodGlyphs = Object.values(this.tablet).filter(x => x).length
	},
	
	initCodeWord() {

		const a = new Uint8Array(this.artifact.codeLength)
		this.codeword = ""
		
		while (!this.codeword || this.badCodeWord(this.codeword)) {
			crypto.getRandomValues(a, length)
			let options = [...letters,...letters]
			this.codeword = a.reduce((v,x) => {
				if (!options.length) return ""
				const index = x % options.length
				let nextLetter = options[index]
				options.splice(index, 1)
				if (v.indexOf(nextLetter) > -1) {
					const start = v.slice(v.indexOf(nextLetter)+1)
					options = options.filter(x => start.indexOf(x) == -1)
				}
				return v + nextLetter
			},"")
		} 

		this.refreshTablet()
	},
	
	refreshTablet() {
		if (!this.tablet)
			this.tablet = {}

		Object.keys(this.tablet).map(x => this.tablet[x] = this.codeword.includes(x))
	},
	
	advance(value) {
		if (!this.artifact || this.done) 
			return
		
		this.progress = (this.progress || 0) + value
		
		let advances = this.progress / this.artifact.codeCost | 0
		
		if (advances) {
			this.progress -= this.artifact.codeCost * advances
			
			const available = new Set(letterPairs)
			Object.keys(this.tablet).map(x => available.delete(x))
			while (advances--) {
				if (available.size == 0) break
				const pair = [...available][Math.random()*available.size | 0]
				this.tablet[pair] = this.codeword.includes(pair)
				if (this.tablet[pair]) this.goodGlyphs++
				available.delete(pair)

				if (game.skills.smartTablet && this.goodGlyphs == this.artifact.codeLength - 1) {
					[...available].map(x => this.tablet[x] = false)
					available.clear()
					advances = 0
					break
				}
			}
			if (available.size == 0) {
				this.progress = 0
				delete game.researching 
			}
			gui.artifacts.update(true)
			gui.artifacts.updateTablet(this.name)
		}
		return
	},
	
	finalize(word) {
		if (!this.artifact || !word || word.toUpperCase() != this.codeword) 
			return false
		this.done = true
		this.tablet = {}
		this.progress = 0
		if (game.researching == this.name) 
			game.researching = ""
		const done = Object.values(game.research).filter(x => x.done).length
		if (done >= 35) game.feats.science1 = true
		return true
	},
	
	badCodeWord(s) {
		if (s[0] == s[s.length-1]) return true
		if (Math.max(...letters.map(x => (s.match(RegExp(x, "g")) || []).length)) > 2) return true
		if (Math.max(...letterPairs.map(x => (s.match(RegExp(x, "g")) || []).length)) > 1) return true
		if (s.match(/([A-Z])[A-Z]*([A-Z])[A-Z]*\1[A-Z]*\2/g)) return true
		return false
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.artifact
		return o
	},
}

const Research = Template(researchHandler)