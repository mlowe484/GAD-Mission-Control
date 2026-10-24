/* Mission Control V11.2 — independently evidenced, recorded 3D maneuvers.
   Installed INSIDE the existing V9 private closure after V11 training.
   Source data: hash-checked C3L-U/V/W real 31-body guarded trajectories.
   The camera renders recorded Earth-relative 3D states; Hermite interpolation
   between source snapshots is visual only, never new physical integration.
*/
{
 const releaseMark=document.querySelector('#gadProductionRelease strong');
 if(releaseMark)releaseMark.textContent='V11.2 · CURRENT RELEASE';
 document.title='GAD Mission Control · V11.2';
 window.GAD_RECORDED_3D_MANEUVERS=Object.freeze({release:'11.2',count:4,source:'C3L-U/V/W Earth orbit controllers',physicalModelChanged:false,ephemerisChanged:false});
 const root=panels['3d'];
 if(!root)throw Error('3D reference panel missing: cannot install recorded gallery');
 const referenceNodes=Array.from(root.children);
 const style=document.createElement('style');
 style.textContent=`
 .c3l-switch{display:flex;gap:9px;flex-wrap:wrap;align-items:center;padding:12px 0 16px}
 .c3l-switch button,.c3l-button{border:1px solid #315b75;border-radius:9px;background:#123149;color:#d9f3ff;padding:10px 14px;font:650 12px system-ui;cursor:pointer}
 .c3l-switch button[aria-pressed="true"],.c3l-button[aria-pressed="true"]{background:#136a74;border-color:#7ce4e0;color:#fff}
 .c3l-switch-note{font:11px/1.4 system-ui;color:#86abc2}
 .c3l-gallery{background:#0a1929;color:#d9eaf6;border:1px solid #27445b;border-radius:14px;padding:14px;margin:0 0 18px;font-family:system-ui}
 .c3l-gallery h2{font:800 clamp(18px,3vw,24px) system-ui;color:#e8faff;margin:0 0 7px}
 .c3l-kicker{font:800 10px system-ui;letter-spacing:.12em;color:#7ee1df;text-transform:uppercase}
 .c3l-desc{font:11px/1.55 system-ui;color:#9fc4d7;margin:7px 0 12px}
 .c3l-controls{display:grid;grid-template-columns:minmax(170px,2fr) minmax(120px,1fr) minmax(130px,1fr);gap:10px;align-items:end;margin:11px 0}
 .c3l-controls label,.c3l-cam label{font:650 11px system-ui;color:#abcde0;display:grid;gap:5px}
 .c3l-controls select,.c3l-cam input,.c3l-controls input{min-width:0;width:100%;box-sizing:border-box;background:#0d2b40;border:1px solid #325776;border-radius:8px;color:#e7f8ff;padding:8px;color-scheme:dark}
 .c3l-canvas{display:block;box-sizing:border-box;width:100%;height:390px;border:1px solid #385d72;border-radius:10px;background:#061222;touch-action:none}
 .c3l-bar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:12px 0 8px}
 .c3l-bar .c3l-button{padding:8px 11px}
 .c3l-timeline{display:flex;gap:10px;align-items:center;margin:7px 0}
 .c3l-timeline input{width:100%;flex:1;accent-color:#74e6de;min-width:0}
 .c3l-timeline output{font:650 12px ui-monospace,monospace;white-space:nowrap;color:#eaf9ff}
 .c3l-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}
 .c3l-metric{background:#0c293b;border:1px solid #244b63;border-radius:9px;padding:10px;min-width:0}
 .c3l-metric small{display:block;color:#8fbbd0;font:11px system-ui;margin-bottom:4px}
 .c3l-metric strong{display:block;font:750 14px system-ui;color:#effaff;overflow-wrap:anywhere}
 .c3l-cam{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}
 .c3l-cam input{padding:0;height:34px;accent-color:#73e1df}
 .c3l-events{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}
 .c3l-events button{background:#102b3d;border:1px solid #345168;border-radius:7px;color:#c6e1f1;font:11px system-ui;padding:7px 10px;cursor:pointer}
 .c3l-events button:hover{border-color:#84d6e9}
 .c3l-status{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font:650 11px/1.5 system-ui;color:#b3d7e6}
 .c3l-qual{border-top:1px solid #26475b;padding-top:10px;margin-top:10px;font:11px/1.55 system-ui;color:#afcde0}
 .c3l-footnote{font:10px/1.5 system-ui;color:#8db2c8;margin-top:12px}
 .c3l-loading{min-height:22px;font:12px/1.6 system-ui;color:#b7d9ea}
 .c3l-aperture-panel{display:grid;grid-template-columns:1fr auto;gap:6px 14px;margin:8px 0 12px;padding:11px 13px;background:#102838;border:1px solid #35677a;border-radius:9px}
 .c3l-aperture-panel strong{font-size:12px;color:#d5f5ff}
 .c3l-aperture-panel small{display:block;color:#a1c1d2;font:10px/1.5 system-ui}
 .c3l-aperture-panel label{display:flex;align-items:center;gap:7px;white-space:nowrap;font:650 11px system-ui;color:#c4e9ef}
 .c3l-aperture-panel input{accent-color:#77e3ef}
 .c3l-aperture-panel .c3l-pace{grid-column:1/-1;font:10px/1.5 system-ui;color:#9ac3d7}

 .c3l-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#8ee5de;margin-right:4px}
 @media(max-width:740px){.c3l-gallery{padding:10px}.c3l-controls{grid-template-columns:1fr 1fr}.c3l-controls label:first-child{grid-column:1/-1}.c3l-canvas{height:300px}.c3l-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.c3l-cam{grid-template-columns:1fr 1fr}.c3l-cam label:last-child{grid-column:1/-1}}
 `;
 document.head.appendChild(style);
 const selector=document.createElement('div');selector.className='c3l-switch';selector.innerHTML=`<button type="button" id="c3lReference" aria-pressed="true">Solar System Reference</button><button type="button" id="c3lRecorded" aria-pressed="false">Recorded 3D Maneuvers · 4</button><span class="c3l-switch-note">JPL body positions and controller flight evidence are separate views</span>`;
 const gallery=document.createElement('section');gallery.className='c3l-gallery';gallery.hidden=true;gallery.style.display='none';
 gallery.innerHTML=`<div class="c3l-kicker">Controller evidence · C3L-U / C3L-V / C3L-W</div><h2>Recorded 3D Orbit Maneuvers</h2>
 <p class="c3l-desc">Earth-centered flight histories propagated through the real moving-31-body numerical environment using the <strong>hypothetical</strong> GAD model. These are recorded trajectories, not the illustrative reference spacecraft or the Pilot Challenge. Recorded samples are joined by <em>display-only</em> interpolation.</p>
 <div class="c3l-controls"><label>Maneuver<select id="c3lMission"><option>Loading gallery…</option></select></label><label>Playback pacing<select id="c3lRate"><option value="auto" selected>Cinematic · slow burns, fast coasts</option><option value="1">Fixed 1×</option><option value="4">Fixed 4×</option><option value="20">Fixed 20×</option><option value="60">Fixed 60×</option><option value="120">Fixed 120×</option><option value="600">Fixed 600×</option></select></label><label>Camera preset<select id="c3lView"><option value="angled">3D angled</option><option value="top">Inertial XY plane</option><option value="edge">Plane edge-on</option></select></label></div>
 <div id="c3lLoad" class="c3l-loading" role="status">Select Recorded 3D Maneuvers to load its trajectory archive.</div>
 <canvas id="c3lCanvas" class="c3l-canvas" role="img" aria-label="Three-dimensional Earth-relative recorded spacecraft maneuver; rotate by dragging, scroll or pinch to zoom"></canvas>
 <div class="c3l-bar"><button type="button" class="c3l-button" id="c3lPlay">▶ Play</button><button type="button" class="c3l-button" id="c3lRestart">↺ Restart</button><button type="button" class="c3l-button" id="c3lFit">Fit scene</button><span class="c3l-status" id="c3lLeg">Select a flight</span></div>
 <div class="c3l-timeline"><input type="range" id="c3lTime" min="0" max="1" step="0.5" value="0" aria-label="Recorded 3D flight replay timeline"><output id="c3lTimeLabel">00:00 / 00:00</output></div>
 <div class="c3l-cam"><label>Yaw <input type="range" id="c3lYaw" min="0" max="360" step="1" value="27"></label><label>Tilt <input type="range" id="c3lTilt" min="0" max="180" step="1" value="43"></label><label>Zoom <input type="range" id="c3lZoom" min="40" max="180" step="1" value="100"></label></div>
 <div class="c3l-metrics"><div class="c3l-metric"><small>Altitude above Earth</small><strong id="c3lAltitude">—</strong></div><div class="c3l-metric"><small>Relative speed</small><strong id="c3lSpeed">—</strong></div><div class="c3l-metric"><small>Orbital inclination*</small><strong id="c3lInclination">—</strong></div><div class="c3l-metric"><small>GAD K / stage</small><strong id="c3lCommand">—</strong></div></div>
 <div class="c3l-aperture-panel" id="c3lAperturePanel"><div><strong id="c3lApertureTitle">Aperture · GAD off</strong><small id="c3lApertureMeta">No active coupling cone during coast.</small></div><label><input type="checkbox" id="c3lShowCone" checked> Show aperture</label><span class="c3l-pace" id="c3lPace">Cinematic: slower first burn, faster later burns, accelerated coast.</span></div><div class="c3l-status" id="c3lSummary"></div><div id="c3lEvents" class="c3l-events" aria-label="Recorded maneuver stage boundaries"></div>
 <div id="c3lQualification" class="c3l-qual"></div>
 <p class="c3l-footnote"><span class="c3l-dot"></span> Cyan = completed path · blue-gray = recorded future · Coral = powered segments. Gold/teal wireframe = recorded aperture cone geometry (axis, half-angle), displayed during GAD-on segments only. Orange = initial XY orbital reference. Drag to rotate, wheel/pinch to zoom, or use sliders. *Inclination is relative to the initial J2000 inertial XY reference, not Earth's equator. The short preview samples are actual recorded physical states; intermediate animation frames are Hermite interpolation, not additional numerical integration. Earth radius and symbols are schematic. No new flight or hardware validation is implied.</p>`;
 root.insertBefore(selector,root.firstChild);root.insertBefore(gallery,selector.nextSibling);
 const $=id=>gallery.querySelector('#'+id),switchButton=id=>selector.querySelector('#'+id);
 let viewMode='reference',idx=null,current=null,playing=false,clock=0,lastFrame=0,lastDraw=0,loadGeneration=0;
 const R=6371;
 const stateCache=new Map();
 const pad=t=>String(Math.floor(t)).padStart(2,'0');
 const formatClock=sec=>pad(sec/3600)+':'+pad(sec%3600/60)+':'+pad(sec%60);
 const rad2deg=180/Math.PI;
 const vecDot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 const vecNorm=a=>Math.hypot(...a);
 const vecScale=(a,k)=>a.map(v=>v*k);
 const vecCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const vecUnit=a=>{const n=vecNorm(a);return n>1e-12?a.map(v=>v/n):null;};
 // Same construction as frozen gad3d.launch._drive_axis: anchor-center
 // direction plus the projected transverse hint, rotated by offset_rad.
 // The cone is a geometry illustration: intercepted mass/centroid and
 // acceleration are NOT recalculated in this browser.
 function apertureAxis(spacecraft,leg){
   if(!leg||leg.K==null||!Number.isFinite(leg.half_angle_rad)||!Number.isFinite(leg.offset_rad))return null;
   const toward=vecUnit(vecScale(spacecraft,-1));
   if(!toward)return null;
   if(Math.abs(leg.offset_rad)<1e-12)return toward;
   const hint=vecUnit(leg.steering_hint||[]);if(!hint)return null;
   const transverse=vecUnit(hint.map((x,j)=>x-vecDot(hint,toward)*toward[j]));
   if(!transverse)return null;
   return toward.map((v,j)=>Math.cos(leg.offset_rad)*v+Math.sin(leg.offset_rad)*transverse[j]);
 }
 function aperture(c,w,h,state,leg){
   if(!$('c3lShowCone').checked||leg?.K==null)return;
   const ship=[state[1],state[2],state[3]],axis=apertureAxis(ship,leg);if(!axis)return;
   const helper=Math.abs(axis[2])<.9?[0,0,1]:[1,0,0];
   const u=vecUnit(vecCross(axis,helper)),v=u&&vecCross(axis,u);if(!u||!v)return;
   const L=Math.max(1000,Math.min(4200,vecNorm(ship)*.58)),phi=leg.half_angle_rad;
   const ringCenter=ship.map((x,i)=>x+L*axis[i]);
   const radius=L*Math.tan(Math.min(1.3,Math.max(0,phi)));
   const ring=[];for(let j=0;j<=32;j++){
     const a=j*2*Math.PI/32;
     const xyz=ringCenter.map((x,i)=>x+radius*(u[i]*Math.cos(a)+v[i]*Math.sin(a)));
     ring.push(project(xyz,w,h));
   }
   const p=project(ship,w,h),tip=project(ringCenter,w,h);
   c.save();c.lineWidth=1.2;c.globalAlpha=.73;c.strokeStyle='#62e6ed';c.beginPath();
   ring.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();
   c.strokeStyle='#64d7e8a8';c.setLineDash([5,3]);for(let j=0;j<32;j+=4){
     c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(ring[j][0],ring[j][1]);c.stroke();
   }c.setLineDash([]);c.strokeStyle='#ffd38c';c.lineWidth=2;c.globalAlpha=1;
   c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(tip[0],tip[1]);c.stroke();
   c.restore();
 }
 function stageAt(sec){if(!current)return null;let start=0;
   for(let i=0;i<current.commands.length;i++){
     const leg=current.commands[i],end=start+leg.duration_s;
     if(sec<end-1e-7||i===current.commands.length-1)return {leg,start,end,index:i};
     start=end;
   }return null;
 }
 function paceFor(stage){
   if(!stage)return 1;
   const rate=$('c3lRate').value;
   if(rate!=='auto')return Math.max(.01,Number(rate)||1);
   const powered=stage.leg.K!=null;
   if(!powered)return Math.max(.15,stage.leg.duration_s/7.5);
   const poweredBefore=current.commands.slice(0,stage.index).some(c=>c.K!=null);
   return Math.max(.15,stage.leg.duration_s/(poweredBefore?6.5:10));
 }

 const sampleTime=s=>s[0];
 function sampleAt(sec){
  const samples=current?.samples;
  if(!samples?.length)return null;
  if(sec<=samples[0][0])return samples[0];
  if(sec>=samples[samples.length-1][0])return samples[samples.length-1];
  let lo=0,hi=samples.length-1;
  while(lo+1<hi){const mid=(lo+hi)>>1;if(samples[mid][0]<=sec)lo=mid;else hi=mid;}
  const a=samples[lo],b=samples[hi],dt=b[0]-a[0],u=(sec-a[0])/dt,u2=u*u,u3=u2*u;
  const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
  const out=[sec];
  for(let j=1;j<=3;j++)out.push(h00*a[j]+h10*dt*a[j+3]+h01*b[j]+h11*dt*b[j+3]);
  for(let j=1;j<=3;j++){
   const dh00=(6*u2-6*u)/dt,dh10=(3*u2-4*u+1),dh01=(-6*u2+6*u)/dt,dh11=(3*u2-2*u);
   out.push(dh00*a[j]+dh10*a[j+3]+dh01*b[j]+dh11*b[j+3]);
  }
  const leg=commandAt(sec);out.push(leg?.index??a[7],leg?.K!=null?1:0,lo);return out;
 }
 function commandAt(sec){return stageAt(sec)?.leg||null;}
 function camView(){const yaw=Number($('c3lYaw').value)*Math.PI/180,tilt=Number($('c3lTilt').value)*Math.PI/180;
  return {cy:Math.cos(yaw),sy:Math.sin(yaw),ct:Math.cos(tilt),st:Math.sin(tilt)};}
 function project(a,w,h){const {cy,sy,ct,st}=camView();const x=a[0]*cy-a[1]*sy,y=a[0]*sy+a[1]*cy;
  const scale=Math.min(w,h)*0.31/9000*Math.pow(2,(Number($('c3lZoom').value)-100)/20);
  return [w*.5+x*scale,h*.5+(y*ct-a[2]*st)*scale,(y*st+a[2]*ct)*scale];}
 function draw(){if(!current||!gallery.isConnected||viewMode!=='maneuvers'||active!=='3d')return;
  const canvas=$('c3lCanvas'),box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2),w=box.width,h=box.height;
  const rw=Math.max(1,Math.round(w*dpr)),rh=Math.max(1,Math.round(h*dpr));if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;}
  const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.fillStyle='#061523';c.fillRect(0,0,w,h);
  // A schematic inertial XY circle is a reference plane, NOT a GAD trajectory.
  c.save();c.setLineDash([4,7]);c.strokeStyle='#d8a35b66';c.lineWidth=1;c.beginPath();for(let j=0;j<=128;j++){const a=j*2*Math.PI/128,xy=project([6771*Math.cos(a),6771*Math.sin(a),0],w,h);j===0?c.moveTo(xy[0],xy[1]):c.lineTo(xy[0],xy[1]);}c.stroke();c.restore();
  const center=project([0,0,0],w,h),edge=project([R,0,0],w,h),px=Math.max(6,Math.hypot(edge[0]-center[0],edge[1]-center[1]));
  const earthR=Math.min(w,h)*0.31/9000*R*Math.pow(2,(Number($('c3lZoom').value)-100)/20);
  c.save();let gradient=c.createRadialGradient(center[0]-earthR*.25,center[1]-earthR*.38,earthR*.05,center[0],center[1],earthR);
  gradient.addColorStop(0,'#2f91b2');gradient.addColorStop(.68,'#15466b');gradient.addColorStop(1,'#092138');c.fillStyle=gradient;c.strokeStyle='#8ad3ee66';c.lineWidth=1.4;c.beginPath();c.arc(center[0],center[1],earthR,0,Math.PI*2);c.fill();c.stroke();c.restore();
  const full=current.samples,last=full[full.length-1][0];
  // Render from real saved samples. Subdivisions use the same interpolation as the moving marker.
  const points=[];
  const n=Math.max(100,Math.min(700,full.length*6));for(let j=0;j<=n;j++){const t=j*last/n;const s=sampleAt(t);if(s)points.push({t,xyz:[s[1],s[2],s[3]],leg:commandAt(t)});}
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],start=project(a.xyz,w,h),end=project(b.xyz,w,h),powered=b.leg?.K!=null;
   c.strokeStyle=powered?'#f6ab91':b.t<=clock?'#72e6e1':'#607d94aa';
   c.globalAlpha=b.t<=clock?1:.56;c.lineWidth=powered?2.7:2;c.beginPath();c.moveTo(start[0],start[1]);c.lineTo(end[0],end[1]);c.stroke();
  }c.globalAlpha=1;
  const p=sampleAt(clock);if(!p)return;const xy=project([p[1],p[2],p[3]],w,h);
  const a0=project([full[0][1],full[0][2],full[0][3]],w,h),a1=project([full.at(-1)[1],full.at(-1)[2],full.at(-1)[3]],w,h);
  c.save();c.fillStyle='#f7c784';c.beginPath();c.arc(a0[0],a0[1],4,0,Math.PI*2);c.fill();c.fillStyle='#90ffc4';c.beginPath();c.arc(a1[0],a1[1],4,0,Math.PI*2);c.fill();
  // Draw aperture axes in 3D with source-recorded phi/offset/steering hint.
  // Source burn commands are piecewise constant; no cone during actual coasts.
  aperture(c,w,h,p,commandAt(clock));
  c.shadowBlur=14;c.shadowColor='#9cfaff';c.fillStyle='#fff';c.strokeStyle='#37e6e0';c.lineWidth=2;c.beginPath();c.arc(xy[0],xy[1],5.2,0,2*Math.PI);c.fill();c.stroke();c.shadowBlur=0;
  c.font='11px system-ui';c.fillStyle='#cbecf6';c.fillText('EARTH · recorded Earth-relative J2000 frame',13,22);c.fillStyle='#91bbcf';c.fillText('3D flight replay · interpolation between guarded physical samples',13,h-12);c.restore();
 }
 function metrics(){if(!current)return;const s=sampleAt(clock);if(!s)return;const x=s[1],y=s[2],z=s[3],vx=s[4],vy=s[5],vz=s[6];
  const alt=Math.hypot(x,y,z)-R,speed=Math.hypot(vx,vy,vz),hx=y*vz-z*vy,hy=z*vx-x*vz,hz=x*vy-y*vx;
  const mag=Math.hypot(hx,hy,hz),inc=mag?Math.acos(Math.max(-1,Math.min(1,hz/mag)))*180/Math.PI:NaN;
  const leg=commandAt(clock),k=leg?.K;
  $('c3lAltitude').textContent=alt.toLocaleString(undefined,{maximumFractionDigits:1})+' km';
  $('c3lSpeed').textContent=speed.toFixed(3)+' km/s';
  $('c3lInclination').textContent=Number.isFinite(inc)?inc.toFixed(2)+'°':'—';
  $('c3lCommand').textContent=k==null?'OFF · coast':'K = '+k.toFixed(2);
  $('c3lTime').value=String(clock);$('c3lTimeLabel').textContent=formatClock(clock)+' / '+formatClock(current.duration_s);
  $('c3lLeg').textContent=leg?.label||'Flight';$('c3lPlay').textContent=playing?'❚❚ Pause':'▶ Play';
  if(k!=null){
   $('c3lApertureTitle').textContent='Aperture ACTIVE · K '+k.toFixed(2);
   $('c3lApertureMeta').textContent='Half-angle φ '+(leg.half_angle_rad*rad2deg).toFixed(1)+'° · axis offset '+(leg.offset_rad*rad2deg).toFixed(1)+'° · Earth-coupled 3D cone';
  }else{
   $('c3lApertureTitle').textContent='Aperture OFF · gravity-only coast';
   $('c3lApertureMeta').textContent='The recorded controller commands no GAD force during this leg.';
  }
  const stage=stageAt(clock);
  $('c3lPace').textContent=($('c3lRate').value==='auto'?'Cinematic':'Fixed')+' · '+(k==null?'coast':stage?.index===0?'initial burn':'later burn')+' · playback '+paceFor(stage).toFixed(1)+'×'+(k==null?' · cone hidden':' · reconstructed cone axis shown');
 }
 function jumpTo(t){playing=false;lastFrame=0;clock=Math.max(0,Math.min(current?.duration_s||0,t));metrics();draw();}
 function renderEvidence(){if(!current)return;
  const q=current.qualification_details,guard=q.guard_report||{},rk=q.rk45_report||{};
  const ownProof=Boolean(q.gadaoff?.passed),replayMatched=current.qualification==='QUALIFIED_REAL31_ORBIT_REPLAY_MATCHED';
  $('c3lSummary').textContent=`${current.revision} · ${current.source_sample_count} guarded raw states · ${current.render_sample_count} archived preview states · ${current.commands.length} commands · peak K ${current.peak_K.toFixed(2)}`;
  $('c3lQualification').textContent=(replayMatched?'QUALIFIED (matched frozen endpoint): fresh guarded powered flight and independent RK45; prior qualified GAD-off evidence was retained.':'QUALIFIED (new): guarded powered flight, independent RK45 and a fresh two-period continuously guarded GAD-off proof.')+
  ` All ${current.body_count} moving gravitational bodies included. Clearance guard: ${guard.guard_status||'see source'}; RK45 end-position difference: ${typeof rk.position_difference_m==='number'?rk.position_difference_m.toFixed(4)+' m':'unavailable'}. Source 64-bit NPZ SHA-256: ${current.source_sha256.slice(0,16)}…`;
  $('c3lEvents').replaceChildren();for(const e of current.events){if(!/^(BURN|COAST)_(START|END)$/.test(e.type))continue;
   const b=document.createElement('button');b.type='button';b.textContent=e.type.replaceAll('_',' ').toLowerCase()+' · '+formatClock(e.elapsed_s);
   b.title='Jump to recorded command boundary at '+e.elapsed_s.toFixed(3)+' seconds';b.addEventListener('click',()=>jumpTo(e.elapsed_s));$('c3lEvents').appendChild(b);}
 }
 async function loadFlight(id){if(!idx)return;const item=idx.items.find(x=>x.id===id);if(!item)return;let seq=++loadGeneration;playing=false;$('c3lLoad').textContent='Loading recorded states and controller commands…';
  try{let flight=stateCache.get(id);if(!flight){const res=await fetch('./data/3d-maneuvers/'+item.file+'?release=c3lw-2026-10-24');if(!res.ok)throw Error('Flight download HTTP '+res.status);flight=await res.json();if(flight.schema!=='gad-3d-recorded-maneuver-v1'||flight.scenario_id!==id||flight.samples?.length!==item.preview_samples||flight.source_sha256!==item.source_sha256)throw Error('Recorded flight manifest mismatch');stateCache.set(id,flight);}
   if(seq!==loadGeneration)return;current=flight;clock=0;$('c3lTime').max=String(flight.duration_s);$('c3lLoad').textContent='Physical source samples loaded. This canvas interpolates only for visualization; flight qualification uses the source integrator evidence.';renderEvidence();metrics();draw();
  }catch(err){if(seq===loadGeneration){$('c3lLoad').textContent='Unable to load flight: '+err.message;console.error('Recorded 3D gallery loading:',err);}}
 }
 async function openGallery(){if(idx){if(!current)await loadFlight(idx.items[0].id);return;}
  $('c3lLoad').textContent='Loading four orbit manipulation records…';try{const response=await fetch('./data/3d-maneuvers/INDEX.json?release=c3lw-2026-10-24');if(!response.ok)throw Error('Index HTTP '+response.status);
   const data=await response.json();if(data.schema!=='gad-3d-maneuver-gallery-index-v1'||data.items?.length!==4)throw Error('Gallery manifest mismatch');idx=data;
   $('c3lMission').replaceChildren(...data.items.map(item=>{const o=document.createElement('option');o.value=item.id;o.textContent=item.title+' ('+item.revision+')';return o;}));await loadFlight(data.items[0].id);
  }catch(error){$('c3lLoad').textContent='Gallery unavailable: '+error.message;console.error(error);}
 }
 function setMode(mode){viewMode=mode;playing=false;lastFrame=0;
  for(const n of referenceNodes)n.style.display=mode==='maneuvers'?'none':'';
  gallery.hidden=mode!=='maneuvers';gallery.style.display=mode==='maneuvers'?'':'none';
  switchButton('c3lReference').setAttribute('aria-pressed',String(mode==='reference'));
  switchButton('c3lRecorded').setAttribute('aria-pressed',String(mode==='maneuvers'));
  if(mode==='maneuvers')void openGallery();else if(current)metrics();}
 switchButton('c3lReference').addEventListener('click',()=>setMode('reference'));
 switchButton('c3lRecorded').addEventListener('click',()=>setMode('maneuvers'));
 $('c3lMission').addEventListener('change',e=>void loadFlight(e.target.value));
 $('c3lPlay').addEventListener('click',()=>{if(!current)return;if(clock>=current.duration_s)clock=0;playing=!playing;lastFrame=0;metrics();});
 $('c3lRestart').addEventListener('click',()=>jumpTo(0));
 $('c3lFit').addEventListener('click',()=>{$('c3lYaw').value='27';$('c3lTilt').value='43';$('c3lZoom').value='100';draw();});
 $('c3lTime').addEventListener('input',e=>jumpTo(Number(e.target.value)));
 for(const id of ['c3lYaw','c3lTilt','c3lZoom'])$(id).addEventListener('input',draw);
 $('c3lShowCone').addEventListener('change',draw);
 $('c3lRate').addEventListener('change',()=>{metrics();draw();});
 $('c3lView').addEventListener('change',e=>{const angles={angled:[27,43],top:[0,0],edge:[0,90]};const pair=angles[e.target.value]||angles.angled;
  $('c3lYaw').value=String(pair[0]);$('c3lTilt').value=String(pair[1]);draw();});
 const cv=$('c3lCanvas');let pointers=new Map(),touchInitial=null,drag=null;
 cv.addEventListener('wheel',e=>{if(viewMode!=='maneuvers')return;e.preventDefault();$('c3lZoom').value=String(Math.max(40,Math.min(180,Number($('c3lZoom').value)-e.deltaY*.08)));draw();},{passive:false});
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1)drag={x:e.clientX,y:e.clientY,yaw:Number($('c3lYaw').value),tilt:Number($('c3lTilt').value)};
  if(pointers.size===2){const a=[...pointers.values()];touchInitial={dist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),zoom:Number($('c3lZoom').value)};}});
 cv.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&touchInitial){const a=[...pointers.values()];const dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);$('c3lZoom').value=String(Math.max(40,Math.min(180,touchInitial.zoom+25*Math.log2(Math.max(1,dist)/Math.max(1,touchInitial.dist)))));draw();}
  else if(pointers.size===1&&drag){$('c3lYaw').value=String((drag.yaw+(e.clientX-drag.x)*.45+3600)%360);$('c3lTilt').value=String(Math.max(0,Math.min(180,drag.tilt+(e.clientY-drag.y)*.38)));draw();}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(ev,e=>{pointers.delete(e.pointerId);touchInitial=null;drag=null;});
 window.addEventListener('resize',draw);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){playing=false;lastFrame=0;}});
 function animate(now){requestAnimationFrame(animate);if(!playing||viewMode!=='maneuvers'||active!=='3d'||document.hidden||!current){lastFrame=0;return;}
  if(!lastFrame){lastFrame=now;return;}const elapsed=Math.max(0,Math.min(.12,(now-lastFrame)/1000));lastFrame=now;
  // Clamp at the exact recorded command boundary. This guarantees the
  // renderer displays each short burn, even if the surrounding coast is fast.
  const stage=stageAt(clock),speed=paceFor(stage);
  clock=Math.min(current.duration_s,stage?.end??current.duration_s,clock+elapsed*speed);
  if(now-lastDraw>1000/30||clock>=current.duration_s){metrics();draw();lastDraw=now;}
  if(clock>=current.duration_s){playing=false;metrics();}
 }
 requestAnimationFrame(animate);
}