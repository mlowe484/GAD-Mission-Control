/* GAD Mission Control V10.3 — presentation and playback stability.
   Insert INSIDE the V9 tab/pilot closure after V10.2. This patch does not
   change the hypothetical GAD equations, replay telemetry, or P6F ephemerides.
   The V3 replay keyboard handler is separately scoped to the 2D tab by the
   deterministic startup builder, before loading this module. */
{
  const release = 'V10.3';
  const releaseBanner = document.getElementById('gadProductionRelease');
  if(releaseBanner){
    const strong=releaseBanner.querySelector('strong');
    if(strong)strong.textContent=release+' · CURRENT RELEASE';
  }
  document.title='GAD Mission Control · '+release;
  const releaseMeta=Object.freeze({release:'10.3',source:'frozen 2D mission replays + P6F JPL reference',modes:['learn','2d','3d','pilot'],physicalModelChanged:false});
  Object.defineProperty(window,'GAD_MISSION_CONTROL_RELEASE',{value:releaseMeta,configurable:false,writable:false});

  // Replay transport: short steps and reset independent of controller revision.
  const twoD=panels['2d'];
  const playback=twoD?.querySelector('.playback');
  if(!twoD||!playback||!panels['3d']||!panels.pilot||!panels.learn){
    throw new Error('V10.3 missing expected tab or playback controls');
  }
  const shortcuts=document.createElement('div');
  shortcuts.className='v103-playback-shortcuts';
  shortcuts.setAttribute('role','group');
  shortcuts.setAttribute('aria-label','Replay navigation');
  shortcuts.innerHTML='<span class="v103-caption">Replay</span>'+
      '<button type="button" data-jump="back" aria-label="Jump backward five percent of replay">−5%</button>'+
      '<button type="button" data-jump="start" aria-label="Restart replay">↺ Start</button>'+
      '<button type="button" data-jump="forward" aria-label="Jump forward five percent of replay">+5%</button>'+
      '<small>Space: play/pause · ← →: fine scrub · Home/End: timeline boundaries</small>';
  shortcuts.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    setPlaying(false);
    const op=btn.dataset.jump;
    setProgress(op==='start'?0:Math.max(0,Math.min(1,progress+(op==='back'?-0.05:0.05))));
  }));
  playback.after(shortcuts);
  const style=document.createElement('style');
  style.textContent=`.v103-playback-shortcuts{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:8px 12px;border-top:1px solid #273a50;color:#afc2d8;font-size:11px}.v103-playback-shortcuts button{color:#e6faff;border:1px solid #3b647d;border-radius:7px;padding:6px 11px;background:#12324a}.v103-playback-shortcuts button:hover,.v103-playback-shortcuts button:focus-visible{background:#25516a}.v103-playback-shortcuts small{font-size:10px;color:#acc2d9}.v103-caption{font-weight:700;color:#b2e7f2}.v103-stability-note{font-size:10px;color:#9fbacf;padding:4px 0}`;
  document.head.appendChild(style);
  const stabilityNote=document.createElement('div');
  stabilityNote.className='v103-stability-note';
  stabilityNote.textContent='Motion pauses automatically when the browser tab is hidden. Historical replays remain unchanged.';
  shortcuts.after(stabilityNote);

  function pauseAllForHiddenTab(){
    if(!document.hidden)return;
    if(typeof setPlaying==='function')setPlaying(false);
    if(pilotActive){
      pilotActive=false;
      const pilotButton=$$v9('v9Run');
      if(pilotButton)pilotButton.textContent='▶ Resume flight';
    }
    pilotLast=0;
    if(threeRun){
      threeRun=false;
      const spinButton=$$v9('v9Spin');
      if(spinButton)spinButton.textContent='Play ephemeris';
    }
    threeLast=0;
  }
  document.addEventListener('visibilitychange',pauseAllForHiddenTab);
  window.addEventListener('pagehide',()=>{
    if(typeof setPlaying==='function')setPlaying(false);
    if(pilotActive)pilotActive=false;
    threeRun=false;
    pilotLast=0;
    threeLast=0;
  });
}