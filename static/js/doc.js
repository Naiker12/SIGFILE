document.addEventListener("DOMContentLoaded", function () {
  const navTabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".section");

  navTabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      navTabs.forEach((t) => {
        t.classList.remove("active");
        t.style.transform = "scale(1)";
      });
      
      sections.forEach((s) => {
        s.style.opacity = "0";
        setTimeout(() => s.classList.remove("active"), 150);
      });

      this.classList.add("active");
      this.style.transform = "scale(1.05)";
      setTimeout(() => this.style.transform = "scale(1)", 200);


      const sectionId = this.getAttribute("data-section");
      const targetSection = document.getElementById(sectionId);
      
      setTimeout(() => {
        targetSection.classList.add("active");
        targetSection.style.opacity = "1";
      }, 150);

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    tab.addEventListener("mouseenter", function() {
      if (!this.classList.contains("active")) {
        this.style.transform = "translateY(-2px) scale(1.02)";
      }
    });

    tab.addEventListener("mouseleave", function() {
      if (!this.classList.contains("active")) {
        this.style.transform = "translateY(0) scale(1)";
      }
    });
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -30px 0px",
  };

  const animateOnScroll = new IntersectionObserver(function (entries) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          entry.target.classList.add("animate-in");
        }, index * 100);
      }
    });
  }, observerOptions);


  const animatedElements = document.querySelectorAll(
    ".card, .step-card, .format-card, .tech-card, .stat-card"
  );

  animatedElements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    element.style.transitionDelay = `${index * 0.05}s`;
    animateOnScroll.observe(element);
  });

  const interactiveElements = document.querySelectorAll(
    ".card, .step-card, .format-card, .tech-card"
  );

  interactiveElements.forEach((element) => {
    let hoverTimeout;

    element.addEventListener("mouseenter", function () {
      clearTimeout(hoverTimeout);
      this.style.transform = "translateY(-8px) scale(1.02)";
      this.style.zIndex = "10";

      if (this.classList.contains("card")) {
        this.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
      }
    });

    element.addEventListener("mouseleave", function () {
      hoverTimeout = setTimeout(() => {
        this.style.transform = "translateY(0) scale(1)";
        this.style.zIndex = "1";
        this.style.boxShadow = "";
      }, 50);
    });
  });

  interactiveElements.forEach((element) => {
    element.addEventListener("mousedown", function() {
      this.style.transform = "translateY(-6px) scale(0.98)";
    });

    element.addEventListener("mouseup", function() {
      this.style.transform = "translateY(-8px) scale(1.02)";
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  const header = document.querySelector(".header");
  if (header) {
    header.style.opacity = "0";
    header.style.transform = "translateY(-20px)";
    
    setTimeout(() => {
      header.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      header.style.opacity = "1";
      header.style.transform = "translateY(0)";
    }, 100);
  }

  navTabs.forEach((tab, index) => {
    tab.style.opacity = "0";
    tab.style.transform = "translateY(-10px)";
    
    setTimeout(() => {
      tab.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      tab.style.opacity = "1";
      tab.style.transform = "translateY(0)";
    }, 300 + (index * 100));
  });


  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");
    
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.animation = "ripple-animation 0.6s linear";
    ripple.style.pointerEvents = "none";
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    .animate-in {
      animation: slideInUp 0.6s ease forwards;
    }
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Additional animations */
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Enhanced hover states */
    .nav-tab:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    .card:hover {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
      }
    }
  `;
  document.head.appendChild(style);

  navTabs.forEach((tab) => {
    tab.style.position = "relative";
    tab.style.overflow = "hidden";
    tab.addEventListener("click", createRipple);
  });

  navTabs.forEach((tab, index) => {
    tab.setAttribute("tabindex", "0");
    tab.setAttribute("role", "tab");
    tab.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextTab = navTabs[(index + 1) % navTabs.length];
        nextTab.focus();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevTab = navTabs[(index - 1 + navTabs.length) % navTabs.length];
        prevTab.focus();
      }
    });
  });

  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`📊 Documentation loaded in ${loadTime}ms`);
      
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log(`🚀 Performance Metrics:
          DNS Lookup: ${perfData.domainLookupEnd - perfData.domainLookupStart}ms
          Connect: ${perfData.connectEnd - perfData.connectStart}ms
          Response: ${perfData.responseEnd - perfData.responseStart}ms
          DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
      }
    });
  }

  const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
      z-index: 1000;
      transition: width 0.1s ease;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    `;
    document.body.appendChild(progressBar);

    let ticking = false;
    
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      progressBar.style.width = scrollPercent + '%';
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    });
  };

  createScrollProgress();

  const trackSectionVisibility = () => {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const correspondingTab = document.querySelector(`[data-section="${sectionId}"]`);
          
          if (correspondingTab) {
            navTabs.forEach(tab => tab.classList.remove('current-section'));
            correspondingTab.classList.add('current-section');
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-50px 0px -50px 0px'
    });

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  };

  trackSectionVisibility();


  const detectTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-theme', prefersDark);
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      document.body.classList.toggle('dark-theme', e.matches);
    });
  };

  detectTheme();

  const showLoadingComplete = () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
      console.log('🎉 All animations and interactions ready!');
    }, 1000);
  };

  showLoadingComplete();

  const validateElements = () => {
    if (navTabs.length === 0) {
      console.warn('⚠️ No navigation tabs found');
    }
    if (sections.length === 0) {
      console.warn('⚠️ No sections found');
    }
    if (navTabs.length !== sections.length) {
      console.warn('⚠️ Mismatch between tabs and sections count');
    }
  };

  validateElements();

  const addTouchSupport = () => {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const activeTabIndex = Array.from(navTabs).findIndex(tab => tab.classList.contains('active'));
      
      if (touchEndX < touchStartX - swipeThreshold && activeTabIndex < navTabs.length - 1) {
        navTabs[activeTabIndex + 1].click();
      }
      
      if (touchEndX > touchStartX + swipeThreshold && activeTabIndex > 0) {
        navTabs[activeTabIndex - 1].click();
      }
    };
  };

  addTouchSupport();
});