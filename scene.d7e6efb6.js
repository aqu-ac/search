(function(){
var c=document.getElementById('scene');
var gl=c.getContext('webgl',{antialias:false,alpha:false});
function reveal(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}})},{threshold:.15});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  var f=function(){document.body.classList.toggle('scrolled',scrollY>window.innerHeight*.5)};
  addEventListener('scroll',f,{passive:true});f();
}
reveal();
(function(){var b=document.querySelector('.tg');if(!b)return;b.addEventListener('click',function(){var r=document.documentElement,n=r.dataset.theme==='dark'?'light':'dark';r.dataset.theme=n;try{localStorage.setItem('aqua-theme',n)}catch(e){}try{document.cookie='aqua-theme='+n+'; domain=.aqu.ac; path=/; max-age=31536000; SameSite=Lax; Secure'}catch(e){}var m=document.querySelector('meta[name=theme-color]');if(m)m.content=n==='dark'?'#0A1A1F':'#E3EFEE'})})();
if(!gl)return;
var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var fs=`precision highp float;
uniform vec2 R;uniform float T;uniform float D;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return s;}
float bar(float x,float c,float w,float s){return smoothstep(w+s,w-s,abs(x-c));}
float light(vec2 p,float t){
  float a=R.x/R.y;
  float x=p.x*a+p.y*.16;
  float d=sin(t*.045)*.05;
  float L=0.;
  L+=bar(x,.12*a+d,.035,.03)*.8;
  L+=bar(x,.25*a-d*.7,.06,.05)*.9;
  L+=bar(x,.50*a+d*.5,.15,.10)*.85;L+=bar(x,.80*a-d,.12,.10)*.55;
  L+=bar(x,1.12*a-d,.10,.07)*.45;
  L*=.82+.18*fbm(vec2(p.x*3.,p.y*6.+t*.02));
  return clamp(L,0.,1.);
}
void main(){
  vec2 p=gl_FragCoord.xy/R;float t=T;
  float hz=.31;
  vec3 wallBase=mix(vec3(.945,.972,.965),vec3(.040,.095,.115),D);
  vec3 col;
  if(p.y>hz){
    float L=light(p,t);
    float g=.97+.05*smoothstep(1.,.3,p.y);
    col=wallBase*mix(.88+.20*L,.95+.09*L,D)*g;
    col=mix(col,mix(vec3(1.,.995,.96),vec3(.40,.66,.72),D),L*mix(.55,.30,D));
    col*=1.-mix(.12,.30,D)*smoothstep(.5,1.1,length(p-vec2(.5,.55)));col*=1.-(1.-D)*.06*smoothstep(.55,1.,p.y);
    float fl=smoothstep(hz+.012,hz,p.y);
    col=mix(col,mix(vec3(.97,.985,.975),vec3(.03,.075,.095),D),fl*.8);col*=1.-(1.-D)*.10*smoothstep(hz+.085,hz+.012,p.y);
  } else {
    float dy=hz-p.y;
    vec2 q=vec2(p.x*R.x/R.y*.55,dy*2.4);
    float w1=fbm(q*vec2(1.6,2.2)+vec2(t*.035,t*.05));
    float w2=fbm(q*vec2(3.0,4.0)-vec2(t*.05,t*.035)+w1);
    float disp=(w1-.5)*.07+(w2-.5)*.035;
    vec2 rp=vec2(p.x+disp*.9,hz+dy*.9+disp*.4);
    float L=light(rp,t);
    vec3 deep=mix(vec3(.36,.64,.68),vec3(.012,.062,.092),D);
    vec3 shallow=mix(vec3(.70,.87,.88),vec3(.040,.140,.170),D);
    vec3 wat=mix(shallow,deep,smoothstep(0.,.31,dy)*.75);
    vec3 refl=wallBase*(.88+.16*L);
    col=mix(wat,refl,mix(.30,.42,D));
    col=mix(col,mix(vec3(1.),vec3(.45,.78,.85),D),L*mix(.42,.35,D));
    float yy=sqrt(dy)*34.+w1*4.5+w2*2.2+t*.25;
    float r=abs(sin(yy));
    float line=pow(1.-r,12.);
    float mask=.30+.70*smoothstep(0.,.20,dy);
    col+=mix(vec3(.95,.99,.97),vec3(.42,.84,.92),D)*line*mix(.60,.30,D)*mask;col*=1.-(1.-D)*.10*smoothstep(.25,.9,r)*mask;
    float line2=pow(1.-abs(sin(yy*.5+w2*3.+1.7)),16.);
    col+=mix(vec3(.95,.99,.97),vec3(.42,.84,.92),D)*line2*mix(.36,.20,D)*mask;
  }
  gl_FragColor=vec4(col,1.);
}`;
function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.log(gl.getShaderInfoLog(o));return null}return o}
var v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return;
var pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);gl.useProgram(pr);
var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
var uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T'),uD=gl.getUniformLocation(pr,'D');var Dv=document.documentElement.dataset.theme==='dark'?1:0,tl=performance.now();
var scale=Math.min(window.devicePixelRatio||1,1.5)*.75;
function size(){c.width=Math.max(2,Math.floor(innerWidth*scale));c.height=Math.max(2,Math.floor(innerHeight*scale));gl.viewport(0,0,c.width,c.height)}
size();addEventListener('resize',size);
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,t0=performance.now(),vis=true;
var speed=reduce?.3:1.25;
document.addEventListener('visibilitychange',function(){vis=!document.hidden});
function draw(now){
  if(vis){var tg=document.documentElement.dataset.theme==='dark'?1:0,dt=Math.min(.1,(now-tl)/1000);tl=now;Dv+=(tg-Dv)*Math.min(1,dt*5);if(Math.abs(tg-Dv)<.002)Dv=tg;gl.uniform1f(uD,Dv);gl.uniform2f(uR,c.width,c.height);gl.uniform1f(uT,window.__aquaT!==undefined?window.__aquaT:(now-t0)/1000*speed+10);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
})();