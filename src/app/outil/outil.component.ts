import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Outil } from 'src/models/Outil ';
import { OutilService } from 'src/services/outil.service';
import { OutilModalComponent } from '../outil-modal/outil-modal.component';

@Component({
  selector: 'app-outil',
  templateUrl: './outil.component.html',
  styleUrls: ['./outil.component.css']
})
export class OutilComponent implements OnInit {

  displayedColumns: string[] = ['id', 'source', 'date', 'actions'];
  dataSource!: MatTableDataSource<Outil>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  userType: string | null = null;

  constructor(
    private outilService: OutilService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userType = localStorage.getItem('userType');

    console.log("Rôle actuel de l'utilisateur :", this.userType);
    this.loadData();
  }

  /** Charger les outils */
  loadData() {
    this.outilService.getAll().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err)
    });
  }

  /** Filtre */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Ouvrir dialog ajout */
  open() {
    const dialogRef = this.dialog.open(OutilModalComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  /** Ouvrir dialog edit */
  openEdit(id: number) {
    const dialogRef = this.dialog.open(OutilModalComponent, {
      width: '400px',
      data: id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }
  /** Supprimer */
  deleteOutil(id: number) {
    if (confirm('Voulez-vous supprimer cet outil ?')) {
      this.outilService.delete(id).subscribe(() => {
        this.loadData();
      });
    }
  }
}