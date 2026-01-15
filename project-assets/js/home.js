
// UIAM - 02031998
(function ($) {
    "use strict"; 

 function animateCounter(el, target, suffix = '') {
      let start = 0;
      const duration = 1500; // total animation time
      const stepTime = 15; // interval delay
      const increment = target / (duration / stepTime);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(start) + suffix;
      }, stepTime);
    }

    // Intersection Observer to trigger counter when visible
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.heading');
          counters.forEach(counter => {
            const target = parseInt(counter.dataset.target, 10);
            const suffix = counter.dataset.suffix || '';
            animateCounter(counter, target, suffix);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    const section = document.getElementById('faxCounter');
    observer.observe(section);
  

    // tab
const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.cus-tab-panel');
  const tabImages = document.querySelectorAll('.cus-tab-image');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active from all
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      tabImages.forEach(img => img.classList.remove('active'));

      // Add active to selected
      button.classList.add('active');
      document.querySelector(button.dataset.target).classList.add('active');
      document.querySelector(button.dataset.img).classList.add('active');
    });
  });

/* Accessible tab behavior: click + keyboard navigation (ArrowLeft/ArrowRight/Home/End) */
(function(){
  const tabsRoot = document.getElementById('cusTabs');
  const tablist = tabsRoot.querySelector('[role="tablist"]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabsRoot.querySelectorAll('[role="tabpanel"]');

  function activateTab(newTab, setFocus = true){
    // deactivate all
    tabs.forEach(t => {
      t.setAttribute('aria-selected','false');
      t.setAttribute('tabindex','-1');
    });
    panels.forEach(p => {
      p.hidden = true;
      p.classList.remove('is-active');
    });

    // activate selected
    newTab.setAttribute('aria-selected','true');
    newTab.setAttribute('tabindex','0');
    if(setFocus) newTab.focus();

    const panelId = newTab.getAttribute('data-target');
    const panel = document.getElementById(panelId);
    if(panel){
      panel.hidden = false;
      panel.classList.add('is-active');
    }
  }

  // click handler
  tablist.addEventListener('click', (e) => {
    const clicked = e.target.closest('[role="tab"]');
    if(!clicked) return;
    activateTab(clicked, false);
  });

  // keyboard nav
  tablist.addEventListener('keydown', (e) => {
    const current = document.activeElement;
    if(current.getAttribute('role') !== 'tab') return;

    let idx = tabs.indexOf(current);
    if(idx === -1) return;

    switch(e.key){
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        activateTab(tabs[(idx+1) % tabs.length]);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        activateTab(tabs[(idx-1 + tabs.length) % tabs.length]);
        break;
      case 'Home':
        e.preventDefault();
        activateTab(tabs[0]);
        break;
      case 'End':
        e.preventDefault();
        activateTab(tabs[tabs.length-1]);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activateTab(current);
        break;
    }
  });

  // ensure initial panel visibility matches selected tab
  const initiallySelected = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  activateTab(initiallySelected, false);
})();


  
})(jQuery);

// UIAM - 02031998 End
