/**
 * ==============================================================================
 * DAILY PROBLEM RECORDING AND ANALYSIS SYSTEM
 * Frontend Application Script (Vanilla JavaScript + LocalStorage)
 * ==============================================================================
 * 
 * This file manages:
 * 1. Pre-seeding realistic college sample problems into browser LocalStorage.
 * 2. User authentication & role switching (Student, Administrator, Department Staff).
 * 3. Dynamic rendering of metrics, problem cards, master tables, and queue.
 * 4. Submitting new issues with auto-generated IDs and timestamps.
 * 5. Admin management (assignment, status modification, search & filtering).
 * 6. Staff workflows (status updates, resolution notes/remarks).
 * 7. Modals and toast notifications.
 */

// Global Storage Keys
const STORAGE_KEY_PROBLEMS = 'dpras_problems';
const STORAGE_KEY_USER = 'dpras_current_user';

// Pre-seeded College Problems for Hackathon Demonstration
const INITIAL_SAMPLE_PROBLEMS = [
  {
    id: 'PRB-1001',
    title: 'Projector HDMI port damaged and ceiling fan wobbling',
    category: 'IT & Computer Labs',
    priority: 'High',
    location: 'APJ Abdul Kalam Block, 3rd Floor, Lab 304',
    reporterName: 'Rahul Sharma (CSE-03)',
    reporterId: '2024BCSE102',
    description: 'During the Machine Learning lab session, the ceiling-mounted projector HDMI port broke. Also, the overhead fan directly above workstation 14 is making a loud rattling noise and wobbling.',
    date: '2026-11-03 09:30 AM',
    timestamp: Date.now() - (4 * 3600 * 1000), // 4 hours ago
    status: 'In Progress',
    assignedDept: 'IT & Computer Labs',
    staffRemarks: 'IT Technician Vikash inspected at 11:15 AM. Ordered new HDMI wall plate; repair scheduled by 4:00 PM today.',
    attachmentHint: 'Image registered with lab attendant.'
  },
  {
    id: 'PRB-1002',
    title: 'Water pipe joint burst causing floor flooding',
    category: 'Maintenance & Estate',
    priority: 'Critical',
    location: 'Boys Hostel 2 (Narmada), 2nd Floor Washroom',
    reporterName: 'Amit Verma (ME-02)',
    reporterId: '2023BME045',
    description: 'The main inlet PVC pipe joint in washroom B broke at 7 AM. Water is overflowing into the corridor, creating a slipping hazard near room 214.',
    date: '2026-11-03 07:15 AM',
    timestamp: Date.now() - (12 * 3600 * 1000),
    status: 'Pending',
    assignedDept: 'Maintenance & Estate',
    staffRemarks: '',
    attachmentHint: 'Warden notified via WhatsApp.'
  },
  {
    id: 'PRB-1003',
    title: 'Campus WiFi router dropping connection intermittently',
    category: 'IT & Computer Labs',
    priority: 'Medium',
    location: 'Central Library, 2nd Floor Reading Room',
    reporterName: 'Sneha Patel (ECE-04)',
    reporterId: '2023BECE088',
    description: 'The Access Point "Apex-Lib-West" keeps disconnecting every 5-10 minutes. More than 40 students studying for semester exams cannot access digital journals.',
    date: '2026-11-02 03:45 PM',
    timestamp: Date.now() - (24 * 3600 * 1000),
    status: 'In Progress',
    assignedDept: 'IT & Computer Labs',
    staffRemarks: 'Network team diagnosed IP pool exhaustion on DHCP server. Firmware upgrade pending.',
    attachmentHint: 'Ping test screenshot taken.'
  },
  {
    id: 'PRB-1004',
    title: 'Commercial Water Cooler cooling unit failed',
    category: 'Hostel & Mess',
    priority: 'High',
    location: 'Girls Hostel 1 (Ganga) Ground Floor Dining Hall',
    reporterName: 'Priya Nair (BT-03)',
    reporterId: '2024BBT019',
    description: 'The main drinking water cooler is dispensing warm water since yesterday evening. Compressor makes humming sounds without cooling.',
    date: '2026-11-02 11:20 AM',
    timestamp: Date.now() - (30 * 3600 * 1000),
    status: 'Resolved',
    assignedDept: 'Hostel & Mess',
    staffRemarks: 'Refrigeration technician replaced faulty thermostat and recharged refrigerant gas. Tested water temperature at 14°C.',
    attachmentHint: ''
  },
  {
    id: 'PRB-1005',
    title: 'Bench frame cracked and protruding sharp metal edge',
    category: 'Maintenance & Estate',
    priority: 'Medium',
    location: 'Mechanical Block, Lecture Hall 102 (Row 4)',
    reporterName: 'Rahul Sharma (CSE-03)',
    reporterId: '2024BCSE102',
    description: 'The wooden seat has detached from the cast iron frame. A sharp metal edge tore a student jacket today during the morning lecture.',
    date: '2026-11-01 01:10 PM',
    timestamp: Date.now() - (50 * 3600 * 1000),
    status: 'Pending',
    assignedDept: 'Maintenance & Estate',
    staffRemarks: '',
    attachmentHint: ''
  },
  {
    id: 'PRB-1006',
    title: 'Flickering LED tube lights and power socket failure',
    category: 'Electrical & Power',
    priority: 'Low',
    location: 'Aryabhatta Science Block, Room 205',
    reporterName: 'Ananya Sen (CIVIL-01)',
    reporterId: '2025BCIV012',
    description: 'Two tube lights are constantly flickering, causing eye strain during evening tutorial sessions. Switchboard 3 also has no power.',
    date: '2026-10-31 04:30 PM',
    timestamp: Date.now() - (72 * 3600 * 1000),
    status: 'Resolved',
    assignedDept: 'Electrical & Power',
    staffRemarks: 'Electrician Mr. Ram switched out the burnt choke ballast and rewired terminal 3.',
    attachmentHint: ''
  },
  {
    id: 'PRB-1007',
    title: 'Microphone feedback & audio distortion during guest lectures',
    category: 'Academics & Exams',
    priority: 'Medium',
    location: 'Main Campus Auditorium, Control Booth',
    reporterName: 'Karthik Rao (EEE-03)',
    reporterId: '2024BEEE065',
    description: 'Wireless collar mic channel 2 experiences high screeching feedback whenever speaker walks near the podium podium screen.',
    date: '2026-10-30 10:00 AM',
    timestamp: Date.now() - (96 * 3600 * 1000),
    status: 'Resolved',
    assignedDept: 'IT & Computer Labs',
    staffRemarks: 'Equalizer adjusted and frequency channel shifted from 520MHz to 534MHz to prevent RF interference.',
    attachmentHint: ''
  }
];

// Current State
let currentUser = {
  role: 'student',
  name: 'Rahul Sharma (CSE-03)',
  email: 'rahul.cse24@apex.edu',
  dept: 'Student Council'
};

let activeStudentFilter = 'All';
let activeStaffFilter = 'All';
let activeStaffDept = 'Maintenance & Estate';
let activeActionProblemId = null;

/* ==============================================================================
   LOCAL STORAGE CONTROLLER
   ============================================================================== */

/**
 * Initializes problem data in localStorage if absent.
 */
function initializeStorage() {
  const existing = localStorage.getItem(STORAGE_KEY_PROBLEMS);
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem(STORAGE_KEY_PROBLEMS, JSON.stringify(INITIAL_SAMPLE_PROBLEMS));
  }

  // Restore session user if present
  const savedUser = localStorage.getItem(STORAGE_KEY_USER);
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
}

/**
 * Retrieve all problems array from localStorage.
 */
function getProblems() {
  const data = localStorage.getItem(STORAGE_KEY_PROBLEMS);
  return data ? JSON.parse(data) : [];
}

/**
 * Save problems array to localStorage.
 */
function saveProblems(problems) {
  localStorage.setItem(STORAGE_KEY_PROBLEMS, JSON.stringify(problems));
}

/**
 * Add a new problem to the store.
 */
function addProblem(newProblem) {
  const problems = getProblems();
  problems.unshift(newProblem); // newest first
  saveProblems(problems);
}

/**
 * Update an existing problem by ID.
 */
function updateProblem(id, updates) {
  const problems = getProblems();
  const index = problems.findIndex(p => p.id === id);
  if (index !== -1) {
    problems[index] = { ...problems[index], ...updates };
    saveProblems(problems);
    return true;
  }
  return false;
}

/**
 * Delete a problem by ID.
 */
function deleteProblem(id) {
  let problems = getProblems();
  problems = problems.filter(p => p.id !== id);
  saveProblems(problems);
}

/**
 * Reset demo data back to default sample problems.
 */
function resetDemoData() {
  if (confirm('Restore default sample college problems? This will reset all demo data.')) {
    localStorage.setItem(STORAGE_KEY_PROBLEMS, JSON.stringify(INITIAL_SAMPLE_PROBLEMS));
    refreshCurrentView();
    showToast('Demo Data Reset', 'Default college problem records restored successfully.', 'success');
  }
}

/* ==============================================================================
   VIEW & NAVIGATION ROUTER
   ============================================================================== */

/**
 * Switches the displayed screen/dashboard.
 * @param {string} viewName - 'login', 'student', 'admin', or 'staff'
 */
function switchView(viewName) {
  const header = document.getElementById('main-header');
  const loginView = document.getElementById('login-view');
  const studentView = document.getElementById('student-view');
  const adminView = document.getElementById('admin-view');
  const staffView = document.getElementById('staff-view');

  // Hide all sections first
  loginView.classList.add('hidden');
  studentView.classList.add('hidden');
  adminView.classList.add('hidden');
  staffView.classList.add('hidden');

  // Update switcher button highlights
  const switchBtns = document.querySelectorAll('.switch-btn');
  switchBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === viewName);
  });

  if (viewName === 'login') {
    header.classList.add('hidden');
    loginView.classList.remove('hidden');
    return;
  }

  // Dashboard view requested: show header
  header.classList.remove('hidden');
  updateNavUserProfile();

  switch (viewName) {
    case 'student':
      studentView.classList.remove('hidden');
      renderStudentDashboard();
      break;
    case 'admin':
      adminView.classList.remove('hidden');
      renderAdminDashboard();
      break;
    case 'staff':
      staffView.classList.remove('hidden');
      renderStaffDashboard();
      break;
    default:
      loginView.classList.remove('hidden');
      header.classList.add('hidden');
  }
}

/**
 * Updates top navigation avatar, name, and role badge.
 */
function updateNavUserProfile() {
  const avatar = document.getElementById('nav-user-avatar');
  const name = document.getElementById('nav-user-name');
  const badge = document.getElementById('nav-user-badge');

  if (currentUser.role === 'student') {
    avatar.textContent = 'S';
    avatar.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    name.textContent = currentUser.name || 'Rahul Sharma';
    badge.textContent = 'Student (CSE-3)';
  } else if (currentUser.role === 'admin') {
    avatar.textContent = 'A';
    avatar.style.background = 'linear-gradient(135deg, #1e40af, #0f2b5c)';
    name.textContent = currentUser.name || 'Dr. V. Sharma (Dean)';
    badge.textContent = 'Campus Admin';
  } else if (currentUser.role === 'staff') {
    avatar.textContent = 'E';
    avatar.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
    name.textContent = currentUser.name || 'Estate & IT Desk';
    badge.textContent = 'Dept Staff';
  }
}

/**
 * Re-renders whichever view is currently active.
 */
function refreshCurrentView() {
  if (currentUser.role === 'student') {
    renderStudentDashboard();
  } else if (currentUser.role === 'admin') {
    renderAdminDashboard();
  } else if (currentUser.role === 'staff') {
    renderStaffDashboard();
  }
}

/* ==============================================================================
   VIEW 1: AUTHENTICATION & LOGIN CONTROLLER
   ============================================================================== */

function setupAuth() {
  const roleRadios = document.querySelectorAll('input[name="loginRole"]');
  const roleCards = document.querySelectorAll('.role-card');
  const loginForm = document.getElementById('login-form');
  const loginIdInput = document.getElementById('login-id');
  const quickPills = document.querySelectorAll('.quick-pill');
  const logoutBtn = document.getElementById('btn-logout');

  // Role card selection visual update
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      // Update placeholder according to role
      const role = card.getAttribute('data-role');
      if (role === 'student') {
        loginIdInput.placeholder = 'e.g. 2024BCSE102 / rahul@apex.edu';
      } else if (role === 'admin') {
        loginIdInput.placeholder = 'e.g. admin.dean@apex.edu';
      } else {
        loginIdInput.placeholder = 'e.g. maintenance.staff@apex.edu';
      }
    });
  });

  // Handle standard login submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedRadio = document.querySelector('input[name="loginRole"]:checked');
    const role = selectedRadio ? selectedRadio.value : 'student';
    const loginId = loginIdInput.value.trim() || 'User';

    setUserSessionByRole(role, loginId);
    showToast('Signed In', `Logged in as ${currentUser.name} (${role.toUpperCase()})`, 'success');
    switchView(role);
  });

  // Handle 1-Click Instant Demo Login Pills
  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const quickRole = pill.getAttribute('data-quick');
      setUserSessionByRole(quickRole);
      showToast('Quick Demo Login', `Switched to ${quickRole.toUpperCase()} environment.`, 'success');
      switchView(quickRole);
    });
  });

  // Top bar Demo Switcher buttons
  document.querySelectorAll('.switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-target');
      setUserSessionByRole(targetRole);
      switchView(targetRole);
      showToast('Role Switched', `Viewing as ${targetRole.toUpperCase()}`, 'info');
    });
  });

  // Logout button
  logoutBtn.addEventListener('click', () => {
    switchView('login');
    showToast('Logged Out', 'Returned to campus portal sign-in.', 'info');
  });

  // Reset Demo Data button
  document.getElementById('btn-reset-data').addEventListener('click', resetDemoData);
}

/**
 * Configure user profile info based on selected role
 */
function setUserSessionByRole(role, customId = '') {
  currentUser.role = role;
  if (role === 'student') {
    currentUser.name = customId && customId.includes('@') ? customId.split('@')[0] : 'Rahul Sharma (CSE-03)';
    currentUser.email = 'rahul.cse24@apex.edu';
    currentUser.dept = 'Computer Science & Eng';
  } else if (role === 'admin') {
    currentUser.name = 'Dr. Vikram Sharma (Dean)';
    currentUser.email = 'dean.studentaffairs@apex.edu';
    currentUser.dept = 'Central Administration';
  } else if (role === 'staff') {
    currentUser.name = 'Prof. S. Rao (Estate Desk)';
    currentUser.email = 'maintenance.lead@apex.edu';
    currentUser.dept = 'Maintenance & Estate';
  }
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
}

/* ==============================================================================
   VIEW 2: STUDENT DASHBOARD CONTROLLER
   ============================================================================== */

function setupStudentView() {
  const form = document.getElementById('problem-form');
  const filterTabs = document.querySelectorAll('#student-filter-tabs .filter-tab');

  // Submit problem form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('prob-title').value.trim();
    const category = document.getElementById('prob-category').value;
    const priority = document.getElementById('prob-priority').value;
    const location = document.getElementById('prob-location').value.trim();
    const description = document.getElementById('prob-description').value.trim();
    const photoHint = document.getElementById('prob-photo-hint').value.trim();

    if (!title || !category || !priority || !location || !description) {
      showToast('Validation Error', 'Please complete all required fields (*).', 'error');
      return;
    }

    // Auto-generate Next Problem ID: PRB-1008, etc.
    const problems = (typeof apiFetchComplaints === 'function') ? await apiFetchComplaints() : getProblems();
    let maxIdNum = 1000;
    problems.forEach(p => {
      const num = parseInt(p.id.replace('PRB-', ''), 10);
      if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
    });
    const newId = `PRB-${maxIdNum + 1}`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newProblem = {
      id: newId,
      title: title,
      category: category,
      priority: priority,
      location: location,
      reporterName: currentUser.name,
      reporterId: '2024BCSE102',
      description: description,
      date: formattedDate,
      timestamp: Date.now(),
      status: 'Pending',
      assignedDept: category, // automatically defaults to selected department
      staffRemarks: '',
      attachmentHint: photoHint || 'Logged online'
    };

    if (typeof apiSubmitComplaint === 'function') {
      await apiSubmitComplaint(newProblem);
    } else {
      addProblem(newProblem);
    }

    form.reset();
    document.getElementById('prob-reporter-name').value = currentUser.name;

    await renderStudentDashboard();
    showToast('Problem Registered!', `Ticket #${newId} recorded. Assigned to ${category}.`, 'success');
  });

  // Filter tabs for student
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeStudentFilter = tab.getAttribute('data-filter');
      renderStudentDashboard();
    });
  });
}

/**
 * Render Student Dashboard data, metrics, and problem cards
 */
async function renderStudentDashboard() {
  const problems = (typeof apiFetchComplaints === 'function') ? await apiFetchComplaints() : getProblems();
  const listContainer = document.getElementById('student-problems-list');
  const countPill = document.getElementById('student-card-count');

  // Filter for student's own submissions (or all sample submissions matching reporter / demo)
  const studentProblems = problems.filter(p => {
    // In a live demo, we show student items reported by Rahul Sharma or all if testing
    return true; 
  });

  // Calculate metrics
  const total = studentProblems.length;
  const pending = studentProblems.filter(p => p.status === 'Pending').length;
  const inProgress = studentProblems.filter(p => p.status === 'In Progress').length;
  const resolved = studentProblems.filter(p => p.status === 'Resolved').length;

  document.getElementById('student-stat-total').textContent = total;
  document.getElementById('student-stat-pending').textContent = pending;
  document.getElementById('student-stat-progress').textContent = inProgress;
  document.getElementById('student-stat-resolved').textContent = resolved;

  // Apply tab filter
  let filtered = studentProblems;
  if (activeStudentFilter !== 'All') {
    filtered = studentProblems.filter(p => p.status === activeStudentFilter);
  }

  countPill.textContent = `${filtered.length} ${filtered.length === 1 ? 'ticket' : 'tickets'}`;

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <h3>No Problems Found</h3>
        <p>No issues match the "${activeStudentFilter}" filter. Submit a new issue on the left!</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(prob => {
    const statusBorderClass = prob.status === 'Resolved' ? 'border-resolved' :
                             prob.status === 'In Progress' ? 'border-progress' : 'border-pending';

    const statusBadgeClass = prob.status === 'Resolved' ? 'badge-resolved' :
                            prob.status === 'In Progress' ? 'badge-progress' : 'badge-pending';

    const priorityBadgeClass = `badge-${prob.priority.toLowerCase()}`;

    return `
      <div class="problem-card ${statusBorderClass}">
        <div class="card-top-row">
          <div>
            <div class="card-id-category">
              <span class="badge-id">${prob.id}</span>
              <span class="badge badge-dept"><i class="fa-solid fa-building-columns"></i> ${escapeHtml(prob.category)}</span>
              <span class="badge ${priorityBadgeClass}"><i class="fa-solid fa-flag"></i> ${prob.priority}</span>
            </div>
            <h3 class="card-title">${escapeHtml(prob.title)}</h3>
          </div>
          <span class="badge ${statusBadgeClass}">${escapeHtml(prob.status)}</span>
        </div>

        <p class="card-desc">${escapeHtml(prob.description)}</p>

        <div class="card-meta-row">
          <span class="card-meta-item"><i class="fa-solid fa-location-dot text-primary"></i> ${escapeHtml(prob.location)}</span>
          <span class="card-meta-item"><i class="fa-regular fa-clock"></i> ${escapeHtml(prob.date)}</span>
          <span class="card-meta-item"><i class="fa-solid fa-user-tag"></i> ${escapeHtml(prob.reporterName)}</span>
        </div>

        ${prob.staffRemarks ? `
          <div class="card-remarks-box">
            <strong><i class="fa-solid fa-wrench"></i> Resolution Update:</strong> ${escapeHtml(prob.staffRemarks)}
          </div>
        ` : ''}

        <div class="card-actions-row">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Assigned to: <strong>${escapeHtml(prob.assignedDept || prob.category)}</strong></span>
          <button class="btn-outline-sm btn-view-detail" data-id="${prob.id}">
            <i class="fa-regular fa-eye"></i> View Full Details
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach view detail click listeners
  listContainer.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openDetailModal(id);
    });
  });
}

/* ==============================================================================
   VIEW 3: ADMINISTRATOR DASHBOARD CONTROLLER
   ============================================================================= */

function setupAdminView() {
  const searchInput = document.getElementById('admin-search-input');
  const deptFilter = document.getElementById('admin-filter-dept');
  const statusFilter = document.getElementById('admin-filter-status');
  const priorityFilter = document.getElementById('admin-filter-priority');

  const triggerAdminFilter = () => {
    renderAdminDashboard();
  };

  searchInput.addEventListener('input', triggerAdminFilter);
  deptFilter.addEventListener('change', triggerAdminFilter);
  statusFilter.addEventListener('change', triggerAdminFilter);
  priorityFilter.addEventListener('change', triggerAdminFilter);
}

/**
 * Render Administrator Dashboard metrics, analytics, and master table
 */
async function renderAdminDashboard() {
  const problems = (typeof apiFetchComplaints === 'function') ? await apiFetchComplaints() : getProblems();
  const search = document.getElementById('admin-search-input').value.toLowerCase().trim();
  const dept = document.getElementById('admin-filter-dept').value;
  const status = document.getElementById('admin-filter-status').value;
  const priority = document.getElementById('admin-filter-priority').value;

  // Calculate high level metrics
  const total = problems.length;
  const pending = problems.filter(p => p.status === 'Pending').length;
  const inProgress = problems.filter(p => p.status === 'In Progress').length;
  const resolved = problems.filter(p => p.status === 'Resolved').length;
  const critical = problems.filter(p => p.priority === 'Critical' || p.priority === 'High').length;

  document.getElementById('admin-stat-total').textContent = total;
  document.getElementById('admin-stat-pending').textContent = pending;
  document.getElementById('admin-stat-progress').textContent = inProgress;
  document.getElementById('admin-stat-resolved').textContent = resolved;
  document.getElementById('admin-critical-count').textContent = critical;

  // Calculate resolution completion rate
  const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  document.getElementById('admin-resolution-rate-bar').style.width = `${completionRate}%`;
  document.getElementById('admin-resolution-rate-text').textContent = `${completionRate}% Issues Resolved (${resolved} of ${total})`;

  // Calculate most active department
  const deptCounts = {};
  problems.forEach(p => {
    const d = p.assignedDept || p.category;
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });
  let topDept = 'Maintenance & Estate';
  let topCount = 0;
  for (const d in deptCounts) {
    if (deptCounts[d] > topCount) {
      topCount = deptCounts[d];
      topDept = d;
    }
  }
  document.getElementById('admin-top-dept').textContent = topDept;

  // Filter problems for Table
  let filtered = problems.filter(p => {
    const matchesSearch = !search ||
      p.id.toLowerCase().includes(search) ||
      p.title.toLowerCase().includes(search) ||
      p.location.toLowerCase().includes(search) ||
      p.reporterName.toLowerCase().includes(search);

    const matchesDept = dept === 'All' || (p.assignedDept === dept || p.category === dept);
    const matchesStatus = status === 'All' || p.status === status;
    const matchesPriority = priority === 'All' || p.priority === priority;

    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

  const tableBody = document.getElementById('admin-table-body');

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <i class="fa-solid fa-filter-circle-xmark"></i>
            <h3>No matching problem records found</h3>
            <p>Try clearing filters or search terms.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(prob => {
    const statusBadgeClass = prob.status === 'Resolved' ? 'badge-resolved' :
                            prob.status === 'In Progress' ? 'badge-progress' : 'badge-pending';
    const priorityBadgeClass = `badge-${prob.priority.toLowerCase()}`;

    return `
      <tr>
        <td><strong class="badge-id">${prob.id}</strong></td>
        <td><small style="color: var(--text-muted);">${escapeHtml(prob.date)}</small></td>
        <td style="max-width: 260px;">
          <span class="table-prob-title">${escapeHtml(prob.title)}</span>
          <span class="table-prob-reporter"><i class="fa-regular fa-user"></i> ${escapeHtml(prob.reporterName)}</span>
        </td>
        <td><span class="badge badge-dept">${escapeHtml(prob.category)}</span></td>
        <td><small><i class="fa-solid fa-location-dot text-primary"></i> ${escapeHtml(prob.location)}</small></td>
        <td><span class="badge ${priorityBadgeClass}">${prob.priority}</span></td>
        <td><span class="badge ${statusBadgeClass}">${prob.status}</span></td>
        <td><strong>${escapeHtml(prob.assignedDept || prob.category)}</strong></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon btn-admin-view" data-id="${prob.id}" title="View Full Problem">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn-icon btn-admin-edit" data-id="${prob.id}" title="Assign & Update Status">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon btn-danger btn-admin-del" data-id="${prob.id}" title="Delete Record">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Table action buttons bindings
  tableBody.querySelectorAll('.btn-admin-view').forEach(btn => {
    btn.addEventListener('click', () => openDetailModal(btn.getAttribute('data-id')));
  });

  tableBody.querySelectorAll('.btn-admin-edit').forEach(btn => {
    btn.addEventListener('click', () => openActionModal(btn.getAttribute('data-id')));
  });

  tableBody.querySelectorAll('.btn-admin-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`Are you sure you want to delete problem record ${id}?`)) {
        if (typeof apiDeleteComplaint === 'function') {
          await apiDeleteComplaint(id);
        } else {
          deleteProblem(id);
        }
        await renderAdminDashboard();
        showToast('Problem Deleted', `Record ${id} was deleted from database.`, 'warning');
      }
    });
  });
}

/* ==============================================================================
   VIEW 4: DEPARTMENT STAFF DASHBOARD CONTROLLER
   ============================================================================== */

function setupStaffView() {
  const deptSelector = document.getElementById('staff-dept-selector');
  const filterTabs = document.querySelectorAll('#staff-filter-tabs .filter-tab');

  deptSelector.addEventListener('change', () => {
    activeStaffDept = deptSelector.value;
    renderStaffDashboard();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeStaffFilter = tab.getAttribute('data-filter');
      renderStaffDashboard();
    });
  });
}

/**
 * Render Staff Dashboard work queue and department metrics
 */
async function renderStaffDashboard() {
  const problems = (typeof apiFetchComplaints === 'function') ? await apiFetchComplaints() : getProblems();
  const container = document.getElementById('staff-problems-container');

  // Filter problems for active department desk
  let deptProblems = problems;
  if (activeStaffDept !== 'All') {
    deptProblems = problems.filter(p => (p.assignedDept === activeStaffDept || p.category === activeStaffDept));
  }

  // Calculate staff metrics
  const total = deptProblems.length;
  const pending = deptProblems.filter(p => p.status === 'Pending').length;
  const inProgress = deptProblems.filter(p => p.status === 'In Progress').length;
  const resolved = deptProblems.filter(p => p.status === 'Resolved').length;

  document.getElementById('staff-stat-total').textContent = total;
  document.getElementById('staff-stat-pending').textContent = pending;
  document.getElementById('staff-stat-progress').textContent = inProgress;
  document.getElementById('staff-stat-resolved').textContent = resolved;

  // Apply tab filter (All, Pending, In Progress, Resolved)
  let filtered = deptProblems;
  if (activeStaffFilter !== 'All') {
    filtered = deptProblems.filter(p => p.status === activeStaffFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-mug-hot"></i>
        <h3>All Clear! No Assigned Tasks</h3>
        <p>There are no issues under "${activeStaffDept}" matching "${activeStaffFilter}".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(prob => {
    const statusBadgeClass = prob.status === 'Resolved' ? 'badge-resolved' :
                            prob.status === 'In Progress' ? 'badge-progress' : 'badge-pending';
    const priorityBadgeClass = `badge-${prob.priority.toLowerCase()}`;

    return `
      <div class="staff-task-card">
        <div>
          <div class="staff-card-header">
            <span class="badge-id">${prob.id}</span>
            <div style="display: flex; gap: 0.35rem;">
              <span class="badge ${priorityBadgeClass}"><i class="fa-solid fa-flag"></i> ${prob.priority}</span>
              <span class="badge ${statusBadgeClass}">${prob.status}</span>
            </div>
          </div>

          <div class="staff-card-body">
            <h3>${escapeHtml(prob.title)}</h3>
            <p>${escapeHtml(prob.description)}</p>

            <div class="staff-meta">
              <span class="staff-meta-row"><i class="fa-solid fa-location-dot text-primary"></i> <strong>Location:</strong> ${escapeHtml(prob.location)}</span>
              <span class="staff-meta-row"><i class="fa-regular fa-clock"></i> <strong>Reported:</strong> ${escapeHtml(prob.date)}</span>
              <span class="staff-meta-row"><i class="fa-solid fa-user"></i> <strong>Reporter:</strong> ${escapeHtml(prob.reporterName)}</span>
              ${prob.staffRemarks ? `
                <div style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed var(--border-light); color: var(--primary-navy);">
                  <strong><i class="fa-solid fa-pencil"></i> Staff Notes:</strong> ${escapeHtml(prob.staffRemarks)}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="staff-card-footer">
          <button class="btn-sm btn-primary-sm btn-staff-progress" data-id="${prob.id}">
            <i class="fa-solid fa-play"></i> In Progress
          </button>
          <button class="btn-sm btn-success-sm btn-staff-resolve" data-id="${prob.id}">
            <i class="fa-solid fa-check"></i> Mark Resolved
          </button>
          <button class="btn-sm btn-outline-sm btn-staff-remark" data-id="${prob.id}" title="Add remarks or reassign">
            <i class="fa-solid fa-comment-dots"></i> Update
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Quick action listeners for staff
  container.querySelectorAll('.btn-staff-progress').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const remarks = `Staff acknowledged and inspection started at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
      if (typeof apiUpdateComplaintStatus === 'function') {
        await apiUpdateComplaintStatus(id, 'In Progress', remarks);
      } else {
        updateProblem(id, { 
          status: 'In Progress',
          staffRemarks: remarks
        });
      }
      await renderStaffDashboard();
      showToast('Status Updated', `Problem ${id} marked as In Progress.`, 'info');
    });
  });

  container.querySelectorAll('.btn-staff-resolve').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const remarks = `Fixed & certified operational by department staff on ${new Date().toLocaleDateString()}.`;
      if (typeof apiUpdateComplaintStatus === 'function') {
        await apiUpdateComplaintStatus(id, 'Resolved', remarks);
      } else {
        updateProblem(id, { 
          status: 'Resolved',
          staffRemarks: remarks
        });
      }
      await renderStaffDashboard();
      showToast('Resolved!', `Problem ${id} successfully marked as Resolved.`, 'success');
    });
  });

  container.querySelectorAll('.btn-staff-remark').forEach(btn => {
    btn.addEventListener('click', () => {
      openActionModal(btn.getAttribute('data-id'));
    });
  });
}

/* ==============================================================================
   MODALS CONTROLLER
   ============================================================================== */

/**
 * Open Problem Full Details Modal
 */
function openDetailModal(problemId) {
  const problems = getProblems();
  const prob = problems.find(p => p.id === problemId);
  if (!prob) return;

  const modal = document.getElementById('detail-modal');

  document.getElementById('modal-id').textContent = prob.id;
  document.getElementById('modal-title').textContent = prob.title;
  document.getElementById('modal-category').textContent = prob.category;
  document.getElementById('modal-student').textContent = `${prob.reporterName} (${prob.reporterId || 'Student'})`;
  document.getElementById('modal-date').textContent = prob.date;
  document.getElementById('modal-location').textContent = prob.location;
  document.getElementById('modal-description').textContent = prob.description;

  const priorityBadge = document.getElementById('modal-priority-badge');
  priorityBadge.textContent = prob.priority;
  priorityBadge.className = `badge badge-${prob.priority.toLowerCase()}`;

  const statusBadge = document.getElementById('modal-status-badge');
  statusBadge.textContent = prob.status;
  statusBadge.className = `badge ${prob.status === 'Resolved' ? 'badge-resolved' : prob.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`;

  document.getElementById('modal-assigned-dept').textContent = prob.assignedDept || prob.category;

  const remarksBox = document.getElementById('modal-remarks-content');
  if (prob.staffRemarks) {
    remarksBox.textContent = prob.staffRemarks;
    remarksBox.style.fontStyle = 'normal';
  } else {
    remarksBox.textContent = 'No staff resolution notes or activity logged yet.';
    remarksBox.style.fontStyle = 'italic';
  }

  modal.classList.remove('hidden');
}

/**
 * Open Problem Status / Remarks Update Modal
 */
function openActionModal(problemId) {
  const problems = getProblems();
  const prob = problems.find(p => p.id === problemId);
  if (!prob) return;

  activeActionProblemId = problemId;
  const modal = document.getElementById('action-modal');

  document.getElementById('action-modal-id').textContent = prob.id;
  document.getElementById('action-modal-title').textContent = prob.title;
  document.getElementById('action-status-select').value = prob.status;
  document.getElementById('action-dept-select').value = prob.assignedDept || prob.category;
  document.getElementById('action-remarks-input').value = prob.staffRemarks || '';

  modal.classList.remove('hidden');
}

/**
 * Modal listeners setup
 */
function setupModals() {
  const detailModal = document.getElementById('detail-modal');
  const actionModal = document.getElementById('action-modal');

  // Close Detail Modal
  document.getElementById('btn-close-detail-modal').addEventListener('click', () => {
    detailModal.classList.add('hidden');
  });
  document.getElementById('btn-close-detail-modal-footer').addEventListener('click', () => {
    detailModal.classList.add('hidden');
  });

  // Close Action Modal
  document.getElementById('btn-close-action-modal').addEventListener('click', () => {
    actionModal.classList.add('hidden');
  });
  document.getElementById('btn-cancel-action-modal').addEventListener('click', () => {
    actionModal.classList.add('hidden');
  });

  // Backdrop clicks
  [detailModal, actionModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // Action form submit
  document.getElementById('action-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeActionProblemId) return;

    const newStatus = document.getElementById('action-status-select').value;
    const newDept = document.getElementById('action-dept-select').value;
    const newRemarks = document.getElementById('action-remarks-input').value.trim();

    if (typeof apiUpdateComplaintStatus === 'function') {
      await apiUpdateComplaintStatus(activeActionProblemId, newStatus, newRemarks, newDept);
    } else {
      updateProblem(activeActionProblemId, {
        status: newStatus,
        assignedDept: newDept,
        staffRemarks: newRemarks
      });
    }

    actionModal.classList.add('hidden');
    refreshCurrentView();
    showToast('Record Updated', `Problem ${activeActionProblemId} status set to ${newStatus}.`, 'success');
  });
}

/* ==============================================================================
   TOAST NOTIFICATION COMPONENT
   ============================================================================== */

/**
 * Displays modern floating toast alert.
 * @param {string} title
 * @param {string} message
 * @param {'success'|'warning'|'error'|'info'} type
 */
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' ? 'fa-circle-check' :
                    type === 'warning' ? 'fa-triangle-exclamation' :
                    type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <span class="toast-title">${escapeHtml(title)}</span>
      <span class="toast-desc">${escapeHtml(message)}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Simple HTML escaping helper to prevent XSS.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==============================================================================
   APPLICATION BOOTSTRAP
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initializeStorage();
  setupAuth();
  setupStudentView();
  setupAdminView();
  setupStaffView();
  setupModals();

  // Initial screen: start on Login View for realistic flow
  switchView('login');
});
