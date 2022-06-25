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
	resetData()
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
function resetData() {
	//Reset displays
	BUYER.open = false
	TUTORIAL.update()

	//Reset tmp
	tmp = {}
	updateTmp()
}

let tmp
function updateTmp() {
	BOOSTS.updateTmp()
	FACTORS.updateTmp()

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
	BOOSTS.calc(dt)
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

/* TUTORIAL */
let TUTORIAL = {
	open: false,
	toggle() {
		TUTORIAL.open = player.prime < 5 && !TUTORIAL.open
	},
	update(pass) {
		this.open = true
		if (player.prime >= 5) {
			if (!pass) this.open = false
			el("tutorial_help").innerHTML = "Congratulations!"
			el("tutorial_desc").innerHTML = "That's the basics of Factor Num Up. Click 'Help' in Options tab to check out more. The game starts to extend a lot from now. Good luck!"
		} else if (player.prime >= 4) {
			el("tutorial_help").innerHTML = "Boosts"
			el("tutorial_desc").innerHTML = "This is where Factors feel like multipliers to your progression, and as a main progression. [TBC]"
		} else if (player.prime >= 2) {
			el("tutorial_help").innerHTML = "Upgrades"
			el("tutorial_desc").innerHTML = "You can spend Number to get permanent upgrades that will implement a bit later. Get 2.00e10 to proceed."
		} else if (player.prime >= 1) {
			el("tutorial_help").innerHTML = "Prime"
			el("tutorial_desc").innerHTML = "Embracing resets your progress, in exchange of new content like Buyer! Get 20,000 to proceed."
		} else if (player.f[1] >= 1) {
			el("tutorial_help").innerHTML = "Factors"
			el("tutorial_desc").innerHTML = "Factors increase your Number production. Get 1,000 in order to Embrace!"
		} else {
			el("tutorial_help").innerHTML = "Welcome!"
			el("tutorial_desc").innerHTML = "In this game, you spend Number to increase your Factors for speed empowerment. Try it!"
		}
	}
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