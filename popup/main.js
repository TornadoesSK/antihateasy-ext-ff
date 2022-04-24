function listenForClicks() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("turned-off")) {
      var on = document.getElementsByClassName("turned-on")[0];
      on.style.display = "block";
      var off = document.getElementsByClassName("turned-off")[0];
      off.style.display = "none";
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "AntiHateTurnedOn",
        });
      });
    }

    if (e.target.classList.contains("turned-on")) {
      var on = document.getElementsByClassName("turned-off")[0];
      on.style.display = "block";
      setCounter(0);
      var off = document.getElementsByClassName("turned-on")[0];
      off.style.display = "none";
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "AntiHateTurnedOff",
        });
      });
    }
  });
}

browser.tabs
  .executeScript({ file: "/content_scripts/script.js" })
  .then(listenForClicks);

function setCounter(value) {
  localStorage.setItem("hateful", value);
  document.getElementById("number-of-blocked").textContent = value;
}

function getCounter() {
  return Number.parseInt(localStorage.getItem("hateful"));
}

function setCounterAll(value) {
  localStorage.setItem("good", value);
  document.getElementById("number-of-all").textContent = value;
}

function getCounterAll() {
  return Number.parseInt(localStorage.getItem("good"));
}

let curCounter = getCounter();
setCounter(Number.isNaN(curCounter) ? 0 : curCounter);
let curCounterAll = getCounterAll();
setCounterAll(Number.isNaN(curCounterAll) ? 0 : curCounterAll);

browser.runtime.onMessage.addListener((message) => {
  if (message.type == "AntiHateIsHate") {
    console.log("Setting counter " + parseInt(getCounter()));
    setCounter(getCounter() + message.hateful);
    setCounterAll(getCounterAll() + message.all);
  }
});
