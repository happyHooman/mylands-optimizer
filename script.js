Units.prototype.update_number = function (i, v) {
    $('#input_' + this.number + '_' + i).val(v);
    this.get_num(this.number, i);
    this.change_one_input2(document.querySelector('#input_' + this.number + '_' + i), this.number, i);
};

Units.prototype.reduceUnit = function (i, step) {
    const initial = this.qq[i];
    while (this.win && this.xxx !== 0 && this.qq[i] >= step) {
        this.update_number(i, this.qq[i] - step);
        rashet();
    }
    if (!this.win || this.xxx === 0) {
        this.update_number(i, this.qq[i] + step);
    }
    rashet();
    return initial === this.qq[i];
};

Units.prototype.reduce = function (step) {
    console.log('REDUCE');
    let changed = false;

    this.unitOrder.forEach( i => {
        if (i===0) return;
        changed = this.reduceUnit(i, step) || changed;
    });
    return changed;
};

Units.prototype.roundUnits = function (step, down = true) {
    console.log(`ROUND ${down ? 'DOWN' : 'UP'}`);
    let changed = false;

    this.unitOrder.forEach( i => {
        if (this.qq[i] % step !== 0) {
            const init = this.qq[i];
            if (down) {
                this.update_number(i, Math.floor(this.qq[i] / step) * step);
                rashet();
                if (!this.win || this.xxx === 0) {
                    this.update_number(i, init);
                    rashet();
                    return;
                }
                changed = true;
            } else {
                const num = Math.ceil(this.qq[i] / step) * step;
                if (num > this.maxUnits[i]) return;
                this.update_number(i, num);
                changed = true;
            }
            rashet();
        }
    });

    console.log(this.qq.join(', '));
    return changed;
};

Units.prototype.replaceUnits = function (first, second, step) {
    const before = [this.qq[first], this.qq[second]];
    let initial, leftRevivals;

    do {
        if (this.qq[second] === this.maxUnits[second] || this.qq[first] === 0) return false;
        if (this.qq[first] < step) step = this.qq[first];

        leftRevivals = this.xxx;
        initial = [this.qq[first], this.qq[second]];
        let first_units_number = this.qq[first] - step;
        let second_units_number = this.qq[second] + Math.floor(step * this.unitTax[first] / this.unitTax[second]);

        if (second_units_number > this.maxUnits[second]) {
            second_units_number = this.maxUnits[second];
            first_units_number = this.qq[first] - Math.floor((this.maxUnits[second] - this.qq[second]) * this.unitTax[second] / this.unitTax[first]);
        }
        this.update_number(first, first_units_number);
        this.update_number(second, second_units_number);
        rashet();

    } while (this.win && this.xxx > leftRevivals && this.qq[first] > 0);

    if (!this.win || this.xxx < leftRevivals) {
        this.update_number(first, initial[0]);
        this.update_number(second, initial[1]);
    }
    rashet();
    return this.qq[first] === before[0] && this.qq[second] === before[1];
};

Units.prototype.replace = function (step) {
    console.log('REPLACE');
    let changed = false;
    const reverseUnitOrder = [...this.unitOrder].reverse();

    reverseUnitOrder.forEach(i => {
        reverseUnitOrder.forEach(j => {
            if (i === j || i === 0 || j === 0) return;
            changed = this.replaceUnits(i, j, step) || changed;
        })
    })

    return changed;
};

Units.prototype.salary = function () {
    let c = 0;
    for (let i = 0; i < 8; i++) {
        c += this.qq[i] * this.unitTax[i];
    }
    return c;
};

Units.prototype.optimize = function () {
    console.log(this)
    const step = parseInt(document.querySelector(`#army_${this.number} .title_unit span select`).value)
    this.maxUnits = [...this.qq];
    this.unitTax = [.2, .8, 1.2, 1.4, 1.8, 12.2, .2, 7.8];
    this.unitOrder = [5, 7, 4, 3, 2, 1, 6, 0];

    let new_salary = this.salary();
    console.log('initial salary', new_salary);
    rashet();

    this.reduce(step);
    console.log(this.salary());
    console.log(this.qq.join(', '));

    let old_salary, changed;
    do {
        old_salary = new_salary;
        const replaced = this.replace(step);
        console.log(this.qq.join(', '));
        const reduced = this.reduce(step);
        console.log(this.qq.join(', '));
        changed = reduced || replaced;
        new_salary = this.salary();
        console.log('salary', new_salary);
    } while (changed && new_salary + step < old_salary);

    this.roundUnits(step);
    this.roundUnits(step, false);
    this.reduce(step);

    console.log('final salary', this.salary());
};

Units.prototype.revert = function () {
    for (let i = 0; i < 8; i++) {
        this.update_number(i, this.maxUnits[i])
    }
};

function addButtons(u) {
    const p = document.querySelector(`#army_${u} .title_unit span`);

    const obt = document.createElement('button');
    obt.innerText = 'optimize';
    obt.onclick = function () {
        unitu[u].optimize()
    };
    p.prepend(obt);

    const se = document.createElement('select');
    for (let i = 0; i < 4; i++) {
        const o = document.createElement('option')
        const v = Math.pow(10, i + 1)
        o.innerText = v;
        o.value = v;
        if (v === 1000) {
            o.selected = true
        }
        se.append(o)
    }
    p.prepend(se)

    const rbt = document.createElement('button');
    rbt.innerText = 'revert'
    rbt.onclick = function () {
        unitu[u].revert();
    }
    p.prepend(rbt);
}

for (let i = 0; i < 7; i++) {
    addButtons(i)
}
