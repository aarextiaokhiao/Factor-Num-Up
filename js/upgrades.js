let UPGS = {
	amt(x) {
		return player.upgs[x] ? player.upgs[x].l : 0
	},
	buy(x) {
		if (UPGS.amt(1) == 1) return
		if (player.n < 1e4) return
		player.upgs[1] = {
			l: 1,
			t: 0,
			w: false,
		}
	},

	updateHTML() {
		el("upg_1_lvl").innerHTML = "["+this.amt(1)+"/1] Increase Factors"
		el("upg_1_eff").innerHTML = "Effect: +"+f(this.amt(1)/20,2)+"x"
		el("upg_1").className = "upgrade" + (this.amt(1) == 0 && player.n < 1e4 ? " locked" : "")
	}
}