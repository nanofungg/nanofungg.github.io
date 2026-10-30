const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const {webcrypto}=require('node:crypto');

function harness(storage=new Map()) {
  const nodes=new Map();
  function node(id){if(nodes.has(id))return nodes.get(id);const n={id,textContent:'',hidden:false,disabled:false,open:false,value:'',children:[],handlers:{},classList:{add(){},remove(){}},addEventListener(type,fn){this.handlers[type]=fn;},append(...items){this.children.push(...items);this.firstChild=this.children[0];},replaceChildren(...items){this.children=items;this.firstChild=items[0];},showModal(){this.open=true;},close(){this.open=false;this.handlers.close?.();},checkValidity(){return this.value.includes('@');},reportValidity(){}};nodes.set(id,n);return n;}
  const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
  const window={addEventListener(){}};
  const sandbox={document:{getElementById:node,querySelectorAll:()=>[],createElement:t=>node(t+Math.random())},localStorage,window,crypto:webcrypto,TextEncoder,Date,setTimeout:()=>0,clearTimeout(){},console};
  vm.runInNewContext(fs.readFileSync('dist/arcade.js','utf8'),sandbox);
  return {node,storage,window,click:id=>node(id).handlers.click(),async login(email){node('email').value=email;await node('email-form').handlers.submit({preventDefault(){},submitter:node('submit')});},balance:()=>Number(node('header-balance').textContent)};
}

test('Daily grant, per-match charge, zero balance, simulated reward and persistence',async()=>{
 const h=harness();assert.equal(h.balance(),0);
 assert.equal(h.window.NanoArcade.requestMatch(),false,'unauthenticated cannot play');
 await h.login('arcade-test@example.com');assert.equal(h.balance(),10);
 h.click('daily-button');assert.equal(h.balance(),10,'daily reward cannot repeat');
 h.click('reward-button');assert.equal(h.balance(),10,'ad reward unavailable before empty');
 h.click('play-button');assert.equal(h.balance(),10,'opening cabinet is free');
 h.window.NanoOrientation={prepare:()=>false};assert.equal(h.window.NanoArcade.requestMatch(false),false);assert.equal(h.balance(),10,'waiting for landscape never charges');
 delete h.window.NanoOrientation;
 for(let i=0;i<10;i++)assert.equal(h.window.NanoArcade.requestMatch(),true);
 assert.equal(h.balance(),0);assert.equal(h.window.NanoArcade.requestMatch(),false);assert.equal(h.balance(),0);
 h.click('reward-button');assert.equal(h.balance(),10);
 h.click('reward-button');assert.equal(h.balance(),10,'reward cannot double-credit');
 const next=harness(h.storage);assert.equal(next.balance(),10,'refresh preserves balance');
 next.click('switch-account');await next.login('ARCADE-TEST@EXAMPLE.COM');assert.equal(next.balance(),10,'email normalization prevents extra daily grant');
 const raw=[...h.storage.values()].join('');assert.ok(!raw.includes('arcade-test@example.com'),'full email is not persisted');
 next.click('exit-game');assert.equal(next.window.NanoArcade.requestMatch(),false,'closed cabinet cannot charge');
});
