import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTask } from './validation.js';

test('aceita uma tarefa válida', () => {
  const task = validateTask({ title: 'Trabalho final', description: '', subject: 'Cloud', dueDate: '2026-12-10', priority: 'high', status: 'pending' });
  assert.equal(task.title, 'Trabalho final');
});

test('rejeita título curto', () => {
  assert.throws(() => validateTask({ title: 'Oi', subject: 'Cloud', dueDate: '2026-12-10', priority: 'high', status: 'pending' }), /título/);
});

