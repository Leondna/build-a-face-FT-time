const faceColor = document.getElementById("faceColor");
const mouthCurve = document.getElementById("mouthCurve");
const eyeOpen = document.getElementById("eyeOpen");
const browTilt = document.getElementById("browTilt");
const blushLevel = document.getElementById("blushLevel");
const lookDirection = document.getElementById("lookDirection");

const mouth = document.getElementById("mouth");
const lidLeft = document.getElementById("lidLeft");
const lidRight = document.getElementById("lidRight");
const browLeft = document.getElementById("browLeft");
const browRight = document.getElementById("browRight");
const pupilLeft = document.getElementById("pupilLeft");
const pupilRight = document.getElementById("pupilRight");
const cheekLeft = document.getElementById("cheekLeft");
const cheekRight = document.getElementById("cheekRight");
const moodName = document.getElementById("moodName");
const exportNote = document.getElementById("exportNote");

const randomBtn = document.getElementById("randomBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const exportCanvas = document.getElementById("exportCanvas");

function getState() {
  return {
    color: faceColor.value,
    mouth: Number(mouthCurve.value),
    eyes: Number(eyeOpen.value),
    brows: Number(browTilt.value),
    blush: Number(blushLevel.value),
    look: Number(lookDirection.value)
  };
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function darkenColor(hex, factor = 0.78) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)}, 0.35)`;
}

function applyFaceColor(color) {
  document.documentElement.style.setProperty("--face-yellow", color);
  document.documentElement.style.setProperty("--face-shadow", darkenColor(color));
}

function updateFace() {
  const state = getState();

  applyFaceColor(state.color);
  updateMouth(state.mouth);
  updateEyes(state.eyes);
  updateBrows(state.brows);
  updateBlush(state.blush);
  updateLook(state.look);

  moodName.textContent = getMoodLabel(state);
}

function updateMouth(value) {
  const intensity = Math.abs(value) / 100;
  const mouthHeight = 20 + intensity * 45;

  mouth.style.width = "110px";
  mouth.style.height = `${mouthHeight}px`;

  if (value >= 0) {
    mouth.style.borderBottom = "6px solid #222";
    mouth.style.borderTop = "none";
    mouth.style.borderRadius = `0 0 ${90 + intensity * 20}px ${90 + intensity * 20}px`;
    mouth.style.transform = "translateX(-50%)";
  } else {
    mouth.style.borderBottom = "none";
    mouth.style.borderTop = "6px solid #222";
    mouth.style.borderRadius = `${90 + intensity * 20}px ${90 + intensity * 20}px 0 0`;
    mouth.style.transform = "translateX(-50%) translateY(18px)";
  }
}

function updateEyes(value) {
  const lidAmount = 100 - value;
  lidLeft.style.height = `${lidAmount}%`;
  lidRight.style.height = `${lidAmount}%`;
}

function updateBrows(value) {
  browLeft.style.transform = `rotate(${value}deg)`;
  browRight.style.transform = `rotate(${-value}deg)`;
}

function updateBlush(value) {
  const opacity = Math.max(0.12, value / 100);
  const width = 28 + (value * 0.16);
  const height = 14 + (value * 0.1);

  [cheekLeft, cheekRight].forEach((cheek) => {
    cheek.style.opacity = opacity.toFixed(2);
    cheek.style.width = `${width}px`;
    cheek.style.height = `${height}px`;
    cheek.style.background = `rgba(255, 90, 120, ${Math.max(0.15, value / 180).toFixed(2)})`;
  });
}

function updateLook(value) {
  const offsetX = value * 0.08;
  const offsetY = Math.abs(value) * 0.01;
  pupilLeft.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% - ${offsetY}px))`;
  pupilRight.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% - ${offsetY}px))`;
}

function getMoodLabel(state) {
  const { mouth, eyes, brows, blush, look } = state;

  if (mouth > 55 && blush > 50) return "Delighted";
  if (mouth > 45 && eyes > 65) return "Happy";
  if (mouth > 20 && brows > 15 && Math.abs(look) > 30) return "Curious";
  if (mouth < -45 && brows < -10) return "Upset";
  if (mouth < -20 && eyes < 45) return "Tired";
  if (eyes < 30) return "Sleepy";
  if (brows < -20 && mouth >= 0 && Math.abs(look) > 40) return "Nervous";
  if (brows > 20 && mouth >= 0) return "Interested";
  if (Math.abs(look) > 65) return "Thinking";
  if (mouth < -60) return "Sad";
  if (blush > 70 && mouth >= 0) return "Shy";
  return "Calm";
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor() {
  const hue = Math.floor(Math.random() * 360);
  return hslToHex(hue, 90, 65);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function randomFace() {
  faceColor.value = randomHexColor();
  mouthCurve.value = randomInRange(-100, 100);
  eyeOpen.value = randomInRange(10, 100);
  browTilt.value = randomInRange(-45, 45);
  blushLevel.value = randomInRange(0, 100);
  lookDirection.value = randomInRange(-100, 100);
  updateFace();
}

function resetFace() {
  faceColor.value = "#ffd84d";
  mouthCurve.value = 10;
  eyeOpen.value = 70;
  browTilt.value = 0;
  blushLevel.value = 15;
  lookDirection.value = 0;
  updateFace();
}

function drawFaceToCanvas() {
  const state = getState();
  const mood = getMoodLabel(state);
  const ctx = exportCanvas.getContext("2d");
  const w = exportCanvas.width;
  const h = exportCanvas.height;

  ctx.clearRect(0, 0, w, h);

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#fff7cc");
  gradient.addColorStop(1, "#ffd77a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2 - 20;
  const r = 180;

  ctx.fillStyle = state.color;
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = darkenColor(state.color);
  ctx.beginPath();
  ctx.ellipse(cx, cy + 55, 155, 120, 0, 0, Math.PI);
  ctx.fill();

  const cheekOpacity = Math.max(0.15, state.blush / 180);
  ctx.fillStyle = `rgba(255, 90, 120, ${cheekOpacity})`;
  ellipse(ctx, cx - 118, cy + 55, 34 + state.blush * 0.18, 18 + state.blush * 0.12);
  ellipse(ctx, cx + 118, cy + 55, 34 + state.blush * 0.18, 18 + state.blush * 0.12);

  drawBrow(ctx, cx - 80, cy - 105, 80, state.brows);
  drawBrow(ctx, cx + 80, cy - 105, 80, -state.brows);

  drawEye(ctx, cx - 85, cy - 40, state.eyes, state.look, state.color);
  drawEye(ctx, cx + 85, cy - 40, state.eyes, state.look, state.color);

  drawMouth(ctx, cx, cy + 80, state.mouth);

  ctx.fillStyle = "#2f2a1f";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(mood, w / 2, h - 34);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBrow(ctx, x, y, width, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-width / 2, 0);
  ctx.lineTo(width / 2, 0);
  ctx.stroke();
  ctx.restore();
}

function drawEye(ctx, x, y, openness, look, faceFill) {
  const rx = 28;
  const ry = 28;

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const lidHeight = ((100 - openness) / 100) * (ry * 2);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx - 1, ry - 1, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = faceFill;
  ctx.fillRect(x - rx - 4, y - ry - 4, rx * 2 + 8, lidHeight);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - rx, y - ry + lidHeight);
  ctx.lineTo(x + rx, y - ry + lidHeight);
  ctx.stroke();

  const pupilX = x + look * 0.12;
  const pupilY = y - Math.abs(look) * 0.015 + 4;
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(pupilX, pupilY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMouth(ctx, x, y, curve) {
  const intensity = Math.abs(curve) / 100;
  const width = 110;
  const height = 25 + intensity * 55;

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();

  if (curve >= 0) {
    ctx.moveTo(x - width / 2, y);
    ctx.quadraticCurveTo(x, y + height, x + width / 2, y);
  } else {
    ctx.moveTo(x - width / 2, y + 36);
    ctx.quadraticCurveTo(x, y + 36 - height, x + width / 2, y + 36);
  }

  ctx.stroke();
}

function downloadAsPng() {
  drawFaceToCanvas();
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.download = `emotion-face-${stamp}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
  exportNote.textContent = "PNG downloaded.";
}

[
  faceColor,
  mouthCurve,
  eyeOpen,
  browTilt,
  blushLevel,
  lookDirection
].forEach((input) => {
  input.addEventListener("input", updateFace);
});

randomBtn.addEventListener("click", randomFace);
resetBtn.addEventListener("click", resetFace);
downloadPngBtn.addEventListener("click", downloadAsPng);

updateFace();
