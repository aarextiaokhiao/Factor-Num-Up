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

function format(value,dpBefore1000,smallAllowed=false) {
	if (value == Number.POSITIVE_INFINITY) return '&#x221e;'
	if (Number.isNaN(value)) return '?'
	if (value<9.995) {
		if (smallAllowed&&value>0) {
			var exponent=Math.floor(Math.log10(value))
			var mantissa=value/Math.pow(10,exponent)
			if (mantissa>9.995) {
				mantissa=1
				exponent++
			}
			if (exponent<-5) return mantissa.toFixed(dpBefore1000)+'e'+exponent
			return value.toFixed(dpBefore1000-exponent)
		} else return value.toFixed(dpBefore1000)
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

function formatRate(r) {
	if (r*31556952<0.0095) return '0.00/s'
	else if (r*31556952<11.95) return (r*31556952).toFixed(2)+'/y'
	else if (r*2629746<4.345) return (r*2629746).toFixed(2)+'/mo'
	else if (r*604800<6.995) return (r*604800).toFixed(2)+'/w'
	else if (r*86400<23.95) return (r*86400).toFixed(2)+'/d'
	else if (r*3600<59.95) return (r*3600).toFixed(2)+'/h'
	else if (r*60<59.95) return (r*60).toFixed(2)+'/m'
	else return format(r,2)+'/s'
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
	var startWithoutSave=true
	try {
		var undecodedSave=localStorage.getItem("MTUyODU5MDI3OTE5MQ==")
		if (undecodedSave!=null) startWithoutSave=false
	} catch (e) {
		alert("Saving does not work if localStorage does not exist in your browser or it is broken. Try using other browsers or update your browser.")
		disableSave=true
		hideElement('option_save')
	}
	if (startWithoutSave) {
		openAdvBuySetting(0)
		updateMilestones()
		updateFeatures()
		gameLoopInterval=setInterval(gameLoop,50)
	} else loadSave(undecodedSave)
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
		if (savefile.version<0.18) {
			if (savefile.prime.features>7) savefile.prime.features-=1
			else if (savefile.prime.features>5) savefile.prime.features=6
			savefile.statistics.fastestHalfClickRun=Number.MAX_VALUE
			savefile.prime.gameBreak.parallelUniverse=0
		}
		if (savefile.version<0.19) {
			savefile.prime.automatedBuying.interval=Math.min(savefile.prime.automatedBuying.interval,1)
			savefile.prime.automatedBuying.prime={enabled:false,
				waitForNext:1}
			savefile.prime.challenges.highScore=[10,10,1,1,100,10,100,1000]
		}
		var needRevert=false
		if (savefile.version<0.2) {
			savefile.statistics.last10Embraces=[]
			if (savefile.prime.features>6&&savefile.prime.features<13) savefile.prime.features++
			savefile.statistics.highestParallelUniverse=0
			savefile.prime.boosts.dumped=0
			savefile.prime.boosts.virtual={weights:[0,0,0,0,0,0,0,0],
				fuelEfficient:0,
				currentChallenge:0,
				number:0,
				factors:[1,1,1,1,1,1,1,1],
				primeGainRatePeak:0,
				automatedBuying:{priorities:[1,2,3,4,5,6,7],
					enabled:[true,true,true,true,true,true,true],
					automatedEmbrace:false,
					waitForNextEmbrace:1}}
			savefile.statistics.thisVirtualPrime=0
			savefile.statistics.virtualPrimed=0
			savefile.prime.gameBreak.parallelDust=0
			if (savefile.milestones>18) savefile.milestones++
			else if (savefile.prime.gameBreak.upgrades.length>3) getMilestone(19)
			if (savefile.prime.gameBreak.parallelUniverse>1) needRevert=true
			savefile.options.theme='Normal'
			savefile.options.detailed=false
		}
		savefile.version=player.version
		savefile.beta=player.beta
		player=savefile
		if (needRevert) checkReset(1.02)
		if (virtual.activated&&player.prime.features<16) go_virtual()
		updateTheme()
		updateMilestones()
		for (id=0;id<player.prime.boosts.weights.length;id++) weightsThisPrime[id]=(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).weights[id]
		challengeNextPrime=virtual.activated?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current
		updateChallengeFactor()
		updatePrimeDivision()
		updateBoostDisplay()
		updateFactors()
		updateCosts()
		updatePrimeFactor()
		updateBugFactor()
		updateBugGainFactor()
		if (player.prime.features>15) {
			updatePrimeDivision(true)
			updateFactors(true)
			updateCosts(true)
			updatePrimeFactor(true)
			updateBugFactor(true)
		}
		for (id=0;id<7;id++) {
			advBuyPriorities[player.prime.advancedBuying.priorities[id]-1]=id+1
			autoBuyPriorities[player.prime.automatedBuying.priorities[id]-1]=id+1
			virtual.autoBuyPriorities[player.prime.boosts.virtual.automatedBuying.priorities[id]-1]=id+1
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
		}
		updateLast10Embraces()
		updateFeatures()
		if (player.prime.features<1) {
			hideElement('featureTabButton_upgrades','inline')
			if (currentFeatureTab=='upgrades') currentFeatureTab='features'
		} else showElement('featureTabButton_upgrades','inline')
		showElement('advancedBuying',player.prime.features>1?'table-cell':'none')
		openAdvBuySetting(player.prime.features>=advBuyTab*2?advBuyTab:0)
		if (player.prime.features<5) {
			hideElement('featureTabButton_boosts','inline')
			if (currentFeatureTab=='boosts') currentFeatureTab='features'
		} else showElement('featureTabButton_boosts','inline')
		if (player.prime.features<11) {
			hideElement('featureTabButton_game_break','inline')
			if (currentFeatureTab=='game_break') currentFeatureTab='features'
		} else showElement('featureTabButton_game_break','inline')
		if (player.prime.features>11) {
			showElement('half_clicks','table-cell')
			showElement('break_upgrades','table')
			updateElement('option_half_click_gain','Half click gain: '+(player.prime.gameBreak.halfClickGain?'ON':'OFF'))
		} else {
			hideElement('half_clicks')
			hideElement('break_upgrades')
		}
		showElement('parallel_universes',player.prime.features>12?'block':'none')
		updateElement('parallel_universe',player.prime.gameBreak.parallelUniverse+1)
		showElement('prestige_1.02',player.prime.features>16?'block':'none')
		updateClass('prestige_1.02',player.prime.gameBreak.parallelUniverse>0?'':'button_unaffordable')
		updateElement('option_detailed','Detailed: O'+(player.options.detailed?'N':'FF'))

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
		if (!disableSave) saveGame()
	} catch (e) {
		console.log('A error has been occurred while loading:')
		console.error(e)
	}
	tickSpeed=0
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
	clearInterval(gameLoopInterval)
	if (tier==Number.POSITIVE_INFINITY) {
		player.milestones=0
		player.prime.features=0
		player.prime.upgrades=[]
		player.prime.buyQuantity=1
		player.prime.advancedBuying={enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7]}
		player.prime.automatedBuying={autoBuyEnabled:false,
			interval:1,
			lastTick:0,
			enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7],
			prime:{enabled:false,
				waitForNext:1}}
		player.prime.boosts.fuelPack=1
		player.prime.challenges.highScore=[10,10,1,1,100,10,100,1000]
		player.prime.gameBreak.halfClickGain=false
		player.prime.gameBreak.upgrades=[]
		player.prime.automatedBuying.prime={enabled:false,
			waitForNext:1}
		player.statistics.playtime=0
		player.statistics.totalNumber=0
		player.statistics.fastestChallengeTimes={}
		delete player.statistics.thisHalfClickRun
		player.statistics.fastestHalfClickRun=Number.MAX_VALUE
		player.statistics.virtualPrimed=0
		player.options={notation:0,
			updateRate:20,
			theme:'Normal',
			detailed:false}
		maxMillisPerTick=50
		updateTheme()
		updateMilestones()
		updateFeatures()
		updateBoostDisplay()
		openAdvBuySetting(0)
		advBuyPriorities=[1,2,3,4,5,6,7]
		autoBuyPriorities=[1,2,3,4,5,6,7]
		virtual.activated=false
		
		hideElement('exportSave')
		updateElement('option_notation','Notation: '+notationArray[player.options.notation])
		updateElement('option_updateRate','Update rate: '+(player.options.updateRate==Number.MAX_VALUE?'Unlimited':player.options.updateRate+' TPS'))
		updateElement('option_detailed','Detailed: OFF')
	}
	if (tier>1.01) {
		player.prime.gameBreak.halfClicks=0
		player.prime.gameBreak.bugs=0
	}
	if (tier>1) {
		var dumped=tier>1.02?0:player.prime.boosts.dumped
		player.prime.boosts.dumped=0
		var keptFuel=dumped>0?nextBoostRequirements[dumped-1]:0
		player.prime.boosts.fuel=keptFuel
		for (id=0;id<weightsThisPrime.length;id++) {
			weightsThisPrime[id]=(id==dumped-1)?keptFuel:0
		}
		player.prime.boosts.fuelEfficient=1
		challengeNextPrime=0
		player.prime.challenges.completed=[]
		bugsNextPrime=0
		player.prime.gameBreak.parallelUniverse=(tier<1.02)?player.prime.gameBreak.parallelUniverse+1:0
		player.statistics.highestParallelUniverse=(tier<2)?Math.max(player.prime.gameBreak.parallelUniverse,player.statistics.highestParallelUniverse):0
		if (player.prime.features>17) player.prime.gameBreak.parallelDust=(tier<1.02)?player.prime.gameBreak.parallelDust+paraDustGain:0
		if (tier<1.01) {
			getMilestone(20)
			if (player.prime.gameBreak.parallelDust>1) getMilestone(22)
			if (player.prime.gameBreak.parallelUniverse>1) getMilestone(23)
		}
		updateElement('parallel_universe',player.prime.gameBreak.parallelUniverse+1)
		updateClass('prestige_1.02',player.prime.gameBreak.parallelUniverse>0?'':'button_unaffordable')
	}
	
	player.lastTick=new Date().getTime()
	if (tier<2) {
		if (player.statistics.last10Embraces.unshift([primeGain,primeGainRate,player.prime.primeGainRatePeak,player.number,false])>10) player.statistics.last10Embraces.pop()
	} else player.statistics.last10Embraces=[]
	player.number=0
	player.factors=[1,1,1,1,1,1,1]
	player.prime.primes=(tier>1)?0:player.prime.primes+primeGain
	player.prime.primeGainRatePeak=0
	if (!virtual.activated||tier>1) for (id=0;id<8;id++) if (player.prime.boosts.weights[id]!=weightsThisPrime[id]) player.prime.boosts.weights[id]=weightsThisPrime[id]
	if (player.prime.boosts.weights[0]>0) getMilestone(8)
	if (player.prime.boosts.weights[3]>0) getMilestone(9)
	if (player.prime.boosts.weights[7]>0) getMilestone(12)
	if (player.prime.challenges.current>0) {
		var challengeCompleted=(tier<1.01&&primeGain>=challengeGoals[player.prime.challenges.current-1])
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
			var highScore=player.prime.challenges.highScore[player.prime.challenges.current-1]
			if (player.prime.features>13&&primeGain>highScore) {
				player.prime.challenges.highScore[player.prime.challenges.current-1]=primeGain
			}
		}
		if (player.prime.features>10&&player.prime.challenges.current==4) {
			if (challengeCompleted&&player.prime.gameBreak.halfClickGain) {
				player.prime.gameBreak.bugs=0
				player.prime.gameBreak.halfClicks+=halfClickGain
				if (player.statistics.thisHalfClickRun>0) player.statistics.fastestHalfClickRun=Math.min(player.statistics.thisHalfClickRun,player.statistics.fastestHalfClickRun)
				player.statistics.thisHalfClickRun=0
				halfClickGain=0
				getMilestone(18)
			} else {
				player.prime.gameBreak.bugs=Math.max(player.prime.gameBreak.bugs,bugsNextPrime)
				if (bugsNextPrime>0) getMilestone(14)
				if (bugsNextPrime>649) getMilestone(15)
			}
		}
	}
	updateChallengeFactor()
	if (player.prime.challenges.current!=challengeNextPrime&&(!virtual.activated||tier>1)) {
		player.prime.challenges.current=challengeNextPrime
		if (challengeNextPrime==4&&!(player.statistics.thisHalfClickRun>0)) player.statistics.thisHalfClickRun=0
		updateBoostDisplay()
	} else if (tier>1) updateBoostDisplay()
	player.statistics.primed=(tier<2)?player.statistics.primed+1:0
	player.statistics.thisPrime=0
	updatePrimeDivision()
	if (!virtual.activated) for (id=0;id<8;id++) if (player.prime.boosts.fuel>=nextBoostRequirements[id]) updateElement('used_fuel_'+(id+1),getBoostWeightText(id))
	updateFactors()
	updateCosts()
	updatePrimeFactor()
	updateBugFactor()
	updateBugGainFactor()
	if (player.statistics.primed>0) getMilestone(5)
	if (player.milestones<5) {
		updateElement('lore_prime','As of now, you are only increasing the number. Meanwhile, there is something else you will embrace in your universe.<br>You have reached enough to able to lose your number for a conversion to a more powerful number.')
		updateElement('prestige_1','Convert your number and<br>embrace the power!')
		hideElement('featureTabs')
		hideElement('featureTabButton_upgrades')
		hideElement('featureTabButton_boosts')
		hideElement('featureTabButton_game_break')
		hideElement('half_clicks')
		hideElement('break_upgrades')
		hideElement('parallel_universes')
		hideElement('prestige_1.02')
		currentFeatureTab=''
		primeGain=1
		primeFactor=1
	} else {
		updateElement('lore_prime','Embracing the power of prime resets your number and your factors. You will earn a prime after you embraced.')
		showElement('featureTabs','block')
		if (currentFeatureTab=='') currentFeatureTab='features'
	}
	updateLast10Embraces()
	if (tier==Number.POSITIVE_INFINITY&&!disableSave) saveGame()
	if (!simulated&&tier<1.01) {
		tickSpeed=0
		gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
	}
}

function resetVirtual(tier) {
	clearInterval(gameLoopInterval)
	player.lastTick=new Date().getTime()
	if (tier<2) {
		if (player.statistics.last10Embraces.unshift([virtual.primeGain,virtual.primeGainRate,player.prime.boosts.virtual.primeGainRatePeak,player.prime.boosts.virtual.number,true])>10) player.statistics.last10Embraces.pop()
	} else {
		player.statistics.last10Embraces=[]
		player.prime.boosts.virtual.automatedBuying={priorities:[1,2,3,4,5,6,7],
			enabled:[true,true,true,true,true,true,true],
			automatedEmbrace:false,
			waitForNextEmbrace:1}
	}
	if (tier<1.01) player.prime.primes+=virtual.primeGain
	else player.prime.boosts.virtual.fuelEfficient=1
	player.prime.boosts.virtual.primeGainRatePeak=0
	player.prime.boosts.virtual.number=0
	player.prime.boosts.virtual.factors=[1,1,1,1,1,1,1]
	if (virtual.activated||tier>1) for (id=0;id<8;id++) if (player.prime.boosts.virtual.weights[id]!=weightsThisPrime[id]) player.prime.boosts.virtual.weights[id]=weightsThisPrime[id]
	if (player.prime.boosts.virtual.currentChallenge>0) {
		var challengeCompleted=(tier<1.01&&primeGain>=challengeGoals[player.prime.boosts.virtual.currentChallenge-1])
		if (challengeCompleted) {
			if (player.prime.challenges.completed.includes(player.prime.boosts.virtual.currentChallenge)) {
				player.statistics.fastestChallengeTimes[player.prime.boosts.virtual.currentChallenge]=player.statistics.thisPrime
			} else {
				player.prime.challenges.completed.push(player.prime.boosts.virtual.currentChallenge)
				showNotification('<b>Challenge #'+player.prime.boosts.virtual.currentChallenge+' completed!</b><br>You get 5 extra levels for boost #'+player.prime.boosts.virtual.currentChallenge+' only if you are not running the challenge.')
				if (player.prime.boosts.virtual.currentChallenge==1) getMilestone(13)
				if (player.prime.boosts.virtual.currentChallenge==4) getMilestone(16)
				if (player.prime.boosts.virtual.currentChallenge==8) getMilestone(17)
				player.statistics.fastestChallengeTimes[player.prime.boosts.virtual.currentChallenge]=Math.min(player.statistics.fastestChallengeTimes[player.prime.boosts.virtual.currentChallenge],player.statistics.thisPrime)
			}
			var highScore=player.prime.challenges.highScore[player.prime.boosts.virtual.currentChallenge-1]
			if (player.prime.features>13&&primeGain>highScore) {
				player.prime.challenges.highScore[player.prime.boosts.virtual.currentChallenge-1]=primeGain
			}
		}
		if (player.prime.features>10&&player.prime.boosts.virtual.currentChallenge==4) {
			if (challengeCompleted&&player.prime.gameBreak.halfClickGain) {
				player.prime.gameBreak.bugs=0
				player.prime.gameBreak.halfClicks+=virtual.halfClickGain
				if (player.statistics.thisHalfClickRun>0) player.statistics.fastestHalfClickRun=Math.min(player.statistics.thisHalfClickRun,player.statistics.fastestHalfClickRun)
				player.statistics.thisHalfClickRun=0
				virtual.halfClickGain=0
			} else {
				player.prime.gameBreak.bugs=Math.max(player.prime.gameBreak.bugs,virtual.bugsNextPrime)
				if (virtual.bugsNextPrime>0) getMilestone(14)
				if (virtual.bugsNextPrime>649) getMilestone(15)
			}
		}
	}
	updateChallengeFactor()
	if (player.prime.boosts.virtual.currentChallenge!=challengeNextPrime&&(virtual.activated||tier>1)) {
		player.prime.boosts.virtual.currentChallenge=challengeNextPrime
		if (challengeNextPrime==4&&!(player.statistics.thisHalfClickRun>0)) player.statistics.thisHalfClickRun=0
		updateBoostDisplay()
	} else if (tier>1) updateBoostDisplay()
	player.statistics.virtualPrimed=(tier<2)?player.statistics.virtualPrimed+1:0
	player.statistics.thisVirtualPrime=0
	updatePrimeDivision(true)
	if (virtual.activated) for (id=0;id<8;id++) if (player.prime.boosts.fuel>=nextBoostRequirements[id]) updateElement('used_fuel_'+(id+1),getBoostWeightText(id))
	updateFactors(true)
	updateCosts(true)
	updatePrimeFactor(true)
	updateBugFactor(true)
	updateBugGainFactor()
	if (!simulated) {
		tickSpeed=0
		gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
	}
}

function checkReset(tier,mode=0) {
	var checkVirtual=(virtual.activated&&mode<1)||mode>1
	console.log(checkVirtual)
	if (tier==1) {
		if (((checkVirtual?player.prime.boosts.virtual.number:player.number)<1e11||(checkVirtual?virtual.primeGain:primeGain)<1)&&challengeNextPrime<1) return
		if (mode<1&&challengeNextPrime>0&&(checkVirtual?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current)!=challengeNextPrime) if (!confirm('You are starting the challenge where boost #'+challengeNextPrime+' is negated. If you gain '+format(challengeGoals[challengeNextPrime-1])+' prime after embracing, you will be rewarded for extra used fuel.')) return
	}
	if (tier==1.01&&bugsHCProduct<nextParaUniReq) return
	if (tier==1.02&&player.prime.gameBreak.parallelUniverse<1) return
	if (tier==1/0) if (!confirm("Are you sure you want to reset everything in this game? Be careful, you can not undo this!")) return
	if (tier>1||!checkVirtual) resetGame(tier)
	if (tier>1||checkVirtual) resetVirtual(tier)
}

function changeUpdateRate() {
	clearInterval(gameLoopInterval)
	
	player.options.updateRate+=5
	if (player.options.updateRate==Number.MAX_VALUE) player.options.updateRate=5
	if (player.options.updateRate==65) player.options.updateRate=Number.MAX_VALUE
	
	updateElement('option_updateRate','Update rate: '+(player.options.updateRate==Number.MAX_VALUE?'Unlimited':player.options.updateRate+' TPS'))
	
	maxMillisPerTick=1000/player.options.updateRate
	tickSpeed=0
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function changeTheme() {
	if (player.options.theme=='Normal') player.options.theme='Dark'
	else if (player.options.theme=='Dark') player.options.theme='Neon'
	else player.options.theme='Normal'
	updateTheme()
}

function updateTheme() {
	document.getElementById('theme').href=player.options.theme=='Normal'?'':'stylesheets/theme-'+player.options.theme+'.css'
	updateElement('option_theme','Theme: '+player.options.theme)
}

function switchNotation() {
	player.options.notation++
	if (player.options.notation==notationArray.length) player.options.notation=0
	
	updateElement('option_notation','Notation: '+notationArray[player.options.notation])
	updateLast10Embraces()
	if (advBuyTab>1&&player.prime.automatedBuying.interval>0.01) updateAutoBuyIntervalDisplay()
	if (player.prime.features>13) updateBoostDisplay()
}

function toggleDetailed() {
	player.options.detailed=!player.options.detailed
	updateElement('option_detailed','Detailed: O'+(player.options.detailed?'N':'FF'))
	updateMilestones()
	updateLast10Embraces()
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
