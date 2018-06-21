player={lastTick:new Date().getTime(),
	milestones:0,
	number:0,
	factors:[1,1,1,1,1,1,1],
	prime:{primes:0,
		features:[],
		upgrades:[],
		buyQuantity:1,
		boosts:{fuel:0,
			weights:[0,0,0,0,0,0,0,0]},
		buyMode:1,
		advancedBuying:{enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7]},
		automatedBuying:{autoBuyEnabled:false,
			interval:1,
			lastTick:0,
			enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7]},
		fuelEfficient:1,
		challenges:{current:0,
			completed:[]}},
	statistics:{playtime:0,
		totalNumber:0,
		primed:0,
		thisPrime:0},
	options:{notation:0,
		updateRate:20},
	version:0.152,
	beta:0}
const timeframes={year:31556952,
	month:2629746,
	day:86400,
	hour:3600,
	minute:60,
	second:1}
const notationArray=['Scientific','Engineering','Standard','Logarithm','Letters','Mobile']
const standardAbbs=['k','M','B','T','Q','Qi','S','Sp','O','N',
	'D','UD','DD','TD','QD','QiD','SD','SpD','OD','ND',
	'Vg','UV','DV','TV','QV','QiV','SV','SpV','OV','NV',
	'Tg','UT','DT','TT','QT','QiT','ST','SpT','OT','NT',
	'Qg','UQ','DQ','TQ','QQ','QiQ','SQ','SpQ','OQ','NQ',
	'Qig','UQi','DQi','TQi','QQi','QiQi','SQi','SpQi','OQi','NQi',
	'Sg','US','DS','TS','QS','QiS','SS','SpS','OS','NS',
	'Spg','USp','DSp','TSp','QSp','QiSp','SSp','SpSp','OSp','NSp',
	'Og','UO','DO','TO','QO','QiO','SO','SpO','OO','NO',
	'Ng','UN','DN','TN','QN','QiN','SN','SpN','ON','NN',
	'C','UC']
const lettersAbbs=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
	'aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at','au','av','aw','ax','ay','az',
	'ba','bb','bc','bd','be','bf','bg','bh','bi','bj','bk','bl','bm','bn','bo','bp','bq','br','bs','bt','bu','bv','bw','bx','by','bz',
	'ca','cb','cc','cd','ce','cf','cg','ch','ci','cj','ck','cl','cm','cn','co','cp','cq','cr','cs','ct','cu','cv','cw','cx']
const mobileAbbs=['k','M','B','T','aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at','au','av','aw','ax','ay','az',
	'ba','bb','bc','bd','be','bf','bg','bh','bi','bj','bk','bl','bm','bn','bo','bp','bq','br','bs','bt','bu','bv','bw','bx','by','bz',
	'ca','cb','cc','cd','ce','cf','cg','ch','ci','cj','ck','cl','cm','cn','co','cp','cq','cr','cs','ct','cu','cv','cw','cx','cy','cz',
	'da','db','dc','dd','de','df','dg','dh','di','dj','dk','dl','dm','dn','do','dp','dq','dr','ds','dt']
const romanNumerals=['I','II','III','IV','V','VI','VII']

tickSpeed=0
tickDone=true
maxMillisPerTick=50
gameLoopInterval=null
simulated=false
simulatedTicksLeft=1000
simulatedTickLength=0
tickAfterSimulated=0
lastSave=0
sinceLastSave=0
currentTab='factors'
oldTab='factors'
currentFeatureTab=''
oldFeatureTab=''
showNotificationTimeout=null

const milestoneRequirements=['Buy the first factor.','Buy the Factor II.','Buy the Factor IV.','Buy the Factor VII.','Embrace the power of prime.','Buy 4 upgrades.','Buy 8 upgrades.','Use fuel to activate your first boost.','Activate the fourth boost.','Upgrade your fuel to have 150% efficiency.','Buy 12 upgrades.','Activate the eighth boost.','Complete the first challenge.','Complete the fourth challenge.','Complete the eighth challenge.']
costs={factors:[10],features:[0,10,100,200,300,500,5e3,1e7],upgrades:[1,2,3,4,8,15,35,55,1e4,2e4,5e4,1e5]}
costMultipliers=[]
numberPerSecond=0
factors=[1,1,1,1,1,1,1]
factorLevels=[1,1,1,1,1,1,1]
primeGain=1
featureDescriptions=[null,['Buy Quantity','Able to buy more than one purchase with one click.'],['Boosts','Boosts that are more powerful as you gain more.'],['Advanced B.Q.','Extends Buy Quantity to have more features.'],['Advanced Buying','Extends buying to be able to buy more than one factor.'],['Automation Buying','The automation age of buying is here.'],['Fuel Efficiency','Upgrade your fuel to have more boosts per fuel.'],['Challenges','Take a negative-boost risk to reward bigger numbers.']]
primeFactor=1
sixMinutesSinceLastPrime=0
smslpTemp=0
remainingFuel=0
boostFactors=[1,1,1,0,0,0,0,0,1]
unlockedBoosts=1
nextBoostRequirements=[0,4,6,8,12,15,18,20]
weightsThisPrime=[0,0,0,0,0,0,0,0]
advBuyTab=0
advBuyPriorities=[1,2,3,4,5,6,7]
autoBuyPriorities=[1,2,3,4,5,6,7]
occurrences=0
usedFuelWithExtras=[0,0,0,0,0,0,0,0]
challengesUnlocked=0
challengeNextPrime=0