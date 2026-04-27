import { EnumObjectMode } from "../enums/object-mode.enum";

export abstract class EntityObject {   
  objectMode: EnumObjectMode = EnumObjectMode.NEW;

  abstract objectType: string;
  abstract objectKey: string;

}