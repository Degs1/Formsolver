console.log("🔹 GForm Auto Answer Active!");

async function getAnswer(question, choices) {
    let apiKey = await chrome.storage.local.get('apikey');
    let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey.apikey}`;

    let prompt = `please Select the correct answer from the following options for this question:\n\n"${question}"\n\noption:\n${choices.join("\n")}\n\nBut put the answer with same option character,space,or symbol and explanation`;

    let maxTries=5;
    for (let attempt = 1; attempt <= maxTries; attempt++) {
        try {
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "contents": [{ "parts": [{ "text": prompt }] }]
                })
            });

            let result = await response.json();
            // console.log(result)
            if (result.candidates && result.candidates.length > 0) {
                await new Promise(r => setTimeout(r, 2500));
                return result.candidates[0].content.parts[0].text.trim();
            } else {
                await new Promise(res => setTimeout(res, 2500));
            }

            if (attempt === maxTries) {
                return ''
            }
        } catch (e) {
                console.error("Error:", e.message);
                if (e.message.includes("You exceeded your current quota")) {
                    await new Promise(res => setTimeout(res, 2500));
                } 

                if (attempt === maxTries) {
                    return ''
                }
        }
    }
}

async function getTextFromImage(imageUrl, question, choices) {
    let apiKey = await chrome.storage.local.get('apikey');
    let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey.apikey}`;
    let maxTries=5;

    for (let attempt = 1; attempt <= maxTries; attempt++) {
        try {
            let base64Image = await convertImageToBase64(imageUrl);
    
            let response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `Please Select the correct answer from the following options for this question with a photo:\n\n${question}\n\noption:\n${choices.join("\n")}\n\nBut put the answer with same option character,space,or symbol and explanation` },
                            { inline_data: { mime_type: "image/png", data: base64Image } }
                        ]
                    }]
                })
            });
    
            let result = await response.json();
            // console.log(result);
    
            if (result.candidates && result.candidates.length > 0) {
                await new Promise(r => setTimeout(r, 2500));
                return result.candidates[0].content.parts[0].text.trim();
            } else {
                await new Promise(res => setTimeout(res, 2500));
            }

            if (attempt === maxTries) {
                return ''
            }
        } catch (error) {
            console.error("Error:", error.message);
            if (error.message.includes("You exceeded your current quota")) {
                await new Promise(res => setTimeout(res, 2500));
            }

            if (attempt === maxTries) {
                return ''
            }
        }
    }
    return 'guygugvfyeted'

}

async function convertImageToBase64(imageUrl) {
    let response = await fetch(imageUrl);
    let blob = await response.blob();
    
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            let base64String = reader.result.split(',')[1]; 
            resolve(base64String);
        };
        reader.onerror = reject;
    });
}

async function updateProgress(totalSoal,soalKe) {
    let valuee =(soalKe / totalSoal) * 100;
    chrome.storage.local.set({ value: valuee, answered: soalKe, totalsoal: totalSoal });
}

async function updateLog(question,link,option,answer) {
    let logger = ''
    if (link) {
        logger+=`Img Link : ${link}\n`
        logger+=`Question : ${question}\n\n`
        logger+=`option : \n${option.join('\n')}\n`
        logger+=`✅Answer : ${answer}`
    } else {
        logger+=`Question : ${question}\n\n`
        logger+=`option : \n${option.join('\n')}\n`
        logger+=`✅Answer : ${answer}`
    }
    logger+=`\n---------------------\n\n`
    chrome.storage.local.set({ logapi: logger });
}

async function autoFillForm() {
    // let btn=document.getElementById('startBot');
    // btn.disabled=!btn.disabled;
    let questions = document.querySelectorAll(".Qr7Oae"); 
    let totalSoal=questions.length;
    let soalKe=0;

    for (let question of questions) {
        let textElement = await question.querySelector(".M7eMe");
        let text = await textElement.innerText.trim().normalize("NFKC"); 
        

        let options = await question.querySelectorAll("div[role='radio'], div[role='checkbox']"); // Ambil radio button
        let choices = [];
        for (let option of options) {
            let optionText = option.getAttribute("aria-label") || option.textContent.trim().normalize("NFKC");

            
            if (!optionText && option.querySelector("span")) {
                optionText = await option.querySelector("span").textContent.trim().normalize("NFKC");
            }

            
            optionText = optionText.replace(/\u200B/g, "").replace(/\u00A0/g, " ");
            
            if (optionText === "") {
                // console.warn("⚠️ Opsi jawaban kosong, cek elemen!", option.outerHTML);
            } else {
                await choices.push(optionText);
            }
        }
        console.log(`📌question:${text}\n\nOption:\n${choices.join("\n")}`);
        let imageElement = await question.querySelector("img, div[role='img']");
        let optionss = await question.querySelector("div[role='radio'], div[role='checkbox']")
        let imageUrl;

        let answer = "";
        if (imageElement) {
            imageUrl = imageElement.src || imageElement.getAttribute("data-src");
            if (imageUrl && optionss) {
                console.log("📷 question have photo:", imageUrl);
                answer = await getTextFromImage(imageUrl, text, choices);
            } else {
                console.warn("⚠️ cant find photo url:", imageElement.outerHTML);
            }
        } else if (optionss) {
            answer = await getAnswer(text, choices);
        }
        answer = answer.trim().normalize("NFKC").replace(/\u200B/g, "").replace(/\u00A0/g, " ");

        console.log("✅ Ai answer:", answer);

        let found = false;

        for (let option of options) {
            let optionText = option.getAttribute("aria-label") || option.textContent.trim().normalize("NFKC");
            optionText = optionText.replace(/\u200B/g, "").replace(/\u00A0/g, " ");

            const isChecked = await option.getAttribute("aria-checked");

            if (answer.toLowerCase() === optionText.toLowerCase() || answer.toLowerCase().includes(optionText.toLowerCase()) || optionText.toLowerCase().includes(answer.toLowerCase())) {
                if (isChecked === "false") {
                    await option.click(); 
                    console.log("✔️ Anwer checked:", optionText);
                    found = true;
                    // break;
                } else {
                    found = true;
                }
            }
        }

        if (!found) {
            console.log("⚠️ Ai anwer not match with all the option.");
            await updateLog(text,imageUrl,choices,answer)
        } else {
            soalKe+=1;
            await updateProgress(totalSoal,soalKe);
            await updateLog(text,imageUrl,choices,answer)
        }
    }
    chrome.storage.local.set({ Donee: 'Done brow' })
    // btn.disabled=!btn.disabled
}


autoFillForm();
