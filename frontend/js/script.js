const API_URL = "https://hipopay.onrender.com";
let currentUserRole = "";

window.onload = () => {
    const token = localStorage.getItem("hipopay_token");
    if (token) {
        showApp();
        loadPayments();
    }
};

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

        if (!response.ok) throw new Error("Credenciais inválidas.");

        const data = await response.json();
        localStorage.setItem("hipopay_token", data.token);
        
        showApp();
        loadPayments();
    } catch (err) {
        alertBox.textContent = err.message;
        alertBox.classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem("hipopay_token");
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}

function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');

    const token = localStorage.getItem("hipopay_token");
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        currentUserRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || "Usuário";
        document.getElementById('user-role-badge').textContent = `Perfil: ${currentUserRole}`;

        const thActions = document.getElementById('th-actions');
        if (currentUserRole === 'Visitor' || currentUserRole === 'guest') {
            document.getElementById('admin-form-card').classList.add('hidden');
            document.getElementById('guest-notice').classList.remove('hidden');
            thActions.classList.add('hidden');
        } else {
            document.getElementById('admin-form-card').classList.remove('hidden');
            document.getElementById('guest-notice').classList.add('hidden');
            thActions.classList.remove('hidden');
        }
    } catch(e) {
        console.error("Erro ao ler role do token", e);
    }
}

async function loadPayments() {
    const token = localStorage.getItem("hipopay_token");
    const tbody = document.getElementById('payments-table-body');
    const isAdmin = currentUserRole !== 'Visitor' && currentUserRole !== 'guest';
    const colSpanCount = isAdmin ? 6 : 5;
    
    try {
        const response = await fetch(`${API_URL}/api/payment`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar dados.");

        const payments = await response.json();
        tbody.innerHTML = "";

        if (payments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colSpanCount}" style="text-align: center;">Sem transações cadastradas.</td></tr>`;
            return;
        }

        payments.forEach(p => {
            const tr = document.createElement('tr');
            let rowHtml = `
                <td>${p.id}</td>
                <td>${escapeHtml(p.sender || '-')}</td>
                <td>${escapeHtml(p.receiver || '-')}</td>
                <td>$${Number(p.amount).toFixed(2)}</td>
                <td>${escapeHtml(p.description || '-')}</td>
            `;

            if (isAdmin) {
                rowHtml += `<td><button class="danger" onclick="deletePayment(${p.id})">Excluir</button></td>`;
            }

            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="${colSpanCount}" style="text-align: center; color: var(--error);">Erro ao conectar à API.</td></tr>`;
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

        if (response.status === 403) {
            throw new Error("Acesso negado (403): Contas de visitante não podem criar transações.");
        }
        if (!response.ok) {
            throw new Error("Erro ao criar transação. Verifique os dados.");
        }

        document.getElementById('payment-form').reset();
        alertBox.className = "alert alert-success";
        alertBox.textContent = "Transação cadastrada com sucesso!";
        alertBox.classList.remove('hidden');
        
        loadPayments();
    } catch (err) {
        alertBox.className = "alert alert-error";
        alertBox.textContent = err.message;
        alertBox.classList.remove('hidden');
    }
}

async function deletePayment(id) {
    if (!confirm(`Tem certeza que deseja excluir a transação #${id}?`)) return;

    const token = localStorage.getItem("hipopay_token");

    try {
        const response = await fetch(`${API_URL}/api/payment/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403) {
            alert("Acesso negado (403): Apenas administradores podem excluir transações.");
            return;
        }
        if (!response.ok) {
            throw new Error("Erro ao excluir transação.");
        }

        loadPayments();
    } catch (err) {
        alert(err.message);
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}