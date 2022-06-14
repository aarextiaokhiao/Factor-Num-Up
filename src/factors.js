let FACTORS = {
	eff(x) {
		let r = 1 + this.amt(x) * this.inc(x)
		return r
	},
	inc(x) {
		return 0.5
	},

	amt(x) {
		return player.f[x] || 0
	},
	cost(x) {
		return Math.pow(4 + x, x - 1) * Math.pow(2, this.amt(x)) * 5
	},
	can(x) {
		return player.n >= this.cost(x)
	},
	buy(x) {
		if (!FACTORS.can(x)) return
		player.n -= FACTORS.cost(x)
		player.f[x] = FACTORS.amt(x) + 1
	},

	setupHTML() {
		var html = ""
		for (var i = 1; i <= 7; i++) {
			html += `<button class="factor" id="f${i}" onclick="FACTORS.buy(${i})">
				<div class="factor_num">${i}</div>
				<div class="factor_mul" id="f${i}_mul">1x</div>
				<div class="factor_cost" id="f${i}_cost">Cost: 5</div>
			</button> `
		}
		el("factors").innerHTML = html
	},
	updateHTML() {
		for (var i = 1; i <= 7; i++) {
			var unl = i == 1 || FACTORS.amt(i-1)
			if (unl) {
				show("f"+i)
				el("f"+i+"_mul").innerHTML = FACTORS.eff(i).toFixed(1)
				el("f"+i+"_cost").innerHTML = "Cost: " + FACTORS.cost(i).toFixed(0)
				el("f"+i).className = "factor" + (FACTORS.can(i) ? "" : " locked")
			} else hide("f"+i)
		}
	}
}