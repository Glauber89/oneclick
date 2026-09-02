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


// ==========================================
// CONFIGURAÇÃO FIREBASE (NUVEM)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDGw1M4-zeWMjVq1_6uF1dNIRnkYBsKAqc",
  authDomain: "controle-oneclick.firebaseapp.com",
  projectId: "controle-oneclick",
  storageBucket: "controle-oneclick.firebasestorage.app",
  messagingSenderId: "880922280039",
  appId: "1:880922280039:web:b26bc1e0bfcff10a4654c2"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==========================================
// STORAGE ENGINE (Substituído para Firestore)
// ==========================================
const Storage = {
  prefix: 'oneclick_',
  save(key, data) {},
  load(key) { return null; },
  saveAll() {
    db.collection('oneclick').doc('basededados').set(App.data)
      .catch(error => console.error("Erro ao salvar no Firebase: ", error));
  },
  loadAll() {},
  clear() {}
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
  confirm(msg) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease;';
        overlay.innerHTML = `
          <div class="modal" style="background: white; border-radius: 16px; width: 100%; max-width: 400px; padding: 30px 24px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 20px;">
              <i class="fas fa-trash-alt"></i>
            </div>
            <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 1.25rem;">Confirmar Exclusão</h3>
            <p style="margin: 0 0 24px; color: #64748b; font-size: 0.95rem; line-height: 1.5;">${msg}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button id="btn-cancel" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;">Cancelar</button>
              <button id="btn-confirm" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;">Sim, Excluir</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btn-cancel').onclick = () => { overlay.remove(); resolve(false); };
        document.getElementById('btn-confirm').onclick = () => { overlay.remove(); resolve(true); };
    });
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
          <div class="sidebar-header">
              <i class="fas fa-shield-alt" style="color: var(--accent);"></i>
              <h2>ONE<span style="color: var(--accent)">CLICK</span></h2>
          </div>
          <nav class="nav-menu">
            <div class="nav-category">Painel</div>
            <a href="#dashboard" class="nav-item active"><i class="fas fa-chart-line"></i> Dashboard</a>
            <a href="#alertas" class="nav-item"><i class="fas fa-bell"></i> Alertas <span class="badge badge-danger" id="alert-badge-menu" style="margin-left: auto;">0</span></a>
            
            <div class="nav-category">Controle de Materiais</div>
            <a href="#armas" class="nav-item"><i class="fas fa-crosshairs"></i> Armas</a>
            <a href="#coletes" class="nav-item"><i class="fas fa-vest"></i> Coletes e Placas</a>
            <a href="#celulares" class="nav-item"><i class="fas fa-mobile-alt"></i> Celulares</a>
            <a href="#veiculos" class="nav-item"><i class="fas fa-car"></i> Veículos</a>
            <a href="#bodycams" class="nav-item"><i class="fas fa-video"></i> Bodycams</a>
            <a href="#lanternas" class="nav-item"><i class="fas fa-flashlight"></i> Lanternas</a>
            <a href="#tonfas" class="nav-item"><i class="fas fa-gavel"></i> Tonfas</a>
            <a href="#radios" class="nav-item"><i class="fas fa-walkie-talkie"></i> Rádios HT</a>
            
            <div class="nav-category">Gestão</div>
            <a href="#postos" class="nav-item"><i class="fas fa-map-marker-alt"></i> Postos e Efetivo</a>
            <a href="#minas" class="nav-item"><i class="fas fa-mountain"></i> Minas e Equipes</a>
            <a href="#movimentacoes" class="nav-item"><i class="fas fa-exchange-alt"></i> Movimentações</a>
            <a href="#relatorios" class="nav-item"><i class="fas fa-file-pdf"></i> Relatórios</a>
            
            <div class="nav-category">Sistema</div>
            <a href="#usuarios" class="nav-item"><i class="fas fa-users-cog"></i> Usuários</a>
          </nav>
        </aside>
        
        <main class="main-content">
          <header class="page-header">
              <div style="display: flex; align-items: center; gap: 16px;">
                  <button class="btn btn-icon d-none" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
                  <div class="search-bar">
                      <i class="fas fa-search"></i>
                      <input type="text" placeholder="Busca global...">
                  </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 16px;">
                  <button class="btn btn-primary" onclick="openScannerModal()"><i class="fas fa-qrcode"></i> Ler Código</button>
                  <div style="position: relative;">
                      <button class="btn btn-secondary btn-icon"><i class="fas fa-bell"></i></button>
                      <span class="badge badge-danger" id="alert-badge-header" style="position: absolute; top: -5px; right: -5px; padding: 2px 5px; font-size: 0.6rem; border-radius: 50%;">0</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; padding-left: 16px;">
                      <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--secondary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                          ${App.currentUser?.nome.charAt(0)}
                      </div>
                      <div>
                          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text);">${App.currentUser?.nome}</div>
                          <div style="font-size: 0.75rem; color: var(--text-secondary);">${App.currentUser?.perfil}</div>
                      </div>
                      <button class="btn btn-icon" onclick="Auth.logout()" style="margin-left: 12px; color: var(--danger); background: transparent;"><i class="fas fa-sign-out-alt"></i></button>
                  </div>
              </div>
          </header>
          
          <div class="page-content" id="main-content-area">
             <!-- Renderizado dinamicamente -->
          </div>
        </main>
      </div>
    `;
  }
  
  function getLoginLayout() {
    return `
      <div class="login-page">
        <div class="login-container">
          <div class="login-card">
            <div style="text-align: center; margin-bottom: 40px;">
              <i class="fas fa-shield-alt" style="font-size: 3.5rem; color: var(--accent); margin-bottom: 16px;"></i>
              <h1 style="color: var(--text); font-size: 1.5rem; margin: 0; font-weight: 700;">Controle de Materiais</h1>
              <h2 style="color: var(--secondary); font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: -1px;">ONE<span style="color: var(--accent)">CLICK</span></h2>
            </div>
            
            <form onsubmit="event.preventDefault(); Auth.login(document.getElementById('username').value, document.getElementById('password').value);">
              <div class="form-group">
                <label>Usuário</label>
                <input type="text" id="username" value="admin" required>
              </div>
              <div class="form-group">
                <label>Senha</label>
                <input type="password" id="password" value="123456" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; padding: 14px;">Entrar no Sistema</button>
            </form>
            <div style="text-align: center; margin-top: 24px; font-size: 0.8rem; color: var(--text-secondary);">
              V 1.0.0 &copy; ONECLICK
            </div>
          </div>
        </div>
      </div>
    `;
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
