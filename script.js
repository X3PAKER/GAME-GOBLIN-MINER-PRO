const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ymToken = 0;
let power = 1;
let upgradeCost = 10;

// load animation image
const goblinImg = new Image();
goblinImg.src = "https://i.imgur.com/aZxSVmY.png"; // ảnh nhân vật goblin đào

let frame = 0;

// animation loop
function drawGoblin() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sx = (frame % 4) * 64; // sprite 4 khung
  ctx.drawImage(goblinImg, sx, 0, 64, 64, 120, 120, 64, 64);
  frame++;
  requestAnimationFrame(drawGoblin);
}
drawGoblin();

// cập nhật UI
function updateUI() {
  document.getElementById("ymBalance").textContent = ymToken;
  document.getElementById("upgradeCost").textContent = upgradeCost;
}

// đào token
document.getElementById("mineBtn").addEventListener("click", () => {
  ymToken += power;
  updateUI();

  // hiệu ứng rung nhẹ
  canvas.style.transform = "scale(1.05)";
  setTimeout(() => canvas.style.transform = "scale(1)", 100);
});

// nâng cấp
document.getElementById("upgradeBtn").addEventListener("click", () => {
  if (ymToken >= upgradeCost) {
    ymToken -= upgradeCost;
    power += 1;
    upgradeCost = Math.floor(upgradeCost * 1.6);
    updateUI();
  } else {
    alert("Không đủ YM Token!");
  }
});

updateUI();
