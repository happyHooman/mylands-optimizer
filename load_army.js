chrome.storage.sync.get('battleId', function (data) {
    const doc = document.getElementsByTagName('iframe')[0].contentDocument;
    doc.getElementById("save_id").value = data.battleId;
    doc.getElementById('load').click()
});
