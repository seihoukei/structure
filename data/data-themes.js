'use strict'

const THEMES = {
	light : {
		main : {
			background : "white",
			foreground : "black",
			shades : ["#000000","#111111","#222222","#333333","#444444","#555555","#666666","#777777","#888888","#999999","#AAAAAA","#BBBBBB","#CCCCCC","#DDDDDD","#EEEEEE","#FFFFFF"],
			typeColors : [
				"#EEEEEE",
				"#FFFF55",
				"#ADFF2F",
				"#DC143C",
				"#FF8C00",
				"#00FFFF",
				"#BBBBBB",
			],
			enchantmentColors : [
				"#777777",
				"#999955",
				"#559999",
				"#995599",
				"#995555",
			],
			icons : {
				levelUp : "#003300"
			},
			radar : "lime",
			special : "black",
			lightning : "rgba(32,64,256,0.5)",
			magic : "rgba(0,0,0,0.1)",
			magicbg: "rgba(0,0,0,0.05)",
			mouseOwned : "green",
			mouseEnemy : "maroon",
			progress : "maroon",
			
		},
		boss : {
		}
	}, 	
	dark : {
		main : {
			background : "#222222",
			foreground : "#DDDDDD",
			shades : ["#DDDDDD", 
					  "#D0D0D0", 
					  "#C4C4C4", 
					  "#B7B7B7", 
					  "#ABABAB", 
					  "#9E9E9E", 
					  "#929292", 
					  "#858585", 
					  "#797979", 
					  "#6C6C6C", 
					  "#606060", 
					  "#535353", 
					  "#474747", 
					  "#3A3A3A", 
					  "#2E2E2E", 
					  "#222222"],
			typeColors : [
				"#444444",
				"#AAAA00",
				"#00AA00",
				"#AA0000",
				"#AA6600",
				"#0066AA",
				"#666666",
			],    
			enchantmentColors : [
				"#858585",
				"#AAAA66",
				"#66AAAA",
				"#AA66AA",
				"#AA6666"
			],
			icons : {
				levelUp : "#003300"
			},
			radar : "lime",
			special : "white",
			lightning : "rgba(32,64,256,0.5)",
			magic: "rgba(0,0,0,0.3)",
			magicbg: "rgba(0,0,0,0.3)",
			mouseOwned : "green",
			mouseEnemy : "maroon",
			progress : "maroon",
		},
		boss : {
		}
	}, 
}