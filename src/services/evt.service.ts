import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evt } from 'src/models/Evt';

@Injectable({
  providedIn: 'root'
})
export class EvtService {
  private apiUrl = 'http://localhost:9000/evenements';

  constructor(private httpClient: HttpClient) { }

  // ========== MÉTHODES EXISTANTES ==========

  /**
   * Récupérer tous les événements
   */
  GetAllEvents(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiUrl);
  }

  /**
   * Alias pour GetAllEvents (pour compatibilité avec le nouveau code)
   */
  getAllEvents(): Observable<any[]> {
    return this.GetAllEvents();
  }

  /**
   * Créer un nouvel événement
   */
  saveEvt(e: Evt): Observable<void> {
    return this.httpClient.post<void>(this.apiUrl, e);
  }

  /**
   * Récupérer un événement par son ID
   */
  getEvtById(id: string): Observable<any> {
    return this.httpClient.get<Evt>(`${this.apiUrl}/${id}`);
  }

  /**
   * Mettre à jour un événement
   */
  UpdateEvt(id: string, e: Evt): Observable<void> {
    return this.httpClient.put<void>(`${this.apiUrl}/${id}`, e);
  }

  /**
   * Supprimer un événement
   */
  DeleteEvt(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Alias pour DeleteEvt (pour compatibilité avec le nouveau code)
   */
  deleteEvt(id: string): Observable<void> {
    return this.DeleteEvt(id);
  }

  // ========== NOUVELLES MÉTHODES POUR LES ÉVÉNEMENTS ATTRIBUÉS ==========

  /**
   * Récupérer les événements auxquels un membre participe (assignés)
   * ✅ CORRIGÉ : GET /evenements/membre/{memberId}
   */
  getEventsByMember(memberId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/membre/${memberId}`);
  }

  /**
   * Inscrire un membre à un événement
   * ✅ POST /evenements/{eventId}/subscribe
   * Body: { "membreId": number }
   */
  subscribeToEvent(eventId: number, memberId: number): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/${eventId}/subscribe`, { membreId: memberId });
  }

  /**
   * Désinscrire un membre d'un événement
   * ✅ DELETE /evenements/{eventId}/unsubscribe/{memberId}
   */
  unsubscribeFromEvent(eventId: number, memberId: number): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/${eventId}/unsubscribe/${memberId}`);
  }

  /**
   * Récupérer les IDs des participants d'un événement
   * ✅ GET /evenements/{eventId}/participants
   * Retourne une liste de Long (IDs des membres)
   */
  getEventParticipants(eventId: number): Observable<number[]> {
    return this.httpClient.get<number[]>(`${this.apiUrl}/${eventId}/participants`);
  }

  /**
   * Récupérer les événements organisés par un membre
   * ✅ CORRIGÉ : GET /evenements/organisateur/{memberId}
   */
  getEventsByOrganizer(memberId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/organisateur/${memberId}`);
  }
}