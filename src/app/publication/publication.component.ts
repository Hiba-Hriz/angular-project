import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Publication } from 'src/models/Publication';
import { PublicationService } from 'src/services/publication.service';
import { PublicationModalComponent } from '../publication-modal/publication-modal.component';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.css']
})
export class PublicationComponent implements OnInit {
  publications: Publication[] = [];
  userType: string | null = null;

  constructor(
    private publicationService: PublicationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userType = localStorage.getItem('userType');

    console.log("Rôle actuel de l'utilisateur :", this.userType);
    this.loadPublications();
  }

  loadPublications() {
    this.publicationService.getAll().subscribe(data => {
      this.publications = data;
    });
  }

  openModal(pub?: Publication) {
    console.log('=== OUVRIR MODAL PUBLICATION ===');
    console.log('Mode:', pub ? 'ÉDITION' : 'AJOUT');
    if (pub) {
      console.log('Publication à éditer:', pub);
      console.log('Membre IDs:', pub.membreIds);
    }

    const dialogRef = this.dialog.open(PublicationModalComponent, {
      width: '400px',
      data: pub ? { ...pub } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal fermé. Résultat:', result);
      if (result) {
        console.log('Rechargement des publications...');
        this.loadPublications();
      }
    });
  }

  delete(id: number) {
    this.publicationService.delete(id).subscribe(() => this.loadPublications());
  }
}
