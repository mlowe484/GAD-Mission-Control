/* Mission Control V6.1 — reader-paced flight briefing.
   Explanatory text is STABLE within each phase. Live dynamics continue below.
   No flight states, model physics, flight timing, navigation evidence or commands change.
*/
const gad61Style=document.createElement('style');
gad61Style.textContent=`
.v61-controls{display:flex;gap:7px;align-items:center;flex-wrap:wrap;border-top:1px solid #245165;margin-top:9px;padding-top:9px}
.v61-controls button{color:#bbecf1;background:#102f42;border:1px solid #315a6d;border-radius:7px;padding:7px 10px;font-size:10px;font-weight:730;cursor:pointer}
.v61-controls button:hover,.v61-controls button:focus-visible{border-color:#80dcdb;background:#174154}
.v61-controls label{display:inline-flex;align-items:center;gap:5px;color:#b4d5e3;font-size:10px;cursor:pointer}
.v61-controls input{accent-color:#88e6df}
.v61-indicator{display:flex;align-items:center;flex-wrap:wrap;gap:5px;color:#98b8ca;font-size:10px;margin-top:6px;line-height:1.4}
.v61-indicator b{color:#bce8e9}.v61-indicator .v61-dot{background:#3e6974;width:6px;height:6px;border-radius:50%}
.v61-details{font-size:11px;line-height:1.55;margin-top:8px;color:#a9c8d8;max-width:950px}
.v61-controls button:disabled{opacity:.34;cursor:default}
.v61-director-title{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.v61-chip{font-size:9px!important;line-height:1.3!important;border:1px solid #2d5567;border-radius:5px;color:#98c6d6;padding:2px 5px}
.v61-director-reading{min-width:0}
.v61-live-note{font-size:9px;color:#96aaba}
.v5-director{display:block!important;padding:11px 13px!important;margin-bottom:9px!important}
.v5-title{font-size:13px!important;line-height:1.25!important;margin-top:3px!important}
.v5-explain{font-size:11px!important;line-height:1.48!important;margin-top:5px!important}
.v5-status{font-size:9px!important;margin-top:5px!important}
.v5-guide-btn{padding:6px 10px!important;font-size:10px!important}
@media(max-width:760px){.v61-controls{gap:5px}.v61-controls button{padding:6px 8px;font-size:10px}.v61-controls label{font-size:10px}.v61-indicator{font-size:9px}.v5-director{padding:10px 11px!important}}
`;
document.head.appendChild(gad61Style);
// Move the milestone jump into the control strip: no bulky right-hand column.
const gad61Director=el('v5DirectorTitle').closest('.v5-director');
const gad61Text=el('v5DirectorTitle').parentElement;
gad61Text.classList.add('v61-director-reading');
const gad61Controls=document.createElement('div');gad61Controls.className='v61-controls';
gad61Controls.setAttribute('aria-label','Flight director reading controls');
gad61Controls.innerHTML=`<button id="v61PrevBrief" type="button" title="Read the previous explanation">← Previous topic</button><button id="v61NextBrief" type="button" title="Read the next explanation">Next topic →</button><button id="v61Sync" type="button" title="Follow the current flight chapter">↻ Follow flight</button><label><input id="v61PauseAtChapter" type="checkbox" checked> Pause playback at chapters</label><button id="v61More" type="button" aria-expanded="false">More detail</button>`;
gad61Text.append(gad61Controls);
const gad61Status=document.createElement('div');gad61Status.className='v61-indicator';gad61Status.id='v61Status';gad61Status.setAttribute('aria-live','off');gad61Text.append(gad61Status);
const gad61Details=document.createElement('div');gad61Details.className='v61-details';gad61Details.id='v61Details';gad61Details.hidden=true;gad61Text.append(gad61Details);
gad61Controls.insertBefore(el('v5NextMoment'),el('v61More'));
el('v5NextMoment').textContent='Skip to milestone ↗';

const gad61Deck=[
{phase:'prelaunch',title:'Stage 0: Before launch',summary:'The spacecraft circles its departure planet before ignition. This opening orbit was added for context; the recorded flight begins when the GAD fires.',detail:'The Stage 0 circle is a derived two-body orbit, not another recorded RC42 mission stage. The map shows the vehicle and moving bodies so you can see the launch geometry.',source:'Derived pre-launch visual · recorded mission starts at ignition'},
{phase:'departure',title:'Departure: Why the GAD accelerates',summary:'The aperture couples to part or all of the departure planet. The GAD pushes away from the intercepted mass centroid to establish the outbound flight vector.',detail:'θ rotates the cone axis, φ changes its half-angle and therefore which mass is intercepted, and K sets the command strength. Watch the cone, coupled mass fraction and GAD arrow together.',source:'RC42 recorded θ / φ / K · mass centroid recomputed'},
{phase:'departure',title:'Departure: Gravity still acts',summary:'The GAD is active, but natural gravity still pulls on the spacecraft. Compare the green GAD arrow with the net-gravity arrow and the individual gravity contributions.',detail:'Net gravity is the vector sum of all ten modeled bodies; arrow lengths are individually normalized for readability. Use the numerical m/s² values to compare strengths.',source:'Recorded command + recomputed natural gravity'},
{phase:'cruise',title:'Cruise: A mostly unpowered transit',summary:'The GAD is off for this coast. The spacecraft continues through the solar system, with gravity from the Sun, planets, and Moon shaping its path.',detail:'The net-gravity vector is not necessarily directed at the destination. The Gravity panel identifies the strongest contributor at the selected moment and displays the individual source, destination, and Sun forces.',source:'Recorded trajectory · recomputed full N-body gravity'},
{phase:'cruise',title:'Cruise: Why two paths are shown',summary:'The solid line is the recorded flown trajectory. The dashed line is a reconstructed gravity-only continuation from departure, useful as a comparison.',detail:'This dashed baseline is not the controller’s saved full planned flight. Archived navigation forecast gates, when available, are shown separately as future encounter markers.',source:'Solid: recorded / interpolated · dashed: reconstructed baseline'},
{phase:'capture',title:'Arrival: Braking the inward motion',summary:'On approach, the spacecraft can have a large inward radial velocity. The GAD directs repulsion to reduce that motion and prevent impact.',detail:'Read negative radial velocity as “moving inward.” During capture, watch the radial speed move toward zero while the aperture geometry and K commands change. The instantaneous two-body periapsis is a diagnostic, not a collision certificate.',source:'Recorded radial velocity and commands · computed orbital diagnostics'},
{phase:'capture',title:'Arrival: Building orbital velocity',summary:'The controller also needs the right sideways (tangential) velocity. By adjusting the aperture direction, it changes angular momentum while braking.',detail:'Orbital energy, eccentricity, periapsis and apoapsis show the approximate instantaneous target-centered orbit. Capture is certified by independent replay and the GAD-off audit, not by this panel alone.',source:'Recorded tangential velocity · two-body estimated elements'},
{phase:'verified',title:'GAD off: Stable orbit verified',summary:'The recorded insertion is complete, the GAD is off, and the archive includes independent verification that the vehicle remained in a safe destination orbit.',detail:'The visible post-insertion orbit is a derived animation over the audit observation interval, not additional controller-generated telemetry. The altitude limits in the certification panel come from the archived evidence.',source:'Archived independent GAD-off verification · derived orbit display'}
];
const gad61FirstFor=phase=>{const idx=gad61Deck.findIndex(c=>c.phase===phase);return idx<0?0:idx;};
let gad61Index=0,gad61Follow=true,gad61LastLivePhase=null,gad61LastMission='',gad61More=false,gad61Updating=false;
function gad61ShowCard(){
 const item=gad61Deck[gad61Index]||gad61Deck[0];
 el('v5DirectorTitle').textContent=item.title;
 el('v5DirectorBody').textContent=item.summary;
 el('v5DirectorSource').textContent=item.source;
 gad61Details.textContent=item.detail;
 gad61Details.hidden=!gad61More;
 el('v61More').textContent=gad61More?'Less detail':'More detail';
 el('v61More').setAttribute('aria-expanded',String(gad61More));
 el('v61PrevBrief').disabled=gad61Index===0;
 el('v61NextBrief').disabled=gad61Index===gad61Deck.length-1;
 gad61UpdateIndicator();
}
function gad61UpdateIndicator(){
 if(!M)return;
 const here=gad61LastLivePhase||chapterFromTime(progressToTime(progress)).id;
 const selected=gad61Deck[gad61Index];
 const same=here===selected.phase;
 gad61Status.textContent='';
 const p=document.createElement('span');p.textContent=`Reading ${gad61Index+1} of ${gad61Deck.length} · ${selected.phase.toUpperCase()}`;gad61Status.appendChild(p);
 const dot=document.createElement('span');dot.className='v61-dot';gad61Status.appendChild(dot);
 const q=document.createElement('span');q.textContent=`Live chapter: ${here.toUpperCase()}${!gad61Follow?' · held for reading':same?' · following replay':' · chapter update pending'}`;gad61Status.appendChild(q);
 if(!gad61Follow){el('v61Sync').textContent='↻ Resume following';el('v61Sync').title='Resume following the current flight chapter';}
 else{el('v61Sync').textContent='↻ Follow flight';el('v61Sync').title='Following the current flight chapter';}
}
function gad61SelectManual(index){gad61Index=clamp(index,0,gad61Deck.length-1);gad61Follow=false;gad61ShowCard();}
el('v61PrevBrief').addEventListener('click',()=>gad61SelectManual(gad61Index-1));
el('v61NextBrief').addEventListener('click',()=>gad61SelectManual(gad61Index+1));
el('v61Sync').addEventListener('click',()=>{gad61Follow=true;gad61Index=gad61FirstFor(chapterFromTime(progressToTime(progress)).id);gad61ShowCard();});
el('v61More').addEventListener('click',()=>{gad61More=!gad61More;gad61ShowCard();});
// Previously V5/V6 rewrote the whole explanation whenever the command or
// gravity readings changed. Keep dynamic numerical instruments updating while
// restoring a stable, readable narration. Only change the briefing by phase.
const gad61OldUpdateDetails=v5UpdateDetails;
v5UpdateDetails=function(t,s,cmd,isDerived,force=false){
 gad61OldUpdateDetails(t,s,cmd,isDerived,force);
 if(!M||gad61Updating)return;
 gad61Updating=true;
 try{
   const live=chapterFromTime(t).id;
   if(gad61LastMission!==M.id){
      gad61LastMission=M.id;gad61LastLivePhase=live;
      gad61Index=gad61FirstFor(live);gad61Follow=true;
      gad61ShowCard();
   }else if(live!==gad61LastLivePhase){
      gad61LastLivePhase=live;
      // Only real playback crossing a chapter boundary triggers auto-pause;
      // direct scrub, manual jumps and mission switching do not.
      if(playing&&el('v61PauseAtChapter').checked)setPlaying(false);
      if(gad61Follow){gad61Index=gad61FirstFor(live);gad61ShowCard();}
      else gad61UpdateIndicator();
   }
   // Any underlying V6 refresh cannot replace reader-paced narration.
   const card=gad61Deck[gad61Index];
   if(el('v5DirectorTitle').textContent!==card.title)el('v5DirectorTitle').textContent=card.title;
   if(el('v5DirectorBody').textContent!==card.summary)el('v5DirectorBody').textContent=card.summary;
   if(el('v5DirectorSource').textContent!==card.source)el('v5DirectorSource').textContent=card.source;
 }finally{gad61Updating=false;}
};
// Preserve the current route on initial boot. UpdateHero precedes loadMission;
// only reset narration when a newly loaded mission actually renders.
if(M){gad61LastMission=M.id;gad61LastLivePhase=chapterFromTime(progressToTime(progress)).id;gad61Index=gad61FirstFor(gad61LastLivePhase);gad61ShowCard();}