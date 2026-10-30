(function(root){
  const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const same=(a,b)=>a.x===b.x&&a.y===b.y;
  function food(body,size,random=Math.random){const empty=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!body.some(p=>p.x===x&&p.y===y))empty.push({x,y});return empty.length?empty[Math.floor(random()*empty.length)]:null;}
  function create(size=20,random=Math.random){const m=Math.floor(size/2),body=[{x:m,y:m},{x:m-1,y:m},{x:m-2,y:m}];return {size,body,direction:'right',food:food(body,size,random),score:0,over:false,won:false};}
  function turn(direction,next){const a=vectors[direction],b=vectors[next];return b&&!(a[0]+b[0]===0&&a[1]+b[1]===0)?next:direction;}
  function step(state,direction=state.direction,random=Math.random){
    if(state.over)return state;direction=turn(state.direction,direction);const v=vectors[direction],head={x:state.body[0].x+v[0],y:state.body[0].y+v[1]},eat=state.food&&same(head,state.food);
    const solid=eat?state.body:state.body.slice(0,-1);
    if(head.x<0||head.y<0||head.x>=state.size||head.y>=state.size||solid.some(p=>same(p,head)))return {...state,direction,over:true};
    const body=[head,...state.body];if(!eat)body.pop();const nextFood=eat?food(body,state.size,random):state.food;
    return {...state,body,direction,food:nextFood,score:state.score+(eat?10:0),over:!nextFood,won:!nextFood};
  }
  const api={create,step,turn,food};if(typeof module!=='undefined')module.exports=api;else root.SnakeEngine=api;
})(globalThis);
