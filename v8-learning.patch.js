/* Mission Control V8: interactive introductory lesson.
   Works as a presentation layer and does not mutate flight-replay physics.
   Gauss-Legendre samples and centroid rules follow the frozen RC44 2D engine,
   evaluated at lower resolution for responsive teaching, not for certification. */
(() => {
'use strict';
const R=Math.PI/180;
const bodies={
 Earth:{radius:6371.0,mu:398600.4418,color:'#2f94de'},
 Moon:{radius:1737.4,mu:4902.8001,color:'#b3b4c4'},
 Mars:{radius:3389.5,mu:42828.3752,color:'#d87958'},
 Mercury:{radius:2439.7,mu:22031.8686,color:'#a8aab2'},
 Jupiter:{radius:69911,mu:126686534.0,color:'#b78b72'},
 Neptune:{radius:24622,mu:6836529.0,color:'#648bd6'}
};
// Nodes and weights computed once from Gauss-Legendre n=20, 0<=r<=1,
// polar alpha 0..pi, azimuth beta 0..2pi, as in GravityApertureDriveV2.
const NODES=[-0.993128599185095, -0.9639719272779138, -0.912234428251326, -0.8391169718222188, -0.7463319064601508, -0.636053680726515, -0.5108670019508271, -0.3737060887154195, -0.2277858511416451, -0.0765265211334973, 0.0765265211334973, 0.2277858511416451, 0.3737060887154195, 0.5108670019508271, 0.636053680726515, 0.7463319064601508, 0.8391169718222188, 0.912234428251326, 0.9639719272779138, 0.993128599185095];
const WEIGHTS=[0.0176140071391509, 0.0406014298003864, 0.0626720483341088, 0.0832767415767047, 0.1019301198172407, 0.1181945319615186, 0.1316886384491769, 0.1420961093183824, 0.1491729864726042, 0.1527533871307263, 0.1527533871307263, 0.1491729864726042, 0.1420961093183824, 0.1316886384491769, 0.1181945319615186, 0.1019301198172407, 0.0832767415767047, 0.0626720483341088, 0.0406014298003864, 0.0176140071391509];
const samples=[];
for(let i=0;i<NODES.length;i++){
 const s=(NODES[i]+1)/2,ws=WEIGHTS[i]/2;
 for(let j=0;j<NODES.length;j++){
  const a=(NODES[j]+1)*Math.PI/2,wa=WEIGHTS[j]*Math.PI/2,sa=Math.sin(a);
  for(let k=0;k<NODES.length;k++){
   const b=(NODES[k]+1)*Math.PI,wb=WEIGHTS[k]*Math.PI;
   samples.push([s*sa*Math.cos(b),s*sa*Math.sin(b),s*s*sa*ws*wa*wb]);
  }
 }
}
const sphereVolume=4*Math.PI/3;
const css=`
.v8-toplink{font-size:11px;white-space:nowrap;background:#0f3045;border:1px solid #41898b;color:#bff7f2;border-radius:8px;padding:8px 12px;font-weight:800}
.v8-intro{margin:14px 0 0;background:linear-gradient(140deg,#122638,#0b1828 63%,#112431);border:1px solid #35576a;border-radius:15px;overflow:hidden;box-shadow:0 15px 45px #0003}
.v8-intro[hidden]{display:none!important}
.v8-intro-head{padding:17px 20px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.v8-eyebrow{font-size:10px;color:#87d7d2;letter-spacing:.18em;font-weight:800;text-transform:uppercase}
.v8-heading{font-size:clamp(19px,2.5vw,29px);font-weight:800;letter-spacing:-.04em;line-height:1.23;margin:4px 0}
.v8-lead{font-size:12px;color:#afc4d8;line-height:1.6;max-width:850px;margin:4px 0 10px}
.v8-head-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.v8-action{background:#173248;border:1px solid #476780;color:#e5faff;font-size:11px;font-weight:750;border-radius:8px;padding:8px 12px;cursor:pointer}
.v8-action:hover{background:#24516a}
.v8-action:focus-visible,.v8-intro input:focus-visible,.v8-intro select:focus-visible{outline:2px solid #8cece7;outline-offset:2px}
.v8-summary-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:0 20px 17px}
.v8-summary-item{border:1px solid #2c4b60;border-radius:9px;padding:11px;background:#0b2131}
.v8-summary-item strong{display:block;font-size:12px;color:#e7fbff;margin-bottom:5px}
.v8-summary-item span{font-size:11px;color:#a8bfd2;line-height:1.55;display:block}
.v8-lab{border-top:1px solid #2d485f;padding:17px 20px 18px}
.v8-lab-head{display:flex;align-items:start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:13px}
.v8-lab-head h3{font-size:16px;margin:0 0 5px;color:#e5faff}
.v8-lab-head p{font-size:11px;color:#98b1c9;line-height:1.55;margin:0;max-width:680px}
.v8-lab-layout{display:grid;grid-template-columns:minmax(290px,1.25fr) minmax(245px,1fr);gap:15px}
.v8-figure{border:1px solid #2a4b61;border-radius:12px;background:#06101e;min-width:0;overflow:hidden}
#v8Diagram{width:100%;height:300px;display:block}
.v8-diagram-labels{display:flex;gap:8px 15px;flex-wrap:wrap;padding:9px 13px;border-top:1px solid #21394d;color:#b5d0df;font-size:10px}
.v8-diagram-labels span{display:flex;align-items:center;gap:6px}
.v8-key{height:8px;width:8px;border-radius:50%;display:inline-block}
.v8-controls{display:flex;flex-direction:column;gap:13px;border:1px solid #284a5d;border-radius:12px;padding:14px;background:#0b1e2e;min-width:0}
.v8-control{display:grid;gap:6px}
.v8-control-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#aabfd1;font-size:11px;font-weight:700}
.v8-control-head output{color:#dcf5f4;font-weight:850;font-family:ui-monospace,Consolas,monospace}
.v8-control input[type=range]{width:100%;accent-color:#7bdddb;cursor:pointer}
.v8-control select{color:#f3fbff!important;background:#143249!important;border:1px solid #3a6076;border-radius:7px;padding:7px;font-size:12px;width:100%;color-scheme:dark}
.v8-control select option{color:#f3fbff;background:#143249}
.v8-presets{display:flex;gap:6px;flex-wrap:wrap}
.v8-presets .v8-action{font-size:10px;padding:6px 8px}
.v8-readout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.v8-stat{background:#101a2d;border:1px solid #2d455e;border-radius:8px;padding:10px;min-width:0}
.v8-stat small{font-size:9px;color:#a1b9cd;display:block;margin-bottom:4px}
.v8-stat strong{color:#def9f7;display:block;font-size:clamp(12px,1.35vw,17px);font-variant-numeric:tabular-nums;white-space:nowrap}
.v8-notice{font-size:11px;line-height:1.55;color:#b8cede;background:#0d2637;padding:10px 12px;border-radius:9px;border-left:3px solid #69d5d2;min-height:49px}
.v8-footnote{margin:13px 0 0;color:#90aabd;font-size:10px;line-height:1.5}
.v8-footer{border-top:1px solid #2a4658;padding:10px 20px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.v8-footer label{display:flex;gap:7px;align-items:center;font-size:11px;color:#bad0e1;cursor:pointer}
.v8-footer input{accent-color:#64d8d0}
.v8-modes{display:flex;gap:9px;flex-wrap:wrap;padding:0 20px 13px}
.v8-mode{display:flex;align-items:center;gap:6px;background:#0b1e2c;border:1px solid #294559;border-radius:6px;padding:7px 9px;color:#b8cbda;font-size:10px}
.v8-mode.active{border-color:#5bbdb5;color:#d4f7f3}
@media(max-width:870px){.v8-summary-row{grid-template-columns:repeat(2,1fr)}.v8-lab-layout{grid-template-columns:1fr}.v8-lab-head{margin-bottom:12px}}
@media(max-width:490px){.v8-intro-head,.v8-lab{padding-left:12px;padding-right:12px}.v8-summary-row{padding-left:12px;padding-right:12px}.v8-summary-row{gap:6px}.v8-summary-item{padding:9px}.v8-footer{padding-left:12px;padding-right:12px}#v8Diagram{height:240px}.v8-stat{padding:8px}.v8-readout{gap:5px}.v8-stat strong{font-size:12px}.v8-heading{font-size:22px}}
`;
const style=document.createElement('style');style.id='v8Styles';style.textContent=css;document.head.appendChild(style);
const wrap=document.createElement('section');wrap.id='v8Intro';wrap.className='v8-intro';wrap.setAttribute('aria-label','Learn the hypothetical gravitational aperture drive');
wrap.innerHTML=`
 <div class="v8-intro-head"><div><div class="v8-eyebrow">MISSION CONTROL • FIELD GUIDE</div><h2 class="v8-heading">Discover the Gravitational Aperture Drive</h2><p class="v8-lead">The GAD is a <strong>hypothetical propulsion model</strong>. It repels a spacecraft away from the center of mass intercepted by a commanded aperture. Explore the controls below, then move into actual saved <em>simulation</em> replays.</p></div><div class="v8-head-actions"><button type="button" class="v8-action" id="v8ViewMissions">Go to flight replays ↓</button><button type="button" class="v8-action" id="v8CloseGuide">Hide guide</button></div></div>
 <div class="v8-modes"><span class="v8-mode active">◉ Learn the engine</span><span class="v8-mode">◉ Historical 2D simulator replays below</span><span class="v8-mode">◇ Validated 3D missions — future section</span></div>
 <div class="v8-summary-row"><div class="v8-summary-item"><strong>K · Amplification</strong><span>Scales the repulsive acceleration generated by the intercepted mass. K = 0 means no GAD acceleration.</span></div><div class="v8-summary-item"><strong>θ · Axis direction</strong><span>Rotates the aperture axis in the inertial 2D X–Y plane. 0° points right; 90° points up.</span></div><div class="v8-summary-item"><strong>φ · Half-opening angle</strong><span>Widens or narrows the intercepted cone. At 180° the engine uses its full-body shortcut.</span></div><div class="v8-summary-item"><strong>Coupling body</strong><span>The modeled celestial body whose intercepted mass the drive pushes away from.</span></div></div>
 <div class="v8-lab"><div class="v8-lab-head"><div><h3>Interactive aperture lab</h3><p>Adjust the commands to see which part of the body lies inside the cone, the estimated centroid, and the resulting direction and strength of GAD acceleration.</p></div><button type="button" class="v8-action" id="v8Reset">Reset example</button></div>
  <div class="v8-lab-layout"><div class="v8-figure"><canvas id="v8Diagram" role="img" aria-label="Interactive schematic of spacecraft, coupling body, aperture cone, mass centroid and outward acceleration"></canvas><div class="v8-diagram-labels"><span><i class="v8-key" style="background:#80e1d4"></i>Aperture axis</span><span><i class="v8-key" style="background:#ffbc80"></i>Intercepted material</span><span><i class="v8-key" style="background:#f6e98f"></i>Mass centroid</span><span><i class="v8-key" style="background:#f38d9e"></i>GAD acceleration</span></div></div>
  <div class="v8-controls"><div class="v8-control"><label class="v8-control-head" for="v8Body">Coupling body</label><select id="v8Body"><option>Earth</option><option>Moon</option><option>Mars</option><option>Mercury</option><option>Jupiter</option><option>Neptune</option></select></div>
  <div class="v8-control"><label class="v8-control-head" for="v8K">Engine strength K <output id="v8KOut">100</output></label><input id="v8K" type="range" min="0" max="300" step="1" value="100"></div>
  <div class="v8-control"><label class="v8-control-head" for="v8Theta">Axis θ <output id="v8ThetaOut">0°</output></label><input id="v8Theta" type="range" min="-180" max="180" step="1" value="0"></div>
  <div class="v8-control"><label class="v8-control-head" for="v8Phi">Half-angle φ <output id="v8PhiOut">8°</output></label><input id="v8Phi" type="range" min="0" max="180" step="1" value="8"></div>
  <div class="v8-control"><label class="v8-control-head" for="v8Distance">Ship distance <output id="v8DistanceOut">4.0 body radii</output></label><input id="v8Distance" type="range" min="2" max="9" step="0.5" value="4"></div>
  <div class="v8-presets"><button type="button" class="v8-action" data-v8preset="partial">Focused beam</button><button type="button" class="v8-action" data-v8preset="full">Whole body</button><button type="button" class="v8-action" data-v8preset="miss">Miss the body</button></div>
  <div class="v8-readout"><div class="v8-stat"><small>Intercepted mass</small><strong id="v8Fraction">—</strong></div><div class="v8-stat"><small>GAD acceleration</small><strong id="v8Accel">—</strong></div><div class="v8-stat"><small>Push direction</small><strong id="v8Direction">—</strong></div></div>
  <div class="v8-notice" id="v8Explanation" role="status" aria-live="off">Adjust the controls to explore the aperture model.</div>
 </div></div><p class="v8-footnote">DEMONSTRATION, NOT A CERTIFIED MISSION. This teaching panel recomputes a coarse 20³-point Gauss–Legendre approximation of the frozen 2D aperture/mass-centroid model. The uniform spherical body and illustrative geometry are separate from the recorded controller trajectories below. Acceleration figures are model outputs, not measurements of real propulsion.</p></div>
 <div class="v8-footer"><label><input type="checkbox" id="v8HideFuture"> Keep this guide hidden next time</label><span style="font-size:10px;color:#92aac0">You can reopen it any time with “Show engine guide” above.</span></div>`;
const page=document.querySelector('.page');const bar=page?.querySelector('.topbar');if(!page||!bar){console.error('V8 guide insertion point missing');return;}
bar.after(wrap);
const show=document.createElement('button');show.className='v8-toplink';show.id='v8ShowGuide';show.textContent='Show engine guide';
const topRight=bar.querySelector('.rightbar')||bar;topRight.prepend(show);
const $=id=>document.getElementById(id);
function storageRead(){try{return localStorage.getItem('gad-v8-hide-guide')==='yes'}catch{return false}}
function storageWrite(v){try{localStorage.setItem('gad-v8-hide-guide',v?'yes':'no')}catch{}}
let raf=0;
let hiddenPreference=storageRead();$('v8HideFuture').checked=hiddenPreference;
function setOpen(isOpen){wrap.hidden=!isOpen;show.textContent=isOpen?'Hide engine guide':'Show engine guide';show.setAttribute('aria-expanded',String(isOpen));if(isOpen)queuePaint();}
setOpen(!hiddenPreference);
show.addEventListener('click',()=>setOpen(wrap.hidden));$('v8CloseGuide').addEventListener('click',()=>setOpen(false));$('v8HideFuture').addEventListener('change',e=>{hiddenPreference=e.target.checked;storageWrite(hiddenPreference);});
$('v8ViewMissions').addEventListener('click',()=>{setOpen(false);document.querySelector('.hero')?.scrollIntoView({block:'start',behavior:'smooth'});});
const controls={K:$('v8K'),theta:$('v8Theta'),phi:$('v8Phi'),distance:$('v8Distance'),body:$('v8Body')};
function setVals(values){for(const [key,val]of Object.entries(values))controls[key].value=val;queuePaint();}
$('v8Reset').addEventListener('click',()=>setVals({K:100,theta:0,phi:8,distance:4,body:'Earth'}));
wrap.querySelectorAll('[data-v8preset]').forEach(b=>b.addEventListener('click',()=>{
 const p=b.dataset.v8preset;
 setVals(p==='full'?{theta:0,phi:180,K:100}:p==='miss'?{theta:90,phi:8,K:100}:{theta:0,phi:8,K:100});
}));
function queuePaint(){if(!wrap.hidden&&!raf)raf=requestAnimationFrame(()=>{raf=0;paint()})}
Object.values(controls).forEach(c=>c.addEventListener('input',queuePaint));
window.addEventListener('resize',queuePaint);
function calculate(theta,phi,distance){
 const th=theta*R,half=phi*R,dx=Math.cos(th),dy=Math.sin(th),d=distance;
 if(phi<=0)return{fraction:0,cx:distance,cy:0,kind:'none'};
 if(phi>=180)return{fraction:1,cx:d,cy:0,kind:'full'};
 const angle=Math.acos(Math.max(-1,Math.min(1,dx))),extent=Math.asin(1/d);
 if(angle>extent+half)return{fraction:0,cx:d,cy:0,kind:'none'};
 if(angle+extent<=half)return{fraction:1,cx:d,cy:0,kind:'full'};
 const mincos=Math.cos(half);let volume=0,px=0,py=0;
 for(let i=0;i<samples.length;i++){
  const a=samples[i],x=d+a[0],y=a[1],mag=Math.hypot(x,y),dot=x*dx+y*dy;
  if(mag<1e-12||(dot>0&&dot/mag>=mincos)){
   volume+=a[2];px+=x*a[2];py+=y*a[2];
  }
 }
 if(volume<=0)return{fraction:0,cx:d,cy:0,kind:'none'};
 const frac=Math.min(1,Math.max(0,volume/sphereVolume));
 return{fraction:frac,cx:px/volume,cy:py/volume,kind:'partial'};
}
function paint(){
 const k=Number(controls.K.value),theta=Number(controls.theta.value),phi=Number(controls.phi.value),dist=Number(controls.distance.value),name=controls.body.value,body=bodies[name];
 $('v8KOut').textContent=String(k);$('v8ThetaOut').textContent=theta+'°';$('v8PhiOut').textContent=phi+'°';$('v8DistanceOut').textContent=dist.toFixed(1)+' body radii';
 const result=calculate(theta,phi,dist);
 const dd=Math.hypot(result.cx,result.cy),ax=dd>0?-result.cx/dd:0,ay=dd>0?-result.cy/dd:0;
 const magnitude=result.fraction>0&&k>0?1000*k*body.mu*result.fraction/(body.radius*body.radius*dd*dd):0;
 const effective=(magnitude>0)?(Math.atan2(ay,ax)/R+360)%360:null;
 $('v8Fraction').textContent=(result.fraction*100).toFixed(result.fraction===0||result.fraction===1?0:1)+'%';
 $('v8Accel').textContent=(magnitude===0?'0':magnitude>=1000?magnitude.toExponential(2):magnitude>=1?magnitude.toFixed(1):magnitude.toFixed(3))+' m/s²';
 $('v8Direction').textContent=effective===null?'No thrust':effective.toFixed(0)+'°';
 const status=result.kind==='full'?'The whole modeled body is intercepted; its centroid is the body center.':result.kind==='none'?'The cone misses the body, so no mass is intercepted and GAD acceleration is zero.':'The aperture intercepts part of the body. Its calculated centroid shifts, changing the repulsive acceleration direction.';
 $('v8Explanation').textContent=k===0?status+' K = 0, so the engine is off regardless of aperture geometry.':status+' Repulsion points away from the intercepted mass centroid.';
 const can=$('v8Diagram'),rect=can.getBoundingClientRect();if(rect.width<1)return;
 const dpr=Math.min(2.5,window.devicePixelRatio||1),w=rect.width,h=rect.height;
 if(can.width!==Math.round(w*dpr)||can.height!==Math.round(h*dpr)){can.width=Math.round(w*dpr);can.height=Math.round(h*dpr)}
 const ctx=can.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const cx=w*.17,cy=h*.54,bodyX=w*.77,bodyY=cy,bodyRad=Math.min(h*.25,w*.15,76),scale=(bodyX-cx)/dist,ray=Math.max(w,h)*1.5;
 ctx.fillStyle='#06111e';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#1b3243';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.stroke();ctx.setLineDash([]);
 // Draw aperture wedge in screen coords, with positive simulator Y pointing up.
 const ang=-theta*R,half=phi*R;
 if(phi>0){
  ctx.fillStyle='#65d6d719';ctx.strokeStyle='#6bcfd04c';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(cx,cy);
  if(phi===180){ctx.arc(cx,cy,ray,0,Math.PI*2)}else ctx.arc(cx,cy,ray,ang-half,ang+half,false);
  ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+ray*Math.cos(ang-half),cy+ray*Math.sin(ang-half));ctx.moveTo(cx,cy);ctx.lineTo(cx+ray*Math.cos(ang+half),cy+ray*Math.sin(ang+half));ctx.stroke();
  ctx.strokeStyle='#7de9dd';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+ray*Math.cos(ang),cy+ray*Math.sin(ang));ctx.stroke();ctx.setLineDash([]);
 }
 // Draw body, then overlay the portion of projected sphere intersecting the cone.
 let fill=ctx.createRadialGradient(bodyX-bodyRad*.32,bodyY-bodyRad*.44,0,bodyX,bodyY,bodyRad);
 fill.addColorStop(0,'#e0edf1');fill.addColorStop(.15,body.color);fill.addColorStop(1,'#153146');
 ctx.fillStyle=fill;ctx.beginPath();ctx.arc(bodyX,bodyY,bodyRad,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(bodyX,bodyY,bodyRad,0,Math.PI*2);ctx.clip();
 if(result.kind==='full'){ctx.fillStyle='#fbb98588';ctx.fillRect(bodyX-bodyRad,bodyY-bodyRad,2*bodyRad,2*bodyRad)}
 else if(result.kind==='partial'){
  // Projected 2D shading is illustrative; mass fraction is volumetric.
  ctx.fillStyle='#ffc58d93';ctx.beginPath();ctx.moveTo(cx,cy);
  ctx.arc(cx,cy,ray,ang-half,ang+half,false);ctx.closePath();ctx.fill();
 }
 ctx.restore();
 ctx.lineWidth=1.7;ctx.strokeStyle='#a9cfe4';ctx.beginPath();ctx.arc(bodyX,bodyY,bodyRad,0,Math.PI*2);ctx.stroke();
 // Centroid from actual low-resolution volume quadrature.
 if(result.fraction>0){
  const mx=cx+result.cx*scale,my=cy-result.cy*scale;
  ctx.fillStyle='#fff19c';ctx.strokeStyle='#1b1e24';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(mx,my,5,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 // Ship and acceleration arrow (length display-scaled, NOT world displacement).
 ctx.fillStyle='#d7fbfa';ctx.shadowBlur=11;ctx.shadowColor='#8be9e6';ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 if(magnitude>0){
  const length=Math.min(w*.24,34+15*Math.log10(1+magnitude));
  const ex=cx+ax*length,ey=cy-ay*length;
  ctx.strokeStyle='#ff899c';ctx.fillStyle='#ff899c';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();
  let dir=Math.atan2(ey-cy,ex-cx);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-9*Math.cos(dir-.42),ey-9*Math.sin(dir-.42));ctx.lineTo(ex-9*Math.cos(dir+.42),ey-9*Math.sin(dir+.42));ctx.closePath();ctx.fill();
 }
 ctx.fillStyle='#d0e8f2';ctx.font='600 11px system-ui';ctx.textAlign='center';ctx.fillText('Spacecraft',cx,Math.min(h-8,cy+32));ctx.fillText(name,bodyX,Math.min(h-8,bodyY+bodyRad+19));
 ctx.font='10px system-ui';ctx.fillStyle='#94acbd';ctx.fillText('Illustrative 2D geometry · not to scale',w/2,16);
}
queuePaint();
})();