import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  Expense,
  ExpenseCategory
} from '../../models/expense.model';

import { ExpenseService } from '../../services/expense.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';


// ======================================================
// Helper
// ======================================================

function localDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}


// ======================================================
// Future Date Validator
// ======================================================

function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value as string | null;

    if (!value) {
      return null;
    }

    const today = localDateString(new Date());

    return value > today
      ? { futureDate: true }
      : null;
  };
}


// ======================================================
// Component
// ======================================================

@Component({
  selector: 'app-expense-form',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule
  ],

  template: `

    <!-- ==================================================
         FORM CARD
    =================================================== -->

    <section class="expense-form-panel">

      <!-- HEADER -->

      <div class="form-heading">

        <div class="form-icon">
          <i
            [class]="editMode
              ? 'pi pi-file-edit'
              : 'pi pi-wallet'"
            aria-hidden="true">
          </i>
        </div>

        <div class="heading-content">

          <span class="section-kicker">
            {{ editMode ? 'EDIT EXPENSE' : 'EXPENSE ENTRY' }}
          </span>

          <h2>
            {{ editMode ? 'Edit Expense' : 'Add New Expense' }}
          </h2>

          <p>
            {{
              editMode
                ? 'Update the details of this transaction.'
                : 'Record a new transaction and keep your finances organized.'
            }}
          </p>

        </div>

      </div>


      <!-- ERROR MESSAGE -->

      @if (errorMessage) {

        <div
          class="form-error-message"
          role="alert">

          <div class="error-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>

          <div>
            <strong>Something went wrong</strong>

            <span>
              {{ errorMessage }}
            </span>
          </div>

        </div>

      }


      <!-- FORM -->

      <form
        [formGroup]="expenseForm"
        (ngSubmit)="onSubmit()"
        class="expense-form-grid"
        novalidate>


        <!-- ==================================================
             AMOUNT
        =================================================== -->

        <div class="form-field">

          <label for="amount">
            Amount
            <span class="required-mark">*</span>
          </label>

          <div
            class="input-wrapper"
            [class.input-invalid]="
              expenseForm.get('amount')?.invalid &&
              expenseForm.get('amount')?.touched
            ">

            <span class="input-prefix">
              EGP
            </span>

            <input
              id="amount"
              type="number"
              formControlName="amount"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              autocomplete="off"
              pInputText />

          </div>


          @if (
            expenseForm.get('amount')?.hasError('required') &&
            expenseForm.get('amount')?.touched
          ) {

            <small class="p-error">
              <i class="pi pi-info-circle"></i>
              Amount is required.
            </small>

          }


          @if (
            expenseForm.get('amount')?.hasError('min') &&
            expenseForm.get('amount')?.touched
          ) {

            <small class="p-error">
              <i class="pi pi-info-circle"></i>
              Amount must be greater than 0.
            </small>

          }

        </div>


        <!-- ==================================================
             CATEGORY
        =================================================== -->

        <div class="form-field">

          <label for="category">
            Category
            <span class="required-mark">*</span>
          </label>

          <div
            class="select-wrapper"
            [class.input-invalid]="
              expenseForm.get('category')?.invalid &&
              expenseForm.get('category')?.touched
            ">

            <i
              class="pi pi-tag select-icon"
              aria-hidden="true">
            </i>

            <select
              id="category"
              formControlName="category">

              <option
                [ngValue]="null"
                disabled>
                Select a category
              </option>

              @for (cat of categories; track cat.value) {

                <option [value]="cat.value">
                  {{ cat.label }}
                </option>

              }

            </select>

            <i
              class="pi pi-chevron-down dropdown-icon"
              aria-hidden="true">
            </i>

          </div>


          @if (
            expenseForm.get('category')?.invalid &&
            expenseForm.get('category')?.touched
          ) {

            <small class="p-error">
              <i class="pi pi-info-circle"></i>
              Category is required.
            </small>

          }

        </div>


        <!-- ==================================================
             DATE
        =================================================== -->

        <div class="form-field">

          <label for="date">
            Date
            <span class="required-mark">*</span>
          </label>

          <div
            class="date-wrapper"
            [class.input-invalid]="
              expenseForm.get('date')?.invalid &&
              expenseForm.get('date')?.touched
            ">

            <i
              class="pi pi-calendar date-icon"
              aria-hidden="true">
            </i>

            <input
              id="date"
              type="date"
              formControlName="date"
              [max]="maxDate"
              pInputText />

          </div>


          @if (
            expenseForm.get('date')?.hasError('required') &&
            expenseForm.get('date')?.touched
          ) {

            <small class="p-error">
              <i class="pi pi-info-circle"></i>
              Date is required.
            </small>

          }


          @if (
            expenseForm.get('date')?.hasError('futureDate') &&
            expenseForm.get('date')?.touched
          ) {

            <small class="p-error">
              <i class="pi pi-info-circle"></i>
              Date cannot be in the future.
            </small>

          }

        </div>


        <!-- ==================================================
             NOTE
        =================================================== -->

        <div class="form-field form-field-wide">

          <div class="label-row">

            <label for="note">
              Note
              <span class="optional-label">
                Optional
              </span>
            </label>

            <span class="character-count">
              {{ noteLength }}/200
            </span>

          </div>


          <textarea
            id="note"
            formControlName="note"
            maxlength="200"
            rows="3"
            placeholder="Add a short description..."
            pInputText>
          </textarea>


          @if (
            expenseForm.get('note')?.hasError('maxlength')
          ) {

            <small class="p-error">
              <i class="pi pi-info-circle"></i>
              Note cannot exceed 200 characters.
            </small>

          }

        </div>


        <!-- ==================================================
             ACTIONS
        =================================================== -->

        <div class="form-actions form-field-wide">

          <p-button
            type="submit"
            [label]="
              isSaving
                ? 'Saving...'
                : editMode
                  ? 'Update Expense'
                  : 'Add Expense'
            "
            [icon]="
              isSaving
                ? 'pi pi-spin pi-spinner'
                : editMode
                  ? 'pi pi-check'
                  : 'pi pi-plus'
            "
            [disabled]="isSaving || expenseForm.invalid"
            styleClass="submit-button">
          </p-button>


          @if (editMode) {

            <p-button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              [outlined]="true"
              [disabled]="isSaving"
              (onClick)="onCancel()"
              styleClass="cancel-button">
            </p-button>

          }

        </div>

      </form>

    </section>
  `,


  // ======================================================
  // STYLES
  // ======================================================

  styles: [`

    :host {
      display: block;
      width: 100%;
    }


    /* =====================================================
       PANEL
    ====================================================== */

    .expense-form-panel {
      width: 100%;
      background: #ffffff;
      border: 1px solid #e7edf5;
      border-radius: 20px;
      padding: 26px;
      box-shadow:
        0 8px 30px rgba(15, 23, 42, 0.06);
    }


    /* =====================================================
       HEADER
    ====================================================== */

    .form-heading {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
    }


    .form-icon {
      width: 50px;
      height: 50px;
      min-width: 50px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 15px;

      background: #eff6ff;
      color: #2563eb;

      font-size: 19px;
    }


    .heading-content {
      min-width: 0;
    }


    .section-kicker {
      display: block;

      margin-bottom: 4px;

      font-size: 10px;
      font-weight: 800;

      letter-spacing: 1.4px;

      color: #64748b;
    }


    .form-heading h2 {
      margin: 0;

      font-size: 21px;
      line-height: 1.25;

      font-weight: 750;

      color: #0f172a;
    }


    .form-heading p {
      margin: 5px 0 0;

      font-size: 12px;
      line-height: 1.5;

      color: #64748b;
    }


    /* =====================================================
       ERROR
    ====================================================== */

    .form-error-message {
      display: flex;
      align-items: center;
      gap: 12px;

      padding: 12px 14px;
      margin-bottom: 20px;

      border: 1px solid #fecaca;
      border-radius: 12px;

      background: #fff7f7;
      color: #b91c1c;
    }


    .error-icon {
      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 9px;

      background: #fee2e2;

      flex-shrink: 0;
    }


    .form-error-message strong {
      display: block;

      font-size: 12px;
      margin-bottom: 2px;
    }


    .form-error-message span {
      display: block;

      font-size: 11px;
    }


    /* =====================================================
       GRID
    ====================================================== */

    .expense-form-grid {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 18px;
    }


    /* =====================================================
       FIELD
    ====================================================== */

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }


    .form-field-wide {
      grid-column: 1 / -1;
    }


    .form-field label {
      font-size: 12px;
      font-weight: 700;

      color: #334155;
    }


    .required-mark {
      color: #ef4444;
      margin-left: 2px;
    }


    .optional-label {
      margin-left: 6px;

      font-size: 10px;
      font-weight: 500;

      color: #94a3b8;
    }


    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }


    /* =====================================================
       INPUTS
    ====================================================== */

    .form-field input,
    .form-field textarea,
    .form-field select {
      width: 100%;
      box-sizing: border-box;

      min-height: 43px;

      border: 1px solid #dbe3ee;
      border-radius: 11px;

      background: #ffffff;

      color: #0f172a;

      font-size: 13px;

      transition:
        border-color .2s ease,
        box-shadow .2s ease,
        background .2s ease;
    }


    .form-field input,
    .form-field textarea {
      padding: 10px 12px;
    }


    .form-field textarea {
      resize: vertical;
      min-height: 82px;
      line-height: 1.5;
    }


    .form-field input:focus,
    .form-field textarea:focus,
    .form-field select:focus {
      outline: none;

      border-color: #60a5fa;

      box-shadow:
        0 0 0 3px rgba(59, 130, 246, .11);
    }


    .form-field input::placeholder,
    .form-field textarea::placeholder {
      color: #a8b3c2;
    }


    /* =====================================================
       AMOUNT
    ====================================================== */

    .input-wrapper {
      position: relative;
    }


    .input-prefix {
      position: absolute;

      left: 12px;
      top: 50%;

      transform: translateY(-50%);

      z-index: 2;

      font-size: 11px;
      font-weight: 800;

      color: #64748b;

      pointer-events: none;
    }


    .input-wrapper input {
      padding-left: 48px;
    }


    /* =====================================================
       SELECT
    ====================================================== */

    .select-wrapper {
      position: relative;
    }


    .select-wrapper select {
      appearance: none;

      padding:
        0 38px 0 39px;

      cursor: pointer;
    }


    .select-icon {
      position: absolute;

      left: 13px;
      top: 50%;

      transform: translateY(-50%);

      color: #64748b;

      font-size: 13px;

      pointer-events: none;
      z-index: 2;
    }


    .dropdown-icon {
      position: absolute;

      right: 13px;
      top: 50%;

      transform: translateY(-50%);

      color: #94a3b8;

      font-size: 11px;

      pointer-events: none;
    }


    /* =====================================================
       DATE
    ====================================================== */

    .date-wrapper {
      position: relative;
    }


    .date-icon {
      position: absolute;

      left: 13px;
      top: 50%;

      transform: translateY(-50%);

      color: #64748b;

      font-size: 13px;

      pointer-events: none;
      z-index: 2;
    }


    .date-wrapper input {
      padding-left: 38px;
    }


    /* =====================================================
       INVALID
    ====================================================== */

    .input-invalid input,
    .input-invalid select,
    .input-invalid textarea {
      border-color: #fca5a5 !important;
      background: #fffafa;
    }


    /* =====================================================
       ERRORS
    ====================================================== */

    .p-error {
      display: flex;
      align-items: center;
      gap: 5px;

      font-size: 10px;
      line-height: 1.3;

      color: #dc2626;
    }


    .p-error i {
      font-size: 10px;
    }


    /* =====================================================
       CHARACTER COUNT
    ====================================================== */

    .character-count {
      font-size: 10px;
      color: #94a3b8;
    }


    /* =====================================================
       ACTIONS
    ====================================================== */

    .form-actions {
      display: flex;
      align-items: center;

      gap: 10px;

      padding-top: 4px;
    }


    .form-actions p-button {
      display: inline-block;
    }


    /* =====================================================
       RESPONSIVE
    ====================================================== */

    @media (max-width: 950px) {

      .expense-form-grid {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }

    }


    @media (max-width: 650px) {

      .expense-form-panel {
        padding: 20px;
        border-radius: 16px;
      }


      .expense-form-grid {
        grid-template-columns: 1fr;
      }


      .form-field-wide {
        grid-column: auto;
      }


      .form-heading {
        align-items: flex-start;
      }


      .form-icon {
        width: 44px;
        height: 44px;
        min-width: 44px;
      }


      .form-heading h2 {
        font-size: 19px;
      }


      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }


      .form-actions p-button {
        width: 100%;
      }

    }

  `]
})


export class ExpenseFormComponent
  implements OnInit, OnChanges {


  // =====================================================
  // INPUT / OUTPUT
  // =====================================================

  @Input()
  expenseToEdit: Expense | null = null;


  @Output()
  formSubmitted =
    new EventEmitter<void>();


  @Output()
  cancelEdit =
    new EventEmitter<void>();


  // =====================================================
  // FORM STATE
  // =====================================================

  expenseForm!: FormGroup;

  editMode = false;

  isSaving = false;

  errorMessage = '';

  maxDate = '';


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: {
    label: string;
    value: ExpenseCategory;
  }[] = [

    {
      label: 'Food',
      value: 'Food'
    },

    {
      label: 'Transport',
      value: 'Transport'
    },

    {
      label: 'Shopping',
      value: 'Shopping'
    },

    {
      label: 'Bills',
      value: 'Bills'
    },

    {
      label: 'Entertainment',
      value: 'Entertainment'
    },

    {
      label: 'Other',
      value: 'Other'
    }

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.maxDate =
      localDateString(new Date());

    this.initForm();


    // Important:
    // Handle edit data that already exists
    // before ngOnInit finishes.

    if (this.expenseToEdit) {

      this.loadExpenseForEdit(
        this.expenseToEdit
      );

    }

  }


  // =====================================================
  // INPUT CHANGES
  // =====================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['expenseToEdit'] &&
      this.expenseToEdit
    ) {

      this.editMode = true;

      this.errorMessage = '';


      // ngOnChanges can run before ngOnInit.
      // In that case ngOnInit will handle it.

      if (!this.expenseForm) {
        return;
      }


      this.loadExpenseForEdit(
        this.expenseToEdit
      );

    }


    if (
      changes['expenseToEdit'] &&
      !this.expenseToEdit
    ) {

      this.editMode = false;

      this.errorMessage = '';


      if (this.expenseForm) {
        this.resetForm();
      }

    }

  }


  // =====================================================
  // LOAD EDIT DATA
  // =====================================================

  private loadExpenseForEdit(
    expense: Expense
  ): void {

    this.editMode = true;

    this.expenseForm.patchValue({

      amount: expense.amount,

      category: expense.category,

      date: expense.date,

      note: expense.note ?? ''

    });


    this.expenseForm.markAsPristine();

    this.expenseForm.markAsUntouched();

  }


  // =====================================================
  // INITIALIZE FORM
  // =====================================================

  initForm(): void {

    this.expenseForm =
      this.fb.group({

        amount: [
          null,
          [
            Validators.required,
            Validators.min(0.01)
          ]
        ],

        category: [
          null,
          [
            Validators.required
          ]
        ],

        date: [
          this.maxDate,
          [
            Validators.required,
            noFutureDateValidator()
          ]
        ],

        note: [
          '',
          [
            Validators.maxLength(200)
          ]
        ]

      });

  }


  // =====================================================
  // NOTE LENGTH
  // =====================================================

  get noteLength(): number {

    const value =
      this.expenseForm
        ?.get('note')
        ?.value;

    return String(value ?? '').length;

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.errorMessage = '';


    if (this.isSaving) {
      return;
    }


    // Validate

    if (this.expenseForm.invalid) {

      this.expenseForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.expenseForm.getRawValue();


    // Normalize amount

    const amount =
      Number(formValue.amount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      this.expenseForm
        .get('amount')
        ?.setErrors({
          invalidAmount: true
        });

      this.expenseForm
        .get('amount')
        ?.markAsTouched();

      return;

    }


    // ===================================================
    // EXPENSE DATA
    // ===================================================

    const expenseData: Omit<Expense, 'id'> = {
  amount,

  category:
    formValue.category as ExpenseCategory,

  date:
    String(formValue.date),

  note:
    String(formValue.note ?? '').trim()
};


    this.isSaving = true;


    // ===================================================
    // UPDATE
    // ===================================================

    if (
      this.editMode &&
      this.expenseToEdit
    ) {

      this.expenseService
        .updateExpense(
          this.expenseToEdit.id,
          expenseData
        )
        .subscribe({

          next: () => {

            this.expenseService
              .loadExpenses();

            this.finishSuccessfully();

          },


          error: (error) => {

            console.error(
              'Error updating expense:',
              error
            );

            this.isSaving = false;

            this.errorMessage =
              'Failed to update the expense. Please try again.';

          }

        });

      return;

    }


    // ===================================================
    // ADD
    // ===================================================

    this.expenseService
      .addExpense(expenseData)
      .subscribe({

        next: () => {

          this.expenseService
            .loadExpenses();

          this.finishSuccessfully();

        },


        error: (error) => {

          console.error(
            'Error adding expense:',
            error
          );

          this.isSaving = false;

          this.errorMessage =
            'Failed to add the expense. Please try again.';

        }

      });

  }


  // =====================================================
  // SUCCESS
  // =====================================================

  private finishSuccessfully(): void {

    this.isSaving = false;

    this.errorMessage = '';

    this.editMode = false;

    this.resetForm();

    this.formSubmitted.emit();

  }


  // =====================================================
  // CANCEL
  // =====================================================

  onCancel(): void {

    if (this.isSaving) {
      return;
    }


    this.errorMessage = '';

    this.editMode = false;

    this.resetForm();

    this.cancelEdit.emit();

  }


  // =====================================================
  // RESET
  // =====================================================

  private resetForm(): void {

    if (!this.expenseForm) {
      return;
    }


    this.expenseForm.reset({

      amount: null,

      category: null,

      date: this.maxDate,

      note: ''

    });


    this.expenseForm.markAsPristine();

    this.expenseForm.markAsUntouched();

  }

}