// Family Tree Generator Application

// Global state - using JavaScript variables for state management
let people = [];
let currentEditingId = null;
let currentZoom = 1;
let currentPan = { x: 0, y: 0 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };

// Sample data for demonstration
const sampleData = [
    {
        id: 1,
        nombre: "Juan García",
        genero: "masculino",
        nacimiento: 1920,
        fallecimiento: 1995,
        foto: "",
        notas: "Fundador de la familia",
        padreIds: [],
        conyugeId: 2
    },
    {
        id: 2,
        nombre: "María López",
        genero: "femenino",
        nacimiento: 1925,
        fallecimiento: 2000,
        foto: "",
        notas: "",
        padreIds: [],
        conyugeId: 1
    },
    {
        id: 3,
        nombre: "Pedro García López",
        genero: "masculino",
        nacimiento: 1950,
        fallecimiento: null,
        foto: "",
        notas: "Hijo mayor",
        padreIds: [1, 2],
        conyugeId: 5
    },
    {
        id: 4,
        nombre: "Ana García López",
        genero: "femenino",
        nacimiento: 1955,
        fallecimiento: null,
        foto: "",
        notas: "",
        padreIds: [1, 2],
        conyugeId: null
    },
    {
        id: 5,
        nombre: "Carmen Rodríguez",
        genero: "femenino",
        nacimiento: 1952,
        fallecimiento: null,
        foto: "",
        notas: "",
        padreIds: [],
        conyugeId: 3
    },
    {
        id: 6,
        nombre: "Luis García Rodríguez",
        genero: "masculino",
        nacimiento: 1980,
        fallecimiento: null,
        foto: "",
        notas: "Nieto",
        padreIds: [3, 5],
        conyugeId: null
    },
    {
        id: 7,
        nombre: "Sofía García Rodríguez",
        genero: "femenino",
        nacimiento: 1985,
        fallecimiento: null,
        foto: "",
        notas: "Nieta",
        padreIds: [3, 5],
        conyugeId: null
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupFormHandlers();
    setupTreeControls();
    setupExportHandlers();
    setupImportHandlers();
    updateUI();
}

// Tab Navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
            
            // Special handling for tree tab
            if (targetTab === 'visualizar') {
                setTimeout(() => renderFamilyTree(), 100);
            }
        });
    });
}

// Form Handlers
function setupFormHandlers() {
    const form = document.getElementById('person-form');
    const addBtn = document.getElementById('add-person');
    const updateBtn = document.getElementById('update-person');
    const cancelBtn = document.getElementById('cancel-edit');
    const clearBtn = document.getElementById('clear-form');
    const loadSampleBtn = document.getElementById('load-sample');
    const searchInput = document.getElementById('search-person');
    
    addBtn.addEventListener('click', handleAddPerson);
    updateBtn.addEventListener('click', handleUpdatePerson);
    cancelBtn.addEventListener('click', handleCancelEdit);
    clearBtn.addEventListener('click', clearForm);
    loadSampleBtn.addEventListener('click', loadSampleData);
    searchInput.addEventListener('input', handleSearch);
}

// Person Management
function handleAddPerson() {
    const formData = getFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    const newPerson = {
        ...formData,
        id: Date.now() // Simple ID generation
    };
    
    people.push(newPerson);
    updateUI();
    clearForm();
    showSuccess('Persona agregada correctamente');
}

function handleUpdatePerson() {
    if (!currentEditingId) return;
    
    const formData = getFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    const personIndex = people.findIndex(p => p.id === currentEditingId);
    if (personIndex !== -1) {
        people[personIndex] = { ...formData, id: currentEditingId };
        updateUI();
        handleCancelEdit();
        showSuccess('Persona actualizada correctamente');
    }
}

function handleCancelEdit() {
    currentEditingId = null;
    clearForm();
    
    // Hide update/cancel buttons, show add button
    document.getElementById('add-person').classList.remove('hidden');
    document.getElementById('update-person').classList.add('hidden');
    document.getElementById('cancel-edit').classList.add('hidden');
    
    // Remove active class from person items
    document.querySelectorAll('.person-item').forEach(item => {
        item.classList.remove('active');
    });
}

function editPerson(id) {
    const person = people.find(p => p.id === id);
    if (!person) return;
    
    currentEditingId = id;
    
    // Fill form with person data
    document.getElementById('nombre').value = person.nombre || '';
    document.getElementById('genero').value = person.genero || 'masculino';
    document.getElementById('nacimiento').value = person.nacimiento || '';
    document.getElementById('fallecimiento').value = person.fallecimiento || '';
    document.getElementById('foto').value = person.foto || '';
    document.getElementById('notas').value = person.notas || '';
    
    // Set parents
    const padre1Select = document.getElementById('padre1');
    const padre2Select = document.getElementById('padre2');
    
    if (person.padreIds && person.padreIds.length > 0) {
        padre1Select.value = person.padreIds[0] || '';
        padre2Select.value = person.padreIds[1] || '';
    } else {
        padre1Select.value = '';
        padre2Select.value = '';
    }
    
    // Set spouse
    document.getElementById('conyuge').value = person.conyugeId || '';
    
    // Show update/cancel buttons, hide add button
    document.getElementById('add-person').classList.add('hidden');
    document.getElementById('update-person').classList.remove('hidden');
    document.getElementById('cancel-edit').classList.remove('hidden');
    
    // Highlight person in list
    document.querySelectorAll('.person-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.id) === id) {
            item.classList.add('active');
        }
    });
    
    // Scroll to top of form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function deletePerson(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta persona? Esta acción no se puede deshacer.')) {
        // Remove from people array
        people = people.filter(p => p.id !== id);
        
        // Remove from relationships
        people.forEach(person => {
            // Remove from parents
            if (person.padreIds) {
                person.padreIds = person.padreIds.filter(parentId => parentId !== id);
            }
            
            // Remove spouse relationship
            if (person.conyugeId === id) {
                person.conyugeId = null;
            }
        });
        
        updateUI();
        showSuccess('Persona eliminada correctamente');
    }
}

function getFormData() {
    const padre1 = document.getElementById('padre1').value;
    const padre2 = document.getElementById('padre2').value;
    const padreIds = [];
    
    if (padre1) padreIds.push(parseInt(padre1));
    if (padre2 && padre2 !== padre1) padreIds.push(parseInt(padre2));
    
    return {
        nombre: document.getElementById('nombre').value.trim(),
        genero: document.getElementById('genero').value,
        nacimiento: document.getElementById('nacimiento').value ? parseInt(document.getElementById('nacimiento').value) : null,
        fallecimiento: document.getElementById('fallecimiento').value ? parseInt(document.getElementById('fallecimiento').value) : null,
        foto: document.getElementById('foto').value.trim(),
        notas: document.getElementById('notas').value.trim(),
        padreIds: padreIds,
        conyugeId: document.getElementById('conyuge').value ? parseInt(document.getElementById('conyuge').value) : null
    };
}

function validateFormData(data) {
    // Clear previous errors
    hideError();
    
    if (!data.nombre) {
        showError('El nombre es obligatorio');
        return false;
    }
    
    if (data.nacimiento && data.fallecimiento && data.nacimiento > data.fallecimiento) {
        showError('El año de nacimiento no puede ser mayor al de fallecimiento');
        return false;
    }
    
    if (data.nacimiento && (data.nacimiento < 1800 || data.nacimiento > 2025)) {
        showError('El año de nacimiento debe estar entre 1800 y 2025');
        return false;
    }
    
    if (data.fallecimiento && (data.fallecimiento < 1800 || data.fallecimiento > 2025)) {
        showError('El año de fallecimiento debe estar entre 1800 y 2025');
        return false;
    }
    
    // Check for circular relationships
    if (currentEditingId) {
        if (data.padreIds.includes(currentEditingId)) {
            showError('Una persona no puede ser padre/madre de sí misma');
            return false;
        }
        if (data.conyugeId === currentEditingId) {
            showError('Una persona no puede ser cónyuge de sí misma');
            return false;
        }
    }
    
    return true;
}

function clearForm() {
    document.getElementById('person-form').reset();
    updateDropdowns();
}

function loadSampleData() {
    if (people.length > 0) {
        if (!confirm('¿Quieres cargar los datos de ejemplo? Esto reemplazará todos los datos actuales.')) {
            return;
        }
    }
    
    people = [...sampleData];
    updateUI();
    showSuccess('Datos de ejemplo cargados correctamente');
}

// UI Updates
function updateUI() {
    updatePersonCount();
    updatePersonList();
    updateDropdowns();
    updateTreeStats();
}

function updatePersonCount() {
    document.getElementById('person-count').textContent = people.length;
}

function updatePersonList() {
    const listElement = document.getElementById('people-list');
    const searchTerm = document.getElementById('search-person').value.toLowerCase();
    
    const filteredPeople = people.filter(person => 
        person.nombre.toLowerCase().includes(searchTerm)
    );
    
    listElement.innerHTML = '';
    
    if (filteredPeople.length === 0) {
        listElement.innerHTML = '<li class="person-item"><div class="person-info"><div class="person-name">No hay personas agregadas</div></div></li>';
        return;
    }
    
    filteredPeople.forEach(person => {
        const listItem = document.createElement('li');
        listItem.className = 'person-item';
        listItem.dataset.id = person.id;
        
        const dates = formatPersonDates(person);
        const genderIcon = getGenderIcon(person.genero);
        
        listItem.innerHTML = `
            <div class="person-info">
                <div class="person-name">${genderIcon} ${person.nombre}</div>
                <div class="person-details">${dates}</div>
            </div>
            <div class="person-actions">
                <button class="person-action" onclick="editPerson(${person.id})" title="Editar">
                    ✏️
                </button>
                <button class="person-action" onclick="deletePerson(${person.id})" title="Eliminar">
                    🗑️
                </button>
            </div>
        `;
        
        listElement.appendChild(listItem);
    });
}

function updateDropdowns() {
    const padre1Select = document.getElementById('padre1');
    const padre2Select = document.getElementById('padre2');
    const conyugeSelect = document.getElementById('conyuge');
    const rootPersonSelect = document.getElementById('root-person');
    
    // Clear all options except the first
    const selects = [padre1Select, padre2Select, conyugeSelect, rootPersonSelect];
    selects.forEach(select => {
        while (select.options.length > 1) {
            select.remove(1);
        }
    });
    
    // Add people to dropdowns
    people.forEach(person => {
        // Skip the person being edited for parent/spouse selection
        if (currentEditingId && person.id === currentEditingId) return;
        
        const option1 = new Option(person.nombre, person.id);
        const option2 = new Option(person.nombre, person.id);
        const option3 = new Option(person.nombre, person.id);
        const option4 = new Option(person.nombre, person.id);
        
        padre1Select.add(option1);
        padre2Select.add(option2);
        conyugeSelect.add(option3);
        rootPersonSelect.add(option4);
    });
}

function handleSearch() {
    updatePersonList();
}

// Tree Visualization
function setupTreeControls() {
    document.getElementById('zoom-in').addEventListener('click', () => zoomTree(1.2));
    document.getElementById('zoom-out').addEventListener('click', () => zoomTree(0.8));
    document.getElementById('reset-view').addEventListener('click', resetTreeView);
    document.getElementById('root-person').addEventListener('change', renderFamilyTree);
    document.getElementById('tree-type').addEventListener('change', renderFamilyTree);
    document.getElementById('generations').addEventListener('change', renderFamilyTree);
    
    // Setup pan functionality
    const svg = document.getElementById('family-tree');
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
}

function renderFamilyTree() {
    const svg = document.getElementById('family-tree');
    const treeContent = document.getElementById('tree-content');
    const noDataMessage = document.getElementById('no-data-message');
    
    if (people.length === 0) {
        noDataMessage.style.display = 'flex';
        treeContent.innerHTML = '';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    const rootPersonId = parseInt(document.getElementById('root-person').value);
    const treeType = document.getElementById('tree-type').value;
    const maxGenerations = parseInt(document.getElementById('generations').value);
    
    let rootPerson;
    if (rootPersonId) {
        rootPerson = people.find(p => p.id === rootPersonId);
    } else {
        // Find a person without parents as default root
        rootPerson = people.find(p => !p.padreIds || p.padreIds.length === 0) || people[0];
    }
    
    if (!rootPerson) return;
    
    const treeData = buildTreeData(rootPerson, treeType, maxGenerations);
    const layout = calculateTreeLayout(treeData);
    
    renderTreeNodes(treeContent, layout);
    renderTreeConnections(treeContent, layout);
    
    // Update SVG dimensions
    const bbox = treeContent.getBBox();
    svg.setAttribute('viewBox', `${bbox.x - 50} ${bbox.y - 50} ${bbox.width + 100} ${bbox.height + 100}`);
}

function buildTreeData(rootPerson, treeType, maxGenerations) {
    const visited = new Set();
    
    function buildNode(person, generation, maxGen) {
        if (!person || visited.has(person.id) || generation > maxGen) return null;
        
        visited.add(person.id);
        
        const node = {
            ...person,
            generation,
            children: [],
            parents: [],
            spouse: null
        };
        
        // Add spouse
        if (person.conyugeId) {
            const spouse = people.find(p => p.id === person.conyugeId);
            if (spouse && !visited.has(spouse.id)) {
                node.spouse = { ...spouse, generation };
                visited.add(spouse.id);
            }
        }
        
        if (treeType === 'descendants' || treeType === 'full') {
            // Add children
            const children = people.filter(p => 
                p.padreIds && (p.padreIds.includes(person.id) || 
                    (node.spouse && p.padreIds.includes(node.spouse.id)))
            );
            
            children.forEach(child => {
                const childNode = buildNode(child, generation + 1, maxGen);
                if (childNode) {
                    node.children.push(childNode);
                }
            });
        }
        
        if (treeType === 'ancestors' || treeType === 'full') {
            // Add parents
            if (person.padreIds) {
                person.padreIds.forEach(parentId => {
                    const parent = people.find(p => p.id === parentId);
                    if (parent) {
                        const parentNode = buildNode(parent, generation - 1, 0);
                        if (parentNode) {
                            node.parents.push(parentNode);
                        }
                    }
                });
            }
        }
        
        return node;
    }
    
    return buildNode(rootPerson, 0, maxGenerations - 1);
}

function calculateTreeLayout(treeData) {
    if (!treeData) return { nodes: [], connections: [] };
    
    const nodes = [];
    const connections = [];
    const nodeWidth = 140;
    const nodeHeight = 60;
    const horizontalSpacing = 180;
    const verticalSpacing = 100;
    
    function positionNodes(node, x, y, xOffset = 0) {
        const nodeData = {
            ...node,
            x: x + xOffset,
            y: y,
            width: nodeWidth,
            height: nodeHeight
        };
        nodes.push(nodeData);
        
        // Position spouse next to person
        if (node.spouse) {
            const spouseData = {
                ...node.spouse,
                x: x + xOffset + nodeWidth + 20,
                y: y,
                width: nodeWidth,
                height: nodeHeight
            };
            nodes.push(spouseData);
            
            // Add marriage connection
            connections.push({
                type: 'marriage',
                from: nodeData,
                to: spouseData
            });
        }
        
        // Position children
        if (node.children.length > 0) {
            const totalChildrenWidth = (node.children.length - 1) * horizontalSpacing;
            const startX = x + xOffset - (totalChildrenWidth / 2);
            
            node.children.forEach((child, index) => {
                const childX = startX + (index * horizontalSpacing);
                const childY = y + verticalSpacing;
                
                positionNodes(child, childX, childY);
                
                // Add parent-child connection
                connections.push({
                    type: 'parent-child',
                    from: nodeData,
                    to: nodes[nodes.length - (node.children.length - index) * (child.spouse ? 2 : 1)]
                });
            });
        }
        
        // Position parents
        if (node.parents.length > 0) {
            const totalParentsWidth = (node.parents.length - 1) * horizontalSpacing;
            const startX = x + xOffset - (totalParentsWidth / 2);
            
            node.parents.forEach((parent, index) => {
                const parentX = startX + (index * horizontalSpacing);
                const parentY = y - verticalSpacing;
                
                positionNodes(parent, parentX, parentY);
                
                // Add parent-child connection
                const parentNode = nodes[nodes.length - 1];
                connections.push({
                    type: 'parent-child',
                    from: parentNode,
                    to: nodeData
                });
            });
        }
    }
    
    positionNodes(treeData, 0, 0);
    
    return { nodes, connections };
}

function renderTreeNodes(container, layout) {
    container.innerHTML = '';
    
    layout.nodes.forEach(node => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create person box
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x);
        rect.setAttribute('y', node.y);
        rect.setAttribute('width', node.width);
        rect.setAttribute('height', node.height);
        rect.setAttribute('rx', 8);
        rect.setAttribute('fill', getGenderColor(node.genero));
        rect.setAttribute('class', 'person-box');
        rect.setAttribute('data-person-id', node.id);
        
        // Create text elements
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameText.setAttribute('x', node.x + node.width / 2);
        nameText.setAttribute('y', node.y + node.height / 2 - 8);
        nameText.setAttribute('class', 'person-text person-name-text');
        nameText.textContent = node.nombre;
        
        const datesText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        datesText.setAttribute('x', node.x + node.width / 2);
        datesText.setAttribute('y', node.y + node.height / 2 + 8);
        datesText.setAttribute('class', 'person-text person-dates-text');
        datesText.textContent = formatPersonDates(node);
        
        group.appendChild(rect);
        group.appendChild(nameText);
        group.appendChild(datesText);
        
        // Add click handler
        group.style.cursor = 'pointer';
        group.addEventListener('click', () => showPersonTooltip(node, event));
        
        container.appendChild(group);
    });
}

function renderTreeConnections(container, layout) {
    layout.connections.forEach(conn => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        if (conn.type === 'marriage') {
            line.setAttribute('x1', conn.from.x + conn.from.width);
            line.setAttribute('y1', conn.from.y + conn.from.height / 2);
            line.setAttribute('x2', conn.to.x);
            line.setAttribute('y2', conn.to.y + conn.to.height / 2);
            line.setAttribute('class', 'marriage-line');
        } else {
            line.setAttribute('x1', conn.from.x + conn.from.width / 2);
            line.setAttribute('y1', conn.from.y + conn.from.height);
            line.setAttribute('x2', conn.to.x + conn.to.width / 2);
            line.setAttribute('y2', conn.to.y);
            line.setAttribute('class', 'connection-line');
        }
        
        container.appendChild(line);
    });
}

function zoomTree(factor) {
    currentZoom *= factor;
    currentZoom = Math.max(0.1, Math.min(3, currentZoom));
    applyTransform();
}

function resetTreeView() {
    currentZoom = 1;
    currentPan = { x: 0, y: 0 };
    applyTransform();
}

function applyTransform() {
    const treeContent = document.getElementById('tree-content');
    treeContent.setAttribute('transform', `translate(${currentPan.x}, ${currentPan.y}) scale(${currentZoom})`);
}

function startDrag(e) {
    if (e.target.classList.contains('person-box')) return;
    isDragging = true;
    dragStart = { x: e.clientX - currentPan.x, y: e.clientY - currentPan.y };
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    currentPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
    };
    applyTransform();
}

function endDrag() {
    isDragging = false;
}

function showPersonTooltip(person, event) {
    const tooltip = document.getElementById('person-tooltip');
    const dates = formatPersonDates(person);
    
    let content = `<strong>${person.nombre}</strong><br>${dates}`;
    if (person.notas) {
        content += `<br><br><em>${person.notas}</em>`;
    }
    
    tooltip.innerHTML = content;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
    
    // Hide tooltip after 3 seconds
    setTimeout(() => {
        tooltip.classList.add('hidden');
    }, 3000);
}

function updateTreeStats() {
    const statsElement = document.getElementById('tree-stats');
    if (people.length === 0) {
        statsElement.textContent = '';
        return;
    }
    
    const generations = calculateGenerationCount();
    const marriages = people.filter(p => p.conyugeId).length / 2;
    
    statsElement.textContent = `${people.length} personas, ${generations} generaciones, ${Math.floor(marriages)} matrimonios`;
}

function calculateGenerationCount() {
    if (people.length === 0) return 0;
    
    const visited = new Set();
    let maxDepth = 0;
    
    function calculateDepth(person, depth) {
        if (!person || visited.has(person.id)) return depth;
        visited.add(person.id);
        
        maxDepth = Math.max(maxDepth, depth);
        
        const children = people.filter(p => 
            p.padreIds && p.padreIds.includes(person.id)
        );
        
        children.forEach(child => {
            calculateDepth(child, depth + 1);
        });
        
        return depth;
    }
    
    const roots = people.filter(p => !p.padreIds || p.padreIds.length === 0);
    roots.forEach(root => calculateDepth(root, 1));
    
    return maxDepth || 1;
}

// Export Functionality
function setupExportHandlers() {
    document.getElementById('export-tree').addEventListener('click', handleExport);
    
    // Show/hide PNG options
    const formatRadios = document.querySelectorAll('input[name="export-format"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const pngOptions = document.getElementById('png-options');
            if (radio.value === 'png') {
                pngOptions.classList.remove('hidden');
            } else {
                pngOptions.classList.add('hidden');
            }
        });
    });
}

function handleExport() {
    const format = document.querySelector('input[name="export-format"]:checked').value;
    
    if (people.length === 0) {
        showError('No hay datos para exportar');
        return;
    }
    
    switch (format) {
        case 'svg':
            exportAsSVG();
            break;
        case 'png':
            exportAsPNG();
            break;
        case 'json':
            exportAsJSON();
            break;
    }
}

function exportAsSVG() {
    const svg = document.getElementById('family-tree').cloneNode(true);
    
    // Inline all styles
    const styles = `
        <style>
            .person-box { cursor: pointer; transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1); }
            .person-text { pointer-events: none; text-anchor: middle; dominant-baseline: central; font-size: 12px; fill: white; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .person-name-text { font-size: 13px; font-weight: 550; }
            .person-dates-text { font-size: 10px; opacity: 0.9; }
            .connection-line { stroke: #626c7c; stroke-width: 2; fill: none; }
            .marriage-line { stroke: #21808d; stroke-width: 2; fill: none; }
        </style>
    `;
    
    svg.insertAdjacentHTML('afterbegin', styles);
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadFile(blob, 'arbol-genealogico.svg');
    
    showSuccess('Árbol exportado como SVG');
}

function exportAsPNG() {
    const svg = document.getElementById('family-tree').cloneNode(true);
    const dpi = parseInt(document.getElementById('dpi-select').value);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get SVG dimensions
    const bbox = svg.getBBox();
    const scale = dpi / 72; // 72 DPI is the base
    
    canvas.width = bbox.width * scale;
    canvas.height = bbox.height * scale;
    
    // Create image from SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            downloadFile(blob, 'arbol-genealogico.png');
            URL.revokeObjectURL(url);
            showSuccess('Árbol exportado como PNG');
        });
    };
    
    img.src = url;
}

function exportAsJSON() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        people: people
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadFile(blob, 'arbol-genealogico.json');
    
    showSuccess('Datos exportados como JSON');
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import Functionality
function setupImportHandlers() {
    const fileInput = document.getElementById('file-input');
    const importArea = document.getElementById('import-area');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    importArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        importArea.querySelector('.drag-drop-zone').classList.add('drag-over');
    });
    
    importArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        importArea.querySelector('.drag-drop-zone').classList.remove('drag-over');
    });
    
    importArea.addEventListener('drop', (e) => {
        e.preventDefault();
        importArea.querySelector('.drag-drop-zone').classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileImport(files[0]);
        }
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileImport(file);
    }
}

function handleFileImport(file) {
    if (file.type !== 'application/json') {
        showError('Solo se pueden importar archivos JSON');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.people || !Array.isArray(data.people)) {
                showError('Formato de archivo JSON no válido');
                return;
            }
            
            if (confirm('¿Quieres importar estos datos? Esto reemplazará todos los datos actuales.')) {
                people = data.people;
                updateUI();
                showSuccess(`Importados ${people.length} personas correctamente`);
                
                // Switch to data tab
                document.querySelector('[data-tab="datos"]').click();
            }
        } catch (error) {
            showError('Error al leer el archivo JSON');
        }
    };
    
    reader.readAsText(file);
}

// Utility Functions
function getGenderColor(gender) {
    switch (gender) {
        case 'masculino': return '#6BA3D8';
        case 'femenino': return '#E991C5';
        default: return '#A0D995';
    }
}

function getGenderIcon(gender) {
    switch (gender) {
        case 'masculino': return '👨';
        case 'femenino': return '👩';
        default: return '👤';
    }
}

function formatPersonDates(person) {
    if (!person.nacimiento && !person.fallecimiento) return '';
    if (person.nacimiento && person.fallecimiento) return `${person.nacimiento} - ${person.fallecimiento}`;
    if (person.nacimiento) return `${person.nacimiento} - presente`;
    if (person.fallecimiento) return `fallecido en ${person.fallecimiento}`;
    return '';
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    successElement.textContent = message;
    successElement.classList.remove('hidden');
    
    setTimeout(() => {
        successElement.classList.add('hidden');
    }, 3000);
}