// Local export helper: records only the rendered scene plus its presentation HUD.
// It never captures the desktop, microphone, browser chrome, or other tabs.
export function installRecorder({canvas,replay,thrust,state}){
  const output=document.createElement('canvas');output.width=1280;output.height=720;
  const ctx=output.getContext('2d',{alpha:false});
  const panel=document.createElement('div');
  panel.style.cssText='position:fixed;z-index:99;top:12px;left:50%;transform:translateX(-50%);background:#17202b;padding:12px;color:white;border:1px solid #657587;font:12px Arial;display:flex;gap:12px;align-items:center';
  const start=document.createElement('button');start.textContent='Record flight video';
  const status=document.createElement('span');status.setAttribute('role','status');status.textContent='1280 × 720 · 30 fps · no audio';
  const download=document.createElement('a');download.hidden=true;download.textContent='Download flight video';download.style.color='#b4e0ff';
  panel.append(start,status,download);document.body.append(panel);
  let recorder=null,chunks=[],started=false,boosted=false,arrivedAt=null,watchdog=null,url=null;
  const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm'].find(type=>typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported(type));
  if(!mime||!output.captureStream){start.disabled=true;status.textContent='Video recording is unavailable in this browser';}
  function label(text,x,y,size=12,color='#cbd2dc',align='left'){
    ctx.fillStyle=color;ctx.font=`${size}px Arial`;ctx.textAlign=align;ctx.fillText(text,x,y);
  }
  function draw(){
    if(!started)return;
    const s=state();
    ctx.fillStyle='#030507';ctx.fillRect(0,0,1280,720);ctx.drawImage(canvas,0,0,1280,720);
    const fade=ctx.createLinearGradient(0,520,0,720);fade.addColorStop(0,'#03050700');fade.addColorStop(1,'#030507d9');ctx.fillStyle=fade;ctx.fillRect(0,520,1280,200);
    label('LX / EXPERIMENTS',50,42,11);label('FLIGHT STUDY — 01',1230,42,10,'#8c98a7','right');
    label('BEYOND THE ROAD.',50,99,10,'#9aa6b5');label('ROADSTER',48,148,44,'#eff3f8');
    label(s.phase.toUpperCase(),50,632,12);label(`${Math.max(0,s.height).toFixed(1)} M`,1230,620,26,'#e5ebf2','right');
    label('ALTITUDE',1230,640,9,'#8996a8','right');
    label('lqxiao.github.io',50,681,12,'#9ba9b9');
    label(s.moonLanded?'MOON REACHED':boosted?'HOLD THRUST → THE MOON':'A ROADSTER. A RAMP. THE MOON.',1230,681,11,'#bac9da','right');
    if(boosted&&!s.moonLanded){
      ctx.fillStyle='#a72b36cc';ctx.fillRect(1090,301,140,60);
      label('THRUST ACTIVE',1160,326,11,'#fff','center');label(`${Math.round(s.throttle*100)}%`,1160,347,12,'#f7d8dc','center');
    }
    if(s.moonLanded){
      label('BEYOND EARTH.',640,224,12,'#cad5e2','center');label('MOON LANDING',640,270,38,'#f2f5fa','center');
      if(arrivedAt===null)arrivedAt=s.elapsed;
    }
    if(!boosted&&s.elapsed>=13){boosted=true;thrust('capture',true);}
    status.textContent=`Recording · ${s.elapsed.toFixed(1)} s · ${s.phase}`;
    if(arrivedAt!==null&&s.elapsed-arrivedAt>=2.5)stop();
  }
  function stop(){
    if(!started)return;started=false;clearTimeout(watchdog);thrust('capture',false);
    if(recorder?.state==='recording')recorder.stop();status.textContent='Preparing download…';
  }
  start.addEventListener('click',()=>{
    try{
      if(url){URL.revokeObjectURL(url);url=null;}download.hidden=true;chunks=[];boosted=false;arrivedAt=null;
      const stream=output.captureStream(30);
      recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000});
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onstop=()=>{
        stream.getTracks().forEach(track=>track.stop());
        const blob=new Blob(chunks,{type:recorder.mimeType});url=URL.createObjectURL(blob);
        download.href=url;download.download='roadster-to-the-moon.'+(recorder.mimeType.includes('mp4')?'mp4':'webm');download.hidden=false;
        start.disabled=false;start.textContent='Record again';status.textContent=`Ready · ${(blob.size/1048576).toFixed(1)} MB · ${recorder.mimeType}`;
      };
      recorder.onerror=event=>{status.textContent='Recording failed: '+(event.error?.message??'unknown error');start.disabled=false;started=false;stream.getTracks().forEach(track=>track.stop());clearTimeout(watchdog);};
      start.disabled=true;started=true;replay();draw();recorder.start(1000);
      watchdog=setTimeout(stop,120000);
    }catch(error){started=false;start.disabled=false;status.textContent='Recording unavailable: '+error.message;}
  });
  return {draw,get active(){return started;}};
}
