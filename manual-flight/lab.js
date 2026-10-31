'use strict';
(()=>{const $=id=>document.getElementById(id);
let history=[],draft=null,flight=null,at=0,busy=false;let yaw=.7,pitch=.4,zoom=1,drag=null,timer;
const C=$('viewport'),g=C.getContext('2d');
const note=t=>{$('status').textContent=t};const val=id=>Number($(id).value);
function command(kind){const duration_s=val(kind==='COAST'?'coast':'duration');if(!(duration_s>0&&duration_s<=60))throw Error('Invalid duration');
 if(kind==='COAST')return{kind,duration_s};
 const K=val('K'),half_angle_deg=val('half'),offset_deg=val('offset'),steering_xyz=[val('sx'),val('sy'),val('sz')];
 if(!(K>0&&K<=100&&half_angle_deg>=0&&half_angle_deg<=180&&Math.abs(offset_deg)<179&&Math.hypot(...steering_xyz)>0))throw Error('Invalid GAD control or K outside test-authorized range');
 return{kind,duration_s,K,half_angle_deg,offset_deg,steering_xyz};}
const url=()=>$('endpoint').value.trim().replace(/\/+$/,'');
async function check(){try{const r=await fetch(url()+'/api/status');const x=await r.json();if(!r.ok||!x.online||!x.data_ready||!x.source_ready)throw Error('native source or data missing');
 $('connection').textContent='● Native physics online · test only';$('connection').style.color='#70e0aa';note('Native evaluator ready; physical previews use WS-03/WS-02.');}
 catch(e){$('connection').textContent='● Offline: start local Python backend';note('Physical previews unavailable until local native backend is started: '+e.message)}}
async function evaluate(kind){if(busy)return;try{draft=command(kind);if(history.length>=12)throw Error('12-leg sandbox limit');
 busy=true;$('preview').disabled=$('coastPreview').disabled=true;$('accept').disabled=true;note('Evaluating 31-body native candidate; long burns may take minutes…');
 const r=await fetch(url()+'/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:'moon435',commands:[...history,draft],samples_per_leg:val('samples')})});const x=await r.json();
 if(!r.ok)throw Error(x.error+' '+(x.details||''));if(x.production_issuer!==false||x.qualification!=='UNVERIFIED'||!x.authoritative_unchanged||!Array.isArray(x.samples))throw Error('Invalid native test response');
 flight=x;at=x.samples.length-1;$('scrub').disabled=$('play').disabled=false;$('scrub').max=at;$('scrub').value=at;$('accept').disabled=false;draw();
 note('Preview complete · '+x.samples.length+' physical samples · guard '+x.guard_status+' · UNVERIFIED engineering screening.');
 }catch(e){draft=null;note('Preview unavailable: '+e.message)}finally{busy=false;$('preview').disabled=$('coastPreview').disabled=false}}
function showHistory(){$('history').replaceChildren();(history.length?history:[{kind:'ORIGINAL'}]).forEach(c=>{const li=document.createElement('li');li.textContent=c.kind==='ORIGINAL'?'Pinned original Moon state':c.kind==='COAST'?'Coast '+c.duration_s+'s':'GAD K'+c.K+' / '+c.duration_s+'s / offset '+c.offset_deg+'°';$('history').append(li)})}
$('preview').onclick=()=>evaluate('GAD');$('coastPreview').onclick=()=>evaluate('COAST');$('recheck').onclick=check;
$('accept').onclick=()=>{if(!draft||!flight)return;history.push(draft);draft=null;$('accept').disabled=true;showHistory();note('Accepted engineering command. Next preview replays complete exact command prefix from original precise state.')};
$('undo').onclick=()=>{history.pop();flight=null;draft=null;$('accept').disabled=true;showHistory();draw();note('Last accepted command undone.')};
$('reset').onclick=()=>{history=[];flight=null;draft=null;$('accept').disabled=true;showHistory();draw();note('Reset to pinned original Moon state.')};
$('export').onclick=()=>{const a=document.createElement('a'),b=new Blob([JSON.stringify({schema:'GAD-MANUAL-LAB-EXPORT-1',qualification:'UNVERIFIED',command_history:history,last_preview:flight},null,2)],{type:'application/json'});a.href=URL.createObjectURL(b);a.download='gad-manual-flight.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text()),f=x.last_preview;if(x.schema!=='GAD-MANUAL-LAB-EXPORT-1'||!f||f.qualification!=='UNVERIFIED'||!Array.isArray(f.samples))throw Error('bad evidence');
 flight=f;history=[];draft=null;showHistory();at=f.samples.length-1;$('scrub').disabled=$('play').disabled=false;$('scrub').max=at;$('scrub').value=at;draw();note('Imported view-only result; no authority to restart physics from a displayed state.');}catch(err){note('Import failed: '+err.message)}};
$('scrub').oninput=()=>{at=Number($('scrub').value);draw()};
$('play').onclick=()=>{if(timer){clearInterval(timer);timer=null;$('play').textContent='▶'}else{timer=setInterval(()=>{if(!flight)return;at=(at+1)%flight.samples.length;$('scrub').value=at;draw()},260);$('play').textContent='❚❚'}};
C.onpointerdown=e=>{drag=[e.clientX,e.clientY,yaw,pitch];C.setPointerCapture(e.pointerId)};
C.onpointermove=e=>{if(!drag)return;yaw=drag[2]+(e.clientX-drag[0])*.006;pitch=Math.max(-1.4,Math.min(1.4,drag[3]-(e.clientY-drag[1])*.006));draw()};
C.onpointerup=C.onpointercancel=()=>drag=null;C.onwheel=e=>{e.preventDefault();zoom=Math.max(.3,Math.min(6,zoom*Math.exp(-e.deltaY*.001)));draw()};
function draw(){const w=C.clientWidth||900,h=C.clientHeight||580,d=Math.min(devicePixelRatio||1,2);C.width=Math.round(w*d);C.height=Math.round(h*d);g.setTransform(d,0,0,d,0,0);
 const R=flight?.body_radius_m||1737400,scale=Math.min(w,h)*.27/R*zoom;
 function P(p){const [x,y,z]=p,a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return[w/2+a*scale,h/2-(b*Math.cos(pitch)+z*Math.sin(pitch))*scale]}
 const center=P([0,0,0]);const gradient=g.createRadialGradient(center[0]-R*scale*.25,center[1]-R*scale*.3,1,...center,R*scale*1.25);gradient.addColorStop(0,'#90abba');gradient.addColorStop(.5,'#506b82');gradient.addColorStop(1,'#122c3e');g.fillStyle=gradient;g.beginPath();g.arc(...center,R*scale,0,Math.PI*2);g.fill();
 function trace(points,color,dashed=false){if(!points.length)return;g.beginPath();g.strokeStyle=color;g.lineWidth=2;g.setLineDash(dashed?[5,5]:[]);points.forEach((p,i)=>{const q=P(p);i?g.lineTo(...q):g.moveTo(...q)});g.stroke();g.setLineDash([])}
 function circle(n,color){if(!n)return;const b=Math.abs(n[2])<.9?[0,0,1]:[1,0,0],cross=[n[1]*b[2]-n[2]*b[1],n[2]*b[0]-n[0]*b[2],n[0]*b[1]-n[1]*b[0]],t=Math.hypot(...cross),u=cross.map(x=>x/t),v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]],r=R+435000;
 const points=[];for(let i=0;i<=120;i++){let q=i*Math.PI*2/120;points.push(u.map((x,j)=>r*(x*Math.cos(q)+v[j]*Math.sin(q))))}trace(points,color,true)}
 g.fillStyle='#cae1f5';g.font='12px system-ui';g.fillText('MOON · 31-body native engineering sandbox',18,25);
 if(!flight){g.fillText('Start local native backend and press Preview.',18,h-22);return}
 circle(flight.initial_h_normal_xyz,'#57cb9d');circle(flight.target_h_normal_xyz,'#f6b66c');
 trace(flight.samples.slice(0,at+1).map(s=>s.moon_relative_xyz_m),'#74e9ef');
 const s=flight.samples[at],q=P(s.moon_relative_xyz_m);g.fillStyle='#fff';g.beginPath();g.arc(...q,5,0,Math.PI*2);g.fill();
 const m=s.metrics;const format=(id,v,unit='',digits=3)=>$(id).textContent=v==null||!Number.isFinite(v)?'—':v.toLocaleString(undefined,{maximumFractionDigits:digits})+unit;
 format('plane',m.plane_error_deg,'°',5);format('change',m.plane_reduction_deg,'°',5);format('alt',m.altitude_m/1000,' km');format('speed',m.speed_mps,' m/s');format('apo',m.apoapsis_altitude_m==null?null:m.apoapsis_altitude_m/1000,' km');format('peri',m.periapsis_altitude_m/1000,' km');format('ecc',m.eccentricity,'',6);format('radial',m.radial_speed_mps,' m/s');$('time').textContent='T + '+s.elapsed_s.toFixed(3)+'s'}
window.onresize=draw;showHistory();draw();check();
})();