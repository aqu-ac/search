(function(){
var f=document.getElementById('sf'),qi=document.getElementById('q'),out=document.getElementById('out'),ans=document.getElementById('ans'),res=document.getElementById('res'),note=document.getElementById('note'),busy=false;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}}
function cite(node,text){text.split(/(\[\d+\])/).forEach(function(p){var m=p.match(/^\[(\d+)\]$/);if(m){var s=el('sup'),a=el('a',null,m[1]);a.href='#r'+m[1];s.appendChild(a);node.appendChild(s)}else node.appendChild(document.createTextNode(p))})}
function showAns(t,msg,list){ans.hidden=false;ans.textContent='';ans.appendChild(el('small',null,'Answer'));if(msg){ans.appendChild(el('span','note',msg))}else{var p=el('p');cite(p,t);ans.appendChild(p);
  if(list){var seen={},ids=[];(t.match(/\[(\d+)\]/g)||[]).forEach(function(m){var n=+m.slice(1,-1);if(!seen[n]&&list[n-1]){seen[n]=1;ids.push(n)}});
  if(ids.length){var box=el('div','srcs');ids.forEach(function(n){var x=list[n-1],a=el('a');a.href=x.url;a.rel='noopener noreferrer nofollow';a.referrerPolicy='no-referrer';a.appendChild(el('b',null,n+' · '+(x.title||host(x.url))));a.appendChild(el('span',null,host(x.url)));box.appendChild(a)});ans.appendChild(box)}}}}
async function run(q){
  if(busy||!q)return;busy=true;
  out.hidden=false;ans.hidden=true;res.textContent='';note.textContent='Searching…';
  history.replaceState(null,'','?q='+encodeURIComponent(q));
  out.scrollIntoView({behavior:'smooth',block:'start'});
  try{
    var r=await fetch('/api/search?q='+encodeURIComponent(q),{referrerPolicy:'no-referrer',credentials:'omit'});
    var d=await r.json();
    if(d.error==='blocked'){note.textContent="This search isn't available on Aqua.";busy=false;return}
    if(d.error==='limit'){note.textContent='Daily search limit reached. Please come back tomorrow.';busy=false;return}
    var list=d.results||[];
    if(!list.length){note.textContent='No results.';busy=false;return}
    var words=q.toLowerCase().split(/\s+/).filter(function(w){return w.length>2}).map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')});
    var rx=words.length?new RegExp('('+words.join('|')+')','gi'):null;
    list.forEach(function(x,i){
      var li=el('li');li.id='r'+(i+1);
      var h=host(x.url);
      var a=el('a','t',x.title||x.url);a.href=x.url;a.rel='noopener noreferrer nofollow';a.referrerPolicy='no-referrer';
      li.appendChild(a);var u=el('div','u',(i+1)+' \u00b7 '+h);var ic=new Image();ic.width=16;ic.height=16;ic.alt='';ic.loading='lazy';ic.referrerPolicy='no-referrer';ic.onerror=function(){ic.remove()};ic.src='/api/icon?d='+encodeURIComponent(h);u.appendChild(ic);li.appendChild(u);
      if(x.content){var pp=el('p');if(rx){x.content.split(rx).forEach(function(part,j){if(j%2){pp.appendChild(el('b',null,part))}else pp.appendChild(document.createTextNode(part))})}else pp.textContent=x.content;li.appendChild(pp)}
      res.appendChild(li);
    });
    note.textContent=d.source==='fallback'?'The web search service is unavailable right now, showing basic results instead.':'Your search was relayed by Aqua to an independent search provider. Your IP address is not shared and Aqua does not store searches.';
    showAns(null,'Writing an answer…');
    var ar=await fetch('/api/answer',{method:'POST',headers:{'content-type':'application/json'},referrerPolicy:'no-referrer',credentials:'omit',body:JSON.stringify({q:q,sources:list.slice(0,8).map(function(x){return{title:x.title,content:x.content}})})});
    if((ar.headers.get('content-type')||'').indexOf('text/plain')===0&&ar.body){
      var rd=ar.body.getReader(),dc=new TextDecoder(),txt='';
      for(;;){var c=await rd.read();if(c.done)break;txt+=dc.decode(c.value,{stream:true});showAns(txt)}
      txt+=dc.decode();txt?showAns(txt,null,list):ans.hidden=true;
    }else{
      var ad=await ar.json();
      if(ad.error==='limit')showAns(null,'The AI answer limit for today has been reached. Search results still work.');
      else ans.hidden=true;
    }
  }catch(e){note.textContent='Something went wrong. Please try again.'}
  busy=false;
}
var sb=document.createElement('form'),q2=document.createElement('input'),b2=document.createElement('button');
sb.className='sbar';sb.setAttribute('role','search');q2.type='search';q2.placeholder='Search';q2.autocomplete='off';q2.setAttribute('aria-label','Search');b2.type='submit';b2.textContent='\u2192';b2.setAttribute('aria-label','Search');sb.appendChild(q2);sb.appendChild(b2);document.body.appendChild(sb);
function place(){var h=document.querySelector('header');var hb=h?h.getBoundingClientRect().bottom:60;sb.style.top=Math.round(hb+8)+'px';
  var r=f.getBoundingClientRect(),show=!out.hidden,o=show?Math.max(0,Math.min(1,(hb-r.bottom+40)/80)):0;
  sb.style.opacity=o;sb.style.pointerEvents=o>.4?'auto':'none';sb.style.transform='translateX(-50%) translateY('+Math.round((1-o)*-8)+'px)'}
addEventListener('scroll',place,{passive:true});addEventListener('resize',place);
qi.addEventListener('input',function(){q2.value=qi.value});q2.addEventListener('input',function(){qi.value=q2.value});
sb.addEventListener('submit',function(e){e.preventDefault();qi.value=q2.value;run(q2.value.trim())});
var _run=run;run=function(q){q2.value=q;qi.value=q;return _run(q).then(function(){setTimeout(place,300)})};
f.addEventListener('submit',function(e){e.preventDefault();run(qi.value.trim())});
var p=new URLSearchParams(location.search).get('q');if(p){qi.value=p;run(p)}
})();
