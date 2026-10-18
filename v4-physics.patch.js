/* GAD Mission Control V4.1 – physically grounded aperture geometry.
   Source of truth: RC42 GravityApertureDrive.py:
   d_hat = [cos(theta), sin(theta)] and phi is cone half-opening angle.
   Archived commands supply theta, phi in radians, exported to this viewer in degrees.
   Cone-body overlap is a 2D visual projection of the controller's 3D quadrature.
   It is not the numerically integrated slice centroid or a surface-footprint proof. */
const AP_EPS=1e-9;
const AP_RAD=Math.PI/180;
function gadAimGeometry(craftX,craftY,bodyX,bodyY,bodyRadius,thetaDeg,phiDeg){
  if(!Number.isFinite(thetaDeg)||!Number.isFinite(phiDeg))return null;
  const theta=thetaDeg*AP_RAD,phi=phiDeg*AP_RAD;
  const ux=Math.cos(theta),uy=Math.sin(theta),dx=bodyX-craftX,dy=bodyY-craftY;
  const d=Math.hypot(dx,dy),projection=dx*ux+dy*uy;
  const angularRadius=d>bodyRadius?Math.asin(Math.min(1,bodyRadius/d)):Math.PI/2;
  const off=d>AP_EPS?Math.acos(clamp(projection/d,-1,1)):0;
  let coverage='PARTIAL BODY';
  if(phi<=AP_EPS)coverage='NO INTERSECTION';
  else if(phi>=Math.PI-AP_EPS)coverage='FULL BODY';
  else if(d>bodyRadius && off>angularRadius+phi)coverage='NO INTERSECTION';
  else if(d>bodyRadius && off+angularRadius<=phi)coverage='FULL BODY';
  else if(d>bodyRadius && off>Math.PI/2+angularRadius)coverage='NO INTERSECTION';
  // The quadrature has a forward-direction gate even when phi exceeds 90 degrees.
  const wedge=Math.min(phi,Math.PI/2);
  const perp2=Math.max(0,d*d-projection*projection);
  const axisHit=projection>0 && perp2<=bodyRadius*bodyRadius;
  const axisT=axisHit?Math.max(0,projection-Math.sqrt(Math.max(0,bodyRadius*bodyRadius-perp2))):null;
  return {theta,phi,ux,uy,coverage,wedge,axisHit,axisX:axisHit?craftX+axisT*ux:null,axisY:axisHit?craftY+axisT*uy:null};
}
function gadFillProjectedRegion(c,ship,body,radius,g,color){
  c.save();
  c.beginPath();c.arc(body[0],body[1],Math.max(1.5,radius),0,2*Math.PI);c.clip();
  c.fillStyle=color;
  if(g.coverage==='FULL BODY'){
    c.fillRect(body[0]-radius-1,body[1]-radius-1,radius*2+2,radius*2+2);
  }else if(g.coverage==='PARTIAL BODY'){
    const span=Math.hypot(body[0]-ship[0],body[1]-ship[1]);
    const reach=Math.min(1e9,Math.max(250,span+radius*3));
    c.beginPath();c.moveTo(ship[0],ship[1]);
    const lo=g.theta-g.wedge,hi=g.theta+g.wedge;
    c.arc(ship[0],ship[1],reach,lo,hi,false);
    c.closePath();c.fill();
  }
  c.restore();
}
function gadDrawAxis(c,ship,body,g,scale,lineLength){
  const extent=Math.max(lineLength,scale*1.2);
  c.save();c.lineWidth=Math.max(1,scale*.009);c.strokeStyle='#b7f8f2d0';
  c.setLineDash([Math.max(3,scale*.04),Math.max(3,scale*.025)]);
  c.beginPath();c.moveTo(ship[0],ship[1]);
  c.lineTo(ship[0]+g.ux*extent,ship[1]+g.uy*extent);c.stroke();c.setLineDash([]);
  if(g.axisHit){
    const xp=ship[0]+g.ux*lineLength,yp=ship[1]+g.uy*lineLength;
    // axis intersection marker is rendered by the caller using world geometry
  }
  c.restore();
}
function renderAperture(cmd){
  const c=apertureCtx,D=240,cx=120,cy=115,rad=37;
  c.clearRect(0,0,D,D);c.fillStyle='#08131f';c.fillRect(0,0,D,D);
  c.strokeStyle='#20374e';c.lineWidth=1;
  c.beginPath();c.moveTo(120,12);c.lineTo(120,224);c.moveTo(12,115);c.lineTo(228,115);c.stroke();
  c.fillStyle='#768ba4';c.font='10px system-ui';c.textAlign='left';c.fillText('+X',218,109);c.fillText('+Y',124,225);
  const on=!!cmd[1]&&cmd[4]!=null&&cmd[5]!=null;
  el('aimBody').textContent=on?(cmd[2]||'Body'):'None';
  el('aimPoint').textContent=on?fmt(cmd[4],2)+'°':'—';
  el('aimHemisphere').textContent=on?fmt(cmd[5],2)+'°':'—';
  el('coneTheta').textContent=on?fmt(cmd[4],2)+'°':'—';
  el('conePhi').textContent=on?fmt(cmd[5],2)+'°':'—';
  if(!on){el('aimMode').textContent='STANDBY';c.fillStyle='#9bb2c7';c.font='700 13px system-ui';c.textAlign='center';c.fillText('GAD OFF',120,116);return;}
  const s=stateAt(progressToTime(progress))[0];
  const source=String(cmd[2]).toLowerCase()===M.source.toLowerCase();
  const bx=source?s[5]:s[7],by=source?s[6]:s[8];
  const radkm=source?M.source_radius_km:M.dest_radius_km;
  const craftX=s[1],craftY=s[2];
  const theta=cmd[4],phi=cmd[5];
  const gWorld=gadAimGeometry(craftX,craftY,bx,by,radkm,theta,phi);
  const angle=Math.atan2(craftY-by,craftX-bx);
  const ship=[cx+Math.cos(angle)*99,cy+Math.sin(angle)*99],body=[cx,cy];
  const g=gadAimGeometry(ship[0],ship[1],cx,cy,rad,theta,phi);
  if(!g || !gWorld)return;
  g.coverage=gWorld.coverage; // status from actual spacecraft/body geometry, not inset distances
  const color=bodyColor(cmd[2]);
  c.fillStyle=color+'36';c.beginPath();c.arc(cx,cy,rad,0,2*Math.PI);c.fill();
  c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(cx,cy,rad,0,2*Math.PI);c.stroke();
  if(el('coneToggle').checked){
    gadFillProjectedRegion(c,ship,body,rad,g,'rgba(103,247,234,0.45)');
    if(g.coverage!=='FULL BODY'){
      const reach=220;
      c.strokeStyle='#80dcd6ab';c.lineWidth=1.2;
      for(const ang of [g.theta-g.wedge,g.theta+g.wedge]){
        c.beginPath();c.moveTo(...ship);c.lineTo(ship[0]+Math.cos(ang)*reach,ship[1]+Math.sin(ang)*reach);c.stroke();
      }
    }
  }
  c.strokeStyle='#b7f8f2db';c.setLineDash([4,4]);c.beginPath();c.moveTo(...ship);c.lineTo(ship[0]+g.ux*210,ship[1]+g.uy*210);c.stroke();c.setLineDash([]);
  c.fillStyle='#fff9ed';c.beginPath();c.arc(...ship,4,0,2*Math.PI);c.fill();
  if(g.axisHit){
    c.fillStyle='#ffcf70';c.strokeStyle='#fafcfc';c.lineWidth=1;
    c.beginPath();c.arc(g.axisX,g.axisY,4,0,2*Math.PI);c.fill();c.stroke();
  }
  if(g.coverage==='FULL BODY'){
    c.fillStyle='#a3f4be';c.beginPath();c.arc(cx,cy,3,0,2*Math.PI);c.fill();
  }
  c.fillStyle='#dbe8f3';c.font='700 11px system-ui';c.textAlign='center';c.fillText(cmd[2].toUpperCase(),cx,18);
  c.fillStyle='#9ab2c8';c.font='11px system-ui';c.fillText('GAD',ship[0],Math.min(235,ship[1]+14));
  el('aimMode').textContent=g.coverage;
}
function drawApertureOnMap(cam,s,cmd){
  if(!cmd[1]||cmd[4]==null||cmd[5]==null)return;
  let bx,by,r;
  if(String(cmd[2]).toLowerCase()===M.source.toLowerCase()) [bx,by,r]=[s[5],s[6],M.source_radius_km];
  else if(String(cmd[2]).toLowerCase()===M.destination.toLowerCase()) [bx,by,r]=[s[7],s[8],M.dest_radius_km];
  else return;
  const g=gadAimGeometry(s[1],s[2],bx,by,r,cmd[4],cmd[5]);if(!g)return;
  const ship=interpScreen(cam,s[1],s[2]),body=interpScreen(cam,bx,by),screenR=r*cam.scale;
  if(!Number.isFinite(screenR+ship[0]+ship[1]+body[0]+body[1]))return;
  // Skip microscopic planetary disks and impossible off-screen regions;
  // retain the inset's full geometry for distant-system camera views.
  if(screenR<1.5*devicePixelRatio)return;
  const show=el('coneToggle').checked;
  const reach=Math.min(Math.max(W,H)*2,Math.hypot(ship[0]-body[0],ship[1]-body[1])+Math.min(screenR*3,Math.max(W,H)*2));
  ctx.save();
  if(show){
    gadFillProjectedRegion(ctx,ship,body,screenR,g,'rgba(110,238,226,0.43)');
    if(g.coverage!=='FULL BODY' && reach<Math.max(W,H)*3 && (ship[0]>-W && ship[0]<2*W && ship[1]>-H && ship[1]<2*H)){
      ctx.strokeStyle='#85e7e193';ctx.lineWidth=1.2*devicePixelRatio;
      for(const a of [g.theta-g.wedge,g.theta+g.wedge]){
        ctx.beginPath();ctx.moveTo(...ship);ctx.lineTo(ship[0]+Math.cos(a)*reach,ship[1]+Math.sin(a)*reach);ctx.stroke();
      }
    }
  }
  ctx.strokeStyle='#9af3ecc4';ctx.lineWidth=1*devicePixelRatio;ctx.setLineDash([5*devicePixelRatio,4*devicePixelRatio]);
  ctx.beginPath();ctx.moveTo(...ship);ctx.lineTo(ship[0]+g.ux*reach,ship[1]+g.uy*reach);ctx.stroke();ctx.setLineDash([]);
  if(g.axisHit){const pt=interpScreen(cam,g.axisX,g.axisY);
    ctx.fillStyle='#ffcf77';ctx.strokeStyle='#f7ffff';ctx.lineWidth=1*devicePixelRatio;
    ctx.beginPath();ctx.arc(...pt,3.5*devicePixelRatio,0,2*Math.PI);ctx.fill();ctx.stroke();
  }
  if(g.coverage==='FULL BODY'){
    ctx.fillStyle='#a1f4bd';ctx.beginPath();ctx.arc(body[0],body[1],Math.max(2,Math.min(7,screenR*.13))*devicePixelRatio,0,2*Math.PI);ctx.fill();
  }
  ctx.restore();
}
el('coneToggle').addEventListener('change',()=>render());