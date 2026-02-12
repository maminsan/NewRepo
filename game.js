const state = {
  inNight: false,
  timeMinutes: 0,
  battery: 100,
  musicBox: 100,
  currentCamera: "Cam 01",
  isMasked: false,
  threatLevel: 0,
  intervalId: null,
};

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const howToPanel = document.getElementById("howToPanel");
const startNightBtn = document.getElementById("startNightBtn");
const howToBtn = document.getElementById("howToBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");

const clockEl = document.getElementById("clock");
const batteryEl = document.getElementById("battery");
const officeView = document.getElementById("officeView");
const officeMessage = document.getElementById("officeMessage");
const threatIndicator = document.getElementById("threatIndicator");

const toggleCameraBtn = document.getElementById("toggleCameraBtn");
const cameraPanel = document.getElementById("cameraPanel");
const closeCameraBtn = document.getElementById("closeCameraBtn");
const cameraGrid = document.getElementById("cameraGrid");

const flashlightBtn = document.getElementById("flashlightBtn");
const maskBtn = document.getElementById("maskBtn");
const maskPanel = document.getElementById("maskPanel");
const removeMaskBtn = document.getElementById("removeMaskBtn");
const windMusicBoxBtn = document.getElementById("windMusicBoxBtn");
const musicBoxValue = document.getElementById("musicBoxValue");

const leftVentBtn = document.getElementById("leftVentBtn");
const rightVentBtn = document.getElementById("rightVentBtn");

const nightEndPanel = document.getElementById("nightEndPanel");
const nightEndTitle = document.getElementById("nightEndTitle");
const nightEndText = document.getElementById("nightEndText");

const cameraNames = [
  "Cam 01",
  "Cam 02",
  "Cam 03",
  "Cam 04",
  "Cam 05",
  "Prize Corner",
  "Left Vent",
  "Right Vent",
];

function renderCameraGrid() {
  cameraGrid.innerHTML = "";

  cameraNames.forEach((name) => {
    const el = document.createElement("button");
    el.className = `camera-cell btn ${name === state.currentCamera ? "active" : ""}`;
    el.textContent = name;
    el.addEventListener("click", () => {
      state.currentCamera = name;
      officeMessage.textContent = `Просмотр: ${name}`;
      renderCameraGrid();
    });
    cameraGrid.appendChild(el);
  });
}

function formatClock(minutes) {
  if (minutes >= 360) {
    return "6:00 AM";
  }

  const total = minutes;
  const hour = 12 + Math.floor(total / 60);
  const displayHour = hour > 12 ? hour - 12 : hour;
  const mins = String(total % 60).padStart(2, "0");

  return `${displayHour}:${mins} AM`;
}

function randomThreatPulse() {
  const baseChance = 0.14;
  const additional = state.timeMinutes / 500;
  if (Math.random() < baseChance + additional) {
    state.threatLevel = Math.min(100, state.threatLevel + 20);
  } else {
    state.threatLevel = Math.max(0, state.threatLevel - 8);
  }

  if (state.musicBox < 30) {
    state.threatLevel = Math.min(100, state.threatLevel + 6);
  }

  const threatInOffice = state.threatLevel >= 70;
  threatIndicator.style.display = threatInOffice ? "block" : "none";

  if (threatInOffice && !state.isMasked) {
    officeMessage.textContent = "Кто-то близко... Надень маску!";
    officeView.classList.add("danger");
  } else {
    officeView.classList.remove("danger");
  }
}

function updateHud() {
  clockEl.textContent = formatClock(state.timeMinutes);
  batteryEl.textContent = `${Math.max(0, Math.round(state.battery))}%`;
  musicBoxValue.textContent = `${Math.round(state.musicBox)}%`;
}

function endNight(success) {
  state.inNight = false;
  clearInterval(state.intervalId);
  nightEndPanel.classList.remove("hidden");

  if (success) {
    nightEndTitle.textContent = "6:00 AM";
    nightEndText.textContent = "Ночь 1 пройдена! Это пока заготовка геймплея.";
    officeView.classList.remove("danger");
    officeView.classList.add("safe");
  } else {
    nightEndTitle.textContent = "Game Over";
    nightEndText.textContent = "В этой версии нет скримеров, но это поражение.";
  }
}

function gameTick() {
  if (!state.inNight) {
    return;
  }

  state.timeMinutes += 1;
  state.musicBox = Math.max(0, state.musicBox - 1.2);
  state.battery = Math.max(0, state.battery - 0.18);

  randomThreatPulse();

  if (state.timeMinutes >= 360) {
    endNight(true);
  }

  if (state.battery <= 0 || (!state.isMasked && state.threatLevel >= 100)) {
    endNight(false);
  }

  updateHud();
}

function startNight() {
  state.inNight = true;
  state.timeMinutes = 0;
  state.battery = 100;
  state.musicBox = 100;
  state.currentCamera = "Cam 01";
  state.isMasked = false;
  state.threatLevel = 0;

  nightEndPanel.classList.add("hidden");
  cameraPanel.classList.add("hidden");
  maskPanel.classList.add("hidden");
  officeView.classList.remove("masked", "danger", "safe");
  officeMessage.textContent = "Тихо... пока что.";
  threatIndicator.style.display = "none";

  startScreen.classList.remove("active");
  gameScreen.classList.add("active");

  updateHud();
  renderCameraGrid();

  clearInterval(state.intervalId);
  state.intervalId = setInterval(gameTick, 1000);
}

function backToMenu() {
  clearInterval(state.intervalId);
  state.inNight = false;
  gameScreen.classList.remove("active");
  startScreen.classList.add("active");
}

howToBtn.addEventListener("click", () => {
  howToPanel.classList.toggle("hidden");
});

startNightBtn.addEventListener("click", startNight);
backToMenuBtn.addEventListener("click", backToMenu);

toggleCameraBtn.addEventListener("click", () => {
  cameraPanel.classList.toggle("hidden");
  renderCameraGrid();
});

closeCameraBtn.addEventListener("click", () => {
  cameraPanel.classList.add("hidden");
});

flashlightBtn.addEventListener("click", () => {
  if (!state.inNight || state.battery <= 0) {
    return;
  }

  state.battery = Math.max(0, state.battery - 2.8);
  officeView.classList.remove("flash");
  void officeView.offsetWidth;
  officeView.classList.add("flash");
  officeMessage.textContent = "Фонарик осветил коридор...";
  updateHud();
});

maskBtn.addEventListener("click", () => {
  state.isMasked = true;
  maskPanel.classList.remove("hidden");
  officeView.classList.add("masked");
  officeMessage.textContent = "Маска надета.";
});

removeMaskBtn.addEventListener("click", () => {
  state.isMasked = false;
  maskPanel.classList.add("hidden");
  officeView.classList.remove("masked");
  officeMessage.textContent = "Маска снята.";
});

windMusicBoxBtn.addEventListener("click", () => {
  if (!state.inNight) {
    return;
  }
  state.musicBox = Math.min(100, state.musicBox + 25);
  officeMessage.textContent = "Музыкальная шкатулка заведена.";
  updateHud();
});

function handleVentCheck(side) {
  if (!state.inNight) {
    return;
  }

  const risk = Math.random();
  if (risk > 0.67) {
    state.threatLevel = Math.max(0, state.threatLevel - 15);
    officeMessage.textContent = `${side}: чисто.`;
  } else {
    state.threatLevel = Math.min(100, state.threatLevel + 10);
    officeMessage.textContent = `${side}: слышны шаги...`;
  }
}

leftVentBtn.addEventListener("click", () => handleVentCheck("Левая вентиляция"));
rightVentBtn.addEventListener("click", () => handleVentCheck("Правая вентиляция"));
