/* SAVES */
let saveId = btoa("fnup")
let isBeta = false
if (isBeta) saveId += "_beta"

function save(man) {
	if (man) notify("Game saved.")
    localStorage.setItem(saveId, btoa(JSON.stringify(player)))
}

function new_save() {
	let s = {
		n: 0,
		f: {},

		upgs: { q: {} },
		bst: { f: 0 },

		prime: 0,
		time: 0,
		tick: new Date().getTime()
	}

	let b = BUYER.list
	let b_save = {}
	for (var i = 0; i < b.length; i++) b_save[b[i]] = {on: false, p: 0}
	s.buyer = b_save

	return s
}

function load_save(x) {
	player = new_save()
	if (x != null) player = deepUndefined(JSON.parse(atob(x)), player)
	if (player.upgs[1] && player.upgs[1].l) player.upgs[1] = 1
	resetTmp()
	save()
}

//Credit to MrRedShark77
function deepUndefined(obj, data) {
    if (obj == null) return data
    for (let x = 0; x < Object.keys(data).length; x++) {
        let k = Object.keys(data)[x]
        if (obj[k] === null) continue
        if (obj[k] === undefined) obj[k] = data[k]
        else {
            if (typeof obj[k] == 'object') deepUndefined(obj[k], data[k])
        }
    }
    return obj
}

//Credit to MrRedShark77
function export_save() {
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Factor Num Up - "+new Date().toGMTString()+".txt"
    a.click()
	notify("Game exported.")
}

function import_save(x) {
    load_save(prompt())
}

function reset_save() {
	if (!confirm("Do you wish to rollback to the beginning? Be cautious, there's no going back!")) return
	notify("Game has been wiped!")
	load_save(null)
}

/* UPDATE */
let tmp
function resetTmp() {
	//Reset displays
	BUYER.open = false

	//Reset tmp
	tmp = {}
	updateTmp()
}
function updateTmp() {
	tmp.n_prod = 1
	for (var i = 1; i <= FACTORS.max; i++) tmp.n_prod *= FACTORS.eff(i)
	if (player.prime >= 1) tmp.n_prod *= PRIME.eff()
	if (player.prime >= 4) tmp.n_prod *= BOOSTS.eff(1)
}

let player = {}
function calc(dt) {
	player.n += tmp.n_prod * dt
	player.time += dt

	UPGS.calc(dt)
}

function loop() {
	setInterval(function() {
		let time = new Date().getTime()
		if (time > player.tick) {
			let dt = (time - player.tick) / 1e3
			if (dt > 20) notify("Welcome back! You were away for: " + formatTime(dt))
			updateTmp()
			calc(dt)
		}
		player.tick = time
	}, 30)
	setInterval(updateHTML, 50)
}

/* LOADING */
function load_game() {
	setupHTML()
	load_save(localStorage.getItem(saveId))
	updateHTML()
	loop()
	setTimeout(() => hide("loading"), 200)
	setInterval(save, 2e4)
}