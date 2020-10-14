chrome.runtime.onInstalled.addListener(function() {
  const armies = [
      {name: "Nevskiy", battleId: 1718611},
      {name: "Snow White", battleId: 1719008},
      {name: "Agra", battleId: 1718616},
      {name: "Agra with G", battleId: 1718614},
      {name: "Def", battleId: 1714252},
  ];
    // const armies = []
  
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
