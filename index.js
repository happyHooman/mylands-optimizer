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

let props = {
    atk: 0,
    def: 0,
    hp: 0
};
let modifiers = {
    atk: 0,
    def: 0,
    hp: 0
};


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
    // forts: level,
    // round_1: level,
    // round_2: level,
    // round_3: level,
    // round_4: level,
    // round_5: level,
    // round_6: level,
    // round_7: level,
    // round_8: level,
    // round_9: level,
    // round_10: level,
    // round_11: level,
    // round_12: level,
    // round_13: level,
    // round_14: level,
    // round_15: level,
    // round_16: level,
    // round_17: level,
    // round_18: level,
    // round_19: level,
    // round_20: level
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
            attackerNumbers[id] = number;
            rounds.initial.attackers[0][id].num = number;
            break;
        case 'def':
            defenderNumbers[id] = number;
            rounds.initial.defenders[0][id].num = number;
    }
    // console.log(rounds);
}


rounds.initial.attackers[0][0].props.hp = 15;
rounds.initial.attackers[0][3].props.hp = 40;
rounds.initial.attackers[0][3].props.atk = 12;
rounds.initial.attackers[0][4].props.hp = 15;
rounds.initial.attackers[0][4].props.atk = 51;
rounds.initial.attackers[0][5].props.hp = 20;
rounds.initial.attackers[0][5].props.atk = 2;

rounds.initial.defenders[0][0].props.hp = 8;
rounds.initial.defenders[0][2].props.hp = 25;
rounds.initial.defenders[0][2].props.atk = 5;
rounds.initial.defenders[0][3].props.hp = 20;
rounds.initial.defenders[0][3].props.atk = 5;


rounds.initial.attackers[0][3].modifiers.atk = .5;
rounds.initial.defenders[0][3].modifiers.atk = .5;


let attackerNumbers = [742, 0, 0, 50, 50, 45, 0, 0];
let defenderNumbers = [194, 0, 194, 83, 0, 0, 0, 0];

let attackerProps = [
    {atk: 0, def: 0, hp: 15},
    {atk: 8, def: 0, hp: 25},
    {atk: 8, def: 0, hp: 35},
    {atk: 12, def: 0, hp: 40},
    {atk: 51, def: 0, hp: 15},
    {atk: 2, def: 0, hp: 20},
    {atk: 4, def: 0, hp: 1},
    {atk: 3, def: 0, hp: 5},
];


let defenderProps = [
    {atk: 0, def: 0, hp: 8},
    {atk: 5, def: 0, hp: 25},
    {atk: 5, def: 0, hp: 25},
    {atk: 5, def: 0, hp: 20},
    {atk: 5, def: 0, hp: 15},
    {atk: 2, def: 0, hp: 20},
    {atk: 4, def: 0, hp: 1},
    {atk: 3, def: 0, hp: 5},
];

// I left here

let attackerModifiers = [
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: .5, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
];

let defenderModifiers = [
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: .5, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
    {atk: 0, def: 0, hp: 0},
];

let units = {
    before: {attacker: [], deffender: []}
};


function simulateBattle() {
    console.log(attackerNumbers);
    console.log(defenderNumbers);
    let totalAtAt = 0;
    for (let i = 0; i < 8; i++) {
        totalAtAt += attackerNumbers[i] * attackerProps[i].atk * (1 + defenderModifiers[i].atk);
    }
    console.log('Total attacker attack:', totalAtAt);

    let totalDefAt = 0;
    for (let i = 0; i < 8; i++) {
        totalDefAt += defenderNumbers[i] * defenderProps[i].atk * (1 + attackerModifiers[i].atk);
    }
    console.log('Total defender attack:', totalDefAt);





    // new
    let previousRound = rounds[roundsList[Object.keys(rounds).length - 1]];
    // init current round
    let crn = roundsList[Object.keys(rounds).length];
    rounds[crn] = clone(level);
    let currentRound = rounds[crn];

    if (previousRound === 'initial'){
        // doForts()
    }

    let totals = {attacker: {atk: 0, num: 0}, defender: {atk: 0, num: 0}};
    for (let i = 0; i < 8; i++) {
        totals.attacker.atk += previousRound.attackers[0][i].num *
            previousRound.attackers[0][i].props.atk * (1 + previousRound.attackers[0][i].modifiers.atk);
        totals.attacker.num += previousRound.attackers[0][i].num;
        totals.defender.atk += previousRound.defenders[0][i].num *
            previousRound.defenders[0][i].props.atk * (1 + previousRound.defenders[0][i].modifiers.atk);
        totals.defender.num += previousRound.defenders[0][i].num;
    }

    console.log(totals);
    // initialize currentRound
    // rounds[currentRound] = clone(level);

    for (let i = 0; i < 8; i++) {
        //first attack
        currentRound.attackers[0][i].num = previousRound.attackers[0][i].num > 0 ?
            previousRound.attackers[0][i].num - (totals.defender.atk * previousRound.attackers[0][i].num) /
            (totals.attacker.num * previousRound.attackers[0][i].props.hp) : 0;
    }







    let atunits = 0,
        defunits = 0;

    for (let i = 0; i < 8; i++) {
        atunits += attackerNumbers[i];
        defunits += defenderNumbers[i];
    }

    let units = {
        before: {attacker: [], deffender: []}
    };

    for (let i = 0; i < 8; i++) {
        units.before.attacker[i] = attackerNumbers[i];
        units.before.deffender[i] = defenderNumbers[i];
    }

    // first round
    units.round1 = {attacker: [], deffender: []};

    for (let i = 0; i < 8; i++) {
        units.round1.deffender[i] = units.before.deffender[i] > 0 ? units.before.deffender[i] - (totalAtAt * units.before.deffender[i]) / (defunits * defenderProps[i].hp) : 0;

        units.round1.attacker[i] = units.before.attacker[i] > 0 ? units.before.attacker[i] - (totalDefAt * units.before.attacker[i]) / (atunits * attackerProps[i].hp) : 0;

        // next add predator prey attack
        if (i > 0 && i < 4) {
            units.round1.deffender[i] = units.round1.deffender[i] > 0
                ? units.round1.deffender[i] - (units.before.attacker[i + 1] * attackerProps[i + 1].atk * (1 + attackerModifiers[i + 1].atk)) / defenderProps[i].hp
                : 0;
        }

        if (i === 4) {
            units.round1.deffender[i] = units.round1.deffender[i] > 0
                ? units.round1.deffender[i] - (units.before.attacker[i - 3] * attackerProps[i - 3].atk * (1 + attackerModifiers[i - 3].atk)) / defenderProps[i].hp
                : 0;
        }
        units.round1.deffender[i] = units.round1.deffender[i] < 0 ? 0 : units.round1.deffender[i];
    }
    console.log(units);
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