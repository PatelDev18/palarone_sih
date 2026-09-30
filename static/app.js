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
            document.getElementById(targetId).classList.add('active');
            currentPageBreadcrumb.textContent = item.textContent;
            
            if(targetId === 'cargo') renderCargo();
            if(targetId === 'inventory') renderInventory();
            if(targetId === 'personnel') renderPersonnel();
            if(targetId === 'assets') renderAssets();
            if(targetId === 'emergency') renderEmergencies();
        });
    });

    // -------- EXPEDITION MODAL LOGIC --------
    const expModal = document.getElementById('expedition-modal');
    document.getElementById('btn-new-expedition').addEventListener('click', () => { expModal.classList.add('show'); });
    const closeExpModal = () => { expModal.classList.remove('show'); document.getElementById('new-expedition-form').reset(); };
    document.getElementById('close-modal').addEventListener('click', closeExpModal);
    document.getElementById('cancel-modal').addEventListener('click', closeExpModal);

    document.getElementById('new-expedition-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newExp = {
            name: document.getElementById('form-name').value,
            destination: document.getElementById('form-destination').value,
            priority: document.getElementById('form-priority').value,
            start_date: document.getElementById('form-start').value,
            end_date: document.getElementById('form-end').value,
            team_size: document.getElementById('form-team').value,
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
    document.getElementById('btn-new-cargo').addEventListener('click', () => { cargoModal.classList.add('show'); });
    const closeCargoModal = () => { cargoModal.classList.remove('show'); document.getElementById('new-cargo-form').reset(); };
    document.getElementById('close-cargo-modal').addEventListener('click', closeCargoModal);
    document.getElementById('cancel-cargo-modal').addEventListener('click', closeCargoModal);

    document.getElementById('new-cargo-form').addEventListener('submit', (e) => {
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

    document.getElementById('cargo-search').addEventListener('input', (e) => {
        cargoSearchQuery = e.target.value.toLowerCase();
        renderCargo();
    });

    // -------- INVENTORY MODAL LOGIC --------
    const invModal = document.getElementById('inventory-modal');
    document.getElementById('btn-update-stock').addEventListener('click', () => { 
        populateInventorySelect();
        invModal.classList.add('show'); 
    });
    const closeInvModal = () => { invModal.classList.remove('show'); document.getElementById('update-inventory-form').reset(); };
    document.getElementById('close-inv-modal').addEventListener('click', closeInvModal);
    document.getElementById('cancel-inv-modal').addEventListener('click', closeInvModal);

    document.getElementById('update-inventory-form').addEventListener('submit', (e) => {
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

    document.getElementById('inventory-search').addEventListener('input', (e) => {
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
            usage_hours: parseInt(document.getElementById('ua-usage').value),
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
            document.getElementById('activity-list').innerHTML = `<li><span style="color:red">Error loading data.</span></li>`;
        });
});

// Common Utility
function getBadgeClass(value) {
    const lower = String(value).toLowerCase();
    if(lower.includes('critical') || lower.includes('low') || lower.includes('high') || lower.includes('delayed') || lower.includes('out of stock')) return 'status-critical';
    if(lower.includes('adequate') || lower.includes('healthy') || lower.includes('completed') || lower.includes('operational') || lower.includes('delivered')) return 'status-ok';
    if(lower.includes('maintenance') || lower.includes('planned') || lower.includes('medium') || lower.includes('preparing')) return 'status-warning';
    return 'status-neutral'; // In Transit, In Progress, etc.
}

function populateTable(tableId, dataList, columns) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if(!tbody) return;
    tbody.innerHTML = '';
    dataList.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            let cellValue = typeof col === 'function' ? col(row) : row[col];
            if(col === 'status' || col === 'condition') td.innerHTML = `<span class="status-badge ${getBadgeClass(cellValue)}">${cellValue}</span>`;
            else td.innerHTML = cellValue;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// -------- EXPEDITION LOGIC --------
function renderExpeditions() {
    const tbody = document.querySelector(`#expedition-table tbody`);
    tbody.innerHTML = '';
    let filtered = appData.expeditions;
    if(currentExpeditionFilter !== 'All') {
        if(currentExpeditionFilter === 'High') filtered = filtered.filter(e => e.priority === 'High');
        else filtered = filtered.filter(e => e.status === currentExpeditionFilter);
    }

    filtered.forEach(exp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${exp.id}</td>
            <td><strong>${exp.name}</strong></td>
            <td>${exp.destination}</td>
            <td>${exp.start_date} to ${exp.end_date}</td>
            <td><span class="status-badge ${getBadgeClass(exp.status)}">${exp.status}</span></td>
            <td><span class="status-badge ${getBadgeClass(exp.priority)}">${exp.priority}</span></td>
        `;
        tr.addEventListener('click', () => {
            document.querySelectorAll('#expedition-table tbody tr').forEach(row => row.classList.remove('selected'));
            tr.classList.add('selected');
            showExpeditionDetails(exp);
        });
        tbody.appendChild(tr);
    });

    if(filtered.length > 0) document.querySelector(`#expedition-table tbody tr`).click();
    else document.getElementById('expedition-details-panel').style.display = 'none';
}

function showExpeditionDetails(exp) {
    document.getElementById('expedition-details-panel').style.display = 'block';
    document.getElementById('det-name').textContent = exp.name;
    document.getElementById('det-status').className = `status-badge ${getBadgeClass(exp.status)}`;
    document.getElementById('det-status').textContent = exp.status;
    document.getElementById('det-priority').className = `status-badge ${getBadgeClass(exp.priority)}`;
    document.getElementById('det-priority').textContent = `Priority: ${exp.priority}`;
    
    document.getElementById('det-progress').style.width = `${exp.progress}%`;
    document.getElementById('det-progress-text').textContent = `${exp.progress}%`;
    document.getElementById('det-mission').textContent = exp.mission || "No mission description provided.";
    document.getElementById('det-timeline').textContent = `${exp.start_date} to ${exp.end_date}`;
    document.getElementById('det-team').textContent = `${exp.team_size} members assigned`;
    
    const start = new Date(exp.start_date);
    const end = new Date(exp.end_date);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    document.getElementById('calc-duration').textContent = diffDays > 0 ? `${diffDays} days` : 'Invalid date range';
    
    let cargoReadiness = 'Pending Checks', assetReadiness = 'Pending Checks', overall = 0;
    if(exp.status === 'Completed') { cargoReadiness = '100% (Returned)'; assetReadiness = '100% (Returned)'; overall = 100; }
    else if (exp.status === 'In Progress') { cargoReadiness = '100% (Deployed)'; assetReadiness = '100% (Deployed)'; overall = 100; }
    else {
        cargoReadiness = exp.priority === 'High' ? '85% (Expedited)' : '40% (Gathering)';
        assetReadiness = exp.team_size > 10 ? 'Needs more vehicles' : 'Ready (Allocated)';
        overall = exp.priority === 'High' ? 78 : 45;
    }
    document.getElementById('calc-team').textContent = `${exp.team_size} members (Sufficient)`;
    document.getElementById('calc-cargo').textContent = cargoReadiness;
    document.getElementById('calc-assets').textContent = assetReadiness;
    document.getElementById('calc-readiness').textContent = `${overall}%`;
    const scoreElement = document.getElementById('calc-readiness');
    scoreElement.style.color = overall >= 80 ? 'var(--success)' : (overall >= 50 ? 'var(--warning)' : 'var(--danger)');
}

// -------- CARGO LOGIC --------
function renderCargo() {
    const tbody = document.querySelector(`#cargo-table tbody`);
    if(!tbody) return;
    tbody.innerHTML = '';
    
    let filtered = appData.cargo;

    if(currentCargoFilter !== 'All') {
        if(currentCargoFilter === 'High') filtered = filtered.filter(c => c.priority === 'High');
        else filtered = filtered.filter(c => c.status === currentCargoFilter);
    }

    if(cargoSearchQuery) {
        filtered = filtered.filter(c => 
            c.id.toLowerCase().includes(cargoSearchQuery) || 
            c.name.toLowerCase().includes(cargoSearchQuery)
        );
    }

    filtered.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td><strong>${c.name}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${c.category}</span></td>
            <td>${c.origin} &rarr; ${c.destination}</td>
            <td>${c.current_location}</td>
            <td><span class="status-badge ${getBadgeClass(c.status)}">${c.status}</span></td>
            <td><span class="status-badge ${getBadgeClass(c.priority)}">${c.priority}</span></td>
        `;
        tr.addEventListener('click', () => {
            document.querySelectorAll('#cargo-table tbody tr').forEach(row => row.classList.remove('selected'));
            tr.classList.add('selected');
            showCargoDetails(c);
        });
        tbody.appendChild(tr);
    });

    if(filtered.length > 0) document.querySelector(`#cargo-table tbody tr`).click();
    else document.getElementById('cargo-details-panel').style.display = 'none';

    updateCargoStats();
}

function updateCargoStats() {
    const total = appData.cargo.length;
    const inTransit = appData.cargo.filter(c => c.status === 'In Transit').length;
    const delivered = appData.cargo.filter(c => c.status === 'Delivered').length;
    const delayed = appData.cargo.filter(c => c.status === 'Delayed').length;
    
    let totalWeight = 0;
    appData.cargo.forEach(c => {
        const w = parseInt(c.weight.replace(/,/g, '').replace('kg', '').trim());
        if(!isNaN(w)) totalWeight += w;
    });

    document.getElementById('stat-cargo-total').textContent = total;
    document.getElementById('stat-cargo-transit').textContent = inTransit;
    document.getElementById('stat-cargo-delivered').textContent = delivered;
    document.getElementById('stat-cargo-delayed').textContent = delayed;
    document.getElementById('stat-cargo-weight').textContent = totalWeight.toLocaleString() + ' kg';

    if(delayed === 0) document.getElementById('stat-cargo-delayed').classList.remove('alert');
    else document.getElementById('stat-cargo-delayed').classList.add('alert');

    // Smart Alert Banner
    const delayedItems = appData.cargo.filter(c => c.status === 'Delayed');
    const alertBanner = document.getElementById('cargo-smart-alerts');
    if (delayedItems.length > 0) {
        alertBanner.style.display = 'block';
        const msg = delayedItems.map(c => `<strong>${c.id}</strong> (${c.current_location})`).join(', ');
        alertBanner.innerHTML = `⚠️ <strong>Cargo Delay Detected:</strong> Please review logistics for ${msg}.`;
    } else {
        alertBanner.style.display = 'none';
    }
}

function showCargoDetails(c) {
    document.getElementById('cargo-details-panel').style.display = 'block';
    document.getElementById('cdet-name').textContent = c.name;
    document.getElementById('cdet-status').className = `status-badge ${getBadgeClass(c.status)}`;
    document.getElementById('cdet-status').textContent = c.status;
    document.getElementById('cdet-priority').className = `status-badge ${getBadgeClass(c.priority)}`;
    document.getElementById('cdet-priority').textContent = `Priority: ${c.priority}`;
    
    document.getElementById('cdet-progress').style.width = `${c.progress}%`;
    document.getElementById('cdet-progress-text').textContent = `${c.progress}%`;
    
    document.getElementById('cdet-category').textContent = c.category;
    document.getElementById('cdet-weight').textContent = c.weight;
    document.getElementById('cdet-transport').textContent = c.transport;
    document.getElementById('cdet-dispatch').textContent = c.dispatch_date;
    document.getElementById('cdet-arrival').textContent = c.expected_arrival;

    // Timeline Rendering
    const stages = ['Packed', 'Dispatched', 'In Transit', 'Cape Town', 'Loaded', 'Antarctica', 'Delivered'];
    const timelineEl = document.getElementById('cdet-timeline');
    timelineEl.innerHTML = '';
    
    stages.forEach((st, idx) => {
        const li = document.createElement('li');
        li.textContent = st;
        if(idx < c.stage) li.className = 'done';
        else if (idx === c.stage) li.className = 'current';
        timelineEl.appendChild(li);
    });

    // Visual Route Nodes update (Dynamic based on origin/dest)
    document.getElementById('route-p1').textContent = c.origin;
    document.getElementById('route-p4').textContent = c.destination;

    const pts = ['route-p1', 'route-p2', 'route-p3', 'route-p4'];
    const lines = ['route-l1', 'route-l2', 'route-l3'];
    
    let routeStage = 0;
    if(c.stage >= 2) routeStage = 1;
    if(c.stage >= 4) routeStage = 2;
    if(c.stage >= 6) routeStage = 3;

    pts.forEach((p, idx) => {
        const el = document.getElementById(p);
        el.className = 'route-point';
        if(idx < routeStage) el.classList.add('passed');
        if(idx === routeStage) el.classList.add('active');
    });

    lines.forEach((l, idx) => {
        const el = document.getElementById(l);
        el.className = 'route-line';
        if(idx < routeStage) el.classList.add('passed');
    });
}

// -------- INVENTORY LOGIC --------
function processInventoryData() {
    appData.inventory.forEach(item => {
        if (item.daily_consumption > 0) {
            item.days_remaining = Math.floor(item.quantity / item.daily_consumption);
        } else {
            item.days_remaining = 999; // effectively infinite
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
    const tbody = document.querySelector(`#inventory-table tbody`);
    if(!tbody) return;
    tbody.innerHTML = '';
    
    let filtered = appData.inventory;

    if(currentInventoryFilter !== 'All') {
        filtered = filtered.filter(i => i.status === currentInventoryFilter);
    }

    if(inventorySearchQuery) {
        filtered = filtered.filter(i => 
            i.id.toLowerCase().includes(inventorySearchQuery) || 
            i.name.toLowerCase().includes(inventorySearchQuery) ||
            i.category.toLowerCase().includes(inventorySearchQuery)
        );
    }

    filtered.forEach(i => {
        const tr = document.createElement('tr');
        const daysText = i.days_remaining === 999 ? '999+' : i.days_remaining;
        tr.innerHTML = `
            <td>${i.id}</td>
            <td><strong>${i.name}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${i.category}</span></td>
            <td>${i.location}</td>
            <td>${i.quantity.toLocaleString()} ${i.unit}</td>
            <td>${i.daily_consumption} ${i.unit}</td>
            <td>${daysText}</td>
            <td><span class="status-badge ${getBadgeClass(i.status)}">${i.status}</span></td>
        `;
        tr.addEventListener('click', () => {
            document.querySelectorAll('#inventory-table tbody tr').forEach(row => row.classList.remove('selected'));
            tr.classList.add('selected');
            showInventoryDetails(i);
        });
        tbody.appendChild(tr);
    });

    if(filtered.length > 0) document.querySelector(`#inventory-table tbody tr`).click();
    else document.getElementById('inventory-details-panel').style.display = 'none';

    updateInventoryStats();
}

function updateInventoryStats() {
    const totalItems = appData.inventory.length;
    let totalQty = 0;
    appData.inventory.forEach(i => totalQty += i.quantity);
    
    const critical = appData.inventory.filter(i => i.status === 'Critical' || i.status === 'Out of Stock').length;
    const low = appData.inventory.filter(i => i.status === 'Low').length;
    
    document.getElementById('stat-inv-total').textContent = totalItems;
    document.getElementById('stat-inv-qty').textContent = totalQty.toLocaleString();
    document.getElementById('stat-inv-low').textContent = low;
    document.getElementById('stat-inv-critical').textContent = critical;
    
    const requiresResupply = critical + low;
    document.getElementById('stat-inv-resupply').textContent = requiresResupply;

    if(low === 0) document.getElementById('stat-inv-low').classList.remove('alert');
    else document.getElementById('stat-inv-low').classList.add('alert');

    if(critical === 0) document.getElementById('stat-inv-critical').classList.remove('alert');
    else document.getElementById('stat-inv-critical').classList.add('alert');

    if(requiresResupply === 0) document.getElementById('stat-inv-resupply').classList.remove('alert');
    else document.getElementById('stat-inv-resupply').classList.add('alert');

    // Smart Alert Prediction
    const worstItem = appData.inventory.reduce((prev, current) => {
        return (prev.days_remaining < current.days_remaining && prev.status !== 'Healthy') ? prev : current;
    });

    const alertBanner = document.getElementById('inv-smart-alerts');
    if (worstItem && worstItem.days_remaining <= 14) {
        alertBanner.style.display = 'block';
        const msg = `${worstItem.name} may reach critical level in ${worstItem.days_remaining} days while next resupply is expected in 10 days. RISK LEVEL: ${worstItem.status.toUpperCase()}. ACTION: Expedite Resupply.`;
        document.getElementById('inv-ai-msg').textContent = msg;
    } else {
        alertBanner.style.display = 'none';
    }
}

function showInventoryDetails(i) {
    document.getElementById('inventory-details-panel').style.display = 'block';
    document.getElementById('idet-name').textContent = i.name;
    document.getElementById('idet-status').className = `status-badge ${getBadgeClass(i.status)}`;
    document.getElementById('idet-status').textContent = i.status;
    
    document.getElementById('idet-qty').textContent = i.quantity.toLocaleString();
    document.getElementById('idet-unit').textContent = i.unit;
    document.getElementById('idet-min').textContent = `${i.min_safe_level.toLocaleString()} ${i.unit}`;
    document.getElementById('idet-daily').textContent = `${i.daily_consumption.toLocaleString()} ${i.unit}`;
    document.getElementById('idet-recent').textContent = `${i.recent_consumption.toLocaleString()} ${i.unit}`;
    
    document.getElementById('idet-days').textContent = i.days_remaining === 999 ? '999+' : i.days_remaining;

    // Consumption chart
    const safeRatio = Math.min((i.quantity / (i.min_safe_level * 3)) * 100, 100);
    const bar = document.getElementById('idet-bar');
    bar.style.width = `${safeRatio}%`;
    if (i.status === 'Critical' || i.status === 'Out of Stock') bar.style.backgroundColor = 'var(--danger)';
    else if (i.status === 'Low') bar.style.backgroundColor = 'var(--warning)';
    else bar.style.backgroundColor = 'var(--success)';
    
    document.getElementById('idet-trend-msg').textContent = `Stock level is ${safeRatio.toFixed(1)}% of 3x safety margin.`;
}

function populateInventorySelect() {
    const sel = document.getElementById('fi-item');
    sel.innerHTML = '';
    appData.inventory.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.id;
        opt.textContent = `${i.name} (${i.id})`;
        sel.appendChild(opt);
    });
}

function populateDashboard(data) {
    document.getElementById('dash-exp-count').textContent = data.expeditions.filter(e => e.status === 'In Progress').length;
    
    document.getElementById('dash-cargo-transit').textContent = data.cargo.filter(c => c.status === 'In Transit').length;

    const criticalInv = data.inventory.filter(i => i.status === 'Critical' || i.status === 'Low').length;
    const invEl = document.getElementById('dash-inv-alert');
    invEl.textContent = criticalInv;
    if(criticalInv === 0) {
        invEl.classList.remove('alert');
        invEl.style.color = '#333';
    } else {
        invEl.classList.add('alert');
        invEl.style.color = '#d32f2f';
    }
    
    document.getElementById('dash-personnel-ant').textContent = data.personnel.filter(p => p.current_location.includes('Antarctica') || p.current_location.includes('Station')).length;

    document.getElementById('dash-asset-op').textContent = data.assets.filter(a => a.operational_status === 'Operational').length;

    const activeEm = data.emergencies ? data.emergencies.filter(e => e.status !== 'Resolved').length : 0;
    const emEl = document.getElementById('dash-em-active');
    if (emEl) {
        emEl.textContent = activeEm;
        if(activeEm === 0) {
            emEl.classList.remove('alert');
            emEl.style.color = '#333';
        } else {
            emEl.classList.add('alert');
            emEl.style.color = '#d32f2f';
        }
    }

    // EXPEDITION OVERVIEW (Active)
    const activeExp = data.expeditions.find(e => e.status === 'In Progress');
    const expOverview = document.getElementById('dash-exp-overview');
    if (expOverview) {
        if (activeExp) {
            expOverview.innerHTML = `<strong>${activeExp.name}</strong> (${activeExp.id})<br>
            <strong>Destination:</strong> ${activeExp.destination}<br>
            <strong>Team Size:</strong> ${activeExp.team_size} members<br>
            <strong>Readiness:</strong> 100%<br>
            <strong>Status:</strong> ${activeExp.status}`;
        } else {
            expOverview.textContent = 'No active expeditions.';
        }
    }

    // POLAR LOGISTICS ROUTE
    const cargoGoa = data.cargo.filter(c => c.current_location.includes('Goa')).length;
    const paxGoa = data.personnel.filter(p => p.current_location.includes('Goa')).length;
    if (document.getElementById('route-goa')) document.getElementById('route-goa').textContent = `Cargo: ${cargoGoa} | Pax: ${paxGoa}`;

    const cargoCpt = data.cargo.filter(c => c.current_location.includes('Cape Town')).length;
    const paxCpt = data.personnel.filter(p => p.current_location.includes('Cape Town')).length;
    if (document.getElementById('route-cpt')) document.getElementById('route-cpt').textContent = `Cargo: ${cargoCpt} | Pax: ${paxCpt}`;

    const cargoAnt = data.cargo.filter(c => c.current_location.includes('Antarctica') || c.current_location.includes('Station')).length;
    const paxAnt = data.personnel.filter(p => p.current_location.includes('Antarctica') || p.current_location.includes('Station')).length;
    if (document.getElementById('route-ant')) document.getElementById('route-ant').textContent = `Cargo: ${cargoAnt} | Pax: ${paxAnt}`;

    // RECENT ACTIVITY
    const activityList = document.getElementById('activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        
        // Cargo Dispatched
        const recentCargo = data.cargo.find(c => c.status === 'In Transit');
        if(recentCargo) activityList.innerHTML += `<li style="margin-bottom: 5px;">📦 Cargo <strong>${recentCargo.id}</strong> dispatched.</li>`;
        
        // Personnel Arrived
        const recentPax = data.personnel.find(p => p.current_location.includes('Station'));
        if(recentPax) activityList.innerHTML += `<li style="margin-bottom: 5px;">🧑‍🔬 Personnel <strong>${recentPax.name}</strong> arrived at ${recentPax.current_location}.</li>`;
        
        // Inventory Updated
        const invLow = data.inventory.find(i => i.status === 'Low' || i.status === 'Critical');
        if(invLow) activityList.innerHTML += `<li style="margin-bottom: 5px;">⚠️ Inventory updated: <strong>${invLow.name}</strong> is now ${invLow.status}.</li>`;
        else if (data.inventory[0]) activityList.innerHTML += `<li style="margin-bottom: 5px;">✅ Inventory updated: <strong>${data.inventory[0].name}</strong> checked.</li>`;

        // Asset Alert
        const astAlert = data.assets.find(a => a.operational_status !== 'Operational');
        if(astAlert) activityList.innerHTML += `<li style="margin-bottom: 5px;">🔧 Asset maintenance alert: <strong>${astAlert.name}</strong> is ${astAlert.operational_status}.</li>`;

        // Emergency
        if (data.emergencies && data.emergencies.length > 0) {
            const emRecent = data.emergencies[0];
            if(emRecent.status === 'Resolved') {
                activityList.innerHTML += `<li style="margin-bottom: 5px;">✅ Emergency resolved: <strong>${emRecent.type}</strong> at ${emRecent.location}.</li>`;
            } else {
                activityList.innerHTML += `<li style="margin-bottom: 5px; color: #d32f2f;">🚨 Emergency reported: <strong>${emRecent.type}</strong> (${emRecent.severity}) at ${emRecent.location}.</li>`;
            }
        }

        if (activityList.innerHTML === '') activityList.innerHTML = '<li>No recent activity.</li>';
    }

    // Run AI decision support layer
    runSmartAnalysis();
}

// -------- SMART OPERATIONS (AI DECISION SUPPORT) --------
function runSmartAnalysis() {
    if (!appData) return;
    
    let overallRiskScore = 0;
    
    // 1. INVENTORY SHORTAGE PREDICTION
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
            let resupply = "In 15 days";
            if (riskLevel === 'Critical') resupply = "Unknown";
            invEl.innerHTML += `<li><strong>${inv.name} (${inv.location})</strong>: ${inv.days_remaining} days left. (Expected Resupply: ${resupply}) 
            <span style="color:#d32f2f">[${riskLevel} Risk]</span> - <em>${rec}</em></li>`;
        }
    });
    if (invEl && invEl.innerHTML === '') invEl.innerHTML = '<li><span style="color:green;">✓</span> No inventory risks detected.</li>';

    // 2. ASSET FAILURE / MAINTENANCE RISK
    const astEl = document.getElementById('smart-assets');
    if(astEl) astEl.innerHTML = '';
    appData.assets.forEach(ast => {
        let riskLevel = 'Low';
        let rec = 'Continue normal operations.';
        
        if (ast.status === 'Out of Service') {
            riskLevel = 'Critical';
            rec = 'Immediate repair or replacement needed to restore capability.';
            overallRiskScore += 3;
        } else if (ast.condition === 'Poor' || ast.status === 'At Risk') {
            riskLevel = 'High';
            rec = 'Restrict usage to critical tasks only. Schedule maintenance ASAP.';
            overallRiskScore += 2;
        } else if (ast.status === 'Maintenance Due') {
            riskLevel = 'Moderate';
            rec = 'Schedule routine maintenance to prevent failure.';
            overallRiskScore += 1;
        }
        
        if (riskLevel !== 'Low' && astEl) {
            let reasonText = ast.status === 'Out of Service' ? 'Asset is out of service' : (ast.status === 'Maintenance Due' ? 'Maintenance schedule reached' : 'Condition is poor or at risk');
            astEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>${ast.name}</strong> 
            <span style="color:#e67e22">[${riskLevel} Risk]</span><br><em>Reason: ${reasonText} (${ast.condition}). Action: ${rec}</em></li>`;
        }
    });
    if (astEl && astEl.innerHTML === '') astEl.innerHTML = '<li><span style="color:green;">✓</span> No asset risks detected.</li>';

    // 3. CARGO DELAY RISK & 4. PERSONNEL RISK
    const cpEl = document.getElementById('smart-cargo-personnel');
    if(cpEl) cpEl.innerHTML = '';
    
    appData.cargo.forEach(c => {
        let riskLevel = 'Low';
        let rec = '';
        if (c.status === 'Delayed') {
            riskLevel = 'High';
            rec = 'Expedite transport or find alternative routing.';
            overallRiskScore += 2;
            if(cpEl) cpEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>Cargo ${c.id}</strong>: Delayed at ${c.current_location}. <span style="color:#e67e22">[${riskLevel} Risk]</span><br><em>Action: ${rec}</em></li>`;
        }
    });
    
    appData.personnel.forEach(p => {
        if (p.emergency_status !== 'None') {
            overallRiskScore += 4;
            if(cpEl) cpEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>Personnel ${p.name}</strong> (${p.current_location}). <span style="color:#d32f2f">[Critical Risk]</span><br><em>Action: Immediate medical or evac response required!</em></li>`;
        } else if (p.movement_status === 'Delayed') {
            overallRiskScore += 1;
            if(cpEl) cpEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>Personnel ${p.name}</strong> (${p.current_location}). <span style="color:#f39c12">[Moderate Risk]</span><br><em>Action: Monitor travel schedule and adjust ETA.</em></li>`;
        }
    });
    if (cpEl && cpEl.innerHTML === '') cpEl.innerHTML = '<li><span style="color:green;">✓</span> No cargo or personnel risks detected.</li>';

    // 5. CRITICAL ALERTS (Emergencies)
    const alertEl = document.getElementById('smart-alerts');
    if(alertEl) alertEl.innerHTML = '';
    appData.emergencies.forEach(e => {
        if (e.status !== 'Resolved') {
            if (e.severity === 'Critical') {
                overallRiskScore += 5;
                if(alertEl) alertEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>${e.type} at ${e.location}</strong>: Active Critical Emergency! <br><em>Action: Requires immediate command center coordination.</em></li>`;
            } else if (e.severity === 'High') {
                overallRiskScore += 3;
                if(alertEl) alertEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>${e.type} at ${e.location}</strong>: High Severity Incident. <br><em>Action: Ensure response team is fully equipped.</em></li>`;
            } else if (e.severity === 'Medium') {
                overallRiskScore += 1;
                if(alertEl) alertEl.innerHTML += `<li style="margin-bottom: 8px;"><strong>${e.type}</strong>: Medium Severity. <br><em>Action: Monitor situation closely.</em></li>`;
            }
        }
    });
    if (alertEl && alertEl.innerHTML === '') alertEl.innerHTML = '<li><span style="color:green;">✓</span> No active critical alerts.</li>';

    // Calculate Overall Mission Risk
    const banner = document.getElementById('mission-risk-banner');
    const scoreSpan = document.getElementById('overall-risk-score');
    const reasonDiv = document.getElementById('overall-risk-reason');
    
    if (banner && scoreSpan && reasonDiv) {
        if (overallRiskScore >= 15) {
            banner.style.borderLeftColor = '#d32f2f';
            banner.style.backgroundColor = '#ffebee';
            scoreSpan.textContent = 'CRITICAL';
            scoreSpan.style.color = '#d32f2f';
            reasonDiv.textContent = `Multiple high-severity active emergencies or critical systemic failures detected (Score: ${overallRiskScore}).`;
        } else if (overallRiskScore >= 8) {
            banner.style.borderLeftColor = '#e67e22';
            banner.style.backgroundColor = '#fdf2e9';
            scoreSpan.textContent = 'HIGH';
            scoreSpan.style.color = '#e67e22';
            reasonDiv.textContent = `Significant risks identified across multiple logistics modules requiring attention (Score: ${overallRiskScore}).`;
        } else if (overallRiskScore >= 4) {
            banner.style.borderLeftColor = '#f39c12';
            banner.style.backgroundColor = '#fef9e7';
            scoreSpan.textContent = 'MODERATE';
            scoreSpan.style.color = '#f39c12';
            reasonDiv.textContent = `Some operational delays or maintenance requirements detected (Score: ${overallRiskScore}).`;
        } else {
            banner.style.borderLeftColor = '#27ae60';
            banner.style.backgroundColor = '#e9f7ef';
            scoreSpan.textContent = 'LOW';
            scoreSpan.style.color = '#27ae60';
            reasonDiv.textContent = `All systems nominal. Normal operations continuing (Score: ${overallRiskScore}).`;
        }
    }
}


// -------- PERSONNEL LOGIC --------
function processPersonnelData() {
    let total = 0, antarctica = 0, travelling = 0, atBase = 0, emergency = 0;
    let mapGoa = 0, mapCapeTown = 0, mapAntarctica = 0;
    
    appData.personnel.forEach(p => {
        total++;
        if (p.movement_status === 'Antarctica') antarctica++;
        if (p.movement_status === 'Travelling') travelling++;
        if (p.movement_status === 'At Base') atBase++;
        if (p.emergency_status && p.emergency_status.includes('Alert') || p.emergency_status === 'Medical Evacuation') emergency++;
        
        // Map distribution logic
        if (p.current_location === 'Goa' || p.current_location === 'Home Base' || (p.movement_status === 'At Base' && p.current_location !== 'Cape Town' && p.current_location !== 'Maitri Station' && p.current_location !== 'Bharati Station')) {
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
    const tbody = document.querySelector('#personnel-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const term = currentPersonnelSearch.toLowerCase();
    
    let filtered = appData.personnel;

    filtered.forEach(p => {
        // Filter logic
        if (currentPersonnelFilter !== 'All') {
            if (currentPersonnelFilter === 'Emergency') {
                if (p.emergency_status === 'Normal') return;
            } else if (p.movement_status !== currentPersonnelFilter) {
                return;
            }
        }
        
        // Search logic
        if (term) {
            if (!p.name.toLowerCase().includes(term) && 
                !p.id.toLowerCase().includes(term) && 
                !p.role.toLowerCase().includes(term) &&
                !p.current_location.toLowerCase().includes(term)) {
                return;
            }
        }

        const isEmergency = p.emergency_status !== 'Normal';
        
        const tr = document.createElement('tr');
        if (selectedPersonnel && selectedPersonnel.id === p.id) {
            tr.classList.add('selected-row');
            tr.classList.add('selected');
        }
        
        tr.innerHTML = `
            <td>
                <strong>${p.id}</strong><br>
                ${p.name}
            </td>
            <td>
                <strong>${p.role}</strong><br>
                <small style="color: var(--text-muted);">${p.team}</small>
            </td>
            <td>${p.current_location} <br><small>→ ${p.destination}</small></td>
            <td><span class="status-badge status-${(p.movement_status || '').replace(/\s+/g, '-').toLowerCase()}">${p.movement_status}</span></td>
            <td><span class="status-badge" style="background: ${isEmergency ? 'var(--danger-color)' : '#e0e0e0'}; color: ${isEmergency ? 'white' : 'var(--text-main)'}">${p.emergency_status}</span></td>
        `;
        tr.addEventListener('click', () => {
            document.querySelectorAll('#personnel-table tbody tr').forEach(row => row.classList.remove('selected', 'selected-row'));
            tr.classList.add('selected', 'selected-row');
            selectedPersonnel = p;
            showPersonnelDetails();
        });
        tbody.appendChild(tr);
    });
    
    if(filtered.length > 0 && !selectedPersonnel) {
        document.querySelector(`#personnel-table tbody tr`)?.click();
    } else if (selectedPersonnel) {
        showPersonnelDetails();
    } else {
        const pDet = document.getElementById('personnel-details-panel');
        if (pDet) pDet.style.display = 'none';
    }
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
        statusBadge.className = `status-badge status-${(p.movement_status || '').replace(/\s+/g, '-').toLowerCase()}`;
    }
    
    const emBadge = document.getElementById('pdet-emergency');
    if (emBadge) {
        emBadge.textContent = p.emergency_status;
        const isEmergency = p.emergency_status !== 'Normal';
        emBadge.style.background = isEmergency ? 'var(--danger-color)' : '#e0e0e0';
        emBadge.style.color = isEmergency ? 'white' : 'var(--text-main)';
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
    const tbody = document.querySelector('#asset-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
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
    
    filtered.forEach(a => {
        const tr = document.createElement('tr');
        if (selectedAsset && selectedAsset.id === a.id) {
            tr.classList.add('selected', 'selected-row');
        }
        
        tr.innerHTML = `
            <td><strong>${a.id}</strong></td>
            <td>
                <strong>${a.name}</strong><br>
                <small style="color: var(--text-muted);">${a.type}</small>
            </td>
            <td>${a.location}</td>
            <td>${a.assigned_expedition || 'Unassigned'}</td>
            <td><span class="status-badge status-${a.condition.toLowerCase()}">${a.condition}</span></td>
            <td><span class="status-badge status-${a.operational_status.replace(/\s+/g, '-').toLowerCase()}">${a.operational_status}</span></td>
            <td>${(a.usage_hours || 0).toLocaleString()} hrs</td>
            <td>
                <small>Last: ${a.last_maintenance}</small><br>
                <small>Next: ${a.next_maintenance}</small>
            </td>
            <td><span class="status-badge" style="background: ${a.risk_level === 'High' ? 'var(--danger-color)' : (a.risk_level === 'Medium' ? 'var(--warning-color)' : 'var(--success-color)')}; color: white;">${a.risk_level}</span></td>
        `;
        
        tr.addEventListener('click', () => {
            document.querySelectorAll('#asset-table tbody tr').forEach(row => row.classList.remove('selected', 'selected-row'));
            tr.classList.add('selected', 'selected-row');
            selectedAsset = a;
            showAssetDetails();
        });
        tbody.appendChild(tr);
    });
    
    if (filtered.length > 0 && !selectedAsset) {
        document.querySelector('#asset-table tbody tr')?.click();
    } else if (selectedAsset) {
        showAssetDetails();
    } else {
        const aDet = document.getElementById('asset-details-panel');
        if (aDet) aDet.style.display = 'none';
    }
    
    updateAssetStats();
}

function updateAssetStats() {
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
        statusBadge.className = `status-badge status-${a.operational_status.replace(/\s+/g, '-').toLowerCase()}`;
    }
    
    const conditionBadge = document.getElementById('adet-condition');
    if (conditionBadge) {
        conditionBadge.textContent = a.condition;
        conditionBadge.className = `status-badge status-${a.condition.toLowerCase()}`;
    }
    
    safeSet('adet-location', a.location);
    safeSet('adet-type', a.type);
    safeSet('adet-expedition', a.assigned_expedition);
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
    const tbody = document.querySelector('#emergency-table tbody');
    if (!tbody || !appData.emergencies) return;
    
    tbody.innerHTML = '';
    
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
    
    filtered.forEach(em => {
        const tr = document.createElement('tr');
        if (selectedEmergency && selectedEmergency.id === em.id) {
            tr.classList.add('selected', 'selected-row');
        }
        
        let statusClass = em.status === 'Reported' ? 'status-pending' : (em.status === 'Resolved' ? 'status-resolved' : 'status-active');
        
        tr.innerHTML = `
            <td><strong>${em.id}</strong></td>
            <td>
                <strong>${em.type}</strong><br>
                <small style="color: var(--text-muted);">${em.location}</small>
            </td>
            <td>${em.timestamp}</td>
            <td>${em.people_affected || 0}</td>
            <td>${em.assigned_team || 'Pending'}</td>
            <td>${em.available_asset || 'None'}</td>
            <td><span class="status-badge" style="background: ${em.severity === 'Critical' ? '#8b0000' : (em.severity === 'High' ? 'var(--danger-color)' : (em.severity === 'Medium' ? 'var(--warning-color)' : 'var(--success-color)'))}; color: white;">${em.severity}</span></td>
            <td><span class="status-badge ${statusClass}">${em.status}</span></td>
        `;
        
        tr.addEventListener('click', () => {
            document.querySelectorAll('#emergency-table tbody tr').forEach(row => row.classList.remove('selected', 'selected-row'));
            tr.classList.add('selected', 'selected-row');
            selectedEmergency = em;
            showEmergencyDetails();
        });
        tbody.appendChild(tr);
    });
    
    if (filtered.length > 0 && !selectedEmergency) {
        document.querySelector('#emergency-table tbody tr')?.click();
    } else if (selectedEmergency) {
        showEmergencyDetails();
    } else {
        const eDet = document.getElementById('emergency-details-panel');
        if (eDet) eDet.style.display = 'none';
    }
    
    updateEmergencyStats();
}

function updateEmergencyStats() {
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
            bannerMsg.innerHTML = `⚠️ <strong>CRITICAL ALERT:</strong> There are ${high} High/Critical severity emergencies active. Dispatch teams immediately.`;
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
        let statusClass = em.status === 'Reported' ? 'status-pending' : (em.status === 'Resolved' ? 'status-resolved' : 'status-active');
        statusBadge.className = `status-badge ${statusClass}`;
    }
    
    const sevBadge = document.getElementById('emdet-severity');
    if (sevBadge) {
        sevBadge.textContent = em.severity;
        sevBadge.style.background = em.severity === 'Critical' ? '#8b0000' : (em.severity === 'High' ? 'var(--danger-color)' : (em.severity === 'Medium' ? 'var(--warning-color)' : 'var(--success-color)'));
        sevBadge.style.color = 'white';
    }
    
    safeSet('emdet-desc', em.description);
    safeSet('emdet-location', em.location);
    safeSet('emdet-reporter', em.reporter);
    safeSet('emdet-time', em.timestamp);
    safeSet('emdet-people', em.people_affected || 0);
    safeSet('emdet-team', em.assigned_team || 'Pending');
    safeSet('emdet-asset', em.available_asset || 'None');
    
    // Smart recommendation
    let recTeam = 'General Support Team';
    let recAsset = 'Standard Transport';
    let recPriority = 'Normal';
    let recReason = 'Standard response protocol.';
    
    if (em.severity === 'Critical' || em.severity === 'High') {
        recPriority = 'Highest';
        if (em.type === 'Medical Emergency') {
            recTeam = 'Medical Evac Team Alpha';
            recAsset = 'Snowcat SC-102 (Med-Equipped)';
            recReason = 'Severe medical situation requires immediate specialized evacuation.';
        } else if (em.type === 'Extreme Weather') {
            recTeam = 'Station Command';
            recAsset = 'None (Lockdown)';
            recReason = 'Extreme weather prevents safe deployment. Secure all external assets.';
        } else {
            recTeam = 'Rapid Response Team';
            recAsset = 'Icebreaker Support Vehicle';
            recReason = 'High severity incident requires heavy support and rapid deployment.';
        }
    } else {
        if (em.type.includes('Vehicle')) {
            recTeam = 'Logistics / Mechanic Team';
            recAsset = 'Snowcat Tow Vehicle';
            recReason = 'Vehicle recovery protocol.';
        }
    }
    
    safeSet('emdet-rec-team', recTeam);
    safeSet('emdet-rec-asset', recAsset);
    safeSet('emdet-rec-reason', recReason);
    safeSet('emdet-rec-priority', recPriority);
    
    // Timeline update
    const steps = ['Reported', 'Assessed', 'Team Dispatched', 'Responding', 'Resolved'];
    let currentIdx = steps.indexOf(em.status);
    if (currentIdx === -1) currentIdx = 0; // Default if custom status
    
    steps.forEach((step, idx) => {
        const stepId = step.toLowerCase().replace(' ', '-');
        const el = document.getElementById(`timeline-${stepId}`);
        if (el) {
            if (idx < currentIdx) {
                el.style.color = 'var(--success-color)';
                el.style.fontWeight = 'bold';
            } else if (idx === currentIdx) {
                el.style.color = 'var(--primary-color)';
                el.style.fontWeight = 'bold';
                el.style.borderBottom = '2px solid var(--primary-color)';
            } else {
                el.style.color = 'var(--text-muted)';
                el.style.fontWeight = 'normal';
                el.style.borderBottom = 'none';
            }
        }
    });

    const btn = document.getElementById('btn-update-emergency');
    if (btn) {
        btn.style.display = 'block'; // Always allow updating status if needed
    }
}
