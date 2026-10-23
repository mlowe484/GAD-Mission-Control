/* Mission Control V9: four dedicated experiences, orbit-pilot teaching challenge,
 * and a labeled illustrative 3D Solar System reference viewer.
 * Entirely presentation-layer; certified revision-indexed replays are unchanged. */
(() => {
'use strict';
const $$v9=id=>document.getElementById(id), rad=Math.PI/180;
const page=document.querySelector('.page'), header=page?.querySelector('.topbar'), guide=$$v9('v8Intro');
if(!page||!header||!guide){console.error('V9 prerequisites missing: no tab changes applied');return;}
const css=`
.v9-tabs{position:relative;z-index:5;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:12px 0 16px;background:#081725;border:1px solid #294358;border-radius:13px;padding:7px}
.v9-tab{appearance:none;border:1px solid transparent;border-radius:9px;background:transparent;color:#a9bfd1;cursor:pointer;padding:13px 7px;text-align:center;font-size:12px;font-weight:780;min-width:0}
.v9-tab[aria-selected="true"]{background:#12394d;color:#ecffff;border-color:#529c9e;box-shadow:0 0 0 1px #153e4d}
.v9-tab:focus-visible,.v9-btn:focus-visible,.v9-action:focus-visible,.v9-input:focus-visible{outline:2px solid #7ee6e0;outline-offset:2px}
.v9-tab small{display:block;color:inherit;opacity:.78;font-size:10px;font-weight:500;margin-top:4px}
.v9-panel[hidden]{display:none!important}.v9-panel{min-width:0}.v9-card{background:#0c1b2c;border:1px solid #29455d;border-radius:14px;padding:19px;color:#c1d4e2;margin:10px 0 18px}
.v9-card h2{color:#e5fbff;font-size:23px;margin:4px 0 7px;letter-spacing:-.02em}.v9-card h3{color:#dcf8fa;font-size:15px;margin:10px 0}.v9-card p{font-size:12px;line-height:1.65;margin:6px 0 12px;color:#aac1d3}
.v9-eyebrow{text-transform:uppercase;font-size:10px;font-weight:800;color:#76dcd9;letter-spacing:.16em}.v9-note{padding:10px 13px;background:#112537;border-left:3px solid #75cfd2;border-radius:8px;color:#b1cbda;font-size:11px;line-height:1.55}
.v9-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:11px 0}.v9-toolbar label{display:flex;gap:7px;align-items:center;color:#c3d8e5;font-size:11px}
.v9-btn{background:#12334b;color:#effaff;border:1px solid #46728b;border-radius:8px;font-size:12px;font-weight:700;padding:9px 13px;cursor:pointer}.v9-btn[aria-pressed="true"],.v9-btn:hover{background:#20556e}
.v9-input{background:#102c41;border:1px solid #3b6682;color:#f6ffff;border-radius:7px;padding:7px 9px;font-size:12px;color-scheme:dark}.v9-input option{background:#102c41;color:#f6ffff}
.v9-viewport{width:100%;height:clamp(285px,42vw,510px);display:block;background:radial-gradient(ellipse at 50% 30%,#102b3e,#05101e 80%);border:1px solid #264660;border-radius:10px;touch-action:none}
.v9-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:12px 0}.v9-metric{background:#0b283a;border:1px solid #2a4c63;padding:11px;border-radius:9px;min-width:0}
.v9-metric small{font-size:10px;color:#93b2c8;display:block}.v9-metric strong{display:block;font:750 clamp(13px,1.8vw,20px) ui-monospace,Consolas,monospace;color:#e1ffff;white-space:normal;overflow-wrap:anywhere;margin-top:6px}
.v9-pilot-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(270px,.9fr);gap:15px}.v9-controls{border:1px solid #2b4d62;background:#091d2d;border-radius:12px;padding:14px;align-self:start}
.v9-control-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #233b4e;color:#aec8d8;font-size:12px}.v9-control-row strong{font-family:ui-monospace,Consolas,monospace;color:#e5f9fc}.v9-control-row input[type=range]{width:100%;accent-color:#77e5dc}
.v9-keys{display:grid;grid-template-columns:repeat(3,65px);grid-template-rows:repeat(3,44px);justify-content:center;gap:5px;margin:16px auto}.v9-action{border:1px solid #4b8295;border-radius:8px;background:#15344b;color:#fff;font-size:21px;font-weight:750;cursor:pointer;touch-action:manipulation}.v9-action:active{background:#327893}.v9-key-up{grid-column:2;grid-row:1}.v9-key-left{grid-column:1;grid-row:2}.v9-key-down{grid-column:2;grid-row:2}.v9-key-right{grid-column:3;grid-row:2}
.v9-command-status{font-size:11px;color:#8fb3c9;text-align:center;line-height:1.5}.v9-readouts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
.v9-readouts .v9-metric strong{font-size:14px}.v9-challenge{background:#102b33;border:1px solid #376773;color:#c9eeeb;padding:10px 12px;border-radius:9px;line-height:1.6;font-size:12px;margin-bottom:10px}
.v9-status{background:#10263b;border-radius:8px;color:#c2e7e3;font-size:12px;line-height:1.55;padding:11px;margin-top:9px}
.v9-status.success{background:#123c34;color:#bff7c8;border:1px solid #3f9871}.v9-status.warning{background:#412921;color:#f8c7a7;border:1px solid #85513d}
body.v9-active-learn .rightbar .select-wrap,body.v9-active-pilot .rightbar .select-wrap,body.v9-active-3d .rightbar .select-wrap,body.v9-active-learn .rightbar .mode-tabs,body.v9-active-pilot .rightbar .mode-tabs,body.v9-active-3d .rightbar .mode-tabs{display:none!important}
body:not(.v9-active-learn) #v8ShowGuide{display:none!important}.v9-guide-closed{padding:25px;text-align:center}
@media(max-width:980px){.v9-pilot-layout{grid-template-columns:1fr}.v9-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.v9-tab{font-size:11px;padding:11px 3px}.v9-tab small{font-size:9px}.v9-tabs{gap:3px;padding:5px}.v9-card{padding:12px}.v9-card h2{font-size:19px}.v9-viewport{height:330px}.v9-metrics{gap:6px}.v9-metric{padding:9px}.v9-metric strong{font-size:13px}.v9-keys{grid-template-columns:repeat(3,65px)}}
`;
const style=document.createElement('style');style.id='v9Styles';style.textContent=css;document.head.append(style);
const nav=document.createElement('nav');nav.className='v9-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Mission Control sections');
const tabs=[['learn','Learn','Engine guide'],['2d','2D Missions','Verified replays'],['3d','3D Explorer','Reference view'],['pilot','Pilot Challenge','Fly the GAD']];
const panels={};
for(const [id,title,subtitle] of tabs){
 const btn=document.createElement('button');btn.type='button';btn.className='v9-tab';btn.id='v9Tab-'+id;btn.setAttribute('role','tab');btn.setAttribute('aria-controls','v9Panel-'+id);btn.setAttribute('aria-selected','false');btn.innerHTML=title+'<small>'+subtitle+'</small>';nav.append(btn);
 const panel=document.createElement('section');panel.className='v9-panel';panel.id='v9Panel-'+id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',btn.id);panel.hidden=true;panels[id]=panel;
}
header.after(nav);for(const [id] of tabs)page.append(panels[id]);
// The V8 teaching lab is physically moved under Learn; archived viewer under 2D.
panels.learn.append(guide);
const labModeLabels=guide.querySelectorAll('.v8-modes .v8-mode');
if(labModeLabels.length>=3){labModeLabels[1].textContent='◉ Historical 2D replays: 2D Missions tab';labModeLabels[2].textContent='◇ Interactive 3D reference scene: 3D Explorer tab';}

const hiddenMessage=document.createElement('div');hiddenMessage.className='v9-card v9-guide-closed';hiddenMessage.id='v9GuideClosed';hiddenMessage.innerHTML='<h2>Engine guide hidden</h2><p>Reopen the guide to experiment with K, aperture orientation and mass coupling.</p><button class="v9-btn" id="v9ReopenGuide">Show the engine guide</button>';panels.learn.append(hiddenMessage);
const move=[];for(const el of Array.from(page.children)){if(el===header||el===nav||Object.values(panels).includes(el)||el.classList?.contains('v8-intro'))continue;move.push(el)}
for(const el of move)panels['2d'].append(el);
// Native controls continue to work because the original DOM nodes are retained.
const guideBtn=$$v9('v8ShowGuide');
function syncClosed(){hiddenMessage.hidden=!guide.hidden}
new MutationObserver(syncClosed).observe(guide,{attributes:true,attributeFilter:['hidden']});
$$v9('v9ReopenGuide').addEventListener('click',()=>{if(guide.hidden)guideBtn.click();syncClosed()});
let active='learn';
function setActive(id,{scroll=false}={}){
 if(!panels[id])return;
 active=id;document.body.classList.remove(...tabs.map(t=>'v9-active-'+t[0]));document.body.classList.add('v9-active-'+id);
 for(const [name]of tabs){panels[name].hidden=name!==id;$$v9('v9Tab-'+name).setAttribute('aria-selected',String(name===id));$$v9('v9Tab-'+name).tabIndex=name===id?0:-1}
 if(id!=='2d'&&typeof setPlaying==='function')setPlaying(false);
 if(id==='learn'&&guide.hidden&&$$v9('v8HideFuture')&&!$$v9('v8HideFuture').checked)guideBtn.click();
 if(id==='3d')draw3d();if(id==='pilot')drawPilot();if(scroll)nav.scrollIntoView({block:'start',behavior:'smooth'});
 try{history.replaceState(null,'',location.pathname+'?tab='+id+location.hash)}catch{}
}
for(const [id]of tabs)$$v9('v9Tab-'+id).addEventListener('click',()=>setActive(id,{scroll:true}));
nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const idx=tabs.findIndex(t=>t[0]===active);const i=e.key==='Home'?0:e.key==='End'?3:(idx+(e.key==='ArrowRight'?1:3))%4;const id=tabs[i][0];e.preventDefault();setActive(id);$$v9('v9Tab-'+id).focus()});
$$v9('v8ViewMissions')?.addEventListener('click',()=>setActive('2d',{scroll:true}));
// 3D: rotatable perspective of illustrative circular orbital geometry.
const three=document.createElement('div');three.className='v9-card';three.innerHTML=`<div class="v9-eyebrow">3D EXPLORER / REFERENCE</div><h2>Explore the Solar System in 3D</h2><p>Rotate the scene to learn how heliocentric orbits appear in three dimensions. This reference scene uses approximate orbital distances, inclinations, and circular motion, <strong>not</strong> actual SPICE positions or validated 3D GAD flight telemetry.</p><div class="v9-toolbar"><label>View tilt <input class="v9-input" id="v9Tilt" type="range" min="10" max="85" value="55" aria-label="3D view tilt"></label><label>Rotation <input class="v9-input" id="v9Yaw" type="range" min="0" max="360" value="25" aria-label="3D view rotation"></label><label>Zoom <input class="v9-input" id="v9Zoom" type="range" min="60" max="160" value="105" aria-label="3D zoom"></label><button class="v9-btn" id="v9Spin">Animate planets</button></div><canvas class="v9-viewport" id="v9Space3D" role="img" aria-label="Interactive perspective orbital illustration with Sun and planets"></canvas><div class="v9-note">Educational 3D camera and reference geometry only. Qualified 3D trajectory playback will require a separately exported, revision-tagged XYZ flight dataset and verification evidence. Drag to rotate; use sliders for precise control.</div>`;
panels['3d'].append(three);
const threeCanvas=$$v9('v9Space3D'),threeCtx=threeCanvas.getContext('2d');
let threePhase=0,threeRun=false,threeLast=0,drag3d=null;
const planets=[['Mercury',.39,0.205,7.0,'#b4afb0',1.1],['Venus',.72,.007,3.4,'#e2c59b',1.8],['Earth',1,0,0,'#5ab5fa',2.1],['Mars',1.52,.093,1.85,'#dc875e',1.6],['Jupiter',5.2,.05,1.3,'#d9b294',4.0],['Saturn',9.58,.05,2.5,'#e4c996',3.5],['Uranus',19.2,.05,.77,'#90d4e1',2.5],['Neptune',30.1,.01,1.77,'#7094f3',2.6]];
function fitCanvas(canvas){const b=canvas.getBoundingClientRect(),w=Math.max(300,b.width||600),h=Math.max(200,b.height||380),dpr=Math.min(2,devicePixelRatio||1),iw=Math.round(w*dpr),ih=Math.round(h*dpr);if(canvas.width!==iw||canvas.height!==ih){canvas.width=iw;canvas.height=ih}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c,w,h}}
function draw3d(){if(active!=='3d')return;const {c,w,h}=fitCanvas(threeCanvas);c.clearRect(0,0,w,h);const tilt=Number($$v9('v9Tilt').value)*rad,yaw=Number($$v9('v9Yaw').value)*rad,zoom=Number($$v9('v9Zoom').value)/100;const center=[w*.49,h*.52],scale=Math.min(w/65,h/36)*zoom;
 function p(x,y,z=0){const xx=x*Math.cos(yaw)-y*Math.sin(yaw),yy=x*Math.sin(yaw)+y*Math.cos(yaw);return[center[0]+xx*scale,center[1]+(-yy*Math.cos(tilt)+z*Math.sin(tilt))*scale]}
 // true 3D viewing projection, illustrative orbit phases and inclinations.
 const sorted=planets.slice().reverse();for(const [name,a,ex,inc]of sorted){c.strokeStyle='#49708758';c.lineWidth=1;c.beginPath();for(let i=0;i<=140;i++){let t=i*Math.PI*2/140;const x=a*Math.cos(t),y=a*Math.sin(t)*Math.cos(inc*rad),z=a*Math.sin(t)*Math.sin(inc*rad);const P=p(x,y,z);if(i===0)c.moveTo(...P);else c.lineTo(...P)}c.stroke()}
 for(const [name,a,ex,inc,color,r] of planets){const omega=(1/Math.pow(a,1.5));const t=threePhase*omega+(name.length*13)*rad;const P=p(a*Math.cos(t),a*Math.sin(t)*Math.cos(inc*rad),a*Math.sin(t)*Math.sin(inc*rad));c.beginPath();c.fillStyle=color;c.shadowBlur=9;c.shadowColor=color;c.arc(P[0],P[1],Math.max(2,r),0,Math.PI*2);c.fill();c.shadowBlur=0;c.font='10px system-ui';c.fillStyle='#daeaf3';c.fillText(name,P[0]+r+4,P[1]-r-3)}
 const sun=p(0,0,0);c.shadowBlur=18;c.shadowColor='#ffc76d';c.beginPath();c.fillStyle='#ffcf77';c.arc(...sun,7,0,Math.PI*2);c.fill();c.shadowBlur=0;
 c.font='11px system-ui';c.fillStyle='#98b6c9';c.fillText('Approximate orbital radii in AU · perspective camera',12,h-14);}
['v9Tilt','v9Yaw','v9Zoom'].forEach(id=>$$v9(id).addEventListener('input',draw3d));
$$v9('v9Spin').addEventListener('click',()=>{threeRun=!threeRun;$$v9('v9Spin').textContent=threeRun?'Pause animation':'Animate planets'});
threeCanvas.addEventListener('pointerdown',e=>{drag3d={x:e.clientX,y:e.clientY,yaw:Number($$v9('v9Yaw').value),tilt:Number($$v9('v9Tilt').value)};threeCanvas.setPointerCapture(e.pointerId)});
threeCanvas.addEventListener('pointermove',e=>{if(!drag3d)return;$$v9('v9Yaw').value=String((drag3d.yaw+(e.clientX-drag3d.x)*.38+3600)%360);$$v9('v9Tilt').value=String(Math.max(10,Math.min(85,drag3d.tilt+(e.clientY-drag3d.y)*.28)));draw3d()});
['pointerup','pointercancel'].forEach(k=>threeCanvas.addEventListener(k,()=>{drag3d=null}));
// Interactive orbit challenge: Newtonian point-body gravity and GAD coupling
// computed from uniform-density sphere samples. Does not change archived flights.
const pilot=document.createElement('div');pilot.className='v9-card';pilot.innerHTML=`<div class="v9-eyebrow">PILOT CHALLENGE / EDUCATIONAL SIMULATOR</div><h2>Can you capture the spacecraft into orbit?</h2><p>Steer the aperture and change K while Earth attracts the spacecraft. The gravity-only path is shown in dashed amber. Aim the cone toward Earth to activate repulsion; change the aim to adjust the intercepted mass and push direction.</p><div class="v9-challenge"><strong>Objective:</strong> create a bound, approximately circular orbit with eccentricity below <b>0.18</b>, periapsis at least <b>150 km</b> above the surface, and K switched off. Hold those conditions for 90 simulated seconds to complete the challenge.</div>
 <div class="v9-pilot-layout"><div><canvas class="v9-viewport" id="v9PilotCanvas" role="img" aria-label="Live two dimensional orbit training simulator with spacecraft, Earth, powered trajectory and gravity only baseline"></canvas><div class="v9-toolbar"><button class="v9-btn" id="v9Run">▶ Start flight</button><button class="v9-btn" id="v9ResetPilot">↺ Reset</button><label>Simulation rate <select id="v9Rate" class="v9-input"><option value="20">20 simulated s/s</option><option value="90" selected>90 simulated s/s</option><option value="360">360 simulated s/s</option></select></label></div><div class="v9-metrics"><div class="v9-metric"><small>Elapsed</small><strong id="v9Elapsed">0 s</strong></div><div class="v9-metric"><small>Altitude</small><strong id="v9Altitude">—</strong></div><div class="v9-metric"><small>Speed</small><strong id="v9Speed">—</strong></div><div class="v9-metric"><small>Orbit shape (e)</small><strong id="v9Eccentricity">—</strong></div></div><div class="v9-status" id="v9PilotStatus" role="status" aria-live="polite">Use the arrows or touch buttons, then start the flight.</div><div class="v9-note" style="margin-top:10px">Solid cyan: flight with your commands · dashed amber: same starting state, with natural gravity only. The dotted ring marks Earth’s surface. This is a simplified single-body exercise, not an independently certified mission or full N-body calculation.</div></div>
 <div class="v9-controls"><h3>GAD controls</h3><div class="v9-control-row"><span>Engine K</span><strong id="v9KDisplay">0 / 300</strong></div><div class="v9-control-row"><label for="v9KSlider">Set K (0–300)</label></div><div class="v9-control-row"><input id="v9KSlider" type="range" min="0" max="300" step="1" value="0" aria-label="Pilot engine K"></div><div class="v9-control-row"><span>Aperture axis θ</span><strong id="v9ThetaDisplay">180°</strong></div><div class="v9-control-row"><label for="v9Phi">Cone half-angle φ</label><strong id="v9PhiDisplay">24°</strong></div><div class="v9-control-row"><input id="v9Phi" type="range" min="5" max="180" step="1" value="24" aria-label="Pilot aperture half-angle"></div><div class="v9-keys"><button class="v9-action v9-key-up" data-v9-key="up" aria-label="Increase K">↑</button><button class="v9-action v9-key-left" data-v9-key="left" aria-label="Rotate aperture counterclockwise">←</button><button class="v9-action v9-key-down" data-v9-key="down" aria-label="Decrease K">↓</button><button class="v9-action v9-key-right" data-v9-key="right" aria-label="Rotate aperture clockwise">→</button></div><p class="v9-command-status">↑/↓ change K by 1 · ←/→ rotate θ by 5°<br>Hold Shift for larger steps · Space to play/pause</p><div class="v9-toolbar"><button class="v9-btn" id="v9EngineOff">GAD off (K = 0)</button><button class="v9-btn" id="v9AimEarth">Aim at Earth</button></div><div class="v9-readouts"><div class="v9-metric"><small>Periapsis altitude</small><strong id="v9Peri">—</strong></div><div class="v9-metric"><small>Apoapsis altitude</small><strong id="v9Apo">—</strong></div><div class="v9-metric"><small>Coupled mass</small><strong id="v9Coupled">—</strong></div><div class="v9-metric"><small>GAD acceleration</small><strong id="v9Acceleration">—</strong></div></div><p>Use K = 0 to verify your orbital state; the gauge measures a <em>hypothetical</em> GAD command, not an actual spacecraft engine.</p></div></div>`;
panels.pilot.append(pilot);
const pc=$$v9('v9PilotCanvas');const E=398600.4418,R=6371,N=1400;
// Deterministic equal-volume sphere samples via golden-angle spherical sequence.
const massSamples=[];
for(let i=0;i<N;i++){const f=(i+.5)/N,z=1-2*f,t=i*2.399963229728653;const radial=Math.cbrt(((i*317)%N+.5)/N);const sr=Math.sqrt(1-z*z)*radial;massSamples.push([R*sr*Math.cos(t),R*sr*Math.sin(t),R*radial*z]);}
let pilotState,pilotPath=[],pilotK=0,pilotTheta=180,pilotPhi=24,pilotActive=false,pilotLast=0,pilotHold=0,pilotDone=false,pilotFail=false;
function resetPilot(){pilotState={x:2*R,y:0,vx:-2.1,vy:4.8,t:0};pilotPath=[[pilotState.x,pilotState.y]];pilotK=0;pilotTheta=180;pilotPhi=24;pilotActive=false;pilotLast=0;pilotHold=0;pilotDone=false;pilotFail=false;$$v9('v9Phi').value='24';updatePilotLabels();$$v9('v9Run').textContent='▶ Start flight';drawPilot()}
function orbitInfo(s){const r=Math.hypot(s.x,s.y),v2=s.vx*s.vx+s.vy*s.vy,eps=v2/2-E/r,h=s.x*s.vy-s.y*s.vx,e=Math.sqrt(Math.max(0,1+2*eps*h*h/(E*E))),rp=h*h/E/(1+e),ra=e<1?h*h/E/(1-e):Infinity;return {r,e,rp,ra,eps,h,speed:Math.sqrt(v2)}}
function modelAccel(s){let x=s.x,y=s.y,r=Math.hypot(x,y),gr=-E/(r*r*r),gx=gr*x,gy=gr*y,fx=0,fy=0,count=0;
 if(pilotK>0&&pilotPhi>0){if(pilotPhi>=180){fx=-pilotK*gx;fy=-pilotK*gy;count=N}else {const theta=pilotTheta*rad,ct=Math.cos(theta),st=Math.sin(theta),cmin=Math.cos(pilotPhi*rad);let ax=0,ay=0;for(const [sx,sy,sz] of massSamples){const xx=sx-x,yy=sy-y,zz=sz;const d=Math.sqrt(xx*xx+yy*yy+zz*zz),dot=(xx*ct+yy*st)/d;if(dot>=cmin){const rr=Math.sqrt((x-sx)**2+(y-sy)**2+zz*zz);const coef=E/N/(rr*rr*rr);ax+=(x-sx)*coef;ay+=(y-sy)*coef;count++}}fx=pilotK*ax;fy=pilotK*ay}}
 return {ax:gx+fx,ay:gy+fy,gx,gy,fx,fy,fraction:count/N}}
function doPilotStep(dt){const s=pilotState,a=modelAccel(s);const nx=s.x+s.vx*dt+.5*a.ax*dt*dt,ny=s.y+s.vy*dt+.5*a.ay*dt*dt;
 const b=modelAccel({x:nx,y:ny});s.vx+=(a.ax+b.ax)*dt*.5;s.vy+=(a.ay+b.ay)*dt*.5;s.x=nx;s.y=ny;s.t+=dt;
 if(pilotPath.length===0||Math.hypot(s.x-pilotPath[pilotPath.length-1][0],s.y-pilotPath[pilotPath.length-1][1])>15)pilotPath.push([s.x,s.y]);if(pilotPath.length>5000)pilotPath.shift();
 const o=orbitInfo(s);if(o.r<R+120){pilotFail=true;pilotActive=false;$$v9('v9PilotStatus').className='v9-status warning';$$v9('v9PilotStatus').textContent='Surface safety threshold reached. Reset and try braking or redirecting sooner.'}
 if(o.r>R*17||s.t>72000){pilotFail=true;pilotActive=false;$$v9('v9PilotStatus').className='v9-status warning';$$v9('v9PilotStatus').textContent='The spacecraft left the practice region or exceeded the time limit. Reset to try again.'}
 if(!pilotFail&&pilotK===0&&o.e<.18&&o.rp>=R+150&&o.eps<0){pilotHold+=dt;if(pilotHold>=90){pilotDone=true;pilotActive=false;$$v9('v9PilotStatus').className='v9-status success';$$v9('v9PilotStatus').textContent='Orbit challenge complete! Your simulated vehicle is bound, nearly circular, safely above the surface and holding with GAD off.'}}else pilotHold=0;
}
function fmtOrbit(v){if(!isFinite(v))return 'Unbound';return v<1e4?Math.round(v).toLocaleString()+' km':(v/1000).toFixed(1)+'k km'}
function updatePilotLabels(){const o=orbitInfo(pilotState);$$v9('v9KDisplay').textContent=pilotK+' / 300';$$v9('v9KSlider').value=String(pilotK);$$v9('v9ThetaDisplay').textContent=((pilotTheta%360+360)%360)+'°';$$v9('v9PhiDisplay').textContent=pilotPhi+'°';$$v9('v9Elapsed').textContent=pilotState.t<3600?Math.round(pilotState.t)+' s':(pilotState.t/3600).toFixed(1)+' h';$$v9('v9Altitude').textContent=fmtOrbit(o.r-R);$$v9('v9Speed').textContent=o.speed.toFixed(2)+' km/s';$$v9('v9Eccentricity').textContent=o.e.toFixed(3);$$v9('v9Peri').textContent=fmtOrbit(o.rp-R);$$v9('v9Apo').textContent=fmtOrbit(o.ra-R);
 const a=modelAccel(pilotState);$$v9('v9Coupled').textContent=(100*a.fraction).toFixed(0)+'%';$$v9('v9Acceleration').textContent=(1000*Math.hypot(a.fx,a.fy)).toFixed(1)+' m/s²';if(!pilotDone&&!pilotFail)$$v9('v9PilotStatus').textContent='Target: e < 0.18, periapsis ≥ 150 km, GAD off for 90 s. Current orbit '+(o.eps<0?'is bound.':'is unbound.')+(pilotHold>0?' Holding: '+Math.round(pilotHold)+'/90 s.':'');}
// RK4 baseline in the exact same Newtonian central field, always without GAD.
let baseline=[];function buildBaseline(){baseline=[];let s={x:2*R,y:0,vx:-2.1,vy:4.8};function deriv(z){let r=Math.hypot(z.x,z.y),g=-E/(r*r*r);return{ x:z.vx,y:z.vy,vx:g*z.x,vy:g*z.y}};
 const dt=12;for(let k=0;k<1100;k++){if(k%3===0)baseline.push([s.x,s.y]);if(Math.hypot(s.x,s.y)<R+120)break;const a=deriv(s),b=deriv({x:s.x+a.x*dt/2,y:s.y+a.y*dt/2,vx:s.vx+a.vx*dt/2,vy:s.vy+a.vy*dt/2}),c=deriv({x:s.x+b.x*dt/2,y:s.y+b.y*dt/2,vx:s.vx+b.vx*dt/2,vy:s.vy+b.vy*dt/2}),d=deriv({x:s.x+c.x*dt,y:s.y+c.y*dt,vx:s.vx+c.vx*dt,vy:s.vy+c.vy*dt});s={x:s.x+dt*(a.x+2*b.x+2*c.x+d.x)/6,y:s.y+dt*(a.y+2*b.y+2*c.y+d.y)/6,vx:s.vx+dt*(a.vx+2*b.vx+2*c.vx+d.vx)/6,vy:s.vy+dt*(a.vy+2*b.vy+2*c.vy+d.vy)/6}}}
function drawPilot(){if(active!=='pilot'||!pilotState)return;const {c,w,h}=fitCanvas(pc);c.clearRect(0,0,w,h);
 const zoom=Math.min(w/6.7,h/5.2)/R,centerX=w*.38,centerY=h*.5;
 function proj(x,y){return [centerX+x*zoom,centerY-y*zoom]};
 const earth=proj(0,0),rr=R*zoom;
 c.strokeStyle='#274d6199';c.lineWidth=1;for(let i=1;i<=3;i++){c.beginPath();c.arc(...earth,rr*i,0,Math.PI*2);c.stroke()}
 c.fillStyle='#287ebc';c.beginPath();c.arc(...earth,rr,0,Math.PI*2);c.fill();c.strokeStyle='#a3d9e8';c.lineWidth=1;c.stroke();c.fillStyle='#d8ecf9';c.font='11px system-ui';c.fillText('EARTH',earth[0]-18,earth[1]+4);
 function trace(points,col,dash,wid){c.save();c.strokeStyle=col;c.lineWidth=wid;c.setLineDash(dash);c.beginPath();let begun=false;for(const [x,y]of points){const P=proj(x,y);if(!begun){c.moveTo(...P);begun=true}else c.lineTo(...P)}c.stroke();c.restore()}
 trace(baseline,'#ffbf7899',[5,5],1.4);trace(pilotPath,'#74e8e7',[],2.5);
 const s=pilotState,P=proj(s.x,s.y),size=7;if(P[0]<-70||P[0]>w+70||P[1]<-70||P[1]>h+70){c.fillStyle='#f6bf9f';c.fillText('Ship outside camera range',15,35)}else{
 const a=pilotTheta*rad,half=pilotPhi*rad,ray=130;c.fillStyle='#65d6d620';c.strokeStyle='#65d6d644';c.beginPath();c.moveTo(...P);if(pilotPhi===180)c.arc(...P,ray,0,Math.PI*2);else c.arc(P[0],P[1],ray,-a-half,-a+half,false);c.closePath();c.fill();
 c.save();c.translate(...P);c.rotate(-Math.atan2(s.vy,s.vx));c.fillStyle='#ffffff';c.shadowBlur=12;c.shadowColor='#7af8f1';c.beginPath();c.moveTo(9,0);c.lineTo(-7,-5);c.lineTo(-4,0);c.lineTo(-7,5);c.closePath();c.fill();c.restore();}
 const acceleration=modelAccel(s),mag=Math.hypot(acceleration.fx,acceleration.fy);if(mag&&P[0]>0&&P[0]<w){let l=Math.min(35,Math.max(5,15*Math.sqrt(mag/.01))),q=[P[0]+l*acceleration.fx/mag,P[1]-l*acceleration.fy/mag];c.strokeStyle='#f38c9f';c.lineWidth=2;c.beginPath();c.moveTo(...P);c.lineTo(...q);c.stroke()}
 c.fillStyle='#93b7c9';c.font='10px system-ui';c.fillText('GAD ↗ pink · flown cyan · gravity-only dashed amber',12,h-15);
 updatePilotLabels()}
function action(k){if(k==='up')pilotK=Math.min(300,pilotK+(1));if(k==='down')pilotK=Math.max(0,pilotK-(1));if(k==='left')pilotTheta=((pilotTheta+5)%360);if(k==='right')pilotTheta=((pilotTheta-5+360)%360);drawPilot()}
for(const b of document.querySelectorAll('[data-v9-key]'))b.addEventListener('click',()=>action(b.dataset.v9Key));
window.addEventListener('keydown',e=>{if(active!=='pilot'||/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable)return;
 const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(map[e.key]){e.preventDefault();const multiplier=e.shiftKey?10:1;if(map[e.key]==='up')pilotK=Math.min(300,pilotK+multiplier);else if(map[e.key]==='down')pilotK=Math.max(0,pilotK-multiplier);else if(map[e.key]==='left')pilotTheta=(pilotTheta+5*(e.shiftKey?3:1))%360;else pilotTheta=(pilotTheta-5*(e.shiftKey?3:1)+360)%360;drawPilot()}
 if(e.code==='Space'){e.preventDefault();togglePilot()}if(e.key.toLowerCase()==='r'){e.preventDefault();resetPilot()}});
$$v9('v9KSlider').addEventListener('input',e=>{pilotK=Number(e.target.value);drawPilot()});$$v9('v9Phi').addEventListener('input',e=>{pilotPhi=Number(e.target.value);drawPilot()});$$v9('v9EngineOff').addEventListener('click',()=>{pilotK=0;drawPilot()});$$v9('v9AimEarth').addEventListener('click',()=>{pilotTheta=Math.round((Math.atan2(-pilotState.y,-pilotState.x)/rad+360)%360/5)*5;drawPilot()});
function togglePilot(){if(pilotFail||pilotDone)return;pilotActive=!pilotActive;pilotLast=0;$$v9('v9Run').textContent=pilotActive?'❚❚ Pause flight':'▶ Resume flight'}
$$v9('v9Run').addEventListener('click',togglePilot);$$v9('v9ResetPilot').addEventListener('click',resetPilot);
function animation(now){requestAnimationFrame(animation);if(active==='3d'&&threeRun&&now-threeLast>35){threePhase+=Math.min(.12,(now-threeLast||40)/1000)*.32;draw3d();threeLast=now}else if(active!=='3d')threeLast=now;
 if(active!=='pilot'||!pilotActive){pilotLast=0;return}if(!pilotLast)pilotLast=now;const seconds=Math.min(.065,(now-pilotLast)/1000)*Number($$v9('v9Rate').value);pilotLast=now;
 const n=Math.max(1,Math.ceil(seconds/2)),dt=seconds/n;for(let i=0;i<n&&pilotActive;i++)doPilotStep(dt);if(!pilotActive)$$v9('v9Run').textContent=pilotDone?'✓ Complete':'▶ Restart';drawPilot()}
window.addEventListener('resize',()=>{draw3d();drawPilot()});
buildBaseline();resetPilot();
const q=new URLSearchParams(location.search);const initial=q.get('tab');setActive(panels[initial]?initial:'learn');syncClosed();requestAnimationFrame(animation);
})();