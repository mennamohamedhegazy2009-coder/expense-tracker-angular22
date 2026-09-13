
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  catchError,
  finalize,
  tap,
  throwError
} from 'rxjs';

import { Expense } from '../models/expense.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  /* ===================================================== */
  /* DEPENDENCIES */
  /* ===================================================== */

  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl =
    inject(API_BASE_URL);

  private readonly apiUrl =
    `${this.apiBaseUrl}/expenses`;


  /* ===================================================== */
  /* STATE */
  /* ===================================================== */

  readonly expenses =
    signal<Expense[]>([]);

  readonly isLoading =
    signal<boolean>(false);

  readonly errorMessage =
    signal<string | null>(null);


  /* ===================================================== */
  /* INITIAL LOAD */
  /* ===================================================== */

  constructor() {
    this.loadExpenses();
  }


  /* ===================================================== */
  /* GET ALL EXPENSES */
  /* ===================================================== */

  loadExpenses(): void {

    this.isLoading.set(true);

    this.errorMessage.set(null);

    this.http
      .get<Expense[]>(this.apiUrl)

      .pipe(

        tap((data) => {

          const normalizedData: Expense[] =
            data.map((item) => ({

              ...item,

              id: Number(item.id),

              amount: Number(item.amount)

            }));

          this.expenses.set(
            normalizedData
          );

        }),

        catchError((error) => {

          console.error(
            'Error loading expenses:',
            error
          );

          this.errorMessage.set(
            'Failed to load expenses. Please make sure json-server is running.'
          );

          return throwError(
            () => error
          );

        }),

        finalize(() => {

          this.isLoading.set(false);

        })

      )

      .subscribe();

  }


  /* ===================================================== */
  /* ADD EXPENSE */
  /* ===================================================== */

  addExpense(
    expense: Omit<Expense, 'id'>
  ): Observable<Expense> {

    this.isLoading.set(true);

    this.errorMessage.set(null);


    const newExpense = {

      ...expense,

      amount: Number(
        expense.amount
      )

    };


    return this.http

      .post<Expense>(
        this.apiUrl,
        newExpense
      )

      .pipe(

        tap((createdExpense) => {

          const normalizedExpense: Expense = {

            ...createdExpense,

            id: Number(
              createdExpense.id
            ),

            amount: Number(
              createdExpense.amount
            )

          };


          this.expenses.update(
            (list) => [
              ...list,
              normalizedExpense
            ]
          );

        }),

        catchError((error) => {

          console.error(
            'Error adding expense:',
            error
          );

          this.errorMessage.set(
            'Failed to add expense.'
          );

          return throwError(
            () => error
          );

        }),

        finalize(() => {

          this.isLoading.set(false);

        })

      );

  }


  /* ===================================================== */
  /* UPDATE EXPENSE */
  /* ===================================================== */

 updateExpense(
  id: number,
  expense: Partial<Expense>
): Observable<Expense> {

  this.isLoading.set(true);
  this.errorMessage.set(null);

  const updatedExpense = {
    ...expense,
    ...(expense.amount !== undefined
      ? { amount: Number(expense.amount) }
      : {})
  };

  return this.http
    .patch<Expense>(
      `${this.apiUrl}/${id}`,
      updatedExpense
    )
    .pipe(
      tap((result) => {

        const normalizedExpense: Expense = {
          ...result,
          id: Number(result.id),
          amount: Number(result.amount)
        };

        this.expenses.update(list =>
          list.map(item =>
            item.id === id
              ? normalizedExpense
              : item
          )
        );
      }),

      catchError((error) => {

        console.error(
          'Update expense error:',
          error
        );

        console.error(
          'Update URL:',
          `${this.apiUrl}/${id}`
        );

        console.error(
          'Update payload:',
          updatedExpense
        );

        this.errorMessage.set(
          'Failed to update expense. Please check that json-server is running.'
        );

        return throwError(
          () => error
        );
      }),

      finalize(() =>
        this.isLoading.set(false)
      )
    );
}

  /* ===================================================== */
  /* DELETE EXPENSE */
  /* ===================================================== */

  deleteExpense(
    id: number
  ): Observable<void> {

    this.isLoading.set(true);

    this.errorMessage.set(null);


    return this.http

      .delete<void>(
        `${this.apiUrl}/${id}`
      )

      .pipe(

        tap(() => {

          this.expenses.update(
            (list) =>

              list.filter(
                (item) =>
                  item.id !== id
              )

          );

        }),

        catchError((error) => {

          console.error(
            'Error deleting expense:',
            error
          );

          this.errorMessage.set(
            'Failed to delete expense.'
          );

          return throwError(
            () => error
          );

        }),

        finalize(() => {

          this.isLoading.set(false);

        })

      );

  }

}
