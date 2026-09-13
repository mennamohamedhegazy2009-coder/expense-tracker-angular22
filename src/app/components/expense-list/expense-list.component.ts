import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Expense,
  ExpenseCategory
} from '../../models/expense.model';

import { ExpenseService } from '../../services/expense.service';

import { CategoryIconPipe } from '../../pipes/category-icon.pipe';
import { HighlightOverBudgetDirective } from '../../directives/highlight-over-budget.directive';

import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { AiChatComponent } from '../chatbot/ai-chat.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CategoryIconPipe,
    HighlightOverBudgetDirective,
    ExpenseFormComponent,
    AiChatComponent
  ],
  template: `
    <div class="dashboard-page">

      <header class="dashboard-header">
        <div class="welcome-area">
          <div class="welcome-badge">
            <span></span>
            PERSONAL FINANCE
          </div>
          <h1>
            Good Morning, Dalia
            <span aria-hidden="true">👋</span>
          </h1>
          <p>
            Here's your financial overview.
            Stay on top of your spending and make smarter decisions.
          </p>
        </div>
        <div class="header-right">
          <div class="live-status">
            <span class="status-dot"></span>
            Live overview
          </div>
          <div class="date-badge">
            <i
              class="pi pi-calendar"
              aria-hidden="true">
            </i>
            {{ today | date:'dd MMM yyyy' }}
          </div>
          <button
            type="button"
            class="refresh-button"
            (click)="refreshDashboard()"
            [disabled]="expenseService.isLoading()"
            aria-label="Refresh dashboard">
            <i
              class="pi"
              [class.pi-refresh]="!expenseService.isLoading()"
              [class.pi-spin]="expenseService.isLoading()"
              [class.pi-spinner]="expenseService.isLoading()">
            </i>
          </button>
        </div>
      </header>

      @if (expenseService.isLoading()) {
        <div
          class="notice notice-loading"
          role="status">
          <i
            class="pi pi-spin pi-spinner"
            aria-hidden="true">
          </i>
          Updating your expenses...
        </div>
      }

      @if (expenseService.errorMessage()) {
        <div
          class="notice notice-error"
          role="alert">
          <i
            class="pi pi-exclamation-circle"
            aria-hidden="true">
          </i>
          <span>
            {{ expenseService.errorMessage() }}
          </span>
        </div>
      }

      <section
        class="summary-grid"
        aria-label="Financial summary">
        <article class="summary-card primary-card">
          <div class="card-icon">
            <i
              class="pi pi-wallet"
              aria-hidden="true">
            </i>
          </div>
          <div class="card-content">
            <span>
              TOTAL VISIBLE SPENDING
            </span>
            <strong>
              {{ totalAmount() | currency:'EGP':'symbol':'1.0-0' }}
            </strong>
            <small>
              {{ filteredExpenses().length }} visible records
            </small>
          </div>
          <div class="card-decoration"></div>
        </article>
        <article class="summary-card">
          <div class="card-icon blue-icon">
            <i
              class="pi pi-receipt"
              aria-hidden="true">
            </i>
          </div>
          <div class="card-content">
            <span>
              TRANSACTIONS
            </span>
            <strong>
              {{ expenseService.expenses().length }}
            </strong>
            <small>
              Total expense records
            </small>
          </div>
        </article>
        <article class="summary-card">
          <div class="card-icon orange-icon">
            <i
              class="pi pi-arrow-up"
              aria-hidden="true">
            </i>
          </div>
          <div class="card-content">
            <span>
              HIGHEST EXPENSE
            </span>
            <strong>
              {{ highestExpenseAmount() | currency:'EGP':'symbol':'1.0-0' }}
            </strong>
            <small>
              {{ highestExpenseCategory() }}
            </small>
          </div>
        </article>
        <article class="summary-card">
          <div class="card-icon purple-icon">
            <i
              class="pi pi-chart-pie"
              aria-hidden="true">
            </i>
          </div>
          <div class="card-content">
            <span>
              TOP CATEGORY
            </span>
            <strong>
              {{ topCategoryName() }}
            </strong>
            <small>
              {{ topCategoryAmount() | currency:'EGP':'symbol':'1.0-0' }}
              spent
            </small>
          </div>
        </article>
      </section>

      <section class="mini-metrics">
        <div class="mini-metric">
          <div class="mini-metric-icon green">
            <i
              class="pi pi-calendar"
              aria-hidden="true">
            </i>
          </div>
          <div>
            <span>
              THIS MONTH
            </span>
            <strong>
              {{ currentMonthAmount() | currency:'EGP':'symbol':'1.0-0' }}
            </strong>
          </div>
        </div>
        <div class="mini-metric">
          <div class="mini-metric-icon purple">
            <i
              class="pi pi-calculator"
              aria-hidden="true">
            </i>
          </div>
          <div>
            <span>
              AVERAGE EXPENSE
            </span>
            <strong>
              {{ averageExpense() | currency:'EGP':'symbol':'1.0-0' }}
            </strong>
          </div>
        </div>
        <div class="mini-metric">
          <div class="mini-metric-icon blue">
            <i
              class="pi pi-chart-line"
              aria-hidden="true">
            </i>
          </div>
          <div>
            <span>
              DAILY AVERAGE
            </span>
            <strong>
              {{ dailyAverage() | currency:'EGP':'symbol':'1.0-0' }}
            </strong>
          </div>
        </div>
        <div class="mini-metric">
          <div class="mini-metric-icon orange">
            <i
              class="pi pi-percentage"
              aria-hidden="true">
            </i>
          </div>
          <div>
            <span>
              TOP CATEGORY SHARE
            </span>
            <strong>
              {{ topCategoryPercentage() | number:'1.0-0' }}%
            </strong>
          </div>
        </div>
      </section>

      <section class="analytics-grid">
        <div class="analytics-card trend-card">
          <div class="analytics-header">
            <div>
              <span class="section-kicker">
                SPENDING TREND
              </span>
              <h2>
                Your last 7 active days
              </h2>
            </div>
            <div class="analytics-icon">
              <i
                class="pi pi-chart-line"
                aria-hidden="true">
              </i>
            </div>
          </div>
          <div class="trend-chart">
            @if (spendingTrend().length > 0) {
              @for (
                item of spendingTrend();
                track item.date
              ) {
                <div class="trend-item">
                  <div class="trend-value">
                    {{ item.amount
                      | currency:'EGP':'symbol':'1.0-0' }}
                  </div>
                  <div class="trend-bar-container">
                    <div
                      class="trend-bar"
                      [class.trend-bar-high]="
                        item.amount === maxTrendAmount()
                      "
                      [style.height.%]="
                        getTrendHeight(item.amount)
                      ">
                    </div>
                  </div>
                  <div class="trend-date">
                    {{ parseDateOnly(item.date)
                      | date:'dd MMM' }}
                  </div>
                </div>
              }
            } @else {
              <div class="empty-chart">
                <i
                  class="pi pi-chart-line"
                  aria-hidden="true">
                </i>
                <strong>
                  No spending data yet
                </strong>
                <span>
                  Add expenses to see your trend.
                </span>
              </div>
            }
          </div>
        </div>
        <div class="analytics-card category-card">
          <div class="analytics-header">
            <div>
              <span class="section-kicker">
                CATEGORY BREAKDOWN
              </span>
              <h2>
                Where your money goes
              </h2>
            </div>
            <div class="analytics-icon">
              <i
                class="pi pi-chart-pie"
                aria-hidden="true">
              </i>
            </div>
          </div>
          <div class="category-list">
            @if (categoryTotals().length > 0) {
              @for (
                item of categoryTotals();
                track item.category;
                let i = $index
              ) {
                <div class="category-row">
                  <div class="category-info">
                    <div class="category-name">
                      <span
                        class="category-dot"
                        [class]="'dot-' + i">
                      </span>
                      {{ item.category }}
                    </div>
                    <strong>
                      {{ item.amount
                        | currency:'EGP':'symbol':'1.0-0' }}
                    </strong>
                  </div>
                  <div class="progress-track">
                    <div
                      class="progress-fill"
                      [class]="'progress-' + i"
                      [style.width.%]="item.percentage">
                    </div>
                  </div>
                  <small>
                    {{ item.percentage | number:'1.0-0' }}%
                  </small>
                </div>
              }
            } @else {
              <div class="empty-analytics">
                <i
                  class="pi pi-chart-bar"
                  aria-hidden="true">
                </i>
                <strong>
                  No spending data
                </strong>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="insights-section">
        <div class="section-heading">
          <div>
            <span class="section-kicker">
              SMART INSIGHTS
            </span>
            <h2>
              Financial snapshot
            </h2>
          </div>
          <div class="section-heading-icon">
            <i
              class="pi pi-sparkles"
              aria-hidden="true">
            </i>
          </div>
        </div>
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-icon purple">
              <i
                class="pi pi-wallet"
                aria-hidden="true">
              </i>
            </div>
            <div>
              <span>
                Average Expense
              </span>
              <strong>
                {{ averageExpense()
                  | currency:'EGP':'symbol':'1.0-0' }}
              </strong>
              <small>
                Per transaction
              </small>
            </div>
          </div>
          <div class="insight-card">
            <div class="insight-icon red">
              <i
                class="pi pi-arrow-up"
                aria-hidden="true">
              </i>
            </div>
            <div>
              <span>
                Highest Expense
              </span>
              <strong>
                {{ highestExpenseAmount()
                  | currency:'EGP':'symbol':'1.0-0' }}
              </strong>
              <small>
                {{ highestExpenseCategory() }}
              </small>
            </div>
          </div>
          <div class="insight-card">
            <div class="insight-icon blue">
              <i
                class="pi pi-tag"
                aria-hidden="true">
              </i>
            </div>
            <div>
              <span>
                Top Category
              </span>
              <strong>
                {{ topCategoryName() }}
              </strong>
              <small>
                {{ topCategoryPercentage()
                  | number:'1.0-0' }}% of spending
              </small>
            </div>
          </div>
          <div class="insight-card">
            <div class="insight-icon green">
              <i
                class="pi pi-list"
                aria-hidden="true">
              </i>
            </div>
            <div>
              <span>
                Transactions
              </span>
              <strong>
                {{ expenseService.expenses().length }}
              </strong>
              <small>
                Total recorded
              </small>
            </div>
          </div>
        </div>
      </section>

      <section
        class="threshold-panel"
        aria-labelledby="threshold-heading">
        <div class="threshold-info">
          <div class="threshold-icon">
            <i
              class="pi pi-bell"
              aria-hidden="true">
            </i>
          </div>
          <div>
            <span class="section-kicker">
              SMART ALERT
            </span>
            <h2 id="threshold-heading">
              Budget alert threshold
            </h2>
            <p>
              Highlight transactions that exceed your preferred limit.
            </p>
          </div>
        </div>
        <div class="threshold-field">
          <label for="threshold">
            Alert above
          </label>
          <div class="threshold-input">
            <span>
              EGP
            </span>
            <input
              type="number"
              id="threshold"
              min="0"
              step="1"
              [ngModel]="budgetThreshold()"
              (ngModelChange)="setBudgetThreshold($event)"
              class="p-inputtext p-component"
              aria-label="Budget alert threshold"
            />
          </div>
        </div>
      </section>

      <section class="workspace-grid">
        <div class="workspace-main">
          <div class="section-heading">
            <div>
              <span class="section-kicker">
                TRANSACTIONS
              </span>
              <h2>
                Expense activity
              </h2>
            </div>
            <div class="heading-actions">
              <p class="record-count">
                {{ filteredExpenses().length }}
                visible records
              </p>
              @if (hasActiveFilters()) {
                <button
                  type="button"
                  class="clear-filter-button"
                  (click)="clearFilters()">
                  <i
                    class="pi pi-filter-slash"
                    aria-hidden="true">
                  </i>
                  Clear
                </button>
              }
            </div>
          </div>
          <div
            class="filter-toolbar"
            role="search"
            aria-label="Expense filters">
            <div class="search-field">
              <i
                class="pi pi-search"
                aria-hidden="true">
              </i>
              <input
                type="text"
                pInputText
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search notes..."
                aria-label="Search expenses by note"
              />
            </div>
            <select
              [ngModel]="selectedCategory()"
              (ngModelChange)="setCategoryFilter($event)"
              class="p-inputtext p-component filter-select"
              aria-label="Filter by category">
              <option [ngValue]="null">
                All categories
              </option>
              @for (
                cat of categoryFilterOptions;
                track cat.value
              ) {
                <option [ngValue]="cat.value">
                  {{ cat.label }}
                </option>
              }
            </select>
            <select
              [ngModel]="sortBy()"
              (ngModelChange)="setSortBy($event)"
              class="p-inputtext p-component filter-select sort-select"
              aria-label="Sort expenses">
              <option value="date">
                Sort by Date
              </option>
              <option value="amount">
                Sort by Amount
              </option>
            </select>
            <select
              [ngModel]="sortDirection()"
              (ngModelChange)="setSortDirection($event)"
              class="p-inputtext p-component filter-select direction-select"
              aria-label="Sort direction">
              <option value="desc">
                Descending
              </option>
              <option value="asc">
                Ascending
              </option>
            </select>
            <p-button
              label="Export CSV"
              icon="pi pi-download"
              severity="secondary"
              [outlined]="true"
              (onClick)="exportToCSV()">
            </p-button>
          </div>
          <div class="table-panel">
            <p-table
              [value]="filteredExpenses()"
              [paginator]="true"
              [rows]="5"
              [rowsPerPageOptions]="[5, 10, 20]">
              <ng-template #header>
                <tr>
                  <th>
                    Category
                  </th>
                  <th>
                    Amount
                  </th>
                  <th>
                    Date
                  </th>
                  <th>
                    Note
                  </th>
                  <th class="actions-column">
                    Actions
                  </th>
                </tr>
              </ng-template>
              <ng-template
                #body
                let-expense>
                <tr
                  [appHighlightOverBudget]="expense.amount"
                  [threshold]="budgetThreshold()">
                  <td>
                    <div class="category-cell">
                      <span
                        class="category-icon"
                        aria-hidden="true">
                        {{ expense.category | categoryIcon }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="amount-cell">
                      {{ expense.amount
                        | currency:'EGP':'symbol':'1.0-0' }}
                    </span>
                  </td>
                  <td>
                    <span class="date-cell">
                      {{ parseDateOnly(expense.date)
                        | date:'dd MMM yyyy' }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="note-cell"
                      [class.no-note]="!expense.note">
                      {{ expense.note || 'No note added' }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button
                        type="button"
                        class="action-button edit-button"
                        (click)="editExpense(expense)"
                        aria-label="Edit expense">
                        <i
                          class="pi pi-pencil"
                          aria-hidden="true">
                        </i>
                        <span>
                          EDIT
                        </span>
                      </button>
                      <button
                        type="button"
                        class="action-button remove-button"
                        (click)="deleteExpense(expense.id)"
                        aria-label="Remove expense">
                        <i
                          class="pi pi-trash"
                          aria-hidden="true">
                        </i>
                        <span>
                          REMOVE
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <div class="empty-state-icon">
                        <i
                          class="pi pi-inbox"
                          aria-hidden="true">
                        </i>
                      </div>
                      <strong>
                        No expenses found
                      </strong>
                      <span>
                        Try adjusting your filters or add a new expense.
                      </span>
                      @if (hasActiveFilters()) {
                        <button
                          type="button"
                          class="empty-clear-button"
                          (click)="clearFilters()">
                          Clear filters
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
        <aside class="workspace-side">
          <app-expense-form
            [expenseToEdit]="selectedExpense"
            (formSubmitted)="onFormSubmitted()"
            (cancelEdit)="onCancelEdit()">
          </app-expense-form>
        </aside>
      </section>

      <section class="ai-wrapper">
        <div class="ai-section-heading">
          <div>
            <span class="section-kicker">
              AI POWERED
            </span>
            <h2>
              Your financial assistant
            </h2>
            <p>
              Ask questions about your spending and get instant insights.
            </p>
          </div>
          <div class="ai-heading-icon">
            <i
              class="pi pi-sparkles"
              aria-hidden="true">
            </i>
          </div>
        </div>
        <app-ai-chat></app-ai-chat>
      </section>

      <footer class="dashboard-footer">
        <span>
          Personal Finance Dashboard
        </span>
        <span>
          Smart spending • Better decisions
        </span>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    * {
      box-sizing: border-box;
    }

    .dashboard-page {
      min-height: 100vh;
      padding: 32px;
      background:
        radial-gradient(
          circle at top right,
          rgba(99, 102, 241, 0.09),
          transparent 28%
        ),
        radial-gradient(
          circle at bottom left,
          rgba(139, 92, 246, 0.05),
          transparent 25%
        ),
        #f6f8fc;
      color: #172033;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      margin-bottom: 28px;
    }

    .welcome-area h1 {
      margin: 12px 0 8px;
      font-size: 32px;
      font-weight: 850;
      letter-spacing: -1px;
      color: #172033;
    }

    .welcome-area > p {
      margin: 0;
      max-width: 650px;
      color: #718096;
      font-size: 14px;
      line-height: 1.7;
    }

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 1.2px;
    }

    .welcome-badge span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #6366f1;
      box-shadow: 0 0 0 4px rgba(99,102,241,.10);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .live-status,
    .date-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #ffffff;
      border: 1px solid #e7eaf0;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 650;
      color: #5d687a;
      box-shadow: 0 5px 18px rgba(15,23,42,.03);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 4px rgba(34,197,94,.12);
    }

    .refresh-button {
      width: 40px;
      height: 40px;
      border: 1px solid #e7eaf0;
      border-radius: 12px;
      background: #ffffff;
      color: #6366f1;
      cursor: pointer;
      transition: .2s ease;
    }

    .refresh-button:hover:not(:disabled) {
      transform: rotate(15deg);
      background: #f5f3ff;
    }

    .refresh-button:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .notice {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
      padding: 13px 16px;
      border-radius: 12px;
      font-size: 13px;
    }

    .notice-loading {
      background: #eef2ff;
      color: #4f46e5;
    }

    .notice-error {
      background: #fff1f2;
      color: #be123c;
      border: 1px solid #ffe0e5;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 18px;
    }

    .summary-card {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 142px;
      padding: 22px;
      background: #ffffff;
      border: 1px solid #e9edf4;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(15,23,42,.04);
      transition:
        transform .2s ease,
        box-shadow .2s ease;
    }

    .summary-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 38px rgba(15,23,42,.08);
    }

    .primary-card {
      background: linear-gradient(135deg, #4338ca, #6366f1);
      color: white;
      border: none;
    }

    .card-decoration {
      position: absolute;
      width: 130px;
      height: 130px;
      right: -55px;
      top: -55px;
      border-radius: 50%;
      border: 25px solid rgba(255,255,255,.08);
    }

    .card-icon {
      width: 50px;
      height: 50px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
      background: rgba(255,255,255,.18);
      color: white;
      font-size: 20px;
    }

    .blue-icon {
      background: #eff6ff;
      color: #2563eb;
    }

    .orange-icon {
      background: #fff7ed;
      color: #ea580c;
    }

    .purple-icon {
      background: #f5f3ff;
      color: #7c3aed;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .card-content span {
      color: #7b8494;
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .9px;
    }

    .primary-card .card-content span {
      color: rgba(255,255,255,.75);
    }

    .card-content strong {
      margin: 5px 0;
      font-size: 24px;
      font-weight: 850;
      line-height: 1.2;
    }

    .card-content small {
      color: #9aa3b2;
      font-size: 11px;
    }

    .primary-card .card-content small {
      color: rgba(255,255,255,.70);
    }

    .mini-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 22px;
    }

    .mini-metric {
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 16px 18px;
      background: rgba(255,255,255,.72);
      border: 1px solid #e9edf4;
      border-radius: 16px;
    }

    .mini-metric-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      font-size: 16px;
    }

    .mini-metric-icon.green,
    .insight-icon.green {
      background: #ecfdf3;
      color: #059669;
    }

    .mini-metric-icon.purple,
    .insight-icon.purple {
      background: #f3efff;
      color: #7c3aed;
    }

    .mini-metric-icon.blue,
    .insight-icon.blue {
      background: #eff6ff;
      color: #2563eb;
    }

    .mini-metric-icon.orange {
      background: #fff7ed;
      color: #ea580c;
    }

    .mini-metric span {
      display: block;
      margin-bottom: 3px;
      color: #98a2b3;
      font-size: 9px;
      font-weight: 850;
      letter-spacing: .7px;
    }

    .mini-metric strong {
      font-size: 15px;
      color: #172033;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .analytics-card {
      min-width: 0;
      background: #ffffff;
      border: 1px solid #e9edf4;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 8px 25px rgba(15,23,42,.04);
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .analytics-header h2 {
      margin: 5px 0 0;
      font-size: 19px;
      font-weight: 850;
    }

    .analytics-icon,
    .section-heading-icon {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: #f3efff;
      color: #7c3aed;
    }

    .section-kicker {
      color: #7c3aed;
      font-size: 9px;
      font-weight: 850;
      letter-spacing: 1.3px;
    }

    .trend-chart {
      height: 255px;
      display: flex;
      align-items: flex-end;
      gap: 15px;
      padding: 10px 5px 0;
      border-bottom: 1px solid #edf0f5;
    }

    .trend-item {
      flex: 1;
      height: 100%;
      min-width: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
    }

    .trend-value {
      margin-bottom: 8px;
      color: #667085;
      font-size: 9px;
      font-weight: 750;
      white-space: nowrap;
    }

    .trend-bar-container {
      width: 100%;
      height: 175px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .trend-bar {
      width: min(40px, 70%);
      min-height: 7px;
      border-radius: 10px 10px 3px 3px;
      background: linear-gradient(180deg, #8b5cf6, #6366f1);
      transition:
        height .45s ease,
        transform .2s ease;
    }

    .trend-bar:hover {
      transform: translateY(-4px);
    }

    .trend-bar-high {
      background: linear-gradient(180deg, #4f46e5, #4338ca);
      box-shadow: 0 8px 18px rgba(79,70,229,.20);
    }

    .trend-date {
      margin-top: 10px;
      color: #98a2b3;
      font-size: 9px;
      font-weight: 650;
    }

    .empty-chart {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #98a2b3;
    }

    .empty-chart i {
      font-size: 28px;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .category-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 7px;
    }

    .category-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #344054;
    }

    .category-dot {
      width: 9px;
      height: 9px;
      flex-shrink: 0;
      border-radius: 50%;
      background: #6366f1;
    }

    .dot-1 {
      background: #8b5cf6;
    }

    .dot-2 {
      background: #06b6d4;
    }

    .dot-3 {
      background: #f59e0b;
    }

    .dot-4 {
      background: #10b981;
    }

    .dot-5 {
      background: #ef4444;
    }

    .category-info strong {
      font-size: 13px;
      color: #172033;
    }

    .progress-track {
      height: 8px;
      overflow: hidden;
      background: #eef1f6;
      border-radius: 999px;
    }

    .progress-fill {
      height: 100%;
      min-width: 4px;
      border-radius: inherit;
      background: #6366f1;
      transition: width .5s ease;
    }

    .progress-1 {
      background: #8b5cf6;
    }

    .progress-2 {
      background: #06b6d4;
    }

    .progress-3 {
      background: #f59e0b;
    }

    .progress-4 {
      background: #10b981;
    }

    .progress-5 {
      background: #ef4444;
    }

    .category-row small {
      display: block;
      text-align: right;
      color: #98a2b3;
      font-size: 10px;
      font-weight: 700;
    }

    .empty-analytics {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 160px;
      color: #98a2b3;
    }

    .empty-analytics i {
      font-size: 28px;
    }

    .insights-section {
      margin-bottom: 24px;
    }

    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .section-heading h2 {
      margin: 5px 0 0;
      font-size: 21px;
      font-weight: 850;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .insight-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 19px;
      background: #ffffff;
      border: 1px solid #e9edf4;
      border-radius: 18px;
      box-shadow: 0 6px 22px rgba(15,23,42,.035);
      transition: .2s ease;
    }

    .insight-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(15,23,42,.07);
    }

    .insight-icon {
      width: 45px;
      height: 45px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 13px;
      font-size: 17px;
    }

    .insight-icon.red {
      background: #fff1f3;
      color: #e11d48;
    }

    .insight-card span {
      display: block;
      margin-bottom: 4px;
      color: #98a2b3;
      font-size: 11px;
      font-weight: 650;
    }

    .insight-card strong {
      display: block;
      color: #172033;
      font-size: 17px;
      font-weight: 850;
    }

    .insight-card small {
      display: block;
      margin-top: 3px;
      color: #a3aab7;
      font-size: 10px;
    }

    .threshold-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 25px;
      margin-bottom: 25px;
      padding: 22px 24px;
      background: #ffffff;
      border: 1px solid #e9edf4;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(15,23,42,.04);
    }

    .threshold-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .threshold-icon {
      width: 46px;
      height: 46px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: #fff7ed;
      color: #ea580c;
    }

    .threshold-info h2 {
      margin: 4px 0;
      font-size: 17px;
      font-weight: 800;
    }

    .threshold-info p {
      margin: 0;
      color: #8a93a3;
      font-size: 12px;
    }

    .threshold-field label {
      display: block;
      margin-bottom: 7px;
      color: #667085;
      font-size: 11px;
      font-weight: 750;
    }

    .threshold-input {
      display: flex;
      align-items: center;
      overflow: hidden;
      width: 165px;
      border: 1px solid #dfe4ec;
      border-radius: 11px;
      background: #fafbfc;
    }

    .threshold-input span {
      padding-left: 12px;
      color: #6366f1;
      font-size: 11px;
      font-weight: 850;
    }

    .threshold-input input {
      width: 100%;
      border: none !important;
      box-shadow: none !important;
      background: transparent;
    }

    .workspace-grid {
      display: grid;
      grid-template-columns:
        minmax(0, 1.7fr)
        minmax(300px, .7fr);
      gap: 20px;
    }

    .workspace-main,
    .workspace-side {
      min-width: 0;
    }

    .heading-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .record-count {
      margin: 0;
      color: #8a93a3;
      font-size: 11px;
    }

    .clear-filter-button {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border: none;
      background: transparent;
      color: #6366f1;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
    }

    .clear-filter-button:hover {
      color: #4338ca;
    }

    .filter-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .search-field {
      position: relative;
      flex: 1;
      min-width: 190px;
    }

    .search-field i {
      position: absolute;
      top: 50%;
      left: 13px;
      transform: translateY(-50%);
      color: #98a2b3;
      z-index: 2;
    }

    .search-field input {
      width: 100%;
      padding-left: 38px;
      border-radius: 11px;
    }

    .filter-select {
      min-width: 145px;
      border-radius: 11px;
      cursor: pointer;
    }

    .sort-select {
      min-width: 130px;
    }

    .direction-select {
      min-width: 135px;
    }

    .table-panel {
      overflow: hidden;
      background: #ffffff;
      border: 1px solid #e9edf4;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(15,23,42,.04);
    }

    .category-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .category-cell .category-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 105px;
      min-height: 34px;
      padding: 5px 10px;
      border-radius: 10px;
      background: #f3f4ff;
      color: #344054;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .amount-cell {
      font-weight: 850;
      color: #172033;
    }

    .date-cell {
      color: #667085;
      font-size: 12px;
    }

    .note-cell {
      display: block;
      max-width: 190px;
      overflow: hidden;
      color: #667085;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .note-cell.no-note {
      color: #b0b6c0;
      font-style: italic;
    }

    .row-actions {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 7px;
      white-space: nowrap;
    }

    .action-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 32px;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .4px;
      cursor: pointer;
      transition:
        background .18s ease,
        border-color .18s ease,
        color .18s ease,
        transform .18s ease;
    }

    .action-button i {
      font-size: 11px;
    }

    .edit-button {
      border: 1px solid #dbe3ff;
      background: #f5f7ff;
      color: #4f46e5;
    }

    .edit-button:hover {
      background: #eef2ff;
      border-color: #c7d2fe;
      transform: translateY(-1px);
    }

    .remove-button {
      border: 1px solid #fecdd3;
      background: #fff5f6;
      color: #e11d48;
    }

    .remove-button:hover {
      background: #ffe4e8;
      border-color: #fda4af;
      transform: translateY(-1px);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 230px;
      color: #98a2b3;
    }

    .empty-state-icon {
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
      border-radius: 17px;
      background: #f3f4f6;
      color: #aeb5c1;
      font-size: 25px;
    }

    .empty-state strong {
      color: #667085;
      font-size: 14px;
    }

    .empty-state span {
      font-size: 12px;
    }

    .empty-clear-button {
      margin-top: 7px;
      padding: 7px 13px;
      border: none;
      border-radius: 8px;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
    }

    .ai-wrapper {
      margin-top: 28px;
    }

    .ai-section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .ai-section-heading h2 {
      margin: 5px 0;
      font-size: 21px;
      font-weight: 850;
    }

    .ai-section-heading p {
      margin: 0;
      color: #8a93a3;
      font-size: 12px;
    }

    .ai-heading-icon {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: linear-gradient(135deg, #ede9fe, #eef2ff);
      color: #7c3aed;
      font-size: 19px;
    }

    .dashboard-footer {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 30px;
      padding-top: 18px;
      border-top: 1px solid #e5e9f0;
      color: #98a2b3;
      font-size: 10px;
      font-weight: 600;
    }

    @media (max-width: 1200px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .mini-metrics {
        grid-template-columns: repeat(2, 1fr);
      }
      .insights-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .workspace-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 950px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .dashboard-page {
        padding: 18px;
      }
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-right {
        width: 100%;
      }
      .summary-grid {
        grid-template-columns: 1fr;
      }
      .mini-metrics {
        grid-template-columns: 1fr;
      }
      .insights-grid {
        grid-template-columns: 1fr;
      }
      .filter-toolbar {
        flex-direction: column;
        align-items: stretch;
      }
      .search-field,
      .filter-select {
        width: 100%;
      }
      .filter-select {
        min-width: 0;
      }
      .threshold-panel {
        flex-direction: column;
        align-items: flex-start;
      }
      .threshold-field,
      .threshold-input {
        width: 100%;
      }
      .welcome-area h1 {
        font-size: 26px;
      }
      .trend-chart {
        gap: 7px;
      }
      .trend-value {
        font-size: 7px;
      }
      .trend-date {
        font-size: 8px;
      }
      .dashboard-footer {
        flex-direction: column;
      }
      .row-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .action-button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .dashboard-page {
        padding: 13px;
      }
      .summary-card {
        min-height: 125px;
        padding: 18px;
      }
      .card-content strong {
        font-size: 21px;
      }
      .analytics-card {
        padding: 18px;
      }
      .section-heading {
        align-items: flex-start;
      }
      .heading-actions {
        flex-direction: column;
        align-items: flex-end;
        gap: 3px;
      }
      .live-status {
        display: none;
      }
    }
  `]
})
export class ExpenseListComponent {

  readonly expenseService = inject(ExpenseService);

  today = new Date();

  selectedExpense: Expense | null = null;

  searchQuery = signal<string>('');

  selectedCategory = signal<ExpenseCategory | null>(null);

  budgetThreshold = signal<number>(100);

  sortBy = signal<'date' | 'amount'>('date');

  sortDirection = signal<'asc' | 'desc'>('desc');

  readonly categoryFilterOptions: { label: string; value: ExpenseCategory; }[] = [
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Other', value: 'Other' }
  ];

  parseDateOnly(date: string): Date {
    const parts = date.split('-').map(Number);

    if (parts.length !== 3) {
      return new Date(date);
    }

    const [year, month, day] = parts;

    return new Date(year, month - 1, day);
  }

  filteredExpenses = computed(() => {
    const expenses = this.expenseService.expenses();
    const query = this.searchQuery().trim().toLowerCase();
    const categoryFilter = this.selectedCategory();

    const filtered = expenses.filter((item: Expense) => {
      const note = (item.note ?? '').toLowerCase();
      const matchesSearch = !query || note.includes(query);
      const matchesCategory = !categoryFilter || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a: Expense, b: Expense) => {
      let comparison = 0;

      if (this.sortBy() === 'amount') {
        comparison = Number(a.amount || 0) - Number(b.amount || 0);
      } else {
        comparison = this.parseDateOnly(a.date).getTime() - this.parseDateOnly(b.date).getTime();
      }

      if (comparison === 0) {
        comparison = Number(a.id) - Number(b.id);
      }

      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
  });

  setCategoryFilter(value: string | null): void {
    const validCategory = this.categoryFilterOptions.some(category => category.value === value);

    this.selectedCategory.set(validCategory ? value as ExpenseCategory : null);
  }

  setSortBy(value: string): void {
    if (value === 'amount') {
      this.sortBy.set('amount');
      return;
    }
    this.sortBy.set('date');
  }

  setSortDirection(value: string): void {
    if (value === 'asc') {
      this.sortDirection.set('asc');
      return;
    }
    this.sortDirection.set('desc');
  }

  totalAmount = computed(() => {
    return this.filteredExpenses().reduce(
      (sum: number, item: Expense) => sum + Number(item.amount || 0),
      0
    );
  });

  highestExpense = computed(() => {
    const list = this.expenseService.expenses();

    if (!list.length) {
      return null;
    }

    return list.reduce(
      (highest: Expense, current: Expense) => {
        return Number(current.amount || 0) > Number(highest.amount || 0) ? current : highest;
      }
    );
  });

  highestExpenseAmount = computed(() => {
    return Number(this.highestExpense()?.amount ?? 0);
  });

  highestExpenseCategory = computed(() => {
    return this.highestExpense()?.category ?? 'No expenses yet';
  });

  topCategory = computed(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {};

    for (const expense of this.expenseService.expenses()) {
      const category = expense.category;
      totals[category] = (totals[category] ?? 0) + Number(expense.amount || 0);
    }

    const entries = Object.entries(totals) as [ExpenseCategory, number][];

    if (!entries.length) {
      return null;
    }

    return entries.reduce(
      (highest, current) => current[1] > highest[1] ? current : highest
    );
  });

  topCategoryName = computed(() => {
    return this.topCategory()?.[0] ?? '—';
  });

  topCategoryAmount = computed(() => {
    return this.topCategory()?.[1] ?? 0;
  });

  categoryTotals = computed(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {};

    for (const expense of this.expenseService.expenses()) {
      const category = expense.category;
      totals[category] = (totals[category] ?? 0) + Number(expense.amount || 0);
    }

    const total = Object.values(totals).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

    return (Object.entries(totals) as [ExpenseCategory, number][])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  topCategoryPercentage = computed(() => {
    const total = this.expenseService.expenses().reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    if (total <= 0) {
      return 0;
    }

    return (this.topCategoryAmount() / total) * 100;
  });

  averageExpense = computed(() => {
    const list = this.expenseService.expenses();

    if (!list.length) {
      return 0;
    }

    const total = list.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    return total / list.length;
  });

  currentMonthAmount = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return this.expenseService.expenses()
      .filter(item => {
        const date = this.parseDateOnly(item.date);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );
  });

  dailyAverage = computed(() => {
    const expenses = this.expenseService.expenses();

    if (!expenses.length) {
      return 0;
    }

    const total = expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const uniqueDates = new Set(expenses.map(item => item.date));

    return total / Math.max(uniqueDates.size, 1);
  });

  spendingTrend = computed(() => {
    const expenses = this.expenseService.expenses();
    const grouped: Record<string, number> = {};

    for (const expense of expenses) {
      const date = expense.date;
      grouped[date] = (grouped[date] ?? 0) + Number(expense.amount || 0);
    }

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(-7)
      .map(([date, amount]) => ({ date, amount }));
  });

  maxTrendAmount = computed(() => {
    const trend = this.spendingTrend();

    if (!trend.length) {
      return 0;
    }

    return trend.reduce(
      (maximum, item) => Math.max(maximum, item.amount),
      0
    );
  });

  getTrendHeight(amount: number): number {
    const maximum = this.maxTrendAmount();

    if (maximum <= 0 || !Number.isFinite(amount)) {
      return 0;
    }

    return Math.min(Math.max((amount / maximum) * 100, 8), 100);
  }

  setBudgetThreshold(value: number | string): void {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      this.budgetThreshold.set(0);
      return;
    }

    this.budgetThreshold.set(parsed);
  }

  hasActiveFilters = computed(() => {
    return (
      this.searchQuery().trim().length > 0 ||
      this.selectedCategory() !== null
    );
  });

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }

  refreshDashboard(): void {
    this.today = new Date();
    this.expenseService.loadExpenses();
  }

  private csvEscape(value: unknown): string {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  exportToCSV(): void {
    const list = this.filteredExpenses();

    if (!list.length) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['ID', 'Category', 'Amount', 'Date', 'Note'];

    const rows = list.map(item => [
      this.csvEscape(item.id),
      this.csvEscape(item.category),
      this.csvEscape(item.amount),
      this.csvEscape(item.date),
      this.csvEscape(item.note || '')
    ]);

    const csv = '\uFEFF' + [
      headers.map(header => this.csvEscape(header)).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `expenses_report_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  editExpense(expense: Expense): void {
    this.selectedExpense = {
      ...expense,
      id: Number(expense.id),
      amount: Number(expense.amount)
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onCancelEdit(): void {
    this.selectedExpense = null;
  }

  deleteExpense(id: number): void {
    const numericId = Number(id);

    if (!Number.isFinite(numericId)) {
      console.error('Invalid expense ID:', id);
      return;
    }

    const confirmed = window.confirm('Are you sure you want to remove this expense?');

    if (!confirmed) {
      return;
    }

    this.expenseService.deleteExpense(numericId).subscribe({
      next: () => {
        if (this.selectedExpense && Number(this.selectedExpense.id) === numericId) {
          this.selectedExpense = null;
        }
      },
      error: error => {
        console.error('Error deleting expense:', error);
      }
    });
  }

  onFormSubmitted(): void {
    this.selectedExpense = null;
  }
}