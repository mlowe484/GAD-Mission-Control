#!/usr/bin/env python3
"""GAD Mission Control replay adapter v1.

Import ANY controller revision *that exports (or can be mapped to)* heliocentric
2D states and time-stamped commands. The revision is input metadata, not a code
branch. Supports current R38/RC42/RC44 CSV/JSON field names out of the box.

This is a display-data importer, not a certification or simulator re-run.
"""
import argparse, csv, hashlib, json, math
from pathlib import Path

BODIES = {
    'Sun': (696340.,132712440018.,'#ffd284'),
    'Mercury': (2439.7,22031.86855,'#b7aca1'),
    'Venus': (6051.8,324858.592,'#eec189'),
    'Earth': (6378.137,398600.435507,'#5aa1ff'),
    'Moon': (1737.4,4902.800066,'#d5d8df'),
    'Mars': (3389.5,42828.375214,'#ed956f'),
    'Jupiter': (69911.,126686534.9,'#e2b581'),
    'Saturn': (58232.,37931207.8,'#ddc39b'),
    'Uranus': (25362.,5793966.,'#93d8dc'),
    'Neptune': (24622.,6836529.,'#8c98fa'),
}
STAGE={
    'DEPARTURE_VECTOR_TARGET':1, 'DEPARTURE_TRIM':2,
    'CRUISE_COAST':3, 'COAST':3,
    'RC23_REPLAY_FINITE_CAPTURE_PLAN':4,
    'RC6_IMPACT_RADIAL_BRAKE_TANGENTIAL_INSERTION':4,
    'CAPTURE':4,
}
DEFAULT_FIELDS={
    'time':'time_s', 'x':'x_m','y':'y_m','vx':'vx_mps','vy':'vy_mps',
    'source_x':'source_x_m','source_y':'source_y_m',
    'dest_x':'dest_x_m','dest_y':'dest_y_m',
    'source_alt':'source_alt_km','dest_range':'dest_range_km',
    'dest_alt':'dest_alt_km','vr':'dest_vr_kms','vt':'dest_vt_kms',
    'stage':'stage'
}

def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def require(ok,msg):
    if not ok: raise ValueError(msg)

def num(row,col):
    require(col in row, 'Missing required trajectory column '+col)
    v=float(row[col]);require(math.isfinite(v),f'Invalid {col}: {v}');return v

def normalize_stage(label,mapping):
    if str(label).isdigit():
        v=int(label);require(v in (1,2,3,4),'Unknown stage number: '+str(label));return v
    require(label in mapping, 'Unknown stage '+repr(label)+'; supply --stage-map with its semantic mapping')
    v=int(mapping[label]);require(v in (1,2,3,4),'Invalid mapped stage: '+str(label));return v

def simplify_decisions(raw, t0):
    out=[]
    for d in raw:
        result=d.get('result',{}) if isinstance(d,dict) else {}
        # Only make time claims where an actual timestamp is preserved.
        absolute=d.get('time_s',result.get('time_s',result.get('time'))) if isinstance(d,dict) else None
        if absolute is None:continue
        try:t=float(absolute)-t0
        except(ValueError,TypeError):continue
        if not math.isfinite(t) or t<0:continue
        out.append({'t':round(t,3),'n':len(out)+1,
                    'range':result.get('target_range_km'),
                    'miss':result.get('miss_distance_km'),
                    'forecast':result.get('status',d.get('stage','ARCHIVED_DECISION'))})
    return out

def make_replay(args):
    route=args.route.lower().strip();require('_' in route,'Route must be source_destination')
    source,dest=args.source,args.destination
    require(source in BODIES and dest in BODIES, 'Body metadata missing (extend BODIES explicitly)')
    fields=DEFAULT_FIELDS.copy()
    if args.column_map: fields.update(json.loads(Path(args.column_map).read_text()))
    stages=STAGE.copy()
    if args.stage_map: stages.update(json.loads(Path(args.stage_map).read_text()))
    result=json.loads(Path(args.result).read_text())
    require(result.get('source',source).lower()==source.lower(),'Result source does not match user-provided body')
    require(result.get('destination',dest).lower()==dest.lower(),'Result destination does not match user-provided body')
    commands=json.loads(Path(args.commands).read_text())
    require(isinstance(commands,list) and commands,'Expected nonempty command JSON list')
    cmd0=min(float(c['time_s']) for c in commands)
    audit=result.get('gad_off_audit',{}) or {}
    if args.audit:
        independent=json.loads(Path(args.audit).read_text())
    else: independent={}
    recorded_audit = bool(audit.get('verified') and audit.get('gad_disabled'))
    status=result.get('status','UNKNOWN')
    replay_check=bool(result.get('independent_replay_verified'))
    # NEVER promote inferred verification to a certified label.
    verified=status=='VERIFIED_ROUTE' and replay_check and recorded_audit
    raw_count=0;states=[];last_t=-float('inf');coast_prev=-float('inf');prev_stage=None
    coord_scale=0.001 if args.distance_unit=='m' else 1.0
    vel_scale=0.001 if args.velocity_unit=='mps' else 1.0
    with open(args.trajectory,newline='',encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            raw_count+=1
            abs_t=num(row,fields['time']);t=abs_t-cmd0
            if t<-1e-4: raise ValueError('State predates first command: inspect time alignment')
            require(t>=last_t-1e-6,'Out-of-order trajectory times')
            st=normalize_stage(row[fields['stage']],stages)
            keep=(st!=3 or t-coast_prev>=args.coast_step_s or prev_stage!=st)
            if keep:
                state=[round(t,3),round(num(row,fields['x'])*coord_scale,3),round(num(row,fields['y'])*coord_scale,3),
                       round(num(row,fields['vx'])*vel_scale,6),round(num(row,fields['vy'])*vel_scale,6),
                       round(num(row,fields['source_x'])*coord_scale,3),round(num(row,fields['source_y'])*coord_scale,3),
                       round(num(row,fields['dest_x'])*coord_scale,3),round(num(row,fields['dest_y'])*coord_scale,3),
                       round(num(row,fields['source_alt']),5),round(num(row,fields['dest_range']),5),
                       round(num(row,fields['dest_alt']),5),round(num(row,fields['vr']),6),round(num(row,fields['vt']),6),st]
                states.append(state)
                if st==3:coast_prev=t
            last_t=t;prev_stage=st
    require(raw_count>=2 and len(states)>=2,'Trajectory must include at least two samples')
    require(last_t>0,'Trajectory has no meaningful relative duration')
    cmd=[]
    for c in commands:
        controls=c.get('controls',c)
        angle_theta=float(controls.get('theta',0));angle_phi=float(controls.get('phi',math.pi))
        require(math.isfinite(angle_theta) and math.isfinite(angle_phi),'Bad aperture angle')
        cmd.append([round(float(c['time_s'])-cmd0,3),int(bool(controls.get('enabled',False))),
                    controls.get('target_body',source),round(float(controls.get('K',0)),5),
                    round(math.degrees(angle_theta),5),round(math.degrees(angle_phi),5),
                    normalize_stage(c.get('stage','CRUISE_COAST'),stages)])
    cmd.sort(key=lambda a:a[0]);require(cmd[0][0]>=-0.001,'Invalid command start')
    # CSV row time column already encodes absolute model time; retain it.
    peak_depart=max((s[0] for s in states if s[14] in(1,2)),default=0)
    capture_start=min((s[0] for s in states if s[14]==4),default=states[-1][0])
    # Previous script derives a near-source hold and an illustrative two-body end orbit.
    cfg=result.get('case_configuration',{}) or {}
    source_radius,source_mu,source_color=BODIES[source];dest_radius,dest_mu,dest_color=BODIES[dest]
    orbit_alt=float(cfg.get('departure_alt_km',states[0][9]))
    orbital_period=2*math.pi*math.sqrt(max((source_radius+orbit_alt)**3/source_mu,1))
    pre_time=min(18*3600,orbital_period*1.5)
    duration=float(audit.get('observed_s') or 0)
    meta={
        'id':route,'source':source,'destination':dest,
        'label':f'{source} → {dest}', 'revision':args.revision,
        'controller_build':args.controller_build or args.revision,
        'replay_id':f'{route}@{args.revision}',
        'source_radius_km':source_radius,'dest_radius_km':dest_radius,
        'source_mu':source_mu,'dest_mu':dest_mu,
        'source_color':source_color,'dest_color':dest_color,
        'departure_alt_km':orbit_alt,'target_alt_km':float(cfg.get('target_alt_km',states[-1][11])),
        'K_limit':float(result.get('K_limit',300)),
        'launch_wait_days':round(cmd0/86400,6),
        'flight_days':round(last_t/86400,6), 'total_elapsed_days':round((cmd0+last_t)/86400,6),
        'state_count':raw_count,'command_count':len(cmd),'decision_count':0,
        'recorded_end_s':round(last_t,3),'capture_start_s':round(capture_start,3),
        'departure_end_s':round(peak_depart,3),'prelaunch_duration_s':round(pre_time,3),
        'verified_duration_s':round(duration,3),
        'cert_min_alt_km':float(audit.get('min_altitude_km',0)),
        'cert_max_alt_km':float(audit.get('max_altitude_km',0)),
        'cert_observed_s':round(duration,3),
        'mission_index':args.mission_index,
        'summary':f'{source} to {dest} {args.revision} historical benchmark replay.',
        'description':f'Recorded {args.revision} trajectory and controls; derived prelaunch and post-shutdown views are illustrations only.',
        'data_quality':{'trajectory':'recorded + coast sampling','commands':'recorded','decisions':'recorded where timestamp present','prelaunch':'derived','postshutdown':'derived'},
        'verification':{'status':status,'independent_replay_verified':replay_check,
                        'gad_off_verified':recorded_audit,'certificate_available':bool(independent),
                        'certified_for_display':verified},
        'source_evidence':{'benchmark':args.benchmark,'revision':args.revision,
                           'trajectory_sha256':digest(args.trajectory),
                           'commands_sha256':digest(args.commands),
                           'result_sha256':digest(args.result),
                           'audit_sha256':digest(args.audit) if args.audit else None},
        'epoch_start_s':round(cmd0,6),
        'ephemeris_context':'requires revision-specific verification; not inherited from another replay'
    }
    decisions=[];untimed=[]
    if args.decisions:
        raw=json.loads(Path(args.decisions).read_text());decisions=simplify_decisions(raw,cmd0)
        # Preserve real decision evidence even when no absolute timestamps exist.
        for item in raw:
            if isinstance(item,dict):
                outcome=item.get('result',{}) or {}
                untimed.append({'stage':str(item.get('stage','UNKNOWN'))[:120],
                                'status':str(outcome.get('status','UNSPECIFIED'))[:160],
                                'timestamp_available':bool(item.get('time_s') is not None or outcome.get('time_s') is not None)})
    meta['decision_count']=len(untimed)
    meta['timed_decision_count']=len(decisions)
    meta['display_sample_count']=len(states)
    require(all(states[i][0]<=states[i+1][0] for i in range(len(states)-1)),'Bad trajectory ordering')
    return {'schema_version':'gad-replay-v1','meta':meta,'states':states,'commands':cmd,'decisions':decisions,'untimed_decisions':untimed}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for flag in ('revision','route','source','destination','trajectory','commands','result','output','benchmark'):
        p.add_argument('--'+flag.replace('_','-'),required=True)
    p.add_argument('--controller-build',default='')
    p.add_argument('--audit');p.add_argument('--decisions')
    p.add_argument('--column-map',help='Optional JSON canonical-key → CSV-header mapping')
    p.add_argument('--stage-map',help='Optional JSON stage-name → 1/2/3/4 mapping')
    p.add_argument('--coast-step-s',type=float,default=21600.0)
    p.add_argument('--mission-index',type=int,default=1)
    p.add_argument('--distance-unit',choices=['m','km'],default='m',help='State coordinate unit for x/y and body positions')
    p.add_argument('--velocity-unit',choices=['mps','kms'],default='mps',help='State velocity unit for vx/vy')
    a=p.parse_args(); require(a.coast_step_s>0,'Coast step must be positive')
    data=make_replay(a)
    dest=Path(a.output);dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    m=data['meta']; print(f"Imported {m['replay_id']}: recorded samples {m['state_count']}, displayed {m['display_sample_count']}, commands {m['command_count']}; independently verified: {m['verification']['certified_for_display']}")

if __name__=='__main__':main()