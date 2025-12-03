import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {
  constructor(private _translationService: TranslationService) {}

  transform(key: string): string {
    return this._translationService.translate(key);
  }
}