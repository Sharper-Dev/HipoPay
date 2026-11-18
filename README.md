# HipoPay

Simulação de uma carteira digital construída para demonstrar arquitetura RESTful e controle de acesso baseado em perfis (RBAC).

* **Frontend:** [sharper.dev.br/HipoPay/](https://sharper.dev.br/HipoPay/)
* **API:** `https://hipopay.onrender.com`

---

## Stack

* **Backend:** C# / ASP.NET Core, Entity Framework Core, SQLite, JWT e Rate Limiting.
* **Frontend:** HTML5, CSS3 e JavaScript Vanilla.

---

## Permissões (RBAC)

| Método | Rota | Acesso |
| :--- | :--- | :--- |
| `GET` | `/api/payment` | Autenticado (`Admin` / `Guest`) |
| `POST` | `/api/payment` | Autenticado (`Admin` / `Guest`) |
| `DELETE` | `/api/payment/{id}` | Apenas `Admin` |

---
