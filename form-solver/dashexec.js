function executeScriptPromise() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"]
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    });
}

document.getElementById("startBot").addEventListener("click", async function() {
    let btn = document.getElementById('startBot');
    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
        btn.textContent='Wait a Second!';
        await executeScriptPromise(); 
    } catch (error) {
        console.error("Error executing script:", error);
    }

    btn.disabled = false;
    btn.textContent = 'Start Bot';
}); 

// document.getElementById('downloadlog').addEventListener('click', async function() {
//     const btn = document.getElementById('downloadlog')

//     btn.disabled = !btn.disabled;
//     await new Promise( res => setTimeout(res,500))
//     btn.disabled = ! btn.disabled
// });



chrome.storage.onChanged.addListener((changes, namespace) => {
    // console.log(changes)
    if (changes.value) { 
        let newValue = changes.value.newValue;

        let progressBar = document.querySelector(".progress-bar");
        if (progressBar) {
            progressBar.style.width = `${newValue}%`;
            // progressBar.textContent =`Answered `
        }
    }

    if (changes.answered || changes.totalsoal) {
        let valuesoal = changes.answered.newValue;
        // let totalsol = changes.totalsoal.oldValue;

        let progressBar = document.querySelector(".progress-bar");
        if (progressBar) {
            progressBar.textContent = `Answered : ${valuesoal} question`
        }
    }

    if (changes.Donee) {
        let doneval= changes.Donee.newValue;
        let valuesoal = changes.answered.newValue;

        let progressBar = document.querySelector(".progress-bar");
        if (progressBar) {
            progressBar.textContent = `${doneval} Answer:${valuesoal}`
        }
    }
});

chrome.storage.onChanged.addListener((changes,namespace) => {
    if (changes.logapi) {
        let textarea = document.getElementById('logans');
        if (textarea) {
            textarea.value=textarea.value + changes.logapi.newValue;
        }
    }
});

document.getElementById('downloadlog').addEventListener('click', async function downloadTextarea() {
    let btn=document.getElementById('downloadlog');
    btn.disabled=!btn.disabled;
    const textarea = document.getElementById('logans');
    const text = textarea.value;
    const filename = "scrape_log.txt"; // nama file yang mau didownload

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // Bersihkan memory
    URL.revokeObjectURL(link.href);
    btn.disabled=!btn.disabled
});