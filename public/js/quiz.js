//Quiz em geral

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

    removerPergunta(index) {
        if (this.perguntas.length <= 1) return false;
        this.perguntas.splice(index, 1);
        if (this.perguntaAtualIndex >= this.perguntas.length) {
            this.perguntaAtualIndex = this.perguntas.length - 1;
        }
        return true;
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
            const temMultiplasPerguntas = total > 1;
            html += `
                <div class="quiz-card-wrapper" data-index="${i}">
                    <button class="${classeAtiva}" data-index="${i}">${i + 1}</button>
                    ${temMultiplasPerguntas ? `<button class="quiz-btn-apagar-pergunta" data-index="${i}" title="Apagar pergunta"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            `;
        }

        container.innerHTML = html;
        //Somente redenrizar depois que ele cirar(achei melhor escrenvo), -depois tirar
        this.vincularEventosApagar();
    }

    vincularEventosApagar() {
        const container = document.getElementById('quiz-cards-perguntas');
        if (!container) return;

        //Tive que colocar para que ele simplesmente tirar o primeiro butão com o apagar, -depois tirar
        container.querySelectorAll('.quiz-btn-apagar-pergunta').forEach(btn => {
            btn.style.display = 'none';
        });

        // Mostrar/ocultar botão de apagar ao passar o mouse
        container.querySelectorAll('.quiz-card-wrapper').forEach((wrapper, index) => {
            wrapper.addEventListener('mouseenter', () => {
                const btnApagar = wrapper.querySelector('.quiz-btn-apagar-pergunta');
                if (btnApagar && DadosQuiz.perguntas.length > 1) {
                    btnApagar.style.display = 'flex';
                }
            });

            wrapper.addEventListener('mouseleave', () => {
                const btnApagar = wrapper.querySelector('.quiz-btn-apagar-pergunta');
                if (btnApagar) {
                    btnApagar.style.display = 'none';
                }
            });
        });

        // Evento de clique no botão de apagar
        container.querySelectorAll('.quiz-btn-apagar-pergunta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.removerPergunta(index);
            });
        });
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

    async removerPergunta(index) {
        if (DadosQuiz.perguntas.length <= 1) {
            showToast('O quiz deve ter pelo menos uma pergunta', 'warning');
            return;
        }

        //Pensando se deixa ou não a opção de apagar a pergunta, -depois tirar -duvida
        const confirmar = await mostrarModalGeral(
            `Você tem certeza que deseja excluir a pergunta ${index + 1}? Esta ação não pode ser desfeita.`,
            'confirmar',
            'Enviar Quiz'
        );
        if (!confirmar) return;

        DadosQuiz.removerPergunta(index);
        this.renderizarCardsPerguntas();
        this.renderizarFormularioPergunta();
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
                            <button class="btn-ver-respostas-aluno" data-aluno-id="${aluno.id}" data-aluno-nome="${aluno.nome}" data-quiz-id="${quizId}">
                                <i class="fas fa-eye"></i> Respostas
                            </button>
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

class VisualizadorRespostasQuiz {
    constructor() {
        this.respostasAlunoAtual = null;
        this.perguntaAtualIndex = 0;
        this.quizAtual = null;
        this.alunoAtual = null;
        this.modal = null;
        this.inicializar();
    }

    inicializar() {
        this.criarModal();
        this.vincularEventos();
    }

    criarModal() {

        // Verifica se o modal já existe
        if (document.getElementById('visualizador-respostas-modal')) {
            this.modal = document.getElementById('visualizador-respostas-modal');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'visualizador-respostas-modal';
        modal.className = 'modal quiz-modal activity-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="quiz-modal-content activity-modal-content">
                <div class="quiz-resposta-header">
                    <div>
                        <h2 id="titulo-respostas-aluno"></h2>
                        <p id="info-aluno-respostas" style="color: var(--gray-600); margin-top: 0.5rem;"></p>
                    </div>
                    <div class="quiz-resposta-acoes">
                        <button class="btn btn-secondary" id="btn-fechar-respostas-aluno">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                    </div>
                </div>

                <!-- Barra de cards de perguntas -->
                <div class="quiz-barra-perguntas">
                    <div id="quiz-cards-perguntas-respostas" style="display: flex; gap: 0.5rem; flex-wrap: nowrap;">
                        <!-- Cards numerados serão gerados aqui -->
                    </div>
                </div>

                <!-- Estatísticas -->
                <div id="quiz-estatisticas-respostas" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--gray-50); border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
                    <!-- Estatísticas serão inseridas aqui -->
                </div>

                <!-- Área de visualização da pergunta -->
                <div class="quiz-area-resposta-aluno">
                    <div id="quiz-formulario-respostas-aluno">
                        <!-- Pergunta e respostas serão renderizadas aqui -->
                    </div>
                </div>

                <!-- Botões de navegação -->
                <div class="quiz-botoes-navegacao-aluno">
                    <button class="btn btn-secondary" id="btn-pergunta-anterior-respostas">
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <button class="btn btn-secondary" id="btn-proxima-pergunta-respostas">
                        Próxima <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
    }

    vincularEventos() {

        document.addEventListener('click', (e) => {
            const btnVerRespostas = e.target.closest('.btn-ver-respostas-aluno');

            if (btnVerRespostas) {
                const alunoId = btnVerRespostas.dataset.alunoId;
                const alunoNome = btnVerRespostas.dataset.alunoNome;
                const quizId = btnVerRespostas.dataset.quizId;

                this.abrirVisualizadorRespostas(quizId, alunoId, alunoNome);
            }

            const btnFecharRespostas = e.target.closest('#btn-fechar-respostas-aluno');
            if (btnFecharRespostas) {
                this.fecharVisualizadorRespostas();
            }

            const btnProximaPerguntaRespostas = e.target.closest('#btn-proxima-pergunta-respostas');
            if (btnProximaPerguntaRespostas) {
                this.proximaPerguntaRespostas();
            }

            const btnPerguntaAnteriorRespostas = e.target.closest('#btn-pergunta-anterior-respostas');
            if (btnPerguntaAnteriorRespostas) {
                this.perguntaAnteriorRespostas();
            }

            const cardPerguntaRespostas = e.target.closest('.quiz-card-pergunta-respostas');
            if (cardPerguntaRespostas) {
                const index = parseInt(cardPerguntaRespostas.dataset.index);
                this.navegarParaPerguntaRespostas(index);
            }
        });

    }

    async abrirVisualizadorRespostas(quizId, alunoId, alunoNome) {

        try {
            if (typeof mostrarCarregamento === 'function') {
                mostrarCarregamento();
            } else {
                console.warn('🔷 [QUIZ-RESPOSTAS] função mostrarCarregamento não encontrada');
            }

            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            const respostaQuiz = await window.api.buscarQuiz(idUsuario, quizId);

            if (!respostaQuiz || !respostaQuiz.quiz) {
                if (typeof showToast === 'function') {
                    showToast('Erro ao carregar quiz', 'error');
                }
                if (typeof esconderCarregamento === 'function') {
                    esconderCarregamento();
                }
                return;
            }

            const respostaAluno = await window.api.listarRespostaQuiz(idUsuario, quizId, idSala);

            if (!respostaAluno || !respostaAluno.respostas) {
                if (typeof showToast === 'function') {
                    showToast('Erro ao carregar respostas', 'error');
                }
                if (typeof esconderCarregamento === 'function') {
                    esconderCarregamento();
                }
                return;
            }

            // Encontrar as respostas do aluno específico
            const respostasDoAluno = respostaAluno.respostas.find(r => r.usuarioId === alunoId);
            if (!respostasDoAluno) {
                if (typeof showToast === 'function') {
                    showToast('Respostas do aluno não encontradas', 'error');
                }
                if (typeof esconderCarregamento === 'function') {
                    esconderCarregamento();
                }
                return;
            }

            this.quizAtual = respostaQuiz.quiz;
            this.respostasAlunoAtual = respostasDoAluno;
            this.alunoAtual = { id: alunoId, nome: alunoNome };
            this.perguntaAtualIndex = 0;

            this.renderizarVisualizadorRespostas();

            if (typeof esconderCarregamento === 'function') {
                esconderCarregamento();
            }

        } catch (error) {
            console.error('🔷 [QUIZ-RESPOSTAS] ERRO:', error);
            if (typeof esconderCarregamento === 'function') {
                esconderCarregamento();
            }
            if (typeof showToast === 'function') {
                showToast('Erro ao abrir respostas: ' + error.message, 'error');
            }
        }
    }

    renderizarVisualizadorRespostas() {

        if (!this.modal) {
            this.criarModal();
        }

        this.modal.style.display = 'flex';
        this.modal.classList.add('active');

        this.renderizarHeaderRespostas();
        this.renderizarCardsPerguntas();
        this.renderizarPerguntaRespostas();

    }

    renderizarHeaderRespostas() {
        const titulo = document.getElementById('titulo-respostas-aluno');
        const info = document.getElementById('info-aluno-respostas');

        if (titulo) {
            titulo.textContent = `${this.quizAtual.titulo}`;
        }

        if (info) {
            info.innerHTML = `<i class="fas fa-user"></i> Respostas de: <strong>${this.alunoAtual.nome}</strong>`;
        }
    }

    renderizarCardsPerguntas() {
        const container = document.getElementById('quiz-cards-perguntas-respostas');
        if (!container) {
            return;
        }

        const total = this.quizAtual.perguntas.length;
        const ativo = this.perguntaAtualIndex;

        let html = '';
        for (let i = 0; i < total; i++) {
            const resposta = this.respostasAlunoAtual.respostas[i];
            const acertou = resposta && resposta.correta;
            const respondeu = resposta !== undefined && resposta.respostaSelecionada !== -1;

            let classe = 'quiz-card-pergunta-respostas';
            if (i === ativo) classe += ' ativo';
            if (acertou) classe += ' acertou';
            if (respondeu && !acertou) classe += ' errou';
            if (!respondeu) classe += ' nao-respondeu';

            html += `<button class="${classe}" data-index="${i}" title="${acertou ? 'Acertou' : respondeu ? 'Errou' : 'Não respondeu'}">${i + 1}</button>`;
        }

        container.innerHTML = html;
    }

    renderizarPerguntaRespostas() {
        const container = document.getElementById('quiz-formulario-respostas-aluno');
        if (!container) {
            return;
        }

        const pergunta = this.quizAtual.perguntas[this.perguntaAtualIndex];
        const resposta = this.respostasAlunoAtual.respostas[this.perguntaAtualIndex];
        const index = this.perguntaAtualIndex;
        const total = this.quizAtual.perguntas.length;

        if (!pergunta) {
            console.error('🔷 Pergunta não encontrada para índice:', this.perguntaAtualIndex);
            return;
        }


        const respostaSelecionada = resposta ? resposta.respostaSelecionada : -1;
        const acertou = resposta ? resposta.correta : false;

        // Renderizar estatísticas
        this.renderizarEstatisticas();

        let opcoesHtml = '';
        pergunta.opcoes.forEach((opcao, i) => {
            const ehRespostaCorreta = i === pergunta.respostaCorreta;
            const ehRespostaSelecionada = i === respostaSelecionada;
            let classeOpcao = 'quiz-opcao-item-aluno-respostas';

            if (ehRespostaSelecionada && acertou) {
                classeOpcao += ' resposta-correta';
            } else if (ehRespostaSelecionada && !acertou && respostaSelecionada !== -1) {
                classeOpcao += ' resposta-incorreta';
            } else if (ehRespostaCorreta && !acertou && respostaSelecionada !== -1) {
                classeOpcao += ' resposta-correta-nao-selecionada';
            }

            let indicador = '';
            if (ehRespostaSelecionada && acertou) {
                indicador = '<i class="fas fa-check-circle" style="color: #10b981;"></i>';
            } else if (ehRespostaSelecionada && !acertou && respostaSelecionada !== -1) {
                indicador = '<i class="fas fa-times-circle" style="color: #ef4444;"></i>';
            } else if (ehRespostaCorreta && !acertou && respostaSelecionada !== -1) {
                indicador = '<i class="fas fa-check-circle" style="color: #10b981;"></i>';
            } else {
                indicador = `<span class="opcao-numero">${String.fromCharCode(65 + i)}</span>`;
            }

            opcoesHtml += `
                <div class="${classeOpcao}">
                    <div class="quiz-opcao-indicador">
                        ${indicador}
                    </div>
                    <label class="quiz-opcao-label-respostas">${opcao}</label>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="quiz-pergunta-numero">
                <span>Pergunta ${index + 1} de ${total}</span>
            </div>
            <div class="quiz-pergunta-texto-aluno">
                <h3>${pergunta.texto}</h3>
            </div>
            <div class="quiz-opcoes-lista-aluno">
                ${opcoesHtml}
            </div>
            ${respostaSelecionada === -1 ? `
                <div class="quiz-alerta-nao-respondida">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Esta pergunta não foi respondida pelo aluno</span>
                </div>
            ` : ''}
        `;
    }

    renderizarEstatisticas() {
        const container = document.getElementById('quiz-estatisticas-respostas');
        if (!container) {
            return;
        }

        const respostas = this.respostasAlunoAtual.respostas;
        const total = this.quizAtual.perguntas.length;
        const acertos = respostas.filter(r => r && r.correta).length;
        const erros = respostas.filter(r => r && !r.correta && r.respostaSelecionada !== -1).length;
        const naoRespondidas = respostas.filter(r => !r || r.respostaSelecionada === -1).length;
        const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: var(--radius); border: 1px solid var(--gray-200);">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #10b981;">${acertos}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Acertos</div>
                </div>
                <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: var(--radius); border: 1px solid var(--gray-200);">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">${erros}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Erros</div>
                </div>
                <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: var(--radius); border: 1px solid var(--gray-200);">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #f59e0b;">${naoRespondidas}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Não respondidas</div>
                </div>
                <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: var(--radius); border: 1px solid var(--gray-200);">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-blue);">${percentual}%</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Aproveitamento</div>
                </div>
            </div>
        `;

    }

    proximaPerguntaRespostas() {
        if (this.perguntaAtualIndex < this.quizAtual.perguntas.length - 1) {
            this.perguntaAtualIndex++;
            this.renderizarCardsPerguntas();
            this.renderizarPerguntaRespostas();
        }
    }

    perguntaAnteriorRespostas() {
        if (this.perguntaAtualIndex > 0) {
            this.perguntaAtualIndex--;
            this.renderizarCardsPerguntas();
            this.renderizarPerguntaRespostas();
        }
    }

    navegarParaPerguntaRespostas(index) {
        if (index >= 0 && index < this.quizAtual.perguntas.length) {
            this.perguntaAtualIndex = index;
            this.renderizarCardsPerguntas();
            this.renderizarPerguntaRespostas();
        }
    }

    fecharVisualizadorRespostas() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modal.classList.remove('active');
        }
        this.respostasAlunoAtual = null;
        this.perguntaAtualIndex = 0;
        this.quizAtual = null;
        this.alunoAtual = null;
    }
}

// Instância global
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.visualizadorRespostasQuiz) {
            window.visualizadorRespostasQuiz = new VisualizadorRespostasQuiz();
        }
    });
} else {
    if (!window.visualizadorRespostasQuiz) {
        window.visualizadorRespostasQuiz = new VisualizadorRespostasQuiz();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sistemaQuiz = new GerenciarQuiz();
    window.GerenciarQuiz = window.sistemaQuiz;
});

export { GerenciarQuiz, VisualizadorRespostasQuiz };