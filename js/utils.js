// ── Constantes globais ──
const MESES_UPPER = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const MESES_TITLE = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_ABREV  = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'];
const _hCache     = {};

// ── CPF mask ──
function maskCPF(e) {
  let v = e.target.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/,'$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/,'$1.$2');
  e.target.value = v;
}

// ── Feriados nacionais (Brasília) ──
// Carnaval e Páscoa = ponto facultativo, não feriado
function easterDate(y) {
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,
        f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
        h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,
        l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
        mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;
  return new Date(y,mo-1,dy);
}

function holidaysForYear(y) {
  if (_hCache[y]) return _hCache[y];
  const easter = easterDate(y);
  const ad  = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
  const fmt = d => d.toISOString().slice(0,10);
  _hCache[y] = new Set([
    `${y}-01-01`,`${y}-04-21`,`${y}-05-01`,`${y}-09-07`,
    `${y}-10-12`,`${y}-11-02`,`${y}-11-15`,`${y}-11-20`,`${y}-12-25`,
    fmt(ad(easter,-2)),   // Sexta-feira Santa
    fmt(ad(easter,60)),   // Corpus Christi
  ]);
  return _hCache[y];
}

function isHoliday(date) { return holidaysForYear(date.getFullYear()).has(date.toISOString().slice(0,10)); }
function isWeekday(date)  { const d=date.getDay(); return d!==0&&d!==6; }

function countWorkingDays(year, month) {
  const days = new Date(year, month, 0).getDate();
  let n = 0;
  for (let d=1; d<=days; d++) {
    const dt = new Date(year, month-1, d);
    if (isWeekday(dt) && !isHoliday(dt)) n++;
  }
  return n;
}

// ── Valor por extenso (PT-BR) ──
function valorPorExtenso(valor) {
  if (isNaN(valor)||valor<0) return '';
  const reais=Math.floor(valor), cents=Math.round((valor-reais)*100);
  const un  = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const dz  = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const ct  = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
  const grp = n => {
    if (!n) return '';
    const c=Math.floor(n/100),r=n%100,d=Math.floor(r/10),u=r%10;
    let s='';
    if (c) s=(r===0)?ct[c]:(c===1?'cento':ct[c]);
    if (r) { if(s) s+=' e '; s+=r<20?un[r]:(dz[d]+(u?' e '+un[u]:'')); }
    return s;
  };
  const mil=Math.floor(reais/1000),rem=reais%1000;
  const partes=[];
  if (mil) partes.push(mil===1?'mil':grp(mil)+' mil');
  if (rem) partes.push(grp(rem));
  let res='';
  if (reais) res=(partes.join(' e '))+(reais===1?' real':' reais');
  if (cents) { if(res) res+=' e '; res+=grp(cents)+(cents===1?' centavo':' centavos'); }
  return res||'zero reais';
}

// ── Build month rows para tabela ──
function buildMonthData(year, month) {
  const days=new Date(year,month,0).getDate(), rows=[];
  for (let d=1;d<=days;d++) {
    const dt=new Date(year,month-1,d), dow=dt.getDay();
    let tipo='normal';
    if (dow===6) tipo='sabado';
    else if (dow===0) tipo='domingo';
    else if (isHoliday(dt)) tipo='feriado';
    rows.push({day:d, diaSemana:DIAS_ABREV[dow], tipo});
  }
  return rows;
}
