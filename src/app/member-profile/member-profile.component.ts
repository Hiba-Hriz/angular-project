import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Member } from 'src/models/Member';
import { AuthService } from 'src/services/auth.service';
import { MembreService } from 'src/services/membre.service';
import { OutilService } from 'src/services/outil.service';
import { PublicationService } from 'src/services/publication.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Outil } from 'src/models/Outil ';
import { Publication } from 'src/models/Publication';
import { PublicationModalComponent } from '../publication-modal/publication-modal.component';
import { OutilModalComponent } from '../outil-modal/outil-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalEvtComponent } from '../modal-evt/modal-evt.component';
import { EvtService } from 'src/services/evt.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Etudiant } from 'src/models/Etudiant';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.css']
})
export class MemberProfileComponent {

  profileForm!: FormGroup;
  member: Member | null = null;
  isLoading: boolean = true;
  hidePassword = true;
  mesEtudiants: Etudiant[] = [];
  etudiants: any;
  enseignant: any;

  // ========== NOUVELLES PROPRIÉTÉS POUR LES ÉVÉNEMENTS ==========
  assignedEvents: any[] = []; // Événements auxquels le membre participe
  availableEvents: any[] = []; // Tous les événements disponibles
  filteredAvailableEvents: any[] = []; // Événements filtrés par recherche
  searchTerm: string = '';
  // ================================================================

  constructor(
    private authService: AuthService,
    private MS: MembreService,
    private PS: PublicationService,
    private OS: OutilService,
    private dialog: MatDialog,
    private router: Router,
    private ES: EvtService,
    private snackBar: MatSnackBar // Injection du MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('MemberProfileComponent ngOnInit');

    this.authService.getCurrentMemberObservable().subscribe(member1 => {
      if (!member1) {
        console.log('⛔ Aucun membre → redirection login');
        this.router.navigate(['/login']);
        return;
      }

      this.member = member1;
      console.log('✅ Membre actif:', member1);
      if (member1.type === 'EnseignantChercheur') {
        this.MS.GetAllMembres().subscribe(members => {
          this.etudiants = members.filter(
            m => m.type === 'Etudiant' && m.encadrant?.id === member1.id
          );
          console.log('👨‍🎓 Étudiants encadrés :', this.etudiants);
        });
      }
      if (member1.type === 'Etudiant') {
        const etd = member1 as Etudiant;

        if (etd.encadrant) {
          this.enseignant = etd.encadrant;
          console.log('👨‍🏫 Enseignant :', this.enseignant);
        }
      }

      this.initializeForm();
      // Charger les étudiants si c'est un enseignant
      if (this.member.type_mbr === 'EnseignantChercheur') {
        this.loadMesEtudiants();
      }
      this.updateFormValidators(this.profileForm.get('type_mbr')?.value);
      this.loadPublications();
      this.loadOutils();
      this.loadMemberEvents(); // ⭐ NOUVEAU: Charger les événements
      this.isLoading = false;
    });

  }
  get asEtudiant() {
    return this.member as Etudiant;
  }
  private loadMesEtudiants(): void {
    if (!this.member?.id) return;

    this.MS.GetAllMembres().subscribe((allMembers: any[]) => {
      // On filtre : type 'Etudiant' ET l'ID de l'encadrant correspond à l'ID du membre connecté
      this.mesEtudiants = allMembers.filter(m =>
        m.type === 'Etudiant' &&
        m.encadrant &&
        m.encadrant.id === this.member?.id
      );
    });
  }
  // ========== NOUVELLES MÉTHODES POUR LES ÉVÉNEMENTS ==========

  /**
   * Charger tous les événements du membre (organisés et attribués)
   */
  private loadMemberEvents(): void {
    if (!this.member?.id) return;

    const memberId = this.member.id;

    // 1. Charger les événements attribués (Table de jointure)
    this.loadAssignedEvents(memberId);

    // 2. Charger TOUS les événements pour filtrer ceux que j'organise
    this.ES.getAllEvents().subscribe({
      next: (allEvents) => {
        // Filtrer les événements où JE suis l'organisateur
        this.member!.evens = allEvents.filter((evt: any) =>
          evt.organisateurId === memberId ||
          (evt.organisateur && evt.organisateur.id === memberId)
        );

        // Mettre à jour les événements disponibles (ceux qui ne sont ni organisés ni attribués)
        const organizedIds = this.member!.evens.map((e: any) => e.id);
        const assignedIds = this.assignedEvents.map(e => e.id);

        this.availableEvents = allEvents.filter((evt: any) =>
          !organizedIds.includes(evt.id) && !assignedIds.includes(evt.id)
        );
        this.filteredAvailableEvents = [...this.availableEvents];
      }
    });
  }

  /**
   * Charger les événements auxquels le membre participe
   */
  private loadAssignedEvents(memberId: number): void {
    this.ES.getEventsByMember(memberId).subscribe({
      next: (events) => {
        console.log('✅ Événements attribués chargés:', events);
        this.assignedEvents = events.map(evt => ({
          ...evt,
          dateDebut: new Date(evt.dateDebut),
          dateFin: new Date(evt.dateFin)
        }));
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des événements attribués:', error);
        this.snackBar.open('Erreur lors du chargement des événements', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  /**
   * Charger tous les événements disponibles (pas encore inscrits)
   */
  private loadAvailableEvents(): void {
    this.ES.getAllEvents().subscribe({
      next: (events) => {
        console.log('✅ Tous les événements chargés:', events);

        // Filtrer pour exclure les événements déjà organisés ou auxquels on participe
        const memberEventIds = [
          ...(this.member?.evens || []).map((e: any) => e.id),
          ...this.assignedEvents.map(e => e.id)
        ];

        this.availableEvents = events
          .filter((event: any) => !memberEventIds.includes(event.id))
          .map(evt => ({
            ...evt,
            dateDebut: new Date(evt.dateDebut),
            dateFin: new Date(evt.dateFin)
          }));

        this.filteredAvailableEvents = [...this.availableEvents];

        console.log('✅ Événements disponibles filtrés:', this.availableEvents);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des événements disponibles:', error);
      }
    });
  }

  /**
   * Filtrer les événements disponibles selon le terme de recherche
   */
  filterAvailableEvents(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAvailableEvents = [...this.availableEvents];
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredAvailableEvents = this.availableEvents.filter(event =>
      event.titre?.toLowerCase().includes(search) ||
      event.lieu?.toLowerCase().includes(search)
    );
  }

  /**
   * S'inscrire à un événement
   */
  subscribeToEvent(eventId: number): void {
    if (!this.member?.id) {
      this.snackBar.open('Erreur: membre non identifié', 'Fermer', { duration: 3000 });
      return;
    }

    console.log('📝 Inscription à l\'événement', eventId, 'pour le membre', this.member.id);

    this.ES.subscribeToEvent(eventId, this.member.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Inscription réussie!', 'Fermer', { duration: 3000 });
        // Recharger les événements
        this.loadMemberEvents();
        this.getMemberData(); // Rafraîchir aussi les données du membre
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'inscription:', error);
        this.snackBar.open('Erreur lors de l\'inscription', 'Fermer', { duration: 3000 });
      }
    });
  }

  /**
   * Se désinscrire d'un événement
   */
  unsubscribeFromEvent(eventId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '230px',
      width: '320px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.member?.id) {
        console.log('📝 Désinscription de l\'événement', eventId);

        this.ES.unsubscribeFromEvent(eventId, this.member.id).subscribe({
          next: () => {
            this.snackBar.open('✅ Désinscription réussie', 'Fermer', { duration: 3000 });
            // Recharger les événements
            this.loadMemberEvents();
            this.getMemberData();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la désinscription:', error);
            this.snackBar.open('Erreur lors de la désinscription', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }




  /**
   * Supprimer un événement (pour les organisateurs)
   */
  deleteEvent(eventId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '230px',
      width: '320px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🗑️ Suppression de l\'événement', eventId);

        this.ES.deleteEvt(eventId).subscribe({
          next: () => {
            this.snackBar.open('✅ Événement supprimé avec succès', 'Fermer', { duration: 3000 });
            // Recharger le profil
            this.getMemberData();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression de l\'événement', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  // ================================================================

  // Créez une méthode séparée pour charger les outils
  private loadOutils(): void {
    if (!this.member) {
      console.error('loadOutils: member est null !');
      return;
    }

    console.log('=== CHARGEMENT DES OUTILS ===');
    console.log('Member ID à filtrer:', this.member.id);
    console.log('Type de member.id:', typeof this.member.id);

    this.OS.getAll().subscribe((outils) => {
      console.log('Tous les outils récupérés:', outils);

      const memberId = String(this.member!.id);
      console.log('Member ID converti en string:', memberId);

      const outilsFiltres = outils.filter(outil => {
        const outilMembreId = String(outil.membreId);
        const match = outilMembreId === memberId;

        console.log(`Outil ${outil.id}: membreId="${outilMembreId}" === "${memberId}" ? ${match}`);

        return match;
      });

      console.log('Outils filtrés:', outilsFiltres);

      this.member!.outils = outilsFiltres.map(outil => ({
        ...outil,
        date: new Date(outil.date)
      }));

      console.log('Outils assignés au membre:', this.member!.outils);
      console.log('=== FIN CHARGEMENT ===');
    });
  }

  private loadPublications(): void {
    if (!this.member?.id) return;

    const memberId = this.member.id;

    this.PS.getAll().subscribe((publications) => {
      this.member!.pubs = publications
        .filter(pub => pub.membreIds?.includes(memberId))
        .map(pub => ({
          ...pub,
          date: new Date(pub.date)
        }));
    });
  }

  // Initialiser le formulaire avec les données du membre
  private initializeForm(): void {
    if (!this.member) return;

    console.log("Données brutes du membre :", this.member);

    const rawType = (this.member as any).type;

    let mappedType = '';
    if (rawType === 'EnseignantChercheur') {
      mappedType = 'enc';
    } else if (rawType === 'Etudiant') {
      mappedType = 'etd';
    } else {
      mappedType = rawType || '';
    }

    const formControls: any = {
      cin: new FormControl(this.member.cin),
      nom: new FormControl(this.member.name),
      prenom: new FormControl(this.member.prenom),
      dateNaissance: new FormControl(this.member.dateNaissance),
      photo: new FormControl(this.member.photo),
      cv: new FormControl(this.member.cv),
      email: new FormControl(this.member.email),
      password: new FormControl(this.member.password),
      type_mbr: new FormControl(mappedType)
    };

    formControls.grade = new FormControl(this.member.grade || '');
    formControls.etablissement = new FormControl(this.member.etablissement || '');

    formControls.diplome = new FormControl((this.member as any).diplome || '');

    this.profileForm = new FormGroup(formControls);

    this.updateFormValidators(mappedType);

    this.profileForm.get('type_mbr')?.valueChanges.subscribe(value => {
      this.updateFormValidators(value);
    });
  }

  private updateFormValidators(type: string): void {
    const gradeControl = this.profileForm.get('grade');
    const etablissementControl = this.profileForm.get('etablissement');

    const diplomeControl = this.profileForm.get('diplome');

    if (type === 'enc') {
      gradeControl?.setValidators([Validators.required]);
      etablissementControl?.setValidators([Validators.required]);

      diplomeControl?.clearValidators();

      diplomeControl?.reset();
      if (!gradeControl) {
        this.profileForm.addControl('grade', new FormControl('', Validators.required));
      }
      if (!etablissementControl) {
        this.profileForm.addControl('etablissement', new FormControl('', Validators.required));
      }
    } else if (type === 'etd') {

      diplomeControl?.setValidators([Validators.required]);
      gradeControl?.clearValidators();
      etablissementControl?.clearValidators();
      gradeControl?.reset();
      etablissementControl?.reset();

      if (!diplomeControl) {
        this.profileForm.addControl('diplome', new FormControl('', Validators.required));
      }
    } else {
      gradeControl?.clearValidators();
      etablissementControl?.clearValidators();

      diplomeControl?.clearValidators();
    }

    gradeControl?.updateValueAndValidity();
    etablissementControl?.updateValueAndValidity();

    diplomeControl?.updateValueAndValidity();
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  updateProfile(): void {
    if (!this.profileForm.valid || !this.member) {
      console.error('Formulaire invalide ou membre non trouvé');
      return;
    }

    const updatedMember: Member = {
      ...this.member,
      ...this.profileForm.value
    };

    console.log('🔄 Mise à jour du profil...');
    console.log('ID:', this.member.id);
    console.log('Type:', updatedMember.type_mbr);
    console.log('Données:', updatedMember);

    if (this.member?.id != null) {
      const memberId = this.member.id.toString();

      if (updatedMember.type_mbr === 'etd') {
        console.log('📝 Appel UpdateEtudiant');
        this.MS.UpdateEtudiant(memberId, updatedMember).subscribe({
          next: (res) => {
            console.log('✅ Profil étudiant mis à jour', res);
            this.updateSuccess(updatedMember);
          },
          error: (error) => {
            console.error('❌ Erreur UpdateEtudiant:', error);
            this.handleUpdateError(error);
          }
        });
      } else if (updatedMember.type_mbr === 'enc') {
        console.log('📝 Appel UpdateEnseignant');
        this.MS.UpdateEnseignant(memberId, updatedMember).subscribe({
          next: (res) => {
            console.log('✅ Profil enseignant mis à jour', res);
            this.updateSuccess(updatedMember);
          },
          error: (error) => {
            console.error('❌ Erreur UpdateEnseignant:', error);
            this.handleUpdateError(error);
          }
        });
      } else {
        console.error('⚠️ Type de membre non reconnu:', updatedMember.type_mbr);
        alert('Type de membre non reconnu. Contactez l\'administrateur.');
      }
    } else {
      console.error('❌ ID du membre manquant');
      alert('Erreur: ID du membre manquant');
    }
  }

  private updateSuccess(updatedMember: Member): void {
    this.member = updatedMember;
    this.authService.loginMember(updatedMember);
    alert('Profil mis à jour avec succès !');
  }

  private handleUpdateError(error: any): void {
    console.error('Détails de l\'erreur:', error);
    if (error.status === 405) {
      alert('Erreur: Méthode non autorisée. Vérifiez votre backend Spring Boot.');
    } else if (error.status === 404) {
      alert('Erreur: Endpoint non trouvé. Vérifiez les routes de votre API.');
    } else {
      alert('Erreur lors de la mise à jour du profil: ' + error.statusText);
    }
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

  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  deletePublication(id: number | undefined) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '230px',
      width: '320px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        if (!this.member?.id) {
          console.error("Member ID est manquant, impossible de filtrer les publications.");
          return;
        }

        const memberId = this.member.id;

        this.PS.delete(Number(id)).subscribe(() => {
          this.PS.getAll().subscribe((publications) => {
            this.member!.pubs = publications
              .filter(pub => pub.membreIds?.includes(memberId))
              .map(pub => ({ ...pub, date: new Date(pub.date) }));
          });
        });
      }
    });
  }

  downloadTool(tool: Outil): void {
    if (!tool.source) {
      console.error('Source de l\'outil manquante');
      return;
    }

    const link = document.createElement('a');
    link.href = tool.source;
    link.download = `outil-${tool.id}.ext`;
    link.click();
  }

  deleteOutil(id: number | undefined) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '230px',
      width: '320px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.member) {
        this.OS.delete(Number(id)).subscribe(() => {
          this.OS.getAll().subscribe((outils) => {
            this.member!.outils = outils
              .filter(outil => outil.membreId === this.member!.id)
              .map(outil => ({ ...outil, date: new Date(outil.date) }));
          });
        });
      }
    });
  }

  delete(id: number) {
    this.PS.delete(id).subscribe(() => this.loadPublications());
  }

  open() {
    const dialogRef = this.dialog.open(OutilModalComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadOutils();
    });
  }

  openEdit(id: number | undefined) {
    const dialogRef = this.dialog.open(OutilModalComponent, {
      width: '400px',
      data: id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadOutils();
    });
  }

  logout(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  getMemberData(): void {
    this.isLoading = true;

    // S'abonner à l'observable du membre connecté
    this.authService.getCurrentMemberObservable().subscribe(memberFromAuth => {
      if (!memberFromAuth) {
        this.router.navigate(['/login']);
        return;
      }

      // ⚠️ NE PAS remplacer this.member par memberFromAuth de la base
      // Utiliser le membre actuel pour rafraîchir les pubs, outils et événements
      this.initializeForm();      // Form avec le membre actuel
      this.loadPublications();    // Publications du membre actuel
      this.loadOutils();          // Outils du membre actuel
      this.loadMemberEvents();    // Événements du membre actuel
      this.isLoading = false;
    });
  }



  onFileSelected(event: any, type: 'photo' | 'cv') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({
          [type]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  viewCV() {
    const cvBase64 = this.profileForm.get('cv')?.value;
    if (cvBase64) {
      const win = window.open();
      win?.document.write(`<iframe src="${cvBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  }

  openEditEvent(eventId: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = eventId;

    const dialogRef = this.dialog.open(ModalEvtComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.ES.UpdateEvt(eventId, data).subscribe(() => {
          this.getMemberData();
        });
      }
    });
  }

  openCreateEvent() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = null;

    const dialogRef = this.dialog.open(ModalEvtComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if (data && this.member) {
        // On ajoute l'ID du membre actuel comme organisateur
        const eventToSave = { ...data, organisateurId: this.member.id };

        this.ES.saveEvt(eventToSave).subscribe({
          next: (newEvent) => {
            this.snackBar.open('✅ Événement créé !', 'Fermer', { duration: 3000 });

            // FORCE le rafraîchissement complet des données
            this.getMemberData();
          }
        });
      }
    });

  }
}