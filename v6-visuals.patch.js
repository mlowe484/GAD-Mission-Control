/* GAD Mission Control V6: gravity decomposition, reconstructed coast baseline,
   preserved archival forecast gates, timeline maneuver markers, compact scene HUD.
   No RC42 flight states or controller commands are altered. 
   Natural gravity is recomputed from ALL 10 modeled gravitating bodies (Sun,
   Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune).
   Ephemeris: frozen 3600-s SolarSystem RK4, sampled every 6 hours for replay.
   Dashed route is a reconstructed NO-GAD cruise from the recorded departure
   handoff, NOT a saved complete original controller plan.
*/
const v6Styles=document.createElement('style');
v6Styles.textContent=`
/* Compact HUD: restore maximum map space. */
.top-hud{top:8px!important;left:10px!important;right:10px!important;gap:7px!important}.hud-heading{font-size:9px!important;letter-spacing:.075em!important}.hud-sub{font-size:9px!important;margin-top:2px!important;max-width:155px;line-height:1.3}.view-switch{gap:1px!important;padding:2px!important;max-width:75%}.view-switch button{font-size:8px!important;padding:5px!important;letter-spacing:0!important}
.v6-map-footer{display:flex;align-items:center;justify-content:space-between;gap:9px;background:#081624;padding:6px 11px;border-top:1px solid #203448}
.v6-map-footer .bottom-hud{position:static!important;inset:auto!important;pointer-events:auto!important;display:flex;align-items:center;gap:9px;width:100%;justify-content:space-between}
.v6-map-footer .hud-block{border:0!important;background:transparent!important;padding:1px 3px!important;backdrop-filter:none!important;line-height:1.1!important}.v6-map-footer .hud-block .hud-kicker{font-size:8px!important;margin-bottom:3px!important}.v6-map-footer .hud-block strong{font-size:11px!important}.v6-map-footer .corner-lbl{font-size:8px!important;margin-top:2px!important;max-width:none}
.v6-map-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between;padding:6px 8px;border:1px solid #23435a;border-radius:9px;background:#091c2c;margin-bottom:8px}
.v6-map-toolbar .v5-overlay-controls{position:static!important;inset:auto!important;z-index:auto!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:1px!important;backdrop-filter:none!important;font-size:10px!important;gap:6px!important}
.v6-map-toggles{display:flex;gap:7px 13px;flex-wrap:wrap;align-items:center}.v6-map-toggles label{display:inline-flex;align-items:center;gap:5px;color:#b7d4df;font-size:10px;cursor:pointer;white-space:nowrap}.v6-map-toggles input{accent-color:#82e8e4}
.v6-route-legend{font-size:10px;color:#91b1c5;line-height:1.55;margin:0 2px 9px}.v6-line-solid,.v6-line-dash{display:inline-block;width:22px;height:0;vertical-align:middle;margin:0 3px;border-top:2px solid #7beae7}.v6-line-dash{border-top:2px dashed #fac47e}
.v6-gravity-readings{border:1px solid #2c4660;padding:11px;border-radius:10px;background:#071b2a;margin:8px 0 7px}.v6-gravity-readings>strong{display:block;font-size:11px;color:#c7e8f0;margin-bottom:7px}.v6-grav-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 10px}.v6-grav-row{display:flex;justify-content:space-between;align-items:center;gap:5px;font-size:10px;color:#aac6d7;border-bottom:1px solid #20344a;padding:3px 0}.v6-grav-row b{font-family:ui-monospace,Consolas,monospace;font-size:10px;color:#e6faff}.v6-grav-note{font-size:9px;line-height:1.45;color:#91a7bd;margin-top:7px}.v6-grav-legend{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 4px}.v6-grav-legend label{display:flex;align-items:center;gap:5px;font-size:10px;color:#c1d3e6;cursor:pointer}.v6-grav-legend input{accent-color:#9f9bea}
.v6-timeline-events{height:14px;position:relative;margin:0 3px 6px;border-radius:3px;border-bottom:1px dotted #2e4d5c}.v6-marker{position:absolute;transform:translateX(-50%);top:1px;width:5px;height:12px;padding:0;outline-offset:2px;border:0;border-radius:2px;background:#79a9cb;opacity:.75;cursor:pointer}.v6-marker:hover,.v6-marker:focus-visible{opacity:1;height:14px;width:9px}.v6-marker.nav{background:#83c9ee}.v6-marker.burn{background:#ffba70}.v6-marker.stage{background:#8de9b9;width:7px}
.v6-evidence-label{display:inline-block;padding:2px 6px;margin-left:5px;border:1px solid #38627a;border-radius:6px;color:#a9d5e9;font-size:9px}
@media(max-width:760px){.v6-map-footer .corner-lbl{display:none!important}.v6-grav-grid{grid-template-columns:1fr}.v6-map-toolbar{padding:6px}.v6-route-legend{font-size:9px}.v5-director{padding:9px 11px!important;margin-bottom:8px!important}.v5-title{font-size:12px!important}.v5-explain{font-size:10px!important;line-height:1.45!important}.v5-status{font-size:9px!important}.v5-guide-btn{font-size:9px!important;padding:6px 8px!important}}
`;
document.head.appendChild(v6Styles);
// More room for the vehicle: remove the two large floating telemetry cards from the map.
const v6MapFooter=document.createElement('div');v6MapFooter.className='v6-map-footer';el('visual').after(v6MapFooter);
v6MapFooter.appendChild(document.querySelector('.bottom-hud'));
const v6Toolbar=document.createElement('div');v6Toolbar.className='v6-map-toolbar';
v6Toolbar.innerHTML=`<div class="v6-map-toggles">
<label><input type="checkbox" id="v6ShowPlan" checked> Dashed coast forecast</label>
<label><input type="checkbox" id="v6ShowFullRoute" checked> Full flown path</label>
<label><input type="checkbox" id="v6ShowGate" checked> Controller forecast gate</label>
</div>`;
el('chapters').before(v6Toolbar);v6Toolbar.appendChild(v5Controls);
const v6RouteLegend=document.createElement('p');v6RouteLegend.className='v6-route-legend';
v6RouteLegend.innerHTML='<i class="v6-line-solid"></i> Flown path (solid) · <i class="v6-line-dash"></i> Reconstructed baseline coast (dashed) · Forecast gate = archived navigation waypoint, not a complete planned trajectory';
v6Toolbar.after(v6RouteLegend);
const v6Markers=document.createElement('div');v6Markers.className='v6-timeline-events';
v6Markers.setAttribute('aria-label','Navigation and maneuver markers');
el('scrub').closest('.timeline').after(v6Markers);
// Retire V5's misleading one-body gravity arrow, keep all other V5 vector toggles.
el('v5VecGravity').checked=false;el('v5VecGravity').closest('label').hidden=true;
const v6GravityLegend=document.createElement('div');v6GravityLegend.className='v6-grav-legend';
v6GravityLegend.innerHTML=`
<label><input type="checkbox" id="v6NetGravity" checked> <span class="v5-swatch" style="background:#bda2ff"></span>Net gravity</label>
<label><input type="checkbox" id="v6SunGravity"> <span class="v5-swatch" style="background:#ffd57c"></span>Sun</label>
<label><input type="checkbox" id="v6SourceGravity"> <span class="v5-swatch" style="background:#ff997f"></span>Source</label>
<label><input type="checkbox" id="v6DestGravity"> <span class="v5-swatch" style="background:#a2c8ff"></span>Destination</label>`;
el('v5VecGravity').closest('.v5-legend').after(v6GravityLegend);
const v6GravityReadings=document.createElement('div');v6GravityReadings.className='v6-gravity-readings';
v6GravityReadings.innerHTML=`<strong>Natural gravity — all 10 modeled bodies</strong>
<div class="v6-grav-grid">
<div class="v6-grav-row">Net acceleration <b id="v6NetReading">—</b></div>
<div class="v6-grav-row">Largest contributor <b id="v6Dominant">—</b></div>
<div class="v6-grav-row">Sun <b id="v6SunReading">—</b></div>
<div class="v6-grav-row"><span id="v6SourceLabel">Source</span><b id="v6SourceReading">—</b></div>
<div class="v6-grav-row"><span id="v6DestLabel">Destination</span><b id="v6DestReading">—</b></div>
<div class="v6-grav-row">Other bodies combined <b id="v6OthersReading">—</b></div>
</div><div class="v6-grav-note">m/s² · Every value is computed from the frozen N-body ephemeris and the replay spacecraft state. The net vector is a vector sum; individual magnitudes must not be added as scalars.</div>`;
el('v5GravAccel').closest('.v5-reading').querySelector('small').textContent='Net natural gravity · N-body';
el('v5GravAccel').closest('.v5-reading').querySelector('em').textContent='m/s² · Sun + 8 planets + Moon';
el('v5GravAccel').closest('.v5-readings').after(v6GravityReadings);
const v6OldFootnote=el('v5GravAccel').closest('section').querySelector('.v5-footnote');
if(v6OldFootnote)v6OldFootnote.textContent='Vector arrow lengths are normalized separately for visibility. Compare the numerical accelerations, not the arrow lengths. GAD direction is recomputed from RC42 aperture and centroid data; natural gravity is the full N-body sum.';

const v6Ephem=GAD_V6_NAV_DATA.ephemeris;
const v6BodyIndex=Object.fromEntries(v6Ephem.names.map((b,i)=>[b,i]));
function v6GetBodyPositions(t){
 const abs=GAD_V6_NAV_DATA.routes[M.id].launch_epoch_s+t;
 const v=clamp(abs/v6Ephem.dt_s,0,v6Ephem.positions_km.length-1.0000001);
 const i=Math.floor(v),alpha=v-i,prev=v6Ephem.positions_km[i],next=v6Ephem.positions_km[i+1];
 return prev.map((q,j)=>[lerp(q[0],next[j][0],alpha),lerp(q[1],next[j][1],alpha)]);
}
function v6Grav(t,s){
 const pos=v6GetBodyPositions(t),parts={},total=[0,0];
 // Exact source/destination coordinates are stored with the archived trajectory.
 pos[v6BodyIndex[M.source]]=[s[5],s[6]];
 pos[v6BodyIndex[M.destination]]=[s[7],s[8]];
 v6Ephem.names.forEach((name,i)=>{
   const dx=pos[i][0]-s[1],dy=pos[i][1]-s[2],rr=Math.max(1,Math.hypot(dx,dy));
   const mps2=v6Ephem.mu_km3s2[i]*1000/(rr*rr);
   const ax=mps2*dx/rr,ay=mps2*dy/rr;
   parts[name]={ax,ay,mag:mps2};total[0]+=ax;total[1]+=ay;
 });
 const sumOther=[0,0];v6Ephem.names.forEach(name=>{if(!['Sun',M.source,M.destination].includes(name)){sumOther[0]+=parts[name].ax;sumOther[1]+=parts[name].ay;}});
 let leading=v6Ephem.names[0];for(const n of v6Ephem.names){if(parts[n].mag>parts[leading].mag)leading=n;}
 return {total,mag:Math.hypot(...total),parts,leading,otherMag:Math.hypot(...sumOther)};
}
function v6AccelText(a){if(!Number.isFinite(a))return '—';if(a===0)return '0';if(a<.001)return a.toExponential(2);if(a<.1)return fmt(a,5);if(a<10)return fmt(a,3);return fmt(a,1);}
function v6ForecastAt(t){ const route=GAD_V6_NAV_DATA.routes[M.id],path=route.ballistic_path_km;
 if(!path?.length||t<path[0][0]||t>path.at(-1)[0])return null;
 let i=idxAt(path,t,0),a=path[i],b=path[Math.min(i+1,path.length-1)];const u=(b[0]===a[0])?0:clamp((t-a[0])/(b[0]-a[0]),0,1);return [lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
}
function v6CurrentGate(t){ const route=GAD_V6_NAV_DATA.routes[M.id];let curr=null;
 for(const g of route.forecast_gates){if(g.t<=t+1e-6)curr=g;else break;}return curr;
}
function v6RenderPlanned(cam,t,s){
 const c=ctx, route=GAD_V6_NAV_DATA.routes[M.id];if(!route)return;
 const wantFlown=el('v6ShowFullRoute').checked, wantPlan=el('v6ShowPlan').checked,wantGate=el('v6ShowGate').checked;
 c.save();
 if(wantFlown){c.beginPath();let first=true;const stride=Math.max(1,Math.round(R.length/1200));for(let i=0;i<R.length;i+=stride){const v=R[i],pt=interpScreen(cam,v[1],v[2]);if(first){c.moveTo(...pt);first=false;}else c.lineTo(...pt);}const end=R[R.length-1];c.lineTo(...interpScreen(cam,end[1],end[2]));c.strokeStyle='rgba(105,239,236,0.32)';c.lineWidth=1.6*devicePixelRatio;c.stroke();}
 if(wantPlan){const ar=route.ballistic_path_km;c.beginPath();let first=true;for(let i=0;i<ar.length;i++){const pt=interpScreen(cam,ar[i][1],ar[i][2]);if(first){c.moveTo(...pt);first=false;}else c.lineTo(...pt);}c.strokeStyle='#fac47e';c.lineWidth=2*devicePixelRatio;c.globalAlpha=.95;c.setLineDash([6*devicePixelRatio,6*devicePixelRatio]);c.stroke();c.setLineDash([]);c.globalAlpha=1;}
 if(wantGate&&t>=0&&t<M.capture_start_s){const gate=v6CurrentGate(t);if(gate){const p=interpScreen(cam,...gate.position_km);if(p[0]>-40&&p[0]<W+40&&p[1]>-40&&p[1]<H+40){c.strokeStyle='#f7a75f';c.lineWidth=1.6*devicePixelRatio;c.beginPath();c.arc(...p,6*devicePixelRatio,0,2*Math.PI);c.stroke();c.beginPath();c.moveTo(p[0]-10*devicePixelRatio,p[1]);c.lineTo(p[0]+10*devicePixelRatio,p[1]);c.moveTo(p[0],p[1]-10*devicePixelRatio);c.lineTo(p[0],p[1]+10*devicePixelRatio);c.stroke();}}}
 c.restore();
}
function v6BuildMarkers(){if(!M)return;v6Markers.replaceChildren();const markers=[], r=GAD_V6_NAV_DATA.routes[M.id];
 const add=(t,type,label)=>{if(Number.isFinite(t))markers.push({t,type,label});};
 add(0,'stage','Recorded launch / ignition');add(M.departure_end_s,'stage','Departure burn complete');add(M.capture_start_s,'stage','Capture phase begins');add(M.recorded_end_s,'stage','Insertion complete / GAD off');
 // Archival navigation assessments, spread for visibility.
 for(let i=0;i<N.length;i++){if(i%Math.max(1,Math.ceil(N.length/9))===0||i===N.length-1)add(N[i].t,'nav',`Recorded navigation assessment #${N[i].n}`);}
 // Choose significant change in the recorded K command (not arbitrary animation).
 const deltas=[];for(let i=1;i<C.length;i++){const before=C[i-1],after=C[i],jump=Math.abs((after[3]||0)-(before[3]||0));if(jump>=.2*M.K_limit) deltas.push({t:after[0],jump,label:`Command ${i+1}: K ${fmt(before[3],1)} → ${fmt(after[3],1)}`});}
 deltas.sort((a,b)=>b.jump-a.jump);
 for(const d of deltas.slice(0,12)){if(!markers.some(m=>Math.abs(timeToProgress(m.t)-timeToProgress(d.t))<.007))add(d.t,'burn',d.label);}
 markers.sort((a,b)=>a.t-b.t);
 for(const entry of markers){const marker=document.createElement('button');marker.type='button';marker.className=`v6-marker ${entry.type}`;marker.style.left=(100*timeToProgress(entry.t))+'%';marker.title=entry.label+' · T'+fmtTime(entry.t);marker.setAttribute('aria-label',marker.title);marker.addEventListener('click',()=>{setPlaying(false);setProgress(timeToProgress(entry.t));});v6Markers.appendChild(marker);}
}
function v6Narration(t,s,cmd,grav){
 const phase=chapterFromTime(t).id,leader=grav.leading;
 const sun=v6AccelText(grav.parts.Sun.mag),source=v6AccelText(grav.parts[M.source].mag),dest=v6AccelText(grav.parts[M.destination].mag);
 const ratio=grav.parts[M.source].mag/Math.max(grav.parts[M.destination].mag,1e-30);
 if(phase==='prelaunch')return [`Preparing around ${M.source}`,`Derived stable orbit shown for context. The recorded GAD departure begins at T+00:00. Natural gravity acts continually; the largest contributor right now is ${leader}.`,'Derived Stage 0; N-body gravity recomputed'];
 if(phase==='departure')return [`Powered departure from ${M.source}`,`The recorded aperture command (K ${fmt(cmd[3],1)}) pushes the spacecraft away from its intercepted-mass centroid. ${leader} currently provides the strongest natural gravitational pull. Source gravity ${source} m/s²; destination gravity ${dest} m/s².`,'Recorded commands; computed centroid and N-body gravity'];
 if(phase==='cruise'){
  const gate=v6CurrentGate(t);let forecast=gate?` The latest archived navigation forecast marks a ${M.destination} encounter gate at day ${fmt(gate.arrival_t/86400,1)}.`:'';
  const baseline=v6ForecastAt(t);const sep=baseline?fmt(Math.hypot(baseline[0]-s[1],baseline[1]-s[2]),0):'—';
  return [`Coasting under natural gravity`,`The GAD is off. Gravity from all ten modeled bodies bends the trajectory; the largest individual pull is currently ${leader} (${v6AccelText(grav.parts[leader].mag)} m/s²). The dashed trajectory is a reconstructed no-GAD coast from the recorded departure handoff; its difference from the flown position now is ${sep} km.${forecast}`,'Recorded flown path + archived gates; ballistic baseline reconstructed'];
 }
 if(phase==='capture')return [`${M.destination} braking and orbit insertion`,`Radial velocity is ${v5Signed(s[12],2)} km/s, tangential velocity is ${v5Signed(s[13],2)} km/s. ${cmd[1]?`The active GAD command (K ${fmt(cmd[3],1)}) changes orbital energy and angular momentum.`:'GAD is currently off.'} Natural gravity still acts: net ${v6AccelText(grav.mag)} m/s²; largest contributor ${leader}.`,'Recorded radial/tangential velocity; N-body gravity recomputed'];
 return [`Verified post-shutdown orbit`,`The GAD is off. The displayed orbit is a derived continuation representing the archived ${fmt(M.cert_observed_s/3600,2)}-hour audit window. Natural gravity includes all ten modeled bodies; independent audit evidence certifies capture.`,'Archived certification + derived orbit visualization'];
}
const _v6OldRenderCanvas=renderCanvas;
renderCanvas=function(s,t,cmd){_v6OldRenderCanvas(s,t,cmd);if(!M||!frameCam)return;v6RenderPlanned(frameCam,t,s);if(!el('v5ShowVectors').checked)return;
 const [px,py]=interpScreen(frameCam,s[1],s[2]);if(px<-140||px>W+140||py<-140||py>H+140)return;
 const g=v6Grav(t,s),dpr=devicePixelRatio;
 if(el('v6NetGravity').checked)v5DrawArrow(ctx,px,py,g.total,38,'#bda2ff','net g',dpr);
 const draw=(id,name,col,label)=>{if(el(id).checked&&g.parts[name]){const part=g.parts[name];v5DrawArrow(ctx,px,py,[part.ax,part.ay],30,col,label,dpr);}};
 draw('v6SunGravity','Sun','#ffd57c','Sun');draw('v6SourceGravity',M.source,'#ff997f',M.source);draw('v6DestGravity',M.destination,'#a2c8ff',M.destination);
};
const _v6OldUpdateDetails=v5UpdateDetails;
v5UpdateDetails=function(t,s,cmd,isDerived,force=false){
 _v6OldUpdateDetails(t,s,cmd,isDerived,force);
 if(!M)return;
 // V5 has a display update throttle; match it to avoid heavy layout churn.
 const now=typeof performance!=='undefined'?performance.now():0;
 if(!force && v6LastMission===M.id&&Math.abs(progress-v6LastProgress)<.01&&now-v6LastUpdate<150)return;
 v6LastMission=M.id;v6LastProgress=progress;v6LastUpdate=now;
 const g=v6Grav(t,s);const [title,body,provenance]=v6Narration(t,s,cmd,g);
 el('v5DirectorTitle').textContent=title;el('v5DirectorBody').textContent=body;el('v5DirectorSource').textContent=provenance;
 el('v5GravAccel').textContent=v6AccelText(g.mag);
 el('v6NetReading').textContent=v6AccelText(g.mag);
 el('v6Dominant').textContent=g.leading;
 el('v6SunReading').textContent=v6AccelText(g.parts.Sun.mag);
 el('v6SourceLabel').textContent=M.source;
 el('v6DestLabel').textContent=M.destination;
 el('v6SourceReading').textContent=v6AccelText(g.parts[M.source].mag);
 el('v6DestReading').textContent=v6AccelText(g.parts[M.destination].mag);
 el('v6OthersReading').textContent=v6AccelText(g.otherMag);
 if(v5LastCopy){v5LastCopy.version='Mission Control V6';v5LastCopy.provenance.gravity='full N-body recomputation using frozen SolarSystem ephemeris';v5LastCopy.provenance.plan='reconstructed gravitational coast from recorded departure handoff; NOT saved controller planned trajectory';v5LastCopy.natural_gravity={mps2:g.mag,vector_mps2:g.total,components:Object.fromEntries(Object.entries(g.parts).map(([name,v])=>[name,v.mag])),dominant:g.leading};v5LastCopy.ballistic_forecast_gate=v6CurrentGate(t);}
};
let v6LastUpdate=0,v6LastMission='',v6LastProgress=-1;
// Keep mission-selector switching and the protected old replay intact.
const _v6OldUpdateHero=updateHero;
updateHero=function(){_v6OldUpdateHero();v6LastMission='';};
const _v6OldLoadMission=loadMission;
loadMission=async function(id){await _v6OldLoadMission(id);v6BuildMarkers();const tt=progressToTime(progress),[ss,,derived]=stateAt(tt),[cc]=commandAt(tt);v5UpdateDetails(tt,ss,cc,derived,true);};
for(const id of ['v6ShowPlan','v6ShowFullRoute','v6ShowGate','v6NetGravity','v6SunGravity','v6SourceGravity','v6DestGravity'])el(id).addEventListener('change',()=>render());
// Render only when state or display settings change, or at a capped playback rate.
// V3/V5 otherwise repaint the entire map (and quadrature overlay) 60+ times per
// second even when paused, which is unnecessary and costly on mobile Safari.
let v6RenderLastSignature='',v6RenderLastAt=0,v6RenderLastMission='',v6RenderLastProgress=0;
const _v6RenderOriginal=render;
render=function(){
 if(!M)return;
 const signature=[M.id,progress,panX,panY,userZoom,view,mode,W,H,
  el('v6ShowPlan').checked,el('v6ShowFullRoute').checked,el('v6ShowGate').checked,
  el('v5ShowVectors').checked,el('v5VecVelocity').checked,el('v5VecRelative').checked,el('v5VecGAD').checked,
  el('v6NetGravity').checked,el('v6SunGravity').checked,el('v6SourceGravity').checked,el('v6DestGravity').checked,el('coneToggle').checked].join('|');
 const now=performance.now();
 if(!playing && signature===v6RenderLastSignature)return;
 if(playing && now-v6RenderLastAt<45)return;
 if(v6RenderLastMission!==M.id || Math.abs(progress-v6RenderLastProgress)>.04)frameCam=null;
 v6RenderLastAt=now;v6RenderLastMission=M.id;v6RenderLastProgress=progress;
 v6RenderLastSignature=signature;
 _v6RenderOriginal();
};
// Update current bootstrapped route; initial load had already run before patches were appended.
if(M){v6BuildMarkers();let t=progressToTime(progress),[s,,derived]=stateAt(t),[cmd]=commandAt(t);v5UpdateDetails(t,s,cmd,derived,true);}
