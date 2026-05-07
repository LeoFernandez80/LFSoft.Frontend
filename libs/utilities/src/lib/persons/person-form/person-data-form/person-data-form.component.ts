import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { ISectionForm, TranslatePipe } from '@lib/shared';
import { map, Observable, timer } from 'rxjs';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-person-data-form',
  templateUrl: './person-data-form.component.html',
  styleUrls: ['./person-data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class PersonDataFormComponent implements OnInit, ISectionForm {
  @Output() dataChange = new EventEmitter<void>();

  @Input() set person(person: Person | undefined) {
    this._person = person;
    if (person) { this._updatePerson(person); this.isLoading = false; }
  }
  @Input() isLoading: boolean = true;

  personForm: FormGroup = new FormGroup({});
  hiddenFields: string[] = [];

  private _person: Person | undefined;

  get data(): Person { return this._personFormToPerson(); }
  get modified(): boolean { return this.personForm.dirty; }
  get valid(): boolean { return this.personForm.valid; }
  get required(): boolean { return false; }

  constructor(
    private fb: FormBuilder,
    private _authService: AuthService,
    private _userPermissionsService: UserPermissionsService
  ) { this._createForm(); }

  ngOnInit(): void {
    this._loadHiddenFields().subscribe(() => {
      if (this._person) { this._updatePerson(this._person); this.isLoading = false; }
    });
  }

  isHiddenField(fieldName: string): boolean { return this.hiddenFields.includes(fieldName); }

  private _loadHiddenFields(): Observable<null> {
    return timer(1).pipe(map(() => {
      const userRole = this._authService.getCurrentUser()?.role || EnumUserRole.EMPTY;
      this.hiddenFields = this._userPermissionsService.hideFields(userRole, EnumLiteralKeys.eForm_Persons);
      return null;
    }));
  }

  private _createForm(): void {
    this.personForm = this.fb.group({
      person_id: [null],
      person_name: ['', [Validators.required, Validators.minLength(2)]],
      person_lastname: ['', [Validators.required, Validators.minLength(2)]],
      person_nickname: [''],
      person_fullname: [''],
      person_active: [true],
      person_maritalStatus: ['']
    });
    this.personForm.valueChanges.subscribe(() => {
      const name = (this.personForm.get('person_name')?.value || '').trim();
      const lastname = (this.personForm.get('person_lastname')?.value || '').trim();
      const fullname = `${name} ${lastname}`.trim();
      if (this.personForm.get('person_fullname')?.value !== fullname) {
        this.personForm.patchValue({ person_fullname: fullname }, { emitEvent: false });
      }
      this.dataChange.emit();
    });
  }

  private _personFormToPerson(): Person {
    this._person = { ...this._person, ...this.personForm.value } as Person;
    return this._person!;
  }

  private _updatePerson(person: Person): void {
    this.personForm.patchValue(person, { emitEvent: false });
    this.personForm.disable();
    if (person.objectMode !== EnumObjectMode.READONLY) { this.personForm.enable(); }
    this.personForm.markAsPristine();
  }
}
