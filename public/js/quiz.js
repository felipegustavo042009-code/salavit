const DadosQuiz = {
    quizAtivo: null,
    quizzes: [],
    perguntaAtualIndex: 0,
    perguntas: [],
    modoEdicao: false,
    etapa: 'lista',
    respostasAluno: {},
    quantiaAcertadas: {},

    criarPerguntaVazia() {
        return {
            texto: '',
            opcoes: ['', '', '', ''],
            respostaCorreta: 0
        };
    },

    criarQuizLocal(titulo, quantidadePerguntas) {
        const perguntas = [];
        for (let i = 0; i < quantidadePerguntas; i++) {
            perguntas.push(this.criarPerguntaVazia());
        }
        return {
            titulo: titulo,
            perguntas: perguntas
        };
    },

    obterPerguntaAtual() {
        return this.perguntas[this.perguntaAtualIndex] || null;
    },

    adicionarPergunta() {
        this.perguntas.push(this.criarPerguntaVazia());
        this.perguntaAtualIndex = this.perguntas.length - 1;
    },

    irParaPergunta(index) {
        if (index >= 0 && index < this.perguntas.length) {
            this.perguntaAtualIndex = index;
        }
    },

    atualizarPergunta(index, dados) {
        if (index >= 0 && index < this.perguntas.length) {
            this.perguntas[index] = { ...this.perguntas[index], ...dados };
        }
    },

    limpar() {
        this.quizAtivo = null;
        this.perguntaAtualIndex = 0;
        this.perguntas = [];
        this.modoEdicao = false;
        this.etapa = 'lista';
        this.respostasAluno = {};
    }
};

class GerenciarQuiz {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.vincularEventos();
    }

    vincularEventos() {
        document.addEventListener('click', (e) => {
            const btnCriarQuiz = e.target.closest('#btn-criar-quiz');
            const btnConfirmarNovoQuiz = e.target.closest('#btn-confirmar-novo-quiz');
            const btnCancelarNovoQuiz = e.target.closest('#btn-cancelar-novo-quiz');
            const btnAdicionarPergunta = e.target.closest('#btn-adicionar-pergunta-quiz');
            const btnSalvarQuiz = e.target.closest('#btn-salvar-quiz');
            const btnFecharQuiz = e.target.closest('#btn-fechar-quiz');
            const btnApagarQuiz = e.target.closest('.btn-apagar-quiz');
            const cardPergunta = e.target.closest('.quiz-card-pergunta');
            const btnAbrirQuizAluno = e.target.closest('.btn-abrir-quiz-aluno');
            const btnFecharQuizAluno = e.target.closest('#btn-fechar-quiz-aluno');
            const btnProximaPergunta = e.target.closest('#btn-proxima-pergunta-aluno');
            const btnPerguntaAnterior = e.target.closest('#btn-pergunta-anterior-aluno');
            const btnEnviarRespostasAluno = e.target.closest('#btn-enviar-respostas-aluno');
            const btnListarQuiz = e.target.closest('.btn-listar-quiz');
            const btnApagarRespostaAluno = e.target.closest('.btn-apagar-resposta-aluno');

            if (btnCriarQuiz) this.abrirFormularioNovoQuiz();
            if (btnConfirmarNovoQuiz) this.confirmarNovoQuiz();
            if (btnCancelarNovoQuiz) this.fecharFormularioNovoQuiz();
            if (btnAdicionarPergunta) this.adicionarPergunta();
            if (btnSalvarQuiz) this.salvarQuiz();
            if (btnFecharQuiz) this.fecharEdicaoQuiz();
            if (btnApagarQuiz) {
                const quizId = btnApagarQuiz.dataset.quizId;
                this.apagarQuiz(quizId);
            }
            if (cardPergunta) {
                const index = parseInt(cardPergunta.dataset.index);
                this.navegarParaPergunta(index);
            }
            if (btnAbrirQuizAluno) {
                const quizId = btnAbrirQuizAluno.dataset.quizId;
                this.abrirQuizAluno(quizId);
            }
            if (btnFecharQuizAluno) this.fecharQuizAluno();
            if (btnProximaPergunta) this.proximaPerguntaAluno();
            if (btnPerguntaAnterior) this.perguntaAnteriorAluno();
            if (btnEnviarRespostasAluno) this.enviarRespostasAluno();
            if (btnListarQuiz) {
                const quizId = btnListarQuiz.dataset.quizId;
                this.mostrarListaAlunosRespondendo(quizId);
            }
            if (btnApagarRespostaAluno) {
                const quizId = btnApagarRespostaAluno.dataset.quizId;
                this.apagarRespostaAluno(quizId);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-adicionar-opcao-quiz')) {
                this.adicionarOpcao();
            }
        });

        document.addEventListener('click', (e) => {
            const btnEditarQuiz = e.target.closest('.btn-editar-quiz');
            if (btnEditarQuiz) {
                const quizId = btnEditarQuiz.dataset.quizId;
                this.editarQuiz(quizId);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('.quiz-opcao-resposta-aluno')) {
                const index = parseInt(e.target.dataset.perguntaIndex);
                const opcao = parseInt(e.target.value);
                DadosQuiz.respostasAluno[index] = opcao;
            }
        });
    }

    abrirFormularioNovoQuiz() {
        const modal = document.getElementById('criar-quiz-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            const inputTitulo = document.getElementById('quiz-titulo-input');
            if (inputTitulo) {
                inputTitulo.value = '';
                setTimeout(() => inputTitulo.focus(), 100);
            }
            const inputQtd = document.getElementById('quiz-qtd-perguntas-input');
            if (inputQtd) inputQtd.value = '1';
        }
    }

    fecharFormularioNovoQuiz() {
        const modal = document.getElementById('criar-quiz-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    confirmarNovoQuiz() {
        const titulo = document.getElementById('quiz-titulo-input')?.value.trim();
        const qtdRaw = document.getElementById('quiz-qtd-perguntas-input')?.value;
        const qtd = parseInt(qtdRaw);

        if (!titulo) {
            showToast('Por favor, digite o nome do quiz', 'error');
            return;
        }
        if (!qtd || qtd < 1 || qtd > 50) {
            showToast('A quantidade de perguntas deve ser entre 1 e 50', 'error');
            return;
        }

        this.fecharFormularioNovoQuiz();

        const quizLocal = DadosQuiz.criarQuizLocal(titulo, qtd);
        DadosQuiz.quizAtivo = quizLocal;
        DadosQuiz.perguntas = quizLocal.perguntas;
        DadosQuiz.perguntaAtualIndex = 0;
        DadosQuiz.modoEdicao = false;
        DadosQuiz.etapa = 'edicao';

        this.renderizarEdicaoQuiz();
    }

    renderizarEdicaoQuiz() {
        const secao = document.getElementById('quiz-edicao-section');
        if (!secao) return;

        secao.style.display = 'flex';
        secao.scrollIntoView({ behavior: 'smooth' });

        this.renderizarCardsPerguntas();
        this.renderizarFormularioPergunta();
    }

    renderizarCardsPerguntas() {
        const container = document.getElementById('quiz-cards-perguntas');
        if (!container) return;

        const total = DadosQuiz.perguntas.length;
        const ativo = DadosQuiz.perguntaAtualIndex;

        let html = '';
        for (let i = 0; i < total; i++) {
            const classeAtiva = i === ativo ? 'quiz-card-pergunta ativo' : 'quiz-card-pergunta';
            html += `<button class="${classeAtiva}" data-index="${i}">${i + 1}</button>`;
        }

        container.innerHTML = html;
    }

    renderizarFormularioPergunta() {
        const container = document.getElementById('quiz-formulario-pergunta');
        if (!container) return;

        const pergunta = DadosQuiz.obterPerguntaAtual();
        const index = DadosQuiz.perguntaAtualIndex;
        const total = DadosQuiz.perguntas.length;

        if (!pergunta) return;

        container.innerHTML = `
            <div class="quiz-pergunta-numero">
                <span>Pergunta ${index + 1} de ${total}</span>
            </div>
            <div class="form-group">
                <label for="quiz-texto-pergunta">Enunciado da Pergunta</label>
                <textarea
                    id="quiz-texto-pergunta"
                    class="form-textarea"
                    placeholder="Digite o enunciado da pergunta..."
                    rows="3"
                >${pergunta.texto}</textarea>
            </div>
            <div class="quiz-opcoes-lista">
                <label class="quiz-opcoes-label">Opções de Resposta</label>
                ${pergunta.opcoes.map((opcao, i) => `
                    <div class="quiz-opcao-item">
                        <input
                            type="radio"
                            name="resposta-correta"
                            id="opcao-correta-${i}"
                            value="${i}"
                            class="quiz-radio-correta"
                            ${pergunta.respostaCorreta === i ? 'checked' : ''}
                        >
                        <label for="opcao-correta-${i}" class="quiz-radio-label" title="Marcar como correta"></label>
                        <input
                            type="text"
                            id="quiz-opcao-${i}"
                            class="form-input quiz-opcao-input"
                            placeholder="Opção ${i + 1}"
                            value="${opcao}"
                        >
                    </div>
                `).join('')}
            </div>
            <div class="quiz-pergunta-acoes">
                <button class="btn btn-secondary" id="btn-adicionar-opcao-quiz">
                    <i class="fas fa-plus"></i> Adicionar Opção
                </button>
            </div>
        `;

        container.querySelectorAll('.quiz-opcao-input').forEach((input, i) => {
            input.addEventListener('input', () => {
                this.salvarEstadoPerguntaAtual();
            });
        });

        container.querySelector('#quiz-texto-pergunta')?.addEventListener('input', () => {
            this.salvarEstadoPerguntaAtual();
        });

        container.querySelectorAll('.quiz-radio-correta').forEach(radio => {
            radio.addEventListener('change', () => {
                this.salvarEstadoPerguntaAtual();
            });
        });
    }

    salvarEstadoPerguntaAtual() {
        const index = DadosQuiz.perguntaAtualIndex;
        const texto = document.getElementById('quiz-texto-pergunta')?.value || '';
        const opcoes = [];
        document.querySelectorAll('.quiz-opcao-input').forEach(input => {
            opcoes.push(input.value);
        });
        const radioMarcado = document.querySelector('.quiz-radio-correta:checked');
        const respostaCorreta = radioMarcado ? parseInt(radioMarcado.value) : 0;

        DadosQuiz.atualizarPergunta(index, { texto, opcoes, respostaCorreta });
    }

    navegarParaPergunta(index) {
        this.salvarEstadoPerguntaAtual();
        DadosQuiz.irParaPergunta(index);
        this.renderizarCardsPerguntas();
        this.renderizarFormularioPergunta();
    }

    adicionarPergunta() {
        this.salvarEstadoPerguntaAtual();
        DadosQuiz.adicionarPergunta();
        this.renderizarCardsPerguntas();
        this.renderizarFormularioPergunta();

        const container = document.getElementById('quiz-cards-perguntas');
        if (container) {
            container.scrollLeft = container.scrollWidth;
        }
    }

    adicionarOpcao() {
        const index = DadosQuiz.perguntaAtualIndex;
        const pergunta = DadosQuiz.obterPerguntaAtual();
        if (!pergunta) return;

        if (pergunta.opcoes.length >= 6) {
            showToast('Máximo de 6 opções por pergunta', 'warning');
            return;
        }

        this.salvarEstadoPerguntaAtual();
        const perguntaAtualizada = DadosQuiz.obterPerguntaAtual();
        perguntaAtualizada.opcoes.push('');
        DadosQuiz.atualizarPergunta(index, perguntaAtualizada);
        this.renderizarFormularioPergunta();
    }

    async salvarQuiz() {
        this.salvarEstadoPerguntaAtual();

        const titulo = DadosQuiz.quizAtivo?.titulo;
        const perguntas = DadosQuiz.perguntas;

        if (!titulo) {
            showToast('O quiz precisa de um título', 'error');
            return;
        }

        for (let i = 0; i < perguntas.length; i++) {
            const p = perguntas[i];
            if (!p.texto.trim()) {
                showToast(`Pergunta ${i + 1} está sem enunciado`, 'error');
                DadosQuiz.irParaPergunta(i);
                this.renderizarCardsPerguntas();
                this.renderizarFormularioPergunta();
                return;
            }
            const opcoesValidas = p.opcoes.filter(o => o.trim() !== '');
            if (opcoesValidas.length < 2) {
                showToast(`Pergunta ${i + 1} precisa de pelo menos 2 opções preenchidas`, 'error');
                DadosQuiz.irParaPergunta(i);
                this.renderizarCardsPerguntas();
                this.renderizarFormularioPergunta();
                return;
            }
        }

        const idUsuario = localStorage.getItem('idUsuario');
        const idSala = localStorage.getItem('idSala');

        if (!idUsuario || !idSala) {
            showToast('Dados de sessão não encontrados', 'error');
            return;
        }

        const perguntasFormatadas = perguntas.map(p => ({
            texto: p.texto.trim(),
            opcoes: p.opcoes.filter(o => o.trim() !== ''),
            respostaCorreta: p.respostaCorreta
        }));

        try {
            mostrarCarregamento();

            let resposta;
            if (DadosQuiz.modoEdicao && DadosQuiz.quizAtivo?.id) {
                resposta = await window.api.atualizarQuiz(
                    idUsuario,
                    DadosQuiz.quizAtivo.id,
                    titulo,
                    perguntasFormatadas
                );
            } else {
                resposta = await window.api.criarQuiz(
                    idUsuario,
                    idSala,
                    titulo,
                    perguntasFormatadas
                );
            }

            esconderCarregamento();

            if (resposta && (resposta.quizId || resposta.mensagem)) {
                showToast(
                    DadosQuiz.modoEdicao ? 'Quiz atualizado com sucesso!' : 'Quiz criado com sucesso!',
                    'success'
                );
                this.fecharEdicaoQuiz();
                await this.carregarQuizzes();
            } else {
                showToast('Erro ao salvar quiz', 'error');
            }

        } catch (error) {
            esconderCarregamento();
            showToast('Erro ao salvar quiz: ' + error.message, 'error');
            console.error('Erro ao salvar quiz:', error);
        }
    }

    fecharEdicaoQuiz() {
        const secao = document.getElementById('quiz-edicao-section');
        if (secao) {
            secao.style.display = 'none';
        }
        DadosQuiz.limpar();
    }

    async carregarQuizzes() {
        try {
            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            if (!idSala || !idUsuario) {
                console.error('Sala ou usuário não disponível');
                return;
            }

            const resposta = await window.api.listarQuiz(idUsuario, idSala);

            DadosQuiz.quizzes = resposta?.quiz || [];

            this.atualizarUIListaQuizzes();

        } catch (error) {
            console.error('Erro ao carregar quizzes:', error);
            showToast('Erro ao carregar quizzes', 'error');
        }
    }

    atualizarUIListaQuizzes() {
        const container = document.getElementById('teacher-quiz-list');
        if (!container) return;

        if (DadosQuiz.quizzes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <p>Nenhum quiz criado ainda</p>
                    <button class="btn btn-primary" id="btn-criar-quiz">
                        <i class="fas fa-plus"></i> Criar Primeiro Quiz
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = DadosQuiz.quizzes.map(quiz => {
            const totalPerguntas = quiz.perguntas ? quiz.perguntas.length : 0;
            const dataCriacao = quiz.criadoEm
                ? new Date(quiz.criadoEm._seconds * 1000).toLocaleString('pt-BR')
                : 'Data não disponível';

            return `
                <div class="quiz-item-lista">
                    <div class="quiz-item-header">
                        <div class="quiz-item-titulo-container">
                            <i class="fas fa-question-circle"></i>
                            <h4>${quiz.titulo}</h4>
                        </div>
                        <span class="quiz-item-badge">${totalPerguntas} pergunta${totalPerguntas !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="quiz-item-body">
                        <small class="quiz-item-data">
                            <i class="fas fa-calendar-alt"></i> ${dataCriacao}
                        </small>
                    </div>
                    <div class="quiz-item-acoes">
                        <button class="btn btn-small btn-secondary btn-editar-quiz" data-quiz-id="${quiz.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-small btn-error btn-apagar-quiz" data-quiz-id="${quiz.id}">
                            <i class="fas fa-trash"></i> Apagar
                        </button>
                        <button class="btn btn-small btn-create btn-listar-quiz" data-quiz-id="${quiz.id}">
                            <i class="fas fa-list"></i> Listar
                        </button>
                    </div>
                </div>
                <hr>
            `;
        }).join('');
    }

    atualizarUIListaQuizzesAluno() {
        const container = document.getElementById('student-quiz-list');
        if (!container) {
            console.error('❌ Container student-quiz-list não encontrado!');
            return;
        }

        console.log('Atualizando UI com quizzes:', DadosQuiz.quizzes);

        if (!DadosQuiz.quizzes || DadosQuiz.quizzes.length === 0) {
            container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <p>Nenhum quiz disponível no momento</p>
                <small>Verifique se o professor já criou algum quiz</small>
            </div>
        `;
            return;
        }

        container.innerHTML = DadosQuiz.quizzes.map(quiz => {
            const totalPerguntas = quiz.perguntas ? quiz.perguntas.length : 0;
            const respondido = quiz.respondido;

            return `
                <div class="quiz-item-lista quiz-item-aluno ${respondido ? 'quiz-respondido' : ''}">
                    <div class="quiz-item-header">
                        <div class="quiz-item-titulo-container">
                            <i class="fas fa-question-circle"></i>
                            <h4>${quiz.titulo}</h4>
                        </div>
                        <span class="quiz-item-badge">${totalPerguntas} pergunta${totalPerguntas !== 1 ? 's' : ''}</span>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${respondido ? '<span class="status-badge status-completed"><i class="fas fa-check-circle"></i> Respondido</span>' : ''}
                        </div>
                    </div>
                    <div class="quiz-item-body">
                        <small class="quiz-item-data">
                            <i class="fas fa-tasks"></i> ${respondido ? 'Você já respondeu este quiz' : 'Responda todas as perguntas'}
                        </small>
                    </div>
                    <div class="quiz-item-acoes">
                        ${respondido ? `
                            <button class="btn btn-error btn-apagar-resposta-aluno" data-quiz-id="${quiz.id}">
                                <i class="fas fa-trash"></i> Apagar Resposta
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-abrir-quiz-aluno" data-quiz-id="${quiz.id}">
                                <i class="fas fa-play"></i> Abrir Quiz
                            </button>
                        `}
                    </div>
                </div>
                <hr>
            `;
        }).join('');
    }

    async editarQuiz(quizId) {
        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');
            const resposta = await window.api.buscarQuiz(idUsuario, quizId);

            esconderCarregamento();

            if (!resposta || !resposta.quiz) {
                showToast('Erro ao carregar quiz', 'error');
                return;
            }

            const quiz = resposta.quiz;

            DadosQuiz.quizAtivo = {
                id: quiz.id,
                titulo: quiz.titulo
            };
            DadosQuiz.perguntas = quiz.perguntas.map(p => ({
                texto: p.texto,
                opcoes: p.opcoes,
                respostaCorreta: p.respostaCorreta !== undefined ? p.respostaCorreta : 0
            }));
            DadosQuiz.perguntaAtualIndex = 0;
            DadosQuiz.modoEdicao = true;
            DadosQuiz.etapa = 'edicao';

            this.renderizarEdicaoQuiz();

        } catch (error) {
            esconderCarregamento();
            showToast('Erro ao carregar quiz para edição: ' + error.message, 'error');
            console.error('Erro ao editar quiz:', error);
        }
    }

    async apagarQuiz(quizId) {
        const quiz = DadosQuiz.quizzes.find(q => q.id === quizId);
        const nomeQuiz = quiz?.titulo || 'este quiz';

        const confirmar = await mostrarModalGeral(
            `Tem certeza que deseja excluir o quiz "${nomeQuiz}"? Esta ação não pode ser desfeita.`,
            'desfazer',
            'Excluir Quiz'
        );

        if (!confirmar) return;

        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            await window.api.apagarQuiz(idUsuario, quizId, idSala);

            showToast('Quiz excluído com sucesso!', 'success');

            DadosQuiz.quizzes = DadosQuiz.quizzes.filter(q => q.id !== quizId);
            this.atualizarUIListaQuizzes();

            esconderCarregamento();

        } catch (error) {
            esconderCarregamento();
            showToast('Erro ao excluir quiz: ' + error.message, 'error');
            console.error('Erro ao apagar quiz:', error);
        }
    }

    async abrirQuizAluno(quizId) {
        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');
            const resposta = await window.api.buscarQuiz(idUsuario, quizId);

            esconderCarregamento();

            if (!resposta || !resposta.quiz) {
                showToast('Erro ao carregar quiz', 'error');
                return;
            }

            const quiz = resposta.quiz;

            DadosQuiz.quizAtivo = {
                id: quiz.id,
                titulo: quiz.titulo
            };
            DadosQuiz.perguntas = quiz.perguntas.map(p => ({
                texto: p.texto,
                opcoes: p.opcoes,
                respostaCorreta: p.respostaCorreta !== undefined ? p.respostaCorreta : 0
            }));
            DadosQuiz.perguntaAtualIndex = 0;
            DadosQuiz.modoEdicao = false;
            DadosQuiz.etapa = 'respondendo';
            DadosQuiz.respostasAluno = {};

            this.renderizarQuizAluno();

        } catch (error) {
            esconderCarregamento();
            showToast('Erro ao carregar quiz: ' + error.message, 'error');
            console.error('Erro ao abrir quiz:', error);
        }
    }

    renderizarQuizAluno() {
        const secao = document.getElementById('student-quiz-resposta-section');
        if (!secao) return;

        secao.style.display = 'flex';
        secao.scrollIntoView({ behavior: 'smooth' });

        this.renderizarCardsPerguntas();
        this.renderizarFormularioPerguntaAluno();
    }

    renderizarFormularioPerguntaAluno() {
        const container = document.getElementById('quiz-formulario-pergunta-aluno');
        if (!container) return;

        const pergunta = DadosQuiz.obterPerguntaAtual();
        const index = DadosQuiz.perguntaAtualIndex;
        const total = DadosQuiz.perguntas.length;

        if (!pergunta) return;

        const respostaSelecionada = DadosQuiz.respostasAluno[index] !== undefined ? DadosQuiz.respostasAluno[index] : -1;

        container.innerHTML = `
            <div class="quiz-pergunta-numero">
                <span>Pergunta ${index + 1} de ${total}</span>
            </div>
            <div class="quiz-pergunta-texto-aluno">
                <h3>${pergunta.texto}</h3>
            </div>
            <div class="quiz-opcoes-lista-aluno">
                ${pergunta.opcoes.map((opcao, i) => `
                    <div class="quiz-opcao-item-aluno">
                        <input
                            type="radio"
                            name="resposta-aluno"
                            id="opcao-aluno-${i}"
                            value="${i}"
                            class="quiz-opcao-resposta-aluno"
                            data-pergunta-index="${index}"
                            ${respostaSelecionada === i ? 'checked' : ''}
                        >
                        <label for="opcao-aluno-${i}" class="quiz-radio-label-aluno">${opcao}</label>
                    </div>
                `).join('')}
            </div>
        `;
    }

    proximaPerguntaAluno() {
        if (DadosQuiz.perguntaAtualIndex < DadosQuiz.perguntas.length - 1) {
            DadosQuiz.perguntaAtualIndex++;
            this.renderizarCardsPerguntas();
            this.renderizarFormularioPerguntaAluno();
        }
    }

    perguntaAnteriorAluno() {
        if (DadosQuiz.perguntaAtualIndex > 0) {
            DadosQuiz.perguntaAtualIndex--;
            this.renderizarCardsPerguntas();
            this.renderizarFormularioPerguntaAluno();
        }
    }

    async enviarRespostasAluno() {
        const total = DadosQuiz.perguntas.length;
        const respondidas = Object.keys(DadosQuiz.respostasAluno).length;

        if (respondidas < total) {
            const naoRespondidas = total - respondidas;
            const confirmar = await mostrarModalGeral(
                `Você ainda tem ${naoRespondidas} pergunta${naoRespondidas !== 1 ? 's' : ''} não respondida${naoRespondidas !== 1 ? 's' : ''}. Deseja enviar mesmo assim?`,
                'confirmar',
                'Enviar Quiz'
            );
            if (!confirmar) return;
        }

        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            const respostas = DadosQuiz.perguntas.map((p, i) => ({
                perguntaIndex: i,
                respostaSelecionada: DadosQuiz.respostasAluno[i] !== undefined ? DadosQuiz.respostasAluno[i] : -1,
                correta: DadosQuiz.respostasAluno[i] === p.respostaCorreta
            }));

            const resposta = await window.api.criarRespostaQuiz(
                idUsuario,
                idSala,
                DadosQuiz.quizAtivo.id,
                respostas
            );

            esconderCarregamento();

            if (resposta) {
                showToast('Quiz marcado como feito!', 'success');
                this.fecharQuizAluno();
                await this.carregarQuizzesAluno();
            } else {
                showToast('Erro ao enviar respostas', 'error');
            }

        } catch (error) {
            esconderCarregamento();
            showToast('Erro ao enviar respostas: ' + error.message, 'error');
            console.error('Erro ao enviar respostas:', error);
        }
    }

    fecharQuizAluno() {
        const secao = document.getElementById('student-quiz-resposta-section');
        if (secao) {
            secao.style.display = 'none';
        }
        DadosQuiz.limpar();
    }

    async carregarQuizzesAluno() {
        try {
            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');


            if (!idSala || !idUsuario) {
                console.error('Sala ou usuário não disponível');
                return;
            }

            const resposta = await window.api.listarQuiz(idUsuario, idSala);
            console.log('Resposta da API:', resposta);

            DadosQuiz.quizzes = resposta?.quiz || [];
            console.log('Quizzes carregados:', DadosQuiz.quizzes);

            this.atualizarUIListaQuizzesAluno();

        } catch (error) {
            console.error('Erro ao carregar quizzes:', error);
            showToast('Erro ao carregar quizzes', 'error');
        }
    }

    async apagarRespostaAluno(quizId) {
        const quiz = DadosQuiz.quizzes.find(q => q.id === quizId);
        const nomeQuiz = quiz?.titulo || 'este quiz';

        const confirmar = await mostrarModalGeral(
            `Tem certeza que deseja apagar sua resposta do quiz "${nomeQuiz}"? Você poderá responder novamente.`,
            'desfazer',
            'Apagar Resposta'
        );

        if (!confirmar) return;

        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');
            const resposta = await window.api.apagarRespostaQuiz(idUsuario, quizId);

            esconderCarregamento();

            if (resposta) {
                showToast('Resposta apagada com sucesso!', 'success');
                await this.carregarQuizzesAluno();
            } else {
                showToast('Erro ao apagar resposta', 'error');
            }

        } catch (error) {
            esconderCarregamento();
            showToast('Erro ao apagar resposta: ' + error.message, 'error');
            console.error('Erro ao apagar resposta:', error);
        }
    }

    limpar() {
        DadosQuiz.limpar();
    }

    async mostrarListaAlunosRespondendo(quizId) {
        const connectedStudentsSection = document.getElementById('connected-students-section');
        if (connectedStudentsSection) {
            connectedStudentsSection.scrollIntoView({ behavior: 'smooth' });
        }

        EstadoSala.quizId = quizId;

        mostrarCarregamento();

        try {
            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            const resposta = await window.api.listarAlunosQuiz(idUsuario, quizId, idSala);

            const listaAlunos = document.getElementById('connected-students-list');
            if (!listaAlunos) {
                esconderCarregamento();
                return;
            }

            const responderam = resposta.responderam || [];
            const naoResponderam = resposta.naoResponderam || [];
            const total = resposta.total || 0;
            const respondidos = resposta.respondidos || 0;

            const elementoContador = document.getElementById('response-counter');
            if (elementoContador) {
                elementoContador.innerHTML = `
                    <div class="contador-wrapper">
                        <div class="counter-item counter-pending" style="background: #fef3c7; color: #92400e;">
                            <i class="fas fa-clock"></i>
                            <span>${total - respondidos} Pendente</span>
                        </div>
                        <div class="counter-item counter-done" style="background: #d1fae5; color: #065f46;">
                            <i class="fas fa-check-circle"></i>
                            <span>${respondidos} Feito</span>
                        </div>
                    </div>
                `;
                elementoContador.style.display = 'flex';
            }

            const tituloSecao = document.querySelector('#connected-students-section .section-header h2');
            if (tituloSecao) {
                tituloSecao.innerHTML = `<i class="fas fa-clipboard-list"></i> Respostas Quiz`;
            }

            let html = '';
            responderam.forEach(aluno => {
                const horaResposta = aluno.respondidoEm ? new Date(aluno.respondidoEm).toLocaleTimeString('pt-BR') : 'Agora';
                html += `
                    <div class="connected-student-item">
                        <div class="student-info">
                            <div class="student-avatar">${aluno.nome.charAt(0).toUpperCase()}</div>
                            <div>
                                <div class="student-name">${aluno.nome}</div>
                                <div class="student-join-time">Respondeu em: ${horaResposta}</div>
                            </div>
                        </div>
                        <div class="activity-status-container">
                            <div class="status-badge status-completed">
                                <i class="fas fa-check-circle"></i> Feito
                            </div>
                        </div>
                    </div>
                `;
            });

            naoResponderam.forEach(aluno => {
                html += `
                    <div class="connected-student-item">
                        <div class="student-info">
                            <div class="student-avatar">${aluno.nome.charAt(0).toUpperCase()}</div>
                            <div>
                                <div class="student-name">${aluno.nome}</div>
                                <div class="student-join-time">Conectado em: ${aluno.criadoEm ? new Date(aluno.criadoEm).toLocaleTimeString('pt-BR') : 'Agora'}</div>
                            </div>
                        </div>
                        <div class="activity-status-container">
                            <div class="status-badge status-pending">
                                <i class="fas fa-clock"></i> Pendente
                            </div>
                        </div>
                    </div>
                `;
            });

            listaAlunos.innerHTML = html || '<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum aluno conectado</p></div>';

        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }

        esconderCarregamento();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sistemaQuiz = new GerenciarQuiz();
    window.GerenciarQuiz = window.sistemaQuiz;
});

export default GerenciarQuiz;
