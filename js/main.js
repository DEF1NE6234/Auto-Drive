// ===== MENU =====
const burgerBtn = document.getElementById('burgerBtn');
const navTablet = document.getElementById('navTablet');
const navMobile = document.getElementById('navMobile');
const closeTablet = document.getElementById('closeTablet');
const closeMobile = document.getElementById('closeMobile');

function isMobile() {
  return window.innerWidth <= 744;
}

function openMenu() {
  if (isMobile()) {
    navMobile.classList.add('open');
    document.body.classList.add('menu-open');
  } else {
    navTablet.classList.add('open');
  }
  burgerBtn.classList.add('active');
}

function closeMenu() {
  navTablet.classList.remove('open');
  navMobile.classList.remove('open');
  burgerBtn.classList.remove('active');
  document.body.classList.remove('menu-open');
}

burgerBtn.addEventListener('click', () => {
  const isOpen = navTablet.classList.contains('open') || navMobile.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

closeTablet.addEventListener('click', closeMenu);
closeMobile.addEventListener('click', closeMenu);
window.addEventListener('resize', closeMenu);

function goHome(scrollTop = true) {
  closeMenu();
  if (document.body.classList.contains('catalog-page-mode') && window.autoDriveCloseCatalogPage) {
    window.autoDriveCloseCatalogPage(scrollTop);
  } else if (scrollTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  updateActiveNav('home');
}

function scrollToSection(sectionId) {
  closeMenu();
  if (document.body.classList.contains('catalog-page-mode') && window.autoDriveCloseCatalogPage) {
    window.autoDriveCloseCatalogPage(false);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } else {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateActiveNav(sectionId);
}

function updateActiveNav(sectionId) {
  const activeKey = document.body.classList.contains('catalog-page-mode') ? 'catalog' : sectionId;
  document.querySelectorAll('[data-nav-section], [data-nav-home]').forEach((link) => {
    const isHome = link.hasAttribute('data-nav-home');
    const section = link.dataset.navSection;
    link.classList.toggle('is-active', activeKey === 'home' ? isHome : section === activeKey);
  });
}

document.querySelectorAll('[data-nav-home]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    goHome();
  });
});

document.querySelectorAll('[data-nav-section]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection(trigger.dataset.navSection);
  });
});

const sectionObserver = new IntersectionObserver((entries) => {
  if (document.body.classList.contains('catalog-page-mode')) return;
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) updateActiveNav(visible.target.id);
}, { rootMargin: '-30% 0px -55% 0px', threshold: [0.15, 0.35, 0.55] });

['catalog', 'services', 'promotions', 'about', 'contacts'].forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

updateActiveNav('home');

document.querySelectorAll('[data-scroll-to="catalog"]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection('catalog');
  });
});

// ===== HERO SLIDER =====
const slides = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn = document.getElementById('sliderPrev');
const nextBtn = document.getElementById('sliderNext');

let current = 0;
let timer = null;
const DELAY = 3000;
const TOTAL = slides.length;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Слайд ${i + 1}`);
  dot.addEventListener('click', () => goTo(i, true));
  dotsWrap.appendChild(dot);
});

function getDots() {
  return dotsWrap.querySelectorAll('.slider-dot');
}

function goTo(index, resetTimer = false) {
  const next = ((index % TOTAL) + TOTAL) % TOTAL;

  slides[current].classList.remove('active');
  getDots()[current].classList.remove('active');

  current = next;

  slides[current].classList.add('active');
  getDots()[current].classList.add('active');

  if (resetTimer) {
    clearInterval(timer);
    startAuto();
  }
}

function startAuto() {
  timer = setInterval(() => goTo(current + 1), DELAY);
}

if (TOTAL > 0) {
  startAuto();
}

prevBtn.addEventListener('click', () => goTo(current - 1, true));
nextBtn.addEventListener('click', () => goTo(current + 1, true));

// ===== CATALOG FILTERS + SLIDER =====
const catalogSlider = document.querySelector('.catalog-slider');
const catalogTrack = document.getElementById('catalogTrack');
let catalogCards = Array.from(document.querySelectorAll('.car-card'));
const catalogFilters = document.querySelectorAll('.catalog-filter, .catalog-view-all');
const catalogPrev = document.getElementById('catalogPrev');
const catalogNext = document.getElementById('catalogNext');

let activeCatalogCards = [...catalogCards];
let catalogIndex = 0;

// ===== INJECT FILTER TOGGLE BUTTON =====
const filtersWrapper = document.querySelector('.catalog-filters-wrapper');
const filtersEl = filtersWrapper.querySelector('.catalog-filters');

// Create toggle button (two vertical lines with circles — filter icon)
const filterToggleBtn = document.createElement('button');
filterToggleBtn.className = 'catalog-filter-toggle';
filterToggleBtn.setAttribute('type', 'button');
filterToggleBtn.setAttribute('aria-label', 'Фільтри');
filterToggleBtn.innerHTML = `
  <span class="filter-toggle-icon" aria-hidden="true">
    <span class="ftl ftl-1"></span>
    <span class="ftl ftl-2"></span>
  </span>`;
filtersWrapper.insertBefore(filterToggleBtn, filtersEl);

// Make filters a dropdown on tablet/mobile
filtersEl.classList.add('catalog-filters--dropdown');

filterToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  filtersEl.classList.toggle('dropdown-open');
});

document.addEventListener('click', (e) => {
  if (!filtersWrapper.contains(e.target)) {
    filtersEl.classList.remove('dropdown-open');
  }
});

function getVisibleCount() {
  if (window.innerWidth <= 744) return 1;
  if (window.innerWidth <= 1279) return 2;
  return 3;
}

function getHomeCategory(car) {
  if (car.fuel === 'Електро') return 'electric';
  if (car.year >= 2023 || car.badges?.includes('Нове')) return 'new';
  if (car.price >= 2500000 || car.badges?.includes('Преміум')) return 'premium';
  return 'used';
}

function renderHomeCard(car) {
  const category = getHomeCategory(car);
  const labels = {
    all: 'Авто',
    new: 'Нове авто',
    used: 'З пробігом',
    premium: 'Преміум',
    electric: 'Електроавтомобіль'
  };

  return `
    <article class="car-card" data-category="${category}">
      <img class="car-card__image" src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy" />
      <div class="car-card__body">
        <p class="car-card__category">${labels[category]}</p>
        <h3 class="car-card__name">${car.brand} ${car.model}</h3>
        <p class="car-card__price">від ${new Intl.NumberFormat('uk-UA').format(car.price)} грн</p>
        <div class="car-card__specs">
          <span class="spec-item">
            <svg class="spec-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15M7 10h6M6 21h10M16 8h1.3a2 2 0 0 1 1.7 1l1.2 2.2a2 2 0 0 1 .2.9V17a2 2 0 0 1-2 2H16" /></svg>
            ${car.engine || 'Н/д'}
          </span>
          <span class="spec-item">
            <svg class="spec-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="17" y="3" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><line x1="5" y1="7" x2="5" y2="10"/><line x1="12" y1="7" x2="12" y2="10"/><line x1="12" y1="14" x2="12" y2="17"/></svg>
            ${car.gearbox || 'Н/д'}
          </span>
          <span class="spec-item">
            <svg class="spec-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
            ${car.drive || 'Н/д'}
          </span>
        </div>
      </div>
    </article>
  `;
}

function renderHomeCatalog(cars) {
  if (!catalogTrack) return;
  const currentFilter = document.querySelector('.catalog-filter.active')?.dataset.filter || 'all';
  catalogTrack.innerHTML = cars.map(renderHomeCard).join('');
  catalogCards = Array.from(document.querySelectorAll('.car-card'));
  setCatalogFilter(currentFilter);
}

function updateCatalogSlider() {
  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(activeCatalogCards.length - visibleCount, 0);
  catalogIndex = Math.min(catalogIndex, maxIndex);

  const shouldShowArrows = activeCatalogCards.length > visibleCount;
  catalogSlider.classList.toggle('no-arrows', !shouldShowArrows);

  if (!shouldShowArrows) {
    catalogTrack.style.transform = 'translateX(0)';
    catalogPrev.disabled = true;
    catalogNext.disabled = true;
    return;
  }

  const firstCard = activeCatalogCards[0];
  const gap = parseFloat(getComputedStyle(catalogTrack).columnGap || getComputedStyle(catalogTrack).gap) || 0;
  const step = firstCard.getBoundingClientRect().width + gap;

  catalogTrack.style.transform = `translateX(${-catalogIndex * step}px)`;
  catalogPrev.disabled = catalogIndex === 0;
  catalogNext.disabled = catalogIndex >= maxIndex;
}

function setCatalogFilter(category) {
  activeCatalogCards = [];
  catalogIndex = 0;

  catalogCards.forEach((card) => {
    const isVisible = category === 'all' || card.dataset.category === category;
    card.hidden = !isVisible;

    if (isVisible) {
      activeCatalogCards.push(card);
    }
  });

  document.querySelectorAll('.catalog-filter, .catalog-view-all').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === category);
  });

  // Close dropdown after selection
  filtersEl.classList.remove('dropdown-open');

  updateCatalogSlider();
}

document.querySelectorAll('.catalog-filter').forEach((button) => {
  button.addEventListener('click', () => {
    setCatalogFilter(button.dataset.filter);
  });
});

catalogPrev.addEventListener('click', () => {
  catalogIndex = Math.max(catalogIndex - 1, 0);
  updateCatalogSlider();
});

catalogNext.addEventListener('click', () => {
  const maxIndex = Math.max(activeCatalogCards.length - getVisibleCount(), 0);
  catalogIndex = Math.min(catalogIndex + 1, maxIndex);
  updateCatalogSlider();
});

window.addEventListener('resize', updateCatalogSlider);
updateCatalogSlider();

// ===== PROMOTIONS SLIDER =====
const promotionSlides = Array.from(document.querySelectorAll('.promotion-slide'));
const promotionPrevButtons = document.querySelectorAll('#promotionPrev, .promotion-prev-clone');
const promotionNextButtons = document.querySelectorAll('#promotionNext, .promotion-next-clone');

let promotionIndex = 0;

function updatePromotionsSlider() {
  promotionSlides.forEach((slide, index) => {
    slide.classList.toggle('active', index === promotionIndex);
  });
}

function goToPromotion(direction) {
  const total = promotionSlides.length;
  promotionIndex = (promotionIndex + direction + total) % total;
  updatePromotionsSlider();
}

promotionPrevButtons.forEach((button) => {
  button.addEventListener('click', () => goToPromotion(-1));
});

promotionNextButtons.forEach((button) => {
  button.addEventListener('click', () => goToPromotion(1));
});

updatePromotionsSlider();

const promotionsSection = document.getElementById('promotions');
const promotionCollapse = document.getElementById('promotionCollapse');

function collapsePromotion() {
  if (!promotionsSection || !promotionCollapse) return;
  promotionsSection.classList.add('is-collapsed');
  promotionCollapse.hidden = false;
  promotionCollapse.setAttribute('aria-label', 'Розгорнути акцію');
}

function expandPromotion() {
  if (!promotionsSection || !promotionCollapse) return;
  promotionsSection.classList.remove('is-collapsed');
  promotionCollapse.hidden = true;
  promotionCollapse.setAttribute('aria-label', 'Згорнути акцію');
}

if (promotionsSection && promotionCollapse) {
  promotionCollapse.addEventListener('click', expandPromotion);
}

// ===== SERVICES MOBILE SLIDER =====
const servicesTrack = document.getElementById('servicesTrack');
const serviceCards = Array.from(document.querySelectorAll('.service-card'));
const servicesPrev = document.getElementById('servicesPrev');
const servicesNext = document.getElementById('servicesNext');
const servicesDots = document.getElementById('servicesDots');

let servicesIndex = 0;

serviceCards.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = 'services-dot' + (index === 0 ? ' active' : '');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Послуга ${index + 1}`);
  dot.addEventListener('click', () => {
    servicesIndex = index;
    updateServicesSlider();
  });
  servicesDots.appendChild(dot);
});

function updateServicesSlider() {
  if (window.innerWidth > 744) {
    servicesTrack.style.transform = '';
    servicesPrev.disabled = true;
    servicesNext.disabled = true;
    servicesIndex = 0;
  } else {
    const maxIndex = Math.max(serviceCards.length - 1, 0);
    servicesIndex = Math.min(Math.max(servicesIndex, 0), maxIndex);
    const step = serviceCards[0].getBoundingClientRect().width;

    servicesTrack.style.transform = `translateX(${-servicesIndex * step}px)`;
    servicesPrev.disabled = servicesIndex === 0;
    servicesNext.disabled = servicesIndex === maxIndex;
  }

  servicesDots.querySelectorAll('.services-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === servicesIndex);
  });
}

servicesPrev.addEventListener('click', () => {
  servicesIndex -= 1;
  updateServicesSlider();
});

servicesNext.addEventListener('click', () => {
  servicesIndex += 1;
  updateServicesSlider();
});

window.addEventListener('resize', updateServicesSlider);
updateServicesSlider();

// ===== FOOTER MOBILE ACCORDION =====
document.querySelectorAll('.footer-group__toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    if (window.innerWidth > 744) return;

    const group = toggle.closest('.footer-group');
    const isOpen = group.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 744) {
    document.querySelectorAll('.footer-group').forEach((group) => {
      group.classList.remove('open');
      group.querySelector('.footer-group__toggle').setAttribute('aria-expanded', 'false');
    });
  }
});

// ===== MODALS, CALLBACK FORM, NEWSLETTER =====
(() => {
  const callbackModal = document.getElementById('callbackModal');
  const promoDetailModal = document.getElementById('promoDetailModal');
  const callbackForm = document.getElementById('callbackForm');
  const callbackResult = document.getElementById('callbackResult');
  const toast = document.getElementById('siteToast');
  let toastTimer = null;

  const promoDetails = {
    summer: {
      title: 'Літнє обслуговування <mark>-20%</mark>',
      image: 'images/hero1.jpg',
      text: 'Підготуйте автомобіль до спеки, міських поїздок і довгих маршрутів. Ми перевіримо <strong>ходову, гальма, кондиціонер</strong> та рідини без зайвого поспіху.',
      list: ['Знижка діє на комплексну діагностику та базове ТО.', 'Рекомендації майстра після огляду без прихованих робіт.', 'Зручний запис на ранок, день або вечір.']
    },
    diagnostics: {
      title: 'Безкоштовна <mark>діагностика</mark>',
      image: 'images/hero2.jpg',
      text: 'Перед покупкою або подорожжю варто знати реальний стан авто. Перевіримо ключові системи й пояснимо результат <strong>людською мовою</strong>.',
      list: ['Компʼютерна перевірка помилок.', 'Огляд двигуна, підвіски та електроніки.', 'Короткий список пріоритетів для ремонту.']
    },
    tires: {
      title: 'Шиномонтаж <mark>з вигодою</mark>',
      image: 'images/hero3.jpg',
      text: 'Оновіть сезонний комплект шин і отримайте акуратний сервіс коліс без черг. Особливо корисно перед активними поїздками містом і трасою.',
      list: ['Професійне балансування.', 'Перевірка тиску та стану гуми.', 'Знижка на зберігання комплекту.']
    },
    tradein: {
      title: 'Trade-in до <mark>80 000 грн</mark>',
      image: 'images/hero4.jpg',
      text: 'Оцінимо ваше авто прозоро й запропонуємо чесну доплату на нову модель. Це швидкий шлях до оновлення без десятків дзвінків і торгів.',
      list: ['Попередня оцінка за 15 хвилин.', 'Юридична перевірка документів.', 'Персональна вигода на авто з каталогу.']
    },
    credit: {
      title: 'Кредит від <mark>0.01%</mark>',
      image: 'images/hero2.jpg',
      text: 'Підберемо фінансування під ваш бюджет: комфортний перший внесок, зрозумілий платіж і швидке рішення від партнерських банків.',
      list: ['Кілька програм на вибір.', 'Попередній розрахунок без зобовʼязань.', 'Допомога з пакетом документів.']
    },
    insurance: {
      title: 'Страхування <mark>у подарунок</mark>',
      image: 'images/hero3.jpg',
      text: 'Для обраних моделей доступний бонус: страховий пакет або сервісний сертифікат. Важливі витрати на старті стають легшими.',
      list: ['Діє на окремі авто з наявності.', 'Можна обрати сервісний бонус.', 'Менеджер підкаже найвигідніший варіант.']
    }
  };

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.site-modal.is-open')) {
      document.body.classList.remove('menu-open');
    }
  }

  function showToast(message) {
    if (!toast) return;
    toast.innerHTML = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 5200);
  }

  document.querySelectorAll('.btn-call, .btn-call-nav, .btn-call-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      closeMenu();
      callbackResult.hidden = true;
      callbackResult.textContent = '';
      openModal(callbackModal);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => closeModal(button.closest('.site-modal')));
  });

  document.querySelectorAll('.site-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.site-modal.is-open').forEach(closeModal);
  });

  callbackForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(callbackForm);
    const firstName = String(formData.get('firstName') || '').trim();
    const phone = String(formData.get('phone') || '').trim();

    callbackResult.hidden = false;
    callbackResult.innerHTML = `<strong>${firstName || 'Дякуємо'}!</strong> Анкету прийнято. Менеджер AutoDrive зателефонує на ${phone || 'вказаний номер'} найближчим часом.`;
    callbackForm.reset();
  });

  document.querySelectorAll('[data-promo-detail]').forEach((button) => {
    button.addEventListener('click', () => {
      const detail = promoDetails[button.dataset.promoDetail];
      if (!detail) return;

      document.getElementById('promoDetailTitle').innerHTML = detail.title;
      document.getElementById('promoDetailText').innerHTML = detail.text;
      document.getElementById('promoDetailImage').style.setProperty('--promo-image', `url('${detail.image}')`);
      document.getElementById('promoDetailList').innerHTML = detail.list.map((item) => `<li>${item}</li>`).join('');
      openModal(promoDetailModal);
    });
  });

  document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('newsletterEmail');
    const email = input.value.trim();

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      showToast('<strong>Введіть Gmail.</strong><br>Наприклад: autodrive@gmail.com, щоб отримати добірку акцій.');
      input.focus();
      return;
    }

    showToast(`<strong>Лист для ${email} підготовлено.</strong><br>Дякуємо за підписку! На реальному хостингу сюди підключається поштовий сервіс, а зараз ми зберегли вашу заявку на сайті.`);
    input.value = '';
  });
})();

// ===== HEADER PROMO BANNER (catalog page) =====
(() => {
  const headerPromo = document.getElementById('headerPromo');
  const headerPromoProgress = document.getElementById('headerPromoProgress');
  const headerPromoClose = document.getElementById('headerPromoClose');
  const headerPromoLink = document.getElementById('headerPromoLink');

  if (!headerPromo || !headerPromoProgress) return;

  const PROMO_INTERVAL = 45000;
  const PROMO_VISIBLE = 15000;
  const promoItems = [
    { title: 'Літнє обслуговування <strong>-20%</strong>', text: 'Підготуй свій автомобіль до нового сезону та отримай знижку на обслуговування' },
    { title: 'Діагностика перед подорожжю <strong>-15%</strong>', text: 'Перевіримо основні системи авто перед дорогою та допоможемо уникнути сюрпризів' },
    { title: 'Комплект шин та балансування <strong>-10%</strong>', text: 'Оновіть сезонний комплект шин і отримайте вигідну ціну на балансування' }
  ];

  let promoIndex = 0;
  let showTimer = null;
  let hideTimer = null;
  let progressFrame = null;
  let progressStart = 0;
  let userInteracted = false;

  function setPromoContent(index) {
    const promo = promoItems[index];
    document.getElementById('headerPromoTitle').innerHTML = promo.title;
    document.getElementById('headerPromoText').textContent = promo.text;
  }

  function stopProgress() {
    if (progressFrame) {
      window.cancelAnimationFrame(progressFrame);
      progressFrame = null;
    }
  }

  function runProgress() {
    stopProgress();
    progressStart = performance.now();
    headerPromoProgress.style.transition = 'none';
    headerPromoProgress.style.transform = 'scaleX(1)';

    const tick = (now) => {
      const elapsed = now - progressStart;
      const remaining = Math.max(0, 1 - elapsed / PROMO_VISIBLE);
      headerPromoProgress.style.transform = `scaleX(${remaining})`;
      if (remaining > 0) {
        progressFrame = window.requestAnimationFrame(tick);
      }
    };

    progressFrame = window.requestAnimationFrame(tick);
  }

  function hideHeaderPromo() {
    stopProgress();
    headerPromo.classList.remove('is-visible');
    window.clearTimeout(hideTimer);
    hideTimer = null;
    userInteracted = false;
    window.setTimeout(() => {
      headerPromo.hidden = true;
    }, 350);
  }

  function showHeaderPromo() {
    if (!document.body.classList.contains('catalog-page-mode')) return;

    setPromoContent(promoIndex);
    promoIndex = (promoIndex + 1) % promoItems.length;
    userInteracted = false;
    headerPromo.hidden = false;
    window.requestAnimationFrame(() => {
      headerPromo.classList.add('is-visible');
      runProgress();
    });

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!userInteracted) hideHeaderPromo();
    }, PROMO_VISIBLE);
  }

  function scheduleHeaderPromo() {
    window.clearTimeout(showTimer);
    showTimer = window.setTimeout(showHeaderPromo, PROMO_INTERVAL);
  }

  function markInteraction() {
    userInteracted = true;
    hideHeaderPromo();
    scheduleHeaderPromo();
  }

  headerPromoClose?.addEventListener('click', markInteraction);
  headerPromoLink?.addEventListener('click', (event) => {
    event.preventDefault();
    markInteraction();
    scrollToSection('services');
  });

  window.autoDriveHeaderPromo = {
    start() {
      scheduleHeaderPromo();
    },
    stop() {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      stopProgress();
      headerPromo.classList.remove('is-visible');
      headerPromo.hidden = true;
    },
    reset() {
      this.stop();
      this.start();
    }
  };
})();

// ===== FULL CATALOG PAGE =====
(() => {
  const fullCatalog = document.getElementById('catalogFull');
  const grid = document.getElementById('catalogCardsGrid');
  const pagination = document.getElementById('catalogPagination');

  if (!fullCatalog || !grid || !pagination) return;

  const catalogData = window.AutoDriveCatalogData || {};
  const NHTSA_API = catalogData.nhtsaApi;
  const UNSPLASH_ACCESS_KEY = catalogData.unsplashAccessKey;
  const CATALOG_MAKES = catalogData.makes || [];
  const CATALOG_YEARS = catalogData.years || [];
  const curatedImages = catalogData.fallbackImages || [];
  const fallbackCars = catalogData.fallbackCars || [];
  const ads = catalogData.ads || [];

  let cars = [];

  const state = {
    filters: {
      brand: 'all',
      model: 'all',
      fuel: 'all',
      gearbox: 'all',
      drive: 'all',
      brands: new Set(),
      fuels: new Set(),
      priceFrom: 300000,
      priceTo: 5000000,
      yearFrom: 2015,
      yearTo: 2026,
      mileageFrom: 0,
      mileageTo: 200000
    },
    sort: 'newest',
    view: '3',
    page: 1,
    favoritesOnly: false,
    favorites: new Set(),
    compare: new Set(),
    perPage: 9,
    filtered: [...cars],
    apiLoaded: false,
    apiLoading: false
  };

  const $ = (selector) => document.querySelector(selector);
  const formatNumber = (value) => new Intl.NumberFormat('uk-UA').format(value);
  const formatPrice = (value) => `${formatNumber(value)} грн`;
  const fallbackImages = curatedImages;
  const getMaxDisplayCount = () => cars.length;
  const setApiStatus = (message, type = 'info') => {
    const status = document.getElementById('catalogApiStatus');
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };
  const getDisplayCount = () => {
    return state.filtered.length;
  };

  function stableHash(value) {
    return String(value).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  function buildDemoSpecs(make, model, year, index) {
    const seed = stableHash(`${make}${model}${year}${index}`);
    const fuels = ['Бензин', 'Дизель', 'Гібрид', 'Електро'];
    const gearboxes = ['Автомат', 'Механіка', 'Робот'];
    const drives = ['Передній', 'Задній', 'Повний'];
    const fuel = make === 'Tesla' ? 'Електро' : fuels[seed % fuels.length];

    return {
      engine: fuel === 'Електро' ? 'Електро' : `${(1.6 + (seed % 25) / 10).toFixed(1)} л`,
      fuel,
      gearbox: fuel === 'Електро' ? 'Автомат' : gearboxes[seed % gearboxes.length],
      drive: drives[seed % drives.length],
      mileage: Math.max(0, (2026 - year) * 18000 + (seed % 12000)),
      price: Math.min(5000000, Math.max(300000, 420000 + (seed % 46) * 95000))
    };
  }

  function expandCatalogDataset(sourceCars, targetCount = 250) {
    if (sourceCars.length >= targetCount) return sourceCars.slice(0, targetCount);

    const expanded = [...sourceCars];
    while (expanded.length < targetCount) {
      const base = sourceCars[expanded.length % sourceCars.length];
      const variant = stableHash(`${base.brand}${base.model}${expanded.length}`);
      expanded.push({
        ...base,
        mileage: Math.min(200000, Math.max(0, base.mileage + (variant % 9000))),
        price: Math.min(5000000, Math.max(300000, base.price + ((variant % 24) - 12) * 17000)),
        year: Math.min(2026, Math.max(2015, base.year - (variant % 4))),
        image: curatedImages[expanded.length % curatedImages.length],
        badges: [...(base.badges || [])]
      });
    }

    return validateCars(expanded);
  }

  function applyCatalogDataset(sourceCars) {
    cars = expandCatalogDataset(validateCars(sourceCars));
    state.filtered = [...cars];
  }

  function validateCars(sourceCars) {
    const seenCards = new Set();
    const seenImages = new Set();

    return sourceCars
      .filter((car) => car && car.brand && car.model && Number.isFinite(Number(car.year)) && Number.isFinite(Number(car.price)) && Number.isFinite(Number(car.mileage)))
      .map((car, index) => {
        const key = `${car.brand}|${car.model}|${car.year}|${car.price}|${car.mileage}`;
        if (seenCards.has(key)) return null;
        seenCards.add(key);

        const normalized = {
          ...car,
          id: index + 1,
          year: Math.min(2026, Math.max(2015, Number(car.year))),
          price: Math.min(5000000, Math.max(300000, Number(car.price))),
          mileage: Math.min(200000, Math.max(0, Number(car.mileage))),
          engine: car.engine && !['None', 'Н/д'].includes(car.engine) ? car.engine : (car.fuel === 'Електро' ? 'Електро' : '2.0 л'),
          fuel: car.fuel || 'Бензин',
          gearbox: car.gearbox || 'Автомат',
          drive: car.drive || 'Передній',
          badges: Array.isArray(car.badges) ? car.badges : []
        };

        if (!normalized.image || seenImages.has(normalized.image)) {
          normalized.image = curatedImages.find((image) => !seenImages.has(image)) || curatedImages[index % curatedImages.length];
        }
        seenImages.add(normalized.image);

        return normalized;
      })
      .filter(Boolean);
  }

  async function fetchJson(url, timeoutMs = 7000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function fetchModelsForMakeYear(make, year) {
    const url = `${NHTSA_API}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
    const data = await fetchJson(url, 6500);

    if (!data.Results || data.Results.length === 0) {
      throw new Error(`NHTSA Results порожній для ${make} ${year}`);
    }

    return data.Results.slice(0, 4).map((item) => ({
      brand: item.Make_Name || make,
      model: item.Model_Name || 'Модель',
      year
    }));
  }

  async function fetchCarImage(car, index) {
    const fallback = fallbackImages[index % fallbackImages.length];
    const query = encodeURIComponent(`${car.brand} ${car.model} car`);
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

    try {
      const data = await fetchJson(url, 2600);
      return data.results?.[0]?.urls?.regular || data.results?.[0]?.urls?.small || fallback;
    } catch (error) {
      return fallback;
    }
  }

  async function loadCatalogFromApis() {
    setApiStatus('Завантажуємо авто з NHTSA vPIC та фото з Unsplash...', 'loading');

    try {
      const batches = await Promise.allSettled(
        CATALOG_MAKES.flatMap((make) => CATALOG_YEARS.map((year) => fetchModelsForMakeYear(make, year)))
      );
      const models = batches.flatMap((batch) => batch.status === 'fulfilled' ? batch.value : []);

      if (models.length === 0) {
        throw new Error('NHTSA повернув порожній Results для всіх запитів');
      }

      const normalized = models
        .filter((car, index, arr) => arr.findIndex((item) => item.brand === car.brand && item.model === car.model && item.year === car.year) === index)
        .slice(0, 90);

      const withImages = await Promise.all(normalized.map(async (car, index) => {
        const specs = buildDemoSpecs(car.brand, car.model, car.year, index);
        return {
          id: index + 1,
          brand: car.brand,
          model: car.model,
          year: car.year,
          ...specs,
          image: await fetchCarImage(car, index),
          badges: [
            index < 3 ? 'Нове' : '',
            specs.fuel === 'Електро' ? 'Електро' : '',
            index % 11 === 0 ? 'Топ продаж' : ''
          ].filter(Boolean)
        };
      }));

      applyCatalogDataset(withImages);
      state.favorites.clear();
      state.compare.clear();
      state.favoritesOnly = false;
      resetFilterValues(false);
      state.apiLoaded = true;
      initOptions();
      syncInputsFromState();
      renderHomeCatalog(cars);
      render();
      setApiStatus(`Завантажено ${cars.length} авто з NHTSA vPIC. Фото синхронізовані через Unsplash.`, 'ok');
    } catch (error) {
      applyCatalogDataset(fallbackCars);
      initOptions();
      syncInputsFromState();
      renderHomeCatalog(cars);
      render();
      setApiStatus(`Не вдалося отримати живий каталог: ${error.message}. Показуємо резервні авто.`, 'error');
    } finally {
      state.apiLoading = false;
    }
  }

  function unique(key) {
    return [...new Set(cars.map((car) => car[key]))].sort((a, b) => String(a).localeCompare(String(b), 'uk'));
  }

  function fillSelect(selector, values, allLabel) {
    const select = $(selector);
    if (!select) return;
    select.innerHTML = `<option value="all">${allLabel}</option>${values.map((value) => `<option value="${value}">${value}</option>`).join('')}`;
  }

  function countBy(key) {
    return cars.reduce((acc, car) => {
      acc[car[key]] = (acc[car[key]] || 0) + 1;
      return acc;
    }, {});
  }

  function renderCheckboxes(containerId, values, counts, groupName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = values.map((value) => `
      <label class="check-option">
        <input type="checkbox" value="${value}" data-check-group="${groupName}" />
        <span>${value} (${counts[value] || 0})</span>
      </label>
    `).join('');
  }

  function initOptions() {
    fillSelect('#topBrandFilter', unique('brand'), 'Всі марки');
    fillSelect('#topModelFilter', unique('model'), 'Всі моделі');
    fillSelect('#topFuelFilter', unique('fuel'), 'Всі типи');
    fillSelect('#topGearboxFilter', unique('gearbox'), 'Всі типи');
    fillSelect('#topDriveFilter', unique('drive'), 'Всі типи');
    renderCheckboxes('brandCheckList', unique('brand'), countBy('brand'), 'brands');
    renderCheckboxes('fuelCheckList', unique('fuel'), countBy('fuel'), 'fuels');
  }

  function resetFilterValues(resetSelections = true) {
    state.filters.brand = 'all';
    state.filters.model = 'all';
    state.filters.fuel = 'all';
    state.filters.gearbox = 'all';
    state.filters.drive = 'all';
    state.filters.brands.clear();
    state.filters.fuels.clear();
    state.filters.priceFrom = 300000;
    state.filters.priceTo = 5000000;
    state.filters.yearFrom = 2015;
    state.filters.yearTo = 2026;
    state.filters.mileageFrom = 0;
    state.filters.mileageTo = 200000;
    state.favoritesOnly = false;
    state.page = 1;

    if (resetSelections) {
      document.querySelectorAll('[data-check-group]').forEach((input) => { input.checked = false; });
      document.getElementById('brandSearch').value = '';
      document.getElementById('brandCheckList').querySelectorAll('.check-option').forEach((option) => { option.hidden = false; });
    }
  }

  function clampRange(minKey, maxKey, minValue, maxValue) {
    state.filters[minKey] = Math.max(minValue, Math.min(Number(state.filters[minKey]) || minValue, maxValue));
    state.filters[maxKey] = Math.max(minValue, Math.min(Number(state.filters[maxKey]) || maxValue, maxValue));
    if (state.filters[minKey] > state.filters[maxKey]) {
      [state.filters[minKey], state.filters[maxKey]] = [state.filters[maxKey], state.filters[minKey]];
    }
  }

  function syncInputsFromState() {
    const pairs = [
      ['#topPriceFrom', 'priceFrom'], ['#topPriceTo', 'priceTo'], ['#sidePriceFrom', 'priceFrom'], ['#sidePriceTo', 'priceTo'], ['#priceRangeMin', 'priceFrom'], ['#priceRangeMax', 'priceTo'],
      ['#topYearFrom', 'yearFrom'], ['#topYearTo', 'yearTo'], ['#sideYearFrom', 'yearFrom'], ['#sideYearTo', 'yearTo'], ['#yearRangeMin', 'yearFrom'], ['#yearRangeMax', 'yearTo'],
      ['#topMileageFrom', 'mileageFrom'], ['#topMileageTo', 'mileageTo'], ['#sideMileageFrom', 'mileageFrom'], ['#sideMileageTo', 'mileageTo'], ['#mileageRangeMin', 'mileageFrom'], ['#mileageRangeMax', 'mileageTo']
    ];

    pairs.forEach(([selector, key]) => {
      const input = $(selector);
      if (input) input.value = state.filters[key];
    });

    $('#topBrandFilter').value = state.filters.brand;
    $('#topModelFilter').value = state.filters.model;
    $('#topFuelFilter').value = state.filters.fuel;
    $('#topGearboxFilter').value = state.filters.gearbox;
    $('#topDriveFilter').value = state.filters.drive;
    updateRangeFills();
  }

  function updateRangeFills() {
    document.querySelectorAll('.range-pair').forEach((rangePair) => {
      const inputs = Array.from(rangePair.querySelectorAll('input[type="range"]'));
      if (inputs.length < 2) return;

      const min = Number(inputs[0].min);
      const max = Number(inputs[0].max);
      const first = Number(inputs[0].value);
      const second = Number(inputs[1].value);
      const from = ((Math.min(first, second) - min) / (max - min)) * 100;
      const to = ((Math.max(first, second) - min) / (max - min)) * 100;

      rangePair.style.setProperty('--range-from', `${from}%`);
      rangePair.style.setProperty('--range-to', `${to}%`);
    });
  }

  function applyTopFilters() {
    state.filters.brand = $('#topBrandFilter').value;
    state.filters.model = $('#topModelFilter').value;
    state.filters.fuel = $('#topFuelFilter').value;
    state.filters.gearbox = $('#topGearboxFilter').value;
    state.filters.drive = $('#topDriveFilter').value;
    state.filters.priceFrom = Number($('#topPriceFrom').value) || 300000;
    state.filters.priceTo = Number($('#topPriceTo').value) || 5000000;
    state.filters.yearFrom = Number($('#topYearFrom').value) || 2015;
    state.filters.yearTo = Number($('#topYearTo').value) || 2026;
    state.filters.mileageFrom = Number($('#topMileageFrom').value) || 0;
    state.filters.mileageTo = Number($('#topMileageTo').value) || 200000;
    normalizeAndRender();
  }

  function normalizeAndRender() {
    clampRange('priceFrom', 'priceTo', 300000, 5000000);
    clampRange('yearFrom', 'yearTo', 2015, 2026);
    clampRange('mileageFrom', 'mileageTo', 0, 200000);
    state.page = 1;
    syncInputsFromState();
    render();
  }

  function getFilteredCars() {
    let result = cars.filter((car) => {
      const f = state.filters;
      const matchesTop =
        (f.brand === 'all' || car.brand === f.brand) &&
        (f.model === 'all' || car.model === f.model) &&
        (f.fuel === 'all' || car.fuel === f.fuel) &&
        (f.gearbox === 'all' || car.gearbox === f.gearbox) &&
        (f.drive === 'all' || car.drive === f.drive);

      const matchesSide =
        (f.brands.size === 0 || f.brands.has(car.brand)) &&
        (f.fuels.size === 0 || f.fuels.has(car.fuel));

      const matchesRange =
        car.price >= f.priceFrom && car.price <= f.priceTo &&
        car.year >= f.yearFrom && car.year <= f.yearTo &&
        car.mileage >= f.mileageFrom && car.mileage <= f.mileageTo;

      const matchesFavorite = !state.favoritesOnly || state.favorites.has(car.id);
      return matchesTop && matchesSide && matchesRange && matchesFavorite;
    });

    result.sort((a, b) => {
      if (state.sort === 'priceAsc') return a.price - b.price;
      if (state.sort === 'priceDesc') return b.price - a.price;
      if (state.sort === 'electric') return Number(b.fuel === 'Електро') - Number(a.fuel === 'Електро') || b.year - a.year;
      if (state.sort === 'mileageAsc') return a.mileage - b.mileage;
      return b.year - a.year || a.mileage - b.mileage;
    });

    return result;
  }

  function renderCard(car) {
    const badges = car.badges.map((badge) => {
      const modifier = badge === 'Нове' ? ' catalog-badge--yellow' : badge === 'Електро' ? ' catalog-badge--green' : badge === 'Хіт' ? ' catalog-badge--red' : '';
      return `<span class="catalog-badge${modifier}">${badge}</span>`;
    }).join('');

    return `
      <article class="catalog-auto-card">
        <div class="catalog-auto-card__image">
          <img src="${car.image}" alt="${car.brand} ${car.model}" />
          <div class="catalog-card-badges">${badges}</div>
          <button class="catalog-fav-toggle ${state.favorites.has(car.id) ? 'active' : ''}" type="button" data-favorite="${car.id}" aria-label="Додати в обрані">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>
          </button>
        </div>
        <div class="catalog-auto-card__body">
          <h3>${car.brand} ${car.model}</h3>
          <p class="catalog-spec-line">
            <span>${car.year}</span><span>•</span><span>${car.engine || 'Н/д'}</span><span>•</span><span>${car.fuel || 'Н/д'}</span><span>•</span><span>${car.gearbox || 'Н/д'}</span><span>•</span><span>${car.drive || 'Н/д'}</span>
          </p>
          <p class="catalog-spec-line">${formatNumber(car.mileage)} км</p>
          <div class="catalog-price-row">
            <strong class="catalog-price">${formatPrice(car.price)}</strong>
            <div class="catalog-card-actions">
              <button class="catalog-compare-card ${state.compare.has(car.id) ? 'active' : ''}" type="button" data-compare="${car.id}">Порівняти</button>
              <button class="catalog-detail-btn" type="button">Детальніше</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    const pages = [];
    const addPage = (page) => {
      if (page >= 1 && page <= totalPages && !pages.includes(page)) pages.push(page);
    };

    addPage(1);
    addPage(state.page - 1);
    addPage(state.page);
    addPage(state.page + 1);
    addPage(totalPages);
    pages.sort((a, b) => a - b);

    pagination.innerHTML = `
      <button class="catalog-page-btn catalog-page-btn--arrow" type="button" data-page-prev ${state.page === 1 ? 'disabled' : ''} aria-label="Попередня сторінка">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6" /></svg>
      </button>
      ${pages.map((page, index) => {
        const previous = pages[index - 1];
        const dots = previous && page - previous > 1 ? '<span class="catalog-page-dots">...</span>' : '';
        return `${dots}<button class="catalog-page-btn ${page === state.page ? 'active' : ''}" type="button" data-page="${page}">${page}</button>`;
      }).join('')}
      <button class="catalog-page-btn catalog-page-btn--arrow" type="button" data-page-next ${state.page === totalPages ? 'disabled' : ''} aria-label="Наступна сторінка">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    `;
  }

  function renderComparePanel() {
    const panel = document.getElementById('comparePanel');
    const text = document.getElementById('compareText');
    const selected = cars.filter((car) => state.compare.has(car.id));
    panel.hidden = selected.length === 0;
    text.textContent = selected.length < 2
      ? 'Додайте ще одне авто до порівняння, щоб побачити різницю у ціні, пробігу та характеристиках.'
      : selected.map((car) => `${car.brand} ${car.model}: ${formatPrice(car.price)}, ${formatNumber(car.mileage)} км, ${car.fuel}`).join('  |  ');
  }

  function render() {
    state.filtered = getFilteredCars();
    const displayCount = getDisplayCount();
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.perPage));
    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * state.perPage;
    const visible = state.filtered.slice(start, start + state.perPage);
    grid.className = `catalog-cards-grid view-${state.view}`;
    grid.innerHTML = visible.length ? visible.map(renderCard).join('') : '<div class="catalog-empty"><strong>Авто не знайдено</strong><p>Спробуйте змінити фільтри або скинути параметри пошуку.</p></div>';

    document.getElementById('catalogFoundSide').textContent = `${displayCount} авто`;
    document.getElementById('catalogFoundTop').textContent = `${displayCount} авто`;
    document.getElementById('catalogHeroCount').textContent = `${getMaxDisplayCount()}`;
    document.getElementById('catalogShowBtn').textContent = `Показати ${displayCount} авто`;
    document.getElementById('favoritesCount').textContent = state.favorites.size;
    document.getElementById('compareCount').textContent = state.compare.size;
    document.getElementById('favoritesOnlyBtn').classList.toggle('active', state.favoritesOnly);
    document.getElementById('compareBtn').classList.toggle('active', state.compare.size > 0);

    renderComparePanel();
    renderPagination(totalPages);
  }

  function openCatalogPage() {
    fullCatalog.hidden = false;
    document.body.classList.add('catalog-page-mode');
    updateActiveNav('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
    window.autoDriveHeaderPromo?.reset();

    if (!state.apiLoaded && !state.apiLoading) {
      state.apiLoading = true;
      loadCatalogFromApis();
    }
  }

  function closeCatalogPage(scrollTop = true) {
    document.body.classList.remove('catalog-page-mode');
    fullCatalog.hidden = true;
    window.autoDriveHeaderPromo?.stop();
    updateActiveNav(window.scrollY < 120 ? 'home' : 'catalog');
    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  window.autoDriveCloseCatalogPage = closeCatalogPage;

  function resetFilters() {
    resetFilterValues();
    normalizeAndRender();
  }

  function rotateAd() {
    const ad = ads[Math.floor(Math.random() * ads.length)];
    document.getElementById('catalogAdTitle').textContent = ad.title;
    document.getElementById('catalogAdText').textContent = ad.text;
    document.getElementById('catalogAdImage').src = ad.image;
    window.setTimeout(rotateAd, 20000 + Math.floor(Math.random() * 40000));
  }

  applyCatalogDataset(fallbackCars);
  initOptions();
  syncInputsFromState();
  renderHomeCatalog(cars);
  render();
  window.setTimeout(rotateAd, 20000 + Math.floor(Math.random() * 40000));

  if (!state.apiLoaded && !state.apiLoading) {
    state.apiLoading = true;
    loadCatalogFromApis();
  }

  document.querySelectorAll('[data-open-catalog-page]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.dataset.filter) {
        setCatalogFilter(button.dataset.filter);
      }
      event.preventDefault();
      openCatalogPage();
    });
  });

  document.querySelectorAll('[data-catalog-home]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!document.body.classList.contains('catalog-page-mode')) return;
      event.preventDefault();
      closeCatalogPage();
    });
  });

  document.getElementById('catalogSearchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    applyTopFilters();
  });

  document.querySelectorAll('#catalogSearchForm select, #catalogSearchForm input').forEach((field) => {
    const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, applyTopFilters);
  });

  document.querySelectorAll('.catalog-search-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.catalog-search-tab').forEach((button) => {
        button.classList.toggle('active', button === tab);
        button.setAttribute('aria-selected', String(button === tab));
      });
      tab.closest('.catalog-search-tabs').dataset.active = tab.dataset.searchTab;
    });
  });

  document.querySelectorAll('.side-filter__head').forEach((button) => {
    button.addEventListener('click', () => {
      const section = button.closest('.side-filter');
      const isOpen = section.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.querySelectorAll('#sidePriceFrom,#sidePriceTo,#priceRangeMin,#priceRangeMax,#sideYearFrom,#sideYearTo,#yearRangeMin,#yearRangeMax,#sideMileageFrom,#sideMileageTo,#mileageRangeMin,#mileageRangeMax').forEach((input) => {
    input.addEventListener('input', () => {
      const map = {
        sidePriceFrom: 'priceFrom', sidePriceTo: 'priceTo', priceRangeMin: 'priceFrom', priceRangeMax: 'priceTo',
        sideYearFrom: 'yearFrom', sideYearTo: 'yearTo', yearRangeMin: 'yearFrom', yearRangeMax: 'yearTo',
        sideMileageFrom: 'mileageFrom', sideMileageTo: 'mileageTo', mileageRangeMin: 'mileageFrom', mileageRangeMax: 'mileageTo'
      };
      state.filters[map[input.id]] = Number(input.value);
      normalizeAndRender();
    });
  });

  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.matches('[data-check-group]')) return;
    const set = state.filters[input.dataset.checkGroup];
    input.checked ? set.add(input.value) : set.delete(input.value);
    normalizeAndRender();
  });

  document.getElementById('brandSearch').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    document.getElementById('brandCheckList').querySelectorAll('.check-option').forEach((option) => {
      option.hidden = !option.textContent.toLowerCase().includes(query);
    });
  });

  document.getElementById('showMoreBrands').addEventListener('click', (event) => {
    const list = document.getElementById('brandCheckList');
    const expanded = list.classList.toggle('check-list--expanded');
    list.classList.toggle('check-list--limited', !expanded);
    event.currentTarget.textContent = expanded ? 'Згорнути' : 'Показати ще';
  });

  document.getElementById('catalogSort').addEventListener('change', (event) => {
    state.sort = event.target.value;
    state.page = 1;
    render();
  });

  document.querySelectorAll('.view-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      document.querySelectorAll('.view-btn').forEach((viewButton) => viewButton.classList.toggle('active', viewButton === button));
      render();
    });
  });

  document.getElementById('favoritesOnlyBtn').addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    state.page = 1;
    render();
  });

  document.getElementById('compareBtn').addEventListener('click', () => {
    const panel = document.getElementById('comparePanel');
    panel.hidden = !panel.hidden;
  });

  document.getElementById('catalogResetBtn').addEventListener('click', resetFilters);

  grid.addEventListener('click', (event) => {
    const favorite = event.target.closest('[data-favorite]');
    const compare = event.target.closest('[data-compare]');

    if (favorite) {
      const id = Number(favorite.dataset.favorite);
      state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
      render();
    }

    if (compare) {
      const id = Number(compare.dataset.compare);
      if (state.compare.has(id)) {
        state.compare.delete(id);
      } else if (state.compare.size < 3) {
        state.compare.add(id);
      }
      render();
    }

    if (event.target.closest('.catalog-detail-btn')) {
      normalizeAndRender();
    }
  });

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.pagePrev !== undefined) state.page -= 1;
    if (button.dataset.pageNext !== undefined) state.page += 1;
    if (button.dataset.page) state.page = Number(button.dataset.page);
    render();
    fullCatalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
