let BOOSTS = {
	//LIST
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
		},
		{
			unl: () => player.prime >= 5,
			save_id: "p1",
			id: "P-",
			desc: (x, r) => r ? "Factor #" + (r+1) + " adds Factor #" + r : "Factor adds its prior factor",
		},
		{
			unl: () => player.prime >= 6,
			save_id: "p2",
			id: "P+",
			desc: (x, r) => "Add the following Factor",
		},
		{
			unl: () => true,
			save_id: "uc",
			id: "U$",
			desc: (x, r) => "Cheapen Upgrades by "+f(x,1)+"x",
			div: 10,
			pow: 1/3,
		},
		{
			unl: () => player.prime >= 6,
			save_id: "ut",
			id: "UT",
			desc: (x, r) => "Speed up Upgrades by "+f(x,1)+"x",
			div: 10,
			pow: 1/3,
		},
	],

	//FUEL
	getFuel(x) {
		if (player.n < 1e9) return 0
		return Math.floor((Math.log10(player.n) - 8) / 1.5) + this.extraFuel()
	},
	extraFuel() {
		return UPGS.eff(4)
	},
	nextFuel(x) {
		return Math.pow(10, Math.max(x - this.extraFuel() + 1, 1) * 1.5 + 8)
	},
	unspent() {
		return Math.max(player.bst.f - tmp.boost_total, 0)
	},

	//BUYING
	cost(r) {
		return Math.pow(6 - r, 1.25)
	},
	can(x) {
		let rnk = this.nextRank(x)
		return this.unspent() >= this.cost(rnk) && (tmp.boost_ranks[rnk] || 0) < UPGS.eff(5)
	},
	buy(x) {
		if (!BOOSTS.can(x)) return
		player.bst[BOOSTS.id(x)] = BOOSTS.nextRank(x)
		BOOSTS.updateTmp()
	},
	respec() {
		if (tmp.boost_total == 0) return
		if (!confirm("Are you sure do you want to respec? Number will be reset!")) return
		player.bst = { f: player.bst. f }
		player.n = 0
	},

	//BOOSTING
	id(x) {
		return this.list[x].save_id
	},
	rank(x) {
		return player.bst[this.id(x)] || 0
	},
	nextRank(x) {
		return (player.bst[this.id(x)] || 6) - 1
	},
	eff(x) {
		let r = this.rank(x)
		let eff = 1
		let lst = this.list[x]
		if (r > 0) {
			eff = FACTORS.eff(r) - 1
			if (lst.div) eff /= lst.div
			eff += 1
			if (lst.pow) eff = Math.pow(eff, lst.pow)
		}
		return eff
	},

	//TECHNICAL
	updateTmp() {
		let c = 0
		let r = {}
		let o = Object.keys(player.bst)
		for (var i in o) {
			var id = o[i]
			if (id != "f") {
				var rnk = player.bst[id]
				c += this.cost(rnk)
				r[rnk] = (r[rnk] || 0) + 1
			}
		}
		tmp.boost_total = c
		tmp.boost_ranks = r
	},
	calc(dt) {
		player.bst.f = Math.max(player.bst.f, this.getFuel())
	},

	setupHTML() {
		var html = ""
		for (var i = 1; i <= this.max; i++) {
			html += `<div class="bst" id="bst_${i}">
				<button class="bst_rnk" id="bst_rnk_${i}"></button>
				<div class="bst_eff" id="bst_eff_${i}"></div>
				<button class="bst_id upgrade" id="bst_upg_${i}" onclick="BOOSTS.buy(${i})">${BOOSTS.list[i].id}</button>
			</div>`
		}
		el("boosts").innerHTML = html
	},
	updateHTML() {
		el("bst_fuel").innerHTML = "You have " + f(this.unspent(),2) + " Fuel"
		el("bst_nxt").innerHTML = "(Next: " + f(this.nextFuel(player.bst.f)) + ")"
		for (var i = 1; i <= this.max; i++) {
			if (this.list[i].unl()) {
				show("bst_"+i, "block")
				el("bst_rnk_"+i).innerHTML = this.rank(i) == 0 ? "N" : "F" + this.rank(i)
				el("bst_eff_"+i).innerHTML = this.list[i].desc(this.eff(i), this.rank(i))
				el("bst_upg_"+i).className = "bst_id " + (this.can(i) ? "upgrade" : "locked")
			} else hide("bst_"+i)
		}
	}
}