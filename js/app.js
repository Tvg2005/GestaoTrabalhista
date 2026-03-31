// ── Tab switching ──
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el=>{el.classList.remove('active');el.setAttribute('aria-selected','false');});
  document.getElementById('tab-'+tab).classList.add('active');
  const b=document.getElementById('tab-btn-'+tab);
  b.classList.add('active'); b.setAttribute('aria-selected','true');
}

// ── Inicialização ──
(function init() {
  // Preenche selects de mês
  ['p-inicio-mes','p-fim-mes','v-mes-ref'].forEach(id=>{
    const sel=document.getElementById(id);
    MESES_TITLE.forEach((m,i)=>{
      const o=document.createElement('option');
      o.value=i+1; o.textContent=m;
      const now=new Date();
      if (i===now.getMonth()) o.selected=true;
      sel.appendChild(o);
    });
  });

  // Ano corrente
  const y=new Date().getFullYear();
  ['p-inicio-ano','p-fim-ano','v-ano-ref'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value=y;
  });

  // CPF masks
  ['p-empregador-cpf','p-empregado-cpf'].forEach(id=>
    document.getElementById(id).addEventListener('input',maskCPF)
  );

  // CPF mask para form de empregados
  const ef=document.getElementById('ef-cpf');
  if(ef) ef.addEventListener('input',maskCPF);

  // CPF mask para form de empregadores
  const ef2=document.getElementById('ef2-cpf');
  if(ef2) ef2.addEventListener('input',maskCPF);

  // Preview de cálculo inicial
  calcVale();

  // Popula listas e selects
  renderEmployerList();
  renderEmpList();

  // Preenche empregador ativo nos campos (só se vazio)
  fillEmployerFields();
})();
