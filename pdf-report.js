/* Small offline PDF writer. Uses built-in PDF fonts; no network or print dialog. */
(function(root){
  const ascii=s=>String(s??'').replace(/[^\x20-\x7e]/g,ch=>({'\t':'    ','\u2014':'-','\u2013':'-','\u2019':"'",'\u2192':'->'}[ch]||'?'));
  const escape=s=>ascii(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  function create(data){
    const pages=[];let current=[],y=747;
    function newPage(){if(current.length)pages.push(current);current=[];y=747}
    function line(s,kind='normal'){
      const size=kind==='title'?19:kind==='heading'?13:kind==='code'?8.3:kind==='small'?8:10;
      const advance=kind==='title'?31:kind==='heading'?23:kind==='code'?11:kind==='small'?12:15;
      if(y-advance<42)newPage();
      current.push({text:ascii(s),x:45,y,size,font:kind==='code'||kind==='small'?'F2':'F1'});
      y-=advance;
    }
    function wrap(text,width,kind){
      const clean=ascii(text);if(!clean){line('',kind);return}
      for(let remaining=clean;remaining.length;){
        if(remaining.length<=width){line(remaining,kind);break}
        let split=remaining.lastIndexOf(' ',width);if(split<width*0.45)split=width;
        line(remaining.slice(0,split),kind);remaining=remaining.slice(split).trimStart();
      }
    }
    line('Nested Loop Challenge','title');
    line('Student: '+data.name+'    Date: '+data.date);
    line('Completed: '+data.completed+' / 27    Score: '+data.score+' points');
    line('');
    line('Progress Summary','heading');
    line(' #   Challenge                         Status         Pts  Tries  Hints','small');
    line(' ---------------------------------------------------------------------------','small');
    for(const r of data.rows){
      const title=ascii(r.title).slice(0,32).padEnd(33);
      const status=(r.complete?'Complete':'Incomplete').padEnd(14);
      line(String(r.number).padStart(2)+'   '+title+status+String(r.points??'-').padStart(4)+'  '+String(r.attempts??'-').padStart(5)+'  '+String(r.hints??'-').padStart(5),'small');
    }
    line('');
    line('Independent Java Solutions','heading');
    if(!data.solutions.length)line('No independent-coding challenges completed yet.');
    for(const entry of data.solutions){
      if(y<140)newPage();
      wrap(entry.number+'. '+entry.title,75,'heading');
      for(const raw of String(entry.source).split('\n'))wrap(raw,100,'code');
      line('','small');
    }
    line('');
    wrap('Generated locally by Nested Loop Challenge. Scores and solutions are browser data for teacher review.',94,'small');
    if(current.length)pages.push(current);
    const objects=[null];
    const add=s=>(objects.push(s),objects.length-1);
    const catalog=add('');const pagesId=add('');
    const fontRegular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const fontCode=add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
    const pageIds=[];
    for(const items of pages){
      const ops=items.map(i=>'BT /'+i.font+' '+i.size+' Tf 1 0 0 1 '+i.x+' '+i.y+' Tm ('+escape(i.text)+') Tj ET').join('\n');
      const streamId=add('<< /Length '+ops.length+' >>\nstream\n'+ops+'\nendstream');
      const pageId=add('<< /Type /Page /Parent '+pagesId+' 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 '+fontRegular+' 0 R /F2 '+fontCode+' 0 R >> >> /Contents '+streamId+' 0 R >>');
      pageIds.push(pageId);
    }
    objects[catalog]='<< /Type /Catalog /Pages '+pagesId+' 0 R >>';
    objects[pagesId]='<< /Type /Pages /Kids ['+pageIds.map(id=>id+' 0 R').join(' ')+'] /Count '+pageIds.length+' >>';
    let doc='%PDF-1.4\n',offsets=[0];
    for(let i=1;i<objects.length;i++){offsets[i]=doc.length;doc+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}
    const xref=doc.length;doc+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
    for(let i=1;i<objects.length;i++)doc+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    doc+='trailer\n<< /Size '+objects.length+' /Root '+catalog+' 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    return new Blob([new TextEncoder().encode(doc)],{type:'application/pdf'});
  }
  root.LoopPDF={create};
  if(typeof module!=='undefined'&&module.exports)module.exports={create};
})(typeof window!=='undefined'?window:globalThis);
