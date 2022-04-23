var isOn = false;
var counter = 0;

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
function isHateSpeech(elem) {
  data = elem.querySelector("div[lang]")
  console.log("TOTO SU DATA")
  console.log(data)
  bodyData = {"message": data.textContent}
  console.log("IS HATE? " + data.textContent)
  console.log(JSON.stringify(bodyData))
  fetch("https://antihate.free.beeceptor.com/api/message/hate", {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(bodyData)
  }).then(res => {
    console.log("Request complete! response:", res);
  }).catch(err => {
    console.log("ERRRPR")
    console.log(err);
  });

  if (counter % 3 == 0) {
    return true;
  } else {
    return false;
  }
}

function main() {
  if (!isOn) {
    return;
  }
  console.log("INNNNNN")
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  // if (window.hasRun) {
  //   return;
  // }
  // window.hasRun = true;

  var articles = document.querySelectorAll("article[data-testid=\"tweet\"]")
  for (const elem of articles) {
    // blur if is hate speech
    if (isHateSpeech(elem)) {
        blurElement(elem)
    }
    counter += 1
  } 
}

(function() {
  main()

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "AntiHateTurnedOff") {
      isOn = false;
      blurs = document.getElementsByClassName("antihate-blur")
      // remove text over blur
      while (blurs.length > 0) {
        blurs[0].parentNode.removeChild(blurs[0]);
      }
      // remove blur
      const blurredElems = document.getElementsByClassName("antihate-blurred");
      while (blurredElems.length > 0) {
        const blurred = blurredElems[0]
        blurred.style.filter = null
        blurred.classList.remove("antihate-blurred")
      }
    } else if (message.command === "AntiHateTurnedOn") {
      isOn = true;
      main();
    }
  });
})()