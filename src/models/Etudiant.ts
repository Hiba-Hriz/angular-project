import { Enseignant } from "./Enseignant";
import { Member } from "./Member";


export interface Etudiant extends Member {
    diplome: string;
    dateInscription: string;
    // On autorise soit un Member complet, soit juste un objet avec un ID
    encadrant?: Member | { id: number } | null;
}