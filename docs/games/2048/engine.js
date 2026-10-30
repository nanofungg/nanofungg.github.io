(function(root){
  function move(board,direction){
    const next=board.slice();let score=0;
    for(let lane=0;lane<4;lane++){
      const ids=Array.from({length:4},(_,i)=>direction==='left'?lane*4+i:direction==='right'?lane*4+3-i:direction==='up'?i*4+lane:(3-i)*4+lane);
      const values=ids.map(i=>board[i]).filter(Boolean),out=[];
      for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){out.push(values[i]*2);score+=values[i]*2;i++;}else out.push(values[i]);}
      ids.forEach((id,i)=>next[id]=out[i]||0);
    }
    return {board:next,score,changed:next.some((v,i)=>v!==board[i])};
  }
  function spawn(board,random=Math.random){const empty=board.map((v,i)=>v?null:i).filter(i=>i!==null);if(!empty.length)return board.slice();const next=board.slice();next[empty[Math.floor(random()*empty.length)]]=random()<.9?2:4;return next;}
  function canMove(board){return ['up','down','left','right'].some(d=>move(board,d).changed);}
  const api={move,spawn,canMove};if(typeof module!=='undefined')module.exports=api;else root.Puzzle2048=api;
})(globalThis);
