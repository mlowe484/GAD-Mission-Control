/* Mission Control V11 — Pilot Challenge 2.0
 * Teaching-only flight aids for the frozen, pre-existing 2D educational pilot.
 * Add inside the V9 viewer closure after V10.4. No physical forces, source
 * ephemerides, saved flight replays or mission certificates are modified.
 */
{
 const releaseBadge=document.querySelector('#gadProductionRelease strong');
 if(releaseBadge)releaseBadge.textContent='V11 · CURRENT RELEASE';
 document.title='GAD Mission Control · V11';
 window.GAD_PILOT_TRAINING=Object.freeze({release:'11',type:'educational',physicsChanged:false,qualification:'not independently certified'});
 const trainingStyle=document.createElement('style');
 trainingStyle.textContent=`
 .v11-panel{border:1px solid #335a70;background:#0b2434;border-radius:13px;padding:14px;margin:12px 0;display:grid;gap:12px;color:#d8ebf8}
 .v11-title{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:9px}.v11-eyebrow{font:800 10px system-ui;letter-spacing:.12em;color:#87dfdd;text-transform:uppercase}.v11-hint{font:12px/1.55 system-ui;color:#c4dfee}
 .v11-controls{display:grid;grid-template-columns:minmax(160px,1fr) minmax(180px,1fr);gap:10px}.v11-controls label{font:650 11px system-ui;color:#bdd6e9;display:grid;gap:5px}
 .v11-controls select,.v11-controls button{min-width:0;background:#143247;color:#f1fbff;border:1px solid #446578;border-radius:8px;padding:9px;font:650 12px system-ui}
 .v11-controls button{cursor:pointer}.v11-checked{display:flex;gap:9px;align-items:center;font:650 11px system-ui;color:#a6dfe2}.v11-checked input{accent-color:#72deda}
 .v11-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.v11-overview div{border:1px solid #29495c;border-radius:8px;background:#102f40;padding:9px;font:11px system-ui;color:#8bb7c9}.v11-overview strong{display:block;color:#e5faff;font-size:14px;margin-top:4px}
 .v11-report{padding:10px 12px;border:1px solid #315568;background:#112a3b;border-radius:9px;font:12px/1.6 system-ui;color:#c7e8f5;white-space:normal}
 .v11-report strong{color:#eafffe}.v11-report[data-status=success]{border-color:#3ba78c}.v11-report[data-status=failed]{border-color:#c58b60}
 .v11-legend{font:10px/1.45 system-ui;color:#8eafc6}.v11-run-label{font:11px/1.4 ui-monospace,monospace;color:#8ae8ea}
 @media(max-width:650px){.v11-panel{padding:10px}.v11-controls{grid-template-columns:1fr}.v11-overview{grid-template-columns:1fr 1fr 1fr}.v11-overview div{padding:6px;font-size:10px}.v11-overview strong{font-size:12px}}
 `;
 document.head.appendChild(trainingStyle);
 const unit=document.createElement('section');unit.className='v11-panel';unit.id='v11PilotCoach';
 unit.setAttribute('aria-label','Flight training and predicted trajectory');
 unit.innerHTML=`
 <div class="v11-title"><span class="v11-eyebrow">V11 · FLIGHT SCHOOL / GUIDED PRACTICE</span><span id="v11Progress" class="v11-run-label">0 / 5 lessons completed</span></div>
 <div class="v11-controls">
  <label>Training difficulty
   <select id="v11Difficulty" aria-label="Training difficulty"><option value="guided">Guided · trajectory and hints</option><option value="standard" selected>Standard · short trajectory</option><option value="expert">Expert · instruments only</option></select>
  </label>
  <label>Current-command prediction horizon
   <select id="v11Horizon" aria-label="Forecast horizon"><option value="120">2 simulated minutes</option><option value="300" selected>5 simulated minutes</option><option value="600">10 simulated minutes</option></select>
  </label>
 </div>
 <div class="v11-controls">
  <label class="v11-checked"><input id="v11ForecastEnabled" type="checkbox" checked> Show cyan dashed projected path</label>
  <button id="v11NextLesson" type="button">Next training scenario →</button>
 </div>
 <div class="v11-overview">
  <div>Min altitude<strong id="v11MinAlt">—</strong></div>
  <div>GAD active<strong id="v11BurnTime">0 s</strong></div>
  <div>Peak K<strong id="v11PeakK">0</strong></div>
 </div>
 <div id="v11Coach" class="v11-hint" role="status">Choose a scenario and use its objective as your target.</div>
 <div id="v11Report" class="v11-report" data-status="active" aria-live="polite"><strong>Flight report:</strong> Select a scenario, adjust the aperture, and press Start. A report appears after success or failure.</div>
 <div class="v11-legend">Cyan dashed = numerical <b>prediction if today's K, θ and φ commands stay fixed</b>; solid cyan = your actual flown history; amber dashed = initial gravity-only reference. This is an educational 2D single-body model, not a validated GAD controller forecast. Difficulty changes help and scoring, not the physics or objective gates.</div>
 `;
 const v10ScenarioBox=$$v9('v10Scenario')?.closest('.v10-scenarios');
 if(!v10ScenarioBox)throw Error('V11 requires the existing V10 scenario selector');
 v10ScenarioBox.after(unit);
 const get=id=>document.getElementById(id);
 const difficulty=get('v11Difficulty'),forecastEnabled=get('v11ForecastEnabled'),horizon=get('v11Horizon'),report=get('v11Report');
 const lessonKeys=Object.keys(v10Challenges);
 const lessonHints={
  capture:'Try reducing the inward radial speed before refining tangential motion. Watch eccentricity, periapsis and the GAD-off hold.',
  surface:'Start with whole-body repulsion to gain altitude. Then shift to a narrower aperture to gain sideways velocity before turning K off.',
  retro:'Reversing direction requires changing angular momentum, not merely turning the spacecraft symbol. Try a sideways repulsive component and monitor the angular-momentum sign.',
  departure:'Your heading gate is 30° in the fixed XY reference frame. Build outward radial velocity and adjust tangential speed without overshooting the target direction.',
  brake:'Your approach is energetic. Begin repulsive braking early, before the spacecraft reaches its closest approach, and aim to reduce inward radial velocity.'
 };
 let stats={minAlt:Infinity,burnTime:0,peakK:0,changes:0,started:false,completed:false,lastK:0,lastTheta:0,lastPhi:0};
 let results={},preview=[],forecastCache='',lastPreviewMs=0,lastReportState='';
 function resetTraining(){
  stats={minAlt:Math.max(0,Math.hypot(pilotState.x,pilotState.y)-R),burnTime:0,peakK:0,changes:0,started:false,completed:false,lastK:pilotK,lastTheta:pilotTheta,lastPhi:pilotPhi};
  preview=[];forecastCache='';lastPreviewMs=0;lastReportState='';
  report.dataset.status='active';report.innerHTML='<strong>Flight report:</strong> Your practice flight is ready. Pause to adjust K, aperture direction or width at any time.';
  updateCoach();updateMetrics();
 }
 const v11PreviousReset=resetPilot;
 resetPilot=function(){v11PreviousReset();resetTraining();};
 // V10 scenario-change listeners use the rebound v10SelectChallenge symbol.
 const v11PreviousSelect=v10SelectChallenge;
 v10SelectChallenge=function(key){v11PreviousSelect(key);resetTraining();};
 function secondsLabel(t){return t<120?Math.round(t)+' s':(t/60).toFixed(1)+' min';}
 function updateMetrics(){
  get('v11MinAlt').textContent=Number.isFinite(stats.minAlt)?stats.minAlt.toFixed(0)+' km':'—';
  get('v11BurnTime').textContent=secondsLabel(stats.burnTime);
  get('v11PeakK').textContent=String(stats.peakK);
  get('v11Progress').textContent=Object.values(results).filter(Boolean).length+' / '+lessonKeys.length+' lessons completed';
 }
 function updateCoach(){
  const m=v10Metrics(),mode=difficulty.value,key=v10Challenge,cfg=v10Challenges[key];
  const guidance=mode==='expert'?'Expert mode: use the instrument readings to judge your maneuver. Training hints and the projected path are hidden.':lessonHints[key];
  const diagnostics=`Altitude ${m.alt.toFixed(0)} km · radial ${m.vr.toFixed(2)} km/s · e ${m.e.toFixed(3)} · ${m.eps<0?'bound':'unbound'} two-body state · K ${pilotK}`;
  get('v11Coach').textContent=guidance+'  '+diagnostics+'. '+(pilotK===0?'GAD is off.':'GAD is powered.')+' Goal: '+cfg.goal+'.';
 }
 function updateTrainingAssist(){
  const mode=difficulty.value;
  horizon.disabled=mode==='expert';
  forecastEnabled.disabled=mode==='expert';
  forecastEnabled.checked=mode==='guided'||(mode==='standard'&&forecastEnabled.checked);
  if(mode==='expert')forecastEnabled.checked=false;
  preview=[];forecastCache='';updateCoach();drawPilot();
 }
 difficulty.addEventListener('change',updateTrainingAssist);
 horizon.addEventListener('change',()=>{forecastCache='';drawPilot();});
 forecastEnabled.addEventListener('change',()=>{forecastCache='';drawPilot();});
 get('v11NextLesson').addEventListener('click',()=>{
  const next=lessonKeys[(lessonKeys.indexOf(v10Challenge)+1)%lessonKeys.length];
  v10SelectChallenge(next);
 });
 // Run the SAME teaching acceleration and velocity-Verlet stepping equations
 // as doPilotStep, without mutating the actual flight state. Assumes the CURRENT
 // commanded aperture is held constant. This forecast is not an autonomous plan.
 function computePreview(){
  let z={x:pilotState.x,y:pilotState.y,vx:pilotState.vx,vy:pilotState.vy,t:pilotState.t};
  const points=[[z.x,z.y]],end=z.t+Number(horizon.value);
  for(let step=0;step<165&&z.t<end;step++){
   const a=modelAccel(z);const speed=Math.hypot(z.vx,z.vy),acc=Math.hypot(a.ax,a.ay);
   const dt=Math.max(.12,Math.min(10,(end-z.t),90/Math.max(.1,speed),Math.sqrt(80/Math.max(0.00001,acc))));
   const nx=z.x+z.vx*dt+.5*a.ax*dt*dt,ny=z.y+z.vy*dt+.5*a.ay*dt*dt;
   if(!Number.isFinite(nx)||!Number.isFinite(ny)||Math.hypot(nx,ny)<R||Math.hypot(nx,ny)>R*17)break;
   const b=modelAccel({x:nx,y:ny});
   z={x:nx,y:ny,vx:z.vx+(a.ax+b.ax)*dt/2,vy:z.vy+(a.ay+b.ay)*dt/2,t:z.t+dt};
   points.push([z.x,z.y]);
  }
  return points;
 }
 const oldDrawPilot=drawPilot;
 drawPilot=function(){
  oldDrawPilot();
  if(active!=='pilot'||!pilotState)return;
  if(forecastEnabled.checked&&difficulty.value!=='expert'){
   const bucket=Math.floor(pilotState.t/20),key=[v10Challenge,pilotK,pilotTheta,pilotPhi,horizon.value,bucket].join('|');
   const ms=Date.now();
   if((forecastCache!==key||!preview.length)&&ms-lastPreviewMs>600){
    preview=computePreview();forecastCache=key;lastPreviewMs=ms;
   }
   if(preview.length>1){
    const {c,w,h}=fitCanvas(pc),zoom=Math.min(w/6.7,h/5.2)/R,centerX=w*.38,centerY=h*.5;
    c.save();c.strokeStyle='#b5faff';c.setLineDash([3,5]);c.lineWidth=1.8;c.globalAlpha=.87;c.beginPath();
    preview.forEach(([x,y],i)=>{const X=centerX+x*zoom,Y=centerY-y*zoom;if(i)c.lineTo(X,Y);else c.moveTo(X,Y)});c.stroke();c.restore();
   }
  }
 };
 const oldPilotStep=doPilotStep;
 doPilotStep=function(dt){
  if(pilotDone||pilotFail)return;
  if(pilotK!==stats.lastK||pilotTheta!==stats.lastTheta||pilotPhi!==stats.lastPhi){stats.changes++;stats.lastK=pilotK;stats.lastTheta=pilotTheta;stats.lastPhi=pilotPhi;}
  stats.started=true;stats.peakK=Math.max(stats.peakK,pilotK);
  if(pilotK>0)stats.burnTime+=dt;
  oldPilotStep(dt);
  stats.minAlt=Math.min(stats.minAlt,Math.hypot(pilotState.x,pilotState.y)-R);
  if(pilotDone||pilotFail){
   const m=v10Metrics(),outcome=pilotDone?'success':'failed';
   const reason=pilotDone?'The selected objective and GAD-off hold were achieved.':m.alt<=0?'Impact with the modeled surface.':m.alt<120?'The safe-altitude boundary was crossed.':m.r>R*17?'The craft escaped the training region.':'The scenario time limit was exceeded.';
   const lesson=lessonHints[v10Challenge];
   const usedAssistance=difficulty.value;
   const score=pilotDone?Math.max(30,100-Math.round(25*pilotState.t/v10Challenges[v10Challenge].limit)-Math.min(20,Math.floor(stats.changes/10))-Math.min(15,Math.floor(stats.burnTime/250))):0;
   if(pilotDone)results[v10Challenge]=true;
   report.dataset.status=outcome;
   report.textContent=(pilotDone?'✓ Mission objective reached. ':'✕ Attempt ended. ')+reason+' Training score: '+score+'/100 ('+usedAssistance+' assistance, not an independent qualification). Minimum altitude '+stats.minAlt.toFixed(0)+' km; peak K '+stats.peakK+'; powered time '+secondsLabel(stats.burnTime)+'; command changes '+stats.changes+'. '+(pilotDone?'Try the next scenario.':'Suggested next attempt: '+lesson);
   updateMetrics();lastReportState=outcome;
  }
 };
 // Instrument updates are intentionally lightweight; forecasts calculate only
 // when needed and never rewrite the frozen flight logs.
 const oldPilotLabels=updatePilotLabels;
 let lastLabelUpdate=0;
 updatePilotLabels=function(){oldPilotLabels();if(active==='pilot'&&Date.now()-lastLabelUpdate>350){lastLabelUpdate=Date.now();updateMetrics();updateCoach();}};
 // Ensure initial UI state after V10's initial scenario was already created.
 resetTraining();updateTrainingAssist();
}
