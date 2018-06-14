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
		
		numberPerSecond=factors[0]*factors[1]*factors[2]*factors[3]*factors[4]*factors[5]*factors[6]*primeFactor
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
				updateElement('factor_'+(i+1),format(factors[i])+'x'+(factors[i]>player.factors[i]?' ('+player.factors[i]+')':''))
				updateElement('factorUpgrade_'+(i+1),'Cost: '+format(costs.factors[i]))
				if (player.number<costs.factors[i]) updateClass('factorUpgrade_'+(i+1),'button_unaffordable')
				else updateClass('factorUpgrade_'+(i+1),'')
			} else hideElement('factorRow_'+(i+1))
		}
		if (player.prime.features.includes(1)) {
			showElement('factorRow_prime','table-row')
			updateElement('factor_prime',format(primeFactor)+'x')
		} else hideElement('factorRow_prime')
		if (player.prime.features.includes(2)) {
			showElement('buyQuantity','table-row')
			updateElement('buyQuantity_value','Buy Quantity: '+format(player.prime.buyQuantity)+'x')
		} else hideElement('buyQuantity')
	}
	if (currentTab=='prime') {
		if (player.milestones>4) {
			updateElement('prestige_1','Embrace the power of prime.<br>Gain '+format(primeGain)+' prime.')
			if (player.number<1e11) updateClass('prestige_1','button_unaffordable')
			else updateClass('prestige_1','')
			if (currentFeatureTab!=oldFeatureTab) {
				if (oldFeatureTab!='') hideElement("featureTab_"+oldFeatureTab)
				if (currentFeatureTab!='') showElement("featureTab_"+currentFeatureTab,"block")
				oldFeatureTab=currentFeatureTab
			}
			if (currentFeatureTab=='features') {
				for (id=1;id<3;id++) {
					updateElement('featureUnlock_'+id,'Cost: '+costs.features[id-1]+' P')
					if (player.prime.features.includes(id)) updateClass('featureUnlock_'+id,'button_bought')
					else if (player.prime.primes<costs.features[id-1]) updateClass('featureUnlock_'+id,'button_unaffordable')
					else updateClass('featureUnlock_'+id,'')
				}
			}
			if (currentFeatureTab=='upgrades') {
				updateElement('prime_factor',format(primeFactor)+'x')
				for (id=1;id<5;id++) {
					updateElement('upgrade_'+id,'Cost: '+costs.upgrades[id-1]+' P')
					if (player.prime.upgrades.includes(id)) updateClass('upgrade_'+id,'button_bought')
					else if (player.prime.primes<costs.upgrades[id-1]) updateClass('upgrade_'+id,'button_unaffordable')
					else updateClass('upgrade_'+id,'')
				}
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
		costs.factors[i]=Math.pow(10,i+1)*Math.pow(costMultipliers[i],player.factors[i]-1)
	}
}

function updateFactors() {
	for (i=0;i<7;i++) {
		if (player.prime.upgrades.includes(2)&&player.factors[i]>25) factors[i]=Math.pow(26/25,player.factors[i]-25)*25
		else factors[i]=player.factors[i]
		if (i==6&&player.prime.upgrades.includes(4)) factors[i]=Math.pow(factors[i],1.5)
		factors[i]=Math.floor(factors[i])
	}
}

function buyFactor(id) {
	if (player.number>=costs.factors[id-1]) {
		var spentAmount=costs.factors[id-1]
		var buying=1
		if (player.prime.buyQuantity>1) {
			buying=Math.min(Math.floor(Math.log10(player.number/spentAmount*(costMultipliers[id-1]-1)+1)/Math.log10(costMultipliers[id-1])),player.prime.buyQuantity)
			spentAmount*=(Math.pow(costMultipliers[id-1],buying)-1)/(costMultipliers[id-1]-1)
		}
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

function buyFeature(id) {
	if (player.prime.primes>=costs.features[id-1]&&!player.prime.features.includes(id)) {
		player.prime.primes-=costs.features[id-1]
		player.prime.features.push(id)
		if (id==1) showElement('featureTabButton_upgrades','inline')
	}
}

function switchFeatureTab(id) {
	currentFeatureTab=id
}

function buyUpgrade(id) {
	if (player.prime.primes>=costs.upgrades[id-1]&&!player.prime.upgrades.includes(id)) {
		player.prime.primes-=costs.upgrades[id-1]
		player.prime.upgrades.push(id)
		updatePrimeFactor()
		if (id==2||id==4) updateFactors()
		if (id==3) updateCosts()
		if (player.prime.upgrades.length>3) getMilestone(6)
	}
}

function updatePrimeFactor() {
	primeFactor=1
	if (player.prime.upgrades.includes(1)) primeFactor=10
}

function switchBuyQuantity() {
	if (player.prime.buyQuantity<2) player.prime.buyQuantity=5
	else if (player.prime.buyQuantity<6) player.prime.buyQuantity=10
	else player.prime.buyQuantity=1
}