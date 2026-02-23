# Alterações Realizadas - Sistema de Quiz (Atualizado)

## Resumo das Mudanças

Este documento descreve as alterações realizadas para adicionar:
1. **Lista de alunos que responderam o quiz** (visão do professor)
2. **Marcação de quiz como feito** (visão do aluno)
3. **Status visual de "Respondido"** para o aluno
4. **Botão "Apagar Resposta"** para o aluno (com modal de confirmação)

---

## 1. Backend (server.js)

### Nova Rota: GET `/quiz/alunos/responderam`
- Lista alunos que responderam e não responderam o quiz.

### Nova Rota: DELETE `/quiz/resposta/apagar`
- Permite que o aluno apague sua própria resposta para responder novamente.

### Alteração na Rota: GET `/quiz/listar`
- Agora retorna o campo `respondido: true/false` para cada quiz, baseado no aluno logado.

---

## 2. Frontend - API (public/js/servicos-api.js)

### Novas Funções:
- `listarAlunosQuiz()`: Chamada para o professor ver quem respondeu.
- `apagarRespostaQuiz()`: Chamada para o aluno apagar sua resposta.

---

## 3. Frontend - Quiz (public/js/quiz.js)

### Visão do Professor:
- Botão **Listar** adicionado para ver progresso da turma.
- Função `mostrarListaAlunosRespondendo()` exibe contador e lista detalhada.

### Visão do Aluno:
- **Marcação Visual**: Quizzes respondidos ganham um badge verde de "Respondido".
- **Botão Dinâmico**: 
  - Se não respondeu: Botão **Abrir Quiz** (azul).
  - Se já respondeu: Botão **Apagar Resposta** (vermelho).
- **Confirmação**: Ao clicar em apagar, abre o modal padrão do sistema pedindo confirmação.
- **Mensagem**: "Quiz marcado como feito!" ao enviar.

---

## Como Funciona

### Para o Professor:
1. Clica em "Listar" no quiz desejado.
2. Vê quem já fez e quem ainda não fez.

### Para o Aluno:
1. Responde o quiz normalmente.
2. Após responder, o quiz fica marcado como "Respondido".
3. Se precisar refazer, clica em "Apagar Resposta", confirma no modal, e o botão "Abrir Quiz" volta a aparecer.

---

## Arquivos Modificados
1. **server.js**
2. **public/js/servicos-api.js**
3. **public/js/quiz.js**

---

## Notas
- Utiliza o modal de confirmação já existente no sistema (`mostrarModalGeral`).
- Mantém o estilo visual consistente com o restante da aplicação.
