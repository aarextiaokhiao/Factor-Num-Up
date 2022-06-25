let FACTORS = {
	max: 10,

	eff(x) {
		return tmp.factors[x]
	},

	unls: [
		null,
		() => true,
		() => true,
		() => true,
		() => true,
		() => true,
		() => UPGS.amt(2) >= 1,
		() => UPGS.amt(2) >= 2,
		() => UPGS.amt(2) >= 3,
		() => UPGS.amt(2) >= 4,
		() => false,
	],

	amt(x) {
		return player.f[x] || 0
	},
	cost(x) {
		return Math.pow(2, this.amt(x) + x * (x + 1) / 1.8) * 2
	},
	unl(x) {
		return (x == 1 || player.f[x-1] !== undefined) && FACTORS.unls[x]()
	},
	can(x) {
		return FACTORS.unl(x) && player.n >= this.cost(x)
	},
	buy(x, max) {
		if (!FACTORS.can(x)) return
		player.n -= FACTORS.cost(x)
		player.f[x] = FACTORS.amt(x) + 1
		if (x == 1 && player.f[1] == 1 && player.prime == 0) TUTORIAL.update(true)
	},

	updateTmp() {
		var f = {}

		//Initial + Upgrade 1
		for (var i = 1; i <= this.max; i++) f[i] = 1 + UPGS.eff(1) * this.amt(i)

		//Double Factors
		if (player.prime >= 4 && BOOSTS.rank(2)) for (var i = BOOSTS.rank(2); i <= 5; i++) f[i] *= 2

		//Add Prior/Following Factors
		if (player.prime >= 4 && BOOSTS.rank(3)) f[i] += f[i+1]
		if (player.prime >= 4 && BOOSTS.rank(4)) f[i+1] += f[i]

		//Upgrade 3
		if (player.prime >= 2) for (var i = 1; i <= this.max; i++) f[i] += Math.log10(f[i]) * UPGS.eff(3)

		tmp.factors = f
	},

	setupHTML() {
		var html = ""
		for (var i = 1; i <= this.max; i++) {
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
			for (var i = 1; i <= this.max; i++) {
				var unl = FACTORS.unl(i)
				if (unl) {
					show("f"+i)
					el("f"+i+"_mul").innerHTML = f(FACTORS.eff(i),1)
					el("f"+i+"_cost").innerHTML = "Cost: " + f(FACTORS.cost(i))
					el("f"+i).className = "factor" + (FACTORS.can(i) ? "" : " locked")
				} else hide("f"+i)
			}
		}
	},
}