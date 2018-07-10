function load_theme() {
	var savefile=localStorage.getItem("MTUyODU5MDI3OTE5MQ==")
	if (savefile!=null) {
		var theme=JSON.parse(atob(savefile)).options.theme
		if (theme) if (theme!='Normal') document.getElementById('theme').href='stylesheets/theme-'+theme+'.css'
	}
}