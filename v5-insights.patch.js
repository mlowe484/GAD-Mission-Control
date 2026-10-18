/* Mission Control V5 — explanatory flight director, vector field, capture instruments.
   Adds visualization only. Does NOT change archived RC42 states, commands, physics, or certifications.
   Recorded: state velocity, stage, K, theta, phi.
   Recomputed: intercepted mass centroid/fraction from V4.2 snapshot.
   Derived: uncapped GAD acceleration estimate, single-body Newtonian gravity,
            osculating two-body orbital elements, and narrative heuristics.
*/
const gadV5Style=document.createElement('style');
gadV5Style.textContent=`
.v5-director{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:13px;background:linear-gradient(125deg,#102b3c,#102332 65%,#0c202b);border:1px solid #2d6478;border-radius:12px;padding:13px 15px;margin-bottom:13px;box-shadow:inset 3px 0 0 #7de9e5}
.v5-eyebrow{color:#81c6d2;font-size:10px;letter-spacing:.13em;text-transform:uppercase;font-weight:850}.v5-title{font-weight:840;color:#eafaff;font-size:15px;margin-top:5px}.v5-explain{color:#bdd1e1;font-size:12px;line-height:1.6;margin:7px 0 0;max-width:850px}.v5-status{font-size:10px;color:#8fb4c4;margin-top:7px}.v5-guide-btn{padding:9px 11px;border:1px solid #448398;background:#133d4c;color:#c4fbf5;border-radius:9px;font-size:11px;font-weight:750;white-space:nowrap}
.v5-overlay-controls{position:absolute;right:19px;top:83px;z-index:3;background:#071524dc;border:1px solid #35556b;padding:8px 11px;border-radius:9px;display:flex;gap:12px;align-items:center;pointer-events:auto;color:#bfd7e3;font-size:11px;font-weight:750;backdrop-filter:blur(8px)}.v5-overlay-controls label{display:flex;gap:6px;align-items:center;cursor:pointer}.v5-overlay-controls input{accent-color:#78e6df}
.v5-insights{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.v5-insights .panel{padding:18px 19px}.v5-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}.v5-head h2{font-size:15px;margin:0}.v5-subtitle{color:#90abc0;font-size:11px;line-height:1.5}.v5-legend{display:flex;flex-wrap:wrap;gap:9px 14px;margin:12px 0}.v5-legend label{font-size:11px;color:#bbd1df;display:inline-flex;gap:7px;align-items:center;cursor:pointer}.v5-legend input{accent-color:#76eee4}.v5-swatch{display:inline-block;width:15px;height:3px;border-radius:3px;vertical-align:middle;margin-right:3px}.v5-readings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v5-reading{background:#081827;border:1px solid #294057;border-radius:9px;padding:11px 12px;min-width:0}.v5-reading small{display:block;color:#98adc1;text-transform:uppercase;letter-spacing:.06em;font-size:9px}.v5-reading b{display:block;color:#e9f6ff;margin-top:5px;font-size:19px;white-space:nowrap}.v5-reading em{display:block;color:#819cb2;font-size:10px;margin-top:2px;font-style:normal}.v5-footnote{color:#8199ae;font-size:10px;line-height:1.55;margin:10px 0 0}.v5-orbit-title{font-size:12px;font-weight:750;color:#b9f4e3;padding:10px 11px;background:#0e2a2a;border:1px solid #27534b;border-radius:8px;margin:9px 0}.v5-orbit-title.warn{background:#312619;border-color:#65512e;color:#f7d3a0}.v5-orbit-title.neutral{background:#122033;border-color:#2e445d;color:#c2d7e7}.v5-orbit-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v5-orbit-columns .v5-reading b{font-size:17px}.v5-speedline{height:11px;border-radius:30px;background:#213247;position:relative;overflow:hidden;margin:12px 0 7px}.v5-speedline span{position:absolute;top:0;bottom:0;left:50%;background:#71e6dc;width:0;min-width:0;transition:width .1s}.v5-speedline i{position:absolute;left:50%;top:0;bottom:0;border-left:2px solid #e5f6ff;opacity:.6}.v5-orbit-note{color:#aabbd0;font-size:11px;line-height:1.5}.v5-fineprint{font-size:10px;color:#8fa5b8;margin-top:10px;line-height:1.55}.v5-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}.v5-snapshot{font-size:10px;color:#9bc8c3;background:#15363b;border:1px solid #346a6a;border-radius:7px;padding:8px 10px;font-weight:700}.v5-provenance{font-size:10px;color:#9bb5c7;line-height:1.6;margin:8px 0 0;border-top:1px solid #2a4155;padding-top:9px}.v5-provenance strong{color:#d9f3fc}
@media(max-width:900px){.v5-insights{grid-template-columns:1fr}}@media(max-width:760px){.v5-director{grid-template-columns:1fr}.v5-guide-btn{justify-self:start}.v5-overlay-controls{top:100px;right:9px;padding:7px 9px}.v5-insights .panel{padding:14px}.v5-reading b{font-size:17px}}
`;
document.head.appendChild(gadV5Style);

const v5Director=document.createElement('div');v5Director.className='v5-director';
v5Director.innerHTML=`<div><div class="v5-eyebrow">FLIGHT DIRECTOR · WHAT'S HAPPENING?</div><div class="v5-title" id="v5DirectorTitle">Interpreting mission telemetry</div><p class="v5-explain" id="v5DirectorBody">Move the timeline or start playback to understand the mission.</p><div class="v5-status" id="v5DirectorSource">Explanation based on recorded and derived flight data</div></div><button type="button" class="v5-guide-btn" id="v5NextMoment">Next milestone →</button>`;
el('chapters').before(v5Director);

const v5Controls=document.createElement('div');v5Controls.className='v5-overlay-controls';
v5Controls.innerHTML='<label><input type="checkbox" id="v5ShowVectors" checked> Motion arrows</label>';
el('visual').appendChild(v5Controls);

const v5Instruments=document.createElement('section');v5Instruments.className='v5-insights';v5Instruments.setAttribute('aria-label','Flight dynamics and capture diagnostics');
v5Instruments.innerHTML=`
<section class="panel" aria-label="Velocity and acceleration vectors"><div class="v5-head"><h2>Flight dynamics</h2><span class="v5-subtitle">Direction arrows + numerical readings</span></div>
<div class="v5-legend">
<label><input type="checkbox" id="v5VecVelocity" checked><span class="v5-swatch" style="background:#69e9f6"></span> Inertial velocity</label>
<label><input type="checkbox" id="v5VecRelative" checked><span class="v5-swatch" style="background:#ffc46e"></span> Target-relative velocity</label>
<label><input type="checkbox" id="v5VecGAD" checked><span class="v5-swatch" style="background:#83f2b4"></span> GAD repulsion</label>
<label><input type="checkbox" id="v5VecGravity"><span class="v5-swatch" style="background:#c5a0ff"></span> Local-body gravity</label>
</div>
<div class="v5-readings">
<div class="v5-reading"><small>Heliocentric speed · replay</small><b id="v5Helio">—</b><em>km/s</em></div>
<div class="v5-reading"><small>Target-relative speed · replay</small><b id="v5Relative">—</b><em>km/s</em></div>
<div class="v5-reading"><small>Uncapped GAD model estimate</small><b id="v5GADAccel">—</b><em>m/s² · not replay acceleration</em></div>
<div class="v5-reading"><small>Local body gravity contribution</small><b id="v5GravAccel">—</b><em>m/s² · one modeled body</em></div>
</div><p class="v5-footnote">Arrow lengths are normalized independently for visibility. Compare the numerical readings—not arrow lengths—to judge magnitude. Repulsion points away from the recomputed intercepted-mass centroid; this is not a new simulation run.</p></section>
<section class="panel" aria-label="Orbital capture and insertion diagnostics"><div class="v5-head"><h2>Capture and orbit health</h2><span class="v5-subtitle" id="v5CaptureBody">Relative to destination</span></div>
<div class="v5-orbit-title neutral" id="v5OrbitState">Awaiting capture</div>
<div class="v5-orbit-columns">
<div class="v5-reading"><small>Radial speed</small><b id="v5Vr">—</b><em>km/s · negative is inbound</em></div>
<div class="v5-reading"><small>Tangential speed</small><b id="v5Vt">—</b><em>km/s · signed</em></div>
<div class="v5-reading"><small>Two-body periapsis altitude</small><b id="v5Peri">—</b><em>km · osculating estimate</em></div>
<div class="v5-reading"><small>Two-body apoapsis altitude</small><b id="v5Apo">—</b><em>km · unbound = none</em></div>
<div class="v5-reading"><small>Eccentricity</small><b id="v5Ecc">—</b><em>0 = circular; ≥1 = unbound</em></div>
<div class="v5-reading"><small>Specific orbital energy</small><b id="v5Energy">—</b><em>km²/s² · negative = bound</em></div>
</div><div class="v5-speedline" aria-hidden="true"><span id="v5RadialBar"></span><i></i></div>
<div class="v5-orbit-note" id="v5OrbitNote">Target-relative orbital elements will update during replay.</div>
<div class="v5-provenance"><strong>Evidence:</strong> The independently verified GAD-off capture certificate is separate from these instantaneous, two-body estimates. These elements are not a collision forecast or a new verification.</div>
<div class="v5-actions"><button class="v5-snapshot" type="button" id="v5CopySnapshot">Copy engineering snapshot</button><span class="v5-footnote" id="v5CopyStatus" role="status"></span></div>
</section>`;
document.querySelector('.lower').before(v5Instruments);

// Compute live vectors from recorded/interpolated craft state and archived RC42 quadrature snapshots.
function v5VectorDynamics(t,s,cmd){
 const rrel=[s[1]-s[7],s[2]-s[8]], dist=Math.hypot(...rrel);
 const er=dist>0?[rrel[0]/dist,rrel[1]/dist]:[1,0]; const et=[-er[1],er[0]];
 const vInertial=[s[3],s[4]];
 const vRelative=[s[12]*er[0]+s[13]*et[0],s[12]*er[1]+s[13]*et[1]];
 const gravBody=(t<M.departure_end_s)?M.source:M.destination;
 const bx=gravBody===M.source?s[5]:s[7],by=gravBody===M.source?s[6]:s[8];
 const mu=gravBody===M.source?M.source_mu:M.dest_mu;
 const bodyDist=Math.hypot(s[1]-bx,s[2]-by);
 const g=Math.max(bodyDist,1)>0 ? mu*1000/(bodyDist*bodyDist) : 0;
 const gDir=bodyDist>0?[(bx-s[1])/bodyDist,(by-s[2])/bodyDist]:[0,0];
 let gad=[0,0],gadUncapped=0,frac=0,centroid=null,body=cmd?.[2]||'';
 const mass=gadCentroidAt(t,cmd);
 if(mass&&cmd[1]&&cmd[3]>0){
  const src=body.toLowerCase()===M.source.toLowerCase();
  const dst=body.toLowerCase()===M.destination.toLowerCase();
  if(src||dst){
   const cbx=src?s[5]:s[7],cby=src?s[6]:s[8],cmu=src?M.source_mu:M.dest_mu;
   const dx=s[1]-(cbx+mass.x),dy=s[2]-(cby+mass.y),d=Math.hypot(dx,dy);
   frac=Math.max(0,Math.min(1,mass.fraction));centroid=[cbx+mass.x,cby+mass.y];
   if(d>0){gadUncapped=cmd[3]*frac*cmu*1000/(d*d);gad=[dx/d,dy/d];}
  }
 }
 return {vInertial,vRelative,gravitationalDirection:gDir,gravity:g,gravityBody:gravBody,gadDirection:gad,gadUncapped,centroid,fraction:frac,er,et};
}
function v5OrbitalElements(s){
 const r=s[10],vr=s[12],vt=s[13],mu=M.dest_mu,rad=M.dest_radius_km;
 if(!Number.isFinite(r)||!Number.isFinite(vr)||!Number.isFinite(vt)||r<=rad)return null;
 const energy=.5*(vr*vr+vt*vt)-mu/r, h=r*vt, term=Math.max(0,1+2*energy*h*h/(mu*mu));
 const e=Math.sqrt(term); if(!Number.isFinite(e))return null;
 let peri,apo=null;
 if(energy<-1e-12 && e<1){ const a=-mu/(2*energy);peri=a*(1-e)-rad;apo=a*(1+e)-rad; }
 else {peri=h*h/(mu*(1+e))-rad;}
 return {r,vr,vt,energy,e,peri,apo,bound:energy<0&&e<1};
}
function v5Signed(n,d=2){return !Number.isFinite(n)?'—':(n>=0?'+':'−')+fmt(Math.abs(n),d);}
function v5Alt(n){if(n===null||!Number.isFinite(n))return '—';if(Math.abs(n)>1e7)return fmt(n/1e6,1)+'M';if(Math.abs(n)>1e4)return fmt(n/1000,1)+'K';return fmt(n,0);}
function v5Narration(t,s,cmd,vec,orb){
 const phase=chapterFromTime(t).id, dst=M.destination,src=M.source;
 if(phase==='prelaunch')return ['Preparing to leave '+src,`This is a derived stable departure orbit, not a recorded Stage 0. Watch the spacecraft circle ${src} before the first saved powered command. GAD is off.`,'Illustrative pre-launch orbit · not archived commands'];
 if(phase==='departure'){
  if(cmd[1]&&vec.fraction>0)return ['Powered departure from '+src,`The aperture couples to ${fmt(vec.fraction*100,1)}% of ${src}'s modeled mass. K = ${fmt(cmd[3],1)}; the spacecraft is repelled away from the intercepted-mass centroid. The recorded departure controller is shaping the outbound velocity.`,'θ, φ and K recorded · centroid recomputed'];
  return ['Completing the departure',`The vehicle is transitioning from the powered launch toward its long transfer. The next stage is coasting without a coupled GAD command.`,'Recorded trajectory and stage'];
 }
 if(phase==='cruise'){
  const elapsed=t/86400;
  const passed=N.filter(n=>n.t<=t).length;
  return ['Coasting toward '+dst,`GAD is off during this recorded coast. ${fmt(elapsed,1)} flight days have elapsed, and ${passed} archived navigation assessments have occurred. The moving bodies and route trace show how the encounter geometry evolves.`,'Recorded cruise samples · archived navigation log'];
 }
 if(phase==='capture'){
  const inbound=s[12]<0; const radialGad=vec.gadDirection[0]*vec.er[0]+vec.gadDirection[1]*vec.er[1];
  const tangGad=vec.gadDirection[0]*vec.et[0]+vec.gadDirection[1]*vec.et[1];
  const radialLine=`Radial velocity is ${v5Signed(s[12],2)} km/s (${inbound?'moving inward':'moving outward'}); tangential velocity is ${v5Signed(s[13],2)} km/s.`;
  if(cmd[1]&&vec.fraction>0){
   const push=radialGad>0.1?'outward':radialGad<-.1?'inward':'mainly sideways';
   return [`Coupled ${dst} capture`,`${radialLine} The recorded GAD command produces a ${push} repulsion component${Math.abs(tangGad)>.12?' with a tangential component that changes angular momentum':''}. These components help explain the shift from incoming flight to orbital insertion.`,'Recorded radial/tangential state · recomputed force direction'];
  }
  return ['Approaching orbital insertion',`${radialLine} The current command has GAD disabled. Check the two-body orbital estimates for how close the state is to a bound orbit.`,'Recorded state · two-body orbital estimate'];
 }
 return ['Independently verified GAD-off orbit',`The recorded insertion is complete. This post-shutdown orbit is a derived visualization spanning the archive's ${fmt(M.cert_observed_s/3600,2)}-hour audit window. Independent replay verification—not the drawn orbit—establishes the capture result.`,'Derived verification window · archived audit certificate'];
}
let v5LastDetailsTime=-1,v5LastDetailsMission='',v5LastDetailsProgress=-1,v5LastCopy=null;
function v5UpdateDetails(t,s,cmd,isDerived,force=false){
 if(!M)return;
 const now=typeof performance!=='undefined'?performance.now():0;
 if(!force && v5LastDetailsMission===M.id && Math.abs(progress-v5LastDetailsProgress)<.012 && now-v5LastDetailsTime<150)return;
 v5LastDetailsTime=now;v5LastDetailsMission=M.id;v5LastDetailsProgress=progress;
 const vec=v5VectorDynamics(t,s,cmd),o=v5OrbitalElements(s),phase=chapterFromTime(t).id;
 const [title,paragraph,source]=v5Narration(t,s,cmd,vec,o);
 el('v5DirectorTitle').textContent=title;el('v5DirectorBody').textContent=paragraph;el('v5DirectorSource').textContent=source;
 el('v5Helio').textContent=fmt(Math.hypot(...vec.vInertial),2);
 el('v5Relative').textContent=fmt(Math.hypot(...vec.vRelative),2);
 el('v5GADAccel').textContent=cmd[1]&&vec.fraction>0?fmt(vec.gadUncapped,vec.gadUncapped<.01?5:2):'OFF';
 el('v5GravAccel').textContent=fmt(vec.gravity,vec.gravity<.01?6:3);
 el('v5CaptureBody').textContent='Relative to '+M.destination;
 el('v5Vr').textContent=v5Signed(s[12]);el('v5Vt').textContent=v5Signed(s[13]);
 el('v5Peri').textContent=o?v5Alt(o.peri):'—';
 el('v5Apo').textContent=o?v5Alt(o.apo):'—';
 el('v5Ecc').textContent=o?fmt(o.e,o.e<10?4:2):'—';
 el('v5Energy').textContent=o?v5Signed(o.energy,o.energy<100?3:1):'—';
 const status=el('v5OrbitState'),note=el('v5OrbitNote');status.className='v5-orbit-title';
 if(phase==='prelaunch'||phase==='departure'||phase==='cruise'){
  status.classList.add('neutral');status.textContent='Transfer phase — no capture certification inferred';
  note.textContent='Target-centered two-body estimates are shown for comparison. During interplanetary flight, they do not describe the complete N-body trajectory.';
 }else if(phase==='verified'){
  status.textContent='GAD-off orbit independently verified';
  note.textContent=`The archived audit found altitude from ${fmt(M.cert_min_alt_km,2)} to ${fmt(M.cert_max_alt_km,2)} km. Calculated elements above are additional approximations.`;
 }else if(o&&o.bound){
  if(o.peri<0){status.classList.add('warn');status.textContent='Instantaneous two-body path intersects body';}
  else {status.textContent='Two-body bound orbit estimate';}
  note.textContent=`The instantaneous target-relative energy is negative. ${o.peri<0?'Estimated periapsis lies beneath the nominal body radius; a powered maneuver can change it.':'Periapsis and apoapsis are calculated from the present velocity and position.'}`;
 }else{
  status.classList.add('warn');status.textContent='Unbound instantaneous two-body path';
  note.textContent='Capture is still underway; being unbound at this moment does not mean the mission fails. The powered aperture can change energy and angular momentum.';
 }
 const scale=Math.max(1,Math.abs(s[12]),Math.abs(s[13]));const pct=clamp(50*s[12]/scale,-50,50);let bar=el('v5RadialBar');bar.style.left=(pct<0?50+pct:50)+'%';bar.style.width=Math.abs(pct)+'%';bar.style.background=pct<0?'#efad74':'#7ee8b6';
 v5LastCopy={version:'Mission Control V5',model:'hypothetical RC42 2D GAD',mission:M.id,t_s:t,stage:phase,provenance:{velocity:'archived or interpolated',centroid:'recomputed from RC42 quadrature at command start',GADAcceleration:'derived uncapped estimate',gravity:'single-body contribution',orbit:'instantaneous target-relative two-body'}, command:{active:Boolean(cmd[1]),body:cmd[2],K:cmd[3],theta_degrees:cmd[4],phi_degrees:cmd[5]}, centroid_mass_fraction:vec.fraction,radial_kms:s[12],tangential_kms:s[13],heliocentric_velocity_kms:vec.vInertial,uncapped_gad_acceleration_mps2:vec.gadUncapped,body_gravity_mps2:vec.gravity,osculating_orbit:o};
}
function v5DrawArrow(c,x,y,direction,len,color,label,dpr){
 const mag=Math.hypot(direction[0],direction[1]);if(!mag||!Number.isFinite(mag))return;
 const ux=direction[0]/mag,uy=direction[1]/mag;
 const ox=x+ux*20*dpr,oy=y+uy*20*dpr,ex=ox+ux*len*dpr,ey=oy+uy*len*dpr;
 c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=2.4*dpr;c.shadowColor=color;c.shadowBlur=5*dpr;
 c.beginPath();c.moveTo(ox,oy);c.lineTo(ex,ey);c.stroke();
 c.beginPath();c.moveTo(ex,ey);c.lineTo(ex-ux*10*dpr-uy*5*dpr,ey-uy*10*dpr+ux*5*dpr);c.lineTo(ex-ux*10*dpr+uy*5*dpr,ey-uy*10*dpr-ux*5*dpr);c.closePath();c.fill();
 c.shadowBlur=0;c.font=`${Math.round(10*dpr)}px system-ui`;c.textAlign='left';c.fillText(label,ex+5*dpr,ey-5*dpr);
 c.restore();
}
const _v5OldRenderCanvas=renderCanvas;
renderCanvas=function(s,t,cmd){
 _v5OldRenderCanvas(s,t,cmd);
 if(!el('v5ShowVectors').checked||!frameCam)return;
 const [px,py]=interpScreen(frameCam,s[1],s[2]);
 if(px<-150||px>W+150||py<-150||py>H+150)return;
 const v=v5VectorDynamics(t,s,cmd), dpr=devicePixelRatio;
 const use=(id)=>el(id).checked;
 if(use('v5VecVelocity'))v5DrawArrow(ctx,px,py,v.vInertial,53,'#69e9f6','v',dpr);
 if(use('v5VecRelative'))v5DrawArrow(ctx,px,py,v.vRelative,46,'#ffc46e','v rel',dpr);
 if(use('v5VecGAD')&&cmd[1]&&v.gadUncapped>0)v5DrawArrow(ctx,px,py,v.gadDirection,39,'#83f2b4','GAD',dpr);
 if(use('v5VecGravity'))v5DrawArrow(ctx,px,py,v.gravitationalDirection,34,'#c5a0ff','g',dpr);
};
const _v5OldRenderTelemetry=renderTelemetry;
renderTelemetry=function(t,s,i,cmd,j,isDerived){
 _v5OldRenderTelemetry(t,s,i,cmd,j,isDerived);
 v5UpdateDetails(t,s,cmd,isDerived);
};
function v5NextMilestone(){if(!M)return;setPlaying(false);const now=progressToTime(progress);const upcoming=visibleEvents().filter(e=>e.t>now+1);if(upcoming.length){setProgress(timeToProgress(upcoming[0].t));}else{setProgress(0);}}
el('v5NextMoment').addEventListener('click',v5NextMilestone);
for(const id of ['v5ShowVectors','v5VecVelocity','v5VecRelative','v5VecGAD','v5VecGravity'])el(id).addEventListener('change',()=>render());
el('v5CopySnapshot').addEventListener('click',async()=>{
 if(!v5LastCopy)return;
 try{await navigator.clipboard.writeText(JSON.stringify(v5LastCopy,null,2));el('v5CopyStatus').textContent='Snapshot copied';}
 catch(e){const a=document.createElement('textarea');a.value=JSON.stringify(v5LastCopy,null,2);a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();el('v5CopyStatus').textContent=ok?'Snapshot copied':'Clipboard unavailable';}
});
const _v5OldUpdateHero=updateHero;
updateHero=function(){_v5OldUpdateHero();v5LastDetailsMission='';};
const _v5OldSetProgress=setProgress;
setProgress=function(p){_v5OldSetProgress(p);if(M){const t=progressToTime(progress),[s,idx,derived]=stateAt(t),[cmd]=commandAt(t);v5UpdateDetails(t,s,cmd,derived,true);}};
// Existing mission panel and aperture instrumentation remain unchanged.