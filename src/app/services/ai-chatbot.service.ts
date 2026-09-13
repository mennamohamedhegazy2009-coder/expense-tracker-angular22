import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

import { Expense } from '../models/expense.model';
import { environment } from '../../environments/environment';

export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiChatRequest {
  prompt: string;
  expenses: Expense[];
}

export interface AiChatResponse {
  content?: unknown;
  output?: unknown;
  response?: unknown;
  message?: unknown;
  text?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatbotService {

  private readonly http = inject(HttpClient);

  private readonly webhookUrl = environment.aiWebhookUrl;

  sendMessage(
    prompt: string,
    expenses: Expense[]
  ): Observable<string> {

    const request: AiChatRequest = {
      prompt: prompt.trim(),

      expenses: expenses.map(expense => ({
        ...expense,
        amount: Number(expense.amount)
      }))
    };

    return this.http
      .post<AiChatResponse | unknown>(
        this.webhookUrl,
        request
      )
      .pipe(
        map(response => this.extractResponse(response)),

        catchError(error => {

          console.error(
            'AI webhook error:',
            error
          );

          return throwError(
            () =>
              new Error(
                'Unable to connect to AI service.'
              )
          );
        })
      );
  }

  private extractResponse(
    response: AiChatResponse | unknown
  ): string {

    // Plain text response
    if (
      typeof response === 'string' &&
      response.trim()
    ) {
      return response.trim();
    }

    // Array response
    if (Array.isArray(response)) {

      const first = response[0];

      if (
        first &&
        typeof first === 'object'
      ) {
        return this.extractResponse(first);
      }
    }

    // Object response
    if (
      response &&
      typeof response === 'object'
    ) {

      const data =
        response as Record<string, unknown>;

      const candidates = [
        'content',
        'output',
        'response',
        'message',
        'text'
      ];

      for (const key of candidates) {

        const value = data[key];

        if (
          typeof value === 'string' &&
          value.trim()
        ) {
          return value.trim();
        }

        if (
          value &&
          typeof value === 'object'
        ) {

          const nested =
            this.extractResponse(value);

          if (nested) {
            return nested;
          }
        }
      }
    }

    return (
      'I could not understand the AI response. ' +
      'Please try again.'
    );
  }
}