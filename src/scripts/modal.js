/**
 * modal.js — Preview modal: open/close, keyboard nav, focus trap
 */

(function () {
  'use strict';

  const modal      = document.getElementById('preview-modal');
  const backdrop   = document.getElementById('modal-backdrop');
  const closeBtn   = document.getElementById('modal-close');
  const prevBtn    = document.getElementById('modal-prev');
  const nextBtn    = document.getElementById('modal-next');
  const modalImg   = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalRes   = document.getElementById('modal-resolution');
  const modalCat   = document.getElementById('modal-category');
  const modalEra   = document.getElementById('modal-era');
  const modalTile  = document.getElementById('modal-tileable');
  const modalTags  = document.getElementById('modal-tags');
  const modalPalette= document.getElementById('modal-palette');
  const modalDl    = document.getElementById('modal-download');
  const copyBtn    = document.getElementById('modal-copy-prompt');
  const copyFb     = document.getElementById('modal-copy-feedback');

  let filteredCards = [];
  let currentIndex  = -1;
  let lastFocused   = null;

  // ── Update filtered set (called by filter.js) ─────────────────────
  window.modalSetFiltered = function (cards) {
    filteredCards = cards;
  };

  // ── Open ──────────────────────────────────────────────────────────
  function openModal(card) {
    lastFocused = document.activeElement;

    const slug     = card.dataset.slug     || '';
    const title    = card.dataset.title    || slug;
    const src      = card.dataset.src      || '';
    const category = card.dataset.category || '';
    const resolution=card.dataset.resolution||'–';
    const era      = card.dataset.era      || 'universal';
    const tileable = card.dataset.tileable === 'true';
    const tags     = JSON.parse(card.dataset.tags    || '[]');
    const palette  = JSON.parse(card.dataset.palette || '[]');
    const prompt   = card.dataset.prompt   || '';

    // Determine current index in filtered set
    currentIndex = filteredCards.indexOf(card);

    // Populate modal
    const displayName = slug.split('/').pop()?.replace(/_/g, ' ') || title;
    modalTitle.textContent     = displayName;
    modalImg.src               = src;
    modalImg.alt               = `${title} — ${resolution} ${category} texture`;
    modalRes.textContent       = resolution;
    modalCat.textContent       = category.charAt(0).toUpperCase() + category.slice(1);
    modalEra.textContent       = era.charAt(0).toUpperCase() + era.slice(1);
    modalTile.innerHTML        = tileable ? '<span class="text-tileable-light">✅ Yes</span>' : '<span class="text-text-muted">No</span>';
    modalDl.href               = src;
    modalDl.setAttribute('download', slug.split('/').pop() + '.png');

    // Tags
    modalTags.innerHTML = tags.map(t =>
      `<span class="tag-pill">${t}</span>`
    ).join('');

    // Palette swatches
    modalPalette.innerHTML = palette.map(c =>
      `<span class="color-swatch" style="background:${c}" title="${c}"></span>`
    ).join('');

    // Store prompt on button
    copyBtn.dataset.prompt = prompt;

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    setTimeout(() => closeBtn.focus(), 50);
  }

  // ── Close ─────────────────────────────────────────────────────────
  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
    // Reset copy feedback
    if (copyFb) copyFb.classList.add('hidden');
  }

  // ── Navigate ──────────────────────────────────────────────────────
  function navigate(dir) {
    if (!filteredCards.length) return;
    currentIndex = (currentIndex + dir + filteredCards.length) % filteredCards.length;
    openModal(filteredCards[currentIndex]);
  }

  // ── Focus trap ────────────────────────────────────────────────────
  function trapFocus(e) {
    if (modal.classList.contains('hidden')) return;
    const focusable = Array.from(
      modal.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  // ── Event bindings ────────────────────────────────────────────────
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  prevBtn?.addEventListener('click',  () => navigate(-1));
  nextBtn?.addEventListener('click',  () => navigate(+1));

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(+1);
    trapFocus(e);
  });

  // Copy prompt
  copyBtn?.addEventListener('click', () => {
    const prompt = copyBtn.dataset.prompt || '';
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      if (copyFb) {
        copyFb.classList.remove('hidden');
        setTimeout(() => copyFb.classList.add('hidden'), 2000);
      }
    });
  });

  // ── Card click delegation ─────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.texture-card');
    if (card) openModal(card);
  });

  // Keyboard: Enter/Space on card
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.texture-card');
      if (card) { e.preventDefault(); openModal(card); }
    }
  });

  // ── Init: populate filteredCards with all visible cards ───────────
  document.addEventListener('DOMContentLoaded', () => {
    filteredCards = Array.from(document.querySelectorAll('.texture-card'));
  });

})();
