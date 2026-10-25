/* Tracker audio — procedural UI sounds. Made by Nova Labs ⭐ */
(function () {
  'use strict';
  var ctx = null, master = null, vol = 0.6, muted = false, ringTimer = null, inited = false;
  function AC() { return window.AudioContext || window.webkitAudioContext; }
  function ready() { return ctx && master && ctx.state === 'running' && !muted; }
  function applyGain() { if (master) try { master.gain.setTargetAtTime(muted ? 0 : vol, ctx.currentTime, 0.01); } catch (e) {} }
  function create() {
    if (ctx) return true;
    var C = AC(); if (!C) return false;
    try { ctx = new C(); master = ctx.createGain(); master.gain.value = muted ? 0 : vol; master.connect(ctx.destination); return true; }
    catch (e) { ctx = null; master = null; return false; }
  }
  function unlock() {
    try {
      if (!create()) return;
      if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(function () {});
      var b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); s.start(0);
    } catch (e) {}
  }
  // tone(freq, start offset, duration, type, peak, endFreq)
  function tone(f, at, dur, type, peak, f2) {
    if (!ready()) return;
    try {
      var t = ctx.currentTime + (at || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      var p = peak || 0.3;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  function bell(f, at, dur, peak) { tone(f, at, dur, 'sine', peak); tone(f * 2, at, dur * 0.6, 'sine', (peak || 0.3) * 0.25); }
  function ringBurst() { for (var i = 0; i < 6; i++) { tone(i % 2 ? 1046.5 : 1318.5, i * 0.07, 0.07, 'sine', 0.22); } }
  var api = {
    init: function () {
      if (inited) return; inited = true;
      try {
        var evs = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
        var h = function () { unlock(); if (ctx && ctx.state === 'running') evs.forEach(function (e) { document.removeEventListener(e, h, true); }); };
        evs.forEach(function (e) { document.addEventListener(e, h, true); });
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden && ctx && ctx.state !== 'running') try { ctx.resume().catch(function () {}); } catch (e) {}
        });
      } catch (e) {}
    },
    unlock: unlock,
    setVolume: function (v) { v = Number(v); if (!isFinite(v)) return; vol = Math.max(0, Math.min(1, v)); applyGain(); },
    mute: function (m) { muted = !!m; applyGain(); },
    tap: function () { tone(1800, 0, 0.03, 'triangle', 0.12, 1200); },
    inviteSent: function () { bell(659.3, 0, 0.25, 0.22); bell(880, 0.09, 0.25, 0.22); bell(1318.5, 0.18, 0.4, 0.2); },
    ringStart: function () {
      if (ringTimer || !ctx) return;
      ringBurst();
      ringTimer = setInterval(function () { ringBurst(); setTimeout(ringBurst, 550); }, 2200);
      setTimeout(ringBurst, 550);
    },
    ringStop: function () { if (ringTimer) { clearInterval(ringTimer); ringTimer = null; } },
    verified: function () { bell(1567.98, 0, 0.6, 0.28); },
    accepted: function () { bell(783.99, 0, 0.25, 0.25); bell(1174.66, 0.12, 0.45, 0.25); },
    declined: function () { tone(330, 0, 0.35, 'sine', 0.22, 247); },
    arrived: function () { bell(1046.5, 0, 0.45, 0.22); },
    left: function () { tone(1046.5, 0, 0.18, 'sine', 0.2, 900); tone(784, 0.12, 0.3, 'sine', 0.18, 660); },
    sharingStopped: function () { tone(587.33, 0, 0.3, 'sine', 0.2); },
    error: function () { tone(150, 0, 0.09, 'square', 0.08); tone(150, 0.12, 0.09, 'square', 0.08); }
  };
  window.TRACKER_AUDIO = api;
})();
