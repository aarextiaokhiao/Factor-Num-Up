let FACTORS = {
	eff(x) {
		let r = 1 + this.amt(x) * this.inc(x)
		r += UPGS.amt(1) / 20
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
	unl(x) {
		return x == 1 || player.f[x-1] !== undefined
	},
	can(x) {
		return FACTORS.unl(x) && player.n >= this.cost(x)
	},
	buy(x, max) {
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
		if (BUYER.open) hide("factors")
		else {
			show("factors")
			for (var i = 1; i <= 7; i++) {
				var unl = FACTORS.unl(i)
				if (unl) {
					show("f"+i)
					el("f"+i+"_mul").innerHTML = f(FACTORS.eff(i),1)
					el("f"+i+"_cost").innerHTML = "Cost: " + f(FACTORS.cost(i))
					el("f"+i).className = "factor" + (FACTORS.can(i) ? "" : " locked")
				} else hide("f"+i)
			}
		}
	}
}