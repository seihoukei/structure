'use strict'

const researchHandler = {
	_init() {
		this.artifact = ARTIFACTS[this.name]
		if (!this.artifact) {
			console.log("Can't research "+this.name)
			return
		}
		this.type = RESEARCH_LETTERS
		
		if (!this.done && ((!this.codeWord) || this.codeWord.length != this.artifact.codeLength || (this.badCodeWord(this.codeWord)))) {
			this.initCodeWord()
		}
	
		this.goodGlyphs = Object.values(this.tablet).filter(x => x).length
	},
	
	initCodeWord() {

		const a = new Uint8Array(this.artifact.codeLength)
		this.codeWord = ""
		
		while (!this.codeWord || this.badCodeWord(this.codeWord)) {
			crypto.getRandomValues(a, this.artifact.codeLength)
			let options = [...LETTERS,...LETTERS]
			this.codeWord = a.reduce((v,x) => {
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

		Object.keys(this.tablet).map(x => this.tablet[x] = this.codeWord.includes(x))
	},
	
	advance(value) {
		if (!this.artifact || this.done) 
			return
		
		this.progress = (this.progress || 0) + value
		
		let advances = this.progress / this.artifact.codeCost | 0
		
		if (advances) {
			this.progress -= this.artifact.codeCost * advances
			
			const available = new Set(LETTER_PAIRS)
			Object.keys(this.tablet).map(x => available.delete(x))
			while (advances--) {
				if (available.size == 0) break
				const pair = [...available][Math.random()*available.size | 0]
				this.tablet[pair] = this.codeWord.includes(pair)
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
		if (!this.artifact || !word || word.trim().toUpperCase() != this.codeWord) 
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
		if (Math.max(...LETTERS.map(x => (s.match(RegExp(x, "g")) || []).length)) > 2) return true
		if (Math.max(...LETTER_PAIRS.map(x => (s.match(RegExp(x, "g")) || []).length)) > 1) return true
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

const numericResearchHandler = {
	_init() {
		this.artifact = ARTIFACTS[this.name]
/*		this.artifact = {
			codeDigits : 4,
			codeLength : 8,
			codeCost : 1e7
		}*/
		if (!this.artifact) {
			console.log("Can't research "+this.name)
			return
		}
		this.type = RESEARCH_NUMBERS
		
		if (!this.done && (!this.codeWord)) {
			this.initValues()
		}
		
		this.goodGlyphs = Object.values(this.tablet).filter(x => x.indexOf("?") == -1).length
	},
	
	initValues() {
		this.values = {}
		this.tablet = {}
		const pairs = new Set()
		LETTERS.map(x => {
			let newValue = 0
			while (!newValue) {
				newValue = (10 ** this.artifact.codeDigits) * Math.random() | 0
				if ([Object.values(this.values), newValue].some(x => pairs.has(x * newValue))) {
					newValue = 0
					continue
				}
			}
			
			this.values[x] = newValue
			Object.values(this.values).map(x => pairs.add(x * newValue))
			this.tablet[x] = "?".repeat(this.artifact.codeDigits)
		})
		this.found = 0
		this.maxFind = 26 * this.artifact.codeDigits
		
		const a = new Uint8Array(this.artifact.codeLength)
		
		crypto.getRandomValues(a, this.artifact.codeLength)
		this.codeWord = [...a].map(x => LETTERS[x%26]).join("")
		this.codeWord.split('').slice(0, this.codeWord.length-1).map((x,n) => {
			this.values["hint"+n] = this.values[x] * this.values[this.codeWord[n+1]]
			this.tablet["hint"+n] = "?".repeat(Math.floor(Math.log10(this.values["hint"+n]))+1)
			this.maxFind += this.tablet["hint"+n].length
		})		
	},
	
	pairCost(x) {
		return this.values[x[0]] * this.values[x[1]]
	},
	
	advance(value) {
		if (!this.artifact || this.done) 
			return
		
		this.progress = (this.progress || 0) + value
		
		let advances = this.progress / this.artifact.codeCost | 0
		
		if (advances) {
			this.progress -= this.artifact.codeCost * advances
			
			const available = new Set()
			Object.keys(this.tablet).map(x => this.tablet[x].split("").map((y, n) => y=="?"?available.add([x,n]):0))

			while (advances--) {
				if (available.size == 0) break
				const next = [...available][Math.random()*available.size | 0]
				this.tablet[next[0]] = this.tablet[next[0]].slice(0, next[1]) + Math.floor((this.values[next[0]]/(10**(this.tablet[next[0]].length - next[1]-1)))%10) + this.tablet[next[0]].slice(next[1]+1)
				this.found++
				if (this.tablet[next[0]].indexOf("?") == -1) this.goodGlyphs++
				available.delete(next)
				
				//add smartTablet2 support

/*				if (game.skills.smartTablet && this.goodGlyphs == this.artifact.codeLength - 1) {
					[...available].map(x => this.tablet[x] = false)
					available.clear()
					advances = 0
					break
				}*/
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
	
	finalize (word) {
		if (!this.artifact || !word || word.trim().toUpperCase() != this.codeWord) 
			return false
		this.done = true
		this.tablet = {}
		this.values = {}
		this.progress = 0
		if (game.researching == this.name) 
			game.researching = ""
		const done = Object.values(game.research).filter(x => x.done).length
		if (done >= 35) game.feats.science1 = true
		return true
	},
	
	toJSON() {
		let o = Object.assign({}, this)
		delete o.artifact
		return o		
	}
}

const NumericResearch = Template(numericResearchHandler)