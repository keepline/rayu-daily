(function () {
  'use strict';
  const scene = document.querySelector('.landscape');
  const pre = document.getElementById('ascii-landscape');
  const wizard = document.querySelector('.pixel-wizard');
  wizard.hidden = true;
  const sprite = document.createElement('canvas');
  sprite.width = 40; sprite.height = 32; sprite.className = 'scene-sprite';
  sprite.setAttribute('aria-hidden', 'true'); scene.appendChild(sprite);
  const button = document.createElement('button');
  button.className = 'scene-switch'; button.type = 'button'; scene.appendChild(button);
  const radio = document.querySelector('.now-playing');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // Measure the actual monospace advance rather than assuming a viewport width.
  const measure = document.createElement('canvas').getContext('2d');
  function fitScene() {
    measure.font = '100px monospace';
    const advance = measure.measureText('M').width / 100;
    pre.style.setProperty('--scene-font', `${scene.clientWidth / (200 * advance)}px`);
    pre.style.setProperty('--scene-line', `${scene.clientHeight / 72}px`);
  }
  new ResizeObserver(fitScene).observe(scene);
  fitScene();
  if (document.fonts) document.fonts.ready.then(fitScene);
  let fisher = false, timer;
  const noise = (x,y) => ((x*73+y*137+x*y*19)%101)/101;
  function draw() {
    const w=200,h=72, rows=[];
    for(let y=0;y<h;y++) {
      let row='';
      for(let x=0;x<w;x++) {
        const n=noise(x,y), dx=(x-103)/1.9, dy=y-24;
        let c=' ';
        if(!fisher) {
          if(dx*dx+dy*dy<1050) c=['w','m','~','v'][(x+y*2)%4];
          const ridge=39-10*Math.abs(Math.sin(x*.067))-5*Math.sin(x*.173);
          if(y>ridge) {
            const density=Math.max(.12,.82-(y-ridge)*.019);
            c=n<density?('/'+String.fromCharCode(92)+'|xo.:').charAt((x*3+y*7)%7):' ';
          }
          if(c===' '&&n>.996)c='.';
        } else {
          const edge=19+8*Math.sin(x*.048)+6*Math.sin(x*.127);
          if(y<edge) c=n<.78?(y%2===0?'=':'.'):' ';
          if(dx*dx+(y-9)*(y-9)<260 && y<20 && n<.3)c='-';
          const water=55+5*Math.sin(x*.039)+3*Math.sin(x*.103);
          if(y>water)c=n<.53?(y%3===0?'=':'.'):' ';
          if(c===' '&&n>.997)c='.';
        }
        row+=c;
      }
      rows.push(row);
    }
    pre.textContent=rows.join('\n');
    scene.dataset.scene=fisher?'fisher':'wizard';
    button.textContent=fisher?'01 / MOON FLIGHT':'02 / STILL WATER';
    button.setAttribute('aria-label',fisher?'Switch to moon flight':'Switch to still water');
    scene.setAttribute('aria-label',fisher?'Pixel fisher on dark water beneath scanline mountains':'Pixel wizard flying over ASCII mountains and a woven moon');
    radio.replaceChildren();
    const note=document.createElement('span'); note.textContent='\u266b'; note.setAttribute('aria-hidden','true');
    const track=document.createElement('span'); track.className='track-title';
    track.textContent=fisher?'Kolby Wade \u2014 Pianos on Grass':'Forest Park (Ft. Farnell Newton)';
    radio.append(note,track); radio.title=track.textContent;
    const ctx=sprite.getContext('2d'); ctx.clearRect(0,0,40,32);
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
    if(!fisher){
      rect(15,2,7,2,'#292d31');rect(12,4,13,3,'#292d31');rect(9,7,20,2,'#44484a');
    }
    rect(13,10,13,9,'#ee997a');rect(11,13,18,4,'#ee997a');
    rect(23,11,2,2,'#141414');rect(13,19,3,2,'#ee997a');rect(20,19,3,2,'#ee997a');
    if(fisher){
      rect(7,23,27,3,'#a67435');rect(9,26,23,2,'#795020');rect(6,21,3,3,'#c7994c');rect(32,21,3,3,'#c7994c');rect(9,24,23,1,'#e0af59');
      rect(7,5,1,17,'#c4c4cc');rect(8,0,1,6,'#c4c4cc');rect(10,1,1,10,'#88829c');rect(11,10,1,3,'#88829c');
    }else{
      rect(3,21,29,1,'#a47a38');rect(1,19,9,5,'#d8ad59');rect(0,20,6,1,'#ffe19a');rect(0,23,7,1,'#ffe19a');rect(2,18,3,1,'#ffe19a');
    }
  }
  function schedule(){clearInterval(timer);if(!motion.matches)timer=setInterval(()=>{if(!document.hidden){fisher=!fisher;draw();}},30000);}
  button.addEventListener('click',()=>{fisher=!fisher;draw();schedule();});
  motion.addEventListener('change',schedule); draw();schedule();
})();
