const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('Portrait gates dual start, rotation retries once, active match pauses and cancellation clears pending start',()=>{
 const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,handlers:{},addEventListener(k,f){this.handlers[k]=f;}});return nodes.get(id);};
 const portrait={matches:true,addEventListener(k,f){this.changed=f;}},window={},document={getElementById:node,documentElement:{}};
 vm.runInNewContext(fs.readFileSync('dist/orientation.js','utf8'),{window,document,screen:{},matchMedia:()=>portrait});
 const api=window.NanoOrientation;
 assert.equal(api.prepare(true),true);assert.equal(api.prepare(false),false);assert.equal(node('rotate-overlay').hidden,false);assert.equal(api.poll(),4);
 portrait.matches=false;portrait.changed();assert.equal(api.poll(),5);assert.equal(api.poll(),0);assert.equal(node('rotate-overlay').hidden,true);
 assert.equal(api.prepare(false),true);api.started(false);portrait.matches=true;portrait.changed();assert.equal(api.poll(),4);assert.equal(api.poll(),4,'portrait cannot resume a dual match');
 api.reset();assert.equal(node('rotate-overlay').hidden,true);assert.equal(api.poll(),0);
 api.prepare(false);api.reset();portrait.matches=false;portrait.changed();assert.equal(api.poll(),0,'cancel never starts or charges later');
});
