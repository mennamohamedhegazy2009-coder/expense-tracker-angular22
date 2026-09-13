import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AiChatComponent } from '../components/expense-list/ai-chat.component';

describe('AiChatComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiChatComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    const fixture = TestBed.createComponent(AiChatComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls the project AI endpoint and displays the assistant response', () => {
    const fixture = TestBed.createComponent(AiChatComponent);
    const component = fixture.componentInstance;
    component.userInput = 'How much did I spend?';

    component.send();

    const request = httpTesting.expectOne('/api/ai/chat');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ prompt: 'How much did I spend?' });
    request.flush({ content: 'You spent $100.' });

    expect(component.messages().at(-1)?.content).toBe('You spent $100.');
    expect(component.isLoading()).toBe(false);
  });

  it('shows the generic error and blocks duplicate requests while loading', () => {
    const fixture = TestBed.createComponent(AiChatComponent);
    const component = fixture.componentInstance;
    component.userInput = 'First request';

    component.send();
    component.userInput = 'Duplicate request';
    component.send();

    const request = httpTesting.expectOne('/api/ai/chat');
    expect(component.isLoading()).toBe(true);
    request.flush({}, { status: 502, statusText: 'Bad Gateway' });

    expect(component.messages().at(-1)?.content).toBe('Sorry, something went wrong with API.');
    expect(component.isLoading()).toBe(false);
    httpTesting.expectNone('/api/ai/chat');
  });
});
