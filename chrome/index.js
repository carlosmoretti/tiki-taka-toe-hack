function hello() {
    chrome.scripting.executeScript({
        target: { tabId: id, allFrames: true },
        files: ['alert.js'],
    });
}

document.getElementById('clickme')
    .addEventListener('click', hello);