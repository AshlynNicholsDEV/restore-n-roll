const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');

menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';

  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });

    galleryExpanded = false;
    updateGalleryPreview();
  });
});

const lightbox = document.querySelector('#lightbox');

document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    const img = lightbox.querySelector('img');

    img.src = button.dataset.image;
    img.alt = button.querySelector('img').alt;
    lightbox.querySelector('p').textContent = button.dataset.title;
    lightbox.showModal();
  });
});

lightbox.querySelector('.close').addEventListener('click', () => {
  lightbox.close();
});

lightbox.addEventListener('click', event => {
  if (event.target === lightbox) {
    const r = lightbox.getBoundingClientRect();

    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    ) {
      lightbox.close();
    }
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();


// Keep the compact navigation usable with keyboards and rotating devices.
function closeNavigation() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeNavigation();
    menu.focus();
  }
});

const compactNavigation = window.matchMedia('(max-width: 900px)');
compactNavigation.addEventListener('change', closeNavigation);

// Fade gallery pictures in once they enter the viewport and finish loading.
function initializeGalleryFade() {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    return;
  }

  const pictures = document.querySelectorAll('.gallery-grid .photo');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const picture = entry.target;
        const image = picture.querySelector('img');
        observer.unobserve(picture);

        const reveal = () => {
          picture.classList.add('is-visible');
        };

        if (!image || image.complete) {
          reveal();
        } else {
          image.addEventListener('load', reveal, { once: true });
          image.addEventListener('error', reveal, { once: true });
        }
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -80px 0px'
  });

  pictures.forEach(picture => {
    picture.classList.add('gallery-fade');
    observer.observe(picture);
    picture.addEventListener('focus', () => {
      picture.classList.add('is-visible');
    });
  });

  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      pictures.forEach(picture => picture.classList.add('is-visible'));
    }
  });
}

initializeGalleryFade();

// Compact gallery preview on mobile, including when a category is selected.
const mobileGallery = window.matchMedia('(max-width: 700px)');
const galleryToggle = document.querySelector('#gallery-toggle');
const galleryCount = document.querySelector('#gallery-count');
const galleryCards = Array.from(document.querySelectorAll('#gallery-photos figure'));
let galleryExpanded = false;

function updateGalleryPreview() {
  const selectedFilter = document.querySelector('[data-filter].active').dataset.filter;
  const matchingCards = galleryCards.filter(card =>
    selectedFilter === 'all' || card.dataset.category === selectedFilter
  );
  const limit = mobileGallery.matches && !galleryExpanded ? 2 : matchingCards.length;

  galleryCards.forEach(card => {
    const position = matchingCards.indexOf(card);
    card.hidden = position < 0 || position >= limit;
  });

  document.querySelectorAll('.gallery-project').forEach(project => {
    project.hidden = !Array.from(project.querySelectorAll('figure')).some(card => !card.hidden);
  });

  galleryToggle.hidden = !mobileGallery.matches || matchingCards.length <= 2;
  galleryToggle.setAttribute('aria-expanded', String(galleryExpanded));
  galleryToggle.textContent = galleryExpanded
    ? 'Show fewer photos'
    : 'Show all ' + matchingCards.length + ' photos';
  galleryCount.textContent = mobileGallery.matches
    ? 'Showing ' + Math.min(limit, matchingCards.length) + ' of ' + matchingCards.length + ' photos'
    : '';
}

galleryToggle.addEventListener('click', () => {
  galleryExpanded = !galleryExpanded;
  updateGalleryPreview();

  if (!galleryExpanded) {
    document.querySelector('#gallery').scrollIntoView({ block: 'start', behavior: 'instant' });
    galleryToggle.focus({ preventScroll: true });
  }
});

mobileGallery.addEventListener('change', () => {
  galleryExpanded = false;
  updateGalleryPreview();
});

updateGalleryPreview();

// Reveal the header with a lightweight decorative paint roller on page load.
function initializeHeaderPaint() {
  const header = document.querySelector('header');
  const overlay = header.querySelector('.header-paint-reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!overlay || reducedMotion.matches) return;

  let cleanupTimer;
  const finish = () => {
    header.classList.remove('is-painting');
    window.clearTimeout(cleanupTimer);
  };

  header.classList.add('is-painting');
  overlay.querySelector('.header-paint-curtain').addEventListener('animationend', finish, { once: true });
  header.addEventListener('focusin', finish, { once: true });
  header.addEventListener('pointerdown', finish, { once: true });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) finish();
  });
  cleanupTimer = window.setTimeout(finish, 3000);
}

initializeHeaderPaint();
