// let doc = document.getElementsByTagName('iframe')[0].contentDocument;
// let battleId = doc.getElementById("save_id").value;

chrome.storage.sync.set({battleId: document.getElementsByTagName('iframe')[0].contentDocument.getElementById("save_id").value});