export class DocumentFilter {
	documentId?: number=0;
	personName: string='';
	documentDescription: string='';
	documentCreationDate: Date=new Date();

	toString(): string {
		const params = new URLSearchParams();
		if (this.documentId !== undefined && this.documentId !== null) {
			params.append('documentId', this.documentId.toString());
		}
		if (this.personName) {
			params.append('personName', this.personName);
		}
		if (this.documentDescription) {
			params.append('documentDescription', this.documentDescription);
		}
		if (this.documentCreationDate) {
			params.append('documentCreationDate', this.documentCreationDate.toISOString());
		}
		return params.toString();
	}
}