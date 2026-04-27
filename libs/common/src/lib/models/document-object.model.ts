import { EnumObjectMode } from "../enums/object-mode.enum";

export abstract class DocumentObject {
  objectMode: EnumObjectMode = EnumObjectMode.NEW;  

  abstract objectType: string;
  abstract objectKey: string;

}