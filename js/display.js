/* ELEMENTS */
let el = (x) => document.getElementById(x)
let hide = (x) => el(x).style.display = "none"
let show = (x, m) => el(x).style.display = m || "inline-block"

/* HTML */
let tab = "main"
function show_tab(x) {
	if (x == tab) return
	hide("tab_"+tab)
	show("tab_"+x)
	tab = x
	updateHTML()
}

function setupHTML() {
	FACTORS.setupHTML()
	BUYER.setupHTML()
	UPGS.setupHTML()
	BOOSTS.setupHTML()
}

function updateHTML() {
	el("number").innerHTML = f(player.n)
	el("num_prod").innerHTML = "("+f(tmp.n_prod,1)+"/s)"

	BUYER.updateHTML()

	if (player.prime >= 2) show("tab_upg_btn")
	else hide("tab_upg_btn")
	if (player.prime >= 4) show("tab_bst_btn")
	else hide("tab_bst_btn")
	if (player.prime >= 5) show("tab_chal_btn")
	else hide("tab_chal_btn")

	if (tab == "main") {
		FACTORS.updateHTML()
		PRIME.updateHTML()
	}
	if (tab == "upg") {
		UPGS.updateHTML()
	}
	if (tab == "bst") {
		BOOSTS.updateHTML()
	}
	if (tab == "opt") {
		el("time").innerHTML = formatTime(player.time)
	}

	el("tutorial").className = "tutorial " + (TUTORIAL.open ? "" : player.prime < 5 ? "semiclosed" : "closed")
}

/* NOTIFY */
let notifyTimeout
function notify(x) {
	clearTimeout(notifyTimeout)
	el("notify").className = "upgrade notify"
	el("notify").innerHTML = x
	notifyTimeout = setTimeout(unnotify, 5000)
}

function unnotify() {
	el("notify").className = "upgrade notify closed"
}

/* FORMAT */
function format(x, dp=0) {
	if (x < 0) return format(-x, dp)
	if (x == 1/0) return "Infinity"
	if (x >= 1e6) {
		let log = Math.floor(Math.log10(x))
		x /= Math.pow(10, log)
		let r = x.toFixed(2)
		if (r == 10) {
			r = "1.00"
			log++
		}
		return r+"e"+log
	}
	if (x >= 1e3) {
		let thous = Math.floor(x / 1000)
		let unit = Math.floor(x - 1000 * thous)
		return thous + "," + (unit < 10 ? "00" : unit < 100 ? 0 : "") + unit
	}
	return x.toFixed(dp)
}

function formatTime(x, mode) {
	if (x >= 86400) return Math.floor(x / 86400) + "d, " + formatTime(x % 86400, "day")
	if (x >= 3600 || mode == "day") return Math.floor(x / 3600) + ":" + formatTime(x % 3600, "hr")
	if (x >= 60 || mode == "hr") return (mode == "hr" && x < 600 ? "0" : "") + Math.floor(x / 60) + ":" + formatTime(x % 60, "min")
	return (mode == "min" && x < 10 ? "0" : "") + (Math.floor(x * 10) / 10).toFixed(1) + (!mode ? "s" : "")
}

const f = format