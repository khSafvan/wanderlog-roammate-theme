// Roammate Theme v6 – Safe Native Integration
(() => {
  const DAY_RE = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\d{1,2}\/\d{1,2}/;
  let built = false;
  let dayButtons = [];   
  let navButtons = [];   
  let sections = [];     

  function activateDay(idx) {
    document.querySelectorAll('.rm-tab').forEach((t, i) =>
      t.classList.toggle('active', i === idx + 1)
    );
    if (idx === -1) document.querySelector('.rm-tab')?.classList.add('active');

    sections.forEach((sec, i) => {
      const wrapper = sec.closest('.PlanItinerary > div') || sec.parentElement?.parentElement;
      if (idx === -1 || i === idx) {
        sec.classList.remove('rm-hide');
        if (wrapper) wrapper.style.display = '';
      } else {
        sec.classList.add('rm-hide');
        if (wrapper) wrapper.style.display = 'none';
      }
    });

    // Native map sync
    if (idx >= 0 && dayButtons[idx]) {
      try { dayButtons[idx].click(); } catch(e){}
    }
  }

  function activateNav(idx) {
    document.querySelectorAll('.rm-nav-btn').forEach((b, i) =>
      b.classList.toggle('active', i === idx)
    );
    if (navButtons[idx]) {
      try { navButtons[idx].click(); } catch(e){}
    }
  }

  function build(navLabels, dayLabels) {
    if (built) return;
    built = true;

    const bar = document.createElement('div');
    bar.id = 'rm-bar';

    const row1 = document.createElement('div');
    row1.className = 'rm-row1';

    const logo = document.createElement('div');
    logo.className = 'rm-logo';
    logo.textContent = '🎒 Roammate';
    row1.appendChild(logo);

    const nav = document.createElement('div');
    nav.className = 'rm-nav';
    navLabels.forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className = 'rm-nav-btn';
      btn.textContent = label;
      btn.onclick = () => activateNav(i);
      nav.appendChild(btn);
    });
    row1.appendChild(nav);
    bar.appendChild(row1);

    const row2 = document.createElement('div');
    row2.className = 'rm-row2';

    const allBtn = document.createElement('button');
    allBtn.className = 'rm-tab active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => activateDay(-1);
    row2.appendChild(allBtn);

    dayLabels.forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className = 'rm-tab';
      btn.textContent = label;
      btn.onclick = () => activateDay(i);
      row2.appendChild(btn);
    });

    bar.appendChild(row2);
    document.body.appendChild(bar);
  }

  function hideNativeUI() {
    // Safely hide the sidebar DOM nodes AFTER React has mounted them
    document.querySelectorAll('.FixedPlanSidebar, .PlanWideNavSidebar, .PlanNarrowNavSidebar, .NavbarContainer').forEach(el => {
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.width = '0';
    });
    
    // Hide assistant button
    document.querySelectorAll('button').forEach(btn => {
      if (btn.querySelector('svg[data-icon="wand-magic-sparkles"]') || btn.className.includes('Assistant')) {
        btn.style.display = 'none';
      }
    });
  }

  const interval = setInterval(() => {
    // 1. Broadly target ANY sidebar item
    if (navButtons.length === 0) {
      const items = document.querySelectorAll('.NavSidebarItem');
      const found = [];
      items.forEach(btn => {
        const text = btn.textContent.trim();
        if (!DAY_RE.test(text) && text !== 'View' && text.length > 1 && text.length < 30) {
          found.push(btn);
        }
      });
      if (found.length > 0) navButtons = found;
    }

    if (dayButtons.length === 0) {
      const items = document.querySelectorAll('.NavSidebarItem');
      const found = [];
      items.forEach(btn => {
        const text = btn.textContent.trim();
        if (DAY_RE.test(text)) found.push(btn);
      });
      if (found.length > 0) dayButtons = found;
    }

    if (sections.length === 0) {
      const secs = document.querySelectorAll('.SectionComponent:not(.SectionComponent__textOnly)');
      if (secs.length > 0) sections = [...secs];
    }

    if (navButtons.length > 0 && dayButtons.length > 0 && !built) {
      const navLabels = navButtons.map(btn => btn.textContent.trim());
      const dayLabels = dayButtons.map(btn => {
        const match = btn.textContent.trim().match(/^((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\d{1,2}\/\d{1,2})/);
        return match ? match[1] : 'Day';
      });
      build(navLabels, dayLabels);
    }

    if (built) {
      hideNativeUI();
      // Click route lines if button exists
      for (const btn of document.querySelectorAll('.Button')) {
        if (btn.textContent.trim() === 'Always show route lines') {
          try { btn.click(); } catch(e){}
          break;
        }
      }
      clearInterval(interval);
    }
  }, 1000);
})();
