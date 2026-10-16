import * as THREE from './three.module.js';

// A compressed, playful lunar destination, not a scale model of spaceflight.
export const MOON={x:515,y:200,z:-1000,radius:55,surface:255,approach:295};
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;

export function createMoon(scene){
  const group=new THREE.Group();group.position.set(MOON.x,MOON.y,MOON.z);scene.add(group);
  let seed=29;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const craters=Array.from({length:34},()=>({direction:new THREE.Vector3(random()*2-1,random()*2-1,random()*2-1).normalize(),radius:.045+random()*.15}));
  const geometry=new THREE.SphereGeometry(MOON.radius,96,64),positions=geometry.attributes.position,colors=[];
  for(let i=0;i<positions.count;i++){
    const n=new THREE.Vector3().fromBufferAttribute(positions,i).normalize();
    let elevation=0;
    for(const crater of craters){
      const d=n.distanceTo(crater.direction)/crater.radius;
      elevation+=(-.7*Math.exp(-d*d*3)+.27*Math.exp(-(((d-.85)*6)**2)))*crater.radius*8;
    }
    // Keep a small, level polar cap for the wheels to land on.
    elevation*=1-smooth((n.y-.96)/.035);
    positions.setXYZ(i,n.x*(MOON.radius+elevation),n.y*(MOON.radius+elevation),n.z*(MOON.radius+elevation));
    const maria=Math.sin(n.x*9+n.z*5)*Math.cos(n.y*7-n.z*4);
    const grain=.025*Math.sin(n.x*240+n.y*178+n.z*131);
    const value=.53+.10*maria+grain+elevation*.07;
    colors.push(value*.97,value,value*1.04);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  const material=new THREE.ShaderMaterial({vertexColors:true,
    vertexShader:'varying vec3 vNormal; varying vec3 vColor; void main(){vNormal=normal;vColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 vNormal; varying vec3 vColor; void main(){float light=.19+.97*max(0.,dot(normalize(vNormal),normalize(vec3(-.5,.7,.8))));gl_FragColor=vec4(vColor*light,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
  });
  group.add(new THREE.Mesh(geometry,material));
  const pad=new THREE.Mesh(new THREE.CircleGeometry(7,48),new THREE.MeshStandardMaterial({color:0x777b80,roughness:1,emissive:0x34383d,emissiveIntensity:.35,fog:false}));
  pad.rotation.x=-Math.PI/2;pad.position.y=MOON.radius+.005;group.add(pad);
  const flag=new THREE.Group();flag.position.set(5,MOON.radius,0);flag.visible=false;group.add(flag);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,3.6,8),new THREE.MeshBasicMaterial({color:0x929ca6}));pole.position.y=1.8;flag.add(pole);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.9),new THREE.MeshBasicMaterial({color:0xe73743,side:THREE.DoubleSide}));cloth.position.set(.9,3.1,0);flag.add(cloth);
  const starPositions=[];
  for(let i=0;i<650;i++){starPositions.push((random()-.35)*2600,100+random()*1600,-500-random()*1500);}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  const stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xcbd8ec,size:1.5,sizeAttenuation:true,transparent:true,opacity:.5,fog:false}));scene.add(stars);
  return {flag,stars,reset(){flag.visible=false;}};
}

export function updateMoonFlight(state,dt,pressed){
  if(!state.lunar&&state.height>=45&&!state.landed)state.lunar={phase:'ascent',x:state.x,z:state.z,time:0};
  if(!state.lunar)return;
  const route=state.lunar;
  if(route.phase==='ascent'){
    const u=smooth((state.height-45)/(MOON.approach-45));
    state.x=mix(route.x,MOON.x,u);state.z=mix(route.z,MOON.z+MOON.radius+100,u);state.vx=state.vz=0;
    if(state.height>=MOON.approach&&pressed){route.phase='landing';route.height=state.height;route.time=0;}
  }else if(route.phase==='landing'){
    route.time+=dt;const u=smooth(route.time/7),before=state.height;
    state.x=MOON.x;state.z=mix(MOON.z+MOON.radius+100,MOON.z,u);
    state.height=mix(route.height,MOON.surface,u);state.velocity=dt>0?(state.height-before)/dt:0;
    state.throttle=.32+.38*Math.sin(Math.PI*u);state.time+=dt;
    const offset=state.z-MOON.z;
    state.surfaceY=Math.abs(offset)<MOON.radius?MOON.y+Math.sqrt(MOON.radius**2-offset**2):0;
    if(route.time>=7){
      route.phase='landed';state.moonLanded=true;state.landed=true;state.height=MOON.surface;
      state.velocity=state.vx=state.vz=state.throttle=0;state.impact=0;state.surfaceY=MOON.surface;
    }
  }
}
