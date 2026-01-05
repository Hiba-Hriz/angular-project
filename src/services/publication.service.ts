import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Outil } from 'src/models/Outil ';
import { Publication } from 'src/models/Publication';



@Injectable({
    providedIn: 'root'
})

export class PublicationService {
    private apiUrl = 'http://localhost:9000/publications';

    constructor(private httpClient: HttpClient) {

    }
    getAll(): Observable<Publication[]> {
        return this.httpClient.get<Publication[]>(this.apiUrl);
    }

    getById(id: number): Observable<Publication> {
        return this.httpClient.get<Publication>(`${this.apiUrl}/${id}`);
    }

    create(pub: Publication): Observable<Publication> {
        return this.httpClient.post<Publication>(this.apiUrl, pub);
    }

    delete(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
    }
    update(pub: Publication): Observable<Publication> {
        return this.httpClient.put<Publication>(`${this.apiUrl}/${pub.id}`, pub);
    }

}
