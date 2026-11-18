const API_URL = "https://hipopay.onrender.com";
let currentUserRole = "";

window.onload = async () => {
    await checkApiHealth();
    const token = localStorage.getItem("hipopay_token");
    if (token) {
        showApp();
        loadPayments();
    }
};

async function checkApiHealth() {
    const statusBox = document.getElementById('api-status');
    try {
        statusBox.textContent = "Acordando o servidor no Render (pode demorar alguns segundos)...";
        await fetch(`${API_URL}/api/payment`, { method: 'HEAD' });
        statusBox.className = "alert alert-success";
        statusBox.textContent = "API online e pronta!";
        setTimeout(() => statusBox.classList.add('hidden'), 3000);
    } catch (err) {
        statusBox.className = "alert alert-warning";
        statusBox.textContent = "Servidor iniciando no Render. A primeira requisição pode demorar até 50 segundos.";
    }
}

function fillDemoCredentials(user, pass) {
    document.getElementById('username').value = user;
    document.getElementById('password').value = pass;
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('auth-alert');
    alertBox.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error("Usuário ou senha inválidos.");

        const data = await response.json();
        localStorage.setItem("hipopay_token", data.token);
        localStorage.setItem("hipopay_user", username);

        showApp();
        loadPayments();
    } catch (err) {
        alertBox.textContent = err.message;
        alertBox.classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem("hipopay_token");
    localStorage.removeItem("hipopay_user");
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}

function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');

    const savedUser = localStorage.getItem("hipopay_user") || "Usuário";
    document.getElementById('display-username').textContent = savedUser;

    const token = localStorage.getItem("hipopay_token");
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        currentUserRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || "Usuário";
        document.getElementById('user-role-badge').textContent = currentUserRole;
    } catch (e) {
        currentUserRole = "Usuário";
    }
}

function formatBRL(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function loadPayments() {
    const token = localStorage.getItem("hipopay_token");
    const feed = document.getElementById('transactions-feed');
    const isAdmin = currentUserRole === 'Admin';

    try {
        const response = await fetch(`${API_URL}/api/payment`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar extrato.");

        const payments = await response.json();
        feed.innerHTML = "";

        const total = payments.reduce((acc, item) => acc + Number(item.amount || 0), 0);
        document.getElementById('total-volume').textContent = formatBRL(total);

        if (payments.length === 0) {
            feed.innerHTML = `<p class="empty-state">Nenhuma transferência realizada ainda.</p>`;
            return;
        }

        payments.slice().reverse().forEach(p => {
            const item = document.createElement('div');
            item.className = 'tx-item';

            const deleteBtn = isAdmin
                ? `<button class="btn-delete-tx" onclick="deletePayment(${p.id})" title="Estornar/Excluir">Estornar</button>`
                : '';

            item.innerHTML = `
                <div class="tx-left">
                    <div class="tx-icon">↗</div>
                    <div class="tx-details">
                        <span class="tx-parties">${escapeHtml(p.sender || 'Origem')} → ${escapeHtml(p.receiver || 'Destino')}</span>
                        <span class="tx-desc">#${p.id} • ${escapeHtml(p.description || 'Transferência HipoPay')}</span>
                    </div>
                </div>
                <div class="tx-right">
                    <span class="tx-amount">${formatBRL(p.amount)}</span>
                    ${deleteBtn}
                </div>
            `;
            feed.appendChild(item);
        });
    } catch (err) {
        feed.innerHTML = `<p class="empty-state" style="color: var(--danger);">Não foi possível conectar ao servidor.</p>`;
    }
}

async function createPayment(event) {
    event.preventDefault();
    const token = localStorage.getItem("hipopay_token");
    const alertBox = document.getElementById('form-alert');
    alertBox.classList.add('hidden');

    const payload = {
        sender: document.getElementById('sender').value,
        receiver: document.getElementById('receiver').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch(`${API_URL}/api/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Não foi possível concluir a transferência. Verifique os campos.");
        }

        document.getElementById('payment-form').reset();
        alertBox.className = "alert alert-success";
        alertBox.textContent = "Transferência enviada com sucesso!";
        alertBox.classList.remove('hidden');

        loadPayments();
    } catch (err) {
        alertBox.className = "alert alert-error";
        alertBox.textContent = err.message;
        alertBox.classList.remove('hidden');
    }
}

async function deletePayment(id) {
    if (!confirm(`Deseja estornar e remover a transferência #${id}?`)) return;

    const token = localStorage.getItem("hipopay_token");

    try {
        const response = await fetch(`${API_URL}/api/payment/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            alert("Acesso negado (403): Apenas administradores podem estornar transações.");
            return;
        }
        if (!response.ok) {
            throw new Error("Erro ao estornar transferência.");
        }

        loadPayments();
    } catch (err) {
        alert(err.message);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}