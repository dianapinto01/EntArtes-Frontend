# EntArtes — Frontend

Aplicação web desenvolvida como trabalho de grupo para a disciplina de **Programação Web**.

## Grupo

| Nome | Número |
|------|--------|
| Henrique Gomes | 26427 |
| Diogo Carvalho | 25245 |
| Ruben Barbosa | 26298 |
| Diana Pinto | 24963 |
| Maria Checan | 25499 |

---

## Sobre o Projeto

O **EntArtes** é uma plataforma de gestão para uma escola de artes. Permite gerir horários de aulas, sessões de coaching, eventos, estúdios, figurinos e relatórios financeiros, com diferentes funcionalidades consoante o papel do utilizador (professor, responsável ou coordenação).

---

## Tecnologias Utilizadas

- **React 19** — biblioteca de interface de utilizador
- **Vite 8** — ferramenta de build e servidor de desenvolvimento
- **React Router DOM 7** — navegação entre páginas
- **Supabase JS** — cliente de base de dados
- **lucide-react** — ícones
- **xlsx** — exportação de ficheiros Excel
- **react-datepicker** — seletor de datas
- **CSS puro** — folhas de estilo personalizadas por página

---

## Instalação e Execução

**Pré-requisitos:** Node.js instalado e o servidor backend a correr em `localhost:3000`.

```bash
# Entrar na pasta do projeto
cd vite-project

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

# Ou aceder online em: 

entartes-frontend.fly.dev
---

## Utilizadores de Teste

Estão disponíveis os seguintes utilizadores de teste para explorar as diferentes funcionalidades da plataforma:

### Professor
| Campo | Valor |
|-------|-------|
| Email | marianaribeiro@entartes.pt |
| Password | 1234567A |

### Responsável
| Campo | Valor |
|-------|-------|
| Email | tiagomartins@gmail.com |
| Password | 1234567A |

### Coordenação
| Campo | Valor |
|-------|-------|
| Email | diogo@entartes.pt |
| Password | 123456 |

---

## Estrutura de Papéis e Funcionalidades

O sistema tem três papéis distintos, cada um com acesso a funcionalidades específicas.

### Professor

Após login, o professor é redirecionado para o seu **dashboard** com um calendário interativo que mostra as sessões de coaching aprovadas.

Funcionalidades disponíveis:

- **Dashboard** — calendário com seleção de intervalo de datas e lista de sessões aprovadas
- **Coaching** — criação e gestão de sessões de coaching (individuais e de grupo)
- **Inserção de horário** — definição da disponibilidade semanal para coachings
- **Validar sessões** — validação das sessões de coaching realizadas
- **Gestão de presenças** — registo de presenças nas sessões de grupo do dia atual
- **Horário** — consulta do horário semanal de aulas
- **Estúdios** — consulta da ocupação dos estúdios por data
- **Estatísticas** — painel pessoal com dados mensais (aulas, coachings, alunos atendidos, ganhos e distribuição por modalidade)
- **Inventário** — publicação e aluguer de figurinos
- **Eventos** — consulta de eventos

### Responsável

Após login, o responsável é redirecionado para a página de eventos dos seus alunos.

Funcionalidades disponíveis:

- **Eventos** — consulta e inscrição em eventos (com possibilidade de selecionar o aluno quando existem vários associados à conta)
- **Coaching** — submissão de pedidos de coaching e consulta das aulas disponíveis para inscrição
- **Validar sessões** — validação das sessões de coaching dos seus alunos
- **Horário** — consulta do horário semanal
- **Inventário** — publicação e aluguer de figurinos; gestão dos pedidos de aluguer recebidos

### Coordenação

Após login, a coordenação é redirecionada para a página de relatórios.

Funcionalidades disponíveis:

- **Relatórios e balanços** — estatísticas mensais (presenças, inscrições, eventos) com gráfico de linha do balanço anual e exportação de dados para Excel (`.xlsx`)
- **Histórico** — consulta do histórico completo de sessões, eventos e alugueres com filtros por título e data
- **Horário** — consulta e edição do horário letivo (criar horário, inserir/editar/apagar aulas)
- **Gestão de eventos** — criação e gestão de eventos e associação a turmas
- **Gestão de estúdios** — criação e gestão dos estúdios disponíveis
- **Estúdios** — consulta da ocupação dos estúdios por data
- **Inventário** — publicação e aluguer de figurinos; gestão de pedidos recebidos; criação de tags para figurinos
- **Eliminar contas e eventos** — remoção de alunos, professores e eventos
- **Criação de contas e turmas** — criação de contas de professores (com modalidade e IBAN), responsáveis e administradores, e associação a turmas

---

## Páginas e Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Página de login |
| `/recuperar-senha` | Recuperação de password |
| `/professor` | Dashboard do professor |
| `/schedule` | Horário semanal de aulas |
| `/studios` | Ocupação dos estúdios |
| `/manage-studios` | Gestão de estúdios (coordenação) |
| `/stats-professor` | Estatísticas do professor |
| `/eventos` | Gestão de eventos (coordenação) |
| `/evento/:id` | Detalhe de um evento |
| `/professor-eventos` | Eventos (professor) |
| `/homestudents` | Página inicial do responsável |
| `/criar-conta` | Criação de contas (coordenação) |
| `/gerir` | Eliminação de contas e eventos |
| `/historico` | Histórico completo |
| `/report` | Relatórios e balanços |
| `/coaching` | Gestão de coaching (professor) |
| `/coaching-requests` | Gestão de pedidos de coaching |
| `/meus-pedidos` | Pedidos de coaching do responsável |
| `/aulas-disponiveis` | Aulas disponíveis para inscrição |
| `/sessoes-coaching` | Validação de sessões |
| `/coaching/sessao/:id` | Detalhe de uma sessão de coaching |
| `/inserir-horario` | Disponibilidade do professor |
| `/gestao-presencas` | Gestão de presenças (professor) |
| `/gestao-presencas/:sessaoId` | Detalhe de presenças de uma sessão |
| `/figurinos` | Inventário de figurinos disponíveis |
| `/inventario` | Página de figurinos |
| `/criar-figurino` | Publicar um novo figurino |
| `/figurinos/:id` | Detalhe de um figurino |
| `/meus-figurinos` | Figurinos do utilizador |
| `/meus-pedidos-figurinos` | Pedidos de aluguer do utilizador |
| `/pedidos-recebidos` | Pedidos de aluguer recebidos |
| `/criar-tags` | Criação de tags (coordenação) |

---

## Autenticação

O login é feito com email e password. O token JWT e os dados do utilizador são guardados no `localStorage` com a chave `entartes_auth`. O redirecionamento após login é feito automaticamente consoante o papel do utilizador:

- **Professor** → `/professor`
- **Responsável** → `/homestudents`
- **Coordenação** → `/report`

A barra lateral de navegação adapta-se automaticamente ao papel do utilizador autenticado.
