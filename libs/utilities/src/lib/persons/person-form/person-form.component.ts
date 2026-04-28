import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnumActions, EnumObjectMode } from '@lib/common';
import {
  Action, ActionService, CONFIRM_CANCEL, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericFormComponent, ISectionForm, MessagesService, ModalService, TranslatePipe
} from '@lib/shared';
import { UrlSecurityService } from '@lib/security';
import { Observable, map, of } from 'rxjs';
import { Person } from '../models/person.model';
import { HTTPServicePerson } from '../http-services/person.service';
import { PersonDataFormComponent } from './person-data-form/person-data-form.component';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe, PersonDataFormComponent],
  providers: [ActionService]
})
export class PersonFormComponent implements OnInit, OnDestroy {
  @ViewChild('formPersonData') formPersonData!: ISectionForm;

  @Input() set person(person: number | Person) {
    if (person instanceof Person) { this.personData = person; }
    else { this._personId = person; }
  }
  @Output() save = new EventEmitter<Person>();
  @Output() cancel = new EventEmitter<void>();

  personData: Person | undefined = undefined;
  private _personId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _personService: HTTPServicePerson,
    private _route: ActivatedRoute,
    private _actionService: ActionService,
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _urlSecurityService: UrlSecurityService
  ) {}

  ngOnInit(): void { this._loadActions(); this._loadData(); }
  ngOnDestroy(): void {}

  isReadyToSave(): boolean {
    return !!this.personData && this.personData.objectMode !== EnumObjectMode.READONLY
      && this.formPersonData?.valid && this.formPersonData?.modified;
  }

  onPersonDataChange(): void { this._enabledActions(); }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActions.eAction_Save: this._save(); break;
        case EnumActions.eAction_Cancel: this._cancel(); break;
      }
    } catch (error) { this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error); }
  }

  private _cancel(): void {
    if (!this.formPersonData?.modified) { this.cancel.emit(); return; }
    this._modalService.showModal(CONFIRM_CANCEL).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(action => {
      if (action === EnumActionsType.actionAccept) { this.cancel.emit(); }
    });
  }

  private _createPersonRequest(): Person {
    return { ...this.personData, ...this.formPersonData.data } as Person;
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) { this._actionService.enable(EnumActions.eAction_Save); }
    else { this._actionService.disable(EnumActions.eAction_Save); }
  }

  private _loadActions(): void {
    this._actionService.setActions([
      new Action('BUTTON.save', EnumActions.eAction_Save, 'save', true),
      new Action('BUTTON.cancel', EnumActions.eAction_Cancel, 'cancel', false)
    ]);
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this._personId) {
        this._personService.getPerson(this._personId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
          next: person => { person.objectMode = EnumObjectMode.EDITABLE; this.personData = person; this._enabledActions(); },
          error: () => { this._messagesService.addMessage('Error al cargar persona', EnumMessageType.Error); }
        });
      } else {
        const newPerson = new Person();
        newPerson.objectMode = EnumObjectMode.NEW;
        this.personData = newPerson;
        this._enabledActions();
      }
    });
  }

  private _loadParams(): Observable<void> {
    this._operation = this._route.snapshot.data['operation'];
    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            this._messagesService.addMessage('ID de persona inválido', EnumMessageType.Error);
            throw new Error('Invalid person ID');
          }
          this._personId = Number(idParam);
        })
      );
    }
    return of(void 0);
  }

  private _save(): void {
    if (!this.formPersonData?.modified) return;
    const updatedPerson = this._createPersonRequest();
    const saveOperation = !updatedPerson.person_id
      ? this._personService.createPerson(updatedPerson)
      : this._personService.updatePerson(updatedPerson);
    saveOperation.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: savedPerson => {
        savedPerson.objectMode = EnumObjectMode.EDITABLE;
        this.personData = savedPerson;
        this.save.emit(savedPerson);
        this._enabledActions();
      },
      error: () => { this._messagesService.addMessage('Error al guardar persona', EnumMessageType.Error); }
    });
  }
}
