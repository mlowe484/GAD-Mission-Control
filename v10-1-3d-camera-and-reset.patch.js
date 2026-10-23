/* Mission Control V10.1 — 3D subsystem camera, stable P6F moon trails,
   optional reference craft, scrub/reset, and scenario-preserving pilot reset.
   Runs inside the V9 closure AFTER V10's patch, never changes ephemeris or flight evidence. */
{
 const releaseMarker=document.getElementById('gadProductionRelease');
 if(releaseMarker){const strong=releaseMarker.querySelector('strong');if(strong)strong.textContent='V10.2 · CURRENT RELEASE';}
 document.title='GAD Mission Control · V10.2';
 
 // V10.2: eliminate straight-chord aliasing in the legacy display subset.
 // The true native P6F resampling will take precedence when source velocity
 // vectors are available; this is a visually smooth *derived interpolation*.
 const v102BaselineMoonSampler=v10BodySample;
 v10BodySample=function(data,name,t){
  const body=data?.bodies?.[name];
  if(!body || body.unit!=='km' || !Array.isArray(body.coords))return v102BaselineMoonSampler(data,name,t);
  const u=Math.max(0,Math.min(body.samples-1,(t-data.t0_tdb_s)/(body.hours*3600)));
  const i=Math.min(body.samples-2,Math.floor(u)),f=u-i,a=body.coords,j=i*3,k=(i+1)*3;
  const p=[a[j],a[j+1],a[j+2]],q=[a[k],a[k+1],a[k+2]];
  const rp=Math.hypot(...p),rq=Math.hypot(...q);
  if(!(rp>0&&rq>0))return v102BaselineMoonSampler(data,name,t);
  const dot=Math.max(-1,Math.min(1,(p[0]*q[0]+p[1]*q[1]+p[2]*q[2])/(rp*rq)));
  const arc=Math.acos(dot),s=Math.sin(arc);
  if(s<1e-7)return v102BaselineMoonSampler(data,name,t);
  const radius=rp+(rq-rp)*f,c0=Math.sin((1-f)*arc)/s/rp,c1=Math.sin(f*arc)/s/rq;
  return p.map((v,n)=>radius*(v*c0+q[n]*c1));
 };
 
 const css=document.createElement('style');css.textContent=`
 .v101-options{display:flex;gap:9px;flex-wrap:wrap;align-items:end;margin:8px 0 11px}
 .v101-options label{color:#d7edfa;font:600 11px system-ui;display:flex;gap:7px;align-items:center}
 .v101-options input[type=checkbox]{accent-color:#8cebe6;width:16px;height:16px}
 .v101-options button{background:#14394d;border:1px solid #46758a;border-radius:8px;padding:8px 11px;color:#e4f8ff;cursor:pointer;font-weight:650;font-size:12px}
 .v101-options button:hover{background:#1c5069}
 .v101-scrub{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;background:#0a2233;padding:10px;border:1px solid #294758;border-radius:9px;margin:8px 0}
 .v101-scrub label,.v101-scrub output{color:#badbe9;font:11px system-ui}
 .v101-scrub input{min-width:0;width:100%;accent-color:#83e9e5}
 .v101-help{font:11px/1.55 system-ui;color:#9bc4d9;margin:8px 0}
 .v101-zoom{color:#b0d7e8;font:11px system-ui;min-width:92px}
 @media(max-width:670px){.v101-scrub{grid-template-columns:1fr}.v101-options{gap:8px}}
 `;document.head.appendChild(css);
 // V9 had registered an original resetPilot function object directly as a
 // click handler. Merely rebinding resetPilot in V10 did NOT replace it.
 // Intercept the reset button before that stale listener fires.
 $$v9('v9ResetPilot').addEventListener('click',event=>{
   event.stopImmediatePropagation();
   resetPilot(); // V10-selected scenario initializer, not V9's orbit-fixer state
 },true);
 // Keep scenario selection and reset synchronized, including user-visible metrics.
 const originalSelect=v10SelectChallenge;
 v10SelectChallenge=function(key){originalSelect(key);};
 // Add reference-craft visibility + a camera home command.
 const options=document.createElement('div');options.className='v101-options';
 options.innerHTML=`<label title="The white craft is not a recorded 3D mission"><input type="checkbox" id="v101ShipVisible"> Show illustrative spacecraft</label>
 <button type="button" id="v101Reset">↺ Reset 3D view</button>
 <button type="button" id="v101Fit">Fit selected system</button>
 <span class="v101-zoom" id="v101ZoomText">1.0× zoom</span>`;
 three.insertBefore(options,threeCanvas);
 const shipToggle=$$v9('v101ShipVisible'),resetBtn=$$v9('v101Reset'),fitBtn=$$v9('v101Fit'),zoomText=$$v9('v101ZoomText');
 shipToggle.checked=false;
 const shipLabel=$$v9('v10ShipHost').closest('label');
 const refreshShipSelect=()=>{ $$v9('v10ShipHost').disabled=!shipToggle.checked;
  if(shipLabel)shipLabel.style.opacity=shipToggle.checked?'1':'.45';};
 refreshShipSelect();shipToggle.addEventListener('change',()=>{refreshShipSelect();draw3d()});
 const yawSlider=$$v9('v9Yaw'),tiltSlider=$$v9('v9Tilt'),zoomSlider=$$v9('v9Zoom');
 tiltSlider.min='0';tiltSlider.max='180';
 // Exponential scale is critical when switching between heliocentric and
 // subsystems with diameters spanning several orders of magnitude.
 zoomSlider.min='15';zoomSlider.max='220';zoomSlider.step='1';zoomSlider.value='100';
 zoomSlider.setAttribute('aria-label','Exponential 3D subsystem zoom');
 zoomSlider.title='100 = fit, 116 = 2×, 132 = 4×, 164 = 16×';
 const zoomFactor=()=>Math.pow(2,(Number(zoomSlider.value)-100)/16);
 const updateZoom=()=>{zoomText.textContent=zoomFactor().toFixed(zoomFactor()>10?0:1)+'× zoom';};
 zoomSlider.addEventListener('input',updateZoom);updateZoom();
 // V9 had bound the original draw3d FUNCTION OBJECT to each slider. When
 // those input handlers fire, they overwrite the new JPL image with V9's
 // invented circular orbit scene. Capture slider events and render once
 // through the current 3D implementation instead.
 for(const control of [yawSlider,tiltSlider,zoomSlider])control.addEventListener('input',event=>{
  event.stopImmediatePropagation();if(control===zoomSlider)updateZoom();draw3d();
 },true);
 // Scrubbing uses the actual reference epoch. This never changes P6F data.
 const scrub=document.createElement('div');scrub.className='v101-scrub';
 scrub.innerHTML=`<label for="v101Time">Reference timeline</label><input id="v101Time" type="range" min="0" max="3652" step="1" value="1" aria-label="JPL reference date timeline"><output id="v101TimeLabel">2026-10-22</output>`;
 const note=document.createElement('p');note.className='v101-help';note.textContent='Drag to rotate and tilt, scroll or pinch to zoom, or use the zoom slider. Trails come from the supplied JPL coordinates, sampled at each moon’s orbital timescale (not uniform 12-hour snapshots). The optional craft is illustrative.';
 three.insertBefore(scrub,threeCanvas);three.insertBefore(note,threeCanvas);
 const timeSlider=$$v9('v101Time'),timeLabel=$$v9('v101TimeLabel');
 const referenceStart=Date.UTC(2026,9,21),msDay=86400000;
 function syncTimeline(){if(!v10Primary)return;
  const d=Math.max(0,(v10ClockSec-v10Primary.t0_tdb_s)/86400);
  timeSlider.value=String(Math.round(d));const label=new Date(referenceStart+d*msDay).toISOString().slice(0,10);
  timeLabel.textContent=label;
 }
 timeSlider.addEventListener('input',()=>{
  if(!v10Primary)return;
  v10ClockSec=Math.min(v10Primary.t1_tdb_s,v10Primary.t0_tdb_s+Number(timeSlider.value)*86400);
  const d=new Date(referenceStart+Number(timeSlider.value)*msDay).toISOString().slice(0,10);
  v10DateElem.value=d;timeLabel.textContent=d;draw3d();
 });
 // Accurate focus scale (AU): choose full subsystem on initial focus, then
 // allow a wide exponential zoom range and independent yaw/tilt updates.
 const halfspan={Sun:35,Earth:.0052,Moon:.0018,Mars:.00042,Jupiter:.027,Saturn:.029,Uranus:.0088,Neptune:.009,Pluto:.0016,
   Io:.0015,Europa:.0016,Ganymede:.0025,Callisto:.0037,Titan:.0035,Iapetus:.0068,Mimas:.00095,Enceladus:.001,Tethys:.0015,Dione:.0018,Rhea:.0022,Triton:.0022};
 const spanOf=(body)=>halfspan[body]||((v10MoonData?.bodies?.[body]) ? .0025 : .015);
 // Add all moon targets once ephemeris chunks are loaded, without inventing moon positions.
 let lastMoonTargetCount=0;
 function addMoonTargets(){if(!v10MoonData)return;
  const names=Object.keys(v10MoonData.bodies);if(names.length===lastMoonTargetCount)return;
  lastMoonTargetCount=names.length;
  const focus=$$v9('v10Focus'),group=document.createElement('optgroup');group.label='Moon close-ups';
  names.sort((a,b)=>a.localeCompare(b)).forEach(name=>{if(!Array.from(focus.options).some(o=>o.value===name)){
    const opt=document.createElement('option');opt.value=name;opt.textContent=name+' ('+v10MoonData.bodies[name].parent+')';group.appendChild(opt);
  }});focus.appendChild(group);
 }
 const v101PreviousDraw=draw3d;
 const originalFocus=$$v9('v10Focus');
 originalFocus.addEventListener('change',()=>{zoomSlider.value='100';updateZoom();});
 fitBtn.addEventListener('click',()=>{zoomSlider.value='100';updateZoom();draw3d()});
 function reset3d(){threeRun=false;$$v9('v9Spin').textContent='Play ephemeris';v10Anchor='Sun';originalFocus.value='Sun';
  v10ShipHost='Earth';$$v9('v10ShipHost').value='Earth';shipToggle.checked=false;refreshShipSelect();
  $$v9('v10Moons').checked=false;
  v10DateElem.value='2026-10-22';yawSlider.value='25';tiltSlider.value='55';zoomSlider.value='100';
  $v9('v10JplRate').value='10800';updateZoom();if(v10Primary)v10SetTimeFromDate(v10DateElem.value);syncTimeline();draw3d();}
 resetBtn.addEventListener('click',reset3d);
 // Improved input handling: the original V9 pointer gestures only supported
 // one drag and clamped tilt to 10-85. Capture handlers supersede them.
 threeCanvas.style.touchAction='none';const activePointers=new Map();let drag=null,pinchStart=null;
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 const clampZoom=v=>clamp(Math.round(v),Number(zoomSlider.min),Number(zoomSlider.max));
 threeCanvas.addEventListener('wheel',e=>{
  if(active!=='3d')return;
  e.preventDefault();zoomSlider.value=String(clampZoom(Number(zoomSlider.value)-Math.sign(e.deltaY)*6));updateZoom();draw3d();
 },{capture:true,passive:false});
 threeCanvas.addEventListener('pointerdown',e=>{
  e.stopImmediatePropagation();activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{threeCanvas.setPointerCapture(e.pointerId)}catch{}
  if(activePointers.size===1)drag={x:e.clientX,y:e.clientY,yaw:Number(yawSlider.value),tilt:Number(tiltSlider.value)};
  if(activePointers.size===2){const pts=Array.from(activePointers.values());pinchStart={distance:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y),zoom:Number(zoomSlider.value)};}
 },true);
 threeCanvas.addEventListener('pointermove',e=>{
  if(!activePointers.has(e.pointerId))return;
  e.stopImmediatePropagation();activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(activePointers.size===2&&pinchStart){const p=Array.from(activePointers.values());const dist=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);
   zoomSlider.value=String(clampZoom(pinchStart.zoom+16*Math.log2(Math.max(1,dist)/Math.max(1,pinchStart.distance))));updateZoom();draw3d();
  }else if(activePointers.size===1&&drag){yawSlider.value=String((drag.yaw+(e.clientX-drag.x)*.42+3600)%360);
   tiltSlider.value=String(clamp(drag.tilt+(e.clientY-drag.y)*.36,0,180));draw3d();}
 },true);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])threeCanvas.addEventListener(type,e=>{
  activePointers.delete(e.pointerId);pinchStart=null;drag=null;
  if(activePointers.size===1){const p=Array.from(activePointers.values())[0];drag={...p,yaw:Number(yawSlider.value),tilt:Number(tiltSlider.value)};}
 },true);
 // Draw body-relative, time-centered trails directly from JPL sampled states.
 // Crucial: unlike V10's fixed 12-hour interval for all moons, the temporal
 // step is a fraction of the body's actual Kepler-scale period. This avoids
 // severe aliasing for <1-day moons and shifting / vanishing trails.
 function parentOf(name){return v10Primary?.bodies[name]?.parent||v10MoonData?.bodies?.[name]?.parent||null;}
 function getTrajSample(name,tk){return v10Vector(name,tk);}
 function periodSeconds(name,t){const host=parentOf(name),mu=v10Mu[host];if(!host||!mu)return 0;
  const position=v10Vector(name,t),h=v10Vector(host,t);if(!position||!h)return 0;
  const radius=Math.hypot(...position.map((z,i)=>(z-h[i])*v10AU));
  return Number.isFinite(radius)&&radius>0?2*Math.PI*Math.sqrt((radius**3)/mu):0;
 }
 function visibleNames(){let names=Object.keys(v10Primary.bodies).filter(x=>x!=='Sun');
  if($$v9('v10Moons').checked&&v10MoonData)names.push(...Object.keys(v10MoonData.bodies));
  if(v10Anchor!=='Sun'){
    const host=(v10Anchor==='Moon'||Boolean(v10MoonData?.bodies?.[v10Anchor]))?parentOf(v10Anchor):v10Anchor;
    names=names.filter(name=>name===host||name===v10Anchor||parentOf(name)===host);
    if(host!==v10Anchor&&!names.includes(host))names.unshift(host);
  }
  return Array.from(new Set(names));
 }
 draw3d=function(){if(active!=='3d')return;
  if(!v10Primary){v101PreviousDraw();return;}addMoonTargets();syncTimeline();
  const {c,w,h}=fitCanvas(threeCanvas);c.clearRect(0,0,w,h);
  c.fillStyle='#071425';c.fillRect(0,0,w,h);
  const yaw=Number(yawSlider.value)*rad,tilt=Number(tiltSlider.value)*rad;
  const focus=v10Anchor,t=v10ClockSec,center=v10Vector(focus,t)||[0,0,0];
  const scale=Math.min(w,h)*.44/spanOf(focus)*zoomFactor();
  function project(q){const x=q[0]-center[0],y=q[1]-center[1],z=q[2]-center[2];
   const xx=x*Math.cos(yaw)-y*Math.sin(yaw),yy=x*Math.sin(yaw)+y*Math.cos(yaw);
   return[w*.49+xx*scale,h*.52+(-yy*Math.cos(tilt)+z*Math.sin(tilt))*scale];}
  const names=visibleNames();
  for(const name of names){const host=parentOf(name);if(!host||name===host)continue;
   const T=periodSeconds(name,t);if(!Number.isFinite(T)||T<=0)continue;
   // Sun-centred planets can have multi-year orbits. Local satellites use
   // one actual orbital period, split into 192 points instead of 12-h samples.
   const span=Math.min(T*1.05, v10Primary.t1_tdb_s-v10Primary.t0_tdb_s);
   const hostNow=v10Vector(host,t);if(!hostNow)continue;
   c.save();c.strokeStyle=host==='Sun'?'#4b708477':name==='Moon'?'#b8e6edb8':'#94bfdaaa';
   c.lineWidth=host==='Sun'?1:1.25;c.beginPath();let started=false;
   for(let j=0;j<=192;j++){
    const trailStart=Math.max(v10Primary.t0_tdb_s,Math.min(v10Primary.t1_tdb_s-span,t-span*.5));const sampleT=trailStart+span*j/192;
    if(sampleT<v10Primary.t0_tdb_s||sampleT>v10Primary.t1_tdb_s)continue;
    const p=getTrajSample(name,sampleT),parentAt=v10Vector(host,sampleT);
    if(!p||!parentAt)continue;
    const fixed=p.map((z,i)=>z-parentAt[i]+hostNow[i]);
    const xy=project(fixed);
    if(!xy.every(Number.isFinite)){started=false;continue;}
    if(!started){c.moveTo(...xy);started=true;}else c.lineTo(...xy);
   }
   if(started)c.stroke();c.restore();
  }
  for(const name of ['Sun',...names]){
   if(name!=='Sun'&&name!==focus&&focus!=='Sun'&&parentOf(name)==='Sun')continue;
   const position=v10Vector(name,t);if(!position)continue;
   const xy=project(position);if(xy[0]<-32||xy[0]>w+32||xy[1]<-32||xy[1]>h+32)continue;
   const r=name==='Sun'?6:name==='Jupiter'||name==='Saturn'?4.7:name===focus?4.6:3.3;
   c.beginPath();c.fillStyle=v10Palette[name]||'#a9d1e2';c.shadowColor=c.fillStyle;c.shadowBlur=5;
   c.arc(...xy,r,0,Math.PI*2);c.fill();c.shadowBlur=0;
   if(name===focus||focus==='Sun'||w>600){c.fillStyle='#d6edf6';c.font='10px system-ui';c.fillText(name,xy[0]+r+4,xy[1]-r-3);}
  }
  // Optional derived orbit with explicit labeling, never historical 3D GAD telemetry.
  if(shipToggle.checked){const host=v10ShipHost,hostPos=v10Vector(host,t),mu=v10Mu[host],bodyR=v10Radius[host];
   if(hostPos&&mu&&bodyR){const r=bodyR+(host==='Moon'?100:400),phase=(t-v10Primary.t0_tdb_s)*Math.sqrt(mu/(r**3));
    const xyz=[r*Math.cos(phase),r*Math.sin(phase)*.8,r*Math.sin(phase)*.6].map(x=>x/v10AU);
    const ship=project(hostPos.map((x,i)=>x+xyz[i]));const middle=project(hostPos);
    if(Math.hypot(ship[0]-middle[0],ship[1]-middle[1])<11){ship[0]=middle[0]+Math.cos(phase)*13;ship[1]=middle[1]-Math.sin(phase)*13;
     c.strokeStyle='#7bd7e199';c.setLineDash([2,3]);c.beginPath();c.moveTo(...middle);c.lineTo(...ship);c.stroke();c.setLineDash([]);}
    if(ship[0]>-20&&ship[0]<w+20&&ship[1]>-20&&ship[1]<h+20){c.fillStyle='#fff';c.shadowColor='#67f8ef';c.shadowBlur=8;c.beginPath();c.arc(...ship,4,0,Math.PI*2);c.fill();c.shadowBlur=0;
     c.fillStyle='#aaf5e9';c.font='10px system-ui';c.fillText('Illustrative craft',ship[0]+8,ship[1]-8);}
   }
  }
  c.font='11px system-ui';c.fillStyle='#99c2d6';
  c.fillText(`JPL P6F · ${focus}-centered · ${new Date(referenceStart+(t-v10Primary.t0_tdb_s)*1000).toISOString().slice(0,10)}`,12,h-13);
 };
 // In old V10, the UI date field updates the ephemeris clock; the timeline
 // and current camera now follow via draw3d(). The original animation loop
 // remains the authoritative playback clock.
}