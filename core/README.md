# Tracker core (`core/core.js`)
Exposes `window.TRACKER_CORE`. It needs Leaflet 1.9.4 loaded first. Calls and texts are pretend, and other people's positions are demo positions.

- `initMap(elementId)`: Leaflet + OSM tiles ("© OpenStreetMap contributors"), draws allowed pins
- `startSharing()` / `stopSharing()` / `isSharing()`: own location via `watchPosition`
- `invite({name, phone, email})`: invited → calling → no_answer → texted (simulated)
- `respond(inviteId, yes)`: accepted (demo position near you, or near Darwin) or declined
- `stopPerson(id)`, `removeInvite(id)`: stop or remove; the pin goes right away
- `getInvites()`, `getVisible()`, `reset()`
- `on(event, cb)` returns an unsubscribe function. Events: inviteSent, calling, noAnswer, texted, accepted, declined, locationUpdate, sharingStopped
- Optional `TRACKER_AUDIO` hooks: inviteSent, ringStart, ringStop, accepted, declined, sharingStopped

Rule: a pin or position exists only when `status==='accepted' && sharing`. Getters strip `pos` otherwise.
Storage: `localStorage.tracker_core`. Test page: `core/test.html`.
