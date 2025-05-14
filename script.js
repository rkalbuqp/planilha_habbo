const form = document.getElementById("formPague");
const nickIn = document.getElementById("nick");
const valorIn = document.getElementById("valor");
const tbody = document.querySelector("#tabelaJogadores tbody");
const totalPagueEl = document.getElementById("totalPague");
const totalTaxaEl = document.getElementById("totalTaxa");
const totalGeralEl = document.getElementById("totalGeral");
const shareOpEl = document.getElementById("shareOperador");
const poolLiqEl = document.getElementById("poolLiquido");
const btnDownload = document.getElementById("btnDownload");
const btnLimpar = document.getElementById("btnLimpar");

const formRaros = document.getElementById("formRaros");
const nickRaroIn = document.getElementById("nickRaro");
const nomeRaroIn = document.getElementById("nomeRaro");
const tbodyRaros = document.querySelector("#tabelaRaros tbody");

let jogadores = [];
let raros = [];

function carregar() {
  const j = localStorage.getItem("jogadores");
  const r = localStorage.getItem("raros");
  if (j) jogadores = JSON.parse(j);
  if (r) raros = JSON.parse(r);
  atualizarUI();
  atualizarRaros();
  atualizarSelectNicks();
}

function salvar() {
  localStorage.setItem("jogadores", JSON.stringify(jogadores));
}

function salvarRaros() {
  localStorage.setItem("raros", JSON.stringify(raros));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nick = nickIn.value.trim();
  const valor = parseFloat(valorIn.value);
  if (!nick || isNaN(valor) || valor < 0) return;
  const idx = jogadores.findIndex((j) => j.nick === nick);
  if (idx > -1) {
    jogadores[idx].pague += valor;
  } else {
    jogadores.push({ nick, pague: valor, status: "ativo" });
  }
  salvar();
  atualizarUI();
  atualizarSelectNicks();
  form.reset();
});

function atualizarUI() {
  tbody.innerHTML = "";
  let somaPague = 0,
    somaTaxa = 0;

  jogadores.forEach((j, i) => {
    const taxa = j.pague * 0.1;
    const total = j.pague + taxa;
    somaPague += j.pague;
    somaTaxa += taxa;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${j.nick}</td>
      <td>${j.pague.toFixed(2)}</td>
      <td>${taxa.toFixed(2)}</td>
      <td>${total.toFixed(2)}</td>
      <td>${j.status}</td>
      <td>
        <button class="edit" data-index="${i}">Editar</button>
        <button class="status" data-index="${i}">Alterar Status</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  totalPagueEl.textContent = somaPague.toFixed(2);
  totalTaxaEl.textContent = somaTaxa.toFixed(2);
  totalGeralEl.textContent = (somaPague + somaTaxa).toFixed(2);
  shareOpEl.textContent = ((somaPague + somaTaxa) * 0.3).toFixed(2);
  poolLiqEl.textContent = ((somaPague + somaTaxa) * 0.7).toFixed(2);

  document.querySelectorAll("button.edit").forEach((btn) => {
    btn.onclick = () => {
      const i = +btn.dataset.index;
      const extra = parseFloat(prompt("Adicionar quanto a mais?", "0"));
      if (!isNaN(extra) && extra >= 0) {
        jogadores[i].pague += extra;
        salvar();
        atualizarUI();
      }
    };
  });

  document.querySelectorAll("button.status").forEach((btn) => {
    btn.onclick = () => {
      const i = +btn.dataset.index;
      jogadores[i].status =
        jogadores[i].status === "ativo" ? "eliminado" : "ativo";
      salvar();
      atualizarUI();
    };
  });
  const valorEntradaEl = document.getElementById("valorEntrada");
  valorEntradaEl.textContent = (somaPague * 2).toFixed(2);
}

formRaros.addEventListener("submit", (e) => {
  e.preventDefault();
  const nick = nickRaroIn.value;
  const raro = nomeRaroIn.value.trim();
  if (!nick || !raro) return;
  raros.push({ nick, raro });
  salvarRaros();
  atualizarRaros();
  formRaros.reset();
});

function atualizarRaros() {
  tbodyRaros.innerHTML = "";
  raros.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.nick}</td><td>${r.raro}</td>`;
    tbodyRaros.appendChild(tr);
  });
}

function atualizarSelectNicks() {
  nickRaroIn.innerHTML = jogadores
    .map((j) => `<option value="${j.nick}">${j.nick}</option>`)
    .join("");
}

btnDownload.addEventListener("click", () => window.print());

btnLimpar.addEventListener("click", () => {
  if (confirm("Deseja limpar todos os dados?")) {
    jogadores = [];
    raros = [];
    salvar();
    salvarRaros();
    atualizarUI();
    atualizarRaros();
    atualizarSelectNicks();
  }
});

carregar();
