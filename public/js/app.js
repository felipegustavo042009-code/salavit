//Inicialização
document.addEventListener('DOMContentLoaded', function () {
    inicializarApp();

    if (!window.location.hash.startsWith('#join/')) {
        navegarPara('home');
    }
});



//Funções basicas
async function inicializarApp() {

    iniciarUsuario();

    configurarEventListeners();

    mostrarCarregamento();
    setTimeout(esconderCarregamento, 3000);
}

async function iniciarUsuario() {
    try {
        const resultado = await window.api.criarUsuario();

        if (resultado && resultado.usuarioId) {
            localStorage.setItem('idUsuario', resultado.usuarioId);
        }

    } catch (error) {
        console.warn('Não foi possível criar usuário automaticamente:', error);
    }
}

function configurarEventListeners() {
    // Fechar modais ao clicar fora
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            fecharTodosModais();
        }
    });

    // Lidar com tecla Escape e Enter
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            fecharTodosModais();
            fecharTodasSecoes();
        }

        if (e.key === 'Enter') {
            const inputNome = document.getElementById('student-name-input');
            const secaoInputCodigo = document.getElementById('code-input-section');
            if (inputNome) {
                confirmarNomeAluno();
            } else if (secaoInputCodigo && secaoInputCodigo.style.display !== 'none') {
                entrarSalaPorCodigo();
            }
        }
    });

    // Lidar com envios de formulário
    document.addEventListener('submit', function (e) {
        e.preventDefault();
    });
}



//Modais que aparecem, somen na tela e troca de pagina
//Quando é para os block
function abrirSecaoNormal(id_div, funcaoInicializacao) {
    if (id_div) {
        fecharTodasSecoes();
        const secao = document.getElementById(id_div);
        if (secao) {
            secao.style.display = 'block'; // ✅ Corrigido: string 'block'
            secao.scrollIntoView({ behavior: 'smooth' });

            console.log(funcaoInicializacao, 'tipo:', typeof funcaoInicializacao);
            // Se foi passada uma função de inicialização, executa
            if (funcaoInicializacao && typeof funcaoInicializacao === 'function') {
                funcaoInicializacao();
            }
        } else {
            showToast('Seção não encontrada');
        }
    } else {
        showToast('ID da seção não informado');
    }
}

//Aqueles que aparecem no meio da tela sendo fex
function abrirSecaoFlex(id_div, tipoFormulairo) {
    if (id_div) {
        const modal = document.getElementById(id_div);
        const titleInput = null
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');

            switch (tipoFormulairo) {
                case 'enviar-material-modal':
                    window.SistemaMateriais.limparFormularioMaterial();
                    titleInput = document.getElementById('material-title');
                    break;
                case 'create-activity-modal':
                    window.sistemaAtividades.limparFormularioAtividade();
                    titleInput = document.getElementById('activity-title');
                    break;
                default:
                    console.log('Tipo de formulário não reconhecido');
                    break;
            }

            setTimeout(() => {
                if (titleInput) titleInput.focus();
            }, 100);
        }
    }
    else {
        showToast('Erro na recepcao da div para se mostrar')
    }
}

//Trocas entre show(exibir) e não exibir(sem show)
function exibirMenu() {
    const menu = document.getElementsByClassName('nav')[0];

    if (menu.classList.contains("show")) {
        menu.classList.toggle('show');
    } else {
        menu.classList.toggle('show');
    }
}

//Navega para a pagina e incia
function navegarPara(pagina) {

    if (pagina === 'teacher-panel' && (!window.GerenciadorSala || typeof window.GerenciadorSala !== 'object')) {
        console.error('GerenciadorSala não está disponível');
        showToast('Sistema não inicializado corretamente', 'error');
        return;
    }

    const botaoSair = document.getElementById("sair");
    const spanTexto = botaoSair.querySelector("span");
    const nav = document.querySelector(".nav");

    if (pagina == "home" && nav.classList.contains("show")) {
        exibirMenu();
    }

    //Verificar se é home se for vai para none, se não vai entre professorn e aluno
    if (pagina != "home") {
        if (pagina == "teacher-panel") {
            window.GerenciadorSala.listarAlunosConectados();
            botaoSair.onclick = encerrarSala;
            spanTexto.textContent = "Desativar";
            botaoSair.style.display = "flex";
        } else {
            botaoSair.onclick = sairSala;
            spanTexto.textContent = "Sair";
            botaoSair.style.display = "none";
        }
    } else {
        botaoSair.style.display = "none";
    }

    history.pushState({ pagina }, '', `#${pagina}`);

    carregarConteudoPagina(pagina);
    atualizarEstadoNavegacao(pagina);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.abrirSecaoNormal = abrirSecaoNormal;
window.abrirSecaoFlex = abrirSecaoFlex;


//Inicialização
async function carregarConteudoPagina(pagina) {
    const conteudoPrincipal = document.getElementById('main-content');

    try {
        mostrarCarregamento();

        await new Promise(resolve => setTimeout(resolve, 300));

        const resposta = await fetch(`pages/${pagina}.html`);

        if (!resposta.ok) {
            throw new Error(`Página não encontrada: ${pagina}`);
        }

        const conteudo = await resposta.text();
        conteudoPrincipal.innerHTML = conteudo;

        inicializarFuncionalidadePagina(pagina);

        esconderCarregamento();

    } catch (error) {
        console.error('Erro ao carregar página:', error);
        conteudoPrincipal.innerHTML = `
            <div class="error-page">
                <div class="container">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h1>Página não encontrada</h1>
                        <p>A página que você está procurando não existe.</p>
                        <button class="btn btn-primary" onclick="navegarPara('home')">
                            <i class="fas fa-home"></i> Voltar ao Início
                        </button>
                    </div>
                </div>
            </div>
        `;
        esconderCarregamento();
    }
}

function inicializarPainelProfessor() {

    if (!EstadoSala.ehProfessor && !EstadoSala.salaAtual) {
        GerenciadorSala.criarSala()
            .then(() => {
                setTimeout(() => {
                    GerenciadorSala.atualizarListaAlunos();
                }, 1000);
            });
        GerenciadorSala.atualizarUIProfessor();
    } else if (EstadoSala.ehProfessor) {
        GerenciadorSala.atualizarListaAlunos();
        GerenciadorSala.atualizarUIProfessor();
    }

    if (window.api && api.socket) {
        api.onNovoAluno((data) => {
            if (data.salaId === EstadoSala.salaAtual?.salaId) {
                GerenciadorSala.atualizarListaAlunos();
            }
        });
    }
    GerenciadorSala.atualizarUIProfessor();

    const btnEnviarMaterial = document.getElementById('enviar-material-btn');
    if (btnEnviarMaterial) {
        btnEnviarMaterial.style.display = 'flex';
    }

}

function inicializarFuncionalidadePagina(pagina) {
    switch (pagina) {
        case 'teacher-panel':
            inicializarPainelProfessor();
            break;
        case 'student-room':
            inicializarSalaAluno();
            break;
    }
}

function inicializarSalaAluno() {
    const inicializarAtividadesAluno = setInterval(() => {
        if (window.sistemaAtividades && EstadoSala.codigoSala) {
            clearInterval(inicializarAtividadesAluno);

        }
    }, 500);

    if (window.GerenciadorMaoLevantada) {
        GerenciadorMaoLevantada.inicializar();
    }
}

function atualizarEstadoNavegacao(pagina) {
    // Atualizar itens de navegação ativos se necessário
    const botoesNav = document.querySelectorAll('.nav-btn');
    botoesNav.forEach(btn => {
        btn.classList.remove('active');
    });
}



//Sistema respostas



// Funções de Acesso do Aluno
function mostrarAcessoAluno() {
    // Esconder seção hero e mostrar acesso do aluno
    const secaoHero = document.querySelector('.hero-section');
    const secaoRecursos = document.querySelector('.features-section');
    const secaoAcessoAluno = document.getElementById('student-access-section');

    if (secaoHero) secaoHero.style.display = 'none';
    if (secaoRecursos) secaoRecursos.style.display = 'none';
    if (secaoAcessoAluno) secaoAcessoAluno.style.display = 'flex';

    mostrarInputCodigo(); // Ir direto para o input código
}

function esconderAcessoAluno() {
    // Mostrar seção hero e esconder acesso do aluno
    const secaoHero = document.querySelector('.hero-section');
    const secaoRecursos = document.querySelector('.features-section');
    const secaoAcessoAluno = document.getElementById('student-access-section');
    const secaoInputCodigo = document.getElementById('code-input-section');

    if (secaoHero) secaoHero.style.display = 'block';
    if (secaoRecursos) secaoRecursos.style.display = 'block';
    if (secaoAcessoAluno) secaoAcessoAluno.style.display = 'none';
    if (secaoInputCodigo) secaoInputCodigo.style.display = 'none';
}

function mostrarInputCodigo() {
    const secaoAcessoAluno = document.getElementById('student-access-section');
    const secaoInputCodigo = document.getElementById('code-input-section');

    if (secaoAcessoAluno) secaoAcessoAluno.style.display = 'none';
    if (secaoInputCodigo) secaoInputCodigo.style.display = 'flex';

    // Focar no input
    setTimeout(() => {
        const inputCodigo = document.getElementById('room-code-input');
        if (inputCodigo) inputCodigo.focus();
    }, 100);
}

function entrarSalaPorCodigo(codigoSala = null) {
    if (!codigoSala) {
        const inputCodigo = document.getElementById('room-code-input');
        codigoSala = inputCodigo ? inputCodigo.value.trim() : '';
    }

    if (!codigoSala || codigoSala.length !== 6) {
        showToast('Por favor, digite um código de 6 dígitos', 'error');
        return;
    }

    codigoSala = codigoSala.toUpperCase();
    mostrarCarregamento();

    GerenciadorSala.entrarSala(codigoSala)
        .then(sala => {
            esconderCarregamento();
            showToast(`Entrando na sala ${codigoSala}...`, 'success');

            // Limpar input
            const inputCodigo = document.getElementById('room-code-input');
            if (inputCodigo) inputCodigo.value = '';

            // Navegar para sala do aluno
            navegarPara('student-room');
        })
        .catch(error => {
            esconderCarregamento();
            showToast(error, 'error');
        });
}

function confirmarNomeAluno() {
    const inputNome = document.getElementById('student-name-input');
    const nome = inputNome ? inputNome.value.trim() : '';

    var regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}\s[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/;
    if (!regex.test(nome)) {
        showToast("O nome deve contém apenas letras, espaços e duas palavras de 3 caracteres.", 'error');
    }
    else {
        showToast("Nome válido.");
        if (GerenciadorAluno.confirmarNome(nome)) {
            // Limpar input
            if (inputNome) {
                inputNome.value = ''

                const botaoSair = document.getElementById("sair");
                botaoSair.style.display = "flex";

                // tempo de garantia de carregamento do Mão Levantada e as outras coisas
                mostrarCarregamento();
                setTimeout(() => {
                    esconderCarregamento();
                    fecharTodasSecoes();
                }, 2200);
            };
        };
    }
};

window.confirmarNomeAluno = confirmarNomeAluno;
window.mostrarAcessoAluno = mostrarAcessoAluno;
window.esconderAcessoAluno = esconderAcessoAluno;
window.mostrarInputCodigo = mostrarInputCodigo;
window.entrarSalaPorCodigo = entrarSalaPorCodigo;



// Funções de modal de fechar e abrir
function fecharTodosModais() {
    const modais = document.querySelectorAll('.modal');
    modais.forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
}

function fecharTodasSecoes() {
    const secoes = document.querySelectorAll('.content-section');
    secoes.forEach(secao => {
        secao.style.display = 'none';
    });

    if (EstadoSala) {
        EstadoSala.atividadeAtivaId = null;
        EstadoSala.respostasAtividade = {};
        GerenciadorSala.listarAlunosConectados();
    }
}

function mostrarModalGeral(mensagem, tipo, acao) {
    return new Promise((resolve) => {

        let tipoMensagem, tipoButton, tipoIcone;
        if (tipo === 'fazer') {
            tipoMensagem = '<i class="fas fa-paper-plane" style="font-size: 3rem; color: #0066cc;"></i>';
            tipoButton = 'btn-primary';
            tipoIcone = 'fa-check'
        } else {
            tipoMensagem = '<i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b;"></i>';
            tipoButton = 'btn-danger';
            tipoIcone = 'fa-trash';
        }

        const modal = document.createElement('div');
        modal.className = 'modal cancel-confirm-modal';
        modal.style.display = 'flex';
        modal.style.pointerEvents = 'all';
        modal.innerHTML = `
    <div class="confirm-modal-content cancel-modal container-simples">
        <div class="confirm-header cancel-header">
            ${tipoMensagem}
            <h2>${acao}</h2>
        </div>
        <div class="confirm-body cancel-body">
            <p>${mensagem}</p>
        </div>
        <div class="confirm-footer cancel-footer">
            <button class="btn btn-secondary cancelar">
            <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="btn ${tipoButton} confirmar">
            <i class="fas ${tipoIcone}"></i> Confirmar
            </button>
        </div>
    </div>
    `;

        document.body.appendChild(modal);

        modal.querySelector('.cancelar').onclick = () => {
            modal.remove();
            resolve(false);
        };

        modal.querySelector('.confirmar').onclick = () => {
            modal.remove();
            resolve(true);
        };
    });
}

window.fecharTodasSecoes = fecharTodasSecoes;
window.mostrarModalGeral = mostrarModalGeral;


// Funções de carregamento
function mostrarCarregamento() {
    const overlayCarregamento = document.getElementById('loading-overlay');
    if (overlayCarregamento) {
        overlayCarregamento.style.display = 'flex';
    }
}

function esconderCarregamento() {
    const overlayCarregamento = document.getElementById('loading-overlay');
    if (overlayCarregamento) {
        overlayCarregamento.style.display = 'none';
    }
}

// Sistema de notificações toast
function showToast(mensagem, tipo = 'success') {
    const containerToast = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    const icone = getIconeToast(tipo);
    toast.innerHTML = `
        <i class="${icone}"></i>
        <span>${mensagem}</span>
    `;

    containerToast.appendChild(toast);

    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getIconeToast(tipo) {
    switch (tipo) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-check-circle';
    }
}


//Sistema de QR Code
function gerarQRCode() {
    if (!EstadoSala.codigoSala) {
        showToast('Nenhuma sala ativa', 'error');
        return;
    }

    fecharTodasSecoes();
    const secao = document.getElementById('qr-code-section');
    if (secao) {
        secao.style.display = 'block';
        secao.scrollIntoView({ behavior: 'smooth' });

        if (!EstadoSala.qrCodeGerado) {
            mostrarCarregamento();

            window.GerenciadorSala.gerarQRCode()
                .then(() => {
                    esconderCarregamento();
                    showToast('QR Code gerado com sucesso!', 'success');
                })
                .catch(error => {
                    esconderCarregamento();
                    showToast(`Erro ao gerar QR Code: ${error}`, 'error');
                });
        }
    }
}

function baixarQRCode() {
    GerenciadorSala.baixarQRCode();
}
window.gerarQRCode = gerarQRCode;
window.baixarQRCode = baixarQRCode;


//Sair ou fechar Sala
function sairAtividade() {
    const modal = document.getElementById('create-activity-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('active');
        // Focar no título
        setTimeout(() => {
            const inputTitulo = document.getElementById('activity-title');
            if (inputTitulo) inputTitulo.focus();
        }, 100);
    }
}

async function expulsarAluno(alunoId, nomeAluno) {
    if (confirm(`Expulsar ${nomeAluno} da sala? O aluno será desconectado imediatamente.`)) {
        try {

            const idUsuario = localStorage.getItem('idUsuario')
            mostrarCarregamento();

            await GerenciadorSala.expulsarAluno(idUsuario, alunoId);

        } catch (error) {
            console.error('Erro ao expulsar aluno:', error);
        }
    }
}

function encerrarSala() {
    if (confirm('Tem certeza que deseja encerrar a sala? Todos os alunos serão desconectados.')) {
        GerenciadorSala.encerrarSala();
    }
}

function sairSala() {
    if (confirm('Tem certeza que deseja sair da sala?')) {
        GerenciadorSala.sairSala();
    }
}
window.encerrarSala = encerrarSala;
window.sairSala = sairSala;
window.sairAtividade = sairAtividade;
window.expulsarAluno = expulsarAluno;


//Sistema de Mão Levantada
function levantarMao() {
    const statusMao = document.querySelector(".feature-item h3");
    const iconeEmoji = document.querySelector(".feature-icon p");
    const divCriacao = document.createElement("div");
    divCriacao.classList.add("status-circle");
    const nomeAluno = GerenciadorAluno.obterNome();

    if (!nomeAluno) {
        showToast('Por favor, digite seu nome primeiro', 'error');
        return;
    }

    const icone = document.querySelector("#iconeMao i");

    if (icone.classList.contains("fa-hand-point-up")) {
        icone.classList.remove("fa-hand-point-up");
        icone.classList.add("fa-hand-fist");

        iconeEmoji.textContent = "✊";

        statusMao.innerHTML = "Mão Abaixada ";
        divCriacao.style.backgroundColor = "red";
        statusMao.appendChild(divCriacao);
    } else {
        icone.classList.remove("fa-hand-fist");
        icone.classList.add("fa-hand-point-up");

        iconeEmoji.textContent = "🙋‍♂️";

        //Texto
        divCriacao.style.backgroundColor = "blue";
        statusMao.innerHTML = "Mão Levantada ";
        statusMao.appendChild(divCriacao);
    }
    GerenciadorMaoLevantada.levantarMao(nomeAluno);
}

function reconhecerMao(alunoId) {
    GerenciadorMaoLevantada.reconhecerMao(alunoId);
}
window.levantarMao = levantarMao;
window.reconhecerMao = reconhecerMao;




window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#join/')) return;

    const codigoSala = hash.replace('#join/', '').trim();

    localStorage.setItem('qrCodeEntry', codigoSala);

    if (!hash.includes('home')) {
        window.location.hash = '#home';

        const processar = setInterval(() => {
            const homePage = document.querySelector('.home-page');
            if (homePage) {
                clearInterval(processar);

                setTimeout(() => {
                    const codigo = localStorage.getItem('qrCodeEntry');
                    if (!codigo) return;

                    entrarSalaPorCodigo(codigo);
                }, 200);
            }
        }, 100);
    }
});

window.addEventListener('popstate', function (e) {
    if (e.state && e.state.pagina) {
        carregarConteudoPagina(e.state.pagina);
    } else {
        navegarPara('home');
    }
});


