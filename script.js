// CONFIG: đổi URL backend nếu deploy khác
const API_BASE = "https://YOUR_BACKEND_URL"; // <-- sau khi deploy backend, thay vào

// state lưu local
let state = { ym:0, usdt:0 };
const el = id => document.getElementById(id);

// UI refs
const ymEl = el('ym'), usdtEl = el('usdt'), mineBtn = el('mineBtn'), convertBtn = el('convertBtn'),
      withdrawCreateBtn = el('withdrawCreateBtn'), withdrawAddress = el('withdrawAddress'),
      withdrawNetwork = el('withdrawNetwork'), withdrawPass = el('withdrawPass'),
      requestsEl = el('requests'), refreshList = el('refreshList');

function loadState(){ try{ const r = localStorage.getItem('gm_state'); if(r) state = JSON.parse(r);}catch(e){} updateUI(); }
function saveState(){ localStorage.setItem('gm_state', JSON.stringify(state)); }

function updateUI(){
  ymEl.innerText = Math.floor(state.ym);
  usdtEl.innerText = state.usdt.toFixed(3);
}

// simple mining animation & logic
mineBtn.addEventListener('click', ()=>{
  state.ym += 1;
  // spawn visual token floating
  spawnToken("+1 YM");
  saveState(); updateUI();
});

// convert YM to USDT in-game (uses rate 1YM=0.001USDT)
convertBtn.addEventListener('click', ()=>{
  const ym = Math.floor(state.ym);
  if(ym<=0) return alert('Không có YM');
  const usdt = ym * 0.001;
  state.ym -= ym; state.usdt += usdt; saveState(); updateUI();
  alert(`Đã đổi ${ym} YM → ${usdt.toFixed(3)} USDT (in-game)`);
});

// create withdraw request -> POST to backend
withdrawCreateBtn.addEventListener('click', async ()=>{
  const addr = withdrawAddress.value.trim(); const net = withdrawNetwork.value;
  const pass = withdrawPass.value.trim();
  if(!addr) return alert('Nhập địa chỉ rút');
  if(!pass) return alert('Nhập mật khẩu rút (tạo/nhập)');
  if(state.usdt <= 0) return alert('Không có USDT in-game');

  // send to backend
  try{
    const body = { wallet: addr, network: net, amount: state.usdt, pass };
    const res = await fetch(`${API_BASE}/api/withdraw`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body)});
    const j = await res.json();
    if(res.ok){ state.usdt = 0; saveState(); updateUI(); alert('Tạo yêu cầu rút thành công'); fetchRequests(); }
    else alert('Lỗi: ' + (j.message||res.statusText));
  }catch(e){ alert('Lỗi gửi yêu cầu: ' + e.message); }
});

// admin: get list requests
refreshList.addEventListener('click', fetchRequests);
async function fetchRequests(){
  try{
    const res = await fetch(`${API_BASE}/api/withdraws`);
    const j = await res.json();
    if(!res.ok){ requestsEl.innerText = 'Error'; return; }
    requestsEl.innerHTML = j.map(r=>`<div style="padding:8px;border-bottom:1px solid #f1f1f1">
      <div><b>${r.id}</b> - ${r.amount} USDT - ${r.wallet} (${r.network})</div>
      <div>${r.status} • ${r.createdAt}</div>
      <div style="margin-top:6px"><button data-id="${r.id}" class="mark">Đã chuyển</button></div>
    </div>`).join('');
    document.querySelectorAll('.mark').forEach(b=>b.addEventListener('click', async (ev)=>{
      const id = b.getAttribute('data-id');
      const res2 = await fetch(`${API_BASE}/api/admin/mark/${id}`, {method:'POST'});
      if(res2.ok) fetchRequests(); else alert('Fail');
    }));
  }catch(e){ requestsEl.innerText = 'Fetch error'; }
}

// small token spawn visual
function spawnToken(text){
  const node = document.createElement('div');
  node.innerText = text; node.style.position='fixed'; node.style.left = (50+Math.random()*20)+'%';
  node.style.top = '50%'; node.style.transform='translate(-50%,-50%)'; node.style.background='gold';
  node.style.padding='6px 10px'; node.style.borderRadius='8px'; node.style.fontWeight='700';
  document.body.appendChild(node);
  node.animate([{opacity:1, transform:'translate(-50%,-50%)'},{opacity:0, transform:'translate(-50%,-200%)'}], {duration:900, easing:'ease-out'});
  setTimeout(()=>node.remove(),900);
}

// init
loadState();
fetchRequests(); // optional
