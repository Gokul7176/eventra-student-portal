/* DATE & TIME */
function updateClock(){
  const n=new Date();
  const d=n.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const t=n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  document.getElementById('datetime-chip').textContent=d+' · '+t;
  const st=document.getElementById('stat-time');
  if(st)st.textContent='Updated '+t;
}
updateClock();setInterval(updateClock,1000);

/* THEME */
let dark=false;
function toggleTheme(){
  dark=!dark;
  document.getElementById('body').classList.toggle('dark-mode',dark);
  document.getElementById('theme-btn').textContent=dark?'☀️':'🌙';
}

/* NOTIFICATIONS */
function toggleNotif(){
  document.getElementById('notif-panel').classList.toggle('open');
}
document.addEventListener('click',function(e){
  const p=document.getElementById('notif-panel');
  const b=document.getElementById('notif-btn');
  if(p.classList.contains('open')&&!p.contains(e.target)&&!b.contains(e.target))
    p.classList.remove('open');
});

/* COUNTERS */
function runCounters(){
  document.querySelectorAll('.stat-value[data-target]').forEach(el=>{
    const target=+el.dataset.target;
    const prefix=el.dataset.prefix||'';
    const isCurr=el.dataset.format==='currency';
    const dur=1200,step=target/(dur/16);let cur=0;
    const t=setInterval(()=>{
      cur=Math.min(cur+step,target);
      el.textContent=isCurr?prefix+Math.round(cur).toLocaleString('en-IN'):Math.round(cur).toLocaleString('en-IN');
      if(cur>=target)clearInterval(t);
    },16);
  });
  // trigger progress bars
  document.querySelectorAll('.stat-bar-fill').forEach(b=>{
    b.style.width=b.style.getPropertyValue('--w')||'0';
  });
}
new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){runCounters();entries[0].target._obs.disconnect();}
},{ threshold:0.25 }).observe(Object.assign(document.getElementById('dashboard'),
  {_obs:new IntersectionObserver(()=>{})}));
// Simpler approach:
(function(){
  const el=document.getElementById('dashboard');
  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){runCounters();obs.disconnect();}
  },{threshold:0.25});
  obs.observe(el);
})();

/* SLIDER */
let cur=0;const total=4;
const track=document.getElementById('slides-track');
const dotsC=document.getElementById('slide-dots');
for(let i=0;i<total;i++){
  const d=document.createElement('button');
  d.className='slide-dot'+(i===0?' active':'');
  d.setAttribute('aria-label','Slide '+(i+1));
  d.onclick=()=>goTo(i);
  dotsC.appendChild(d);
}
function goTo(n){
  cur=(n+total)%total;
  track.style.transform='translateX(-'+cur*100+'%)';
  document.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));
}
function moveSlide(d){goTo(cur+d);}
let at=setInterval(()=>moveSlide(1),4500);
const sw=document.getElementById('slider-wrap');
sw.addEventListener('mouseenter',()=>clearInterval(at));
sw.addEventListener('mouseleave',()=>{at=setInterval(()=>moveSlide(1),4500);});

/* FORM VALIDATION */
function showErr(id,show){
  const e=document.getElementById('e-'+id);
  const i=document.getElementById('f-'+id)||document.querySelector('[name="'+id+'"]');
  if(e)e.classList.toggle('show',show);
  if(i&&i.id)document.getElementById('f-'+id)?.classList.toggle('err',show);
}
function clearErrors(){
  // Modified for HTML5 Lab Assignment: added new field IDs ('age', 'time')
  ['name','email','phone','password','gender','dob','addr','age','time'].forEach(f=>showErr(f,false));
}

// Modified for HTML5 Lab Assignment: added form reset listener to clear custom elements like contenteditable comments
document.getElementById('reg-form').addEventListener('reset', function() {
  const c = document.getElementById('f-comments');
  if (c) c.textContent = 'Type your comments here...';
  clearErrors();
});

// Modified for HTML5 Lab Assignment: wired up Cancel button to reset form and scroll to home smooth
document.getElementById('btn-cancel')?.addEventListener('click', function() {
  document.getElementById('reg-form').reset();
  document.getElementById('home').scrollIntoView({behavior:'smooth'});
});

document.getElementById('reg-form').addEventListener('submit',function(e){
  e.preventDefault();let ok=true;
  
  // HTML5 Validity based validation where possible, matching original constraints
  const v=(id,test)=>{
    const el=document.getElementById('f-'+id);
    let r=true;
    if(el){
      r=el.checkValidity() && test(el.value||'');
    }
    showErr(id,!r);
    if(!r)ok=false;
  };
  
  v('name',s=>s.trim().length>=2);
  v('email',s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()));
  // Modified for HTML5 Lab Assignment: updated pattern to check for exactly 10-digit number
  v('phone',s=>/^[0-9]{10}$/.test(s.trim()));
  v('password',s=>s.length>=8);
  v('dob',s=>s!=='');
  // Modified for HTML5 Lab Assignment: validate Age input if specified (range min=17 to max=30)
  v('age',s=>s===''||(!isNaN(s)&&Number(s)>=17&&Number(s)<=30));
  // Validate preferred time (optional, check validity of input if present)
  v('time',s=>true);
  v('addr',s=>s.trim().length>=5);
  
  const g=document.querySelector('input[name="gender"]:checked');
  showErr('gender',!g);if(!g)ok=false;
  if(ok){
    const t=document.getElementById('toast');
    t.style.display='block';
    setTimeout(()=>{t.style.display='none';},3200);
    this.reset();
  }
});

/* SCROLL TO TOP */
window.addEventListener('scroll',()=>{
  document.getElementById('back-top').classList.toggle('show',scrollY>400);
});

/* ACTIVE NAV */
const sections=['home','about','services','storage','contact','help'];
const navLinks=document.querySelectorAll('nav a');
const secObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting)
      navLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));
  });
},{threshold:0.4});
sections.forEach(id=>{const el=document.getElementById(id);if(el)secObs.observe(el);});

/* HTML5 DRAG AND DROP */
const dragCards = document.querySelectorAll('.drag-card');
const dropZone = document.getElementById('event-drop-zone');
const dropSuccessMsg = document.getElementById('drop-success-msg');

dragCards.forEach(card => {
  card.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', this.id);
    e.dataTransfer.effectAllowed = 'copy';
  });
});

if (dropZone) {
  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const id = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(id);
    
    if (draggedElement) {
      const categoryName = draggedElement.querySelector('.drag-name').textContent;
      const categoryIcon = draggedElement.querySelector('.drag-icon').textContent;
      
      // Update drop zone content
      this.innerHTML = `
        <div class="drop-zone-content">
          <div class="drop-icon-placeholder" style="animation: spinOnce 1s ease">${categoryIcon}</div>
          <p class="drop-text"><strong>${categoryName}</strong> selected!</p>
        </div>
      `;
      this.classList.add('dropped');
      
      // Show success message
      if (dropSuccessMsg) {
        dropSuccessMsg.textContent = `Successfully selected ${categoryName}!`;
        dropSuccessMsg.classList.add('show');
      }
      
      // Automatically update the Preferred Event Category dropdown
      const selectEl = document.getElementById('store-pref-event');
      if (selectEl) {
        if (categoryName.includes('Technical')) {
          selectEl.value = 'Technical';
        } else if (categoryName.includes('Sports')) {
          selectEl.value = 'Sports';
        } else if (categoryName.includes('Cultural')) {
          selectEl.value = 'Cultural';
        }
      }
    }
  });
}

/* LOCAL STORAGE */
document.getElementById('btn-save-local')?.addEventListener('click', function() {
  const name = document.getElementById('store-name').value.trim();
  const email = document.getElementById('store-email').value.trim();
  const prefEvent = document.getElementById('store-pref-event').value;
  
  if (!name || !email || !prefEvent) {
    showStorageStatus('Please fill in all fields before saving.', true);
    return;
  }
  
  localStorage.setItem('eventraStudentName', name);
  localStorage.setItem('eventraStudentEmail', email);
  localStorage.setItem('eventraPreferredEvent', prefEvent);
  
  showStorageStatus('Data saved successfully to Local Storage.', false);
});

/* SESSION STORAGE */
document.getElementById('btn-save-session')?.addEventListener('click', function() {
  const name = document.getElementById('store-name').value.trim();
  const email = document.getElementById('store-email').value.trim();
  const prefEvent = document.getElementById('store-pref-event').value;
  
  if (!name || !email || !prefEvent) {
    showStorageStatus('Please fill in all fields before saving.', true);
    return;
  }
  
  sessionStorage.setItem('eventraSessionName', name);
  sessionStorage.setItem('eventraSessionEmail', email);
  sessionStorage.setItem('eventraSessionEvent', prefEvent);
  
  showStorageStatus('Data saved successfully to Session Storage.', false);
});

/* RETRIEVE STORED DATA */
document.getElementById('btn-retrieve-data')?.addEventListener('click', function() {
  const localName = localStorage.getItem('eventraStudentName');
  const localEmail = localStorage.getItem('eventraStudentEmail');
  const localEvent = localStorage.getItem('eventraPreferredEvent');
  
  const sessionName = sessionStorage.getItem('eventraSessionName');
  const sessionEmail = sessionStorage.getItem('eventraSessionEmail');
  const sessionEvent = sessionStorage.getItem('eventraSessionEvent');
  
  const resultsPanel = document.getElementById('storage-results-panel');
  
  if (!localName && !localEmail && !localEvent && !sessionName && !sessionEmail && !sessionEvent) {
    if (resultsPanel) {
      resultsPanel.innerHTML = '<div class="no-data-msg">No stored data available.</div>';
    }
    showStorageStatus('No stored data found to retrieve.', true);
    return;
  }
  
  let html = '';
  
  if (localName || localEmail || localEvent) {
    html += `
      <div class="storage-result-block">
        <div class="storage-result-title">Local Storage</div>
        <div class="storage-result-item">
          <span class="storage-result-key">Student Name</span>
          <span class="storage-result-val">${localName || 'Not Set'}</span>
        </div>
        <div class="storage-result-item">
          <span class="storage-result-key">Email</span>
          <span class="storage-result-val">${localEmail || 'Not Set'}</span>
        </div>
        <div class="storage-result-item">
          <span class="storage-result-key">Preferred Event</span>
          <span class="storage-result-val">${localEvent || 'Not Set'}</span>
        </div>
      </div>
    `;
  }
  
  if (sessionName || sessionEmail || sessionEvent) {
    html += `
      <div class="storage-result-block">
        <div class="storage-result-title session">Session Storage</div>
        <div class="storage-result-item">
          <span class="storage-result-key">Student Name</span>
          <span class="storage-result-val">${sessionName || 'Not Set'}</span>
        </div>
        <div class="storage-result-item">
          <span class="storage-result-key">Email</span>
          <span class="storage-result-val">${sessionEmail || 'Not Set'}</span>
        </div>
        <div class="storage-result-item">
          <span class="storage-result-key">Preferred Event</span>
          <span class="storage-result-val">${sessionEvent || 'Not Set'}</span>
        </div>
      </div>
    `;
  }
  
  if (resultsPanel) {
    resultsPanel.innerHTML = html;
  }
  showStorageStatus('Stored data retrieved successfully.', false);
});

/* CLEAR STORED DATA */
document.getElementById('btn-clear-data')?.addEventListener('click', function() {
  localStorage.removeItem('eventraStudentName');
  localStorage.removeItem('eventraStudentEmail');
  localStorage.removeItem('eventraPreferredEvent');
  
  sessionStorage.removeItem('eventraSessionName');
  sessionStorage.removeItem('eventraSessionEmail');
  sessionStorage.removeItem('eventraSessionEvent');
  
  // Clear the result panel
  const resultsPanel = document.getElementById('storage-results-panel');
  if (resultsPanel) {
    resultsPanel.innerHTML = '<div class="no-data-msg">No stored data available.</div>';
  }
  
  // Clear the storage form fields
  const nameEl = document.getElementById('store-name');
  const emailEl = document.getElementById('store-email');
  const eventEl = document.getElementById('store-pref-event');
  
  if (nameEl) nameEl.value = '';
  if (emailEl) emailEl.value = '';
  if (eventEl) eventEl.selectedIndex = 0;
  
  showStorageStatus('Stored Eventra data cleared successfully.', false);
});

// Helper function to show status messages in storage card
function showStorageStatus(msg, isErr) {
  const statusEl = document.getElementById('storage-status-msg');
  if (statusEl) {
    statusEl.textContent = msg;
    statusEl.className = 'storage-status-msg' + (isErr ? ' err' : '');
    setTimeout(() => {
      if (statusEl.textContent === msg) {
        statusEl.textContent = '';
      }
    }, 3000);
  }
}
