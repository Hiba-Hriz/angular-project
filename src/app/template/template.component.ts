import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  showNavbar: boolean = false;
  user: any = null;

  constructor(private AS: AuthService, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.updateNavbarVisibility();

    // Écouter les changements de membre en temps réel
    this.AS.getCurrentMemberObservable().subscribe(member => {
      // Suppression du "if (member)" pour accepter la valeur null
      this.user = member;
      console.log("Mise à jour de l'utilisateur dans le template :", this.user);

      // Si l'utilisateur est null, on cache la navbar
      if (!member) {
        this.showNavbar = false;
      } else {
        this.updateNavbarVisibility();
      }
    });

    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateNavbarVisibility();
    });
  }

  getSafePhoto(photoStr: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(photoStr);
  }
  updateNavbarVisibility(): void {
    const userType = localStorage.getItem('userType');

    // Afficher la navbar seulement pour administrateur ou visiteur
    this.showNavbar = userType === 'administrateur' || userType === 'visiteur';

    console.log('=== TEMPLATE COMPONENT UPDATE ===');
    console.log('showNavbar:', this.showNavbar);
    console.log('userType:', userType);
    console.log('Le bouton menu devrait être:', this.showNavbar ? 'VISIBLE' : 'CACHÉ');
    console.log('==================================');
  }
  logout() {
    this.AS.signOut().then(() => {
      this.user = null;
      this.showNavbar = false;
      this.router.navigate(['/login']);
    });
  }

}
