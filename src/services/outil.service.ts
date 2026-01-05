import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Outil } from 'src/models/Outil ';



@Injectable({
    providedIn: 'root'
})
export class OutilService {
    private apiUrl = 'http://localhost:9000/outils';

    constructor(private httpClient: HttpClient) {

    }

    /** 🔹 Get all outils */
    getAll(): Observable<Outil[]> {
        return this.httpClient.get<Outil[]>(this.apiUrl);
    }

    /** 🔹 Get outil by id */
    getById(id: number): Observable<Outil> {
        return this.httpClient.get<Outil>(`${this.apiUrl}/${id}`);
    }

    /** 🔹 Create outil */
    create(outil: Outil): Observable<Outil> {
        return this.httpClient.post<Outil>(this.apiUrl, outil);
    }

    /** 🔹 Update outil */
    update(id: number, outil: Outil): Observable<Outil> {
        return this.httpClient.put<Outil>(`${this.apiUrl}/${id}`, outil);
    }

    /** 🔹 Delete outil */
    delete(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
    }
    
  
}