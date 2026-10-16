import * as THREE from './three.module.js';
import { flightControlAt } from './roadster-control.js';

export function createJets(scene,car,liftNozzles,rearNozzles) {
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);
  const envelope=(t,a,b,c,d)=>smooth(a,b,t)*(1-smooth(c,d,t));
  const vertexShader=`
    varying vec2 vUv;
    void main() { vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
  `;
  const fragmentShader=`
    varying vec2 vUv;
    uniform float time;
    uniform float power;
    uniform float seed;
    void main() {
      float s=vUv.y;
      float x=(vUv.x-.5)*2.;
      float flow=s*36.-time*17.+seed;
      float turbulence=sin(flow+x*13.)*.45+sin(flow*2.3-x*23.)*.2+sin(flow*.47+x*7.)*.35;
      float radius=.045+pow(s,.8)*.79;
      float drift=sin(s*19.-time*6.+seed)*s*.09;
      float edge=abs(x-drift)/max(.015,radius*(1.+turbulence*.17));
      float mist=exp(-edge*edge*3.8);
      float core=exp(-edge*edge*28.)*(1.-s)*.65;
      float fade=(1.-smoothstep(.62,1.,s))*smoothstep(0.,.012,s);
      float alpha=(mist*.47+core)*fade*power*(.84+.16*turbulence);
      gl_FragColor=vec4(mix(vec3(.69,.79,.87),vec3(.96,.98,1.),core+.35),alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  const jets=[];
  function add(origin,direction,type,index){
    const group=new THREE.Group();scene.add(group);group.visible=false;
    const material=new THREE.ShaderMaterial({uniforms:{time:{value:0},power:{value:0},seed:{value:index*2.13}},
      vertexShader,fragmentShader,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    // Crossed soft sheets give the continuous volume thickness from every view.
    for(let i=0;i<3;i++){
      const geometry=new THREE.PlaneGeometry(2,1,1,1);geometry.translate(0,.5,0);
      const sheet=new THREE.Mesh(geometry,material);sheet.rotation.y=i*Math.PI/3;sheet.renderOrder=2;group.add(sheet);
    }
    jets.push({group,material,origin,direction,type,index,carry:0,length:0,power:0});
  }
  liftNozzles.forEach((p,i)=>add(p,V(0,-1,0),'lift',i));
  rearNozzles.forEach((p,i)=>add(p,V(-1,0,0),'rear',i));
  add(V(-.8,.70,.98),V(0,0,1),'roll',0);
  add(V(.8,.70,-.98),V(0,0,-1),'roll',1);
  for(const x of [-1,1])for(const z of [-1,1]){
    add(V(x*1.05,.72,z*1.015),V(0,0,z),'trim',jets.filter(j=>j.type==='trim').length);
  }
  for(const z of [-.65,.65])add(V(2.405,.37,z),V(1,0,0),'front',z<0?0:1);
  const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=64;
  const ctx=textureCanvas.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(235,240,245,.8)');g.addColorStop(.3,'rgba(223,234,242,.55)');g.addColorStop(1,'rgba(215,230,240,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const texture=new THREE.CanvasTexture(textureCanvas);
  const particles=[];
  for(let i=0;i<360;i++){
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,color:0xe4eaf0}));
    sprite.visible=false;sprite.renderOrder=3;scene.add(sprite);
    particles.push({sprite,velocity:V(0,0,0),age:0,life:1,size:1,ground:false});
  }
  let next=0,landed=false;
  function emit(p,v,size,life,ground=false){
    const o=particles[next++%particles.length];o.sprite.visible=true;o.sprite.position.copy(p);o.velocity.copy(v);
    o.size=size;o.life=life;o.age=.02;o.ground=ground;o.sprite.material.rotation=Math.random()*6.28;
  }
  function update(dt,t,pilot=null){
    car.updateMatrixWorld(true);
    const surfaceY=pilot?.surfaceY??0;
    const control=flightControlAt(t);
    for(const jet of jets){
      const power=pilot?(jet.type==='lift'?pilot.throttle:0):jet.type==='lift'?control.lift[jet.index]:
        jet.type==='rear'?control.rear[jet.index]:
        jet.type==='trim'?control.trim[jet.index]:
        jet.type==='front'?control.front[jet.index]:
        jet.index===0?envelope(t,11.05,11.17,11.8,12.1):envelope(t,12.15,12.25,12.8,13);
      jet.power=power;jet.group.visible=power>.001;
      if(!jet.group.visible)continue;
      const origin=car.localToWorld(jet.origin.clone());
      const direction=jet.direction.clone().applyQuaternion(car.quaternion).normalize();
      let length=jet.type==='lift'?12.5:jet.type==='rear'?5.8:jet.type==='front'?4.8:4.4;
      // Throttling changes plume reach and width, not just transparency.
      length*=.22+.78*Math.sqrt(power);
      length*=.93+.07*Math.sin(t*33+jet.index);
      let groundHit=false;
      if(direction.y<-.2){
        const distance=Math.max(.06,(origin.y-surfaceY-.06)/-direction.y);
        if(distance<length){length=distance;groundHit=true;}
      }
      jet.length=length;
      jet.group.position.copy(origin);
      jet.group.quaternion.setFromUnitVectors(V(0,1,0),direction);
      const width=(jet.type==='lift'?.82:.48)*(.4+.6*Math.sqrt(power));
      jet.group.scale.set(width,length,width);
      jet.material.uniforms.time.value=t;jet.material.uniforms.power.value=Math.sqrt(power);
      jet.carry+=dt*(jet.type==='lift'?46:20)*power;
      while(jet.carry>=1){
        jet.carry--;
        const s=.1+Math.random()*.85,spread=s*.38;
        const p=origin.clone().addScaledVector(direction,length*s).add(V((Math.random()-.5)*spread,(Math.random()-.5)*spread,(Math.random()-.5)*spread));
        emit(p,direction.clone().multiplyScalar(5+Math.random()*7),.18+s*.6,.35+Math.random()*.45);
        if(groundHit){
          const angle=Math.random()*Math.PI*2;
          const hit=origin.clone().addScaledVector(direction,length);hit.y=surfaceY+.13;
          emit(hit,V(Math.cos(angle)*4,.3+Math.random()*.4,Math.sin(angle)*4),.6+Math.random()*.5,1.2+Math.random(),true);
        }
      }
    }
    if((pilot?pilot.landed:t>=16.55)&&!landed){
      landed=true;
      for(let i=0;i<55;i++){
        const a=Math.random()*Math.PI*2;
        emit(car.position.clone().add(V((Math.random()-.5)*3,.2,(Math.random()-.5)*2)),
          V(Math.cos(a)*4,.4+Math.random()*.6,Math.sin(a)*4),1+Math.random(),2+Math.random(),true);
      }
    }
    for(const p of particles){
      if(!p.sprite.visible)continue;
      p.age+=dt;if(p.age>=p.life){p.sprite.visible=false;continue;}
      p.sprite.position.addScaledVector(p.velocity,dt);
      p.sprite.position.y=Math.max(surfaceY+.09,p.sprite.position.y);
      p.velocity.multiplyScalar(Math.exp(-dt*(p.ground?.7:.2)));
      const size=p.size*(1+p.age*(p.ground?1.8:1.1));
      p.sprite.scale.set(size,p.ground?size*.55:size,size);
      p.sprite.material.opacity=(p.ground?.48:.5)*Math.min(1,p.age*18)*(1-p.age/p.life);
    }
  }
  function reset(time=0){
    next=0;landed=time>=16.55;
    for(const jet of jets){jet.group.visible=false;jet.carry=0;jet.power=0;}
    for(const p of particles)p.sprite.visible=false;
  }
  return {update,reset,jets};
}
