// ── Empregadores — localStorage ──
const EMPLOYER_KEY = 'gfp_employers';
let _editingEmployerId = null;

function getEmployers()       { return JSON.parse(localStorage.getItem(EMPLOYER_KEY)||'[]'); }
function saveEmployers(list)  { localStorage.setItem(EMPLOYER_KEY, JSON.stringify(list)); }

function getActiveEmployer() {
  return getEmployers().find(e => e.status === 'ativo') || null;
}

// Preenche os campos de empregador nas abas Ponto e Vale com o empregador ativo
function fillEmployerFields() {
  const active = getActiveEmployer();
  if (!active) return;
  // Ponto
  const pNome = document.getElementById('p-empregador-nome');
  const pCpf  = document.getElementById('p-empregador-cpf');
  if (pNome && !pNome.value) pNome.value = active.nome || '';
  if (pCpf  && !pCpf.value)  pCpf.value  = active.cpf  || '';
  // Vale
  const vNome = document.getElementById('v-empregador-nome');
  if (vNome && !vNome.value) vNome.value = active.nome || '';
}

// Força preenchimento (sobrescreve campos mesmo se já preenchidos)
function forceEmployerFields() {
  const active = getActiveEmployer();
  if (!active) return;
  const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value=val||''; };
  setVal('p-empregador-nome', active.nome);
  setVal('p-empregador-cpf',  active.cpf);
  setVal('v-empregador-nome', active.nome);
}

// ── Renderiza lista de empregadores ──
function renderEmployerList() {
  const list = getEmployers();
  const ctn  = document.getElementById('employer-list');
  if (!ctn) return;

  if (!list.length) {
    ctn.innerHTML = '<div class="empty-state"><div class="empty-icon">🏢</div>Nenhum empregador cadastrado.<br>Clique em "+ Adicionar" para começar.</div>';
    return;
  }

  const sorted = [...list].sort((a,b) => {
    if (a.status===b.status) return a.nome.localeCompare(b.nome,'pt');
    return a.status==='ativo' ? -1 : 1;
  });

  ctn.innerHTML = sorted.map(e => `
    <div class="emp-card${e.status==='inativo'?' inactive':''}">
      <div class="emp-card-top">
        <div class="emp-card-name">${e.nome}</div>
        <span class="badge ${e.status==='ativo'?'badge-ativo':'badge-inativo'}">${e.status==='ativo'?'● Ativo':'○ Inativo'}</span>
      </div>
      <div class="emp-detail">🪪 ${e.cpf||'—'}</div>
      <div class="emp-actions">
        <button class="btn-sm" onclick="editEmployer(${e.id})">✏️ Editar</button>
        ${e.status==='inativo'
          ? `<button class="btn-sm" onclick="setActiveEmployer(${e.id})">✅ Tornar Ativo</button>`
          : `<button class="btn-sm" onclick="deactivateEmployer(${e.id})">⛔ Desativar</button>`}
        <button class="btn-sm danger" onclick="deleteEmployer(${e.id})">🗑️ Excluir</button>
      </div>
    </div>`
  ).join('');

  // Atualiza campos automaticamente
  fillEmployerFields();
}

// ── CRUD empregadores ──
function newEmployer() {
  _editingEmployerId = null;
  clearEmployerForm();
  document.getElementById('employer-form-title').textContent = 'Adicionar Empregador';
  showEmployerForm(true);
}

function editEmployer(id) {
  const e = getEmployers().find(x => x.id===id);
  if (!e) return;
  _editingEmployerId = id;
  document.getElementById('ef2-nome').value   = e.nome||'';
  document.getElementById('ef2-cpf').value    = e.cpf||'';
  document.getElementById('ef2-status').value = e.status||'ativo';
  document.getElementById('employer-form-title').textContent = 'Editar Empregador';
  showEmployerForm(true);
}

function clearEmployerForm() {
  document.getElementById('ef2-nome').value   = '';
  document.getElementById('ef2-cpf').value    = '';
  document.getElementById('ef2-status').value = 'ativo';
}

function showEmployerForm(show) {
  const card = document.getElementById('employer-form-card');
  card.classList.toggle('visible', show);
  if (show) card.scrollIntoView({behavior:'smooth', block:'start'});
}

function cancelEmployerForm() { showEmployerForm(false); }

function saveEmployerForm() {
  const nome   = document.getElementById('ef2-nome').value.trim();
  const cpf    = document.getElementById('ef2-cpf').value.trim();
  const status = document.getElementById('ef2-status').value;
  if (!nome) { alert('Informe o nome do empregador.'); return; }

  let list = getEmployers();

  // Regra: só um ativo
  if (status === 'ativo') {
    list = list.map(e => ({ ...e, status: 'inativo' }));
  }

  if (_editingEmployerId) {
    const idx = list.findIndex(x => x.id===_editingEmployerId);
    if (idx>=0) list[idx] = { ...list[idx], nome, cpf, status };
  } else {
    list.push({ id: Date.now(), nome, cpf, status });
  }

  saveEmployers(list);
  showEmployerForm(false);
  renderEmployerList();
  forceEmployerFields();
}

function setActiveEmployer(id) {
  // Desativa todos, ativa o escolhido
  const list = getEmployers().map(e => ({ ...e, status: e.id===id ? 'ativo' : 'inativo' }));
  saveEmployers(list);
  renderEmployerList();
  forceEmployerFields();
}

function deactivateEmployer(id) {
  const list = getEmployers().map(e => e.id===id ? {...e, status:'inativo'} : e);
  saveEmployers(list);
  renderEmployerList();
}

function deleteEmployer(id) {
  if (!confirm('Excluir este empregador?')) return;
  saveEmployers(getEmployers().filter(x => x.id!==id));
  renderEmployerList();
}
