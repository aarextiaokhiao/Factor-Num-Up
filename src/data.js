player={lastTick:new Date().getTime(),
	milestones:0,
	number:0,
	factors:[1,1,1,1,1,1,1],
	prime:{primes:0,
		features:[],
		upgrades:[],
		buyQuantity:1,
		primeGainRatePeak:0,
		boosts:{fuel:0,
			weights:[0,0,0,0,0,0,0,0],
			fuelEfficient:1,
			fuelPack:1},
		buyMode:1,
		advancedBuying:{enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7]},
		automatedBuying:{autoBuyEnabled:false,
			interval:1,
			lastTick:0,
			enabled:[true,true,true,true,true,true,true],
			priorities:[1,2,3,4,5,6,7],
			prime:{enabled:false,
				waitForNext:1}},
		challenges:{current:0,
			completed:[],
			highScore:[10,10,1,1,100,10,100,1000]},
		gameBreak:{bugs:0,
			halfClicks:0,
			halfClickGain:false,
			upgrades:[],
			parallelUniverse:0}},
	statistics:{playtime:0,
		totalNumber:0,
		primed:0,
		thisPrime:0,
		fastestChallengeTimes:{},
		fastestHalfClickRun:Number.MAX_VALUE},
	options:{notation:0,
		updateRate:20},
	version:0.193,
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

const milestoneRequirements=['Buy the first factor.','Buy the Factor II.','Buy the Factor IV.','Buy the Factor VII.','Embrace the power of prime.','Buy 4 upgrades.','Buy 8 upgrades.','Use fuel to activate your first boost.','Activate the fourth boost.','Upgrade your fuel to have 150% efficiency.','Buy 12 upgrades.','Activate the eighth boost.','Complete the first challenge.','Break the game.','Reach 650 bugs.','Complete the fourth challenge.','Complete the eighth challenge.','Find out there is holding section of clicks.','Go to next parallel universe.']
costs={factors:[10],features:[0,10,15,20,100,500,5e3,1e7,2e8,3e9,5e13,2e14,1e17,5e18],upgrades:[1,2,3,4,8,15,35,55,1e4,2e4,5e4,1e5],breakUpgrades:[1,1,2,3]}
costMultipliers=[]
numberPerSecond=0
factors=[1,1,1,1,1,1,1]
factorLevels=[1,1,1,1,1,1,1]
primeGain=1
featureDescriptions=[['Upgrades','Buy upgrades to make your number increase faster.'],['Advanced Buying','Able to buy more than one purchase with one click.'],['Rate Analysis','Determine how fast you should get primes.'],['Automated Buying','The automation age of buying is here.'],['Boosts','Boosts that are more powerful as you gain more.'],['Advanced B.Q.','Extends Buy Quantity to have more features.'],['Fuel Efficiency','Upgrade your fuel to have more boosts per fuel.'],['Challenges','Take a negative-boost risk to reward bigger numbers.'],['Fuel Pack','A Buy Quantity plugin which able to use multiple fuel in just 1 click.'],['Game Breaking','Break the fourth challenge to alter the production.'],['Run while holding','A hazy maze-type bugs which occurs while restarting.'],['Parallel Universes','Jump to stronger universes for different values of all boosts.'],['Automated Prime','Extend Automated Buying to include automatic embraces.'],['Challenge Buffs','Buff your production by embracing with higher amounts while running challenges.']]
primeFactor=1
sixMinutesSinceLastPrime=0
smslpTemp=0
primeGainRate=0
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
challengeFuelEfficiencyRequirements=[0,3,3,3.5,3.5,4,4.5,4.5,4.5]
challengesUnlocked=0
challengeNextPrime=0
challengeGoals=[10,10,1,1,100,10,100,1000]
bugsNextPrime=0
bugFactor=1
bugGainFactor=1
halfClickGain=0
nextParaUniReq=1e10
challengeFactor=1