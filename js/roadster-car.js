import * as THREE from './three.module.js';

export function buildRoadster() {
  const car = new THREE.Group(), wheels = [];
  const paint = new THREE.MeshPhysicalMaterial({color:0xd9dbde,metalness:.48,roughness:.30,clearcoat:1,clearcoatRoughness:.16});
  const black = new THREE.MeshStandardMaterial({color:0x090b0e,metalness:.35,roughness:.38});
  const glass = new THREE.MeshPhysicalMaterial({color:0x352c28,metalness:.55,roughness:.17,clearcoat:1,side:THREE.DoubleSide});
  const rubber = new THREE.MeshStandardMaterial({color:0x111214,roughness:.92});
  const alloy = new THREE.MeshStandardMaterial({color:0xb6b8b9,metalness:.85,roughness:.26});
  const lamp = new THREE.MeshBasicMaterial({color:0xfff9e9});
  const tail = new THREE.MeshBasicMaterial({color:0xff1f30});
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  function mesh(g,m,parent=car){const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(x,y,z,p,m,parent=car){const o=mesh(new THREE.BoxGeometry(x,y,z),m,parent);o.position.copy(p);return o;}
  function surface(points,m,parent=car) {
    const positions=[];
    for(let i=1;i<points.length-1;i++)positions.push(...points[0],...points[i],...points[i+1]);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
    const mat=m.clone();mat.side=THREE.DoubleSide;return mesh(g,mat,parent);
  }
  function line(points,r,m) {return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),40,r,6,false),m);}

  // Separate upper body and arch-cut side skins leave the tires fully exposed.
  const sections=[
    [-2.36,.91,.83,.81],[-2.12,1.02,.88,.90],[-1.48,1.04,.90,.99],
    [-.7,.99,.85,.87],[.25,.98,.85,.86],[1.0,1.02,.83,.95,.54],
    [1.48,1.04,.79,.97,.58],[1.92,1.04,.71,.84,.65],[2.36,1.01,.57,.61,.72]
  ];
  for(let i=0;i<sections.length-1;i++){
    const [x,w,c,s]=sections[i], [xx,ww,cc,ss]=sections[i+1];
    const h=sections[i][4]??w*.67,hh=sections[i+1][4]??ww*.67;
    for(const side of [-1,1]){
      surface([[x,c,0],[xx,cc,0],[xx,cc,side*hh],[x,c,side*h]],paint);
      // The last shoulder panel is built around the triangular lamp recess below.
      if(x<1.92)surface([[x,c,side*h],[xx,cc,side*hh],[xx,ss,side*ww],[x,s,side*w]],paint);
    }
  }
  for(const side of [-1,1]){
    const shape=new THREE.Shape();
    shape.moveTo(-2.36,.81);
    for(const [x,w,c,s] of sections.slice(1))shape.lineTo(x,s);
    shape.lineTo(2.36,.29);shape.lineTo(1.48+.435,.24);
    shape.absarc(1.48,.385,.435,-.34,Math.PI+.34,false);
    shape.lineTo(-1.48+.435,.24);
    shape.absarc(-1.48,.385,.435,-.34,Math.PI+.34,false);
    shape.lineTo(-2.36,.24);shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:28});
    // Side walls taper in below the belt line.
    const a=g.attributes.position;
    for(let i=0;i<a.count;i++){
      const x=a.getX(i),y=a.getY(i);
      let j=0;while(j<sections.length-2&&x>sections[j+1][0])j++;
      const left=sections[j],right=sections[j+1];
      const width=THREE.MathUtils.lerp(left[1],right[1],THREE.MathUtils.clamp((x-left[0])/(right[0]-left[0]),0,1));
      a.setZ(i,side*(width-.07+a.getZ(i)-Math.max(0,.7-y)*.12));
    }
    if(side<0){
      // Mirroring a skin also reverses triangle winding.
      for(let i=0;i<a.count;i+=3){
        const p=V(a.getX(i+1),a.getY(i+1),a.getZ(i+1));
        a.setXYZ(i+1,a.getX(i+2),a.getY(i+2),a.getZ(i+2));
        a.setXYZ(i+2,p.x,p.y,p.z);
      }
    }
    g.computeVertexNormals();mesh(g,paint);
    // Dark rocker, door edge, flush handle, small angular mirror.
    box(1.95,.09,.13,V(0,.28,side*.94),black);
    line([[.67,.87,side*1.0],[.67,.55,side*.99],[.46,.31,side*.94],[-.92,.31,side*.94]],.006,black);
    box(.19,.018,.013,V(-.66,.82,side*.995),black);
    const mirror=box(.23,.06,.17,V(.63,.99,side*1.10),black);mirror.rotation.y=side*.17;
    line([[1.90,.85,side*1.035],[1.03,.95,side*1.025],[.2,.85,side*.985],[-1.1,.91,side*1.02]],.004,alloy);
    const amber=new THREE.MeshBasicMaterial({color:0xae5916});
    box(.18,.015,.012,V(.91,.82,side*1.027),amber);
  }
  box(4.4,.08,1.52,V(0,.24,0),black);

  // Long, bronze-black windshield and a curved roof rather than a box cabin.
  const canopy=[
    [1.16,.90,.80],[.92,.96,.77],[.48,1.15,.70],[.05,1.28,.66],
    [-.45,1.30,.65],[-.85,1.24,.64],[-1.19,1.08,.55],[-1.57,.89,.43]
  ];
  const pos=[],idx=[],steps=20;
  for(const [x,y,w] of canopy)for(let j=0;j<=steps;j++){
    const z=j/steps*2-1;pos.push(x,y-.075*z*z,w*z);
  }
  for(let i=0;i<canopy.length-1;i++)for(let j=0;j<steps;j++){
    const a=i*(steps+1)+j,b=a+steps+1;idx.push(a,b,a+1,a+1,b,b+1);
  }
  const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));cg.setIndex(idx);cg.computeVertexNormals();mesh(cg,glass);
  for(const side of [-1,1]){
    const border=canopy.map(([x,y,w])=>[x,y-.075,side*w]);
    line(border,.022,paint);
    const win=[[1.12,.83,side*.79],...border.slice(1,7),[-1.55,.87,side*.8],[-.6,.87,side*.97],[.35,.85,side*.97]];
    surface(win,glass);
    line([[.48,1.075,side*.70],[.62,.85,side*.96]],.008,black);
    line([[-.88,1.15,side*.68],[-1.04,.88,side*.91]],.01,black);
  }
  // Reference nose: a low trapezoidal hood, raised fenders, and inset triangular lamps.
  // All points share the body's actual edges, avoiding a light bar pasted over a slab.
  const recess=new THREE.MeshStandardMaterial({color:0x23262c,metalness:.65,roughness:.23,side:THREE.DoubleSide});
  const lens=new THREE.MeshPhysicalMaterial({color:0xb9c4d0,metalness:.36,roughness:.14,clearcoat:1,side:THREE.DoubleSide});
  for(const side of [-1,1]){
    const a=V(1.92,.71,side*.65),b=V(1.92,.785,side*.92),c=V(2.36,.57,side*.72);
    surface([a.toArray(),b.toArray(),c.toArray()],recess).name='front-lamp-recess';
    surface([b.toArray(),[1.92,.84,side*1.04],[2.36,.61,side*1.01],c.toArray()],paint);
    // Close the rear lip of the recessed pocket against the preceding fender panel.
    surface([a.toArray(),[1.92,.84,side*1.04],b.toArray()],paint);
    const onLens=(u,v)=>a.clone().multiplyScalar(1-u-v).addScaledVector(b,u).addScaledVector(c,v).add(V(.003,.003,0)).toArray();
    surface([onLens(.08,.17),onLens(.76,.17),onLens(.06,.84)],lens).name='front-triangle-lens';
    surface([onLens(.10,.18),onLens(.73,.18),onLens(.66,.25),onLens(.09,.25)],lamp);
    // Individual projector fingers taper with the triangular housing.
    for(let j=0;j<6;j++){
      const u=.12+j*.095,depth=.67-j*.068;
      surface([onLens(u,.27),onLens(u+.036,.27),onLens(u+.016,depth),onLens(u,depth)],lamp);
    }
    line([[1.0,.834,side*.54],[1.48,.794,side*.58],[1.92,.714,side*.65],[2.36,.574,side*.72]],.003,black);
    // Body-colour bumper cheeks frame the central black aperture, not the full width.
    surface([[2.36,.57,side*.72],[2.36,.61,side*1.01],[2.39,.30,side*1.015],[2.42,.28,side*.79]],paint).name='front-bumper-cheek';
    surface([[2.39,.30,side*1.015],[2.42,.28,side*.79],[2.46,.18,side*.80],[2.43,.20,side*1.01]],black);
  }
  surface([[2.363,.568,-.72],[2.363,.568,.72],[2.38,.405,.758],[2.38,.405,-.758]],recess).name='front-upper-fascia';
  surface([[2.38,.40,-.758],[2.38,.40,.758],[2.40,.215,.80],[2.40,.215,-.80]],black).name='front-lower-intake';
  box(.014,.009,1.44,V(2.374,.574,0),lamp);
  line([[2.389,.405,-.753],[2.389,.405,0],[2.389,.405,.753]],.004,black);
  // Swept splitter follows the intake's shallow central notch.
  const splitter=[[2.45,.18,-1.01],[2.48,.18,-.79],[2.48,.215,-.63],[2.48,.215,.63],[2.48,.18,.79],[2.45,.18,1.01]];
  for(let i=0;i<splitter.length-1;i++)surface([splitter[i],splitter[i+1],[2.20,.17,splitter[i+1][2]],[2.20,.17,splitter[i][2]]],black);
  // Sculpted flying buttresses frame the inset rear glass and taper into the deck.
  for(const side of [-1,1]){
    surface([[-.85,1.165,side*.64],[-1.19,1.005,side*.55],[-1.57,.815,side*.43],[-2.12,.89,side*.68],[-1.48,.99,side*1.04]],paint);
    line([[-1.19,1.008,side*.55],[-1.57,.819,side*.43],[-2.12,.894,side*.68]],.003,black);
    surface([[-2.375,.71,side*.90],[-2.40,.57,side*.91],[-2.42,.39,side*.68],[-2.40,.52,side*.38]],paint);
  }
  surface([[-2.37,.82,-.91],[-2.37,.82,.91],[-2.40,.25,.87],[-2.40,.25,-.87]],black);
  box(.018,.014,1.81,V(-2.397,.775,0),tail);
  box(.022,.032,1.85,V(-2.389,.82,0),paint);
  surface([[-2.412,.69,-.88],[-2.412,.69,.88],[-2.437,.55,.60],[-2.437,.55,-.60]],paint);
  box(.025,.16,.31,V(-2.46,.585,0),alloy);
  box(.035,.028,.34,V(-2.477,.68,0),black);
  // Rear deck lip, four distinct exhaust bells and diffuser.
  box(.12,.025,1.87,V(-2.25,.885,0),paint);
  for(let z=-.74;z<=.75;z+=.245)box(.40,.16,.018,V(-2.2,.25,z),black);
  const nozzlePositions=[];
  for(const z of [-.67,-.27,.27,.67]){
    const n=mesh(new THREE.CylinderGeometry(.095,.12,.19,24,1,true),alloy);
    n.rotation.z=Math.PI/2;n.position.set(-2.43,.48,z);
    const hole=mesh(new THREE.CircleGeometry(.089,24),black);hole.rotation.y=-Math.PI/2;hole.position.set(-2.53,.48,z);
    nozzlePositions.push(V(-2.54,.48,z));
  }
  // Four belly nozzles coincide with the visible lift columns.
  const liftNozzles=[];
  for(const x of [-1.30,1.28])for(const z of [-.79,.79]){
    const p=V(x,.23,z);liftNozzles.push(p);
    const n=mesh(new THREE.CylinderGeometry(.075,.10,.10,20,1,true),alloy);n.position.copy(p);
  }
  // Recessed attitude-control ports used by the animated correction bursts.
  for(const x of [-1,1])for(const z of [-1,1]){
    const p=V(x*1.05,.72,z*1.015);
    const ring=mesh(new THREE.TorusGeometry(.055,.012,6,18),alloy);
    ring.position.copy(p);
    const hole=mesh(new THREE.CircleGeometry(.047,18),black);
    hole.position.copy(p).add(V(0,0,z*.004));if(z<0)hole.rotation.y=Math.PI;
  }
  for(const z of [-.65,.65]){
    const ring=mesh(new THREE.TorusGeometry(.043,.006,6,18),black);
    ring.rotation.y=Math.PI/2;ring.position.set(2.405,.37,z);
  }
  for(const x of [-1.48,1.48])for(const side of [-1,1]){
    const wheel=new THREE.Group();wheel.position.set(x,.385,side*1.015);car.add(wheel);wheels.push(wheel);
    const tire=mesh(new THREE.CylinderGeometry(.385,.385,.25,64),rubber,wheel);tire.rotation.x=Math.PI/2;
    const face=mesh(new THREE.CylinderGeometry(.303,.303,.27,48),black,wheel);face.rotation.x=Math.PI/2;
    const rim=mesh(new THREE.TorusGeometry(.303,.012,8,64),alloy,wheel);rim.position.z=side*.14;
    for(let i=0;i<5;i++){
      const blade=surface([[.055,.02,side*.147],[.16,.26,side*.147],[.27,.105,side*.147],[.11,-.035,side*.147]],alloy,wheel);
      blade.rotation.z=i*Math.PI*2/5;
      const spoke=box(.025,.52,.016,V(0,0,side*.157),black,wheel);spoke.rotation.z=i*Math.PI/5+.18;
    }
    const hub=mesh(new THREE.CylinderGeometry(.057,.057,.03,20),alloy,wheel);hub.rotation.x=Math.PI/2;hub.position.z=side*.15;
  }
  return {car,wheels,liftNozzles,rearNozzles:nozzlePositions};
}
