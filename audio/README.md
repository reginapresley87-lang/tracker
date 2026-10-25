# Tracker audio
Include `<script src="audio.js"></script>`, call `TRACKER_AUDIO.init()`. All calls are safe no-ops before unlock. Made by Nova Labs ⭐
- `init()` — install first-gesture unlock and visibilitychange resume.
- `unlock()` — create/resume the audio context (call from a user gesture).
- `setVolume(v)` — master volume 0..1.
- `mute(bool)` — mute or unmute.
- `tap()` — subtle button tick.
- `inviteSent()` — rising three-note chime.
- `ringStart()` — start looping ringtone for the verification call.
- `ringStop()` — stop the ringtone.
- `verified()` — success ding.
- `accepted()` — happy two-note when someone agrees to share.
- `declined()` — soft low falling tone.
- `arrived()` — gentle ping when a friend reaches a place.
- `left()` — soft descending ping.
- `sharingStopped()` — neutral tone.
- `error()` — short buzz.
