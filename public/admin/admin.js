// API Base URL
const API_BASE = '/api';
let authToken = localStorage.getItem('authToken') || '';

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Load data for the active tab
    loadTabData(tabName);
  });
});

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  const form = document.querySelector(`#${modalId} form`);
  if (form) form.reset();
}

// API helper function
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    showAlert(error.message, 'error');
    throw error;
  }
}

// Show alert
function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  const container = document.querySelector('.container');
  container.insertBefore(alert, container.firstChild);
  
  setTimeout(() => alert.remove(), 5000);
}

// Load tab data
async function loadTabData(tabName) {
  switch(tabName) {
    case 'document-types':
      await loadDocumentTypes();
      break;
    case 'roles':
      await loadRoles();
      break;
    case 'departments':
      await loadDepartments();
      break;
    case 'retention':
      await loadRetentionPolicies();
      break;
  }
}

// ==================== DOCUMENT TYPES ====================

async function loadDocumentTypes() {
  const container = document.getElementById('docTypesTable');
  container.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    const data = await apiRequest('/masters/document-types');
    
    if (data.documentTypes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Document Types</h3>
          <p>Click "Add Document Type" to create your first document type.</p>
        </div>
      `;
      return;
    }
    
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Required Fields</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.documentTypes.map(dt => `
            <tr>
              <td><strong>${dt.name}</strong></td>
              <td>${dt.description || '-'}</td>
              <td>${dt.requiredFields.length > 0 ? dt.requiredFields.join(', ') : 'None'}</td>
              <td><span class="badge badge-${dt.isActive ? 'active' : 'inactive'}">${dt.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-small btn-primary" onclick="editDocumentType('${dt.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteDocumentType('${dt.id}', '${dt.name}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><h3>Error loading document types</h3></div>';
  }
}

async function deleteDocumentType(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
  
  try {
    await apiRequest(`/masters/document-types/${id}`, 'DELETE');
    showAlert('Document type deleted successfully');
    loadDocumentTypes();
  } catch (error) {
    // Error already shown by apiRequest
  }
}

// Document Type Form Handler
document.getElementById('docTypeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    requiredFields: formData.get('requiredFields')
      ? formData.get('requiredFields').split(',').map(f => f.trim())
      : [],
    validationRules: {}
  };
  
  try {
    await apiRequest('/masters/document-types', 'POST', data);
    showAlert('Document type created successfully');
    closeModal('docTypeModal');
    loadDocumentTypes();
  } catch (error) {
    // Error already shown by apiRequest
  }
});

// ==================== USER ROLES ====================

async function loadRoles() {
  const container = document.getElementById('rolesTable');
  container.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    const data = await apiRequest('/masters/roles');
    
    // Populate permissions checkboxes
    const permissionsContainer = document.getElementById('permissionsCheckboxes');
    permissionsContainer.innerHTML = data.availablePermissions.map(perm => `
      <div class="checkbox-item">
        <input type="checkbox" name="permissions" value="${perm}" id="perm-${perm}">
        <label for="perm-${perm}" style="margin: 0;">${perm}</label>
      </div>
    `).join('');
    
    if (data.roles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No User Roles</h3>
          <p>Click "Add User Role" to create your first role.</p>
        </div>
      `;
      return;
    }
    
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.roles.map(role => `
            <tr>
              <td><strong>${role.roleName}</strong></td>
              <td>${role.description || '-'}</td>
              <td>${role.permissions.length > 0 ? role.permissions.join(', ') : 'None'}</td>
              <td><span class="badge badge-${role.isActive ? 'active' : 'inactive'}">${role.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-small btn-primary" onclick="editRole('${role.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteRole('${role.id}', '${role.roleName}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><h3>Error loading roles</h3></div>';
  }
}

async function deleteRole(id, name) {
  if (!confirm(`Are you sure you want to delete role "${name}"?`)) return;
  
  try {
    await apiRequest(`/masters/roles/${id}`, 'DELETE');
    showAlert('Role deleted successfully');
    loadRoles();
  } catch (error) {
    // Error already shown by apiRequest
  }
}

// Role Form Handler
document.getElementById('roleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
    .map(cb => cb.value);
  
  const data = {
    roleName: formData.get('roleName'),
    description: formData.get('description'),
    permissions
  };
  
  try {
    await apiRequest('/masters/roles', 'POST', data);
    showAlert('Role created successfully');
    closeModal('roleModal');
    loadRoles();
  } catch (error) {
    // Error already shown by apiRequest
  }
});

// ==================== DEPARTMENTS ====================

async function loadDepartments() {
  const container = document.getElementById('departmentsTable');
  container.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    const data = await apiRequest('/masters/departments');
    
    if (data.departments.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Departments</h3>
          <p>Click "Add Department" to create your first department.</p>
        </div>
      `;
      return;
    }
    
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.departments.map(dept => `
            <tr>
              <td><strong>${dept.name}</strong></td>
              <td>${dept.location || '-'}</td>
              <td>${dept.contactPerson || '-'}</td>
              <td>${dept.contactEmail || '-'}</td>
              <td>${dept.contactPhone || '-'}</td>
              <td><span class="badge badge-${dept.isActive ? 'active' : 'inactive'}">${dept.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-small btn-primary" onclick="editDepartment('${dept.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteDepartment('${dept.id}', '${dept.name}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><h3>Error loading departments</h3></div>';
  }
}

async function deleteDepartment(id, name) {
  if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;
  
  try {
    await apiRequest(`/masters/departments/${id}`, 'DELETE');
    showAlert('Department deleted successfully');
    loadDepartments();
  } catch (error) {
    // Error already shown by apiRequest
  }
}

// Department Form Handler
document.getElementById('deptForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    location: formData.get('location'),
    contactPerson: formData.get('contactPerson'),
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone')
  };
  
  try {
    await apiRequest('/masters/departments', 'POST', data);
    showAlert('Department created successfully');
    closeModal('deptModal');
    loadDepartments();
  } catch (error) {
    // Error already shown by apiRequest
  }
});

// ==================== RETENTION POLICIES ====================

async function loadRetentionPolicies() {
  const container = document.getElementById('retentionTable');
  container.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    const data = await apiRequest('/masters/retention-policies');
    
    // Also load document types for the dropdown
    const docTypes = await apiRequest('/masters/document-types');
    const docTypeSelect = document.getElementById('docTypeSelect');
    docTypeSelect.innerHTML = '<option value="">Select Document Type</option>' +
      docTypes.documentTypes.map(dt => `<option value="${dt.id}">${dt.name}</option>`).join('');
    
    if (data.policies.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Retention Policies</h3>
          <p>Click "Add Retention Policy" to create your first policy.</p>
        </div>
      `;
      return;
    }
    
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Document Type</th>
            <th>Retention Period</th>
            <th>Archive After</th>
            <th>Auto-Delete</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.policies.map(policy => `
            <tr>
              <td><strong>${policy.documentTypeName}</strong></td>
              <td>${policy.retentionPeriodMonths} months</td>
              <td>${policy.archiveAfterMonths ? policy.archiveAfterMonths + ' months' : '-'}</td>
              <td>${policy.autoDeleteEnabled ? '✓ Yes' : '✗ No'}</td>
              <td><span class="badge badge-${policy.isActive ? 'active' : 'inactive'}">${policy.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-small btn-primary" onclick="editRetentionPolicy('${policy.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteRetentionPolicy('${policy.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><h3>Error loading retention policies</h3></div>';
  }
}

async function deleteRetentionPolicy(id) {
  if (!confirm('Are you sure you want to delete this retention policy?')) return;
  
  try {
    await apiRequest(`/masters/retention-policies/${id}`, 'DELETE');
    showAlert('Retention policy deleted successfully');
    loadRetentionPolicies();
  } catch (error) {
    // Error already shown by apiRequest
  }
}

// Retention Policy Form Handler
document.getElementById('retentionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const docTypeId = formData.get('documentTypeId');
  const docTypeSelect = document.getElementById('docTypeSelect');
  const docTypeName = docTypeSelect.options[docTypeSelect.selectedIndex].text;
  
  const data = {
    documentTypeId: docTypeId,
    documentTypeName: docTypeName,
    retentionPeriodMonths: parseInt(formData.get('retentionPeriodMonths')),
    archiveAfterMonths: formData.get('archiveAfterMonths') ? parseInt(formData.get('archiveAfterMonths')) : null,
    description: formData.get('description'),
    autoDeleteEnabled: formData.get('autoDeleteEnabled') === 'on'
  };
  
  try {
    await apiRequest('/masters/retention-policies', 'POST', data);
    showAlert('Retention policy created successfully');
    closeModal('retentionModal');
    loadRetentionPolicies();
  } catch (error) {
    // Error already shown by apiRequest
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check for auth token
  if (!authToken) {
    alert('Please login first');
    window.location.href = '/login.html';
    return;
  }
  
  // Load initial tab data
  loadDocumentTypes();
});
