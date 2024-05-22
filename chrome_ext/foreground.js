chrome.runtime.onMessage.addListener( // this is the message listener
    function (request, sender, sendResponse) {
        if (request.message === "lerDOM") {
            return new Promise((resolve, reject) => {
                const elements = document.querySelectorAll('.relative > .relative div.absolute.text-white.p-1>div>img');

                const times = [];
                elements.forEach(item => {
                    const nomeTime = item.alt;
                    const isNacao = item.src.toString().includes('nations')
                    const isTaca = item.src.toString().includes('trophies')
                    const isTime = !isNacao && !isTaca;

                    times.push({
                        nomeTime, isNacao, isTaca, isTime
                    })
                });

                resolve(fetch('http://127.0.0.1:3000/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(times)
                }).then(e => e.json()))
            })
        }
    }
);