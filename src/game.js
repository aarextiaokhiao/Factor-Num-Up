/* SAVES */
let saveId = btoa("fnup")
let isBeta = false
if (isBeta) saveId += "_beta"

function save() {
    localStorage.setItem(saveId, btoa(JSON.stringify(player)))
}

function new_save() {
	return {
		n: 0,
		f: {},

		tick: new Date().getTime()
	}
}

function load_save(x) {
	player = x != null ? JSON.parse(atob(x)) : new_save()
	resetTmp()
}

//Credit to MrRedShark77
function export_save() {
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Factor Num Up - "+new Date().toGMTString()+".txt"
    a.click()
}

function import_save(x) {
    load_save(prompt())
}

function reset_save() {
	if (!confirm("Do you wish to rollback to the beginning? Be cautious, there's no going back!")) return
	load_save(null)
}

/* ELEMENTS */
let el = (x) => document.getElementById(x)
let hide = (x) => el(x).style.display = "none"
let show = (x) => el(x).style.display = "inline-block"

/* TABS */
let tab = "main"
function show_tab(x) {
	hide("tab_"+tab)
	show("tab_"+x)
	tab = x
}

/* UPDATE */
let tmp
function resetTmp() {
	tmp = {}
	updateTmp()
}
function updateTmp() {
	tmp.n_prod = 1
	for (var i = 1; i <= 7; i++) tmp.n_prod *= FACTORS.eff(i)
}

let player = {}
function calc(dt) {
	player.n += tmp.n_prod * dt
}
function updateHTML() {
	el("number").innerHTML = player.n.toFixed(0)
	el("num_prod").innerHTML = "("+tmp.n_prod.toFixed(1)+"/s)"

	if (tab == "main") FACTORS.updateHTML()
}

function loop() {
	setInterval(function() {
		let time = new Date().getTime()
		if (time > player.tick) {
			updateTmp()
			calc((time - player.tick) / 1e3)
		}
		player.tick = time
	}, 30)
	setInterval(updateHTML, 50)
}

/* LOADING */
function setupHTML() {
	FACTORS.setupHTML()
}

function load_game() {
	setupHTML()
	load_save(localStorage.getItem(saveId))
	updateHTML()
	hide("loading")
	loop()
	//setInterval(save, 1500)
}