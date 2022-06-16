let PRIME = {
	can() {
		let p = PRIME[player.prime]
		return p !== undefined && player.n > p.req
	},
	embrace() {
		if (!PRIME.can()) return
		if (!confirm("Are you sure do you want to embrace? You will lose progress.")) return
		player.n = 0
		player.f = {}
		player.prime++
		notify("Congratulations, you have embraced into Prime #"+player.prime+"!")
	},
	eff() {
		return player.prime * 1.5 + 1
	},

	0: {
		req: 3e4,
		unl: "Buyer"
	},
	1: {
		req: 1e6,
		unl: "Upgrades"
	},
	2: {
		req: 1e9,
		unl: "Priorities"
	},
	/*3: {
		req: 1/0,
		unl: "Boosts"
	},
	4: {
		req: 1/0,
		unl: "Automator"
	},
	5: {
		req: 1/0,
		unl: "Challenges"
	},*/

	updateHTML() {
		let p = player.prime
		let exist = PRIME[p]

		if ((p > 0 || player.f[4] !== undefined) && !BUYER.open) {
			show("prime")
			el("prime_embrace").innerHTML = "["+p+"] Embrace the Prime!"
			el("prime_mul").innerHTML = f(PRIME.eff(),1)+"x factor"
			if (exist !== undefined) {
				el("prime").className = "upgrade" + (PRIME.can() ? "" : " locked")
				el("prime_req").innerHTML = "Requires " + f(exist.req)
				el("prime_unl").innerHTML = "Unlocks " + exist.unl
			} else {
				el("prime").className = "upgrade"
				el("prime_req").innerHTML = "Unlocked all!"
				el("prime_unl").innerHTML = "Come back soon."
			}
		} else hide("prime")
	}
}