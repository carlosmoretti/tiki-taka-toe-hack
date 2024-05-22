document.getElementById('botao').addEventListener('click', (evt) => {
    chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "lerDOM" }, async function(response) {
            console.log('teste', response);
        });
    }); 
})