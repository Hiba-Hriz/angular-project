import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Member } from 'src/models/Member';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/services/auth.service';
import { MembreService } from 'src/services/membre.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = "";
  password: string = "";

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private AS: AuthService,
    private MS: MembreService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }
  login() {
    if (!this.email || !this.password) {
      this.errorMessage = "Veuillez remplir tous les champs.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // ✅ Cas spécial ADMIN
    if (this.email === 'admin@lri.tn' && this.password === 'admin123') {
      localStorage.setItem('userType', 'administrateur');
      this.AS.loginMember(null); // pas de membre associé
      this.router.navigate(['/member']);
      this.isLoading = false;
      return;
    }

    // Si email admin incorrect mais présent → rejet
    if (this.email === 'admin@lri.tn') {
      this.errorMessage = "Mot de passe incorrect pour l'administrateur.";
      this.isLoading = false;
      return;
    }

    // 🔹 Membres normaux (consultation de la base)
    this.AS.signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        this.MS.getMemberByEmail(this.email).subscribe({
          next: (members: Member[]) => {
            if (members && members.length > 0) {
              const member = members.find(m => m.email === this.email);
              if (member) {
                this.AS.loginMember(member);
                localStorage.setItem('userType', 'membre');
                console.log("✅ Nouveau membre connecté :", member);
                this.router.navigate(['/memberProfile']);
              } else {
                this.errorMessage = "Membre non trouvé dans la liste.";
                this.AS.signOut();
              }
            } else {
              this.errorMessage = "Compte non répertorié dans le laboratoire.";
              this.AS.signOut();
            }
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = "Erreur lors de la récupération du membre.";
            this.isLoading = false;
          }
        });
      })
      .catch(() => {
        this.errorMessage = "Email ou mot de passe incorrect.";
        this.isLoading = false;
      });
  }


}