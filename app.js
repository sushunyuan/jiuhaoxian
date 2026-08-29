/* ====================================================================
   九 · 个人工作台  app.js  (纯前端 / 本地优先 / 可配置AI)
==================================================================== */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const LS_KEY = "jiu_workbench_v1";

/* ---------- 日期工具 ---------- */
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayDate = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const TODAY = ymd(todayDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const fmt = s => s; // 已经是 YYYY-MM-DD

/* ---------- 种子数据 ---------- */
const seedTrend = (base, dir) => Array.from({length:7}, (_,i)=> Math.max(10, Math.round(base*(1+dir*(i-3)*0.08)+ (i*7))));
// 抖音热榜由每日自动化从公开热搜源抓取并更新到 hot-douyin.json；此处为离线/本地兜底快照
const DOUYIN_SEED = [
  {id:"d0", t:"认识一座城从老字号招牌开始", heat:"1140万", track:"泛生活", link:"https://www.bing.com/search?q=%E8%AE%A4%E8%AF%86%E4%B8%80%E5%BA%A7%E5%9F%8E%E4%BB%8E%E8%80%81%E5%AD%97%E5%8F%B7%E6%8B%9B%E7%89%8C%E5%BC%80%E5%A7%8B%20%E6%8A%96%E9%9F%B3", up:true, trend:[969,1035,1101,1167,1233,1300,1366]},
  {id:"d1", t:"总有人在付出为什么不能是我呢", heat:"1126万", track:"心理学", link:"https://www.bing.com/search?q=%E6%80%BB%E6%9C%89%E4%BA%BA%E5%9C%A8%E4%BB%98%E5%87%BA%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E8%83%BD%E6%98%AF%E6%88%91%E5%91%A2%20%E6%8A%96%E9%9F%B3", up:true, trend:[957,1022,1088,1153,1218,1284,1349]},
  {id:"d2", t:"一组数据看数智赋能电商经济", heat:"1110万", track:"新闻政策", link:"https://www.bing.com/search?q=%E4%B8%80%E7%BB%84%E6%95%B0%E6%8D%AE%E7%9C%8B%E6%95%B0%E6%99%BA%E8%B5%8B%E8%83%BD%E7%94%B5%E5%95%86%E7%BB%8F%E6%B5%8E%20%E6%8A%96%E9%9F%B3", up:true, trend:[944,1008,1072,1137,1201,1265,1330]},
  {id:"d3", t:"中国U18男篮亚洲杯挺进半决赛", heat:"1110万", track:"体育行业", link:"https://www.bing.com/search?q=%E4%B8%AD%E5%9B%BDU18%E7%94%B7%E7%AF%AE%E4%BA%9A%E6%B4%B2%E6%9D%AF%E6%8C%BA%E8%BF%9B%E5%8D%8A%E5%86%B3%E8%B5%9B%20%E6%8A%96%E9%9F%B3", up:true, trend:[944,1008,1072,1137,1201,1265,1330]},
  {id:"d4", t:"2026成都车展正式开幕", heat:"1054万", track:"数码行业", link:"https://www.bing.com/search?q=2026%E6%88%90%E9%83%BD%E8%BD%A6%E5%B1%95%E6%AD%A3%E5%BC%8F%E5%BC%80%E5%B9%95%20%E6%8A%96%E9%9F%B3", up:true, trend:[896,957,1018,1079,1140,1202,1263]},
  {id:"d5", t:"运油20A歼16等已全部抵达埃及", heat:"1039万", track:"新闻政策", link:"https://www.bing.com/search?q=%E8%BF%90%E6%B2%B920A%E6%AD%BC16%E7%AD%89%E5%B7%B2%E5%85%A8%E9%83%A8%E6%8A%B5%E8%BE%BE%E5%9F%83%E5%8F%8A%20%E6%8A%96%E9%9F%B3", up:true, trend:[883,943,1004,1064,1124,1184,1245]},
  {id:"d6", t:"国际金价重回4600美元", heat:"928万", track:"新闻政策", link:"https://www.bing.com/search?q=%E5%9B%BD%E9%99%85%E9%87%91%E4%BB%B7%E9%87%8D%E5%9B%9E4600%E7%BE%8E%E5%85%83%20%E6%8A%96%E9%9F%B3", up:true, trend:[789,843,896,950,1004,1058,1112]},
  {id:"d7", t:"EDG官宣选手stew正式加盟", heat:"924万", track:"体育行业", link:"https://www.bing.com/search?q=EDG%E5%AE%98%E5%AE%A3%E9%80%89%E6%89%8Bstew%E6%AD%A3%E5%BC%8F%E5%8A%A0%E7%9B%9F%20%E6%8A%96%E9%9F%B3", up:true, trend:[785,839,893,946,1000,1053,1107]},
  {id:"d8", t:"真正的少女心事是环游世界", heat:"916万", track:"心理学", link:"https://www.bing.com/search?q=%E7%9C%9F%E6%AD%A3%E7%9A%84%E5%B0%91%E5%A5%B3%E5%BF%83%E4%BA%8B%E6%98%AF%E7%8E%AF%E6%B8%B8%E4%B8%96%E7%95%8C%20%E6%8A%96%E9%9F%B3", up:true, trend:[779,832,885,938,991,1044,1097]},
  {id:"d9", t:"手指的方向是自由", heat:"915万", track:"心理学", link:"https://www.bing.com/search?q=%E6%89%8B%E6%8C%87%E7%9A%84%E6%96%B9%E5%90%91%E6%98%AF%E8%87%AA%E7%94%B1%20%E6%8A%96%E9%9F%B3", up:false, trend:[1052,1014,975,937,899,860,822]},
  {id:"d10", t:"多家车企启动召回", heat:"912万", track:"数码行业", link:"https://www.bing.com/search?q=%E5%A4%9A%E5%AE%B6%E8%BD%A6%E4%BC%81%E5%90%AF%E5%8A%A8%E5%8F%AC%E5%9B%9E%20%E6%8A%96%E9%9F%B3", up:true, trend:[775,828,881,934,987,1040,1093]},
  {id:"d11", t:"李瑞王明昊101:99绝杀追梦格林", heat:"911万", track:"体育行业", link:"https://www.bing.com/search?q=%E6%9D%8E%E7%91%9E%E7%8E%8B%E6%98%8E%E6%98%8A101%3A99%E7%BB%9D%E6%9D%80%E8%BF%BD%E6%A2%A6%E6%A0%BC%E6%9E%97%20%E6%8A%96%E9%9F%B3", up:false, trend:[1048,1009,971,933,895,856,818]},
  {id:"d12", t:"快递员被罚100元后轻生不实", heat:"910万", track:"新闻政策", link:"https://www.bing.com/search?q=%E5%BF%AB%E9%80%92%E5%91%98%E8%A2%AB%E7%BD%9A100%E5%85%83%E5%90%8E%E8%BD%BB%E7%94%9F%E4%B8%8D%E5%AE%9E%20%E6%8A%96%E9%9F%B3", up:true, trend:[774,826,879,932,985,1037,1090]},
  {id:"d13", t:"我要生气啦", heat:"905万", track:"泛生活", link:"https://www.bing.com/search?q=%E6%88%91%E8%A6%81%E7%94%9F%E6%B0%94%E5%95%A6%20%E6%8A%96%E9%9F%B3", up:false, trend:[1041,1003,965,927,889,851,813]},
  {id:"d14", t:"说唱巅峰嘉宾帮唱赛抢先看", heat:"864万", track:"泛生活", link:"https://www.bing.com/search?q=%E8%AF%B4%E5%94%B1%E5%B7%85%E5%B3%B0%E5%98%89%E5%AE%BE%E5%B8%AE%E5%94%B1%E8%B5%9B%E6%8A%A2%E5%85%88%E7%9C%8B%20%E6%8A%96%E9%9F%B3", up:true, trend:[734,785,835,885,935,985,1035]}
];
const XHS_SEED = [
  {t:"小红书上线跨境平台Redshop", heat:"320万", track:"新闻政策"},
  {t:"AI宠物陪伴机器人种草", heat:"980万", track:"数码行业"},
  {t:"精细护理·头皮养护成新风口", heat:"760万", track:"泛生活"},
  {t:"帕斯蒂尔风妆容刷屏", heat:"540万", track:"泛生活"},
  {t:"「经济上行的美」情绪妆", heat:"430万", track:"心理学"},
  {t:"洞洞鞋夏日穿搭", heat:"410万", track:"泛生活"},
  {t:"水泥麻辣烫探店笔记", heat:"690万", track:"泛生活"},
  {t:"小红书申请REDcafé商标", heat:"260万", track:"新闻政策"},
  {t:"自媒体起号方法论合集", heat:"880万", track:"做自媒体"},
  {t:"运动训练计划模板", heat:"470万", track:"体育行业"}
].map((x,i)=>({id:"x"+i, ...x, link:"https://www.bing.com/search?q="+encodeURIComponent(x.t)+"%20小红书", up:true, trend:seedTrend(55+i*4, i%2?-1:1)}));

const DEFAULT = {
  accounts: [],
  tracks: {
    digital:["参数对比","开箱体验","避坑指南","性价比之王","黑科技冷知识"],
    psychology:["认知偏差","情绪管理","潜意识暗示","人际关系潜规则","拖延破解"],
    media:["起号方法论","爆款公式","人设打造","选题库搭建","评论区运营"],
    sports:["赛事热点","训练计划","装备测评","运动员故事","冷门项目科普"],
    policy:["政策解读","民生利好","行业影响","申报指南","避坑提醒"]
  },
  hot: { douyin: DOUYIN_SEED, xhs: XHS_SEED },
  ai: { apiKey:"", baseUrl:"https://api.openai.com/v1", model:"gpt-4o-mini" },
  hotBaseUrl: "",
  works: [],
  habits: [],
  habitLog: {},
  diary: {},
  chats: {}
};

/* ---------- 持久化 ---------- */
let state;
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){ state = Object.assign({}, DEFAULT, JSON.parse(raw)); 
      // 合并 tracks 缺键
      state.tracks = Object.assign({}, DEFAULT.tracks, state.tracks||{});
      state.hot = Object.assign({}, DEFAULT.hot, state.hot||{});
      state.diary = state.diary||{};
      for(const k in state.diary){ if(typeof state.diary[k]==="string") state.diary[k]=[{id:"di"+Date.now(), text:state.diary[k], t:""}]; }
      return;
    }
  }catch(e){ console.warn("load fail", e); }
  state = JSON.parse(JSON.stringify(DEFAULT));
}
let saveTimer;
function save(){
  try{
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    const pill = $("#saveState");
    pill.textContent = "● 已保存"; pill.className = "sync-pill";
  }catch(e){ showToast("保存失败："+e.message); }
}
function touch(){ const pill=$("#saveState"); pill.textContent="● 保存中…"; pill.className="sync-pill dirty"; clearTimeout(saveTimer); saveTimer=setTimeout(save,400); }

/* ---------- UI 小工具 ---------- */
function showToast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.remove("hidden"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add("hidden"),2200); }
function elFrom(html){ const d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstElementChild; }
function openModal(html, bind){
  const root=$("#modalRoot"); root.innerHTML="";
  const back=elFrom(`<div class="modal-root" id="modalRoot"><div class="sheet"><span class="close">×</span>${html}</div></div>`);
  back.addEventListener("click", e=>{ if(e.target===back||e.target.classList.contains("close")) closeModal(); });
  back.querySelector(".close").addEventListener("click", e=>{ e.stopPropagation(); closeModal(); });
  root.replaceWith(back);
  back.classList.remove("hidden");
  if(bind) bind(back.querySelector(".sheet"));
}
function closeModal(){ const r=$("#modalRoot"); r.classList.add("hidden"); r.innerHTML=""; }
function askConfirm(msg, onYes){
  let box=$("#confirmRoot");
  if(!box){ box=document.createElement("div"); box.id="confirmRoot"; box.className="confirm-root hidden"; document.body.appendChild(box); }
  box.innerHTML=`<div class="confirm-card"><div class="ct">请确认</div><div class="cm">${esc(msg)}</div>
    <div class="crow"><button class="btn ghost" id="cno">取消</button><button class="btn danger" id="cyes">确认</button></div></div>`;
  box.classList.remove("hidden");
  box.onclick=e=>{ if(e.target===box) box.classList.add("hidden"); };
  box.querySelector("#cno").onclick=()=> box.classList.add("hidden");
  box.querySelector("#cyes").onclick=()=>{ box.classList.add("hidden"); onYes(); };
}

/* ---------- SVG 图表 ---------- */
function lineChart(points, opt={}){
  const w=opt.w||320, h=opt.h||150, c=opt.color||"#5b54e6";
  if(!points||points.length===0) return `<svg viewBox="0 0 ${w} ${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#9a9cb0" font-size="13">暂无数据</text></svg>`;
  const max=Math.max(...points), min=Math.min(...points);
  const range=(max-min)||1, padY=14, padX=10;
  const X=i=> padX + i*( (w-2*padX)/(Math.max(points.length-1,1)) );
  const Y=v=> h-padY - ( (v-min)/range )*(h-2*padY);
  const pts=points.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const area=`${padX},${h-padY} ${pts} ${X(points.length-1).toFixed(1)},${h-padY}`;
  const dots=points.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" fill="${c}"/>`).join("");
  const last=points[points.length-1];
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="none" style="display:block">
    <polygon points="${area}" fill="${c}1a"/>
    <polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    <text x="${X(points.length-1).toFixed(1)}" y="${(Y(last)-8).toFixed(1)}" text-anchor="end" fill="${c}" font-size="12" font-weight="700">${last}</text>
  </svg>`;
}
function sparkline(points, c="#5b54e6", w=88, h=28){
  if(!points||!points.length) return "";
  const max=Math.max(...points),min=Math.min(...points),range=(max-min)||1;
  const X=i=> 2+i*((w-4)/(Math.max(points.length-1,1)));
  const Y=v=> h-3-((v-min)/range)*(h-6);
  const pts=points.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

/* ---------- AI ---------- */
function localAI(messages){
  const last = messages[messages.length-1].content || "";
  // 选题生成
  const kw = (last.match(/热点[：:]\s*(.+)/)||[])[1] || last.replace(/生成选题|选题|思路|帮我想|围绕/g,"").slice(0,20) || "该热点";
  const angles = [
    `【角度一·反差钩子】“你以为${kw}只是跟风？其实它踩中了这3个底层情绪”——用「常识颠覆」开场，前3秒抛反差。`,
    `【角度二·实用拆解】把${kw}拆成「是什么 / 为什么火 / 普通人怎么借势」三段式，适合做收藏向干货。`,
    `【角度三·人设故事】用一个真实小故事承载${kw}，结尾落点「我也是这样过来的」，强化信任感。`,
    `【角度四·评论区共创】抛出争议点「${kw}到底是真香还是智商税？」引导评论区站队，提升互动权重。`
  ];
  return "（本地模板生成器·未配置API）基于你的需求，给出几个可落地的选题方向：\n\n"+angles.join("\n\n")+"\n\n💡 在「设置」里填入你的大模型 API Key，即可获得真正个性化的 AI 对话与选题。";
}
async function aiAsk(messages){
  const {apiKey,baseUrl,model} = state.ai;
  if(!apiKey) return localAI(messages);
  try{
    const r = await fetch(baseUrl.replace(/\/$/,"")+"/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
      body: JSON.stringify({model, messages: messages.map(m=>({role: m.role==="ai"?"assistant":m.role, content:m.content})), temperature:0.8})
    });
    if(!r.ok){ let m="HTTP "+r.status; try{ const e=await r.json(); if(e&&e.error&&e.error.message) m+=" · "+e.error.message; else if(e&&e.message) m+=" · "+e.message; }catch(_){ } throw new Error(m); }
    const j = await r.json();
    return (j.choices&&j.choices[0]&&j.choices[0].message.content) || "（AI 无返回内容）";
  }catch(e){
    return "⚠️ 调用失败："+e.message+"\n已回退到本地生成器。\n\n"+localAI(messages);
  }
}

/* ---------- 路由 ---------- */
const ROUTES = { ops:renderOps, idea:renderIdea, review:renderReview, habit:renderHabit, more:renderMore };
let curView = "ops";
function go(v){ curView=v; document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===v)); render(); window.scrollTo(0,0); }
function render(){ const fn=ROUTES[curView]||renderOps; $("#view").innerHTML=""; fn($("#view")); }

/* ===================================================================
   模块1：新媒体运营
================================================================== */
function renderOps(root){
  const a = state.accounts;
  let html = `<div class="card">
    <h3>📊 新媒体运营 <span class="tag">账号数据监测 · 自动保存</span></h3>
    <div class="stat-row">`;
  const totalF = a.reduce((s,x)=>s+(lastMetric(x,"followers")||0),0);
  html += `<div class="stat"><div class="v">${a.length}</div><div class="k">监测账号</div></div>
    <div class="stat"><div class="v">${totalF.toLocaleString()}</div><div class="k">总粉丝(估)</div></div>
    <div class="stat"><div class="v">${a.filter(x=>x.platform==='douyin').length}</div><div class="k">抖音</div></div>
    <div class="stat"><div class="v">${a.filter(x=>x.platform==='xhs').length}</div><div class="k">小红书</div></div>`;
  html += `</div>
    <button class="btn block" style="margin-top:14px" id="addAcc">+ 添加账号</button>
  </div>`;

  if(a.length===0){
    html += `<div class="card"><div class="empty">还没有账号。点击上方「添加账号」，填好每天的粉丝/点赞/播放，<br>这里会自动画出近一周趋势图。</div></div>`;
  } else {
    html += `<div class="section-title">我的账号</div>`;
    a.forEach(acc=>{
      const f=lastMetric(acc,"followers"), l=lastMetric(acc,"likes"), v=lastMetric(acc,"views");
      html += `<div class="item" data-acc="${acc.id}">
        <div class="ava ${acc.platform}">${acc.platform==='douyin'?'抖':'书'}</div>
        <div class="meta"><div class="t">${esc(acc.name)}</div>
          <div class="s">${acc.platform==='douyin'?'抖音':'小红书'} · 粉丝 ${(f||0).toLocaleString()} · 赞 ${(l||0).toLocaleString()} · 播放 ${(v||0).toLocaleString()}</div></div>
        <div class="arrow">›</div></div>`;
    });
  }
  root.innerHTML = html;

  $("#addAcc").onclick = ()=> addAccountModal();
  root.querySelectorAll("[data-acc]").forEach(it=> it.onclick=()=> accountDetail(it.dataset.acc));
}
function lastMetric(acc, key){ const s=acc.series||[]; for(let i=s.length-1;i>=0;i--){ if(s[i][key]!=null) return s[i][key]; } return 0; }
function addAccountModal(){
  openModal(`<h2>添加账号</h2>
    <div class="field"><label>平台</label>
      <select id="p"><option value="douyin">抖音</option><option value="xhs">小红书</option></select></div>
    <div class="field"><label>账号名称</label><input id="n" placeholder="例如：九的数码日记"/></div>
    <div class="field"><label>主页链接/账号ID（选填）</label><input id="h" placeholder="https://..."/></div>
    <button class="btn block" id="ok">保存</button>`,
    sheet=>{
      sheet.querySelector("#ok").onclick=()=>{
        const name=sheet.querySelector("#n").value.trim();
        if(!name){ showToast("请填写账号名称"); return; }
        state.accounts.push({id:"a"+Date.now(), platform:sheet.querySelector("#p").value, name, handle:sheet.querySelector("#h").value.trim(), series:[]});
        touch(); closeModal(); render();
      };
    });
}
function accountDetail(id){
  const acc = state.accounts.find(x=>x.id===id); if(!acc) return;
  const series = (acc.series||[]).slice().sort((a,b)=>a.date<b.date?-1:1);
  const recent = series.slice(-7);
  const metricKeys = [["followers","粉丝"],["likes","点赞"],["views","播放"],["notes","作品数"]];
  let sel = "followers";
  const draw = ()=>{
    const vals = recent.map(r=>r[sel]||0);
    const labels = recent.map(r=>r.date.slice(5));
    const sheet = $("#accSheet");
    sheet.querySelector("#chart").innerHTML = lineChart(vals,{color: acc.platform==='douyin'?'#ff2c55':'#ff2442'});
    sheet.querySelector("#chartTitle").textContent = metricKeys.find(m=>m[0]===sel)[1]+" · 近"+recent.length+"次记录";
    sheet.querySelectorAll(".mBtn").forEach(b=>b.classList.toggle("active", b.dataset.m===sel));
    const cur = vals[vals.length-1]||0, prev = vals[vals.length-2]||0;
    const diff = cur-prev;
    sheet.querySelector("#delta").textContent = (diff>=0?"▲ +":"▼ ")+diff.toLocaleString()+" 较上次";
    sheet.querySelector("#delta").style.color = diff>=0? "var(--ok)":"var(--bad)";
  };
  openModal(`<h2>${esc(acc.name)}</h2>
    <div class="chips" id="mBtns">
      ${metricKeys.map(m=>`<button class="chip mBtn ${m[0]===sel?'active':''}" data-m="${m[0]}">${m[1]}</button>`).join("")}
    </div>
    <div id="chartTitle" class="section-title" style="margin-top:14px"></div>
    <div id="chart"></div>
    <div id="delta" class="muted" style="font-weight:700"></div>
    <button class="btn block" id="logToday" style="margin-top:14px">+ 记录今日数据</button>
    <button class="btn ghost block" id="delAcc" style="margin-top:8px">删除账号</button>`,
    sheet=>{
      sheet.id="accSheet";
      sheet.querySelectorAll(".mBtn").forEach(b=> b.onclick=()=>{ sel=b.dataset.m; draw(); });
      draw();
      sheet.querySelector("#logToday").onclick=()=>{
        const today = series.find(r=>r.date===TODAY);
        openModal(`<h2>记录今日数据</h2>
          <div class="field"><label>日期</label><input id="d" type="date" value="${TODAY}"/></div>
          <div class="field"><label>粉丝数</label><input id="f" type="number" value="${today?today.followers||'':''}" placeholder="0"/></div>
          <div class="field"><label>点赞数(累计)</label><input id="l" type="number" value="${today?today.likes||'':''}" placeholder="0"/></div>
          <div class="field"><label>播放数(累计)</label><input id="v" type="number" value="${today?today.views||'':''}" placeholder="0"/></div>
          <div class="field"><label>作品数</label><input id="n" type="number" value="${today?today.notes||'':''}" placeholder="0"/></div>
          <button class="btn block" id="save">保存记录</button>`,
          s2=>{
            s2.querySelector("#save").onclick=()=>{
              const rec = { date:s2.querySelector("#d").value||TODAY,
                followers:+s2.querySelector("#f").value||0, likes:+s2.querySelector("#l").value||0,
                views:+s2.querySelector("#v").value||0, notes:+s2.querySelector("#n").value||0 };
              const i = acc.series.findIndex(r=>r.date===rec.date);
              if(i>=0) acc.series[i]=rec; else acc.series.push(rec);
              touch(); closeModal(); accountDetail(id); showToast("已记录");
            };
          });
      };
      sheet.querySelector("#delAcc").onclick=()=>{
        askConfirm("确定删除该账号及其所有数据？", ()=>{ state.accounts=state.accounts.filter(x=>x.id!==id); touch(); closeModal(); render(); });
      };
    });
}

/* ===================================================================
   模块2：思路喷泉
================================================================== */
let ideaTrack = "digital";
function renderIdea(root){
  const trackNames = {digital:"数码行业",psychology:"心理学",media:"做自媒体",sports:"体育行业",policy:"新闻政策"};
  let html = `<div class="card">
    <h3>💡 思路喷泉 <span class="tag">爆款元素库 · 热点追踪 · AI选题</span></h3>
    <div class="note">本区帮你解决「灵感枯竭 / 选题困难」。热点榜已接入 GitHub+jsDelivr，每天 12:00 自动更新（断网时回退内置快照）；AI 选题在填了 API Key 后变为真·对话。</div>
    <div class="section-title">五大赛道 · 爆款元素库</div>
    <div class="chips" id="trackChips">
      ${Object.keys(trackNames).map(k=>`<button class="chip ${k===ideaTrack?'active':''}" data-t="${k}">${trackNames[k]}</button>`).join("")}
    </div>
    <div class="chips" id="libChips" style="margin-top:10px"></div>
    <button class="btn ghost sm" id="addLib" style="margin-top:8px">+ 添加元素</button>
  </div>`;

  // 热点
  html += `<div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <h3 style="margin:0">🔥 平台热点榜 <span class="tag">抖音/小红书每日自动更新</span></h3>
    </div>
    <div class="muted" style="margin-top:6px">小红书热榜更新于：${state.hotUpdated ? state.hotUpdated.replace("T"," ").slice(0,16) : "（本地快照）"}</div>
    <div class="split" style="margin-top:12px">
      <div><div class="section-title">抖音热榜</div><div id="douyinList"></div></div>
      <div><div class="section-title">小红书热榜</div><div id="xhsList"></div></div>
    </div>
  </div>`;

  root.innerHTML = html;
  renderLib(); renderHotList("douyin"); renderHotList("xhs");

  root.querySelectorAll("#trackChips .chip").forEach(c=> c.onclick=()=>{ ideaTrack=c.dataset.t; renderIdea($("#view")); });
  $("#addLib").onclick=()=>{
    openModal(`<h2>添加爆款元素</h2><div class="field"><label>赛道</label>
      <select id="tk">${Object.keys(trackNames).map(k=>`<option value="${k}" ${k===ideaTrack?'selected':''}>${trackNames[k]}</option>`).join("")}</select></div>
      <div class="field"><label>元素名称</label><input id="nm" placeholder="例如：对比测评"/></div>
      <button class="btn block" id="ok">添加</button>`,
      s=>{ s.querySelector("#ok").onclick=()=>{ const nm=s.querySelector("#nm").value.trim(); if(!nm){showToast("请填写");return;}
        state.tracks[s.querySelector("#tk").value].push(nm); touch(); closeModal(); renderIdea($("#view")); }; });
  };
}
function renderLib(){
  const box=$("#libChips"); if(!box) return;
  const arr=state.tracks[ideaTrack]||[];
  box.innerHTML = arr.map((e,i)=>`<span class="chip" style="cursor:pointer" data-i="${i}">${esc(e)} <span style="opacity:.5">×</span></span>`).join("") || `<span class="muted">暂无元素</span>`;
  box.querySelectorAll(".chip").forEach(c=> c.onclick=()=>{ const i=+c.dataset.i; state.tracks[ideaTrack].splice(i,1); touch(); renderLib(); });
}
function renderHotList(p){
  const box=$("#"+p+"List"); if(!box) return;
  box.innerHTML = state.hot[p].map((h,i)=>`
    <div class="hot">
      <div class="htop">
        <div class="rank">${i+1}</div>
        <div class="htitle">${esc(h.t)}</div>
        <div class="heat">🔥${h.heat}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        ${sparkline(h.trend, p==='douyin'?'#ff2c55':'#ff2442')}
        <span class="track">${h.track}</span>
        <a class="link" href="${h.link}" target="_blank" rel="noopener">${p==='douyin'?'抖音 ↗':'笔记 ↗'}</a>
      </div>
      <div class="actions">
        <button class="btn ghost sm" data-gen="${h.id}">✨ AI生成选题</button>
      </div>
    </div>`).join("");
  box.querySelectorAll("[data-gen]").forEach(b=> b.onclick=()=> aiTopicModal(p, b.dataset.gen));
}
function aiTopicModal(p, id){
  const h = state.hot[p].find(x=>x.id===id); if(!h) return;
  const key = p+"|"+id;
  const chat = state.chats[key] || (state.chats[key]=[]);
  if(chat.length===0) chat.push({role:"ai", content:`已锁定热点「${h.t}」（${h.track}）。告诉我你的账号定位/受众，我帮你生成可落地的选题与创作思路。`});
  openModal(`<h2>✨ AI选题 · ${esc(h.t)}</h2>
    <div class="chat" id="chat"></div>
    <div class="chat-input">
      <textarea id="ci" placeholder="补充你的定位/想要的角度…（回车发送）"></textarea>
      <button class="btn" id="send">发送</button>
    </div>`,
    sheet=>{
      const box=sheet.querySelector("#chat");
      const paint=()=>{ box.innerHTML=chat.map(m=>`<div class="msg ${m.role}">${esc(m.content)}</div>`).join(""); box.scrollTop=box.scrollHeight; };
      paint();
      const send=async()=>{
        const v=sheet.querySelector("#ci").value.trim(); if(!v) return;
        chat.push({role:"user",content:v}); sheet.querySelector("#ci").value=""; paint();
        const aiMsg={role:"ai",content:"思考中…"}; chat.push(aiMsg); paint();
        const sys={role:"system",content:`你是资深短视频选题策划。当前热点：「${h.t}」，分类：${h.track}，平台：${p==='douyin'?'抖音':'小红书'}。请基于爆款元素与平台调性，给出具体选题标题、切入角度、开头钩子、结构建议。`};
        const out = await aiAsk([sys, ...chat.filter(m=>m.content!=="思考中…").map(m=>({role:m.role,content:m.content}))]);
        aiMsg.content=out; paint(); touch();
      };
      sheet.querySelector("#send").onclick=send;
      sheet.querySelector("#ci").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} });
    });
}

/* ===================================================================
   模块3：九这样盘
================================================================== */
function detectPlatform(url){
  if(/xiaohongshu\.com|xhslink\.com/.test(url)) return "xhs";
  if(/douyin\.com|iesdouyin|tiktok/.test(url)) return "douyin";
  if(/bilibili\.com|b23\.tv/.test(url)) return "bili";
  return "未知";
}
function renderReview(root){
  let html = `<div class="card">
    <h3>🔍 九这样盘 <span class="tag">作品复盘 · AI找问题</span></h3>
    <div class="warnbox">说明：网页无法直接"看"视频画面，本区采用「粘贴链接识别平台 + 你填视频要点（口播稿/分镜）+ AI 专业拆解/复盘」的闭环。填了 API Key 后，点「🎬 AI拆解视频」即可获得<strong>专业视频策划剪辑师视角</strong>的脚本结构与剪辑手法拆解。要点填得越全，拆解越精准。</div>
    <div class="field"><label>粘贴作品链接（自动识别平台）</label><input id="url" placeholder="https://v.douyin.com/... 或 xhslink.com/..."/></div>
    <button class="btn block" id="addWork">+ 添加并复盘</button>
  </div>`;

  if(state.works.length===0) html += `<div class="card"><div class="empty">还没有作品。贴上链接，我来识别平台，并用 AI 帮你做专业视频拆解与复盘。</div></div>`;
  else {
    html += `<div class="section-title">已添加作品（${state.works.length}）</div>`;
    state.works.forEach(w=>{
      const pf = w.platform==="douyin"?"抖音":w.platform==="xhs"?"小红书":w.platform==="bili"?"B站":"未知";
      html += `<div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span class="pf ${w.platform}">${pf}</span>
          <a class="link" href="${esc(w.url)}" target="_blank" rel="noopener" style="font-size:13px;word-break:break-all">${esc(w.url)}</a>
          <button class="btn danger sm" data-del="${w.id}" style="margin-left:auto">删除</button>
        </div>
        <div class="score"><span class="lab">文案</span><div class="track"><i style="width:${w.score.copy*10}%"></i></div><span class="muted">${w.score.copy}/10</span></div>
        <div class="score"><span class="lab">音乐</span><div class="track"><i style="width:${w.score.music*10}%"></i></div><span class="muted">${w.score.music}/10</span></div>
        <div class="score"><span class="lab">剪辑</span><div class="track"><i style="width:${w.score.edit*10}%"></i></div><span class="muted">${w.score.edit}/10</span></div>
        ${w.breakdown?`<div class="note" style="white-space:pre-wrap;margin-top:10px"><b>🎬 AI 视频拆解</b><br>${esc(w.breakdown)}</div>`:""}
        <div class="note" style="white-space:pre-wrap">${esc(w.tips||"点「重新复盘」生成改善方案，或点「🎬 AI拆解」做专业拆解")}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn ghost sm" data-redo="${w.id}">↻ 重新复盘</button>
          <button class="btn sm" data-break="${w.id}">🎬 AI拆解视频</button>
        </div>
      </div>`;
    });
  }
  root.innerHTML = html;
  $("#addWork").onclick=()=>{
    const url=$("#url").value.trim(); if(!url){showToast("请粘贴链接");return;}
    const platform=detectPlatform(url);
    const w={id:"w"+Date.now(), url, platform, score:{copy:5,music:5,edit:5}, tips:"", points:"", breakdown:"", note:{copy:"",music:"",edit:""}};
    state.works.unshift(w); touch(); $("#url").value="";
    openReviewSheet(w.id);
  };
  root.querySelectorAll("[data-del]").forEach(b=> b.onclick=()=>{ state.works=state.works.filter(x=>x.id!==b.dataset.del); touch(); render(); });
  root.querySelectorAll("[data-redo]").forEach(b=> b.onclick=()=> openReviewSheet(b.dataset.redo));
  root.querySelectorAll("[data-break]").forEach(b=> b.onclick=()=> runBreakdown(b.dataset.break));
}
const WEAK = {copy:["文案平平无钩子","信息密度低","缺少共鸣点","标题不抓人"], music:["音乐与节奏不搭","无情绪起伏","转场无音效","BGM太大众"], edit:["开头拖沓","剪辑节奏慢","画面杂乱","无字幕/重点不突出"]};
function buildBreakPrompt(w){
  const platformName = w.platform==="douyin"?"抖音":w.platform==="xhs"?"小红书":w.platform==="bili"?"B站":"未知平台";
  const points = (w.points && w.points.trim()) ? w.points.trim() : "（用户未提供，请基于该平台爆款共性给出通用拆解框架与自查清单）";
  return `你是一位从业10年的资深短视频策划剪辑师，服务过多个百万粉账号。请基于以下信息，对这条视频做【专业、细致的拆解分析】。

【平台】${platformName}
【作品链接】${w.url}
【视频要点（标题/简介/口播稿/分镜，用户提供）】${points}

请严格按以下结构输出（用清晰小标题，分点，专业且可执行）：

一、视频定位与受众
- 这条视频大概率在打什么人群、什么情绪/需求；平台调性适配度。

二、脚本结构拆解（逐段）
1. 黄金3秒/开场钩子：怎么抓人？用了哪种钩子类型（悬念/反差/利益点/共鸣）？
2. 起承转合/叙事结构：整体节奏如何铺陈，是否有"铺垫-冲突-高潮-反转-收尾"主线。
3. 信息密度与逻辑线：每段传递什么，主线是否清晰。
4. 结尾引导：是否有引导点赞/关注/评论/转化的钩子，设计好坏。

三、剪辑手法拆解（专业视角）
1. 景别与镜头：近景/特写/全景如何运用，是否服务情绪。
2. 运镜与节奏：固定/推拉摇移/手持，剪辑快慢，是否卡点。
3. 转场与衔接：硬切/叠化/遮罩/匹配剪辑，衔接是否顺。
4. 字幕与包装：字幕样式、关键词高亮、花字贴纸是否到位。
5. 音乐与音效：BGM选择、情绪匹配、卡点、音效点缀。
6. 画面节奏与留白：有无拖沓或信息过载。

四、专业点评
- 做得好的3点（具体到画面/台词）。
- 可优化的3点（具体、可执行，最好给修改方案）。

五、给你的自查清单（可直接照着改）
- 5条可落地优化动作。

要求：专业但好懂，多给具体例子而非空话；信息不足时明确标注"需补充口播稿/分镜"，并先给该类型视频的标准拆解框架。`;
}
function runBreakdown(id){
  const w=state.works.find(x=>x.id===id); if(!w) return;
  const pf = w.platform==="douyin"?"抖音":w.platform==="xhs"?"小红书":w.platform==="bili"?"B站":"视频";
  openModal(`<h2>🎬 AI 视频拆解 · ${pf}</h2>
    <div class="note" style="white-space:pre-wrap">${esc((w.points&&w.points.trim())?("已基于你提供的要点分析：\n"+w.points):"（未提供视频要点，AI 将基于平台爆款共性给出通用拆解框架。点「重新复盘」可先补充口播稿/分镜，拆解会更精准）")}</div>
    <div class="note" id="bout" style="white-space:pre-wrap;margin-top:10px">拆解中…（以专业剪辑师视角分析中）</div>`,
    sheet=>{
      const out=sheet.querySelector("#bout");
      aiAsk([{role:"user",content:buildBreakPrompt(w)}]).then(r=>{ w.breakdown=r; touch(); out.textContent=r; });
    });
}
function openReviewSheet(id){
  const w=state.works.find(x=>x.id===id); if(!w) return;
  openModal(`<h2>作品复盘 & 拆解</h2>
    <div class="field"><label>视频要点（标题/简介/口播稿/分镜，越全拆解越准）</label><textarea id="rp" placeholder="把能提供的都贴这里：视频标题、账号定位、口播稿、镜头顺序、用的音乐等">${esc(w.points||"")}</textarea></div>
    <div class="field"><label>你写的文案（粘贴核心文案/口播）</label><textarea id="rc" placeholder="把视频文案贴这里，AI更好判断">${esc(w.note.copy||"")}</textarea></div>
    <div class="field"><label>音乐/BGM 说明</label><input id="rm" placeholder="例如：用了热门卡点音乐" value="${esc(w.note.music||"")}"/></div>
    <div class="field"><label>剪辑手法</label><input id="re" placeholder="例如：快剪+转场" value="${esc(w.note.edit||"")}"/></div>
    <div class="section-title">自评（0-10）</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      ${["copy","music","edit"].map(k=>`<div>${k==='copy'?'文案':k==='music'?'音乐':'剪辑'} <input id="s_${k}" type="range" min="0" max="10" value="${w.score[k]}"></div>`).join("")}
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn block" id="gen">🤖 生成改善方案</button>
      <button class="btn block" id="break">🎬 AI拆解视频</button>
    </div>
    <div class="note" id="out" style="white-space:pre-wrap;display:none"></div>`,
    sheet=>{
      const saveFields=()=>{
        w.points=sheet.querySelector("#rp").value;
        w.note.copy=sheet.querySelector("#rc").value; w.note.music=sheet.querySelector("#rm").value; w.note.edit=sheet.querySelector("#re").value;
        w.score={copy:+sheet.querySelector("#s_copy").value, music:+sheet.querySelector("#s_music").value, edit:+sheet.querySelector("#s_edit").value};
        touch();
      };
      sheet.querySelector("#gen").onclick=async()=>{
        saveFields();
        const out=sheet.querySelector("#out"); out.style.display="block"; out.textContent="分析中…";
        const prompt=`请作为视频复盘教练，基于以下信息给出「哪几部分做得不好 + 改善方法 + 具体怎么改」。\n平台：${w.platform}\n文案：${w.note.copy||"（未填）"}\n音乐：${w.note.music||"（未填）"}\n剪辑：${w.note.edit||"（未填）"}\n自评：文案${w.score.copy}/10，音乐${w.score.music}/10，剪辑${w.score.edit}/10。\n请用分点、可执行的语气。`;
        const r = await aiAsk([{role:"user",content:prompt}]);
        w.tips=r; touch(); out.textContent=r; showToast("复盘已生成");
      };
      sheet.querySelector("#break").onclick=async()=>{
        saveFields();
        const out=sheet.querySelector("#out"); out.style.display="block"; out.textContent="拆解中…（以专业剪辑师视角分析中）";
        const r = await aiAsk([{role:"user",content:buildBreakPrompt(w)}]);
        w.breakdown=r; touch(); out.textContent=r; showToast("拆解已完成");
      };
    });
}

/* ===================================================================
   模块4：好习惯
================================================================== */
let calY = todayDate().getFullYear(), calM = todayDate().getMonth();
function renderHabit(root){
  const habits = state.habits;
  let html = `<div class="card">
    <h3>✅ 好习惯 <span class="tag">打卡 · 日记 · 自动总结</span></h3>
    <button class="btn block" id="addHab">+ 添加习惯</button>
  </div>`;

  // 日历
  html += `<div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <button class="btn soft sm" id="prevM">‹</button>
      <strong>${calY}年 ${calM+1}月</strong>
      <button class="btn soft sm" id="nextM">›</button>
    </div>
    <table class="cal"><thead><tr>${["日","一","二","三","四","五","六"].map(d=>`<th>${d}</th>`).join("")}</tr></thead><tbody id="calBody"></tbody></table>
  </div>`;

  // 习惯列表
  html += `<div class="section-title">今日习惯（${TODAY}）</div>`;
  if(habits.length===0) html += `<div class="card"><div class="empty">还没有习惯，点「添加习惯」开始。</div></div>`;
  else {
    habits.forEach(h=>{
      const done = state.habitLog[h.id]?.[TODAY];
      html += `<div class="habit" data-h="${h.id}">
        <div class="hname">${esc(h.name)}</div>
        <span class="hcount" data-c="${h.id}"></span>
        <div class="toggle ${done?'on':''}" data-t="${h.id}"></div>
      </div>`;
    });
  }

  // 日记（每天可存多篇）
  html += `<div class="card">
    <h3>📝 小日记 <span class="tag">每天可记多篇</span></h3>
    <div class="field"><label>${TODAY}</label><textarea id="diaryInput" placeholder="偶尔记一下心得和体会…"></textarea></div>
    <button class="btn block" id="addDiary">保存这篇日记</button>
    <div id="diaryList" style="margin-top:12px"></div>
  </div>`;

  // 总结
  html += `<div class="card">
    <h3>📈 自动总结</h3>
    <div class="chips" id="sumTabs">
      <button class="chip active" data-s="week">本周</button>
      <button class="chip" data-s="month">本月</button>
      <button class="chip" data-s="year">本年</button>
    </div>
    <div id="sumBody" style="margin-top:12px"></div>
  </div>`;

  root.innerHTML = html;
  paintCal(); paintCounts(); paintSummary("week"); paintDiary();

  $("#addHab").onclick=()=> openModal(`<h2>添加习惯</h2><div class="field"><label>习惯名称</label><input id="hn" placeholder="例如：阅读30分钟"/></div>
    <button class="btn block" id="ok">添加</button>`, s=>{ s.querySelector("#ok").onclick=()=>{ const n=s.querySelector("#hn").value.trim(); if(!n){showToast("请填写");return;}
      state.habits.push({id:"h"+Date.now(), name:n}); touch(); closeModal(); render(); }; });
  $("#prevM").onclick=()=>{ calM--; if(calM<0){calM=11;calY--;} render(); };
  $("#nextM").onclick=()=>{ calM++; if(calM>11){calM=0;calY++;} render(); };
  root.querySelectorAll("[data-t]").forEach(t=> t.onclick=()=> toggleHabit(t.dataset.t, TODAY));
  root.querySelectorAll("[data-h]").forEach(it=> it.onclick=e=>{ if(e.target.classList.contains("toggle")) return; openDaySheet(it.dataset.h, TODAY); });
  $("#addDiary").onclick=()=>{ const v=root.querySelector("#diaryInput").value.trim(); if(!v){ showToast("写点什么再保存吧"); return; } (state.diary[TODAY]=state.diary[TODAY]||[]).push({id:"di"+Date.now(), text:v, t:new Date().toTimeString().slice(0,5)}); root.querySelector("#diaryInput").value=""; touch(); paintDiary(); showToast("日记已保存"); };
  root.querySelectorAll("#sumTabs .chip").forEach(c=> c.onclick=()=>{ root.querySelectorAll("#sumTabs .chip").forEach(x=>x.classList.remove("active")); c.classList.add("active"); paintSummary(c.dataset.s); });
}
function paintCal(){
  const body=$("#calBody"); const first=new Date(calY,calM,1).getDay();
  const days=new Date(calY,calM+1,0).getDate();
  let cells=""; let row="";
  for(let i=0;i<first;i++) row+="<td></td>";
  for(let d=1;d<=days;d++){
    const ds=`${calY}-${pad(calM+1)}-${pad(d)}`;
    const has = Object.keys(state.habitLog).some(h=>state.habitLog[h][ds]);
    const isToday = ds===TODAY;
    row+=`<td><div class="cell ${isToday?'today':''}" data-d="${ds}">${d}${has?'<span class="dot"></span>':''}</div></td>`;
    if((first+d)%7===0){ cells+=`<tr>${row}</tr>`; row=""; }
  }
  cells+=`<tr>${row}</tr>`;
  body.innerHTML=cells;
  body.querySelectorAll(".cell").forEach(c=> c.onclick=()=> openDaySheet(null, c.dataset.d));
}
function toggleHabit(hid, ds){
  state.habitLog[hid]=state.habitLog[hid]||{};
  state.habitLog[hid][ds]=!state.habitLog[hid][ds];
  touch(); render();
}
function paintCounts(){
  state.habits.forEach(h=>{
    const c=document.querySelector(`[data-c="${h.id}"]`); if(!c) return;
    const total=Object.values(state.habitLog[h.id]||{}).filter(Boolean).length;
    c.textContent="累计 "+total+" 次";
  });
}
function paintDiary(){
  const box=$("#diaryList"); if(!box) return;
  const list=state.diary[TODAY]||[];
  if(list.length===0){ box.innerHTML=`<div class="empty">今天还没有日记，写下第一篇吧。</div>`; return; }
  box.innerHTML=list.slice().reverse().map(d=>`<div class="diary-item">
    <div class="diary-meta">${d.t?`<span class="diary-time">${esc(d.t)}</span>`:`<span></span>`}<button class="diary-del" data-del="${d.id}" title="删除">×</button></div>
    <div class="diary-text">${esc(d.text)}</div></div>`).join("");
  box.querySelectorAll("[data-del]").forEach(b=> b.onclick=()=>{ state.diary[TODAY]=(state.diary[TODAY]||[]).filter(x=>x.id!==b.dataset.del); touch(); paintDiary(); });
}
function openDaySheet(hid, ds){
  openModal(`<h2>${ds}</h2>
    <div class="section-title">习惯打卡（点一下切换）</div>
    <div id="dayHabits"></div>
    <div class="field" style="margin-top:12px"><label>当日日记（可记多篇）</label><textarea id="dd" placeholder="今天的心得…"></textarea>
      <button class="btn block" id="addDayDiary" style="margin-top:8px">保存这篇日记</button></div>
    <div id="dayDiaryList" style="margin-top:10px"></div>
    <button class="btn block" id="ok" style="margin-top:10px">关闭</button>`,
    sheet=>{
      sheet.querySelector("#dayHabits").innerHTML = state.habits.length? state.habits.map(h=>{
        const on=state.habitLog[h.id]?.[ds];
        return `<div class="habit"><div class="hname">${esc(h.name)}</div><div class="toggle ${on?'on':''}" data-t="${h.id}"></div></div>`;
      }).join("") : `<div class="muted">还没有习惯</div>`;
      sheet.querySelectorAll("[data-t]").forEach(t=> t.onclick=()=>{ const id=t.dataset.t; state.habitLog[id]=state.habitLog[id]||{}; state.habitLog[id][ds]=!state.habitLog[id][ds]; t.classList.toggle("on"); touch(); });
      const paintDayDiary=()=>{ const box=sheet.querySelector("#dayDiaryList"); const list=state.diary[ds]||[];
        box.innerHTML = list.length? list.slice().reverse().map(d=>`<div class="diary-item"><div class="diary-meta">${d.t?`<span class="diary-time">${esc(d.t)}</span>`:`<span></span>`}<button class="diary-del" data-del="${d.id}" title="删除">×</button></div><div class="diary-text">${esc(d.text)}</div></div>`).join("") : `<div class="muted">暂无日记</div>`;
        box.querySelectorAll("[data-del]").forEach(b=> b.onclick=()=>{ state.diary[ds]=(state.diary[ds]||[]).filter(x=>x.id!==b.dataset.del); touch(); paintDayDiary(); }); };
      sheet.querySelector("#addDayDiary").onclick=()=>{ const v=sheet.querySelector("#dd").value.trim(); if(!v){ showToast("写点什么再保存"); return; } (state.diary[ds]=state.diary[ds]||[]).push({id:"di"+Date.now(), text:v, t:new Date().toTimeString().slice(0,5)}); sheet.querySelector("#dd").value=""; touch(); paintDayDiary(); };
      paintDayDiary();
      sheet.querySelector("#ok").onclick=()=>{ closeModal(); render(); };
    });
}
function countRange(hid, start, end){
  const log=state.habitLog[hid]||{}; let n=0;
  for(const d in log){ if(d>=start && d<=end && log[d]) n++; }
  return n;
}
function paintSummary(kind){
  const body=$("#sumBody");
  let start, end, label;
  if(kind==="week"){ start=ymd(addDays(todayDate(),-6)); end=TODAY; label="近7天"; }
  else if(kind==="month"){ start=`${calY}-${pad(calM+1)}-01`; end=TODAY; label=`${calM+1}月`; }
  else { start=`${calY}-01-01`; end=TODAY; label=`${calY}年`; }
  if(state.habits.length===0){ body.innerHTML=`<div class="empty">添加习惯后这里会自动生成${label}总结。</div>`; return; }
  const max = Math.max(1, ...state.habits.map(h=>countRange(h.id,start,end)));
  body.innerHTML = `<div class="muted" style="margin-bottom:8px">${label}各习惯完成次数</div><div class="sum-grid">`+
    state.habits.map(h=>{ const n=countRange(h.id,start,end); return `<div class="sum">
      <div class="nm">${esc(h.name)}</div>
      <div class="bar"><i style="width:${Math.round(n/max*100)}%"></i></div>
      <div class="nums">${n} 次 · 占比 ${Math.round(n/max*100)}%</div></div>`; }).join("") + `</div>`;
}

/* ===================================================================
   设置 / 说明
================================================================== */
function renderMore(root){
  const ai=state.ai;
  root.innerHTML = `<div class="card">
    <h3>⚙️ 设置 · 数据 · 说明</h3>
    <div class="warnbox"><b>关于"实时"与"AI"：</b>抖音/小红书无官方公开免费热点接口，本工作台默认用内置快照；在下方「🔥 热点数据源」填一个带 CORS 的在线基础 URL（推荐 GitHub + jsDelivr），即可让热点每天自动更新、线上版也同步。AI 对话/选题/复盘默认用内置模板；填你自己的大模型 API Key（OpenAI 兼容格式）即变真·AI。</div>
    <div class="section-title">AI 配置（可选）</div>
    <div class="field"><label>API Key</label><input id="ak" type="password" placeholder="sk-..." value="${esc(ai.apiKey)}"/></div>
    <div class="field"><label>Base URL</label><input id="au" placeholder="https://api.openai.com/v1" value="${esc(ai.baseUrl)}"/></div>
    <div class="field"><label>模型</label><input id="am" placeholder="gpt-4o-mini" value="${esc(ai.model)}"/></div>
    <button class="btn block" id="saveAi">保存 AI 配置</button>
    <div style="display:flex;gap:10px;margin-top:10px;align-items:center">
      <button class="btn soft" id="testAi">测试连接</button>
      <span id="aiMsg" class="muted"></span>
    </div>
  </div>
  <div class="card">
    <h3>🔥 热点数据源（在线自动更新）</h3>
    <div class="muted">已内置默认数据源（你的 GitHub 仓库，经 jsDelivr 分发），<b>留空即可每天自动更新</b>，线上/本地/手机打开都读同一份最新热点。如需自定义可填写，格式如：<code>https://cdn.jsdelivr.net/gh/用户名/仓库名/data</code>。</div>
    <div class="field"><label>热点基础 URL</label><input id="hub" placeholder="https://cdn.jsdelivr.net/gh/user/repo" value="${esc(state.hotBaseUrl||"")}"/></div>
    <button class="btn block" id="saveHub">保存数据源</button>
    <div style="display:flex;gap:10px;margin-top:10px;align-items:center">
      <button class="btn soft" id="testHub">测试拉取</button>
      <span id="hubMsg" class="muted"></span>
    </div>
  </div>
  <div class="card">
    <h3>💾 数据管理</h3>
    <div class="muted">所有数据保存在本机浏览器（localStorage），填写即自动保存。换设备/清缓存会丢失，建议定期备份。</div>
    <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
      <button class="btn soft" id="exp">导出备份</button>
      <button class="btn soft" id="imp">导入备份</button>
      <button class="btn danger" id="clear">清空全部</button>
    </div>
    <input type="file" id="file" accept="application/json" style="display:none"/>
  </div>
  <div class="card">
    <h3>📱 安装到手机</h3>
    <div class="muted">1. 用手机浏览器打开本页网址。<br>2. iPhone：点 <b>分享 → 添加到主屏幕</b>。<br>3. 安卓/Chrome：点 <b>⋮ → 安装应用 / 添加到主屏幕</b>。<br>4. 之后像 App 一样从桌面打开，断网也能用（已启用离线缓存）。</div>
  </div>`;
  $("#saveAi").onclick=()=>{ state.ai={apiKey:$("#ak").value.trim(), baseUrl:$("#au").value.trim()||"https://api.openai.com/v1", model:$("#am").value.trim()||"gpt-4o-mini"}; touch(); showToast("AI 配置已保存"); };
  $("#saveHub").onclick=()=>{ state.hotBaseUrl=$("#hub").value.trim(); touch(); showToast("数据源已保存，正在拉取…"); applyRemoteHot(); };
  $("#testHub").onclick=async ()=>{
    const el=$("#hubMsg"); const base=$("#hub").value.trim().replace(/\/$/,"");
    if(!base){ el.textContent="⚠️ 请先填基础 URL"; el.style.color="#e53"; return; }
    el.textContent="拉取测试中…"; el.style.color="";
    const res=[];
    for(const f of ["douyin-hot.json","xhs-hot.json"]){
      try{ const r=await fetch(base+"/"+f+"?t="+Date.now(),{cache:"no-store"});
        if(r.ok){ const d=await r.json(); const n=(f.includes("douyin")?(d.douyin||[]):(d.xhs||[])).length; res.push(f+": ✅"+n+"条"); }
        else res.push(f+": ❌ HTTP "+r.status);
      }catch(e){ res.push(f+": ❌ "+e.message); }
    }
    el.textContent=res.join("  |  "); el.style.color=res.some(x=>x.includes("❌"))?"#e53":"#2a9";
  };
  $("#testAi").onclick=async ()=>{
    const el=$("#aiMsg");
    const cfg={apiKey:$("#ak").value.trim(), baseUrl:$("#au").value.trim()||"https://api.openai.com/v1", model:$("#am").value.trim()||"gpt-4o-mini"};
    if(!cfg.apiKey){ el.textContent="⚠️ 请先填 API Key"; el.style.color="#e53"; return; }
    el.textContent="连接测试中…"; el.style.color="";
    try{
      const r=await fetch(cfg.baseUrl.replace(/\/$/,"")+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+cfg.apiKey},body:JSON.stringify({model:cfg.model,messages:[{role:"user",content:"ping"}],temperature:0.5})});
      if(r.ok){ const j=await r.json(); const t=(j.choices&&j.choices[0]&&j.choices[0].message.content)||""; el.textContent="✅ 连接成功，模型返回："+t.slice(0,30); el.style.color="#2a9"; }
      else{ let m="❌ HTTP "+r.status; try{ const e=await r.json(); if(e&&e.error&&e.error.message) m+=" · "+e.error.message; else if(e&&e.message) m+=" · "+e.message; }catch(_){ } el.textContent=m; el.style.color="#e53"; }
    }catch(e){ el.textContent="❌ 网络/跨域："+e.message; el.style.color="#e53"; }
  };
  $("#exp").onclick=()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="jiu-backup-"+TODAY+".json"; a.click(); showToast("已导出"); };
  $("#imp").onclick=()=> $("#file").click();
  $("#file").onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); Object.assign(state,d); touch(); showToast("已导入，正在刷新"); render(); }catch(err){ showToast("文件格式错误"); } }; r.readAsText(f); };
  $("#clear").onclick=()=>{ askConfirm("确定清空全部数据？建议先导出备份。", ()=>{ localStorage.removeItem(LS_KEY); state=JSON.parse(JSON.stringify(DEFAULT)); touch(); render(); showToast("已清空"); }); };
}

/* ---------- 工具 ---------- */
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/* ---------- 热点数据：在线数据源优先，本地 data/ 兜底 ---------- */
async function applyRemoteHot(){
  // 默认数据源：用户的 GitHub 仓库（经 jsDelivr 分发，支持跨域）。设置页留空即走默认，无需手动填。
  const HOT_DEFAULT_BASE = "https://cdn.jsdelivr.net/gh/sushunyuan/jiuhaoxian@master/data";
  const base = (state.hotBaseUrl||"").trim() ? (state.hotBaseUrl||"").trim().replace(/\/$/,"") : HOT_DEFAULT_BASE.replace(/\/$/,"");
  if(base){
    let ok=false;
    try{
      const c=new AbortController(); const t=setTimeout(()=>c.abort(),8000);
      const r=await fetch(base+"/xhs-hot.json?t="+Date.now(),{cache:"no-store",signal:c.signal}); clearTimeout(t);
      if(r.ok){ const d=await r.json(); if(Array.isArray(d.xhs)&&d.xhs.length){ state.hot.xhs=d.xhs; state.hotUpdated=d.updated||state.hotUpdated; ok=true; } }
    }catch(e){}
    try{
      const c=new AbortController(); const t=setTimeout(()=>c.abort(),8000);
      const r=await fetch(base+"/douyin-hot.json?t="+Date.now(),{cache:"no-store",signal:c.signal}); clearTimeout(t);
      if(r.ok){ const d=await r.json(); if(Array.isArray(d.douyin)&&d.douyin.length){ state.hot.douyin=d.douyin; state.hotUpdated=d.updated||state.hotUpdated; ok=true; } }
    }catch(e){}
    if(ok){ save(); if(curView==="idea") render(); return; }
    // 外部失败 → 回退本地
  }
  // 本地兜底
  try{
    const r=await fetch("data/xhs-hot.json",{cache:"no-store"});
    if(r.ok){ const d=await r.json(); if(Array.isArray(d.xhs)&&d.xhs.length){ state.hot.xhs=d.xhs; state.hotUpdated=d.updated||state.hotUpdated; } }
  }catch(e){}
  try{
    const r=await fetch("data/douyin-hot.json",{cache:"no-store"});
    if(r.ok){ const d=await r.json(); if(Array.isArray(d.douyin)&&d.douyin.length){ state.hot.douyin=d.douyin; state.hotUpdated=d.updated||state.hotUpdated; } }
  }catch(e){}
  save();
  if(curView==="idea") render();
}

/* ---------- 启动 ---------- */
function init(){
  load();
  applyRemoteHot();
  document.querySelectorAll(".tab").forEach(t=> t.onclick=()=> go(t.dataset.view));
  if("serviceWorker" in navigator){
    const isLocal = location.hostname==="localhost"||location.hostname==="127.0.0.1";
    if(isLocal){
      // 本地预览：注销一切已注册的 SW，保证每次刷新都拿到最新文件（双写实时生效）
      navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
    }else if(location.protocol.startsWith("http")){
      navigator.serviceWorker.register("sw.js").catch(()=>{});
    }
  }
  go("ops");
}
init();
})();
