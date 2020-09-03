'use strict';

const armiesContainer = document.getElementById('armies');
let armies_list = {};
let armyIndex, f;


const createArmyElement = ({army, index}) => {
    const container = document.createElement('div');
    container.className = 'army';

    const armyTitle = document.createElement('div');
    armyTitle.innerText = army.name;
    armyTitle.className = 'army-title';

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options';

    const l = document.createElement('button');
    l.innerText = 'l';
    l.id = 'load_' + index;
    l.title = 'load';
    l.onclick = loadArmy.bind(null, army.battleId);

    const u = document.createElement('button');
    u.innerText = 'u';
    u.title = 'update';
    u.onclick = updateArmy.bind(null, index);

    const r = document.createElement('button');
    r.innerText = 'r';
    r.title = 'rename';
    r.onclick = renameArmy.bind(null, index);

    const x = document.createElement('button');
    x.innerText = 'x';
    x.title = 'remove';
    x.onclick = removeArmy.bind(null, index);

    optionsContainer.appendChild(l);
    optionsContainer.appendChild(u);
    optionsContainer.appendChild(r);
    optionsContainer.appendChild(x);
    container.appendChild(armyTitle);
    container.appendChild(optionsContainer);

    return container;
}

const refreshArmies = () => {
    armiesContainer.innerHTML = '';
    armies_list.forEach((army, index) => {
        armiesContainer.appendChild(createArmyElement({army, index}))
    });
}

chrome.storage.sync.get('armies', function (data) {
    armies_list = data.armies;
    refreshArmies();
});

const loadArmy = armyId => {
    chrome.tabs.executeScript({
        code: `
    (army => {
        const doc = document.getElementsByTagName('iframe')[0].contentDocument;
        doc.getElementById("save_id").value = army;
        doc.getElementById('load').click()
    })(${armyId});
    `
    });
};

const updateArmy = (index) => {
    f = 'update'
    armyIndex = index;
    saveArmyBtn();
};

const removeArmy = index => {
    armies_list.splice(index, 1);
    armiesContainer.innerHTML = '';
    armies_list.forEach((army, index) => {
        armiesContainer.appendChild(createArmyElement({army, index}))
    });
    chrome.storage.sync.set({armies: armies_list});
};

const renameArmy = index => {
    const name = prompt('Please enter a name for the army');
    if (name !== null && name !== "") {
        armies_list[index].name = name;
        refreshArmies();
        chrome.storage.sync.set({armies: armies_list});
    }
}

const addNewArmy = () => {
    f = 'new'
    saveArmyBtn();
};

const saveArmyBtn = () => {
    chrome.tabs.executeScript({file: 'save_army.js'});
}

const addArmy = document.getElementById('addNew');
addArmy.onclick = addNewArmy;

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.newArmyId) {
            switch (f) {
                case 'new':
                    const name = prompt('Please enter a name for the army');
                    if (name !== null && name !== "") {
                        const army = {battleId: parseInt(request.newArmyId), name};
                        armiesContainer.appendChild(createArmyElement({
                            army,
                            index: armies_list.length,
                            allArmies: armies_list
                        }));
                        armies_list.push(army);
                        chrome.storage.sync.set({armies: armies_list});
                    }
                    break;
                case 'update':
                    const newArmyId = parseInt(request.newArmyId)
                    armies_list[armyIndex].battleId = newArmyId;
                    document.getElementById('load_' + armyIndex).onclick = loadArmy.bind(null, newArmyId)
                    chrome.storage.sync.set({armies: armies_list})
            }
        }
    });
