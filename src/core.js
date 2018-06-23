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
	openAdvBuySetting(0)
	var undecodedSave=localStorage.getItem("MTUyODU5MDI3OTE5MQ==")
	if (undecodedSave==null) {
		updateMilestones()
		updateFeatures()
		gameLoopInterval=setInterval(gameLoop,50)
	}
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
		if (savefile.version<0.13) {
			savefile.prime.advancedBuying={enabled:[true,true,true,true,true,true,true],
				priorities:[1,2,3,4,5,6,7]}
			savefile.prime.automatedBuying={enabled:[true,true,true,true,true,true,true],
				priorities:[1,2,3,4,5,6,7]}
		}
		if (savefile.version<0.14) {
			for (boost=5;boost<9;boost++) savefile.prime.boosts.weights.push(0)
			savefile.prime.automatedBuying.interval=5
			savefile.prime.automatedBuying.lastTick=0
			savefile.prime.fuelEfficient=1
		}
		if (savefile.version<0.15) savefile.prime.challenges={current:0,
			completed:[]}
		if (savefile.version<0.16) {
			savefile.prime.fuelPack=1
			savefile.prime.gameBreak={bugs:0}
		}
		if (savefile.version<0.162) {
			savefile.statistics.fastestChallengeTimes={}
		}
		if (savefile.version<0.17) {
			for (chall=1;chall<9;chall++) if (typeof(savefile.statistics.fastestChallengeTimes[chall])!='number') delete savefile.statistics.fastestChallengeTimes[chall]
			savefile.prime.boosts.fuelEfficient=savefile.prime.fuelEfficient
			savefile.prime.boosts.fuelPack=savefile.prime.fuelPack
			savefile.prime.gameBreak.halfClicks=0
			savefile.prime.gameBreak.halfClickGain=false
			savefile.prime.gameBreak.upgrades=[]
			delete savefile.prime.fuelEfficient
			delete savefile.prime.fuelPack
		}
		if (savefile.version<0.171) {
			if (savefile.prime.features>6) savefile.prime.features+=1
			else if (savefile.prime.features>3) savefile.prime.features=7
			else if (savefile.prime.features>2) savefile.prime.features=6
			savefile.prime.primeGainRatePeak=0
		}
		savefile.version=player.version
		savefile.beta=player.beta
		player=savefile
		updateMilestones()
		for (id=0;id<player.prime.boosts.weights.length;id++) weightsThisPrime[id]=player.prime.boosts.weights[id]
		updateBoosts()
		challengeNextPrime=player.prime.challenges.current
		updateBoostDisplay()
		updateFactors()
		updateCosts()
		updatePrimeFactor()
		updateBugGainFactor()
		bugFactor=Math.ceil(Math.pow(player.prime.gameBreak.bugs+1,player.prime.challenges.current==4?3/4:1/12))
		for (id=0;id<7;id++) {
			advBuyPriorities[player.prime.advancedBuying.priorities[id]-1]=id+1
			autoBuyPriorities[player.prime.automatedBuying.priorities[id]-1]=id+1
		}
		updateElement('currentChallenge',player.prime.challenges.current>0?'<b>Current challenge</b>: '+player.prime.challenges.current:'')
		
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
		showElement('featureTabButton_upgrades',player.prime.features>0?'inline':'none')
		showElement('advancedBuying',player.prime.features>3?'table-cell':'none')
		showElement('featureTabButton_boosts',player.prime.features>5?'inline':'none')
		showElement('featureTabButton_game_break',player.prime.features>10?'inline':'none')
		if (player.prime.features>11) {
			showElement('half_clicks','table-cell')
			showElement('break_upgrades','table')
			updateElement('option_half_click_gain','Half click gain: '+(player.prime.gameBreak.halfClickGain?'ON':'OFF'))
		} else {
			hideElement('half_clicks')
			hideElement('break_upgrades')
		}
		openAdvBuySetting(player.prime.features>advBuyTab+4?advBuyTab:0)
		updateElement('currentChallenge',player.prime.challenges.current>0?'<b>Current challenge</b>: '+player.prime.challenges.current:'')

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
		player.prime.advancedBuying={enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7]}
		player.prime.automatedBuying={autoBuyEnabled:false,
			interval:5,
			lastTick:0,
			enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7]}
		player.prime.boosts.fuelEfficient=1
		challengeNextPrime=0
		player.prime.challenges.completed=[]
		player.prime.boosts.fuelPack=1
		player.prime.gameBreak.bugs=0
		player.prime.gameBreak.halfClicks=0
		player.prime.gameBreak.halfClickGain=false
		player.prime.gameBreak.upgrades=[]
		bugsNextPrime=0
		player.statistics.playtime=0
		player.statistics.totalNumber=0
		player.statistics.fastestChallengeTimes={}
		player.options={notation:0,
			updateRate:20}
		for (id=0;id<weightsThisPrime.length;id++) weightsThisPrime[id]=0
		updateMilestones()
		updateFeatures()
		updateBoostDisplay()
		openAdvBuySetting(0)
		advBuyPriorities=[1,2,3,4,5,6,7]
		autoBuyPriorities=[1,2,3,4,5,6,7]
		
		hideElement('exportSave')
		updateElement('option_notation','Notation: '+notationArray[player.options.notation])
		updateElement('option_updateRate','Update rate: '+(player.options.updateRate==Number.MAX_VALUE?'Unlimited':player.options.updateRate+' TPS'))
	} else clearInterval(gameLoopInterval)
	
	player.lastTick=new Date().getTime()
	player.number=0
	player.factors=[1,1,1,1,1,1,1]
	player.prime.primes=(tier>1)?0:player.prime.primes+primeGain
	player.prime.primeGainRatePeak=0
	for (id=0;id<weightsThisPrime.length;id++) player.prime.boosts.weights[id]=weightsThisPrime[id]
	if (player.prime.boosts.weights[0]>0) getMilestone(8)
	if (player.prime.boosts.weights[3]>0) getMilestone(9)
	if (player.prime.boosts.weights[7]>0) getMilestone(12)
	if (player.prime.challenges.current>0) {
		var challengeCompleted=(tier<2&&primeGain>=challengeGoals[player.prime.challenges.current-1])
		if (challengeCompleted) {
			if (player.prime.challenges.completed.includes(player.prime.challenges.current)) {
				player.statistics.fastestChallengeTimes[player.prime.challenges.current]=player.statistics.thisPrime
			} else {
				player.prime.challenges.completed.push(player.prime.challenges.current)
				showNotification('<b>Challenge #'+player.prime.challenges.current+' completed!</b><br>You get 5 extra levels for boost #'+player.prime.challenges.current+' only if you are not running the challenge.')
				if (player.prime.challenges.current==1) getMilestone(13)
				if (player.prime.challenges.current==4) getMilestone(16)
				if (player.prime.challenges.current==8) getMilestone(17)
				player.statistics.fastestChallengeTimes[player.prime.challenges.current]=Math.min(player.statistics.fastestChallengeTimes[player.prime.challenges.current],player.statistics.thisPrime)
			}
		}
		if (player.prime.features>10&&player.prime.challenges.current==4) {
			if (challengeCompleted&&player.prime.gameBreak.halfClickGain) {
				player.prime.gameBreak.bugs=0
				player.prime.gameBreak.halfClicks+=halfClickGain
				halfClickGain=0
				getMilestone(18)
			} else {
				player.prime.gameBreak.bugs=Math.max(player.prime.gameBreak.bugs,bugsNextPrime)
				if (bugsNextPrime>0) getMilestone(14)
				if (bugsNextPrime>249) getMilestone(15)
			}
		}
	}
	if (player.prime.challenges.current!=challengeNextPrime) {
		player.prime.challenges.current=challengeNextPrime
		updateBoostDisplay()
	}
	bugFactor=Math.ceil(Math.pow(player.prime.gameBreak.bugs+1,player.prime.challenges.current==4?3/4:1/12))
	player.statistics.primed=(tier>1)?0:player.statistics.primed+1
	player.statistics.thisPrime=0
	updateBoosts()
	updateFactors()
	updateCosts()
	updatePrimeFactor()
	updateBugGainFactor()
	if (player.statistics.primed>0) getMilestone(5)
	if (player.milestones<5) {
		updateElement('lore_prime','As of now, you are only increasing the number. Meanwhile, there is something else you will embrace in your universe.<br>You have reached enough to able to lose your number for a conversion to a more powerful number.')
		updateElement('prestige_1','Convert your number and<br>embrace the power!')
		hideElement('featureTabs')
		hideElement('featureTabButton_upgrades')
		hideElement('featureTabButton_boosts')
		hideElement('advancedBuying')
		hideElement('featureTabButton_game_break')
		hideElement('half_clicks')
		hideElement('break_upgrades')
		currentFeatureTab=''
		primeGain=1
		primeFactor=1
	} else {
		updateElement('lore_prime','Embracing the power of prime resets your number and your factors. You will earn a prime after you embraced.')
		updateElement('currentChallenge',player.prime.challenges.current>0?'<b>Current challenge</b>: '+player.prime.challenges.current:'')
		showElement('featureTabs','block')
		if (currentFeatureTab=='') currentFeatureTab='features'
	}
	if (tier==Number.POSITIVE_INFINITY) saveGame()
	
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function checkReset(tier) {
	if (tier==1) {
		if ((player.number<1e11||primeGain<1)&&challengeNextPrime<1) return
		if (challengeNextPrime>0) if (player.prime.challenges.current!=challengeNextPrime) if (!confirm('You are starting the challenge where boost #'+challengeNextPrime+' is negated. If you gain '+format(challengeGoals[challengeNextPrime-1])+' prime after embracing, you will be rewarded for extra used fuel.')) return
	}
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
	if (advBuyTab>1&&player.prime.automatedBuying.interval>0.01) updateAutoBuyIntervalDisplay()
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