/* Mission Control V10: sourced JPL 3D reference, five pilot challenges and learning notes.
 * A presentation/educational extension. No archived replay physics or certifications change.
 * This file is concatenated into the original V3-V9 viewer IIFE, after the V9 patch.
 */
const v10Style=document.createElement('style');v10Style.textContent=`
.v10-scenarios{margin:12px 0 16px;padding:15px;background:#102a3c;border:1px solid #33637a;border-radius:12px;display:grid;gap:10px}
.v10-scenarios label{font-size:12px;color:#d7effe;font-weight:750}
.v10-scenarios select,.v10-ephem-controls select,.v10-ephem-controls input{background:#0a2235;color:#e8f7ff;border:1px solid #496579;border-radius:7px;padding:7px;font-size:12px;max-width:100%}
.v10-instruction{color:#cbdfe9;line-height:1.55;font-size:12px}
.v10-target{border-left:3px solid #60cddc;padding:8px 10px;background:#0a1b29;color:#d5f1ed;font-size:12px;border-radius:5px}
.v10-ephem-controls{display:flex;flex-wrap:wrap;gap:11px;align-items:end;margin:12px 0}
.v10-ephem-controls label{font-size:11px;color:#b8d0e0;display:grid;gap:5px}
.v10-ephem-note{font-size:11px;line-height:1.6;color:#9bc1d1}
.v10-provenance{font-size:11px;padding:11px;margin-top:10px;border:1px solid #32586e;border-radius:8px;background:#0a1929;color:#b3d2e3}
.v10-progress{font-size:11px;color:#a8ecda;min-height:18px}
.v10-lesson-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}
.v10-lesson-grid details{border:1px solid #365064;background:#092135;border-radius:10px;padding:12px;min-width:0;color:#bcd8e6;font-size:12px;line-height:1.6}
.v10-lesson-grid summary{cursor:pointer;font-size:13px;color:#e9f5ff;font-weight:750}
.v10-lesson-grid p{margin:10px 0 0}
.v10-legend{font-size:10px;color:#a8c8d8;margin-top:7px;line-height:1.5}
@media(max-width:700px){.v10-lesson-grid{grid-template-columns:1fr}.v10-ephem-controls{gap:8px}.v10-scenarios{padding:10px}}
`;document.head.appendChild(v10Style);

// --- Five independent educational challenges using the existing approximate 2D GAD field ---
const v10Challenges={
 capture:{title:'01 · Orbit fixer',subtitle:'Circularize an inbound trajectory',init:{x:2*R,y:0,vx:-2.1,vy:4.8},phi:24,
  desc:'An incoming craft is on an eccentric trajectory. Use asymmetric coupling to adjust the radial and tangential velocities, then turn off the GAD.',
  goal:'e < 0.18, periapsis altitude ≥ 150 km, bound orbit, K = 0 for 90 s',hold:90,limit:72000},
 surface:{title:'02 · Surface to orbit',subtitle:'Lift off from a vacuum Earth',init:{x:R+.5,y:0,vx:0,vy:0},phi:180,
  desc:'Start 500 meters above a spherical, atmosphere-free Earth. Repel mass to lift off, then use an off-center aperture to build tangential velocity. The surface is a hard collision boundary; no atmosphere or rotation is modeled.',
  goal:'e < 0.25, periapsis altitude ≥ 150 km, current altitude ≥ 180 km, K = 0 for 90 s',hold:90,limit:72000},
 retro:{title:'03 · Prograde → retrograde',subtitle:'Reverse orbital angular momentum',init:{x:R+400,y:0,vx:0,vy:Math.sqrt(E/(R+400))},phi:22,
  desc:'You begin in a 400 km circular prograde orbit. Reverse the sign of the angular momentum without hitting Earth. You do not need to preserve the original radius while maneuvering.',
  goal:'Retrograde angular momentum, bound orbit, e < 0.30, periapsis ≥ 150 km, K = 0 for 90 s',hold:90,limit:72000},
 departure:{title:'04 · Departure vector',subtitle:'Reach a guided outgoing velocity',init:{x:R+400,y:0,vx:0,vy:Math.sqrt(E/(R+400))},phi:25,
  desc:'Build an outbound velocity along the highlighted 30° inertial direction. This exercise evaluates a departure velocity gate, not an entire interplanetary rendezvous.',
  goal:'Altitude ≥ 2,000 km, speed ≥ 8 km/s, outward radial speed > 2 km/s, heading within ±20° of 30°, K = 0 for 30 s',hold:30,limit:24000},
 brake:{title:'05 · Arrival braking',subtitle:'Reduce an energetic inward approach',init:{x:3.5*R,y:0,vx:-9.0,vy:1.3},phi:180,
  desc:'Approach Earth rapidly. Use the GAD to reduce the inward radial velocity while still above a safe altitude. You are not required to establish a final bound orbit in this lesson.',
  goal:'Altitude 1,000–15,000 km, |radial speed| ≤ 1.2 km/s, K = 0 for 20 s',hold:20,limit:20000}
};
const v10Choose=document.createElement('div');v10Choose.className='v10-scenarios';v10Choose.innerHTML=`
<label for="v10Scenario">Choose a flight lesson</label>
<select id="v10Scenario" aria-label="Select the pilot challenge">${Object.entries(v10Challenges).map(([k,v])=>`<option value="${k}">${v.title} — ${v.subtitle}</option>`).join('')}</select>
<div class="v10-instruction" id="v10ScenarioDescription"></div><div class="v10-target" id="v10ScenarioGoal"></div>
<div class="v10-progress" id="v10ScenarioProgress"></div>`;
pilot.insertBefore(v10Choose,pilot.querySelector('.v9-pilot-layout'));
let v10Challenge='capture';
function v10SelectChallenge(key){const cfg=v10Challenges[key];if(!cfg)return;v10Challenge=key;
 $$v9('v10Scenario').value=key;$$v9('v10ScenarioDescription').textContent=cfg.desc;
 $$v9('v10ScenarioGoal').textContent='SUCCESS: '+cfg.goal;
 pilot.querySelector('h2')?.replaceChildren(document.createTextNode('Can you complete the '+cfg.title.replace(/^\d+ · /,'')+' challenge?'));
 pilot.querySelector('.v9-challenge').textContent='Training objective — '+cfg.goal+'. The initial state and gravity-only baseline are specific to this lesson.';
 resetPilot();}
$$v9('v10Scenario').addEventListener('change',e=>v10SelectChallenge(e.target.value));
resetPilot=function(){const cfg=v10Challenges[v10Challenge];pilotState={...cfg.init,t:0};pilotPath=[[pilotState.x,pilotState.y]];
 pilotK=0;pilotTheta=180;pilotPhi=cfg.phi;pilotActive=false;pilotLast=0;pilotHold=0;pilotDone=false;pilotFail=false;
 $$v9('v9Phi').value=String(cfg.phi);$$v9('v9PilotStatus').className='v9-status';
 $$v9('v9PilotStatus').textContent='Training ready. Set K and the aperture before playing.';
 $$v9('v9Run').textContent='▶ Start flight';buildBaseline();drawPilot()};
buildBaseline=function(){baseline=[];let state={...v10Challenges[v10Challenge].init};const deriv=z=>{const r=Math.hypot(z.x,z.y);const g=-E/(r*r*r);return{x:z.vx,y:z.vy,vx:g*z.x,vy:g*z.y}};
 const timestep=v10Challenge==='surface'?.25:12;
 for(let i=0;i<1100;i++){
   if(i%3===0)baseline.push([state.x,state.y]);if(Math.hypot(state.x,state.y)<R)break;
   const a=deriv(state),b=deriv({x:state.x+a.x*timestep/2,y:state.y+a.y*timestep/2,vx:state.vx+a.vx*timestep/2,vy:state.vy+a.vy*timestep/2});
   const c=deriv({x:state.x+b.x*timestep/2,y:state.y+b.y*timestep/2,vx:state.vx+b.vx*timestep/2,vy:state.vy+b.vy*timestep/2});
   const d=deriv({x:state.x+c.x*timestep,y:state.y+c.y*timestep,vx:state.vx+c.vx*timestep,vy:state.vy+c.vy*timestep});
   state={x:state.x+timestep*(a.x+2*b.x+2*c.x+d.x)/6,y:state.y+timestep*(a.y+2*b.y+2*c.y+d.y)/6,vx:state.vx+timestep*(a.vx+2*b.vx+2*c.vx+d.vx)/6,vy:state.vy+timestep*(a.vy+2*b.vy+2*c.vy+d.vy)/6};
 }};
function v10HeadingDiff(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b));}
function v10Metrics(){const s=pilotState,o=orbitInfo(s),rr=Math.hypot(s.x,s.y);
 return {...o,alt:rr-R,vr:(s.x*s.vx+s.y*s.vy)/rr,angle:Math.atan2(s.vy,s.vx),retro:o.h<0};}
function v10Gate(m){switch(v10Challenge){
 case 'surface':return m.e<.25 && m.rp>=R+150 && m.alt>=180 && m.eps<0;
 case 'retro':return m.retro && m.eps<0 && m.rp>=R+150 && m.e<.30;
 case 'departure':return m.alt>=2000 && m.speed>=8 && m.vr>2 && Math.abs(v10HeadingDiff(m.angle,30*rad))<=20*rad;
 case 'brake':return m.alt>=1000 && m.alt<=15000 && Math.abs(m.vr)<=1.2;
 default:return m.e<.18 && m.rp>=R+150 && m.eps<0;}}
doPilotStep=function(dt){const s=pilotState,a=modelAccel(s);const nx=s.x+s.vx*dt+.5*a.ax*dt*dt,ny=s.y+s.vy*dt+.5*a.ay*dt*dt;
 const b=modelAccel({x:nx,y:ny});s.vx+=(a.ax+b.ax)*dt*.5;s.vy+=(a.ay+b.ay)*dt*.5;s.x=nx;s.y=ny;s.t+=dt;
 if(!pilotPath.length||Math.hypot(s.x-pilotPath.at(-1)[0],s.y-pilotPath.at(-1)[1])>15)pilotPath.push([s.x,s.y]);if(pilotPath.length>5000)pilotPath.shift();
 const m=v10Metrics(),cfg=v10Challenges[v10Challenge];
 if(m.alt<0 || (v10Challenge!=='surface' && m.alt<120)) {pilotFail=true;pilotActive=false;$$v9('v9PilotStatus').className='v9-status warning';$$v9('v9PilotStatus').textContent='The spacecraft collided with the modeled body. Reset and adjust your controls.';}
 if(m.r>R*17||s.t>cfg.limit){pilotFail=true;pilotActive=false;$$v9('v9PilotStatus').className='v9-status warning';$$v9('v9PilotStatus').textContent='The flight exceeded this lesson’s range or time limit. Reset to try again.';}
 if(!pilotFail && pilotK===0 && v10Gate(m)) {pilotHold+=dt;if(pilotHold>=cfg.hold){pilotDone=true;pilotActive=false;$$v9('v9PilotStatus').className='v9-status success';$$v9('v9PilotStatus').textContent='Challenge complete! The demonstrated orbital/velocity gate held with the GAD switched off.';}}
 else pilotHold=0;};
const v10OldUpdatePilotLabels=updatePilotLabels;
updatePilotLabels=function(){v10OldUpdatePilotLabels();if(!pilotState)return;const m=v10Metrics(),cfg=v10Challenges[v10Challenge];
 $$v9('v10ScenarioProgress').textContent=`${m.alt.toFixed(0)} km altitude · radial ${m.vr.toFixed(2)} km/s · angular momentum ${m.h<0?'retrograde':'prograde'} · gate ${v10Gate(m)?'met':'not yet met'} · GAD-off hold ${Math.floor(pilotHold)}/${cfg.hold}s`;
 if(!pilotDone&&!pilotFail){$$v9('v9PilotStatus').textContent='Objective: '+cfg.goal+(pilotHold>0?' · holding '+Math.floor(pilotHold)+'s':'');}};
const v10OriginalDrawPilot=drawPilot;
drawPilot=function(){v10OriginalDrawPilot();if(active!=='pilot'||v10Challenge!=='departure')return;const {c,w,h}=fitCanvas(pc),cx=w*.38,cy=h*.5,len=Math.min(w,h)*.36;
 c.save();c.strokeStyle='#ffcf7c';c.lineWidth=2;c.setLineDash([8,5]);c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+len*Math.cos(30*rad),cy-len*Math.sin(30*rad));c.stroke();c.setLineDash([]);c.fillStyle='#ffe0a1';c.font='12px system-ui';c.fillText('TARGET: 30°',cx+len*Math.cos(30*rad)-18,cy-len*Math.sin(30*rad)-10);c.restore();};
// Pre-existing controls close over resetPilot/doPilotStep/drawPilot, which are
// rebound here to keep the V9 keyboard/phone interactions intact.
v10SelectChallenge('capture');

// --- Actual, supplied frozen P6F JPL/Horizons ephemeris in the 3D viewer ---
const v10AU=149597870.7, v10Palette={Sun:'#ffd584',Mercury:'#acaeae',Venus:'#e7ca94',Earth:'#64aaf6',Moon:'#eeeeee',Mars:'#ee956c',Jupiter:'#edc29e',Saturn:'#e8d69f',Uranus:'#8ed7df',Neptune:'#6385f9',Pluto:'#b6a4a7',Io:'#e9c05d',Europa:'#b4a89c',Ganymede:'#8eb8be',Callisto:'#9d9688',Titan:'#e6bd80'};
const v10Mu={Sun:132712440018,Mercury:22031.86855,Venus:324858.592,Earth:398600.4418,Moon:4902.8,Mars:42828.3,Jupiter:126686534,Saturn:37931207.8,Uranus:5793966,Neptune:6836529,Pluto:872.4};
const v10Radius={Sun:695700,Mercury:2439.7,Venus:6051.8,Earth:6371,Moon:1737.4,Mars:3389.5,Jupiter:69911,Saturn:58232,Uranus:25362,Neptune:24622,Pluto:1188};
const v10BodyHost=['Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune','Venus','Mercury','Pluto'];
let v10Primary=null,v10MoonData=null,v10JplLoading=false,v10ClockSec=0,v10Anchor='Sun',v10ShipHost='Earth';
const v10Trio=three.querySelectorAll('p');if(v10Trio[0])v10Trio[0].innerHTML='This viewer uses the project’s <b>frozen P6F 31-body JPL/Horizons ephemeris</b> in three-dimensional J2000 coordinates. Planet positions are reference data, while the white vehicle marker is a <b>derived teaching orbit</b> around the selected body—not a validated 3D GAD flight.';
if(v10Trio[1])v10Trio[1].textContent='JPL 3D positional reference: select date, camera center and the illustrative reference craft host. Drag to rotate. Relative positions are 3D; body/vehicle symbols have a minimum readable size and are not to scale.';
const v10Controls=document.createElement('div');v10Controls.className='v10-ephem-controls';v10Controls.innerHTML=`
<label>Reference date <input type="date" id="v10Date" min="2026-10-21" max="2036-10-21" value="2026-10-22"></label>
<label>Camera center <select id="v10Focus"><option value="Sun">Solar System (Sun)</option><option value="Earth">Earth + Moon</option><option value="Mars">Mars</option><option value="Jupiter">Jupiter</option><option value="Saturn">Saturn</option><option value="Uranus">Uranus</option><option value="Neptune">Neptune</option></select></label>
<label>Reference spacecraft orbit <select id="v10ShipHost">${v10BodyHost.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></label>
<label><input type="checkbox" id="v10Moons"> Show 20 additional moons</label>
<label>Playback speed <select id="v10JplRate"><option value="900">15 simulated min/s</option><option value="3600">1 simulated hour/s</option><option value="10800" selected>3 simulated hours/s</option><option value="21600">6 simulated hours/s</option><option value="43200">12 simulated hours/s</option><option value="86400">1 simulated day/s</option><option value="432000">5 simulated days/s</option><option value="1728000">20 simulated days/s</option></select></label><span id="v1041ClockReadout" style="font:11px ui-monospace,monospace;color:#a8dbe6;align-self:end">Reference epoch: —</span>`;
three.insertBefore(v10Controls,threeCanvas);
const v10Verify=document.createElement('div');v10Verify.className='v10-provenance';v10Verify.id='v10EphemProvenance';v10Verify.textContent='Reading frozen JPL reference package…';three.appendChild(v10Verify);
const v10DateElem=$$v9('v10Date');
function v10BodySample(data,name,t){const b=data?.bodies?.[name];if(!b)return null;
 const u=Math.max(0,Math.min(b.samples-1,(t-data.t0_tdb_s)/(b.hours*3600))),i=Math.min(b.samples-2,Math.floor(u)),f=u-i;
 const j=i*3,k=(i+1)*3,a=b.coords;
 return[(a[j]*(1-f)+a[k]*f),(a[j+1]*(1-f)+a[k+1]*f),(a[j+2]*(1-f)+a[k+2]*f)];}
function v10Vector(name,t,visited){if(!v10Primary)return null;
 const data=v10Primary.bodies[name]?v10Primary:v10MoonData;
 const b=data?.bodies[name];if(!b)return null;
 const rel=v10BodySample(data,name,t);if(!rel)return null;
 if(b.unit==='AU'){return rel;}
 const host=b.parent,base=v10Vector(host,t,visited);if(!base)return null;
 return base.map((q,i)=>q+rel[i]/v10AU);
}
function v10SetTimeFromDate(dateStr){const d=new Date(dateStr+'T00:00:00Z'),t0=new Date('2026-10-21T00:00:00Z');
 // P6F source is TDB, with absolute t0 from the package; map UI UTC days onto
 // the source calendar epoch. TDB-UTC differences are below this display's cadence.
 v10ClockSec=v10Primary.t0_tdb_s+(d-t0)/1000;
 v10ClockSec=Math.max(v10Primary.t0_tdb_s,Math.min(v10Primary.t1_tdb_s,v10ClockSec));}
async function v10LoadEphem(){if(v10JplLoading||v10Primary)return;v10JplLoading=true;
 try{const response=await fetch('./data/jpl-p6f-primary.json?source=P6F');if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();if(data.schema!=='gad-jpl-p6f-reference-v1'||Object.keys(data.bodies).length!==11)throw Error('Unrecognized JPL reference payload');
  v10Primary=data;v10SetTimeFromDate(v10DateElem.value);v10Verify.textContent='SOURCE · Frozen P6F 31-body dataset, JPL/Horizons geometric vectors; ICRF/J2000, Sun-relative display, TDB epoch. Original positions/velocities passed off-grid spot checks in the P6F package; this browser dataset is downsampled and visually interpolated. Not validated GAD flight data.';draw3d();
 }catch(err){v10Verify.textContent='The packaged JPL reference data could not load: '+err.message;}finally{v10JplLoading=false;}}
async function v10LoadMoons(){if(v10MoonData)return;v10Verify.textContent='Loading additional P6F moon positions…';try{const parts=await Promise.all([1,2,3,4].map(async i=>{const res=await fetch('./data/jpl-p6f-satellites-part'+i+'.json?source=P6F');if(!res.ok)throw Error('HTTP '+res.status+' part '+i);return await res.json()}));const d={...parts[0],bodies:Object.assign({},...parts.map(p=>p.bodies))};if(Object.keys(d.bodies).length!==20)throw Error('Additional moon inventory mismatch');v10MoonData=d;v10Verify.textContent='Additional 20 moon states loaded from frozen P6F. Their display cadence varies by body; interpolated graphics are not a new scientific validation.';draw3d()}catch(e){v10Verify.textContent='Additional moon data unavailable: '+e.message;$$v9('v10Moons').checked=false;}}
function v10ShowReference(){if(active==='3d'){v10LoadEphem();draw3d();}}
const v10OriginalSetActive=setActive;setActive=function(id,options={}){v10OriginalSetActive(id,options);if(id==='3d')v10ShowReference();};
const v10OriginalDraw3d=draw3d;
draw3d=function(){if(active!=='3d')return;if(!v10Primary){v10OriginalDraw3d();return;}
 const {c,w,h}=fitCanvas(threeCanvas);c.clearRect(0,0,w,h);
 const yaw=Number($$v9('v9Yaw').value)*rad,tilt=Number($$v9('v9Tilt').value)*rad,zoom=Number($$v9('v9Zoom').value)/100;
 const t=v10ClockSec, center=v10Vector(v10Anchor,t)||[0,0,0];
 const focusRadius=v10Anchor==='Sun'?35:v10Anchor==='Earth'?.0045:v10Anchor==='Mars'?.0035:v10Anchor==='Jupiter'?.025:v10Anchor==='Saturn'?.03:.015;
 const scale=Math.min(w,h)*.44/focusRadius*zoom;
 function p(q){const x=q[0]-center[0],y=q[1]-center[1],z=q[2]-center[2],xx=x*Math.cos(yaw)-y*Math.sin(yaw),yy=x*Math.sin(yaw)+y*Math.cos(yaw);
 return[w*.48+xx*scale,h*.52+(-yy*Math.cos(tilt)+z*Math.sin(tilt))*scale];}
 c.fillStyle='#071425';c.fillRect(0,0,w,h);
 const list=Object.keys(v10Primary.bodies).filter(n=>n!=='Sun');
 if($$v9('v10Moons').checked&&v10MoonData)list.push(...Object.keys(v10MoonData.bodies));
 // Geometric historical paths, no invented circular orbits.
 for(const name of list){if(v10Anchor!=='Sun' && name!==v10Anchor && v10Primary.bodies[name] && name!=='Moon')continue;
  c.save();c.beginPath();let started=false;c.strokeStyle=name==='Moon'?'#c8dfe548':'#48617b66';c.lineWidth=.95;
  const dt=v10Anchor==='Sun'?30*86400:12*3600;
  for(let j=0;j<=140;j++){
   const tk=Math.max(v10Primary.t0_tdb_s,Math.min(v10Primary.t1_tdb_s,t-(140-j)*dt));
   const point=v10Vector(name,tk),origin=v10Vector(v10Anchor,tk)||[0,0,0];if(!point)continue;
   const projected=p(point.map((v,i)=>v-origin[i]+center[i]));
   if(!started){c.moveTo(...projected);started=true}else c.lineTo(...projected);
  }c.stroke();c.restore();}
 // Draw natural bodies with positions from the same recorded epoch.
 for(const name of [...new Set(['Sun',...list])]){const q=v10Vector(name,t);if(!q)continue;
  const P=p(q);if(P[0]<-20||P[0]>w+20||P[1]<-20||P[1]>h+20)continue;
  const r=name==='Sun'?6:name==='Jupiter'||name==='Saturn'?4.5: name==='Earth'?3.6:2.7;
  c.beginPath();c.fillStyle=v10Palette[name]||'#b7d5ea';c.shadowColor=c.fillStyle;c.shadowBlur=4;c.arc(...P,r,0,Math.PI*2);c.fill();c.shadowBlur=0;
  if(w>600||name==='Sun'||name===v10Anchor||v10Primary.bodies[name]){c.fillStyle='#d4e7f3';c.font='10px system-ui';c.fillText(name,P[0]+r+4,P[1]-r-3);}
 }
 // Derived reference spacecraft: an intentionally separate two-body visual marker.
 const host=v10ShipHost,hostPos=v10Vector(host,t),mu=v10Mu[host],r0=v10Radius[host];
 if(hostPos&&mu&&r0){const altitude=host==='Moon'?100:400,rr=r0+altitude,omega=Math.sqrt(mu/(rr**3));const phase=(t-v10Primary.t0_tdb_s)*omega;
 const local=[rr*Math.cos(phase),rr*Math.sin(phase)*.8,rr*Math.sin(phase)*.6].map(v=>v/v10AU);
 const ship=hostPos.map((x,i)=>x+local[i]);let P=p(ship),centerP=p(hostPos),d=Math.hypot(P[0]-centerP[0],P[1]-centerP[1]);
 // Provide a readable marker when the real near-planet separation is subpixel.
 if(d<13){let angle=(phase+.7);P=[centerP[0]+Math.cos(angle)*14,centerP[1]-Math.sin(angle)*14];
  c.strokeStyle='#81e9e9aa';c.setLineDash([2,3]);c.beginPath();c.moveTo(...centerP);c.lineTo(...P);c.stroke();c.setLineDash([]);}
 c.fillStyle='#fff';c.shadowColor='#67f8ef';c.shadowBlur=8;c.beginPath();c.arc(...P,4.2,0,Math.PI*2);c.fill();c.shadowBlur=0;
 c.fillStyle='#aaf5e9';c.font='11px system-ui';c.fillText('Reference craft',P[0]+9,P[1]-9);
 }
 c.font='11px system-ui';c.fillStyle='#93b9d3';c.fillText(`P6F JPL / ${v10Anchor}-centered display · derived craft (not GAD telemetry)`,12,h-14);
};
const v10OldAnimation=animation;
// Avoid a second requestAnimationFrame loop; V9's running loop calls draw3d()
// when threeRun is enabled. Its threePhase is not used by the sourced view.
$$v9('v9Spin').textContent='Play ephemeris';threeRun=false;
$$v9('v10Focus').addEventListener('change',e=>{v10Anchor=e.target.value;draw3d()});
$$v9('v10ShipHost').addEventListener('change',e=>{v10ShipHost=e.target.value;draw3d()});
$$v9('v10Date').addEventListener('change',e=>{if(!v10Primary)return;v10SetTimeFromDate(e.target.value);draw3d()});
$$v9('v10Moons').addEventListener('change',e=>{if(e.target.checked)void v10LoadMoons();else draw3d()});
const v10OldSpin=$$v9('v9Spin');v10OldSpin.addEventListener('click',()=>{v10OldSpin.textContent=threeRun?'Pause ephemeris':'Play ephemeris';});
let v10LastEphem=0,v1041LastDraw=0;
function v10UpdateClockLabel(){
 if(!v10Primary)return;
 const elapsed=Math.max(0,v10ClockSec-v10Primary.t0_tdb_s);
 const date=new Date(Date.UTC(2026,9,21)+elapsed*1000);
 const dateText=date.toISOString().slice(0,10),timeText=date.toISOString().slice(11,19);
 v10DateElem.value=dateText;
 const output=$v9('v1041ClockReadout');
 if(output)output.textContent='Reference epoch: '+dateText+' '+timeText+' (approx. UTC display)';
}
function v10EphemAnimation(now){
 requestAnimationFrame(v10EphemAnimation);
 if(!v10Primary||active!=='3d'||!threeRun||document.hidden){v10LastEphem=now;v1041LastDraw=now;return;}
 if(!v10LastEphem){v10LastEphem=now;v1041LastDraw=now;return;}
 const realDt=Math.max(0,Math.min(.12,(now-v10LastEphem)/1000));
 v10LastEphem=now;
 const simulatedSecondsPerSecond=Number($v9('v10JplRate').value);
 if(!Number.isFinite(simulatedSecondsPerSecond)||simulatedSecondsPerSecond<=0)return;
 v10ClockSec=Math.min(v10Primary.t1_tdb_s,v10ClockSec+realDt*simulatedSecondsPerSecond);
 const frameInterval=v10MoonData?1000/24:1000/30;
 if(now-v1041LastDraw>=frameInterval||v10ClockSec>=v10Primary.t1_tdb_s){
  v10UpdateClockLabel();draw3d();v1041LastDraw=now;
 }
 if(v10ClockSec>=v10Primary.t1_tdb_s){threeRun=false;v10OldSpin.textContent='Play ephemeris';}
}
requestAnimationFrame(v10EphemAnimation);

// --- Additional lesson cards: all contextualized as model assumptions ---
const v10LearnCard=document.createElement('section');v10LearnCard.className='v9-card';
v10LearnCard.innerHTML=`<div class="v9-eyebrow">ENGINEERING NOTES · HOW TO THINK ABOUT THE GAD</div><h2>Six ideas that make the GAD intuitive</h2>
<div class="v10-lesson-grid">
 <details><summary>1 · Force is not velocity</summary><p>An outward GAD acceleration does not mean the spacecraft is moving outward. The craft can still move inward while braking. Acceleration changes velocity over time, and the trajectory curves in response.</p></details>
 <details><summary>2 · θ is the axis; φ is the width</summary><p>θ rotates the central aperture axis in the simulation's inertial XY plane. φ is the cone's <em>half-angle</em>, not the spacecraft’s flight heading. φ = 180° couples to the full spherical mass in this model.</p></details>
 <details><summary>3 · Why the mass centroid matters</summary><p>An off-center aperture selects an asymmetric subset of the source body. The computed net GAD force points away from the coupled mass distribution's effective centroid, so the force may not point exactly opposite the aperture axis.</p></details>
 <details><summary>4 · K versus natural gravity</summary><p>The model multiplies the intercepted mass’s gravitational contribution by K in the repulsive direction. For full-body coupling, the GAD can exceed local inward gravity when K is greater than one, but other gravitating bodies still contribute independently.</p></details>
 <details><summary>5 · Radial and tangential velocity</summary><p>Radial speed points toward or away from the reference body. Tangential speed goes around it. Orbital capture requires appropriate <em>both</em> speed components and orbital energy, not simply arriving at a particular distance.</p></details>
 <details><summary>6 · What “verified” means here</summary><p>Historical RC42/RC44 replays were independently checked against their hypothetical model criteria. The Pilot tab is an approximate teaching simulator, and the JPL 3D reference viewer contains real planetary states plus an illustrative spacecraft—not a validated 3D GAD mission.</p></details>
</div><div class="v10-legend">Suggested progression: adjust one control in Learn, fly its effect in Pilot, inspect a recorded 2D mission, then explore where the bodies actually were in 3D.</div>`;
panels.learn.appendChild(v10LearnCard);
// Explicit live-release identity. Archived controller revisions remain selectable in 2D.
const v10ProductionNotice=document.createElement('div');
v10ProductionNotice.id='gadProductionRelease';
v10ProductionNotice.setAttribute('role','status');
v10ProductionNotice.style.cssText='margin:8px 0 12px;padding:10px 14px;border:1px solid #32647b;border-radius:10px;background:#0b2535;color:#d5f4fb;font:650 12px system-ui;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center';
v10ProductionNotice.innerHTML='<span>GAD MISSION CONTROL <strong style="color:#84ece7">V10 · CURRENT RELEASE</strong></span><span style="font-size:11px;font-weight:450;color:#9bbbd0">5 pilot challenges · 31-body JPL 3D reference · 29 historic 2D routes</span>';
const v10Nav=document.querySelector('.v9-tabs');
if(v10Nav)v10Nav.before(v10ProductionNotice);
document.title='GAD Mission Control · V10';