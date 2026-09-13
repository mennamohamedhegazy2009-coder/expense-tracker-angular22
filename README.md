# 💰 Expense Tracker — Angular 22

A modern and responsive **Expense Tracker** built with Angular 22 for managing and analyzing daily expenses.

## ✨ Features

* Add, edit, and delete expenses
* Reactive Forms with validation
* Category filtering
* Search by expense note
* Sort by date or amount
* Running total for visible expenses
* Currency formatting
* Custom `categoryIcon` Pipe
* Custom `appHighlightOverBudget` Directive
* Adjustable over-budget threshold
* Pagination
* Spending statistics and insights
* Loading and error handling
* AI Financial Assistant
* REST API using `json-server`

## 🤖 AI Assistant

The application includes a reusable AI chatbot connected to an **n8n Webhook** and AI Agent.

The chatbot can answer questions about:

* Total spending
* Spending by category
* Largest and smallest expenses
* Recent expenses
* Number of expenses
* Average spending
* Spending within a date range

The AI receives the current expense data and must answer only from the provided data.

## 🛠️ Technologies

* Angular 22
* TypeScript
* PrimeNG 22
* PrimeIcons
* PrimeFlex
* Reactive Forms
* RxJS
* json-server
* n8n + AI Agent

## 📁 Project Structure

```text
src/app/
├── models/
│   └── expense.model.ts
│
├── services/
│   ├── expense.service.ts
│   └── ai-chatbot.service.ts
│
├── pipes/
│   └── category-icon.pipe.ts
│
├── directives/
│   └── highlight-over-budget.directive.ts
│
└── components/
    ├── expense-form/
    │   └── expense-form.component.ts
    │
    ├── expense-list/
    │   └── expense-list.component.ts
    │
    └── chatbot/
        └── ai-chat.component.ts
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start json-server

```bash
npm run api
```

API:

```text
http://localhost:3000/expenses
```

### 3. Start Angular

Open another terminal:

```bash
npm start
```

Application:

```text
http://localhost:4200
```

## 🤖 AI Configuration

The n8n Webhook URL is configured in:

```text
src/environments/environment.ts
```

For example:

```ts
export const environment = {
  production: false,
  aiWebhookUrl: 'YOUR_N8N_WEBHOOK_URL'
};
```

## 🏗️ Production Build

```bash
npm run build
```

Build output:

```text
dist/expense-tracker
```

## 📦 Important

Do not upload these folders to GitHub:

```text
node_modules/
dist/
.angular/
```

The project includes:

```text
db.json
package.json
package-lock.json
```

so the application can be installed and run easily.

## 👩‍💻 Author

**Dalia Mohamed**

