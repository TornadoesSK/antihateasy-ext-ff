var isOn = false;
var counter = 0;

function updateNumberOfBlocked() {
  browser.runtime.sendMessage({
    type: "AntiHateIsHate",
  });
}

function blurElement(elem) {
  // setting article style
  elem.classList.add("antihate-blurred");
  elem.style.filter = "blur(5px)";
  // setting parent element
  var newElem = document.createElement("div");
  newElem.classList.add("antihate-blur");
  newElem.style.position = "absolute";
  newElem.style.display = "flex";
  newElem.style.width = "100%";
  newElem.style.height = "100%";
  newElem.style.justifyContent = "center";
  newElem.style.alignItems = "center";
  newElem.style.zIndex = "100";
  // setting inside element
  var inside = document.createElement("p");
  inside.innerText = "Hateful speech blocked!";
  inside.style.backgroundColor = "black";
  inside.style.border = "2px solid black";
  inside.style.borderRadius = "10px";
  inside.style.fontSize = "1.2em";
  inside.style.opacity = "0.6";
  inside.style.padding = "5px";
  inside.style.color = "white";
  newElem.appendChild(inside);
  // append before article
  elem.before(newElem);
}

// determine if elem is hate speech
async function isHateSpeech(elem) {
  data = elem.querySelector("div[lang]");

  if (await fetchHate(data.textContent)) {
    return true;
  } else {
    return false;
  }
}

async function main() {
  if (!isOn) {
    return;
  }
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  var articles = document.querySelectorAll('article[data-testid="tweet"]');
  for (const elem of articles) {
    // blur if is hate speech
    if (await isHateSpeech(elem)) {
      updateNumberOfBlocked()
      blurElement(elem);
    }
    counter += 1;
  }
}

async function fetchHate(message) {
  const data = await fetch("http://127.0.0.1:5000/api/message/hate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  })
.then(response => response.body)
.then(rb => {
  const reader = rb.getReader();

  return new ReadableStream({
    start(controller) {
      // The following function handles each data chunk
      function push() {
        // "done" is a Boolean and value a "Uint8Array"
        reader.read().then( ({done, value}) => {
          // If there is no more data to read
          if (done) {
            controller.close();
            return;
          }
          // Get the data and send it to the browser via the controller
          controller.enqueue(value);
          push();
        })
      }

      push();
    }
  });
})
.then(stream => {
  // Respond with our stream
  return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
});

return JSON.parse(data).hate
}

(function () {
  main();

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "AntiHateTurnedOff") {
      isOn = false;
      blurs = document.getElementsByClassName("antihate-blur");
      // remove text over blur
      while (blurs.length > 0) {
        blurs[0].parentNode.removeChild(blurs[0]);
      }
      // remove blur
      const blurredElems = document.getElementsByClassName("antihate-blurred");
      while (blurredElems.length > 0) {
        const blurred = blurredElems[0];
        blurred.style.filter = null;
        blurred.classList.remove("antihate-blurred");
      }
    } else if (message.command === "AntiHateTurnedOn") {
      isOn = true;
      main();
    }
  });
})();
