import {
  Directive,
  ElementRef,
  Renderer2,
  effect,
  input
} from '@angular/core';

@Directive({
  selector: '[appHighlightOverBudget]',
  standalone: true
})
export class HighlightOverBudgetDirective {

  /**
   * The expense amount.
   *
   * Usage:
   * [appHighlightOverBudget]="expense.amount"
   */
  amount = input<number>(0, {
    alias: 'appHighlightOverBudget'
  });

  /**
   * The amount above which the expense should be highlighted.
   *
   * Usage:
   * [threshold]="500"
   *
   * Default = 100
   */
  threshold = input<number>(100);

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {
    effect(() => {
      const amount = Number(this.amount());
      const threshold = Number(this.threshold());

      if (
        Number.isFinite(amount) &&
        Number.isFinite(threshold) &&
        amount > threshold
      ) {
        this.highlight();
      } else {
        this.removeHighlight();
      }
    });
  }

  private highlight(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      'rgba(239, 68, 68, 0.08)'
    );

    this.renderer.setStyle(
      this.el.nativeElement,
      'border-left',
      '4px solid #ef4444'
    );

    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.2s ease, border-left 0.2s ease'
    );
  }

  private removeHighlight(): void {
    this.renderer.removeStyle(
      this.el.nativeElement,
      'background-color'
    );

    this.renderer.removeStyle(
      this.el.nativeElement,
      'border-left'
    );

    this.renderer.removeStyle(
      this.el.nativeElement,
      'transition'
    );
  }
}