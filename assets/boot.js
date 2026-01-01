// Insert boot overlay markup and behavior
(function(){
  const DURATION = 500; // ms
  function createOverlay(){
    const div = document.createElement('div');
    div.id = 'boot-overlay';
    div.className = 'boot-overlay';
    div.setAttribute('role','presentation');
    // determine a friendly target label for the current page
    function pageLabel(){
      try{
        const p = (location.pathname||'').split('/').pop() || 'index.html';
        if(p === '' || p === 'index.html') return 'Opening Home';
        if(p === 'home.html') return 'Opening Home';
        if(p === 'get-started.html') return 'Opening Get Started';
        // fallback to document.title or filename
        const title = (document && document.title) ? document.title.replace(/\s*—.*$/,'') : p;
        return 'Opening ' + title;
      }catch(e){ return 'Opening site'; }
    }

    const subtitle = pageLabel();
    div.innerHTML = `
      <div class="boot-inner">
        <div class="boot-logo">ColorOS Ports</div>
        <div class="boot-sub">${subtitle}</div>
        <div class="boot-ring" aria-hidden="true">
          <svg class="spinner" viewBox="0 0 50 50" role="img" aria-label="Loading">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="#ff4081" stroke-width="4" stroke-linecap="round"></circle>
          </svg>
        </div>
      </div>`;
    return div;
  }

  function init(){
    // wait until DOM ready
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    // avoid duplicate
    if (document.getElementById('boot-overlay')) return;
    const overlay = createOverlay();
    // on mobile/home, optionally lock scroll for a cleaner single-screen home
    try{
      const p = (location.pathname||'').split('/').pop() || 'index.html';
      if (( 'ontouchstart' in window || window.innerWidth < 720) && (p === '' || p === 'index.html' || p === 'home.html')){
        document.body.classList.add('home-noscroll');
      }
    }catch(e){}
    // prepare for smooth transition: start transparent then fade in
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 360ms cubic-bezier(.2,.9,.2,1)';
    overlay.style.willChange = 'opacity';
    // store and lock overflow to prevent scrolling while overlay is visible
    let _savedRootOverflow = document.documentElement.style.overflow;
    let _savedBodyOverflow = document.body.style.overflow;
    let _savedBodyTouch = document.body.style.touchAction;
    document.body.appendChild(overlay);
    try{
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }catch(e){}
    // ensure paint before starting fade-in
    requestAnimationFrame(()=>{ overlay.style.opacity = '1'; });

    const hide = ()=>{
      // fade out and remove on transitionend for smoothness
      overlay.style.opacity = '0';
      overlay.setAttribute('aria-hidden','true');
      const onEnd = (e)=>{
        if (e.target !== overlay) return;
        overlay.removeEventListener('transitionend', onEnd);
        try{ overlay.remove(); }catch(e){}
        // restore locked overflow/touch-action
        try{
          document.documentElement.style.overflow = _savedRootOverflow || '';
          document.body.style.overflow = _savedBodyOverflow || '';
          document.body.style.touchAction = _savedBodyTouch || '';
        }catch(e){}
        // notify listeners that boot overlay finished
        try{ window.dispatchEvent(new CustomEvent('boot:done')); }catch(e){}
      };
      overlay.addEventListener('transitionend', onEnd, {passive:true});
    };
    // schedule hide; allow small rAF before starting timeout to avoid jank on very slow pages
    requestAnimationFrame(()=> setTimeout(hide, DURATION));
    overlay.addEventListener('click', hide, {passive:true});
  }

  // Expose init for manual call and auto-init
  if (typeof window !== 'undefined'){
    window.addEventListener('load', init);
  }

  /* auth UI removed */

  // One-time magic effect for first-time visitors on home page
  function isFirstVisit(){
    try{ return !localStorage.getItem('magicShown_v1'); }catch(e){ return false; }
  }
  function markMagicShown(){ try{ localStorage.setItem('magicShown_v1','1'); }catch(e){} }

  function runMagicEffect(){
    // skip heavy particle effect on touch devices / small screens
    if ('ontouchstart' in window || window.innerWidth < 720) return;
    if (!isFirstVisit()) return;
    const path = (location.pathname||'').split('/').pop() || 'index.html';
    if (!(path === '' || path === 'index.html' || path === 'home.html')) return;
    markMagicShown();
    const container = document.createElement('div');
    container.className = 'magic-overlay';
    document.body.appendChild(container);
    const colors = ['#ff6fa3','#ffb3d9','#7bd3ff','#9be7ff','#ffd88a'];
    const count = 22;
    for(let i=0;i<count;i++){
      const p = document.createElement('div');
      p.className = 'magic-particle ' + (i%3===0? 'large': (i%2===0?'small':''));
      const color = colors[i % colors.length];
      p.style.background = color;
      // random start position near center
      const x = 50 + (Math.random()*160 - 80);
      const y = 50 + (Math.random()*40 - 20);
      p.style.left = x + '%';
      p.style.top = y + '%';
      container.appendChild(p);
      // animate using WAAPI if available
      const dx = (Math.random()*360 - 180);
      const dy = -120 - Math.random()*160;
      const rot = (Math.random()*720 - 360);
      const dur = 900 + Math.random()*800;
      if (p.animate){
        p.animate([
          {transform:'translateY(0) scale(1)', opacity:1},
          {transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`, opacity:0}
        ],{duration:dur, easing:'cubic-bezier(.2,.9,.2,1)', fill:'forwards'});
      } else {
        // fallback: simple CSS transition
        p.style.transition = `transform ${dur}ms cubic-bezier(.2,.9,.2,1), opacity ${dur}ms linear`;
        setTimeout(()=>{ p.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`; p.style.opacity= '0'; }, 20);
      }
    }
    // cleanup after longest animation
    setTimeout(()=>{ try{ container.remove(); }catch(e){} }, 2200);
  }

  // trigger magic on boot finish
  window.addEventListener('boot:done', ()=>{
    try{ runMagicEffect(); }catch(e){}
  }, {passive:true});

  // Mouse parallax for hero: smooth, rAF-based, respects prefers-reduced-motion
  (function(){
    // Disable parallax on touch devices or small screens to improve mobile performance
    if ('ontouchstart' in window || window.innerWidth < 720) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = null;
    let lastX = 0, lastY = 0;
    const root = document.documentElement;
    function onMove(e){
      const hero = document.querySelector('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const x = ((e.clientX || (window.innerWidth/2)) - cx) / rect.width; // -0.5..0.5
      const y = ((e.clientY || (window.innerHeight/2)) - cy) / rect.height;
      lastX = x; lastY = y;
      if (raf) return;
      raf = requestAnimationFrame(()=>{
        raf = null;
        const title = document.querySelector('.title');
        const glow = document.querySelector('.glow');
        const cta = document.querySelector('.cta');
        const tx = lastX * 18; // px
        const ty = lastY * 18; // px
        if (title) title.style.transform = `translate3d(${tx}px, ${ty*0.6}px, 0) translateZ(0)`;
        if (glow) glow.style.transform = `translate3d(${tx*0.6}px, ${ty*0.4}px, 0) rotate(18deg)`;
        if (cta) cta.style.transform = `translate3d(${tx*0.25}px, ${ty*0.35}px, 0)`;
      });
    }
    function onLeave(){
      if (raf) cancelAnimationFrame(raf); raf = null;
      const title = document.querySelector('.title');
      const glow = document.querySelector('.glow');
      const cta = document.querySelector('.cta');
      if (title) title.style.transform = '';
      if (glow) glow.style.transform = '';
      if (cta) cta.style.transform = '';
    }
    document.addEventListener('mousemove', onMove, {passive:true});
    document.addEventListener('mouseleave', onLeave, {passive:true});
    // also reset on touchstart to avoid stuck transforms
    document.addEventListener('touchstart', onLeave, {passive:true});
  })();
})();

// Site-wide UI helpers (menu + theme toggle + page highlight)
document.addEventListener('DOMContentLoaded', ()=>{
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (menuToggle && siteNav) {
    const closeNav = () => {
      menuToggle.classList.remove('active');
      siteNav.classList.remove('active');
      document.body.style.overflow = '';
    };
    menuToggle.addEventListener('click', ()=>{
      menuToggle.classList.toggle('active');
      siteNav.classList.toggle('active');
      document.body.style.overflow = siteNav.classList.contains('active') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-link').forEach(link=>link.addEventListener('click', closeNav));
  }

  // Highlight current page in navigation
  const currentPage = location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'home.html') || (currentPage === 'index.html' && href === 'home.html')) {
      link.classList.add('active');
    }
  });

  const toggleBtn = document.querySelector('.theme-toggle');
  const body = document.body;
  const setTheme = (mode) => {
    const useLight = mode === 'light';
    body.classList.toggle('light-mode', useLight);
    if (toggleBtn) toggleBtn.textContent = useLight ? '🌙' : '☀️';
    localStorage.setItem('theme-preference', useLight ? 'light' : 'dark');
  };
  if (toggleBtn) {
    const stored = localStorage.getItem('theme-preference');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(stored || (prefersLight ? 'light' : 'dark'));
    toggleBtn.addEventListener('click', ()=>{
      const next = body.classList.contains('light-mode') ? 'dark' : 'light';
      setTheme(next);
    });
  }

  // AI Chat Assistant Widget
  const chatWidget = document.createElement('div');
  chatWidget.className = 'ai-chat-widget';
  chatWidget.innerHTML = `
    <button class="ai-chat-button" aria-label="Open AI Assistant">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
      </svg>
    </button>
    <div class="ai-chat-window">
      <div class="ai-chat-header">
        <div class="ai-chat-header-title">
          <div class="ai-chat-avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </div>
          <div class="ai-chat-info">
            <h3>ColorOS Ports AI</h3>
            <p>Ask me anything!</p>
          </div>
        </div>
        <button class="ai-chat-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages">
        <div class="ai-message ai">
          <div class="ai-message-avatar">🤖</div>
          <div class="ai-message-content">
            Hi! I'm your ColorOS Assistant. I can help you with ROM installation, device compatibility, and any questions about ColorOS/OxygenOS ports. How can I assist you today?
          </div>
        </div>
      </div>
      <div class="ai-chat-input-area">
        <input type="text" class="ai-chat-input" placeholder="Type your message..." aria-label="Chat message">
        <button class="ai-chat-send">Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(chatWidget);

  const chatButton = chatWidget.querySelector('.ai-chat-button');
  const chatWindow = chatWidget.querySelector('.ai-chat-window');
  const chatClose = chatWidget.querySelector('.ai-chat-close');
  const chatInput = chatWidget.querySelector('.ai-chat-input');
  const chatSend = chatWidget.querySelector('.ai-chat-send');
  const chatMessages = chatWidget.querySelector('#ai-chat-messages');

  chatButton.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      chatInput.focus();
    }
  });

  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${isUser ? 'user' : 'ai'}`;
    messageDiv.innerHTML = `
      <div class="ai-message-avatar">${isUser ? '👤' : '🤖'}</div>
      <div class="ai-message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    // Installation related
    if (msg.includes('install') || msg.includes('flash') || msg.includes('how to')) {
      return 'To install ColorOS/OxygenOS ROM:<br>1. Unlock bootloader<br>2. Boot into OrangeFox recovery<br>3. Wipe System, Data, Cache<br>4. Flash the ROM ZIP<br>5. Reboot<br><br>Check our <a href="installation.html" style="color:#00d9ff;">Installation Guide</a> for detailed steps!';
    }
    
    // Device compatibility
    if (msg.includes('device') || msg.includes('support') || msg.includes('compatible')) {
      return 'We support OnePlus 8, 8 Pro, 9, and 9 Pro devices. Check the <a href="devices.html" style="color:#00d9ff;">Devices page</a> for more details!';
    }
    
    // ROM download
    if (msg.includes('download') || msg.includes('rom') || msg.includes('link')) {
      return 'You can download ColorOS 16 and OxygenOS 16 ROMs from our <a href="roms.html" style="color:#00d9ff;">ROMs page</a>. Choose your device and preferred ROM version!';
    }
    
    // OnePlus 13
    if (msg.includes('oneplus 13') || msg.includes('op13') || msg.includes('13')) {
      return 'OnePlus 13 is shown on our site as a preview, but we don\'t currently support it for porting. Stay tuned for future updates!';
    }
    
    // Recovery
    if (msg.includes('recovery') || msg.includes('orangefox') || msg.includes('twrp')) {
      return 'We recommend using OrangeFox recovery for flashing ColorOS/OxygenOS ROMs. Download it from our installation guide and boot using: <code>fastboot boot orangefox.img</code>';
    }
    
    // Bootloader
    if (msg.includes('bootloader') || msg.includes('unlock')) {
      return 'You need an unlocked bootloader to install custom ROMs. This process varies by device. Make sure to backup your data before unlocking as it will wipe your device!';
    }
    
    // Default response
    return 'I can help you with ROM installation, device compatibility, downloads, and general questions about ColorOS/OxygenOS ports. What would you like to know?';
  }

  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    chatInput.value = '';

    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, false);
    }, 500);
  }

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
});
