// Deterministic choreography shared by vehicle attitude and visible exhaust.
// These timings describe the recreation, not the real vehicle's control software.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,t)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u);};
const gate=(t,a,b,c,d)=>smooth(a,b,t)*(1-smooth(c,d,t));
const corrections=[
  {start:13.10,duration:.82,axis:'roll',sign:1,angle:.055},
  {start:13.75,duration:1.00,axis:'pitch',sign:-1,angle:.065},
  {start:14.20,duration:.84,axis:'yaw',sign:1,angle:.045},
  {start:14.65,duration:.86,axis:'roll',sign:-1,angle:.058},
  {start:15.22,duration:.95,axis:'pitch',sign:1,angle:.052},
  {start:15.62,duration:.74,axis:'yaw',sign:-1,angle:.028}
];

export function flightControlAt(t){
  const attitude={roll:0,pitch:0,yaw:0};
  const demand={roll:0,pitch:0,yaw:0};
  for(const event of corrections){
    const u=(t-event.start)/event.duration;
    if(u<=0||u>=1)continue;
    // Each small excursion has a correcting burst and a counter-burst to settle.
    attitude[event.axis]+=event.sign*event.angle*Math.sin(Math.PI*u)**2;
    demand[event.axis]+=event.sign*Math.cos(2*Math.PI*u)*gate(u,0,.07,.90,1);
  }
  const airborne=gate(t,12.55,13,16.40,16.65);
  const descent=smooth(12.8,13.1,t);
  const braking=smooth(15.55,16.08,t);
  const base=.70-.34*descent+.58*braking;
  const lift=[];
  for(const x of [-1,1])for(const z of [-1,1]){
    const balance=-z*demand.roll*.24+x*demand.pitch*.24;
    const stagger=.055*Math.sin(t*14+x*1.7+z*2.1);
    lift.push(airborne*clamp(base+balance+stagger,.08,1));
  }
  const trim=[];
  for(const x of [-1,1])for(const z of [-1,1]){
    trim.push(airborne*clamp(-z*demand.roll*.72+x*z*demand.yaw*.86,0,.95));
  }
  const departure=gate(t,10,10.15,11.1,11.5);
  const forward=gate(t,14.02,14.10,14.24,14.42)*.62;
  const aft=gate(t,14.62,14.70,14.86,15.02)*.74;
  const front=gate(t,15.48,15.55,15.68,15.86)*.75;
  return {
    attitude,lift,trim,
    rear:[0,1,2,3].map(i=>clamp(departure+aft*(i%2?.85:1))),
    front:[forward+front,forward+front],
    offsetZ:.13*attitude.roll/.055+.08*attitude.yaw/.045
  };
}
