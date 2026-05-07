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
      'BUTTON.persons': 'Personas',
      'BUTTON.lists': 'Listados',
      'BUTTON.apply': 'Aplicar',
      'BUTTON.config': 'Configuración',
      'BUTTON.empresas': 'Empresas',
      'BUTTON.addColumn': 'Agregar Columna',
      'BUTTON.moveUp': 'Subir',
      'BUTTON.moveDown': 'Bajar',
      'BUTTON.remove': 'Eliminar',
      'BUTTON.expandAll': 'Expandir Todas',
      'BUTTON.collapseAll': 'Colapsar Todas',

      'LABEL.id': 'ID',
      'LABEL.firstName': 'Nombre',
      'LABEL.lastName': 'Apellido',
      'LABEL.birthDate': 'Fecha de nacimiento',
      'LABEL.actions': 'Acciones',
      'LABEL.codigoAssy': 'Código Assy',
      'LABEL.description': 'Descripción',      
      'LABEL.quantity': 'Cantidad',
      'LABEL.unitPrice': 'Precio',
      'LABEL.totalPrice': 'Total',
      'LABEL.creationDate': 'Creación',
      'LABEL.updateDate': 'Actualización',
      'LABEL.personName': 'Nombre',
      'LABEL.personLastName': 'Apellido',
      'LABEL.personBirthDate': 'Fecha de nacimiento',
      'LABEL.nickname': 'Nickname',
      'LABEL.fullName': 'Nombre completo',
      'LABEL.active': 'Activo',
      'LABEL.maritalStatus': 'Estado civil',
      'LABEL.documentType': 'Tipo documento',
      'LABEL.documentNumber': 'Número documento',
      'LABEL.number': 'Número',
      'LABEL.razonSocial': 'Razón social',
      'LABEL.type': 'Tipo',
      'LABEL.status': 'Estado',
      'LABEL.observacion': 'Observación',
      'LABEL.email': 'Correo electrónico',
      'LABEL.columnsConfiguration': 'Configuración de Columnas',
      'LABEL.column': 'Columna',
      'LABEL.field': 'Campo',
      'LABEL.header': 'Encabezado',
      'LABEL.position': 'Posición',
      'LABEL.width': 'Ancho',
      'LABEL.align': 'Alineación',
      'LABEL.visible': 'Visible',
      'LABEL.hidden': 'Oculta',
      'LABEL.sortable': 'Ordenable',
      'LABEL.fixed': 'Fija',
      'LABEL.dateFormat': 'Formato Fecha',
      'LABEL.gridName': 'Nombre de la Grilla',
      'LABEL.backgroundColor': 'Color Fondo',
      'LABEL.textColor': 'Color Texto',
      'LABEL.gridHighlightColor': 'Color Resaltado',
      'LABEL.gridMouseOverColor': 'Color Mouse Over',
      'LABEL.gridCellActionsBackgroundColor': 'Color Fondo Acciones',
      'LABEL.gridConfiguration': 'Configuración de Grilla',
                  
      'TITLE.configurationApp': 'Configuracion de aplicaciones',
      'TITLE.personData': 'Datos de la persona',
      'TITLE.filter': 'Filtro',
      'TITLE.persons': 'Personas',
      'TITLE.entities': 'Entidades',
      'TITLE.empresas': 'Empresas',
      'TITLE.articles': 'Artículos',
      'TITLE.invoices': 'Facturas',
      'TITLE.invoiceData': 'Detalles de la factura',

      'MESSAGE.confirmDelete': '¿Estás seguro de que deseas eliminar este registro?',
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
      'BUTTON.persons': 'Persons',
      'BUTTON.lists': 'Listados',
      'BUTTON.apply': 'Apply',
      'BUTTON.config': 'Config',
      'BUTTON.empresas': 'Companies',
      'BUTTON.addColumn': 'Add Column',
      'BUTTON.moveUp': 'Move Up',
      'BUTTON.moveDown': 'Move Down',
      'BUTTON.remove': 'Remove',
      'BUTTON.expandAll': 'Expand All',
      'BUTTON.collapseAll': 'Collapse All',
      
      'LABEL.id': 'ID',
      'LABEL.razonSocial': 'Business name',
      'LABEL.type': 'Type',
      'LABEL.status': 'Status',
      'LABEL.observacion': 'Observation',
      'LABEL.firstName': 'First Name',
      'LABEL.lastName': 'Last Name',
      'LABEL.birthDate': 'Birth Date',
      'LABEL.personName': 'Name',
      'LABEL.personLastName': 'Last Name',
      'LABEL.nickname': 'Nickname',
      'LABEL.fullName': 'Full Name',
      'LABEL.active': 'Active',
      'LABEL.maritalStatus': 'Marital Status',
      'LABEL.actions': 'Actions',
      'LABEL.columnsConfiguration': 'Columns Configuration',
      'LABEL.column': 'Column',
      'LABEL.field': 'Field',
      'LABEL.header': 'Header',
      'LABEL.position': 'Position',
      'LABEL.width': 'Width',
      'LABEL.align': 'Alignment',
      'LABEL.visible': 'Visible',
      'LABEL.hidden': 'Hidden',
      'LABEL.sortable': 'Sortable',
      'LABEL.fixed': 'Fixed',
      'LABEL.dateFormat': 'Date Format',
      'LABEL.gridName': 'Grid Name',
      'LABEL.backgroundColor': 'Background Color',
      'LABEL.textColor': 'Text Color',
      'LABEL.gridCellBackgroundColor': 'Cell Background Color',
      'LABEL.gridCellTextColor': 'Cell Text Color',
      'LABEL.gridHighlightColor': 'Highlight Color',
      'LABEL.gridMouseOverColor': 'Mouse Over Color',
      'LABEL.gridCellActionsBackgroundColor': 'Actions Background Color',
      
      'TITLE.configurationApp': 'App Configuration',
      'TITLE.personData': 'Person Data',
      'TITLE.filter': 'Filter',
      'TITLE.persons': 'Persons',
      'TITLE.entities': 'Entities',
      'TITLE.empresas': 'Companies',

      'MESSAGE.confirmDelete': 'Are you sure you want to delete this record?',
      'MESSAGE.confirmCancel': 'The changes were not saved. Do you want to leave without saving?',
      'MESSAGE.successDelete': 'Deleted successfully',
      'MESSAGE.successSave': 'Saved successfully',
      'MESSAGE.errorSave': 'Error saving',
      'MESSAGE.errorDelete': 'Error deleting',
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
