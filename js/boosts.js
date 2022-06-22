let BOOSTS = {
	max: 6,
	list: [
		// Factors: 4
		// Upgrades: 2
		// TOTAL: 6 / 12
		null,
		{
			unl: () => true,
			save_id: "xn",
			id: "xN",
			desc: (x, r) => "Multiply Number by "+f(x,2)+"x",
			div: 5
		},
		{
			unl: () => true,
			save_id: "x2",
			id: "X2",
			desc: (x, r) => "Double Factor"+(r==0?"":r==5?" #5":"s #"+r+"-5"),
			div: 1
		},
		{
			unl: () => player.prime >= 5,
			save_id: "p1",
			id: "P-",
			desc: (x, r) => "Add a prior Factor by +"+f(x,1)+"x",
			div: 1
		},
		{
			unl: () => player.prime >= 5,
			save_id: "p2",
			id: "P+",
			desc: (x, r) => "Add the following Factor by +"+f(x,1)+"x",
			div: 1
		},
		{
			unl: () => true,
			save_id: "uc",
			id: "U$",
			desc: (x, r) => "Cheapen Upgrades by "+f(x,1)+"x",
			div: 10
		},
		{
			unl: () => player.prime >= 5,
			save_id: "ut",
			id: "UT",
			desc: (x, r) => "Speed up Upgrades by "+f(x,1)+"x",
			div: 10
		},
	],

	id(x) {
		return this.list[x].save_id
	},
	rank(x) {
		return player.bst[this.id(x)] || 0
	},
	eff(x) {
		let r = this.rank(x)
		return r == 0 ? 1 : (FACTORS.eff(r) - 1) / this.list[x].div + 1
	},

	setupHTML() {
		var html = ""
		for (var i = 1; i <= this.max; i++) {
			html += `<div class="bst" id="bst_${i}">
				<button class="bst_rnk" id="bst_rnk_${i}"></button>
				<div class="bst_eff" id="bst_eff_${i}"></div>
				<button class="bst_id upgrade" id="bst_upg_${i}">${BOOSTS.list[i].id}</button>
			</div>`
		}
		el("boosts").innerHTML = html
	},
	updateHTML() {
		for (var i = 1; i <= this.max; i++) {
			if (this.list[i].unl()) {
				show("bst_"+i, "block")
				el("bst_rnk_"+i).innerHTML = this.rank(i) == 0 ? "N" : "F" + this.rank(i)
				el("bst_eff_"+i).innerHTML = this.list[i].desc(this.eff(i), this.rank(i))
			} else hide("bst_"+i)
		}
	}
}