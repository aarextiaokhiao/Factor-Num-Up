let UPGS = {
	list: [
		null,
		{
			unl: () => true,
			max: 10,
			time(l) {
				return l*2.5+5
			},
			desc: "Boost Factors",
			cost(l) {
				return Math.pow(40, Math.pow(l, 1.25)) * 2e4
			},
			eff(l) {
				return 0.5+l/10
			},
			effDesc(x) {
				return "+"+f(x,2)+"x"
			}
		},{
			unl: () => true,
			max: 4,
			time(l) {
				return l*10+20
			},
			desc: "Unlock Factors",
			cost(l) {
				return FACTORS.cost(l+6) * 10
			},
			eff(l) {
				return l+5
			},
			effDesc(x) {
				return x+" Factors"
			}
		},{
			unl: () => true,
			max: 10,
			time(l) {
				return l*10+30
			},
			desc: "Factor Self-Boost",
			cost(l) {
				return Math.pow(100, Math.pow(l, 1.25)) * 1e9
			},
			eff(l) {
				return l
			},
			effDesc(x) {
				return "x"+x
			}
		}
	],

	cost(x) {
		return this.list[x].cost(this.amt(x))
	},
	amt(x) {
		return player.upgs[x] || 0
	},
	max(x) {
		return this.list[x].max
	},
	eff(x) {
		return this.list[x].eff(this.amt(x))
	},
	effDesc(x) {
		return this.list[x].effDesc(this.eff(x))
	},
	can(x) {
		if (this.amt(x) >= this.max(x)) return false
		if (player.n < this.cost(x)) return false
		if (player.upgs.q[x]) return false
		return true
	},
	buy(x) {
		if (!UPGS.can(x)) return
		player.n -= UPGS.cost(x)
		player.upgs.q[x] = UPGS.list[x].time(UPGS.amt(x))
	},

	calc(dt) {
		let q = player.upgs.q
		for (var i in Object.keys(q)) {
			q[i] -= dt
			if (isNaN(q[i])) delete q[i]
			if (q[i] <= 0) {
				delete q[i]
				player.upgs[i] = this.amt(i) + 1
			}
		}
	},

	setupHTML() {
		var html = ""
		for (var i = 1; i < UPGS.list.length; i++) {
			html += `<button id="upg_${i}" onclick="UPGS.buy(${i})">
				<b>[<b id="upg_${i}_lvl"></b> / ${UPGS.max(i)}] ${UPGS.list[i].desc}</b><br>
				<span id="upg_${i}_eff"></span><br>
				<span id="upg_${i}_cost"></span><br>
			</button>`
		}
		el("tab_upg").innerHTML = html		
	},
	updateHTML() {
		for (var i = 1; i < UPGS.list.length; i++) {
			el("upg_"+i).className = "upgrade" + (this.can(i) ? "" : " locked")
			el("upg_"+i+"_lvl").innerHTML = this.amt(i)
			el("upg_"+i+"_eff").innerHTML = "Effect: "+this.effDesc(i)
			el("upg_"+i+"_cost").innerHTML = player.upgs.q[i] ? "Time: " + formatTime(player.upgs.q[i]) : this.amt(i) == this.max(i) ? "" : "Cost: " + f(this.cost(i))
		}
	}
}