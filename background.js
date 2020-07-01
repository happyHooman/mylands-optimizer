chrome.runtime.onInstalled.addListener(function() {
  const armies = [
      {name: "Nevskiy", battleId: 1708026},
      {name: "Snow White", battleId: 1708025},
      {name: "Agra", battleId: 1708023},
      {name: "Snow White 5", battleId: 1708024}];
  
  chrome.storage.sync.set({armies});

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'www.your-rules.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
