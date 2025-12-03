import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private _translations: { [key: string]: { [key: string]: string } } = {
    es: {
      'VALIDATION.required': 'Este campo es obligatorio.',
      'VALIDATION.minlength': 'Cantidad de caracteres insuficiente.',
      
      'BUTTON.save': 'Guardar',
      'BUTTON.cancel': 'Cancelar',
      'BUTTON.edit': 'Editar',
      'BUTTON.delete': 'Eliminar',
      'BUTTON.accept': 'Aceptar',      
      'BUTTON.close': 'Cerrar',
      'BUTTON.filter': 'Filtrar',
      'BUTTON.clear': 'Limpiar',
      'BUTTON.new': 'Nuevo',
      'BUTTON.lists': 'Listados',
      'BUTTON.apply': 'Aplicar',
      'BUTTON.config': 'Configuración',

      'LABEL.id': 'ID',
      'LABEL.firstName': 'Nombre',
      'LABEL.lastName': 'Apellido',
      'LABEL.birthDate': 'Fecha de nacimiento',
      'LABEL.actions': 'Acciones',
      'LABEL.codigoAssy': 'Código Assy',
      'LABEL.description': 'Descripción',      
      'LABEL.quantity': 'Cantidad',
      'LABEL.unitPrice': 'Precio',
      'LABEL.totalPrice': 'Total',
      'LABEL.creationDate': 'Creación',
      'LABEL.updateDate': 'Actualización',
      'LABEL.personName': 'Nombre',
      'LABEL.personLastName': 'Apellido',
      'LABEL.personBirthDate': 'Fecha de nacimiento',
      'LABEL.documentType': 'Tipo documento',
      'LABEL.documentNumber': 'Número documento',
      'LABEL.number': 'Número',
                  
      'TITLE.configurationApp': 'Configuracion de aplicaciones',
      'TITLE.personData': 'Datos de la persona',
      'TITLE.filter': 'Filtro',
      'TITLE.persons': 'Personas',
      'TITLE.entities': 'Entidades',
      'TITLE.articles': 'Artículos',
      'TITLE.invoices': 'Facturas',
      'TITLE.invoiceData': 'Detalles de la factura',

      'MESSAGE.confirmDelete': '¿Estás seguro de que deseas eliminar este registro?',
      'MESSAGE.confirmCancel': 'Los cambios no se guardaron. ¿Deseas salir sin guardar?',
      'MESSAGE.successDelete': 'Eliminado correctamente',
      'MESSAGE.successSave': 'Guardado correctamente',

      'ERROR.save': 'Error al guardar',
      'ERROR.delete': 'Error al eliminar',
      'ERROR.itemNotFound': 'Item no encontrado',
    },
    en: {
      'VALIDATION.required': 'This field is required.',

      'BUTTON.save': 'Save',
      'BUTTON.cancel': 'Cancel',
      'BUTTON.edit': 'Edit',
      'BUTTON.delete': 'Delete',
      'BUTTON.acept': 'Acept',
      'BUTTON.close': 'Close',
      'BUTTON.filter': 'Filter',
      'BUTTON.clear': 'Clear',
      'BUTTON.new': 'New',
      'BUTTON.lists': 'Listados',
      'BUTTON.apply': 'Apply',
      'BUTTON.config': 'Config',
      
      'LABEL.id': 'ID',
      'LABEL.firstName': 'First Name',
      'LABEL.lastName': 'Last Name',
      'LABEL.birthDate': 'Birth Date',
      'LABEL.actions': 'Actions',
      
      'TITLE.configurationApp': 'App Configuration',
      'TITLE.personData': 'Person Data',
      'TITLE.filter': 'Filter',
      'TITLE.persons': 'Persons',
      'TITLE.entities': 'Entities',

      'MESSAGE.confirmDelete': 'Are you sure you want to delete this record?',
      'MESSAGE.confirmCancel': 'The changes were not saved. Do you want to leave without saving?',
      'MESSAGE.successDelete': 'Deleted successfully',
      'MESSAGE.successSave': 'Saved successfully',
      'MESSAGE.errorSave': 'Error saving',
      'MESSAGE.errorDelete': 'Error deleting',


      // Add more translations here
    }
  };

  private _currentLang = new BehaviorSubject<string>('es');

  constructor() {}

  setLanguage(lang: string): void {
    this._currentLang.next(lang);
  }

  getCurrentLang(): Observable<string> {
    return this._currentLang.asObservable();
  }

  translate(key: string): string {
    const currentLang = this._currentLang.value;
    return this._translations[currentLang][key] || key;
  }

  addTranslations(lang: string, translations: { [key: string]: string }): void {
    this._translations[lang] = { ...this._translations[lang], ...translations };
  }
}