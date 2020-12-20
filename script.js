Units.prototype.update_number = function (i, v) {
    $('#input_' + this.number + '_' + i).val(v);
    this.get_num(this.number, i);
    this.change_one_input2(document.querySelector('#input_' + this.number + '_' + i), this.number, i);
};

Units.prototype.reduceUnit = function (i, step) {
    const initial = this.qq[i];
    // while (this.win && this.xxx !== 0 && this.qq[i] >= step) {
    while (this.goodFight(0) && this.qq[i] >= step) {
        this.update_number(i, this.qq[i] - step);
        fight();
    }
    // if (!this.win || this.xxx === 0) {
    if (!this.goodFight(0)) {
        this.update_number(i, this.qq[i] + step);
    }
    fight();
    return initial === this.qq[i];
};

Units.prototype.reduce = function (step) {
    console.log('REDUCE');
    let changed = false;

    this.unitOrder.slice(0, -1).forEach(i => {
        // if (i === 0) return;
        changed = this.reduceUnit(i, step) || changed;
    });

    console.log(this.qq.join(', '));

    return changed;
};

Units.prototype.roundUnits = function (step, down = true) {
    console.log(`ROUND ${down ? 'DOWN' : 'UP'}`);
    let changed = false;

    this.unitOrder.forEach(i => {
        if (this.qq[i] % step !== 0) {
            const init = this.qq[i];
            if (down) {
                this.update_number(i, Math.floor(this.qq[i] / step) * step);
                fight();
                if (!this.win || this.xxx === 0) {
                    this.update_number(i, init);
                    fight();
                    return;
                }
                changed = true;
            } else {
                const num = Math.ceil(this.qq[i] / step) * step;
                if (num > this.maxUnits[i]) return;
                this.update_number(i, num);
                changed = true;
            }
            fight();
        }
    });

    console.log(this.qq.join(', '));
    console.log('lost units:', this.lostUnits())

    return changed;
};

Units.prototype.goodFight = function (leftRevivals) {
    // return this.win && this.xxx > leftRevivals
    return this.win && this.xxx > leftRevivals && this.lostUnits() === 0
}

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
        fight();

    } while (this.goodFight(leftRevivals) && this.qq[first] > 0);

    if (!this.goodFight(leftRevivals)) {
        this.update_number(first, initial[0]);
        this.update_number(second, initial[1]);
    }

    fight();
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

    console.log(this.qq.join(', '));
    console.log('lost units:', this.lostUnits())

    return changed;
};

Units.prototype.salary = function () {
    let c = 0;
    for (let i = 0; i < 8; i++) {
        c += this.qq[i] * this.unitTax[i];
    }
    return c;
};

Units.prototype.lostUnits = function () {
    let s = 0;
    for (let i = 0; i < 8; i++) {
        if (!this.ignoreLoss[i]) {
            s += this.proc_damag_unitu[i]
        }
    }

    return s
}

Units.prototype.unitTax = [.2, .8, 1.2, 1.4, 1.8, 12.2, .2, 7.8];
Units.prototype.unitOrder = [5, 7, 4, 3, 2, 1, 6, 0];
Units.prototype.ignoreLoss = [1, 0, 0, 0, 0, 0, 0, 0];

Units.prototype.optimize = function () {
    numberOfCalculations = 0;
    let startTime = Date.now();
    console.log(this)
    const step = parseInt(document.querySelector(`#army_${this.number} .title_unit span select`).value)
    this.maxUnits = [...this.qq];

    let new_salary = this.salary();
    console.log('initial salary', new_salary);
    preFight();
    fight();
    console.log('initial fight status', this.goodFight(0))

    this.reduce(step);
    console.log(this.salary());
    console.log(this.qq.join(', '));

    let old_salary, changed;
    do {
        old_salary = new_salary;
        const replaced = this.replace(step);
        // console.log(this.qq.join(', '));
        const reduced = this.reduce(step);
        // console.log(this.qq.join(', '));
        changed = reduced || replaced;
        new_salary = this.salary();
        console.log('salary', new_salary);
    } while (changed && new_salary + step < old_salary);

    this.roundUnits(step);
    this.roundUnits(step, false);
    this.reduce(step);

    fight(1);
    postFight();

    console.log('final salary', this.salary());
    console.log('lost units:', this.lostUnits())
    const endTime = Date.now();
    console.log('Time elapsed:', (endTime - startTime) / 1000, 'seconds');
    console.log('Calculations:', numberOfCalculations);
    console.log('good fight', this.goodFight(0))
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

let numberOfCalculations = 0;

function rashet() {
    preFight();
    console.log('prefight', unitu[0].proc_damag_unitu, unitu[0].lostUnits())
    fight(1);
    console.log('fight', unitu[0].proc_damag_unitu, unitu[0].lostUnits())
    postFight();
    console.log('postfight', unitu[0].proc_damag_unitu, unitu[0].lostUnits())
}

function fight(last = false) {
    numberOfCalculations += 1;

    try {
        // min_max_select();
        damagInBatle = [0, 0, 0, 0, 0, 0, 0];

        //масив параметров отступления для бонуса ловушки
        var otst = [unitu[0].otst, unitu[1].otst, unitu[6].otst];

        //обнуление всех переменных от прошлого подсчета
        for (i = 0; i < 7; i++) {
            // heroes[i].efects_new();
            //TODO: разобраться с ефектом от костюма
            unitu[i].proc();
            unitu[i].null_bonusu();
            unitu[i].null_proc_damag();
            unitu[i].win = false;
            unitu[i].xxx = 0;
            unitu[i].presled_damag = [0, 0, 0, 0];
            for (var cmx = 0; cmx < 8; cmx++)
                unitu[i].qq[cmx] = unitu[i].vq[num_volna][cmx];
        }

        //заклятие жалость
        if (heroes[2].magick[118]) {
            [0, 1, 6].forEach(x => {
                unitu[x].plus_bonus(861, unitu[2].type, unitu[x].type);
            })
        }

        //определение кто чей враг по рассе
        [0, 1, 6].forEach(x => {
            unitu[x].type_vrag = unitu[2].type;
        });
        [2, 3, 4, 5].forEach(x => {
            unitu[x].type_vrag = unitu[0].type;
        });

        //востановление значений в бою
        unitu[0].boy = true;
        unitu[2].boy = true;
        [1, 3, 4, 5, 6].forEach(x => {
            unitu[x].boy = !!unitu[x].bul_v_boy;
        });

        //настройка полей и дивов для вывода подробной инфы
        // for (i = 0; i < 20; i++) {
        //     $('#raund_' + i).hide();
        // }
        // $(".ditals_inp").val('').css({'border-color': '#BBB', 'color': 'black'});

        //делаем отступников
        [0, 1, 6].forEach(x => {
            if (unitu[x].type === unitu[2].type && !unitu[2].red && unitu[0].type !== 4) {
                unitu[x].red = true;
                unitu[x].bonus_damag_add_all(-50);
            }
        });
        [2, 3, 4, 5].forEach(x => {
            if (unitu[x].type === unitu[0].type && !unitu[0].red && unitu[0].type !== 4) {
                unitu[x].red = true;
            }
        });

        //подсвечуем отсупников если это не сделал пользователь
        // for (let i = 0; i < 7; i++) {
        //     if (unitu[i].bul_v_boy) {
        //         $("#red_" + i).attr("checked", unitu[i].red);
        //     }
        // }

        //-=-=-расчет бонусов
        kalk_bonusu();

        //бонусы фракционки
        if ((!unitu[0].type && unitu[2].type == 1 ||
            !unitu[2].type && unitu[0].type == 1 ||
            unitu[0].type == 2 && unitu[2].type == 3 ||
            unitu[0].type == 3 && unitu[2].type == 2)
            && !unitu[2].red) {
            unitu[0].bonus_damag_add_all(-25);
        }
        if ((!unitu[1].type && unitu[2].type == 1 ||
            !unitu[2].type && unitu[1].type == 1 ||
            unitu[1].type == 2 && unitu[2].type == 3 ||
            unitu[1].type == 3 && unitu[2].type == 2)
            && !unitu[2].red) {
            unitu[1].bonus_damag_add_all(-25);
        }

        //бонусы защиты от укреплений
        // bonus_ot_yb = kol_vo_yb[0] * db_yb_tmp[0][spes][1] + kol_vo_yb[1] * db_yb_tmp[1][spes][1] +
        //     kol_vo_yb[2] * db_yb_tmp[2][spes][1] + kol_vo_yb[3] * db_yb_tmp[3][spes][1] +
        //     kol_vo_yb[4] * db_yb_tmp[4][spes][1] + kol_vo_yb[5] * db_yb_tmp[5][spes][1] +
        //     kol_vo_yb[6] * db_yb_tmp[6][spes][1] + kol_vo_yb[7] * db_yb_tmp[7][spes][1];
        bonus_ot_yb = 0;
        for (let i = 0; i < 8; i++) {
            bonus_ot_yb += kol_vo_yb[i] * db_yb_tmp[i][spes][1]
        }

        for (let i = 0; i < 8; i++) {
            unitu[2].bonusu[i] += bonus_ot_yb;
        }

        //бонусы макс защиты
        if (max_z) {
            for (let i = 0; i < 8; i++) {
                unitu[2].bonusu[i] = 75;
            }
        }

        //массив для бонуа урона магов (костыль заклинания "усиление магов")
        var mag_bonus = [0, 0, 0, 0, 0, 0, 0, 0];

        //-=-=-валидация бонусов
        for (i = 0; i < 7; i++) {
            mag_bonus[i] = unitu[i].bonusu[15];
            unitu[i].limit_bonus_all(8, 15, -90, false);//проверка урона на превышение -90%
            unitu[i].limit_bonus(24, 75, true); //проверка лимита макс защиты
            unitu[i].limit_bonus(24, 0, false); //проверка лимита мин защиты

            if (i == 2) {
                for (var ppp = 0; ppp < 8; ppp++) {
                    if (max_z) {
                        unitu[i].bonusu[ppp] = unitu[i].bonusu[24];
                    }

                }
            }

            unitu[i].limit_bonus_all(0, 7, unitu[i].bonusu[24], true);//проверка защиты на превышение лимита
            unitu[i].limit_bonus_all(0, 7, 0, false);//проверка защиты на превышение лимита
            unitu[i].limit_bonus(35, 90, true); //проверка лимита побега

            unitu[i].limit_bonus(40, -90, false); //проверка лимита мин атаки
            unitu[i].limit_bonus(41, -90, false); //проверка лимита мин атаки
            unitu[i].limit_bonus(42, -90, false); //проверка лимита мин атаки
            unitu[i].limit_bonus(43, -90, false); //проверка лимита мин атаки
            //
            //запись самых первых значений войск в масив с волнами
            unitu[i].volna_save();
        }

        //бонус простой башни
        unitu[2].bonusu[44] = unitu[2].bonusu[44] < (-100) ? -100 : unitu[2].bonusu[44];


        //проверка на ловушку 36
        if (heroes[2].magick[36]) {
            unitu[0].bonusu[35] = 0;
            unitu[1].bonusu[35] = 0;
            unitu[0].otst = 100;
            unitu[1].otst = 100;
            unitu[6].bonusu[35] = 0;
            unitu[6].otst = 100;
        }

        //проверка на шмотку королевского кастюма
        for (var zk = 0; zk <= 6; zk++) {
            if (heroes[zk].dress[7] == 46 && unitu[zk].hero) {
                unitu[zk].bonusu[35] = 0;
            }
        }

        i = 6;
        do {
            if (last && unitu[i].bul_v_boy) {
                $('#escape_' + i).show();
                $('#back_' + i).show();
            }
            if (unitu[i].bonusu[35] && !go_back[i]) {//если есть побег

                j = 7;
                do {
                    unitu[i].qq0[j] = unitu[i].qq[j] > 0 ? (unitu[i].qq[j] / 100) * unitu[i].bonusu[35] : 0;
                    unitu[i].qq[j] -= unitu[i].qq0[j];
                    unitu[i].qq0[j] = Math.round(unitu[i].qq0[j]);
                    unitu[i].qq[j] = Math.round(unitu[i].qq[j]);
                    if (last && unitu[i].qq0[j]) {
                        $('#escape_' + i + '_' + j).val(-unitu[i].qq0[j]).css({'border-color': 'red', 'color': 'red'});
                        $('#back_' + i + '_' + j).val('+' + unitu[i].qq0[j]).css({
                            'border-color': 'green',
                            'color': 'green'
                        });
                    }
                    j--;
                } while (j + 1);

                unitu[i].proc();
                //todo пересчитать бонусь отсупления
            }
            i--;
        } while (i + 1);


        //-=-=-проход укреплений
        //todo dobavit summu unitov pogibshux na ykrepleniah(zashitnik)
        var sum_for_yb_zash = [(unitu[2].sum_units() - unitu[2].qq[6]), (unitu[3].sum_units() - unitu[3].qq[6]), (unitu[4].sum_units() - unitu[4].qq[6]), (unitu[5].sum_units() - unitu[5].qq[6])];
        var poteri_ot_yb_zash = (Math.round(unitu[0].bonusu[48] /*+ (unitu[0].bonusu[48]/100) *unitu[0].bonusu[28]*/));

        if (unitu[1].bul_v_boy)
            poteri_ot_yb_zash += (Math.round(unitu[1].bonusu[48] /*+ (unitu[1].bonusu[48]/100) *unitu[1].bonusu[28]*/));

        if (unitu[6].bul_v_boy)
            poteri_ot_yb_zash += (Math.round(unitu[6].bonusu[48] /*+ (unitu[6].bonusu[48]/100) *unitu[6].bonusu[28]*/));

        //подсчет будущих сметрников + бонус
        var poteri_ot_yb = kol_vo_yb[0] * db_yb_tmp[0][spes][0] +
            kol_vo_yb[1] * db_yb_tmp[1][spes][0] +
            kol_vo_yb[2] * db_yb_tmp[2][spes][0] +
            kol_vo_yb[3] * db_yb_tmp[3][spes][0] +
            kol_vo_yb[4] * db_yb_tmp[4][spes][0] +
            kol_vo_yb[5] * db_yb_tmp[5][spes][0] +
            kol_vo_yb[6] * db_yb_tmp[6][spes][0] +
            kol_vo_yb[7] * db_yb_tmp[7][spes][0];
        poteri_ot_yb += (Math.round((poteri_ot_yb / 100) * unitu[2].bonusu[28]) + unitu[2].bonusu[48]);

        //todo добавить потери от союзников
        if (unitu[3].bul_v_boy)
            poteri_ot_yb += (Math.round(unitu[3].bonusu[48] + (unitu[3].bonusu[48] / 100) * unitu[3].bonusu[28]));
        if (unitu[4].bul_v_boy)
            poteri_ot_yb += (Math.round(unitu[4].bonusu[48] + (unitu[4].bonusu[48] / 100) * unitu[4].bonusu[28]));
        if (unitu[5].bul_v_boy)
            poteri_ot_yb += (Math.round(unitu[5].bonusu[48] + (unitu[5].bonusu[48] / 100) * unitu[5].bonusu[28]));
        poteri_ot_yb = poteri_ot_yb > 0 ? poteri_ot_yb : 0;
        poteri_ot_yb_zash = poteri_ot_yb_zash > 0 ? poteri_ot_yb_zash : 0;

        var sum_for_yb = [(unitu[0].sum_units() - unitu[0].qq[6]), (unitu[1].sum_units() - unitu[1].qq[6]), (unitu[6].sum_units() - unitu[6].qq[6])];

        if (!unitu[1].bul_v_boy) {
            sum_for_yb[1] = 0;
            $('#go_ykrp_1').hide();
        } else {
            $('#go_ykrp_1').show();
        }

        if (!unitu[6].bul_v_boy) {
            sum_for_yb[2] = 0;
            $('#go_ykrp_6').hide();
        } else {
            $('#go_ykrp_6').show();
        }

        if (!unitu[2].bul_v_boy) {
            sum_for_yb_zash[0] = 0;
            $('#go_ykrp_2').hide();
        } else {
            $('#go_ykrp_2').show();
        }

        if (!unitu[3].bul_v_boy) {
            sum_for_yb_zash[1] = 0;
            $('#go_ykrp_3').hide();
        } else {
            $('#go_ykrp_3').show();
        }

        if (!unitu[4].bul_v_boy) {
            sum_for_yb_zash[2] = 0;
            $('#go_ykrp_4').hide();
        } else {
            $('#go_ykrp_4').show();
        }

        if (!unitu[5].bul_v_boy) {
            sum_for_yb_zash[3] = 0;
            $('#go_ykrp_5').hide();
        } else {
            $('#go_ykrp_5').show();
        }

        //соотношение потерь по союзникам
        var tmpSum = ((sum_for_yb[0] + sum_for_yb[1] + sum_for_yb[2]) / 100);
        unitu[0].proc_damag = (sum_for_yb[0]) / tmpSum;
        unitu[0].proc_damag = isNaN(unitu[0].proc_damag) ? 0 : unitu[0].proc_damag;
        unitu[1].proc_damag = unitu[0].proc_damag < 100 ? (sum_for_yb[1]) / tmpSum : 0;
        unitu[1].proc_damag = isNaN(unitu[1].proc_damag) ? 0 : unitu[1].proc_damag;
        unitu[6].proc_damag = unitu[0].proc_damag < 100 ? (sum_for_yb[2]) / tmpSum : 0;
        unitu[6].proc_damag = isNaN(unitu[6].proc_damag) ? 0 : unitu[6].proc_damag;

        tmpSum = ((sum_for_yb_zash[0] + sum_for_yb_zash[1] + sum_for_yb_zash[2] + sum_for_yb_zash[3]) / 100);

        unitu[2].proc_damag = (sum_for_yb_zash[0]) / tmpSum;
        unitu[2].proc_damag = isNaN(unitu[2].proc_damag) ? 0 : unitu[2].proc_damag;

        unitu[3].proc_damag = (sum_for_yb_zash[1]) / tmpSum;
        unitu[3].proc_damag = isNaN(unitu[3].proc_damag) ? 0 : unitu[3].proc_damag;

        unitu[4].proc_damag = (sum_for_yb_zash[2]) / tmpSum;
        unitu[4].proc_damag = isNaN(unitu[4].proc_damag) ? 0 : unitu[4].proc_damag;

        unitu[5].proc_damag = (sum_for_yb_zash[3]) / tmpSum;
        unitu[5].proc_damag = isNaN(unitu[5].proc_damag) ? 0 : unitu[5].proc_damag;

        //сотношение в нутри
        unitu[0].procentu_dla_damaga_yb();
        unitu[1].procentu_dla_damaga_yb();
        unitu[2].procentu_dla_damaga_yb();
        unitu[3].procentu_dla_damaga_yb();
        unitu[4].procentu_dla_damaga_yb();
        unitu[5].procentu_dla_damaga_yb();
        unitu[6].procentu_dla_damaga_yb();

        //нанесение потерь
        i = 8;
        var time_var;
        do {
            i--;
            time_var = Math.round((((poteri_ot_yb / 100) * unitu[0].proc_damag) / 100) * unitu[0].proc_damag_unitu[i]);
            if (time_var > unitu[0].qq[i])
                time_var = unitu[0].qq[i];
            unitu[0].qq[i] -= time_var;

            if (unitu[0].qq[i] < 0) {
                unitu[0].qq[i] = 0;
            }

            if (last && time_var) {
                $('#go_ykrp_0_' + i).val(-time_var).css({'border-color': 'red', 'color': 'red'});
            }

            [1, 6, 2, 3, 4, 5].forEach(x => {
                if (unitu[x].proc_damag > 0) {
                    time_var = Math.round((((poteri_ot_yb / 100) * unitu[x].proc_damag) / 100) * unitu[x].proc_damag_unitu[i]);
                    if (time_var > unitu[x].qq[i])
                        time_var = unitu[x].qq[i];
                    unitu[x].qq[i] -= time_var;
                    if (unitu[x].qq[i] < 0) {
                        unitu[x].qq[i] = 0;
                    }
                    if (last && time_var) {
                        $('#go_ykrp_1_' + i).val(-time_var).css({'border-color': 'red', 'color': 'red'});
                    }
                }
            })

        } while (i);

        //проверка на участие в бою
        //союзников
        if (unitu[0].boy) unitu[0].go_home();
        if (unitu[1].boy) unitu[1].go_home();
        if (unitu[6].boy) unitu[6].go_home();









        //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
        //-=-=-раунды(1-20) rounds 1-20
        //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
        var big_cukl = 0;
        mbb = [lvl_mb_1, lvl_mb_2, lvl_bb_1, lvl_bb_2];
        damag_bb = [0, 0, 0, 0]; //кастыль для заклятие "катапульта"
        do {

            if (big_cukl === 0) {
                $('#gateEnd').val(0);
                gate_hp[num_volna] = parseInt($.trim($("#hp_gate").val()));
            }

            $('#raund_' + big_cukl).show();

            dead_unit = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];

            for (var i = 0; i < 7; i++) {
                for (var j = 0; j < 8; j++) {
                    dead_unit[i][j] = unitu[i].qq[j];
                }
            }

            //=-=-=-=кастыль катапульта
            //расчет среднего дамага для маг.башен
            if (mbb[0] > -1 || mbb[1] > -1) {
                unitu[2].nanas_damag_all(0);
                damag_na_zaw = unitu[2].ataks;
                unitu[2].ataks = 0;
                unitu[2].nanas_damag_all(1);
                sredn_damag = (damag_na_zaw + unitu[2].ataks) / 2;
                unitu[2].ataks = 0;
            }

            //наносимый дамаг со сторон
            damag_na_zaw = 0;
            damag_na_atk = 0;


            //расчет дамага башен +/-бонусы +/-плавающие бонусы
            //магические
            if (mbb[0] > -1) {
                damag_bb[0] = sredn_damag * db_mb_tmp[mbb[0]];
                if (mbb[1] > -1) {
                    damag_bb[1] = sredn_damag * db_mb_tmp[mbb[1]];
                }
                //подавление дамага башен бонусами
                damag_bb[0] = ((damag_bb[0] / 100) * (100 + unitu[2].bonusu[30]));
                damag_bb[1] = ((damag_bb[1] / 100) * (100 + unitu[2].bonusu[30]));
            }


            //простые
            if (mbb[2] > -1) {
                switch (unitu[2].min_max) {
                    case 0: {
                        damag_bb[2] = (db_bb_tmp[mbb[2]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                        break;
                    }
                    case 1: {
                        damag_bb[2] = (db_bb_tmp[mbb[2]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                        break;
                    }
                    case 2: {
                        damag_bb[2] = (db_bb_tmp[mbb[2]][0] + random_value(db_bb_tmp[mbb[2]][2])) / 100 * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                        break;
                    }
                    case 3: {
                        damag_bb[2] = (((db_bb_tmp[mbb[2]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]) + (db_bb_tmp[mbb[2]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes])) / 2.0);
                        break;
                    }
                }
                if (mbb[3] > -1) {
                    switch (unitu[3].min_max) {
                        case 0: {
                            damag_bb[3] = (db_bb_tmp[mbb[3]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                            break;
                        }
                        case 1: {
                            damag_bb[3] = (db_bb_tmp[mbb[3]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                            break;
                        }
                        case 2: {
                            damag_bb[3] = (db_bb_tmp[mbb[3]][0] + random_value(db_bb_tmp[mbb[3]][2])) / 100 * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                            break;
                        }
                        case 3: {
                            damag_bb[3] = (((db_bb_tmp[mbb[3]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]) + (db_bb_tmp[mbb[3]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes])) / 2.0);
                            break;
                        }
                    }
                }
            }
            num_b_kill = 0;
            //определяем у какой башни больший урон для "катапульты"
            for (var perem = 1; perem < 4; perem++) {
                if (damag_bb[num_b_kill] <= damag_bb[perem]) {
                    num_b_kill = perem;
                }
            }

            //=-=-=-=-=-кастыль катапульта конец

            //заклятие катапульта и бонус от 10-й шапки
            if (heroes[0].magick[0] && unitu[0].hero ||
                heroes[1].magick[0] && unitu[1].hero ||
                heroes[6].magick[0] && unitu[6].hero ||
                heroes[0].dress[0] === 10 && teretory === 7 ||
                heroes[1].dress[0] === 10 && teretory == 7 ||
                heroes[6].dress[0] === 10 && teretory == 7) {
                mbb[num_b_kill]--;
            }


            //расчет среднего дамага для маг.башен
            if (mbb[0] > -1 || mbb[1] > -1) {
                unitu[2].nanas_damag_all(0);
                damag_na_zaw = unitu[2].ataks;
                unitu[2].ataks = 0;
                unitu[2].nanas_damag_all(1);
                sredn_damag = (damag_na_zaw + unitu[2].ataks) / 2;
                unitu[2].ataks = 0;
            }

            //наносимый дамаг со сторон
            damag_na_zaw = 0;
            damag_na_atk = 0;


            //расчет дамага башен +/-бонусы +/-плавающие бонусы
            //магические
            if (mbb[0] > -1) {
                damag_na_atk += sredn_damag * db_mb_tmp[mbb[0]];
                if (mbb[1] > -1) {
                    damag_na_atk += sredn_damag * db_mb_tmp[mbb[1]];
                }
                //подавление дамага башен бонусами
                damag_na_atk = ((damag_na_atk / 100) * (100 + unitu[2].bonusu[30]));
            }

            //простые
            if (mbb[2] > -1) {
                switch (unitu[2].min_max) {
                    case 0: {
                        damag_na_atk += (db_bb_tmp[mbb[2]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                        break;
                    }
                    case 1: {
                        damag_na_atk += (db_bb_tmp[mbb[2]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                        break;
                    }
                    case 2: {
                        damag_na_atk += (db_bb_tmp[mbb[2]][0] + random_value(db_bb_tmp[mbb[2]][2])) / 100 * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                        break;
                    }
                    case 3: {
                        damag_na_atk += (((db_bb_tmpdb_bb_tmp[mbb[2]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]) + (db_bb_tmp[mbb[2]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes])) / 2.0);
                        break;
                    }
                }
                if (mbb[3] > -1) {
                    switch (unitu[3].min_max) {
                        case 0: {
                            damag_na_atk += (db_bb_tmp[mbb[3]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                            break;
                        }
                        case 1: {
                            damag_na_atk += (db_bb_tmp[mbb[3]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                            break;
                        }
                        case 2: {
                            damag_na_atk += (db_bb_tmp[mbb[3]][0] + random_value(db_bb_tmp[mbb[3]][2])) / 100 * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]);
                            break;
                        }
                        case 3: {
                            damag_na_atk += (((db_bb_tmp[mbb[3]][0] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes]) + (db_bb_tmp[mbb[3]][1] / 100) * (100 + unitu[2].bonusu[44] + db_mb_bonus[spes])) / 2.0);
                            break;
                        }
                    }
                }
            }

            //TODO: проверка на наличеи магов в бою
            //подавление дамага башен магами
            second_pod = tretiy_pod = 0;
            if (unitu[0].boy) {
                first_pod = unitu[0].qq[7] * db_u[unitu[0].type][7][unitu[0].lvl[7]][3];
            } else {
                first_pod = 0;
            }
            if (unitu[1].bul_v_boy) {
                if (unitu[1].boy)
                    second_pod = unitu[1].qq[7] * db_u[unitu[1].type][7][unitu[1].lvl[7]][3];
            } else {
                second_pod = 0;
            }
            if (unitu[6].bul_v_boy) {
                if (unitu[6].boy)
                    tretiy_pod = unitu[6].qq[7] * db_u[unitu[6].type][7][unitu[6].lvl[7]][3];
            } else {
                tretiy_pod = 0;
            }

            if (unitu[0].boy) {
                first_pod += first_pod / 100 * unitu[0].bonusu[49];
            } else {
                first_pod = 0;
            }
            if (unitu[1].bul_v_boy) {
                if (unitu[1].boy)
                    second_pod += second_pod / 100 * unitu[1].bonusu[49];
            } else {
                second_pod = 0;
            }
            if (unitu[6].bul_v_boy) {
                if (unitu[6].boy)
                    tretiy_pod += tretiy_pod / 100 * unitu[6].bonusu[49];
            } else {
                tretiy_pod = 0;
            }

            var tmpdamagInBattle = [0, 0, 0, 0, 0, 0, 0];
            damag_na_atk = damag_na_atk - first_pod - second_pod - tretiy_pod;
            damag_na_atk = damag_na_atk < 0 ? 0 : damag_na_atk;
            tmpdamagInBattle[2] += damag_na_atk;

            //расчет общего дамага +/- плавающие бонусы и просто бонусы
            //расчет без плавающих бонусов но с бонусами от эфектов
            if (unitu[0].boy) {
                unitu[0].nanas_damag_all(unitu[0].min_max);
                if (unitu[0].hero)
                    unitu[0].ataks += unitu[0].bonusu[36]; //бонусный левый дамаг от свитков и тд
            }

            if (unitu[6].bul_v_boy) {
                if (unitu[6].boy) {
                    unitu[6].nanas_damag_all(unitu[6].min_max);
                    if (unitu[6].hero)
                        unitu[6].ataks += unitu[6].bonusu[36];
                }
            } else {
                unitu[6].ataks = 0;
            }

            if (unitu[1].bul_v_boy) {
                if (unitu[1].boy) {
                    unitu[1].nanas_damag_all(unitu[1].min_max);
                    if (unitu[1].hero)
                        unitu[1].ataks += unitu[1].bonusu[36];
                }
            } else {
                unitu[1].ataks = 0;
            }

            var flagDo = true;
            if (kz) {
                if (flags_gate[num_volna] && gate_hp[num_volna] > 0)
                    flagDo = false;
            }

            if (flagDo) {
                if (unitu[2].boy) {
                    unitu[2].nanas_damag_all(unitu[2].min_max);
                    if (unitu[2].hero)
                        unitu[2].ataks += unitu[2].bonusu[36];
                }
                ;
                if (unitu[3].bul_v_boy) {
                    if (unitu[3].boy) {
                        unitu[3].nanas_damag_all(unitu[3].min_max);
                        if (unitu[3].hero)
                            unitu[3].ataks += unitu[3].bonusu[36];
                    }
                    ;
                } else {
                    unitu[3].ataks = 0;
                }
                if (unitu[4].bul_v_boy) {
                    if (unitu[4].boy) {
                        unitu[4].nanas_damag_all(unitu[4].min_max);
                        if (unitu[4].hero)
                            unitu[4].ataks += unitu[4].bonusu[36];
                    }
                    ;
                } else {
                    unitu[4].ataks = 0;
                }
                if (unitu[5].bul_v_boy) {
                    if (unitu[5].boy) {
                        unitu[5].nanas_damag_all(unitu[5].min_max);
                        if (unitu[5].hero)
                            unitu[5].ataks += unitu[5].bonusu[36];
                    }
                    ;
                } else {
                    unitu[5].ataks = 0;
                }
                damag_na_atk += (unitu[2].ataks + unitu[3].ataks + unitu[4].ataks + unitu[5].ataks);

            }

            //добавление к дамагу расчитаных дамагов войск
            damag_na_zaw += (unitu[0].ataks + unitu[1].ataks + unitu[6].ataks);

            //add damag in var for frukcuonka

            for (var pe = 0; pe < 7; pe++)
                tmpdamagInBattle[pe] += unitu[pe].ataks;

            //подавление общего дамага магами при наличии данного бонуса
            x_atk = unitu[0].qq[7] * (unitu[0].bonusu[29] > 0 ? unitu[0].bonusu[29] : 0);
            if (unitu[1].bul_v_boy) {
                x_atk += (unitu[1].qq[7] * (unitu[1].bonusu[29] > 0 ? unitu[1].bonusu[29] : 0));
            }
            if (unitu[6].bul_v_boy) {
                x_atk += (unitu[6].qq[7] * (unitu[6].bonusu[29] > 0 ? unitu[6].bonusu[29] : 0));
            }

            x_zaw = 0;
            if (flagDo)//todo может нужно отключить и разрешить подовлять в крепасти дамаг атакующих?
            {
                x_zaw = unitu[2].qq[7] * (unitu[2].bonusu[29] > 0 ? unitu[2].bonusu[29] : 0);
                if (unitu[3].bul_v_boy) {
                    x_zaw += (unitu[3].qq[7] * (unitu[3].bonusu[29] > 0 ? unitu[3].bonusu[29] : 0));
                }
                if (unitu[4].bul_v_boy) {
                    x_zaw += (unitu[4].qq[7] * (unitu[4].bonusu[29] > 0 ? unitu[4].bonusu[29] : 0));
                }
                if (unitu[5].bul_v_boy) {
                    x_zaw += (unitu[5].qq[7] * (unitu[5].bonusu[29] > 0 ? unitu[5].bonusu[29] : 0));
                }
            }

            damag_na_atk -= x_atk < 0 ? 0 : x_atk;
            damag_na_zaw -= x_zaw < 0 ? 0 : x_zaw;
            //валидность бонуса подавление дамага магами damag>=0
            if (damag_na_atk > 0) {
                var miniNum = 2;
                var strahovka = 0;
                while (x_atk--) {
                    if (tmpdamagInBattle[miniNum]) {
                        tmpdamagInBattle[miniNum]--;
                        strahovka = 0;
                    } else {
                        strahovka++;
                        x_atk++;
                    }
                    if (strahovka > 10)
                        break;
                    miniNum++;
                    if (miniNum > 5)
                        miniNum = 2;
                }
            } else {
                damag_na_atk = 0;
                tmpdamagInBattle[2] = 0;
                tmpdamagInBattle[3] = 0;
                tmpdamagInBattle[4] = 0;
                tmpdamagInBattle[5] = 0;
            }

            if (damag_na_zaw > 0) {
                var miniNum = 0;
                var strahovka = 0;
                while (x_zaw--) {
                    if (tmpdamagInBattle[miniNum]) {
                        tmpdamagInBattle[miniNum]--;
                        strahovka = 0;
                    } else {
                        strahovka++;
                        x_zaw++;
                    }
                    if (strahovka > 10)
                        break;

                    miniNum++;
                    if (miniNum == 2)
                        miniNum = 6;
                    if (miniNum > 6)
                        miniNum = 0;
                }
            } else {
                damag_na_zaw = 0;
                tmpdamagInBattle[0] = 0;
                tmpdamagInBattle[1] = 0;
                tmpdamagInBattle[5] = 0;
            }

            //расчет коофициэнтов получения
            //внутри сторон proc_damag
            sum_uns = [0, 0, 0, 0, 0, 0, 0];
            for (var mfp = 0; mfp < 7; mfp++) {
                sum_uns[mfp] = unitu[mfp].sum_units();
            }
            if (!unitu[1].bul_v_boy) {
                sum_uns[1] = 0;
            }
            if (!unitu[6].bul_v_boy) {
                sum_uns[6] = 0;
            }
            if (!unitu[3].bul_v_boy) {
                sum_uns[3] = 0;
            }
            if (!unitu[4].bul_v_boy) {
                sum_uns[4] = 0;
            }
            if (!unitu[5].bul_v_boy) {
                sum_uns[5] = 0;
            }


            var tmpSum = ((unitu[0].boy ? sum_uns[0] : 0) + (unitu[1].boy ? sum_uns[1] : 0) + (unitu[6].boy ? sum_uns[6] : 0)) / 100;
            unitu[0].proc_damag = sum_uns[0] / (tmpSum);
            unitu[0].proc_damag = isNaN(unitu[0].proc_damag) ? 0 : unitu[0].proc_damag;
            if (unitu[1].bul_v_boy) {
                unitu[1].proc_damag = unitu[1].boy ? (sum_uns[1] / (tmpSum)) : 0;
                unitu[1].proc_damag = isNaN(unitu[1].proc_damag) ? 0 : unitu[1].proc_damag;
            }
            if (unitu[6].bul_v_boy) {
                unitu[6].proc_damag = unitu[6].boy ? (sum_uns[6] / (tmpSum)) : 0;
                unitu[6].proc_damag = isNaN(unitu[6].proc_damag) ? 0 : unitu[6].proc_damag;
            }
            tmpSum = (unitu[2].boy ? sum_uns[2] : 0);
            if (unitu[3].bul_v_boy)
                tmpSum += (unitu[3].boy ? sum_uns[3] : 0);
            if (unitu[4].bul_v_boy)
                tmpSum += (unitu[4].boy ? sum_uns[4] : 0);
            if (unitu[5].bul_v_boy)
                tmpSum += (unitu[5].boy ? sum_uns[5] : 0);
            tmpSum /= 100;
            unitu[2].proc_damag = sum_uns[2] / (tmpSum);
            unitu[2].proc_damag = isNaN(unitu[2].proc_damag) ? 0 : unitu[2].proc_damag;
            if (unitu[3].bul_v_boy) {
                unitu[3].proc_damag = unitu[3].boy ? (sum_uns[3] / (tmpSum)) : 0;
                unitu[3].proc_damag = isNaN(unitu[3].proc_damag) ? 0 : unitu[3].proc_damag;
            }
            if (unitu[4].bul_v_boy) {
                unitu[4].proc_damag = unitu[4].boy ? (sum_uns[4] / (tmpSum)) : 0;
                unitu[4].proc_damag = isNaN(unitu[4].proc_damag) ? 0 : unitu[4].proc_damag;
            }
            if (unitu[5].bul_v_boy) {
                unitu[5].proc_damag = unitu[5].boy ? (sum_uns[5] / (tmpSum)) : 0;
                unitu[5].proc_damag = isNaN(unitu[5].proc_damag) ? 0 : unitu[5].proc_damag;
            }
            //внутри войск
            proc_for_all_u();

            //перевод процентов в дамаг
            //дамаг в нутри сторон
            unitu[0].proc_damag = (damag_na_atk / 100) * unitu[0].proc_damag;
            unitu[1].proc_damag = (damag_na_atk / 100) * unitu[1].proc_damag;
            if (flagDo) {
                unitu[2].proc_damag = (damag_na_zaw / 100) * unitu[2].proc_damag;
                unitu[3].proc_damag = (damag_na_zaw / 100) * unitu[3].proc_damag;
                unitu[4].proc_damag = (damag_na_zaw / 100) * unitu[4].proc_damag;
                unitu[5].proc_damag = (damag_na_zaw / 100) * unitu[5].proc_damag;
            }
            unitu[6].proc_damag = (damag_na_atk / 100) * unitu[6].proc_damag;

            //дамаг в нутри войска    !!!!
            in_damag_u();

            procentu = [[0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];

//            //расчет дамага преследователей
            if (unitu[0].boy) unitu[0].presled_nanos();
            if (unitu[2].boy) unitu[2].presled_nanos();
            if (unitu[1].bul_v_boy) {
                if (unitu[1].boy) unitu[1].presled_nanos(); else unitu[1].presled_damag = [0, 0, 0, 0];
            }
            if (unitu[3].bul_v_boy) {
                if (unitu[3].boy) unitu[3].presled_nanos(); else unitu[3].presled_damag = [0, 0, 0, 0];
            }
            if (unitu[4].bul_v_boy) {
                if (unitu[4].boy) unitu[4].presled_nanos(); else unitu[4].presled_damag = [0, 0, 0, 0];
            }
            if (unitu[5].bul_v_boy) {
                if (unitu[5].boy) unitu[5].presled_nanos(); else unitu[5].presled_damag = [0, 0, 0, 0];
            }
            if (unitu[6].bul_v_boy) {
                if (unitu[6].boy) unitu[6].presled_nanos(); else unitu[6].presled_damag = [0, 0, 0, 0];
            }

            ostatkiHP = [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];

            var tmpFlag = false;
            if (kz)
                if (flags_gate[num_volna] && gate_hp[num_volna] > 0)
                    tmpFlag = true;
            kill_all_u(tmpFlag)


            //todo ostatkiHP


            //обнуляем переменный хранящие общую атаку войска
            null_ataks();

            first = true; //переменная отвечающая за первое погащение урона процентами
            //переводим -юнитов в дополнительный дамага (в формуле не забыть бонусы к ХР) округление выжевших и обнуление минуснутых
            second_damag_all_u();
            first = false;
            for (var zx = 0; zx < 7; zx++) {
                //разбераемся с остаточным дамагом
                //перерасчет коофициэнтов получения
                proc_for_all_u();

                unitu[0].proc_damag = unitu[0].ataks;
                unitu[1].proc_damag = unitu[1].ataks;
                unitu[6].proc_damag = unitu[6].ataks;

                unitu[2].proc_damag = unitu[2].ataks;
                unitu[3].proc_damag = unitu[3].ataks;
                unitu[4].proc_damag = unitu[4].ataks;
                unitu[5].proc_damag = unitu[5].ataks;

                //обнуляем переменный хранящие общую атаку войска
                null_ataks();

                //дамаг в нутри войска
                in_damag_u();

                //нанисение на выживших
                kill_all_u(tmpFlag);

                //обнуление минуснутых и округление
                second_damag_all_u();
            }
//todo ne zabut dobavit k tmpdamagInBattle damag ot presledovateley
            //            //перенос дамагов преследователей в переменные основных войск
            i = 4;
            do {
                i--;
                if (unitu[1].bul_v_boy) {
                    unitu[0].presled_damag[i] += unitu[1].presled_damag[i];
                }
                if (unitu[6].bul_v_boy) {
                    unitu[0].presled_damag[i] += unitu[6].presled_damag[i];
                }
                if (unitu[3].bul_v_boy) {
                    unitu[2].presled_damag[i] += unitu[3].presled_damag[i];
                }
                if (unitu[4].bul_v_boy) {
                    unitu[2].presled_damag[i] += unitu[4].presled_damag[i];
                }
                if (unitu[5].bul_v_boy) {
                    unitu[2].presled_damag[i] += unitu[5].presled_damag[i];
                }
            } while (i);

            procentu = [[0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];//проценты наносимого дамага от преследователей в общем числе дамага по жертвам
            //добавление к дамагу дамага преследователей на пехоту, коней и летающих

            j = 1;
            do {
                var sum_qq = [unitu[0].qq[j], unitu[1].qq[j], unitu[2].qq[j], unitu[3].qq[j], unitu[4].qq[j], unitu[5].qq[j], unitu[6].qq[j]];
                if (!unitu[1].bul_v_boy) {
                    sum_qq[1] = 0;
                }
                if (!unitu[3].bul_v_boy) {
                    sum_qq[3] = 0;
                }
                if (!unitu[4].bul_v_boy) {
                    sum_qq[4] = 0;
                }
                if (!unitu[5].bul_v_boy) {
                    sum_qq[5] = 0;
                }
                if (!unitu[6].bul_v_boy) {
                    sum_qq[6] = 0;
                }
                //соотношение в нутри стороны
                tmpSum = (sum_qq[0] + sum_qq[1] + sum_qq[6]) / 100;
                unitu[0].proc_damag = sum_qq[0] / tmpSum;
                unitu[0].proc_damag = isNaN(unitu[0].proc_damag) ? 0 : unitu[0].proc_damag;
                unitu[1].proc_damag = sum_qq[1] / tmpSum;
                unitu[1].proc_damag = isNaN(unitu[1].proc_damag) ? 0 : unitu[1].proc_damag;
                unitu[6].proc_damag = sum_qq[6] / tmpSum;
                unitu[6].proc_damag = isNaN(unitu[6].proc_damag) ? 0 : unitu[6].proc_damag;
                tmpSum = (sum_qq[2] + sum_qq[3] + sum_qq[4] + sum_qq[5]) / 100;
                unitu[2].proc_damag = sum_qq[2] / tmpSum;
                unitu[2].proc_damag = isNaN(unitu[2].proc_damag) ? 0 : unitu[2].proc_damag;
                unitu[3].proc_damag = sum_qq[3] / tmpSum;
                unitu[3].proc_damag = isNaN(unitu[3].proc_damag) ? 0 : unitu[3].proc_damag;
                unitu[4].proc_damag = sum_qq[4] / tmpSum;
                unitu[4].proc_damag = isNaN(unitu[4].proc_damag) ? 0 : unitu[4].proc_damag;
                unitu[5].proc_damag = sum_qq[5] / tmpSum;
                unitu[5].proc_damag = isNaN(unitu[5].proc_damag) ? 0 : unitu[5].proc_damag;

                // распределение дамага и проверка на необходимость нанесения дамага
                unitu[0].proc_damag_unitu[j] += (unitu[0].proc_damag > 0 ? ((unitu[2].presled_damag[j] / 100) * unitu[0].proc_damag) : 0);
                unitu[1].proc_damag_unitu[j] += (unitu[1].proc_damag > 0 ? ((unitu[2].presled_damag[j] / 100) * unitu[1].proc_damag) : 0);
                unitu[6].proc_damag_unitu[j] += (unitu[6].proc_damag > 0 ? ((unitu[2].presled_damag[j] / 100) * unitu[6].proc_damag) : 0);
                unitu[2].proc_damag_unitu[j] += (unitu[2].proc_damag > 0 ? ((unitu[0].presled_damag[j] / 100) * unitu[2].proc_damag) : 0);
                unitu[3].proc_damag_unitu[j] += (unitu[3].proc_damag > 0 ? ((unitu[0].presled_damag[j] / 100) * unitu[3].proc_damag) : 0);
                unitu[4].proc_damag_unitu[j] += (unitu[4].proc_damag > 0 ? ((unitu[0].presled_damag[j] / 100) * unitu[4].proc_damag) : 0);
                unitu[5].proc_damag_unitu[j] += (unitu[5].proc_damag > 0 ? ((unitu[0].presled_damag[j] / 100) * unitu[5].proc_damag) : 0);

                procentu[0][j - 1] = ((unitu[2].presled_damag[j] / 100) * unitu[0].proc_damag);
                procentu[1][j - 1] = ((unitu[2].presled_damag[j] / 100) * unitu[1].proc_damag);
                procentu[6][j - 1] = ((unitu[2].presled_damag[j] / 100) * unitu[6].proc_damag);
                procentu[2][j - 1] = ((unitu[0].presled_damag[j] / 100) * unitu[2].proc_damag);
                procentu[3][j - 1] = ((unitu[0].presled_damag[j] / 100) * unitu[3].proc_damag);
                procentu[4][j - 1] = ((unitu[0].presled_damag[j] / 100) * unitu[4].proc_damag);
                procentu[5][j - 1] = ((unitu[0].presled_damag[j] / 100) * unitu[5].proc_damag);
                j++;
            } while (j < 4);

            //добавление к дамагу дамага преследователей на лучников
            sum_qq = [unitu[0].qq[j], unitu[1].qq[j], unitu[2].qq[j], unitu[3].qq[j], unitu[4].qq[j], unitu[5].qq[j], unitu[6].qq[j]];
            if (!unitu[1].bul_v_boy) {
                sum_qq[1] = 0;
            }
            if (!unitu[3].bul_v_boy) {
                sum_qq[3] = 0;
            }
            if (!unitu[4].bul_v_boy) {
                sum_qq[4] = 0;
            }
            if (!unitu[5].bul_v_boy) {
                sum_qq[5] = 0;
            }
            if (!unitu[6].bul_v_boy) {
                sum_qq[6] = 0;
            }
            //соотношение в нутри стороны

            tmpSum = (sum_qq[0] + sum_qq[1] + sum_qq[6]) / 100;
            unitu[0].proc_damag = sum_qq[0] / tmpSum;
            unitu[0].proc_damag = isNaN(unitu[0].proc_damag) ? 0 : unitu[0].proc_damag;
            unitu[1].proc_damag = sum_qq[1] / tmpSum;
            unitu[1].proc_damag = isNaN(unitu[1].proc_damag) ? 0 : unitu[1].proc_damag;
            unitu[6].proc_damag = sum_qq[6] / tmpSum;
            unitu[6].proc_damag = isNaN(unitu[6].proc_damag) ? 0 : unitu[6].proc_damag;
            tmpSum = (sum_qq[2] + sum_qq[3] + sum_qq[4] + sum_qq[5]) / 100;
            unitu[2].proc_damag = sum_qq[2] / tmpSum;
            unitu[2].proc_damag = isNaN(unitu[2].proc_damag) ? 0 : unitu[2].proc_damag;
            unitu[3].proc_damag = sum_qq[3] / tmpSum;
            unitu[3].proc_damag = isNaN(unitu[3].proc_damag) ? 0 : unitu[3].proc_damag;
            unitu[4].proc_damag = sum_qq[4] / tmpSum;
            unitu[4].proc_damag = isNaN(unitu[4].proc_damag) ? 0 : unitu[4].proc_damag;
            unitu[5].proc_damag = sum_qq[5] / tmpSum;
            unitu[5].proc_damag = isNaN(unitu[5].proc_damag) ? 0 : unitu[5].proc_damag;

            // распределение дамага и проверка на необходимость нанесения дамага
            unitu[0].proc_damag_unitu[j] += unitu[0].proc_damag > 0 ? ((unitu[2].presled_damag[0] / 100) * unitu[0].proc_damag) : 0;
            unitu[1].proc_damag_unitu[j] += unitu[1].proc_damag > 0 ? ((unitu[2].presled_damag[0] / 100) * unitu[1].proc_damag) : 0;
            unitu[6].proc_damag_unitu[j] += unitu[6].proc_damag > 0 ? ((unitu[2].presled_damag[0] / 100) * unitu[6].proc_damag) : 0;
            unitu[2].proc_damag_unitu[j] += unitu[2].proc_damag > 0 ? ((unitu[0].presled_damag[0] / 100) * unitu[2].proc_damag) : 0;
            unitu[3].proc_damag_unitu[j] += unitu[3].proc_damag > 0 ? ((unitu[0].presled_damag[0] / 100) * unitu[3].proc_damag) : 0;
            unitu[4].proc_damag_unitu[j] += unitu[4].proc_damag > 0 ? ((unitu[0].presled_damag[0] / 100) * unitu[4].proc_damag) : 0;
            unitu[5].proc_damag_unitu[j] += unitu[5].proc_damag > 0 ? ((unitu[0].presled_damag[0] / 100) * unitu[5].proc_damag) : 0;

            procentu[0][j - 1] = ((unitu[2].presled_damag[0] / 100) * unitu[0].proc_damag);
            procentu[1][j - 1] = ((unitu[2].presled_damag[0] / 100) * unitu[1].proc_damag);
            procentu[6][j - 1] = ((unitu[2].presled_damag[0] / 100) * unitu[6].proc_damag);
            procentu[2][j - 1] = ((unitu[0].presled_damag[0] / 100) * unitu[2].proc_damag);
            procentu[3][j - 1] = ((unitu[0].presled_damag[0] / 100) * unitu[3].proc_damag);
            procentu[4][j - 1] = ((unitu[0].presled_damag[0] / 100) * unitu[4].proc_damag);
            procentu[5][j - 1] = ((unitu[0].presled_damag[0] / 100) * unitu[5].proc_damag);
            //распределение дамага по порциям (в формуле не забыть бонусы к ХР)

            kill_all_u(tmpFlag);

            //округляем и прибовляем остатки
            for (i = 0; i < 7; i++) {
                for (j = 0; j < 8; j++) {
                    ostatkiHP[i][j] = Math.round(ostatkiHP[i][j]);
                    if (0 != ostatkiHP[i][j])
                        unitu[i].qq[j] += ostatkiHP[i][j];
                }
            }


//проверка если преследоватили убили больше чем нужно
            for (i = 0; i < 7; i++) {
                for (j = 0; j < 8; j++) {
                    if (unitu[i].qq[j] < 0)
                        unitu[i].qq[j] = 0;
                }
            }


            for (i = 0; i < 7; i++) {
                if (unitu[i].bul_v_boy) {

                    if (last) $('#raynd_' + big_cukl + '_' + i).show();

                    for (j = 0; j < 8; j++) {
                        var sum_d = unitu[i].qq[j] - dead_unit[i][j];
                        if (last && sum_d) {
                            $('#raynd_' + big_cukl + '_' + i + '_' + j).val(sum_d).css({
                                'border-color': 'red',
                                'color': 'red'
                            });
                        }
                    }

                    if (last && tmpFlag && i >= 2 && i <= 5) {
                        for (j = 0; j < 8; j++) {
                            $('#raynd_' + big_cukl + '_' + i + '_' + j).val('').css({
                                'border-color': '#BBB',
                                'color': 'black'
                            });
                        }
                    }
                } else {
                    for (j = 0; j < 8; j++) {
                        $('#raynd_' + big_cukl + '_' + i + '_' + j).val('').css({
                            'border-color': '#BBB',
                            'color': 'black'
                        });
                    }
                }
            }

            //обнуляем переменный хранящие общую атаку войска
            null_ataks();


            for (var mg = 0; mg < 7; mg++)
                damagInBatle[mg] += tmpdamagInBattle[mg];

            var crashGate = null;
            if (flags_gate[num_volna] && kz && gate_hp[num_volna] > 0)///todo proverit na KZ
            {
                var tmpSumHP = 0;

                if (unitu[2].boy)
                    tmpSumHP += unitu[2].sum_hp_all();
                if (unitu[3].boy)
                    tmpSumHP += unitu[3].sum_hp_all();
                if (unitu[4].boy)
                    tmpSumHP += unitu[4].sum_hp_all();
                if (unitu[5].boy)
                    tmpSumHP += unitu[5].sum_hp_all();

                tmpSumHP = Math.floor(tmpSumHP / 10);

                //-подавление
                var minusHpCount = 0;
                damag_na_zaw -= db_gate[gate_lvl][0];
                if (0 > damag_na_zaw) damag_na_zaw = 0;
                else {
                    damag_na_zaw = Math.floor(damag_na_zaw - (damag_na_zaw / 1000 * tmpSumHP / 2000));
                }
                var tmpHpGate = Math.round(gate_hp[num_volna] /*+ (gate_hp[num_volna]/100*unitu[2].bonusu[51])*/);
                if (damag_na_zaw > tmpHpGate) {
                    gate_hp[num_volna] -= damag_na_zaw;
                    minusHpCount = -tmpHpGate;
                    //    crashGate = true
                    $("#crash").show();
                    $("#no-crash").hide();
                    switch (num_volna) {
                        case 0:
                            flags_gate[1] = false;
                            flags_gate[2] = false;
                            break;

                        case 1:
                            flags_gate[2] = false;
                            break;
                    }
                } else {
                    gate_hp[num_volna] -= damag_na_zaw;
                    minusHpCount = -damag_na_zaw;
                    // crashGate = false;
                    switch (num_volna) {
                        case 0:
                            gate_hp[1] = tmpHpGate + minusHpCount;
                            gate_hp[1] = Math.round(gate_hp[1]/*/100 *(100+unitu[2].bonusu[51])*/);
                            gate_hp[2] = gate_hp[1];
                            flags_gate[1] = true;
                            flags_gate[2] = true;
                            break;

                        case 1:
                            gate_hp[2] = tmpHpGate + minusHpCount;
                            gate_hp[2] = Math.round(gate_hp[2]/*/100 *(100+unitu[2].bonusu[51])*/);
                            flags_gate[2] = true;
                            break;
                    }
                    $("#crash").hide();
                    $("#no-crash").show();
                }

                var tmpObj = $('#gateEnd');
                var tmpMinus = parseInt(tmpObj.val());
                minusHpCount += tmpMinus;
                tmpObj.val(minusHpCount);


                if (minusHpCount < 0) {
                    document.getElementById("gateEnd").style.border = "2px  solid #ff0000";
                    document.getElementById("gateEnd").style.color = "#ff0000";
                } else {
                    document.getElementById("gateEnd").style.border = "2px solid #bbb";
                    document.getElementById("gateEnd").style.color = "#000";
                }
            }


            //flags_gate = [false,false,false];

//todo
//todo         var gate_hp = [0,0,0];
//todo         var gate_lvl = 0;
//todo


            //проверка достижение лимита отступления
            if (unitu[0].boy) unitu[0].go_home();
            if (unitu[2].boy) unitu[2].go_home();
            if (unitu[1].boy) unitu[1].go_home();
            if (unitu[3].boy) unitu[3].go_home();
            if (unitu[4].boy) unitu[4].go_home();
            if (unitu[5].boy) unitu[5].go_home();
            if (unitu[6].boy) unitu[6].go_home();

            //проверка на победителя
            if (!unitu[0].win && !unitu[1].win && !unitu[6].win) {
                unitu[2].win = true;
                if (unitu[3].bul_v_boy) unitu[3].win = true;
                if (unitu[4].bul_v_boy) unitu[4].win = true;
                if (unitu[5].bul_v_boy) unitu[5].win = true;
            } else {
                if ((unitu[0].win || unitu[1].win || unitu[6].win) && (!unitu[2].win && !unitu[3].win && !unitu[4].win && !unitu[5].win)) {
                    unitu[0].win = true;
                    if (unitu[1].bul_v_boy) unitu[1].win = true;
                    if (unitu[6].bul_v_boy) unitu[6].win = true;
                }
            }

            if (unitu[0].boy) unitu[0].null_proc_damag();
            if (unitu[2].boy) unitu[2].null_proc_damag();
            if (unitu[1].boy) unitu[1].null_proc_damag();
            if (unitu[3].boy) unitu[3].null_proc_damag();
            if (unitu[4].boy) unitu[4].null_proc_damag();
            if (unitu[5].boy) unitu[5].null_proc_damag();
            if (unitu[6].boy) unitu[6].null_proc_damag();

            //выход из цикла если все с одной стороны мертвы
            if (!unitu[0].boy && !unitu[1].boy && !unitu[6].boy || !unitu[2].boy && !unitu[3].boy && !unitu[4].boy && !unitu[5].boy) {
                break;
            }

            //кастыль заклинание "воодушевление магов"

            for (var lick = 0; lick < 7; lick++) {
                if (unitu[lick].hero) {
                    if (heroes[lick].magick[7]) {
                        mag_bonus[lick] += (heroes[lick].magick[7] * 20);//20 это проценты за каждый уровень заклинания
                        unitu[lick].bonusu[15] = mag_bonus[lick];
                        unitu[lick].limit_bonus(15, -90, false); //проверка лимита мин урона для мага
                    }

                }
            }

            big_cukl++;
        } while (big_cukl < 20);











        gate_hp[num_volna] = parseInt($.trim($("#hp_gate").val()));
        if (flags_gate[num_volna] && kz) {
            $('.gateEnds').show();
        } else {
            $('.gateEnds').hide();
        }

        //елси 20 раундо в то растановка победителей
        if (big_cukl == 20 && (unitu[2].win || unitu[3].win || unitu[4].win || unitu[5].win)) {
            unitu[2].win = true;
            if (unitu[3].bul_v_boy) unitu[3].win = true;
            if (unitu[4].bul_v_boy) unitu[4].win = true;
            if (unitu[5].bul_v_boy) unitu[5].win = true;
            unitu[0].win = false;
            if (unitu[1].bul_v_boy) unitu[1].win = false;
            if (unitu[6].bul_v_boy) unitu[6].win = false;
        }


        //востанавливаем параметры отступления если было заклинание "ловушка"
        unitu[0].otst = otst[0];
        unitu[1].otst = otst[1];
        unitu[6].otst = otst[2];

        var msk;
        var xilu = [0, 0, 0, 0, 0, 0, 0];
        var kol_ybitux = [0, 0, 0, 0, 0, 0, 0]; //количество убитых войск (добивание)
        var maxHill = [0, 0, 0, 0, 0, 0, 0]; //количество максималь хилов на войско
        dead_unit = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
        //-=-=-воскрешение войс с учетом +/- % бонусов и бонусов на запрет % воскрешения
        for (i = 0; i < 7; i++) {
            if (unitu[i].bul_v_boy) {
                unitu[i].xxx = 0;
                //считаем количество зарядов для хилов у каждого войска с бонусам
                unitu[i].xxx = Math.floor(unitu[i].hils());
                //считаем кол-во убитых
                unitu[i].dead_mean();

                //перепесь убитых для вывода в подробностях боя
                for (j = 0; j < 8; j++) {
                    dead_unit[i][j] = unitu[i].proc_damag_unitu[j];
                }

                msk = unitu[i].xxx;
                kol_ybitux[i] = Math.round(unitu[i].ataks / 100 * unitu[i].bonusu[26]);

                //todo fix this xxx
                maxHill[i] = unitu[i].ataks - kol_ybitux[i];


                if (unitu[i].xxx > unitu[i].ataks) {
                    unitu[i].xxx = unitu[i].ataks - kol_ybitux[i];
                    msk -= unitu[i].xxx;
                } else {
                    if (unitu[i].ataks - kol_ybitux[i] < unitu[i].xxx) {
                        unitu[i].xxx = unitu[i].ataks - kol_ybitux[i];
                    }
                    msk -= unitu[i].xxx;
                }

                //хиляем
                maxHill[i] -= unitu[i].xxx;
                unitu[i].xilaem();
                unitu[i].xxx = msk;
                xilu[i] = unitu[i].xxx;

                if (last) $('#marader_res_' + i).show();
                if (last) $('#cost_' + i).show();
            } else if (last) {
                $('#marader_res_' + i).hide();
                $('#cost_' + i).hide();
            }
        }


//todo: startcheck number logick for this function(lastfixrow)

        // считаем количестово подмог
        var bulo_v_boy_atack = 0;
        if (unitu[1].bul_v_boy)
            bulo_v_boy_atack++;
        if (unitu[6].bul_v_boy)
            bulo_v_boy_atack++;


        //todo временный кастыль хилов на 4-рых
        function healFriend(donor, receiver) {
            let countHill = xilu[donor];
            if (xilu[donor] > maxHill[receiver])
                countHill = maxHill[receiver];
            unitu[receiver].xxx = countHill;
            unitu[receiver].xilaem();
            xilu[donor] -= countHill;
            xilu[donor] += unitu[receiver].xxx;
            maxHill[receiver] -= countHill;
        }

        // attackers share healing
        [0, 1, 6].forEach(d => {
            if (xilu[d] > 0) {
                [0, 1, 6].filter(x => x !== d).some(r => {
                    healFriend(d, r);
                    return xilu[d] <= 0;
                });
            }
        });

        // defenders share healing
        [2, 3, 4, 5].forEach(d => {
            if (xilu[d] > 0) {
                [2, 3, 4, 5].filter(x => x !== d).some(r => {
                    healFriend(d, r);
                    return xilu[d] <= 0;
                });
            }
        });


        //todo: end check number logick for this function(lastfixrow)
        for (i = 0; i < 7; i++) {
            if (last && unitu[i].bul_v_boy) {
                $('#xil_' + i).show();
            }
            unitu[i].ataks = 0; //обнуляем после хилов
            unitu[i].xxx = xilu[i];
            //выводим количесто отхиляных
            for (j = 0; j < 8; j++) {
                msk = dead_unit[i][j] - unitu[i].proc_damag_unitu[j];
                if (last && msk) {
                    $('#xil_' + i + '_' + j).val('+' + msk).css({'border-color': 'green', 'color': 'green'});
                }
            }
            //записуем оставшиеся заряды в поле
            if (last) document.getElementById('zaradu_' + i).value = unitu[i].xxx;
        }

        //обнуляем переменный хранящие % атаку войска (использовал для хранения метрвяков)
        [0, 2, 1, 3, 4, 5, 6].forEach(x => {
            unitu[x].null_proc_damag();
        })

        //-=-=-востоновление убижавших
        for (i = 0; i < 7; i++) {
            unitu[i].go_back_b();
            unitu[i].dead_to_naim();//подсчет убитых
        }

        //обнуляем переменный хранящие общую атаку войска
        null_ataks();

        //запись результатов боя в ячейки
        for (i = 0; i < 7; i++) {
            if (!last) unitu[i].perepis();
        }
    } catch (e) {
        console.log(e);
    }
}


function preFight() {
    min_max_select();

    //настройка полей и дивов для вывода подробной инфы
    for (let i = 0; i < 20; i++) {
        $('#raund_' + i).hide();
    }
    $(".ditals_inp").val('').css({'border-color': '#BBB', 'color': 'black'});

    //подсвечуем отсупников если это не сделал пользователь
    for (let i = 0; i < 7; i++) {
        if (unitu[i].bul_v_boy) {
            $("#red_" + i).attr("checked", unitu[i].red);
        }
    }

    // let i = 6;
    // do {
    //     if (unitu[i].bul_v_boy) {
    //         $('#escape_' + i).show();
    //         $('#back_' + i).show();
    //     }
    //     if (unitu[i].bonusu[35] && !go_back[i]) {//если есть побег
    //
    //         let j = 7;
    //         do {
    //             unitu[i].qq0[j] = unitu[i].qq[j] > 0 ? (unitu[i].qq[j] / 100) * unitu[i].bonusu[35] : 0;
    //             unitu[i].qq[j] -= unitu[i].qq0[j];
    //             unitu[i].qq0[j] = Math.round(unitu[i].qq0[j]);
    //             unitu[i].qq[j] = Math.round(unitu[i].qq[j]);
    //             if (unitu[i].qq0[j]) {
    //                 $('#escape_' + i + '_' + j).val(-unitu[i].qq0[j]).css({'border-color': 'red', 'color': 'red'});
    //                 $('#back_' + i + '_' + j).val('+' + unitu[i].qq0[j]).css({
    //                     'border-color': 'green',
    //                     'color': 'green'
    //                 });
    //             }
    //             j--;
    //         } while (j + 1);
    //         unitu[i].proc();
    //         //todo пересчитать бонусь отсупления
    //     }
    //     i--;
    // } while (i + 1);
}

function postFight() {
    //ставим надписе о победе проиграше
    if (unitu[0].win) {
        $('.atk_title').html("победил");
        $('.def_title').html("проиграл");
        $('.atac_fatal, #maraderstvo .fon_green').hide();
        $('.zash_fatal').show();
    } else {
        $('.atk_title').html("проиграл");
        $('.def_title').html("победил");
        $('.atac_fatal').show();
        $('.zash_fatal, #maraderstvo .fon_red').hide();
    }

    //-=-=-перевод % убитых в наймов !!!!!!!!!!!!!!!!!доделать проверку на этот бонус и уточнить когда он работает (только при победе?)
    for (i = 0; i < 7; i++) {
        if (unitu[i].bul_v_boy) {
            $("#nickrom_" + i).show();
            unitu[i].naimu_iz_ybitux();
        }
    }

    // запись результатов боя в ячейки
    for (i = 0; i < 7; i++) {
        unitu[i].see_rez();
        unitu[i].perepis();
    }

    //расчет потерь в ресурсах
    let sum;
    for (i = 0; i < 7; i++) {
        if (unitu[i].bul_v_boy) {
            var tmpArrayCost = db_cost;
            if (unitu[i].type == 4) {
                if (kz && i == 2) {
                    tmpArrayCost = db_cost_casol_monster;
                } else {
                    tmpArrayCost = db_cost_monster;
                }
            }

            $('#cost_' + i).show();
            for (j = 0; j < 5; j++) {
                sum = 0;
                for (var k = 0; k < 8; k++) {
                    sum += unitu[i].proc_damag_unitu[k] * tmpArrayCost[k][unitu[i].lvl[k]][j + 1];
                }

                var cost = $('#cost_' + i + '_' + j);
                if (sum < 0) {
                    cost.css({'color': 'red', 'border-color': 'red'}).val(sum);
                } else {
                    if (sum > 0) {
                        cost.val('+' + sum).css({'color': 'dodgerblue', 'border-color': 'dodgerblue'});
                    }
                }
            }
        }
    }

    calculate_marader();
    //Расчет фракционки
    //проверка на рассу защитника, а точнее на рассу монстров
    if (unitu[2].type != 4) {
        //если расса не монстр то
        //расчет фракционка из погибших 1-защитника + фракционка из погибших 2-защитника(если расса не монстр)+ фракционка из погибших 3-защитника(если расса не монстр)
        frakc = (unitu[2].cost(unitu[2].proc_damag_unitu) + (unitu[3].type != 4 ? unitu[3].cost(unitu[3].proc_damag_unitu) : 0) + (unitu[4].type != 4 ? unitu[4].cost(unitu[4].proc_damag_unitu) : 0) + (unitu[5].type != 4 ? unitu[5].cost(unitu[5].proc_damag_unitu) : 0)) * (-1);
        //распределение фракционного рейтинга между атакующими по нанесенного урона

        var cost_unit_atak = [damagInBatle[0], damagInBatle[1], damagInBatle[6]];
        if (!unitu[1].bul_v_boy) {
            cost_unit_atak[1] = 0;
        }
        if (!unitu[6].bul_v_boy) {
            cost_unit_atak[2] = 0;
        }
        tmpSum = (cost_unit_atak[0] + cost_unit_atak[1] + cost_unit_atak[2]) / 100;
        unitu[0].ataks = cost_unit_atak[0] / tmpSum;
        unitu[1].ataks = cost_unit_atak[1] / tmpSum;
        unitu[6].ataks = cost_unit_atak[2] / tmpSum;

        unitu[0].ataks = frakc / 100 * unitu[0].ataks;
        unitu[1].ataks = frakc / 100 * unitu[1].ataks;
        unitu[6].ataks = frakc / 100 * unitu[6].ataks;
        unitu[0].ataks = isNaN(unitu[0].ataks) ? 0 : Math.round(unitu[0].ataks);
        unitu[1].ataks = isNaN(unitu[1].ataks) ? 0 : Math.round(unitu[1].ataks);
        unitu[6].ataks = isNaN(unitu[6].ataks) ? 0 : Math.round(unitu[6].ataks);

        //определение является ли рейтин отрецательным для 1-го атакующего
        if (unitu[0].type == unitu[2].type && !unitu[2].red || !unitu[0].type &&
            unitu[2].type == 1 && !unitu[2].red
            || unitu[0].type == 1 && !unitu[2].type && !unitu[2].red ||
            unitu[0].type == 3 && unitu[2].type == 2 && !unitu[2].red ||
            unitu[0].type == 2 && unitu[2].type == 3 && !unitu[2].red) {
            //снижение отрецательной бонусом
            unitu[0].ataks += unitu[0].ataks / 100 * unitu[0].bonusu[27];  //Проверить!!!!!!!!!!!!!!!!!!!!!!!!!!!!! - на -
            unitu[0].ataks = isNaN(unitu[0].ataks) ? 0 : Math.round(unitu[0].ataks);
            document.getElementById("frakcuonka_0").value = "-" + unitu[0].ataks;
            document.getElementById("frakcuonka_0").style.border = "2px  solid #ff0000";
            document.getElementById("frakcuonka_0").style.color = "#ff0000";
        } else {
            document.getElementById("frakcuonka_0").value = unitu[0].ataks;
            document.getElementById("frakcuonka_0").style.border = "2px  solid #009900";
            document.getElementById("frakcuonka_0").style.color = "#009900";

        }
        //определение является ли рейтин отрецательным для 2-го атакующего
        if (unitu[1].type == unitu[2].type && !unitu[2].red || !unitu[1].type && unitu[2].type == 1 && !unitu[2].red ||
            unitu[1].type == 1 && !unitu[2].type && !unitu[2].red ||
            unitu[1].type == 3 && unitu[2].type == 2 && !unitu[2].red
            || unitu[1].type == 2 && unitu[2].type == 3 && !unitu[2].red) {
            //снижение отрецательной бонусом
            unitu[1].ataks += unitu[1].ataks / 100 * unitu[1].bonusu[27];
            unitu[1].ataks = isNaN(unitu[1].ataks) ? 0 : Math.round(unitu[1].ataks);
            document.getElementById("frakcuonka_1").value = "-" + unitu[1].ataks;
            document.getElementById("frakcuonka_1").style.border = "2px  solid #ff0000";
            document.getElementById("frakcuonka_1").style.color = "#ff0000";
        } else {
            document.getElementById("frakcuonka_1").value = unitu[1].ataks;
            document.getElementById("frakcuonka_1").style.border = "2px  solid #009900";
            document.getElementById("frakcuonka_1").style.color = "#009900";
        }

        //определение является ли рейтин отрецательным для 3-го атакующего
        if (unitu[6].type == unitu[2].type && !unitu[2].red || !unitu[6].type && unitu[2].type == 1 && !unitu[2].red ||
            unitu[6].type == 1 && !unitu[2].type && !unitu[2].red ||
            unitu[6].type == 3 && unitu[2].type == 2 && !unitu[2].red
            || unitu[6].type == 2 && unitu[2].type == 3 && !unitu[2].red) {
            //снижение отрецательной бонусом
            unitu[6].ataks += unitu[6].ataks / 100 * unitu[6].bonusu[27];
            unitu[6].ataks = isNaN(unitu[6].ataks) ? 0 : Math.round(unitu[6].ataks);
            document.getElementById("frakcuonka_6").value = "-" + unitu[6].ataks;
            document.getElementById("frakcuonka_6").style.border = "2px  solid #ff0000";
            document.getElementById("frakcuonka_6").style.color = "#ff0000";
        } else {
            document.getElementById("frakcuonka_6").value = unitu[6].ataks;
            document.getElementById("frakcuonka_6").style.border = "2px  solid #009900";
            document.getElementById("frakcuonka_6").style.color = "#009900";
        }

        unitu[0].ataks = 0;
        unitu[1].ataks = 0;
        unitu[6].ataks = 0;
    } else {
        [0, 1, 6].forEach(x => {
            document.getElementById("frakcuonka_" + x).value = 0;
            document.getElementById("frakcuonka_" + x).style.border = "2px  solid #009900";
            document.getElementById("frakcuonka_" + x).style.color = "#009900";
        })
    }

    //подсчет и вывод опыта герое для шахтерского сервера
    new_expiriens_hero_u();

    //показуем див с результатом
    unitu[1].bul_v_boy ? document.getElementById("rez_1").style.display = "block" : document.getElementById("rez_1").style.display = "none";
    unitu[3].bul_v_boy ? document.getElementById("rez_3").style.display = "block" : document.getElementById("rez_3").style.display = "none";
    unitu[4].bul_v_boy ? document.getElementById("rez_4").style.display = "block" : document.getElementById("rez_4").style.display = "none";
    unitu[5].bul_v_boy ? document.getElementById("rez_5").style.display = "block" : document.getElementById("rez_5").style.display = "none";
    unitu[6].bul_v_boy ? document.getElementById("rez_6").style.display = "block" : document.getElementById("rez_6").style.display = "none";

    document.getElementById("rez_faiting").style.display = "block";

}

