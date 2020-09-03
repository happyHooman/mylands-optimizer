chrome.runtime.onInstalled.addListener(function() {
  const armies = [
      {name: "Nevskiy", battleId: 1714727},
      {name: "Snow White", battleId: 1714573},
      {name: "Agra", battleId: 1714728},
      {name: "Agra with G", battleId: 1714729},
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
