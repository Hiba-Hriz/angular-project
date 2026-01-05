import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  setVisitor() {
    // Si l'utilisateur choisit de découvrir, on le marque comme visiteur
    localStorage.setItem('userType', 'visiteur');
  }
}
