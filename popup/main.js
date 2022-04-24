function listenForClicks() {
    document.addEventListener("click", (e) => {
    if (e.target.classList.contains("turned-off")) {
        var on = document.getElementsByClassName("turned-on")[0]
        on.style.display = 'block';
        setCounter(3)
        var off = document.getElementsByClassName("turned-off")[0]
        off.style.display = 'none';
        browser.tabs.query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "AntiHateTurnedOn"
            })
        })
    }
    
    if (e.target.classList.contains("turned-on")) {
        var on = document.getElementsByClassName("turned-off")[0]
        on.style.display = 'block';
        setCounter(0)
        var off = document.getElementsByClassName("turned-on")[0]
        off.style.display = 'none';
        browser.tabs.query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "AntiHateTurnedOff"
            })
        })
    }
    })
}


browser.tabs.executeScript({file: "/content_scripts/script.js"})
.then(listenForClicks)

function setCounter(value) {
    document.getElementById("number-of-blocked").textContent = value
}

function getCounter() {
    return parseInt(document.getElementById("number-of-blocked").textContent)
}

setCounter(2)

// executeScript({file: "/content_scripts/script.js"}).then(listenForClicks)