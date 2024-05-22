document.getElementById('botao').addEventListener('click', (evt) => {
    chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "lerDOM" }, async function(response) {
            // const elemento = document.getElementById('tiki-taka-toe');
            // elemento.replaceChildren([]);

            response.forEach((item, i) => {
                const elemento = document.getElementById(i + 1);
                elemento.textContent = item.prompt;
            })
        });
    }); 
})