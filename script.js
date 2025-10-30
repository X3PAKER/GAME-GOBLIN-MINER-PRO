let tokenCount = 0;

const pickaxe = document.getElementById("pickaxe");
const coin = document.getElementById("coin");
const mineBtn = document.getElementById("mineBtn");
const tokenDisplay = document.getElementById("tokenCount");

mineBtn.addEventListener("click", () => {
  // Rìu chuyển động
  pickaxe.style.transform = "translate(-50%, -50%) rotate(-45deg)";
  setTimeout(() => {
    pickaxe.style.transform = "translate(-50%, -50%) rotate(0deg)";
  }, 200);

  // Hiệu ứng token bay lên
  coin.classList.remove("fly");
  void coin.offsetWidth; // reset animation
  coin.classList.add("fly");

  // Cộng token
  tokenCount++;
  tokenDisplay.textContent = tokenCount;
});
