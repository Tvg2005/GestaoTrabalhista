// ── Preview ao vivo ──
function calcVale() {
  const mes    = parseInt(document.getElementById('v-mes-ref').value)||12;
  const ano    = parseInt(document.getElementById('v-ano-ref').value)||2025;
  const faltas = parseInt(document.getElementById('v-dias-falta').value)||0;
  const valor  = parseFloat(document.getElementById('v-valor-unitario').value)||0;
  const du=countWorkingDays(ano,mes), dt=Math.max(0,du-faltas), qv=dt*2, tot=qv*valor;
  document.getElementById('v-dias-uteis').textContent    = du;
  document.getElementById('v-faltas-display').textContent = faltas;
  document.getElementById('v-dias-trab').textContent     = dt;
  document.getElementById('v-qtd-vales').textContent     = qv;
  document.getElementById('v-total').textContent         = valor>0?'R$ '+tot.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—';
  document.getElementById('v-extenso').textContent       = valor>0?'('+valorPorExtenso(tot)+')':'—';
}

// ── Handler upload comprovante ──
function onComprovanteChange(input) {
  const lbl=document.getElementById('v-file-label'), area=document.getElementById('v-file-area');
  if (input.files&&input.files[0]) {
    lbl.textContent='✅ '+input.files[0].name;
    area.style.borderColor='rgba(52,211,153,.5)'; area.style.background='rgba(52,211,153,.05)';
  } else {
    lbl.textContent='Clique para anexar o comprovante em PDF (combinado na mesma página)';
    area.style.borderColor=''; area.style.background='';
  }
}

// ── Desenha o recibo diretamente numa página pdf-lib ──
// Retorna a coordenada y da borda inferior do recibo (para posicionar o comprovante)
async function _drawReceiptOnPdfLibPage(page, doc, params) {
  const { rgb, StandardFonts } = window.PDFLib;
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const normFont = await doc.embedFont(StandardFonts.Helvetica);
  const { empNome, empNomeEmp, totalFmt, extenso, qv, mesNome, ano, dataPagFmt } = params;

  const A4W=595.28, MARG=10, PAD=10;
  const black=rgb(0,0,0);
  const boxX=MARG, boxW=A4W-2*MARG;

  const FS_TITLE=16, FS_SUB=10.5, FS_BODY=9.5, FS_SIG=8.5;
  const LH=FS_BODY*1.55; // line height for body text

  // Word-wrap do corpo no espaço disponível
  const corpo=`Recebi o valor de R$ ${totalFmt} (${extenso}) correspondente a ${qv} Vales-transportes, referentes ao mês de ${mesNome}/${ano} pelo que firmo o presente.`;
  const maxW=boxW-2*PAD-4;
  const words=corpo.split(' ');
  const lines=[];
  let cur='';
  for (const w of words) {
    const test=cur?cur+' '+w:w;
    if (normFont.widthOfTextAtSize(test,FS_BODY)>maxW) { if(cur) lines.push(cur); cur=w; }
    else cur=test;
  }
  if(cur) lines.push(cur);

  // Calcula altura do box (acumulando de cima pra baixo)
  const boxH = PAD
    + FS_TITLE + 6    // RECIBO
    + FS_SUB   + 7    // Entrega Vale-Transporte
    + FS_BODY  + 5    // Empregador
    + FS_BODY  + 8    // Empregado
    + lines.length * LH + 6  // corpo
    + FS_BODY  + 14   // data + espaço até linha assinatura
    + 1        + 5    // linha + gap
    + FS_SIG          // texto assinatura
    + PAD;

  const { height: pageH } = page.getSize();
  const boxTopY = pageH - MARG;
  const boxBotY = boxTopY - boxH;

  // Borda do recibo
  page.drawRectangle({ x:boxX, y:boxBotY, width:boxW, height:boxH,
    borderWidth:0.9, borderColor:black });

  let y = boxTopY - PAD;

  // RECIBO
  y -= FS_TITLE;
  const titleW=boldFont.widthOfTextAtSize('RECIBO', FS_TITLE);
  page.drawText('RECIBO',{ x:boxX+(boxW-titleW)/2, y, font:boldFont, size:FS_TITLE, color:black });
  y -= 6;

  // Subtítulo
  y -= FS_SUB;
  const subTxt='Entrega Vale-Transporte';
  const subW=normFont.widthOfTextAtSize(subTxt, FS_SUB);
  page.drawText(subTxt,{ x:boxX+(boxW-subW)/2, y, font:normFont, size:FS_SUB, color:black });
  y -= 7;

  // Empregador
  y -= FS_BODY;
  page.drawText(`Empregador(a)  ${empNome}`,{ x:boxX+PAD, y, font:normFont, size:FS_BODY, color:black });
  y -= 5;

  // Empregado
  y -= FS_BODY;
  page.drawText(`Empregado(a)  ${empNomeEmp}`,{ x:boxX+PAD, y, font:normFont, size:FS_BODY, color:black });
  y -= 8;

  // Corpo (texto justificado manually line-wrapped)
  for (const ln of lines) {
    y -= FS_BODY;
    page.drawText(ln,{ x:boxX+PAD, y, font:normFont, size:FS_BODY, color:black });
    y -= (LH - FS_BODY);
  }
  y -= 6;

  // Data
  y -= FS_BODY;
  page.drawText(`Brasília, ${dataPagFmt}`,{ x:boxX+PAD, y, font:normFont, size:FS_BODY, color:black });
  y -= 14;

  // Linha de assinatura
  const sigW=110, sigX=boxX+(boxW-sigW)/2;
  page.drawLine({ start:{x:sigX,y}, end:{x:sigX+sigW,y}, thickness:0.6, color:black });
  y -= 5;

  // Texto assinatura
  y -= FS_SIG;
  const sigTxt='Assinatura do Empregado';
  const sigTW=normFont.widthOfTextAtSize(sigTxt, FS_SIG);
  page.drawText(sigTxt,{ x:boxX+(boxW-sigTW)/2, y, font:normFont, size:FS_SIG, color:black });

  return boxBotY; // y inferior do recibo
}

// ── Gera PDF recibo compacto (sem comprovante) com jsPDF ──
function _buildStandaloneReciboPDF(params) {
  const { empNome, empNomeEmp, totalFmt, extenso, qv, mesNome, ano, dataPagFmt } = params;

  const PW=210, ML=18, BOX_W=PW-36, BOX_X=ML, FSZ=10;
  const PT=6,PB=7,TH=6,TG=5,SH=4,SG=7,EH=4,EG=5,AE=6,LH=5.2,AB=4,DH=4,DG=11,SiG=4,SiH=3.5;

  const corpo=`Recebi o valor de R$ ${totalFmt} (${extenso}) correspondente a ${qv} Vales-transportes, referentes ao mês de ${mesNome}/${ano} pelo que firmo o presente.`;
  const { jsPDF }=window.jspdf;
  // Use A4 portrait, preenche de cima
  const doc=new jsPDF({unit:'mm', format:'a4'});
  doc.setFontSize(FSZ);
  const linhas=doc.splitTextToSize(corpo, BOX_W-10);
  const nL=linhas.length;
  const boxH=PT+TH+TG+SH+SG+EH+EG+EH+AE+EH+nL*LH+AB+DH+DG+SiG+SiH+PB;
  const BOX_Y=10;

  doc.setLineWidth(0.5); doc.rect(BOX_X,BOX_Y,BOX_W,boxH); doc.setLineWidth(0.2);
  let y=BOX_Y+PT;
  y+=TH; doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('RECIBO',PW/2,y,{align:'center'}); y+=TG;
  y+=SH; doc.setFontSize(10);
  doc.text('Entrega Vale-Transporte',PW/2,y,{align:'center'}); y+=SG;
  y+=EH; doc.setFont('helvetica','normal'); doc.setFontSize(FSZ);
  doc.text(`Empregador(a)  ${empNome}`,BOX_X+5,y); y+=EG;
  doc.text(`Empregado(a)  ${empNomeEmp}`,BOX_X+5,y); y+=AE;
  y+=EH; doc.text(linhas,BOX_X+5,y); y+=nL*LH+AB;
  y+=DH; doc.text(`Brasília, ${dataPagFmt}`,BOX_X+5,y); y+=DG;
  const sigX=PW/2-35;
  doc.setLineWidth(0.3); doc.line(sigX,y,sigX+70,y); doc.setLineWidth(0.2);
  y+=SiG+SiH; doc.setFontSize(8.5);
  doc.text('Assinatura do Empregado',PW/2,y,{align:'center'});
  return doc;
}

// ── Função principal ──
function generateValePDF() {
  const empNome    = document.getElementById('v-empregador-nome').value.trim();
  const empNomeEmp = document.getElementById('v-empregado-nome').value.trim();
  const valorUnit  = parseFloat(document.getElementById('v-valor-unitario').value);
  const dataPag    = document.getElementById('v-data-pagamento').value;
  const mes        = parseInt(document.getElementById('v-mes-ref').value);
  const ano        = parseInt(document.getElementById('v-ano-ref').value);
  const faltas     = parseInt(document.getElementById('v-dias-falta').value)||0;
  const compFile   = document.getElementById('v-comprovante').files[0]||null;

  const st=document.getElementById('v-status');
  const err=m=>{ st.className='status-msg error'; st.textContent='⚠️ '+m; st.style.display='flex'; };
  if (!empNome)    return err('Informe o nome do Empregador.');
  if (!empNomeEmp) return err('Informe o nome do Empregado.');
  if (!valorUnit||isNaN(valorUnit)||valorUnit<=0) return err('Informe o valor unitário.');
  if (!dataPag)    return err('Informe a data do pagamento.');
  st.style.display='none';

  const btn=document.getElementById('v-btn'), sp=document.getElementById('v-spinner'), bt=document.getElementById('v-btn-text');
  btn.disabled=true; sp.style.display='block'; bt.textContent='Gerando PDF…';

  (async()=>{
    try {
      const du=countWorkingDays(ano,mes), dt=Math.max(0,du-faltas), qv=dt*2, tot=qv*valorUnit;
      const totalFmt  =tot.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
      const extenso   =valorPorExtenso(tot);
      const mesNome   =MESES_TITLE[mes-1];
      const dataPagFmt=dataPag.split('-').reverse().join('/');
      const fn=`recibo_vale_transporte_${mesNome}_${ano}.pdf`;
      const rParams={ empNome, empNomeEmp, totalFmt, extenso, qv, mesNome, ano, dataPagFmt };

      if (compFile && window.PDFLib) {
        // ── MODO COMBINADO: desenha recibo via pdf-lib, comprovante abaixo ──
        const { PDFDocument } = window.PDFLib;
        const compBytes = await compFile.arrayBuffer();
        const compSrc   = await PDFDocument.load(compBytes);

        const merged = await PDFDocument.create();
        const A4W=595.28, A4H=841.89, MARG=10, GAP=5;
        const page  = merged.addPage([A4W, A4H]);

        // Desenha o recibo direto na página (sem embedding/scaling)
        const receiptBotY = await _drawReceiptOnPdfLibPage(page, merged, rParams);

        // Espaço restante para o comprovante
        const remH    = receiptBotY - MARG - GAP;
        const remYBase= MARG;
        const availW  = A4W - 2*MARG;

        // Embed todas as páginas do comprovante
        const numPgs  = compSrc.getPageCount();
        const idxs    = Array.from({length:numPgs},(_,i)=>i);
        const compEmbs= await merged.embedPdf(compSrc, idxs);

        if (numPgs===1) {
          const ce=compEmbs[0];
          const sc=Math.min((availW*0.98)/ce.width, remH/ce.height);
          const cW=ce.width*sc, cH=ce.height*sc;
          page.drawPage(ce,{x:MARG+(availW-cW)/2, y:remYBase+(remH-cH)/2, width:cW, height:cH});
        } else {
          // Múltiplas páginas: grade 2 por linha
          const cols=Math.min(numPgs,2);
          const rows=Math.ceil(numPgs/cols);
          const cellW=(availW-(cols-1)*GAP)/cols;
          const cellH=(remH-(rows-1)*GAP)/rows;
          compEmbs.forEach((ce,i)=>{
            const col=i%cols, row=Math.floor(i/cols);
            const sc=Math.min((cellW*0.99)/ce.width, (cellH*0.99)/ce.height);
            const cW=ce.width*sc, cH=ce.height*sc;
            const cx=MARG+col*(cellW+GAP)+(cellW-cW)/2;
            const cy=remYBase+(rows-1-row)*(cellH+GAP)+(cellH-cH)/2;
            page.drawPage(ce,{x:cx, y:cy, width:cW, height:cH});
          });
        }

        const blob=new Blob([await merged.save()],{type:'application/pdf'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url; a.download=fn; a.click();
        setTimeout(()=>URL.revokeObjectURL(url),3000);
        st.textContent='✅ Recibo + comprovante combinados na mesma página!';

      } else {
        // ── MODO SIMPLES: apenas o recibo (jsPDF) ──
        const doc=_buildStandaloneReciboPDF(rParams);
        doc.save(fn);
        st.textContent='✅ Recibo gerado com sucesso!';
      }

      st.className='status-msg success'; st.style.display='flex';
    } catch(e) {
      console.error(e);
      st.className='status-msg error'; st.textContent='⚠️ Erro: '+e.message; st.style.display='flex';
    } finally {
      btn.disabled=false; sp.style.display='none'; bt.textContent='⬇️ Gerar e Baixar Recibo de Vale-Transporte (PDF)';
    }
  })();
}
