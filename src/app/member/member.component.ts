import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Member } from 'src/models/Member';
import { MembreService } from 'src/services/membre.service';
import { OutilService } from 'src/services/outil.service';
import { PublicationService } from 'src/services/publication.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Publication } from 'src/models/Publication';
import { Outil } from 'src/models/Outil ';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {

  filterForm!: FormGroup;
  dataSource: any[] = [];
  dataSourceFull: any[] = [];
  displayedColumns: string[] = [];
  isAdmin: boolean = false;
  isVisitor: boolean = false;

  constructor(
    private MS: MembreService,
    private OS: OutilService,
    private PS: PublicationService,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // Vérifier si l'utilisateur est administrateur
    const userType = localStorage.getItem('userType');
    this.isVisitor = userType === 'visiteur';

    this.isAdmin = userType === 'administrateur';

    // Définir les colonnes selon le type d'utilisateur
    if (this.isAdmin) {
      this.displayedColumns = [
        'cin',
        'name',
        'prenom',
        'dateNaissance',
        'cv',
        'publications',
        'outils',
        'photo',
        'email',
        'type',
        'grade',
        'etablissement',
        'dateInscription',
        'diplome',
        'actions'
      ];
    } else {
      this.displayedColumns = [
        'cin',
        'name',
        'prenom',
        'dateNaissance',
        'cv',
        'publications',
        'outils',
        'photo',
        'email',
        'type',
        'grade',
        'etablissement',
        'dateInscription',
        'diplome'
        // Pas de colonne actions pour visiteur
      ];
    }

    this.filterForm = new FormGroup({
      grade: new FormControl(''),
      etablissement: new FormControl(''),
      role: new FormControl(''),
      pubType: new FormControl(''),
      pubYear: new FormControl('')
    });

    this.loadMembersWithPublicationsAndOutils();
  }

  loadMembersWithPublicationsAndOutils() {
    this.MS.GetAllMembres().subscribe((members: Member[]) => {
      this.PS.getAll().subscribe((publications: Publication[]) => {
        this.OS.getAll().subscribe((outils: Outil[]) => {

          console.log('=== DEBUG COMPLET ===');

          // 1. Afficher les membres
          console.log('Membres (avec leurs IDs):');
          members.forEach((member: Member) => {
            console.log(`- ${member.name} ${member.prenom}: ID=${member.id}, Type=${typeof member.id}`);
          });



          this.dataSourceFull = members.map((member: Member) => {
            const memberId = member.id || 0;

            // Filtrer les outils
            const outilsDuMembre = outils.filter((outil: Outil) =>
              String(outil.membreId) === String(memberId)
            );

            // Filtrer les publications AVEC DEBUG
            const publicationsTest = publications.filter((pub: Publication) => {


              if (!pub.membreIds || !Array.isArray(pub.membreIds)) {
                return false;
              }

              const includesMember = pub.membreIds.includes(memberId);


              return includesMember;
            });

            const publicationsDuMembre = publicationsTest.map((pub: Publication) => ({
              ...pub,
              date: new Date(pub.date)
            }));

            console.log(`\nRESULTAT - Membre ${member.name}: ${publicationsDuMembre.length} publications`);

            return {
              ...member,
              publications: publicationsDuMembre,
              outils: outilsDuMembre
            };
          });

          console.log('\n=== FIN DU DEBUG ===');
          this.dataSource = [...this.dataSourceFull];

          // Vérification finale
          console.log('\nVÉRIFICATION FINALE:');
          this.dataSource.forEach((member: any) => {
            console.log(`${member.name}: ${member.publications?.length || 0} publications`);
            if (member.publications?.length > 0) {
              member.publications.forEach((pub: any) => {
                console.log(`  - ${pub.titre} (membreIds: ${pub.membreIds})`);
              });
            }
          });
        });
      });
    });
  }
  sanitizeBase64(base64: string) {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }
  downloadMemberPublications(member: any): void {
    if (!member.publications?.length) return;

    member.publications.forEach((pub: any) => {
      this.downloadFile(pub.sourcePDF, pub.titre + '.pdf');
    });
  }
  downloadCV(base64Data: string, fileName: string) {
    if (!base64Data) return;

    // 1. Extraire le type mime (image/jpeg, application/pdf, etc.)
    const mimeType = base64Data.split(';')[0].split(':')[1];

    // 2. Utiliser fetch pour convertir le base64 en Blob proprement
    fetch(base64Data)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // 3. Déterminer l'extension correcte
        const extension = mimeType.includes('pdf') ? '.pdf' : '.jpg';
        a.download = fileName + extension;

        document.body.appendChild(a);
        a.click();

        // Nettoyage
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => console.error("Erreur de téléchargement", err));
  }
  delete(id: string) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',   // Plus large pour un aspect rectangle pro
      height: 'auto',    // 'auto' permet au rectangle de s'ajuster au texte sans scroll
      panelClass: 'custom-dialog-container' // Optionnel: pour ajouter des styles globaux
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);

      if (result) {
        this.MS.DeleteMember(id).subscribe(() => {
          this.loadMembersWithPublicationsAndOutils();
        });
      }
    });
  }

  downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  viewPublication(pub: any) {
    window.open(pub.sourcePDF, '_blank');
  }

  applyFilter() {
    const gradeFilter = this.filterForm.value.grade?.toLowerCase();
    const etabFilter = this.filterForm.value.etablissement?.toLowerCase();
    const pubTypeFilter = this.filterForm.value.pubType?.toLowerCase();
    const pubYearFilter = this.filterForm.value.pubYear;

    this.dataSource = this.dataSourceFull.filter(member => {
      const gradeMatch = gradeFilter ? member.grade?.toLowerCase().includes(gradeFilter) : true;
      const etabMatch = etabFilter ? member.etablissement?.toLowerCase().includes(etabFilter) : true;
      let pubMatch = true;

      if (pubTypeFilter || pubYearFilter) {
        pubMatch = member.publications?.some((pub: any) => {
          const typeMatch = pubTypeFilter ? pub.type.toLowerCase().includes(pubTypeFilter) : true;
          const yearMatch = pubYearFilter
            ? new Date(pub.date).getFullYear() === +pubYearFilter
            : true;
          return typeMatch && yearMatch;
        });
      }

      return gradeMatch && etabMatch && pubMatch;
    });
  }

  resetFilter() {
    this.filterForm.reset();
    this.dataSource = [...this.dataSourceFull];
  }
}