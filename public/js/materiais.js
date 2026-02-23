class SistemaMateriais {
    constructor() {
        this.materiais = [];
        this.inicializar();
    }

    inicializar() {
        this.vincularEventos();
    }

    vincularEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="enviar-material"]')) {
                window.abrirSecaoFlex('enviar-material-modal')
            }
            if (e.target.matches('[data-action="salvar-material"]')) {
                this.salvarMaterial();
            }
            if (e.target.matches('[data-action="apagar-material"]')) {
                const materialId = e.target.dataset.materialId;
                this.apagarMaterial(materialId);
            }
            if (e.target.matches('[data-action="fechar-modal-material"]')) {
                console.log('fechar modal material');
                this.fecharModalMaterial();
            }
        });
    }

    async carregarMateriais() {
        try {
            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            if (!idSala || !idUsuario) {
                console.error('Sala ou usuário não disponível');
                return;
            }

            console.log('📥 Carregando materiais para:', { idUsuario, idSala });

            const resposta = await window.api.listarMateriais(idUsuario, idSala);

            console.log('📄 Resposta completa da API:', resposta);
            console.log('📄 Tipo de resposta:', typeof resposta);

            if (resposta && typeof resposta === 'object') {
                if (Array.isArray(resposta)) {
                    this.materiais = resposta;
                } else if (resposta.materiais && Array.isArray(resposta.materiais)) {
                    this.materiais = resposta.materiais;
                } else if (resposta.data && Array.isArray(resposta.data)) {
                    this.materiais = resposta.data;
                } else {
                    this.materiais = [];
                }
            } else {
                this.materiais = [];
            }

            console.log('✅ Materiais processados:', this.materiais);

            const tipoUsuario = localStorage.getItem('tipoUsuario') || '';

            if (tipoUsuario === 'professor' || EstadoSala.ehProfessor) {
                this.atualizarUIProfessor();
            } else if (tipoUsuario === 'aluno' || EstadoSala.ehAluno) {
                this.atualizarUIAluno();
            }

        } catch (error) {
            console.error('❌ Erro ao carregar materiais:', error);
            showToast('Erro ao carregar materiais', 'error');
        }
    }

    fecharModalMaterial() {
        const modal = document.getElementById('enviar-material-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    limparFormularioMaterial() {
        const form = document.getElementById('enviar-material-form');
        if (form) {
            form.reset();
        }
    }

    async salvarMaterial() {
        const titulo = document.getElementById('material-title')?.value.trim();
        const descricao = document.getElementById('material-description')?.value.trim();
        const arquivo = document.getElementById('material-file')?.files[0];

        if (!titulo) {
            showToast('Por favor, digite o título do material', 'error');
            return;
        } else if (!descricao) {
            showToast('Por favor, digite a descrição do material', 'error');
            return;
        } else if (!arquivo) {
            showToast('Por favor, selecione um arquivo', 'error');
            return;
        }

        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');
            const idSala = localStorage.getItem('idSala');

            const formData = new FormData();
            formData.append('arquivo', arquivo);
            formData.append('titulo', titulo);
            formData.append('descricao', descricao);
            formData.append('idUsuario', idUsuario);
            formData.append('idSala', idSala);

            const resposta = await window.api.enviarMaterial(formData);

            document.getElementById('enviar-material-form').reset();

            showToast('Material enviado com sucesso!', 'success');
            this.fecharModalMaterial();

            await this.carregarMateriais();

            esconderCarregamento();

        } catch (error) {
            esconderCarregamento();
            console.error('Erro ao salvar material:', error);
            showToast('Erro ao enviar material: ' + error.message, 'error');
        }
    }

    async apagarMaterial(idMaterial) {
        const material = this.materiais.find(m => m.id === idMaterial);
        const nomeMaterial = material?.titulo || 'este material';

        const confirmar = await mostrarModalGeral(
            `Tem certeza que deseja excluir o material "${nomeMaterial}"? Esta ação não pode ser desfeita.`,
            'desfazer',
            'Excluir Material'
        );

        if (!confirmar) {
            return;
        }

        try {
            mostrarCarregamento();

            const idUsuario = localStorage.getItem('idUsuario');

            const resposta = await window.api.apagarMaterial(idUsuario, idMaterial);

            showToast('Material excluído com sucesso!', 'success');

            this.materiais = this.materiais.filter(m => m.id !== idMaterial);
            this.atualizarUIProfessor();

            esconderCarregamento();

        } catch (error) {
            esconderCarregamento();
            console.error('Erro ao excluir material:', error);
            showToast('Erro ao excluir material: ' + error.message, 'error');
        }
    }

    atualizarUIAluno() {
        const container = document.getElementById('student-materials-list');

        if (!container) {
            console.error('Container student-materials-list não encontrado');
            return;
        }
        if (this.materiais.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p>Nenhum material disponível</p>
                    <small>Quando o professor enviar materiais, eles aparecerão aqui</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.materiais.map(material => {
            const dataFormatada = material.CriadoEm ?
                new Date(material.CriadoEm._seconds * 1000).toLocaleString('pt-BR') :
                'Data não disponível';

            return `
                <div class="material-item student-material">
                    <div class="material-header">
                        <div class="material-title-container">
                            <i class="fas fa-file-pdf"></i>
                            <h4>${material.Titulo}</h4>
                        </div>
                        <div class="material-date">
                            <i class="fas fa-calendar-alt"></i>
                            <small>${dataFormatada}</small>
                        </div>
                    </div>
                    <div class="material-body">
                        <p>${material.Descricao}</p>
                    </div>
                    <div class="material-actions">
                        <a href="${this.gerarDowloadLink(material.ArquivoUrl)}" target="_blank" class="btn btn-primary" download>
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    atualizarUIProfessor() {
        const container = document.getElementById('teacher-materials-list');

        if (!container) {
            console.error('Container teacher-materials-list não encontrado');
            return;
        }

        if (this.materiais.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p>Nenhum material enviado ainda</p>
                    <button class="btn btn-primary" data-action="enviar-material">
                        <i class="fas fa-plus"></i> Enviar Primeiro Material
                    </button>
                </div>
            `;
            container.style.alignItems = 'center';
            return;
        }

        container.innerHTML = this.materiais.map(material => {

            const dataFormatada = material.CriadoEm
                ? new Date(material.CriadoEm._seconds * 1000).toLocaleString('pt-BR')
                : 'Data não disponível';

            return `
                <div class="material-item teacher-material">
                    <div class="material-header">
                        <div class="material-title-container">
                            <i class="fas fa-file-pdf"></i>
                            <h4>${material.Titulo}</h4>
                        </div>
                        <span class="material-date-badge">${dataFormatada}</span>
                    </div>
                    <div class="material-body">
                        <p>${material.Descricao}</p>
                    </div>
                    <div class="material-actions">
                        <a href="${material.ArquivoUrl}" target="_blank" class="btn btn-secondary">
                            <i class="fas fa-eye"></i> Visualizar
                        </a>
                        <a href="${this.gerarDowloadLink(material.ArquivoUrl)}" target="_blank" class="btn btn-create">
                            <i class="fas fa-download"></i> Download
                        </a>
                        <button class="btn btn-error" data-action="apagar-material" data-material-id="${material.id}">
                            <i class="fas fa-trash"></i> Apagar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    gerarDowloadLink(urlArquivo) {
        const UrlDowload = urlArquivo.replace('upload/', 'upload/fl_attachment/');
        return UrlDowload;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando SistemaMateriais');
    window.sistemaMateriais = new SistemaMateriais();
    window.SistemaMateriais = window.sistemaMateriais;
});
