
const $ = id => document.getElementById(id);
const TYPES = [
 ['normal','Confetti normal'],['halloween','Morado y naranja'],
 ['web','Explosión de telarañas'],['webmix','Telarañas + confetti'],
 ['bats','Estallido de murciélagos'],['swirl','Remolino'],
 ['sparks','Chispas naranjas'],['smoke','Humo violeta']
];
const PALETTE=['#ff6500','#fb923c','#a855f7','#6d28d9'];
const NORMAL=['#ef4444','#10b981','#3b82f6','#fbbf24'];
let selected='halloween', paused=false;
const batImage=new Image();batImage.src='https://rourog.github.io/censo/assets/seasonal/bats.png';
const stages=['mainCanvas','aCanvas','bCanvas','cCanvas'].map(id=>({canvas:$(id),ctx:$(id).getContext('2d'),bursts:[],confetti:null}));
function dimensions(stage){
 const rect=stage.canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;
 if(stage.canvas.width!==Math.round(rect.width*dpr)||stage.canvas.height!==Math.round(rect.height*dpr)){
  stage.canvas.width=Math.round(rect.width*dpr);stage.canvas.height=Math.round(rect.height*dpr);
 }
 stage.ctx.setTransform(dpr,0,0,dpr,0,0);return {w:rect.width,h:rect.height};
}
function options(){return {type:selected,count:+$('count').value,duration:+$('duration').value,spread:+$('spread').value,x:.5,y:.6};}
function makeBurst(opt,w,h){
 const n=opt.type==='bats'?Math.max(5,Math.round(opt.count/8)):opt.type==='smoke'?Math.round(opt.count/5):opt.count;
 return {opt,start:performance.now(),particles:Array.from({length:n},(_,i)=>({
  angle:(Math.random()-.5)*opt.spread*Math.PI/180-Math.PI/2,
  speed:70+Math.random()*210,color:PALETTE[i%PALETTE.length],
  size:opt.type==='bats'?18+Math.random()*22:3+Math.random()*6,
  spin:Math.random()*Math.PI*2,red:i===0,phase:Math.random()*5
 }))};
}
function throwNative(stage,opt){
 if(!window.confetti){stage.bursts.push(makeBurst({...opt,type:'fallback'},0,0));return;}
 stage.confetti ||= window.confetti.create(stage.canvas,{resize:true,useWorker:false});
 stage.confetti({particleCount:opt.count,spread:opt.spread,origin:{x:opt.x,y:opt.y},
  colors:opt.type==='normal'?NORMAL:PALETTE,ticks:Math.round(opt.duration*60),
  startVelocity:32,disableForReducedMotion:!$('allowMotion').checked});
}
function renderBurst(stage,burst,now,w,h){
 const c=stage.ctx,opt=burst.opt,elapsed=(now-burst.start)/1000,t=Math.min(1,elapsed/opt.duration);
 const ox=opt.x*w,oy=opt.y*h,scale=Math.min(w/650,h/350,1),fade=Math.pow(1-t,1.2);
 c.save();c.globalAlpha=fade;
 if(opt.type==='web'||opt.type==='webmix'){
  const rays=14,radius=(70+opt.count*.55)*scale*(1-Math.pow(1-t,4));
  const tear=Math.max(0,(t-.48)/.52)*80*scale;
  c.lineWidth=1.2;c.strokeStyle=$('light').checked?'#6d28a0':'#f3e8ff';
  for(let i=0;i<rays;i++){
   const a=i*Math.PI*2/rays,dx=Math.cos(a)*tear,dy=Math.sin(a)*tear;
   c.beginPath();c.moveTo(ox+dx,oy+dy);c.lineTo(ox+dx+Math.cos(a)*radius,oy+dy+Math.sin(a)*radius);c.stroke();
   for(let ring=1;ring<=5;ring++){
    const r=radius*ring/5,b=(i+1)*Math.PI*2/rays;
    c.beginPath();c.moveTo(ox+dx+Math.cos(a)*r,oy+dy+Math.sin(a)*r);
    c.quadraticCurveTo(ox+dx+Math.cos((a+b)/2)*r*.84,oy+dy+Math.sin((a+b)/2)*r*.84,ox+dx+Math.cos(b)*r,oy+dy+Math.sin(b)*r);c.stroke();
   }
  }
  if(opt.type==='web'){c.restore();return;}
 }
 for(const p of burst.particles){
  let x=ox+Math.cos(p.angle)*p.speed*elapsed*scale,y=oy+Math.sin(p.angle)*p.speed*elapsed*scale+85*elapsed*elapsed*scale;
  if(opt.type==='swirl'){
   const r=t*(70+opt.count*.5)*scale,a=p.spin+elapsed*5;
   x=ox+Math.cos(a)*r;y=oy+Math.sin(a)*r*.65-t*80*scale;
  }
  if(opt.type==='smoke'){
   x=ox+Math.cos(p.spin)*t*100*scale;y=oy-t*(70+p.speed*.6)*scale;
   const r=(8+t*60)*scale,g=c.createRadialGradient(x,y,0,x,y,r);
   g.addColorStop(0,p.color+'66');g.addColorStop(1,p.color+'00');c.fillStyle=g;
   c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();continue;
  }
  c.save();c.translate(x,y);
  if(opt.type==='bats'){
   if(batImage.complete&&batImage.naturalWidth){
    c.imageSmoothingEnabled=false;const frame=Math.floor(elapsed*12+p.phase)%5;
    c.drawImage(batImage,frame*16,p.red?0:24,16,24,-p.size*scale/2,-p.size*scale*.75,p.size*scale,p.size*scale*1.5);
   }
  }else if(opt.type==='sparks'){
   c.strokeStyle=p.color;c.lineWidth=2*scale;c.beginPath();c.moveTo(0,0);c.lineTo(-Math.cos(p.angle)*12*scale,-Math.sin(p.angle)*12*scale);c.stroke();
  }else{
   c.rotate(p.spin+elapsed*5);c.fillStyle=opt.type==='fallback'&&selected==='normal'?NORMAL[Math.floor(p.spin)%4]:p.color;
   c.fillRect(-p.size*scale/2,-p.size*scale/2,p.size*scale,p.size*scale*.6);
  }c.restore();
 }c.restore();
}
function frame(now){
 for(const stage of stages){
  const {w,h}=dimensions(stage);
  if(stage.bursts.length){
   stage.ctx.clearRect(0,0,w,h);
   stage.bursts=stage.bursts.filter(b=>now-b.start<b.opt.duration*1000);
   for(const b of stage.bursts)renderBurst(stage,b,now,w,h);
   if(!stage.bursts.length)stage.ctx.clearRect(0,0,w,h);
  }
 }requestAnimationFrame(frame);
}
const seen=new Set();let channel=null;
try{channel=new BroadcastChannel('rourog-confetti-lab-v1');channel.onmessage=e=>receive(e.data);}catch{}
function clear(){
 for(const stage of stages){stage.confetti?.reset();stage.bursts=[];const {w,h}=dimensions(stage);stage.ctx.clearRect(0,0,w,h);}
}
function receive(event){
 if(!event||event.kind!=='confetti-demo'||seen.has(event.id))return;
 seen.add(event.id);if(seen.size>300)seen.delete(seen.values().next().value);
 clear();const opt=event.options;
 if(!TYPES.some(t=>t[0]===opt.type))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches&&!$('allowMotion').checked){
  $('status').textContent='Movimiento reducido: activa la casilla para probar animaciones.';return;
 }
 const active=$('multi').checked?stages:[stages[0]];
 for(const stage of active){
  dimensions(stage);
  if(opt.type==='normal'||opt.type==='halloween')throwNative(stage,opt);
  else stage.bursts.push(makeBurst(opt));
 }
 $('status').textContent=event.reason==='delete'?'Borrado de prueba recibido: un efecto por pantalla.':'Efecto: '+TYPES.find(t=>t[0]===opt.type)[1];
}
function emit(reason,opt=options()){
 const event={kind:'confetti-demo',id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random(),reason,options:opt};
 receive(event);channel?.postMessage(event);
}
$('effects').innerHTML=TYPES.map(([id,name])=>'<button type="button" data-effect="'+id+'" aria-pressed="'+(id===selected)+'">'+name+'</button>').join('');
for(const button of $('effects').children)button.onclick=()=>{
 selected=button.dataset.effect;
 for(const item of $('effects').children)item.setAttribute('aria-pressed',String(item===button));
 $('selectedName').textContent=TYPES.find(t=>t[0]===selected)[1];
};
for(const id of ['count','duration','spread'])$(id).oninput=()=>$(id+'Out').textContent=$(id).value+(id==='duration'?' s':id==='spread'?'°':'');
for(const id of ['count','duration','spread'])$(id).oninput();
$('launch').onclick=()=>emit('manual');$('delete').onclick=()=>emit('delete');$('clear').onclick=clear;
$('second').onclick=()=>window.open(location.href,'_blank','noopener');
$('light').onchange=()=>document.body.classList.toggle('light',$('light').checked);
$('multi').onchange=()=>{$('screens').hidden=!$('multi').checked;clear();};
$('mainCanvas').onpointerdown=e=>{
 const r=e.currentTarget.getBoundingClientRect();emit('manual',{...options(),x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height});
};
$('save').onclick=()=>{
 const text=JSON.stringify(options(),null,2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download='confetti-config.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
window.addEventListener('pagehide',()=>channel?.close());
requestAnimationFrame(frame);
