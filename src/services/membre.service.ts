import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, Observable, switchMap } from 'rxjs';
import { Enseignant } from 'src/models/Enseignant';
import { Etudiant } from 'src/models/Etudiant';
import { Member } from 'src/models/Member';


@Injectable({
  providedIn: 'root'
})
export class MembreService {
  private apiUrl = 'http://localhost:9000/membres';

  constructor(private httpClient: HttpClient,
    private afAuth: AngularFireAuth
  ) {

  }
  //crud sur les membres 
  GetAllMembres(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiUrl);
  }
  // ✅ Ajouter un étudiant avec Firebase + BD
  addEtudiant(etudiant: Etudiant): Observable<any> {
    // 1. Créer l'utilisateur dans Firebase
    return from(
      this.afAuth.createUserWithEmailAndPassword(etudiant.email, etudiant.password)
    ).pipe(
      switchMap(firebaseUser => {
        // 2. Stocker l'UID Firebase dans l'objet
        etudiant.firebaseUid = firebaseUser.user?.uid;

        // 3. Enregistrer dans votre BD
        return this.httpClient.post(`${this.apiUrl}/etudiants`, etudiant);
      })
    );
  }

  addEnseignant(enseignant: Enseignant): Observable<any> {
    return from(
      this.afAuth.createUserWithEmailAndPassword(enseignant.email, enseignant.password)
    ).pipe(
      switchMap(firebaseUser => {
        enseignant.firebaseUid = firebaseUser.user?.uid;
        return this.httpClient.post(`${this.apiUrl}/enseignants`, enseignant);
      })
    );
  }

  DeleteMember(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  GetMemberById(id: string): Observable<any> {
    return this.httpClient.get<Member>(`${this.apiUrl}/${id}`);
  }
  UpdateEtudiant(id: string, data: any) {
    return this.httpClient.put(`${this.apiUrl}/etudiants/${id}`, data);
  }

  UpdateEnseignant(id: string, data: any) {
    return this.httpClient.put(`${this.apiUrl}/enseignants/${id}`, data);
  }
  getMemberByEmail(email: string) {
    return this.httpClient.get<Member[]>(`${this.apiUrl}?email=${email}`);
  }

  updateMember(id: string, m: Member): Observable<void> {
    return this.httpClient.put<void>(`${this.apiUrl}/${id}`, m);
  }
  //pathch tbadil attribut wa7id !!
}
