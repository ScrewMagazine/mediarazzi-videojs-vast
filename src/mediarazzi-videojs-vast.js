/* MEDIARAZZI VAST integration for Video.js 8 + Google IMA.
 * No SDK keys or customer credentials are stored by this package.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MediarazziVast = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function validateTagUrl(value) {
    if (typeof value !== 'string' || !value.trim()) throw new TypeError('A VAST tag URL is required.');
    var url;
    try { url = new URL(value.trim()); } catch (_) { throw new TypeError('Enter a valid absolute VAST URL.'); }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new TypeError('Only HTTP(S) VAST URLs are supported.');
    if (url.username || url.password) throw new TypeError('Credentials embedded in VAST URLs are not supported.');
    return url.href;
  }
  function connect(player, options) {
    options = options || {};
    if (!player || typeof player.ima !== 'function' || typeof player.on !== 'function') {
      throw new TypeError('Video.js 8 with videojs-ima must be initialized before MEDIARAZZI.');
    }
    var tag = validateTagUrl(options.adTagUrl);
    var handler = typeof options.onEvent === 'function' ? options.onEvent : function () {};
    var disposed = false;
    var listeners = [];
    function notify(type, details) {
      if (disposed) return;
      try { handler({ type: type, details: details || null, timestamp: new Date().toISOString() }); } catch (_) { /* user callback must not break playback */ }
    }
    var events = ['ads-request', 'ads-loader', 'ads-manager', 'ads-ad-started', 'adstart', 'adend', 'adserror', 'adskip', 'adtimeout', 'contentresumed', 'error'];
    events.forEach(function (name) {
      var fn = function (event) {
        var detail = name === 'error' && typeof player.error === 'function' ? player.error() : null;
        notify(name, detail && detail.message ? { message: String(detail.message) } : null);
      };
      player.on(name, fn); listeners.push([name, fn]);
    });
    var imaOptions = Object.assign({}, options.imaOptions || {}, { adTagUrl: tag, id: options.id || (player.id && player.id()) });
    // VAST loading and tracking are handled by the official Google IMA integration.
    // Do not implement fake impression callbacks or force a skip overlay.
    player.ima(imaOptions);
    notify('configured', { tagUrl: tag });
    return {
      tagUrl: tag,
      initializeOnUserGesture: function () {
        if (disposed) throw new Error('The connection has been disposed.');
        if (player.ima && typeof player.ima.initializeAdDisplayContainer === 'function') {
          player.ima.initializeAdDisplayContainer();
          notify('display-container-initialized');
        }
      },
      dispose: function () {
        if (disposed) return;
        listeners.forEach(function (pair) { if (typeof player.off === 'function') player.off(pair[0], pair[1]); });
        disposed = true;
      }
    };
  }
  function register(videojs) {
    if (!videojs || typeof videojs.registerPlugin !== 'function') throw new TypeError('Expected Video.js 8.');
    if (typeof videojs.getPlugin === 'function' && videojs.getPlugin('mediarazziVast')) return;
    videojs.registerPlugin('mediarazziVast', function (options) { return connect(this, options); });
  }
  return { connect: connect, register: register, validateTagUrl: validateTagUrl };
});
