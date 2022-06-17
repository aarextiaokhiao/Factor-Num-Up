let BUYER = {
	unl: () => player.prime >= 1,
	list: ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10"],
	data: {
		f1: {
			name: "Factor 1",
			unl: () => FACTORS.unls[1]()
		},
		f2: {
			name: "Factor 2",
			unl: () => FACTORS.unls[2]()
		},
		f3: {
			name: "Factor 3",
			unl: () => FACTORS.unls[3]()
		},
		f4: {
			name: "Factor 4",
			unl: () => FACTORS.unls[4]()
		},
		f5: {
			name: "Factor 5",
			unl: () => FACTORS.unls[5]()
		},
		f6: {
			name: "Factor 6",
			unl: () => FACTORS.unls[6]()
		},
		f7: {
			name: "Factor 7",
			unl: () => FACTORS.unls[7]()
		},
		f8: {
			name: "Factor 8",
			unl: () => FACTORS.unls[8]()
		},
		f9: {
			name: "Factor 9",
			unl: () => FACTORS.unls[9]()
		},
		f10: {
			name: "Factor 10",
			unl: () => FACTORS.unls[10]()
		},
	},

	getOrder() {
		let s = {}
		let list = this.list
		for (var i = 0; i < list.length; i++) {
			if (player.buyer[list[i]].on) {
				let p = player.buyer[list[i]].p
				if (!s[i]) s[i] = []
				s[i].push(list[i])
			}
		}

		let r = []
		for (var i in Object.keys(s)) r = r.concat(s[i])
		return r
	},
	buy() {
		let o = BUYER.getOrder()
		for (var r = 0; r < o.length; r++) {
			var i = o[r]
			var f = i.split("f")
			if (f[1]) FACTORS.buy(parseInt(f[1]))
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