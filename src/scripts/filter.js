/**
 * filter.js — Client-side filter, search, and tileable toggle
 * Uses Fuse.js for fuzzy search, loaded from CDN.
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────
  let allCards = [];
  let fuse = null;
  let activeCategory = 'all';
  let tileableOnly = false;
  let searchQuery = '';
  let activeTag = null;

  // ── Init ───────────────────────────────────────────────────────────
  function init() {
    allCards = Array.from(document.querySelectorAll('.texture-card'));
    if (!allCards.length) return;

    // Build Fuse index from card data attributes
    const fuseData = allCards.map((card, i) => ({
      index: i,
      title: card.dataset.title || '',
      slug:  card.dataset.slug  || '',
      tags:  JSON.parse(card.dataset.tags || '[]').join(' '),
      category: card.dataset.category || '',
    }));

    // Fuse.js loaded via script tag in index.astro
    if (window.Fuse) {
      fuse = new window.Fuse(fuseData, {
        keys: ['title', 'slug', 'tags'],
        threshold: 0.35,
        includeScore: false,
      });
    }

    bindEvents();
    applyFilters(); // initial state
  }

  // ── Bind DOM events ────────────────────────────────────────────────
  function bindEvents() {
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        document.querySelectorAll('.category-tab').forEach(b => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          b.classList.toggle('text-accent', b === btn);
          b.classList.toggle('border-accent/50', b === btn);
        });
        applyFilters();
      });
    });

    // Search input (debounced 200ms)
    const searchEl = document.getElementById('search-input');
    if (searchEl) {
      let debounceTimer;
      searchEl.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = searchEl.value.trim().toLowerCase();
          applyFilters();
        }, 200);
      });
    }

    // Tileable toggle
    const tileableEl = document.getElementById('tileable-toggle');
    if (tileableEl) {
      tileableEl.addEventListener('change', () => {
        tileableOnly = tileableEl.checked;
        applyFilters();
      });
    }

    // Tag pills (delegated)
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.tag-pill[data-tag]');
      if (pill) {
        e.stopPropagation();
        activeTag = pill.dataset.tag;
        const search = document.getElementById('search-input');
        if (search) {
          search.value = activeTag;
          searchQuery = activeTag;
        }
        applyFilters();
      }
    });

    // Clear filters button
    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', resetFilters);
    }
  }

  // ── Apply all active filters ───────────────────────────────────────
  function applyFilters() {
    let visible = allCards;

    // 1. Category filter
    if (activeCategory !== 'all') {
      visible = visible.filter(c => c.dataset.category === activeCategory);
    }

    // 2. Tileable filter
    if (tileableOnly) {
      visible = visible.filter(c => c.dataset.tileable === 'true');
    }

    // 3. Fuzzy search
    if (searchQuery && fuse) {
      const results = fuse.search(searchQuery);
      const matchedIndices = new Set(results.map(r => r.item.index));
      visible = visible.filter(c => {
        const idx = allCards.indexOf(c);
        return matchedIndices.has(idx);
      });
    } else if (searchQuery && !fuse) {
      // Fallback: simple substring match
      visible = visible.filter(c => {
        const haystack = [
          c.dataset.title,
          c.dataset.slug,
          JSON.parse(c.dataset.tags || '[]').join(' '),
        ].join(' ').toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    // Update visibility
    const visibleSet = new Set(visible);
    allCards.forEach(c => {
      const show = visibleSet.has(c);
      c.style.display = show ? '' : 'none';
      c.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (show) c.setAttribute('data-filtered-index', visible.indexOf(c));
    });

    // Update result count
    const countEl = document.getElementById('result-count');
    if (countEl) {
      countEl.textContent = `Showing ${visible.length} of ${allCards.length} textures`;
    }

    // Update modal's filtered set
    if (window.modalSetFiltered) window.modalSetFiltered(visible);

    // Toggle empty state
    const emptyState = document.getElementById('empty-state');
    const grid = document.getElementById('gallery-grid');
    if (emptyState && grid) {
      if (visible.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  // ── Reset all filters ──────────────────────────────────────────────
  function resetFilters() {
    activeCategory = 'all';
    tileableOnly   = false;
    searchQuery    = '';
    activeTag      = null;

    const search = document.getElementById('search-input');
    if (search) search.value = '';

    const toggle = document.getElementById('tileable-toggle');
    if (toggle) toggle.checked = false;

    document.querySelectorAll('.category-tab').forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.category === 'all' ? 'true' : 'false');
      b.classList.toggle('text-accent', b.dataset.category === 'all');
      b.classList.toggle('border-accent/50', b.dataset.category === 'all');
    });

    applyFilters();
  }

  // ── Boot ───────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
