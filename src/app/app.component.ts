import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ExpenseListComponent],
  template: `
    <main class="app-shell">
      <app-expense-list></app-expense-list>
    </main>
  `
})
export class AppComponent {}
