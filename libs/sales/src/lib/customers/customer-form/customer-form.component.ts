import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../models/customer.model';

import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { 
  EnumActionsType, 
  GenericActionsComponent, 
  ActionService, 
  GenericFormComponent, 
  Action, 
  MessagesService, 
  EnumMessageType, 
  TranslatePipe, 
  ModalService,
  CONFIRM_CANCEL,
  SkeletonDirective,
  FormValidationsDirective
} from '@lib/shared';
import { CustomerService } from '../services/customer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UrlSecurityService } from '@lib/security';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';

@Component({
  selector: 'lfsoft-sales-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, 
    GenericActionsComponent, TranslatePipe, MatButtonModule, 
    SkeletonDirective, FormValidationsDirective],
  providers: [ ActionService ]
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  @Input() customerId: number = 0;
  @Output() save = new EventEmitter<Customer>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  customerForm: FormGroup = new FormGroup({});
  customer: Customer = new Customer();
  drawerOpen = false;
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;

  constructor(private fb: FormBuilder, private _customerService: CustomerService, private _route: ActivatedRoute, 
              private _actionService: ActionService, private _messagesService: MessagesService, 
              private _modalService: ModalService, private _urlSecurityService: UrlSecurityService ) {    
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    }
    catch (error) {
      this._messagesService.addMessage('Error loading customer data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  isReadyToSave(): boolean {
    return this.customerForm.valid && this.customerForm.dirty;
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
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }  

  private _createForm() {
    this.customerForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.minLength(3)]],
      apellido: [null, [Validators.required, Validators.minLength(3)]],
      razonSocial: [null],
      documento: [null, [Validators.required]],
      tipoDocumento: [null, [Validators.required]],
      telefono: [null],
      email: [null, [Validators.required, Validators.email]],
      direccion: [null],
      ciudad: [null],
      provincia: [null],
      codigoPostal: [null],
      activo: [true]
    });
    this.customerForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {    
      console.log("operation", this._operation);
                    
      switch (this._operation) {
        case 'open':          
          this._editCustomer(this.customerId).subscribe(customer => {
            this._updateCustomer(customer);
            this._enabledActions();
          });
          break;
        default: 
          if (this.customerId <= 0) {
            return;
          }
          this._editCustomer(this.customerId).subscribe(customer => {                   
            this._updateCustomer(customer);
            this._enabledActions();
          });          
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
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid customer ID detected:', idParam);
            this._messagesService.addMessage('ID de customer inválido', EnumMessageType.Error);
            throw new Error('Invalid customer ID');
          }
          
          this.customerId = Number(idParam);          
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }

  private _editCustomer(id: number): Observable<Customer> {
    return this._customerService.getCustomer(id);
  }

  private _updateCustomer(customer: Customer): void {
    this.customer = customer;    
    this.customerForm.patchValue(this.customer, { emitEvent: false });
  }
  
  private _cancel(): void {
    if (!this.customerForm.dirty) {
      this.cancel.emit();   
      return;
    }
      
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {          
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();         
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló                  
        }
      });   
  }

  private _save(): void {
    try {
      if (!this.customerForm.dirty) {
        return;
      }

      const updatedCustomer: Customer = this._mapFormToCustomer();
      
      if (!updatedCustomer.id) {
        this._customerService.addCustomer(updatedCustomer).pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe(createdCustomer => {
          this.customerForm.markAsPristine();
          this._enabledActions();
          this.save.emit(createdCustomer);
        });
      } else {
        this._customerService.updateCustomer(updatedCustomer).pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe(updatedCustomer => {
          this.customerForm.markAsPristine();
          this._enabledActions();
          this.save.emit(updatedCustomer);
        }, error => {          
          throw error;
        });
      }
    } catch (error) {      
      throw error;
    }
  }

  //#region Mapping
  private _mapFormToCustomer(): Customer {
    const formValues = this.customerForm.value;
    const customer: Customer = {
      id: this.customer.id,
      nombre: formValues.nombre,
      apellido: formValues.apellido,
      razonSocial: formValues.razonSocial,
      documento: formValues.documento,
      tipoDocumento: formValues.tipoDocumento,
      telefono: formValues.telefono,
      email: formValues.email,
      direccion: formValues.direccion,
      ciudad: formValues.ciudad,
      provincia: formValues.provincia,
      codigoPostal: formValues.codigoPostal,
      activo: formValues.activo
    };
    return customer;
  }
  //#endregion

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
