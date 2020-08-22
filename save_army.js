(() => {
    const waitForValue = (depth=0) => {
        const step = 20;
        const val = doc.getElementById("save_id").value;
        if (val !== undefined && val !== null && val !== '') {
            chrome.runtime.sendMessage({newArmyId: val});
        } else if (depth < 200) {
            setTimeout(()=>{waitForValue(depth+1)}, step);
        }
    }

    const doc = document.getElementsByTagName('iframe')[0].contentDocument;
    doc.getElementById("save_id").value = '';
    doc.getElementById('save').click();
    waitForValue();
})();

