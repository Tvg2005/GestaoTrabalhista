# Gerador de Folha de Ponto — Contexto do Projeto

## Objetivo

Criar um website que permita preencher os dados de empregador e empregado e gerar automaticamente uma **Folha de Ponto** em PDF, fiel ao modelo físico exibido na imagem de referência.

---

## Referência Visual (Imagem Enviada)

A imagem enviada pelo usuário mostra uma **Folha de Ponto** preenchida para o período de **DEZEMBRO/2025**, com as seguintes características:

### Cabeçalho
- **Título**: "Folha de Ponto – Periodo: MÊS/ANO" (centralizado, em negrito)

### Bloco Empregador(a)
- Label: "Empregador(a)" (em negrito, célula de cabeçalho)
- Linha com: **Nome** (ex: Naiara Rizzi Venâncio Vieira) e **CPF** (ex: 818.745.291-91)

### Bloco Empregado(a)
- Label: "Empregado(a)" (em negrito, célula de cabeçalho)
- Linha com: **Nome** (ex: Andressa Silva Alves) e **CPF** (ex: 054.390.771-62)
- **Cargo**: "Empregado doméstico nos serviços gerais" (linha dedicada)
- **Admissão**: data (ex: 01/12/2025)
- **Jornada**: "40 h semanais (segunda a sexta)" — exibida na coluna da direita da linha de admissão
- **Horário de Trabalho**: "08:00 às 17:00" — na coluna da direita
- **Intervalo almoço**: "12:00 às 13:00" — na coluna da direita

### Tabela de Registro de Ponto

A tabela ocupa o restante da página e possui as seguintes **colunas** (da esquerda para direita):

| Coluna              | Descrição                                            |
|---------------------|------------------------------------------------------|
| Dia Mês             | Número do dia (1, 2, 3, ..., 31)                    |
| Dia Semana          | Abreviação do dia (SEG, TER, QUA, QUI, SEX, SAB, DOM)|
| Entrada             | Horário de entrada                                   |
| Início do Intervalo | Horário de início do intervalo de almoço             |
| Fim do Intervalo    | Horário de fim do intervalo de almoço                |
| Saída               | Horário de saída                                     |
| Hora Extra          | Horas extras realizadas                              |
| Assinatura do Empregado(a) | Campo para assinatura (em branco)           |

### Regras de Preenchimento das Linhas

- **Segunda a Sexta (dias úteis)**: Todas as células ficam em branco para preenchimento manual.
- **Sábado**: Todas as células da linha recebem o texto **"SAB"** em negrito.
- **Domingo**: Todas as células da linha recebem o texto **"DOM"** em negrito.
- **Feriado Nacional**: Todas as células da linha recebem o texto **"FERIADO"** em negrito, exceto a coluna "Hora Extra" que recebe **"---"**.

### Exemplo Observado na Imagem (Dezembro/2025)
- Dia 6 (SAB): SAB em todas as colunas
- Dia 7 (DOM): DOM em todas as colunas
- Dia 13 (SAB): SAB em todas as colunas
- Dia 14 (DOM): DOM em todas as colunas
- Dia 20 (SAB): SAB
- Dia 21 (DOM): DOM
- Dia 25 (FER - Natal): FERIADO em Entrada, Início do Intervalo, Fim do Intervalo, Saída, e Assinatura; "---" em Hora Extra
- Dia 27 (SAB): SAB
- Dia 28 (DOM): DOM

---

## Feriados Nacionais Brasileiros Considerados

Lista de feriados nacionais fixos (Brasília):
- 01/01 - Confraternização Universal (Ano Novo)
- 21/04 - Tiradentes
- 01/05 - Dia do Trabalho
- 07/09 - Independência do Brasil
- 12/10 - Nossa Senhora Aparecida
- 02/11 - Finados
- 15/11 - Proclamação da República
- 25/12 - Natal

Feriados móveis (dependem do ano):
- Carnaval (segunda e terça)
- Sexta-feira Santa (Paixão de Cristo)
- Corpus Christi

---

## Funcionalidades do Website

### Formulário de Entrada
1. **Dados do Empregador**:
   - Nome do Empregador
   - CPF do Empregador

2. **Dados do Empregado**:
   - Nome do Empregado
   - CPF do Empregado
   - Cargo
   - Data de Admissão
   - Jornada de Trabalho (ex: "40 h semanais (segunda a sexta)")
   - Horário de Trabalho (início e fim, ex: "08:00 às 17:00")
   - Intervalo de Almoço (início e fim, ex: "12:00 às 13:00")

3. **Período de Geração**:
   - Mês e Ano inicial
   - Mês e Ano final

### Geração do PDF
- Um arquivo PDF é gerado ao clicar em "Gerar Folha de Ponto"
- O PDF contém uma página por mês no período selecionado
- Cada página replica fielmente o layout da imagem de referência
- Feriados nacionais são preenchidos automaticamente
- Sábados e domingos são preenchidos automaticamente
- O PDF é disponibilizado para download

---

## Estrutura de Arquivos

```
GeradorFolhaPonto/
├── context.md          # Este arquivo — documentação e rastreabilidade do projeto
├── index.html          # Página principal com abas: Folha de Ponto + Recibo Vale-Transporte
```

---

## Tecnologias Utilizadas

- **HTML5 + CSS3**: Formulário e layout visual (dark theme com glassmorphism)
- **JavaScript**: Lógica de data, feriados, cálculos e geração de PDF
- **jsPDF** (via CDN): Biblioteca para geração de PDF no browser
- **jsPDF-AutoTable** (via CDN): Plugin para renderização de tabelas no PDF

---

## Observações e Decisões de Design

- O Cargo padrão foi definido como "Empregado doméstico nos serviços gerais" (conforme imagem), mas é editável
- A coluna "Hora Extra" em dias de feriado exibe "---" (conforme observado na imagem)
- O título do PDF segue o padrão "Folha de Ponto – Periodo: MÊS/ANO" com o mês em português e maiúsculo
- Abreviações dos dias seguem o padrão da imagem: SEG, TER, QUA, QUI, SEX, SAB, DOM
- Em dias de feriado, a coluna "Dia Semana" exibe o nome real do dia (SEG, TER...) — não "FER"

---

# ABA 2 — RECIBO DE VALE-TRANSPORTE

## Referência Visual (Segunda Imagem Enviada)

A imagem enviada pelo usuário mostra um **Recibo de Entrega de Vale-Transporte** com as seguintes características:

### Layout do Recibo
- **Borda externa**: Caixa retangular delimitando todo o conteúdo
- **Título**: "RECIBO" em negrito, grande, centralizado
- **Subtítulo**: "Entrega Vale-Transporte" centralizado
- **Dados do Empregador**: `Empregador(a)  [nome]`
- **Dados do Empregado**: `Empregado(a)  [nome]`
- **Corpo do texto** (parágrafo justificado):
  > "Recebi o valor de R$ [valor total] ([valor por extenso]) correspondente a [qtd] Vales-transportes, referentes ao mês de [Mês/Ano] pelo que firmo o presente."
- **Local e data**: `Brasília, [data do pagamento]`
- **Linha de assinatura**: linha horizontal centralizada + "Assinatura do Empregado"

### Exemplo da imagem
- Empregador: Naiara Rizzi Venâncio Vieira
- Empregado: Andressa Silva Alves
- Valor: R$ 310,50 (trezentos e dez reais e cinquenta centavos)
- Quantidade: 46 Vales-transportes
- Mês de referência: Outubro/2025
- Data: Brasília, 01/10/2025

---

## Lógica de Cálculo do Vale-Transporte

### Fórmula
```
Dias Úteis = total de dias de seg-sex no mês, excluindo feriados nacionais
Dias Trabalhados = Dias Úteis − Dias de Falta
Quantidade de Vales = Dias Trabalhados × 2
Valor Total = Quantidade de Vales × Valor Unitário do Vale
```

**Justificativa do ×2**: Cada dia trabalhado gera 2 vales (ida e volta).

### Preview ao vivo
- O site calcula e exibe em tempo real:
  - Dias úteis do mês
  - Dias de falta
  - Dias trabalhados
  - Quantidade de vales
  - Valor total
  - Valor por extenso em português (ex: "trezentos e dez reais e cinquenta centavos")

---

## Formulário de Entrada — Vale-Transporte

| Campo | Descrição |
|-------|-----------|
| Nome do Empregador | Nome completo da pessoa contratante |
| Nome do Empregado | Nome completo do trabalhador |
| Valor do Vale-Transporte | Valor unitário de cada vale (R$) |
| Data do Pagamento | Data que aparece após "Brasília," no recibo |
| Mês de Referência | Mês ao qual os vales se referem |
| Ano de Referência | Ano correspondente |
| Dias de Falta | Quantidade de dias que o empregado faltou no mês |

---

## Navegação por Abas

O sistema possui duas abas na interface:
1. **📋 Folha de Ponto** — formulário e geração da folha mensal
2. **🚌 Recibo Vale-Transporte** — formulário e geração do recibo

A troca de abas é feita sem recarregar a página (JavaScript puro).

