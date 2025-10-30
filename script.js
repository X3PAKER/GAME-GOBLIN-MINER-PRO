/* Goblin Miner — Forest (mini app)
   - Canvas animation: goblin, pickaxe swing, particles token
   - YM accrual automatic + manual click
   - Upgrades (picks) with purchase limits
   - Convert YM→USDT (in-game), withdraw request with password
   - LocalStorage saves state
   - Music toggle (simple synth)
   - Optimized for mobile/Telegram mini app
*/

// ---------- CONFIG ----------
const CONFIG = {
  YM_TO_USDT: 0.001,
  WITHDRAW_FEE: 0.8,
  BASE_RATE: 0.5, // YM per second
  BOOST_COST: 50,
  BOOST_DURATION_MS: 30_000,
  PICKS: [
    {id:'pick_c', name:'Cuốc Gỗ (C)', price:0, days:28, limit:1, factor:1},
    {id:'pick_b', name:'Cuốc Sắt (B)', price:10, days:28, limit:2, factor:1.5},
    {id:'pick_a', name:'Cuốc Vàng (A)', price:30, days:28, limit:2, factor:2.5},
    {id:'pick_s', name:'Cuốc Bạch Kim (S)', price:80, days:28, limit:2, factor:5},
    {id:'pick_ur', name:'Cuốc Kim Cương (UR)', price:150, days:30, limit:-1, factor:12}
  ]
};

// ---------- STATE ----------
let state = {
  ym: 0,
  usdt: 0,
  rate: CONFIG.BASE_RATE,
  multiplier: 1,
  picks: {},      // id -> [{boughtAt, expiresAt}]
  withdrawPass: null,
  withdrawLog: [],
};

// storage helpers
const STORAGE_KEY = 'goblin_forest_v1';
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw) {
    try { Object.assign(state, JSON.parse(raw)); }
    catch(e){ console.warn('load fail', e); }
  }
  CONFIG.PICKS.forEach(p => { if(!Array.isArray(state.picks[p.id])) state.picks[p.id]=[]; });
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// UI refs
const ymEl = ()=>document.getElementById('ym');
const usdtEl = ()=>document.getElementById('usdt');
const rateEl = ()=>document.getElementById('rate');
const upgradesEl = ()=>document.getElementById('upgrades');
const withdrawLogEl = ()=>document.getElementById('withdrawLog');

// ---------- GAME LOGIC ----------
function recalcRate(){
  let extraPerSec = 0;
  CONFIG.PICKS.forEach(p=>{
    const list = state.picks[p.id] || [];
    list.forEach(inst => {
      if(Date.now() < inst.expiresAt) {
        // approximate: factor * baseline per day -> convert to per second
        const basePerDay = 1000 / p.days; // baseline concept: 1000 YM ~ 1$
        extraPerSec += (basePerDay * p.factor) / 86400;
      }
    });
  });
  state.rate = CONFIG.BASE_RATE + extraPerSec;
}

function renderUpgrades(){
  upgradesEl().innerHTML = '';
  CONFIG.PICKS.forEach(def=>{
    const div = document.createElement('div'); div.className='upgrade';
    const owned = (state.picks[def.id]||[]).filter(i=>Date.now()<i.expiresAt).length;
    const left = def.limit === -1 ? '∞' : Math.max(0, def.limit - owned);
    div.innerHTML = `<div><div style="font-weight:700">${def.name}</div>
      <div class="muted small">${def.price>0?def.price+'$':'Miễn phí'} • ${def.days} ngày • Sở hữu: ${owned}</div></div>
      <div style="text-align:right"><div class="muted small">Còn: ${left}</div>
        <div style="margin-top:6px"><button class="btn small buy">${def.price>0?'Mua':'Sở hữu'}</button></div></div>`;
    div.querySelector('.buy').addEventListener('click', ()=> buyPick(def.id));
    upgradesEl().appendChild(div);
  });
}

function buyPick(id){
  const def = CONFIG.PICKS.find(p=>p.id===id);
  if(!def) return;
  const owned = (state.picks[id]||[]).filter(i=>Date.now()<i.expiresAt).length;
  if(def.limit !== -1 && owned >= def.limit) return alert('Đã đạt giới hạn gói này');
  if(def.price > 0){
    if(state.usdt < def.price) return alert('Không đủ USDT (đổi YM→USDT trước)');
    state.usdt -= def.price;
  }
  const now = Date.now(); const expiresAt = now + def.days*24*3600*1000;
  state.picks[id].push({boughtAt: now, expiresAt});
  recalcRate(); saveState(); updateUI(); renderUpgrades();
  alert('Mua thành công: ' + def.name);
}

// Convert YM to USDT (in-game)
document.getElementById('convertBtn').addEventListener('click', ()=>{
  const ym = Math.floor(state.ym);
  if(ym <= 0) return alert('Không có YM để đổi');
  const usdt = ym * CONFIG.YM_TO_USDT;
  state.ym -= ym; state.usdt += usdt; saveState(); updateUI();
  alert(`Đã đổi ${ym} YM → ${usdt.toFixed(3)} USDT (in-game)`);
});

// Boost
document.getElementById('boostBtn').addEventListener('click', ()=>{
  if(state.ym < CONFIG.BOOST_COST) return alert('Cần 50 YM để kích hoạt boost');
  state.ym -= CONFIG.BOOST_COST; state.multiplier = 2; saveState(); updateUI();
  setTimeout(()=>{ state.multiplier = 1; saveState(); updateUI(); alert('Boost kết thúc'); }, CONFIG.BOOST_DURATION_MS);
});

// Claim (daily) - demo just message (cooldown could be implemented)
document.getElementById('claimBtn').addEventListener('click', ()=> {
  alert('Claim (demo): YM được cộng tự động theo thời gian. Claim hàng ngày cần backend.');
});

// Withdraw password set
document.getElementById('setPass').addEventListener('click', ()=>{
  const pass = document.getElementById('withdrawPass').value.trim();
  if(!pass) return alert('Nhập mật khẩu rút vào ô trên');
  state.withdrawPass = pass; saveState(); alert('Mật khẩu rút đã tạo / đổi');
});

// Create withdraw request
document.getElementById('withdrawReq').addEventListener('click', ()=>{
  const addr = document.getElementById('withdrawAddress').value.trim();
  const passInput = document.getElementById('withdrawPass').value.trim();
  const network = document.getElementById('network').value;
  if(!addr) return alert('Nhập địa chỉ rút');
  if(!state.withdrawPass) return alert('Bạn chưa tạo mật khẩu rút');
  if(passInput !== state.withdrawPass) return alert('Mật khẩu rút sai');
  if(state.usdt <= 0) return alert('Không có USDT để rút');
  const amount = state.usdt; state.usdt = 0;
  const afterFee = Math.max(0, amount - CONFIG.WITHDRAW_FEE);
  const text = `Rút ${amount.toFixed(3)} → ${addr} (${network}) • Sau phí ${afterFee.toFixed(3)} USDT • PENDING`;
  state.withdrawLog.unshift({t: new Date().toLocaleString(), text});
  saveState(); updateUI();
  alert('Yêu cầu rút đã tạo. Admin duyệt thủ công.');
});

// ---------- MUSIC (simple synth) ----------
let audioCtx=null, osc=null; let musicOn=true;
function startMusic(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(osc) return;
    osc = audioCtx.createOscillator();
    const g = audioCtx.createGain(); g.gain.value = 0.02;
    osc.connect(g); g.connect(audioCtx.destination);
    osc.type='sine'; osc.frequency.value = 220; osc.start();
  }catch(e){}
}
function stopMusic(){ try{ if(osc){osc.stop(); osc=null;} }catch(e){}}
document.getElementById('musicToggle').addEventListener('click', ()=>{
  musicOn = !musicOn; document.getElementById('musicToggle').innerText = 'Nhạc: ' + (musicOn ? 'ON' : 'OFF');
  if(musicOn) startMusic(); else stopMusic();
});
if(musicOn) startMusic();

// ---------- UI update ----------
function updateUI(){
  ymEl().innerText = Math.floor(state.ym);
  usdtEl().innerText = state.usdt.toFixed(3);
  rateEl().innerText = (state.rate * state.multiplier).toFixed(3);
  withdrawLogEl().innerHTML = state.withdrawLog.map(l=>`<div>• ${l.t} — ${l.text}</div>`).join('');
}

// ---------- ANIMATION (Canvas) ----------
// We'll draw a simple goblin + pick + particles
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// resize canvas to container
function fitCanvas(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
window.addEventListener('resize', fitCanvas);

// simple particle system
let particles = [];

function spawnParticle(x,y,dx,dy,color,size,life=900){
  particles.push({x,y,dx,dy,color,size,life,age:0});
}

// draw goblin head & pick procedural
let gob = {x:300, y:300, bob:0};
let pick = {angle: -22};

function drawGoblinScene(){
  // background soft gradient
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  // sky gradient
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#dffaf1'); g.addColorStop(1,'#e6f6ff');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

  // hills
  ctx.fillStyle = '#9fe6b8';
  for(let i=0;i<6;i++){
    const cx = (i*140) + 60;
    ctx.beginPath(); ctx.moveTo(cx-60,h/2+20); ctx.lineTo(cx,h/2-40); ctx.lineTo(cx+60,h/2+20); ctx.closePath();
    ctx.fill();
  }

  // ground
  ctx.fillStyle = '#6bd19b'; ctx.fillRect(0,h-120,w,120);

  // draw goblin body (simple)
  const gx = gob.x, gy = gob.y + Math.sin(gob.bob)*6;
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(gx,gy+46,40,12,0,0,Math.PI*2); ctx.fill();
  // body
  ctx.fillStyle = '#9be6a8'; ctx.beginPath(); ctx.ellipse(gx,gy,28,26,0,0,Math.PI*2); ctx.fill();
  // hat
  ctx.fillStyle = '#6b4e3a'; ctx.fillRect(gx-22,gy-36,44,16);
  ctx.fillStyle = '#fff'; ctx.fillRect(gx-16,gy-32,32,6);
  // nose
  ctx.fillStyle = '#f4a0a0'; ctx.beginPath(); ctx.ellipse(gx,gy,6,4,0,0,Math.PI*2); ctx.fill();
  // eyes
  ctx.fillStyle = '#1f2937'; ctx.fillRect(gx-8,gy-6,4,4); ctx.fillRect(gx+4,gy-6,4,4);

  // draw pickaxe (rotating)
  ctx.save();
  ctx.translate(gx+36,gy-20);
  ctx.rotate((pick.angle*Math.PI)/180);
  ctx.fillStyle='#6b4e3a'; ctx.fillRect(-4,-2,8,48);
  ctx.fillStyle='#c9c9c9'; ctx.fillRect(-18,-18,36,8);
  ctx.restore();

  // draw particles (tokens)
  particles.forEach(p=>{
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
  });
}

// particle update
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.age += dt;
    p.x += p.dx * dt/16;
    p.y += p.dy * dt/16 + 0.12;
    p.size *= 0.995;
    if(p.age > p.life) particles.splice(i,1);
  }
}

// mining accrual per second (using setInterval)
setInterval(()=> {
  state.ym += state.rate * state.multiplier;
  saveState();
  updateUI();
}, 1000);

// manual mine (click goblin area)
canvas.addEventListener('click', (ev)=>{
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left);
  const y = (ev.clientY - rect.top);
  // spawn token burst
  for(let i=0;i<10;i++){
    spawnParticle(x + (Math.random()*40-20), y-30, Math.random()*2-1, -Math.random()*3-2, '#ffd166', 5 + Math.random()*3, 900);
  }
  // add YM
  state.ym += 1 * state.multiplier;
  saveState(); updateUI();
  // pick swing visual
  pick.angle = -70;
  setTimeout(()=> pick.angle = -22, 140);
  // small sound
  if(audioCtx && musicOn){
    const s = audioCtx.createOscillator(), g = audioCtx.createGain();
    s.type='square'; s.frequency.value = 900; g.gain.value = 0.02;
    s.connect(g); g.connect(audioCtx.destination); s.start(); setTimeout(()=> s.stop(), 100);
  }
});

// mine button (click)
document.getElementById('mineBtn').addEventListener('click', ()=>{
  // simulate click in center goblin
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.55;
  // spawn tokens at center of canvas
  for(let i=0;i<12;i++) spawnParticle(rect.width*0.5 + (Math.random()*60-30), rect.height*0.5 - 40, Math.random()*2-1, -Math.random()*3-2, '#ffd166', 5 + Math.random()*3, 900);
  state.ym += 1 * state.multiplier; saveState(); updateUI();
  pick.angle = -70; setTimeout(()=> pick.angle = -22, 140);
});

// ---------- main loop ----------
let last = performance.now();
function loop(now){
  const dt = now - last; last = now;
  gob.bob += dt/300;
  updateParticles(dt);
  drawGoblinScene();
  requestAnimationFrame(loop);
}
fitCanvas(); requestAnimationFrame(loop);

// ---------- initialization ----------
loadState(); recalcRate(); renderUpgrades(); updateUI();

// save before unload
window.addEventListener('beforeunload', ()=> saveState());

// Telegram hint button
document.getElementById('openInfo').addEventListener('click', ()=>{
  alert('Gắn URL vào BotFather → Menu Button → Web App URL để mở trong Telegram.');
});
