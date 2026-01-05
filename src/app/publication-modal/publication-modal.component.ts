import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Publication } from 'src/models/Publication';
import { MembreService } from 'src/services/membre.service';
import { PublicationService } from 'src/services/publication.service';

@Component({
  selector: 'app-publication-modal',
  templateUrl: './publication-modal.component.html',
  styleUrls: ['./publication-modal.component.css']
})
export class PublicationModalComponent implements OnInit{

  form: FormGroup;
  members: any[] = [];
  constructor(
    private fb: FormBuilder,

    private pubService: PublicationService,
    private MS: MembreService,
    private dialogRef: MatDialogRef<PublicationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Publication
  ) {
    this.form = this.fb.group({
      id: [data?.id || null], // 🔹 important pour update
      type: [data?.type || '', Validators.required],
      titre: [data?.titre || '', Validators.required],
      lien: [data?.lien || '', Validators.required],
      date: [data?.date || '', Validators.required],
      sourcePDF: [data?.sourcePDF || '', Validators.required],
      membreIds: [data?.membreIds || []], 
    });
  }
 ngOnInit() {
    // Charger la liste des membres
    this.MS.GetAllMembres().subscribe(m => this.members = m);
  }
  save() {
  const pub: Publication = this.form.value;
  
  // 🔹 VERIFICATIONS AVANT ENVOI
  console.log('=== VERIFICATION AJOUT PUBLICATION ===');
  console.log('Données du formulaire:', this.form.value);
  console.log('Publication à envoyer:', pub);
  console.log('Type:', pub.type);
  console.log('Titre:', pub.titre);
  console.log('Date:', pub.date);
  console.log('Lien:', pub.lien);
  console.log('Source PDF:', pub.sourcePDF);
  console.log('Membre IDs sélectionnés:', pub.membreIds);
  console.log('Nombre de membres:', pub.membreIds?.length || 0);
  console.log('ID (si édition):', pub.id);
  console.log('====================================');
  console.log('Membre IDs sélectionnés:', pub.membreIds);
console.log('Type de membreIds:', typeof pub.membreIds);
console.log('Type du premier ID:', typeof pub.membreIds[0]);
console.log('Valeur exacte:', JSON.stringify(pub.membreIds));
  
  if (pub.id) {
    this.pubService.update(pub).subscribe({
      next: (response) => {
        console.log('✅ Publication mise à jour avec succès!');
        console.log('Réponse serveur:', response);
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        console.error('Détails de l\'erreur:', error.error);
      }
    });
  } else {
    this.pubService.create(pub).subscribe({
      next: (response) => {
        console.log('✅ Publication créée avec succès!');
        console.log('Réponse serveur:', response);
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        console.error('Détails de l\'erreur:', error.error);
      }
    });
  }
}


  close() {
    this.dialogRef.close();
  }
}