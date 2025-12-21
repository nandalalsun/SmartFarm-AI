# 📖 FarmSmart AI: Project Wiki

## 1. Project Overview
**FarmSmart AI** is an intelligent ERP and Billing solution designed for poultry farm management. It handles complex sales cycles (cash/credit), inventory tracking, and financial health monitoring using local-first AI to ensure data privacy and offline resilience.

### Key Capabilities
*   **Vision-to-Bill:** Snap a photo of a sales slip; AI extracts items, quantities, and totals.
*   **Smart Business Ask (RAG):** Natural language queries for business insights (e.g., "Predict sales based on last month").
*   **Credit Management:** Automated ledger for customer debts and payment history.
*   **Self-Hosted AI:** No paid APIs; Llama 3/Mistral hosted on private AWS infrastructure.

---

## 2. Technical Stack
*   **Frontend:** React.js (PWA) with Tailwind CSS.
*   **Backend:** Java 21 with Spring Boot 3.x.
*   **AI Integration:** LangChain4j + Ollama (running Llama 3.2 Vision & Llama 3 8B).
*   **Database:** PostgreSQL with **pgvector** extension.
*   **Infrastructure:** AWS (Amplify for UI, EC2 G4dn for LLM, RDS for Data).

---

## 3. Entity Relationship Diagram (ERD)
This diagram defines how your farm data is structured.

```mermaid
erDiagram
    CUSTOMER ||--o{ SALE : "places"
    CUSTOMER ||--o{ CREDIT_LEDGER : "has history of"
    CUSTOMER ||--o{ PAYMENT_TRANSACTION : "makes"
    
    PRODUCT ||--o{ SALE_ITEM : "included in"
    PRODUCT ||--o{ PURCHASE : "restocked by"
    
    SALE ||--|{ SALE_ITEM : "contains"
    SALE ||--o{ PAYMENT_TRANSACTION : "paid via"
    SALE ||--o| CREDIT_LEDGER : "generates debt"
    SALE ||--o| BILL_IMAGE : "documented by"
    
    CUSTOMER {
        uuid id PK
        string name
        string phone
        string address
        string email
        string customer_type "FARMER / BUTCHER / RETAIL"
        decimal credit_limit "Max credit allowed"
        decimal current_total_balance
        timestamp registered_at
    }

    PRODUCT {
        uuid id PK
        string name
        string category "FEED / MEDICINE / LIVE_CHICK / MEAT / EGGS"
        decimal cost_price "What you paid"
        decimal selling_price "Standard price"
        string unit "KG / BAG / TRAY / PIECE"
        int current_stock
    }

    SALE {
        uuid id PK
        uuid customer_id FK
        decimal total_bill_amount
        decimal initial_paid_amount
        decimal remaining_balance
        string payment_status "FULLY_PAID / PARTIAL / UNPAID"
        string sale_channel "POS / WHATSAPP / FIELD"
        timestamp created_at
    }

    SALE_ITEM {
        uuid id PK
        uuid sale_id FK
        uuid product_id FK
        int quantity
        decimal unit_price "Price at time of sale"
        decimal line_total
    }

    PAYMENT_TRANSACTION {
        uuid id PK
        uuid sale_id FK
        uuid customer_id FK
        decimal amount_paid
        string payment_method "CASH / CHECK / TRANSFER"
        timestamp payment_date
    }

    CREDIT_LEDGER {
        uuid id PK
        uuid customer_id FK
        uuid sale_id FK
        decimal original_debt
        decimal current_balance
        timestamp due_date
        string status "ACTIVE / CLEARED"
        string remarks
    }

    PURCHASE {
        uuid id PK
        uuid product_id FK
        string supplier_name
        int quantity
        decimal total_cost
        timestamp purchase_date
    }

    BILL_IMAGE {
        uuid id PK
        uuid sale_id FK
        string s3_url
        json extracted_json "AI output stored here"
        timestamp uploaded_at
    }
```

---

## 4. Infrastructure Diagram
Describes how the app is hosted on AWS.

```mermaid
graph TD
    User((User/Farmer)) -->|HTTPS| Frontend[AWS Amplify - React PWA]
    Frontend -->|API Calls| Backend[AWS EC2/ECS - Spring Boot]
    Backend -->|SQL Queries| DB[(AWS RDS - PostgreSQL + pgvector)]
    Backend -->|Local Inference| AI_Server[AWS EC2 G4dn - Ollama/Llama3]
    AI_Server -->|Vision/OCR| Backend
    Backend -->|Store Images| S3[AWS S3 Bucket]
```

---

## 5. Execution Roadmap
1.  **Phase 1 (Core):** Setup Spring Boot + PostgreSQL. Build basic CRUD for Products and Customers.
2.  **Phase 2 (Finance):** Implement Sale/Purchase logic and Profit/Loss calculation scripts.
3.  **Phase 3 (AI Vision):** Setup Ollama with `llama3.2-vision`. Build the Java service to process images into JSON.
4.  **Phase 4 (RAG):** Implement `pgvector` and LangChain4j to allow "Smart Business Ask" features.
5.  **Phase 5 (Cloud):** Deploy to AWS and configure the PWA for offline mobile use.

---


## 6. Future AI Context Summary
**Copy and paste this paragraph the next time you start a chat with an AI to resume work:**

> "I am building **FarmSmart AI**, a poultry farm billing and ERP app. **Tech Stack:** Java (Spring Boot), React, and PostgreSQL with pgvector. **Hosting:** AWS (Amplify, RDS, EC2 with GPU). **Key Features:** Credit/Cash sales management, inventory tracking, and profit analysis. It uses a **self-hosted LLM (Ollama/Llama 3)** for two main AI features: 
> 1. **RAG/Text-to-SQL** for 'Smart Business Ask' (e.g., forecasting sales, querying credit totals). 
> 2. **Multimodal Vision** for extracting sales details from photos of physical bills. 
> I have the ERD and Infrastructure plan ready. Please help me with the next step of the implementation."