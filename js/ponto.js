function generatePontoPDF() {
  const en  = document.getElementById('p-empregador-nome').value.trim();
  const ec  = document.getElementById('p-empregador-cpf').value.trim();
  const en2 = document.getElementById('p-empregado-nome').value.trim();
  const ec2 = document.getElementById('p-empregado-cpf').value.trim();
  const cargo   = document.getElementById('p-empregado-cargo').value.trim();
  const adm     = document.getElementById('p-empregado-admissao').value;
  const jornada = document.getElementById('p-empregado-jornada').value.trim();
  const tIni    = document.getElementById('p-trabalho-inicio').value;
  const tFim    = document.getElementById('p-trabalho-fim').value;
  const aIni    = document.getElementById('p-almoco-inicio').value;
  const aFim    = document.getElementById('p-almoco-fim').value;
  const iMes    = parseInt(document.getElementById('p-inicio-mes').value);
  const iAno    = parseInt(document.getElementById('p-inicio-ano').value);
  const fMes    = parseInt(document.getElementById('p-fim-mes').value);
  const fAno    = parseInt(document.getElementById('p-fim-ano').value);

  const st = document.getElementById('p-status');
  const err = m=>{ st.className='status-msg error'; st.textContent='⚠️ '+m; st.style.display='flex'; };
  if (!en||!ec) return err('Preencha nome e CPF do Empregador.');
  if (!en2||!ec2) return err('Preencha nome e CPF do Empregado.');
  if (!adm) return err('Informe a data de admissão.');
  if (iAno*12+iMes > fAno*12+fMes) return err('Período inicial deve ser ≤ final.');
  if (fAno-iAno > 5) return err('Período máximo: 5 anos.');
  st.style.display='none';

  const btn=document.getElementById('p-btn'), sp=document.getElementById('p-spinner'), bt=document.getElementById('p-btn-text');
  btn.disabled=true; sp.style.display='block'; bt.textContent='Gerando PDF…';

  setTimeout(()=>{
    try {
      const admFmt = adm.split('-').reverse().join('/');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      let first=true, cy=iAno, cm=iMes;
      while (cy*12+cm <= fAno*12+fMes) {
        if (!first) doc.addPage(); first=false;
        _drawPontoPage(doc,{year:cy,month:cm,en,ec,en2,ec2,cargo,admFmt,jornada,
          horTrab:`${tIni} às ${tFim}`, horAlm:`${aIni} às ${aFim}`});
        cm++; if(cm>12){cm=1;cy++;}
      }
      const fn = iAno===fAno&&iMes===fMes
        ? `folha_ponto_${MESES_UPPER[iMes-1]}_${iAno}.pdf`
        : `folha_ponto_${MESES_UPPER[iMes-1]}${iAno}_a_${MESES_UPPER[fMes-1]}${fAno}.pdf`;
      doc.save(fn);
      st.className='status-msg success'; st.textContent='✅ PDF gerado com sucesso!'; st.style.display='flex';
    } catch(e) {
      st.className='status-msg error'; st.textContent='⚠️ Erro: '+e.message; st.style.display='flex';
    } finally { btn.disabled=false; sp.style.display='none'; bt.textContent='⬇️ Gerar e Baixar Folha de Ponto (PDF)'; }
  },50);
}

function _drawPontoPage(doc, p) {
  const {year,month,en,ec,en2,ec2,cargo,admFmt,jornada,horTrab,horAlm}=p;
  const mL=12, PW=210, usW=PW-24;
  let y=14;
  doc.setFont('helvetica','bold'); doc.setFontSize(13);
  doc.text(`Folha de Ponto – Periodo: ${MESES_UPPER[month-1]}/${year}`, PW/2, y, {align:'center'});
  y+=8;
  const hR=6.5, cW1=usW*.6, cW2=usW*.4;
  const lRow=lbl=>{ doc.setFillColor(230,230,230); doc.rect(mL,y,usW,hR,'F'); doc.rect(mL,y,usW,hR,'S'); doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.text(lbl,mL+2,y+hR/2+3); y+=hR; };
  lRow('Empregador(a)');
  doc.rect(mL,y,usW,hR); doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
  doc.text(`Nome: ${en}`,mL+2,y+hR/2+3); doc.text(`CPF: ${ec}`,mL+cW1+2,y+hR/2+3);
  doc.line(mL+cW1,y,mL+cW1,y+hR); y+=hR+3;
  lRow('Empregado(a)');
  doc.rect(mL,y,usW,hR); doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
  doc.text(`Nome: ${en2}`,mL+2,y+hR/2+3); doc.text(`CPF: ${ec2}`,mL+cW1+2,y+hR/2+3);
  doc.line(mL+cW1,y,mL+cW1,y+hR); y+=hR;
  doc.rect(mL,y,usW,hR); doc.text(`Cargo: ${cargo}`,mL+2,y+hR/2+3); y+=hR;
  doc.rect(mL,y,cW1,hR); doc.text(`Admissão: ${admFmt}`,mL+2,y+hR/2+3);
  doc.rect(mL+cW1,y,cW2,hR); doc.text(`Jornada: ${jornada}`,mL+cW1+2,y+hR/2+3); y+=hR;
  doc.rect(mL,y,cW1,hR); doc.rect(mL+cW1,y,cW2,hR); doc.text(`Horário de Trabalho: ${horTrab}`,mL+cW1+2,y+hR/2+3); y+=hR;
  doc.rect(mL,y,cW1,hR); doc.rect(mL+cW1,y,cW2,hR); doc.text(`Intervalo almoço: ${horAlm}`,mL+cW1+2,y+hR/2+3); y+=hR+3;

  const cols=[
    {h:'Dia\nMês',w:11},{h:'Dia\nSemana',w:16},{h:'Entrada',w:24},
    {h:'Início do\nIntervalo',w:26},{h:'Fim do\nIntervalo',w:24},{h:'Saída',w:22},
    {h:'Hora\nExtra',w:18},{h:'Assinatura do\nEmpregado(a)',w:usW-141}
  ];
  const hH=10, hD=6.0;
  let xC=mL;
  cols.forEach(col=>{
    doc.setFillColor(210,210,210); doc.rect(xC,y,col.w,hH,'F'); doc.rect(xC,y,col.w,hH,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(7);
    col.h.split('\n').forEach((ln,li)=>doc.text(ln,xC+col.w/2,y+3+li*3.8,{align:'center'}));
    xC+=col.w;
  });
  y+=hH;
  buildMonthData(year,month).forEach(row=>{
    const {day,diaSemana,tipo}=row;
    const isSab=tipo==='sabado',isDom=tipo==='domingo',isFer=tipo==='feriado';
    const bg=isSab||isDom?[245,245,255]:isFer?[255,252,235]:null;
    xC=mL;
    cols.forEach((col,idx)=>{
      if(bg){doc.setFillColor(...bg);doc.rect(xC,y,col.w,hD,'F');doc.rect(xC,y,col.w,hD,'S');}
      else doc.rect(xC,y,col.w,hD);
      let txt='',bold=false;
      if(idx===0) txt=String(day);
      else if(idx===1){txt=diaSemana;if(isSab||isDom||isFer)bold=true;}
      else{const ti=idx-2;if(isSab){txt='SAB';bold=true;}else if(isDom){txt='DOM';bold=true;}else if(isFer){txt=ti===4?'---':'FERIADO';bold=true;}}
      if(txt){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(7.2);doc.text(txt,xC+col.w/2,y+hD/2+2.5,{align:'center'});}
      xC+=col.w;
    });
    y+=hD;
  });
}
