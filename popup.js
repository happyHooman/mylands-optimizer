'use strict';

const loadBtn = document.getElementById('load');
const saveBtn = document.getElementById('save');
const extraBtn = document.getElementById('extra_btn');

loadBtn.onclick = function (event) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, {file: 'load_army.js'})});
};

extraBtn.onclick = function (event) {
    const extraDiv = document.getElementById('extra_div');
    const hidden = extraDiv.style.display === 'none';
    if (hidden) {
        extraDiv.style.display = 'block';
        event.target.className = 'rotate-up'
    } else {
        extraDiv.style.display = 'none';
        event.target.className = 'rotate-down'
    }
}

saveBtn.onclick = function (event) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {
                file: 'save_army.js'
            });
    });
};