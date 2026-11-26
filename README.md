# TaskFlow Acadêmico

Aplicação full stack serverless para gerenciar tarefas acadêmicas. O frontend Angular é servido por CloudFront a partir de um bucket S3 privado; a API REST usa API Gateway + Lambda e persiste dados no DynamoDB. Toda a infraestrutura é criada pelo Terraform.

## Arquitetura

```text
Browser → CloudFront ┬→ S3 privado (Angular)
                    └→ /api/* → API Gateway → Lambda → DynamoDB
```

O CloudFront usa Origin Access Control para que o bucket não seja público. A Lambda tem uma role IAM com acesso apenas à tabela criada. O DynamoDB usa cobrança sob demanda, criptografia e recuperação pontual.

## Funcionalidades

- Cadastro, listagem, edição e exclusão de tarefas;
- filtros por status e alteração rápida de andamento;
- validação no frontend e na API;
- interface responsiva e acessível;
- logs no CloudWatch com retenção de 14 dias;
- infraestrutura reproduzível com Terraform.

## Pré-requisitos

- Node.js 20+ e npm;
- Terraform 1.7+;
- AWS CLI autenticada (`aws configure` ou variáveis de ambiente);
- uma conta AWS. O deploy pode gerar custos, embora os serviços tenham camada gratuita.

## Instalação e testes

```bash
npm run install:all
npm test
npm run build
```

## Deploy completo

Escolha um `project_name` globalmente único, pois ele compõe o nome do bucket:

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
# edite infra/terraform.tfvars
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Ao final, o Terraform mostra `site_url` e `api_url`. O Angular chama `/api/tasks`, e o CloudFront encaminha esse caminho para o API Gateway; não é necessário gravar URLs de ambiente no frontend.

Para atualizar a aplicação, execute novamente `./scripts/deploy.sh`. Como os arquivos têm hash no nome, o navegador recebe a versão nova. O `index.html` usa `no-cache`.

## API REST

| Método | Rota | Resultado |
|---|---|---|
| `GET` | `/tasks` | Lista tarefas por prazo |
| `GET` | `/tasks/{id}` | Busca uma tarefa |
| `POST` | `/tasks` | Cria uma tarefa |
| `PUT` | `/tasks/{id}` | Substitui os dados da tarefa |
| `DELETE` | `/tasks/{id}` | Exclui uma tarefa |

Exemplo de criação:

```json
{
  "title": "Entregar atividade de Cloud",
  "description": "Apresentar arquitetura e demonstração",
  "subject": "Computação em Nuvem",
  "dueDate": "2026-12-05",
  "priority": "high",
  "status": "pending"
}
```

## Desenvolvimento do frontend

Em produção, a API fica no mesmo domínio. Para usar `ng serve`, crie um proxy local apontando para a `api_url`, ou altere temporariamente `apiUrl` em `frontend/src/app/task.service.ts`.

```bash
npm --prefix frontend start
```

## Remover recursos

```bash
terraform -chdir=infra destroy
```

Confira os recursos antes de confirmar. A tabela e seus dados serão removidos.

## Decisões para apresentação

- **Serverless:** escala automática e cobrança por uso.
- **Lambda única:** suficiente para o escopo acadêmico e reduz duplicação; em um produto maior, handlers poderiam ser separados por contexto.
- **DynamoDB:** chave de partição `id`; `Scan` é aceitável para o volume didático. Em escala real, índices e paginação seriam necessários.
- **CloudFront único:** entrega a SPA e atua como proxy da API, evitando CORS no uso normal.
- **Terraform:** cria todos os recursos e também envia o build Angular ao S3.

