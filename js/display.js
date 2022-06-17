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
}

function updateHTML() {
	el("number").innerHTML = f(player.n)
	el("num_prod").innerHTML = "("+f(tmp.n_prod,1)+"/s)"

	if (player.prime >= 2) show("tab_upg_btn")
	else hide("tab_upg_btn")

	if (tab == "main") {
		FACTORS.updateHTML()
		PRIME.updateHTML()
		BUYER.updateHTML()
	}
	if (tab == "upg") {
		UPGS.updateHTML()
	}
	if (tab == "opt") {
		el("time").innerHTML = formatTime(player.time)
	}
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
		return x.toFixed(2)+"e"+log
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
	return (mode == "min" && x < 9.95 ? "0" : "") + x.toFixed(1) + (!mode ? "s" : "")
}

const f = format