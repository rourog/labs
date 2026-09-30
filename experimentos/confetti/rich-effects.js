// Laboratory adapters. See vendor/NOTICE.md for original authors and licenses.
(() => {
 let definitions;
 const states=new WeakMap();
 function state(stage){
  let s=states.get(stage);if(s)return s;
  const frame=document.createElement('iframe');frame.className='fireworks-frame';frame.title='Fuegos artificiales de Caleb Miller';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;frame.hidden=true;
  const layer=document.createElement('div');layer.className='balloon-layer';layer.setAttribute('aria-hidden','true');
  s={frame,layer,animations:[],version:0,ready:null};states.set(stage,s);
  stage.canvas.parentElement.append(frame,layer);return s;
 }
 function prepare(stage){
  const s=state(stage);
  s.ready ||= new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('No se pudo cargar el motor de fuegos artificiales.')),8000);
   s.frame.onload=()=>{clearTimeout(timeout);if(s.frame.contentWindow?.labFireworks)resolve(s.frame.contentWindow.labFireworks);else reject(Error('Motor de fuegos artificiales no disponible.'));};
   s.frame.src='vendor/caleb/frame.html?v=3';
  });return s.ready;
 }
 function clear(stage){const s=states.get(stage);if(!s)return;s.version++;s.frame.contentWindow?.labFireworks?.clear();s.frame.hidden=true;for(const a of s.animations)a.cancel();s.animations=[];s.layer.replaceChildren();}
 async function fireworks(stage,opt){
  const s=state(stage),version=s.version;s.frame.hidden=false;
  try{const engine=await prepare(stage);if(version!==s.version)return;engine.start(opt);}
  catch(error){if(version===s.version){s.frame.hidden=true;document.getElementById('status').textContent=error.message;}}
 }
 function balloons(stage,opt){
  if(!definitions){definitions=document.createElement('div');definitions.innerHTML=BalloonArtwork.svgFiltersHtml;Object.assign(definitions.style,{position:'absolute',width:'0',height:'0',overflow:'hidden'});document.body.appendChild(definitions);}
  const s=state(stage),r=stage.canvas.getBoundingClientRect(),n=Math.max(5,Math.min(22,Math.round(opt.count/12)));
  const colors=[['#ffec37ee','#f8b13dff'],['#f89640ee','#c03940ff'],['#3bc0f0ee','#0075bcff'],['#b0cb47ee','#3d954bff'],['#cf85b8ee','#a3509dff']];
  for(let i=0;i<n;i++){
   const depth=.65+Math.random()*.65,width=Math.min(r.width,r.height)*.18*opt.size*depth;
   const color=colors[i%colors.length],balloon=BalloonArtwork.createBallonElement({balloonColor:color[1],lightColor:color[0],width});
   const x=(i+.5)/n*r.width,drift=(Math.random()-.5)*r.width*.22,tilt=(Math.random()<.5?-1:1)*(8+Math.random()*7);
   balloon.style.zIndex=String(Math.round(depth*100));balloon.style.filter=depth>1.2?'blur(1px)':'none';s.layer.appendChild(balloon);
   const y=r.height+Math.random()*r.height*.1,top=-width*3;
   const transform=(xx,yy,angle)=>`translate(-50%,0) translate3d(${xx}px,${yy}px,0) rotate(${angle}deg)`;
   const a=balloon.animate([{transform:transform(x,y,-tilt),opacity:0},{transform:transform(x+drift*.25,y+(top-y)*.15,tilt*.5),opacity:1,offset:.15},{transform:transform(x+drift*.6,y+(top-y)*.55,tilt),opacity:1,offset:.55},{transform:transform(x+drift,top,-tilt),opacity:0}],{duration:opt.duration*1000,delay:0,easing:'linear',fill:'both'});
   s.animations.push(a);a.finished.then(()=>{balloon.remove();s.animations=s.animations.filter(item=>item!==a);}).catch(()=>{});
  }
 }
 window.RichEffects={clear,fireworks,balloons};
})();
