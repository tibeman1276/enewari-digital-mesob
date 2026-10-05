const nav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const languageBtn = document.getElementById("languageBtn");
let english = false;

menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll("#mainNav a").forEach(a => {
  a.addEventListener("click", () => nav.classList.remove("open"));
});

languageBtn?.addEventListener("click", () => {
  english = !english;
  document.documentElement.lang = english ? "en" : "am";
  languageBtn.textContent = english ? "አማርኛ" : "English";
  document.querySelectorAll("[data-am][data-en]").forEach(el => {
    el.textContent = english ? el.dataset.en : el.dataset.am;
  });
  showToast(english ? "English interface selected." : "የአማርኛ ቋንቋ ተመርጧል።");
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll("#mainNav a")];

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, {rootMargin:"-40% 0px -55% 0px", threshold:0});

sections.forEach(s => observer.observe(s));

function showToast(message){
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => toast.classList.remove("show"), 3000);
}

function demo(name){
  showToast(name + " — ይህ ክፍል በቀጣይ ከእውነተኛ የመስሪያ ቤቱ ሲስተም/API ጋር ይገናኛል።");
}


async function loadSiteSettings(){try{const r=await fetch('/api/public/settings');if(!r.ok)return;const s=await r.json();const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v||''};set('cityAboutAm',s.about_am);set('cityAboutEn',s.about_en);const facts=document.getElementById('cityFactsGrid');if(facts){const items=[['population','የህዝብ ቁጥር','Population'],['area_ha','የከተማ ስፋት','City area'],['kebele_count','ቀበሌዎች','Kebeles'],['elevation_m','ከፍታ','Elevation']];facts.innerHTML=items.filter(x=>s[x[0]]).map(x=>`<div><b>${escService(s[x[0]])}</b><span>${x[1]} / ${x[2]}</span></div>`).join('');}const af=document.getElementById('cityAboutFacts');if(af){const arr=[];if(s.coordinates)arr.push(`✓ ${escService(s.coordinates)}`);if(s.kebele_count)arr.push(`✓ ${escService(s.kebele_count)} ቀበሌ / kebeles`);if(s.mayor_name_am)arr.push(`✓ ኃላፊ፦ ${escService(s.mayor_name_am)}`);af.innerHTML=arr.map(x=>`<span>${x}</span>`).join('');}const link=document.getElementById('profileSourceLink');if(link){link.href=s.profile_source_url||'#';link.textContent=s.profile_source_name?`${s.profile_source_name} →`:'የመረጃ ምንጭ';link.style.display=s.profile_source_url?'inline-flex':'none'}const strip=document.getElementById('profileSourceStrip');if(strip)strip.textContent=s.profile_source_name?`የመረጃ ምንጭ፦ ${s.profile_source_name}`:'';}catch{}}
loadSiteSettings();

// Online service requests
const serviceModal=document.getElementById('serviceModal'), serviceClose=document.getElementById('serviceClose'), serviceForm=document.getElementById('serviceRequestForm'), serviceKeyEl=document.getElementById('serviceKey'), serviceResult=document.getElementById('serviceResult');
let serviceCatalog=[];
function escService(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
function renderPublicServices(){const box=document.getElementById('publicServiceGrid');if(!box)return;const q=(document.getElementById('serviceSearch')?.value||'').trim().toLowerCase();const office=(document.getElementById('serviceOfficeFilter')?.value||'').trim();const fee=(document.getElementById('serviceFeeFilter')?.value||'').trim();const rows=serviceCatalog.filter(x=>{const hay=[x.am,x.en,x.description_am,x.description_en,x.office_name_am,x.office_name_en].join(' ').toLowerCase();return(!q||hay.includes(q))&&(!office||String(x.officeId)===office)&&(!fee||(fee==='free'?Number(x.fee||0)===0:Number(x.fee||0)>0))});const count=document.getElementById('serviceDirectoryCount');if(count)count.textContent=`${rows.length} አገልግሎት / service${rows.length===1?'':'s'}`;box.innerHTML=rows.length?rows.map((x,i)=>`<article class="service-card ${i===0?'featured':''}"><span class="card-number">${String(i+1).padStart(2,'0')}</span><div class="big-icon">${x.officeId===8?'▤':x.officeId===12?'🚦':x.officeId===2?'💧':'▣'}</div><h3>${escService(x.am)}</h3><p>${escService(x.description_am||'የከተማ አገልግሎት')}</p><span class="service-office">🏛️ ${escService(x.office_name_am||'የከተማ አስተዳደር')}</span><div class="service-meta-row"><span>⏱️ ${Number(x.estimated_days||3)} ቀን</span><span>${Number(x.fee||0)>0?'💳 '+escService(x.fee+' '+x.currency):'✓ ነፃ'}</span><span>📎 ${(x.required_documents||[]).length} ሰነድ</span></div><div class="service-actions"><button onclick="openServiceRequest('${escService(x.key)}')">Online Apply →</button><button class="details-link" onclick="showServiceDetails('${escService(x.key)}')">ዝርዝር / Details</button></div></article>`).join(''):'<div class="service-card"><h3>አገልግሎት አልተገኘም</h3><p>የፍለጋ መስፈርቱን ይቀይሩ።</p></div>'}
function showServiceDetails(key){const x=serviceCatalog.find(s=>s.key===key);if(!x)return;const docs=(x.required_documents||[]).map(d=>`<li>${escService(d)}</li>`).join('')||'<li>ተጨማሪ ሰነድ አያስፈልግም / No additional document</li>';const m=document.createElement('div');m.className='service-modal';m.id='serviceDetailsModal';m.innerHTML=`<div class="service-modal-card"><button class="modal-close" onclick="document.getElementById('serviceDetailsModal')?.remove()">×</button><span class="kicker">SERVICE DIRECTORY</span><h2>${escService(x.am)}</h2><p class="modal-note">${escService(x.description_am||'')}</p><div class="service-detail-grid"><div class="service-detail-box"><b>ፅ/ቤት / Office</b>${escService(x.office_name_am||'—')}</div><div class="service-detail-box"><b>ጊዜ / Estimated time</b>${Number(x.estimated_days||3)} ቀን / days</div><div class="service-detail-box"><b>ክፍያ / Fee</b>${Number(x.fee||0)>0?escService(x.fee+' '+x.currency):'ነፃ / Free'}</div><div class="service-detail-box"><b>Online Application</b>${x.payment_required?'💳 Payment required':'✓ Available'}</div></div><h3>የሚፈለጉ ሰነዶች / Required documents</h3><ul class="service-detail-list">${docs}</ul><div class="service-actions"><button class="btn btn-primary" onclick="document.getElementById('serviceDetailsModal')?.remove();openServiceRequest('${escService(x.key)}')">Online Apply →</button></div></div>`;document.body.appendChild(m);m.setAttribute('aria-hidden','false')}

async function loadServices(){try{const r=await fetch('/api/public/services'); if(r.ok){serviceCatalog=await r.json();serviceKeyEl.innerHTML=serviceCatalog.map(x=>`<option value="${escService(x.key)}">${escService(x.am)} — ${escService(x.en)}</option>`).join('');const of=document.getElementById('serviceOfficeFilter');const offices=[...new Map(serviceCatalog.map(x=>[x.officeId,{id:x.officeId,am:x.office_name_am||'—'}])).values()];if(of)of.innerHTML='<option value="">ሁሉም ፅ/ቤቶች / All offices</option>'+offices.map(o=>`<option value="${o.id}">${escService(o.am)}</option>`).join('');['serviceSearch','serviceOfficeFilter','serviceFeeFilter'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderPublicServices));['serviceOfficeFilter','serviceFeeFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderPublicServices));renderPublicServices();renderServiceFields();}}catch{}}
function openServiceRequest(key='general'){serviceModal?.classList.add('open');serviceModal?.setAttribute('aria-hidden','false');if(serviceKeyEl){serviceKeyEl.value=key;renderServiceFields()}document.getElementById('fullName')?.focus()}
function closeServiceRequest(){serviceModal?.classList.remove('open');serviceModal?.setAttribute('aria-hidden','true')}
serviceKeyEl?.addEventListener('change',renderServiceFields);
serviceClose?.addEventListener('click',closeServiceRequest); serviceModal?.addEventListener('click',e=>{if(e.target===serviceModal)closeServiceRequest()}); loadServices();
serviceForm?.addEventListener('submit',async e=>{e.preventDefault();serviceResult.textContent='በመላክ ላይ...';const payload=new FormData(e.target);try{const r=await fetch('/api/public/service-requests',{method:'POST',body:payload});const j=await r.json();if(!r.ok)throw Error(j.error||'Error');serviceResult.innerHTML=`<div class="success-box"><b>ተሳክቷል!</b><br>${j.message}<br><strong>${j.reference_no}</strong>${j.payment_required?`<br>💳 ${j.fee} ${j.currency} ክፍያ ያስፈልጋል።`:''}<br>⏱️ የሚጠበቀው፦ ${j.due_date||'—'}</div>`;serviceForm.reset();await loadServices();}catch(err){serviceResult.innerHTML=`<div class="error-box">${escService(err.message)}</div>`}});
document.getElementById('statusForm')?.addEventListener('submit',async e=>{e.preventDefault();const result=document.getElementById('statusResult');result.textContent='በመፈለግ ላይ...';try{const r=await fetch(`/api/public/service-requests/status?reference_no=${encodeURIComponent(document.getElementById('statusRef').value)}&phone=${encodeURIComponent(document.getElementById('statusPhone').value)}`);const j=await r.json();if(!r.ok)throw Error(j.error||'Error');result.innerHTML=`<div class="status-box"><b>${j.service_name_am}</b><span>ሁኔታ፦ ${j.status}</span><small>የተመደበበት ፅ/ቤት፦ ${j.office_name_am||'—'}</small>${j.priority?`<small>ቅድሚያ፦ ${j.priority}</small>`:''}${j.due_date?`<small>የማጠናቀቂያ ቀን፦ ${j.due_date}</small>`:''}${j.admin_note?`<small>${j.admin_note}</small>`:''}<small>የተመዘገበው፦ ${new Date(j.created_at).toLocaleString('am-ET')}</small>${j.status==='Completed'?`<button class="small-btn" type="button" onclick="window.openFeedback('${String(j.reference_no).replace(/'/g,"\\'")}')">⭐ አስተያየት ይስጡ</button>`:''}<div class="request-timeline">${(j.timeline||[]).map(x=>`<div><b>${x.status}</b><small>${new Date(x.created_at).toLocaleString('am-ET')}</small>${x.note?`<span>${x.note}</span>`:''}</div>`).join('')}</div></div>`}catch(err){result.innerHTML=`<div class="error-box">${err.message}</div>`}});

// Institution search
const institutionSearch = document.getElementById("institutionSearch");
institutionSearch?.addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll(".institution-item").forEach(card => {
    card.classList.toggle("hidden", q && !card.textContent.toLowerCase().includes(q));
  });
});

// News ticker pause
const tickerTrack = document.getElementById("tickerTrack");
const tickerPause = document.getElementById("tickerPause");
tickerPause?.addEventListener("click", () => {
  const paused = tickerTrack.classList.toggle("paused");
  tickerPause.textContent = paused ? "▶" : "Ⅱ";
});

// AI assistant prototype
const aiFab = document.getElementById("aiFab");
const aiPanel = document.getElementById("aiPanel");
const aiClose = document.getElementById("aiClose");
const aiForm = document.getElementById("aiForm");
const aiInput = document.getElementById("aiInput");
const aiBody = document.getElementById("aiBody");
function addAiMessage(text, who="bot"){
  const div=document.createElement("div"); div.className="ai-msg "+who; div.textContent=text; aiBody.appendChild(div); aiBody.scrollTop=aiBody.scrollHeight;
}
function aiReply(q){
  const x=q.toLowerCase();
  if(x.includes("ውሃ")||x.includes("water")) return "የውሃ አገልግሎት ክፍያ፣ የደንበኛ መረጃ እና መመሪያ በዲጂታል መሶብ ይገኛል።";
  if(x.includes("ግብር")||x.includes("tax")) return "የገቢዎች ፅ/ቤት የግብር መረጃና መመሪያ ይሰጣል።";
  if(x.includes("ተቋም")||x.includes("institution")) return "በDigital Mesob 12 ዋና ተቋማት ተደራጅተዋል። በተቋማት ክፍል ስም በመፈለግ ያግኙ።";
  if(x.includes("ቅጣት")||x.includes("traffic")) return "የትራፊክ ቅጣት መረጃ በዲጂታል አገልግሎቶች ክፍል ይገኛል።";
  return "ጥያቄዎን ተቀብያለሁ። ይህ AI ረዳት ከአስተዳደሩ ዳታቤዝ/API ጋር ሲገናኝ በቀጥታ የከተማ መረጃን መፈለግ ይችላል።";
}
aiFab?.addEventListener("click",()=>{aiPanel.classList.add("open");aiPanel.setAttribute("aria-hidden","false");aiInput?.focus()});
aiClose?.addEventListener("click",()=>{aiPanel.classList.remove("open");aiPanel.setAttribute("aria-hidden","true")});
aiForm?.addEventListener("submit",e=>{e.preventDefault();const q=aiInput.value.trim();if(!q)return;addAiMessage(q,"user");aiInput.value="";setTimeout(()=>addAiMessage(aiReply(q)),350)});
document.querySelectorAll(".ai-suggestions button").forEach(b=>b.addEventListener("click",()=>{const q=b.textContent;addAiMessage(q,"user");setTimeout(()=>addAiMessage(aiReply(q)),350)}));

// Citizen account portal
const citizenModal=document.getElementById('citizenModal'), citizenBtn=document.getElementById('citizenAccountBtn'), citizenClose=document.getElementById('citizenClose');
const citizenAuthView=document.getElementById('citizenAuthView'), citizenDashboard=document.getElementById('citizenDashboard');
let citizenUser=null;
function citizenOpen(){citizenModal?.classList.add('open');citizenModal?.setAttribute('aria-hidden','false');loadCitizenSession();}
function citizenCloseModal(){citizenModal?.classList.remove('open');citizenModal?.setAttribute('aria-hidden','true')}
citizenBtn?.addEventListener('click',citizenOpen); citizenClose?.addEventListener('click',citizenCloseModal); citizenModal?.addEventListener('click',e=>{if(e.target===citizenModal)citizenCloseModal()});
document.querySelectorAll('.citizen-tab[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.citizen-tab[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.getElementById('citizenLoginForm')?.classList.toggle('hidden',b.dataset.tab!=='login');document.getElementById('citizenRegisterForm')?.classList.toggle('hidden',b.dataset.tab!=='register')}));
document.querySelectorAll('.citizen-tab[data-dtab]').forEach(b=>b.addEventListener('click',()=>citizenDashboardTab(b.dataset.dtab)));
async function citizenApi(url,opts={}){const r=await fetch(url,{credentials:'same-origin',...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Request failed');return j}
async function loadCitizenSession(){try{citizenUser=await citizenApi('/api/citizen/me');showCitizenDashboard();}catch{citizenUser=null;showCitizenAuth();}}
function showCitizenAuth(){citizenAuthView?.classList.remove('hidden');citizenDashboard?.classList.add('hidden')}
function showCitizenDashboard(){citizenAuthView?.classList.add('hidden');citizenDashboard?.classList.remove('hidden');document.getElementById('citizenName').textContent=`${citizenUser.full_name}`;citizenDashboardTab('requests')}
document.getElementById('citizenLoginForm')?.addEventListener('submit',async e=>{e.preventDefault();const box=document.getElementById('citizenLoginResult');box.textContent='በመግባት ላይ...';try{const j=await citizenApi('/api/citizen/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:citizenLoginPhone.value,password:citizenLoginPassword.value})});citizenUser=j.citizen;showCitizenDashboard();loadCitizenIntoRequestForm();}catch(err){box.textContent=err.message}});
document.getElementById('citizenRegisterForm')?.addEventListener('submit',async e=>{e.preventDefault();const box=document.getElementById('citizenRegisterResult');box.textContent='እየተመዘገበ...';try{const j=await citizenApi('/api/citizen/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({full_name:citizenRegName.value,phone:citizenRegPhone.value,email:citizenRegEmail.value,kebele:citizenRegKebele.value,password:citizenRegPassword.value})});citizenUser=j.citizen;showCitizenDashboard();loadCitizenIntoRequestForm();}catch(err){box.textContent=err.message}});
document.getElementById('citizenLogout')?.addEventListener('click',async()=>{await citizenApi('/api/citizen/logout',{method:'POST'});citizenUser=null;showCitizenAuth();});
async function citizenDashboardTab(tab){
  if(!citizenUser)return;
  const c=document.getElementById('citizenDashContent');
  c.innerHTML='<p>በመጫን ላይ...</p>';
  try{
    if(tab==='requests'){
      const rows=await citizenApi('/api/citizen/requests');
      c.innerHTML=`<div class="citizen-list">${rows.length?rows.map(r=>`<div class="citizen-item"><b>${escCitizen(r.service_name_am)}</b><small>Reference: ${escCitizen(r.reference_no)}</small><small>ሁኔታ፦ ${escCitizen(r.status)} · ቅድሚያ፦ ${escCitizen(r.priority||'Normal')}</small><small>ፅ/ቤት፦ ${escCitizen(r.office_name_am||'—')}</small><button class="small-btn" data-citizen-request="${r.id}">ዝርዝር</button></div>`).join(''):'<div class="citizen-item">እስካሁን የላኩት ጥያቄ የለም።</div>'}</div>`;
      c.querySelectorAll('[data-citizen-request]').forEach(b=>b.onclick=()=>citizenRequestDetail(b.dataset.citizenRequest));
      return;
    }
    if(tab==='notifications'){
      const rows=await citizenApi('/api/citizen/notifications');
      c.innerHTML=`<div class="citizen-list">${rows.length?rows.map(r=>`<div class="citizen-item ${r.read_at?'':'notification-unread'}"><b>${escCitizen(r.message)}</b><small>${new Date(r.created_at).toLocaleString('am-ET')}</small>${r.read_at?'':`<button class="small-btn" data-read-notif="${r.id}">እንደተነበበ ምልክት አድርግ</button>`}</div>`).join(''):'<div class="citizen-item">ማሳወቂያ የለም።</div>'}</div>`;
      c.querySelectorAll('[data-read-notif]').forEach(b=>b.onclick=async()=>{await citizenApi('/api/citizen/notifications/'+b.dataset.readNotif+'/read',{method:'POST'});citizenDashboardTab('notifications')});
      return;
    }
    c.innerHTML=`<form class="service-form" id="citizenProfileForm"><input id="cpName" value="${escCitizen(citizenUser.full_name)}" required><input value="${escCitizen(citizenUser.phone)}" disabled><input id="cpEmail" type="email" value="${escCitizen(citizenUser.email||'')}"><input id="cpKebele" value="${escCitizen(citizenUser.kebele||'')}" placeholder="ቀበሌ"><button class="btn btn-primary">መረጃ አስቀምጥ</button><div id="profileResult"></div></form><hr><form class="service-form" id="citizenPasswordForm"><h3>የይለፍ ቃል ቀይር</h3><input id="cpCurrent" type="password" placeholder="የአሁኑ ይለፍ ቃል" required><input id="cpNew" type="password" minlength="10" placeholder="አዲስ ይለፍ ቃል" required><button class="btn btn-primary">ይለፍ ቃል ቀይር</button><div id="passwordResult"></div></form>`;
    document.getElementById('citizenProfileForm').onsubmit=async e=>{
      e.preventDefault();
      try{await citizenApi('/api/citizen/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({full_name:document.getElementById('cpName').value,email:document.getElementById('cpEmail').value,kebele:document.getElementById('cpKebele').value})});
        citizenUser.full_name=document.getElementById('cpName').value; citizenUser.email=document.getElementById('cpEmail').value; citizenUser.kebele=document.getElementById('cpKebele').value; document.getElementById('citizenName').textContent=citizenUser.full_name; document.getElementById('profileResult').textContent='መረጃው ተቀምጧል።';
      }catch(e){document.getElementById('profileResult').textContent=e.message;}
    };
    document.getElementById('citizenPasswordForm').onsubmit=async e=>{
      e.preventDefault();
      try{await citizenApi('/api/citizen/password',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({current_password:document.getElementById('cpCurrent').value,new_password:document.getElementById('cpNew').value})}); document.getElementById('passwordResult').textContent='የይለፍ ቃሉ ተቀይሯል። እንደገና ይግቡ።';}
      catch(e){document.getElementById('passwordResult').textContent=e.message;}
    };
  }catch(e){c.innerHTML=`<div class="error-box">${escCitizen(e.message)}</div>`;}
}
async function citizenRequestDetail(id){
  const c=document.getElementById('citizenDashContent');
  try{
    const r=await citizenApi('/api/citizen/requests/'+id);
    const steps=r.workflow_steps||[];
    const current=r.current_step_key||'';
    const stepHtml=steps.length?`<div class="portal-section"><h4>🔄 የሂደት ደረጃ</h4><div class="portal-steps">${steps.map((s,i)=>{const done=(r.workflow_logs||[]).some(x=>x.step_key===s.key)||s.key===current;const active=s.key===current;return `<div class="portal-step ${done?'done':''} ${active?'active':''}"><span>${done?'✓':i+1}</span><div><b>${escCitizen(s.name_am)}</b><small>${escCitizen(s.name_en)} · ${escCitizen(s.role||'')}</small></div></div>`}).join('')}</div></div>`:'';
    const docs=r.documents?.length?`<div class="portal-section"><h4>📎 የተያያዙ ሰነዶች</h4><div class="portal-docs">${r.documents.map(d=>`<div><span>📄</span><b>${escCitizen(d.original_name)}</b><small>${Math.round((d.size||0)/1024)} KB</small></div>`).join('')}</div></div>`:`<div class="portal-section"><h4>📎 ሰነዶች</h4><p>የተያያዘ ሰነድ የለም።</p></div>`;
    const payments=r.payments?.length?`<div class="portal-section"><h4>💳 ክፍያ</h4>${r.payments.map(p=>`<div class="portal-payment"><div><b>${escCitizen(p.amount)} ${escCitizen(p.currency)}</b><small>${escCitizen(p.reference_no)} · ${escCitizen(p.status)}</small></div>${p.checkout_url&&p.status==='Initiated'?`<a class="small-btn" href="${escCitizen(p.checkout_url)}" target="_blank" rel="noopener">ክፍያ ይፈጽሙ →</a>`:p.status==='Pending'&&Number(p.amount)>0?`<button class="small-btn" data-pay="${p.id}">ክፍያ ጀምር</button>`:''}</div>`).join('')}</div>`:'';
    const history=(r.timeline||[]).length?`<div class="portal-section"><h4>📜 ታሪክ</h4><div class="request-timeline">${r.timeline.map(x=>`<div><b>${escCitizen(x.status)}</b><small>${new Date(x.created_at).toLocaleString('am-ET')}</small>${x.note?`<span>${escCitizen(x.note)}</span>`:''}</div>`).join('')}</div></div>`:'';
    c.innerHTML=`<div class="citizen-item portal-detail"><button class="small-btn" data-back-requests>← ተመለስ</button><div class="portal-detail-head"><div><span class="kicker">APPLICATION</span><h3>${escCitizen(r.service_name_am)}</h3><small>Reference: ${escCitizen(r.reference_no)}</small></div><strong class="portal-status">${escCitizen(r.status)}</strong></div><div class="portal-summary"><div><span>ፅ/ቤት</span><b>${escCitizen(r.office_name_am||'—')}</b></div><div><span>ቅድሚያ</span><b>${escCitizen(r.priority||'Normal')}</b></div><div><span>Due date</span><b>${escCitizen(r.due_date||'—')}</b></div></div><div class="portal-section"><h4>📝 የማመልከቻ መረጃ</h4><p>${escCitizen(r.details||'')}</p>${Object.keys(r.form_data||{}).length?`<div class="portal-form-data">${Object.entries(r.form_data).map(([k,v])=>`<div><span>${escCitizen(k)}</span><b>${escCitizen(v)}</b></div>`).join('')}</div>`:''}</div>${stepHtml}${docs}${payments}${history}</div>`;
    c.querySelector('[data-back-requests]')?.addEventListener('click',()=>citizenDashboardTab('requests'));
    c.querySelectorAll('[data-pay]').forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent='በመጀመር ላይ...';try{const j=await citizenApi('/api/public/payments/'+b.dataset.pay+'/initiate',{method:'POST'});if(j.checkout_url)window.open(j.checkout_url,'_blank','noopener');else alert(j.message||'የክፍያ አቅራቢ አልተዋቀረም።');await citizenRequestDetail(id)}catch(e){alert(e.message);b.disabled=false;b.textContent='ክፍያ ጀምር'}});
  }catch(e){c.innerHTML=`<div class="error-box">${escCitizen(e.message)}</div>`}
}
function escCitizen(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function loadCitizenIntoRequestForm(){try{if(!citizenUser)return;document.getElementById('fullName').value=citizenUser.full_name||'';document.getElementById('phone').value=citizenUser.phone||'';document.getElementById('kebele').value=citizenUser.kebele||'';}catch{}}
const originalOpenServiceRequest=window.openServiceRequest;window.openServiceRequest=function(key='general'){originalOpenServiceRequest?.(key);loadCitizenIntoRequestForm()};

window.openFeedback=async function(reference){const phone=prompt('ለማረጋገጥ የጥያቄውን ስልክ ቁጥር ያስገቡ።');if(!phone)return;const rating=prompt('አገልግሎቱን ከ1 እስከ 5 ደረጃ ይስጡ።');if(!['1','2','3','4','5'].includes(rating))return alert('1–5 ያስገቡ።');const comment=prompt('አስተያየትዎ (ካለ):','')||'';try{const r=await fetch('/api/public/service-requests/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference_no:reference,phone,rating:Number(rating),comment})});const j=await r.json();if(!r.ok)throw Error(j.error||'Error');alert(j.message||'ተቀብሏል።')}catch(e){alert(e.message)}};
