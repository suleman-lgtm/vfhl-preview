/* Voices From the Holy Land — site assistant
   Self-contained, no server, no API key. Knowledge-base retrieval with graceful fallback.
   To upgrade to a true LLM later: replace findAnswer() with a fetch() to a serverless proxy. */
(function () {
  "use strict";

  var EMAIL = "vfhlonlinefilmsalon@gmail.com";
  var RECORDINGS = "https://www.voicesfromtheholyland.org/salonrecordings";

  /* ---------------- KNOWLEDGE BASE ----------------
     Each entry: k = trigger keywords (rich, incl. synonyms), a = HTML answer.
     Answers use only confirmed facts; unknowns route to contact instead of guessing. */
  var KB = [
    { id: "what", k: "what who is vfhl voices holy land about organization coalition explain tell",
      a: "<b>Voices From the Holy Land (VFHL)</b> is an interfaith, non-political coalition of more than 100 organizations that uses documentary films and honest panel discussions to advance human rights, justice, and peace in the Holy Land. We are all-volunteer and based in the Washington, D.C. region. <a href='about.html'>Read our story &rarr;</a>" },

    { id: "mission", k: "mission purpose goal why exist aim vision believe stand for",
      a: "Our purpose is to help people understand the Holy Land well enough to talk to one another. We bring people together around curated documentary films and honest, moderated discussion, drawing on five faith traditions, to move toward mutual respect, justice, and peace. <a href='about.html'>More about us &rarr;</a>" },

    { id: "salon", k: "film salon what is a salon format how does work structure agenda happen",
      a: "A film salon is simple: we watch a documentary together, then talk about it with help. Each one opens with a film, followed by a <b>moderated panel</b>, then <b>live audience Q&amp;A</b>, and finally small <b>breakout conversations</b>. <a href='blog-what-is-a-film-salon.html'>How a salon works &rarr;</a>" },

    { id: "when", k: "when time schedule date day next upcoming month sunday what time often",
      a: "Our online film salons are held the <b>third Sunday of each month at 3:00 PM ET</b>, and they are always free. You can see every upcoming date on our <a href='calendar.html'>calendar &rarr;</a>" },

    { id: "next", k: "next upcoming coming soon this month july advocacy workshop",
      a: "Our next online salon is <b>&ldquo;Try This At Home: An Advocacy Workshop&rdquo; on Sunday, July 19, 2026 at 3:00 PM ET</b>, a practical session on turning concern into action. See details and register on the <a href='calendar.html'>calendar &rarr;</a>" },

    { id: "register", k: "register sign signup join attend rsvp participate how do i join get link enroll",
      a: "Joining is free. Register in advance and we email you the link to attend. The quickest way is to email us at <a href='mailto:" + EMAIL + "?subject=Register%20for%20the%20VFHL%20Salon'>" + EMAIL + "</a>, or use the <b>Register free</b> button on the <a href='calendar.html'>calendar &rarr;</a>" },

    { id: "free", k: "free cost price how much pay ticket fee charge expensive afford",
      a: "Yes, every salon is <b>completely free</b> to attend and every recording is free to watch. We are funded entirely by donations, which is what keeps it open to everyone. If you would like to help, you can <a href='donate.html'>support the work &rarr;</a>" },

    { id: "donate", k: "donate donation give giving contribute support money fund gift sponsor help fund",
      a: "Thank you, donations are what keep the salons free. You can give <b>monthly or one-time</b>, and every dollar goes to films, technology, captioning, and editing (we are all-volunteer, so there is no overhead). <a href='donate.html'>Give here &rarr;</a>" },

    { id: "moneywhere", k: "where money go spent used funds budget overhead what does pay",
      a: "Because we are all-volunteer, your gift pays only for the things volunteers cannot donate: <b>film licensing, streaming technology, professional captioning, and the editing</b> that turns each live salon into a lasting public recording. <a href='donate.html'>See where it goes &rarr;</a>" },

    { id: "tax", k: "tax deductible deduction receipt 501 nonprofit charity ein write off",
      a: "Donations support a non-profit, all-volunteer effort. For confirmation of tax-deductibility and to request a receipt, please email <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a> and our team will help." },

    { id: "watch", k: "watch recording recordings past previous archive video videos library replay missed catch",
      a: "Yes. More than <b>70 past salons</b> are free to watch in our recordings archive, professionally edited with b-roll. <a href='" + RECORDINGS + "' target='_blank' rel='noopener'>Browse the archive &rarr;</a> You can also see highlights on our <a href='watch.html'>Watch page &rarr;</a>" },

    { id: "inperson", k: "in person live screening venue church location attend physically near me westminster",
      a: "Alongside the monthly online salons, we hold occasional <b>in-person screenings</b> at partner congregations in the D.C. area. Upcoming in-person events are listed on the <a href='calendar.html'>calendar &rarr;</a>" },

    { id: "films", k: "film films movie documentary which what choose chosen suggest recommend pick selection",
      a: "Each month we screen a documentary chosen to open a real question rather than deliver a verdict. You can see the full list of films we have shown, and a curated bibliography, on our <a href='resources.html'>Resources page &rarr;</a> To suggest a film, email <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>." },

    { id: "faith", k: "faith interfaith religion religious christian jewish muslim unitarian quaker denomination",
      a: "VFHL is genuinely interfaith. Our coalition brings together <b>Christian, Jewish, Muslim, Unitarian, and Quaker</b> communities, five traditions at one table, around a shared hope for justice and peace. <a href='about.html'>About the coalition &rarr;</a>" },

    { id: "political", k: "political politics partisan side biased agenda neutral one sided anti israel anti palestine",
      a: "We are <b>non-political and faith-rooted</b>. We do not exist to win an argument for one side; we exist to help people understand the issues well enough to talk to one another, hearing both histories with honesty. <a href='about.html'>Our approach &rarr;</a>" },

    { id: "partner", k: "partner partnership organization congregation join coalition member become affiliate cosponsor",
      a: "More than 100 interfaith organizations stand behind this work. If your congregation or organization would like to join the coalition, lend its audience, or co-sponsor a salon, we would be honored to talk. <a href='contact.html'>Become a partner &rarr;</a>" },

    { id: "host", k: "host hosting screening my church community bring local organize show",
      a: "Yes, communities can host a local screening. We will help you choose a film and set it up. Reach out through our <a href='contact.html'>contact page &rarr;</a> or email <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>." },

    { id: "volunteer", k: "volunteer help involved get involved contribute time assist support work join team",
      a: "We are all-volunteer and always glad for help, from moderating and tech support to outreach and sharing salons. Tell us how you would like to help via the <a href='contact.html'>contact page &rarr;</a>" },

    { id: "resources", k: "resource resources reading book books bibliography list learn study tour tours articles media",
      a: "Our <b>Resources library</b> is a decade-deep collection: a selected bibliography, documentary films, trusted media sources, advocacy organizations, and Palestine tour information. <a href='resources.html'>Explore Resources &rarr;</a>" },

    { id: "access", k: "accessible accessibility caption captions subtitles hearing deaf disability language",
      a: "Accessibility matters to us, our salons are captioned, and a share of every donation funds professional captioning so the recordings are open to everyone. For a specific accommodation, email <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>." },

    { id: "where", k: "where located location based city region area dc washington global online worldwide",
      a: "We are based in the <b>Washington, D.C. metropolitan region</b>, but because the salons are online, anyone, anywhere can join. <a href='calendar.html'>See the next salon &rarr;</a>" },

    { id: "contact", k: "contact email phone reach get in touch address message talk speak call",
      a: "The best way to reach us is by email at <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>, or through our <a href='contact.html'>contact page &rarr;</a>. We would love to hear from you." },

    { id: "social", k: "social media facebook instagram twitter youtube follow page handle vimeo",
      a: "You can follow us on <a href='https://www.facebook.com/VoicesHolyLand/' target='_blank' rel='noopener'>Facebook</a> for announcements and salon news. To be added to our email announcements, just write to <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>." },

    { id: "news", k: "newsletter mailing list updates stay informed subscribe announcements notify remind email list",
      a: "To stay updated: check our monthly <a href='calendar.html'>calendar</a>, follow us on <a href='https://www.facebook.com/VoicesHolyLand/' target='_blank' rel='noopener'>Facebook</a>, or email <a href='mailto:" + EMAIL + "?subject=Add%20me%20to%20VFHL%20announcements'>" + EMAIL + "</a> to be added to our announcements." },

    { id: "monthlyonce", k: "monthly recurring one time once subscription cancel recurring gift",
      a: "You can give either way. <b>Monthly giving</b> is the most impactful, it lets us plan and license films ahead, and you can change or cancel anytime. One-time gifts are just as welcome. <a href='donate.html'>Choose an amount &rarr;</a>" },

    { id: "askquestions", k: "ask question during live participate speak panel interact q&a breakout",
      a: "Absolutely. Each salon includes <b>live audience Q&amp;A</b>, and the final stretch moves into small breakout conversations with the panelists and other attendees, so you are part of the room, not just watching. <a href='calendar.html'>Join the next one &rarr;</a>" },

    { id: "history", k: "history founded start began when started old years anniversary established origin",
      a: "Voices From the Holy Land grew out of an annual film series that began in the mid-2010s, and our monthly <b>online film salons have run since 2020</b>, more than 70 salons and counting. <a href='about.html'>Our story &rarr;</a>" },

    { id: "vom", k: "featured video month highlight clip haynes",
      a: "Our <b>Video of the Month</b> and other featured highlights are on the Watch page, with the full library in the recordings archive. <a href='watch.html'>See featured videos &rarr;</a>" },

    { id: "share", k: "share spread word tell friends invite promote",
      a: "The simplest way to help is to share a salon with someone who needs to see it, an invitation to watch together is worth more than any ad. You can share any recording from the <a href='" + RECORDINGS + "' target='_blank' rel='noopener'>archive &rarr;</a>" },

    { id: "blog", k: "blog insights article articles read writing posts",
      a: "Our <b>Insights</b> series offers short, honest pieces on the history, the competing narratives, and the practical work of peace. <a href='blog.html'>Read Insights &rarr;</a>" }
  ];

  var STOP = " the a an of to is are do does how can i we you it for in on at and or with my your what when where who why this that ".split(" ");
  function norm(s){ return (s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim(); }

  function findAnswer(query) {
    var q = norm(query);
    if (!q) return null;
    if (/^(hi|hey|hello|yo|hiya|good (morning|afternoon|evening))\b/.test(q))
      return "Hello, I am the Voices From the Holy Land assistant. Ask me about our salons, how to join, the recordings, donating, or becoming a partner.";
    if (/(thank|thanks|thx|cheers|appreciate)/.test(q))
      return "You are very welcome. Is there anything else I can help you find?";
    if (/^(bye|goodbye|see ya|that.?s all)\b/.test(q))
      return "Take care, and we hope to see you at the next salon.";

    var tokens = q.split(" ").filter(function(t){ return t.length>2 && STOP.indexOf(" "+t+" ")===-1; });
    var best=null, bestScore=0;
    KB.forEach(function(e){
      var kk = " " + e.k + " ", score = 0;
      tokens.forEach(function(t){ if (kk.indexOf(" "+t+" ")>-1) score += 2; else if (kk.indexOf(t)>-1) score += 1; });
      if (score > bestScore){ bestScore = score; best = e; }
    });
    if (best && bestScore >= 2) return best.a;
    return null;
  }

  var FALLBACK = "I am not certain I have that one yet. You can email our team at <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>, or try one of these:";
  var CHIPS = [
    ["When is the next salon?", "when"],
    ["How do I join?", "register"],
    ["Watch past salons", "watch"],
    ["How can I donate?", "donate"],
    ["What is a film salon?", "salon"],
    ["Become a partner", "partner"]
  ];
  function answerById(id){ for (var i=0;i<KB.length;i++) if (KB[i].id===id) return KB[i].a; return null; }

  /* ---------------- STYLES ---------------- */
  var css = ""
  + ".vfb-btn{position:fixed;right:22px;bottom:22px;z-index:99998;width:60px;height:60px;border-radius:50%;background:#AF5320;border:none;cursor:pointer;box-shadow:0 10px 30px rgba(33,28,21,.28);display:flex;align-items:center;justify-content:center;transition:transform .18s ease,box-shadow .18s ease;}"
  + ".vfb-btn:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 16px 38px rgba(33,28,21,.34);}"
  + ".vfb-btn svg{width:28px;height:28px;}"
  + ".vfb-badge{position:absolute;top:-3px;right:-3px;background:#211C15;color:#F6F1E8;font:600 11px/1 'Hanken Grotesk',sans-serif;padding:4px 6px;border-radius:10px;}"
  + ".vfb-panel{position:fixed;right:22px;bottom:94px;z-index:99999;width:374px;max-width:calc(100vw - 28px);height:560px;max-height:calc(100vh - 120px);background:#F6F1E8;border-radius:18px;box-shadow:0 24px 64px rgba(33,28,21,.34);display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(33,28,21,.10);}"
  + ".vfb-panel.open{display:flex;animation:vfbIn .22s ease;}"
  + "@keyframes vfbIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}"
  + ".vfb-head{background:#AF5320;color:#F6F1E8;padding:16px 18px;display:flex;align-items:center;gap:12px;}"
  + ".vfb-head .mk{width:34px;height:34px;border-radius:50%;background:#F6F1E8;display:flex;align-items:center;justify-content:center;flex:0 0 34px;}"
  + ".vfb-head .mk img{width:24px;height:24px;}"
  + ".vfb-head h4{margin:0;font:600 16px/1.2 'Newsreader',Georgia,serif;}"
  + ".vfb-head p{margin:2px 0 0;font:500 12px/1.3 'Hanken Grotesk',sans-serif;opacity:.85;}"
  + ".vfb-x{margin-left:auto;background:none;border:none;color:#F6F1E8;font-size:22px;cursor:pointer;opacity:.85;line-height:1;}"
  + ".vfb-x:hover{opacity:1;}"
  + ".vfb-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;}"
  + ".vfb-msg{max-width:86%;padding:11px 14px;border-radius:14px;font:400 14.5px/1.55 'Hanken Grotesk',sans-serif;}"
  + ".vfb-bot{background:#fff;color:#211C15;border:1px solid rgba(33,28,21,.08);border-bottom-left-radius:4px;align-self:flex-start;}"
  + ".vfb-user{background:#211C15;color:#F6F1E8;border-bottom-right-radius:4px;align-self:flex-end;}"
  + ".vfb-msg a{color:#AF5320;font-weight:600;text-decoration:none;}.vfb-msg a:hover{text-decoration:underline;}"
  + ".vfb-user a{color:#F6F1E8;}"
  + ".vfb-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 14px;}"
  + ".vfb-chip{background:#fff;border:1px solid rgba(175,83,32,.35);color:#AF5320;font:600 12.5px/1 'Hanken Grotesk',sans-serif;padding:9px 12px;border-radius:20px;cursor:pointer;transition:background .15s ease;}"
  + ".vfb-chip:hover{background:#AF5320;color:#fff;}"
  + ".vfb-foot{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(33,28,21,.10);background:#F6F1E8;}"
  + ".vfb-input{flex:1;border:1px solid rgba(33,28,21,.18);border-radius:22px;padding:11px 15px;font:400 14px 'Hanken Grotesk',sans-serif;background:#fff;color:#211C15;outline:none;}"
  + ".vfb-input:focus{border-color:#AF5320;}"
  + ".vfb-send{background:#AF5320;border:none;border-radius:50%;width:42px;height:42px;flex:0 0 42px;cursor:pointer;display:flex;align-items:center;justify-content:center;}"
  + ".vfb-send svg{width:18px;height:18px;}"
  + ".vfb-note{font:400 10.5px/1.3 'Hanken Grotesk',sans-serif;color:#8a8276;text-align:center;padding:0 18px 10px;}"
  + "@media(max-width:480px){.vfb-panel{right:8px;left:8px;width:auto;bottom:84px;height:calc(100vh - 104px);}}";

  function el(tag, cls, html){ var d=document.createElement(tag); if(cls)d.className=cls; if(html!=null)d.innerHTML=html; return d; }

  function init(){
    var style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);

    var btn=el("button","vfb-btn"); btn.setAttribute("aria-label","Ask Voices From the Holy Land");
    btn.innerHTML="<svg viewBox='0 0 24 24' fill='none'><path d='M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z' fill='#F6F1E8'/></svg><span class='vfb-badge'>Ask</span>";

    var panel=el("div","vfb-panel");
    panel.innerHTML=""
      + "<div class='vfb-head'><div class='mk'><img src='assets/logo.svg' alt=''></div>"
      + "<div><h4>Ask Voices From the Holy Land</h4><p>Salons, recordings, giving &amp; more</p></div>"
      + "<button class='vfb-x' aria-label='Close'>&times;</button></div>"
      + "<div class='vfb-body'></div>"
      + "<div class='vfb-chips'></div>"
      + "<div class='vfb-foot'><input class='vfb-input' type='text' placeholder='Type your question...' aria-label='Your question'>"
      + "<button class='vfb-send' aria-label='Send'><svg viewBox='0 0 24 24'><path d='M3 11l18-8-8 18-2-7-8-3z' fill='#F6F1E8'/></svg></button></div>"
      + "<div class='vfb-note'>Automated assistant &middot; for anything personal, email us.</div>";

    document.body.appendChild(btn); document.body.appendChild(panel);
    var body=panel.querySelector(".vfb-body"), chips=panel.querySelector(".vfb-chips"),
        input=panel.querySelector(".vfb-input"), greeted=false;

    function add(html, who){ var m=el("div","vfb-msg "+(who==="user"?"vfb-user":"vfb-bot"),html); body.appendChild(m); body.scrollTop=body.scrollHeight; }
    function renderChips(list){ chips.innerHTML=""; (list||CHIPS).forEach(function(c){ var b=el("button","vfb-chip",c[0]); b.onclick=function(){ ask(c[0], c[1]); }; chips.appendChild(b); }); }

    function ask(text, forceId){
      add(text,"user");
      var ans = forceId ? answerById(forceId) : findAnswer(text);
      setTimeout(function(){
        if (ans){ add(ans,"bot"); renderChips(); }
        else { add(FALLBACK,"bot"); renderChips(); }
      }, 220);
    }

    function open(){ panel.classList.add("open"); if(!greeted){ greeted=true;
      add("Hello! I am the Voices From the Holy Land assistant. Ask me anything, or tap a question below.","bot"); renderChips(); }
      setTimeout(function(){ input.focus(); },240); }
    function close(){ panel.classList.remove("open"); }

    btn.onclick=function(){ panel.classList.contains("open")?close():open(); };
    panel.querySelector(".vfb-x").onclick=close;
    panel.querySelector(".vfb-send").onclick=function(){ var v=input.value.trim(); if(v){ ask(v); input.value=""; } };
    input.addEventListener("keydown",function(e){ if(e.key==="Enter"){ var v=input.value.trim(); if(v){ ask(v); input.value=""; } } });
  }

  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
