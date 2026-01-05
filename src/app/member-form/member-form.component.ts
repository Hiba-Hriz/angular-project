import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from 'src/models/Member';
import { MembreService } from 'src/services/membre.service';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css']
})
export class MemberFormComponent implements OnInit {
  //injection de dependances :mecanisme qui permet  au composat d'utiliser le service 
  member: Member = {} as Member;
  errorMessage: string | null = null;
  form!: FormGroup;
  enseignants: any[] = [];
  isLoading = false;
  isEditMode = false;
  photoPreview: string | ArrayBuffer | null = null;
  constructor(
    private fb: FormBuilder,
    private membreService: MembreService,

    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadEnseignants();

    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (id) {
      this.loadMembre(id);
      // En mode UPDATE : le mot de passe n'est PAS obligatoire
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setValidators([Validators.minLength(6)]);
    } else {
      // En mode ADD : le mot de passe EST obligatoire
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }

    // Toujours mettre à jour la validité après avoir changé les validateurs
    this.form.get('password')?.updateValueAndValidity();
  }

  loadMembre(id: string): void {
    this.membreService.GetMemberById(id).subscribe({
      next: (membre) => {
        // --- LOGIQUE DE TRADUCTION DU TYPE ---
        let typeFormulaire = '';
        const typeBD = membre.type; // Ex: "EnseignantChercheur"

        if (typeBD === 'EnseignantChercheur') {
          typeFormulaire = 'enseignant';
        } else if (typeBD === 'Etudiant') {
          typeFormulaire = 'etudiant';
        }

        // 1. On patche les valeurs communes
        this.form.patchValue({
          type: typeFormulaire, // On utilise la valeur traduite
          cin: membre.cin,
          nom: membre.name,
          prenom: membre.prenom,
          dateNaissance: membre.dateNaissance ? new Date(membre.dateNaissance) : null,
          email: membre.email,
          cv: membre.cv,
          photo: membre.photo
        });

        // 2. On déclenche la logique d'affichage des champs
        this.onTypeChange();
        if (membre.photo) {
          this.photoPreview = membre.photo; // Si c'est une URL ou du Base64
        }
        // 3. On attend un petit instant pour que les champs spécifiques apparaissent (le temps que le *ngIf s'active)
        setTimeout(() => {
          if (typeFormulaire === 'etudiant') {
            this.form.get('etudiantFields')?.patchValue({
              diplome: membre.diplome,
              dateInscription: membre.dateInscription ? new Date(membre.dateInscription) : new Date(),
              encadrantId: membre.encadrant?.id // On récupère l'ID depuis l'objet encadrant
            });
          } else if (typeFormulaire === 'enseignant') {
            this.form.get('enseignantFields')?.patchValue({
              grade: membre.grade,
              etablissement: membre.etablissement
            });
          }
        }, 50);
      },
      error: () => alert('Erreur chargement membre')
    });
  }

  // ✅ Initialisation du formulaire
  initForm(): void {
    this.form = this.fb.group({
      // Champs communs
      type: ['', Validators.required],
      cin: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      cv: [''],
      photo: [''],

      // Champs spécifiques Étudiant (groupe)
      etudiantFields: this.fb.group({
        diplome: [''],
        dateInscription: [new Date()],
        encadrantId: ['']
      }),

      // Champs spécifiques Enseignant (groupe)
      enseignantFields: this.fb.group({
        grade: [''],
        etablissement: ['']
      })
    });
  }
  // Modifiez votre fonction onFileSelected
  onFileSelected(event: any, type: 'photo' | 'cv') {
    const file: File = event.target.files[0];
    if (file) {
      console.log(`Fichier sélectionné : ${file.name}, Taille réelle : ${file.size} octets`);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log(`Longueur Base64 générée : ${base64String.length}`);

        if (type === 'photo') {
          this.photoPreview = base64String;
          this.form.patchValue({ photo: base64String });
        } else {
          this.form.patchValue({ cv: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  }
  // ✅ Charger la liste des enseignants pour le dropdown
  loadEnseignants(): void {
    this.membreService.GetAllMembres().subscribe({
      next: (data) => {
        // Filtrer uniquement les enseignants
        this.enseignants = data.filter(m => m.grade !== undefined);
      },
      error: (err) => console.error('Erreur chargement enseignants:', err)
    });
  }

  // ✅ Gérer le changement de type
  onTypeChange(): void {
    const type = this.form.get('type')?.value?.toLowerCase();

    if (type === 'etudiant') {
      // Rendre les champs étudiant obligatoires
      this.form.get('etudiantFields.diplome')?.setValidators(Validators.required);
      // Retirer les validateurs enseignant
      this.form.get('enseignantFields.grade')?.clearValidators();
      this.form.get('enseignantFields.etablissement')?.clearValidators();
    } else if (type === 'enseignant') {
      // Rendre les champs enseignant obligatoires
      this.form.get('enseignantFields.grade')?.setValidators(Validators.required);
      this.form.get('enseignantFields.etablissement')?.setValidators(Validators.required);
      // Retirer les validateurs étudiant
      this.form.get('etudiantFields.diplome')?.clearValidators();
    }

    // Mettre à jour la validation
    this.form.get('etudiantFields.diplome')?.updateValueAndValidity();
    this.form.get('enseignantFields.grade')?.updateValueAndValidity();
    this.form.get('enseignantFields.etablissement')?.updateValueAndValidity();
  }


  sub(): void {
    // 1. Réinitialiser le message d'erreur à chaque clic
    this.errorMessage = null;

    // 2. Vérification de la validité du formulaire
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = "Veuillez remplir tous les champs obligatoires correctement.";
      return;
    }

    this.isLoading = true;
    const id: string | null = this.route.snapshot.paramMap.get('id');
    const type = this.form.get('type')?.value;

    if (id) {
      if (type === 'etudiant') {
        this.updateEtudiant(id);
      } else {
        this.updateEnseignant(id);
      }
    } else {
      if (type === 'etudiant') {
        this.addEtudiant();
      } else {
        this.addEnseignant();
      }
    }
  }



  // ✅ Ajouter un étudiant
  addEtudiant(): void {
    const etudiantData = {
      // Champs communs
      cin: this.form.get('cin')?.value,
      name: this.form.get('nom')?.value,
      prenom: this.form.get('prenom')?.value,
      dateNaissance: this.formatDate(this.form.get('dateNaissance')?.value),
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      cv: this.form.get('cv')?.value,
      photo: this.form.get('photo')?.value,
      // Champs spécifiques étudiant
      type: "Etudiant",
      diplome: this.form.get('etudiantFields.diplome')?.value,
      dateInscription: new Date().toISOString(),
      encadrant: this.form.get('etudiantFields.encadrantId')?.value
        ? { id: this.form.get('etudiantFields.encadrantId')?.value }
        : null
    };
    console.log('Données envoyées :', etudiantData);
    this.membreService.addEtudiant(etudiantData).subscribe({
      next: () => {
        alert('✅ Étudiant ajouté avec succès !');
        this.isLoading = false;
        this.router.navigate(['/member']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('❌ Erreur lors de l\'ajout de l\'étudiant');
        this.errorMessage = "Erreur serveur : Impossible d'ajouter l'étudiant.";
        this.isLoading = false;
      }
    });
  }

  // ✅ Ajouter un enseignant
  addEnseignant(): void {
    const enseignantData = {
      // Champs communs
      cin: this.form.get('cin')?.value,
      name: this.form.get('nom')?.value,
      prenom: this.form.get('prenom')?.value,
      dateNaissance: this.formatDate(this.form.get('dateNaissance')?.value),
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      cv: this.form.get('cv')?.value,
      photo: this.form.get('photo')?.value,
      // Champs spécifiques enseignant
      grade: this.form.get('enseignantFields.grade')?.value,
      etablissement: this.form.get('enseignantFields.etablissement')?.value
    };

    this.membreService.addEnseignant(enseignantData).subscribe({
      next: () => {
        alert('✅ Enseignant ajouté avec succès !');
        this.isLoading = false;
        this.router.navigate(['/member']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('❌ Erreur lors de l\'ajout de l\'enseignant');
        this.errorMessage = "Erreur serveur : Impossible d'ajouter l'enseingant";
        this.isLoading = false;
      }
    });
  }

  // ✅ Formater la date pour le backend (YYYY-MM-DD)
  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ Annuler et retourner à la liste
  cancel(): void {
    this.router.navigate(['/member']);
  }
  updateEtudiant(id: string): void {
    const data: any = {
      cin: this.form.value.cin,
      name: this.form.value.nom,
      prenom: this.form.value.prenom,
      dateNaissance: this.formatDate(this.form.value.dateNaissance),
      email: this.form.value.email,
      cv: this.form.value.cv,
      photo: this.form.value.photo,
      diplome: this.form.value.etudiantFields.diplome,
      dateInscription: this.formatDate(this.form.value.etudiantFields.dateInscription),
      encadrant: this.form.value.etudiantFields.encadrantId
        ? { id: this.form.value.etudiantFields.encadrantId }
        : null
    };

    // n’envoyer le password que s’il est rempli
    if (this.form.value.password) {
      data.password = this.form.value.password;
    }

    this.membreService.UpdateEtudiant(id, data).subscribe({
      next: () => {
        alert('✅ Étudiant modifié');
        this.router.navigate(['/member']);
      },
      error: (err) => {
        console.error('Erreur update étudiant:', err);
        alert('❌ Erreur lors de la modification de l\'étudiant');
        this.errorMessage = "Erreur serveur : Impossible de modifier  l'étudiant.";
      }
    });
  }
  updateEnseignant(id: string): void {
    const data: any = {
      cin: this.form.value.cin,
      name: this.form.value.nom,
      prenom: this.form.value.prenom,
      dateNaissance: this.formatDate(this.form.value.dateNaissance),
      email: this.form.value.email,
      cv: this.form.value.cv,
      photo: this.form.value.photo,
      grade: this.form.value.enseignantFields.grade,
      etablissement: this.form.value.enseignantFields.etablissement
    };

    // n’envoyer le password que s’il est rempli
    if (this.form.value.password) {
      data.password = this.form.value.password;
    }

    this.membreService.UpdateEnseignant(id, data).subscribe({
      next: () => {
        alert('✅ Enseignant modifié');
        this.router.navigate(['/member']);
      },
      error: (err) => {
        console.error('Erreur update enseignant:', err);
        alert('❌ Erreur lors de la modification de l\'enseignant');
        this.errorMessage = "Erreur serveur : Impossible de modifier l'enseignant .";
      }
    });
  }


}