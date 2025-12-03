export class DocumentGrid {
  selected: boolean = false;
  documentId: number=0;
  documentCreationDate: Date=new Date();
  personName: string='';
  documentDescription: string='';
}


export class DocumentItemGrid {
  selected: boolean = false;
  documentId: number=0
  itemId: number=0
  itemDescription: string='';
}

export class DocumentItemDetailGrid {
  selected: boolean = false;
  documentId: number=0
  itemId: number=0
  detailId: number=0
  detailDescription: string='';
}
