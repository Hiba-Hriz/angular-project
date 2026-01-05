export interface Publication {
    id?: number;
    type: string;
    titre: string;
    lien: string;
    date: Date;
    sourcePDF: string;
    membreIds: number[];
}