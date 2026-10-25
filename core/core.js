/* Tracker core — consent-first location sharing. Made by Nova Labs ⭐ */
(function () {
  'use strict';
  var KEY = 'tracker_core', DARWIN = [-12.4634, 130.8456];
  var S = load(), map = null, markers = {}, watchId = null, subs = {};

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.invites) return s; } catch (e) {}
    return { invites: [], me: null, sharing: false };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function audio(n) { try { var A = window.TRACKER_AUDIO; if (A && typeof A[n] === 'function') A[n](); } catch (e) {} }
  function emit(ev, d) { (subs[ev] || []).slice().forEach(function (cb) { try { cb(d); } catch (e) {} }); }
  function find(id) { for (var i = 0; i < S.invites.length; i++) if (S.invites[i].id === id) return S.invites[i]; return null; }
  // HARD RULE: only accepted AND sharing people have a location.
  function visible(p) { return p.status === 'accepted' && p.sharing === true && !!p.pos; }
  function copy(p) { var c = {}; for (var k in p) c[k] = p[k]; if (!visible(p)) delete c.pos; return c; }

  function render() {
    if (!map || !window.L) return;
    var want = {};
    if (S.sharing && S.me) want.me = { pos: S.me, label: 'You' };
    S.invites.forEach(function (p) {
      if (visible(p)) want[p.id] = { pos: p.pos, label: p.name + ' (demo) · ' + new Date(p.seen).toLocaleTimeString() };
    });
    Object.keys(markers).forEach(function (k) { if (!want[k]) { markers[k].remove(); delete markers[k]; } });
    Object.keys(want).forEach(function (k) {
      var w = want[k];
      if (markers[k]) markers[k].setLatLng(w.pos).setPopupContent(w.label);
      else markers[k] = L.marker(w.pos).addTo(map).bindPopup(w.label);
    });
  }

  function initMap(elementId) {
    if (!window.L) throw new Error('Leaflet not loaded');
    if (map) map.remove();
    markers = {};
    map = L.map(elementId).setView(S.me || DARWIN, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    render();
    return map;
  }

  function startSharing() {
    if (watchId !== null) return true;
    if (!navigator.geolocation) return false;
    watchId = navigator.geolocation.watchPosition(function (p) {
      S.me = [p.coords.latitude, p.coords.longitude]; S.sharing = true; save(); render();
      emit('locationUpdate', { who: 'me', pos: S.me, time: Date.now() });
    }, function () { stopSharing(); }, { enableHighAccuracy: true, maximumAge: 30000 });
    S.sharing = true; save(); render();
    return true;
  }
  function stopSharing() {
    if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    watchId = null; var was = S.sharing; S.sharing = false; save(); render();
    if (was) { audio('sharingStopped'); emit('sharingStopped', { who: 'me' }); }
  }
  function isSharing() { return watchId !== null && S.sharing; }

  function setStatus(p, st, ev) { p.status = st; p.updated = Date.now(); save(); emit(ev, copy(p)); }

  // Pretend call -> pretend text. No real calls or texts are made.
  function invite(o) {
    o = o || {};
    if (!o.name || !(o.phone || o.email)) throw new Error('name and phone or email required');
    var p = { id: 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: String(o.name), phone: o.phone || '', email: o.email || '',
      status: 'invited', sharing: false, demo: true, created: Date.now() };
    S.invites.push(p); save();
    audio('inviteSent'); emit('inviteSent', copy(p));
    setTimeout(function () {
      if (p.status !== 'invited') return;
      audio('ringStart'); setStatus(p, 'calling', 'calling');
      setTimeout(function () {
        audio('ringStop');
        if (p.status !== 'calling') return;
        setStatus(p, 'no_answer', 'noAnswer');
        setTimeout(function () { if (p.status === 'no_answer') setStatus(p, 'texted', 'texted'); }, 800);
      }, 2000);
    }, 300);
    return copy(p);
  }

  function respond(id, yes) {
    var p = find(id);
    if (!p || ['calling', 'no_answer', 'texted'].indexOf(p.status) < 0) return null; // must have been asked first
    if (yes) {
      var b = S.me || DARWIN;
      p.pos = [b[0] + (Math.random() - 0.5) * 0.03, b[1] + (Math.random() - 0.5) * 0.03];
      p.seen = Date.now(); p.sharing = true;
      setStatus(p, 'accepted', 'accepted'); audio('accepted');
      render(); emit('locationUpdate', { who: p.id, name: p.name, pos: p.pos, time: p.seen, demo: true });
    } else {
      p.sharing = false; delete p.pos;
      setStatus(p, 'declined', 'declined'); audio('declined');
    }
    return copy(p);
  }

  // Either side stops: removes them from the map at once.
  function stopPerson(id) {
    var p = find(id); if (!p) return;
    p.sharing = false; delete p.pos; save(); render();
    audio('sharingStopped'); emit('sharingStopped', { who: p.id, name: p.name });
  }
  function removeInvite(id) {
    var p = find(id); if (!p) return;
    if (p.sharing) stopPerson(id);
    S.invites = S.invites.filter(function (x) { return x.id !== id; }); save(); render();
  }

  // Demo drift every 15s for sharing people while the page is open.
  setInterval(function () {
    S.invites.forEach(function (p) {
      if (!visible(p)) return;
      p.pos = [p.pos[0] + (Math.random() - 0.5) * 0.001, p.pos[1] + (Math.random() - 0.5) * 0.001];
      p.seen = Date.now();
      emit('locationUpdate', { who: p.id, name: p.name, pos: p.pos, time: p.seen, demo: true });
    });
    save(); render();
  }, 15000);

  // Resume pending simulated invites after reload by marking them texted.
  S.invites.forEach(function (p) { if (p.status === 'invited' || p.status === 'calling' || p.status === 'no_answer') p.status = 'texted'; });
  S.sharing = false; save(); // geolocation watch never survives reload

  window.TRACKER_CORE = {
    initMap: initMap, startSharing: startSharing, stopSharing: stopSharing, isSharing: isSharing,
    invite: invite, respond: respond, stopPerson: stopPerson, removeInvite: removeInvite,
    getInvites: function () { return S.invites.map(copy); },
    getVisible: function () { return S.invites.filter(visible).map(copy); },
    on: function (ev, cb) { (subs[ev] = subs[ev] || []).push(cb); return function () { subs[ev] = subs[ev].filter(function (f) { return f !== cb; }); }; },
    reset: function () { stopSharing(); S = { invites: [], me: null, sharing: false }; save(); render(); }
  };
})();
