var u=Object.defineProperty;var P=(y,b,x)=>b in y?u(y,b,{enumerable:!0,configurable:!0,writable:!0,value:x}):y[b]=x;var m=(y,b,x)=>P(y,typeof b!="symbol"?b+"":b,x);(function(){"use strict";class y{constructor(t,i){m(this,"transpositionTable",new Map);this.strategy=t,this.maxDepth=i}findBestMove(t,i){console.log("findBestMove");let e=i===1?-1/0:1/0,o=null;const n=this.strategy.generateChildren(t,i);for(const r of n){const s=this.minimax(r,this.maxDepth-1,-1/0,1/0,i===1?2:1),a=Math.random()<.5;let l=a?s<=e:s<e;i===1&&(l=a?s>=e:s>e),l&&(e=s,o=r)}return console.log("BEST EVAL",e),o}minimax(t,i,e,o,n){const r=this.strategy.getHash(t,n);if(this.transpositionTable.has(r))return this.transpositionTable.get(r);if(i===0||this.strategy.isGameOver(t)){const a=this.strategy.evaluateState(t,n);return this.transpositionTable.set(r,a),a}let s;if(n===1){s=-1/0;for(const a of this.strategy.generateChildren(t,2)){const l=this.minimax(a,i-1,e,o,2);if(s=Math.max(s,l),e=Math.max(e,s),o<=e)break}}else{s=1/0;for(const a of this.strategy.generateChildren(t,1)){const l=this.minimax(a,i-1,e,o,1);if(s=Math.min(s,l),o=Math.min(o,s),o<=e)break}}return this.transpositionTable.set(r,s),s}}class b{constructor(){}getPlayerPositions(t,i){const e=[];for(let o=0;o<5;o++)for(let n=0;n<5;n++)t[o][n]===i&&e.push({x:o,y:n});return e}getBobailPosition(t){for(let i=0;i<5;i++)for(let e=0;e<5;e++)if(t[i][e]===3)return{x:i,y:e};return null}isWithinBounds(t){return t.x>=0&&t.x<5&&t.y>=0&&t.y<5}getAdjacentPositions(t){return[{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:0,y:-1},{x:0,y:1},{x:1,y:-1},{x:1,y:0},{x:1,y:1}].map(e=>({x:t.x+e.x,y:t.y+e.y})).filter(this.isWithinBounds.bind(this))}getPieceAt(t,i){return t[i.x][i.y]}getLinearMoves(t,i){const e=[],o=[{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:0,y:-1},{x:0,y:1},{x:1,y:-1},{x:1,y:0},{x:1,y:1}];for(const n of o){let r=i.x+n.x,s=i.y+n.y,a=!1;for(;this.isWithinBounds({x:r,y:s})&&this.getPieceAt(t,{x:r,y:s})===0;)r+=n.x,s+=n.y,a=!0;a&&e.push({x:r-n.x,y:s-n.y})}return e}isGameOver(t){const i=this.getBobailPosition(t);if(!i)throw new Error("Bobail required on the grid");return i.y===4||i.y===0||!this.getAdjacentPositions(i).filter(o=>this.getPieceAt(t,o)===0).length}}class x{constructor(){m(this,"minMax");m(this,"bobailService");console.log("Depth max = ",5),this.minMax=new y(this,5),this.bobailService=new b}findBestMove(t,i){const e=performance.now(),o=this.minMax.findBestMove(t,i),n=performance.now();return console.log(`Execution time: ${n-e} ms`),o}evaluateState(t,i){const e=this.bobailService.getBobailPosition(t);if(!e)throw new Error("Bobail is missing from the grid");let o=0;o+=[-1e3,-70,0,70,1e3][e.y];const n=this.bobailService.getPlayerPositions(t,i),r=this.bobailService.getPlayerPositions(t,i===1?2:1),s=[[2,3,0,-3,-2],[2,4,0,-4,-2],[2,4,0,-4,-2],[2,4,0,-4,-2],[2,3,0,-3,-2]];for(const c of n)o+=s[c.x][c.y]*2;for(const c of r)o+=s[c.x][c.y]*2;const a=n.reduce((c,h)=>c+this.bobailService.getLinearMoves(t,h).length,0),l=r.reduce((c,h)=>c+this.bobailService.getLinearMoves(t,h).length,0);o+=(i===1?1:-1)*(a-l)/4;const f=[{dx:-1,dy:1},{dx:0,dy:1},{dx:1,dy:1},{dx:-1,dy:-1},{dx:0,dy:-1},{dx:1,dy:-1}];for(const{dx:c,dy:h}of f){const g=e.x+c,v=e.y+h;this.bobailService.isWithinBounds({x:g,y:v})&&t[g][v]!==0&&(o+=h===1?-20:20)}return o}generateChildren(t,i){const e=[],o=this.bobailService.getBobailPosition(t);if(!o)throw new Error("Bobail is missing from the grid");let n=this.bobailService.getAdjacentPositions(o).filter(r=>this.bobailService.getPieceAt(t,r)===0);for(const r of n){const s=t.map(l=>[...l]);s[o.x][o.y]=0,s[r.x][r.y]=3;const a=this.bobailService.getPlayerPositions(s,i);for(const l of a){const f=this.bobailService.getLinearMoves(s,l);for(const c of f){const h=s.map(g=>[...g]);h[l.x][l.y]=0,h[c.x][c.y]=i,e.push(h)}}}return e.sort((r,s)=>this.sortChildren(r,s,i))}sortChildren(t,i,e){const o=this.bobailService.getBobailPosition(t),n=this.bobailService.getBobailPosition(i);if(!o||!n)return 0;if(o.y>n.y)return e===1?1:-1;const r=this.bobailService.getPlayerPositions(t,e),s=this.bobailService.getPlayerPositions(i,e),a=r.reduce((f,c)=>f+c.y,0),l=s.reduce((f,c)=>f+c.y,0);return(a<l?1:-1)*(e===1?1:-1)}isGameOver(t){return this.bobailService.isGameOver(t)}getHash(t,i){return`${i}-${JSON.stringify(t)}`}}onmessage=d=>{const{grid:t,player:i}=d.data,o=new x().findBestMove(t,i);postMessage({nextState:o})}})();
