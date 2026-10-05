const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={window:{},Image:class{complete=true;naturalWidth=256;}};vm.createContext(context);vm.runInContext(fs.readFileSync('experimentos/confetti/ghost-sprite.js','utf8'),context);
const sprite=context.window.GhostSprites;
for(const color of ['cyan','pink'])for(let i=0;i<40;i++){
 const cell=sprite.frame(color,i/12,12);assert.equal(cell.x,color==='pink'?160:64);assert.ok(cell.y>=0&&cell.y<256);
}
for(const color of ['cyan','pink'])for(let i=0;i<13;i++){
 const cell=sprite.frame(color,(i+.1)/12,12,true);assert.equal(cell.x,(color==='pink'?160:64)+(i<8?32:64));assert.equal(cell.y,(i<8?i:i-8)*32);
}
assert.equal(sprite.frame('cyan',13/12,12,true),null);
assert.equal(sprite.frame('pink',13/4,4,true),null);
let drawArgs;const ctx={save(){},restore(){},drawImage(...args){drawArgs=args;}};
assert.equal(sprite.draw(ctx,'cyan',0,12,100,100,45),true);assert.equal(ctx.imageSmoothingEnabled,false);assert.equal(drawArgs[3],32);assert.equal(drawArgs[4],32);assert.equal(drawArgs[7],120);
assert.equal(sprite.draw(ctx,'cyan',2,12,100,100,45,true),false);
console.log('OK: cyan/pink loops, 13-frame disappearance, frame bounds, FPS and pixel rendering.');
