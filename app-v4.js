(function(){
const $=id=>document.getElementById(id);
const phases=['REORDER & INDENT','GUIDED LOOP MECHANICS','ADVANCED DROPDOWNS','INDEPENDENT CODING','FINAL CHALLENGES'];
const patternNames=['Rectangle','Growing triangle','Shrinking triangle','Counting staircase','Odd-width staircase','Growing @ pattern','Descending number ladder','Checkerboard','Plus-sign triangle','Centered pyramid','Diamond','Hollow rectangle','Number pyramid'];
const base=[
 {rule:'fixed',rows:3,cols:5,glyph:'*'},
 {rule:'grow',rows:5,glyph:'*'},
 {rule:'shrink',rows:5,glyph:'#'},
 {rule:'grow',rows:4,glyph:'col'},
 {rule:'odd',rows:5,glyph:'*'},
 {rule:'grow',rows:4,glyph:'@'},
 {rule:'shrink',rows:5,glyph:'col'},
 {rule:'checker',rows:4,cols:6},
 {rule:'grow',rows:5,glyph:'+'},
 {rule:'pyramid',rows:5,glyph:'*'},
 {rule:'diamond',rows:5,glyph:'*'},
 {rule:'hollow',rows:5,cols:8,glyph:'*'},
 {rule:'numberpyramid',rows:5}
];
const variation=[
 {rows:4,cols:7},{rows:7},{rows:6},{rows:6},{rows:6},
 {rows:6},{rows:6},{rows:5,cols:7},{rows:7},{rows:6},{rows:6}
];
const hints={
 fixed:['A rectangle has the same width on every line.','The outer loop chooses rows. The inner loop chooses columns.','Use a fixed bound for each loop.'],
 grow:['Each successive line contains one more character.','Make the inner bound depend on row.','Starting at 1, the inner condition can be col <= row.'],
 shrink:['Each successive line contains one fewer character.','Subtract row from one more than the total number of rows.','Try col <= (total rows + 1) - row.'],
 odd:['The row widths are 1, 3, 5, 7, ...','The number of characters is twice row, minus one.','Try col <= 2 * row - 1.'],
 checker:['The symbols alternate in both directions.','Use the sum of row and col to choose the character.','Test (row + col) % 2 == 0 with if/else.'],
 pyramid:['Each row contains spaces first, then stars.','The number of spaces decreases while star width grows by two.','Use spaces <= rows - row and stars <= 2 * row - 1.'],
 diamond:['The top and bottom halves are centered triangles.','Count rows upward to the middle, then downward without duplicating the middle row.','Use 1..rows and then rows-1..1, with spaces = rows-row and stars = 2*row-1.'],
 hollow:['Only the border should be printed.','The first/last rows and first/last columns print stars.','Use if (row == 1 || row == rows || col == 1 || col == width).'],
 numberpyramid:['Like a centered pyramid, but print a digit instead of a star.','The printed number stays the same across a row.','Print row in the inner loop, with width 2*row-1.']
};
function output(p){
 const lines=[],N=p.rows;
 function make(r){
  if(p.rule==='checker'){let s='';for(let c=1;c<=p.cols;c++)s+=(r+c)%2===0?'#':'.';return s}
  if(p.rule==='hollow'){let s='';for(let c=1;c<=p.cols;c++)s+=(r===1||r===N||c===1||c===p.cols)?p.glyph:' ';return s}
  let n=p.rule==='fixed'?p.cols:p.rule==='grow'?r:p.rule==='shrink'?N+1-r:2*r-1;
  let s=['pyramid','diamond','numberpyramid'].includes(p.rule)?' '.repeat(N-r):'';
  for(let c=1;c<=n;c++)s+=p.rule==='numberpyramid'?r:p.glyph==='row'?r:p.glyph==='col'?c:p.glyph;return s;
 }
 for(let r=1;r<=N;r++)lines.push(make(r));
 if(p.rule==='diamond')for(let r=N-1;r>=1;r--)lines.push(make(r));
 return lines.join('\n');
}
const tasks=[];
function add(phase,mode,pattern,over={},title){tasks.push({phase,mode,pattern,config:{...base[pattern],...over},title:title||patternNames[pattern]})}
add(0,'order',0,{rows:2,cols:4},'Reorder: rectangle');
add(0,'order',1,{rows:4,glyph:'+'},'Reorder: growing triangle');
add(0,'order',9,{rows:3},'Reorder: two inner loops');
for(const id of [0,1,2,3,4])add(1,id===3?'partial':'select',id);
for(const id of [5,6,7,8,9,10])add(2,'advanced',id);
for(let id=0;id<11;id++)add(3,'free',id,variation[id],patternNames[id]+' — independent');
add(4,'free',11,{},'Final: hollow rectangle');
add(4,'free',12,{},'Final: number pyramid');
if(tasks.length!==27)throw Error('Expected 27 challenges');
const key='nested-loop-challenge-v4',saved=(()=>{try{return JSON.parse(localStorage.getItem(key))||{}}catch{return {}}})();
function newSeed(){if(typeof crypto!=='undefined'&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]||1}return (Math.random()*4294967295)>>>0||1}
const state={index:Number.isInteger(saved.index)&&saved.index>=0&&saved.index<27?saved.index:0,points:saved.points||0,awarded:Array.isArray(saved.awarded)?saved.awarded:[],tutorial:!saved.started,started:!!saved.started,attempt:0,hints:0,solved:false,order:[],indents:[],drafts:saved.drafts||{},records:saved.records||{},first:saved.first||'',lastInitial:saved.lastInitial||'',sandboxMode:'basic',seed:Number.isInteger(saved.seed)?saved.seed:(Object.keys(saved).length?0:newSeed())};
const originalConfigs=tasks.map(t=>({...t.config}));
function variantPick(index,salt,min,max){let x=(state.seed^(index+1)*2654435761^salt*2246822519)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return min+(x>>>0)%(max-min+1)}
function applyVariants(){
 tasks.forEach((t,i)=>t.config={...originalConfigs[i]});
 if(!state.seed)return; // Preserve existing students' earlier fixed-size progress.
 tasks.forEach((t,i)=>{
  const p=t.config;
  if(t.phase===3){
   const guide=tasks[t.pattern<5?3+t.pattern:8+t.pattern-5].config;
   p.rows=Math.min(8,guide.rows+variantPick(i,1,1,2));
   if(p.cols)p.cols=guide.cols+variantPick(i,2,1,2);
  }else if(t.phase===4){
   p.rows=variantPick(i,1,4,6);
   if(p.cols)p.cols=variantPick(i,2,7,9);
  }else{
   const range=t.phase===0?(t.pattern===0?[2,4]:t.pattern===9?[3,4]:[3,5]):t.phase===1?[3,6]:[4,6];
   p.rows=variantPick(i,1,range[0],range[1]);
   if(p.cols)p.cols=variantPick(i,2,t.phase===0?3:4,t.phase===0?5:6);
   if(t.mode==='select'&&p.rule==='fixed')p.cols=variantPick(i,2,3,5);
  }
 });
}
applyVariants();
if(state.awarded.length&&!Object.keys(state.records).length){const each=Math.floor(state.points/state.awarded.length),remainder=state.points-each*state.awarded.length;state.awarded.forEach((id,i)=>state.records[id]={points:each+(i===0?remainder:0),attempts:1,hints:0,source:'(Completed in an earlier prototype version)'});}
const escape=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function snapshot(){return {version:6,index:state.index,points:state.points,awarded:[...state.awarded],started:state.started,drafts:state.drafts,records:state.records,first:state.first,lastInitial:state.lastInitial,seed:state.seed}}
function save(){localStorage.setItem(key,JSON.stringify(snapshot()))}
function select(options,value,label){return '<select aria-label="'+escape(label||'Choose Java expression')+'">'+options.map(x=>'<option'+(x===value?' selected':'')+'>'+escape(x)+'</option>').join('')+'</select>'}
function numbered(s){return String(s).padStart(2,'0')}
const start=['0','1','2','3'],outer=['row <= 2','row <= 3','row <= 4','row <= 5','row <= 6','row <= 7','row < 5','row < 6'],inner=['col <= 3','col <= 4','col <= 5','col <= 7','col <= row','col < row','col <= 6 - row','col <= 5 - row','col <= 2 * row - 1','col < 2 * row'],updateRow=['row++','row += 2','row--'],updateCol=['col++','col += 2','col--'];
function selectEditor(){
 const p=tasks[state.index].config;
 const outerChoices=[...new Set([...outer,`row <= ${p.rows}`,`row < ${p.rows+1}`])];
 const innerChoices=[...new Set([...inner,`col <= ${p.rows+1} - row`,...(p.cols?[`col <= ${p.cols}`]:[])])];
 $('editor').innerHTML='<div class="code"><div class="line">for (int row = '+select(start,'0','Outer start')+'; '+select(outerChoices,'row <= 4','Outer condition')+'; '+select(updateRow,'row++','Outer update')+') {</div><div class="line">    for (int col = '+select(start,'0','Inner start')+'; '+select(innerChoices,'col <= 4','Inner condition')+'; '+select(updateCol,'col++','Inner update')+') {</div><div class="line">        System.out.print('+select(['"*"','"#"','"+"','row','col'],'"*"','Printed expression')+');</div><div class="line">    }</div><div class="line">    System.out.println();</div><div class="line">}</div></div>';
 const sels=[...$('editor').querySelectorAll('select')];
 function sync(){directionOptions(sels[0],sels[1],sels[2],'row',outerChoices);directionOptions(sels[3],sels[4],sels[5],'col',innerChoices)}
 sels.forEach((s,i)=>s.addEventListener('change',()=>{if(i===2||i===5)sync();rememberDraft()}));
 const draft=state.drafts[state.index];
 if(draft?.selections){[2,5].forEach(i=>{if(draft.selections[i])sels[i].value=draft.selections[i]});sync();sels.forEach((s,i)=>{if(draft.selections[i]&&[...s.options].some(o=>o.value===draft.selections[i]))s.value=draft.selections[i]})}
}
function directionOptions(startSelect,conditionSelect,updateSelect,variable,upChoices){
 const down=updateSelect.value.includes('--'),startValues=down?['3','4','5','6','7','8','9']:start;
 const condValues=down?(variable==='row'?['row >= 1','row > 0','row >= 2','row > 1','row >= 3','row >= 4','row >= 5']:['col >= 1','col > 0','col >= row','col > row','col >= 2','col >= 3','col >= 4']):upChoices;
 for(const [sel,values] of [[startSelect,startValues],[conditionSelect,condValues]]){
  const old=sel.value;sel.innerHTML=values.map(x=>'<option>'+escape(x)+'</option>').join('');sel.value=values.includes(old)?old:(down?(sel===startSelect?'5':variable+' >= 1'):(sel===startSelect?'1':variable==='row'?'row <= 4':'col <= row'));
 }
}
function sourceFromSelect(){const a=[...$('editor').querySelectorAll('select')].map(s=>s.value);return 'for (int row = '+a[0]+'; '+a[1]+'; '+a[2]+') {\n    for (int col = '+a[3]+'; '+a[4]+'; '+a[5]+') {\n        System.out.print('+a[6]+');\n    }\n    System.out.println();\n}'}
function scaffold(t){
 if(t.mode==='partial')return 'for (int row = 1; row <= '+t.config.rows+'; row++) {\n    // Write the inner loop and print statement.\n\n    System.out.println();\n}';
 return '// Recreate the target pattern using Java nested loops.\n\n';
}
function codeEditor(t){
 $('editor').innerHTML='<div class="editor-tools"><span class="small">JAVA CODE EDITOR</span><div><button id="snippetFor" type="button">+ for loop</button> <button id="snippetPrint" type="button">+ print</button> <button id="syntax" type="button">Syntax help</button></div></div><textarea id="source" aria-label="Java code editor" spellcheck="false" autocorrect="off" autocomplete="off" autocapitalize="off"></textarea><div class="muted" style="font-size:12px;margin-top:8px">Supported: braced for loops, arithmetic, ++/--/+=/-=, if/else, print, println. Code runs in a limited Java-subset interpreter.</div><div id="syntaxPanel" class="feedback hidden"><pre>for (int row = 1; row <= 5; row++) {\n    System.out.println(row);\n}\n\nif (row % 2 == 0) {\n    System.out.print("*");\n} else {\n    System.out.print(" ");\n}</pre></div>';
 const area=$('source');area.value=scaffold(t);blockEditorClipboard(area);
 const clipboardNotice=document.createElement('div');clipboardNotice.className='clipboard-notice';clipboardNotice.hidden=true;area.after(clipboardNotice);
 if(state.drafts[state.index]?.source!==undefined)area.value=state.drafts[state.index].source;
 const insert=s=>{let a=area.selectionStart,b=area.selectionEnd;area.value=area.value.slice(0,a)+s+area.value.slice(b);area.selectionStart=area.selectionEnd=a+s.length;area.focus();rememberDraft()};
 $('snippetFor').onclick=()=>insert('for (int col = 1; col <= row; col++) {\n    System.out.print("*");\n}\n');
 $('snippetPrint').onclick=()=>insert('System.out.println();');$('syntax').onclick=()=>$('syntaxPanel').classList.toggle('hidden');
 area.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();insert('    ')}if(e.key==='Enter'){e.preventDefault();const line=area.value.slice(0,area.selectionStart).split('\n').pop(),indent=(line.match(/^\s*/)||[''])[0]+(line.trimEnd().endsWith('{')?'    ':'');insert('\n'+indent)}});
 area.addEventListener('input',rememberDraft);
}
function blockEditorClipboard(element){
 const warn=()=>{const notice=element.parentElement.querySelector('.clipboard-notice');if(notice){notice.textContent='Copy, cut, and paste are disabled here. Please type your Java code.';notice.hidden=false}};
 for(const name of ['copy','cut','paste','drop'])element.addEventListener(name,e=>{e.preventDefault();warn()});
 element.addEventListener('beforeinput',e=>{if(['insertFromPaste','insertFromPasteAsQuotation','insertFromDrop'].includes(e.inputType)){e.preventDefault();warn()}});
 element.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['c','x','v'].includes(e.key.toLowerCase())){e.preventDefault();warn()}});
 element.addEventListener('contextmenu',e=>e.preventDefault());
}
const L=(text,indent=0)=>({text,indent});
const S=(choices,selected,indent=0)=>({choices,selected,indent});
function advancedLines(t){
 const p=t.config,id=t.pattern;
 const o=S([`for (int row = 1; row <= ${p.rows}; row++) {`,`for (int row = 0; row < ${p.rows}; row++) {`,`for (int row = 1; row < ${p.rows}; row++) {`],`for (int row = 0; row < ${p.rows}; row++) {`);
 let a=[o];const end=()=>a.push(L('    }',1),L('    System.out.println();',1),L('}',0));
 if([5,6,8].includes(id)){
  let correct=id===6?`for (int col = 1; col <= ${p.rows+1} - row; col++) {`:'for (int col = 1; col <= row; col++) {';
  a.push(S(['for (int col = 1; col <= 5; col++) {',correct,'for (int col = 1; col < row; col++) {'], 'for (int col = 1; col <= 5; col++) {',1));
  let printed=id===6?'col':id===8?'"+"':'"@"';
  a.push(S(['        System.out.print("*");','        System.out.print(col);','        System.out.print("+");','        System.out.print("@");'],'        System.out.print("*");',2));
  end();return a;
 }
 if(id===7){
  a.push(S([`for (int col = 1; col <= ${p.cols}; col++) {`,'for (int col = 1; col <= row; col++) {','for (int col = 0; col < 4; col++) {'],'for (int col = 1; col <= row; col++) {',1));
  a.push(S(['        if (row % 2 == 0) {','        if (col % 2 == 0) {','        if ((row + col) % 2 == 0) {'],'        if (row % 2 == 0) {',2));
  a.push(S(['            System.out.print("#");','            System.out.print(".");'],'            System.out.print(".");',3));
  a.push(L('        } else {',2));
  a.push(S(['            System.out.print("#");','            System.out.print(".");'],'            System.out.print("#");',3));
  a.push(L('        }',2));end();return a;
 }
 // Pyramids and diamonds deliberately display full, multiline, braced Java.
 function half(bottom){
  const top=bottom?[
   `for (int row = ${p.rows-1}; row >= 1; row--) {`,
   `for (int row = ${p.rows}; row >= 1; row--) {`,
   `for (int row = 1; row <= ${p.rows}; row++) {`]:[
   `for (int row = 1; row <= ${p.rows}; row++) {`,
   `for (int row = 0; row < ${p.rows}; row++) {`,
   `for (int row = 1; row < ${p.rows}; row++) {`];
  const b=[];
  b.push(S(top,bottom?top[1]:top[1]));
  b.push(S([`    for (int space = 1; space <= ${p.rows} - row; space++) {`,'    for (int space = 1; space <= row; space++) {','    for (int space = 1; space < row; space++) {'],'    for (int space = 1; space <= row; space++) {',1));
  b.push(S(['        System.out.print(" ");','        System.out.print("*");'],'        System.out.print("*");',2),L('    }',1));
  b.push(S(['    for (int col = 1; col <= row; col++) {','    for (int col = 1; col <= 2 * row - 1; col++) {','    for (int col = 1; col < 2 * row; col++) {'],'    for (int col = 1; col <= row; col++) {',1));
  b.push(S(['        System.out.print("*");','        System.out.print(" ");'],'        System.out.print(" ");',2),L('    }',1),L('    System.out.println();',1),L('}',0));
  return b;
 }
 if(id===9)return half(false);
 if(id===10)return [...half(false),L('// Bottom half'),...half(true)];
 return a;
}
function advancedEditor(t){
 const lines=advancedLines(t);
 $('editor').innerHTML='<div class="code advanced-code">'+lines.map((x,i)=>'<div class="advanced-line" style="padding-left:'+(x.indent*11)+'px">'+(x.choices?select(x.choices,x.selected,'Choose complete Java statement'):'<span>'+escape(x.text)+'</span>')+'</div>').join('')+'</div><p class="muted" style="font-size:12px;margin-top:10px">Each dropdown selects an entire Java statement. The braces and indentation are provided.</p>';
 const draft=state.drafts[state.index];
 $('editor').querySelectorAll('select').forEach((s,i)=>{if(draft?.selections?.[i]&&[...s.options].some(o=>o.value===draft.selections[i]))s.value=draft.selections[i];s.addEventListener('change',rememberDraft)});
}
function advancedSource(t){
 return [...$('editor').querySelectorAll('.advanced-line')].map(el=>{const s=el.querySelector('select');return s?s.value:el.textContent}).join('\n');
}
function orderLines(t){
 const p=t.config;
 if(t.pattern!==9)return [
  L(`for (int row = 1; row <= ${p.rows}; row++) {`,0),
  L(`for (int col = 1; col <= ${t.pattern===0?p.cols:'row'}; col++) {`,1),
  L(`System.out.print("${p.glyph}");`,2),L('}',1),
  L('System.out.println();',1),L('}',0)
 ];
 return [
  L(`for (int row = 1; row <= ${p.rows}; row++) {`,0),
  L(`for (int space = 1; space <= ${p.rows} - row; space++) {`,1),
  L('System.out.print(" ");',2),L('}',1),
  L('for (int col = 1; col <= 2 * row - 1; col++) {',1),
  L('System.out.print("*");',2),L('}',1),
  L('System.out.println();',1),L('}',0)
 ];
}
function orderEditor(t){
 const length=orderLines(t).length;state.order=length===6?[2,0,4,1,5,3]:[2,6,0,4,7,1,8,5,3];
 state.indents=Array(length).fill(0);
 const draft=state.drafts[state.index];
 if(draft?.order?.length===length&&draft?.indents?.length===length){state.order=[...draft.order];state.indents=[...draft.indents]}
 $('editor').innerHTML='<p class="muted" style="font-size:13px">Move each line with the arrows. Click ↳ to choose indentation (0, 1, or 2 levels). Braces are interchangeable.</p><div id="orderRows" class="code" style="line-height:1.2"></div>';
 drawOrder(t);
}
function drawOrder(t){
 const lines=orderLines(t);
 $('orderRows').innerHTML=state.order.map((id,index)=>{
  const line=lines[id];return '<div class="orderline"><button aria-label="Indent line" title="Cycle indentation" data-indent="'+id+'">↳ '+state.indents[id]+'</button><code style="padding-left:'+(state.indents[id]*16)+'px">'+escape(line.text)+'</code><button aria-label="Move line up" data-index="'+index+'" data-direction="-1">↑</button><button aria-label="Move line down" data-index="'+index+'" data-direction="1">↓</button></div>';
 }).join('');
 $('orderRows').querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{const i=+b.dataset.index,j=i+(+b.dataset.direction);if(j<0||j>=state.order.length)return;[state.order[i],state.order[j]]=[state.order[j],state.order[i]];drawOrder(t);rememberDraft()});
 $('orderRows').querySelectorAll('[data-indent]').forEach(b=>b.onclick=()=>{const id=+b.dataset.indent;state.indents[id]=(state.indents[id]+1)%3;drawOrder(t);rememberDraft()});
}
function orderResult(t){
 const actual=state.order.map(id=>orderLines(t)[id]),correct=orderLines(t);
 const equivalent=actual.every((line,i)=>line.text===correct[i].text&&state.indents[state.order[i]]===correct[i].indent);
 return equivalent?output(t.config):'[Order or indentation does not yet match a valid solution]';
}
const tutorial=document.createElement('section');tutorial.id='tutorial';tutorial.className='tutorial-view';document.querySelector('.headline').before(tutorial);
const confirmOverlay=document.createElement('div');confirmOverlay.id='confirmOverlay';confirmOverlay.className='confirmation hidden';
confirmOverlay.innerHTML='<div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="confirmTitle"><h2 id="confirmTitle"></h2><p id="confirmMessage"></p><div class="actions" style="justify-content:flex-end"><button id="confirmCancel">Cancel</button><button id="confirmYes" class="danger">Confirm</button></div></div>';
document.body.append(confirmOverlay);
function askConfirm(title,message,action,yes='Confirm'){
 $('confirmTitle').textContent=title;$('confirmMessage').textContent=message;$('confirmYes').textContent=yes;
 confirmOverlay.classList.remove('hidden');
 const close=()=>{confirmOverlay.classList.add('hidden');$('confirmYes').onclick=null};
 $('confirmCancel').onclick=close;$('confirmYes').onclick=()=>{close();action()};
 $('confirmCancel').focus();
}
function tutorialPage(){
 tutorial.innerHTML='<div class="small">LEARN · EXPERIMENT · DISCOVER</div><h2>Nested loops, one step at a time.</h2><p class="muted" style="max-width:820px">A nested loop is a loop inside another loop. The <strong>outer loop</strong> determines how many rows are printed. For every single outer-loop iteration, the <strong>inner loop</strong> runs from its beginning, creating the characters on that row. A println() after the inner loop moves to the next line.</p><div class="tutorial-grid"><div class="card"><div class="bar"><h3>Experiment sandbox</h3><span class="badge">No points · No penalties</span></div><p class="muted">Try the presets, then change any of the seven dropdowns. Every change runs the loops immediately.</p><div class="actions" id="presets"><button data-preset="rectangle">Rectangle</button><button data-preset="triangle">Growing triangle</button><button data-preset="numbers">Numbers</button><button data-preset="odd">Odd widths</button></div><div class="code sandbox-code"><div class="line">for (int row = <span id="sandboxOuterStart"></span>; <span id="sandboxOuterCond"></span>; <span id="sandboxOuterUp"></span>) {</div><div class="line">    for (int col = <span id="sandboxInnerStart"></span>; <span id="sandboxInnerCond"></span>; <span id="sandboxInnerUp"></span>) {</div><div class="line">        System.out.print(<span id="sandboxPrint"></span>);</div><div class="line">    }</div><div class="line">    System.out.println();</div><div class="line">}</div></div><div class="card"><div class="bar"><h3>See what happens</h3><span class="badge">Live output</span></div><div class="caption">OUTPUT</div><div class="screen" id="sandboxOutput"></div><div class="feedback" id="sandboxExplanation">Change the outer bound to change the number of rows, or the inner bound to change each row’s width.</div><div class="tutorial-notes"><p><strong>Try these experiments:</strong></p><ol><li>Change <code>row <= 3</code> to <code>row <= 5</code>.</li><li>Change <code>col <= 5</code> to <code>col <= row</code>.</li><li>Try printing <code>row</code> or <code>col</code> instead of a star.</li><li>Try an increment of <code>+= 2</code>. What disappears?</li></ol></div></div></div><div class="actions" style="justify-content:flex-end;margin-top:22px"><button class="primary" id="begin">Start the 27 challenges →</button></div>';
 const items=[
  ['sandboxOuterStart',start,'1'],['sandboxOuterCond',outer,'row <= 3'],['sandboxOuterUp',updateRow,'row++'],
  ['sandboxInnerStart',start,'1'],['sandboxInnerCond',inner,'col <= 5'],['sandboxInnerUp',updateCol,'col++'],
  ['sandboxPrint',['"*"','"#"','"+"','row','col'],'"*"']
 ];items.forEach(([id,options,selected])=>$(id).innerHTML=select(options,selected,id));
 $('tutorial').querySelectorAll('select').forEach((x,i)=>x.onchange=()=>{if(i===2||i===5)syncSandboxDirections();runSandbox()});
 $('presets').querySelectorAll('button').forEach(b=>b.onclick=()=>setPreset(b.dataset.preset));
 $('begin').textContent=state.started?'← Back to challenges':'Start the 27 challenges →';
 $('begin').onclick=()=>{state.tutorial=false;state.started=true;save();render()};
 const tabs=document.createElement('div');tabs.className='sandbox-tabs';tabs.innerHTML='<button data-mode="basic">Basic loops</button><button data-mode="spaces">Two inner loops + spaces</button><button data-mode="conditionals">Conditionals</button><button data-mode="typed">Type Java</button>';
 tutorial.querySelector('.tutorial-grid').before(tabs);
 const extras=document.createElement('div');extras.id='sandboxExtras';tutorial.querySelector('.tutorial-grid').after(extras);
 const debuggerPanel=document.createElement('div');debuggerPanel.id='sandboxDebugger';debuggerPanel.className='integrated-tracer';
 debuggerPanel.innerHTML='<div class="caption">STEP THROUGH EXECUTION <span id="stepCount" aria-live="polite"></span></div><div class="step-actions"><button id="stepReset">↺ Restart</button><button id="stepBack">← Back</button><button class="primary" id="stepNext">Next step →</button><button id="stepEnd">Run to end</button></div><div class="caption">LOOP VARIABLES</div><div id="stepVariables" class="step-variables"></div><div id="stepAction" class="feedback" aria-live="polite"></div>';
 const sourcePanel=document.createElement('div');sourcePanel.id='stepSourceContainer';sourcePanel.className='inline-step-source hidden';sourcePanel.innerHTML='<div class="caption">EXECUTING JAVA · CURRENT LINE</div><pre id="stepSource" class="step-source"></pre>';
 tutorial.append(debuggerPanel,sourcePanel);
 $('stepReset').onclick=()=>{traceIndex=-1;drawTrace()};$('stepBack').onclick=()=>{traceIndex=Math.max(-1,traceIndex-1);drawTrace()};
 $('stepNext').onclick=()=>{traceIndex=Math.min(traceSteps.length-1,traceIndex+1);drawTrace()};$('stepEnd').onclick=()=>{traceIndex=traceSteps.length-1;drawTrace()};
 // Keep the return button outside the basic-only grid so all sandbox modes can exit.
 tutorial.append($('begin').parentElement);
 tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>showSandboxMode(b.dataset.mode));
 showSandboxMode(state.sandboxMode);
}
function syncSandboxDirections(){
 const get=id=>$(id).querySelector('select');
 directionOptions(get('sandboxOuterStart'),get('sandboxOuterCond'),get('sandboxOuterUp'),'row',outer);
 directionOptions(get('sandboxInnerStart'),get('sandboxInnerCond'),get('sandboxInnerUp'),'col',inner);
}
function sandboxSource(){const ids=['sandboxOuterStart','sandboxOuterCond','sandboxOuterUp','sandboxInnerStart','sandboxInnerCond','sandboxInnerUp','sandboxPrint'];const a=ids.map(id=>$(id).querySelector('select').value);return 'for (int row = '+a[0]+'; '+a[1]+'; '+a[2]+') {\n    for (int col = '+a[3]+'; '+a[4]+'; '+a[5]+') {\n        System.out.print('+a[6]+');\n    }\n    System.out.println();\n}'}
function runSandbox(){
 try{$('sandboxOutput').textContent=LoopEngine.execute(sandboxSource())||'(nothing printed)';$('sandboxExplanation').textContent='The outer loop repeats each row. The inner loop runs from the beginning for every row. Experiment freely!'}
 catch(e){$('sandboxOutput').textContent='[Loop stopped]';$('sandboxExplanation').textContent=e.message+' Try a different condition or increment.'}
 if(state.sandboxMode==='basic')resetTrace(sandboxSource());
}
function setPreset(which){
 const a=which==='triangle'?['1','row <= 5','row++','1','col <= row','col++','"*"']:which==='numbers'?['1','row <= 5','row++','1','col <= row','col++','col']:which==='odd'?['1','row <= 5','row++','1','col <= 2 * row - 1','col++','"#"']:['1','row <= 3','row++','1','col <= 5','col++','"*"'];
 ['sandboxOuterStart','sandboxOuterCond','sandboxOuterUp','sandboxInnerStart','sandboxInnerCond','sandboxInnerUp','sandboxPrint'].forEach((id,i)=>$(id).querySelector('select').value=a[i]);syncSandboxDirections();runSandbox();
}
function showSandboxMode(mode){
 state.sandboxMode=mode;
 tutorial.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
 tutorial.querySelector('.tutorial-grid').classList.toggle('hidden',mode!=='basic');
 const panel=$('sandboxExtras');panel.innerHTML='';if(mode==='basic'){runSandbox();return}
 if(mode==='typed'){
  panel.innerHTML='<div class="card"><div class="bar"><h3>Write and experiment with Java</h3><span class="badge">No penalties</span></div><p class="muted">Edit the code freely. Use Run to see its output. These are learning examples, not solutions to the final challenges.</p><div class="actions"><button data-code="triangle">Triangle</button><button data-code="aligned">Right-aligned triangle</button><button data-code="checker">Checkerboard</button><button data-code="blank">Blank editor</button></div><textarea id="sandboxCode" spellcheck="false" aria-label="Sandbox Java source"></textarea><div class="clipboard-notice" hidden></div><div class="actions"><button class="primary" id="sandboxRun">▶ Run code</button><label class="space-toggle"><input id="spacesVisible" type="checkbox"> Show spaces as ·</label></div><div class="caption">OUTPUT</div><div class="screen" id="sandboxExtraOutput"></div><div id="sandboxExtraError" class="muted"></div></div>';
  panel.querySelectorAll('[data-code]').forEach(b=>b.onclick=()=>{ $('sandboxCode').value=exampleCode(b.dataset.code);runExtra()});
  blockEditorClipboard($('sandboxCode'));$('sandboxRun').onclick=runExtra;$('spacesVisible').onchange=runExtra;$('sandboxCode').addEventListener('input',()=>resetTrace($('sandboxCode').value));$('sandboxCode').value=exampleCode('aligned');runExtra();return;
 }
 const spaces=mode==='spaces';
 panel.innerHTML='<div class="tutorial-grid"><div class="card"><div class="bar"><h3>'+(spaces?'Two inner loops':'If/else inside nested loops')+'</h3><span class="badge">Guided experiment</span></div><p class="muted">'+(spaces?'The first inner loop prints leading spaces. The second prints characters.':'Try different conditions to decide which character appears at each position.')+'</p><div id="extraControls"></div><div class="caption">GENERATED JAVA</div><pre id="sandboxExtraCode" class="code"></pre></div><div class="card"><div class="bar"><h3>Live output</h3><span class="badge">No penalties</span></div><label class="space-toggle"><input id="spacesVisible" type="checkbox"> Show spaces as ·</label><div class="screen" id="sandboxExtraOutput"></div><div id="sandboxExtraError" class="feedback"></div></div></div>';
 const controls=spaces?[
  ['Rows',['3','4','5'],'5'],['Space loop bound',['space <= 5 - row','space <= row','space < row'],'space <= 5 - row'],['Character loop bound',['col <= 2 * row - 1','col <= row','col <= 5'],'col <= row'],['Print',['"*"','"#"','row'],'"*"']
 ]:[
  ['Rows',['3','4','5'],'4'],['Columns',['4','5','6'],'6'],['If condition',['(row + col) % 2 == 0','row % 2 == 0','col % 2 == 0','row == col'],'(row + col) % 2 == 0'],['If true',['"#"','"*"','"."'],'"#"'],['Otherwise',['"."','" "','"#"'],'"."']
 ];
 $('extraControls').innerHTML=controls.map(([label,opts,value])=>'<label class="sandbox-choice">'+escape(label)+select(opts,value,label)+'</label>').join('');
 panel.querySelectorAll('select').forEach(s=>s.onchange=runExtra);$('spacesVisible').onchange=runExtra;runExtra();
}
function exampleCode(kind){
 if(kind==='blank')return '// Try creating a pattern using nested loops.\n\n';
 if(kind==='checker')return 'for (int row = 1; row <= 4; row++) {\n    for (int col = 1; col <= 6; col++) {\n        if ((row + col) % 2 == 0) {\n            System.out.print("#");\n        } else {\n            System.out.print(".");\n        }\n    }\n    System.out.println();\n}';
 if(kind==='aligned')return 'for (int row = 1; row <= 5; row++) {\n    for (int space = 1; space <= 5 - row; space++) {\n        System.out.print(" ");\n    }\n    for (int col = 1; col <= row; col++) {\n        System.out.print("*");\n    }\n    System.out.println();\n}';
 return 'for (int row = 1; row <= 5; row++) {\n    for (int col = 1; col <= row; col++) {\n        System.out.print("*");\n    }\n    System.out.println();\n}';
}
function runExtra(){
 let source='';
 if(state.sandboxMode==='typed')source=$('sandboxCode').value;
 else{
  const a=[...$('extraControls').querySelectorAll('select')].map(s=>s.value);
  source=state.sandboxMode==='spaces'?'for (int row = 1; row <= '+a[0]+'; row++) {\n    for (int space = 1; '+a[1]+'; space++) {\n        System.out.print(" ");\n    }\n    for (int col = 1; '+a[2]+'; col++) {\n        System.out.print('+a[3]+');\n    }\n    System.out.println();\n}':
  'for (int row = 1; row <= '+a[0]+'; row++) {\n    for (int col = 1; col <= '+a[1]+'; col++) {\n        if ('+a[2]+') {\n            System.out.print('+a[3]+');\n        } else {\n            System.out.print('+a[4]+');\n        }\n    }\n    System.out.println();\n}';
  $('sandboxExtraCode').textContent=source;
 }
 try{const out=LoopEngine.execute(source);$('sandboxExtraOutput').textContent=$('spacesVisible').checked?out.replace(/ /g,'·'):out;$('sandboxExtraError').textContent='Experiment freely. There are no attempts or penalties here.'}
 catch(e){$('sandboxExtraOutput').textContent='[Code error]';$('sandboxExtraError').textContent=e.message}
 resetTrace(source);
}
let traceSteps=[],traceIndex=-1,traceSource='',traceError='';
function resetTrace(source){
 traceSource=source;traceIndex=-1;traceSteps=[];traceError='';
 try{traceSteps=LoopEngine.trace(source).steps}catch(e){traceError=e.message}
 drawTrace();
}
function dockTrace(){
 const basic=state.sandboxMode==='basic';
 const grid=basic?tutorial.querySelector('.tutorial-grid'):state.sandboxMode==='typed'?null:$('sandboxExtras')?.querySelector('.tutorial-grid');
 const left=basic?grid?.children[0]:state.sandboxMode==='typed'?$('sandboxExtras')?.querySelector('.card'):grid?.children[0];
 const right=basic?grid?.children[1]:state.sandboxMode==='typed'?left:grid?.children[1];
 if(!left||!right)return;
 const source=$('stepSourceContainer'),controls=$('sandboxDebugger');
 left.append(source);
 const live=basic?$('sandboxOutput'):$('sandboxExtraOutput');
 // Keep the debugger directly above the live output, not below the full sandbox.
 if(live)live.before(controls);
 if(live && !live.dataset.traceCaption){live.dataset.traceCaption='true';live.before(Object.assign(document.createElement('div'),{className:'caption trace-output-label',textContent:'OUTPUT · FULL RESULT UNTIL STEPPING'}))}
}
function drawTrace(){
 if(!$('stepSource'))return;
 dockTrace();
 const current=traceIndex>=0?traceSteps[traceIndex]:null;
 $('stepSourceContainer').classList.toggle('hidden',traceIndex<0);
 $('stepSource').innerHTML=traceSource.split('\n').map((line,i)=>'<div class="step-line'+(current?.line===i+1?' active':'')+'"><span class="step-number">'+(i+1)+'</span>'+escape(line||' ')+'</div>').join('');
 const vars=current?.variables||{};
 $('stepVariables').innerHTML=Object.keys(vars).length?Object.entries(vars).map(([key,value])=>'<span class="step-variable"><strong>'+escape(key)+'</strong> = '+escape(value)+'</span>').join(''):'<span class="muted">No loop variables initialized yet.</span>';
 const showSpaces=$('spacesVisible')?.checked;
 const output=state.sandboxMode==='basic'?$('sandboxOutput'):$('sandboxExtraOutput');
 if(output && traceIndex>=0)output.textContent=showSpaces?current.output.replace(/ /g,'·'):current.output;
 const caption=output?.previousElementSibling;
 if(caption?.classList.contains('trace-output-label'))caption.textContent=traceIndex>=0?'OUTPUT · THROUGH CURRENT STEP':'OUTPUT · FULL RESULT';
 $('stepAction').textContent=traceError?'Cannot trace: '+traceError:current?current.action:traceSteps.length?'Ready. Click Next step to begin.':'No executable statements yet.';
 $('stepCount').textContent=(traceIndex+1)+' / '+traceSteps.length+' steps';
 $('stepBack').disabled=traceIndex<0;$('stepReset').disabled=traceIndex<0;$('stepNext').disabled=!!traceError||traceIndex>=traceSteps.length-1;$('stepEnd').disabled=!!traceError||traceIndex>=traceSteps.length-1;
}
function gameView(showTutorial){
 document.body.classList.toggle('tutorial-mode',showTutorial);
 if(showTutorial)tutorialPage();
}
function render(){
 refreshTeacherPreview();
 if(state.tutorial){gameView(true);return}gameView(false);
 const t=tasks[state.index],p=t.config;
 Object.assign(state,{attempt:0,hints:0,solved:false});
 $('title').textContent=t.title;$('level').textContent='PHASE '+(t.phase+1)+' · '+phases[t.phase];
 $('number').textContent=numbered(state.index+1)+' / 27';$('score').textContent=state.points;
 $('progress').style.width=(state.awarded.length/27*100)+'%';
 $('target').textContent=output(p);$('output').textContent='Check your work to see the output.';$('feedback').innerHTML='';
 $('heading').textContent=t.mode==='order'?'Arrange and indent Java':t.mode==='select'?'Complete the nested loops':t.mode==='advanced'?'Select complete Java statements':'Write the Java code';
 $('type').textContent={order:'Code ordering',select:'Loop dropdowns',partial:'Write inner loop',advanced:'Statement dropdowns',free:'Independent coding'}[t.mode];
 $('prompt').textContent=t.mode==='order'?'Reorder the statements and choose the correct indentation. All the code you need is provided.':t.mode==='select'?'Select the start, condition, update, and printed value for each loop.':t.mode==='advanced'?'Choose complete Java statements from each dropdown. The braces and indentation have already been supplied.':t.mode==='partial'?'Write the inner loop and print statement inside the provided outer loop.':'Recreate the target from scratch. No loop structure is provided, but you may use syntax help and hints.';
 $('nodes').innerHTML=tasks.map((_,i)=>state.awarded.includes(i)?'<button class="node done" data-review="'+i+'" title="Reset and revisit completed challenge '+(i+1)+'">✓ '+(i+1)+'</button>':'<span class="node '+(i===state.index?'now':'')+'">'+(i+1)+'</span>').join('');
 $('nodes').querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>visit(+b.dataset.review));
 $('previous').disabled=state.index===0;$('skip').textContent=state.index===26?'Review completion':'Skip / Preview next →';
 $('check').disabled=false;$('hint').disabled=false;$('next').classList.add('hidden');
 $('attempts').textContent='First try: 100 points. Hints and additional attempts reduce the bonus.';
 if(t.mode==='order')orderEditor(t);else if(t.mode==='select')selectEditor();else if(t.mode==='advanced')advancedEditor(t);else codeEditor(t);
}
function studentSource(t){
 if(t.mode==='select')return sourceFromSelect();
 if(t.mode==='advanced')return advancedSource(t);
 if(t.mode==='order')return state.order.map(i=>orderLines(t)[i].text).join('\n');
 return $('source').value;
}
function rememberDraft(){
 if(state.tutorial)return;
 const t=tasks[state.index];
 if(t.mode==='order')state.drafts[state.index]={order:[...state.order],indents:[...state.indents]};
 else if(t.mode==='partial'||t.mode==='free')state.drafts[state.index]={source:$('source').value};
 else state.drafts[state.index]={selections:[...$('editor').querySelectorAll('select')].map(s=>s.value)};
 save();
}
function difference(actual,wanted){
 const a=actual.split('\n'),b=wanted.split('\n');
 if(a.length!==b.length)return 'Your output has '+a.length+' rows; the target has '+b.length+'. Check the outer loop.';
 const first=a.findIndex((x,i)=>x!==b[i]);if(first<0)return '';
 const r=first+1;if(a[first].length!==b[first].length)return 'Row '+r+' contains '+a[first].length+' characters, but the target contains '+b[first].length+'. Check the inner loop.';
 return 'Row '+r+' is the correct width, but its characters differ. Check your print statement or conditional.';
}
function check(){
 if(state.solved)return;const t=tasks[state.index];state.attempt++;
 let actual='',error='',structureError=false;
 try{
  if(t.mode==='order'){
   const correct=orderLines(t),arranged=state.order.map(i=>correct[i]);
   structureError=!arranged.every((line,i)=>line.text===correct[i].text&&state.indents[state.order[i]]===correct[i].indent);
   if(structureError)actual='[Order or indentation incorrect]';
   else actual=LoopEngine.execute(studentSource(t));
  }else actual=LoopEngine.execute(studentSource(t));
 }catch(e){error=e.message;actual='[Code error] '+error}
 $('output').textContent=actual||'(nothing printed)';
 if(!error&&!structureError&&actual===output(t.config)){
  state.solved=true;const fresh=!state.awarded.includes(state.index),earned=fresh?Math.max(40,100-15*(state.attempt-1)-10*state.hints):0;
  if(fresh){state.awarded.push(state.index);state.points+=earned;state.records[state.index]={points:earned,attempts:state.attempt,hints:state.hints,source:studentSource(t),completedAt:new Date().toISOString()}}
  $('score').textContent=state.points;$('progress').style.width=(state.awarded.length/27*100)+'%';
  $('feedback').innerHTML='<div class="feedback good">✓ Correct! Your output matches the target. <strong>'+(fresh?'+'+earned+' points':'Already credited')+'</strong></div>';
  $('check').disabled=true;$('hint').disabled=true;$('next').classList.remove('hidden');save();
 }else{
  const msg=structureError?'Recheck the order, braces, and indentation levels.':error?'The Java-subset interpreter found: '+error:difference(actual,output(t.config));
  $('feedback').innerHTML='<div class="feedback bad"><strong>Not yet.</strong> '+escape(msg)+' You can try again.</div>';
 }
 $('attempts').textContent='Attempts: '+state.attempt+' · Hints: '+state.hints;
}
function hint(){
 const t=tasks[state.index],p=t.config;
 let options=t.mode==='order'?['The outer loop should surround everything that happens once per row.','The inner loop and its print statement must be inside the outer loop.','Indent one level inside the outer loop, and two levels inside an inner loop. Print a newline only after the inner loop closes.']:hints[p.rule]||hints.grow;
 if(p.rule==='shrink')options=[options[0],options[1],'Try col <= '+(p.rows+1)+' - row.'];
 if(p.rule==='diamond')options=[options[0],options[1],'Use rows 1 through '+p.rows+', then '+(p.rows-1)+' down to 1. Print '+p.rows+' - row spaces and 2 * row - 1 stars.'];
 if(p.rule==='hollow')options=[options[0],options[1],'Check row == 1, row == '+p.rows+', col == 1, or col == '+p.cols+'.'];
 state.hints++;$('feedback').innerHTML='<div class="feedback">💡 '+escape(options[Math.min(options.length-1,state.hints-1)])+'</div>';
 $('attempts').textContent='Attempts: '+state.attempt+' · Hints: '+state.hints;
}
function summary(){
 const n=state.awarded.length,report='Nested Loop Challenge\nCompleted: '+n+' / 27\nScore: '+state.points+(n===27?'\nCompletion code: LOOP-'+(state.points*13+2707):'\nPreview only: complete every challenge to earn the completion code.');
 $('summary').textContent=report;$('modal').classList.remove('hidden');
 $('modal').querySelector('h2').textContent=n===27?'Challenge complete!':'Preview summary';
 $('copy').onclick=()=>navigator.clipboard.writeText(report).then(()=>$('copy').textContent='Copied!');
}
function visit(index){
 if(state.awarded.includes(index)){
  const record=state.records[index],earned=record?.points||0;
  askConfirm('Reset completed challenge?','Challenge '+(index+1)+' is already completed. Revisiting it will erase its submitted solution and remove '+earned+' point(s). Other completed challenges will remain intact.',()=>{
   state.awarded=state.awarded.filter(i=>i!==index);
   state.points=Math.max(0,state.points-earned);
   delete state.records[index];delete state.drafts[index];state.index=index;save();render();
  },'Reset and revisit');
 }else{state.index=index;save();render()}
}
function navigate(delta){
 if(delta>0&&state.index===26){summary();return}
 visit(Math.max(0,Math.min(26,state.index+delta)));
}
function reset(){
 askConfirm('Start over?','This will permanently clear all completed challenges, points, saved code, and local progress on this device. Download a save file first if you want a backup.',()=>{
  localStorage.removeItem(key);Object.assign(state,{index:0,points:0,awarded:[],tutorial:true,started:false,attempt:0,hints:0,solved:false,drafts:{},records:{},first:'',lastInitial:'',seed:newSeed()});applyVariants();
  $('modal').classList.add('hidden');render();updateIdentity();
 },'Erase progress');
}
const tutorialButton=document.createElement('button');
tutorialButton.id='tutorialButton';tutorialButton.textContent='Tutorial / Sandbox';
document.querySelector('header').append(tutorialButton);
tutorialButton.onclick=()=>{state.tutorial=true;save();render();window.scrollTo(0,0)};
const identityBar=document.createElement('div');identityBar.className='student-tools';
identityBar.innerHTML='<div class="identity-fields"><label for="studentName">First name and last initial<input id="studentName" autocomplete="off" maxlength="48" placeholder="Example: Jordan P"></label></div><div class="tool-actions"><button id="downloadSave">Save progress</button><button id="loadSave">Load progress</button><input id="loadFile" type="file" accept=".json,application/json" hidden><button id="reportPdf" class="primary">Export PDF report</button></div><div id="exportStatus" class="export-status" aria-live="polite"></div>';
document.querySelector('header').after(identityBar);
function isTeacherPreview(){return $('studentName').value==='ChadPurdy'}
function refreshTeacherPreview(){$('previous').closest('.actions').classList.toggle('hidden',!isTeacherPreview())}
function updateIdentity(){$('studentName').value=[state.first,state.lastInitial].filter(Boolean).join(' ');refreshTeacherPreview()}
updateIdentity();
$('studentName').addEventListener('input',e=>{
 const value=e.target.value.trim();const match=value.match(/^(.+?)\s+([A-Za-z])\.?$/);
 state.first=(match?match[1]:value).slice(0,40);state.lastInitial=match?match[2].toUpperCase():'';save();refreshTeacherPreview();
});
function downloadProgress(){
 rememberDraft();
 const data={app:'Nested Loop Challenge',exportedAt:new Date().toISOString(),...snapshot()};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 offerDownload(blob,'NestedLoops_'+safeName()+'.json','Progress save file');
}
let lastExportUrl=null;
function safeName(){return ((state.first.trim()||'Student')+'_'+(state.lastInitial||'X')).replace(/[^A-Za-z0-9_-]/g,'_')}
function offerDownload(blob,filename,label){
 if(lastExportUrl)URL.revokeObjectURL(lastExportUrl);
 lastExportUrl=URL.createObjectURL(blob);
 const status=$('exportStatus');status.innerHTML='';
 const message=document.createTextNode(label+' ready. If the download does not start, use this link: ');
 const link=document.createElement('a');link.href=lastExportUrl;link.download=filename;link.textContent='Download '+filename;
 status.append(message,link);
 // Keep the link available as a fallback for embedded browsers that block scripted downloads.
 link.click();
}
function validateImport(data){
 if(!data||data.app!=='Nested Loop Challenge'||![5,6].includes(data.version))throw Error('This is not a compatible Nested Loop Challenge save file.');
 if(!Number.isInteger(data.index)||data.index<0||data.index>=27)throw Error('Invalid challenge position.');
 if(!Array.isArray(data.awarded)||data.awarded.length>27||data.awarded.some(i=>!Number.isInteger(i)||i<0||i>=27)||new Set(data.awarded).size!==data.awarded.length)throw Error('Invalid completed-challenge list.');
 if(!Number.isFinite(data.points)||data.points<0||data.points>2700)throw Error('Invalid score.');
 const records={};for(const i of data.awarded){const r=data.records?.[i];if(!r||!Number.isFinite(r.points)||r.points<0||r.points>100)throw Error('Invalid challenge record.');records[i]={points:r.points,attempts:Number(r.attempts)||1,hints:Number(r.hints)||0,source:String(r.source||'').slice(0,20000),completedAt:r.completedAt||''}}
 const total=Object.values(records).reduce((sum,r)=>sum+r.points,0);if(total!==data.points)throw Error('Saved score does not match challenge records.');
 const drafts={};for(const [k,v] of Object.entries(data.drafts||{})){const i=Number(k);if(!Number.isInteger(i)||i<0||i>=27||!v||typeof v!=='object')continue;if(typeof v.source==='string')drafts[i]={source:v.source.slice(0,20000)};else if(Array.isArray(v.selections))drafts[i]={selections:v.selections.slice(0,20).map(String)};else if(Array.isArray(v.order)&&Array.isArray(v.indents))drafts[i]={order:v.order,indents:v.indents}}
 const seed=data.seed===undefined?0:data.seed;
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('Invalid problem-set seed.');
 return {index:data.index,points:data.points,awarded:[...data.awarded],records,drafts,first:String(data.first||'').slice(0,40),lastInitial:String(data.lastInitial||'').replace(/[^a-z]/gi,'').slice(0,1).toUpperCase(),seed};
}
$('downloadSave').onclick=downloadProgress;$('loadSave').onclick=()=>$('loadFile').click();
$('loadFile').onchange=async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 try{if(file.size>4000000)throw Error('The save file is too large.');const parsed=validateImport(JSON.parse(await file.text()));
 askConfirm('Load saved progress?','This will replace the progress currently stored in this browser. Download a backup first if needed.',()=>{
  Object.assign(state,parsed,{started:true,tutorial:false,attempt:0,hints:0,solved:false});applyVariants();save();render();updateIdentity();$('exportStatus').textContent='Progress restored. Your saved problem variations have also been restored.';
 },'Load and replace');
 }catch(error){showNotice('Could not load progress',error.message)}
};
function showNotice(title,message){askConfirm(title,message,()=>{},'OK');$('confirmCancel').classList.add('hidden');const previous=$('confirmYes').onclick;$('confirmYes').onclick=()=>{$('confirmCancel').classList.remove('hidden');previous()}}
const reportPrint=document.createElement('article');reportPrint.id='reportPrint';document.body.append(reportPrint);
function prepareReport(){
 const name=(state.first.trim()+' '+state.lastInitial+'.').trim();
 let html='<h1>Nested Loop Challenge</h1><p class="report-meta"><strong>Student:</strong> '+escape(name)+' <strong>Date:</strong> '+escape(new Date().toLocaleDateString())+'</p>';
 html+='<h2>Progress Summary</h2><p><strong>Completed:</strong> '+state.awarded.length+' / 27 &nbsp; <strong>Score:</strong> '+state.points+' points</p>';
 html+='<table><thead><tr><th>#</th><th>Challenge</th><th>Status</th><th>Points</th><th>Attempts</th><th>Hints</th></tr></thead><tbody>';
 tasks.forEach((t,i)=>{const r=state.records[i];html+='<tr><td>'+(i+1)+'</td><td>'+escape(t.title)+'</td><td>'+(r?'Complete':'Incomplete')+'</td><td>'+(r?.points??'—')+'</td><td>'+(r?.attempts??'—')+'</td><td>'+(r?.hints??'—')+'</td></tr>'});
 html+='</tbody></table><h2>Independent Java Solutions</h2>';
 let count=0;tasks.forEach((t,i)=>{if(t.phase<3)return;const r=state.records[i];if(!r)return;count++;html+='<section class="report-solution"><h3>'+(i+1)+'. '+escape(t.title)+'</h3><pre>'+escape(r.source)+'</pre></section>'});
 if(!count)html+='<p>No independent-coding challenges have been completed yet.</p>';
 html+='<p class="report-foot">Generated locally by Nested Loop Challenge. Solutions and scores are self-reported browser data for teacher review.</p>';
 reportPrint.innerHTML=html;
}
$('reportPdf').onclick=()=>{
 if(!state.first.trim()||!state.lastInitial.trim()){showNotice('Student name required','Enter your first name and last initial before exporting the report.');return}
 rememberDraft();prepareReport();
 const rows=tasks.map((t,i)=>{const r=state.records[i];return {number:i+1,title:t.title,complete:!!r,points:r?.points,attempts:r?.attempts,hints:r?.hints}});
 const solutions=tasks.flatMap((t,i)=>t.phase>=3&&state.records[i]?[{number:i+1,title:t.title,source:state.records[i].source}]:[]);
 try{
  const pdf=LoopPDF.create({name:state.first.trim()+' '+state.lastInitial+'.',date:new Date().toLocaleDateString(),completed:state.awarded.length,score:state.points,rows,solutions});
  offerDownload(pdf,'NestedLoops_Report_'+safeName()+'.pdf','PDF report');
 }catch(e){showNotice('Report generation failed',e.message)}
};
$('check').onclick=check;$('hint').onclick=hint;$('next').onclick=()=>{if(state.solved)navigate(1)};
$('previous').onclick=()=>{if(isTeacherPreview())navigate(-1)};$('skip').onclick=()=>{if(isTeacherPreview())navigate(1)};
$('reset').onclick=reset;$('again').onclick=reset;
render();
})();
