const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mineBtn = document.getElementById("mineBtn");
const ymBalance = document.getElementById("ymBalance");
let ym = 0;

const pickaxeImg = new Image();
pickaxeImg.src = "pickaxe.png";

const chestImg = new Image();
chestImg.src = "chest.png";

const tokenImg = new Image();
tokenImg.src = "token.png";

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(chestImg, 100, 130, 100, 70);
  ctx.drawImage(pickaxeImg, 120, 60, 60, 60);
}

drawScene();

function animatePickaxe() {
  let angle = 0;
  const swing = setInterval(() => {
    drawScene();
    ctx.save();
    ctx.translate(150, 90);
    ctx.rotate(Math.sin(angle) * 0.3);
    ctx.drawImage(pickaxeImg, -30, -30, 60, 60);
    ctx.restore();
    angle += 0.2;
    if (angle > Math.PI) clearInterval(swing);
  }, 50);
}

function spawnToken() {
  const token = document.createElement("div");
  token.classList.add("token");
  token.innerText = "+1 YM";
  token.style.left = Math.random() * 200 + "px";
  token.style.top = "150px";
  document.body.appendChild(token);
  setTimeout(() => token.remove(), 1000);
}

mineBtn.addEventListener("click", () => {
  animatePickaxe();
  spawnToken();
  ym++;
  ymBalance.innerText = ym;
});
