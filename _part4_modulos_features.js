const VeiculosModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Veículos</h2>
          </div>
        <button class="btn btn-primary" onclick="VeiculosModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Placa</th><th style="padding: 12px;">Mina</th><th style="padding: 12px;">Frota</th><th style="padding: 12px;">Locadora</th><th style="padding: 12px;">Modelo</th><th style="padding: 12px;">Responsável</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.veiculos.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${item.placa || "-"}</td><td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.frota || "-"}</td><td style="padding: 12px;">${item.locadora || "-"}</td><td style="padding: 12px;">${item.modelo || "-"}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="VeiculosModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="VeiculosModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
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
    const item = id ? App.data.veiculos.find(i => i.id === id) : null;
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
            <form onsubmit="event.preventDefault(); VeiculosModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Placa</label><input type="text" id="f-placa" value="${item?.placa || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Frota</label><input type="text" id="f-frota" value="${item?.frota || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Locadora</label><select id="f-locadora" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Localiza" ${item?.locadora === "Localiza" ? "selected" : ""}>Localiza</option><option value="Parvi" ${item?.locadora === "Parvi" ? "selected" : ""}>Parvi</option><option value="Próprio" ${item?.locadora === "Próprio" ? "selected" : ""}>Próprio</option><option value="Outra" ${item?.locadora === "Outra" ? "selected" : ""}>Outra</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Marca</label><input type="text" id="f-marca" value="${item?.marca || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Modelo</label><input type="text" id="f-modelo" value="${item?.modelo || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Senha Abastecimento</label><input type="text" id="f-senhaAbastecimento" value="${item?.senhaAbastecimento || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Sensor Proximidade</label><select id="f-sensorProximidade" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Sim" ${item?.sensorProximidade === "Sim" ? "selected" : ""}>Sim</option><option value="Não" ${item?.sensorProximidade === "Não" ? "selected" : ""}>Não</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Barra Sinalizadora</label><select id="f-barraSinalizadora" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Sim" ${item?.barraSinalizadora === "Sim" ? "selected" : ""}>Sim</option><option value="Não" ${item?.barraSinalizadora === "Não" ? "selected" : ""}>Não</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Película Antivandalismo</label><select id="f-pelicula" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Sim" ${item?.pelicula === "Sim" ? "selected" : ""}>Sim</option><option value="Não" ${item?.pelicula === "Não" ? "selected" : ""}>Não</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Centro de Custo</label><input type="text" id="f-centroCusto" value="${item?.centroCusto || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
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
        placa: document.getElementById('f-placa').value,
        minaId: document.getElementById('f-minaId').value,
        frota: document.getElementById('f-frota').value,
        locadora: document.getElementById('f-locadora').value,
        marca: document.getElementById('f-marca').value,
        modelo: document.getElementById('f-modelo').value,
        senhaAbastecimento: document.getElementById('f-senhaAbastecimento').value,
        sensorProximidade: document.getElementById('f-sensorProximidade').value,
        barraSinalizadora: document.getElementById('f-barraSinalizadora').value,
        pelicula: document.getElementById('f-pelicula').value,
        centroCusto: document.getElementById('f-centroCusto').value,
        responsavel: document.getElementById('f-responsavel').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'veiculos';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'VEI', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('VEI'),
            codigo: Utils.generateCodigo('VEI'),
            ...formValues,
            postoId: 'PST-1'
        };
        if (!App.data[arrayName]) App.data[arrayName] = [];
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'VEI', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'veiculos';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const BodycamsModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Bodycams</h2>
          </div>
        <button class="btn btn-primary" onclick="BodycamsModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Série</th><th style="padding: 12px;">Mina</th><th style="padding: 12px;">Responsável</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.bodycams.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${item.serie || "-"}</td><td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="BodycamsModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="BodycamsModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
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
    const item = id ? App.data.bodycams.find(i => i.id === id) : null;
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
            <form onsubmit="event.preventDefault(); BodycamsModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Série</label><input type="text" id="f-serie" value="${item?.serie || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
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
        serie: document.getElementById('f-serie').value,
        minaId: document.getElementById('f-minaId').value,
        responsavel: document.getElementById('f-responsavel').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'bodycams';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'CAM', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('CAM'),
            codigo: Utils.generateCodigo('CAM'),
            ...formValues,
            postoId: 'PST-1'
        };
        if (!App.data[arrayName]) App.data[arrayName] = [];
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'CAM', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'bodycams';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const LanternasModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Lanternas</h2>
          </div>
        <button class="btn btn-primary" onclick="LanternasModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Mina</th><th style="padding: 12px;">Modelo</th><th style="padding: 12px;">ID / Responsável</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.lanternas.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.modelo || "-"}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="LanternasModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="LanternasModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
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
    const item = id ? App.data.lanternas.find(i => i.id === id) : null;
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
            <form onsubmit="event.preventDefault(); LanternasModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Modelo</label><input type="text" id="f-modelo" value="${item?.modelo || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">ID / Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
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
        modelo: document.getElementById('f-modelo').value,
        responsavel: document.getElementById('f-responsavel').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'lanternas';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'LAN', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('LAN'),
            codigo: Utils.generateCodigo('LAN'),
            ...formValues,
            postoId: 'PST-1'
        };
        if (!App.data[arrayName]) App.data[arrayName] = [];
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'LAN', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'lanternas';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const TonfasModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Tonfas</h2>
          </div>
        <button class="btn btn-primary" onclick="TonfasModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Mina</th><th style="padding: 12px;">Responsável</th><th style="padding: 12px;">Porta Tonfa</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.tonfas.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${item.portaTonfa || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="TonfasModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="TonfasModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
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
    const item = id ? App.data.tonfas.find(i => i.id === id) : null;
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
            <form onsubmit="event.preventDefault(); TonfasModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Porta Tonfa</label><select id="f-portaTonfa" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="Sim" ${item?.portaTonfa === "Sim" ? "selected" : ""}>Sim</option><option value="Não" ${item?.portaTonfa === "Não" ? "selected" : ""}>Não</option></select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
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
        responsavel: document.getElementById('f-responsavel').value,
        portaTonfa: document.getElementById('f-portaTonfa').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'tonfas';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'TON', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('TON'),
            codigo: Utils.generateCodigo('TON'),
            ...formValues,
            postoId: 'PST-1'
        };
        if (!App.data[arrayName]) App.data[arrayName] = [];
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'TON', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'tonfas';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

const PostosEfetivoModule = {
  render(container) {
    const postosHTML = App.data.postos.map(p => {
        const deficit = p.efetivoPrevisto - p.efetivoReal;
        let badge = '<span class="badge badge-success">Completo</span>';
        if (deficit > 0) badge = `<span class="badge badge-danger">Déficit (-${deficit})</span>`;
        else if (deficit < 0) badge = `<span class="badge badge-info">Excedente (+${Math.abs(deficit)})</span>`;

        return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: bold;">${p.nome} (${p.codigo})</td>
                <td style="padding: 12px;">${p.jornada} / ${p.turno}</td>
                <td style="padding: 12px;">${p.supervisor}</td>
                <td style="padding: 12px; text-align: center;">${p.efetivoPrevisto}</td>
                <td style="padding: 12px; text-align: center; font-weight: bold;">${p.efetivoReal}</td>
                <td style="padding: 12px;">${badge}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Postos e Efetivo</h2>
          </div>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Posto</th>
                <th style="padding: 12px;">Jornada/Turno</th>
                <th style="padding: 12px;">Supervisor</th>
                <th style="padding: 12px; text-align: center;">Previsto</th>
                <th style="padding: 12px; text-align: center;">Real</th>
                <th style="padding: 12px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${postosHTML || '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum posto cadastrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

const MovimentacoesModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Movimentações</h2>
          </div>
        <button class="btn btn-primary"><i class="fas fa-exchange-alt"></i> Nova Movimentação</button>
      </div>
      <div class="card">
        <div class="empty-state" style="text-align: center; padding: 40px; color: #64748b;">
          <i class="fas fa-list-alt" style="font-size: 3rem; margin-bottom: 16px; color: #cbd5e1;"></i>
          <h3>Módulo em desenvolvimento</h3>
        </div>
      </div>
    `;
  }
};

const RelatoriosModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Relatórios</h2>
          </div>
      </div>
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
        ${['Inventário Geral', 'Materiais Vencidos', 'Histórico de Movimentações', 'Efetivo Previsto vs Real'].map(r => `
          <div class="card" style="text-align: center; padding: 30px 20px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.boxShadow='var(--shadow)'">
            <i class="fas fa-file-pdf" style="font-size: 2.5rem; color: var(--danger); margin-bottom: 16px;"></i>
            <h4 style="margin: 0 0 10px 0;">${r}</h4>
            <button class="btn btn-secondary btn-sm" style="margin-top: 10px;">Gerar Relatório</button>
          </div>
        `).join('')}
      </div>
    `;
  }
};

const AlertasModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: var(--primary);">Central de Alertas</h2>
      </div>
      <div class="card">
        ${App.data.alertas.map(a => `
          <div class="alert ${a.prioridade === 'crítico' ? 'alert-danger' : 'alert-warning'}" style="margin-bottom: 10px; padding: 16px; border-radius: 8px; border-left: 4px solid ${a.prioridade === 'crítico' ? 'var(--danger)' : 'var(--warning)'}; background: ${a.prioridade === 'crítico' ? '#fef2f2' : '#fffbeb'}; display: flex; align-items: center; gap: 16px;">
            <i class="fas ${a.prioridade === 'crítico' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}" style="color: ${a.prioridade === 'crítico' ? 'var(--danger)' : 'var(--warning)'}; font-size: 1.5rem;"></i>
            <div style="flex: 1;">
                <div style="font-weight: bold;">${a.entidade} - ${a.mensagem}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Gerado em: ${Utils.formatDateTime(a.dataGeracao)}</div>
            </div>
            <button class="btn btn-secondary btn-sm">Ver Detalhes</button>
          </div>
        `).join('') || '<div style="text-align: center; padding: 40px; color: var(--success);"><i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 16px;"></i><h3>Nenhum alerta no momento</h3></div>'}
      </div>
    `;
  }
};

const UsuariosModule = {
  render(container) {
    if(!Auth.hasPermission('all')) {
        container.innerHTML = '<div class="alert alert-danger">Você não tem permissão para acessar este módulo.</div>';
        return;
    }
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Usuários do Sistema</h2>
          </div>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Nome</th>
                <th style="padding: 12px;">Usuário</th>
                <th style="padding: 12px;">Perfil</th>
                <th style="padding: 12px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.usuarios.map(u => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${u.nome}</td>
                  <td style="padding: 12px;">${u.username}</td>
                  <td style="padding: 12px;">${u.perfil}</td>
                  <td style="padding: 12px;">${Utils.getBadgeHtml(u.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

window.VeiculosModule = VeiculosModule;
window.BodycamsModule = BodycamsModule;
window.LanternasModule = LanternasModule;
window.TonfasModule = TonfasModule;
window.PostosEfetivoModule = PostosEfetivoModule;
window.MovimentacoesModule = MovimentacoesModule;
window.RelatoriosModule = RelatoriosModule;
window.AlertasModule = AlertasModule;
window.UsuariosModule = UsuariosModule;


const RadiosModule = {
  render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--primary);">Controle de Rádios HT</h2>
          </div>
        <button class="btn btn-primary" onclick="RadiosModule.openForm()"><i class="fas fa-plus"></i> Novo Item</button>
      </div>
      <div class="card">
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: var(--text-secondary);">
                <th style="padding: 12px;">Código</th>
                <th style="padding: 12px;">Patrimônio</th><th style="padding: 12px;">ID</th><th style="padding: 12px;">Mina</th><th style="padding: 12px;">Quantidade</th><th style="padding: 12px;">Responsável</th><th style="padding: 12px;">Situação</th>
                <th style="padding: 12px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${App.data.radios.map(item => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">${item.codigo}</td>
                  <td style="padding: 12px;">${item.patrimonio || "-"}</td><td style="padding: 12px;">${item.idRadio || "-"}</td><td style="padding: 12px;">${App.data.minas.find(m => m.id === item.minaId)?.nome || "-"}</td><td style="padding: 12px;">${item.quantidade || "-"}</td><td style="padding: 12px;">${item.responsavel || "-"}</td><td style="padding: 12px;">${Utils.getBadgeHtml(item.situacao)}</td>
                  <td style="padding: 12px; text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Editar" onclick="RadiosModule.openForm('${item.id}')"><i class="fas fa-edit" style="color: var(--secondary);"></i></button>
                        <button class="btn btn-icon" style="background: #f1f5f9; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Excluir" onclick="RadiosModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
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
    const item = id ? App.data.radios.find(i => i.id === id) : null;
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
            <form onsubmit="event.preventDefault(); RadiosModule.save('${id || ''}')">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Patrimônio</label><input type="text" id="f-patrimonio" value="${item?.patrimonio || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">ID</label><input type="text" id="f-idRadio" value="${item?.idRadio || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Mina</label><select id="f-minaId" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option>${App.data.minas.map(m => `<option value="${m.id}" ${item?.minaId === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}</select></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Quantidade</label><input type="number" id="f-quantidade" value="${item?.quantidade || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Responsável</label><input type="text" id="f-responsavel" value="${item?.responsavel || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem;">Situação</label><select id="f-situacao" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" required><option value="">Selecione...</option><option value="disponível" ${item?.situacao === "disponível" ? "selected" : ""}>disponível</option><option value="em uso" ${item?.situacao === "em uso" ? "selected" : ""}>em uso</option><option value="manutenção" ${item?.situacao === "manutenção" ? "selected" : ""}>manutenção</option><option value="extraviada" ${item?.situacao === "extraviada" ? "selected" : ""}>extraviada</option><option value="baixada" ${item?.situacao === "baixada" ? "selected" : ""}>baixada</option></select></div>
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
        idRadio: document.getElementById('f-idRadio').value,
        minaId: document.getElementById('f-minaId').value,
        quantidade: document.getElementById('f-quantidade').value,
        responsavel: document.getElementById('f-responsavel').value,
        situacao: document.getElementById('f-situacao').value
    };
    const arrayName = 'radios';
    if (id) {
        const index = App.data[arrayName].findIndex(i => i.id === id);
        const antiga = {...App.data[arrayName][index]};
        App.data[arrayName][index] = { ...App.data[arrayName][index], ...formValues };
        AuditLog.registrar('EDIÇÃO', 'RAD', id, antiga, App.data[arrayName][index]);
    } else {
        const nova = {
            id: Utils.generateId('RAD'),
            codigo: Utils.generateCodigo('RAD'),
            ...formValues,
            postoId: 'PST-1'
        };
        if (!App.data[arrayName]) App.data[arrayName] = [];
        App.data[arrayName].push(nova);
        AuditLog.registrar('CADASTRO', 'RAD', nova.id, null, nova);
    }
    Storage.saveAll();
    
    document.querySelector('.modal-overlay').remove();
    Utils.showToast('Item salvo com sucesso!');
    this.render(document.getElementById('main-content-area'));
  },
  async delete(id) {
      if(await Utils.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          const arrayName = 'radios';
          const index = App.data[arrayName].findIndex(i => i.id === id);
          App.data[arrayName].splice(index, 1);
          Storage.saveAll();
          
          Utils.showToast('Item exclu�do com sucesso.');
          this.render(document.getElementById('main-content-area'));
      }
  }
};

window.RadiosModule = RadiosModule;


const SmartbadgesModule = {
    render(container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 16px;">
            <a href="#dashboard" class="btn btn-icon" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);" title="Voltar ao Painel Principal"><i class="fas fa-arrow-left"></i></a>
            <h2 style="margin: 0; color: var(--text);">Controle de Smartbadges</h2>
          </div>
                <button class="btn btn-primary" onclick="SmartbadgesModule.openForm()">
                    <i class="fas fa-plus"></i> Novo Smartbadge
                </button>
            </div>
            
            <div class="filter-bar" style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="smartbadges-search" placeholder="Buscar por ID..." onkeyup="SmartbadgesModule.filter()">
                </div>
                <select id="smartbadges-status" onchange="SmartbadgesModule.filter()" style="max-width: 200px;">
                    <option value="">Todos os Status</option>
                    <option value="ativo">Ativo</option>
                    <option value="manutenção">Manutenção</option>
                    <option value="devolução">Devolução</option>
                </select>
                <button class="btn btn-secondary" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
            </div>
            
            <div class="card table-container">
                <table id="smartbadges-table">
                    <thead>
                        <tr>
                            <th>ID (Código)</th>
                            <th>Status</th>
                            <th style="text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>${this.getTableRows(App.data.smartbadges || [])}</tbody>
                </table>
            </div>
        `;
    },
    
    getTableRows(data) {
        return data.map(item => `
            <tr>
                <td style="font-weight: bold; color: var(--text);">${item.codigo || item.id}</td>
                <td>${Utils.getBadgeHtml(item.situacao)}</td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn btn-icon" title="Editar" onclick="SmartbadgesModule.openForm('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" title="Excluir" onclick="SmartbadgesModule.delete('${item.id}')"><i class="fas fa-trash" style="color: var(--danger);"></i></button>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 20px;">Nenhum Smartbadge cadastrado</td></tr>';
    },
    
    openForm(id = null) {
        const item = id ? App.data.smartbadges.find(i => i.id === id) : null;
        const modalId = 'modal-smartbadge';
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = modalId;
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header" style="padding: 24px 32px; border-bottom: 1px solid var(--border-highlight); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: var(--text);">${id ? 'Editar' : 'Novo'} Smartbadge</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-icon"><i class="fas fa-times"></i></button>
                </div>
                <form onsubmit="event.preventDefault(); SmartbadgesModule.save('${id || ''}')">
                    <div class="modal-body" style="padding: 32px;">
                        <div class="form-group">
                            <label>ID / Código do Smartbadge</label>
                            <input type="text" id="sb-codigo" value="${item?.codigo || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="sb-situacao" required>
                                <option value="">Selecione...</option>
                                <option value="ativo" ${item?.situacao === 'ativo' ? 'selected' : ''}>Ativo</option>
                                <option value="manutenção" ${item?.situacao === 'manutenção' ? 'selected' : ''}>Manutenção</option>
                                <option value="devolução" ${item?.situacao === 'devolução' ? 'selected' : ''}>Devolução</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer" style="padding: 24px 32px; border-top: 1px solid var(--border-highlight); display: flex; justify-content: flex-end; gap: 16px;">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },
    
    save(id) {
        const codigo = document.getElementById('sb-codigo').value;
        const situacao = document.getElementById('sb-situacao').value;
        
        if (!App.data.smartbadges) App.data.smartbadges = [];
        
        if (id) {
            const index = App.data.smartbadges.findIndex(i => i.id === id);
            if(index > -1) {
                App.data.smartbadges[index] = { ...App.data.smartbadges[index], codigo, situacao };
            }
        } else {
            App.data.smartbadges.push({
                id: Utils.generateId('SB'),
                codigo,
                situacao
            });
        }
        
        Storage.saveAll();
        document.getElementById('modal-smartbadge').remove();
        this.render(document.getElementById('main-content-area'));
        Utils.showToast('Smartbadge salvo com sucesso!');
    },
    
    async delete(id) {
        if(await Utils.confirm('Tem certeza que deseja excluir este Smartbadge?')) {
            const index = App.data.smartbadges.findIndex(i => i.id === id);
            if(index > -1) {
                App.data.smartbadges.splice(index, 1);
                Storage.saveAll();
                this.render(document.getElementById('main-content-area'));
                Utils.showToast('Smartbadge removido!');
            }
        }
    },
    
    filter() {
        const termo = document.getElementById('smartbadges-search').value.toLowerCase();
        const status = document.getElementById('smartbadges-status').value;
        
        const filtrados = (App.data.smartbadges || []).filter(item => {
            const matchTermo = (item.codigo || '').toLowerCase().includes(termo);
            const matchStatus = status === '' || item.situacao === status;
            return matchTermo && matchStatus;
        });
        
        document.querySelector('#smartbadges-table tbody').innerHTML = this.getTableRows(filtrados);
    }
};

window.SmartbadgesModule = SmartbadgesModule;
