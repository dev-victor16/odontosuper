/**
 * ODONTO SUPER IBIRITÉ — JAVASCRIPT PRINCIPAL
 * Fluidez de scroll, status em tempo real com sábados e agendamento direto via WhatsApp
 * Rua Freitas de Oliveira, 59 — Lojas 01 e 02 — Centro, Ibirité - MG
 * Tel/WhatsApp: (31) 99706-9312
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initHeaderScroll();
  initClinicStatus();
  initParallax();
  initModal();
  initMobileMenu();
  initSmoothScroll();
});

/* 1. SCROLL REVEAL SUAVE & NATURAL */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  elements.forEach(el => observer.observe(el));
}

/* 2. HEADER COMPACTO NA ROLAGEM */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 25) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* 3. STATUS DA CLÍNICA EM TEMPO REAL (SEG-SEX 8-18h | SÁB 8-12h) */
function initClinicStatus() {
  const statusEls = document.querySelectorAll('.live-status, .drawer-status-pill');
  if (!statusEls.length) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sáb
  const time = now.getHours() + now.getMinutes() / 60;

  let isOpen = false;
  let msg = '';

  if (day >= 1 && day <= 5) {
    // Segunda a Sexta: 08:00 às 18:00
    if (time >= 8.0 && time < 18.0) {
      isOpen = true;
      msg = 'Aberto hoje até 18h';
    } else if (time < 8.0) {
      msg = 'Abre hoje às 08h';
    } else {
      msg = day === 5 ? 'Abre amanhã (sáb) às 08h' : 'Abre amanhã às 08h';
    }
  } else if (day === 6) {
    // Sábado: 08:00 às 12:00
    if (time >= 8.0 && time < 12.0) {
      isOpen = true;
      msg = 'Aberto hoje até 12h';
    } else if (time < 8.0) {
      msg = 'Abre hoje às 08h';
    } else {
      msg = 'Abre segunda às 08h';
    }
  } else {
    // Domingo: Fechado
    msg = 'Abre amanhã às 08h';
  }

  statusEls.forEach(statusEl => {
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');
    if (text) text.textContent = msg;
    if (dot) {
      dot.style.background = isOpen ? '#25D366' : '#64748B';
      dot.style.boxShadow = isOpen ? '0 0 0 2px rgba(37, 211, 102, 0.25)' : 'none';
    }
  });
}

/* 4. PARALLAX SUTIL EM IMAGENS */
function initParallax() {
  if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;
    items.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.04;
      if (rect.top < vh && rect.bottom > 0) {
        const offset = (rect.top - vh / 2) * speed;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      }
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* 5. MODAL DE AGENDAMENTO VIA WHATSAPP OFICIAL */
function initModal() {
  const modal = document.getElementById('modalAgendamento');
  if (!modal) return;

  const openBtns = document.querySelectorAll('[data-open-modal="agendamento"]');
  const closeBtn = modal.querySelector('.modal-close');
  const form = document.getElementById('formAgendamento');

  const open = () => {
    const drawer = document.querySelector('.mobile-drawer-clean');
    const drawerBg = document.querySelector('.mobile-drawer-backdrop');
    if (drawer) drawer.classList.remove('is-open');
    if (drawerBg) drawerBg.classList.remove('is-open');
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) close();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = form.querySelector('#inputNome')?.value.trim() || '';
      const servico = form.querySelector('#inputServico')?.value || 'Avaliação Geral';

      let text = `Olá! Meu nome é *${nome}*.\n`;
      text += `Gostaria de agendar uma avaliação na Odonto Super Ibirité para *${servico}*.`;

      const url = `https://wa.me/5531997069312?text=${encodeURIComponent(text)}`;
      close();
      window.open(url, '_blank');
    });
  }
}

/* 6. MENU MOBILE / BARRA LATERAL (DRAWER) */
function initMobileMenu() {
  const btn = document.querySelector('.nav-toggle-btn');
  const drawer = document.querySelector('.mobile-drawer-clean');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const links = document.querySelectorAll('.mobile-drawer-clean a');

  if (!btn || !drawer) return;

  const toggle = (state) => {
    drawer.classList.toggle('is-open', state);
    if (backdrop) backdrop.classList.toggle('is-open', state);
    document.body.style.overflow = state ? 'hidden' : '';
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(true);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggle(false);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => toggle(false));
  }

  links.forEach(l => {
    l.addEventListener('click', () => {
      toggle(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      toggle(false);
    }
  });
}

/* 7. SCROLL SUAVE PARA LINKS INTERNOS */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.site-header')?.offsetHeight || 75;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - headerH,
          behavior: 'smooth'
        });
      }
    });
  });
}
