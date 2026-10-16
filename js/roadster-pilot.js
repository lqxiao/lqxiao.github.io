// User thrust inherits the current flight's height and velocity without a reset.
export function createPilot(height,velocity,throttle=0){
  return {height,velocity,throttle,time:0,landed:false,impact:0,airborne:height>.02};
}
export function stepPilot(state,dt,pressed,up={x:0,y:1,z:0},resolveContact=null){
  if(state.landed)return state;
  state.rampContact=null;
  // Fixed-size substeps keep thrust and touchdown consistent at different frame rates.
  let remaining=Math.max(0,Math.min(dt,.1));
  while(remaining>1e-8&&!state.landed){
    const h=Math.min(remaining,1/120);remaining-=h;state.time+=h;
    const previous={x:state.x,height:state.height,z:state.z};
    const target=pressed?1:0;
    state.throttle+=(target-state.throttle)*(1-Math.exp(-h/0.12));
    state.velocity+=(17*state.throttle*up.y-9.81)*h;
    if(state.x!==undefined){
      state.vx+=17*state.throttle*up.x*h;state.vz+=17*state.throttle*up.z*h;
      state.x+=state.vx*h;state.z+=state.vz*h;
    }
    state.height+=state.velocity*h;
    if(resolveContact)resolveContact(state,previous);
    if(state.height>.02)state.airborne=true;
    if(state.height<=0){
      state.height=0;state.impact=Math.abs(state.velocity);state.velocity=0;
      if(state.airborne||!pressed){state.throttle=0;state.landed=true;}
    }
  }
  return state;
}
