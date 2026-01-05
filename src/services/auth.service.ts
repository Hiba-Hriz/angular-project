import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Member } from 'src/models/Member';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject pour stocker le membre connecté
  private currentMemberSubject = new BehaviorSubject<Member | null>(null);
  public currentMember$ = this.currentMemberSubject.asObservable();
  constructor(private afAuth: AngularFireAuth) {
    // 🔹 Charger le membre stocké au démarrage
    const storedMember = localStorage.getItem('currentMember');
    if (storedMember) {
      try {
        const member: Member = JSON.parse(storedMember);
        this.currentMemberSubject.next(member);
      } catch {
        localStorage.removeItem('currentMember');
        this.currentMemberSubject.next(null);
      }
    }
  }

  signInWithEmailAndPassword(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  loginMember(member: Member | null): void {
    this.currentMemberSubject.next(member); // ⚡ met à jour le BehaviorSubject
    if (member) {
      localStorage.setItem('currentMember', JSON.stringify(member));
    } else {
      localStorage.removeItem('currentMember');
    }
  }


  // Méthode pour récupérer le membre actuel
  getCurrentMember(): Member | null {
    if (!this.currentMemberSubject.value) {
      const storedMember = localStorage.getItem('currentMember');
      if (storedMember) {
        try {
          const member = JSON.parse(storedMember);
          this.currentMemberSubject.next(member);
          return member;
        } catch {
          localStorage.removeItem('currentMember');
          return null;
        }
      }
      return null;
    }
    return this.currentMemberSubject.value;
  }

  // Observable pour s'abonner aux changements
  getCurrentMemberObservable(): Observable<Member | null> {
    return this.currentMember$;
  }
  signOut() {
    this.currentMemberSubject.next(null);
    localStorage.clear(); // important
    return this.afAuth.signOut(); // Vérifiez que cette méthode fonctionne correctement
  }



  // Vérifier si un utilisateur est connecté
  isLoggedIn(): boolean {
    return this.currentMemberSubject.value !== null;
  }
}