import type { TaskInput, TaskPriority, TaskStatus } from './types.js';

const statuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];
const priorities: TaskPriority[] = ['low', 'medium', 'high'];

export function validateTask(value: unknown): TaskInput {
  if (!value || typeof value !== 'object') throw new Error('Corpo da requisição inválido.');
  const body = value as Record<string, unknown>;
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const subject = String(body.subject ?? '').trim();
  const dueDate = String(body.dueDate ?? '').trim();
  const priority = body.priority as TaskPriority;
  const status = body.status as TaskStatus;

  if (title.length < 3 || title.length > 120) throw new Error('O título deve ter entre 3 e 120 caracteres.');
  if (description.length > 1000) throw new Error('A descrição deve ter no máximo 1000 caracteres.');
  if (!subject || subject.length > 80) throw new Error('Informe uma disciplina válida.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(`${dueDate}T00:00:00Z`))) {
    throw new Error('Informe uma data no formato AAAA-MM-DD.');
  }
  if (!priorities.includes(priority)) throw new Error('Prioridade inválida.');
  if (!statuses.includes(status)) throw new Error('Status inválido.');

  return { title, description, subject, dueDate, priority, status };
}

