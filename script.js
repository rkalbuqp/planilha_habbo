document.addEventListener("DOMContentLoaded", () => {
  const formPague = document.getElementById("formPague");
  const tipoPagamento = document.getElementById("tipoPagamento");
  const nomeItem = document.getElementById("nomeItem");
  const nomeRaro = document.getElementById("nomeRaro"); // Novo campo para item raro
  const tabelaJogadores = document
    .getElementById("tabelaJogadores")
    .querySelector("tbody");

  const totalPagueEl = document.getElementById("totalPague");
  const totalTaxaEl = document.getElementById("totalTaxa");
  const totalGeralEl = document.getElementById("totalGeral");
  const shareOperadorEl = document.getElementById("shareOperador");
  const poolLiquidoEl = document.getElementById("poolLiquido");
  const valorEntradaEl = document.getElementById("valorEntrada");

  const btnLimpar = document.getElementById("btnLimpar");

  let jogadores = [];

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

  tipoPagamento.addEventListener("change", () => {
    nomeItem.style.display =
      tipoPagamento.value === "mobi" ? "inline-block" : "none";
    nomeRaro.style.display =
      tipoPagamento.value === "moeda" ? "inline-block" : "none"; // Exibe campo raro para "moeda"
  });

  formPague.addEventListener("submit", (e) => {
    e.preventDefault();
    const nick = document.getElementById("nick").value.trim();
    const valor = parseInt(document.getElementById("valor").value);
    const tipo = tipoPagamento.value;
    const item = tipo === "mobi" ? nomeItem.value.trim() : "moeda";
    const itemRaro = tipo === "moeda" ? nomeRaro.value.trim() : ""; // Verifica se é um item raro

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

    atualizarTabela();
    formPague.reset();
    nomeItem.style.display = "none";
    nomeRaro.style.display = "none"; // Esconde campo raro após submissão
  });

  btnLimpar.addEventListener("click", () => {
    if (confirm("Deseja limpar todos os dados?")) {
      jogadores = [];
      atualizarTabela();
    }
  });

  window.removerJogador = (nick) => {
    jogadores = jogadores.filter(
      (j) => j.nick.toLowerCase() !== nick.toLowerCase()
    );
    atualizarTabela();
  };

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

    let novoItem = "moeda";
    let novoItemRaro = "";
    if (tipo === "mobi") {
      novoItem = prompt("Nome do item mobi:").trim();
      if (!novoItem) {
        alert("Item inválido.");
        return;
      }
    } else if (tipo === "moeda") {
      novoItemRaro = prompt("Digite o nome do item raro (se houver):").trim();
    }

    const novoValor = parseInt(prompt("Novo valor (somente número inteiro):"));
    if (isNaN(novoValor) || novoValor <= 0) {
      alert("Valor inválido.");
      return;
    }

    jogador.pagamentos.push({
      item: novoItem,
      valor: novoValor,
      itemRaro: novoItemRaro,
    });
    atualizarTabela();
  };

  window.alterarStatus = (nick) => {
    const jogador = jogadores.find(
      (j) => j.nick.toLowerCase() === nick.toLowerCase()
    );
    if (!jogador) return;

    jogador.status = jogador.status === "Jogando" ? "Eliminado" : "Jogando";
    atualizarTabela();
  };

  function atualizarTabela() {
    tabelaJogadores.innerHTML = "";

    let totalPague = 0;
    let totalTaxa = 0;
    let totalGeral = 0;

    jogadores.forEach((jogador) => {
      const tr = document.createElement("tr");

      const itens = jogador.pagamentos.map((p) => p.item).join(", ");
      const valores = jogador.pagamentos.map((p) => `${p.valor}c`).join(", ");
      const itensRaros = jogador.pagamentos
        .filter((p) => p.itemRaro)
        .map((p) => p.itemRaro)
        .join(", ");

      const valorTotal = jogador.pagamentos.reduce((s, p) => s + p.valor, 0);
      const taxa = Math.floor(valorTotal * 0.1);
      const total = valorTotal + taxa;

      tr.innerHTML = `
        <td>${jogador.nick}</td>
        <td>${itens} ${itensRaros ? ` (Raros: ${itensRaros})` : ""}</td>
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
        </td>
      `;

      tabelaJogadores.appendChild(tr);

      totalPague += valorTotal;
      totalTaxa += taxa;
      totalGeral += total;
    });

    const shareOperador = Math.floor(totalGeral * 0.3);
    const poolLiquido = totalGeral - shareOperador;
    const valorEntrada = Math.floor(totalPague * 2);

    totalPagueEl.textContent = totalPague;
    totalTaxaEl.textContent = totalTaxa;
    totalGeralEl.textContent = totalGeral;
    shareOperadorEl.textContent = shareOperador;
    poolLiquidoEl.textContent = poolLiquido;
    valorEntradaEl.textContent = valorEntrada;
  }

  const formRaros = document.getElementById("formRaros");
  const tabelaRaros = document
    .getElementById("tabelaRaros")
    .querySelector("tbody");

  formRaros.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita o recarregamento da página

    const nickRaro = document.getElementById("nickRaro").value.trim();
    const nomeRaro = document.getElementById("nomeRaro").value.trim();

    if (!nickRaro || !nomeRaro) {
      alert("Preencha os dois campos corretamente.");
      return;
    }

    // Cria nova linha na tabela
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nickRaro}</td>
      <td>${nomeRaro}</td>
    `;
    tabelaRaros.appendChild(tr);

    formRaros.reset(); // Limpa os campos após adicionar
  });

  btnDownload.addEventListener("click", () => window.print());
});

carregar();
