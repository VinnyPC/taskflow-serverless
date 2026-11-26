import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { Task, TaskInput, TaskPriority, TaskStatus } from './task.model';
import { TaskService } from './task.service';

const blankTask = (): TaskInput => ({ title: '', description: '', subject: '', dueDate: '', priority: 'medium', status: 'pending' });

@Component({
  selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html', styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  tasks: Task[] = [];
  form = blankTask();
  editingId: string | null = null;
  loading = true;
  saving = false;
  error = '';
  filter: TaskStatus | 'all' = 'all';

  constructor(private tasksApi: TaskService) {}
  ngOnInit(): void { this.load(); }
  get visibleTasks(): Task[] { return this.filter === 'all' ? this.tasks : this.tasks.filter(t => t.status === this.filter); }
  get completedCount(): number { return this.tasks.filter(t => t.status === 'completed').length; }

  load(): void {
    this.loading = true; this.error = '';
    this.tasksApi.list().pipe(finalize(() => this.loading = false)).subscribe({ next: tasks => this.tasks = tasks, error: () => this.error = 'Não foi possível carregar as tarefas.' });
  }
  save(): void {
    if (!this.form.title.trim() || !this.form.subject.trim() || !this.form.dueDate) { this.error = 'Preencha título, disciplina e prazo.'; return; }
    this.saving = true; this.error = '';
    const request = this.editingId ? this.tasksApi.update(this.editingId, this.form) : this.tasksApi.create(this.form);
    request.pipe(finalize(() => this.saving = false)).subscribe({ next: () => { this.cancel(); this.load(); }, error: err => this.error = err.error?.message ?? 'Não foi possível salvar.' });
  }
  edit(task: Task): void {
    this.editingId = task.id;
    this.form = { title: task.title, description: task.description, subject: task.subject, dueDate: task.dueDate, priority: task.priority, status: task.status };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  cancel(): void { this.editingId = null; this.form = blankTask(); }
  remove(task: Task): void {
    if (!confirm(`Excluir “${task.title}”?`)) return;
    this.tasksApi.remove(task.id).subscribe({ next: () => this.load(), error: () => this.error = 'Não foi possível excluir.' });
  }
  setStatus(task: Task, status: TaskStatus): void { this.tasksApi.update(task.id, { ...task, status }).subscribe({ next: () => this.load(), error: () => this.error = 'Não foi possível atualizar.' }); }
  statusLabel(status: TaskStatus): string { return ({ pending: 'Pendente', in_progress: 'Em andamento', completed: 'Concluída' })[status]; }
  priorityLabel(priority: TaskPriority): string { return ({ low: 'Baixa', medium: 'Média', high: 'Alta' })[priority]; }
}

