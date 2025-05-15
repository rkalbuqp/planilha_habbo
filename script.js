document.addEventListener("DOMContentLoaded", () => {
  // Input para o operador
  const operadorInput = document.getElementById("operador");

  const formPague = document.getElementById("formPague");
  const tipoPagamento = document.getElementById("tipoPagamento");
  const nomeItem = document.getElementById("nomeItem");
  const nomeRaro = document.getElementById("nomeRaro");
  const tabelaJogadores = document
    .getElementById("tabelaJogadores")
    .querySelector("tbody");

  const formRaros = document.getElementById("formRaros");
  const tabelaRaros = document
    .getElementById("tabelaRaros")
    .querySelector("tbody");

  const btnLimpar = document.getElementById("btnLimpar");

  let jogadores = [];
  let raros = [];
  let operador = "";

  // Carrega dados do localStorage
  function carregar() {
    const j = localStorage.getItem("jogadores");
    const r = localStorage.getItem("raros");
    const op = localStorage.getItem("operador");

    jogadores = j ? JSON.parse(j) : [];
    raros = r ? JSON.parse(r) : [];
    operador = op || "";

    if (operadorInput) operadorInput.value = operador;
    atualizarTabela();
    atualizarRaros();
  }

  // Salva dados no localStorage
  function salvar() {
    localStorage.setItem("jogadores", JSON.stringify(jogadores));
  }
  function salvarRaros() {
    localStorage.setItem("raros", JSON.stringify(raros));
  }
  function salvarOperador() {
    operador = operadorInput.value.trim();
    localStorage.setItem("operador", operador);
  }

  // Evento para salvar operador ao perder o foco
  if (operadorInput) {
    operadorInput.addEventListener("blur", salvarOperador);
  }

  // Evento para download (impressão)
  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      window.print();
    });
  }

  tipoPagamento.addEventListener("change", () => {
    nomeItem.style.display =
      tipoPagamento.value === "mobi" ? "inline-block" : "none";
    nomeRaro.style.display =
      tipoPagamento.value === "moeda" ? "inline-block" : "none";
  });

  // Adiciona/Atualiza pagamento
  formPague.addEventListener("submit", (e) => {
    e.preventDefault();
    const nick = document.getElementById("nick").value.trim();
    const valor = parseInt(document.getElementById("valor").value, 10);
    const tipo = tipoPagamento.value;
    const item = tipo === "mobi" ? nomeItem.value.trim() : "moeda";
    const itemRaro = tipo === "moeda" ? nomeRaro.value.trim() : "";

    if (!nick || isNaN(valor) || valor <= 0) {
      alert("Preencha os campos corretamente.");
      return;
    }

    const novoPagamento = { item, valor, itemRaro };
    const jogador = jogadores.find(
      (j) => j.nick.toLowerCase() === nick.toLowerCase()
    );
    if (jogador) {
      jogador.pagamentos.push(novoPagamento);
    } else {
      jogadores.push({ nick, pagamentos: [novoPagamento], status: "Jogando" });
    }

    salvar();
    atualizarTabela();
    formPague.reset();
    nomeItem.style.display = nomeRaro.style.display = "none";
  });

  // Adiciona raro
  formRaros.addEventListener("submit", (e) => {
    e.preventDefault();
    const nickRaro = document.getElementById("nickRaro").value.trim();
    const nomeRaroVal = document.getElementById("nomeRaro").value.trim();

    if (!nickRaro || !nomeRaroVal) {
      alert("Preencha os dois campos corretamente.");
      return;
    }

    raros.push({ nick: nickRaro, raro: nomeRaroVal });
    salvarRaros();
    atualizarRaros();
    formRaros.reset();
  });

  // Limpa tudo
  btnLimpar.addEventListener("click", () => {
    if (confirm("Deseja limpar todos os dados?")) {
      jogadores = [];
      raros = [];
      operador = "";
      localStorage.removeItem("jogadores");
      localStorage.removeItem("raros");
      localStorage.removeItem("operador");
      if (operadorInput) operadorInput.value = "";
      atualizarTabela();
      atualizarRaros();
    }
  });

  // Remove jogador
  window.removerJogador = (nick) => {
    jogadores = jogadores.filter(
      (j) => j.nick.toLowerCase() !== nick.toLowerCase()
    );
    salvar();
    atualizarTabela();
  };

  // Editar jogador (adiciona novo pagamento)
  window.editarJogador = (nick) => {
    const jogador = jogadores.find(
      (j) => j.nick.toLowerCase() === nick.toLowerCase()
    );
    if (!jogador) return;
    const tipo = prompt('O pagamento é "moeda" ou "mobi"?').toLowerCase();
    if (tipo !== "moeda" && tipo !== "mobi") {
      alert('Tipo inválido. Use "moeda" ou "mobi".');
      return;
    }
    let item = "moeda",
      itemRaro = "";
    if (tipo === "mobi") {
      item = prompt("Nome do item mobi:").trim();
      if (!item) {
        alert("Item inválido.");
        return;
      }
    } else {
      itemRaro = prompt("Digite o nome do item raro (se houver):").trim();
    }
    const valor = parseInt(prompt("Novo valor (somente número inteiro):"), 10);
    if (isNaN(valor) || valor <= 0) {
      alert("Valor inválido.");
      return;
    }
    jogador.pagamentos.push({ item, valor, itemRaro });
    salvar();
    atualizarTabela();
  };

  // Altera status
  window.alterarStatus = (nick) => {
    const jogador = jogadores.find(
      (j) => j.nick.toLowerCase() === nick.toLowerCase()
    );
    if (!jogador) return;
    jogador.status = jogador.status === "Jogando" ? "Eliminado" : "Jogando";
    salvar();
    atualizarTabela();
  };

  // Atualiza tabela de jogadores
  function atualizarTabela() {
    tabelaJogadores.innerHTML = "";
    let totalPague = 0,
      totalTaxa = 10,
      totalGeral = 0;
    jogadores.forEach((jogador) => {
      const itens = jogador.pagamentos.map((p) => p.item).join(", ");
      const itensRaros = jogador.pagamentos
        .filter((p) => p.itemRaro)
        .map((p) => p.itemRaro)
        .join(", ");
      const valores = jogador.pagamentos.map((p) => `${p.valor}c`).join(", ");
      const valorTotal = jogador.pagamentos.reduce((s, p) => s + p.valor, 0);
      const taxa = Math.floor(valorTotal * 0.1);
      const total = valorTotal + taxa;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${jogador.nick}</td>
        <td>${itens}${itensRaros ? ` (Raros: ${itensRaros})` : ""}</td>
        <td>${valores}</td>
        <td>${valorTotal}c</td>
        <td>${taxa}c</td>
        <td>${total}c</td>
        <td>${jogador.status}</td>
        <td>
          <button onclick="editarJogador('${jogador.nick}')">Editar</button>
          <button onclick="alterarStatus('${
            jogador.nick
          }')">Alterar Status</button>
          <button onclick="removerJogador('${jogador.nick}')">Remover</button>
        </td>`;
      tabelaJogadores.appendChild(tr);
      totalPague += valorTotal;
      totalTaxa += taxa;
      totalGeral += total;
    });
    document.getElementById("totalPague").textContent = totalPague;
    document.getElementById("totalTaxa").textContent = totalTaxa;
    document.getElementById("totalGeral").textContent = totalGeral;
    const valorEntrada = Math.floor(totalTaxa * 2);
    document.getElementById("valorEntrada").textContent = valorEntrada;
  }

  // Atualiza tabela de raros
  function atualizarRaros() {
    tabelaRaros.innerHTML = "";
    raros.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.nick}</td><td>${r.raro}</td>`;
      tabelaRaros.appendChild(tr);
    });
  }

  carregar();
});
