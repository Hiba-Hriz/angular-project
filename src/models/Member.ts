import { Outil } from "./Outil ";
import { Publication } from "./Publication";

export interface Member {
  id?: number;
  cin: string;
  name: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  password: string;
  pubs?: Publication[];
  outils?: Outil[];
  evens?: any[];
  cv?: string;
  photo?: string;
  type_mbr?: string;  // 'enc' ou 'etd'
  type?: string;
  grade?: string;
  etablissement?: string;
  dateInscription?: string;
  diplome?: string;

  firebaseUid?: string; // ajouté ici


}