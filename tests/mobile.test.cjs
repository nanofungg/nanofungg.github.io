const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('Joystick dead zone, diagonal input, pointer capture cleanup and one smash edge',()=>{
 const make=(dataset={})=>({dataset,handlers:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){},contains(){return false;}},addEventListener(k,f){this.handlers[k]=f;},setPointerCapture(){},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k];},getBoundingClientRect(){return{left:0,top:0,width:150,height:150};}});
 const sticks=[make({side:0}),make({side:1})],keys=[make({bit:16}),make({bit:512})],commands=[1,2,3].map(command=>make({command})),host=make();
 host.querySelectorAll=s=>s==='.joystick'?sticks:s==='[data-bit]'?keys:s==='[data-command]'?commands:[];
 const nodes={'mobile-controls':host,'cabinet-dialog':make(),'fullscreen-toggle':make(),'touch-toggle':make(),'touch-help':make(),'game-status':make()};
 const meta=make();meta.content='width=device-width,initial-scale=1';
 const window=make(),document={getElementById:id=>nodes[id],querySelector:()=>meta,documentElement:{},addEventListener(){}};
 vm.runInNewContext(fs.readFileSync('dist/mobile.js','utf8'),{window,document,matchMedia:()=>({matches:false}),navigator:{maxTouchPoints:0}});
 const event=(id,x=75,y=75)=>({pointerId:id,clientX:x,clientY:y,preventDefault(){}}),api=window.NanoTouch;
 sticks[0].handlers.pointerdown(event(1));assert.equal(api.poll(),0,'center dead zone');
 sticks[0].handlers.pointermove(event(1,140,10));keys[0].handlers.pointerdown(event(2));sticks[1].handlers.pointerdown(event(3,0,75));
 assert.equal(api.poll(),2|4|16|32,'independent movement, upward jump and smash');assert.equal(api.poll(),2|4|32,'smash only once per press');
 sticks[0].handlers.pointerdown(event(9,0,75));assert.equal(api.poll(),2|4|32,'second finger cannot steal a held stick');
 sticks[0].handlers.pointermove(event(1,500,75));assert.equal(api.poll(),2|32,'drag remains clamped beyond the stick rim');
 sticks[0].handlers.pointercancel(event(1));sticks[1].handlers.lostpointercapture(event(3));assert.equal(api.poll(),0,'cancel releases motion');
 api.enter();assert.match(meta.content,/maximum-scale=1/);nodes['cabinet-dialog'].handlers.close();assert.equal(meta.content,'width=device-width,initial-scale=1','leaving play restores page zoom');
 api.pause();assert.equal(api.poll(),4<<10);assert.equal(api.poll(),0);api.mode(false);assert.equal(host.dataset.mode,'double');
});
