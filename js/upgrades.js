let UPGS = {
	max: 12,
	list: [
		// Factors: 3
		// Boosts: 2
		// Automator: 2
		// Total: 7 / 12
		null,
		{
			unl: () => true,
			max: 10,
			time(l) {
				return l*2.5+5
			},
			desc: "Factor Strength",
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
			desc: "Factor Shift",
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
			unl: () => player.prime >= 3,
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
		},{
			unl: () => player.prime >= 4,
			max: 1,
			time(l) {
				return l*2.5+5
			},
			desc: "Extra Fuel",
			cost(l) {
				return 1/0
			},
			eff(l) {
				return l
			},
			effDesc(x) {
				return "+"+x+" Fuel"
			}
		},{
			unl: () => player.prime >= 4,
			max: 1,
			time(l) {
				return l*2.5+5
			},
			desc: "Boost Capacity",
			cost(l) {
				return 1/0
			},
			eff(l) {
				return l+1
			},
			effDesc(x) {
				return x+" per Factor"
			}
		},{
			unl: () => false,
			max: 0,
			time: () => 0,
			desc: "",
			cost: () => 1,
			eff: () => 1,
			effDesc: () => ""
		},{
			unl: () => false,
			max: 0,
			time: () => 0,
			desc: "",
			cost: () => 1,
			eff: () => 1,
			effDesc: () => ""
		},{
			unl: () => false,
			max: 0,
			time: () => 0,
			desc: "",
			cost: () => 1,
			eff: () => 1,
			effDesc: () => ""
		},{
			unl: () => false,
			max: 0,
			time: () => 0,
			desc: "",
			cost: () => 1,
			eff: () => 1,
			effDesc: () => ""
		},{
			unl: () => false,
			max: 0,
			time: () => 0,
			desc: "",
			cost: () => 1,
			eff: () => 1,
			effDesc: () => ""
		},
		//AUTOMATION
		{
			unl: () => player.prime >= 6,
			max: 1,
			time(l) {
				return l*2.5+5
			},
			desc: "QoL Buyer",
			cost(l) {
				return 1/0
			},
			eff(l) {
				return l
			},
			effDesc(x) {
				return "+"+x
			}
		},
		{
			unl: () => player.prime >= 6,
			max: 1,
			time(l) {
				return l*2.5+5
			},
			desc: "Faster Automation",
			cost(l) {
				return 1/0
			},
			eff(l) {
				return l
			},
			effDesc(x) {
				return "+"+x
			}
		}
	],
	cost(x) {
		let r = this.list[x].cost(this.amt(x))
		if (player.prime >= 4) r /= BOOSTS.eff(5)
		return r
	},
	amt(x) {
		return player.upgs[x] || 0
	},
	maxL(x) {
		return this.list[x].max
	},
	eff(x) {
		return this.list[x].eff(this.amt(x))
	},
	effDesc(x) {
		return this.list[x].effDesc(this.eff(x))
	},
	can(x) {
		if (this.amt(x) >= this.maxL(x)) return false
		if (player.n < this.cost(x)) return false
		if (player.upgs.q[x]) return false
		return true
	},
	buy(x) {
		if (!UPGS.can(x)) return
		player.n -= UPGS.cost(x)
		player.upgs.q[x] = UPGS.list[x].time(UPGS.amt(x))
	},

	speed() {
		let r = 1
		if (player.prime >= 4) r *= BOOSTS.eff(6)
		return r
	},

	calc(dt) {
		let q = player.upgs.q
		let o = Object.keys(q)
		for (var n in o) {
			var i = o[n]
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
		for (var i = 1; i <= this.max; i++) {
			html += `<button id="upg_${i}" onclick="UPGS.buy(${i})">
				<b>[<b id="upg_${i}_lvl"></b> / ${this.maxL(i)}] ${UPGS.list[i].desc}</b><br>
				<span id="upg_${i}_eff"></span><br>
				<span id="upg_${i}_cost"></span><br>
			</button>`
		}
		el("tab_upg").innerHTML = html		
	},
	updateHTML() {
		for (var i = 1; i <= this.max; i++) {
			if (this.list[i].unl()) {
				show("upg_"+i)
				el("upg_"+i).className = "upgrade" + (this.can(i) ? "" : " locked")
				el("upg_"+i+"_lvl").innerHTML = this.amt(i)
				el("upg_"+i+"_eff").innerHTML = "Effect: "+this.effDesc(i)
				el("upg_"+i+"_cost").innerHTML = player.upgs.q[i] ? "Time: " + formatTime(player.upgs.q[i]) : this.amt(i) == this.maxL(i) ? "" : "Cost: " + f(this.cost(i))
			} else hide("upg_"+i)
		}
	}
}