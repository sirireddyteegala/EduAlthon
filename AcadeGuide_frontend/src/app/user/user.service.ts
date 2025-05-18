import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: "root" 
})
export class UserAPIService {
    apiUrl = environment.apiUrl;
    private httpClient = inject(HttpClient);
    private userDataSubject = new BehaviorSubject<any>(null);
    currentUserData$ = this.userDataSubject.asObservable();

    getCurrentUser(): Observable<any>{
        return this.httpClient.get(this.apiUrl + 'auth/users/current-user/');
    }

    setCurrentUserData(data: any) {
        this.userDataSubject.next(data);
    }

    executeCommand(paramsObj?: { [key: string]: any }): Observable<any>{
        let params = new HttpParams();

        if (paramsObj) {
            Object.keys(paramsObj).forEach(key => {
                params = params.set(key, paramsObj[key]);
            });
        }
        return this.httpClient.get(this.apiUrl + 'analytics/command-search', { params });
    }

    getChatbotResponse(paramsObj?: { [key: string]: any }): Observable<any>{
        let params = new HttpParams();

        if (paramsObj) {
            Object.keys(paramsObj).forEach(key => {
                params = params.set(key, paramsObj[key]);
            });
        }
        return this.httpClient.get(this.apiUrl + 'analytics/chatbot', { params });
    }

    // Chat related functions
    sendMessage(userQuery: string, sessionId?: string): Observable<any> {
        const payload = {
            user_query: userQuery,
            session_id: sessionId || ""
        };
        return this.httpClient.post(this.apiUrl + 'university/chat/sessions/send-message/', payload);
    }

    getSessionsList(): Observable<any> {
        return this.httpClient.get(this.apiUrl + 'university/chat/sessions/');
    }

    getSessionDetail(sessionId: number): Observable<any> {
        return this.httpClient.get(this.apiUrl + `university/chat/sessions/${sessionId}/`);
    }

    updateSessionTitle(sessionId: number, title: string): Observable<any> {
        return this.httpClient.patch(this.apiUrl + `university/chat/sessions/${sessionId}/`, { name: title });
    }

    // Task related functions
    getTasks(): Observable<any> {
        return this.httpClient.get(this.apiUrl + 'university/tasks/');
    }

    getTaskById(taskId: number): Observable<any> {
        return this.httpClient.get(this.apiUrl + `university/tasks/${taskId}/`);
    }

    createTask(taskData: any): Observable<any> {
        return this.httpClient.post(this.apiUrl + 'university/tasks/', taskData);
    }

    updateTask(taskId: number, taskData: any): Observable<any> {
        return this.httpClient.patch(this.apiUrl + `university/tasks/${taskId}/`, taskData);
    }

    deleteTask(taskId: number): Observable<any> {
        return this.httpClient.delete(this.apiUrl + `university/tasks/${taskId}/`);
    }
}