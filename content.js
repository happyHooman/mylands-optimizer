let doc = document.getElementsByTagName('iframe')[0].contentDocument;
doc.addEventListener('DOMContentLoaded', () => {
    const s = doc.createElement('script');
    s.src = chrome.extension.getURL('script.js');
    (doc.head || doc.documentElement).appendChild(s);
    s.onload = function () {
        s.parentNode.removeChild(s);
    };
})
