/* V4: illustrative aperture cone and projected body coupling patch.
   Command angles are recorded; display half-angle is NOT a model parameter. */
function renderAperture(cmd){
  const c=apertureCtx, D=240, center=120, radius=74;
  c.clearRect(0,0,D,D); c.fillStyle='#08131f'; c.fillRect(0,0,D,D);
  c.strokeStyle='#244359'; c.lineWidth=1;
  for(let i=0;i<3;i++){c.beginPath();c.arc(center,center,radius-i*18,0,Math.PI*2);c.stroke();}
  c.beginPath();c.moveTo(120,30);c.lineTo(120,210);c.moveTo(30,120);c.lineTo(210,120);c.stroke();
  if(!cmd[1]||cmd[4]==null||cmd[5]==null){
    c.fillStyle='#9bb2c7';c.font='700 13px system-ui';c.textAlign='center';c.fillText('STANDBY / GAD OFF',center,125);
    el('aimBody').textContent='None';el('aimPoint').textContent='—';el('aimHemisphere').textContent='—';el('aimMode').textContent='Standby';return;
  }
  const body=cmd[2]||'Body',col=bodyColor(body),aim=angleToAim(cmd[4],cmd[5]);
  if(!aim)return;
  c.fillStyle=col+'28';c.beginPath();c.arc(center,center,radius,0,2*Math.PI);c.fill();
  c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.arc(center,center,radius,0,2*Math.PI);c.stroke();
  c.strokeStyle='#d3e7ff22';c.beginPath();c.ellipse(120,120,74,31,0,0,2*Math.PI);c.stroke();
  const px=center+aim.x*radius*.78,py=center+aim.y*radius*.78;
  const dx=px-center,dy=py-center,dist=Math.max(0.01,Math.hypot(dx,dy));
  const tangent=[-dy/dist,dx/dist];
  const show=el('coneToggle').checked, angle=Number(el('coneSpread').value)||12;
  const width=Math.min(28,Math.max(8,radius*Math.sin(angle*Math.PI/180)*1.1));
  if(show){
    const apex=[120,206], alpha=aim.z>=0?'rgba(116,235,234,0.20)':'rgba(248,174,103,0.17)';
    c.fillStyle=alpha;c.strokeStyle=aim.z>=0?'#73e7e0aa':'#f8ae67aa';c.lineWidth=1.5;
    c.beginPath();c.moveTo(apex[0],apex[1]);c.lineTo(px+tangent[0]*width,py+tangent[1]*width);
    c.lineTo(px-tangent[0]*width,py-tangent[1]*width);c.closePath();c.fill();c.stroke();
    c.strokeStyle='#8cf0eb88';c.beginPath();c.ellipse(px,py,width,width*.40,Math.atan2(tangent[1],tangent[0]),0,2*Math.PI);c.stroke();
  }
  c.fillStyle=aim.z>=0?'#83f2ea':'#ffbc84';c.beginPath();c.arc(px,py,4,0,2*Math.PI);c.fill();
  c.strokeStyle='#ffffffbb';c.beginPath();c.arc(px,py,7,0,2*Math.PI);c.stroke();
  c.fillStyle='#dcefff';c.textAlign='center';c.font='700 12px system-ui';c.fillText(body.toUpperCase(),center,20);
  el('aimBody').textContent=body;el('aimPoint').textContent=`x ${fmt(aim.x,2)} · y ${fmt(-aim.y,2)}`;
  el('aimHemisphere').textContent=aim.z>=0?'Near side':'Far side';el('aimMode').textContent=show?'Cone visible':'Axis only';
}
function drawApertureOnMap(cam,s,cmd){
  if(!cmd[1]||cmd[4]==null||cmd[5]==null)return;
  const aim=angleToAim(cmd[4],cmd[5]);if(!aim)return;
  let bx,by,r,name;
  if((cmd[2]||'').toLowerCase()===M.source.toLowerCase()) [bx,by,r,name]=[s[5],s[6],M.source_radius_km,M.source];
  else if((cmd[2]||'').toLowerCase()===M.destination.toLowerCase()) [bx,by,r,name]=[s[7],s[8],M.dest_radius_km,M.destination];
  else return;
  const craft=interpScreen(cam,s[1],s[2]);
  const pt=interpScreen(cam,bx+r*aim.x,by+r*aim.y);
  if(!Number.isFinite(craft[0]+craft[1]+pt[0]+pt[1]))return;
  const dx=pt[0]-craft[0],dy=pt[1]-craft[1]; const length=Math.hypot(dx,dy);
  const spreadDeg=Number(el('coneSpread').value)||12;
  const bodyRadius=Math.max(0,r*cam.scale);
  const halfWidth=Math.min(Math.max(3*devicePixelRatio,bodyRadius*Math.sin(spreadDeg*Math.PI/180)),0.60*length,0.30*Math.min(W,H));
  const perp=length>1e-8?[-dy/length,dx/length]:[0,1];
  const col=aim.z>=0?'#83eee7':'#f5b16c';
  const show=el('coneToggle').checked;
  ctx.save();
  if(show && length>5*devicePixelRatio && bodyRadius>1.5*devicePixelRatio){
    const gradient=ctx.createLinearGradient(craft[0],craft[1],pt[0],pt[1]);
    gradient.addColorStop(0,'rgba(111,229,225,0.045)');
    gradient.addColorStop(1,aim.z>=0?'rgba(112,230,221,0.25)':'rgba(247,175,110,0.23)');
    ctx.fillStyle=gradient;ctx.strokeStyle=aim.z>=0?'#7fece0b8':'#f8ae67a6';ctx.lineWidth=1.1*devicePixelRatio;
    ctx.beginPath();ctx.moveTo(craft[0],craft[1]);
    ctx.lineTo(pt[0]+perp[0]*halfWidth,pt[1]+perp[1]*halfWidth);
    ctx.lineTo(pt[0]-perp[0]*halfWidth,pt[1]-perp[1]*halfWidth);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.save();ctx.translate(pt[0],pt[1]);ctx.rotate(Math.atan2(perp[1],perp[0]));
    ctx.fillStyle=aim.z>=0?'rgba(109,239,229,0.20)':'rgba(251,176,102,0.19)';ctx.strokeStyle=col;
    ctx.lineWidth=1.6*devicePixelRatio;ctx.beginPath();ctx.ellipse(0,0,halfWidth,Math.max(2*devicePixelRatio,halfWidth*.4),0,0,2*Math.PI);ctx.fill();ctx.stroke();ctx.restore();
  }
  ctx.strokeStyle=col+'bb';ctx.lineWidth=1*devicePixelRatio;ctx.setLineDash([4*devicePixelRatio,4*devicePixelRatio]);
  ctx.beginPath();ctx.moveTo(craft[0],craft[1]);ctx.lineTo(pt[0],pt[1]);ctx.stroke();ctx.setLineDash([]);
  const dotR=Math.max(3*devicePixelRatio,Math.min(6*devicePixelRatio,bodyRadius*.09));
  if(pt[0]>-40&&pt[0]<W+40&&pt[1]>-40&&pt[1]<H+40){
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(pt[0],pt[1],dotR,0,2*Math.PI);ctx.fill();
    ctx.strokeStyle='#fffefad9';ctx.lineWidth=1.3*devicePixelRatio;ctx.beginPath();ctx.arc(pt[0],pt[1],dotR+3*devicePixelRatio,0,2*Math.PI);ctx.stroke();
  }
  ctx.restore();
}
el('coneSpread').addEventListener('input',e=>{el('coneSpreadValue').textContent=e.target.value+'°';render();}); el('coneToggle').addEventListener('change',()=>render());