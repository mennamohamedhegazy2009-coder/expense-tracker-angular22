import { Pipe, PipeTransform } from '@angular/core';

import { ExpenseCategory } from '../models/expense.model';

@Pipe({
  name: 'categoryIcon',
  standalone: true
})
export class CategoryIconPipe implements PipeTransform {

  transform(
    category: ExpenseCategory | string | null | undefined
  ): string {

    switch (category) {

      case 'Food':
        return '🍔 Food';

      case 'Transport':
        return '🚗 Transport';

      case 'Shopping':
        return '🛍️ Shopping';

      case 'Bills':
        return '💡 Bills';

      case 'Entertainment':
        return '🎬 Entertainment';

      case 'Other':
        return '📦 Other';

      default:
        return '📦 Other';
    }
  }
}