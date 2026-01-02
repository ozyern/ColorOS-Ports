// New Year 2026 Decorations & Animations
// OxygenOS 16 Fluid Animation System

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    confettiCount: 20,
    fireworksInterval: 5000,
    sparkleCount: 10,
    snowflakeCount: 8,
    targetDate: new Date('2026-01-01T00:00:00').getTime()
  };

  // Initialize New Year effects
  function initNewYear() {
    createBadge();
    createContainers();
    createCountdown();
    createCelebrateButton();
    startConfetti();
    startFireworks();
    startSparkles();
    startSnowfall();
    addFluidInteractions();
  }

  // Create New Year badge
  function createBadge() {
    const badge = document.createElement('div');
    badge.className = 'ny-badge';
    badge.textContent = 'Happy New Year 2026!';
    badge.addEventListener('click', triggerCelebration);
    document.body.appendChild(badge);
  }

  // Create containers for effects
  function createContainers() {
    ['confetti-container', 'firework-container', 'sparkle-container'].forEach(className => {
      const container = document.createElement('div');
      container.className = className;
      document.body.appendChild(container);
    });
  }

  // Create countdown timer
  function createCountdown() {
    const now = new Date().getTime();
    const distance = CONFIG.targetDate - now;
    
    // Only show countdown if New Year hasn't passed
    if (distance > 0 && distance < 30 * 24 * 60 * 60 * 1000) { // Within 30 days
      const countdown = document.createElement('div');
      countdown.className = 'ny-countdown';
      countdown.innerHTML = `
        <span class="ny-countdown-label">🎉 New Year 2026</span>
        <div class="ny-countdown-timer">
          <div class="ny-countdown-unit">
            <span class="ny-countdown-value" id="days">--</span>
            <span class="ny-countdown-text">Days</span>
          </div>
          <div class="ny-countdown-unit">
            <span class="ny-countdown-value" id="hours">--</span>
            <span class="ny-countdown-text">Hours</span>
          </div>
          <div class="ny-countdown-unit">
            <span class="ny-countdown-value" id="minutes">--</span>
            <span class="ny-countdown-text">Mins</span>
          </div>
          <div class="ny-countdown-unit">
            <span class="ny-countdown-value" id="seconds">--</span>
            <span class="ny-countdown-text">Secs</span>
          </div>
        </div>
      `;
      document.body.appendChild(countdown);
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }
  }

  // Update countdown values
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = CONFIG.targetDate - now;

    if (distance < 0) {
      document.querySelector('.ny-countdown')?.remove();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    // Trigger celebration at midnight
    if (distance < 1000) {
      setTimeout(triggerMegaCelebration, 100);
    }
  }

  // Create celebrate button
  function createCelebrateButton() {
    const btn = document.createElement('button');
    btn.className = 'ny-celebrate-btn';
    btn.textContent = '🎆';
    btn.setAttribute('aria-label', 'Celebrate New Year');
    btn.addEventListener('click', triggerCelebration);
    document.body.appendChild(btn);
  }

  // Confetti animation
  function startConfetti() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;

    function createConfettiPiece() {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }

    // Create initial batch
    for (let i = 0; i < CONFIG.confettiCount; i++) {
      setTimeout(createConfettiPiece, Math.random() * 2000);
    }

    // Continue creating confetti (less frequently)
    setInterval(() => {
      if (Math.random() > 0.85) {
        createConfettiPiece();
      }
    }, 500);
  }

  // Fireworks animation
  function startFireworks() {
    const container = document.querySelector('.firework-container');
    if (!container) return;

    function createFirework() {
      const firework = document.createElement('div');
      firework.className = 'firework';
      
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight;
      firework.style.left = x + 'px';
      firework.style.top = y + 'px';

      const colors = ['#ffd700', '#ff69b4', '#00d9ff', '#ff4081', '#8a2be2', '#00ff88'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      firework.style.background = color;
      firework.style.boxShadow = `0 0 20px ${color}`;

      container.appendChild(firework);

      // Create explosion particles
      setTimeout(() => {
        createExplosion(x, y - 400, color);
        firework.remove();
      }, 1500);
    }

    function createExplosion(x, y, color) {
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;

        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        particle.style.setProperty('--vx', vx + 'px');
        particle.style.setProperty('--vy', vy + 'px');
        
        const tx = vx;
        const ty = vy;
        particle.style.transform = `translate(${tx}px, ${ty}px)`;

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }
    }

    // Launch fireworks periodically
    setInterval(() => {
      if (Math.random() > 0.5) {
        createFirework();
      }
    }, CONFIG.fireworksInterval);
  }

  // Sparkle stars animation
  function startSparkles() {
    const container = document.createElement('div');
    container.className = 'sparkle-container';
    document.body.appendChild(container);

    function createSparkle() {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 2 + 's';
      sparkle.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
      container.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 4000);
    }

    // Create sparkles periodically (less frequently)
    setInterval(() => {
      if (Math.random() > 0.9) {
        createSparkle();
      }
    }, 800);
  }

  // Snowfall animation
  function startSnowfall() {
    const snowflakes = ['❄', '❅', '❆'];
    
    function createSnowflake() {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      snowflake.style.left = Math.random() * 100 + '%';
      snowflake.style.fontSize = (Math.random() * 10 + 12) + 'px';
      snowflake.style.animationDuration = (Math.random() * 4 + 6) + 's';
      snowflake.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(snowflake);

      setTimeout(() => snowflake.remove(), 12000);
    }

    // Create snowflakes periodically
    for (let i = 0; i < CONFIG.snowflakeCount; i++) {
      setTimeout(createSnowflake, Math.random() * 5000);
    }

    setInterval(() => {
      if (Math.random() > 0.9) {
        createSnowflake();
      }
    }, 1000);
  }

  // Trigger celebration effect
  function triggerCelebration() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;

    // Create burst of confetti
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = (Math.random() * 100) + '%';
      confetti.style.animationDelay = (Math.random() * 0.5) + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }

    // Launch multiple fireworks
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const container = document.querySelector('.firework-container');
        if (!container) return;

        const firework = document.createElement('div');
        firework.className = 'firework';
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight;
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';

        const colors = ['#ffd700', '#ff69b4', '#00d9ff', '#ff4081', '#8a2be2'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        firework.style.background = color;
        firework.style.boxShadow = `0 0 20px ${color}`;

        container.appendChild(firework);
      }, i * 300);
    }
  }

  // Mega celebration for New Year midnight
  function triggerMegaCelebration() {
    // Massive confetti burst
    for (let i = 0; i < 5; i++) {
      setTimeout(() => triggerCelebration(), i * 500);
    }

    // Show special message
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      font-size: 48px;
      font-weight: 900;
      color: #ffd700;
      text-shadow: 0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(255,105,180,0.6);
      z-index: 10001;
      pointer-events: none;
      animation: megaMessagePop 3s cubic-bezier(0.33, 1, 0.68, 1) forwards;
    `;
    message.textContent = '🎉 HAPPY NEW YEAR 2026! 🎆';
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 5000);
  }

  // Add fluid interactions (OxygenOS 16 style)
  function addFluidInteractions() {
    // Add ripple effect to clickable elements
    document.addEventListener('click', function(e) {
      const clickable = e.target.closest('a, button, .cta, .nav-link, .card');
      if (!clickable) return;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = clickable.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      clickable.style.position = 'relative';
      clickable.style.overflow = 'hidden';
      clickable.appendChild(ripple);

      setTimeout(() => ripple.remove(), 800);
    });

    // Enhanced hover effects with fluid scaling
    const interactiveElements = document.querySelectorAll('a, button, .cta, .nav-link, .card, .device-card, .rom-card');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
      });

      el.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });

      el.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.96)';
      });

      el.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
      });
    });

    // Smooth scroll with easing
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Parallax effect on scroll (fluid motion)
    let ticking = false;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax(lastScrollY);
          ticking = false;
        });
        ticking = true;
      }
    });

    function updateParallax(scrollY) {
      const glow = document.querySelector('.glow');
      if (glow) {
        glow.style.transform = `translateX(-50%) translateY(${scrollY * 0.3}px)`;
      }

      const heroElements = document.querySelectorAll('.hero .title, .hero .sub, .hero .cta-row');
      heroElements.forEach((el, index) => {
        el.style.transform = `translateY(${scrollY * (0.1 * (index + 1))}px)`;
      });
    }
  }

  // Add CSS animation for mega message
  const style = document.createElement('style');
  style.textContent = `
    @keyframes megaMessagePop {
      0% {
        transform: translate(-50%, -50%) scale(0) rotate(-10deg);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
        opacity: 1;
      }
      70% {
        transform: translate(-50%, -50%) scale(0.95) rotate(-2deg);
      }
      100% {
        transform: translate(-50%, -50%) scale(1) rotate(0deg);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewYear);
  } else {
    initNewYear();
  }

})();
