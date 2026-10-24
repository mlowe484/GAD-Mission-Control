(async()=>{
try{
 const [response, patchResponse, centroidResponse, insightsResponse, navDataResponse, v6Response, v61Response, v63Response, catalogResponse, v7Response, v8Response, v9Response, v10Response, v101Response, v102Response, v103Response, v104Response, v11Response, v112Response] = await Promise.all([fetch('./assets/replay-core.html?release=production-v10'),fetch('./v4-physics.patch.js?release=v4-1'),fetch('./v4-2-centroid.patch.js?release=v4-2'),fetch('./v5-insights.patch.js?release=v5'),fetch('./v6-navdata.js?release=v6'),fetch('./v6-visuals.patch.js?release=v6'),fetch('./v6-1-director.patch.js?release=v6-1'),fetch('./v6-3-overview.patch.js?release=v6-3'),fetch('./replays/catalog.json?release=v7-1'),fetch('./v7-revisions.patch.js?release=v7'),fetch('./v8-1-learning.patch.js?release=v8-1'),fetch('./v9-tabs-and-pilot.patch.js?release=v9'),fetch('./v10-ephemeris-and-lessons.patch.js?release=v10-4-1-smooth-clock'),fetch('./v10-1-3d-camera-and-reset.patch.js?release=v10-4-1-smooth-clock'),fetch('./v10-2-native-moons.patch.js?release=2026-10-23-native'),fetch('./v10-3-stability.patch.js?release=v10-3'),fetch('./v10-4-subsystem-explorer.patch.js?release=v10-4-1-smooth-clock'),fetch('./v11-pilot-training.patch.js?release=v11'),fetch('./v11-2-cinematic-recorded-3d.patch.js?release=11-2')]);
 const required=[response,patchResponse,centroidResponse,insightsResponse,navDataResponse,v6Response,v61Response,v63Response,catalogResponse,v7Response,v8Response,v9Response,v10Response,v101Response,v102Response,v103Response,v104Response,v11Response,v112Response];
 const names=['replay core','aperture physics','mass-centroid display','mission diagnostics','navigation data','force vectors','flight director','heliocentric overview','replay catalog','revision selector','learning lab','tabs and pilot','JPL 3D viewer','camera and reset','native moon interpolation','V10.3 stability','V10.4 subsystem explorer','V11 pilot flight school','cinematic recorded 3D maneuver gallery'];
 const missing=required.flatMap((r,i)=>r.ok?[]:[names[i]+': HTTP '+r.status]);
 if(missing.length)throw new Error('Unable to load required website assets: '+missing.join('; '));
 let html=await response.text();
 const patch=await patchResponse.text();
 const centroidPatch=await centroidResponse.text();
 const insightsPatch=await insightsResponse.text();
 const navDataPatch=await navDataResponse.text();
 const v6Patch=await v6Response.text();
 const v61Patch=await v61Response.text();
 const v63Patch=await v63Response.text();
 const v7Catalog=await catalogResponse.json();
 const v7Patch=await v7Response.text();
 const v8Patch=await v8Response.text();
 const v9Patch=await v9Response.text();
 const v10Patch=await v10Response.text();
 const v101Patch=await v101Response.text();
 const v102Patch=await v102Response.text();
 const v103Patch=await v103Response.text();
 const v104Patch=await v104Response.text();
 const v11Patch=await v11Response.text();
 const v112Patch=await v112Response.text();
 // The V9 tab/pilot code runs inside a private closure. V10 extends its
 // internal controls, so it MUST execute before that V9 closure closes.
 // Keep V3-V8 controllers/replay modules and their data entirely unchanged.
 if(!/\}\)\(\);\s*$/.test(v9Patch))throw new Error('Unexpected V9 module boundary; V10 cannot initialize safely.');
 let v101Patched=v101Patch;
 const renderingHooks=[
  ["for(const name of names){const host=parentOf(name);if(!host||name===host)continue;",
   "for(const name of (window.__GAD_V104_SETTINGS?.trailsEnabled===false?[]:names)){const host=parentOf(name);if(!host||name===host)continue;"],
  ["const span=Math.min(T*1.05, v10Primary.t1_tdb_s-v10Primary.t0_tdb_s);",
   "const span=Math.min(T*(window.__GAD_V104_SETTINGS?.trailOrbits||1.05), v10Primary.t1_tdb_s-v10Primary.t0_tdb_s);"],
  ["const focus=v10Anchor,t=v10ClockSec,center=v10Vector(focus,t)||[0,0,0];",
   "const focus=v10Anchor,t=v10ClockSec,center=(window.__GAD_V104_SETTINGS?.follow===false&&window.__GAD_V104_SETTINGS?.frozenCenter)||v10Vector(focus,t)||[0,0,0];"]
 ];
 for(const [oldText,newText] of renderingHooks){
  if(v101Patched.split(oldText).length!==2)throw new Error('V10.4 incompatible 3D renderer hook: '+oldText.slice(0,60));
  v101Patched=v101Patched.replace(oldText,newText);
 }
 const v9V10Patch=v9Patch.replace(/\}\)\(\);\s*$/,v10Patch+'\n'+v101Patched+'\n'+v102Patch+'\n'+v103Patch+'\n'+v104Patch+'\n'+v11Patch+'\n'+v112Patch+'\n})();');
 // Keep the archived V3 page and V6/V6.1 patches unchanged: only repair
 // the Auto camera's transition zoom and craft-safe framing in the render function.
 const oldCamera="let desired=targetCamera(s,t); if(!frameCam) frameCam={...desired}; else { frameCam.cx=lerp(frameCam.cx,desired.cx,.13); frameCam.cy=lerp(frameCam.cy,desired.cy,.13); frameCam.scale=lerp(frameCam.scale,desired.scale,.16); frameCam.using=desired.using; } const cam=frameCam;";
 const safeCamera="let desired=targetCamera(s,t);\n  if(!frameCam) frameCam={...desired};\n  else if(view==='auto') {\n    // V6.2 camera safety: use logarithmic zoom so transitions between local\n    // and solar-system scales finish promptly, even across 5+ orders of magnitude.\n    frameCam.scale=Math.exp(lerp(Math.log(Math.max(frameCam.scale,1e-30)),Math.log(Math.max(desired.scale,1e-30)),.26));\n    frameCam.cx=lerp(frameCam.cx,desired.cx,.20);\n    frameCam.cy=lerp(frameCam.cy,desired.cy,.20);\n    frameCam.using=desired.using;\n    // The craft must remain within a central safe viewport during the\n    // transition. Recenter in world units *after* applying the new zoom.\n    // Manual camera modes remain fully pannable and are not constrained.\n    const location=interpScreen(frameCam,s[1],s[2]);\n    const side=Math.min(W*.32,Math.max(W*.25,44*devicePixelRatio));\n    const topBottom=Math.min(H*.32,Math.max(H*.27,44*devicePixelRatio));\n    const safeX=clamp(location[0],side,W-side);\n    const safeY=clamp(location[1],topBottom,H-topBottom);\n    frameCam.cx+=(location[0]-safeX)/frameCam.scale;\n    frameCam.cy+=(location[1]-safeY)/frameCam.scale;\n  }\n  else {\n    frameCam.cx=lerp(frameCam.cx,desired.cx,.13);\n    frameCam.cy=lerp(frameCam.cy,desired.cy,.13);\n    frameCam.scale=lerp(frameCam.scale,desired.scale,.16);\n    frameCam.using=desired.using;\n  }\n  const cam=frameCam;";
 if(!html.includes(oldCamera)) throw new Error('Unexpected camera source: leaving previous version unchanged.');
 html=html.replace(oldCamera,safeCamera);
 // The legacy V3 keyboard handler should only manipulate the 2D timeline
 // when the 2D tab is active. Otherwise it steals Pilot arrow keys.
 const legacyKey="if(e.target.tagName==='INPUT' || e.target.tagName==='SELECT') return; if(e.code==='Space')";
 if(!html.includes(legacyKey))throw new Error('Replay keyboard patch point missing');
 html=html.replace(legacyKey,"if(!document.body.classList.contains('v9-active-2d'))return; "+legacyKey);


 const v63OverviewMarkup=`<section class="v63-overview" aria-label="Synchronized heliocentric mission overview"><div class="v63-overview-top"><span class="v63-eyebrow">HELIOCENTRIC OVERVIEW</span><span id="v63HelioContext">SYNCED TO CURRENT REPLAY</span></div><canvas id="v63HelioCanvas" role="img" aria-label="Sun, source and destination bodies, spacecraft and full transfer path in heliocentric coordinates; orange outline indicates the main camera field of view"></canvas><div class="v63-overview-legend"><span><i class="v63-mark" style="background:#89eee7"></i> Flown</span><span><i class="v63-mark" style="background:#f9b971"></i> Camera field</span><span>Dashed orange = reconstructed GAD-off coast when enabled</span></div></section>`;
 const v63Css=`.v63-overview{background:#07131f;border-top:1px solid #253c54;padding:9px 12px 8px}.v63-overview-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:4px}.v63-eyebrow{font-size:10px;font-weight:850;letter-spacing:.12em;color:#d7e8f6}#v63HelioContext{font-size:10px;color:#7d9eb9;font-family:ui-monospace,Consolas,monospace}.v63-overview canvas{display:block;width:100%;height:195px;background:#07131e;border:1px solid #1c3348;border-radius:9px}.v63-overview-legend{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;color:#8da4ba;font-size:9px;line-height:1.4;margin-top:6px}.v63-overview-legend span{display:inline-flex;align-items:center;gap:4px}.v63-mark{display:inline-block;width:14px;height:3px;border-radius:2px}@media(max-width:760px){.v63-overview{padding:7px 9px}.v63-overview canvas{height:154px}.v63-overview-legend{gap:5px 10px}}`;
 if(!html.includes('<div class="playback">'))throw new Error('Overview insertion point unavailable');
 html=html.replace('<div class="playback">',v63OverviewMarkup+'\n      <div class="playback">');
 const oldMarkup="</div></div></div>\n      <div class=\"phase-box\">";
 const newMarkup="</div></div><div class=\"cone-settings\"><label class=\"cone-checkbox\"><input id=\"coneToggle\" type=\"checkbox\" checked> Show recorded coupling cone</label><div class=\"cone-range\"><span>Axis θ</span><b id=\"coneTheta\">—</b><span>Half-angle φ</span><b id=\"conePhi\">—</b></div><div class=\"cone-disclaimer\">Actual RC42 command geometry: θ points the cone in the inertial XY plane; φ sets its half-angle. Shaded body material is a 2D schematic of the intercepted mass, not an independently calculated 3D centroid.</div></div></div>\n      <div class=\"phase-box\">";
 const oldAim="This panel turns the θ/φ aperture command into an intuitive body-centered aim point. It is a visualization of coupling direction, not a literal optical camera view.";
 const newAim="Yellow = centerline/body intersection when one exists. Green = body center when the whole body is intercepted. The actual acceleration is away from the mass centroid of the intercepted body volume, which is not saved in the flight command log.";
 const oldAbout="Aperture aim panel:</b> the θ/φ values are converted into an intuitive body-centered aim-point indicator.";
 const newAbout="Aperture visualization:</b> the recorded θ sets the cone axis in the inertial XY plane; φ is the physical cone half-angle. The shading is a 2D projection of intercepted body material, not a reconstructed numerical mass centroid.";
const v71ContrastCss='.select-wrap select{background:#10283e!important;color:#f7fbff!important;color-scheme:dark}.select-wrap select option,.select-wrap select optgroup{background-color:#10283e!important;color:#f7fbff!important}.select-wrap select option:checked{background-color:#285577!important;color:#ffffff!important}';
 const css=".masscard{padding:13px;border:1px solid #523653;border-radius:12px;background:#191324}.massnumbers{display:grid;grid-template-columns:1fr 1fr;gap:12px}.massnumbers strong{display:block;font-size:21px;font-weight:800;color:#f2e3ff}.massnumbers small{display:block;font-size:9px;letter-spacing:.05em;color:#a998c2;margin-top:3px}.mass-note{font-size:10px;color:#a99ab8;line-height:1.5;margin-top:10px}.mass-legend{display:flex;gap:9px;flex-wrap:wrap;margin-top:9px;color:#b7b0c7;font-size:9px}.mass-legend span{display:inline-flex;align-items:center;gap:5px}.mass-dot{width:7px;height:7px;border-radius:50%;display:inline-block} .cone-settings{border-top:1px solid #233b52;margin-top:12px;padding-top:10px;display:grid;gap:10px}.cone-checkbox{display:flex;gap:8px;align-items:center;font-size:11px;font-weight:700;color:#aee9e8;cursor:pointer}.cone-checkbox input{accent-color:#82e7e2}.cone-range{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:8px;align-items:center;font-size:10px;color:#aec3d7}.cone-range b{color:#d7f4fb;font-size:12px}.cone-disclaimer{font-size:10px;color:#839eb6;line-height:1.5}";
 const close='</scr'+'ipt>';
 const ending='})();\n'+close;
 if(!html.includes(oldMarkup)||!html.includes(oldAim)||!html.includes(ending)) throw new Error('Unexpected viewer version; original file preserved.');
 html=html.replace('</style>',css+v63Css+v71ContrastCss+'\n</style>')
   .replace('Aperture aim visualization</div>','Recorded cone / intercepted body</div>')
   .replace('Projected aim point</span>','Axis θ</span>')
   .replace('Hemisphere</span>','Half-angle φ</span>')
   .replace('Command mode</span>','Body coverage</span>')
   .replace(oldAim,newAim)
   .replace(oldMarkup,newMarkup)
   .replace(oldAbout,newAbout)
   .replace(ending,patch+'\n'+centroidPatch+'\n'+insightsPatch+'\n'+navDataPatch+'\n'+v6Patch+'\n'+v61Patch+'\n'+v63Patch+'\nconst GAD_V7_CATALOG='+JSON.stringify(v7Catalog)+';\n'+v7Patch+'\n'+v8Patch+'\n'+v9V10Patch+'\n'+ending);
 document.open();document.write(html);document.close();
}catch(err){
 console.error('V10.3 production startup failed:',err);
 const boot=document.getElementById('boot');
 if(boot){boot.textContent='';const title=document.createElement('h1');title.textContent='Mission Control could not load';const details=document.createElement('p');details.textContent=err.message||'A required resource could not be loaded.';const advice=document.createElement('p');advice.textContent='Refresh the original Mission Control URL. If this continues, check GitHub Pages deployment and assets.';boot.append(title,details,advice);}
}
})();