
document.getElementById("startBot").addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
        });
    });
}); 

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes)
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
});