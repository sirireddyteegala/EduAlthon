import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex justify-center items-center h-full">
      <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-[#c12535]" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `,
  styles: [`
    .spinner-border {
      border-top-color: transparent;
    }
  `]
})
export class LoadingSpinnerComponent {}
