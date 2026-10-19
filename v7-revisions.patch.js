/* Mission Control V7 revision registry and selector.
 * No controller revision is hard-coded into the replay engine. Catalog entries
 * identify immutable routes, revision provenance and archived verification.
 * The existing V3-V6 viewer is deliberately reused without changing physics. */
const v7Catalog=GAD_V7_CATALOG;
const v7Entries=v7Catalog.replays;
const v7OriginalStates=Object.assign({},EMBEDDED);
const v7OriginalNav=Object.assign({},GAD_V6_NAV_DATA.routes);
const v7OriginalCentroid=Object.assign({},GAD_CENTROID_DATA);
const v7Cache={};
let v7Revision='RC42',v7LoadToken=0;
const v7Style=document.createElement('style');
v7Style.textContent=`.v7-provenance{padding:9px 12px;border:1px solid #325670;border-radius:10px;background:#0a1c2d;margin:8px 0 10px;font-size:11px;color:#b5cde3;line-height:1.55}.v7-provenance b{color:#a0ede6}.v7-revision-wrap{min-width:130px}.v7-provenance .v7-muted{color:#819eb5}.v7-missing{color:#f3bb8e}.v7-tooltip{font-size:10px;color:#a8bfd5;margin-left:2px}@media(max-width:760px){.v7-revision-wrap{min-width:105px}.v7-provenance{font-size:10px;padding:8px}}`;
document.head.appendChild(v7Style);
const v7RevWrap=document.createElement('div');v7RevWrap.className='select-wrap v7-revision-wrap';
const v7RevLabel=document.createElement('label');v7RevLabel.htmlFor='v7RevisionSelect';v7RevLabel.textContent='Controller revision';
const v7RevSelect=document.createElement('select');v7RevSelect.id='v7RevisionSelect';v7RevSelect.setAttribute('aria-label','Select flight controller revision');
v7RevWrap.append(v7RevLabel,v7RevSelect);el('missionSelect').closest('.select-wrap').after(v7RevWrap);
// Optional no-upload session import: select any normalized revision replay JSON.
const v7ImportLabel=document.createElement('label');v7ImportLabel.className='btn ghost small';
v7ImportLabel.textContent='Import replay JSON';v7ImportLabel.title='Read a normalized GAD replay locally. No file is sent to a server.';
v7ImportLabel.style.cursor='pointer';
const v7ImportInput=document.createElement('input');v7ImportInput.type='file';v7ImportInput.accept='.json,application/json';v7ImportInput.hidden=true;
v7ImportLabel.appendChild(v7ImportInput);v7RevWrap.after(v7ImportLabel);
const v7Prov=document.createElement('div');v7Prov.className='v7-provenance';v7Prov.id='v7Provenance';v7Prov.setAttribute('aria-live','polite');
document.querySelector('.hero').after(v7Prov);
const v7Brand=document.querySelector('.brand-title');if(v7Brand)v7Brand.textContent='Hypothetical GAD simulator · revision-indexed archived flight replays';
const v7Foot=document.querySelector('.provenance .text');
if(v7Foot)v7Foot.textContent='DATA INTEGRITY · Hypothetical 2D propulsion-model replays, not experimental evidence of a real drive. Each trajectory and command sequence belongs to the controller revision shown above. Derived prelaunch and post-shutdown orbits are explanatory visualizations. Cross-revision forecasts, coupled-mass estimates, and certificates must not be borrowed from a different replay.';
const v7ListByRoute=route=>v7Entries.filter(e=>e.route===route);
for(const e of v7Entries){if(!MANIFEST.some(m=>m.id===e.route))MANIFEST.push({id:e.route,label:e.label||e.route,file:e.file||''});}
MANIFEST.sort((a,b)=>a.label.localeCompare(b.label));
function v7AdjustSelector(route){
 const options=v7ListByRoute(route);if(!options.length)return null;
 const active=options.find(e=>e.revision===v7Revision)||options.find(e=>e.preferred)||options[0];
 v7Revision=active.revision;v7RevSelect.replaceChildren();
 for(const e of options){const o=document.createElement('option');o.value=e.revision;o.textContent=e.revision+(e.verified?' · Verified':' · Not certified');o.selected=e.revision===active.revision;v7RevSelect.appendChild(o);}
 return active;
}
async function v7FetchReplay(entry){
 if(entry.embedded==='legacy-rc42'){
   const data=v7OriginalStates[entry.route];if(!data)throw new Error('Legacy RC42 replay not found: '+entry.route);
   return data;
 }
 const key=entry.replay_id;
 if(v7Cache[key])return v7Cache[key];
 const resp=await fetch(entry.file+'?revision='+encodeURIComponent(entry.revision));
 if(!resp.ok)throw new Error('HTTP '+resp.status+' loading '+entry.file);
 const data=await resp.json();
 if(!data||!Array.isArray(data.states)||!Array.isArray(data.commands)||!data.meta)throw new Error('Malformed replay contract');
 if(data.meta.id!==entry.route || data.meta.revision!==entry.revision || data.meta.replay_id!==entry.replay_id)throw new Error('Replay identity mismatch');
 if(data.states.length<2||data.commands.length<1)throw new Error('Incomplete trajectory or command history');
 v7Cache[key]=data;return data;
}
function v7DisplayRevision(entry,data){
 const meta=data.meta||{},proof=meta.verification||{};
 const passed=entry.embedded==='legacy-rc42'?true:!!(proof.certified_for_display && entry.verified);
 const flightDay=meta.flight_days;
 el('heroEyebrow').textContent='Flight replay / '+entry.revision+' / '+entry.route.replace('_',' → ');
 el('heroDescription').textContent=`${entry.revision} controller · ${entry.benchmark||meta.source_evidence?.benchmark||'archived trajectory'} · ${passed?'certified replay':'verification not provided'}.`;
 document.title=`GAD Mission Control · ${meta.source} → ${meta.destination} · ${entry.revision}`;
 el('disclosure').textContent=`${entry.revision} recorded transfer trajectory and controls. Prelaunch hold and post-shutdown orbit are derived visualizations. Revision-specific forecast/centroid graphics are only shown when matching source evidence exists.`;
 const sourceDigest=meta.source_evidence?.trajectory_sha256;
 const sha=(sourceDigest&&sourceDigest.slice(0,12))||'archived RC42 provenance';
 v7Prov.innerHTML='';
 const strong=document.createElement('b');strong.textContent=`${entry.revision} · ${meta.source} → ${meta.destination}`;
 const details=document.createElement('span');details.className='v7-muted';
 details.textContent=` · ${typeof flightDay==='number'?flightDay.toFixed(2)+' days':'Flight time unavailable'} · ${passed?'Independent replay + GAD-off verified':'Not independently certified'} · Source ${sha}`;
 const line=document.createElement('div');line.className='v7-tooltip';
 line.textContent=entry.embedded==='legacy-rc42'?'RC42 sampled historical replay; some visualizations derived.':
  'Trajectory, commands, and certification from selected revision; no RC42 navigation forecast or mass-centroid data reused.';
 v7Prov.append(strong,details,line);
 const cert=document.querySelector('.topbar .pill.ok');
 if(cert){cert.textContent=passed?'● VERIFIED SIMULATION':'● ARCHIVED SIMULATION';}
 const toggle=el('v6ShowPlan'),gate=el('v6ShowGate');
 // An RC42-only archived forecast must not appear on RC44 replays.
 if(toggle){toggle.checked=!!(entry.embedded==='legacy-rc42');toggle.disabled=entry.embedded!=='legacy-rc42';}
 if(gate){gate.checked=!!(entry.embedded==='legacy-rc42');gate.disabled=entry.embedded!=='legacy-rc42';}
 const legend=document.querySelector('.v6-route-legend');
 if(legend)legend.textContent=entry.embedded==='legacy-rc42'?'Flown path (solid) · RC42 reconstructed no-GAD coast (dashed) · recorded forecast gates':'Flown path (solid) · Planned comparison unavailable for this revision until its forecast data is imported.';
 const massCard=el('masscard');if(massCard){
  massCard.hidden=entry.embedded!=='legacy-rc42';
  massCard.title=entry.embedded==='legacy-rc42'?'Recomputed from matching RC42 controls':'No revision-matched mass-centroid dataset; deliberately hidden';
 }
 const v5Footnote=el('v5GravAccel')?.closest('section')?.querySelector('.v5-footnote');
 if(v5Footnote)v5Footnote.textContent=entry.embedded==='legacy-rc42'?
  'Vector lengths are normalized for visibility. GAD direction and mass-centroid estimates are recomputed using matching RC42 data.':
  'Vector lengths are normalized for visibility. Gravity is recomputed using a shared modeled ephemeris and selected-flight body positions; revision-specific GAD centroid integration is unavailable.';
}
const v7OldLoad=loadMission;
loadMission=async function(id){
 const seq=++v7LoadToken,selection=v7AdjustSelector(id);
 if(!selection){console.error('No revision registered for route '+id);return;}
 setPlaying(false);el('startupWarning').hidden=false;
 try{
  const data=await v7FetchReplay(selection);if(seq!==v7LoadToken)return;
  // Shared route IDs are intentional. Replace the *entire* route's data,
  // not individual commands: never combine evidence across revisions.
  EMBEDDED[id]=data;
  if(selection.embedded==='legacy-rc42'){
   if(v7OriginalNav[id])GAD_V6_NAV_DATA.routes[id]=v7OriginalNav[id];
   if(v7OriginalCentroid[id])GAD_CENTROID_DATA[id]=v7OriginalCentroid[id];
  }else{
   GAD_V6_NAV_DATA.routes[id]={launch_epoch_s:data.meta.epoch_start_s,
    ballistic_path_km:[],forecast_gates:[]};
   delete GAD_CENTROID_DATA[id];
  }
  // A fresh camera and overview bound is required when only the revision changes.
  v63LastMission='';v63Bounds=null;
  await v7OldLoad(id);
  if(seq!==v7LoadToken)return;
  v7DisplayRevision(selection,data);
  render();
 }catch(error){
  console.error('Revision replay load failed',error);
  el('startupWarning').textContent='Unable to load the selected replay: '+error.message;
  el('startupWarning').hidden=false;
 }
};

function v7ValidateUploaded(data){
 if(data?.schema_version!=='gad-replay-v1')throw new Error('Requires gad-replay-v1 normalized JSON');
 const m=data.meta||{},id=String(m.id||''),rev=String(m.revision||'');
 if(!/^[a-z0-9]+_[a-z0-9]+$/.test(id)||!/^[a-zA-Z0-9._-]{1,40}$/.test(rev))throw new Error('Invalid route or controller revision identifier');
 if(m.replay_id!==id+'@'+rev)throw new Error('Replay ID does not match route and revision');
 if(!Array.isArray(data.states)||data.states.length<2||!Array.isArray(data.commands)||data.commands.length<1)throw new Error('Missing states or commands');
 if(!['string'].includes(typeof m.source)||typeof m.destination!=='string')throw new Error('Missing source/destination names');
 for(const v of ['source_radius_km','dest_radius_km','source_mu','dest_mu','epoch_start_s','recorded_end_s'])if(!Number.isFinite(m[v]))throw new Error('Invalid model metadata '+v);
 for(const row of data.states)if(!Array.isArray(row)||row.length!==15||!row.slice(0,14).every(Number.isFinite)||![1,2,3,4].includes(row[14]))throw new Error('Malformed trajectory row');
 for(const row of data.commands)if(!Array.isArray(row)||row.length!==7||![0,1].includes(row[1])||!Number.isFinite(row[0])||!Number.isFinite(row[3])||!Number.isFinite(row[4])||!Number.isFinite(row[5]))throw new Error('Malformed engine command row');
 if(data.states.some((r,i)=>i&&r[0]<data.states[i-1][0]))throw new Error('Out-of-order state samples');
 return {id,rev};
}
v7ImportInput.addEventListener('change',async()=>{
 const file=v7ImportInput.files?.[0];if(!file)return;
 try{
  if(file.size>40*1024*1024)throw new Error('Select a normalized JSON under 40 MB');
  const data=JSON.parse(await file.text()),{id,rev}=v7ValidateUploaded(data);
  const key=id+'@'+rev;
  const entry={route:id,revision:rev,replay_id:key,label:`${data.meta.source} → ${data.meta.destination}`,
    verified:false,benchmark:data.meta.source_evidence?.benchmark||'Local session import',
    local_session:true,file:'(loaded locally)'};
  const old=v7Entries.findIndex(e=>e.replay_id===key);
  if(old>=0)v7Entries.splice(old,1,entry);else v7Entries.push(entry);
  v7Cache[key]=data;
  if(!MANIFEST.some(m=>m.id===id))MANIFEST.push({id,label:entry.label,file:''});
  MANIFEST.sort((a,b)=>a.label.localeCompare(b.label));
  currentMissionId=id;v7Revision=rev;updateMissionSelector();
  await loadMission(id);
  const message=document.createElement('div');message.className='v7-tooltip';
  message.textContent='Loaded from this device for this session only. Nothing uploaded to GitHub or a server.';
  v7Prov.appendChild(message);
 }catch(error){console.error('Replay import rejected',error);alert('Replay was not imported: '+error.message);}
 v7ImportInput.value='';
});

v7RevSelect.addEventListener('change',()=>{v7Revision=v7RevSelect.value;loadMission(currentMissionId);});
// Update original mission options; RC42 remains the starting replay.
updateMissionSelector();v7AdjustSelector(currentMissionId);
if(M){const first=v7Entries.find(e=>e.route===currentMissionId&&e.revision==='RC42');if(first)v7DisplayRevision(first,{meta:M});}