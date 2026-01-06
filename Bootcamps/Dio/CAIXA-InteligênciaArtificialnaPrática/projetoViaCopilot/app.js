// Banco de dados simples via localStorage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let goal = JSON.parse(localStorage.getItem("goal")) || null;

// Função para enviar mensagem
function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  processMessage(text);
  input.value = "";
}

// Adiciona mensagem ao chat
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + sender;
  msgDiv.textContent = (sender === "user" ? "Você: " : "Agente: ") + text;
  document.getElementById("messages").appendChild(msgDiv);
}

// Processa entrada do usuário
function processMessage(text) {
  // Regex simples para extrair valor e categoria
  const valorRegex = /R\$ ?(\d+)/i;
  const categoriaRegex = /(mercado|transporte|aluguel|internet|lazer|saúde)/i;

  const valorMatch = text.match(valorRegex);
  const categoriaMatch = text.match(categoriaRegex);

  if (valorMatch) {
    const valor = parseFloat(valorMatch[1]);
    const categoria = categoriaMatch ? categoriaMatch[1] : "Outros";

    const transacao = { valor, categoria, data: new Date().toLocaleDateString() };
    transactions.push(transacao);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    addMessage(`Registrado: R$${valor} em ${categoria}.`, "bot");
    updateReports();
  } else {
    addMessage("Não entendi. Tente: 'Gastei R$ 50 no transporte'.", "bot");
  }
}

// Definir meta
function setGoal() {
  const input = document.getElementById("goalInput").value;
  const valorRegex = /R\$ ?(\d+)/i;
  const valorMatch = input.match(valorRegex);

  if (valorMatch) {
    goal = { valor: parseFloat(valorMatch[1]), acumulado: 0 };
    localStorage.setItem("goal", JSON.stringify(goal));
    addMessage(`Meta definida: economizar R$${goal.valor}.`, "bot");
    updateGoal();
  }
}

// Atualizar meta
function updateGoal() {
  if (!goal) return;
  const totalGastos = transactions.reduce((sum, t) => sum + t.valor, 0);
  goal.acumulado = Math.max(0, goal.valor - totalGastos);

  const progressDiv = document.getElementById("goalProgress");
  progressDiv.textContent = `Falta economizar R$${goal.acumulado} de R$${goal.valor}`;
}

// Relatórios simples
function updateReports() {
  const ctx = document.getElementById("reportChart").getContext("2d");
  const categorias = {};
  transactions.forEach(t => {
    categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
  });

  const labels = Object.keys(categorias);
  const data = Object.values(categorias);

  // Gráfico simples
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Gastos por categoria",
        data,
        backgroundColor: "#4CAF50"
      }]
    }
  });

  updateGoal();
}

// Inicialização
window.onload = () => {
  updateReports();
  updateGoal();
};
