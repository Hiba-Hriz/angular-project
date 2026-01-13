import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Outil } from 'src/models/Outil ';
import { OutilService } from 'src/services/outil.service';
import { MembreService } from 'src/services/membre.service';

@Component({
  selector: 'app-outil-modal',
  templateUrl: './outil-modal.component.html'
})
export class OutilModalComponent implements OnInit {
  members: any[] = [];

  outil: Outil = {
    source: '',
    date: new Date(),
    membreId: 0,
  };

  isEdit = false;


  constructor(
    private dialogRef: MatDialogRef<OutilModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private outilService: OutilService,
    private memberService: MembreService
  ) { }

  ngOnInit() {

    // Récupérer tous les membres
    this.memberService.GetAllMembres().subscribe(res => {
      this.members = res;
    });

    // Si mode édition, récupérer l'outil existant
    if (this.data) {
      this.isEdit = true;
      this.outilService.getById(this.data).subscribe(res => {
        this.outil = res;
      });
    }
  }

  save() {
    if (this.isEdit) {
      this.outilService.update(this.outil.id!, this.outil)
        .subscribe(() => this.dialogRef.close(true));
    } else {
      this.outilService.create(this.outil)
        .subscribe(() => this.dialogRef.close(true));
    }
  }

  close() {
    this.dialogRef.close();
  }
}
