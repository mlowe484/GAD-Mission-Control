/* Mission Control V10.4 — JPL subsystem explorer UI.
 * Inject INSIDE the V9 viewer closure after V10.3.
 * Does not alter the frozen ephemeris, historic replays, or GAD physics.
 * Trail coverage and follow tracking use a validated display-only V10.1 hook.
 */
{
 const release='V10.4';
 const badge=document.querySelector('#gadProductionRelease strong');
 if(badge)badge.textContent=release+' · CURRENT RELEASE';
 document.title='GAD Mission Control · '+release;
 const modes=window.GAD_MISSION_CONTROL_RELEASE;
 // V10.3's release object is intentionally immutable: provide a separate
 // descriptive capability flag rather than overwrite its archival metadata.
 window.GAD_SUBSYSTEM_EXPLORER=Object.freeze({release:'10.4',source:'P6F / JPL ephemeris',simulationPhysicsChanged:false});
 const settings=window.__GAD_V104_SETTINGS={trailsEnabled:true,trailOrbits:1.05,follow:true,frozenCenter:null};
 // Prefer the actual native-cadence moon chunks. Older V10's loader still
 // points at coarse JSON files even though native P6F chunks exist in /data.
 // Preserve its fallback only when the new verified-format display data fails.
 const v104FallbackMoonLoader=v10LoadMoons;
 let v104NativePending=null;
 v10LoadMoons=function(){
  if(v10MoonData&&Object.values(v10MoonData.bodies).length===20&&
     Object.values(v10MoonData.bodies).every(b=>b.encoding==='f32le-poskm-velkmps-interleaved'))return Promise.resolve();
  if(v104NativePending)return v104NativePending;
  v104NativePending=(async()=>{
    const counts=[7,5,6,3],sizes=[6080083,4444623,5379423,2339770];
    v10Verify.textContent='Loading native-cadence P6F moon states (18 MB; first load may take longer)…';
    const parts=await Promise.all(counts.map(async(count,index)=>{
      const fragments=await Promise.all(Array.from({length:count},async(_,j)=>{
        const file='native-p6f-part'+(index+1)+'-'+String(j+1).padStart(2,'0')+'.txt';
        const response=await fetch('./data/native-moons/'+file+'?release=v10-4-native');
        if(!response.ok)throw Error(file+' HTTP '+response.status);
        return response.text();
      }));
      const joined=fragments.join('');
      if(joined.length!==sizes[index])throw Error('Native P6F moon chunk size mismatch in part '+(index+1));
      const parsed=JSON.parse(joined);
      if(parsed.display_data_revision!=='P6F-native-cadence-with-velocity-Hermite-v2')throw Error('Unexpected native moon data revision');
      return parsed;
    }));
    const all={...parts[0],bodies:Object.assign({},...parts.map(p=>p.bodies))};
    if(Object.keys(all.bodies).length!==20||Object.values(all.bodies).some(b=>b.encoding!=='f32le-poskm-velkmps-interleaved'))throw Error('Native moon inventory incomplete');
    v10MoonData=all;
    v10Verify.textContent='20 native-cadence P6F moons: archived positions and velocities with Hermite interpolation. Viewer-derived display; not separate JPL certification.';
    if(active==='3d')draw3d();
  })().catch(async error=>{
    console.warn('Native moon fetch failed, requesting older fallback',error);
    v10Verify.textContent='Native-resolution moon archive unavailable; fallback may be coarse: '+error.message;
    await v104FallbackMoonLoader();
  }).finally(()=>{v104NativePending=null;});
  return v104NativePending;
 };
 const style=document.createElement('style');
 style.textContent=`
 .v104-explorer{border:1px solid #30566c;background:#0a2232;border-radius:13px;padding:13px;margin:12px 0;display:grid;gap:12px;color:#d7edfa}
 .v104-label{font:750 10px/1.4 system-ui;letter-spacing:.1em;color:#9ddae8;text-transform:uppercase}
 .v104-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
 .v104-presets button,.v104-camera button{background:#14364a;border:1px solid #315a70;color:#dceef9;padding:8px 12px;border-radius:8px;cursor:pointer;font:650 11px system-ui}
 .v104-presets button[aria-pressed=true],.v104-camera button[aria-pressed=true]{background:#126a72;color:#fff;border-color:#74d9df}
 .v104-controls{display:grid;grid-template-columns:minmax(165px,1.3fr) minmax(140px,.8fr) minmax(150px,1fr);gap:12px;align-items:end}
 .v104-controls label{display:flex;flex-direction:column;gap:6px;font:600 11px system-ui;color:#b9d8e8}
 .v104-controls select{width:100%;min-width:0;background:#112f44;border:1px solid #40647b;color:#f5fbff;border-radius:8px;padding:9px;color-scheme:dark;font:12px system-ui}
 .v104-toggles{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
 .v104-toggles label{display:inline-flex;gap:7px;align-items:center;font:600 11px system-ui;color:#bfd9ea;cursor:pointer}
 .v104-toggles input{accent-color:#7adadd}
 .v104-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
 .v104-metric{background:#102e41;border:1px solid #284859;border-radius:9px;padding:9px 10px;min-width:0}
 .v104-metric span{display:block;color:#87b2cc;font:10px system-ui;margin-bottom:5px}
 .v104-metric strong{display:block;color:#e5faff;font:750 13px system-ui;overflow-wrap:anywhere}
 .v104-caption{font:10px/1.5 system-ui;color:#91b6cb}
 @media(max-width:760px){.v104-controls{grid-template-columns:1fr 1fr}.v104-controls label:first-child{grid-column:1/-1}.v104-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.v104-explorer{padding:10px}.v104-presets button{padding:8px 10px}}
 `;
 document.head.appendChild(style);
 const section=document.createElement('section');section.className='v104-explorer';
 section.setAttribute('aria-label','Subsystem exploration and orbital information');
 section.innerHTML=`
 <div><div class="v104-label">JPL / P6F Subsystem Explorer</div><div class="v104-caption">Jump to a planetary system, select a moon to follow, and examine its archived motion. The orbit metrics below are calculated display estimates.</div></div>
 <div class="v104-presets v104-row" role="group" aria-label="Quick subsystem focus">
  <button type="button" data-system="Sun">Solar System</button><button type="button" data-system="Earth">Earth–Moon</button><button type="button" data-system="Mars">Mars</button><button type="button" data-system="Jupiter">Jupiter</button><button type="button" data-system="Saturn">Saturn</button><button type="button" data-system="Uranus">Uranus</button><button type="button" data-system="Neptune">Neptune</button></div>
 <div class="v104-controls">
  <label for="v104Track">Follow body or moon<select id="v104Track" aria-label="Follow selected body or moon"><option value="">Choose a system above</option></select></label>
  <label for="v104TrailLength">Orbit-trail length<select id="v104TrailLength"><option value="0.25">¼ orbit</option><option value="0.5">½ orbit</option><option value="1.05" selected>1 orbit</option><option value="2">2 orbits</option><option value="4">4 orbits</option></select></label>
  <div><div class="v104-label" style="margin-bottom:8px">Camera inclination</div><div class="v104-camera v104-row"><button type="button" data-view="top">Top</button><button type="button" data-view="oblique">Angled</button><button type="button" data-view="edge">Edge</button></div></div>
 </div>
 <div class="v104-toggles"><label><input type="checkbox" id="v104ShowTrails" checked> Show orbit trails</label><label><input type="checkbox" id="v104Follow" checked> Follow moving body</label><span id="v104SystemStatus" class="v104-caption" aria-live="polite">Select a planetary system to explore its moons</span></div>
 <div class="v104-stats" aria-label="Selected body's derived orbital properties">
   <div class="v104-metric"><span>Distance from parent</span><strong id="v104Distance">—</strong></div>
   <div class="v104-metric"><span>Relative speed</span><strong id="v104Speed">—</strong></div>
   <div class="v104-metric"><span>Estimated orbital period</span><strong id="v104Period">—</strong></div>
   <div class="v104-metric"><span>Inclination (J2000 plane)</span><strong id="v104Inclination">—</strong></div>
 </div><div class="v104-caption" id="v104OrbitNote">These are instantaneous two-body approximations derived from JPL-reference positions, not stored mean orbital elements. Inclination is relative to the inertial J2000 XY plane, not the planet's equator.</div>`;
 const target=three.querySelector('.v101-options')||threeCanvas;
 three.insertBefore(section,target);
 // Keep the 3D plot visible: the larger statistics panel belongs below it.
 const metrics=document.createElement('section');metrics.className='v104-explorer v104-metrics-panel';
 metrics.style.marginTop='10px';
 const metricHeading=document.createElement('div');metricHeading.className='v104-label';metricHeading.textContent="Selected body's orbital diagnostics";
 metrics.append(metricHeading,section.querySelector('.v104-stats'),section.querySelector('#v104OrbitNote'));
 threeCanvas.after(metrics);
 const get=id=>document.getElementById(id);
 const focusSelect=get('v10Focus'),moonsToggle=get('v10Moons'),yaw=get('v9Yaw'),tilt=get('v9Tilt'),zoom=get('v9Zoom');
 const track=get('v104Track'),status=get('v104SystemStatus');
 const systemButtons=Array.from(section.querySelectorAll('[data-system]'));
 const moony=name=>v10MoonData?.bodies?.[name];
 const parentOfV104=name=>v10Primary?.bodies?.[name]?.parent||moony(name)?.parent||null;
 const systemOf=name=>name==='Sun'?'Sun':parentOfV104(name)==='Sun'?name:name==='Moon'?'Earth':parentOfV104(name)||name;
 function adjustTrackList(){
  if(!v10Primary)return;
  const key=systemOf(v10Anchor);
  const bodies=[key];
  const all={...v10Primary.bodies,...(moonsToggle.checked?v10MoonData?.bodies||{}:{})};
  for(const name of Object.keys(all))if(parentOfV104(name)===key&&name!==key)bodies.push(name);
  const old=track.value;
  track.replaceChildren();
  for(const name of bodies){if(name==='Sun'&&key!=='Sun')continue;
   const opt=document.createElement('option');opt.value=name;opt.textContent=name===key?name+' · system center':name+' · moon';track.appendChild(opt);
  }
  track.value=bodies.includes(v10Anchor)?v10Anchor:key;
  if(!track.value&&bodies.length)track.value=bodies[0];
  systemButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.system===key)));
  if(key!=='Sun'&&moonsToggle.checked&&!v10MoonData){status.textContent='Loading native-cadence moon ephemeris…';}
  else{status.textContent=Math.max(0,bodies.length-1)+' orbiting '+(bodies.length===2?'body':'bodies')+' in selection';}
 }
 function doFocus(name,resetZoom=true){
  if(!v10Primary)return;
  const selection=name||'Sun';
  v10Anchor=selection;focusSelect.value=selection;
  if(resetZoom){zoom.value='100';zoom.dispatchEvent(new Event('input',{bubbles:true}));}
  if(!settings.follow)settings.frozenCenter=v10Vector(selection,v10ClockSec);
  else settings.frozenCenter=null;
  adjustTrackList();draw3d();
 }
 for(const button of systemButtons)button.addEventListener('click',async()=>{
  const key=button.dataset.system;
  if(key!=='Sun'&&!moonsToggle.checked){moonsToggle.checked=true;}
  doFocus(key);
  if(key!=='Sun'&&!v10MoonData){
   try{await v10LoadMoons();}catch(err){console.warn('Moon data unavailable',err);}
   adjustTrackList();draw3d();
  }
 });
 track.addEventListener('change',()=>doFocus(track.value));
 focusSelect.addEventListener('change',()=>{if(!settings.follow)settings.frozenCenter=v10Vector(v10Anchor,v10ClockSec);adjustTrackList();});
 moonsToggle.addEventListener('change',()=>{if(!moonsToggle.checked&&moony(v10Anchor)){doFocus(parentOfV104(v10Anchor));}adjustTrackList();});
 get('v104ShowTrails').addEventListener('change',e=>{settings.trailsEnabled=e.target.checked;draw3d();});
 get('v104TrailLength').addEventListener('change',e=>{settings.trailOrbits=Number(e.target.value);draw3d();});
 get('v104Follow').addEventListener('change',e=>{settings.follow=e.target.checked;settings.frozenCenter=settings.follow?null:v10Vector(v10Anchor,v10ClockSec);draw3d();});
 section.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  const v=button.dataset.view;
  tilt.value=v==='top'?'0':v==='edge'?'90':'55';
  yaw.value=v==='top'?'0':v==='edge'?'35':'25';
  section.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  draw3d();
 }));
 const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n):'—';
 function updateStats(){
  if(!v10Primary||active!=='3d')return;
  const body=v10Anchor,parent=parentOfV104(body);
  const ids=['v104Distance','v104Speed','v104Period','v104Inclination'];
  if(!parent){for(const id of ids)get(id).textContent='—';get('v104OrbitNote').textContent='The Sun has no parent in this heliocentric reference. Select a planet or moon for parent-relative orbital statistics.';return;}
  const t=v10ClockSec,p=v10Vector(body,t),h=v10Vector(parent,t),mu=v10Mu[parent];
  const before=Math.max(v10Primary.t0_tdb_s,t-30),after=Math.min(v10Primary.t1_tdb_s,t+30);
  const p0=v10Vector(body,before),p1=v10Vector(body,after),h0=v10Vector(parent,before),h1=v10Vector(parent,after);
  if(!p||!h||!p0||!p1||!h0||!h1||!(after>before)||!mu)return;
  const r=p.map((x,i)=>(x-h[i])*v10AU);
  const v=p1.map((x,i)=>((x-h1[i])-(p0[i]-h0[i]))*v10AU/(after-before));
  const dist=Math.hypot(...r),speed=Math.hypot(...v);
  const cross=[r[1]*v[2]-r[2]*v[1],r[2]*v[0]-r[0]*v[2],r[0]*v[1]-r[1]*v[0]];
  const hmag=Math.hypot(...cross);
  const incl=hmag>0?Math.acos(Math.max(-1,Math.min(1,cross[2]/hmag)))*180/Math.PI:NaN;
  const energy=speed*speed*.5-mu/dist;
  const axis=energy<0?-mu/(2*energy):NaN;
  const period=Number.isFinite(axis)&&axis>0?2*Math.PI*Math.sqrt(axis**3/mu):NaN;
  get('v104Distance').textContent=dist>=1e7?(dist/v10AU).toFixed(4)+' AU':fmt(dist)+' km';
  get('v104Speed').textContent=speed.toFixed(speed<1?3:2)+' km/s';
  get('v104Period').textContent=Number.isFinite(period)?period<86400?(period/3600).toFixed(2)+' h':(period/86400).toFixed(period>86400*20?1:2)+' d':'unbound';
  get('v104Inclination').textContent=Number.isFinite(incl)?incl.toFixed(2)+'°':'—';
  get('v104OrbitNote').textContent=body+' relative to '+parent+' · instantaneous two-body estimates from the P6F JPL display coordinates (including time interpolation). Inclination is relative to the inertial J2000 XY plane, not '+parent+'’s equator. Historical flight certification is separate.';
 }
 const previousDraw=draw3d;
 let lastStatsT=NaN,lastStatsBody='',lastUpdatedBody='';
 draw3d=function(){previousDraw();if(active!=='3d')return;
  // The native-moon loader calls draw3d after its asynchronous import.
  const moonCount=v10MoonData?Object.keys(v10MoonData.bodies).length:0;
  const key=systemOf(v10Anchor)+'/'+v10Anchor+'/'+moonsToggle.checked+'/'+moonCount;
  if(key!==lastStatsBody){adjustTrackList();lastStatsBody=key;}
  if(!Number.isFinite(lastStatsT)||Math.abs(v10ClockSec-lastStatsT)>15||v10Anchor!==lastUpdatedBody){lastStatsT=v10ClockSec;lastUpdatedBody=v10Anchor;updateStats();}
 };
 if(v10Primary){adjustTrackList();updateStats();draw3d();}
 // reset3d in V10.1 resets the camera; keep new controls consistent as well.
 const oldReset=get('v101Reset');
 if(oldReset)oldReset.addEventListener('click',()=>{
  settings.follow=true;settings.frozenCenter=null;settings.trailsEnabled=true;settings.trailOrbits=1.05;
  get('v104Follow').checked=true;get('v104ShowTrails').checked=true;get('v104TrailLength').value='1.05';
  lastStatsBody='';adjustTrackList();updateStats();
 });
}