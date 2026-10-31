// Manual Flight Lab launch card: additive to the existing educational Pilot panel.
const w38Link=document.createElement('section');
w38Link.className='v9-card';
w38Link.style.cssText='border:1px solid #2d6575;background:#0a2838;margin:12px 0;padding:16px;border-radius:12px';
w38Link.innerHTML='<div class="v9-eyebrow">NATIVE 31-BODY / MANUAL FLIGHT</div><h2>Manual GAD Flight Laboratory</h2><p>Build exact GAD/coast command histories, rotate a 3D Moon view, and inspect orbital diagnostics from native candidate evaluations. A local Python backend is required; the existing Pilot Challenge remains a separate educational simulator.</p><p><a href="./manual-flight/" style="display:inline-block;background:#116b7d;color:white;border-radius:8px;padding:11px 15px;font-weight:800;text-decoration:none">Open Manual Flight Lab ↗</a></p><p style="font-size:11px;color:#b5cada">Engineering screening only · not a qualified orbit or production spacecraft session.</p>';
panels.pilot.prepend(w38Link);