chrome.storage.local.get(["apikey"], function (result) {
  if (result.apikey) {
    document.getElementById("apikey").value = result.apikey;
    //   console.log(result.apikey);
  }
});

document.getElementById("loginBtn").addEventListener("click", function () {
  const apii = document.getElementById("apikey").value;
  chrome.storage.local.set({ loggedIn: true }, function () {
    window.location.href = "dashboard.html";
  });
  chrome.storage.local.set({ apikey: apii });
});

document.getElementById("apikey").addEventListener("keypress", function (event) {
    // console.log("Key Pressed:", event.key); // Debugging
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("loginBtn").click();
    }
  });
