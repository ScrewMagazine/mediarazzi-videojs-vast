# MEDIARAZZI VAST for Video.js 8

Free, VAST-first integration wrapper for **Video.js 8** and the official Google IMA Video.js plugin. Plays third-party or MEDIARAZZI VAST/VMAP tags using Google IMA. This package is **not** an ad server and does not create or measure VAST impressions itself.

## Test without programming

1. Upload the **entire package directory** to a temporary folder on an HTTPS website (for example, `/mediarazzi-player-test/`). The demo page will be at `/mediarazzi-player-test/demo/`.
2. Open the `demo/` page in Chrome, Edge, or Firefox.
3. Paste your MEDIARAZZI VAST tag or use the example. Click **Load & play advertisement**.
4. Observe player playback and diagnostics. Try individual tags, rotations, and pods. Check reported server statistics separately.
5. Test an external VAST tag that permits playback on your test domain.

**Important:** The demo loads pinned third-party Video.js and IMA libraries over HTTPS. It needs internet access and access to the ad tag and media URL. Ads may fail because of browser ad blockers, CORS, VAST XML errors, unsupported codecs, invalid media, or incompatible pod features. Don't use the example tag for production. This project has not yet been browser-verified against a live MEDIARAZZI tag.

## Supported versions

Video.js v8 only. **Video.js 10 is architecturally different** and does not support the legacy `registerPlugin` API or the same IMA integration path. Future Video.js 10 support requires a separate adapter. Do not install `video.js` without pinning `@8` if using this package.

## Developer installation

Install `video.js@8`, `videojs-contrib-ads`, `videojs-ima`, and this package. Load the Google IMA SDK before initializing the player. Include the packages' CSS. Import the IMA integration first, then:

```js
const mediarazziVast = require('mediarazzi-videojs-vast');
const player = videojs('my-video');
const connection = mediarazziVast.connect(player, {
  adTagUrl: 'https://ads.mediarazzi.com/vast/YOUR_TAG_KEY',
  onEvent: ({type}) => console.log(type)
});
// From a user click handler, initialize then play:
button.addEventListener('click', () => {
  connection.initializeOnUserGesture();
  player.play();
});
```

The wrapper does not override IMA settings, invent impression statistics, or assume a MEDIARAZZI subscription. It accepts any valid HTTP(S) tag. Browser CORS policy and the video player's VAST/pod compatibility still apply.

## API

- `validateTagUrl(url)` validates absolute HTTP(S) VAST tags and rejects embedded credentials.
- `connect(videojsPlayer,{adTagUrl,id?,imaOptions?,onEvent?})` configures IMA and returns `{tagUrl,initializeOnUserGesture(),dispose()}`.
- `register(videojs)` registers a basic Video.js v8 plugin named `mediarazziVast` for teams that prefer `player.mediarazziVast(...)`.

Only pass trusted IMA options and URLs. Be mindful of consent and privacy laws when collecting viewer data through advertising SDKs.

## Testing and publishing

Run `npm test`, `npm run check`, and `npm pack --dry-run` from the package root. Browser testing must still be performed on a real HTTPS page before publishing. Publishing requires your own npm account and choosing a package name that is available on the registry.

## Commercial relationship

MEDIARAZZI is an optional hosted VAST ad server at https://mediarazzi.com. Its $49.95/month subscription is separate from this open-source integration; no MEDIARAZZI subscription is required for third-party VAST tags.

## License

Apache 2.0. This repository does not redistribute the Google IMA SDK, Video.js, or videojs-ima. Their own licenses and terms apply.
