import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EvtService } from 'src/services/evt.service';


@Component({
  selector: 'app-modal-evt',
  templateUrl: './modal-evt.component.html',
  styleUrls: ['./modal-evt.component.css'],

})

export class ModalEvtComponent implements OnInit {
  form !: FormGroup<any>;
  constructor(
    private dialogRef: MatDialogRef<ModalEvtComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private ES: EvtService) {
    // initialisation immédiate
    this.form = new FormGroup({
      titre: new FormControl(''),
      dateDebut: new FormControl(''),
      dateFin: new FormControl(''),
      lieu: new FormControl('')
    });


  }
  ngOnInit(): void {
    if (this.data) {
      //appel au service -> injection de dependance 
      this.ES.getEvtById(this.data).subscribe((e) => {
        this.form.patchValue({
          titre: e.titre,
          dateDebut: e.dateDebut,
          dateFin: e.dateFin,
          lieu: e.lieu
        });
      });
    }
  }
  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }


}
