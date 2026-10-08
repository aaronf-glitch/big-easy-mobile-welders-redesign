(function(){
  if(document.readyState==="complete"){document.documentElement.classList.add("ready");}else{window.addEventListener("load",function(){setTimeout(function(){document.documentElement.classList.add("ready");},0);});}
  // Route map: schematic city positions, label offsets and anchors.
  var hub=[236,150];
  var cities=[
    ["Baton Rouge",22,118,-8,-12,"start"],["Hammond",142,46,-7,4,"end"],["Madisonville",168,28,-7,-2,"end"],["Covington",206,16,7,-2,"start"],
    ["Mandeville",256,40,8,4,"start"],["Slidell",318,84,-10,-12,"start"],["LaPlace",118,132,-7,4,"end"],["St. Rose",160,150,0,21,"middle"],
    ["Kenner",190,128,-7,-4,"end"],["Metairie",214,124,2,-10,"middle"],["Gretna",246,182,8,4,"start"]
  ];
  var ns="http://www.w3.org/2000/svg";
  document.querySelectorAll("svg.route").forEach(function(svg){
    var sp=svg.querySelector(".spokes"),cg=svg.querySelector(".cities");
    cities.forEach(function(c,k){
      var p=document.createElementNS(ns,"path"),mx=(hub[0]+c[1])/2,my=Math.min(hub[1],c[2])-18;
      p.setAttribute("d","M"+hub[0]+" "+hub[1]+" Q"+mx+" "+my+" "+c[1]+" "+c[2]);p.setAttribute("class","spoke");p.setAttribute("id","sp-"+k);sp.appendChild(p);
      p.style.setProperty("--len",Math.ceil(p.getTotalLength()));
      var d=document.createElementNS(ns,"circle");d.setAttribute("cx",c[1]);d.setAttribute("cy",c[2]);d.setAttribute("r",3.6);d.setAttribute("class","city");cg.appendChild(d);
      var t=document.createElementNS(ns,"text");t.setAttribute("x",c[1]+c[3]);t.setAttribute("y",c[2]+c[4]);t.setAttribute("class","n");t.setAttribute("text-anchor",c[5]);t.textContent=c[0];cg.appendChild(t);
    });
  });
  // Map motion. Everything is visible before it runs; it only replays the drawing.
  document.querySelectorAll(".map").forEach(function(map){
    var svg=map.querySelector("svg.route");if(!svg)return;
    var hubDot=svg.querySelector(".hub"),ring=document.createElementNS(ns,"circle");
    ring.setAttribute("cx",hub[0]);ring.setAttribute("cy",hub[1]);ring.setAttribute("r",6);ring.setAttribute("class","ring");
    svg.insertBefore(ring,hubDot);
    var rigs=document.createElementNS(ns,"g");rigs.setAttribute("class","rigs");svg.insertBefore(rigs,hubDot);
    var routes=[[3,3.4],[5,3.0],[0,3.8],[10,2.4],[8,2.8],[2,3.6]],anims=[];
    routes.forEach(function(r,i){
      var g=document.createElementNS(ns,"g"),glow=document.createElementNS(ns,"circle"),dot=document.createElementNS(ns,"circle");
      glow.setAttribute("r",6);glow.setAttribute("class","rig-glow");dot.setAttribute("r",2.6);dot.setAttribute("class","rig");
      g.appendChild(glow);g.appendChild(dot);
      var mo=document.createElementNS(ns,"animateMotion");
      mo.setAttribute("dur",r[1]+"s");mo.setAttribute("begin","indefinite");mo.setAttribute("repeatCount","indefinite");
      mo.setAttribute("calcMode","spline");mo.setAttribute("keyTimes","0;1");mo.setAttribute("keyPoints","0;1");mo.setAttribute("keySplines",".45 0 .55 1");
      var mp=document.createElementNS(ns,"mpath");mp.setAttribute("href","#sp-"+r[0]);mo.appendChild(mp);
      var op=document.createElementNS(ns,"animate");
      op.setAttribute("attributeName","opacity");op.setAttribute("values","0;1;1;0");op.setAttribute("keyTimes","0;.12;.85;1");
      op.setAttribute("dur",r[1]+"s");op.setAttribute("begin","indefinite");op.setAttribute("repeatCount","indefinite");
      g.setAttribute("opacity","0");g.appendChild(mo);g.appendChild(op);rigs.appendChild(g);anims.push([mo,op,i*0.55]);
    });
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;
    var spokes=svg.querySelectorAll(".spoke"),dots=svg.querySelectorAll(".city");
    var io=new IntersectionObserver(function(es){
      if(!es[0].isIntersecting)return;io.disconnect();
      spokes.forEach(function(s,i){setTimeout(function(){s.classList.add("draw");if(dots[i])dots[i].classList.add("pop");},i*90);});
      setTimeout(function(){
        map.classList.add("live");
        anims.forEach(function(a){try{a[0].beginElementAt(a[2]);a[1].beginElementAt(a[2]);}catch(e){}});
      },spokes.length*90+700);
      setTimeout(function(){spokes.forEach(function(s){s.classList.remove("draw");});dots.forEach(function(d){d.classList.remove("pop");});},spokes.length*90+1600);
    },{threshold:.35});
    io.observe(map);
  });
  var tab=document.querySelector(".side-tab");
  if(tab&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){tab.classList.add("in");setTimeout(function(){tab.classList.remove("in");},1800);}
  // Free estimate popup: the client's own Popup Contact Form. Loads on first open; own id so form_embed.js cannot hijack it.
  var dlg=document.getElementById("estimate");
  if(dlg&&dlg.showModal){
    var fr=document.getElementById("bemw-estimate-frame");
    document.querySelectorAll("[data-estimate]").forEach(function(el){
      el.addEventListener("click",function(e){e.preventDefault();if(fr&&!fr.getAttribute("src")){fr.setAttribute("src",fr.dataset.src);}dlg.showModal();});
    });
    dlg.querySelector("[data-close]").addEventListener("click",function(){dlg.close();});
    dlg.addEventListener("click",function(e){if(e.target===dlg){dlg.close();}});
  }
  // Page motion: reveal on scroll. Delay lives in CSS (--d with a backwards fill); the class is removed after the run (L-124).
  (function(){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    var groups=[".head h2",".head .answer",".trust li",".svc li",".steps li",".proc .ph",".who article",".why .ph",".why .col > h2",".why .answer",".reasons li",".revs figure",".more",".tips > a",".city-links li",".area-cta",".map",".faq details",".faq .ph",".closing .card",".ft .grid > div"];
    var items=[];
    groups.forEach(function(sel){
      var byParent=new Map();
      document.querySelectorAll(sel).forEach(function(el){
        var p=el.parentElement,n=byParent.get(p)||0;byParent.set(p,n+1);
        var d=Math.min(n,8)*70+((sel===".head .answer"||sel===".why .answer")?120:0);
        el.style.setProperty("--d",d+"ms");items.push(el);
      });
    });
    document.querySelectorAll(".hero .panel > *").forEach(function(el,i){
      el.style.setProperty("--d",(i*90)+"ms");el.classList.add("rv-hero");
      setTimeout(function(){el.classList.remove("rv-hero");},1600);
    });
    if(!("IntersectionObserver" in window))return;
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var el=e.target;io.unobserve(el);el.classList.add("rv-go");
        var d=parseInt(el.style.getPropertyValue("--d"),10)||0;
        setTimeout(function(){el.classList.remove("rv-go");},d+1400);
      });
    },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
    items.forEach(function(el){io.observe(el);});
  })();
  // Mobile menu.
  var b=document.querySelector(".hd .menu");
  if(b){b.addEventListener("click",function(){var h=b.closest(".hd"),o=h.classList.toggle("open");b.setAttribute("aria-expanded",o?"true":"false");b.textContent=o?"Close":"Menu";});}
  // Signature: the weld bead runs once on load. Content never depends on it; a failsafe clears it.
  // Hero video: mobile poster, and no motion for reduced-motion visitors.
  var hv=document.querySelector(".hero video");
  if(hv){
    if(window.matchMedia("(max-width:900px)").matches){hv.setAttribute("poster","home/video/hero-poster-m.webp");}
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){hv.removeAttribute("autoplay");hv.pause();}
  }
  var hero=document.querySelector(".hero");
  if(hero){hero.classList.add("play");setTimeout(function(){hero.classList.remove("play");},3200);}
})();
