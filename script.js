:root{
  --bg:#f7fafc; --card:#ffffff; --muted:#6b7280; --accent:#f59e0b; --accent-2:#06b6d4;
  --glass: rgba(255,255,255,0.7);
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter, system-ui, Arial, sans-serif;background:linear-gradient(180deg,#eff6ff,#ffffff);color:#0f172a}
.topbar{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:linear-gradient(90deg,#ffffffaa, #ffffff);border-bottom:1px solid #e6eef8;position:sticky;top:0;z-index:10}
.brand{font-weight:700}
.muted{color:var(--muted)}
.small{font-size:13px}
.wrap{display:flex;gap:18px;max-width:1200px;margin:18px auto;padding:0 12px}
#game-stage{flex:1;background:linear-gradient(180deg,#cffafe,#e6f6ff);border-radius:14px;box-shadow:0 8px 30px rgba(2,6,23,0.06);padding:18px;min-height:640px}
.panel{width:360px;background:var(--card);border-radius:12px;padding:16px;box-shadow:0 6px 20px rgba(2,6,23,0.06);height:fit-content}
.stat{display:flex;justify-content:space-between;align-items:center;padding:10px 0}
.label{color:#374151}
.value{font-weight:700;font-size:20px}
.muted.small{margin-bottom:12px}
.actions{display:flex;gap:8px;margin-top:10px}
button{border:0;padding:10px 12px;border-radius:10px;cursor:pointer;font-weight:600}
.primary{background:linear-gradient(90deg,var(--accent),#fb923c);color:#fff}
.secondary{background:#eef2ff;color:#1e293b}
.small-btn{background:#111827;color:#fff;padding:8px 10px;border-radius:8px;margin-left:8px}
.upgrade-list{margin-top:12px}
.upgrade{display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:8px;background:linear-gradient(180deg,#ffffff,#fbfbfb);margin-bottom:8px;border:1px solid #f1f5f9}
.u-title{font-weight:600}
.u-desc{font-size:13px;color:var(--muted)}
.u-action .buy{background:linear-gradient(90deg,#06b6d4,#06b6d4);color:white;padding:8px 10px;border-radius:8px}
input, select{width:100%;padding:8px;border-radius:8px;border:1px solid #e6eef8;margin-top:8px}
.log{max-height:120px;overflow:auto;background:#f8fafc;padding:8px;border-radius:8px;margin-top:8px;border:1px dashed #e6eef8;font-size:13px}
.footer{max-width:1200px;margin:12px auto;text-align:center;color:var(--muted);padding-bottom:30px}
#phaser-container{width:100%;height:560px;border-radius:10px;overflow:hidden;position:relative}
@media(max-width:980px){.wrap{flex-direction:column;padding:12px}.panel{width:100%}}
