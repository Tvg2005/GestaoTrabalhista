// ── Employee CRUD com localStorage ──
const EMP_KEY = 'gfp_employees';
let _editingId = null;

function getEmps()        { return JSON.parse(localStorage.getItem(EMP_KEY)||'[]'); }
function saveEmps(list)   { localStorage.setItem(EMP_KEY, JSON.stringify(list)); }

// Popula selects de empregado nas abas Ponto e Vale
function refreshEmpSelects() {
  const list = getEmps();
  ['p-select-emp','v-select-emp'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Selecionar empregado cadastrado —</option>';
    list.forEach(e => {
      const o = document.createElement('option');
      o.value = e.id;
      o.textContent = e.nome + (e.status==='inativo'?' (Inativo)':'');
      sel.appendChild(o);
    });
    if (prev) sel.value = prev;
  });
}

// Preenche campos da aba Folha de Ponto
function fillPontoFromEmp() {
  const id = parseInt(document.getElementById('p-select-emp').value);
  if (!id) return;
  const e = getEmps().find(x => x.id===id);
  if (!e) return;
  document.getElementById('p-empregado-nome').value    = e.nome||'';
  document.getElementById('p-empregado-cpf').value     = e.cpf||'';
  document.getElementById('p-empregado-cargo').value   = e.cargo||'';
  document.getElementById('p-empregado-admissao').value= e.admissao||'';
  document.getElementById('p-empregado-jornada').value = e.jornada||'';
  document.getElementById('p-trabalho-inicio').value   = e.trabInicio||'08:00';
  document.getElementById('p-trabalho-fim').value      = e.trabFim||'17:00';
  document.getElementById('p-almoco-inicio').value     = e.almocoInicio||'12:00';
  document.getElementById('p-almoco-fim').value        = e.almocoFim||'13:00';
}

// Preenche campos da aba Vale-Transporte
function fillValeFromEmp() {
  const id = parseInt(document.getElementById('v-select-emp').value);
  if (!id) return;
  const e = getEmps().find(x => x.id===id);
  if (!e) return;
  document.getElementById('v-empregado-nome').value = e.nome||'';
}

// ── Renderiza a lista de empregados ──
function renderEmpList() {
  refreshEmpSelects();
  const list   = getEmps();
  const ctn    = document.getElementById('emp-list');
  const btnAdd = document.getElementById('emp-btn-add');
  if (btnAdd) btnAdd.textContent = '+ Adicionar Empregado';

  if (!list.length) {
    ctn.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div>Nenhum empregado cadastrado ainda.<br>Clique em "+ Adicionar Empregado" para começar.</div>';
    return;
  }
  const sorted = [...list].sort((a,b)=>{
    if (a.status===b.status) return a.nome.localeCompare(b.nome,'pt');
    return a.status==='ativo'?-1:1;
  });
  ctn.innerHTML = sorted.map(e => {
    const adm = e.admissao ? e.admissao.split('-').reverse().join('/') : '—';
    const dem = e.desligamento ? e.desligamento.split('-').reverse().join('/') : null;
    return `
    <div class="emp-card${e.status==='inativo'?' inactive':''}">
      <div class="emp-card-top">
        <div class="emp-card-name">${e.nome}</div>
        <span class="badge ${e.status==='ativo'?'badge-ativo':'badge-inativo'}">${e.status==='ativo'?'● Ativo':'○ Inativo'}</span>
      </div>
      <div class="emp-detail">🪪 ${e.cpf||'—'}</div>
      <div class="emp-detail">📋 ${e.cargo||'—'}</div>
      <div class="emp-detail">📅 Admissão: ${adm}</div>
      ${dem?`<div class="emp-detail">🚪 Desligamento: ${dem}</div>`:''}
      <div class="emp-actions">
        <button class="btn-sm" onclick="editEmp(${e.id})">✏️ Editar</button>
        <button class="btn-sm" onclick="toggleStatus(${e.id})">${e.status==='ativo'?'⛔ Desativar':'✅ Ativar'}</button>
        <button class="btn-sm danger" onclick="deleteEmp(${e.id})">🗑️ Excluir</button>
      </div>
    </div>`;
  }).join('');
}

function showEmpForm(show) {
  const card = document.getElementById('emp-form-card');
  card.classList.toggle('visible', show);
  if (show) card.scrollIntoView({behavior:'smooth',block:'start'});
}

function newEmp() {
  _editingId = null;
  clearEmpForm();
  document.getElementById('emp-form-title').textContent = 'Adicionar Empregado';
  showEmpForm(true);
}

function editEmp(id) {
  const e = getEmps().find(x=>x.id===id);
  if (!e) return;
  _editingId = id;
  document.getElementById('ef-nome').value        = e.nome||'';
  document.getElementById('ef-cpf').value         = e.cpf||'';
  document.getElementById('ef-cargo').value       = e.cargo||'Empregado doméstico nos serviços gerais';
  document.getElementById('ef-admissao').value    = e.admissao||'';
  document.getElementById('ef-desligamento').value= e.desligamento||'';
  document.getElementById('ef-status').value      = e.status||'ativo';
  document.getElementById('ef-jornada').value     = e.jornada||'40 h semanais (segunda a sexta)';
  document.getElementById('ef-trab-ini').value    = e.trabInicio||'08:00';
  document.getElementById('ef-trab-fim').value    = e.trabFim||'17:00';
  document.getElementById('ef-alm-ini').value     = e.almocoInicio||'12:00';
  document.getElementById('ef-alm-fim').value     = e.almocoFim||'13:00';
  document.getElementById('emp-form-title').textContent = 'Editar Empregado';
  showEmpForm(true);
}

function clearEmpForm() {
  ['ef-nome','ef-cpf','ef-admissao','ef-desligamento'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ef-cargo').value    = 'Empregado doméstico nos serviços gerais';
  document.getElementById('ef-status').value   = 'ativo';
  document.getElementById('ef-jornada').value  = '40 h semanais (segunda a sexta)';
  document.getElementById('ef-trab-ini').value = '08:00';
  document.getElementById('ef-trab-fim').value = '17:00';
  document.getElementById('ef-alm-ini').value  = '12:00';
  document.getElementById('ef-alm-fim').value  = '13:00';
}

function saveEmpForm() {
  const emp = {
    nome:         document.getElementById('ef-nome').value.trim(),
    cpf:          document.getElementById('ef-cpf').value.trim(),
    cargo:        document.getElementById('ef-cargo').value.trim(),
    admissao:     document.getElementById('ef-admissao').value,
    desligamento: document.getElementById('ef-desligamento').value,
    status:       document.getElementById('ef-status').value,
    jornada:      document.getElementById('ef-jornada').value.trim(),
    trabInicio:   document.getElementById('ef-trab-ini').value,
    trabFim:      document.getElementById('ef-trab-fim').value,
    almocoInicio: document.getElementById('ef-alm-ini').value,
    almocoFim:    document.getElementById('ef-alm-fim').value,
  };
  if (!emp.nome) { alert('Informe o nome do empregado.'); return; }
  const list = getEmps();
  if (_editingId) {
    const idx = list.findIndex(x=>x.id===_editingId);
    if (idx>=0) list[idx]={...list[idx],...emp};
  } else {
    emp.id = Date.now();
    list.push(emp);
  }
  saveEmps(list);
  showEmpForm(false);
  renderEmpList();
}

function cancelEmpForm() { showEmpForm(false); }

function toggleStatus(id) {
  const list = getEmps();
  const idx  = list.findIndex(x=>x.id===id);
  if (idx>=0) { list[idx].status = list[idx].status==='ativo'?'inativo':'ativo'; saveEmps(list); renderEmpList(); }
}

function deleteEmp(id) {
  if (!confirm('Excluir este empregado permanentemente?')) return;
  saveEmps(getEmps().filter(x=>x.id!==id));
  renderEmpList();
}
