//Sistema de Atividades
function abrirAtividadesProfessor() {
    fecharTodasSecoes();
    const secao = document.getElementById('teacher-activities-section');
    if (secao) {
        secao.style.display = 'block';
        secao.scrollIntoView({ behavior: 'smooth' });

        window.sistemaAtividades.carregarAtividades();
    }
}

function abrirAtividadesAluno() {
    fecharTodasSecoes();
    const secao = document.getElementById('student-activities-section');
    if (secao) {
        secao.style.display = 'block';
        secao.scrollIntoView({ behavior: 'smooth' });

        if (window.sistemaAtividades) {
            window.sistemaAtividades.atualizarUIAluno();
        }
    }
};


//Sistema Mao
function abrirMaosLevantadas() {
    fecharTodasSecoes();
    const secao = document.getElementById('raised-hands-section');
    if (secao) {
        secao.style.display = 'block';
        secao.scrollIntoView({ behavior: 'smooth' });
    }
    GerenciadorMaoLevantada.carregarMaosLevantadas();
}


function abrirMateriais() {
    fecharTodasSecoes();
    const secao = document.getElementById('materials-section');
    if (secao) {
        secao.style.display = 'block';
        secao.scrollIntoView({ behavior: 'smooth' });

        if (window.sistemaMateriais) {
            window.sistemaMateriais.carregarMateriais();
        }
    }
}
