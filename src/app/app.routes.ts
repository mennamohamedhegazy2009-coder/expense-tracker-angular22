import { Routes } from '@angular/router';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';

export const routes: Routes = [
  { path: '', component: ExpenseListComponent },
  { path: '**', redirectTo: '' }
];
