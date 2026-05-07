import { E } from "@angular/cdk/keycodes";
import { EnumLiteralKeys } from "../enums/literal-keys.enum";

export class Configuration {
  userId: string = '';
  terminalId: string = '';
  terminalName: string = '';

  invoicePath: string = '';
  quotesPath: string = '';
  documentsPath: string = '';
  
  items: ConfigurationItem[] = [];
}

export class ConfigurationItem {
  literalKey: EnumLiteralKeys = EnumLiteralKeys.eLiteralKey_Empty;
  color: string = 'RGB(0, 0, 0)';
}