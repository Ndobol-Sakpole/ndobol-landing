# Game economy snapshot

`rafts.js` and `rewards.js` are copied from the game workspace at commit `b05ddf6056bb35142e0d2d93b3f4a734331f4922` on 24 October 2026. Source: [ndobol-game](https://github.com/Ndobol-Sakpole/ndobol-game). They are MIT-licensed; copyright (c) 2026 Ndobol Sesarengan contributors.

The landing page imports raft IDs, price strings, reward rates, and exact MON formatting. It does not execute the game's physics or payment flow. Only `rewards.js` is included in the browser build for the calculator.

To update prices, review the equivalent files in the game repo, copy the reviewed versions here, update this reference, then run `npm test` and inspect `/ekonomi` in both languages. Never convert prices through JavaScript floating-point numbers. One MON is 10^18 wei.

This is a snapshot, not a live API. Changes in the game repository do not automatically change the website.
