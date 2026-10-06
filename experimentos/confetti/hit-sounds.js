/* Google-hosted candidates, evaluated only in the laboratory. */
(() => {
 const catalog = [
  {id:'pop',name:'Pop',file:'cartoon/pop.ogg'},
  {id:'suction',name:'Ventosa',file:'cartoon/suction_cup_pull.ogg'},
  {id:'wood',name:'Golpe de madera',file:'cartoon/woodblock_hit.ogg'},
  {id:'boing',name:'Boing',file:'cartoon/cartoon_boing.ogg'},
  {id:'ring',name:'Tintineo',file:'cartoon/cartoon_ringing_hit.ogg'},
  {id:'button',name:'Clic de botón',file:'household/button_push.ogg'}
 ];
 const $ = id => document.getElementById(id);
 const key='labs-creature-hit-sounds-v1';
 let settings={bats:'pop',ghosts:'suction',volume:20};
 try { const saved=JSON.parse(localStorage.getItem(key)); if(saved){for(const kind of ['bats','ghosts'])if(saved[kind]==='none'||catalog.some(s=>s.id===saved[kind]))settings[kind]=saved[kind];if(Number.isFinite(saved.volume))settings.volume=Math.min(60,Math.max(0,saved.volume));} } catch {}
 let playing=null, timer=0, fade=0, generation=0;
 function stop(){generation++;clearTimeout(timer);clearInterval(fade);if(playing){playing.pause();playing.currentTime=0;playing=null;}}
 function persist(){try{localStorage.setItem(key,JSON.stringify(settings));}catch{}}
 function play(id){
  stop();const sound=catalog.find(s=>s.id===id);if(!sound||settings.volume===0)return;
  const media=new Audio('https://actions.google.com/sounds/v1/'+sound.file),token=generation;
  playing=media;media.volume=settings.volume/100;
  media.play().then(()=>{
   if(token!==generation)return;
   $('hitSoundStatus').textContent='Sonando: '+sound.name;
   // Keep feedback brief; soften the end of samples longer than 1.2 seconds.
   timer=setTimeout(()=>{let steps=0;const initial=media.volume;fade=setInterval(()=>{if(token!==generation)return;media.volume=Math.max(0,initial*(1-++steps/7));if(steps>=7)stop();},20);},1050);
  }).catch(error=>{if(token!==generation)return;stop();$('hitSoundStatus').textContent=error.name==='NotAllowedError'?'Pulsa «Escuchar» para activar el audio.':'No se pudo cargar '+sound.name+'. Prueba otra opción.';});
 }
 for(const kind of ['bats','ghosts']){
  const select=$(kind==='bats'?'batHitSound':'ghostHitSound');
  select.innerHTML='<option value="none">Sin sonido</option>'+catalog.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');select.value=settings[kind];
  select.onchange=()=>{settings[kind]=select.value;persist();play(select.value);};
 }
 $('hitVolume').value=settings.volume;$('hitVolumeOut').textContent=settings.volume+'%';
 $('hitVolume').oninput=()=>{stop();settings.volume=+$('hitVolume').value;$('hitVolumeOut').textContent=settings.volume+'%';persist();};
 $('hitSoundCards').innerHTML=catalog.map(s=>`<button type="button" data-hit-sound="${s.id}">▶ ${s.name}</button>`).join('');
 $('hitSoundCards').onclick=event=>{const button=event.target.closest('[data-hit-sound]');if(button)play(button.dataset.hitSound);};
 $('hitSoundStop').onclick=stop;
 window.HitSoundLab={hit:kind=>play(settings[kind]),stop,settings:()=>({...settings}),catalog};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 $('clear').addEventListener('click',stop);

 const creatures=[];let last=0;
 function reset(){for(const creature of creatures)creature.button.remove();creatures.length=0;
  for(let i=0;i<5;i++){
   const ghost=i>=3,button=document.createElement('button'),sprite=document.createElement('span');
   button.type='button';button.className='hit-creature '+(ghost?'hit-ghost':'hit-bat');
   button.setAttribute('aria-label',ghost?'Eliminar fantasma de prueba':'Eliminar murciélago de prueba');
   sprite.className='hit-creature-sprite';button.appendChild(sprite);$('hitCreatureStage').appendChild(button);
   const creature={button,sprite,ghost,pink:i===4,x:(i+.5)/5,phase:i*.9,hitAt:null};creatures.push(creature);
   button.onclick=()=>{if(creature.hitAt!==null)return;creature.hitAt=performance.now();button.disabled=true;window.HitSoundLab.hit(ghost?'ghosts':'bats');
    const point=document.createElement('span');point.className='hit-point';point.textContent='+1';button.appendChild(point);};
  }
 }
 $('hitReset').onclick=reset;reset();
 function frame(now){const elapsed=last?Math.min(.05,(now-last)/1000):0;last=now;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches&&!$('allowMotion').checked;
  for(const creature of creatures){const {button,sprite,ghost,pink}=creature;
   if(creature.hitAt===null){if(!reduced)creature.x=(creature.x+elapsed*(ghost?.035:.025))%1;button.style.left=`${creature.x*100}%`;button.style.top=`${25+(reduced?0:Math.sin(now/900+creature.phase)*8)}px`;button.style.opacity='1';button.style.visibility='';}
   const age=creature.hitAt===null?0:(now-creature.hitAt)/1000;
   if(ghost){const index=creature.hitAt===null?(reduced?0:Math.floor(now/1000*12+creature.phase)%8):Math.min(12,Math.floor(age*12));const base=pink?5:2,col=base+(creature.hitAt===null?0:index<8?1:2),row=creature.hitAt!==null&&index>=8?index-8:index;sprite.style.backgroundPosition=`${-col*32}px ${-row*32}px`;}
   else{const landed=age>=.45;const col=creature.hitAt===null?(reduced?0:Math.floor(now/1000*12+creature.phase)%5):landed?4:Math.min(3,Math.floor(age*12));sprite.style.backgroundPosition=`${-col*16}px ${creature.hitAt===null?-24:-48}px`;if(creature.hitAt!==null)button.style.top=`${25+Math.min(65,320*age*age)}px`;}
   if(creature.hitAt!==null){const lifetime=ghost?13/12:2;button.style.opacity=String(Math.min(1,Math.max(0,(lifetime-age)/.25)));if(age>lifetime)button.style.visibility='hidden';if(age>lifetime+1){creature.hitAt=null;button.disabled=false;button.querySelector('.hit-point')?.remove();}}
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
})();
