'use strict';

const armiesContainer = document.getElementById('armies');

chrome.storage.sync.get('armies', function (data) {
    data.armies.forEach(army => {
        const container = document.createElement('div');
        container.className = 'army';
        const armyTitle = document.createElement('div');
        armyTitle.innerText = army.name;
        armyTitle.className = 'army-title';
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options';
        const l = document.createElement('button');
        l.innerText = 'l';
        l.onclick = loadArmy.bind(null, army.battleId);
        const u = document.createElement('button');
        u.innerText = 'u';
        u.onclick = saveArmy.bind(null, 40);
        const x = document.createElement('button');
        x.innerText = 'x';
        x.onclick = removeArmy.bind(null, 50);

        optionsContainer.appendChild(l);
        optionsContainer.appendChild(u);
        optionsContainer.appendChild(x);
        container.appendChild(armyTitle);
        container.appendChild(optionsContainer);
        armiesContainer.appendChild(container);
    });

    const addArmy = document.createElement('button');
    addArmy.innerText = 'Add New';
    addArmy.id = 'add-new';
    addArmy.onclick = addNewArmy.bind(null, data.armies);
    armiesContainer.appendChild(addArmy);
});

const loadArmy = armyId => {
    chrome.tabs.executeScript({code: `
    (army => {
        const doc = document.getElementsByTagName('iframe')[0].contentDocument;
        doc.getElementById("save_id").value = army;
        doc.getElementById('load').click()
    })(${armyId});
    `});
};

const saveArmy = armyId => {
    chrome.tabs.executeScript({code: `console.log('save army');`});
};

const removeArmy = armyId => {
    chrome.tabs.executeScript({code: `console.log('remove army');`});
};

const addNewArmy = armies => {
    chrome.tabs.executeScript({code: `console.log('add new army');`});
};
