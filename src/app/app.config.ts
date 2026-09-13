import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { API_BASE_URL } from './config/api.config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(),

    {
      provide: API_BASE_URL,
      useValue: 'http://localhost:3000'
    },

    providePrimeNG({
      theme: {
        preset: Aura
      },
      
    })
  ]
};