let unitLevels = [
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	],
	[
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0},
		{atk: 0, def: 0, hp: 0}
	]
];

let unit = {
	num: 0,
	dead: 0,
	props: {
		atk: 0,
		def: 0,
		hp: 0
	},
	modifiers: {
		atk: 0,
		def: 0,
		hp: 0
	}
};

let attacker = [
	clone(unit),
	clone(unit),
	clone(unit),
	clone(unit),
	clone(unit),
	clone(unit),
	clone(unit),
	clone(unit)
];

let level = {
	attackers: [clone(attacker)],
	defenders: [clone(attacker)]
};

let rounds = {
	initial: clone(level)
};

let roundsList = [
	'initial',
	'round_1',
	'round_2',
	'round_3',
	'round_4',
	'round_5',
	'round_6',
	'round_7',
	'round_8',
	'round_9',
	'round_10',
	'round_11',
	'round_12',
	'round_13',
	'round_14',
	'round_15',
	'round_16',
	'round_17',
	'round_18',
	'round_19',
	'round_20',
];

function updateNumbers(role, id, number) {
	switch (role) {
		case 'atk':
			rounds.initial.attackers[0][id].num = number;
			break;
		case 'def':
			rounds.initial.defenders[0][id].num = number;
	}
}


rounds.initial.attackers[0][0].props.hp = 15;
rounds.initial.attackers[0][1].props.atk = 8;
rounds.initial.attackers[0][1].props.hp = 25;
rounds.initial.attackers[0][2].props.atk = 9;
rounds.initial.attackers[0][2].props.hp = 35;
rounds.initial.attackers[0][5].props.atk = 1;
rounds.initial.attackers[0][5].props.hp = 20;

rounds.initial.defenders[0][0].props.hp = 15;
rounds.initial.defenders[0][1].props.atk = 6;
rounds.initial.defenders[0][1].props.hp = 15;
rounds.initial.defenders[0][4].props.atk = 43;
rounds.initial.defenders[0][4].props.hp = 10;
rounds.initial.defenders[0][5].props.atk = 1;
rounds.initial.defenders[0][5].props.hp = 15;
rounds.initial.defenders[0][6].props.atk = 6;
rounds.initial.defenders[0][6].props.hp = 1;
rounds.initial.defenders[0][7].props.atk = 4;
rounds.initial.defenders[0][7].props.hp = 10;

rounds.initial.attackers[0][1].modifiers.atk = .03;
rounds.initial.attackers[0][2].modifiers.atk = -.47;
rounds.initial.attackers[0][5].modifiers.atk = .03;

rounds.initial.defenders[0][4].modifiers.atk = .5;



function fight() {
	// would be better to read the indexes and use them instead of reloading
	// clean
	let init = clone(rounds.initial);
	rounds = {};
	rounds.initial = clone(init);

	simulateBattle();
}


function simulateBattle() {
	let previousRound = rounds[roundsList[Object.keys(rounds).length - 1]];

	// init current round
	let crn = roundsList[Object.keys(rounds).length];
	rounds[crn] = clone(level);
	let currentRound = rounds[crn];

	if (previousRound === 'initial') {
		// doForts()
	}

	let totals = {
		attacker: {atk: 0, num: 0},
		defender: {atk: 0, num: 0}
	};
	for (let i = 0; i < 8; i++) {
		totals.attacker.atk += previousRound.attackers[0][i].num *
				previousRound.attackers[0][i].props.atk * (1 + previousRound.attackers[0][i].modifiers.atk);
		totals.attacker.num += previousRound.attackers[0][i].num;
		totals.defender.atk += previousRound.defenders[0][i].num *
				previousRound.defenders[0][i].props.atk * (1 + previousRound.defenders[0][i].modifiers.atk);
		totals.defender.num += previousRound.defenders[0][i].num;
	}


	for (let i = 0; i < 8; i++) {
		//first attack
		currentRound.attackers[0][i].num = previousRound.attackers[0][i].num > 0 ?
				previousRound.attackers[0][i].num - (totals.defender.atk * previousRound.attackers[0][i].num) /
				(totals.attacker.num * previousRound.attackers[0][i].props.hp) : 0;

		currentRound.defenders[0][i].num = previousRound.defenders[0][i].num > 0 ?
				previousRound.defenders[0][i].num - (totals.attacker.atk * previousRound.defenders[0][i].num) /
				(totals.defender.num * previousRound.defenders[0][i].props.hp) : 0;

		//todo first check if the attack exceeds the healh of the units, the remaining of the attack is distributed to the rest ot units

		//predator prey attack
		if (i > 0 && i < 4) {
			currentRound.attackers[0][i].num = currentRound.attackers[0][i].num > 0 ?
					currentRound.attackers[0][i].num -
					(previousRound.defenders[0][i + 1].num * previousRound.defenders[0][i + 1].props.atk *
							(1 + previousRound.defenders[0][i + 1].modifiers.atk)) /
					previousRound.attackers[0][i].props.hp : 0;

			currentRound.defenders[0][i].num = currentRound.defenders[0][i].num > 0 ?
					currentRound.defenders[0][i].num -
					(previousRound.attackers[0][i + 1].num * previousRound.attackers[0][i + 1].props.atk *
							(1 + previousRound.attackers[0][i + 1].modifiers.atk)) /
					previousRound.defenders[0][i].props.hp : 0;
		}
		if (i === 4) {
			currentRound.attackers[0][i].num = currentRound.attackers[0][i].num > 0 ?
					currentRound.attackers[0][i].num -
					(previousRound.defenders[0][i - 3].num * previousRound.defenders[0][i - 3].props.atk *
							(1 + previousRound.defenders[0][i - 3].modifiers.atk)) /
					previousRound.attackers[0][i].props.hp : 0;

			currentRound.defenders[0][i].num = currentRound.defenders[0][i].num > 0 ?
					currentRound.defenders[0][i].num -
					(previousRound.attackers[0][i - 3].num * previousRound.attackers[0][i - 3].props.atk *
							(1 + previousRound.attackers[0][i - 3].modifiers.atk)) /
					previousRound.defenders[0][i].props.hp : 0;
		}

		//normalize negative results
		currentRound.attackers[0][i].num = currentRound.attackers[0][i].num < 0 ? 0 : currentRound.attackers[0][i].num;
		currentRound.defenders[0][i].num = currentRound.defenders[0][i].num < 0 ? 0 : currentRound.defenders[0][i].num;

		//add numbers of dead units
		currentRound.attackers[0][i].dead = Math.ceil(previousRound.attackers[0][i].num) - Math.ceil(currentRound.attackers[0][i].num);
		currentRound.defenders[0][i].dead = Math.ceil(previousRound.defenders[0][i].num) - Math.ceil(currentRound.defenders[0][i].num);


		//temporary solution to copy pros and modifiers
		currentRound.attackers[0][i].props = clone(previousRound.attackers[0][i].props);
		currentRound.attackers[0][i].modifiers = clone(previousRound.attackers[0][i].modifiers);
		currentRound.defenders[0][i].props = clone(previousRound.defenders[0][i].props);
		currentRound.defenders[0][i].modifiers = clone(previousRound.defenders[0][i].modifiers);
	}

	//check condition for next round
	// count number of left units
	let left = {atk: 0, def: 0};
	for (let i = 0; i < 8; i++) {
		left.atk += Math.ceil(currentRound.attackers[0][i].num);
		left.def += Math.ceil(currentRound.defenders[0][i].num);
	}

	if (left.atk > 0 && left.def > 0) {
		//update props and modifiers
		simulateBattle();
	} else {
		if (left.atk === 0){
		    console.log('attacker lost');
		} else {
			console.log('defender lost');
		}

		// revival round

		// display battle results here


	}
}


function memorySizeOf(obj) {
	var bytes = 0;

	function sizeOf(obj) {
		if (obj !== null && obj !== undefined) {
			switch (typeof obj) {
				case 'number':
					bytes += 8;
					break;
				case 'string':
					bytes += obj.length * 2;
					break;
				case 'boolean':
					bytes += 4;
					break;
				case 'object':
					var objClass = Object.prototype.toString.call(obj).slice(8, -1);
					if (objClass === 'Object' || objClass === 'Array') {
						for (var key in obj) {
							if (!obj.hasOwnProperty(key)) continue;
							sizeOf(obj[key]);
						}
					} else bytes += obj.toString().length * 2;
					break;
			}
		}
		return bytes;
	};

	function formatByteSize(bytes) {
		if (bytes < 1024) return bytes + " bytes";
		else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
		else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
		else return (bytes / 1073741824).toFixed(3) + " GiB";
	};

	return formatByteSize(sizeOf(obj));
};

function clone(obj) {
	return JSON.parse(JSON.stringify(obj))
}