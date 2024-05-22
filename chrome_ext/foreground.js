// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page (injected only if the page url matched)")

chrome.runtime.onMessage.addListener( // this is the message listener
    function(request, sender, sendResponse) {
        if (request.message === "lerDOM") {
            const elements = document.querySelectorAll('.relative > .relative div.absolute.text-white.p-1>div>img');
            
            const times = [];
            elements.forEach(item => {
                const nomeTime = item.alt;
                const isNacao = item.src.toString().includes('nations')
                const isTaca = item.src.toString().includes('trophies')

                times.push({
                    nomeTime, isNacao, isTaca
                })
            });

            console.log(times);
        }
    }
);