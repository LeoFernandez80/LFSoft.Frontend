import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-slider.component.html',
  styleUrls: ['./login-slider.component.scss']
})
export class LoginSliderComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  currentIndex = 0;
  private _intervalId: any;

  
  ngOnInit(): void {
    if (this.images && this.images.length > 1) {
      this._intervalId = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      }, 4000);
    }
  }

  ngOnDestroy(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }
}
