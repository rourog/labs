// Original uploaded 256x256 sheet, unmodified; 32x32 cells.
(() => {
 const image=new Image();image.src='ghost.png';
 function frame(color, elapsed, fps, disappearing=false) {
  const index=Math.max(0,Math.floor(elapsed*fps)),base=color==='pink'?5:2;
  if(!disappearing)return {x:base*32,y:index%8*32};
  if(index<8)return {x:(base+1)*32,y:index*32};
  if(index<13)return {x:(base+2)*32,y:(index-8)*32};
  return null;
 }
 function draw(ctx,color,elapsed,fps,x,y,size,disappearing=false) {
  const cell=frame(color,elapsed,fps,disappearing);
  if(!cell||!image.complete||!image.naturalWidth)return false;
  const width=size*32/12;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,cell.x,cell.y,32,32,x-width/2,y-width/2,width,width);
  ctx.restore();return true;
 }
 window.GhostSprites={frame,draw,image};
})();
