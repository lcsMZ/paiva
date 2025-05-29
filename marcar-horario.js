(function() {
    const STORAGE_KEY = 'agendamentosBarbearia';

    function getAgendamentos() {
        const dados = localStorage.getItem(STORAGE_KEY);
        return dados ? JSON.parse(dados) : [];
    }

    function salvarAgendamentos(agendamentos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
    }

    function validarDisponibilidade(agendamentos, data, hora, barbeiro) {
        return !agendamentos.some(a => a.data === data && a.hora === hora && a.barbeiro === barbeiro);
    }

    function criarElementoAgendamento(agendamento, index) {
        const div = document.createElement('div');
        div.className = 'agendamento-item';

        const info = document.createElement('div');
        info.className = 'agendamento-info';
        info.textContent = `${agendamento.data} ${agendamento.hora} - ${agendamento.nome} (${agendamento.servico}, ${agendamento.barbeiro})`;

        const btnDesmarcar = document.createElement('button');
        btnDesmarcar.className = 'btn-desmarcar';
        btnDesmarcar.textContent = 'Desmarcar';
        btnDesmarcar.setAttribute('aria-label', `Desmarcar horário de ${agendamento.nome} em ${agendamento.data} às ${agendamento.hora}`);
        btnDesmarcar.onclick = function() {
            desmarcarAgendamento(index);
        };

        div.appendChild(info);
        div.appendChild(btnDesmarcar);
        return div;
    }

    function exibirAgendamentos() {
        const container = document.getElementById('lista-agendamentos');
        const nenhum = document.getElementById('nenhum-agendamento');
        const agendamentos = getAgendamentos();
        container.innerHTML = '';
        if (agendamentos.length === 0) {
            nenhum.style.display = 'block';
            return;
        }
        nenhum.style.display = 'none';
        agendamentos.forEach((a, idx) => {
            const el = criarElementoAgendamento(a, idx);
            container.appendChild(el);
        });
    }

    function mostrarMensagem(msg, tipo) {
        const msgEl = document.getElementById('form-msg');
        msgEl.textContent = msg;
        msgEl.className = 'msg ' + (tipo === 'error' ? 'error' : 'success');
        setTimeout(() => {
            msgEl.textContent = '';
            msgEl.className = '';
        }, 4000);
    }

    function desmarcarAgendamento(idx) {
        let agendamentos = getAgendamentos();
        agendamentos.splice(idx, 1);
        salvarAgendamentos(agendamentos);
        exibirAgendamentos();
        mostrarMensagem('Agendamento desmarcado com sucesso!', 'success');
    }

    function enviarWhatsApp(nome, data, hora, servico, barbeiro) {
        const mensagem = `Olá, gostaria de agendar um horário:\nNome: ${nome}\nData: ${data}\nHora: ${hora}\nServiço: ${servico}\nBarbeiro: ${barbeiro}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    }

    function enviarEmail(nome, data, hora, servico, barbeiro) {
        const templateParams = {
            nome: nome,
            data: data,
            hora: hora,
            servico: servico,
            barbeiro: barbeiro,
            to_email: 'seu-email@example.com' // Substitua pelo seu e-mail
        };

        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('Email enviado com sucesso!', response.status, response.text);
            }, function(error) {
                console.log('Erro ao enviar email:', error);
            });
    }

    document.getElementById('form-agendamento').addEventListener('submit', function(event) {
        event.preventDefault();
        const nome = this.nome.value.trim();
        const data = this.data.value;
        const hora = this.hora.value;
        const servico = this.servico.value;
        const barbeiro = this.barbeiro.value;

        if (!nome || !data || !hora || !servico || !barbeiro) {
            mostrarMensagem('Por favor, preencha todos os campos.', 'error');
            return;
        }

        const agendamentos = getAgendamentos();
        if (!validarDisponibilidade(agendamentos, data, hora, barbeiro)) {
            mostrarMensagem('Este horário já está agendado. Por favor, escolha outro.', 'error');
            return;
        }

        agendamentos.push({ nome, data, hora, servico, barbeiro });
        salvarAgendamentos(agendamentos);
        enviarWhatsApp(nome, data, hora, servico, barbeiro); // Envia mensagem via WhatsApp
        enviarEmail(nome, data, hora, servico, barbeiro); // Envia e-mail
        exibirAgendamentos();
        mostrarMensagem('Horário agendado com sucesso!', 'success');
        this.reset();
    });

    function preencherHorarios() {
        const selectHora = document.getElementById('hora');
        selectHora.innerHTML = ''; // Limpa opções existentes

        for (let h = 9; h <= 20; h++) {
            for (let m = 0; m < 60; m += 30) {
                const horaFormatada = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = horaFormatada;
                option.textContent = horaFormatada;
                selectHora.appendChild(option);
            }
        }
    }

    function validarData() {
        const dataInput = document.getElementById('data');
        dataInput.addEventListener('change', function() {
            const dataSelecionada = new Date(this.value);
            const diaDaSemana = dataSelecionada.getUTCDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

            // Se o dia for domingo (0) ou segunda (1), exibe uma mensagem de erro e limpa o campo
            if (diaDaSemana === 0 || diaDaSemana === 1) {
                mostrarMensagem('Por favor, escolha uma data entre terça e sábado.', 'error');
                this.value = ''; // Limpa o campo de data
            }
        });
    }

    // Chama a função para preencher os horários ao carregar a página
    preencherHorarios();
    validarData(); // Chama a função para validar a data
    // Inicializa a lista ao carregar a página
    exibirAgendamentos();
})();
