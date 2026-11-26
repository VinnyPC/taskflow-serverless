import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { AppComponent } from './app/app.component';

registerLocaleData(localePt);
bootstrapApplication(AppComponent, { providers: [provideHttpClient()] }).catch(console.error);

