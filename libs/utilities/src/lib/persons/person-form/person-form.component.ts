import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Person } from '../models/person.model';

import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { UrlSecurityService } from '@lib/security';
import { Action, ActionService, CONFIRM_CANCEL, EnumActionsType, EnumMessageType, FormValidationsDirective, GenericActionsComponent, GenericFormComponent, MessagesService, ModalService, SkeletonDirective, TranslatePipe } from '@lib/shared';
import { HttpErrorResponse } from '@angular/common/http';
import { PersonService } from '../services/person.service';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-utilities-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet,GenericFormComponent, 
    GenericActionsComponent, FormValidationsDirective, TranslatePipe, 
    SkeletonDirective, MatButtonModule, ],
  providers: [ ActionService ]
})
export class PersonFormComponent implements OnInit, OnDestroy {
  @Input() personId: number = 0;
  @Output() save = new EventEmitter<Person>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  personForm: FormGroup = new FormGroup({});
  person: Person = new Person();
  drawerOpen = false;
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;


  constructor(private fb: FormBuilder, private _personService: PersonService, private _route: ActivatedRoute, 
              private _actionService: ActionService,  private _messagesService: MessagesService, 
              private _modalService: ModalService, private _urlSecurityService: UrlSecurityService ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    }
    catch (error) {
      this._messagesService.addMessage( 'Error loading person data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga autom1ticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  isReadyToSave(): boolean {
    return this.personForm.valid && this.personForm.dirty;
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._save();
          break;
        case EnumActionsType.actionCancel:
          this._cancel();          
          break;
        }
    }
    catch (error) {
      this._messagesService.addMessage( error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  
  

  private _createForm() {
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      birthDate: ['', Validators.required]
    });
    this.personForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {                  
      switch (this._operation) {
        case 'open':          
          this._editPerson(this.personId).subscribe(person => {;
            this._updatePerson(person);
            this._enabledActions();
          });
          break;
        default: 
          this._editPerson(this.personId).subscribe(person => {                   
            this._updatePerson(person);
            this._enabledActions();
          });          
      }
    });
  }

  private _editPerson(id: number): Observable<Person> {
    return this._personService.getPerson(id);
  }

  private _updatePerson(person: Person): void {
    this.person = person;    
    this.personForm.patchValue(this.person, { emitEvent: false });
  }

  private _loadParams(): Observable<void> {    
    this._operation = this._route.snapshot.data['operation'];
    
    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid person ID detected:', idParam);
            this._messagesService.addMessage('ID de persona inv1lido', EnumMessageType.Error);
            throw new Error('Invalid person ID');
          }
          
          this.personId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }
  
  private _cancel(): void {    
    if (!this.personForm.dirty) {
      this.cancel.emit();    
      return;
    }
      
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();         
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario cancel1                  
          
        }
      });   
  }

  private _save(): void {
    try {
      if (!this.personForm.dirty) {
        return;
      }

      const formData = this.personForm.value;
      const updatedPerson: Person = {
        ...this.person,
        ...formData
      };
      
      if (!updatedPerson.id){
        this._personService.addPerson(updatedPerson);
      } else{
        this._personService.updatePerson(updatedPerson);
      }
      this.save.emit(updatedPerson);
    } catch (error) {
      throw error;
    }
  }

  //#region Security
  private _loadSecurityActions(): void {
    const actions: Action[] = [
        new Action('BUTTON.save', EnumActionsType.actionSave, 'save', false),
        new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
      ];
    this._actionService.setActions(actions);
  }
  
   private _enabledActions() {    
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionSave);
    } else {
      this._actionService.disable(EnumActionsType.actionSave);
    }
  }
  //#endregion

}
