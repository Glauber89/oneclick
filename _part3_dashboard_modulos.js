const Dashboard = {
  render(container) {
    const totalMateriais = App.data.armas.length + App.data.celulares.length + App.data.coletes.length + App.data.veiculos.length + App.data.bodycams.length + App.data.lanternas.length + App.data.tonfas.length;
    const emUso = [...App.data.armas, ...App.data.celulares, ...App.data.coletes, ...App.data.veiculos, ...App.data.bodycams, ...App.data.lanternas].filter(i => i.situacao === 'em uso').length;
    const manutencao = [...App.data.armas, ...App.data.celulares, ...App.data.coletes, ...App.data.veiculos, ...App.data.bodycams, ...App.data.lanternas].filter(i => i.situacao === 'manutenção' || i.situacao === 'defeito').length;
    
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: var(--primary);">Dashboard Executivo</h2>
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Exportar</button>
      </div>

      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card stat-card">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="stat-icon" style="background: rgba(37,99,235,0.1); color: var(--secondary); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              <i class="fas fa-boxes"></i>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: 700;">${totalMateriais}</div>
              <div style="color: var(--text-secondary); font-size: 0.875rem;">Total Materiais</div>
            </div>
          </div>
        </div>

        <div class="card stat-card">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: var(--success); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              <i class="fas fa-check-circle"></i>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: 700;">${emUso}</div>
              <div style="color: var(--text-secondary); font-size: 0.875rem;">Em Uso</div>
            </div>
          </div>
        </div>

        <div class="card stat-card">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="stat-icon" style="background: rgba(245,158,11,0.1); color: var(--warning); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              <i class="fas fa-tools"></i>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: 700;">${manutencao}</div>
              <div style="color: var(--text-secondary); font-size: 0.875rem;">Em Manutenção</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
          <div class="card">
              <h3 style="margin-top: 0;">Últimas Movimentações</h3>
              <div class="table-container">
                  <table style="width: 100%; border-collapse: collapse; text-align: left;">
                      <thead>
                          <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                              <th style="padding: 12px;">Data/Hora</th>
                              <th style="padding: 12px;">Ação</th>
                              <th style="padding: 12px;">Material</th>
                              <th style="padding: 12px;">Usuário</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${App.data.logs.slice(-5).reverse().map(log => `
                              <tr style="border-bottom: 1px solid #e2e8f0;">
                                  <td style="padding: 12px;">${Utils.formatDateTime(log.dataHora)}</td>
                                  <td style="padding: 12px;">${log.acao}</td>
                                  <td style="padding: 12px;">${log.entidade} (${log.idEntidade})</td>
                                  <td style="padding: 12px;">${log.usuarioNome}</td>
                              </tr>
                          `).join('') || '<tr><td colspan="4" style="padding: 12px; text-align: center;">Nenhuma movimentação recente</td></tr>'}
                      </tbody>
                  </table>
              </div>
          </div>
          
      </div>
    `;
  }
};

const ArmasModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Armas</h2>
          </div>
        <button class="btn btn-primary" onclick="ArmasModule.openForm()"><i class="fas fa-plus"></i> Nova Arma</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;" id="table-armas">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Mina</th>
                <th style="padding: 12px;">Tipo</th>
                <th style="padding: 12px;">Série / Registro</th>
                <th style="padding: 12px;">Validade Reg.</th>
                <th style="padding: 12px;">Responsável</th>
                <th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.armas.map(a => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${a.codigo}</td>
                  <td style="padding: 12px;">${App.data.minas.find(m => m.id === a.minaId)?.nome || "-"}</td>
                  <td style="padding: 12px;">${a.tipo} <br><small style="color: #64748b">${a.marca} ${a.modelo}</small></td>
                  <td style="padding: 12px;">S: ${a.serie} <br>R: ${a.registro}</td>
                  <td style="padding: 12px;">${Utils.formatDate(a.validadeRegistro)}</td>
                  <td style="padding: 12px;">${a.responsavel}</td>
                  <td style="padding: 12px;">${Utils.getBadgeHtml(a.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="ArmasModule.openForm('${a.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="ArmasModule.delete('${a.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhuma arma cadastrada</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  openForm(id = null) {
      const arma = id ? App.data.armas.find(a => a.id === id) : null;
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
      
      modal.innerHTML = `
        <div class="modal" style="background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0;">${id ? 'Editar' : 'Nova'} Arma</h3>
              <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fas fa-times"></i></button>
          </div>
          <div style="padding: 24px;">
              <form id="form-arma" onsubmit="event.preventDefault(); ArmasModule.save('${id || ''}')">
                  
                  <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label>
                      <select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                          <option value="">Selecione...</option>
                          ${App.data.minas.map(m => `<option value="${m.id}" ${arma?.minaId === m.id ? 'selected' : ''}>${m.nome}</option>`).join('')}
                      </select>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Tipo</label>
                          <select id="f-tipo" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                              <option value="">Selecione...</option>
                              <option value="SPARK" ${arma?.tipo === 'SPARK' ? 'selected' : ''}>SPARK</option>
                              <option value=".38" ${arma?.tipo === '.38' ? 'selected' : ''}>.38</option>
                          </select>
                      </div>
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Marca</label>
                          <input type="text" id="f-marca" value="${arma?.marca || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                      </div>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Modelo</label>
                          <input type="text" id="f-modelo" value="${arma?.modelo || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                      </div>
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Série</label>
                          <input type="text" id="f-serie" value="${arma?.serie || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                      </div>
                  </div>
  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Registro</label>
                          <input type="text" id="f-registro" value="${arma?.registro || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                      </div>
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Validade do Registro</label>
                          <input type="date" id="f-validade" value="${arma?.validadeRegistro || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                      </div>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label>
                          <input type="text" id="f-responsavel" value="${arma?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                      </div>
                      <div>
                          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label>
                          <select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required>
                              <option value="disponível" ${arma?.situacao === 'disponível' ? 'selected' : ''}>Disponível</option>
                              <option value="em uso" ${arma?.situacao === 'em uso' ? 'selected' : ''}>Em uso</option>
                              <option value="manutenção" ${arma?.situacao === 'manutenção' ? 'selected' : ''}>Manutenção</option>
                              <option value="baixada" ${arma?.situacao === 'baixada' ? 'selected' : ''}>Baixada</option>
                          </select>
                      </div>
                  </div>

                  <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                      <button type="button" class="btn btn-secondary" style="padding: 10px 20px; border: none; border-radius: 8px; background: #e2e8f0; cursor: pointer;" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                      <button type="submit" class="btn btn-primary" style="padding: 10px 20px; border: none; border-radius: 8px; background: var(--secondary); color: white; cursor: pointer;">Salvar</button>
                  </div>
              </form>
          </div>
        </div>
      `;
      document.getElementById('modal-container').appendChild(modal);
    },
    save(id) {
    const formValues = {
        minaId: document.getElementById('f-minaId').value, 
 tipo: document.getElementById('f-tipo').value,
        marca: document.getElementById('f-marca').value,
        modelo: document.getElementById('f-modelo').value,
        serie: document.getElementById('f-serie').value,
        registro: document.getElementById('f-registro').value,
        validadeRegistro: document.getElementById('f-validade').value,
        situacao: document.getElementById('f-situacao').value,
        responsavel: document.getElementById('f-responsavel').value
    };

    if (id) {
        const index = App.data.armas.findIndex(a => a.id === id);
        const antiga = {...App.data.armas[index]};
        App.data.armas[index] = { ...App.data.armas[index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'Arma', id, antiga, App.data.armas[index]);
    } else {
        const nova = {
            id: Utils.generateId('ARM'),
            codigo: Utils.generateCodigo('ARM'),
            ...formValues,
            minaId: 'MINA-1', // Default por enquanto
            postoId: 'PST-1'
        };
        App.data.armas.push(nova);
        AuditLog.registrar('CADASTRO', 'Arma', nova.id, null, nova);
    }

    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Arma salva com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const index = App.data.armas.findIndex(a => a.id === id);
          App.data.armas.splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Arma exclu�da com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const CelularesModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Celulares</h2>
          </div>
        <button class="btn btn-primary" onclick="CelularesModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Patrimônio</th><th style="padding: 12px;">Mina</th><th style="padding: 12px;">Marca</th><th style="padding: 12px;">Número</th><th style="padding: 12px;">Responsável</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.celulares.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${item.patrimonio || "-"}</td><td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.marca || "-"}</td><td style="padding: 12px;">${item.numero || "-"}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="CelularesModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="CelularesModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="10" style="text-align: center; padding: 20px;">Nenhum item cadastrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  openForm(id = null) {
    const item = id ? App.data.celulares.find(i => i.id === id) : null;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div class="modal" style="background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">${id ? 'Editar' : 'Novo'} Item</h3>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fas fa-times"></i></button>
        </div>
        <div style="padding: 24px;">
            <form onsubmit="event.preventDefault(); CelularesModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Patrimônio</label><input type="text" id="f-patrimonio" value="${item?.patrimonio || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Marca</label><input type="text" id="f-marca" value="${item?.marca || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Modelo</label><input type="text" id="f-modelo" value="${item?.modelo || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Número</label><input type="text" id="f-numero" value="${item?.numero || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">IMEI 1</label><input type="text" id="f-imei1" value="${item?.imei1 || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Operadora</label><select id="f-operadora" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Claro" ${item?.operadora === "Claro" ? "selected" : ""}>Claro</option><option value="Vivo" ${item?.operadora === "Vivo" ? "selected" : ""}>Vivo</option><option value="TIM" ${item?.operadora === "TIM" ? "selected" : ""}>TIM</option><option value="Oi" ${item?.operadora === "Oi" ? "selected" : ""}>Oi</option><option value="Algar" ${item?.operadora === "Algar" ? "selected" : ""}>Algar</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" style="padding: 10px 20px; border: none; border-radius: 8px; background: #e2e8f0; cursor: pointer;" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 20px; border: none; border-radius: 8px; background: var(--secondary); color: white; cursor: pointer;">Salvar</button>
                </div>
            </form>
        </div>
      </div>
    `;
    document.getElementById('modal-container').appendChild(modal);
  },
  save(id) {
    const formValues = {
        patrimonio: document.getElementById('f-patrimonio').value,
        minaId: document.getElementById('f-minaId').value,
        marca: document.getElementById('f-marca').value,
        modelo: document.getElementById('f-modelo').value,
        numero: document.getElementById('f-numero').value,
        imei1: document.getElementById('f-imei1').value,
        operadora: document.getElementById('f-operadora').value,
        responsavel: document.getElementById('f-responsavel').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'celulares';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'CEL', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('CEL'),
            codigo: Utils.generateCodigo('CEL'),
            ...formValues,
            postoId: 'PST-1'
        };
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'CEL', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'celulares';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const ColetesModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Coletes</h2>
          </div>
        <button class="btn btn-primary" onclick="ColetesModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Patrimônio</th><th style="padding: 12px;">Mina</th><th style="padding: 12px;">Série</th><th style="padding: 12px;">Tamanho</th><th style="padding: 12px;">Tipo de Uso</th><th style="padding: 12px;">Validade</th><th style="padding: 12px;">Responsável</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.coletes.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${item.patrimonio || "-"}</td><td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.serie || "-"}</td><td style="padding: 12px;">${item.tamanho || "-"}</td><td style="padding: 12px;">${item.tipoUso || "-"}</td><td style="padding: 12px;">${Utils.formatDate(item.validade)}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="ColetesModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="ColetesModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="10" style="text-align: center; padding: 20px;">Nenhum item cadastrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  openForm(id = null) {
    const item = id ? App.data.coletes.find(i => i.id === id) : null;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div class="modal" style="background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">${id ? 'Editar' : 'Novo'} Item</h3>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;"><i class="fas fa-times"></i></button>
        </div>
        <div style="padding: 24px;">
            <form onsubmit="event.preventDefault(); ColetesModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Patrimônio</label><input type="text" id="f-patrimonio" value="${item?.patrimonio || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Série</label><input type="text" id="f-serie" value="${item?.serie || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Nível</label><select id="f-nivel" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="I" ${item?.nivel === "I" ? "selected" : ""}>I</option><option value="IIA" ${item?.nivel === "IIA" ? "selected" : ""}>IIA</option><option value="II" ${item?.nivel === "II" ? "selected" : ""}>II</option><option value="IIIA" ${item?.nivel === "IIIA" ? "selected" : ""}>IIIA</option><option value="III" ${item?.nivel === "III" ? "selected" : ""}>III</option><option value="IV" ${item?.nivel === "IV" ? "selected" : ""}>IV</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Tamanho</label><select id="f-tamanho" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="P" ${item?.tamanho === "P" ? "selected" : ""}>P</option><option value="M" ${item?.tamanho === "M" ? "selected" : ""}>M</option><option value="G" ${item?.tamanho === "G" ? "selected" : ""}>G</option><option value="GG" ${item?.tamanho === "GG" ? "selected" : ""}>GG</option><option value="XG" ${item?.tamanho === "XG" ? "selected" : ""}>XG</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Tipo de Uso</label><select id="f-tipoUso" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Individual" ${item?.tipoUso === "Individual" ? "selected" : ""}>Individual</option><option value="Coletiva" ${item?.tipoUso === "Coletiva" ? "selected" : ""}>Coletiva</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Validade</label><input type="date" id="f-validade" value="${item?.validade || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" style="padding: 10px 20px; border: none; border-radius: 8px; background: #e2e8f0; cursor: pointer;" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 20px; border: none; border-radius: 8px; background: var(--secondary); color: white; cursor: pointer;">Salvar</button>
                </div>
            </form>
        </div>
      </div>
    `;
    document.getElementById('modal-container').appendChild(modal);
  },
  save(id) {
    const formValues = {
        patrimonio: document.getElementById('f-patrimonio').value,
        minaId: document.getElementById('f-minaId').value,
        serie: document.getElementById('f-serie').value,
        nivel: document.getElementById('f-nivel').value,
        tamanho: document.getElementById('f-tamanho').value,
        tipoUso: document.getElementById('f-tipoUso').value,
        validade: document.getElementById('f-validade').value,
        responsavel: document.getElementById('f-responsavel').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'coletes';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'COL', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('COL'),
            codigo: Utils.generateCodigo('COL'),
            ...formValues,
            postoId: 'PST-1'
        };
        if (!App.data[arrayName]) App.data[arrayName] = [];
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'COL', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'coletes';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const MinasModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Minas e Equipes</h2>
          </div>
      </div>
      <div class="card">
        <div class="empty-state" style="text-align: center; padding: 40px; color: #64748b;">
          <i class="fas fa-mountain" style="font-size: 3rem; margin-bottom: 16px; color: #cbd5e1;"></i>
          <h3>Módulo em desenvolvimento</h3>
        </div>
      </div>
    `;
  }
};

window.Dashboard = Dashboard;
window.ArmasModule = ArmasModule;
window.CelularesModule = CelularesModule;
window.ColetesModule = ColetesModule;
window.MinasModule = MinasModule;
