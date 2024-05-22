chrome.scripting.executeScript({
  target: {tabId: id, allFrames: true},
  files: ['alert.js'],
});