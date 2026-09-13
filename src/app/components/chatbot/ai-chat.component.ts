import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { ExpenseService } from '../../services/expense.service';
import {
  AiChatbotService,
  AiChatMessage
} from '../../services/ai-chatbot.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,

  imports: [
    FormsModule,
    ButtonModule
  ],

  template: `
    <section class="ai-page">

      <!-- HERO -->
      <div class="ai-hero">

        <div class="hero-left">

          <div class="ai-icon-wrapper">
            <div class="ai-icon">
              <i class="pi pi-bolt"></i>
            </div>

            <span class="online-dot"></span>
          </div>

          <div class="hero-content">

            <div class="eyebrow">
              <i class="pi pi-bolt"></i>
              SMART FINANCE
            </div>

            <h1>AI Financial Assistant</h1>

            <p>
              Understand your spending, discover patterns,
              and make smarter financial decisions.
            </p>

          </div>

        </div>

        <div class="assistant-status">

          <span class="status-dot"></span>

          <div>
            <strong>Assistant Online</strong>
            <small>Ready to help</small>
          </div>

        </div>

      </div>


      <!-- CHAT CARD -->
      <div class="chat-card">

        <!-- TOP BAR -->
        <div class="chat-topbar">

          <div class="conversation-info">

            <div class="mini-ai-icon">
              <i class="pi pi-bolt"></i>
            </div>

            <div>
              <strong>Financial Assistant</strong>

              <span>
                Ask me anything about your expenses
              </span>
            </div>

          </div>

          <div class="secure-badge">
            <i class="pi pi-shield"></i>
            <span>Private &amp; Secure</span>
          </div>

        </div>


        <!-- CHAT AREA -->
        <div
          class="chat-area"
          aria-live="polite"
          aria-label="AI conversation"
        >

          <!-- WELCOME -->
          @if (messages().length === 1 && !isLoading()) {

            <div class="welcome-area">

              <div class="welcome-icon">
                <i class="pi pi-bolt"></i>
              </div>

              <h2>How can I help you today?</h2>

              <p>
                Ask questions about your expenses,
                spending habits, categories, or financial activity.
              </p>


              <div class="suggestions">

                <!-- TOTAL -->
                <button
                  type="button"
                  class="suggestion-card"
                  (click)="useSuggestion('How much have I spent in total?')"
                  [disabled]="isLoading()"
                >

                  <div class="suggestion-icon blue">
                    <i class="pi pi-chart-line"></i>
                  </div>

                  <div class="suggestion-text">
                    <strong>Total spending</strong>
                    <span>How much have I spent?</span>
                  </div>

                  <i class="pi pi-arrow-right suggestion-arrow"></i>

                </button>


                <!-- CATEGORY -->
                <button
                  type="button"
                  class="suggestion-card"
                  (click)="useSuggestion('What category do I spend the most on?')"
                  [disabled]="isLoading()"
                >

                  <div class="suggestion-icon purple">
                    <i class="pi pi-chart-pie"></i>
                  </div>

                  <div class="suggestion-text">
                    <strong>Top category</strong>
                    <span>Where does my money go?</span>
                  </div>

                  <i class="pi pi-arrow-right suggestion-arrow"></i>

                </button>


                <!-- SUMMARY -->
                <button
                  type="button"
                  class="suggestion-card"
                  (click)="useSuggestion('Give me a summary of my expenses.')"
                  [disabled]="isLoading()"
                >

                  <div class="suggestion-icon green">
                    <i class="pi pi-file"></i>
                  </div>

                  <div class="suggestion-text">
                    <strong>Expense summary</strong>
                    <span>Give me an overview</span>
                  </div>

                  <i class="pi pi-arrow-right suggestion-arrow"></i>

                </button>


                <!-- ADVICE -->
                <button
                  type="button"
                  class="suggestion-card"
                  (click)="useSuggestion('How can I reduce my expenses?')"
                  [disabled]="isLoading()"
                >

                  <div class="suggestion-icon orange">
                    <i class="pi pi-lightbulb"></i>
                  </div>

                  <div class="suggestion-text">
                    <strong>Save money</strong>
                    <span>Give me some advice</span>
                  </div>

                  <i class="pi pi-arrow-right suggestion-arrow"></i>

                </button>

              </div>

            </div>

          }


          <!-- MESSAGES -->
          @for (msg of messages(); track $index) {

            <div
              class="message-row"
              [class.user-row]="msg.role === 'user'"
              [class.assistant-row]="msg.role === 'assistant'"
            >

              <!-- AI AVATAR -->
              @if (msg.role === 'assistant') {

                <div
                  class="message-avatar assistant-avatar"
                  aria-hidden="true"
                >
                  <i class="pi pi-bolt"></i>
                </div>

              }


              <!-- MESSAGE -->
              <div
                class="message-bubble"
                [class.user-bubble]="msg.role === 'user'"
                [class.assistant-bubble]="msg.role === 'assistant'"
              >

                <div class="message-header">

                  <span>
                    {{ msg.role === 'user' ? 'You' : 'AI Assistant' }}
                  </span>

                  @if (msg.role === 'assistant') {

                    <i class="pi pi-check-circle"></i>

                  }

                </div>

                <div class="message-content">
                  {{ msg.content }}
                </div>

              </div>


              <!-- USER AVATAR -->
              @if (msg.role === 'user') {

                <div
                  class="message-avatar user-avatar"
                  aria-hidden="true"
                >
                  <i class="pi pi-user"></i>
                </div>

              }

            </div>

          }


          <!-- THINKING -->
          @if (isLoading()) {

            <div class="message-row assistant-row">

              <div class="message-avatar assistant-avatar">
                <i class="pi pi-bolt"></i>
              </div>

              <div class="message-bubble assistant-bubble thinking-bubble">

                <div class="message-header">
                  <span>AI Assistant</span>
                </div>

                <div class="thinking-content">

                  <span>Analyzing your expenses</span>

                  <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                </div>

              </div>

            </div>

          }

        </div>


        <!-- COMPOSER -->
        <div class="composer-wrapper">

          <div class="composer">

            <div class="input-icon">
              <i class="pi pi-bolt"></i>
            </div>

            <input
              type="text"
              [(ngModel)]="userInput"
              (keydown.enter)="send()"
              placeholder="Ask your financial assistant..."
              aria-label="Ask the AI financial assistant"
              autocomplete="off"
              [disabled]="isLoading()"
            />

            <p-button
              icon="pi pi-arrow-up"
              [rounded]="true"
              [disabled]="isLoading() || !userInput.trim()"
              [loading]="isLoading()"
              (onClick)="send()"
              aria-label="Send message"
            ></p-button>

          </div>


          <div class="composer-footer">

            <span>
              <i class="pi pi-info-circle"></i>
              AI-generated insights may not always be accurate.
            </span>

            <span>
              Press <strong>Enter</strong> to send
            </span>

          </div>

        </div>

      </div>

    </section>
  `,

  styles: [`

    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }

    * {
      box-sizing: border-box;
    }

    .ai-page {
      width: 100%;
      min-height: 650px;
      padding: 4px 0 20px;

      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      color: #172033;
    }

    /* =========================
       HERO
    ========================= */

    .ai-hero {
      position: relative;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 26px 30px;
      margin-bottom: 18px;

      border-radius: 22px;

      background:
        radial-gradient(
          circle at 10% 20%,
          rgba(99, 102, 241, 0.13),
          transparent 30%
        ),
        radial-gradient(
          circle at 90% 80%,
          rgba(37, 99, 235, 0.10),
          transparent 30%
        ),
        #ffffff;

      border: 1px solid #e7eaf0;

      box-shadow:
        0 8px 30px rgba(15, 23, 42, 0.05);

      overflow: hidden;
    }

    .ai-hero::after {
      content: "";

      position: absolute;

      width: 180px;
      height: 180px;

      right: -70px;
      top: -90px;

      border-radius: 50%;

      background: rgba(99, 102, 241, 0.06);

      pointer-events: none;
    }

    .hero-left {
      display: flex;
      align-items: center;

      gap: 17px;

      z-index: 1;
    }

    .ai-icon-wrapper {
      position: relative;
    }

    .ai-icon {
      width: 62px;
      height: 62px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 18px;

      background:
        linear-gradient(
          135deg,
          #6366f1,
          #2563eb
        );

      color: #ffffff;

      font-size: 25px;

      box-shadow:
        0 10px 24px rgba(79, 70, 229, 0.25);
    }

    .online-dot {
      position: absolute;

      width: 13px;
      height: 13px;

      right: -2px;
      bottom: -2px;

      border-radius: 50%;

      background: #22c55e;

      border: 3px solid #ffffff;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
    }

    .eyebrow {
      display: flex;
      align-items: center;

      gap: 6px;
      margin-bottom: 5px;

      color: #6366f1;

      font-size: 10px;
      font-weight: 800;

      letter-spacing: 1.4px;
    }

    .eyebrow i {
      font-size: 11px;
    }

    .hero-content h1 {
      margin: 0;

      font-size: 25px;
      font-weight: 750;

      letter-spacing: -0.5px;

      color: #172033;
    }

    .hero-content p {
      margin: 5px 0 0;

      color: #7a8496;

      font-size: 13px;
      line-height: 1.5;
    }

    .assistant-status {
      display: flex;
      align-items: center;

      gap: 9px;

      padding: 10px 15px;

      border-radius: 12px;

      background: #f8fafc;

      border: 1px solid #e9edf3;

      z-index: 2;
    }

    .status-dot {
      width: 9px;
      height: 9px;

      border-radius: 50%;

      background: #22c55e;

      box-shadow:
        0 0 0 4px rgba(34, 197, 94, 0.10);
    }

    .assistant-status div {
      display: flex;
      flex-direction: column;

      gap: 2px;
    }

    .assistant-status strong {
      font-size: 12px;
      color: #263247;
    }

    .assistant-status small {
      font-size: 10px;
      color: #8b95a5;
    }

    /* =========================
       CHAT CARD
    ========================= */

    .chat-card {
      background: #ffffff;

      border: 1px solid #e7eaf0;

      border-radius: 22px;

      overflow: hidden;

      box-shadow:
        0 8px 30px rgba(15, 23, 42, 0.055);
    }

    .chat-topbar {
      min-height: 72px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 14px 22px;

      border-bottom: 1px solid #edf0f4;

      background: #ffffff;
    }

    .conversation-info {
      display: flex;
      align-items: center;

      gap: 11px;
    }

    .mini-ai-icon {
      width: 40px;
      height: 40px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 12px;

      background: #eef2ff;

      color: #6366f1;

      font-size: 16px;
    }

    .conversation-info > div:last-child {
      display: flex;
      flex-direction: column;

      gap: 3px;
    }

    .conversation-info strong {
      color: #263247;

      font-size: 13px;
      font-weight: 700;
    }

    .conversation-info span {
      color: #8a94a5;

      font-size: 11px;
    }

    .secure-badge {
      display: flex;
      align-items: center;

      gap: 6px;

      padding: 7px 10px;

      border-radius: 8px;

      background: #f8fafc;

      color: #7c8798;

      font-size: 10px;
      font-weight: 600;
    }

    .secure-badge i {
      color: #22c55e;

      font-size: 11px;
    }

    /* =========================
       CHAT AREA
    ========================= */

    .chat-area {
      min-height: 430px;
      max-height: 500px;

      overflow-y: auto;

      padding: 26px;

      background:
        linear-gradient(
          180deg,
          #fbfcfe 0%,
          #f8fafc 100%
        );

      scroll-behavior: smooth;
    }

    .chat-area::-webkit-scrollbar {
      width: 6px;
    }

    .chat-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-area::-webkit-scrollbar-thumb {
      background: #d9dee7;
      border-radius: 10px;
    }

    /* =========================
       WELCOME
    ========================= */

    .welcome-area {
      max-width: 650px;

      margin: 12px auto 20px;

      text-align: center;
    }

    .welcome-icon {
      width: 64px;
      height: 64px;

      margin: 0 auto 14px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 20px;

      background:
        linear-gradient(
          135deg,
          #eef2ff,
          #e0e7ff
        );

      color: #6366f1;

      font-size: 25px;

      box-shadow:
        0 8px 20px rgba(99, 102, 241, 0.10);
    }

    .welcome-area h2 {
      margin: 0;

      color: #202b3f;

      font-size: 20px;
      font-weight: 700;
    }

    .welcome-area > p {
      max-width: 510px;

      margin: 8px auto 22px;

      color: #8993a3;

      font-size: 12px;
      line-height: 1.6;
    }

    .suggestions {
      display: grid;

      grid-template-columns: repeat(2, 1fr);

      gap: 10px;

      text-align: left;
    }

    .suggestion-card {
      width: 100%;

      display: flex;
      align-items: center;

      gap: 10px;

      padding: 13px;

      border: 1px solid #e8ecf2;

      border-radius: 13px;

      background: #ffffff;

      cursor: pointer;

      text-align: left;

      transition:
        transform 0.18s ease,
        border-color 0.18s ease,
        box-shadow 0.18s ease;
    }

    .suggestion-card:hover:not(:disabled) {
      transform: translateY(-2px);

      border-color: #cdd5ff;

      box-shadow:
        0 8px 20px rgba(37, 99, 235, 0.07);
    }

    .suggestion-card:disabled {
      cursor: not-allowed;

      opacity: 0.65;
    }

    .suggestion-icon {
      width: 34px;
      height: 34px;

      min-width: 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 10px;

      font-size: 13px;
    }

    .suggestion-icon.blue {
      background: #eff6ff;
      color: #2563eb;
    }

    .suggestion-icon.purple {
      background: #f5f3ff;
      color: #7c3aed;
    }

    .suggestion-icon.green {
      background: #f0fdf4;
      color: #16a34a;
    }

    .suggestion-icon.orange {
      background: #fff7ed;
      color: #ea580c;
    }

    .suggestion-card > div:nth-child(2) {
      flex: 1;

      display: flex;
      flex-direction: column;

      gap: 2px;
    }

    .suggestion-card strong {
      color: #303b4f;

      font-size: 11px;
      font-weight: 700;
    }

    .suggestion-card span {
      color: #919aaa;

      font-size: 10px;
    }

    .suggestion-card > i:last-child {
      color: #a7afbc;

      font-size: 10px;
    }

    /* =========================
       MESSAGES
    ========================= */

    .message-row {
      display: flex;
      align-items: flex-end;

      gap: 9px;

      margin-bottom: 16px;

      animation: messageAppear 0.25s ease-out;
    }

    .assistant-row {
      justify-content: flex-start;
    }

    .user-row {
      justify-content: flex-end;
    }

    .message-avatar {
      width: 32px;
      height: 32px;

      min-width: 32px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 10px;

      font-size: 12px;
    }

    .assistant-avatar {
      background:
        linear-gradient(
          135deg,
          #6366f1,
          #4f46e5
        );

      color: #ffffff;

      box-shadow:
        0 4px 10px rgba(79, 70, 229, 0.18);
    }

    .user-avatar {
      background: #e8eefc;

      color: #4264a8;
    }

    .message-bubble {
      max-width: min(72%, 650px);

      padding: 11px 14px;

      border-radius: 14px;

      font-size: 13px;
      line-height: 1.55;
    }

    .assistant-bubble {
      background: #ffffff;

      border: 1px solid #e5e9f0;

      border-bottom-left-radius: 4px;

      color: #3f4b5e;

      box-shadow:
        0 3px 10px rgba(15, 23, 42, 0.035);
    }

    .user-bubble {
      background:
        linear-gradient(
          135deg,
          #2563eb,
          #1d4ed8
        );

      color: #ffffff;

      border-bottom-right-radius: 4px;

      box-shadow:
        0 5px 14px rgba(37, 99, 235, 0.16);
    }

    .message-header {
      display: flex;
      align-items: center;

      gap: 5px;

      margin-bottom: 4px;

      font-size: 9px;
      font-weight: 700;

      letter-spacing: 0.2px;
    }

    .assistant-bubble .message-header {
      color: #6366f1;
    }

    .assistant-bubble .message-header i {
      font-size: 9px;
      color: #22c55e;
    }

    .user-bubble .message-header {
      color: rgba(255, 255, 255, 0.72);
    }

    .message-content {
      white-space: pre-wrap;

      word-break: break-word;
    }

    /* =========================
       THINKING
    ========================= */

    .thinking-bubble {
      min-width: 200px;
    }

    .thinking-content {
      display: flex;
      align-items: center;

      gap: 9px;

      color: #8993a3;

      font-size: 11px;
    }

    .thinking-dots {
      display: flex;
      align-items: center;

      gap: 3px;
    }

    .thinking-dots span {
      width: 4px;
      height: 4px;

      border-radius: 50%;

      background: #6366f1;

      animation:
        typing 1.2s infinite ease-in-out;
    }

    .thinking-dots span:nth-child(2) {
      animation-delay: 0.15s;
    }

    .thinking-dots span:nth-child(3) {
      animation-delay: 0.3s;
    }

    /* =========================
       COMPOSER
    ========================= */

    .composer-wrapper {
      padding: 15px 20px 13px;

      background: #ffffff;

      border-top: 1px solid #edf0f4;
    }

    .composer {
      display: flex;
      align-items: center;

      gap: 9px;

      height: 50px;

      padding: 5px 6px 5px 13px;

      background: #f8fafc;

      border: 1px solid #e1e6ed;

      border-radius: 14px;

      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .composer:focus-within {
      border-color: #a5b4fc;

      box-shadow:
        0 0 0 3px rgba(99, 102, 241, 0.08);
    }

    .input-icon {
      color: #8b95a6;

      font-size: 14px;
    }

    .composer input {
      flex: 1;

      min-width: 0;

      height: 100%;

      border: none !important;

      outline: none !important;

      background: transparent !important;

      box-shadow: none !important;

      padding: 0 3px;

      color: #273247;

      font-size: 13px;
    }

    .composer input::placeholder {
      color: #9ba4b2;
    }

    .composer p-button {
      flex-shrink: 0;
    }

    .composer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 7px 2px 0;

      color: #a0a8b5;

      font-size: 9px;
    }

    .composer-footer span {
      display: flex;
      align-items: center;

      gap: 4px;
    }

    .composer-footer i {
      font-size: 9px;

      color: #6366f1;
    }

    .composer-footer strong {
      color: #737e8e;

      font-weight: 700;
    }

    /* =========================
       ANIMATIONS
    ========================= */

    @keyframes messageAppear {

      from {
        opacity: 0;
        transform: translateY(5px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }

    }

    @keyframes typing {

      0%,
      60%,
      100% {
        opacity: 0.3;
        transform: translateY(0);
      }

      30% {
        opacity: 1;
        transform: translateY(-3px);
      }

    }

    /* =========================
       RESPONSIVE
    ========================= */

    @media (max-width: 768px) {

      .ai-hero {
        padding: 20px;
      }

      .assistant-status {
        display: none;
      }

      .hero-content h1 {
        font-size: 21px;
      }

      .chat-area {
        padding: 18px;

        min-height: 420px;
      }

      .message-bubble {
        max-width: 82%;
      }

    }

    @media (max-width: 520px) {

      .ai-hero {
        padding: 17px;

        border-radius: 17px;
      }

      .hero-left {
        gap: 12px;
      }

      .ai-icon {
        width: 48px;
        height: 48px;

        border-radius: 14px;

        font-size: 19px;
      }

      .hero-content h1 {
        font-size: 18px;
      }

      .hero-content p {
        display: none;
      }

      .eyebrow {
        font-size: 8px;
      }

      .chat-card {
        border-radius: 17px;
      }

      .chat-topbar {
        padding: 12px 15px;
      }

      .secure-badge {
        display: none;
      }

      .chat-area {
        min-height: 430px;

        padding: 15px;
      }

      .suggestions {
        grid-template-columns: 1fr;
      }

      .message-bubble {
        max-width: 82%;

        font-size: 12px;
      }

      .message-avatar {
        width: 28px;
        height: 28px;

        min-width: 28px;
      }

      .composer-wrapper {
        padding: 12px;
      }

      .composer-footer {
        font-size: 8px;
      }

      .composer-footer span:last-child {
        display: none;
      }

    }

  `]
})
export class AiChatComponent {

  private readonly aiChatbotService = inject(AiChatbotService);

  private readonly expenseService = inject(ExpenseService);

  userInput = '';

  isLoading = signal(false);

  messages = signal<AiChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! How can I assist you with your expenses today?'
    }
  ]);


  /**
   * Use one of the predefined questions.
   */
  useSuggestion(text: string): void {

    if (this.isLoading()) {
      return;
    }

    this.userInput = text;

    this.send();
  }


  /**
   * Send user question to the AI service.
   */
  send(): void {

    const prompt = this.userInput.trim();

    /*
     * Prevent empty messages and
     * multiple requests at the same time.
     */
    if (!prompt || this.isLoading()) {
      return;
    }

    /*
     * Add the user's message immediately.
     */
    this.messages.update(list => [
      ...list,
      {
        role: 'user',
        content: prompt
      }
    ]);

    /*
     * Clear the input.
     */
    this.userInput = '';

    /*
     * Show loading state.
     */
    this.isLoading.set(true);

    /*
     * Get the latest expenses from ExpenseService
     * and send them to the AI service.
     */
    this.aiChatbotService
      .sendMessage(
        prompt,
        this.expenseService.expenses()
      )
      .subscribe({

        next: (response: string) => {

          this.messages.update(list => [
            ...list,
            {
              role: 'assistant',
              content: response
            }
          ]);

          this.isLoading.set(false);
        },

        error: (error) => {

          console.error(
            'AI Chatbot Error:',
            error
          );

          this.addErrorMessage();

          this.isLoading.set(false);
        }

      });
  }


  /**
   * Display a friendly error message.
   */
  private addErrorMessage(): void {

    this.messages.update(list => [
      ...list,
      {
        role: 'assistant',
        content:
          'Sorry, I could not connect to the AI service right now. Please try again.'
      }
    ]);
  }
}