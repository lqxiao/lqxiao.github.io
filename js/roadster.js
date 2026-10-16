import * as THREE from './three.module.js';
import { buildRoadster } from './roadster-car.js?v=8';
import { createJets } from './roadster-jets.js?v=12';
import { flightControlAt } from './roadster-control.js';
import { createPilot, stepPilot } from './roadster-pilot.js?v=11';
import { createRampContact } from './roadster-contact.js';
import { createMoon, updateMoonFlight, MOON } from './roadster-moon.js';

// Dimensions are in metres. The sequence is a visual interpretation, not telemetry.
const canvas = document.getElementById('flight');
const replay = document.getElementById('replay');
const phase = document.getElementById('phase');
const altitude = document.getElementById('altitude');
const clockLabel = document.getElementById('time');
const progress = document.getElementById('progress');
const pauseButton = document.getElementById('pause');
const timeline = document.getElementById('timeline');
const playhead = document.getElementById('playhead');
const viewButton = document.getElementById('view');
const viewHint = document.getElementById('view-hint');
const thrustButton=document.getElementById('thrust');
const thrustState=document.getElementById('thrust-state');
const moonArrival=document.getElementById('moon-arrival');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let videoCapture=null;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030507);
scene.fog = new THREE.FogExp2(0x030507, .006);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 240);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const range = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const materials = {
  white: new THREE.MeshPhysicalMaterial({ color: 0xe8ebed, metalness: .42, roughness: .27, clearcoat: 1, clearcoatRoughness: .17 }),
  carbon: new THREE.MeshStandardMaterial({ color: 0x0c1014, roughness: .4, metalness: .45 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x101d24, metalness: .65, roughness: .13, clearcoat: 1 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x101113, roughness: .88 }),
  alloy: new THREE.MeshStandardMaterial({ color: 0x9ea5ab, roughness: .26, metalness: .85 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x606b74, roughness: .53, metalness: .72 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x222a30, roughness: .6, metalness: .65 }),
  red: new THREE.MeshBasicMaterial({ color: 0xff202b }),
  light: new THREE.MeshBasicMaterial({ color: 0xd5efff })
};

function mesh(geometry, material, parent = scene) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function box(w, h, d, position, material, parent = scene) {
  const object = mesh(new THREE.BoxGeometry(w, h, d), material, parent);
  object.position.copy(position);
  return object;
}
function beam(a, b, radius, material, parent = scene) {
  const delta = b.clone().sub(a);
  const object = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 7), material, parent);
  object.position.copy(a).add(b).multiplyScalar(.5);
  object.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize());
  return object;
}
function panel(points, material, parent) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 1; i < points.length - 1; i++) positions.push(...points[0], ...points[i], ...points[i + 1]);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return mesh(geometry, material, parent);
}

const {car,wheels,liftNozzles,rearNozzles}=buildRoadster();
scene.add(car);

// Broad bent roadway. The same curve drives both the deck and tire contact.
const path=new THREE.CurvePath();
path.add(new THREE.CubicBezierCurve3(V(-13,0,0),V(-2,0,0),V(4,5,0),V(4,12,0)));
path.add(new THREE.CubicBezierCurve3(V(4,12,0),V(4,18,0),V(2.5,21,0),V(-3.5,21,0)));
const rampPoints=path.getSpacedPoints(160);
const rampContact=createRampContact(rampPoints);
const deckVertices=[], deckIndices=[];
for(let i=0;i<rampPoints.length;i++) {
  const p=rampPoints[i];
  deckVertices.push(p.x,p.y,-2.5,p.x,p.y,2.5);
  if(i<rampPoints.length-1) {
    const a=i*2; deckIndices.push(a,a+2,a+1,a+1,a+2,a+3);
  }
}
const deckGeometry=new THREE.BufferGeometry();
deckGeometry.setAttribute('position',new THREE.Float32BufferAttribute(deckVertices,3));
deckGeometry.setIndex(deckIndices);deckGeometry.computeVertexNormals();
const deckMaterial=new THREE.MeshStandardMaterial({
  color:0x3e4143,roughness:1,metalness:0,
  emissive:0x000000,side:THREE.DoubleSide
});
mesh(deckGeometry,deckMaterial);
// Red ribbons sit on the road-facing surface, outside the steel edge tubes.
// The old thin LED tubes were buried inside the larger steel tube geometry.
const redEdgeMaterial=new THREE.MeshBasicMaterial({color:0xe32932,side:THREE.DoubleSide});
for(const z of [-2.53,2.53]) {
  const railCurve=new THREE.CatmullRomCurve3(rampPoints.map(p=>V(p.x,p.y,z)));
  mesh(new THREE.TubeGeometry(railCurve,160,.055,6,false),materials.steel);
  const edgeVertices=[],edgeIndices=[],side=Math.sign(z);
  for(let i=0;i<rampPoints.length;i++){
    const p=rampPoints[i],tangent=path.getTangentAt(Math.min(i/160,.999999));
    const x=p.x-tangent.y*.025,y=p.y+tangent.x*.025;
    edgeVertices.push(x,y,side*2.37,x,y,side*2.49);
    if(i<160){const a=i*2;edgeIndices.push(a,a+2,a+1,a+1,a+2,a+3);}
  }
  const edgeGeometry=new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edgeVertices,3));
  edgeGeometry.setIndex(edgeIndices);edgeGeometry.computeVertexNormals();
  mesh(edgeGeometry,redEdgeMaterial);
}
const stripeMaterial=new THREE.MeshStandardMaterial({color:0xb6b9b8,roughness:.85,side:THREE.DoubleSide});
for(const z of [-1.65,1.65]) {
  const stripe=new THREE.CatmullRomCurve3(rampPoints.map(p=>V(p.x-.015,p.y+.018,z)));
  mesh(new THREE.TubeGeometry(stripe,160,.017,5,false),stripeMaterial);
}
// Rear steel lattice: columns, horizontal ties, and diagonal bracing.
for(const z of [-2.65,2.65]) {
  for(let y=0;y<21;y+=2.6) {
    const height=Math.min(y+2.6,21);
    beam(V(5.3,y,z),V(5.3,height,z),.07,materials.steel);
    beam(V(7.1,y,z),V(7.1,height,z),.07,materials.steel);
    beam(V(5.3,y,z),V(7.1,height,z),.045,materials.steel);
    beam(V(7.1,y,z),V(5.3,height,z),.045,materials.steel);
    beam(V(5.3,height,z),V(7.1,height,z),.06,materials.steel);
    beam(V(5.3,y,-2.65),V(5.3,y,2.65),.06,materials.steel);
  }
  for(let i=32;i<rampPoints.length;i+=10) {
    const p=rampPoints[i];
    beam(V(p.x,p.y,z),V(5.3,p.y,z),.055,materials.steel);
    if(p.y>3) beam(V(p.x,p.y,z),V(5.3,Math.max(0,p.y-2.6),z),.04,materials.steel);
  }
}
for(const x of [5.3,7.1]) for(const z of [-2.65,2.65]) box(1.2,.22,1.2,V(x,.02,z),materials.darkSteel);
for(let i=8;i<158;i+=8) {
  const p=rampPoints[i];
  beam(V(p.x+.04,p.y,-2.49),V(p.x+.04,p.y,2.49),.009,materials.darkSteel);
}

// Subtle ground texture and long runway fixtures, with no invented skyline.
const groundMapCanvas=document.createElement('canvas'); groundMapCanvas.width=groundMapCanvas.height=256;
const gc=groundMapCanvas.getContext('2d');
gc.fillStyle='#686b6b';gc.fillRect(0,0,256,256);
let seed=17;
function random() { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }
for(let i=0;i<18000;i++) {
  const v=70+random()*70;gc.fillStyle='rgba('+v+','+v+','+v+',.32)';
  gc.fillRect(random()*256,random()*256,1,1);
}
const groundMap=new THREE.CanvasTexture(groundMapCanvas);
groundMap.wrapS=groundMap.wrapT=THREE.RepeatWrapping;groundMap.repeat.set(60,60);
const ground=mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x363b40,map:groundMap,roughness:.63,metalness:.24}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.04;
for(const z of [-5.8,5.8]) {
  box(83,.055,.045,V(-13,.025,z),materials.red);
  for(let x=-53;x<28;x+=4) box(.18,.12,.23,V(x,.025,z),materials.darkSteel);
}
const roadLine=new THREE.MeshStandardMaterial({color:0x60676c,roughness:1});
for(let x=-70;x<28;x+=7) box(2.7,.008,.05,V(x,0,0),roadLine);

scene.add(new THREE.HemisphereLight(0xc7dcf5,0x14191e,1.4));
function flood(position,target,intensity,angle,shadow) {
  const light=new THREE.SpotLight(0xe5eeff,intensity,110,angle,.55,1.35);
  light.position.copy(position);light.target.position.copy(target);
  light.castShadow=shadow;
  if(shadow) { light.shadow.mapSize.set(2048,2048);light.shadow.bias=-.0002;light.shadow.normalBias=.035; }
  scene.add(light,light.target);return light;
}
flood(V(-13,25,17),V(-1,9,0),2200,.65,true);
flood(V(12,24,-12),V(0,10,0),2600,.65,false);
flood(V(-30,10,-7),V(-12,1,0),1100,.9,false);
const carFill=new THREE.PointLight(0xd8eaff,18,9,1.5);scene.add(carFill);
// Floodlight towers remain outside the launch path.
for(const [x,z] of [[15,-13],[-37,-14],[23,15]]) {
  beam(V(x,0,z),V(x,13,z),.09,materials.darkSteel);
  box(1.8,.38,.45,V(x,13,z),materials.darkSteel);
  for(let i=0;i<4;i++) box(.30,.24,.04,V(x-.65+i*.43,13,z+.24),materials.light);
}
// Background equipment establishes scale without competing with the ramp.
for(const [x,z,w] of [[18,-30,8],[31,-35,12],[-30,-37,10]]) {
  box(w,2.1,3.5,V(x,1.05,z),materials.darkSteel);
}

const moon=createMoon(scene);
const exhaust=createJets(scene,car,liftNozzles,rearNozzles);

const rollStart=new THREE.Quaternion().setFromAxisAngle(V(0,0,1),Math.PI);
const rollEnd=rollStart.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI));
const duration=23;
let elapsed=0, playing=!reduced.matches, last=0, lastPhase='';
let pendingSeek=null, freeView=false, rebuilding=false;
let pilot=null;
let touchdownTime=null,touchdownX=0;
const thrustInputs=new Set();
const orbit=new THREE.Spherical(15,1.25,-.75);
let orbitFov=42;
const pointers=new Map();
let pinchDistance=0, pointerStart=null, dragged=false;
function syncPlayback(){
  pauseButton.textContent=playing?'Pause':elapsed>=flightEnd()?'Play again':'Play';
  pauseButton.setAttribute('aria-label',playing?'Pause flight':'Play flight');
}
function syncTimeline(){
  const end=Math.max(duration,elapsed,Number.isFinite(flightEnd())?flightEnd():elapsed);
  timeline.max=end.toFixed(2);
  timeline.value=elapsed.toFixed(2);
  timeline.setAttribute('aria-valuetext',elapsed.toFixed(1)+' seconds');
  playhead.textContent=elapsed.toFixed(1).padStart(4,'0')+' / '+(pilot&&!pilot.landed?'LIVE':end.toFixed(1));
}
function flightEnd(){return pilot?(pilot.landed?touchdownTime+6.4:Infinity):duration;}
function setPhase(value) { if(!rebuilding&&lastPhase!==value){phase.textContent=value;lastPhase=value;} }
// Continuous height and velocity: depart, gain downward speed, then brake to ground.
const descentKeys=[
  [10,21,-.25],[11.1,19.2,-3],[13,11.8,-4.6],[15.55,1.2,-2.4],[16.6,0,0]
];
function descentHeight(time){
  if(time<=10)return 21;
  if(time>=16.6)return 0;
  const i=descentKeys.findIndex((key,index)=>index<descentKeys.length-1&&time<descentKeys[index+1][0]);
  const [a,y0,v0]=descentKeys[i],[b,y1,v1]=descentKeys[i+1],d=b-a,u=(time-a)/d;
  return (2*u**3-3*u*u+1)*y0+(u**3-2*u*u+u)*d*v0+
    (-2*u**3+3*u*u)*y1+(u**3-u*u)*d*v1;
}
function pose(t) {
  car.quaternion.identity();car.position.set(-22,0,0);
  if(t<3) {
    car.position.x=mix(-22,-13,range(t,.8,3)**2);
    if(car.position.x>-15.5)rampContact.place(car.position,car.quaternion);
    setPhase('Approach');
  } else if(t<10) {
    const u=smooth(range(t,3,10));
    const point=path.getPointAt(u), tangent=path.getTangentAt(Math.min(u,.999999));
    car.position.copy(point);
    car.rotation.z=Math.atan2(tangent.y,tangent.x);
    rampContact.place(car.position,car.quaternion);
    setPhase(u>.84?'Inverted exit':'Ramp climb');
  } else if(t<16.6) {
    const u=smooth(range(t,10,16.6));
    car.position.set(mix(-3.5,-14.5,u),descentHeight(t),0);
    car.quaternion.slerpQuaternions(rollStart,rollEnd,smooth(range(t,11.1,13)));
    setPhase(t<11.1?'Ramp departure':t<13?'Attitude correction':t<15.55?'Controlled descent':'Landing burn');
  } else {
    const u=range(t,17.1,22);
    car.position.set(-14.5-15*smooth(u),0,0);
    car.quaternion.copy(rollEnd);
    setPhase(t<17.5?'Touchdown':t<22?'Rollout':'Flight complete');
  }
  if(t>=13&&t<16.6){
    const control=flightControlAt(t);
    const {roll,pitch,yaw}=control.attitude;
    // Apply body-local corrections so fixed nozzles follow the same attitude.
    car.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(roll,yaw,pitch,'YXZ')));
    car.position.z+=control.offsetZ;
  }
  for(const wheel of wheels) wheel.rotation.z=t<10?-t*3:t>17?t*2:0;
  if(pilot){
    car.position.set(pilot.x,pilot.height,pilot.z);
    car.quaternion.slerpQuaternions(pilot.startAttitude,pilot.endAttitude,smooth(range(pilot.time,pilot.attitudeTime,pilot.attitudeTime+.9)));
    if(!pilot.landed)setPhase(pilot.throttle>.1?'Thrust active':pilot.velocity>0?'Coasting':'Descent');
    if(pilot.landed&&!pilot.moonLanded){
      car.quaternion.copy(pilot.endAttitude);
      const travel=15*smooth(range(t,touchdownTime+.5,touchdownTime+5.4));
      car.position.x=touchdownX+travel*pilot.forward.x;
      car.position.z=pilot.z+travel*pilot.forward.z;
      if(Math.abs(car.position.z)<1.3){
        const contact=rampContact.clearances(car.position,car.quaternion).filter(c=>c.onRoad).sort((a,b)=>a.gap-b.gap)[0];
        if(contact&&contact.gap<0){
          car.quaternion.setFromAxisAngle(V(0,0,1),Math.atan2(contact.s.ty,contact.s.tx)).multiply(pilot.endAttitude);
          rampContact.place(car.position,car.quaternion);
        }
      }
      setPhase(t<touchdownTime+.9?(pilot.impact<=2.5?'Soft touchdown':'Hard touchdown'):t<touchdownTime+5.4?'Rollout':'Flight complete');
    }else if(!pilot.landed){
      // Attitude changes can move a wheel into the deck even at a fixed origin.
      // Resolve again with the final rendered orientation, not just last frame's.
      rampContact.resolve(pilot,{x:pilot.x,height:pilot.height,z:pilot.z},car.quaternion);
      car.position.set(pilot.x,pilot.height,pilot.z);
    }
    if(pilot.lunar){
      setPhase(pilot.moonLanded?'Moon landing complete':pilot.lunar.phase==='landing'?'Lunar approach · landing assist':'To the Moon');
      if(pilot.moonLanded){car.quaternion.copy(pilot.endAttitude);for(const wheel of wheels)wheel.rotation.z=0;}
    }
  }
  carFill.position.copy(car.position).add(V(-1,3,3));
  if(!rebuilding){
    altitude.textContent=Math.max(0,car.position.y).toFixed(1);
    clockLabel.textContent=t.toFixed(1).padStart(4,'0');
    progress.style.transform='scaleX('+clamp(t/(Number.isFinite(flightEnd())?flightEnd():Math.max(duration,t+1)),0,1)+')';
  }
}

// Deliberate camera cuts: rear three-quarter approach, full ramp, flight, landing.
function cameraAt(t) {
  scene.fog.density=.006/(1+Math.max(0,car.position.y-21)/36);
  camera.far=Math.max(3000,car.position.y*5+240);
  if(freeView){
    const target=car.position.clone().add(V(0,.55,0));
    camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(orbit));
    camera.position.y=Math.max(.3,camera.position.y);
    camera.lookAt(target);camera.fov=orbitFov;camera.updateProjectionMatrix();
    return;
  }
  const portrait=innerWidth<620;
  let position,target,fov;
  if(pilot){
    const delta=car.position.clone().sub(pilot.startPosition);
    target=pilot.startTarget.clone().add(delta);
    position=pilot.startCamera.clone().add(delta);
    const distance=1+Math.max(0,pilot.height-pilot.startPosition.y)/36;
    position.sub(target).multiplyScalar(distance).add(target);
    fov=pilot.startFov;
  }else if(t<3) {
    position=portrait?V(-35,18,54):V(-29,15.5,40);
    target=V(-7,10.3,0);fov=portrait?58:43;
  } else if(t<10.4) {
    const u=smooth(range(t,3,10.4));
    position=portrait?V(-35,15+u*3,54):V(-29,12.5+u*3,40);
    target=V(-2,10.3,0);fov=portrait?54:39;
  } else if(t<14) {
    // Hold a world-space shot so the descent reads against the stationary ramp.
    position=portrait?V(-32,17,42):V(-26,16,30);
    target=V(-7,12,0);fov=portrait?59:43;
  } else if(t<17.6) {
    position=portrait?V(-40,9,44):V(-32,8,30);
    target=V(-12,mix(6,3,smooth(range(t,14,17.6))),0);fov=portrait?66:43;
  } else {
    const u=smooth(range(t,17.6,23));
    position=car.position.clone().add(V(-8.5,2.6,9));
    target=car.position.clone().add(V(.1,.5,0));fov=portrait?56:39-u*3;
  }
  if(pilot){
    const space=smooth(range(pilot.height,35,110));
    position.lerp(car.position.clone().add(V(-15,12,28)),space);
    target.lerp(car.position.clone().add(V(0,1,-5)),space);
    fov=mix(fov,portrait?58:46,space);
  }
  camera.far=Math.max(camera.far,position.distanceTo(car.position)*2+100);
  camera.position.copy(position);camera.lookAt(target);camera.fov=fov;camera.updateProjectionMatrix();
}
function render(){renderer.render(scene,camera);videoCapture?.draw();}
function resize(){
  renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
  camera.aspect=canvas.clientWidth/canvas.clientHeight;
  cameraAt(elapsed);render();
}
function replayFlight(){
  moon.reset();moonArrival.hidden=true;
  pilot=null;touchdownTime=null;releaseThrust();
  updateViewHint();
  elapsed=0;playing=true;last=0;pendingSeek=null;exhaust.reset();
  syncPlayback();syncTimeline();
  pose(0);cameraAt(0);render();
}
function seek(time){
  moon.reset();moonArrival.hidden=true;
  pilot=null;touchdownTime=null;releaseThrust();updateViewHint();
  elapsed=clamp(time,0,duration);playing=false;last=0;
  // Reconstruct the recent plume history, including touchdown fog, when scrubbing.
  const start=Math.max(0,elapsed-3.6);
  exhaust.reset(start);rebuilding=true;
  for(let t=start;t<elapsed;){
    const dt=Math.min(1/30,elapsed-t);t+=dt;pose(t);exhaust.update(dt,t);
  }
  rebuilding=false;pose(elapsed);exhaust.update(0,elapsed);
  cameraAt(elapsed);syncPlayback();syncTimeline();render();
}
function queueSeek(time){
  pendingSeek=clamp(Number(time),0,duration);playing=false;releaseThrust();syncPlayback();
}
function togglePlayback(){
  if(pendingSeek!==null){seek(pendingSeek);pendingSeek=null;}
  if(elapsed>=flightEnd()){replayFlight();return;}
  playing=!playing;last=0;if(!playing)releaseThrust();syncPlayback();
}
function updateViewHint(){
  if(pilot?.lunar){
    const complete=pilot.moonLanded,landing=pilot.lunar.phase==='landing';
    viewHint.textContent=complete?'Moon reached · Drag to explore · Replay flight to return':landing?'Lunar landing assist · approaching the surface':'Keep holding thrust to reach the Moon · '+Math.max(0,MOON.approach-pilot.height).toFixed(0)+' m to approach';
    thrustState.textContent=complete?'Moon reached ✓':landing?'Landing assist active':'Lunar ascent · hold to continue';
    return;
  }
  viewHint.textContent=pilot&&!pilot.landed?
    'Hold Space / thrust · '+pilot.velocity.toFixed(1)+' m/s · P to pause':
    pilot?.landed?'Touchdown '+pilot.impact.toFixed(1)+' m/s · Hold thrust to lift off again':
    'Keep holding thrust to reach the Moon · P to pause · Drag to orbit';
  thrustState.textContent=thrustInputs.size?'Thrust '+Math.round((pilot?.throttle??0)*100)+'%':pilot?.landed?'Hold to lift off again':'Available anytime · unlimited';
}
function releaseThrust(){
  thrustInputs.clear();thrustButton.setAttribute('aria-pressed','false');
}
function setThrust(key,down){
  if(pilot?.moonLanded)return;
  if(down){
    if(pendingSeek!==null){seek(pendingSeek);pendingSeek=null;}
    if(!pilot||pilot.landed)engageThrust();
    if(!playing){playing=true;last=0;syncPlayback();}
  }
  if(down)thrustInputs.add(key);else thrustInputs.delete(key);
  thrustButton.setAttribute('aria-pressed',String(thrustInputs.size>0));
}
function engageThrust(){
  const position=car.position.clone(),attitude=car.quaternion.clone();
  const forward=V(1,0,0).applyQuaternion(attitude);forward.y=0;
  if(forward.lengthSq()<.01)forward.set(elapsed<8?1:-1,0,0);else forward.normalize();
  let velocity=forward.clone().multiplyScalar(1.8);
  if(!pilot&&elapsed<duration){
    const a=Math.max(0,elapsed-.001),b=Math.min(duration,elapsed+.001);
    rebuilding=true;pose(a);const from=car.position.clone();pose(b);
    velocity.copy(car.position).sub(from).divideScalar(b-a);pose(elapsed);rebuilding=false;
  }
  const initialThrottle=pilot?0:flightControlAt(elapsed).lift.reduce((sum,p)=>sum+p,0)/4;
  pilot=createPilot(Math.max(0,position.y),velocity.y,initialThrottle);
  Object.assign(pilot,{
    x:position.x,z:position.z,vx:velocity.x,vz:velocity.z,forward,
    startAttitude:attitude,attitudeTime:0,endAttitude:new THREE.Quaternion().setFromAxisAngle(V(0,1,0),Math.atan2(-forward.z,forward.x)),
    startPosition:position,startCamera:camera.position.clone(),startFov:camera.fov,
    startTarget:camera.position.clone().addScaledVector(camera.getWorldDirection(V(0,0,0)),camera.position.distanceTo(position))
  });
  touchdownTime=null;exhaust.reset();
}
function setFreeView(enabled){
  if(enabled&&!freeView){
    const target=car.position.clone().add(V(0,.55,0));
    orbit.setFromVector3(camera.position.clone().sub(target));
    orbit.radius=clamp(orbit.radius,5,75);orbit.phi=clamp(orbit.phi,.15,Math.PI-.15);
    orbitFov=camera.fov;
  }
  freeView=enabled;
  viewButton.textContent=freeView?'Follow camera':'Free view';
  viewButton.setAttribute('aria-pressed',String(freeView));
  updateViewHint();
  cameraAt(elapsed);render();
}
function zoom(factor){
  if(!freeView)setFreeView(true);
  orbit.radius=clamp(orbit.radius*factor,5,75);cameraAt(elapsed);render();
}
replay.addEventListener('click',replayFlight);
thrustButton.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  event.preventDefault();thrustButton.setPointerCapture(event.pointerId);setThrust('pointer'+event.pointerId,true);
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])thrustButton.addEventListener(type,event=>setThrust('pointer'+event.pointerId,false));
thrustButton.addEventListener('contextmenu',event=>event.preventDefault());
thrustButton.addEventListener('keydown',event=>{
  if(event.code==='Enter'){event.preventDefault();setThrust('enter',true);}
});
thrustButton.addEventListener('keyup',event=>{
  if(event.code==='Enter'){event.preventDefault();setThrust('enter',false);}
});
thrustButton.addEventListener('blur',releaseThrust);
pauseButton.addEventListener('click',togglePlayback);
timeline.addEventListener('input',()=>queueSeek(timeline.value));
viewButton.addEventListener('click',()=>setFreeView(!freeView));
document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>queueSeek(button.dataset.time)));
canvas.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  canvas.focus({preventScroll:true});
  canvas.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size===1){pointerStart={x:event.clientX,y:event.clientY};dragged=false;}
  if(pointers.size===2){
    const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);
  }
});
canvas.addEventListener('pointermove',event=>{
  const previous=pointers.get(event.pointerId);if(!previous)return;
  const next={x:event.clientX,y:event.clientY};pointers.set(event.pointerId,next);
  if(pointers.size===2){
    const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);
    if(distance>0&&pinchDistance>0)zoom(pinchDistance/distance);
    pinchDistance=distance;dragged=true;
  }else if(pointers.size===1){
    if(!dragged&&pointerStart&&Math.hypot(next.x-pointerStart.x,next.y-pointerStart.y)<4)return;
    dragged=true;canvas.classList.add('dragging');
    if(!freeView)setFreeView(true);
    orbit.theta-=(next.x-previous.x)*.006;
    orbit.phi=clamp(orbit.phi-(next.y-previous.y)*.006,.15,Math.PI-.15);
    cameraAt(elapsed);render();
  }
});
function releasePointer(event){
  pointers.delete(event.pointerId);pinchDistance=0;
  if(!pointers.size){pointerStart=null;canvas.classList.remove('dragging');}
}
canvas.addEventListener('pointerup',releasePointer);
canvas.addEventListener('pointercancel',releasePointer);
canvas.addEventListener('lostpointercapture',releasePointer);
canvas.addEventListener('wheel',event=>{
  event.preventDefault();
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1);
  zoom(Math.exp(clamp(delta,-150,150)*.002));
},{passive:false});
addEventListener('keydown',event=>{
  if(event.code==='Space'&&(event.target===canvas||event.target===document.body||event.target===thrustButton)){
    event.preventDefault();setThrust('space',true);return;
  }
  if(event.target!==canvas&&event.target!==document.body)return;
  if(event.code==='KeyP'){event.preventDefault();togglePlayback();}
  if(event.code==='ArrowLeft'||event.code==='ArrowRight'){
    event.preventDefault();queueSeek((pendingSeek??elapsed)+(event.code==='ArrowLeft'?-.25:.25));
  }
  if(event.code==='Escape'&&freeView)setFreeView(false);
});
addEventListener('keyup',event=>{if(event.code==='Space'){setThrust('space',false);}});
addEventListener('blur',()=>{if(videoCapture?.active)return;releaseThrust();playing=false;last=0;syncPlayback();});
addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&!videoCapture?.active){releaseThrust();playing=false;syncPlayback();}});
renderer.domElement.addEventListener('webglcontextlost',event=>{
  event.preventDefault();playing=false;syncPlayback();document.getElementById('error').hidden=false;
});
renderer.domElement.addEventListener('webglcontextrestored',()=>{
  document.getElementById('error').hidden=true;replayFlight();
});
function frame(now){
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(pendingSeek!==null){const time=pendingSeek;pendingSeek=null;seek(time);}
  if(playing&&(!document.hidden||videoCapture?.active)) {
    const step=Math.min(dt,flightEnd()-elapsed);
    elapsed+=step;
    if(pilot&&!pilot.landed){
      if(pilot.lunar?.phase!=='landing'){
      const up=V(0,1,0).applyQuaternion(car.quaternion);
      stepPilot(pilot,step,thrustInputs.size>0,up,(state,previous)=>rampContact.resolve(state,previous,car.quaternion));
      if(pilot.rampContact){
        const contact=pilot.rampContact;
        pilot.startAttitude.setFromAxisAngle(V(0,0,1),Math.atan2(contact.ty,contact.tx));
        pilot.attitudeTime=pilot.time;
        // Keep the wheels driving along the road while they remain in contact.
        const speed=pilot.vx*contact.tx+pilot.velocity*contact.ty;
        const drive=Math.max(0,4-speed)*Math.min(1,step*8);
        pilot.vx+=contact.tx*drive;pilot.velocity+=contact.ty*drive;
        const position=V(pilot.x,pilot.height,pilot.z);
        rampContact.place(position,pilot.startAttitude);
        pilot.x=position.x;pilot.height=position.y;
      }
      }
      updateMoonFlight(pilot,step,thrustInputs.size>0);
      if(pilot.landed){
        touchdownTime=elapsed;
        touchdownX=pilot.x;
        releaseThrust();
        if(pilot.moonLanded){moon.flag.visible=true;moonArrival.hidden=false;}
      }
    }
    pose(elapsed);cameraAt(elapsed);exhaust.update(step,elapsed,pilot);syncTimeline();updateViewHint();render();
    if(elapsed>=flightEnd()){playing=false;releaseThrust();syncPlayback();}
  }
  requestAnimationFrame(frame);
}
pose(0);resize();syncPlayback();syncTimeline();
for(const element of [replay,pauseButton,timeline,viewButton,thrustButton,...document.querySelectorAll('[data-time]')])element.disabled=false;
if(reduced.matches)setPhase('Ready to replay');
requestAnimationFrame(frame);
// Recording controls are only loaded for a local, explicitly requested export.
if(new URLSearchParams(location.search).has('capture')){
  import('./roadster-recorder.js').then(({installRecorder})=>{
    videoCapture=installRecorder({canvas,replay:replayFlight,thrust:setThrust,
      state:()=>({elapsed,phase:lastPhase,height:car.position.y,throttle:pilot?.throttle??0,moonLanded:!!pilot?.moonLanded})});
  });
}
