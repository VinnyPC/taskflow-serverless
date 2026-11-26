import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import type { Task } from './types.js';
import { validateTask } from './validation.js';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.TABLE_NAME ?? '';
const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

function response(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return { statusCode, headers, body: body === undefined ? '' : JSON.stringify(body) };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (event.httpMethod === 'OPTIONS') return response(204);
    const id = event.pathParameters?.id;

    if (event.httpMethod === 'GET' && id) {
      const result = await db.send(new GetCommand({ TableName: tableName, Key: { id } }));
      return result.Item ? response(200, result.Item) : response(404, { message: 'Tarefa não encontrada.' });
    }

    if (event.httpMethod === 'GET') {
      const result = await db.send(new ScanCommand({ TableName: tableName }));
      const tasks = (result.Items as Task[] | undefined) ?? [];
      tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      return response(200, tasks);
    }

    if (event.httpMethod === 'POST') {
      const input = validateTask(JSON.parse(event.body ?? '{}'));
      const now = new Date().toISOString();
      const task: Task = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
      await db.send(new PutCommand({ TableName: tableName, Item: task, ConditionExpression: 'attribute_not_exists(id)' }));
      return response(201, task);
    }

    if (event.httpMethod === 'PUT' && id) {
      const input = validateTask(JSON.parse(event.body ?? '{}'));
      const existing = await db.send(new GetCommand({ TableName: tableName, Key: { id } }));
      if (!existing.Item) return response(404, { message: 'Tarefa não encontrada.' });
      const task: Task = { ...(existing.Item as Task), ...input, updatedAt: new Date().toISOString() };
      await db.send(new PutCommand({ TableName: tableName, Item: task }));
      return response(200, task);
    }

    if (event.httpMethod === 'DELETE' && id) {
      const existing = await db.send(new GetCommand({ TableName: tableName, Key: { id } }));
      if (!existing.Item) return response(404, { message: 'Tarefa não encontrada.' });
      await db.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
      return response(204);
    }

    return response(405, { message: 'Método não permitido.' });
  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) return response(400, { message: 'JSON inválido.' });
    if (error instanceof Error && !('name' in error && error.name?.includes('Exception'))) return response(400, { message: error.message });
    return response(500, { message: 'Erro interno do servidor.' });
  }
}

