class GerenciarNotificacao {

    criarSomAlternativo() {
        try {
            // Cria um som simples como fallback
            const contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
            const oscilador = contextoAudio.createOscillator();
            const noGanho = contextoAudio.createGain();

            oscilador.connect(noGanho);
            noGanho.connect(contextoAudio.destination);

            oscilador.frequency.setValueAtTime(800, contextoAudio.currentTime);
            oscilador.frequency.setValueAtTime(600, contextoAudio.currentTime + 0.1);
            noGanho.gain.setValueAtTime(0.3, contextoAudio.currentTime);
            noGanho.gain.exponentialRampToValueAtTime(0.01, contextoAudio.currentTime + 0.5);

            oscilador.start(contextoAudio.currentTime);
            oscilador.stop(contextoAudio.currentTime + 0.5);
        } catch (error) {
            console.log('Áudio não suportado');
        }
    }

    inicializarSomNotificacao() {
        try {
            // Cria o som usando Howler.js
            this.somNotificacao = new Howl({
                src: ['sons/notificacao.mp3'],
                volume: 1.0,
                preload: true,
                onloaderror: function () {
                    GerenciadorMaoLevantada.criarSomAlternativo();
                }
            });
        } catch (error) {
            console.warn('Erro ao inicializar Howler:', error);
            this.criarSomAlternativo();
        }
    }

    tocarSomNotificacao() {
        if (GerenciarNotificacao.somNotificacao) {
            try {
                GerenciarNotificacao.somNotificacao.play();
            } catch (error) {
                console.warn('Erro ao tocar som com Howler:', error);
                GerenciarNotificacao.criarSomAlternativo();
            }
        } else {
            GerenciarNotificacao.criarSomAlternativo();
        }
    }
}

window.GerenciarNotificacao = new GerenciarNotificacao;