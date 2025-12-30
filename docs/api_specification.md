# SmartFarm AI - API Specification

This document provides a complete reference for all exposed API endpoints in the SmartFarm AI backend.

**Base URL:** `/api`

---

## 🔐 1. Authentication & Security (`/auth`)

These endpoints handle user authentication, MFA, and invitation flows.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/auth/login` | Authenticate user with email/password. | Public |
| `POST` | `/auth/verify-2fa` | Verify TOTP code for 2FA login. | Public (after 1st factor) |
| `POST` | `/auth/signup` | Register new user via invitation. | Public |
| `POST` | `/auth/refresh` | Refresh access token. | Public |
| `GET` | `/auth/me` | Get current authenticated user profile. | Authenticated |
| `PUT` | `/auth/me` | Update current user profile. | Authenticated |
| `POST` | `/auth/change-password` | Change user password. | Authenticated |
| `POST` | `/auth/2fa/setup` | Initiate 2FA setup (get secret/QR). | Authenticated |
| `POST` | `/auth/2fa/confirm` | Confirm and enable 2FA. | Authenticated |

### Invitation Management (`/auth/invitations`)

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/auth/invitations` | Create new invitation. | `ADMIN`, `OWNER` |
| `GET` | `/auth/invitations` | List all invitations. | `ADMIN`, `OWNER` |
| `DELETE` | `/auth/invitations/{id}` | Revoke an invitation. | `ADMIN`, `OWNER` |
| `GET` | `/auth/invitations/validate/{code}` | Validate an invitation code. | Public |

**Request Body (Create Invitation):**
```json
{
  "email": "user@example.com",
  "role": "ROLE_STAFF"
}
```

---

## 👥 2. User Management (`/users`)

Manage system users and their roles.

**Access:** `OWNER`, `ADMIN` (Class-level security)

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `GET` | `/users` | List all system users. | `OWNER`, `ADMIN` |
| `PUT` | `/users/{id}/roles` | Update user roles. | `OWNER`, `ADMIN` |
| `PUT` | `/users/{id}/status` | Toggle user active status (enable/disable). | `OWNER`, `ADMIN` |

---

## 🛍️ 3. Sales Management (`/sales`)

Handle sales transactions and history.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/sales` | Create a new sale. | Authenticated |
| `GET` | `/sales/history` | Get sales history list. | Authenticated |

**Request Body (Create Sale):**
```json
{
  "customerId": "UUID",
  "items": [
    { "productId": "UUID", "quantity": 10, "unitPrice": 100.00 }
  ],
  "payment": { "amount": 500.00, "method": "CASH" }
}
```

---

## 📦 4. Inventory Management (`/inventory`)

Manage stock levels and adjustments.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/inventory/adjust` | Adjust stock level manually. | Authenticated |
| `GET` | `/inventory/adjustments/{productId}` | Get adjustment history for a product. | Authenticated |

**Request Body (Adjust Stock):**
```json
{
  "productId": "UUID",
  "adjustmentQuantity": 5,
  "type": "DAMAGE",
  "reason": "Broken during transport" // Optional
}
```

---

## 🚜 5. Purchases (`/purchases`)

Track inventory purchases from suppliers.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/purchases` | Record a new purchase. | Authenticated |
| `GET` | `/purchases/history` | Get purchase history. | Authenticated |

**Request Body (Create Purchase):**
```json
{
  "productId": "UUID",
  "supplierName": "Feed Co.",
  "quantity": 50,
  "totalCost": 2500.00
}
```

---

## 💰 6. Finance & Reporting (`/finance`)

Financial reporting and transaction ledgers.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `GET` | `/finance/report` | Get profit/loss summary report. | Authenticated |
| `GET` | `/finance/transactions` | Get detailed transaction report with filters. | Authenticated |
| `GET` | `/finance/ledger` | Get unified ledger (sales + payments + purchases) with filters. | Authenticated |

**Query Parameters (for transactions & ledger):**
- `customerId` (UUID, optional)
- `fromDate` (DateTime ISO, optional)
- `toDate` (DateTime ISO, optional)
- `paymentStatus` (String, optional)

---

## 📊 7. Dashboard (`/dashboard`)

Aggregated statistics for the main dashboard.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `GET` | `/dashboard/stats` | Key performance indicators (KPIs). | Authenticated |
| `GET` | `/dashboard/revenue-expense` | Revenue vs Expense trends. | Authenticated |
| `GET` | `/dashboard/stock-distribution` | Stock value by category. | Authenticated |
| `GET` | `/dashboard/top-credits` | Top 5 customers with credit debt. | Authenticated |
| `GET` | `/dashboard/alerts/low-stock` | Low stock alerts. | Authenticated |
| `GET` | `/dashboard/alerts/aging-credit` | Critical debt alerts. | Authenticated |
| `GET` | `/dashboard/stock-movement` | Recent stock changes. | Authenticated |
| `GET` | `/dashboard/ai-insights` | AI-generated business insights. | Authenticated |

---

## 🏷️ 8. Products (`/products`)

Manage product catalog.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `GET` | `/products` | List all products. | Authenticated |
| `POST` | `/products` | Create a new product. | Authenticated |

---

## 🧑‍🌾 9. Customers (`/customers`)

Manage customer database.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `GET` | `/customers` | List all customers. | Authenticated |
| `POST` | `/customers` | Create a new customer. | `OWNER`, `MANAGER` |
| `GET` | `/customers/{id}/profit` | Get profit analysis for specific customer. | Authenticated |

---

## 👁️ 10. AI Vision & Staging (`/staging` & `/vision`)

Bill scanning and staging workflow.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/staging/upload` | Upload bill image for analysis & staging (Pending). | Authenticated |
| `GET` | `/staging/pending` | Get list of pending staged bills. | Authenticated |
| `POST` | `/vision/extract` | Direct extraction API (returns JSON without staging). | Authenticated |

**Parameters:**
- `image`: `MultipartFile`

---

## 🤖 11. AI Assistant (`/assistant`)

RAG-based chat assistant.

| Method | Path | Description | Access |
|:-------|:-----|:------------|:-------|
| `POST` | `/assistant/chat` | Send message to AI assistant. | Authenticated |
| `POST` | `/assistant/upload` | Ingest document for RAG context. | Authenticated |

**Request Body (Chat):**
```json
{
  "message": "How much feed do we have left?"
}
```
