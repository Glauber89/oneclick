const App = {
  version: '1.0.0',
  currentUser: null,
  currentPage: 'dashboard',
  data: {
    minas: [],
    postos: [],
    equipes: [],
    usuarios: [],
    armas: [],
    celulares: [],
    coletes: [],
    veiculos: [],
    bodycams: [],
    lanternas: [],
    tonfas: [],
    movimentacoes: [],
    logs: [],
    alertas: [],
    radios: [],
    config: {}
  },
  charts: {}
};

const Storage = {
  prefix: 'oneclick_',
  save(key, data) {
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  },
  load(key) {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : null;
  },
  saveAll() {
    for (let key in App.data) {
      this.save(key, App.data[key]);
    }
  },
  loadAll() {
    for (let key in App.data) {
      const saved = this.load(key);
      if (saved) {
        App.data[key] = saved;
      }
    }
  },
  clear() {
    for (let key in App.data) {
      localStorage.removeItem(this.prefix + key);
    }
  }
};

const Utils = {
  generateId(prefix = 'ID') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  },
  generateCodigo(tipo) {
    const year = new Date().getFullYear();
    const count = (App.data[tipo.toLowerCase()]?.length || 0) + 1;
    return `${tipo}-${year}-${String(count).padStart(3, '0')}`;
  },
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00'); // Evita timezone offset em datas curtas
    return date.toLocaleDateString('pt-BR');
  },
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  },
  daysDiff(date1, date2 = new Date()) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d1 - d2;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  },
  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-exclamation-circle';
    if(type === 'warning') icon = 'fa-exclamation-triangle';
    if(type === 'info') icon = 'fa-info-circle';

    toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 3000);
  },
  getBadgeHtml(situacao) {
    situacao = situacao.toLowerCase();
    let badgeClass = 'badge-inactive';
    if (['disponível', 'ativo', 'ótimo', 'bom'].includes(situacao)) badgeClass = 'badge-success';
    if (['em uso', 'regular'].includes(situacao)) badgeClass = 'badge-info';
    if (['manutenção', 'atenção', 'defeito', 'ruim'].includes(situacao)) badgeClass = 'badge-warning';
    if (['extraviada', 'bloqueada', 'baixada', 'inoperante', 'extraviado', 'baixado'].includes(situacao)) badgeClass = 'badge-danger';
    return `<span class="badge ${badgeClass}">${situacao.toUpperCase()}</span>`;
  },
  confirm(message) {
      return confirm(message); // Simplificado por enquanto.
  }
};

const Auth = {
  profiles: {
    administrador: { label: 'Administrador', permissions: ['all'] },
    coordenador: { label: 'Coordenador', permissions: ['view','create','edit','transfer','report'] },
    supervisor: { label: 'Supervisor', permissions: ['view','create','edit','transfer'] },
    operador: { label: 'Operador', permissions: ['view','create','edit'] },
    consulta: { label: 'Consulta', permissions: ['view'] },
    auditor: { label: 'Auditor', permissions: ['view','report','log'] }
  },
  login(username, password) {
    const user = App.data.usuarios.find(u => u.username === username && u.password === password);
    if (user) {
      App.currentUser = user;
      localStorage.setItem('oneclick_current_user', JSON.stringify(user));
      Utils.showToast(`Bem-vindo, ${user.nome}!`);
      renderApp();
      return true;
    }
    Utils.showToast('Usuário ou senha incorretos!', 'error');
    return false;
  },
  logout() {
    App.currentUser = null;
    localStorage.removeItem('oneclick_current_user');
    renderLogin();
  },
  hasPermission(permission) {
    if (!App.currentUser) return false;
    const userProfile = this.profiles[App.currentUser.perfil];
    if (!userProfile) return false;
    if (userProfile.permissions.includes('all')) return true;
    return userProfile.permissions.includes(permission);
  }
};

const AuditLog = {
  registrar(acao, entidade, idEntidade, dadosAnteriores, dadosNovos, justificativa = '') {
    App.data.logs.push({
      id: Utils.generateId('LOG'),
      dataHora: new Date().toISOString(),
      usuarioId: App.currentUser ? App.currentUser.id : 'sistema',
      usuarioNome: App.currentUser ? App.currentUser.nome : 'Sistema',
      acao,
      entidade,
      idEntidade,
      dadosAnteriores,
      dadosNovos,
      justificativa
    });
    Storage.save('logs', App.data.logs);
  }
};

const AlertEngine = {
  verificar() {
    App.data.alertas = [];
    
    // Armas (Validade Registro)
    App.data.armas.forEach(arma => {
      if (arma.situacao !== 'baixada') {
        const dias = Utils.daysDiff(arma.validadeRegistro);
        if (dias < 0) {
          this.addAlert('Arma', arma.id, `Registro vencido (${arma.codigo})`, 'crítico');
        } else if (dias <= 30) {
          this.addAlert('Arma', arma.id, `Registro vence em ${dias} dias (${arma.codigo})`, 'atenção');
        }
      }
    });

    // Coletes (Validade)
    App.data.coletes.forEach(colete => {
       if (colete.situacao !== 'baixada' && colete.situacao !== 'baixado') {
         const dias = Utils.daysDiff(colete.validade);
         if(dias < 0) this.addAlert('Colete', colete.id, `Colete vencido (${colete.codigo})`, 'crítico');
         else if (dias <= 60) this.addAlert('Colete', colete.id, `Colete vence em ${dias} dias (${colete.codigo})`, 'atenção');
       }
    });

    Storage.save('alertas', App.data.alertas);
    updateAlertBadge();
  },
  addAlert(entidade, idEntidade, mensagem, prioridade) {
    App.data.alertas.push({
      id: Utils.generateId('ALT'),
      dataGeracao: new Date().toISOString(),
      entidade,
      idEntidade,
      mensagem,
      prioridade
    });
  }
};

const Router = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },
  navigate(path) {
    window.location.hash = path;
  },
  handleRoute() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    App.currentPage = hash;
    
    // Update active menu
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[href="#${hash}"]`);
    if(activeNav) activeNav.classList.add('active');

    const contentArea = document.getElementById('main-content-area');
    contentArea.innerHTML = '<div class="loading-spinner"></div>';
    
    setTimeout(() => {
        try {
            if (hash === 'dashboard' && typeof Dashboard !== 'undefined') Dashboard.render(contentArea);
            else if (hash === 'armas' && typeof ArmasModule !== 'undefined') ArmasModule.render(contentArea);
            else if (hash === 'celulares' && typeof CelularesModule !== 'undefined') CelularesModule.render(contentArea);
            else if (hash === 'coletes' && typeof ColetesModule !== 'undefined') ColetesModule.render(contentArea);
            else if (hash === 'veiculos' && typeof VeiculosModule !== 'undefined') VeiculosModule.render(contentArea);
            else if (hash === 'bodycams' && typeof BodycamsModule !== 'undefined') BodycamsModule.render(contentArea);
            else if (hash === 'lanternas' && typeof LanternasModule !== 'undefined') LanternasModule.render(contentArea);
            else if (hash === 'tonfas' && typeof TonfasModule !== 'undefined') TonfasModule.render(contentArea);
            else if (hash === 'postos' && typeof PostosEfetivoModule !== 'undefined') PostosEfetivoModule.render(contentArea);
            else if (hash === 'minas' && typeof MinasModule !== 'undefined') MinasModule.render(contentArea);
            else if (hash === 'movimentacoes' && typeof MovimentacoesModule !== 'undefined') MovimentacoesModule.render(contentArea);
            else if (hash === 'relatorios' && typeof RelatoriosModule !== 'undefined') RelatoriosModule.render(contentArea);
            else if (hash === 'radios' && typeof RadiosModule !== 'undefined') RadiosModule.render(contentArea);
            else if (hash === 'alertas' && typeof AlertasModule !== 'undefined') AlertasModule.render(contentArea);
            else if (hash === 'usuarios' && typeof UsuariosModule !== 'undefined') UsuariosModule.render(contentArea);
            else contentArea.innerHTML = '<div class="empty-state"><i class="fas fa-tools empty-state-icon"></i><h3 class="empty-state-title">Módulo em desenvolvimento</h3><p class="empty-state-description">Este módulo será disponibilizado em breve.</p></div>';
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = `<div class="alert alert-danger">Erro ao carregar o módulo: ${e.message}</div>`;
        }
    }, 100);
  }
};

function seedData() {
  App.data.usuarios = [
    { id: 'USR-1', nome: 'Admin Master', username: 'admin', password: '123', perfil: 'administrador', status: 'ativo' }
  ];
  
  App.data.minas = [
    { id: 'MINA-1', nome: 'Mina Serra Norte', unidade: 'Operação Ferro', responsavel: 'Carlos Silva', situacao: 'ativa' },
    { id: 'MINA-2', nome: 'Mina Carajás', unidade: 'Operação Cobre', responsavel: 'Roberto Dias', situacao: 'ativa' }
  ];

  App.data.equipes = [
    { id: 'EQP-1', nome: 'Alfa', minaId: 'MINA-1', supervisor: 'João Santos', turno: 'Diurno', situacao: 'ativa' },
    { id: 'EQP-2', nome: 'Bravo', minaId: 'MINA-1', supervisor: 'Marcos Paulo', turno: 'Noturno', situacao: 'ativa' }
  ];

  App.data.postos = [
    { id: 'PST-1', nome: 'Portaria Principal', codigo: 'P-001', minaId: 'MINA-1', jornada: '24 horas', turno: 'Revezamento', equipeId: 'EQP-1', supervisor: 'João Santos', efetivoPrevisto: 4, efetivoReal: 4, situacao: 'ativo' },
    { id: 'PST-2', nome: 'Balança Norte', codigo: 'P-002', minaId: 'MINA-1', jornada: '12 horas', turno: 'Diurno', equipeId: 'EQP-1', supervisor: 'João Santos', efetivoPrevisto: 2, efetivoReal: 1, situacao: 'ativo' } // Deficit
  ];

  App.data.armas = [
    { id: Utils.generateId('ARM'), codigo: 'ARM-2024-001', tipo: 'Pistola', marca: 'Taurus', modelo: 'PT 840', calibre: '.40', serie: 'S123456', registro: 'R-987654', validadeRegistro: '2024-12-31', minaId: 'MINA-1', postoId: 'PST-1', responsavel: 'José Souza', situacao: 'em uso', dataInspecao: '2024-05-10', observacoes: '' },
    { id: Utils.generateId('ARM'), codigo: 'ARM-2024-002', tipo: 'Revólver', marca: 'Taurus', modelo: 'RT 82', calibre: '.38', serie: 'S654321', registro: 'R-112233', validadeRegistro: '2024-09-01', minaId: 'MINA-1', postoId: 'PST-2', responsavel: 'Armaria', situacao: 'disponível', dataInspecao: '2024-05-15', observacoes: '' }
  ];
  
  Storage.saveAll();
}

function getAppLayout() {
  return `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
            <div style="color: white; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-shield-alt" style="color: var(--accent);"></i>
                <span>ONE<span style="color: var(--accent)">CLICK</span></span>
            </div>
        </div>
        <nav class="sidebar-nav" style="padding: 10px;">
          <div style="font-size: 0.65rem; color: var(--accent); text-transform: uppercase; padding: 10px; font-weight: bold;">Painel</div>
          <a href="#dashboard" class="nav-item active" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-chart-line"></i> Dashboard</a>
          <a href="#alertas" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-bell"></i> Alertas <span class="nav-badge" id="alert-badge-menu" style="background: var(--danger); border-radius: 10px; padding: 2px 6px; font-size: 0.7rem; margin-left: auto;">0</span></a>
          
          <div style="font-size: 0.65rem; color: var(--accent); text-transform: uppercase; padding: 10px; font-weight: bold; margin-top: 10px;">Controle de Materiais</div>
          <a href="#armas" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-crosshairs"></i> Armas</a>
          <a href="#coletes" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-vest"></i> Coletes e Placas</a>
          <a href="#celulares" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-mobile-alt"></i> Celulares</a>
          <a href="#veiculos" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-car"></i> Veículos</a>
          <a href="#bodycams" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-video"></i> Bodycams</a>
          <a href="#lanternas" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-flashlight"></i> Lanternas</a>
          <a href="#tonfas" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-gavel"></i> Tonfas</a>
          
          <a href="#radios" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-walkie-talkie"></i> Rádios HT</a>
          <div style="font-size: 0.65rem; color: var(--accent); text-transform: uppercase; padding: 10px; font-weight: bold; margin-top: 10px;">Gestão</div>
          <a href="#postos" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-map-marker-alt"></i> Postos e Efetivo</a>
          <a href="#minas" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-mountain"></i> Minas e Equipes</a>
          <a href="#movimentacoes" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-exchange-alt"></i> Movimentações</a>
          <a href="#relatorios" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-file-pdf"></i> Relatórios</a>
          
          <div style="font-size: 0.65rem; color: var(--accent); text-transform: uppercase; padding: 10px; font-weight: bold; margin-top: 10px;">Sistema</div>
          <a href="#usuarios" class="nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: white; text-decoration: none; border-radius: 8px;"><i class="fas fa-users-cog"></i> Usuários</a>
        </nav>
      </aside>
      
      <main class="main-content" style="flex: 1; margin-left: 260px; background: #f1f5f9; min-height: 100vh; overflow-y: auto;">
        <header class="page-header" style="height: 64px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 10;">
            <div style="display: flex; align-items: center; gap: 16px;">
                <button class="btn btn-icon d-none" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
                <div class="search-bar" style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px;">
                    <i class="fas fa-search" style="color: #64748b;"></i>
                    <input type="text" placeholder="Busca global..." style="border: none; background: transparent; outline: none; width: 200px;">
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 16px;">
                <button class="btn btn-primary" onclick="openScannerModal()" style="display: flex; align-items: center; gap: 6px;"><i class="fas fa-qrcode"></i> Ler Código</button>
                <div style="position: relative;">
                    <button class="btn btn-icon" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fas fa-bell"></i></button>
                    <span class="badge badge-danger" id="alert-badge-header" style="position: absolute; top: -5px; right: -5px; padding: 2px 5px; font-size: 0.6rem; border-radius: 50%;">0</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; border-left: 1px solid #e2e8f0; padding-left: 16px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--secondary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${App.currentUser?.nome.charAt(0)}
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; font-weight: bold;">${App.currentUser?.nome}</div>
                        <div style="font-size: 0.7rem; color: #64748b;">${App.currentUser?.perfil}</div>
                    </div>
                    <button class="btn btn-icon" onclick="Auth.logout()" title="Sair" style="background: none; border: none; color: var(--danger); cursor: pointer;"><i class="fas fa-sign-out-alt"></i></button>
                </div>
            </div>
        </header>
        
        <div id="main-content-area" style="padding: 24px;">
            <!-- Conteúdo carregado via Router -->
        </div>
      </main>
    </div>
    
    <!-- Modal Container -->
    <div id="modal-container"></div>
  `;
}

function getLoginLayout() {
  return `
    <div class="login-page" style="min-height: 100vh; display: flex; background: linear-gradient(135deg, var(--primary) 0%, #0f1f3d 100%); align-items: center; justify-content: center;">
      <div class="login-container" style="max-width: 440px; width: 100%; padding: 20px;">
        <div class="login-card" style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--accent); margin-bottom: 10px;"></i>
            <h1 style="color: var(--primary); font-size: 1.5rem; margin: 0;">Controle de Materiais</h1>
            <h2 style="color: var(--accent); font-size: 2rem; font-weight: 800; margin: 0;">ONE<span style="color: var(--primary)">CLICK</span></h2>
          </div>
          
          <form onsubmit="event.preventDefault(); Auth.login(document.getElementById('username').value, document.getElementById('password').value);">
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px;">Usuário</label>
              <input type="text" id="username" value="admin" style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 24px;">
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px;">Senha</label>
              <input type="password" id="password" value="123" style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; border-radius: 8px; border: none; background: var(--secondary); color: white; cursor: pointer; display: flex; justify-content: center; gap: 10px;">
              <i class="fas fa-sign-in-alt"></i> Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function updateAlertBadge() {
    const count = App.data.alertas.length;
    const badgeMenu = document.getElementById('alert-badge-menu');
    const badgeHeader = document.getElementById('alert-badge-header');
    
    if (badgeMenu) {
        badgeMenu.innerText = count;
        badgeMenu.style.display = count > 0 ? 'inline-block' : 'none';
    }
    if (badgeHeader) {
        badgeHeader.innerText = count;
        badgeHeader.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.toggle('open');
}

function openScannerModal() {
    Utils.showToast("Leitor de QR Code / Código de barras acionado (Simulação)", "info");
}

function initApp() {
  App.data.minas = [{ id: 'MINA-CAUE', nome: 'Mina Cauê', unidade: 'Itabira', responsavel: '-', situacao: 'ativa' }, { id: 'MINA-CONCEICAO', nome: 'Mina Conceição', unidade: 'Itabira', responsavel: '-', situacao: 'ativa' }, { id: 'MINA-PERIQUITO', nome: 'Mina Periquito', unidade: 'Itabira', responsavel: '-', situacao: 'ativa' }]; Storage.save('minas', App.data.minas);
  Storage.loadAll();
  if (!App.data.usuarios || App.data.usuarios.length === 0) seedData();
  
  const savedUser = localStorage.getItem('oneclick_current_user');
  if (savedUser) {
    App.currentUser = JSON.parse(savedUser);
    renderApp();
  } else {
    renderLogin();
  }
}

function renderApp() {
  document.getElementById('app').innerHTML = getAppLayout();
  Router.init();
  AlertEngine.verificar();
}

function renderLogin() {
  document.getElementById('app').innerHTML = getLoginLayout();
}

// Expose globally
window.initApp = initApp;
window.Auth = Auth;
window.Utils = Utils;
window.Router = Router;
window.Storage = Storage;
window.App = App;
window.openScannerModal = openScannerModal;
window.toggleSidebar = toggleSidebar;
