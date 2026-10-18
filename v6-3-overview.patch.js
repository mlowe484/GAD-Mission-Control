/* GAD Mission Control V6.3 — synchronous heliocentric context panel.
   UI-only. Uses the exact replay state, source/destination positions, trajectory,
   and active 2D camera. No flight states or controller commands are modified. */
const v63Canvas=el('v63HelioCanvas');
const v63Ctx=v63Canvas.getContext('2d');
let v63LastPaint=0, v63LastMission='', v63Bounds=null;
const v63Safe=(n)=>Number.isFinite(n)?n:0;
function v63ComputeBounds(){
  const points=[[0,0]];
  for(const row of R){ points.push([row[1],row[2]],[row[5],row[6]],[row[7],row[8]]); }
  const route=GAD_V6_NAV_DATA.routes[M.id];
  for(const p of route.ballistic_path_km||[]){if(p.length>=3)points.push([p[1],p[2]]);}
  let minx=Infinity,maxx=-Infinity,miny=Infinity,maxy=-Infinity;
  for(const p of points){if(!Number.isFinite(p[0])||!Number.isFinite(p[1]))continue;
    minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);}
  let span=Math.max(maxx-minx,maxy-miny,1e5);
  const border=span*.105;
  return {minx:minx-border,maxx:maxx+border,miny:miny-border,maxy:maxy+border};
}
function v63DrawOverview(t,s){
 if(!M||!v63Canvas)return;
 if(v63LastMission!==M.id||!v63Bounds){v63Bounds=v63ComputeBounds();v63LastMission=M.id;}
 const dpr=Math.min(window.devicePixelRatio||1,2);
 const bounds=v63Canvas.getBoundingClientRect();
 const width=bounds.width,height=bounds.height;
 if(width<60||height<60)return;
 const targetW=Math.round(width*dpr),targetH=Math.round(height*dpr);
 if(v63Canvas.width!==targetW||v63Canvas.height!==targetH){v63Canvas.width=targetW;v63Canvas.height=targetH;}
 const c=v63Ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);
 c.fillStyle='#07131e';c.fillRect(0,0,width,height);
 const padL=24,padR=24,padT=20,padB=18;
 const dx=v63Bounds.maxx-v63Bounds.minx,dy=v63Bounds.maxy-v63Bounds.miny;
 const scale=Math.min((width-padL-padR)/dx,(height-padT-padB)/dy);
 const centerX=(v63Bounds.minx+v63Bounds.maxx)/2,centerY=(v63Bounds.miny+v63Bounds.maxy)/2;
 const screen=(x,y)=>[(x-centerX)*scale+width/2,(y-centerY)*scale+height/2];
 const route=GAD_V6_NAV_DATA.routes[M.id];
 c.save();c.beginPath();c.rect(1,1,width-2,height-2);c.clip();
 // A restrained heliocentric reference grid in kilometers.
 const sunPos=screen(0,0);
 c.strokeStyle='rgba(112,150,185,.13)';c.lineWidth=1;c.beginPath();c.moveTo(sunPos[0],0);c.lineTo(sunPos[0],height);c.moveTo(0,sunPos[1]);c.lineTo(width,sunPos[1]);c.stroke();
 const drawLine=(rows,idxX,idxY,color,lineWidth,dashed=false,visibleUntil=null)=>{
   if(!rows?.length)return;c.beginPath();let first=true;const step=Math.max(1,Math.floor(rows.length/1400));
   for(let i=0;i<rows.length;i+=step){const r=rows[i];if(visibleUntil!==null && r[0]>visibleUntil)break;
     const xy=screen(r[idxX],r[idxY]);if(first){c.moveTo(...xy);first=false;}else c.lineTo(...xy);}
   if(first)return;c.strokeStyle=color;c.lineWidth=lineWidth;c.setLineDash(dashed?[5,5]:[]);c.stroke();c.setLineDash([]);
 };
 drawLine(R,5,6,'rgba(233,195,141,.44)',1.4);
 drawLine(R,7,8,'rgba(99,146,245,.56)',1.4);
 // Complete flown path in faint blue-green, with elapsed section emphasized.
 drawLine(R,1,2,'rgba(102,213,219,.23)',1.45);
 drawLine(R,1,2,'#89eee7',2.25,false,t);
 if(el('v6ShowPlan')?.checked){drawLine(route.ballistic_path_km,1,2,'rgba(252,189,105,.9)',1.6,true);}
 const dot=(x,y,radius,color,label)=>{
  const q=screen(x,y);c.beginPath();c.arc(q[0],q[1],radius,0,Math.PI*2);c.fillStyle=color;c.fill();
  if(label){c.font='600 10px system-ui';c.textBaseline='middle';const labelOffset=q[0]>width-105?-8:8;
   c.textAlign=labelOffset<0?'right':'left';c.fillStyle='#d4e6f4';c.fillText(label,q[0]+labelOffset,q[1]-10);}
  return q;
 };
 dot(0,0,4.3,'#ffca73','Sun');
 // All other modeled major planets are drawn as subdued context dots at the
 // same replay epoch, never as fabricated circular orbits.
 const ephem=v6GetBodyPositions(t);
 for(let i=1;i<v6Ephem.names.length;i++){
   const name=v6Ephem.names[i];if(name==='Moon'||name===M.source||name===M.destination)continue;
   const xy=screen(ephem[i][0],ephem[i][1]);
   if(xy[0]<5||xy[0]>width-5||xy[1]<5||xy[1]>height-5)continue;
   c.beginPath();c.arc(xy[0],xy[1],2.3,0,Math.PI*2);c.fillStyle='#637f9c';c.fill();
 }
 dot(s[5],s[6],4.2,M.source_color,M.source);
 dot(s[7],s[8],4.2,M.dest_color,M.destination);
 const craft=dot(s[1],s[2],5.2,'#e9fcfa','GAD-01');
 c.strokeStyle='#91ffef';c.lineWidth=1.2;c.beginPath();c.arc(craft[0],craft[1],9.2,0,Math.PI*2);c.stroke();
 // Exact world-space footprint of the currently rendered main map. Both maps
 // use the same inertial XY origin, but opposite vertical Canvas projection.
 if(frameCam && Number.isFinite(frameCam.scale) && frameCam.scale>0){
   const cam=frameCam;
   const x0=cam.cx+(-panX-W/2)/cam.scale,x1=cam.cx+(-panX+W/2)/cam.scale;
   const y0=cam.cy+(-panY-H/2)/cam.scale,y1=cam.cy+(-panY+H/2)/cam.scale;
   const a=screen(x0,y0),b=screen(x1,y1);
   const w=Math.abs(b[0]-a[0]),h=Math.abs(b[1]-a[1]);
   const left=Math.min(a[0],b[0]),top=Math.min(a[1],b[1]);
   c.save();c.setLineDash([4,3]);c.strokeStyle='#f9b971';c.lineWidth=1.2;
   if(w<7||h<7){const center=screen(cam.cx-panX/cam.scale,cam.cy-panY/cam.scale);c.strokeRect(center[0]-5,center[1]-5,10,10);}else{c.strokeRect(left,top,w,h);}
   c.restore();
 }
 c.restore();
 const readout=el('v63HelioContext');
 if(readout){const focus=view==='auto'?'AUTO':view==='system'?'SYSTEM':view==='source'?M.source.toUpperCase():M.destination.toUpperCase();
    readout.textContent='SYNCED · '+focus+' · T'+fmtTime(t);}
}
const v63PriorRender=render;
render=function(){
 v63PriorRender();
 if(!M)return;
 const stamp=performance.now();
 if(playing && stamp-v63LastPaint<110)return;
 v63LastPaint=stamp;
 const t=progressToTime(progress),[s]=stateAt(t);
 v63DrawOverview(t,s);
};
// Mission and camera selectors already call render(). Keep screen sizes aligned
// on mobile Safari, including orientation changes.
window.addEventListener('resize',()=>{v63LastPaint=0;if(M){const t=progressToTime(progress);v63DrawOverview(t,stateAt(t)[0]);}});
if(M){v63DrawOverview(progressToTime(progress),stateAt(progressToTime(progress))[0]);}