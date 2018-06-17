function gameTick() {
	var tickTime=new Date().getTime()
	if (player.lastTick>0) {
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
		
		if (player.prime.upgrades.includes(5)) updatePrimeFactor()
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
		
		if (simulated) return
	}
	player.lastTick=tickTime
	updateElement('number',format(player.number,2)+(numberPerSecond==0?'':' (+'+format(numberPerSecond,2)+'/s)'))
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
		if (player.prime.features>0) {
			showElement('factorRow_prime','table-row')
			updateElement('factor_prime',format(primeFactor)+'x')
		} else hideElement('factorRow_prime')
		if (player.prime.features>1) {
			showElement('buyQuantity','table-row')
			updateElement('buyQuantity_value','Buy Quantity: '+(player.prime.buyQuantity<Number.MAX_VALUE?player.prime.buyQuantity+'x':'Max'))
			if (player.prime.features>3) {
				showElement('buyMode','inline')
				updateElement('buyMode','Mode: '+(player.prime.buyMode<2?'No ':'')+'Minimum')
				updateClass('buyMode',player.prime.buyQuantity<Number.MAX_VALUE?'':'button_unaffordable')
			} else hideElement('buyMode')
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
				for (id=1;id<=Math.min(player.prime.features+1,8);id++) {
					updateElement('featureUnlock_'+id,'Cost: '+format(costs.features[id-1])+' P')
					updateClass('featureUnlock_'+id,player.prime.features>=id?'button_bought':player.prime.primes<costs.features[id-1]?'button_unaffordable':'')
				}
			}
			if (currentFeatureTab=='upgrades') {
				updateElement('prime_factor',format(primeFactor)+'x')
				for (id=1;id<9;id++) {
					updateElement('upgrade_'+id,'Cost: '+format(costs.upgrades[id-1])+' P')
					updateClass('upgrade_'+id,player.prime.upgrades.includes(id)?'button_bought':player.prime.primes<costs.upgrades[id-1]?'button_unaffordable':'')
				}
			}
			if (currentFeatureTab=='boosts') {
				updateElement('boost_factor',format(boostFactors[0])+'x')
				updateElement('fuel',remainingFuel+' / '+player.prime.boosts.fuel)
				updateElement('buy_fuel','Cost: '+format(costs.fuel)+' P')
				updateClass('buy_fuel',player.prime.primes<costs.fuel?'button_unaffordable':'')
				for (id=1;id<=unlockedBoosts;id++) updateElement('used_fuel_'+id,player.prime.boosts.weights[id-1]+(weightsThisPrime[id-1]!=player.prime.boosts.weights[id-1]?' ('+weightsThisPrime[id-1]+')':''))
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
	if (currentTab=='options') {
		updateElement('option_save','Save<br>('+(sinceLastSave==1?'a second':sinceLastSave+' seconds')+' ago)')
	}
}

function updateMilestones() {
	for (i=1;i<=milestoneRequirements.length;i++) {
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
		costs.factors[i]=Math.pow(10,i+1)*Math.pow(costMultipliers[i],player.factors[i]-1)/boostFactors[2]
		if (player.prime.buyMode>1) costs.factors[i]*=(Math.pow(costMultipliers[i],player.prime.buyQuantity)-1)/(costMultipliers[i]-1)
	}
	costs.fuel=player.prime.boosts.fuel==0?0:Math.pow(1.7,player.prime.boosts.fuel)*100
}

function updateFactors() {
	for (i=0;i<7;i++) {
		factorLevels[i]=player.factors[i]
		if (player.prime.upgrades.includes(5)) factorLevels[i]+=Math.min(sixMinutesSinceLastPrime,5)
		if (player.prime.upgrades.includes(8)&&i==2) factorLevels[2]+=Math.floor(factorLevels[2]/2)
		if (player.prime.upgrades.includes(2)&&factorLevels[i]>25) factors[i]=Math.pow(26/25,factorLevels[i]-25)*25
		else factors[i]=factorLevels[i]
		if (i==6&&player.prime.upgrades.includes(4)) factors[i]=Math.pow(factors[i],1.5)
		factors[i]=Math.floor(factors[i])
	}
}

function buyFactor(id) {
	if (player.number>=costs.factors[id-1]) {
		var spentAmount=costs.factors[id-1]
		if (player.prime.buyMode<2) {
			var buying=1
			if (player.prime.buyQuantity>1) {
				buying=Math.min(Math.floor(Math.log10(player.number/spentAmount*(costMultipliers[id-1]-1)+1)/Math.log10(costMultipliers[id-1])),player.prime.buyQuantity)
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
	for (id=2;id<9;id++) {
		if (player.prime.features<id-1) {
			hideElement('featureDescription_'+id)
			hideElement('featureUnlock_'+id)
		} else {
			showElement('featureDescription_'+id,'table-cell')
			showElement('featureUnlock_'+id,'inline')
			updateElement('featureDescription_'+id,'<b>'+featureDescriptions[id-1][0]+'</b><br>'+featureDescriptions[id-1][1])
		}
	}
}

function buyFeature(id) {
	if (player.prime.primes>=costs.features[id-1]&&id>player.prime.features) {
		player.prime.primes-=costs.features[id-1]
		player.prime.features=id
		if (id==1) showElement('featureTabButton_upgrades','inline')
		if (id==3) showElement('featureTabButton_boosts','inline')
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
	}
}

function updatePrimeFactor() {
	primeFactor=1
	if (player.prime.upgrades.includes(1)) primeFactor=10
	if (player.prime.upgrades.includes(5)) primeFactor*=Math.max(Math.pow(Math.log10(player.statistics.thisPrime+1),1.5),1)
	if (player.prime.upgrades.includes(7)) primeFactor*=Math.pow(Math.log10(player.statistics.primed)+1,2)
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
	for (id=0;id<4;id++) remainingFuel-=weightsThisPrime[id]
	boostFactors[1]=Math.pow(2,Math.sqrt(player.prime.boosts.weights[0]))
	boostFactors[2]=Math.pow(10,Math.sqrt(player.prime.boosts.weights[1]))
	boostFactors[3]=Math.pow(Math.log10(player.statistics.playtime),Math.sqrt(player.prime.boosts.weights[2]))
	boostFactors[4]=Math.pow(Math.log10(player.prime.primes),Math.sqrt(player.prime.boosts.weights[3]))
	boostFactors[0]=Math.floor(boostFactors[1]*boostFactors[3]*boostFactors[4])
}

function updateBoostDisplay() {
	unlockedBoosts=1
	for (id=2;id<5;id++) {
		if (player.prime.boosts.fuel<nextBoostRequirements[id-2]) {
			hideElement('boost_'+id,'table-cell')
			hideElement('boost_buttons_'+id,'table-cell')
		} else {
			unlockedBoosts++
			showElement('boost_'+id)
			showElement('boost_buttons_'+id)
		}
	}
	if (unlockedBoosts>nextBoostRequirements.length) hideElement('nextBoost')
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