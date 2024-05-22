document.getElementById('botao').addEventListener('click', (evt) => {
    chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "lerDOM" }, function(response) {
            console.log(response);
        });
    }); 
})