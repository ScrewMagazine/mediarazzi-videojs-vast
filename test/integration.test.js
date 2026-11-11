const test=require('node:test');const assert=require('node:assert/strict');const kit=require('../src/mediarazzi-videojs-vast.js');
test('accepts HTTPS VAST URLs',()=>assert.equal(kit.validateTagUrl('https://ads.mediarazzi.com/vast/abc'),'https://ads.mediarazzi.com/vast/abc'));
test('rejects non-HTTP schemes and credentials',()=>{for(const u of ['javascript:alert(1)','file:///test','https://bob:secret@example.com/vast','invalid'])assert.throws(()=>kit.validateTagUrl(u));});
test('connect passes tag to IMA and exposes lifecycle functions',()=>{
const events=[],callbacks=new Map();let imaOptions;
const player={on(name,fn){callbacks.set(name,fn)},off(name){callbacks.delete(name)},ima(opts){imaOptions=opts},id(){return 'vid-1'}};
player.ima.initializeAdDisplayContainer=()=>events.push('gesture');
const c=kit.connect(player,{adTagUrl:'https://ads.mediarazzi.com/vast/test',onEvent:e=>events.push(e.type)});
assert.equal(imaOptions.adTagUrl,'https://ads.mediarazzi.com/vast/test');assert.equal(imaOptions.id,'vid-1');callbacks.get('ads-ad-started')();c.initializeOnUserGesture();assert.deepEqual(events,['configured','ads-ad-started','gesture','display-container-initialized']);c.dispose();assert.equal(callbacks.size,0);
});
test('registers with videojs only once',()=>{let registered=0;const vjs={getPlugin(){return registered?function(){}:null},registerPlugin(name,fn){assert.equal(name,'mediarazziVast');registered++;assert.equal(typeof fn,'function')}};kit.register(vjs);kit.register(vjs);assert.equal(registered,1);});
