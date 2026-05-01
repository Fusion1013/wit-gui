import { NgModule } from '@angular/core';
import { ApiModule, Configuration } from './api';

export function apiConfig() {
  return new Configuration({
    basePath: 'http://localhost:8080'
  });
}

@NgModule({
  imports: [
    ApiModule.forRoot(apiConfig)
  ]
})
export class AppModule {}
