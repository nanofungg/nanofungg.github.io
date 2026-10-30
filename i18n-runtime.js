(() => {
  'use strict';
  const supported=['zh-CN','en','ja','es-MX','ko'],key='nanofun.language.v1';
  function resolve(preference,languages){if(supported.includes(preference))return preference;for(const value of languages||[]){const prefix=String(value).toLowerCase().split('-')[0];const found={zh:'zh-CN',en:'en',ja:'ja',es:'es-MX',ko:'ko'}[prefix];if(found)return found;}return 'en';}
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const exact=new Map(ROWS.map(row=>[row[0].trim(),row])),patterns=ROWS.filter(row=>row[0].includes('{')).map(row=>({row,regex:new RegExp('^'+escape(row[0]).replace(/\\\{[nm]\\\}/g,'(\\d+)')+'$')}));
  const fragments=new RegExp([...exact.keys()].filter(x=>!x.includes('{')).sort((a,b)=>b.length-a.length).map(escape).join('|'),'g');
  function translate(text,lang){if(lang==='zh-CN')return text;const index=supported.indexOf(lang),trimmed=text.trim(),row=exact.get(trimmed);if(row)return text.replace(trimmed,row[index]||trimmed);for(const p of patterns){const m=trimmed.match(p.regex);if(m){let n=0;return text.replace(trimmed,p.row[index].replace(/\{[nm]\}/g,()=>m[++n]));}}return text.replace(fragments,source=>exact.get(source)[index]||source);}
  if(typeof module!=='undefined'){module.exports={resolve,translate,rows:ROWS};return;}
  let preference='auto';try{preference=localStorage.getItem(key)||'auto';}catch{}
  let lang=resolve(preference,navigator.languages||[navigator.language]);
  try{if(parent!==window&&parent.NanoI18n)lang=parent.NanoI18n.lang;}catch{}
  const textMemory=new WeakMap(),attributeMemory=new WeakMap(),frames=new WeakSet();
  const scriptURL=document.currentScript.src;
  let observer;
  function frameReady(frame){try{const doc=frame.contentDocument;if(!doc?.body)return;if(frame.contentWindow.NanoI18n){frame.contentWindow.NanoI18n.set(lang,false);return;}if(doc.querySelector('[data-nanofun-i18n]'))return;const script=doc.createElement('script');script.src=scriptURL;script.dataset.nanofunI18n='true';doc.head.append(script);}catch{}}
  function paint(){
    observer?.disconnect();document.documentElement.lang=lang;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){if(node.parentElement?.closest('script,style,select,[translate="no"]'))continue;const old=textMemory.get(node);const source=old&&node.nodeValue===old.output?old.source:node.nodeValue;const output=translate(source,lang);if(output!==node.nodeValue)node.nodeValue=output;textMemory.set(node,{source,output});}
    document.querySelectorAll('[aria-label],[alt],[title],[placeholder]').forEach(el=>{if(el.closest('select,[translate="no"]'))return;const saved=attributeMemory.get(el)||{};for(const name of ['aria-label','alt','title','placeholder']){const value=el.getAttribute(name);if(value===null)continue;const old=saved[name],source=old&&value===old.output?old.source:value,output=translate(source,lang);if(output!==value)el.setAttribute(name,output);saved[name]={source,output};}attributeMemory.set(el,saved);});
    document.querySelectorAll('iframe').forEach(frame=>{if(!frames.has(frame)){frames.add(frame);frame.addEventListener('load',()=>frameReady(frame));frameReady(frame);}});
    const select=document.getElementById('language-select');if(select){select.value=preference;select.setAttribute('aria-label',{en:'Language',ja:'言語','zh-CN':'语言','es-MX':'Idioma',ko:'언어'}[lang]);}
    observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','alt','title','placeholder']});
  }
  function set(value,persist=true){if(persist){preference=value;try{localStorage.setItem(key,value);}catch{}}lang=resolve(value,navigator.languages||[navigator.language]);paint();document.querySelectorAll('iframe').forEach(frame=>frameReady(frame));}
  window.NanoI18n=Object.freeze({get lang(){return lang;},set,t:text=>translate(text,lang)});
  observer=new MutationObserver(paint);paint();
  document.getElementById('language-select')?.addEventListener('change',event=>set(event.target.value));
  window.addEventListener('storage',event=>{if(event.key===key){preference=event.newValue||'auto';set(preference,false);}});
})();
