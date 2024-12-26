const SOUND_SETTINGS_KEY = "SOUND-SETTINGS-KEY-BLACKJACK";
let SOUND = localStorage.getItem(SOUND_SETTINGS_KEY) === "true";

const soundButton = document.querySelector(".sound-button");
const soundOffSvg = document.querySelector(".sound-off-svg");
const soundOnSvg = document.querySelector(".sound-on-svg");

document.addEventListener("DOMContentLoaded", function () {
  if (SOUND) {
    soundOffSvg.style.display = "none";
    soundOnSvg.style.display = "block";
  } else {
    soundOffSvg.style.display = "block";
    soundOnSvg.style.display = "none";
  }

  if (window.location.pathname.includes("multi-player.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdQuery = urlParams.get("gameId");

    if (gameIdQuery && gameIdQuery.length >= 10) {
      if (multiPlayerOption) {
        multiPlayerOption.style.display = "none";
      }
      if (multiPlayerForm) {
        multiPlayerForm.style.display = "block";
      }
      if (inviteCode) {
        inviteCode.style.display = "block";
        inviteCode.required = true;
        inviteCode.value = gameIdQuery;
      }
    }
  }
});

// Home page sound toggle

soundButton.addEventListener("click", () => {
  SOUND = !SOUND;
  localStorage.setItem(SOUND_SETTINGS_KEY, SOUND);
  if (SOUND) {
    soundOffSvg.style.display = "none";
    soundOnSvg.style.display = "block";
  } else {
    soundOffSvg.style.display = "block";
    soundOnSvg.style.display = "none";
  }
});

// card shuffliing animation

const backButton = document.querySelector(".back-button");
// Multiplayer buttons functions
const beHost = document.querySelector("#be-host");
const amInvited = document.querySelector("#am-invited");
const multiPlayerOption = document.querySelector(".multiplayer-options");
const multiPlayerForm = document.querySelector(".multiplayer-form");
const inviteCode = document.querySelector(".invite-code");

backButton?.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the default link behavior
  //prod-commented console.log(multiPlayerForm);
  if (
    multiPlayerForm &&
    multiPlayerForm.style.display !== "none" &&
    multiPlayerForm.style.display !== "hidden"
  ) {
    if (multiPlayerOption) {
      multiPlayerOption.style.display = "block";
    }
    multiPlayerForm.style.display = "none";
    return;
  }
  window.history.back(); // Go back to the previous page
});

beHost?.addEventListener("click", () => {
  if (multiPlayerOption) {
    multiPlayerOption.style.display = "none";
  }
  if (multiPlayerForm) {
    multiPlayerForm.style.display = "block";
  }
  if (inviteCode) {
    inviteCode.style.display = "none";
    inviteCode.required = false;
  }
});

amInvited?.addEventListener("click", () => {
  if (multiPlayerOption) {
    multiPlayerOption.style.display = "none";
  }
  if (multiPlayerForm) {
    multiPlayerForm.style.display = "block";
  }

  if (inviteCode) {
    inviteCode.style.display = "block";
    inviteCode.required = true;
  }
});

multiPlayerForm?.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the default form submission
  // Add your form submission logic here
  const textInputs = this.querySelectorAll('input[type="text"]');

  // Create an object to store the name-value pairs
  const formData = {};

  // Populate the object with input names as keys and their values
  textInputs.forEach((input) => {
    if (input?.name?.length) {
      formData[input.name] = input.value;
    }
    input.value = "";
  });
  const name = formData.name;
  const code = formData.code;

  if (code) {
    sessionStorage.setItem("blackJack-playerName", name);
    sessionStorage.setItem("blackJack-playerCode", code);
    window.location.href = "multi-game.html";
  } else {
    sessionStorage.setItem("blackJack-playerName", name);
    sessionStorage.removeItem("blackJack-playerCode");
    window.location.href = "multi-game.html";
  }
  const prevText = this.querySelector('button[type="submit"]').textContent;
  this.querySelector('button[type="submit"] span').textContent =
    "Redirecting...";
  setTimeout(() => {
    this.querySelector('button[type="submit"] span').textContent = prevText;
  }, 100);
  textInputs.forEach((input) => {
    input.value = "";
  });
});

// Function to load CSS dynamically
function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

// Function to load JS dynamically
function loadJS(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback; // Optional: Run a callback after loading
  document.body.appendChild(script);
}

// Load Toastify CSS and JS
loadCSS("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");
loadJS("https://cdn.jsdelivr.net/npm/toastify-js", () => {
  // Callback to ensure Toastify.js is loaded before using it
  //prod-commented console.log("Toastify loaded!");
});

// Example toast function
function showToast(message, options) {
  const { duration, gravity, position, backgroundColor } = options ?? {};
  Toastify({
    text: message,
    duration: duration ?? 2000,
    gravity: gravity ?? "top",
    position: position ?? "right",
    backgroundColor:
      backgroundColor ?? "linear-gradient(to right, #4caf50, #8bc34a)",
    stopOnFocus: true,
  }).showToast();
}
