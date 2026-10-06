const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes=new Map(),created=[],timers=new Map();let raf,clock=1000,sequence=0;
function element(){return{value:'',style:{},children:[],dataset:{},textContent:'',appendChild(child){this.children.push(child);},setAttribute(){},addEventListener(){},querySelector(){return null;},remove(){this.removed=true;}};}
for(const id of ['batHitSound','ghostHitSound','hitVolume','hitVolumeOut','hitSoundCards','hitSoundStatus','hitSoundStop','clear','hitCreatureStage','hitReset','allowMotion'])nodes.set(id,element());
class Audio {constructor(url){this.url=url;this.currentTime=0;created.push(this);}play(){this.played=true;return Promise.resolve();}pause(){this.paused=true;}}
const stored=new Map(),window={},context={window,Audio,console,localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},document:{getElementById:id=>nodes.get(id),createElement:element,addEventListener(){}},performance:{now:()=>clock},matchMedia:()=>({matches:false}),setTimeout:fn=>{timers.set(++sequence,fn);return sequence;},clearTimeout:id=>timers.delete(id),setInterval:fn=>{timers.set(++sequence,fn);return sequence;},clearInterval:id=>timers.delete(id),requestAnimationFrame:fn=>raf=fn};
vm.runInNewContext(fs.readFileSync('experimentos/confetti/hit-sounds.js','utf8'),context);
(async()=>{
 assert.equal(window.HitSoundLab.catalog.length,6);assert.equal(created.length,0,'Never autoplay');
 const creatures=nodes.get('hitCreatureStage').children;
 creatures[0].onclick();creatures[0].onclick();await Promise.resolve();
 assert.equal(created.length,1,'A dying creature counts as one hit');assert.match(created[0].url,/cartoon\/pop.ogg$/);assert.equal(created[0].volume,.2);assert.equal(created[0].currentTime,.39,'Skip leading silence');
 creatures[3].onclick();await Promise.resolve();assert.equal(created[0].paused,true,'Avoid overlapping feedback');assert.match(created[1].url,/suction_cup_pull/);
 nodes.get('batHitSound').value='button';nodes.get('batHitSound').onchange();await Promise.resolve();
 assert.match(created.at(-1).url,/button_push/);assert.equal(JSON.parse(stored.values().next().value).bats,'button');
 nodes.get('hitVolume').value='0';nodes.get('hitVolume').oninput();const before=created.length;
 window.HitSoundLab.hit('ghosts');assert.equal(created.length,before,'Zero volume is silent');
 raf(clock);clock+=3300;raf(clock);assert.equal(creatures[0].disabled,false,'Creatures respawn');
 console.log('PASS: six sounds, no autoplay, one feedback per hit, no overlap, saved selections and mute.');
})().catch(error=>{console.error(error);process.exitCode=1;});
