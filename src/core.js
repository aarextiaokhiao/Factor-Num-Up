function showElement(elementID,style) {
	document.getElementById(elementID).style.display=style
}
	
function hideElement(elementID) {
	document.getElementById(elementID).style.display='none'
}
	
function moveElement(elementID,moveTo) {
	document.getElementById(moveTo).appendChild(document.getElementById(elementID))
}
	
function updateClass(elementID,value) {
	document.getElementById(elementID).className=value
}
	
function updateStyle(elementID,styleID,value) {
	document.getElementById(elementID).style[styleID]=value
}

function updateElement(elementID,value) {
	document.getElementById(elementID).innerHTML=value
}

function switchTab(id) {
	currentTab=id
}

function format(value,dpBefore1000) {
	if (value == Number.POSITIVE_INFINITY) return '&#x221e;'
	if (Number.isNaN(value)) return '?'
	if (value<9.995) {
		return value.toFixed(dpBefore1000)
	} else if (value<99.95) {
		return value.toFixed(Math.max(dpBefore1000-1,0))
	} else if (value<999.5) {
		return value.toFixed(Math.max(dpBefore1000-2,0))
	} else if (player.options.notation!=3) {
		var exponent=Math.floor(Math.log10(value))
		var mantissa=value/Math.pow(10,exponent)
		if (mantissa>9.995) {
			mantissa=1
			exponent++
		}
		if (player.options.notation!=0) {
			var difference=exponent%3
			var group=(exponent-difference)/3
			mantissa=mantissa*Math.pow(10,difference)
		}
	}
	if (player.options.notation==0) {
		//Scientific
		return mantissa.toFixed(2)+'e'+exponent
	} else if (player.options.notation==1) {
		//Engineering
		return mantissa.toFixed(2-difference)+'e'+group*3
	} else if (player.options.notation==2) {
		//Standard
		return mantissa.toFixed(2-difference)+standardAbbs[group-1]
	} else if (player.options.notation==3) {
		//Logarithm
		return 'e'+Math.log10(value).toFixed(2)
	} else if (player.options.notation==4) {
		//Letters
		return mantissa.toFixed(2-difference)+lettersAbbs[group-1]
	} else if (player.options.notation==5) {
		//Mobile
		return mantissa.toFixed(2-difference)+mobileAbbs[group-1]
	}
	return '?'
}

function formatTime(s) {
	if (s < 1) {
		if (s < 0.002) return '1 millisecond'
		return Math.floor(s*1000)+' milliseconds'
	} else if (s < 59.5) {
		if (s < 1.005) return '1 second'
		return s.toPrecision(2)+' seconds'
	} else if (s < Number.POSITIVE_INFINITY) {
		var timeFormat=''
		var lastTimePart=''
		var needAnd=false
		var needComma=false
		for (id in timeframes) {
			if (id=='second') {
				s=Math.floor(s)
				if (s>0) {
					if (lastTimePart!='') {
						if (timeFormat=='') {
							timeFormat=lastTimePart
							needAnd=true
						} else {
							timeFormat=timeFormat+', '+lastTimePart
							needComma=true
						}
					}
					lastTimePart=s+(s==1?' second':' seconds')
				}
			} else if (id=='year') {
				var amount=Math.floor(s/31556952)
				if (amount>0) {
					s-=amount*31556952
					lastTimePart=format(amount,2,1)+(amount==1?' year':' years')
				}
			} else {
				var amount=Math.floor(s/timeframes[id])
				if (amount>0) {
					s-=amount*timeframes[id]
					if (lastTimePart!='') {
						if (timeFormat=='') {
							timeFormat=lastTimePart
							needAnd=true
						} else {
							timeFormat=timeFormat+', '+lastTimePart
							needComma=true
						}
					}
					lastTimePart=amount+' '+id+(amount==1?'':'s')
				}
			}
		}
		return timeFormat+(needComma?',':'')+(needAnd?' and ':'')+lastTimePart
	} else {
		return 'eternity'
	}
}

function loadGame() {
	var undecodedSave=localStorage.getItem("MTUyODU5MDI3OTE5MQ==")
	if (undecodedSave==null) gameLoopInterval=setInterval(gameLoop,50)
	else loadSave(undecodedSave)
	gameLoop()
}

function saveGame() {
	try {
		localStorage.setItem("MTUyODU5MDI3OTE5MQ==",btoa(JSON.stringify(player)))
		lastSave=new Date().getTime()
	} catch (e) {
		console.log('A error has been occurred while saving:')
		console.error(e)
	}
}

function loadSave(savefile) {
	clearInterval(gameLoopInterval)
		
	try {
		savefile=JSON.parse(atob(savefile))
		if (savefile.version>player.version) throw 'This savefile, which has version '+savefile.version+' saved, was incompatible to version '+player.version+'.'
		else if (savefile.version==player.version) {
			if (savefile.beta>player.beta) throw 'This savefile, which has beta '+savefile.beta+' saved, was incompatible to beta '+player.beta+'.'			
		}
		if (savefile.version<0.11) {
			savefile.prime.boosts={fuel:0,
				weights:[0]}
			savefile.prime.buyMode=1
		}
		if (savefile.version<0.12) {
			var validFurthestFeatureUnlocked=0
			while (savefile.prime.features.includes(validFurthestFeatureUnlocked+1)) validFurthestFeatureUnlocked++
			savefile.prime.features=validFurthestFeatureUnlocked
			for (boost=2;boost<5;boost++) savefile.prime.boosts.weights.push(0)
		}
		savefile.version=player.version
		savefile.beta=player.beta
		player=savefile
		updateMilestones()
		for (id=0;id<player.prime.boosts.weights.length;id++) weightsThisPrime[id]=player.prime.boosts.weights[id]
		updateBoosts()
		updateBoostDisplay()
		updateCosts()
		updateFactors()
		updatePrimeFactor()
		
		hideElement('exportSave')
		updateElement('option_notation','Notation: '+notationArray[player.options.notation])
		updateElement('option_updateRate','Update rate: '+(player.options.updateRate==Number.MAX_VALUE?'Unlimited':player.options.updateRate+' TPS'))
		if (player.milestones<5) {
			updateElement('lore_prime','As of now, you are only increasing the number. Meanwhile, there is something else you will embrace in your universe.<br>You have reached enough to able to lose your number for a conversion to a more powerful number.')
			updateElement('prestige_1','Convert your number and<br>embrace the power!')
			hideElement('featureTabs')
			currentFeatureTab=''
			primeGain=1
		} else {
			updateElement('lore_prime','Embracing the power of prime resets your number and your factors. You will earn a prime after you embraced.')
			showElement('featureTabs','block')
			if (currentFeatureTab=='') currentFeatureTab='features'
			updateFeatures()
		}
		if (player.prime.features>0) {
			showElement('featureTabButton_upgrades','inline')
		} else hideElement('featureTabButton_upgrades')
		if (player.prime.features>2) {
			showElement('featureTabButton_boosts','inline')
		} else hideElement('featureTabButton_boosts')

		tickAfterSimulated=new Date().getTime()
		simulated=true
		simulatedTickLength=(tickAfterSimulated-player.lastTick)/1e6
		simulatedTicksLeft=1000
		while (simulatedTicksLeft>0) {
			gameTick()
			simulatedTicksLeft--
		}
		simulated=false
		player.lastTick=tickAfterSimulated
		maxMillisPerTick=1000/player.options.updateRate
		saveGame()
	} catch (e) {
		console.log('A error has been occurred while loading:')
		console.error(e)
	}
	
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function exportSave() {
	var savefile=btoa(JSON.stringify(player))
	showElement('exportSave','block')
	document.getElementById("exportText").value=btoa(JSON.stringify(player))
}

function importSave() {
	var savefile=prompt('Copy and paste in your exported file and press enter.')
	if (savefile!='') loadSave(savefile)
}

function resetGame(tier) {
	if (tier==Number.POSITIVE_INFINITY) {
		if (!confirm("Are you sure you want to reset everything in this game? Be careful, you can not undo this!")) return
		clearInterval(gameLoopInterval)
		player.milestones=0
		player.prime.features=0
		player.prime.upgrades=[]
		player.prime.buyQuantity=1
		player.prime.boosts.fuel=0
		player.statistics.playtime=0
		player.statistics.totalNumber=0
		player.options={notation:0,
			updateRate:20}
		for (id=0;id<weightsThisPrime.length;id++) weightsThisPrime[id]=0
		updateMilestones()
		updateFeatures()
		updateBoostDisplay()
		
		hideElement('exportSave')
		updateElement('option_notation','Notation: '+notationArray[player.options.notation])
		updateElement('option_updateRate','Update rate: '+(player.options.updateRate==Number.MAX_VALUE?'Unlimited':player.options.updateRate+' TPS'))
	} else clearInterval(gameLoopInterval)
	
	player.lastTick=new Date().getTime()
	player.number=0
	player.factors=[1,1,1,1,1,1,1]
	player.prime.primes=(tier>1)?0:player.prime.primes+primeGain
	for (id=0;id<weightsThisPrime.length;id++) player.prime.boosts.weights[id]=weightsThisPrime[id]
	if (player.prime.boosts.weights[0]>0) getMilestone(8)
	if (player.prime.boosts.weights[3]>0) getMilestone(9)
	player.statistics.primed=(tier>1)?0:player.statistics.primed+1
	player.statistics.thisPrime=0
	player.options={notation:0,
		updateRate:20}
	updateBoosts()
	updateCosts()
	updateFactors()
	updatePrimeFactor()
	if (player.statistics.primed>0) getMilestone(5)
	if (player.milestones<5) {
		updateElement('lore_prime','As of now, you are only increasing the number. Meanwhile, there is something else you will embrace in your universe.<br>You have reached enough to able to lose your number for a conversion to a more powerful number.')
		updateElement('prestige_1','Convert your number and<br>embrace the power!')
		hideElement('featureTabs')
		hideElement('featureTabButton_upgrades')
		hideElement('featureTabButton_boosts')
		currentFeatureTab=''
		primeGain=1
		primeFactor=1
	} else {
		updateElement('lore_prime','Embracing the power of prime resets your number and your factors. You will earn a prime after you embraced.')
		showElement('featureTabs','block')
		if (currentFeatureTab=='') currentFeatureTab='features'
	}
	if (tier==Number.POSITIVE_INFINITY) saveGame()
	
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function checkReset(tier) {
	if (tier==1&&(player.number<1e11||primeGain<1)) return
	resetGame(tier)
}

function changeUpdateRate() {
	clearInterval(gameLoopInterval)
	
	player.options.updateRate+=5
	if (player.options.updateRate==Number.MAX_VALUE) player.options.updateRate=5
	if (player.options.updateRate==65) player.options.updateRate=Number.MAX_VALUE
	
	updateElement('option_updateRate','Update rate: '+(player.options.updateRate==Number.MAX_VALUE?'Unlimited':player.options.updateRate+' TPS'))
	
	maxMillisPerTick=1000/player.options.updateRate
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function switchNotation() {
	player.options.notation++
	if (player.options.notation==notationArray.length) player.options.notation=0
	
	updateElement('option_notation','Notation: '+notationArray[player.options.notation])
}

function gameLoop() {
	if (tickDone) {
		tickDone=false
		setTimeout(function(){
			var startTime=new Date().getTime()
			try {
				gameTick()
			} catch (e) {
				console.log('A game error has occured:')
				console.error(e)
			}
			tickSpeed=Math.max((new Date().getTime()-startTime)*0.2+tickSpeed*0.8,maxMillisPerTick)
			startTime=new Date().getTime()
			tickDone=true
		},tickSpeed-maxMillisPerTick)
	}
}