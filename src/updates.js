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
	
	if (player.prime.upgrades.includes(5)||player.prime.upgrades.includes(11)) updatePrimeFactor()
	if (player.prime.upgrades.includes(6)) {
		smslpTemp=Math.floor(player.statistics.thisPrime/300)
		if (smslpTemp!=sixMinutesSinceLastPrime) {
			sixMinutesSinceLastPrime=smslpTemp
			updateFactors()
		}
	}
	if (player.prime.boosts.weights[2]>0) updateBoosts()
	numberPerSecond=factors[0]*factors[1]*factors[2]*factors[3]*factors[4]*factors[5]*factors[6]*primeFactor*boostFactors[0]
	player.number+=numberPerSecond*delta
	player.statistics.totalNumber+=numberPerSecond*delta
	
	if (player.milestones>4) primeGain=Math.floor(Math.pow(player.number/1e11,0.2))
		
	if (player.prime.automatedBuying.autoBuyEnabled) {
		if (player.prime.automatedBuying.lastTick>player.statistics.playtime) player.prime.automatedBuying.lastTick=player.statistics.playtime
		occurrences=Math.floor((player.statistics.playtime-player.prime.automatedBuying.lastTick)/player.prime.automatedBuying.interval)
		if (occurrences>0) {
			player.prime.automatedBuying.lastTick+=player.prime.automatedBuying.interval*occurrences
			for (id=0;id<8;id++) {
				var factor=autoBuyPriorities[id]
				if (player.prime.automatedBuying.enabled[factor-1]) buyFactor(factor,true)
			}
		}
	}
	
	if (simulated) return
	player.lastTick=tickTime
	updateElement('number',format(player.number,2)+' (+'+format(numberPerSecond,2)+'/s)')
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
				showElement('buyMode','inline')
				updateElement('buyMode','Mode: '+(player.prime.buyMode<2?'No ':'')+'Minimum')
				updateClass('buyMode',player.prime.buyQuantity<Number.MAX_VALUE?'':'button_unaffordable')
			} else hideElement('buyMode')
			if (player.prime.features>5) {
				showElement('automatedBuying','table-cell')
				updateElement('button_automatedBuying','Automated Buying: O'+(player.prime.automatedBuying.autoBuyEnabled?'n':'ff'))
			} else hideElement('automatedBuying')
		} else hideElement('buyQuantity')
		if (player.prime.features>2) {
			showElement('factorRow_boost','table-row')
			updateElement('factor_boost',format(boostFactors[0])+'x')
		} else hideElement('factorRow_boost')
	}
	if (currentTab=='prime') {
		if (player.number<1e11) updateClass('prestige_1','button_unaffordable')
		else updateClass('prestige_1','')
		if (currentFeatureTab!=oldFeatureTab) {
			if (oldFeatureTab!='') hideElement("featureTab_"+oldFeatureTab)
			if (currentFeatureTab!='') showElement("featureTab_"+currentFeatureTab,"block")
			oldFeatureTab=currentFeatureTab
		}
		if (player.milestones>4) {
			updateElement('prestige_1','Embrace the power of prime.<br>Gain '+format(primeGain)+' prime.')
			if (currentFeatureTab=='features') {
				for (id=1;id<Math.min(player.prime.features+2,9);id++) {
					updateElement('featureUnlock_'+id,'Cost: '+format(costs.features[id-1])+' P')
					updateClass('featureUnlock_'+id,player.prime.features>=id?'button_bought':player.prime.primes<costs.features[id-1]?'button_unaffordable':'')
				}
			}
			if (currentFeatureTab=='upgrades') {
				updateElement('prime_factor',format(primeFactor)+'x')
				for (id=1;id<(player.prime.fuelEfficient>1?13:9);id++) {
					updateElement('upgrade_'+id,'Cost: '+format(costs.upgrades[id-1])+' P')
					updateClass('upgrade_'+id,player.prime.upgrades.includes(id)?'button_bought':player.prime.primes<costs.upgrades[id-1]?'button_unaffordable':'')
				}
				if (player.prime.fuelEfficient>1) {
					showElement('upgrade_row_3','table-row')
					showElement('upgrade_buttons_row_3','table-row')
				} else {
					hideElement('upgrade_row_3')
					hideElement('upgrade_buttons_row_3')
				}
			}
			if (currentFeatureTab=='boosts') {
				updateElement('boost_factor',format(boostFactors[0])+'x')
				updateElement('fuel',(player.prime.features>6?'('+Math.floor(player.prime.fuelEfficient*100)+'% efficient) ':'')+remainingFuel+' / '+player.prime.boosts.fuel)
				updateElement('buy_fuel','Cost: '+format(costs.fuel)+' P')
				updateClass('buy_fuel',player.prime.primes<costs.fuel?'button_unaffordable':'')
				for (id=1;id<=unlockedBoosts;id++) updateElement('used_fuel_'+id,player.prime.boosts.weights[id-1]+(weightsThisPrime[id-1]!=player.prime.boosts.weights[id-1]?' ('+weightsThisPrime[id-1]+')':''))
				if (player.prime.features>6) {
					showElement('upgrade_fuel_efficient','table-row')
					updateElement('upgrade_fuel_efficient','Upgrade Efficiency<br>Cost: '+format(costs.fuelEfficient)+' P')
					updateClass('upgrade_fuel_efficient',player.prime.primes<costs.fuelEfficient?'button_unaffordable':'')
				} else hideElement('upgrade_fuel_efficient')
			}
		}
	}
	if (currentTab=='statistics') {
		updateElement('statisticsValue_totalPlaytime',formatTime(player.statistics.playtime))
		updateElement('statisticsValue_totalNumber',format(player.statistics.totalNumber))
		if (player.milestones<5) {
			hideElement('statistics_primed')
			hideElement('statistics_thisPrime')
		} else {
			showElement('statistics_primed','table-row')
			showElement('statistics_thisPrime','table-row')
			updateElement('statisticsValue_primed',player.statistics.primed+'x')
			updateElement('statisticsValue_thisPrime',formatTime(player.statistics.thisPrime))
		}
	}
	if (currentTab=='options') updateElement('option_save','Save<br>('+(sinceLastSave==1?'a second':sinceLastSave+' seconds')+' ago)')
}

function updateMilestones() {
	for (i=1;i<13;i++) {
		if (i-1>player.milestones) hideElement('milestone_'+i)
		else {
			showElement('milestone_'+i,'table-row')
			updateElement('milestoneDescription_'+i,'<b>Milestone #'+i+'</b>: '+milestoneRequirements[i-1])
			updateElement('milestoneCompletion_'+i,(i<=player.milestones)?'Completed':'Incomplete')
		}
	}
}

function getMilestone(id) {
	if (id>player.milestones) {
		player.milestones=id

		updateElement('notification','<b>Milestone #'+id+' got!</b><br>'+milestoneRequirements[id-1])
		updateStyle('notification','transform','translate(0%,0%)')
		clearTimeout(showNotificationTimeout)
		showNotificationTimeout=setTimeout(function(){updateStyle('notification','transform','translate(100%,0%)');},6000)
		updateMilestones()
	}
}

function updateCosts() {
	for (i=0;i<7;i++) {
		costMultipliers[i]=Math.pow(player.prime.upgrades.includes(3)?1.4:1.5,i+1)
		costs.factors[i]=Math.pow(10,i+1)*Math.pow(costMultipliers[i],player.factors[i]-1)/boostFactors[2]/boostFactors[8]
		if (player.prime.buyMode>1) costs.factors[i]*=(Math.pow(costMultipliers[i],player.prime.buyQuantity)-1)/(costMultipliers[i]-1)
	}
	costs.fuel=player.prime.boosts.fuel==0?0:Math.floor(Math.pow(1.7,player.prime.boosts.fuel)*100)
	costs.autoBuyInterval=Math.floor(Math.pow(10/player.prime.automatedBuying.interval,2))
	costs.fuelEfficient=Math.floor(Math.pow(3,Math.pow(player.prime.fuelEfficient,2)-1)*10000)
}

function updateFactors() {
	for (i=0;i<7;i++) {
		factorLevels[i]=player.factors[i]
		if (player.prime.upgrades.includes(5)) factorLevels[i]+=Math.min(sixMinutesSinceLastPrime,5)
		if (player.prime.upgrades.includes(8)&&i==2) factorLevels[2]+=Math.floor(factorLevels[2]/2)
		if (i==6) factorLevels[6]+=boostFactors[7]
		if (player.prime.upgrades.includes(2)&&factorLevels[i]>25) factors[i]=Math.pow(26/25,factorLevels[i]-25)*25
		else factors[i]=factorLevels[i]
		if (i==6&&player.prime.upgrades.includes(4)) factors[i]=Math.pow(factors[i],1.5)
		factors[i]=Math.floor(factors[i])
	}
}

function updateFactorDisplay() {
	for (i=0;i<7;i++) {
		var showFactor=false
		if (i==0) showFactor=true
		else if (player.factors[i-1]>1) showFactor=true
		
		if (showFactor) {
			showElement('factorRow_'+(i+1),'table-row')
			var factorLevel=player.factors[i]+(factorLevels[i]>player.factors[i]?' + '+(factorLevels[i]-player.factors[i]):'')
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
		updateCosts()
		updateFactors()
		getMilestone(1)
		if (id>1) getMilestone(2)
		if (id>3) getMilestone(3)
		if (id>6) getMilestone(4)
	}
}

function updateFeatures() {
	for (id=2;id<8;id++) {
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
		if (id==3) showElement('featureTabButton_boosts','inline')
		if (id==5) showElement('advancedBuying','table-cell')
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
	if (player.prime.features>3&&player.prime.buyQuantity<2) player.prime.buyQuantity=2
	else if (player.prime.buyQuantity<3) player.prime.buyQuantity=5
	else if (player.prime.buyQuantity<6) player.prime.buyQuantity=10
	else if (player.prime.features>3) {
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
		realWeights[id]=player.prime.boosts.weights[id]*player.prime.fuelEfficient
	}
	boostFactors[1]=Math.pow(2,Math.sqrt(realWeights[0]))
	boostFactors[2]=Math.pow(10,Math.sqrt(realWeights[1]))
	boostFactors[3]=Math.pow(Math.log10(player.statistics.playtime),Math.sqrt(realWeights[2]))
	boostFactors[4]=Math.pow(Math.max(Math.log10(player.prime.primes),1),Math.sqrt(realWeights[3]))
	boostFactors[5]=Math.pow(player.factors[6],0.3*Math.sqrt(realWeights[4]))
	boostFactors[6]=Math.pow(Math.max(Math.log10(player.number)*0.2,1),Math.sqrt(realWeights[5]))
	boostFactors[7]=Math.floor(Math.sqrt(realWeights[6]))
	boostFactors[8]=Math.pow(factors[0],0.5*Math.sqrt(realWeights[7]))
	boostFactors[0]=Math.floor(boostFactors[1]*boostFactors[3]*boostFactors[4]*boostFactors[5]*boostFactors[6])
}

function updateBoostDisplay() {
	unlockedBoosts=1
	for (id=2;id<9;id++) {
		if (player.prime.boosts.fuel<nextBoostRequirements[id-2]) {
			hideElement('boost_'+id)
			hideElement('boost_buttons_'+id)
		} else {
			unlockedBoosts++
			showElement('boost_'+id,'table-cell')
			showElement('boost_buttons_'+id,'table-cell')
		}
	}
	if (unlockedBoosts>7) hideElement('nextBoost')
	else {
		showElement('nextBoost','block')
		updateElement('nextBoost_value',nextBoostRequirements[unlockedBoosts-1])
	}
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

function boostUp(id,add) {
	if (add>0) {
		if (remainingFuel>0) {
			weightsThisPrime[id-1]++
			remainingFuel--
		}
	} else if (weightsThisPrime[id-1]>0) {
		weightsThisPrime[id-1]--
		remainingFuel++
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
	if (player.prime.automatedBuying.interval>0.01) {
		updateElement('autoBuyInterval',player.prime.automatedBuying.interval.toFixed(player.prime.automatedBuying.interval<0.1?3:2)+'s (-10%)')
		showElement('upgrade_autoBuyInterval','inline')
		updateElement('upgrade_autoBuyInterval','Cost: '+format(costs.autoBuyInterval)+' P')
		updateClass('upgrade_autoBuyInterval',player.prime.primes<costs.autoBuyInterval?'button_unaffordable':'')
	} else {
		updateElement('autoBuyInterval','0.010s')
		hideElement('upgrade_autoBuyInterval')
	}
}

function upgradeFuelEfficient() {
	if (player.prime.primes>=costs.fuelEfficient) {
		player.prime.primes-=costs.fuelEfficient
		player.prime.fuelEfficient=Math.round(player.prime.fuelEfficient*2+1)/2
		getMilestone(10)
		updateBoosts()
		updateCosts()
	}
}