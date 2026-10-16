import * as THREE from './three.module.js';

// The collision surface is the same polyline used by the rendered ramp deck.
// Wheels are circles in the ramp's profile; small body probes protect the overhangs.
const probes=[];
for(const x of [-1.48,1.48])for(const z of [-1.015,1.015])probes.push({x,y:.385,z,r:.385});
for(const x of [-2.38,-.75,0,.75,2.38])for(const z of [-.72,.72])probes.push({x,y:.25,z,r:.075});
for(const x of [-.65,.25])probes.push({x,y:1.18,z:0,r:.10});
const margin=.008;

export function createRampContact(points){
  const segments=points.slice(0,-1).map((a,i)=>{
    const b=points[i+1],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
    return {index:i,x:a.x,y:a.y,dx,dy,length,tx:dx/length,ty:dy/length,nx:-dy/length,ny:dx/length};
  });
  const onRoad=s=>(s.index!==0||s.along>=0)&&(s.index!==segments.length-1||s.along<=s.length);
  function nearest(p){
    let best=null,bestAlong=0,bestDistance=Infinity;
    for(const s of segments){
      const along=(p.x-s.x)*s.tx+(p.y-s.y)*s.ty;
      const u=Math.max(0,Math.min(s.length,along));
      const d2=(p.x-s.x-u*s.tx)**2+(p.y-s.y-u*s.ty)**2;
      if(d2<bestDistance){best=s;bestAlong=along;bestDistance=d2;}
    }
    return {...best,along:bestAlong,d2:bestDistance,signed:(p.x-best.x)*best.nx+(p.y-best.y)*best.ny};
  }
  function world(probe,position,quaternion){
    return new THREE.Vector3(probe.x,probe.y,probe.z).applyQuaternion(quaternion).add(position);
  }
  function clearances(position,quaternion){
    return probes.map(probe=>{
      const p=world(probe,position,quaternion),s=nearest(p);
      return {probe,p,s,onRoad:onRoad(s),gap:s.signed-probe.r-margin};
    });
  }
  function place(position,quaternion){
    // Curvature lifts the axle pair above the path's centre tangent. Placing only
    // the car origin on the curve otherwise drives the front/rear tires into it.
    const up=new THREE.Vector3(0,1,0).applyQuaternion(quaternion);
    for(let i=0;i<12;i++){
      let lift=0;
      for(const hit of clearances(position,quaternion)){
        const alignment=hit.s.nx*up.x+hit.s.ny*up.y;
        if(hit.onRoad&&alignment>.15)lift=Math.max(lift,-hit.gap/alignment);
      }
      if(lift<.0001)break;
      position.addScaledVector(up,lift);
    }
    return position;
  }
  function resolve(state,previous,quaternion){
    const position=new THREE.Vector3(state.x,state.height,state.z);
    const oldPosition=new THREE.Vector3(previous.x,previous.height,previous.z);
    for(let iteration=0;iteration<4;iteration++){
      let hit=null;
      for(const probe of probes){
        const p=world(probe,position,quaternion),old=world(probe,oldPosition,quaternion);
        if(Math.abs(p.z)>2.5+probe.r)continue;
        // Swept plane tests prevent fast thrust from tunnelling through a thin deck.
        for(const s of segments){
          const d=(p.x-s.x)*s.nx+(p.y-s.y)*s.ny;
          const before=(old.x-s.x)*s.nx+(old.y-s.y)*s.ny;
          const radius=probe.r+margin;
          if(d>=radius||before<radius-.025)continue;
          const alpha=before>d?Math.max(0,Math.min(1,(before-radius)/(before-d))):1;
          const x=old.x+(p.x-old.x)*alpha,y=old.y+(p.y-old.y)*alpha;
          const along=(x-s.x)*s.tx+(y-s.y)*s.ty;
          if(along<0||along>s.length)continue;
          if(!hit||radius-d>hit.depth)hit={s,depth:radius-d};
        }
        // Also repair shallow overlap introduced by the car's changing attitude.
        const s=nearest(p),depth=probe.r+margin-s.signed;
        if(onRoad(s)&&s.d2<(probe.r+.04)**2&&depth>0&&(!hit||depth>hit.depth))hit={s,depth};
      }
      if(!hit)break;
      position.x+=hit.s.nx*hit.depth;position.y+=hit.s.ny*hit.depth;
      const inward=state.vx*hit.s.nx+state.velocity*hit.s.ny;
      if(inward<0){state.vx-=inward*hit.s.nx;state.velocity-=inward*hit.s.ny;}
      state.rampContact=hit.s;
    }
    state.x=position.x;state.height=position.y;
  }
  return {place,resolve,clearances};
}
