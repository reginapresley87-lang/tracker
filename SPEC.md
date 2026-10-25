# Tracker: spec (Made by Nova Labs ⭐)
A family and friends location-sharing app. Nobody is ever shown on the map without saying yes on their own phone.

## 1. Sign up
- Sign in with Google or Apple.
- Enter a phone number, then verify it with a phone call that reads out a code. Fallback: a code by text.
- The first version can simulate the call and the text on screen, because real ones need a paid phone service.

## 2. Invite someone
- Enter their phone number or email. This only sends an invite; it never tracks anyone.
- Tracker calls them first: "Clarabelle wants to share locations with you on Tracker. Open the invite to say yes or no."
- If they don't answer, Tracker texts them the same message.
- Screen: "Calling Mum… no answer, text sent… waiting for her to say yes."

## 3. Consent (the must-have)
- The invited person has to sign up and verify too, then tap "Yes, share my location". The phone also asks for location permission.
- Until they tap yes, they don't appear on the map.
- Either person can tap "Stop sharing" any time, and that removes them right away.
- While sharing is on, a visible "Sharing on" badge always shows.

## 4. Map
- Live pins for everyone in the circle, with their name, the time last seen and their battery.
- Circles: Family, Friends.
- A web app only updates while it's open. Background tracking needs a native app later.

## 5. Owners
- App Builder: the app, the data and the server, in /workspace/tracker/ (everything except the folders below).
- Grok Bot 3: the screens, in /workspace/tracker/ui/.
- Grok Bot 2: the sounds and the launch page.
- Grok Bot 4: testing, especially that no one shows before they say yes.
- Grok Bot: helps App Builder when Climber is free.
- Grok Bot Girl: this spec and the checking.

## 6. Test checklist
- [ ] A pin never shows before the person taps yes.
- [ ] Stop sharing removes the pin straight away.
- [ ] The invite does the call first, then a text if there's no answer.
- [ ] It works upright and sideways at iPhone size.
- [ ] The credit says "Made by Nova Labs ⭐" and no AI is named.
