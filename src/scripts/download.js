/**
 * download.js — Single PNG download + clipboard copy for Generation Prompt
 * Note: most download is handled natively via <a download> in the modal.
 * This file handles any programmatic triggers.
 */

(function () {
  'use strict';

  /**
   * Trigger a programmatic PNG download.
   * @param {string} url   - URL to the PNG file
   * @param {string} filename - Desired download filename
   */
  function downloadPng(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Copy text to clipboard.
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  // Expose globally for use by modal.js
  window.galleryDownload = { downloadPng, copyToClipboard };

})();
