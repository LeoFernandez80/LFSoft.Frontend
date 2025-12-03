export class document {
    //grid
    documentId: number=0;
    //grid
    personName: string='';
    personId: number=0;
    personDocumentType: string='';
    personDocumentNumber: string=''
    //grid
    documentDescription: string='';
    //grid
    documentCreationDate: Date=new Date();
    documentSentDate: Date=new Date();
    documentStatus: EnumDocumentStatus=EnumDocumentStatus.inCreation;
    creationUserId: number=0;
}


export enum EnumDocumentStatus {
    inCreation=1,
    cancelled=0,
    sent=2,
    invoiced=3,
    rejected=4,
    partiallyInvoiced=5,
    active=6
}