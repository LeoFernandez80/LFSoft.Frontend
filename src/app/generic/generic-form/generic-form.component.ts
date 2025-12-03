import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-generic-form',
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.scss'],
  standalone: true,

})
export class GenericFormComponent {
  @Input() title: string = '';
  @Input() showActions: boolean = true;

}
