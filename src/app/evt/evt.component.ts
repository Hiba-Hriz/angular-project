import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Evt } from 'src/models/Evt';
import { EvtService } from 'src/services/evt.service';
import { ModalEvtComponent } from '../modal-evt/modal-evt.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-evt',
  templateUrl: './evt.component.html',
  styleUrls: ['./evt.component.css']
})
export class EvtComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  userType: string | null = null;

  dataSource = new MatTableDataSource<Evt>();
  displayedColumns: string[] = ['id', 'titre', 'dateDebut', 'dateFin', 'lieu', 'actions'];

  constructor(private Es: EvtService, private dialog: MatDialog) { }

  ngOnInit() {
    // 2. Récupérer la valeur au chargement de la page
    this.userType = localStorage.getItem('userType');

    console.log("Rôle actuel de l'utilisateur :", this.userType);

    this.loadData(); // ✅ appel backend ici
  }

  // Optionnel : Une fonction pour vérifier si c'est un admin
  isAdmin(): boolean {
    return this.userType === 'administrateur';
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    console.log('📡 Appel backend...');
    this.Es.GetAllEvents().subscribe({
      next: data => {
        console.log('✅ Données reçues:', data);
        this.dataSource.data = data;
      },
      error: err => {
        console.error('❌ Erreur backend:', err);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  open() {
    //lancer l'overture de la boite 
    let dialogREF = this.dialog.open(ModalEvtComponent);
    dialogREF.afterClosed().subscribe((eventRecupere) => {
      if (eventRecupere) {
        this.Es.saveEvt(eventRecupere).subscribe(() => {
          this.Es.GetAllEvents().subscribe((data) => {
            this.dataSource = new MatTableDataSource(data);
          })
        })
      }
    })

  }
  openEdit(id: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = id;

    let dialogRef = this.dialog.open(ModalEvtComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) { // <-- ajouter cette vérification
        this.Es.UpdateEvt(id, res).subscribe(() => {
          this.Es.GetAllEvents().subscribe((data) => {
            this.dataSource = new MatTableDataSource(data);
          });
        });
      }
    });
  }
  deleteEvent(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.Es.DeleteEvt(id).subscribe(() => {
        // recharger les données après suppression
        this.Es.GetAllEvents().subscribe((data) => {
          this.dataSource = new MatTableDataSource(data);
        });
      });
    }
  }
}
