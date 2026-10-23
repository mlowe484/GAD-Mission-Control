/* Mission Control V10.2: Native-cadence P6F moon states and velocity-aware interpolation.
   Production insertion: inside V9's scope, after V10 and V10.1.
   Historical P6F/Horizons source files, 2D missions and educational pilot physics are unchanged. */
{
 const v102Banner=document.getElementById('gadProductionRelease');
 if(v102Banner){const strong=v102Banner.querySelector('strong');if(strong)strong.textContent='V10.2 · CURRENT RELEASE';}
 document.title='GAD Mission Control · V10.2';
 // A moon state contains source-cadence *parent-relative* Cartesian position (km)
 // and velocity (km/s). The parent state itself continues to come from the
 // existing Sun-relative browser ephemeris. This avoids large heliocentric
 // subtraction errors when rendering tightly bound moon systems.
 const v102OldBodySample=v10BodySample;
 const v102Decode=body=>{
   if(body._nativeSamples)return body._nativeSamples;
   if(body.encoding!=='f32le-poskm-velkmps-interleaved')return null;
   const str=body.packed_f32_b64;
   if(typeof str!=='string')return null;
   const binary=atob(str);
   if(binary.length!==body.samples*24)throw Error('P6F moon data length mismatch');
   const bytes=new Uint8Array(binary.length);
   for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
   // Float32Array is LE on browser platforms supported by this viewer.
   // Use DataView explicitly on big-endian implementations.
   const little=new Uint16Array(new Uint8Array([1,0]).buffer)[0]===1;
   let floats;
   if(little)floats=new Float32Array(bytes.buffer);
   else {floats=new Float32Array(body.samples*6);const dv=new DataView(bytes.buffer);
      for(let i=0;i<floats.length;i++)floats[i]=dv.getFloat32(i*4,true);}
   body._nativeSamples=floats;
   // No need to keep the base64 encoding once its decoded samples are available.
   delete body.packed_f32_b64;
   return floats;
 };
 v10BodySample=function(data,name,t){
   const b=data?.bodies?.[name];
   if(!b)return v102OldBodySample(data,name,t);
   // Older cached, coarsely downsampled display files lack native velocities.
   // Great-circle interpolation avoids the dramatic radial cuts of linear
   // chords; this is a display fallback, NOT a replacement for native states.
   if(b.encoding!=='f32le-poskm-velkmps-interleaved'){
     if(b.unit!=='km'||!Array.isArray(b.coords))return v102OldBodySample(data,name,t);
     const u=Math.max(0,Math.min(b.samples-1,(t-data.t0_tdb_s)/(b.hours*3600)));
     const i=Math.min(b.samples-2,Math.floor(u)),f=u-i;
     const j=i*3,k=(i+1)*3,a=b.coords;
     const p=[a[j],a[j+1],a[j+2]],q=[a[k],a[k+1],a[k+2]];
     const rp=Math.hypot(...p),rq=Math.hypot(...q);
     if(rp<1||rq<1)return v102OldBodySample(data,name,t);
     const dp=Math.max(-1,Math.min(1,p.reduce((x,v,n)=>x+v*q[n],0)/(rp*rq)));
     const w=Math.acos(dp),s=Math.sin(w),r=rp+(rq-rp)*f;
     if(s<1e-7)return v102OldBodySample(data,name,t);
     const c0=Math.sin((1-f)*w)/s/rp,c1=Math.sin(f*w)/s/rq;
     return p.map((v,n)=>r*(c0*v+c1*q[n]));
   }
   const a=v102Decode(b),dt=b.hours*3600;
   const u=Math.max(0,Math.min(b.samples-1,(t-data.t0_tdb_s)/dt));
   const i=Math.min(b.samples-2,Math.floor(u)),f=u-i;
   const j=i*6,k=(i+1)*6;
   const f2=f*f,f3=f2*f;
   const h00=2*f3-3*f2+1,h10=f3-2*f2+f,h01=-2*f3+3*f2,h11=f3-f2;
   return [0,1,2].map(axis=>h00*a[j+axis]+h10*dt*a[j+3+axis]
                           +h01*a[k+axis]+h11*dt*a[k+3+axis]);
 };
 const v102OldMoonLoader=v10LoadMoons;
 let v102Loading=false;
 v10LoadMoons=async function(){
  if(v10MoonData||v102Loading)return;
  v102Loading=true;
  v10Verify.textContent='Loading P6F native-cadence moon records and velocities (18 MB, 20 moons)…';
  try{
   const counts=[7,5,6,3];
   const sizes=[6080083,4444623,5379423,2339770];
   const parts=await Promise.all(counts.map(async(count,i)=>{
    const fragments=await Promise.all(Array.from({length:count},async(_,j)=>{
     const name='native-p6f-part'+(i+1)+'-'+String(j+1).padStart(2,'0')+'.txt';
     const response=await fetch('./data/native-moons/'+name+'?release=v10-2-native', {cache:'force-cache'});
     if(!response.ok)throw Error('Native moon fragment unavailable: '+name+' (HTTP '+response.status+')');
     return await response.text();
    }));
    const raw=fragments.join('');
    if(raw.length!==sizes[i])throw Error('Native moon archive part '+(i+1)+' size mismatch');
    const data=JSON.parse(raw);
    if(data.display_data_revision!=='P6F-native-cadence-with-velocity-Hermite-v2')throw Error('Incorrect moon data revision');
    return data;
   }));
   const d={...parts[0],bodies:Object.assign({},...parts.map(p=>p.bodies))};
   if(Object.keys(d.bodies).length!==20||!Object.values(d.bodies).every(x=>x.encoding==='f32le-poskm-velkmps-interleaved'))throw Error('Native moon inventory incomplete');
   v10MoonData=d;
   v10Verify.textContent='P6F native moon cadence (30 minutes–6 hours) and archived velocities; cubic Hermite interpolation. Browser positions are derived from independently spot-checked P6F states, not independently certified themselves.';
   if(active==='3d')draw3d();
  }catch(error){
   console.error('Native P6F moon load failed; using previous approximate visualization',error);
   v10Verify.textContent='High-fidelity moon data unavailable. Loading approximate fallback: '+error.message;
   await v102OldMoonLoader();
   if(v10MoonData)v10Verify.textContent='FALLBACK: older coarse moon samples (smooth arc approximation), not the native-resolution archive.';
  }finally{v102Loading=false;}
 };
 // Avoid drawing a partial / disappearing trail near the first or last
 // orbital period in the 10-year archive. Original V10.1 draw function
 // is patched at loader assembly to draw a full, shifted native-time window.
}