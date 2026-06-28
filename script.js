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
  ['name','email','phone','password','gender','dob','addr'].forEach(f=>showErr(f,false));
}
document.getElementById('reg-form').addEventListener('submit',function(e){
  e.preventDefault();let ok=true;
  const v=(id,test)=>{const r=test(document.getElementById('f-'+id)?.value||'');showErr(id,!r);if(!r)ok=false;};
  v('name',s=>s.trim().length>=2);
  v('email',s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()));
  v('phone',s=>/^\+?[\d\s-]{10,14}$/.test(s.trim()));
  v('password',s=>s.length>=8);
  v('dob',s=>s!=='');
  v('addr',s=>s.trim().length>=5);
  const g=document.querySelector('input[name="gender"]:checked');
  showErr('gender',!g);if(!g)ok=false;
  if(ok){
    const t=document.getElementById('toast');
    t.style.display='block';
    setTimeout(()=>{t.style.display='none';},3200);
    this.reset();clearErrors();
  }
});

/* SCROLL TO TOP */
window.addEventListener('scroll',()=>{
  document.getElementById('back-top').classList.toggle('show',scrollY>400);
});

/* ACTIVE NAV */
const sections=['home','dashboard','services','register','reports','contact'];
const navLinks=document.querySelectorAll('nav a');
const secObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting)
      navLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));
  });
},{threshold:0.4});
sections.forEach(id=>{const el=document.getElementById(id);if(el)secObs.observe(el);});