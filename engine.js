/* A deliberately small, bounded interpreter for AP CSA pattern exercises.
   It parses Java-like statements; it never evaluates student code as JavaScript. */
(function(root){
  const operators={'||':1,'&&':2,'==':3,'!=':3,'<':4,'<=':4,'>':4,'>=':4,'+':5,'-':5,'*':6,'/':6,'%':6};
  function scan(source){
    const pattern=/\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|\d+|[A-Za-z_]\w*|<=|>=|==|!=|&&|\|\||\+\+|--|\+=|-=|[{}();.+\-*\/%<>=!]/gy;
    const out=[];let offset=0;
    while(offset<source.length){
      pattern.lastIndex=offset;const m=pattern.exec(source);
      if(!m)throw Error('Unsupported character near: '+source.slice(offset,offset+12));
      if(!/^\s+$/.test(m[0])&&!m[0].startsWith('//')&&!m[0].startsWith('/*'))out.push({text:m[0],offset});
      offset=pattern.lastIndex;
    }
    out.push({text:'<end>',offset:source.length});return out;
  }
  function tokenize(source){return scan(source).map(t=>t.text)}
  function parse(source){
    const scanned=scan(source),tokens=scanned.map(t=>t.text);let pos=0;
    const lineAt=at=>source.slice(0,scanned[at].offset).split('\n').length;
    const peek=()=>tokens[pos],take=()=>tokens[pos++];
    function expect(s){if(peek()!==s)throw Error('Expected '+s+' near '+peek());take()}
    function expression(min=0){
      let x,v=take();
      if(v==='('){x=expression();expect(')')}
      else if(v==='-'||v==='!')x={kind:'unary',op:v,value:expression(7)};
      else if(/^\d+$/.test(v))x={kind:'lit',value:Number(v)};
      else if(v.startsWith('"')){let value;try{value=JSON.parse(v)}catch{throw Error('Invalid string literal')}x={kind:'lit',value}}
      else if(/^[A-Za-z_]\w*$/.test(v)&&v!=='<end>')x={kind:'var',name:v};
      else throw Error('Expected an expression near '+v);
      while(operators[peek()]>=min&&operators[peek()]!==undefined){const op=take();x={kind:'binary',op,left:x,right:expression(operators[op]+1)}}
      return x;
    }
    function block(){expect('{');let body=[];while(peek()!=='}'){if(peek()==='<end>')throw Error('Missing closing brace }');body.push(statement())}expect('}');return body}
    function statement(){
      const line=lineAt(pos);
      if(peek()==='for'){
        take();expect('(');expect('int');let variable=take();if(!/^[A-Za-z_]\w*$/.test(variable))throw Error('Invalid loop variable');expect('=');let start=expression();expect(';');let test=expression();expect(';');let updateVar=take();if(updateVar!==variable)throw Error('Loop update must change '+variable);let update=take(),amount=null;
        if(update==='+='||update==='-=')amount=expression();else if(update!=='++'&&update!=='--')throw Error('Use ++, --, += or -= for loop updates');
        expect(')');return {kind:'for',line,variable,start,test,update,amount,body:block()};
      }
      if(peek()==='if'){take();expect('(');let test=expression();expect(')');let yes=block(),no=[];if(peek()==='else'){take();no=block()}return {kind:'if',line,test,yes,no}}
      if(peek()==='System'){
        expect('System');expect('.');expect('out');expect('.');let method=take();if(method!=='print'&&method!=='println')throw Error('Use System.out.print or println');
        expect('(');let value=null;if(peek()!==')')value=expression();expect(')');expect(';');return {kind:'print',line,method,value};
      }
      throw Error('Expected a for loop, if statement, or print statement near '+peek());
    }
    let body=[];while(peek()!=='<end>')body.push(statement());return body;
  }
  function execute(source,onStep){
    const tree=parse(source);let output='',steps=0;const env=Object.create(null);
    function record(line,action){if(onStep)onStep({line,action,variables:{...env},output});}
    function tick(){if(++steps>10000)throw Error('Loop limit reached. Check your conditions and increments.')}
    function value(node){
      if(node.kind==='lit')return node.value;
      if(node.kind==='var'){if(!(node.name in env))throw Error('Unknown variable: '+node.name);return env[node.name]}
      if(node.kind==='unary'){const v=value(node.value);return node.op==='-'?-Number(v):!v}
      const a=value(node.left);if(node.op==='&&')return Boolean(a)&&Boolean(value(node.right));if(node.op==='||')return Boolean(a)||Boolean(value(node.right));const b=value(node.right);
      switch(node.op){case '+':return typeof a==='string'||typeof b==='string'?String(a)+String(b):a+b;case '-':return a-b;case '*':return a*b;case '/':if(b===0)throw Error('Division by zero');return Math.trunc(a/b);case '%':if(b===0)throw Error('Division by zero');return a%b;case '<':return a<b;case '<=':return a<=b;case '>':return a>b;case '>=':return a>=b;case '==':return a===b;case '!=':return a!==b}
      throw Error('Unsupported operator '+node.op);
    }
    function run(body){
      for(const node of body){
        tick();
        if(node.kind==='print'){let x=node.value===null?'':value(node.value);output+=String(x)+(node.method==='println'?'\n':'');if(output.length>4000)throw Error('Output is too long. Check your loop bounds.');record(node.line,node.method==='println'?'Move to next line':'Print '+JSON.stringify(x))}
        else if(node.kind==='if'){const passed=Boolean(value(node.test));record(node.line,passed?'Condition true':'Condition false');run(passed?node.yes:node.no)}
        else{
          const had=Object.prototype.hasOwnProperty.call(env,node.variable),prior=env[node.variable];
          env[node.variable]=value(node.start);record(node.line,'Initialize '+node.variable);let count=0;
          while(true){const passed=Boolean(value(node.test));record(node.line,passed?'Loop condition true':'Loop condition false');if(!passed)break;
            tick();if(++count>500)throw Error('A loop ran more than 500 times. Check its update.');run(node.body);
            const delta=node.update==='++'?1:node.update==='--'?-1:Number(value(node.amount))*(node.update==='+='?1:-1);
            env[node.variable]+=delta;record(node.line,'Update '+node.variable);
          }
          if(had)env[node.variable]=prior;else delete env[node.variable];
        }
      }
    }
    run(tree);return output.replace(/\n$/,'');
  }
  function trace(source){const steps=[];const output=execute(source,s=>{if(steps.length>=2500)throw Error('Step limit reached. Try smaller loop bounds for tracing.');steps.push(s)});return {steps,output}}
  root.LoopEngine={tokenize,parse,execute,trace};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.LoopEngine;
})(typeof window!=='undefined'?window:globalThis);
