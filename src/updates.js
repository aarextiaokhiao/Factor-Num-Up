function gameTick() {
	var tickTime=new Date().getTime()
	if (simulated) var delta=simulatedTickLength
	else {
		var delta=(tickTime-player.lastTick)/1000
		sinceLastSave=Math.floor((tickTime-lastSave)/1000)
	}
	if (sinceLastSave>59&&!disableSave) {
		saveGame()
	}
	player.statistics.playtime+=delta
	player.statistics.thisPrime+=delta
	if (player.statistics.thisHalfClickRun) player.statistics.thisHalfClickRun+=delta
	
	if (player.prime.upgrades.includes(5)||player.prime.upgrades.includes(11)) updatePrimeFactor()
	if (player.prime.upgrades.includes(6)) {
		smslpTemp=Math.floor(player.statistics.thisPrime/300)
		if (smslpTemp!=sixMinutesSinceLastPrime) {
			sixMinutesSinceLastPrime=smslpTemp
			updateFactors()
		}
	}
	if (player.prime.gameBreak.upgrades.includes(5)) updatePrimeDivision()
	else if (usedFuelWithExtras[2]+usedFuelWithExtras[5]>0) updateBoosts()
	numberPerSecond=factors[0]*factors[1]*factors[2]*factors[3]*factors[4]*factors[5]*factors[6]*primeFactor*boostFactors[0]*virtual.bugFactor*challengeFactor
	player.number+=numberPerSecond*delta
	player.statistics.totalNumber+=numberPerSecond*delta
	
	if (player.milestones>4) {
		primeGain=Math.floor(Math.pow(player.number/1e11,0.2))
		if (isNaN(player.prime.primes)||typeof(player.prime.primes)!='number') player.prime.primes=0
	}
	if (player.prime.features>2) {
		primeGainRate=primeGain/player.statistics.thisPrime
		if (primeGainRate>0) player.prime.primeGainRatePeak=Math.max(primeGainRate,player.prime.primeGainRatePeak)
		else primeGainRate=0
	}
	if (player.prime.features>3) {
		if (player.prime.automatedBuying.lastTick>player.statistics.playtime||player.prime.automatedBuying.lastTick==0) player.prime.automatedBuying.lastTick=player.statistics.playtime
		occurrences=Math.floor((player.statistics.playtime-player.prime.automatedBuying.lastTick)/player.prime.automatedBuying.interval)
		player.prime.automatedBuying.lastTick+=player.prime.automatedBuying.interval*occurrences
		if (player.prime.automatedBuying.autoBuyEnabled&&occurrences>0) {
			if (player.prime.automatedBuying.prime.enabled) if (primeGain>=player.prime.automatedBuying.prime.waitForNext) checkReset(1,1)
			for (id=0;id<7;id++) {
				var factor=autoBuyPriorities[id]
				if (player.prime.automatedBuying.enabled[factor-1]) {
					buyFactor(factor,true)
				}
			}
		}
	}
	
	if (player.prime.features>10) bugsNextPrime=player.prime.challenges.current==4?Math.floor(Math.pow(player.number/1e2,4/5)*bugGainFactor):0
	if (player.prime.features>11) halfClickGain=player.prime.challenges.current==4?Math.floor(Math.pow(player.number*Math.sqrt(player.prime.gameBreak.bugs)/4e14,0.1)):0
	bugsHCProduct=player.prime.gameBreak.bugs*player.prime.gameBreak.halfClicks
	if (player.prime.features>15) {
		player.statistics.thisVirtualPrime+=delta
		if (player.prime.upgrades.includes(5)||player.prime.upgrades.includes(11)) updatePrimeFactor(true)
		if (player.prime.upgrades.includes(6)) {
			var smeteTemp=Math.floor(player.statistics.thisVirtualPrime/300)
			if (smeteTemp!=virtual.sixMinutesElapsedThisEmbrace) {
				virtual.sixMinutesElapsedThisEmbrace=smeteTemp
				updateFactors(true)
			}
		}
		if (player.prime.gameBreak.upgrades.includes(5)) updatePrimeDivision(true)
		else if (virtual.usedFuelWithExtras[2]+virtual.usedFuelWithExtras[5]>0) updateBoosts(true)
		virtual.numberPerSecond=virtual.factors[0]*virtual.factors[1]*virtual.factors[2]*virtual.factors[3]*virtual.factors[4]*virtual.factors[5]*virtual.factors[6]*virtual.primeFactor*virtual.boostFactors[0]*bugFactor*challengeFactor
		player.prime.boosts.virtual.number+=virtual.numberPerSecond*delta
		player.statistics.totalNumber+=virtual.numberPerSecond*delta
		virtual.primeGain=Math.floor(Math.pow(player.prime.boosts.virtual.number/1e11,0.2))
		virtual.primeGainRate=virtual.primeGain/player.statistics.thisVirtualPrime
		if (virtual.primeGainRate>0) player.prime.boosts.virtual.primeGainRatePeak=Math.max(virtual.primeGainRate,player.prime.boosts.virtual.primeGainRatePeak)
		else virtual.primeGainRate=0
		if (player.prime.automatedBuying.autoBuyEnabled&&occurrences>0) {
			if (player.prime.boosts.virtual.automatedBuying.automatedEmbrace) if (virtual.primeGain>=player.prime.boosts.virtual.automatedBuying.waitForNextEmbrace) checkReset(1,2)
			for (id=0;id<7;id++) {
				var factor=virtual.autoBuyPriorities[id]
				if (player.prime.boosts.virtual.automatedBuying.enabled[factor-1]) {
					buyFactor(factor,true,true)
				}
			}
		}
		virtual.bugsNextPrime=player.prime.boosts.virtual.currentChallenge==4?Math.floor(Math.pow(player.prime.boosts.virtual.number/1e2,4/5)*bugGainFactor):0
		virtual.halfClickGain=player.prime.boosts.virtual.currentChallenge==4?Math.floor(Math.pow(player.prime.boosts.virtual.number*Math.sqrt(player.prime.gameBreak.bugs)/4e14,0.1)):0
	}
	if (player.prime.features>17) {
		paraDustGain=Math.floor(Math.pow(10,Math.sqrt(Math.log10(bugsHCProduct/nextParaUniReq))*(player.prime.gameBreak.parallelUniverse+1)))
		if (isNaN(paraDustGain)) paraDustGain=0
	}
	
	if (isNaN(player.number)||isNaN(player.prime.boosts.virtual.number)) {
		alert('Corruption has been detected. You are forced to hard reset right now.')
		resetGame(1/0)
		resetVirtual(1/0)
		simulatedTicksLeft=0
		if (currentTab=='prime') currentTab='factors'
	}
	if (simulated) return
	player.lastTick=tickTime
	var tempNumber=virtual.activated?player.prime.boosts.virtual.number:player.number
	var tempChallenge=virtual.activated?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current
	updateElement('number',format(tempNumber,2,tempChallenge==4)+' (+'+format(virtual.activated?virtual.numberPerSecond:numberPerSecond,2,tempChallenge==4)+'/s)')
	if (player.milestones<5) {
		hideElement('primes')
		if (player.number<1e11) {
			hideElement('tabButton_prime')
			hideElement('embrace_shortcut')
		} else {
			showElement('tabButton_prime','inline')
			updateElement('tabButton_prime','New request!')
			if (player.options.detailed) {
				showElement('embrace_shortcut','inline')
				updateElement('embrace_shortcut','Embrace')
				updateClass('embrace_shortcut','')
			} else hideElement('embrace_shortcut')
		}
	} else {
		var tempPrimeGain=virtual.activated?virtual.primeGain:primeGain
		var tempPrimeGainRate=virtual.activated?virtual.primeGainRate:primeGainRate
		var tempPrimeGainRatePeak=(virtual.activated?player.prime.boosts.virtual:player.prime).primeGainRatePeak
		var tempPrimeDivision=virtual.activated?virtual.primeDivision:primeDivision
		showElement('primes','block')
		showElement('tabButton_prime','inline')
		if (tempChallenge==4) {
			var grp=getRealPrime(virtual.activated)
			var realPrimeText=grp>1e7?format(grp):'<s>'+format(player.prime.primes/tempPrimeDivision,2,true)+'</s> '+format(1e7)+' (<b>CAP</b>)'
			if (tempPrimeDivision>1) updateElement('primesAmount',format(player.prime.primes)+' (/ '+format(tempPrimeDivision)+' = '+realPrimeText+')')
			else updateElement('primesAmount',realPrimeText)
		} else updateElement('primesAmount',format(player.prime.primes))
		updateElement('tabButton_prime','Prime')
		if (player.options.detailed) {
			showElement('embrace_shortcut','inline')
			updateElement('embrace_shortcut',(tempChallenge==challengeNextPrime?(tbnpDiff>0?'Break':tempChallenge>0?'Retry':'Embrace'):challengeNextPrime==0?'Exit':'Start')+' (+'+format(tempPrimeGain)+(player.prime.features>2?'; '+formatRate(tempPrimeGainRate)+'; peak: '+formatRate(tempPrimeGainRatePeak):'')+')')
			updateClass('embrace_shortcut',tempNumber<1e11&&challengeNextPrime<1?'button_unaffordable':'')
		} else hideElement('embrace_shortcut')
	}
	if (player.prime.features>4) var tempFuelEfficient=Math.round((virtual.activated?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient*100)
	if (player.prime.features>4&&player.options.detailed) {
		showElement('fuel_detailed','block')
		updateElement('fuelAmount_detailed',(player.prime.features>8?'('+tempFuelEfficient+'% efficient) ':'')+remainingFuel+' / '+player.prime.boosts.fuel)
		if (player.prime.features>8&&player.options.detailed) {
			showElement('challenge_detailed','inline')
			updateElement('challengeId_detailed',tempChallenge>0?'#'+tempChallenge:'N/A')
		} else hideElement('challenge_detailed')
	} else hideElement('fuel_detailed')
	if (player.prime.features>10) var tbnpDiff=(virtual.activated?virtual.bugsNextPrime:bugsNextPrime)-player.prime.gameBreak.bugs
	if (player.prime.features>10&&player.options.detailed) {
		showElement('bugs_detailed','block')
		updateElement('bugsAmount_detailed',format(player.prime.gameBreak.bugs)+(tbnpDiff>0?' (+'+format(tbnpDiff)+')':''))
		if (player.prime.features>11&&player.options.detailed) {
			showElement('halfClicks_detailed','inline')
			updateElement('halfClicksAmount_detailed',format(player.prime.gameBreak.halfClicks)+(halfClickGain>0?' (+'+format(halfClickGain)+')':''))
		} else hideElement('halfClicks_detailed')
		if (player.prime.features>17&&player.options.detailed) {
			showElement('parallelDust_detailed','inline')
			updateElement('parallelDustAmount_detailed',format(player.prime.gameBreak.parallelDust)+(paraDustGain>0?' (+'+format(paraDustGain)+')':''))
		} else hideElement('parallelDust_detailed')
	} else hideElement('bugs_detailed')

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
			updateElement('factor_prime',format(virtual.activated?virtual.primeFactor:primeFactor)+'x')
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
			var tempBoostFactor=virtual.activated?virtual.boostFactors[0]:boostFactors[0]
			updateElement('factor_boost',(tempBoostFactor<1?format(tempBoostFactor,2,true):format(tempBoostFactor))+'x')
		} else hideElement('factorRow_boost')
		if (player.prime.features>10) {
			showElement('factorRow_bug','table-row')
			updateElement('factor_bug',format(virtual.activated?virtual.bugFactor:bugFactor)+'x')
		} else hideElement('factorRow_bug')
		if (player.prime.features>13) {
			showElement('factorRow_challenge','table-row')
			updateElement('factor_challenge',format(challengeFactor)+'x')
		} else hideElement('factorRow_challenge')
	}
	if (currentTab=='prime') {
		updateClass('prestige_1',tempNumber<1e11&&challengeNextPrime<1?'button_unaffordable':'')
		if (currentFeatureTab!=oldFeatureTab) {
			if (oldFeatureTab!='') hideElement("featureTab_"+oldFeatureTab)
			if (currentFeatureTab!='') showElement("featureTab_"+currentFeatureTab,"block")
			oldFeatureTab=currentFeatureTab
		}
		if (player.milestones>4) {
			updateElement('prestige_1',(tempChallenge==challengeNextPrime?(tbnpDiff>0?'Break the game and alter the production':tempChallenge>0?'Embrace the power and retry the challenge #'+tempChallenge:'Embrace the power of prime'):challengeNextPrime==0?'Exit the challenge to become normal':'Start the challenge with negative boost #'+challengeNextPrime)+'.<br>Gain '+format(tempPrimeGain)+' prime.<br>'+(player.prime.features>2?'('+formatRate(tempPrimeGainRate)+'; peak: '+formatRate(tempPrimeGainRatePeak)+')':''))
			if (currentFeatureTab=='features') {
				for (id=1;id<Math.min(player.prime.features+2,19);id++) {
					updateElement('featureUnlock_'+id,'Cost: '+format(costs.features[id-1])+' P')
					if (player.prime.features<id) updateClass('featureUnlock_'+id,player.prime.primes<costs.features[id-1]?'button_unaffordable':'')
				}
			}
			if (currentFeatureTab=='upgrades') {
				updateElement('prime_factor',format(virtual.activated?virtual.primeFactor:primeFactor)+'x')
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
				var tempBoostFactor=player.activated?virtual.boostFactors[0]:boostFactors[0]
				updateElement('boost_factor',(tempBoostFactor<1?format(tempBoostFactor,2,true):format(tempBoostFactor))+'x')
				updateElement('fuel',(player.prime.features>8?'('+tempFuelEfficient+'% efficient) ':'')+remainingFuel+' / '+player.prime.boosts.fuel)
				updateElement('buy_fuel','Cost: '+format(costs.fuel)+' P')
				updateClass('buy_fuel',player.prime.primes<costs.fuel?'button_unaffordable':'')
				var challengeCheck1=0
				var challengeCheck2=0
				for (id=1;id<=unlockedBoosts;id++) if (weightsThisPrime[id-1]!=0) challengeCheck1++
				if (challengeCheck1==1) for (id=1;id<=unlockedBoosts;id++) if (weightsThisPrime[id-1]==nextBoostRequirements[id-1]+22&&player.prime.boosts.fuelEfficient>=challengeFuelEfficiencyRequirements[id-1]) challengeCheck2=id
				for (id=1;id<=unlockedBoosts;id++) {
					if (challengesUnlocked>=id) updateClass('challenge_'+id,id!=challengeCheck2?'button_unaffordable':'')
				}
				if (player.prime.features>6) {
					showElement('upgrade_fuel_efficient','table-row')
					updateElement('upgrade_fuel_efficient','Upgrade Efficiency<br>Cost: '+format(costs.fuelEfficient)+' P')
					updateClass('upgrade_fuel_efficient',player.prime.primes<costs.fuelEfficient?'button_unaffordable':'')
				} else hideElement('upgrade_fuel_efficient')
			}
			if (currentFeatureTab=='game_break') {
				if (tempChallenge!=4||tbnpDiff<1) {
					updateElement('bugs_gain',tempChallenge==4?'You need to reach '+format(Math.pow((player.prime.gameBreak.bugs+1)/bugGainFactor,5/4)*1e2,2,true)+' to be able to gain bugs.':'You need to run challenge 4 to be able to gain bugs.')
				} else {
					updateElement('bugs_gain','You will gain '+format(tbnpDiff)+' bug'+(tbnpDiff>1?'s':'')+' after embrace.')
				}
				updateElement('bugs',format(player.prime.gameBreak.bugs))
				updateElement('bugFactor',format(virtual.activated?virtual.bugFactor:bugFactor)+'x')
				updateElement('bugGainFactor',player.prime.features>11?'<b>Bug Gain Factor</b>: '+format(bugGainFactor)+'x':'')
				var showMoreUpgs=player.statistics.highestParallelUniverse>0
				updateElement('primeDivision',showMoreUpgs?'<b>Prime divided by</b>: '+format(tempPrimeDivision)+'x<br>(<b>NOTE</b>: This does not work outside of challenge 4)':'')
				if (player.prime.features>11) {
					updateElement('half_clicks_amount',format(player.prime.gameBreak.halfClicks))
					var tempHalfClickGain=virtual.activated?virtual.halfClickGain:halfClickGain
					updateElement('half_click_gain','You will gain '+format(tempHalfClickGain)+' half click'+(tempHalfClickGain!=1?'s':'')+' after you complete challenge 4.')
					for (id=1;id<(showMoreUpgs?9:5);id++) {
						updateElement('break_upgrade_'+id,'Cost: '+format(costs.breakUpgrades[id-1])+' HC')
						updateClass('break_upgrade_'+id,player.prime.gameBreak.upgrades.includes(id)?'button_bought':player.prime.gameBreak.halfClicks<costs.breakUpgrades[id-1]?'button_unaffordable':'')
					}
					if (showMoreUpgs) {
						showElement('break_upgrade_row_2','table-row')
						showElement('break_upgrade_buttons_row_2','table-row')
					} else {
						hideElement('break_upgrade_row_2')
						hideElement('break_upgrade_buttons_row_2')
					}
				}
				if (player.prime.features>12) {
					updateElement('product',format(bugsHCProduct))
					updateElement('next_parallel_universe_requirement',format(nextParaUniReq))
					updateClass('prestige_1.01',nextParaUniReq>bugsHCProduct?'button_unaffordable':'')
				}
				if (player.prime.features>17) {
					updateElement('parallel_dust','<b>Parallel dust</b>: '+format(player.prime.gameBreak.parallelDust)+' (x'+format(paraDustFactor)+' for bug gain factor)<br>You will gain '+format(paraDustGain)+' when you go to another parallel universe.')
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
		if (player.options.detailed&&player.prime.features>15) {
			showElement('statistics_virtualPrimed','table-row')
			showElement('statistics_thisVirtualPrime','table-row')
			updateElement('statisticsValue_virtualPrimed',player.statistics.virtualPrimed+'x')
			updateElement('statisticsValue_thisVirtualPrime',formatTime(player.statistics.thisVirtualPrime))
		} else {
			hideElement('statistics_virtualPrimed')
			hideElement('statistics_thisVirtualPrime')
		}
		if (player.options.detailed&&player.prime.features>16) {
			showElement('statistics_highestParallelUniverse','table-row')
			updateElement('statisticsValue_highestParallelUniverse','#'+(player.statistics.highestParallelUniverse+1))
		} else hideElement('statistics_highestParallelUniverse')
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
	for (i=1;i<Math.min(player.milestones+2,24);i++) result=result+'<tr><td><b>Milestone #'+i+'</b>: '+milestoneRequirements[i-1]+'</td><td>'+(i>player.milestones?'Incomplete':'Completed')+'</td></tr>'
	updateElement('table_milestones',result)
	updateElement('nextMilestone',player.options.detailed?'<b>Next milestone</b> ('+Math.floor(player.milestones/23*100)+'%; '+player.milestones+' / 23):<br>'+(player.milestones>20?'None! Congratulations!':milestoneRequirements[player.milestones]):'')
}

function getMilestone(id) {
	if (id>player.milestones) {
		player.milestones=id
		showNotification('<b>Milestone #'+id+' got!</b><br>'+milestoneRequirements[id-1],(id==13||id==16||id==17)?7000:0)
		updateMilestones()
	}
}

function updateCosts(onVirtual=false) {
	if (onVirtual) var tempCosts=virtual.costs
	else var tempCosts=costs.factors
	for (i=0;i<7;i++) {
		costMultipliers[i]=Math.pow(player.prime.upgrades.includes(3)?1.4:1.5,i+1)
		tempCosts[i]=Math.pow(10,i+1)*Math.pow(costMultipliers[i],onVirtual?player.prime.boosts.virtual.factors[i]-1:player.factors[i]-1)/(onVirtual?virtual.boostFactors:boostFactors)[2]
		if (i==6) tempCosts[6]=tempCosts[6]/(onVirtual?virtual.boostFactors:boostFactors)[8]
		if (player.prime.buyMode>1) tempCosts[i]*=(Math.pow(costMultipliers[i],player.prime.buyQuantity)-1)/(costMultipliers[i]-1)
	}
	var tempFuelEfficient=(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient
	if (!onVirtual) {
		costs.fuel=player.prime.boosts.fuel==0?0:Math.floor(Math.pow(player.prime.boosts.fuel>5?1.7:1.3,player.prime.boosts.fuel)*100)
		costs.autoBuyInterval=player.prime.automatedBuying.interval>0.01?Math.floor(10/Math.pow(player.prime.automatedBuying.interval,1.5)):Math.pow(1e4,0.01/player.prime.automatedBuying.interval)
		nextParaUniReq=Math.pow(10,player.prime.gameBreak.parallelUniverse*(player.prime.gameBreak.parallelUniverse+3)/4)*2e13
	}
	costs.fuelEfficient=Math.floor(Math.pow(3,Math.pow(tempFuelEfficient,2)*(tempFuelEfficient>4?1.5:1)-1)*10000)
}

function updateFactors(onVirtual=false) {
	if (onVirtual) {
		var tempFactors=virtual.factors
		var tempFactorLevels=virtual.factorLevels
	} else {
		var tempFactors=factors
		var tempFactorLevels=factorLevels
	}
	for (i=0;i<7;i++) {
		tempFactorLevels[i]=onVirtual?player.prime.boosts.virtual.factors[i]:player.factors[i]
		if (player.prime.upgrades.includes(5)) tempFactorLevels[i]+=Math.min(onVirtual?virtual.sixMinutesElapsedThisEmbrace:sixMinutesSinceLastPrime,5)
		if (player.prime.upgrades.includes(8)&&i==2) tempFactorLevels[2]+=Math.floor(tempFactorLevels[2]/2)
		if (i==6) tempFactorLevels[6]+=(virtual.activated?virtual.boostFactors:boostFactors)[7]
		var realFL=Math.max(tempFactorLevels[i],1)
		if (player.prime.upgrades.includes(2)&&realFL>25) tempFactors[i]=Math.pow(26/25,realFL-25)*25
		else tempFactors[i]=realFL
		if (i==6&&player.prime.upgrades.includes(4)) tempFactors[i]=Math.pow(tempFactors[i],1.5)
		tempFactors[i]=Math.floor(tempFactors[i])
	}
}

function updateFactorDisplay() {
	var showFactor=true
	for (i=0;i<7;i++) {
		if (i>0) {
			if ((virtual.activated?player.prime.boosts.virtual.factors[i-1]:player.factors[i-1])<2) showFactor=false
		}
		if (!showFactor) hideElement('factorRow_'+(i+1))
		else {
			showElement('factorRow_'+(i+1),'table-row')
			var tempFactorLevel=(virtual.activated?player.prime.boosts.virtual:player).factors[i]
			var tempExtraFactorLevel=virtual.activated?virtual.factorLevels[i]:factorLevels[i]
			var tempFactor=virtual.activated?virtual.factors[i]:factors[i]
			var factorLevel=tempFactorLevel+(tempExtraFactorLevel>tempFactorLevel?' + '+(tempExtraFactorLevel-tempFactorLevel):tempExtraFactorLevel<tempFactorLevel?' - '+(tempFactorLevel-tempExtraFactorLevel):'')
			updateElement('factor_'+(i+1),tempFactor>tempExtraFactorLevel?format(tempFactor)+'x ('+factorLevel+')':factorLevel+'x')
			var tempCost=virtual.activated?virtual.costs[i]:costs.factors[i]
			updateElement('factorUpgrade_'+(i+1),'Cost: '+format(tempCost))
			updateClass('factorUpgrade_'+(i+1),(virtual.activated?player.prime.boosts.virtual.number:player.number)<tempCost?'button_unaffordable':'')
		}
	}
}

function buyFactor(id,auto=false,onVirtual=false) {
	var spentAmount=onVirtual?virtual.costs[id-1]:costs.factors[id-1]
	var quantity=onVirtual?player.prime.boosts.virtual.number:player.number
	if (quantity>=spentAmount) {
		if (player.prime.buyMode<2||auto) {
			var buying=1
			if (player.prime.buyQuantity>1||auto) {
				buying=Math.min(Math.floor(Math.log10(quantity/spentAmount*(costMultipliers[id-1]-1)+1)/Math.log10(costMultipliers[id-1])),auto?occurrences:player.prime.buyQuantity)
				spentAmount*=(Math.pow(costMultipliers[id-1],buying)-1)/(costMultipliers[id-1]-1)
			}
		} else buying=player.prime.buyQuantity
		if (onVirtual) {
			player.prime.boosts.virtual.number-=spentAmount
			player.prime.boosts.virtual.factors[id-1]+=buying
		} else {
			player.number-=spentAmount
			player.factors[id-1]+=buying
		}
		updateFactors(onVirtual)
		updateCosts(onVirtual)
		getMilestone(1)
		if (id>1) getMilestone(2)
		if (id>3) getMilestone(3)
		if (id>6) getMilestone(4)
	}
}

function updateLast10Embraces() {
	for (id=0;id<10;id++) {
		if (player.options.detailed&&player.statistics.last10Embraces[id]) {
			showElement('statistics_lastEmbrace'+(id+1),'table-row')
			updateElement('statisticsValue_lastEmbrace'+(id+1),'+'+format(player.statistics.last10Embraces[id][0])+' P<br>('+formatRate(player.statistics.last10Embraces[id][1])+'; peak: '+formatRate(player.statistics.last10Embraces[id][2])+'; number: '+format(player.statistics.last10Embraces[id][3])+(player.statistics.last10Embraces[id][4]?'; virtual':'')+')')
		} else hideElement('statistics_lastEmbrace'+(id+1))
	}
}

function updateFeatures() {
	for (id=1;id<19;id++) {
		if (player.prime.features<id-1) {
			hideElement('featureDescription_'+id)
			hideElement('featureUnlock_'+id)
		} else {
			showElement('featureDescription_'+id,'table-cell')
			showElement('featureUnlock_'+id,'inline')
			updateElement('featureDescription_'+id,'<b>'+featureDescriptions[id-1][0]+'</b><br>'+featureDescriptions[id-1][1])
			updateElement('featureUnlock_'+id,'Cost: '+format(costs.features[id-1])+' P')
			updateClass('featureUnlock_'+id,player.prime.features>=id?'button_bought':player.prime.primes<costs.features[id-1]?'button_unaffordable':'')
		}
	}
}

function buyFeature(id) {
	if (player.prime.primes>=costs.features[id-1]&&id>player.prime.features) {
		player.prime.primes-=costs.features[id-1]
		player.prime.features=id
		if (id==1) showElement('featureTabButton_upgrades','inline')
		if (id==2) showElement('advancedBuying','table-cell')
		if (id==5||id==9||id==10||id==14||id==15||id==16) {
			showElement('featureTabButton_boosts','inline')
			updateBoostDisplay()
		}
		if (id==9) updateAutoBuyIntervalDisplay()
		if (id==11) showElement('featureTabButton_game_break','inline')
		if (id==12) {
			showElement('half_clicks','table-cell')
			showElement('break_upgrades','table')
			updateElement('option_half_click_gain','Half click gain: OFF')
		}
		if (id==13) showElement('parallel_universes','block')
		if (id==14) player.prime.boosts.virtual.fuelEfficient=player.prime.boosts.fuelEfficient
		if (id==16) updateCosts(true)
		if (id==17) showElement('prestige_1.02','block')
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

function updatePrimeFactor(onVirtual=false) {
	tempPrimeFactor=1
	if (player.prime.upgrades.includes(1)) tempPrimeFactor=10
	if (player.prime.upgrades.includes(5)) tempPrimeFactor*=Math.max(Math.pow(Math.log10(player.statistics.thisPrime+1),1.5),1)
	if (player.prime.upgrades.includes(7)) tempPrimeFactor*=Math.pow(Math.log10(player.statistics.primed)+1,2)
	if (player.prime.upgrades.includes(9)) for (id=0;id<7;id++) tempPrimeFactor*=Math.pow(1.005,(virtual.activated?player.prime.boosts.virtual:player).factors[id])
	if (player.prime.upgrades.includes(10)) tempPrimeFactor*=Math.log10(player.statistics.totalNumber)/5
	if (player.prime.upgrades.includes(11)) tempPrimeFactor*=Math.pow(10,60/(player.statistics[virtual.activated?'thisVirtualPrime':'thisPrime']+60))
	if (player.prime.upgrades.includes(12)) tempPrimeFactor*=Math.sqrt((virtual.activated?virtual.factors:factors)[5])
	tempPrimeFactor=Math.floor(tempPrimeFactor)
	if (virtual.activated) virtual.primeFactor=tempPrimeFactor
	else primeFactor=tempPrimeFactor
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

function updateBoosts(onVirtual=false) {
	remainingFuel=player.prime.boosts.fuel
	var realWeights=[]
	var tempChallenge=onVirtual?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current
	for (id=0;id<8;id++) {
		remainingFuel-=weightsThisPrime[id]
		var tempFuelLevel=(onVirtual?player.prime.boosts.virtual:player.prime.boosts).weights[id]+((player.prime.challenges.completed.includes(id+1)&&tempChallenge<1)?5+2.5*player.prime.gameBreak.parallelUniverse:0)
		realWeights[id]=tempFuelLevel*(onVirtual?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient
		if (onVirtual) virtual.usedFuelWithExtras[id]=tempFuelLevel
		else usedFuelWithExtras[id]=tempFuelLevel
	}
	if (tempChallenge>0) realWeights[tempChallenge-1]=-realWeights[tempChallenge-1]
	var tempBoostFactors=onVirtual?virtual.boostFactors:boostFactors
	tempBoostFactors[1]=Math.pow(realWeights[0]<0?0.5:2,Math.sqrt(Math.abs(realWeights[0])))
	tempBoostFactors[2]=Math.pow(realWeights[1]<0?0.1:10,Math.sqrt(Math.abs(realWeights[1])))
	tempBoostFactors[3]=Math.pow(Math.log10(player.statistics.playtime),Math.sqrt(Math.abs(realWeights[2]))*(realWeights[2]<0?-1:1))
	tempBoostFactors[4]=Math.pow(Math.max(Math.log10(getRealPrime(onVirtual)),1),Math.sqrt(Math.abs(realWeights[3]))*(realWeights[3]<0?-1:1))
	tempBoostFactors[5]=Math.pow((onVirtual?player.prime.boosts.virtual:player).factors[6],0.3*Math.sqrt(Math.abs(realWeights[4]))*(realWeights[4]<0?-1:1))
	tempBoostFactors[6]=Math.pow(Math.max(Math.log10((onVirtual?player.prime.boosts.virtual:player).number)*0.2,1),Math.sqrt(Math.abs(realWeights[5]))*(realWeights[5]<0?-1:1))
	tempBoostFactors[7]=Math.floor(Math.sqrt(Math.abs(realWeights[6]))*(realWeights[6]<0?-1:1))
	var absRW8=Math.abs(realWeights[7])
	tempBoostFactors[8]=Math.pow((virtual.activated?virtual.factors:factors)[0],Math.sqrt(absRW8>9?(10-1/(absRW8-9)):absRW8)*(realWeights[7]<0?-1:1))
	tempBoostFactors[0]=tempBoostFactors[1]*tempBoostFactors[3]*tempBoostFactors[4]*tempBoostFactors[5]*tempBoostFactors[6]
	if (tempChallenge<1) tempBoostFactors[0]=Math.floor(tempBoostFactors[0])
}

function updateBoostDisplay() {
	unlockedBoosts=0
	challengesUnlocked=0
	var tempFuelEfficient=(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient
	for (id=1;id<9;id++) {
		if (player.prime.boosts.fuel<nextBoostRequirements[id-1]) {
			hideElement('boost_'+id)
			hideElement('boost_buttons_'+id)
		} else {
			unlockedBoosts++
			showElement('boost_'+id,'table-cell')
			showElement('boost_buttons_'+id,'table-cell')
			var challengeRequirement=nextBoostRequirements[id-1]+22
			if (player.prime.features>8&&player.prime.boosts.fuel>=challengeRequirement) challengesUnlocked++
			updateElement('boost_buttons_'+id,"<button onclick='boostUp("+id+",true)'>-</button> <b>Level</b>: <text id='used_fuel_"+id+"'>"+getBoostWeightText(id-1)+"</text> <button onclick='boostUp("+id+",false)'>+</button><br>"+
			(id>challengesUnlocked?'':"<br><button "+(weightsThisPrime[id-1]!=nextBoostRequirements[id-1]+22||tempFuelEfficient<challengeFuelEfficiencyRequirements[id-1]?"class='button_unaffordable'":"")+" id='challenge_"+id+"' onclick='takeChallenge("+id+")'>Challenge #"+id+": "+(challengeNextPrime==id?'ON':'OFF')+"<br>(requires exact "+challengeRequirement+" fuel<br>for this boost only)</button>")+
			(player.prime.features>13?'<br><b>High score</b> (prime): '+format(player.prime.challenges.highScore[id-1]):'')+
			(player.prime.features>14?"<br><button class='"+(player.prime.boosts.dumped<1?"":player.prime.boosts.dumped==id?"button_bought":"button_unaffordable")+"' id='dump_boost_"+id+"' onclick='dump_boost("+id+")'>Dump this boost and keep it<br>in next parallel universe.":''))
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
	updateElement('fuelPack',player.prime.features>9?"<button id='button_fuelPack' onclick='switchFuelPack()'>Fuel pack: "+(player.prime.boosts.fuelPack>25?"Max":player.prime.boosts.fuelPack+"x")+"</button><br>(You gain/remove <text id='description_fuelPack'>"+(player.prime.boosts.fuelPack>25?"all levels":player.prime.boosts.fuelPack>1?player.prime.boosts.fuelPack+" levels":"1 level")+"</text> after clicking plus or minus button.)"+
		(player.prime.features>15?"<br><button id='go_virtual' onclick='go_virtual()'>Go "+(virtual.activated?'back to reality':'virtual')+".</button>":''):"")
	var tempChallenge=virtual.activated?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current
	updateElement('currentChallenge',tempChallenge>0?'<b>Current challenge</b>: '+tempChallenge:'')
	var challFuelEffReq=challengeFuelEfficiencyRequirements[tempChallenge]
	if (tempFuelEfficient>challFuelEffReq&&challFuelEffReq>0) {
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

function getBoostWeightText(id) {
	var weight=(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).weights[id]
	var diff=(virtual.activated?virtual.usedFuelWithExtras:usedFuelWithExtras)[id]-weight
	return weight+(weightsThisPrime[id]!=weight?' ('+weightsThisPrime[id]+')':'')+(diff!=0?' + '+diff:'')
}

function boostUp(id,negative) {
	var add=Math.min(negative?weightsThisPrime[id-1]:remainingFuel,player.prime.boosts.fuelPack)*(negative?-1:1)
	if (add!=0) {
		weightsThisPrime[id-1]+=add
		remainingFuel-=add
		updateElement('used_fuel_'+id,getBoostWeightText(id-1))
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
		if (player.prime.advancedBuying.enabled[factor-1]) buyFactor(factor,false,virtual.activated)
	}
}

function openAdvBuySetting(id) {
	if (id>0) {
		var accessId=(virtual.activated&&id>1?player.prime.boosts.virtual:player.prime)[(id>1?'automated':'advanced')+'Buying']
		var selectList=''
		for (idF=1;idF<8;idF++) selectList=selectList+"<option value="+idF+">"+idF+"</option>"
	}
	for (idF=1;idF<8;idF++) {
		var preceding='<td><b>Factor '+romanNumerals[idF-1]+'</b>:</td>'
		if (id<1) updateElement('factorRow_'+idF,preceding+"<td id='factor_"+idF+"'></td><td><button id='factorUpgrade_"+idF+"' onclick='buyFactor("+idF+",false,virtual.activated)'></button></td>")
		else {
			showElement('factorRow_'+idF,'table-row')
			updateElement('factorRow_'+idF,preceding+"<td colspan=2><b>Enabled</b>: <input id='advBuyFactor_toggle_"+idF+"' type='checkbox' onchange='changeAdvBuySetting("+idF+",1)' "+(accessId.enabled[idF-1]?'checked':'')+"> <b>Priority</b>: <select id='advBuyFactor_priority_"+idF+"' onchange='changeAdvBuySetting("+idF+",2)'>"+selectList+"</select></td>")
			document.getElementById('advBuyFactor_priority_'+idF).value=accessId.priorities[idF-1]
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
	var accessId=(virtual.activated&&advBuyTab>1?player.prime.boosts.virtual:player.prime)[(advBuyTab>1?'automated':'advanced')+'Buying']
	if (id==1) accessId.enabled[factor-1]=document.getElementById('advBuyFactor_toggle_'+factor).checked
	if (id==2) {
		id=0
		var value1=accessId.priorities[factor-1]
		var value2=parseInt(document.getElementById('advBuyFactor_priority_'+factor).value)
		while (accessId.priorities[id]!=value2) id++
		accessId.priorities[factor-1]=value2
		accessId.priorities[id]=value1
		document.getElementById('advBuyFactor_priority_'+(id+1)).value=value1
		if (advBuyTab<1) {
			advBuyPriorities[value1-1]=id+1
			advBuyPriorities[value2-1]=factor
		} else if (virtual.activated) {
			virtual.autoBuyPriorities[value1-1]=id+1
			virtual.autoBuyPriorities[value2-1]=factor
		} else {
			autoBuyPriorities[value1-1]=id+1
			autoBuyPriorities[value2-1]=factor
		}
	}
	if (virtual.activated) {
		if (id==3) player.prime.boosts.virtual.automatedBuying.automatedEmbrace=document.getElementById('option_automatic_embrace').checked
		if (id==4) player.prime.boosts.virtual.automatedBuying.waitForNextEmbrace=ocument.getElementById('option_wait_for_next').value
	} else {
		if (id==3) player.prime.automatedBuying.prime.enabled=document.getElementById('option_automatic_embrace').checked
		if (id==4) player.prime.automatedBuying.prime.waitForNext=document.getElementById('option_wait_for_next').value
	}
}

function toggleAutoBuy() {player.prime.automatedBuying.autoBuyEnabled=!player.prime.automatedBuying.autoBuyEnabled}

function reduceAutoBuyInterval() {
	if (player.prime.primes>=costs.autoBuyInterval) {
		player.prime.primes-=costs.autoBuyInterval
		player.prime.automatedBuying.interval=player.prime.automatedBuying.interval*0.9
		updateCosts()
		updateAutoBuyIntervalDisplay()
	}
}

function updateAutoBuyIntervalDisplay() {
	updateElement('autoBuyInterval',(player.prime.automatedBuying.interval<0.1?format(player.prime.automatedBuying.interval,1,true):player.prime.automatedBuying.interval.toFixed(2))+'s (-10%)')
	updateElement('upgrade_autoBuyInterval','Cost: '+format(costs.autoBuyInterval)+' P')
	updateClass('upgrade_autoBuyInterval',player.prime.primes<costs.autoBuyInterval?'button_unaffordable':'')
	updateElement('automatic_embrace',player.prime.features>7?"<br><b>Automatic Embrace</b>: <input id='option_automatic_embrace' type='checkbox' onchange='changeAdvBuySetting(0,3)' "+((virtual.activated?player.prime.boosts.virtual.automatedBuying.automatedEmbrace:player.prime.automatedBuying.prime.enabled)?'checked':'')+"><br><b>Wait (prime) for next embrace</b>: <input id='option_wait_for_next' type='text' onchange='changeAdvBuySetting(0,4)'></input>":'')
	if (player.prime.features>7) document.getElementById('option_wait_for_next').value=virtual.activated?player.prime.boosts.virtual.automatedBuying.waitForNextEmbrace:player.prime.automatedBuying.prime.waitForNext
}

function upgradeFuelEfficient() {
	if (player.prime.primes>=costs.fuelEfficient) {
		player.prime.primes-=costs.fuelEfficient;
		(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient+=0.5
		getMilestone(10)
		updateBoosts()
		updateBoostDisplay()
		updateCosts()
	}
}

function takeChallenge(id) {
	for (boost=1;boost<9;boost++) {
		if (boost!=id) if (weightsThisPrime[id-1]!=nextBoostRequirements[id-1]+22||(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient<challengeFuelEfficiencyRequirements[id-1]) return
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
	(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient=challengeFuelEfficiencyRequirements[virtual.activated?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current]
	hideElement('remove_fuel_efficient')
	updateBoosts()
	updateCosts()
}

function updateBugFactor(onVirtual=false) {
	var base=Math.ceil((onVirtual?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current)!=4?Math.pow(player.prime.gameBreak.bugs+1,1/8):player.prime.gameBreak.bugs>1e7?Math.pow(player.prime.gameBreak.bugs,1/4)*3162.2776601683795:Math.pow(player.prime.gameBreak.bugs+1,3/4))
	if (onVirtual) virtual.bugFactor=base
	else bugFactor=base
}

function toggleHalfClickGain() {
	player.prime.gameBreak.halfClickGain=!player.prime.gameBreak.halfClickGain
	updateElement('option_half_click_gain','Half click gain: '+(player.prime.gameBreak.halfClickGain?'ON':'OFF'))
}

function updateBugGainFactor() {
	paraDustFactor=Math.ceil(Math.sqrt(player.prime.gameBreak.parallelDust+1))
	
	bugGainFactor=player.prime.gameBreak.upgrades.includes(1)?3:1
	if (player.prime.gameBreak.upgrades.includes(2)) bugGainFactor*=Math.log10(Math.max(player.prime.gameBreak.halfClicks,1))/Math.log10(3)+1
	if (player.prime.gameBreak.upgrades.includes(3)) bugGainFactor*=1+Math.sqrt(600/player.statistics.fastestHalfClickRun)
	if (player.prime.gameBreak.upgrades.includes(4)) bugGainFactor*=Math.pow(player.prime.boosts.fuel,0.25)
	bugGainFactor=Math.floor(bugGainFactor*paraDustFactor)
}

function buyBreakUpgrade(id) {
	if (player.prime.gameBreak.halfClicks>=costs.breakUpgrades[id-1]&&!player.prime.gameBreak.upgrades.includes(id)) {
		player.prime.gameBreak.halfClicks-=costs.breakUpgrades[id-1]
		player.prime.gameBreak.upgrades.push(id)
		if (id<5) updateBugGainFactor()
		else {
			if (id<6) getMilestone(21)
			updatePrimeDivision()
		}
		if (player.prime.gameBreak.upgrades.length>3) getMilestone(19)
	}
}

function updateChallengeFactor() {
	challengeFactor=1
	for (chall=1;chall<9;chall++) challengeFactor*=Math.pow(player.prime.challenges.highScore[chall-1]/challengeGoals[chall-1],0.2)
	challengeFactor=Math.floor(challengeFactor)
}

function getRealPrime(onVirtual=false) {
	if ((onVirtual?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current)==4) return Math.max(player.prime.primes/(onVirtual?virtual.primeDivision:primeDivision),1e7)
	return player.prime.primes
}

function updatePrimeDivision(onVirtual=false) {
	var tempPrimeDivision=1
	if (player.prime.gameBreak.upgrades.includes(5)) tempPrimeDivision*=Math.pow(3,Math.sqrt(Math.log10(player.prime.gameBreak.bugs+1)))
	if (player.prime.gameBreak.upgrades.includes(6)) tempPrimeDivision*=Math.pow(3,Math.sqrt(Math.log10((onVirtual?player.prime.boosts.virtual:player).number+1e-10)+10))
	if (player.prime.gameBreak.upgrades.includes(7)) tempPrimeDivision*=Math.pow(3,(onVirtual?player.prime.boosts.virtual:player.prime.boosts).fuelEfficient-1)
	if (player.prime.gameBreak.upgrades.includes(8)) tempPrimeDivision*=Math.pow(3,Math.sqrt(Math.log10(challengeFactor)))
	tempPrimeDivision=Math.floor(tempPrimeDivision)
	if (onVirtual) virtual.primeDivision=tempPrimeDivision
	else primeDivision=tempPrimeDivision
	updateBoosts(onVirtual)
}

function dump_boost(id) {
	if (player.prime.boosts.dumped<1) {
		player.prime.boosts.dumped=id
		for (idb=1;idb<9;idb++) updateClass('dump_boost_'+idb,idb==id?'button_bought':'button_unaffordable')
	}
}

function go_virtual() {
	virtual.activated=!virtual.activated
	if (advBuyTab>1) openAdvBuySetting(2)
	for (id=0;id<8;id++) weightsThisPrime[id]=(virtual.activated?player.prime.boosts.virtual:player.prime.boosts).weights[id]
	challengeNextPrime=virtual.activated?player.prime.boosts.virtual.currentChallenge:player.prime.challenges.current
	updateCosts(virtual.activated)
	updateBoosts(virtual.activated)
	updateBoostDisplay()
}