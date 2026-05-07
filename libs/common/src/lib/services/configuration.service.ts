import { Injectable } from '@angular/core';
import { AccessControl } from '../models/access-control.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Configuration } from '../models/configuration.model';
import { Terminal } from '../models/terminal.model';
import { EnumLiteralKeys } from '../enums/literal-keys.enum';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private _userConfigurations$: BehaviorSubject<Configuration> ;
  
  get terminal(): Terminal {
    const terminal = new Terminal();
    terminal.terminalId = this._userConfigurations$.value.terminalId || '';
    terminal.terminalName = this._userConfigurations$.value.terminalName || '';
    return terminal;
  }

  private _configurationMOCK: Configuration[] = [];

  constructor() { 
    this._loadConfigurationMOCK();
    this._userConfigurations$ = new BehaviorSubject<Configuration>(this._configurationMOCK[0]);
  }

  loadUserConfiguration(userId: string): Observable<Configuration | null> {
    //Este metodo iria en el servicio HTTP y debería llamar a la BD para cargar la configuración del usuario por su userId, pero por ahora devuelve un mock
    
    const config = this._configurationMOCK.find(c => c.userId === userId) || null;
    if (config) {
      //localStorage.setItem('config', JSON.stringify(config));
    }
    console.log("load config", userId, config);
    return of(config);
  }

  setConfiguration(config: Configuration): void {
    //guardar en la BD la configuración por el userId
    this._userConfigurations$.next(config);
    localStorage.setItem('config', JSON.stringify(config) );
  }

  getConfiguration(): Observable<Configuration | null> {
    //Este metodo iria en el servicio HTTP y debería llamar a la BD para cargar la configuración del usuario por su userId, pero por ahora devuelve un mock
    return this._userConfigurations$.asObservable();
  }

  private _loadConfigurationMOCK(): void {
    const config = new Configuration();
    config.userId = '42d1037c-366e-4431-bdde-2a93b9d31f49';
    config.terminalId = 'terminal1';
    config.terminalName = 'Administracion 1';
    config.invoicePath = 'c:/invoices';
    config.quotesPath = 'c:/quotes';
    config.documentsPath = 'c:/documents';
    
    config.items = [
      { literalKey: EnumLiteralKeys.eModule_Users, color: 'RGB(255, 0, 0)' },
      { literalKey: EnumLiteralKeys.eModule_UserRoles, color: 'RGB(180, 40, 40)' },
      { literalKey: EnumLiteralKeys.eModule_Entities, color: 'RGB(0, 255, 0)' },
      { literalKey: EnumLiteralKeys.eModule_Companies, color: 'RGB(0, 128, 128)' },
      { literalKey: EnumLiteralKeys.eModule_Persons, color: 'RGB(0, 50, 50)' },
      { literalKey: EnumLiteralKeys.eModule_Paridades, color: 'RGB(100, 120, 128)' },

      { literalKey: EnumLiteralKeys.eModule_Products, color: 'RGB(0, 0, 255)' },
      { literalKey: EnumLiteralKeys.eModule_Sales, color: 'RGB(255, 0, 255)' }      
    ];
    this._configurationMOCK.push(config);
    const config2 = new Configuration();
    config2.userId = '7c314fa4-2aad-4cce-bc1f-62791a3f7b74';
    config2.terminalId = 'terminal2';
    config2.terminalName = 'Tecnica 1';
    config2.invoicePath = 'c:/invoices';
    config2.quotesPath = 'c:/quotes';
    config2.documentsPath = 'c:/documents';
    
    config2.items = [
      { literalKey: EnumLiteralKeys.eModule_Users, color: 'RGB(0, 255, 0)' },
      { literalKey: EnumLiteralKeys.eModule_UserRoles, color: 'RGB(0, 180, 120)' },
      { literalKey: EnumLiteralKeys.eModule_Companies, color: 'RGB(0, 128, 128)' },
      { literalKey: EnumLiteralKeys.eModule_Persons, color: 'RGB(0, 50, 50)' },
      { literalKey: EnumLiteralKeys.eModule_Paridades, color: 'RGB(100, 120, 128)' },
      { literalKey: EnumLiteralKeys.eModule_Entities, color: 'RGB(0, 255, 0)' },

      { literalKey: EnumLiteralKeys.eModule_Products, color: 'RGB(255, 0, 0)' },
      { literalKey: EnumLiteralKeys.eModule_Sales, color: 'RGB(255, 0, 255)' }      
    ];
    this._configurationMOCK.push(config2);
  }
}
