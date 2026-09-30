let appData = {};
let currentExpeditionFilter = 'All';
let currentCargoFilter = 'All';
let cargoSearchQuery = '';
let currentInventoryFilter = 'All';
let inventorySearchQuery = '';
let currentPersonnelFilter = 'All';
let currentPersonnelSearch = '';
let selectedPersonnel = null;
let currentAssetFilter = 'All';
let assetSearchQuery = '';
let selectedAsset = null;
let currentEmergencyFilter = 'All';
let emergencySearchQuery = '';
let selectedEmergency = null;
let selectedExpedition = null;
let selectedCargo = null;
let selectedInventoryItem = null;

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const currentPageBreadcrumb = document.getElementById('current-page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(section => section.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');
            if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = item.textContent;
            
            if(targetId === 'cargo') renderCargo();
            if(targetId === 'inventory') renderInventory();
            if(targetId === 'personnel') renderPersonnel();
            if(targetId === 'assets') renderAssets();
            if(targetId === 'emergency') renderEmergencies();
            if(targetId === 'expedition') renderExpeditions();
        });
    });

    // -------- EXPEDITION MODAL LOGIC --------
    const expModal = document.getElementById('expedition-modal');
    document.getElementById('btn-new-expedition')?.addEventListener('click', () => { 
        if (expModal) expModal.classList.add('show'); 
    });
    const closeExpModal = () => { 
        if (expModal) expModal.classList.remove('show'); 
        document.getElementById('new-expedition-form')?.reset(); 
    };
    document.getElementById('close-modal')?.addEventListener('click', closeExpModal);
    document.getElementById('cancel-modal')?.addEventListener('click', closeExpModal);

    document.getElementById('new-expedition-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newExp = {
            name: document.getElementById('form-name').value,
            destination: document.getElementById('form-destination').value,
            priority: document.getElementById('form-priority').value,
            start_date: document.getElementById('form-start').value,
            end_date: document.getElementById('form-end').value,
            team_size: parseInt(document.getElementById('form-team').value) || 1,
            mission: document.getElementById('form-mission').value
        };

        fetch('/api/expeditions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExp)
        })
        .then(res => res.json())
        .then(exp => {
            appData.expeditions.unshift(exp);
            closeExpModal();
            renderExpeditions();
            populateDashboard(appData);
        });
    });

    // Filters Expedition
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentExpeditionFilter = e.target.getAttribute('data-filter');
            renderExpeditions();
        });
    });

    // -------- CARGO MODAL LOGIC --------
    const cargoModal = document.getElementById('cargo-modal');
    document.getElementById('btn-new-cargo')?.addEventListener('click', () => { 
        if (cargoModal) cargoModal.classList.add('show'); 
    });
    const closeCargoModal = () => { 
        if (cargoModal) cargoModal.classList.remove('show'); 
        document.getElementById('new-cargo-form')?.reset(); 
    };
    document.getElementById('close-cargo-modal')?.addEventListener('click', closeCargoModal);
    document.getElementById('cancel-cargo-modal')?.addEventListener('click', closeCargoModal);

    document.getElementById('new-cargo-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCargo = {
            name: document.getElementById('fc-name').value,
            category: document.getElementById('fc-category').value,
            weight: document.getElementById('fc-weight').value + ' kg',
            origin: document.getElementById('fc-origin').value,
            destination: document.getElementById('fc-destination').value,
            transport: document.getElementById('fc-transport').value,
            expected_arrival: document.getElementById('fc-arrival').value,
            priority: document.getElementById('fc-priority').value
        };

        fetch('/api/cargo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCargo)
        })
        .then(res => res.json())
        .then(c => {
            appData.cargo.unshift(c);
            closeCargoModal();
            renderCargo();
            populateDashboard(appData);
        });
    });

    // Filters & Search Cargo
    document.querySelectorAll('.filter-btn-cargo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn-cargo').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCargoFilter = e.target.getAttribute('data-filter');
            renderCargo();
        });
    });

    document.getElementById('cargo-search')?.addEventListener('input', (e) => {
        cargoSearchQuery = e.target.value.toLowerCase();
        renderCargo();
    });

    // -------- INVENTORY MODAL LOGIC --------
    const invModal = document.getElementById('inventory-modal');
    document.getElementById('btn-update-stock')?.addEventListener('click', () => { 
        populateInventorySelect();
        if (invModal) invModal.classList.add('show'); 
    });
    const closeInvModal = () => { 
        if (invModal) invModal.classList.remove('show'); 
        document.getElementById('update-inventory-form')?.reset(); 
    };
    document.getElementById('close-inv-modal')?.addEventListener('click', closeInvModal);
    document.getElementById('cancel-inv-modal')?.addEventListener('click', closeInvModal);

    document.getElementById('update-inventory-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemId = document.getElementById('fi-item').value;
        const addQty = document.getElementById('fi-add').value;
        const consumeQty = document.getElementById('fi-consume').value;
        
        fetch(`/api/inventory/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ add_quantity: addQty, record_consumption: consumeQty })
        })
        .then(res => res.json())
        .then(updatedItem => {
            const index = appData.inventory.findIndex(i => i.id === updatedItem.id);
            if(index !== -1) appData.inventory[index] = updatedItem;
            closeInvModal();
            processInventoryData();
            renderInventory();
            populateDashboard(appData);
        });
    });

    // Filters & Search Inventory
    document.querySelectorAll('.filter-btn-inv').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn-inv').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentInventoryFilter = e.target.getAttribute('data-filter');
            renderInventory();
        });
    });

    document.getElementById('inventory-search')?.addEventListener('input', (e) => {
        inventorySearchQuery = e.target.value.toLowerCase();
        renderInventory();
    });

    // -------- PERSONNEL EVENT LISTENERS --------
    document.querySelectorAll('.filter-btn-personnel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn-personnel').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentPersonnelFilter = e.target.getAttribute('data-filter');
            renderPersonnel();
        });
    });

    document.getElementById('personnel-search')?.addEventListener('input', (e) => {
        currentPersonnelSearch = e.target.value.toLowerCase();
        renderPersonnel();
    });
    
    // Add Personnel Modal
    const addPModal = document.getElementById('personnel-modal');
    document.getElementById('btn-add-personnel')?.addEventListener('click', () => {
        if(addPModal) addPModal.classList.add('show');
    });
    document.getElementById('close-p-modal')?.addEventListener('click', () => {
        if(addPModal) addPModal.classList.remove('show');
    });
    document.getElementById('cancel-p-modal')?.addEventListener('click', () => {
        if(addPModal) addPModal.classList.remove('show');
    });
    
    document.getElementById('new-personnel-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const loc = document.getElementById('fp-location').value;
        const payload = {
            name: document.getElementById('fp-name').value,
            role: document.getElementById('fp-role').value,
            team: document.getElementById('fp-team').value,
            current_location: loc,
            destination: document.getElementById('fp-destination').value,
            deployment_date: document.getElementById('fp-deployment').value,
            return_date: document.getElementById('fp-return').value,
            movement_status: loc.includes('Station') || loc.includes('Camp') ? 'Antarctica' : (loc === 'Goa' || loc === 'Home Base' ? 'At Base' : 'Travelling'),
            stage: loc.includes('Station') || loc.includes('Camp') ? 3 : (loc === 'Goa' || loc === 'Home Base' ? 1 : 2)
        };
        fetch('/api/personnel', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(newPerson => {
            appData.personnel.unshift(newPerson);
            if(addPModal) addPModal.classList.remove('show');
            e.target.reset();
            processPersonnelData();
            renderPersonnel();
            populateDashboard(appData);
        })
        .catch(err => console.error(err));
    });

    // Update Location Modal
    const updateLocModal = document.getElementById('location-modal');
    document.getElementById('btn-update-location')?.addEventListener('click', () => {
        if (!selectedPersonnel) return;
        document.getElementById('ul-id').value = selectedPersonnel.id;
        document.getElementById('ul-location').value = selectedPersonnel.current_location;
        document.getElementById('ul-status').value = selectedPersonnel.movement_status;
        document.getElementById('ul-emergency').value = selectedPersonnel.emergency_status || 'Normal';
        if(updateLocModal) updateLocModal.classList.add('show');
    });
    document.getElementById('close-loc-modal')?.addEventListener('click', () => {
        if(updateLocModal) updateLocModal.classList.remove('show');
    });
    document.getElementById('cancel-loc-modal')?.addEventListener('click', () => {
        if(updateLocModal) updateLocModal.classList.remove('show');
    });
    
    document.getElementById('update-location-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pid = document.getElementById('ul-id').value;
        const payload = {
            current_location: document.getElementById('ul-location').value,
            movement_status: document.getElementById('ul-status').value,
            emergency_status: document.getElementById('ul-emergency').value
        };
        
        let stage = 2;
        if(payload.movement_status === 'At Base') stage = 1;
        if(payload.movement_status === 'Antarctica') stage = 3;
        payload.stage = stage;

        fetch(`/api/personnel/${pid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(updatedPerson => {
            if(updateLocModal) updateLocModal.classList.remove('show');
            
            const index = appData.personnel.findIndex(p => p.id === pid);
            if(index !== -1) {
                appData.personnel[index] = updatedPerson;
                if(selectedPersonnel && selectedPersonnel.id === pid) {
                    selectedPersonnel = updatedPerson;
                }
            }
            processPersonnelData();
            renderPersonnel();
            populateDashboard(appData);
        })
        .catch(err => console.error(err));
    });

    // -------- ASSET EVENT LISTENERS --------
    document.querySelectorAll('.filter-btn-asset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn-asset').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentAssetFilter = e.target.getAttribute('data-filter');
            renderAssets();
        });
    });

    document.getElementById('asset-search')?.addEventListener('input', (e) => {
        assetSearchQuery = e.target.value.toLowerCase();
        renderAssets();
    });

    const assetModal = document.getElementById('asset-modal');
    document.getElementById('btn-update-asset')?.addEventListener('click', () => {
        if (!selectedAsset) return;
        document.getElementById('ua-id').value = selectedAsset.id;
        document.getElementById('ua-location').value = selectedAsset.location;
        document.getElementById('ua-condition').value = selectedAsset.condition;
        document.getElementById('ua-status').value = selectedAsset.operational_status;
        document.getElementById('ua-usage').value = selectedAsset.usage_hours || 0;
        document.getElementById('ua-last-maint').value = selectedAsset.last_maintenance;
        document.getElementById('ua-next-maint').value = selectedAsset.next_maintenance;
        if (assetModal) assetModal.classList.add('show');
    });

    document.getElementById('close-asset-modal')?.addEventListener('click', () => {
        if (assetModal) assetModal.classList.remove('show');
    });
    document.getElementById('cancel-asset-modal')?.addEventListener('click', () => {
        if (assetModal) assetModal.classList.remove('show');
    });

    document.getElementById('update-asset-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const aid = document.getElementById('ua-id').value;
        const payload = {
            location: document.getElementById('ua-location').value,
            condition: document.getElementById('ua-condition').value,
            status: document.getElementById('ua-status').value,
            usage_hours: parseInt(document.getElementById('ua-usage').value) || 0,
            last_maintenance: document.getElementById('ua-last-maint').value,
            next_maintenance: document.getElementById('ua-next-maint').value
        };

        fetch(`/api/assets/${aid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(updatedAsset => {
            if (assetModal) assetModal.classList.remove('show');
            const index = appData.assets.findIndex(a => a.id === aid);
            if (index !== -1) {
                appData.assets[index] = updatedAsset;
                if (selectedAsset && selectedAsset.id === aid) {
                    selectedAsset = updatedAsset;
                }
            }
            renderAssets();
            populateDashboard(appData);
        })
        .catch(err => console.error(err));
    });

    // -------- EMERGENCY EVENT LISTENERS --------
    document.querySelectorAll('.filter-btn-em').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn-em').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentEmergencyFilter = e.target.getAttribute('data-filter');
            renderEmergencies();
        });
    });

    document.getElementById('emergency-search')?.addEventListener('input', (e) => {
        emergencySearchQuery = e.target.value.toLowerCase();
        renderEmergencies();
    });

    const reportEmModal = document.getElementById('report-em-modal');
    document.getElementById('btn-report-emergency')?.addEventListener('click', () => {
        if (reportEmModal) reportEmModal.classList.add('show');
    });

    document.getElementById('close-em-modal')?.addEventListener('click', () => {
        if (reportEmModal) reportEmModal.classList.remove('show');
    });
    document.getElementById('cancel-em-modal')?.addEventListener('click', () => {
        if (reportEmModal) reportEmModal.classList.remove('show');
    });

    document.getElementById('report-em-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
            type: document.getElementById('fem-type').value,
            severity: document.getElementById('fem-severity').value,
            location: document.getElementById('fem-location').value,
            reporter: document.getElementById('fem-reporter').value,
            people_affected: document.getElementById('fem-people').value,
            assigned_team: document.getElementById('fem-team').value || 'Pending',
            available_asset: document.getElementById('fem-asset').value || 'None',
            description: document.getElementById('fem-desc').value,
            timestamp: new Date().toLocaleString()
        };

        fetch('/api/emergencies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(newEm => {
            appData.emergencies.unshift(newEm);
            if (reportEmModal) reportEmModal.classList.remove('show');
            e.target.reset();
            renderEmergencies();
            populateDashboard(appData);
        })
        .catch(err => console.error(err));
    });

    const updateEmModal = document.getElementById('update-em-modal');
    document.getElementById('btn-update-emergency')?.addEventListener('click', () => {
        if (!selectedEmergency) return;
        document.getElementById('uem-id').value = selectedEmergency.id;
        document.getElementById('uem-status').value = selectedEmergency.status;
        document.getElementById('uem-team').value = selectedEmergency.assigned_team || '';
        document.getElementById('uem-asset').value = selectedEmergency.available_asset || '';
        if (updateEmModal) updateEmModal.classList.add('show');
    });

    document.getElementById('close-update-em-modal')?.addEventListener('click', () => {
        if (updateEmModal) updateEmModal.classList.remove('show');
    });
    document.getElementById('cancel-update-em-modal')?.addEventListener('click', () => {
        if (updateEmModal) updateEmModal.classList.remove('show');
    });

    document.getElementById('update-em-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const eid = document.getElementById('uem-id').value;
        const payload = {
            status: document.getElementById('uem-status').value,
            assigned_team: document.getElementById('uem-team').value,
            available_asset: document.getElementById('uem-asset').value
        };
        
        fetch(`/api/emergencies/${eid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(updatedEm => {
            const index = appData.emergencies.findIndex(ev => ev.id === eid);
            if (index !== -1) {
                appData.emergencies[index] = updatedEm;
                selectedEmergency = updatedEm;
            }
            if (updateEmModal) updateEmModal.classList.remove('show');
            renderEmergencies();
            populateDashboard(appData);
        })
        .catch(err => console.error(err));
    });

    // -------- FETCH INITIAL DATA --------
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            appData = data;
            processInventoryData();
            processPersonnelData();
            
            populateDashboard(data);
            renderExpeditions();
            renderCargo();
            renderInventory();
            renderPersonnel();
            renderAssets();
            renderEmergencies();
        })
        .catch(err => {
            console.error('Failed to load data:', err);
            const actList = document.getElementById('activity-list');
            if (actList) actList.innerHTML = `<li><span style="color:red">Error loading data.</span></li>`;
        });
});

// Common Utility
function getBadgeClass(value) {
    const lower = String(value || '').toLowerCase();
    if(lower.includes('critical') || lower.includes('out of stock') || lower.includes('delayed') || lower.includes('at risk')) return 'status-critical';
    if(lower.includes('adequate') || lower.includes('healthy') || lower.includes('completed') || lower.includes('operational') || lower.includes('delivered') || lower.includes('resolved') || lower.includes('excellent')) return 'status-ok';
    if(lower.includes('maintenance') || lower.includes('planned') || lower.includes('medium') || lower.includes('low') || lower.includes('fair') || lower.includes('good') || lower.includes('poor')) return 'status-warning';
    if(lower.includes('high')) return 'status-critical';
    return 'status-neutral'; // In Transit, In Progress, etc.
}

// -------- EXPEDITION LOGIC --------
function renderExpeditions() {
    if (!appData.expeditions) return;
    
    let filtered = appData.expeditions;
    if(currentExpeditionFilter !== 'All') {
        if(currentExpeditionFilter === 'High') filtered = filtered.filter(e => e.priority === 'High' || e.priority === 'Critical');
        else filtered = filtered.filter(e => e.status === currentExpeditionFilter);
    }

    // Render Cards Grid
    const cardsGrid = document.getElementById('expedition-cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(exp => {
            const isSelected = selectedExpedition && selectedExpedition.id === exp.id;
            const card = document.createElement('div');
            card.className = `ops-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="ops-card-header">
                    <span class="ops-card-id">${exp.id}</span>
                    <span class="status-badge ${getBadgeClass(exp.priority)}">${exp.priority}</span>
                </div>
                <div class="ops-card-title">${exp.name}</div>
                <div class="ops-card-meta">📍 Destination: <strong>${exp.destination}</strong></div>
                <div class="ops-card-meta" style="font-size:0.75rem;">🗓️ ${exp.start_date} &rarr; ${exp.end_date} &bull; 👥 ${exp.team_size} pax</div>
                <div class="corridor-bar" style="margin-top: 4px;">
                    <div style="flex: 1; margin-right: 10px;">
                        <div class="progress-bar-bg" style="height: 5px;">
                            <div class="progress-bar-fill" style="width: ${exp.progress || 0}%"></div>
                        </div>
                    </div>
                    <span class="status-badge ${getBadgeClass(exp.status)}">${exp.status} (${exp.progress || 0}%)</span>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('#expedition-cards-grid .ops-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedExpedition = exp;
                showExpeditionDetails(exp);
            });
            cardsGrid.appendChild(card);
        });
    }

    // Render Table
    const tbody = document.querySelector(`#expedition-table tbody`);
    if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(exp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${exp.id}</strong></td>
                <td>${exp.name}</td>
                <td>${exp.destination}</td>
                <td>${exp.start_date} to ${exp.end_date}</td>
                <td><span class="status-badge ${getBadgeClass(exp.status)}">${exp.status}</span></td>
                <td><span class="status-badge ${getBadgeClass(exp.priority)}">${exp.priority}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#expedition-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedExpedition = exp;
                showExpeditionDetails(exp);
            });
            tbody.appendChild(tr);
        });
    }

    if (filtered.length > 0) {
        if (!selectedExpedition || !filtered.find(e => e.id === selectedExpedition.id)) {
            selectedExpedition = filtered[0];
        }
        showExpeditionDetails(selectedExpedition);
    } else {
        const detPanel = document.getElementById('expedition-details-panel');
        if (detPanel) detPanel.style.display = 'none';
    }
}

function showExpeditionDetails(exp) {
    if (!exp) return;
    const panel = document.getElementById('expedition-details-panel');
    if (panel) panel.style.display = 'block';

    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    safeSet('det-name', exp.name);
    
    const detStatus = document.getElementById('det-status');
    if (detStatus) {
        detStatus.className = `status-badge ${getBadgeClass(exp.status)}`;
        detStatus.textContent = exp.status;
    }
    
    const detPriority = document.getElementById('det-priority');
    if (detPriority) {
        detPriority.className = `status-badge ${getBadgeClass(exp.priority)}`;
        detPriority.textContent = `Priority: ${exp.priority}`;
    }
    
    const progFill = document.getElementById('det-progress');
    if (progFill) progFill.style.width = `${exp.progress || 0}%`;
    safeSet('det-progress-text', `${exp.progress || 0}%`);
    
    safeSet('det-mission', exp.mission || "Scientific resupply and operational deployment across Antarctic corridor.");
    safeSet('det-timeline', `${exp.start_date} to ${exp.end_date}`);
    safeSet('det-team', `${exp.team_size} members assigned`);
    
    const start = new Date(exp.start_date);
    const end = new Date(exp.end_date);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    safeSet('calc-duration', diffDays > 0 ? `${diffDays} days` : '35 days');
    
    let cargoReadiness = 'Pending Checks', assetReadiness = 'Pending Checks', overall = 0;
    if(exp.status === 'Completed') { cargoReadiness = '100% (Returned)'; assetReadiness = '100% (Returned)'; overall = 100; }
    else if (exp.status === 'In Progress') { cargoReadiness = '100% (Deployed)'; assetReadiness = '100% (Deployed)'; overall = 100; }
    else {
        cargoReadiness = exp.priority === 'High' ? '85% (Expedited)' : '40% (Gathering)';
        assetReadiness = exp.team_size > 10 ? 'Needs more vehicles' : 'Ready (Allocated)';
        overall = exp.priority === 'High' ? 78 : 45;
    }
    safeSet('calc-team', `${exp.team_size} members (Sufficient)`);
    safeSet('calc-cargo', cargoReadiness);
    safeSet('calc-assets', assetReadiness);
    safeSet('calc-readiness', `${overall}%`);
    const scoreElement = document.getElementById('calc-readiness');
    if (scoreElement) scoreElement.style.color = overall >= 80 ? 'var(--success)' : (overall >= 50 ? 'var(--warning)' : 'var(--danger)');
}

// -------- CARGO LOGIC --------
function renderCargo() {
    if (!appData.cargo) return;
    
    let filtered = appData.cargo;

    if(currentCargoFilter !== 'All') {
        if(currentCargoFilter === 'High') filtered = filtered.filter(c => c.priority === 'High' || c.priority === 'Critical');
        else filtered = filtered.filter(c => c.status === currentCargoFilter);
    }

    if(cargoSearchQuery) {
        filtered = filtered.filter(c => 
            c.id.toLowerCase().includes(cargoSearchQuery) || 
            c.name.toLowerCase().includes(cargoSearchQuery) ||
            c.category.toLowerCase().includes(cargoSearchQuery) ||
            c.destination.toLowerCase().includes(cargoSearchQuery)
        );
    }

    // Render Visual Shipment Cards Grid
    const cardsGrid = document.getElementById('cargo-cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(c => {
            const isSelected = selectedCargo && selectedCargo.id === c.id;
            const card = document.createElement('div');
            card.className = `ops-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="ops-card-header">
                    <div>
                        <span class="ops-card-id">${c.id}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted); margin-left:6px;">${c.category}</span>
                    </div>
                    <span class="status-badge ${getBadgeClass(c.status)}">${c.status}</span>
                </div>
                <div class="ops-card-title">${c.name}</div>
                <div class="corridor-bar">
                    <span class="corridor-node ${c.stage >= 1 ? 'active' : ''}">${c.origin}</span>
                    <span class="corridor-arrow">&rarr;</span>
                    <span class="corridor-node ${c.stage >= 3 ? 'active' : ''}">Cape Town</span>
                    <span class="corridor-arrow">&rarr;</span>
                    <span class="corridor-node ${c.stage >= 6 ? 'active' : ''}">${c.destination}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                    <span>⚖️ ${c.weight} &bull; 🚢 ${c.transport}</span>
                    <span>📍 ${c.current_location}</span>
                </div>
                <div class="progress-container" style="margin: 4px 0 0;">
                    <div class="progress-bar-bg" style="height: 5px;">
                        <div class="progress-bar-fill" style="width: ${c.progress || 0}%"></div>
                    </div>
                    <span style="font-size:0.75rem; font-weight:600; color:var(--text-primary); min-width:26px;">${c.progress || 0}%</span>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('#cargo-cards-grid .ops-card').forEach(cd => cd.classList.remove('selected'));
                card.classList.add('selected');
                selectedCargo = c;
                showCargoDetails(c);
            });
            cardsGrid.appendChild(card);
        });
    }

    // Render Detailed Table
    const tbody = document.querySelector(`#cargo-table tbody`);
    if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.id}</strong></td>
                <td><strong>${c.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${c.category}</span></td>
                <td>${c.origin} &rarr; ${c.destination}</td>
                <td>${c.current_location}</td>
                <td><span class="status-badge ${getBadgeClass(c.status)}">${c.status}</span></td>
                <td><span class="status-badge ${getBadgeClass(c.priority)}">${c.priority}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#cargo-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedCargo = c;
                showCargoDetails(c);
            });
            tbody.appendChild(tr);
        });
    }

    if(filtered.length > 0) {
        if (!selectedCargo || !filtered.find(c => c.id === selectedCargo.id)) {
            selectedCargo = filtered[0];
        }
        showCargoDetails(selectedCargo);
    } else {
        const cDet = document.getElementById('cargo-details-panel');
        if (cDet) cDet.style.display = 'none';
    }

    updateCargoStats();
}

function updateCargoStats() {
    if (!appData.cargo) return;
    const total = appData.cargo.length;
    const inTransit = appData.cargo.filter(c => c.status === 'In Transit').length;
    const delivered = appData.cargo.filter(c => c.status === 'Delivered').length;
    const delayed = appData.cargo.filter(c => c.status === 'Delayed').length;
    
    let totalWeight = 0;
    appData.cargo.forEach(c => {
        const w = parseInt(String(c.weight || '').replace(/,/g, '').replace('kg', '').trim());
        if(!isNaN(w)) totalWeight += w;
    });

    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    safeSet('stat-cargo-total', total);
    safeSet('stat-cargo-transit', inTransit);
    safeSet('stat-cargo-delivered', delivered);
    safeSet('stat-cargo-delayed', delayed);
    safeSet('stat-cargo-weight', totalWeight.toLocaleString() + ' kg');

    const delayedEl = document.getElementById('stat-cargo-delayed');
    if (delayedEl) {
        if(delayed === 0) delayedEl.classList.remove('alert');
        else delayedEl.classList.add('alert');
    }

    // Smart Alert Banner
    const delayedItems = appData.cargo.filter(c => c.status === 'Delayed');
    const alertBanner = document.getElementById('cargo-smart-alerts');
    if (alertBanner) {
        if (delayedItems.length > 0) {
            alertBanner.style.display = 'block';
            const msg = delayedItems.map(c => `<strong>${c.id}</strong> (${c.current_location})`).join(', ');
            alertBanner.innerHTML = `⚠️ <strong>Cargo Delay Detected:</strong> Please review logistics manifest for ${msg}.`;
        } else {
            alertBanner.style.display = 'none';
        }
    }
}

function showCargoDetails(c) {
    if (!c) return;
    const panel = document.getElementById('cargo-details-panel');
    if (panel) panel.style.display = 'block';

    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    safeSet('cdet-name', `${c.id} - ${c.name}`);
    
    const statusBadge = document.getElementById('cdet-status');
    if (statusBadge) {
        statusBadge.className = `status-badge ${getBadgeClass(c.status)}`;
        statusBadge.textContent = c.status;
    }
    
    const priBadge = document.getElementById('cdet-priority');
    if (priBadge) {
        priBadge.className = `status-badge ${getBadgeClass(c.priority)}`;
        priBadge.textContent = `Priority: ${c.priority}`;
    }
    
    const progFill = document.getElementById('cdet-progress');
    if (progFill) progFill.style.width = `${c.progress || 0}%`;
    safeSet('cdet-progress-text', `${c.progress || 0}%`);
    
    safeSet('cdet-category', c.category);
    safeSet('cdet-weight', c.weight);
    safeSet('cdet-transport', c.transport);
    safeSet('cdet-dispatch', c.dispatch_date || '2026-10-01');
    safeSet('cdet-arrival', c.expected_arrival || '2026-11-15');

    // Timeline Rendering
    const stages = ['Packed', 'Dispatched', 'In Transit', 'Cape Town', 'Loaded', 'Antarctica', 'Delivered'];
    const timelineEl = document.getElementById('cdet-timeline');
    if (timelineEl) {
        timelineEl.innerHTML = '';
        stages.forEach((st, idx) => {
            const li = document.createElement('li');
            li.textContent = st;
            if(idx < (c.stage || 0)) li.className = 'done';
            else if (idx === (c.stage || 0)) li.className = 'current';
            timelineEl.appendChild(li);
        });
    }

    // Visual Route Nodes
    const p1 = document.getElementById('route-p1');
    const p4 = document.getElementById('route-p4');
    if (p1) p1.textContent = c.origin;
    if (p4) p4.textContent = c.destination;

    const pts = ['route-p1', 'route-p2', 'route-p3', 'route-p4'];
    const lines = ['route-l1', 'route-l2', 'route-l3'];
    
    let routeStage = 0;
    if((c.stage || 0) >= 2) routeStage = 1;
    if((c.stage || 0) >= 4) routeStage = 2;
    if((c.stage || 0) >= 6) routeStage = 3;

    pts.forEach((p, idx) => {
        const el = document.getElementById(p);
        if (el) {
            el.className = 'route-point';
            if(idx < routeStage) el.classList.add('passed');
            if(idx === routeStage) el.classList.add('active');
        }
    });

    lines.forEach((l, idx) => {
        const el = document.getElementById(l);
        if (el) {
            el.className = 'route-line';
            if(idx < routeStage) el.classList.add('passed');
        }
    });
}

// -------- INVENTORY LOGIC --------
function processInventoryData() {
    if (!appData.inventory) return;
    appData.inventory.forEach(item => {
        if (item.daily_consumption > 0) {
            item.days_remaining = Math.floor(item.quantity / item.daily_consumption);
        } else {
            item.days_remaining = 999;
        }

        if (item.quantity <= 0) {
            item.status = 'Out of Stock';
        } else if (item.quantity <= item.min_safe_level || item.days_remaining <= 7) {
            item.status = 'Critical';
        } else if (item.quantity <= (item.min_safe_level * 1.5) || item.days_remaining <= 14) {
            item.status = 'Low';
        } else {
            item.status = 'Healthy';
        }
    });
}

function renderInventory() {
    if (!appData.inventory) return;
    
    let filtered = appData.inventory;

    if(currentInventoryFilter !== 'All') {
        filtered = filtered.filter(i => i.status === currentInventoryFilter);
    }

    if(inventorySearchQuery) {
        filtered = filtered.filter(i => 
            i.id.toLowerCase().includes(inventorySearchQuery) || 
            i.name.toLowerCase().includes(inventorySearchQuery) ||
            i.category.toLowerCase().includes(inventorySearchQuery) ||
            i.location.toLowerCase().includes(inventorySearchQuery)
        );
    }

    // Render Stock Health Cards Grid
    const cardsGrid = document.getElementById('inventory-cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(i => {
            const isSelected = selectedInventoryItem && selectedInventoryItem.id === i.id;
            const safeRatio = Math.min((i.quantity / (i.min_safe_level * 2.5)) * 100, 100);
            const daysText = i.days_remaining === 999 ? '999+ Days' : `${i.days_remaining} Days Left`;
            let barClass = 'healthy';
            if (i.status === 'Critical' || i.status === 'Out of Stock') barClass = 'critical';
            else if (i.status === 'Low') barClass = 'low';

            const card = document.createElement('div');
            card.className = `ops-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="ops-card-header">
                    <div>
                        <span class="ops-card-id">${i.id}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted); margin-left:4px;">${i.category}</span>
                    </div>
                    <span class="status-badge ${getBadgeClass(i.status)}">${i.status}</span>
                </div>
                <div class="ops-card-title">${i.name}</div>
                <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin-top:2px;">
                    ${i.quantity.toLocaleString()} ${i.unit} <span style="font-size:0.72rem; font-weight:normal; color:var(--text-muted);">(Min Safe: ${i.min_safe_level.toLocaleString()} ${i.unit})</span>
                </div>
                <div class="health-bar-container">
                    <div class="health-bar-labels">
                        <span>Stock Health</span>
                        <strong style="color:${barClass === 'critical' ? 'var(--danger)' : (barClass === 'low' ? 'var(--warning)' : 'var(--success)')}">${daysText}</strong>
                    </div>
                    <div class="health-bar-track">
                        <div class="health-bar-fill ${barClass}" style="width: ${safeRatio}%"></div>
                    </div>
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:2px;">
                    <span>📍 ${i.location}</span>
                    <span>Rate: ${i.daily_consumption} ${i.unit}/day</span>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('#inventory-cards-grid .ops-card').forEach(cd => cd.classList.remove('selected'));
                card.classList.add('selected');
                selectedInventoryItem = i;
                showInventoryDetails(i);
            });
            cardsGrid.appendChild(card);
        });
    }

    // Render Table
    const tbody = document.querySelector(`#inventory-table tbody`);
    if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(i => {
            const tr = document.createElement('tr');
            const daysText = i.days_remaining === 999 ? '999+' : i.days_remaining;
            tr.innerHTML = `
                <td><strong>${i.id}</strong></td>
                <td><strong>${i.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${i.category}</span></td>
                <td>${i.location}</td>
                <td>${i.quantity.toLocaleString()} ${i.unit}</td>
                <td>${i.daily_consumption} ${i.unit}</td>
                <td>${daysText}</td>
                <td><span class="status-badge ${getBadgeClass(i.status)}">${i.status}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#inventory-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedInventoryItem = i;
                showInventoryDetails(i);
            });
            tbody.appendChild(tr);
        });
    }

    if(filtered.length > 0) {
        if (!selectedInventoryItem || !filtered.find(i => i.id === selectedInventoryItem.id)) {
            selectedInventoryItem = filtered[0];
        }
        showInventoryDetails(selectedInventoryItem);
    } else {
        const panel = document.getElementById('inventory-details-panel');
        if (panel) panel.style.display = 'none';
    }

    updateInventoryStats();
}

function updateInventoryStats() {
    if (!appData.inventory) return;
    const totalItems = appData.inventory.length;
    let totalQty = 0;
    appData.inventory.forEach(i => totalQty += i.quantity);
    
    const critical = appData.inventory.filter(i => i.status === 'Critical' || i.status === 'Out of Stock').length;
    const low = appData.inventory.filter(i => i.status === 'Low').length;
    const requiresResupply = critical + low;
    
    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    safeSet('stat-inv-total', totalItems);
    safeSet('stat-inv-qty', totalQty.toLocaleString());
    safeSet('stat-inv-low', low);
    safeSet('stat-inv-critical', critical);
    safeSet('stat-inv-resupply', requiresResupply);

    const lowEl = document.getElementById('stat-inv-low');
    if (lowEl) { if(low === 0) lowEl.classList.remove('alert'); else lowEl.classList.add('alert'); }

    const critEl = document.getElementById('stat-inv-critical');
    if (critEl) { if(critical === 0) critEl.classList.remove('alert'); else critEl.classList.add('alert'); }

    const resupplyEl = document.getElementById('stat-inv-resupply');
    if (resupplyEl) { if(requiresResupply === 0) resupplyEl.classList.remove('alert'); else resupplyEl.classList.add('alert'); }

    // Smart Alert Prediction
    const worstItem = appData.inventory.reduce((prev, current) => {
        return (prev.days_remaining < current.days_remaining && prev.status !== 'Healthy') ? prev : current;
    }, appData.inventory[0]);

    const alertBanner = document.getElementById('inv-smart-alerts');
    if (alertBanner && worstItem && worstItem.days_remaining <= 14) {
        alertBanner.style.display = 'block';
        const msg = `${worstItem.name} may reach critical level in ${worstItem.days_remaining} days while next resupply is expected in 10 days. RISK LEVEL: ${worstItem.status.toUpperCase()}. ACTION: Expedite Resupply manifest.`;
        safeSet('inv-ai-msg', msg);
    } else if (alertBanner) {
        alertBanner.style.display = 'none';
    }
}

function showInventoryDetails(i) {
    if (!i) return;
    const panel = document.getElementById('inventory-details-panel');
    if (panel) panel.style.display = 'block';

    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    safeSet('idet-name', `${i.id} - ${i.name}`);
    
    const statusBadge = document.getElementById('idet-status');
    if (statusBadge) {
        statusBadge.className = `status-badge ${getBadgeClass(i.status)}`;
        statusBadge.textContent = i.status;
    }
    
    safeSet('idet-qty', i.quantity.toLocaleString());
    safeSet('idet-unit', i.unit);
    safeSet('idet-min', `${i.min_safe_level.toLocaleString()} ${i.unit}`);
    safeSet('idet-daily', `${i.daily_consumption.toLocaleString()} ${i.unit}`);
    safeSet('idet-recent', `${i.recent_consumption.toLocaleString()} ${i.unit}`);
    
    safeSet('idet-days', i.days_remaining === 999 ? '999+' : i.days_remaining);

    // Consumption chart
    const safeRatio = Math.min((i.quantity / (i.min_safe_level * 3)) * 100, 100);
    const bar = document.getElementById('idet-bar');
    if (bar) {
        bar.style.width = `${safeRatio}%`;
        if (i.status === 'Critical' || i.status === 'Out of Stock') bar.style.backgroundColor = 'var(--danger)';
        else if (i.status === 'Low') bar.style.backgroundColor = 'var(--warning)';
        else bar.style.backgroundColor = 'var(--success)';
    }
    
    safeSet('idet-trend-msg', `Current stock is at ${safeRatio.toFixed(1)}% of 3x strategic reserve capacity.`);
}

function populateInventorySelect() {
    const sel = document.getElementById('fi-item');
    if (!sel || !appData.inventory) return;
    sel.innerHTML = '';
    appData.inventory.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.id;
        opt.textContent = `${i.name} (${i.id})`;
        sel.appendChild(opt);
    });
}

// -------- PERSONNEL LOGIC --------
function processPersonnelData() {
    if (!appData.personnel) return;
    let total = 0, antarctica = 0, travelling = 0, atBase = 0, emergency = 0;
    let mapGoa = 0, mapCapeTown = 0, mapAntarctica = 0;
    
    appData.personnel.forEach(p => {
        total++;
        if (p.movement_status === 'Antarctica') antarctica++;
        if (p.movement_status === 'Travelling') travelling++;
        if (p.movement_status === 'At Base') atBase++;
        if (p.emergency_status && (p.emergency_status.includes('Alert') || p.emergency_status === 'Medical Evacuation')) emergency++;
        
        if (p.current_location === 'Goa' || p.current_location === 'Home Base' || (p.movement_status === 'At Base' && !p.current_location.includes('Cape') && !p.current_location.includes('Station'))) {
            mapGoa++;
        } else if (p.current_location === 'Cape Town' || p.current_location === 'Indian Ocean' || p.current_location === 'Southern Ocean') {
            mapCapeTown++;
        } else if (p.movement_status === 'Antarctica' || p.current_location.includes('Station') || p.current_location.includes('Camp')) {
            mapAntarctica++;
        }
    });

    const safeSet = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
    safeSet('stat-p-total', total);
    safeSet('stat-p-antarctica', antarctica);
    safeSet('stat-p-travel', travelling);
    safeSet('stat-p-base', atBase);
    safeSet('stat-p-emergency', emergency);
    
    safeSet('map-goa', mapGoa);
    safeSet('map-capetown', mapCapeTown);
    safeSet('map-antarctica', mapAntarctica);
    
    const emEl = document.getElementById('stat-p-emergency');
    if (emEl) {
        if(emergency > 0) emEl.classList.add('alert');
        else emEl.classList.remove('alert');
    }
}

function renderPersonnel() {
    if (!appData.personnel) return;
    
    const term = (currentPersonnelSearch || '').toLowerCase();
    let filtered = appData.personnel;

    if (currentPersonnelFilter !== 'All') {
        if (currentPersonnelFilter === 'Emergency') {
            filtered = filtered.filter(p => p.emergency_status !== 'Normal');
        } else {
            filtered = filtered.filter(p => p.movement_status === currentPersonnelFilter);
        }
    }
    
    if (term) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.id.toLowerCase().includes(term) || 
            p.role.toLowerCase().includes(term) ||
            p.current_location.toLowerCase().includes(term) ||
            p.team.toLowerCase().includes(term)
        );
    }

    // Render Personnel Roster Cards
    const cardsGrid = document.getElementById('personnel-cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(p => {
            const isSelected = selectedPersonnel && selectedPersonnel.id === p.id;
            const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const isEmergency = p.emergency_status !== 'Normal';

            const card = document.createElement('div');
            card.className = `ops-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="person-card">
                    <div class="person-avatar">${initials}</div>
                    <div class="person-info">
                        <div class="ops-card-header">
                            <span class="ops-card-id">${p.id}</span>
                            <span class="status-badge ${getBadgeClass(p.movement_status)}">${p.movement_status}</span>
                        </div>
                        <div class="ops-card-title">${p.name}</div>
                        <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:500;">${p.role} &bull; ${p.team}</div>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted); margin-top:4px; padding-top:6px; border-top:1px solid var(--border-subtle);">
                    <span>📍 ${p.current_location} &rarr; ${p.destination}</span>
                    <span class="status-badge" style="background:${isEmergency ? 'var(--danger-bg)' : '#F1F5F9'}; color:${isEmergency ? 'var(--danger-text)' : 'var(--text-secondary)'};">${p.emergency_status}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('#personnel-cards-grid .ops-card').forEach(cd => cd.classList.remove('selected'));
                card.classList.add('selected');
                selectedPersonnel = p;
                showPersonnelDetails();
            });
            cardsGrid.appendChild(card);
        });
    }

    // Render Table
    const tbody = document.querySelector('#personnel-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(p => {
            const isEmergency = p.emergency_status !== 'Normal';
            const tr = document.createElement('tr');
            if (selectedPersonnel && selectedPersonnel.id === p.id) {
                tr.classList.add('selected');
            }
            tr.innerHTML = `
                <td><strong>${p.id}</strong><br>${p.name}</td>
                <td><strong>${p.role}</strong><br><small style="color: var(--text-muted);">${p.team}</small></td>
                <td>${p.current_location} <br><small>&rarr; ${p.destination}</small></td>
                <td><span class="status-badge ${getBadgeClass(p.movement_status)}">${p.movement_status}</span></td>
                <td><span class="status-badge" style="background: ${isEmergency ? 'var(--danger-bg)' : '#F1F5F9'}; color: ${isEmergency ? 'var(--danger-text)' : 'var(--text-secondary)'}">${p.emergency_status}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#personnel-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedPersonnel = p;
                showPersonnelDetails();
            });
            tbody.appendChild(tr);
        });
    }
    
    if(filtered.length > 0) {
        if (!selectedPersonnel || !filtered.find(p => p.id === selectedPersonnel.id)) {
            selectedPersonnel = filtered[0];
        }
        showPersonnelDetails();
    } else {
        const pDet = document.getElementById('personnel-details-panel');
        if (pDet) pDet.style.display = 'none';
    }

    processPersonnelData();
}

function showPersonnelDetails() {
    if (!selectedPersonnel) return;
    const p = selectedPersonnel;
    const pDet = document.getElementById('personnel-details-panel');
    if(pDet) pDet.style.display = 'block';
    
    const safeSet = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
    
    safeSet('pdet-name', `${p.id} - ${p.name}`);
    
    const statusBadge = document.getElementById('pdet-status');
    if (statusBadge) {
        statusBadge.textContent = p.movement_status;
        statusBadge.className = `status-badge ${getBadgeClass(p.movement_status)}`;
    }
    
    const emBadge = document.getElementById('pdet-emergency');
    if (emBadge) {
        emBadge.textContent = p.emergency_status;
        const isEmergency = p.emergency_status !== 'Normal';
        emBadge.className = `status-badge ${isEmergency ? 'status-critical' : 'status-pending'}`;
    }

    safeSet('pdet-role', p.role);
    safeSet('pdet-team', p.team);
    safeSet('pdet-location', p.current_location);
    safeSet('pdet-destination', p.destination);
    safeSet('pdet-deployment', p.deployment_date);
    safeSet('pdet-return', p.return_date);
    
    let stage = p.stage || 1;
    if (p.movement_status === 'At Base') stage = 1;
    else if (p.movement_status === 'Travelling') stage = 2;
    else if (p.movement_status === 'Antarctica') stage = 3;
    
    const p1 = document.getElementById('pr-route-p1');
    const p2 = document.getElementById('pr-route-p2');
    const p3 = document.getElementById('pr-route-p3');
    const l1 = document.getElementById('pr-route-l1');
    const l2 = document.getElementById('pr-route-l2');
    
    if(p1 && p2 && p3 && l1 && l2) {
        [p1, p2, p3, l1, l2].forEach(el => el.classList.remove('active', 'passed'));
        
        if (stage >= 1) p1.classList.add('active');
        if (stage >= 2) {
            p1.classList.remove('active');
            p1.classList.add('passed');
            l1.classList.add('passed');
            p2.classList.add('active');
        }
        if (stage >= 3) {
            p2.classList.remove('active');
            p2.classList.add('passed');
            l2.classList.add('passed');
            p3.classList.add('active');
        }
    }
}

// -------- ASSET LOGIC --------
function renderAssets() {
    if (!appData.assets) return;
    
    let filtered = appData.assets;
    if (currentAssetFilter !== 'All') {
        filtered = filtered.filter(a => a.operational_status === currentAssetFilter);
    }
    
    if (assetSearchQuery) {
        filtered = filtered.filter(a => 
            a.id.toLowerCase().includes(assetSearchQuery) || 
            a.name.toLowerCase().includes(assetSearchQuery) || 
            a.type.toLowerCase().includes(assetSearchQuery) ||
            a.location.toLowerCase().includes(assetSearchQuery)
        );
    }

    // Render Fleet Asset Cards Grid
    const cardsGrid = document.getElementById('asset-cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(a => {
            const isSelected = selectedAsset && selectedAsset.id === a.id;
            const usagePct = Math.min(((a.usage_hours || 0) / 10000) * 100, 100);

            const card = document.createElement('div');
            card.className = `ops-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="ops-card-header">
                    <div>
                        <span class="ops-card-id">${a.id}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted); margin-left:4px;">${a.type}</span>
                    </div>
                    <span class="status-badge ${getBadgeClass(a.operational_status)}">${a.operational_status}</span>
                </div>
                <div class="ops-card-title">${a.name}</div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                    <span>Condition: <strong class="status-badge ${getBadgeClass(a.condition)}" style="padding:1px 4px; font-size:0.7rem;">${a.condition}</strong></span>
                    <span>📍 ${a.location}</span>
                </div>
                <div class="health-bar-container" style="margin-top:4px;">
                    <div class="health-bar-labels">
                        <span>Engine / Service Hours</span>
                        <strong>${(a.usage_hours || 0).toLocaleString()} hrs</strong>
                    </div>
                    <div class="health-bar-track">
                        <div class="health-bar-fill" style="width: ${usagePct}%"></div>
                    </div>
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:2px;">
                    <span>Mission: ${a.assigned_expedition || 'Standby'}</span>
                    <span class="status-badge ${a.risk_level === 'High' ? 'status-critical' : (a.risk_level === 'Medium' ? 'status-warning' : 'status-ok')}" style="padding:1px 4px;">${a.risk_level} Risk</span>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('#asset-cards-grid .ops-card').forEach(cd => cd.classList.remove('selected'));
                card.classList.add('selected');
                selectedAsset = a;
                showAssetDetails();
            });
            cardsGrid.appendChild(card);
        });
    }

    // Render Table
    const tbody = document.querySelector('#asset-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(a => {
            const tr = document.createElement('tr');
            if (selectedAsset && selectedAsset.id === a.id) {
                tr.classList.add('selected');
            }
            tr.innerHTML = `
                <td><strong>${a.id}</strong></td>
                <td><strong>${a.name}</strong><br><small style="color: var(--text-muted);">${a.type}</small></td>
                <td>${a.location}</td>
                <td>${a.assigned_expedition || 'Unassigned'}</td>
                <td><span class="status-badge ${getBadgeClass(a.condition)}">${a.condition}</span></td>
                <td><span class="status-badge ${getBadgeClass(a.operational_status)}">${a.operational_status}</span></td>
                <td>${(a.usage_hours || 0).toLocaleString()} hrs</td>
                <td><small>Last: ${a.last_maintenance}</small><br><small>Next: ${a.next_maintenance}</small></td>
                <td><span class="status-badge ${a.risk_level === 'High' ? 'status-critical' : (a.risk_level === 'Medium' ? 'status-warning' : 'status-ok')}">${a.risk_level}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#asset-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedAsset = a;
                showAssetDetails();
            });
            tbody.appendChild(tr);
        });
    }
    
    if (filtered.length > 0) {
        if (!selectedAsset || !filtered.find(a => a.id === selectedAsset.id)) {
            selectedAsset = filtered[0];
        }
        showAssetDetails();
    } else {
        const aDet = document.getElementById('asset-details-panel');
        if (aDet) aDet.style.display = 'none';
    }
    
    updateAssetStats();
}

function updateAssetStats() {
    if (!appData.assets) return;
    const total = appData.assets.length;
    const op = appData.assets.filter(a => a.operational_status === 'Operational').length;
    const maint = appData.assets.filter(a => a.operational_status === 'Maintenance Due').length;
    const risk = appData.assets.filter(a => a.operational_status === 'At Risk' || a.risk_level === 'High').length;
    const out = appData.assets.filter(a => a.operational_status === 'Out of Service').length;
    
    const safeSet = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
    safeSet('stat-asset-total', total);
    safeSet('stat-asset-op', op);
    safeSet('stat-asset-maint', maint);
    safeSet('stat-asset-risk', risk);
    safeSet('stat-asset-out', out);
    
    const readiness = total > 0 ? Math.round((op / total) * 100) : 0;
    safeSet('stat-asset-readiness', `${readiness}%`);
    
    const riskEl = document.getElementById('stat-asset-risk');
    if (riskEl) {
        if (risk > 0) riskEl.classList.add('alert');
        else riskEl.classList.remove('alert');
    }
}

function showAssetDetails() {
    if (!selectedAsset) return;
    const a = selectedAsset;
    
    const aDet = document.getElementById('asset-details-panel');
    if (aDet) aDet.style.display = 'block';
    
    const safeSet = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
    
    safeSet('adet-name', `${a.id} - ${a.name}`);
    
    const statusBadge = document.getElementById('adet-status');
    if (statusBadge) {
        statusBadge.textContent = a.operational_status;
        statusBadge.className = `status-badge ${getBadgeClass(a.operational_status)}`;
    }
    
    const conditionBadge = document.getElementById('adet-condition');
    if (conditionBadge) {
        conditionBadge.textContent = a.condition;
        conditionBadge.className = `status-badge ${getBadgeClass(a.condition)}`;
    }
    
    safeSet('adet-location', a.location);
    safeSet('adet-type', a.type);
    safeSet('adet-expedition', a.assigned_expedition || 'None');
    safeSet('adet-team', a.assigned_team || 'Unassigned');
    safeSet('adet-last-maint', a.last_maintenance);
    safeSet('adet-next-maint', a.next_maintenance);
    
    const maxHours = 10000;
    const usage = a.usage_hours || 0;
    const usagePct = Math.min((usage / maxHours) * 100, 100);
    safeSet('adet-usage-text', `${usage.toLocaleString()} / ${maxHours.toLocaleString()} hrs`);
    const bar = document.getElementById('adet-usage-bar');
    if (bar) bar.style.width = `${usagePct}%`;
    
    const riskBanner = document.getElementById('adet-risk-banner');
    if (riskBanner) {
        if (a.operational_status === 'At Risk' || a.operational_status === 'Out of Service' || a.risk_level === 'High') {
            riskBanner.style.display = 'block';
            safeSet('adet-risk-reason', `Asset condition is ${a.condition} with status: ${a.operational_status}`);
            safeSet('adet-risk-action', 'Schedule immediate maintenance and reassign expedition tasks if necessary.');
        } else {
            riskBanner.style.display = 'none';
        }
    }
}

// -------- EMERGENCY LOGIC --------
function renderEmergencies() {
    if (!appData.emergencies) return;
    
    let filtered = appData.emergencies;
    if (currentEmergencyFilter !== 'All') {
        if (currentEmergencyFilter === 'Active') {
            filtered = filtered.filter(e => e.status !== 'Resolved');
        } else {
            filtered = filtered.filter(e => e.status === currentEmergencyFilter || e.severity === currentEmergencyFilter);
        }
    }
    
    if (emergencySearchQuery) {
        filtered = filtered.filter(e => 
            e.id.toLowerCase().includes(emergencySearchQuery) || 
            e.type.toLowerCase().includes(emergencySearchQuery) || 
            e.location.toLowerCase().includes(emergencySearchQuery)
        );
    }

    // Render Incident Command Cards Grid
    const cardsGrid = document.getElementById('emergency-cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(em => {
            const isSelected = selectedEmergency && selectedEmergency.id === em.id;
            const card = document.createElement('div');
            card.className = `ops-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="ops-card-header">
                    <div>
                        <span class="ops-card-id">${em.id}</span>
                        <span class="status-badge ${em.severity === 'Critical' ? 'status-critical' : (em.severity === 'High' ? 'status-critical' : 'status-warning')}" style="margin-left:4px;">${em.severity} Severity</span>
                    </div>
                    <span class="status-badge ${em.status === 'Resolved' ? 'status-ok' : 'status-warning'}">${em.status}</span>
                </div>
                <div class="ops-card-title">${em.type}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                    📍 <strong>${em.location}</strong> &bull; ⏱️ ${em.timestamp}
                </div>
                <p style="font-size:0.78rem; color:var(--text-muted); margin:4px 0 0; line-height:1.4;">${em.description}</p>
                <div style="font-size:0.72rem; color:var(--text-secondary); display:flex; justify-content:space-between; margin-top:4px; padding-top:6px; border-top:1px solid var(--border-subtle);">
                    <span>👥 ${em.people_affected || 0} Affected</span>
                    <span>Team: ${em.assigned_team || 'Pending'}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('#emergency-cards-grid .ops-card').forEach(cd => cd.classList.remove('selected'));
                card.classList.add('selected');
                selectedEmergency = em;
                showEmergencyDetails();
            });
            cardsGrid.appendChild(card);
        });
    }

    // Render Table
    const tbody = document.querySelector('#emergency-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(em => {
            const tr = document.createElement('tr');
            if (selectedEmergency && selectedEmergency.id === em.id) {
                tr.classList.add('selected');
            }
            tr.innerHTML = `
                <td><strong>${em.id}</strong></td>
                <td><strong>${em.type}</strong><br><small style="color: var(--text-muted);">${em.location}</small></td>
                <td>${em.timestamp}</td>
                <td>${em.people_affected || 0}</td>
                <td>${em.assigned_team || 'Pending'}</td>
                <td>${em.available_asset || 'None'}</td>
                <td><span class="status-badge ${em.severity === 'Critical' ? 'status-critical' : (em.severity === 'High' ? 'status-critical' : 'status-warning')}">${em.severity}</span></td>
                <td><span class="status-badge ${em.status === 'Resolved' ? 'status-ok' : 'status-warning'}">${em.status}</span></td>
            `;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#emergency-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedEmergency = em;
                showEmergencyDetails();
            });
            tbody.appendChild(tr);
        });
    }
    
    if (filtered.length > 0) {
        if (!selectedEmergency || !filtered.find(e => e.id === selectedEmergency.id)) {
            selectedEmergency = filtered[0];
        }
        showEmergencyDetails();
    } else {
        const eDet = document.getElementById('emergency-details-panel');
        if (eDet) eDet.style.display = 'none';
    }
    
    updateEmergencyStats();
}

function updateEmergencyStats() {
    if (!appData.emergencies) return;
    const activeEms = appData.emergencies.filter(e => e.status !== 'Resolved');
    const active = activeEms.length;
    const high = activeEms.filter(e => e.severity === 'High' || e.severity === 'Critical').length;
    const people = activeEms.reduce((sum, e) => sum + (parseInt(e.people_affected) || 0), 0);
    const resolved = appData.emergencies.filter(e => e.status === 'Resolved').length;
    
    const safeSet = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
    safeSet('stat-em-active', active);
    safeSet('stat-em-high', high);
    safeSet('stat-em-people', people);
    safeSet('stat-em-resolved', resolved);
    
    const activeEl = document.getElementById('stat-em-active');
    if (activeEl) {
        if (active > 0) activeEl.classList.add('alert');
        else activeEl.classList.remove('alert');
    }
    
    const banner = document.getElementById('emergency-smart-alerts');
    const bannerMsg = document.getElementById('emergency-ai-msg');
    if (banner && bannerMsg) {
        if (high > 0) {
            banner.style.display = 'block';
            bannerMsg.innerHTML = `⚠️ <strong>CRITICAL INCIDENT ALERT:</strong> ${high} High/Critical severity emergencies active in Antarctica. Command response teams dispatched.`;
        } else {
            banner.style.display = 'none';
        }
    }
}

function showEmergencyDetails() {
    if (!selectedEmergency) return;
    const em = selectedEmergency;
    
    const eDet = document.getElementById('emergency-details-panel');
    if (eDet) eDet.style.display = 'block';
    
    const safeSet = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
    
    safeSet('emdet-name', `${em.id} - ${em.type}`);
    
    const statusBadge = document.getElementById('emdet-status');
    if (statusBadge) {
        statusBadge.textContent = em.status;
        statusBadge.className = `status-badge ${em.status === 'Resolved' ? 'status-ok' : 'status-warning'}`;
    }
    
    const sevBadge = document.getElementById('emdet-severity');
    if (sevBadge) {
        sevBadge.textContent = em.severity;
        sevBadge.className = `status-badge ${em.severity === 'Critical' ? 'status-critical' : (em.severity === 'High' ? 'status-critical' : 'status-warning')}`;
    }
    
    safeSet('emdet-desc', em.description);
    safeSet('emdet-location', em.location);
    safeSet('emdet-reporter', em.reporter);
    safeSet('emdet-time', em.timestamp);
    safeSet('emdet-people', em.people_affected || 0);
    safeSet('emdet-team', em.assigned_team || 'Pending');
    safeSet('emdet-asset', em.available_asset || 'None');
    
    // Smart recommendation
    let recTeam = 'General Station Support Team';
    let recAsset = 'Standard Field Transport';
    let recPriority = 'Normal Priority';
    let recReason = 'Standard response protocol.';
    
    if (em.severity === 'Critical' || em.severity === 'High') {
        recPriority = 'Highest Priority';
        if (em.type === 'Medical Emergency') {
            recTeam = 'Medical Evac Team Alpha';
            recAsset = 'Snowcat SC-102 (Med-Equipped)';
            recReason = 'Severe medical situation requires immediate specialized evacuation to Bharati hospital bay.';
        } else if (em.type === 'Extreme Weather') {
            recTeam = 'Station Command';
            recAsset = 'None (Station Lockdown)';
            recReason = 'Extreme blizzard prevents safe exterior deployment. Secure all external assets.';
        } else {
            recTeam = 'Rapid Technical Response Team';
            recAsset = 'Heavy Icebreaker Support Snowcat';
            recReason = 'High severity infrastructure failure requires emergency engineering support.';
        }
    }
    
    safeSet('emdet-rec-team', recTeam);
    safeSet('emdet-rec-asset', recAsset);
    safeSet('emdet-rec-reason', recReason);
    safeSet('emdet-rec-priority', recPriority);
    
    // Timeline update
    const steps = ['Reported', 'Assessed', 'Team Dispatched', 'Responding', 'Resolved'];
    let currentIdx = steps.indexOf(em.status);
    if (currentIdx === -1) currentIdx = 0;
    
    steps.forEach((step, idx) => {
        const stepId = step.toLowerCase().replace(/\s+/g, '-');
        const el = document.getElementById(`timeline-${stepId}`);
        if (el) {
            if (idx < currentIdx) {
                el.style.color = 'var(--success)';
                el.style.fontWeight = '700';
            } else if (idx === currentIdx) {
                el.style.color = 'var(--brand-primary)';
                el.style.fontWeight = '700';
            } else {
                el.style.color = 'var(--text-muted)';
                el.style.fontWeight = '500';
            }
        }
    });
}

// -------- DASHBOARD POPULATION & SMART ANALYSIS --------
function populateDashboard(data) {
    if (!data) return;
    const safeSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    safeSet('dash-exp-count', data.expeditions.filter(e => e.status === 'In Progress').length);
    safeSet('dash-cargo-transit', data.cargo.filter(c => c.status === 'In Transit').length);

    const criticalInv = data.inventory.filter(i => i.status === 'Critical' || i.status === 'Low').length;
    const invEl = document.getElementById('dash-inv-alert');
    if (invEl) {
        invEl.textContent = criticalInv;
        if(criticalInv === 0) invEl.classList.remove('alert');
        else invEl.classList.add('alert');
    }
    
    safeSet('dash-personnel-ant', data.personnel.filter(p => p.current_location.includes('Antarctica') || p.current_location.includes('Station')).length);
    safeSet('dash-asset-op', data.assets.filter(a => a.operational_status === 'Operational').length);

    const activeEm = data.emergencies ? data.emergencies.filter(e => e.status !== 'Resolved').length : 0;
    const emEl = document.getElementById('dash-em-active');
    if (emEl) {
        emEl.textContent = activeEm;
        if(activeEm === 0) emEl.classList.remove('alert');
        else emEl.classList.add('alert');
    }

    // Active Expedition Overview Card
    const activeExp = data.expeditions.find(e => e.status === 'In Progress') || data.expeditions[0];
    const expOverview = document.getElementById('dash-exp-overview');
    if (expOverview && activeExp) {
        expOverview.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:var(--text-primary); font-size:0.92rem;">${activeExp.name} (${activeExp.id})</strong>
                <span class="status-badge ${getBadgeClass(activeExp.status)}">${activeExp.status}</span>
            </div>
            <div>📍 Destination: <strong>${activeExp.destination}</strong> &bull; 👥 Team Size: <strong>${activeExp.team_size} members</strong></div>
            <div>🎯 Mission: ${activeExp.mission}</div>
            <div class="progress-container" style="margin: 6px 0 0;">
                <div class="progress-bar-bg" style="height: 5px;">
                    <div class="progress-bar-fill" style="width: ${activeExp.progress || 0}%"></div>
                </div>
                <span style="font-size:0.75rem; font-weight:600; color:var(--text-primary); min-width:26px;">${activeExp.progress || 0}%</span>
            </div>
        `;
    }

    // Polar Logistics Corridor Counts
    const cargoGoa = data.cargo.filter(c => c.current_location.includes('Goa')).length;
    const paxGoa = data.personnel.filter(p => p.current_location.includes('Goa')).length;
    safeSet('route-goa', `Cargo: ${cargoGoa} | Pax: ${paxGoa}`);

    const cargoCpt = data.cargo.filter(c => c.current_location.includes('Cape Town')).length;
    const paxCpt = data.personnel.filter(p => p.current_location.includes('Cape Town')).length;
    safeSet('route-cpt', `Cargo: ${cargoCpt} | Pax: ${paxCpt}`);

    const cargoAnt = data.cargo.filter(c => c.current_location.includes('Antarctica') || c.current_location.includes('Station')).length;
    const paxAnt = data.personnel.filter(p => p.current_location.includes('Antarctica') || p.current_location.includes('Station')).length;
    safeSet('route-ant', `Cargo: ${cargoAnt} | Pax: ${paxAnt}`);

    // Recent Activity Feed
    const activityList = document.getElementById('activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        
        const recentCargo = data.cargo.find(c => c.status === 'In Transit');
        if(recentCargo) activityList.innerHTML += `<li style="padding:6px 0; border-bottom:1px solid var(--border-subtle);">📦 Cargo <strong>${recentCargo.id}</strong> in transit to ${recentCargo.destination}.</li>`;
        
        const recentPax = data.personnel.find(p => p.current_location.includes('Station'));
        if(recentPax) activityList.innerHTML += `<li style="padding:6px 0; border-bottom:1px solid var(--border-subtle);">🧑‍🔬 Personnel <strong>${recentPax.name}</strong> on station at ${recentPax.current_location}.</li>`;
        
        const invLow = data.inventory.find(i => i.status === 'Low' || i.status === 'Critical');
        if(invLow) activityList.innerHTML += `<li style="padding:6px 0; border-bottom:1px solid var(--border-subtle);">⚠️ Stock update: <strong>${invLow.name}</strong> is ${invLow.status} (${invLow.days_remaining}d left).</li>`;

        const astAlert = data.assets.find(a => a.operational_status !== 'Operational');
        if(astAlert) activityList.innerHTML += `<li style="padding:6px 0; border-bottom:1px solid var(--border-subtle);">🔧 Fleet maintenance: <strong>${astAlert.name}</strong> is ${astAlert.operational_status}.</li>`;

        if (data.emergencies && data.emergencies.length > 0) {
            const emRecent = data.emergencies[0];
            if(emRecent.status === 'Resolved') {
                activityList.innerHTML += `<li style="padding:6px 0;">✅ Emergency resolved: <strong>${emRecent.type}</strong> at ${emRecent.location}.</li>`;
            } else {
                activityList.innerHTML += `<li style="padding:6px 0; color:var(--danger);">🚨 Active Emergency: <strong>${emRecent.type}</strong> at ${emRecent.location}.</li>`;
            }
        }
    }

    runSmartAnalysis();
}

function runSmartAnalysis() {
    if (!appData || !appData.inventory) return;
    
    let overallRiskScore = 0;
    
    // Inventory shortage prediction
    const invEl = document.getElementById('smart-inventory');
    if(invEl) invEl.innerHTML = '';
    
    appData.inventory.forEach(inv => {
        let riskLevel = 'Low';
        let rec = 'Monitor normal consumption.';
        
        if (inv.days_remaining <= 10) {
            riskLevel = 'Critical';
            rec = 'Immediate emergency resupply required before shortage.';
            overallRiskScore += 3;
        } else if (inv.days_remaining <= 30) {
            riskLevel = 'High';
            rec = 'Schedule expedited resupply in next cargo manifest.';
            overallRiskScore += 2;
        } else if (inv.days_remaining <= 60) {
            riskLevel = 'Moderate';
            rec = 'Include in upcoming standard resupply schedule.';
            overallRiskScore += 1;
        }
        
        if (riskLevel !== 'Low' && invEl) {
            invEl.innerHTML += `<li style="margin-bottom:6px;"><strong>${inv.name} (${inv.location})</strong>: ${inv.days_remaining} days left. <span class="status-badge ${getBadgeClass(riskLevel)}" style="padding:1px 4px;">${riskLevel}</span><br><em>${rec}</em></li>`;
        }
    });
    if (invEl && invEl.innerHTML === '') invEl.innerHTML = '<li><span style="color:var(--success);">✓</span> All station inventory healthy.</li>';

    // Asset failure / Maintenance risk
    const astEl = document.getElementById('smart-assets');
    if(astEl) astEl.innerHTML = '';
    appData.assets.forEach(ast => {
        let riskLevel = 'Low';
        let rec = 'Continue normal operations.';
        
        if (ast.status === 'Out of Service') {
            riskLevel = 'Critical';
            rec = 'Immediate repair needed.';
            overallRiskScore += 3;
        } else if (ast.condition === 'Poor' || ast.status === 'At Risk') {
            riskLevel = 'High';
            rec = 'Schedule maintenance ASAP.';
            overallRiskScore += 2;
        } else if (ast.status === 'Maintenance Due') {
            riskLevel = 'Moderate';
            rec = 'Schedule routine maintenance.';
            overallRiskScore += 1;
        }
        
        if (riskLevel !== 'Low' && astEl) {
            astEl.innerHTML += `<li style="margin-bottom:6px;"><strong>${ast.name}</strong> <span class="status-badge ${getBadgeClass(riskLevel)}" style="padding:1px 4px;">${riskLevel}</span><br><em>Status: ${ast.operational_status} &bull; ${rec}</em></li>`;
        }
    });
    if (astEl && astEl.innerHTML === '') astEl.innerHTML = '<li><span style="color:var(--success);">✓</span> Fleet readiness 100%.</li>';

    // Cargo & Personnel risk
    const cpEl = document.getElementById('smart-cargo-personnel');
    if(cpEl) cpEl.innerHTML = '';
    
    appData.cargo.forEach(c => {
        if (c.status === 'Delayed') {
            overallRiskScore += 2;
            if(cpEl) cpEl.innerHTML += `<li style="margin-bottom:6px;"><strong>Cargo ${c.id}</strong>: Delayed at ${c.current_location}. <span class="status-badge status-critical" style="padding:1px 4px;">High Risk</span><br><em>Action: Expedite maritime transport.</em></li>`;
        }
    });
    
    appData.personnel.forEach(p => {
        if (p.emergency_status !== 'Normal') {
            overallRiskScore += 4;
            if(cpEl) cpEl.innerHTML += `<li style="margin-bottom:6px;"><strong>Personnel ${p.name}</strong> (${p.current_location}): <span class="status-badge status-critical" style="padding:1px 4px;">${p.emergency_status}</span><br><em>Action: Coordinate medical evacuation.</em></li>`;
        }
    });
    if (cpEl && cpEl.innerHTML === '') cpEl.innerHTML = '<li><span style="color:var(--success);">✓</span> Cargo &amp; personnel on schedule.</li>';

    // Critical Alerts (Emergencies)
    const alertEl = document.getElementById('smart-alerts');
    if(alertEl) alertEl.innerHTML = '';
    appData.emergencies.forEach(e => {
        if (e.status !== 'Resolved') {
            if (e.severity === 'Critical') {
                overallRiskScore += 5;
                if(alertEl) alertEl.innerHTML += `<li style="margin-bottom:6px;"><strong>${e.type} (${e.location})</strong>: <span class="status-badge status-critical" style="padding:1px 4px;">Critical</span><br><em>Action: Command center coordination required.</em></li>`;
            } else if (e.severity === 'High') {
                overallRiskScore += 3;
                if(alertEl) alertEl.innerHTML += `<li style="margin-bottom:6px;"><strong>${e.type} (${e.location})</strong>: <span class="status-badge status-critical" style="padding:1px 4px;">High</span><br><em>Action: Response team dispatched.</em></li>`;
            }
        }
    });
    if (alertEl && alertEl.innerHTML === '') alertEl.innerHTML = '<li><span style="color:var(--success);">✓</span> No active emergency incidents.</li>';

    // Overall risk banner
    const banner = document.getElementById('mission-risk-banner');
    const scoreSpan = document.getElementById('overall-risk-score');
    const reasonDiv = document.getElementById('overall-risk-reason');
    
    if (banner && scoreSpan && reasonDiv) {
        if (overallRiskScore >= 12) {
            banner.style.borderLeftColor = 'var(--danger)';
            banner.style.backgroundColor = 'var(--danger-bg)';
            scoreSpan.textContent = 'CRITICAL RISK';
            scoreSpan.style.color = 'var(--danger-text)';
            reasonDiv.textContent = `Multiple active high-severity emergencies or inventory shortages detected (Risk Score: ${overallRiskScore}).`;
        } else if (overallRiskScore >= 6) {
            banner.style.borderLeftColor = 'var(--warning)';
            banner.style.backgroundColor = 'var(--warning-bg)';
            scoreSpan.textContent = 'MODERATE RISK';
            scoreSpan.style.color = 'var(--warning-text)';
            reasonDiv.textContent = `Operational delays or maintenance requirements detected across Antarctic corridor (Risk Score: ${overallRiskScore}).`;
        } else {
            banner.style.borderLeftColor = 'var(--success)';
            banner.style.backgroundColor = 'var(--success-bg)';
            scoreSpan.textContent = 'LOW RISK (NOMINAL)';
            scoreSpan.style.color = 'var(--success-text)';
            reasonDiv.textContent = `All polar logistics systems nominal. Continuous monitoring active (Risk Score: ${overallRiskScore}).`;
        }
    }
}
