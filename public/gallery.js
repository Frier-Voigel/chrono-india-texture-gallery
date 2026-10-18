/**
 * gallery.js — Combined client-side gallery script
 * Phase 7 QA Edition — includes era filter, lazy fade-in,
 * improved accessibility, and clear-filters button.
 *
 * Chrono India Texture Gallery — v1.1
 */

(function (global) {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // DOWNLOAD HELPERS
  // ══════════════════════════════════════════════════════════
  function downloadPng(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  global.galleryDownload = { downloadPng, copyToClipboard };

  // ══════════════════════════════════════════════════════════
  // LAZY IMAGE FADE-IN
  // ══════════════════════════════════════════════════════════
  function initLazyFade() {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    imgs.forEach(function(img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() { img.classList.add('loaded'); });
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // MODAL
  // ══════════════════════════════════════════════════════════
  var Modal = (function () {
    var modal, backdrop, closeBtn, prevBtn, nextBtn;
    var modalImg, modalTitle, modalRes, modalCat, modalEra, modalTile;
    var modalTags, modalPalette, modalDl, copyBtn, copyFb;
    var filteredCards = [];
    var currentIndex  = -1;
    var lastFocused   = null;

    function init() {
      modal        = document.getElementById('preview-modal');
      backdrop     = document.getElementById('modal-backdrop');
      closeBtn     = document.getElementById('modal-close');
      prevBtn      = document.getElementById('modal-prev');
      nextBtn      = document.getElementById('modal-next');
      modalImg     = document.getElementById('modal-image');
      modalTitle   = document.getElementById('modal-title');
      modalRes     = document.getElementById('modal-resolution');
      modalCat     = document.getElementById('modal-category');
      modalEra     = document.getElementById('modal-era');
      modalTile    = document.getElementById('modal-tileable');
      modalTags    = document.getElementById('modal-tags');
      modalPalette = document.getElementById('modal-palette');
      modalDl      = document.getElementById('modal-download');
      copyBtn      = document.getElementById('modal-copy-prompt');
      copyFb       = document.getElementById('modal-copy-feedback');

      if (!modal) return;

      filteredCards = Array.from(document.querySelectorAll('.texture-card'));

      if (closeBtn)  closeBtn.addEventListener('click', closeModal);
      if (backdrop)  backdrop.addEventListener('click', closeModal);
      if (prevBtn)   prevBtn.addEventListener('click', function() { navigate(-1); });
      if (nextBtn)   nextBtn.addEventListener('click', function() { navigate(+1); });

      document.addEventListener('keydown', function(e) {
        if (!modal || modal.classList.contains('hidden')) return;
        if (e.key === 'Escape')     { e.preventDefault(); closeModal(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); navigate(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); navigate(+1); }
        trapFocus(e);
      });

      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          var prompt = copyBtn.dataset.prompt || '';
          if (!prompt) return;
          copyToClipboard(prompt).then(function() {
            if (copyFb) {
              copyFb.classList.remove('hidden');
              setTimeout(function() { copyFb.classList.add('hidden'); }, 2000);
            }
          });
        });
      }

      // Card click delegation
      document.addEventListener('click', function(e) {
        var card = e.target.closest('.texture-card');
        if (card && !e.target.closest('.tag-pill')) openModal(card);
      });

      // Keyboard: Enter/Space on card
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var card = e.target.closest('.texture-card');
          if (card) { e.preventDefault(); openModal(card); }
        }
      });
    }

    function openModal(card) {
      if (!modal) return;
      lastFocused = document.activeElement;

      var slug      = card.dataset.slug     || '';
      var title     = card.dataset.title    || slug;
      var src       = card.dataset.src      || '';
      var category  = card.dataset.category || '';
      var resolution= card.dataset.resolution || '–';
      var era       = card.dataset.era      || 'universal';
      var tileable  = card.dataset.tileable === 'true';
      var tags      = safeParseJson(card.dataset.tags,    []);
      var palette   = safeParseJson(card.dataset.palette, []);
      var prompt    = card.dataset.prompt   || '';

      currentIndex = filteredCards.indexOf(card);

      var fileName = (slug.split('/').pop() || title).replace(/_/g, ' ');
      if (modalTitle)   modalTitle.textContent    = fileName;
      if (modalImg) {
        modalImg.src = src;
        modalImg.alt = title + ' — ' + resolution + ' ' + category + ' pixel art texture' + (tileable ? ', tileable' : '');
        modalImg.classList.remove('loaded');
        modalImg.onload = function() { modalImg.classList.add('loaded'); };
      }
      if (modalRes)     modalRes.textContent      = resolution;
      if (modalCat)     modalCat.textContent      = capitalize(category);
      if (modalEra)     modalEra.textContent      = capitalize(era);
      if (modalTile)    modalTile.innerHTML       = tileable
        ? '<span style="color:#6BAB6C">✅ Yes</span>'
        : '<span style="color:#8A7A6A">No</span>';
      if (modalDl) {
        modalDl.href = src;
        modalDl.setAttribute('download', (slug.split('/').pop() || 'texture') + '.png');
      }
      if (modalTags) {
        modalTags.innerHTML = tags.map(function(t) {
          return '<span class="tag-pill" tabindex="0">' + escHtml(t) + '</span>';
        }).join('');
      }
      if (modalPalette) {
        modalPalette.innerHTML = palette.map(function(c) {
          return '<span class="color-swatch" style="background:' + escHtml(c) + '" title="' + escHtml(c) + '" aria-label="Color ' + escHtml(c) + '"></span>';
        }).join('');
      }
      if (copyBtn) copyBtn.dataset.prompt = prompt;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (backdrop) backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      // Update nav button visibility
      if (prevBtn) prevBtn.style.visibility = filteredCards.length > 1 ? '' : 'hidden';
      if (nextBtn) nextBtn.style.visibility = filteredCards.length > 1 ? '' : 'hidden';

      setTimeout(function() { if (closeBtn) closeBtn.focus(); }, 50);
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (backdrop) backdrop.classList.add('hidden');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
      if (copyFb) copyFb.classList.add('hidden');
    }

    function navigate(dir) {
      if (!filteredCards.length) return;
      currentIndex = (currentIndex + dir + filteredCards.length) % filteredCards.length;
      openModal(filteredCards[currentIndex]);
    }

    function trapFocus(e) {
      if (!modal) return;
      var focusable = Array.from(modal.querySelectorAll(
        'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])'
      )).filter(function(el) { return el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    return {
      init: init,
      setFiltered: function(cards) { filteredCards = cards; }
    };
  })();

  global.modalSetFiltered = function(cards) { Modal.setFiltered(cards); };

  // ══════════════════════════════════════════════════════════
  // FILTER
  // ══════════════════════════════════════════════════════════
  var Filter = (function () {
    var allCards = [];
    var fuse = null;
    var activeCategory = 'all';
    var activeEra      = '';
    var tileableOnly   = false;
    var searchQuery    = '';

    function buildFuse() {
      if (!global.Fuse || !allCards.length) return;
      var fuseData = allCards.map(function(card, i) {
        return {
          index: i,
          title: card.dataset.title || '',
          slug:  card.dataset.slug  || '',
          tags:  safeParseJson(card.dataset.tags, []).join(' '),
        };
      });
      fuse = new global.Fuse(fuseData, {
        keys: ['title', 'slug', 'tags'],
        threshold: 0.35,
        minMatchCharLength: 2,
      });
    }

    function apply() {
      var visible = allCards.slice();

      if (activeCategory !== 'all') {
        visible = visible.filter(function(c) { return c.dataset.category === activeCategory; });
      }
      if (activeEra) {
        visible = visible.filter(function(c) { return c.dataset.era === activeEra; });
      }
      if (tileableOnly) {
        visible = visible.filter(function(c) { return c.dataset.tileable === 'true'; });
      }
      if (searchQuery) {
        if (fuse) {
          var results = fuse.search(searchQuery);
          var matched = {};
          results.forEach(function(r) { matched[r.item.index] = true; });
          visible = visible.filter(function(c) { return matched[allCards.indexOf(c)]; });
        } else {
          var q = searchQuery;
          visible = visible.filter(function(c) {
            var hay = [c.dataset.title, c.dataset.slug, safeParseJson(c.dataset.tags,[]).join(' ')].join(' ').toLowerCase();
            return hay.indexOf(q) !== -1;
          });
        }
      }

      var visibleSet = new Set(visible);
      allCards.forEach(function(c, idx) {
        var show = visibleSet.has(c);
        c.style.display = show ? '' : 'none';
        c.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (show) c.dataset.filteredIndex = String(visible.indexOf(c));
      });

      // Live result count
      var countEl = document.getElementById('result-count');
      if (countEl) countEl.textContent = 'Showing ' + visible.length + ' of ' + allCards.length + ' textures';

      // Show/hide clear button
      var clearBtn = document.getElementById('clear-filters-btn');
      var filtersActive = activeCategory !== 'all' || activeEra || tileableOnly || searchQuery;
      if (clearBtn) clearBtn.classList.toggle('hidden', !filtersActive);

      Modal.setFiltered(visible);

      var empty = document.getElementById('empty-state');
      if (empty) empty.classList.toggle('hidden', visible.length > 0);
    }

    function bindEvents() {
      // Category tabs
      document.querySelectorAll('.category-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
          activeCategory = btn.dataset.category;
          document.querySelectorAll('.category-tab').forEach(function(b) {
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          apply();
        });
      });

      // Search (debounced 200ms)
      var searchEl = document.getElementById('search-input');
      if (searchEl) {
        var timer;
        searchEl.addEventListener('input', function() {
          clearTimeout(timer);
          timer = setTimeout(function() {
            searchQuery = searchEl.value.trim().toLowerCase();
            apply();
          }, 200);
        });
        // Clear search on Escape inside the input
        searchEl.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') { searchEl.value = ''; searchQuery = ''; apply(); }
        });
      }

      // Tileable toggle
      var toggleEl = document.getElementById('tileable-toggle');
      if (toggleEl) {
        toggleEl.addEventListener('change', function() {
          tileableOnly = toggleEl.checked;
          apply();
        });
      }

      // Era filter
      var eraEl = document.getElementById('era-filter');
      if (eraEl) {
        eraEl.addEventListener('change', function() {
          activeEra = eraEl.value;
          apply();
        });
      }

      // Tag pill clicks (delegated)
      document.addEventListener('click', function(e) {
        var pill = e.target.closest('.tag-pill[data-tag]');
        if (pill) {
          e.stopPropagation();
          var tag = pill.dataset.tag;
          var s = document.getElementById('search-input');
          if (s) { s.value = tag; searchQuery = tag.toLowerCase(); }
          apply();
        }
      });

      // Tag pill keyboard
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var pill = e.target.closest('.tag-pill[data-tag]');
          if (pill) { e.preventDefault(); pill.click(); }
        }
      });

      // Clear filters button
      var clearBtn = document.getElementById('clear-filters-btn');
      if (clearBtn) clearBtn.addEventListener('click', reset);
    }

    function reset() {
      activeCategory = 'all';
      activeEra      = '';
      tileableOnly   = false;
      searchQuery    = '';
      var s = document.getElementById('search-input');
      if (s) s.value = '';
      var t = document.getElementById('tileable-toggle');
      if (t) t.checked = false;
      var e = document.getElementById('era-filter');
      if (e) e.value = '';
      document.querySelectorAll('.category-tab').forEach(function(b) {
        b.setAttribute('aria-pressed', b.dataset.category === 'all' ? 'true' : 'false');
      });
      apply();
    }

    function init() {
      allCards = Array.from(document.querySelectorAll('.texture-card'));
      if (!allCards.length) return;
      buildFuse();
      bindEvents();
      apply();
    }

    return { init: init, buildFuse: buildFuse };
  })();

  // ══════════════════════════════════════════════════════════
  // BOOT
  // ══════════════════════════════════════════════════════════
  function boot() {
    initLazyFade();
    Modal.init();
    if (global.Fuse) {
      Filter.init();
    } else {
      Filter.init(); // basic filter first
      global.__galleryFilterInit = function() { Filter.buildFuse(); };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ══════════════════════════════════════════════════════════
  // UTILS
  // ══════════════════════════════════════════════════════════
  function safeParseJson(str, fallback) {
    try { return JSON.parse(str || 'null') || fallback; }
    catch (_) { return fallback; }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})(window);
