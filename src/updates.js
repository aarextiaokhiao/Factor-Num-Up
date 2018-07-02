function gameTick() {
	var tickTime=new Date().getTime()
	if (simulated) var delta=simulatedTickLength
	else {
		var delta=(tickTime-player.lastTick)/1000
		sinceLastSave=Math.floor((tickTime-lastSave)/1000)
	}
	if (sinceLastSave>59) {
		saveGame()
	}
	player.statistics.playtime+=delta
	player.statistics.thisPrime+=delta
	player.statistics.thisHalfClickRun+=delta
	
	if (player.prime.upgrades.includes(5)||player.prime.upgrades.includes(11)) updatePrimeFactor()
	if (player.prime.upgrades.includes(6)) {
		smslpTemp=Math.floor(player.statistics.thisPrime/300)
		if (smslpTemp!=sixMinutesSinceLastPrime) {
			sixMinutesSinceLastPrime=smslpTemp
			updateFactors()
		}
	}
	if (usedFuelWithExtras[2]+usedFuelWithExtras[5]>0) updateBoosts()
	numberPerSecond=factors[0]*factors[1]*factors[2]*factors[3]*factors[4]*factors[5]*factors[6]*primeFactor*boostFactors[0]*bugFactor*challengeFactor
	player.number+=numberPerSecond*delta
	player.statistics.totalNumber+=numberPerSecond*delta
	
	if (player.milestones>4) {
		primeGain=Math.floor(Math.pow(player.number/1e11,0.2))
		if (player.prime.primes>=0) player.prime.primes=0
	}
	if (player.prime.features>2) {
		primeGainRate=primeGain/player.statistics.thisPrime
		if (primeGainRate>0) player.prime.primeGainRatePeak=Math.max(primeGainRate,player.prime.primeGainRatePeak)
		else primeGainRate=0
	}
		
	if (player.prime.automatedBuying.autoBuyEnabled) {
		if (player.prime.automatedBuying.lastTick>player.statistics.playtime) player.prime.automatedBuying.lastTick=player.statistics.playtime
		occurrences=Math.floor((player.statistics.playtime-player.prime.automatedBuying.lastTick)/player.prime.automatedBuying.interval)
		if (occurrences>0) {
			player.prime.automatedBuying.lastTick+=player.prime.automatedBuying.interval*occurrences
			if (player.prime.automatedBuying.prime.enabled) if (primeGain>=player.prime.automatedBuying.prime.waitForNext) checkReset(1)
			for (id=0;id<8;id++) {
				var factor=autoBuyPriorities[id]
				if (player.prime.automatedBuying.enabled[factor-1]) buyFactor(factor,true)
			}
		}
	}
	
	if (player.prime.features>9) bugsNextPrime=player.prime.challenges.current==4?Math.floor(Math.pow(player.number/1e2,4/5)*bugGainFactor):0
	if (player.prime.features>10) halfClickGain=Math.floor(Math.pow(player.number*Math.sqrt(player.prime.gameBreak.bugs)/4e14,0.1))
	
	if (simulated) return
	player.lastTick=tickTime
	updateElement('number',format(player.number,2,player.prime.challenges.current==4)+' (+'+format(numberPerSecond,2,player.prime.challenges.current==4)+'/s)')
	if (player.milestones<5) {
		hideElement('primes')
		if (player.number<1e11) hideElement('tabButton_prime')
		else {
			showElement('tabButton_prime','inline')
			updateElement('tabButton_prime','New request!')
		}
	} else {
		showElement('primes','block')
		showElement('tabButton_prime','inline')
		updateElement('primesAmount',format(player.prime.primes))
		updateElement('tabButton_prime','Prime')
	}
	
	if (currentTab!=oldTab) {
		hideElement("tab_"+oldTab)
		showElement("tab_"+currentTab,"block")
		oldTab=currentTab
	}
	if (currentTab=='factors') {
		if (advBuyTab<1) updateFactorDisplay()
		else if (advBuyTab>1&&player.prime.automatedBuying.interval>0.01) updateClass('upgrade_autoBuyInterval',player.prime.primes<costs.autoBuyInterval?'button_unaffordable':'')
		if (player.prime.features>0) {
			showElement('factorRow_prime','table-row')
			updateElement('factor_prime',format(primeFactor)+'x')
		} else hideElement('factorRow_prime')
		if (player.prime.features>1) {
			showElement('buyQuantity','table')
			updateElement('buyQuantity_value','Buy Quantity: '+(player.prime.buyQuantity<Number.MAX_VALUE?player.prime.buyQuantity+'x':'Max'))
			if (player.prime.features>3) {
				showElement('automatedBuying','table-cell')
				updateElement('button_automatedBuying','Automated Buying: O'+(player.prime.automatedBuying.autoBuyEnabled?'n':'ff'))
			} else hideElement('automatedBuying')
			if (player.prime.features>5) {
				showElement('buyMode','inline')
				updateElement('buyMode','Mode: '+(player.prime.buyMode<2?'No ':'')+'Minimum')
				updateClass('buyMode',player.prime.buyQuantity<Number.MAX_VALUE?'':'button_unaffordable')
			} else hideElement('buyMode')
		} else hideElement('buyQuantity')
		if (player.prime.features>4) {
			showElement('factorRow_boost','table-row')
			updateElement('factor_boost',(boostFactors[0]<1?format(boostFactors[0],2,true):format(boostFactors[0]))+'x')
		} else hideElement('factorRow_boost')
		if (player.prime.features>9) {
			showElement('factorRow_bug','table-row')
			updateElement('factor_bug',format(bugFactor)+'x')
		} else hideElement('factorRow_bug')
		if (player.prime.features>13) {
			showElement('factorRow_challenge','table-row')
			updateElement('factor_challenge',format(challengeFactor)+'x')
		} else hideElement('factorRow_challenge')
	}
	if (currentTab=='prime') {
		updateClass('prestige_1',player.number<1e11&&challengeNextPrime<1?'button_unaffordable':'')
		if (currentFeatureTab!=oldFeatureTab) {
			if (oldFeatureTab!='') hideElement("featureTab_"+oldFeatureTab)
			if (currentFeatureTab!='') showElement("featureTab_"+currentFeatureTab,"block")
			oldFeatureTab=currentFeatureTab
		}
		if (player.milestones>4) {
			updateElement('prestige_1',(player.prime.challenges.current==challengeNextPrime?(bugsNextPrime>player.prime.gameBreak.bugs?'Break the game and alter the production':player.prime.challenges.current>0?'Embrace the power and retry the challenge #'+player.prime.challenges.current:'Embrace the power of prime'):challengeNextPrime==0?'Exit the challenge to become normal':'Start the challenge with negative boost #'+challengeNextPrime)+'.<br>Gain '+format(primeGain)+' prime.<br>'+(player.prime.features>2?'('+format(primeGainRate,2)+'/s; peak: '+format(player.prime.primeGainRatePeak,2)+'/s)':''))
			if (currentFeatureTab=='features') {
				for (id=1;id<Math.min(player.prime.features+2,15);id++) {
					updateElement('featureUnlock_'+id,'Cost: '+format(costs.features[id-1])+' P')
					if (player.prime.features<id) updateClass('featureUnlock_'+id,player.prime.primes<costs.features[id-1]?'button_unaffordable':'')
				}
			}
			if (currentFeatureTab=='upgrades') {
				updateElement('prime_factor',format(primeFactor)+'x')
				var showMoreUpgs=player.prime.boosts.fuelEfficient>1||player.prime.gameBreak.parallelUniverse>0
				for (id=1;id<(showMoreUpgs?13:9);id++) {
					updateElement('upgrade_'+id,'Cost: '+format(costs.upgrades[id-1])+' P')
					updateClass('upgrade_'+id,player.prime.upgrades.includes(id)?'button_bought':player.prime.primes<costs.upgrades[id-1]?'button_unaffordable':'')
				}
				if (showMoreUpgs) {
					showElement('upgrade_row_3','table-row')
					showElement('upgrade_buttons_row_3','table-row')
				} else {
					hideElement('upgrade_row_3')
					hideElement('upgrade_buttons_row_3')
				}
			}
			if (currentFeatureTab=='boosts') {
				updateElement('boost_factor',format(boostFactors[0])+'x')
				updateElement('fuel',(player.prime.features>7?'('+Math.floor(player.prime.boosts.fuelEfficient*100)+'% efficient) ':'')+remainingFuel+' / '+player.prime.boosts.fuel)
				updateElement('buy_fuel','Cost: '+format(costs.fuel)+' P')
				updateClass('buy_fuel',player.prime.primes<costs.fuel?'button_unaffordable':'')
				var challengeCheck1=0
				var challengeCheck2=0
				for (id=1;id<=unlockedBoosts;id++) if (weightsThisPrime[id-1]!=0) challengeCheck1++
				if (challengeCheck1==1) for (id=1;id<=unlockedBoosts;id++) if (weightsThisPrime[id-1]==nextBoostRequirements[id-1]+22) challengeCheck2=id
				for (id=1;id<=unlockedBoosts;id++) {
					updateElement('used_fuel_'+id,player.prime.boosts.weights[id-1]+(weightsThisPrime[id-1]!=player.prime.boosts.weights[id-1]?' ('+weightsThisPrime[id-1]+')':'')+(usedFuelWithExtras[id-1]>player.prime.boosts.weights[id-1]?' + '+(usedFuelWithExtras[id-1]-player.prime.boosts.weights[id-1]):''))
					if (challengesUnlocked>=id) updateClass('challenge_'+id,id!=challengeCheck2?'button_unaffordable':'')
				}
				if (player.prime.features>6) {
					showElement('upgrade_fuel_efficient','table-row')
					updateElement('upgrade_fuel_efficient','Upgrade Efficiency<br>Cost: '+format(costs.fuelEfficient)+' P')
					updateClass('upgrade_fuel_efficient',player.prime.primes<costs.fuelEfficient?'button_unaffordable':'')
				} else hideElement('upgrade_fuel_efficient')
			}
			if (currentFeatureTab=='game_break') {
				if (player.prime.challenges.current!=4||player.prime.gameBreak.bugs>=bugsNextPrime) {
					updateElement('bugs_gain',player.prime.challenges.current==4?'You need to reach '+format(Math.pow((player.prime.gameBreak.bugs+1)/bugGainFactor,5/4)*1e2,2,true)+' to be able to gain bugs.':'You need to run challenge 4 to be able to gain bugs.')
				} else {
					var diff=bugsNextPrime-player.prime.gameBreak.bugs
					updateElement('bugs_gain','You will gain '+format(diff)+' bug'+(diff>1?'s':'')+' after embrace.')
				}
				updateElement('bugs',format(player.prime.gameBreak.bugs))
				updateElement('bugFactor',format(bugFactor)+'x')
				updateElement('bugGainFactor',player.prime.features>10?'<b>Bug Gain Factor</b>: '+format(bugGainFactor)+'x':'')
				if (player.prime.features>10) {
					updateElement('half_clicks_amount',format(player.prime.gameBreak.halfClicks))
					updateElement('half_click_gain','You will gain '+format(halfClickGain)+' half click'+(halfClickGain!=1?'s':'')+' after you complete challenge 4.')
					for (id=1;id<5;id++) {
						updateElement('break_upgrade_'+id,'Cost: '+format(costs.breakUpgrades[id-1])+' HC')
						updateClass('break_upgrade_'+id,player.prime.gameBreak.upgrades.includes(id)?'button_bought':player.prime.gameBreak.halfClicks<costs.breakUpgrades[id-1]?'button_unaffordable':'')
					}
				}
				if (player.prime.features>11) {
					var product=player.prime.gameBreak.bugs*player.prime.gameBreak.halfClicks
					updateElement('product',format(product))
					updateElement('next_parallel_universe_requirement',format(nextParaUniReq))
					updateClass('prestige_1.01',nextParaUniReq>product?'button_unaffordable':'')
				}
			}
		}
	}
	if (currentTab=='statistics') {
		updateElement('statisticsValue_totalPlaytime',formatTime(player.statistics.playtime))
		updateElement('statisticsValue_totalNumber',format(player.statistics.totalNumber,2))
		if (player.milestones<5) {
			hideElement('statistics_primed')
			hideElement('statistics_thisPrime')
		} else {
			showElement('statistics_primed','table-row')
			showElement('statistics_thisPrime','table-row')
			updateElement('statisticsValue_primed',player.statistics.primed+'x')
			updateElement('statisticsValue_thisPrime',formatTime(player.statistics.thisPrime))
		}
		for (chall=1;chall<9;chall++) {
			if (player.statistics.fastestChallengeTimes[chall]==undefined) hideElement('statistics_challenge'+chall+'Time')
			else {
				showElement('statistics_challenge'+chall+'Time')
				updateElement('statisticsValue_challenge'+chall+'Time',formatTime(player.statistics.fastestChallengeTimes[chall]))
			}
		}
		if (player.statistics.thisHalfClickRun>0) {
			showElement('statistics_thisHalfClickRun','table-row')
			updateElement('statisticsValue_thisHalfClickRun',formatTime(player.statistics.thisHalfClickRun))
		} else hideElement('statistics_thisHalfClickRun')
		if (player.statistics.fastestHalfClickRun<Number.MAX_VALUE) {
			showElement('statistics_fastestHalfClickRun','table-row')
			updateElement('statisticsValue_fastestHalfClickRun',formatTime(player.statistics.fastestHalfClickRun))
		} else hideElement('statistics_fastestHalfClickRun')
	}
	if (currentTab=='options') updateElement('option_save','Save<br>('+(sinceLastSave==1?'a second':sinceLastSave+' seconds')+' ago)')
}

function showNotification(message,delay=0) {
	setTimeout(function(){
	updateElement('notification',message)
	updateStyle('notification','transform','translate(0%,0%)')
	clearTimeout(showNotificationTimeout)
	showNotificationTimeout=setTimeout(function(){updateStyle('notification','transform','translate(100%,0%)');},6000)
	},delay)
}

function updateMilestones() {
	var result=''
	for (i=1;i<Math.min(player.milestones+2,20);i++) result=result+'<tr><td><b>Milestone #'+i+'</b>: '+milestoneRequirements[i-1]+'</td><td>'+(i>player.milestones?'Incomplete':'Completed')+'</td></tr>'
	updateElement('table_milestones',result)
}

function getMilestone(id) {
	if (id>player.milestones) {
		player.milestones=id
		showNotification('<b>Milestone #'+id+' got!</b><br>'+milestoneRequirements[id-1],(id==13||id==16||id==17)?7000:0)
		updateMilestones()
	}
}

function updateCosts() {
	for (i=0;i<7;i++) {
		costMultipliers[i]=Math.pow(player.prime.upgrades.includes(3)?1.4:1.5,i+1)
		costs.factors[i]=Math.pow(10,i+1)*Math.pow(costMultipliers[i],player.factors[i]-1)/boostFactors[2]
		if (i==6) costs.factors[6]=costs.factors[6]/boostFactors[8]
		if (player.prime.buyMode>1) costs.factors[i]*=(Math.pow(costMultipliers[i],player.prime.buyQuantity)-1)/(costMultipliers[i]-1)
	}
	costs.fuel=player.prime.boosts.fuel==0?0:Math.floor(Math.pow(player.prime.boosts.fuel>5?1.7:1.3,player.prime.boosts.fuel)*100)
	costs.autoBuyInterval=Math.floor(10/player.prime.automatedBuying.interval)
	costs.fuelEfficient=Math.floor(Math.pow(3,Math.pow(player.prime.boosts.fuelEfficient,2)*(player.prime.boosts.fuelEfficient>4?1.5:1)-1)*10000)
	nextParaUniReq=Math.pow(1e3,player.prime.gameBreak.parallelUniverse*(player.prime.gameBreak.parallelUniverse+3)/2)*1e10
}

function updateFactors() {
	for (i=0;i<7;i++) {
		factorLevels[i]=player.factors[i]
		if (player.prime.upgrades.includes(5)) factorLevels[i]+=Math.min(sixMinutesSinceLastPrime,5)
		if (player.prime.upgrades.includes(8)&&i==2) factorLevels[2]+=Math.floor(factorLevels[2]/2)
		if (i==6) factorLevels[6]+=boostFactors[7]
		var realFL=Math.max(factorLevels[i],1)
		if (player.prime.upgrades.includes(2)&&realFL>25) factors[i]=Math.pow(26/25,realFL-25)*25
		else factors[i]=realFL
		if (i==6&&player.prime.upgrades.includes(4)) factors[i]=Math.pow(factors[i],1.5)
		factors[i]=Math.floor(factors[i])
	}
}

function updateFactorDisplay() {
	var showFactor=true
	for (i=0;i<7;i++) {
		if (i>0) if (player.factors[i-1]<2) showFactor=false
		if (showFactor) {
			showElement('factorRow_'+(i+1),'table-row')
			var factorLevel=player.factors[i]+(factorLevels[i]>player.factors[i]?' + '+(factorLevels[i]-player.factors[i]):factorLevels[i]<player.factors[i]?' - '+(player.factors[i]-factorLevels[i]):'')
			updateElement('factor_'+(i+1),factors[i]>factorLevels[i]?format(factors[i])+'x ('+factorLevel+')':factorLevel+'x')
			updateElement('factorUpgrade_'+(i+1),'Cost: '+format(costs.factors[i]))
			updateClass('factorUpgrade_'+(i+1),player.number<costs.factors[i]?'button_unaffordable':'')
		} else hideElement('factorRow_'+(i+1))
	}
}

function buyFactor(id,auto=false) {
	if (player.number>=costs.factors[id-1]) {
		var spentAmount=costs.factors[id-1]
		if (player.prime.buyMode<2||auto) {
			var buying=1
			if (player.prime.buyQuantity>1||auto) {
				buying=Math.min(Math.floor(Math.log10(player.number/spentAmount*(costMultipliers[id-1]-1)+1)/Math.log10(costMultipliers[id-1])),auto?occurrences:player.prime.buyQuantity)
				spentAmount*=(Math.pow(costMultipliers[id-1],buying)-1)/(costMultipliers[id-1]-1)
			}
		} else buying=player.prime.buyQuantity
		player.number-=spentAmount
		player.factors[id-1]+=buying
		updateFactors()
		updateCosts()
		getMilestone(1)
		if (id>1) getMilestone(2)
		if (id>3) getMilestone(3)
		if (id>6) getMilestone(4)
	}
}

function updateFeatures() {
	for (id=1;id<15;id++) {
		if (player.prime.features<id-1) {
			hideElement('featureDescription_'+id)
			hideElement('featureUnlock_'+id)
		} else {
			showElement('featureDescription_'+id,'table-cell')
			showElement('featureUnlock_'+id,'inline')
			updateElement('featureDescription_'+id,'<b>'+featureDescriptions[id-1][0]+'</b><br>'+featureDescriptions[id-1][1])
			updateClass('featureUnlock_'+id,player.prime.features>=id?'button_bought':player.prime.primes<costs.features[id-1]?'button_unaffordable':'')
		}
	}
}

function buyFeature(id) {
	if (player.prime.primes>=costs.features[id-1]&&id>player.prime.features) {
		player.prime.primes-=costs.features[id-1]
		player.prime.features=id
		if (id==1) showElement('featureTabButton_upgrades','inline')
		if (id==5||id==8||id==9||id==14) {
			showElement('featureTabButton_boosts','inline')
			updateBoostDisplay()
		}
		if (id==10) showElement('featureTabButton_game_break','inline')
		if (id==11) {
			showElement('half_clicks','table-cell')
			showElement('break_upgrades','table')
			updateElement('option_half_click_gain','Half click gain: OFF')
		}
		if (id==12) showElement('parallel_universes','block')
		if (id==13) updateAutoBuyIntervalDisplay()
		updateFeatures()
	}
}

function switchFeatureTab(id) {
	currentFeatureTab=id
}

function buyUpgrade(id) {
	if (player.prime.primes>=costs.upgrades[id-1]&&!player.prime.upgrades.includes(id)) {
		player.prime.primes-=costs.upgrades[id-1]
		player.prime.upgrades.push(id)
		if (id==1||id==5||id==7) updatePrimeFactor()
		if (id==2||id==4||id==6||id==8) updateFactors()
		if (id==3) updateCosts()
		if (player.prime.upgrades.length>3) getMilestone(6)
		if (player.prime.upgrades.length>7) getMilestone(7)
		if (player.prime.upgrades.length>11) getMilestone(11)
	}
}

function updatePrimeFactor() {
	primeFactor=1
	if (player.prime.upgrades.includes(1)) primeFactor=10
	if (player.prime.upgrades.includes(5)) primeFactor*=Math.max(Math.pow(Math.log10(player.statistics.thisPrime+1),1.5),1)
	if (player.prime.upgrades.includes(7)) primeFactor*=Math.pow(Math.log10(player.statistics.primed)+1,2)
	if (player.prime.upgrades.includes(9)) for (id=0;id<7;id++) primeFactor*=Math.pow(1.005,player.factors[id])
	if (player.prime.upgrades.includes(10)) primeFactor*=Math.log10(player.statistics.totalNumber)/5
	if (player.prime.upgrades.includes(11)) primeFactor*=Math.pow(10,60/(player.statistics.thisPrime+60))
	if (player.prime.upgrades.includes(12)) primeFactor*=Math.sqrt(factors[5])
	primeFactor=Math.floor(primeFactor)
}

function switchBuyQuantity() {
	if (player.prime.features>6&&player.prime.buyQuantity<2) player.prime.buyQuantity=2
	else if (player.prime.buyQuantity<3) player.prime.buyQuantity=5
	else if (player.prime.buyQuantity<6) player.prime.buyQuantity=10
	else if (player.prime.features>6) {
		if (player.prime.buyQuantity<11) player.prime.buyQuantity=25
		else if (player.prime.buyQuantity<26) player.prime.buyQuantity=50
		else if (player.prime.buyQuantity<51) player.prime.buyQuantity=100
		else if (player.prime.buyQuantity<Number.MAX_VALUE&&player.prime.buyMode<2) player.prime.buyQuantity=Number.MAX_VALUE
		else player.prime.buyQuantity=1
	} else player.prime.buyQuantity=1
	updateCosts()
}

function updateBoosts() {
	remainingFuel=player.prime.boosts.fuel
	var realWeights=[]
	for (id=0;id<8;id++) {
		remainingFuel-=weightsThisPrime[id]
		usedFuelWithExtras[id]=player.prime.boosts.weights[id]+((player.prime.challenges.completed.includes(id+1)&&player.prime.challenges.current<1)?5+2.5*player.prime.gameBreak.parallelUniverse:0)
		realWeights[id]=usedFuelWithExtras[id]*player.prime.boosts.fuelEfficient
	}
	if (player.prime.challenges.current>0) realWeights[player.prime.challenges.current-1]=-realWeights[player.prime.challenges.current-1]
	boostFactors[1]=Math.pow(realWeights[0]<0?0.5:2,Math.sqrt(Math.abs(realWeights[0])))
	boostFactors[2]=Math.pow(realWeights[1]<0?0.1:10,Math.sqrt(Math.abs(realWeights[1])))
	boostFactors[3]=Math.pow(Math.log10(player.statistics.playtime),Math.sqrt(Math.abs(realWeights[2]))*(realWeights[2]<0?-1:1))
	boostFactors[4]=Math.pow(Math.max(Math.log10(player.prime.primes),1),Math.sqrt(Math.abs(realWeights[3]))*(realWeights[3]<0?-1:1))
	boostFactors[5]=Math.pow(player.factors[6],0.3*Math.sqrt(Math.abs(realWeights[4]))*(realWeights[4]<0?-1:1))
	boostFactors[6]=Math.pow(Math.max(Math.log10(player.number)*0.2,1),Math.sqrt(Math.abs(realWeights[5]))*(realWeights[5]<0?-1:1))
	boostFactors[7]=Math.floor(Math.sqrt(Math.abs(realWeights[6]))*(realWeights[6]<0?-1:1))
	var absRW8=Math.abs(realWeights[7])
	boostFactors[8]=Math.pow(factors[0],Math.sqrt(absRW8>9?(10-1/(absRW8-9)):absRW8)*(realWeights[7]<0?-1:1))
	boostFactors[0]=boostFactors[1]*boostFactors[3]*boostFactors[4]*boostFactors[5]*boostFactors[6]
	if (player.prime.challenges.current<1) boostFactors[0]=Math.floor(boostFactors[0])
}

function updateBoostDisplay() {
	unlockedBoosts=0
	challengesUnlocked=0
	for (id=1;id<9;id++) {
		if (player.prime.boosts.fuel<nextBoostRequirements[id-1]) {
			hideElement('boost_'+id)
			hideElement('boost_buttons_'+id)
		} else {
			unlockedBoosts++
			showElement('boost_'+id,'table-cell')
			showElement('boost_buttons_'+id,'table-cell')
			var challengeRequirement=nextBoostRequirements[id-1]+22
			if (player.prime.features>7&&player.prime.boosts.fuel>=challengeRequirement) challengesUnlocked++
			updateElement('boost_buttons_'+id,"<button onclick='boostUp("+id+",true)'>-</button> <b>Level</b>: <text id='used_fuel_"+id+"'>"+player.prime.boosts.weights[id-1]+(weightsThisPrime[id-1]!=player.prime.boosts.weights[id-1]?' ('+weightsThisPrime[id-1]+')':'')+(usedFuelWithExtras[id-1]>player.prime.boosts.weights[id-1]?' + '+(usedFuelWithExtras[id-1]-player.prime.boosts.weights[id-1]):'')+"</text> <button onclick='boostUp("+id+",false)'>+</button>"+
			(id>challengesUnlocked?'':"<br><br><button "+(weightsThisPrime[id-1]!=nextBoostRequirements[id-1]+22?"class='button_unaffordable'":"")+" id='challenge_"+id+"' onclick='takeChallenge("+id+")'>Challenge #"+id+": "+(challengeNextPrime==id?'ON':'OFF')+"<br>(requires exact "+challengeRequirement+" fuel<br>for this boost only)</button>")+
			(player.prime.features>13?'<br><b>High score</b> (prime): '+format(player.prime.challenges.highScore[id-1]):''))
		}
	}
	if (unlockedBoosts>7) hideElement('nextBoost')
	else {
		showElement('nextBoost','block')
		updateElement('nextBoost_value',nextBoostRequirements[unlockedBoosts])
	}
	if (player.prime.features<8||challengesUnlocked>7) hideElement('nextChallenge')
	else {
		showElement('nextChallenge','block')
		updateElement('nextChallenge_value',nextBoostRequirements[challengesUnlocked]+22)
	}
	updateElement('fuelPack',player.prime.features>8?"<button id='button_fuelPack' onclick='switchFuelPack()'>Fuel pack: "+(player.prime.boosts.fuelPack>25?"Max":player.prime.boosts.fuelPack+"x")+"</button><br>(You gain/remove <text id='description_fuelPack'>"+(player.prime.boosts.fuelPack>25?"all levels":player.prime.boosts.fuelPack>1?player.prime.boosts.fuelPack+" levels":"1 level")+"</text> after clicking plus or minus button.)":"")
	updateElement('currentChallenge',player.prime.challenges.current>0?'<b>Current challenge</b>: '+player.prime.challenges.current:'')
	var challFuelEffReq=challengeFuelEfficiencyRequirements[player.prime.challenges.current]
	if (player.prime.boosts.fuelEfficient>challFuelEffReq&&challFuelEffReq>0) {
		showElement('remove_fuel_efficient','inline')
		updateElement('remove_fuel_efficient',"Revert Efficiency to "+Math.round(challFuelEffReq*100)+"%.<br>(You don't get your prime back)")
	} else hideElement('remove_fuel_efficient','none')
	updateElement('challenge_factor',player.prime.features>13?'<b>Challenge factor</b>: '+format(challengeFactor)+'x':'')
}

function buyFuel() {
	if (player.prime.primes>=costs.fuel) {
		player.prime.primes-=costs.fuel
		player.prime.boosts.fuel++
		remainingFuel++
		updateBoostDisplay()
		updateCosts()
	}
}

function boostUp(id,negative) {
	var add=Math.min(negative?weightsThisPrime[id-1]:remainingFuel,player.prime.boosts.fuelPack)*(negative?-1:1)
	if (add!=0) {
		weightsThisPrime[id-1]+=add
		remainingFuel-=add
		if (challengeNextPrime>0) {
			updateElement('challenge_'+challengeNextPrime,'Challenge #'+challengeNextPrime+': OFF<br>(requires exact '+(nextBoostRequirements[challengeNextPrime-1]+22)+' fuel<br>for this boost only)')
			updateClass('challenge_'+challengeNextPrime,'button_unaffordable')
			challengeNextPrime=0
		}
	}
}

function switchBuyMode() {
	if (player.prime.buyQuantity<Number.MAX_VALUE) {
		player.prime.buyMode=player.prime.buyMode%2+1
		updateCosts()
	}
}

function advancedBuy() {
	for (id=0;id<8;id++) {
		var factor=advBuyPriorities[id]
		if (player.prime.advancedBuying.enabled[factor-1]) buyFactor(factor)
	}
}

function openAdvBuySetting(id) {
	if (id>0) {
		var accessId=(id>1?'automated':'advanced')+'Buying'
		var selectList=''
		for (idF=1;idF<8;idF++) selectList=selectList+"<option value="+idF+">"+idF+"</option>"
	}
	for (idF=1;idF<8;idF++) {
		var preceding='<td><b>Factor '+romanNumerals[idF-1]+'</b>:</td>'
		if (id<1) updateElement('factorRow_'+idF,preceding+"<td id='factor_"+idF+"'></td><td><button id='factorUpgrade_"+idF+"' onclick='buyFactor("+idF+")'></button></td>")
		else {
			showElement('factorRow_'+idF,'table-row')
			updateElement('factorRow_'+idF,preceding+"<td colspan=2><b>Enabled</b>: <input id='advBuyFactor_toggle_"+idF+"' type='checkbox' onchange='changeAdvBuySetting("+idF+",1)' "+(player.prime[accessId].enabled[idF-1]?'checked':'')+"> <b>Priority</b>: <select id='advBuyFactor_priority_"+idF+"' onchange='changeAdvBuySetting("+idF+",2)'>"+selectList+"</select></td>")
			document.getElementById('advBuyFactor_priority_'+idF).value=player.prime[accessId].priorities[idF-1]
		}
	}
	if (id<1) {
		updateFactorDisplay()
		hideElement('goBack')
	} else showElement('goBack','block')
	if (id<2) hideElement('automatedBuyingSettings')
	else {
		showElement('automatedBuyingSettings','table-row')
		updateAutoBuyIntervalDisplay()
	}
	advBuyTab=id
}

function changeAdvBuySetting(factor,id) {
	var accessId=(advBuyTab>1?'automated':'advanced')+'Buying'
	if (id==1) player.prime[accessId].enabled[factor-1]=document.getElementById('advBuyFactor_toggle_'+factor).checked
	if (id==2) {
		id=0
		var value1=player.prime[accessId].priorities[factor-1]
		var value2=parseInt(document.getElementById('advBuyFactor_priority_'+factor).value)
		while (player.prime[accessId].priorities[id]!=value2) id++
		player.prime[accessId].priorities[factor-1]=value2
		player.prime[accessId].priorities[id]=value1
		document.getElementById('advBuyFactor_priority_'+(id+1)).value=value1
		if (advBuyTab>1) {
			autoBuyPriorities[value1-1]=id+1
			autoBuyPriorities[value2-1]=factor
		} else {
			advBuyPriorities[value1-1]=id+1
			advBuyPriorities[value2-1]=factor
		}
	}
	if (id==3) player.prime.automatedBuying.prime.enabled=document.getElementById('option_automatic_embrace').checked
	if (id==4) player.prime.automatedBuying.prime.waitForNext=document.getElementById('option_wait_for_next').value
}

function toggleAutoBuy() {player.prime.automatedBuying.autoBuyEnabled=!player.prime.automatedBuying.autoBuyEnabled}

function reduceAutoBuyInterval() {
	if (player.prime.primes>=costs.autoBuyInterval&&player.prime.automatedBuying.interval>0.01) {
		player.prime.primes-=costs.autoBuyInterval
		player.prime.automatedBuying.interval=Math.max(player.prime.automatedBuying.interval*0.9,0.01)
		updateCosts()
		updateAutoBuyIntervalDisplay()
	}
}

function updateAutoBuyIntervalDisplay() {
	var div
	if (player.prime.automatedBuying.interval>0.01) {
		div=player.prime.automatedBuying.interval.toFixed(player.prime.automatedBuying.interval<0.1?3:2)+'s (-10%)'
		updateElement('autoBuyInterval',)
		showElement('upgrade_autoBuyInterval','inline')
		updateElement('upgrade_autoBuyInterval','Cost: '+format(costs.autoBuyInterval)+' P')
		updateClass('upgrade_autoBuyInterval',player.prime.primes<costs.autoBuyInterval?'button_unaffordable':'')
	} else {
		div='0.010s'
		hideElement('upgrade_autoBuyInterval')
	}
	updateElement('autoBuyInterval',div+(player.prime.features>12?"<br><b>Automatic Embrace</b>: <input id='option_automatic_embrace' type='checkbox' onchange='changeAdvBuySetting(0,3)' "+(player.prime.automatedBuying.prime.enabled?'checked':'')+"><br><b>Wait (prime) for next embrace</b>: <input id='option_wait_for_next' type='text' onchange='changeAdvBuySetting(0,4)'></input>":''))
	if (player.prime.features>12) document.getElementById('option_wait_for_next').value=player.prime.automatedBuying.prime.waitForNext
}

function upgradeFuelEfficient() {
	if (player.prime.primes>=costs.fuelEfficient) {
		player.prime.primes-=costs.fuelEfficient
		player.prime.boosts.fuelEfficient+=0.5
		getMilestone(10)
		updateBoosts()
		updateBoostDisplay()
		updateCosts()
	}
}

function takeChallenge(id) {
	for (boost=1;boost<9;boost++) {
		if (boost!=id) if (weightsThisPrime[id-1]!=nextBoostRequirements[id-1]+22) return
		else if (weightsThisPrime[boost-1]!=0) return
	}
	challengeNextPrime=challengeNextPrime==id?0:id
	updateElement('challenge_'+id,'Challenge #'+id+': '+(challengeNextPrime==id?'ON':'OFF')+'<br>(requires exact '+(nextBoostRequirements[id-1]+22)+' fuel<br>for this boost only)')
}

function switchFuelPack() {
	if (player.prime.boosts.fuelPack<2) player.prime.boosts.fuelPack=2
	else if (player.prime.boosts.fuelPack<3) player.prime.boosts.fuelPack=5
	else if (player.prime.boosts.fuelPack<6) player.prime.boosts.fuelPack=10
	else if (player.prime.boosts.fuelPack<11) player.prime.boosts.fuelPack=25
	else if (player.prime.boosts.fuelPack<26) player.prime.boosts.fuelPack=Number.MAX_VALUE
	else player.prime.boosts.fuelPack=1
	updateElement('button_fuelPack','Fuel pack: '+(player.prime.boosts.fuelPack>25?'Max':player.prime.boosts.fuelPack+'x'))
	updateElement('description_fuelPack',player.prime.boosts.fuelPack>25?'all levels':player.prime.boosts.fuelPack>1?player.prime.boosts.fuelPack+' levels':'1 level')
}

function removeFuelEfficient() {
	player.prime.boosts.fuelEfficient=challengeFuelEfficiencyRequirements[player.prime.challenges.current]
	hideElement('remove_fuel_efficient')
	updateCosts()
	updateBoosts()
}

function toggleHalfClickGain() {
	player.prime.gameBreak.halfClickGain=!player.prime.gameBreak.halfClickGain
	updateElement('option_half_click_gain','Half click gain: '+(player.prime.gameBreak.halfClickGain?'ON':'OFF'))
}

function updateBugGainFactor() {
	bugGainFactor=player.prime.gameBreak.upgrades.includes(1)?3:1
	if (player.prime.gameBreak.upgrades.includes(2)) bugGainFactor*=Math.log10(Math.max(player.prime.gameBreak.halfClicks,1))/Math.log10(3)+1
	if (player.prime.gameBreak.upgrades.includes(3)) bugGainFactor*=1+Math.sqrt(600/player.statistics.fastestHalfClickRun)
	if (player.prime.gameBreak.upgrades.includes(4)) bugGainFactor*=Math.pow(player.prime.boosts.fuel,0.25)
	bugGainFactor=Math.floor(bugGainFactor)
}

function buyBreakUpgrade(id) {
	if (player.prime.gameBreak.halfClicks>=costs.breakUpgrades[id-1]&&!player.prime.gameBreak.upgrades.includes(id)) {
		player.prime.gameBreak.halfClicks-=costs.breakUpgrades[id-1]
		player.prime.gameBreak.upgrades.push(id)
		updateBugGainFactor()
	}
}

function updateChallengeFactor() {
	challengeFactor=1
	for (chall=1;chall<9;chall++) challengeFactor*=Math.pow(player.prime.challenges.highScore[chall-1]/challengeGoals[chall-1],0.03)
	challengeFactor=Math.floor(challengeFactor)
}