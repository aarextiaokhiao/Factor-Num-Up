let BUYER = {
	unl: () => player.prime >= 1,
	list: ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
	data: {
		f1: {
			name: "Factor 1",
			unl: () => true
		},
		f2: {
			name: "Factor 2",
			unl: () => true
		},
		f3: {
			name: "Factor 3",
			unl: () => true
		},
		f4: {
			name: "Factor 4",
			unl: () => true
		},
		f5: {
			name: "Factor 5",
			unl: () => true
		},
		f6: {
			name: "Factor 6",
			unl: () => player.prime >= 2
		},
		f7: {
			name: "Factor 7",
			unl: () => player.prime >= 3
		},
	},

	getOrder() {
		let s = {}
		for (var i = 0; i < 10; i++) s[i] = []

		var list = this.list
		for (var i = 0; i < list.length; i++) if (player.buyer[list[i]].on) s[player.buyer[list[i]].p].push(list[i])

		let r = []
		for (var i = 0; i < 10; i++) r = r.concat(s[i])
		return r
	},
	buy() {
		let o = BUYER.getOrder()
		for (var r = 0; r < o.length; r++) {
			var i = o[r]
			if (i[0] = "f") FACTORS.buy(parseInt(i[1]))
		}
	},

	open: false,
	openMenu() {
		BUYER.open = !BUYER.open
		if (!BUYER.open) return

		var list = this.list
		var data = this.data
		for (var i = 0; i < list.length; i++) {
			var item = list[i]
			if (data[item].unl()) {
				show("buyer_"+item+"_div","table-row")

				el("buyer_"+item).checked = player.buyer[item].on
				if (player.prime < 3) hide("buyer_"+item+"_p_div")
				else {
					show("buyer_"+item+"_p_div")
					el("buyer_"+item+"_p").value = player.buyer[item].p
				}
			} else hide("buyer_"+item+"_div")
		}
	},

	setupHTML() {
		var html = ""
		var list = this.list
		var data = this.data
		for (var i = 0; i < list.length; i++) {
			var item = list[i]
			html += `<tr id="buyer_${item}_div">
				<td style="width: 240px; text-align: left"><b>${data[item].name}</b></td>
				<td id="buyer_${item}_p_div" style="width: 150px; text-align: left">Priority: <input id="buyer_${item}_p" style="width: 42px" type="number" min=0 max=9 onchange="player.buyer.${item}.p = parseInt(el('buyer_${item}_p').value)"></td>
				<td><input id="buyer_${item}" type="checkbox" onchange="player.buyer.${item}.on = el('buyer_${item}').checked"></td>
			</tr>`
		}
		el("buyer_div").innerHTML = html
	},
	updateHTML() {
		if (this.unl()) {
			el("buyer_open").innerHTML = BUYER.open ? "Close" : "Open Buyer"
			show("buyer")
		} else hide("buyer")

		if (BUYER.open) show("buyer_div")
		else hide("buyer_div")
	}
}