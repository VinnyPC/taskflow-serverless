import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Task, TaskInput } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = '/api/tasks';
  constructor(private http: HttpClient) {}
  list(): Observable<Task[]> { return this.http.get<Task[]>(this.apiUrl); }
  create(task: TaskInput): Observable<Task> { return this.http.post<Task>(this.apiUrl, task); }
  update(id: string, task: TaskInput): Observable<Task> { return this.http.put<Task>(`${this.apiUrl}/${id}`, task); }
  remove(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}

