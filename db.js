/**
 * ==============================================================================
 * DAILY PROBLEM RECORDING AND ANALYSIS SYSTEM
 * Supabase Database Connection & Service Layer (db.js)
 * ==============================================================================
 * 
 * This service handles all database communication with Supabase.
 * It includes an automatic fallback to localStorage:
 * - When placeholder credentials are in place, it uses localStorage (frontend keeps working!).
 * - When you replace the placeholders with your actual Supabase URL & Anon Key,
 *   it seamlessly communicates with your live online Supabase PostgreSQL database!
 * ==============================================================================
 */

// ==============================================================================
// STEP 1: CONFIGURE YOUR SUPABASE CREDENTIALS HERE
// Replace these placeholders with your actual project details from:
// Supabase Dashboard -> Project Settings -> API
// ==============================================================================
const SUPABASE_URL = 'https://yzwsiatwvbyzenowzueo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KxJc0KI99wKJkfSXhpZafQ_vPw7Fcbs';

// Internal Supabase Client instance
let supabaseClient = null;

/**
 * Checks if actual Supabase credentials have been configured.
 * Returns false if still using the default placeholder strings.
 */
function isSupabaseConfigured() {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
  );
}

/**
 * Initialize the Supabase Client if the official SDK is loaded and credentials are set.
 */
function initSupabase() {
  if (isSupabaseConfigured()) {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
      supabaseClient = window.supabase.createClient(cleanUrl, SUPABASE_ANON_KEY);
      console.log('✅ Connected to Supabase online database.');
      return true;
    } else {
      console.warn('⚠️ Supabase JS library not loaded. Falling back to LocalStorage.');
    }
  } else {
    console.log('ℹ️ Supabase is in Placeholder mode. Using browser LocalStorage seamlessly.');
  }
  return false;
}

/**
 * Helper: Converts a database row (snake_case) to application frontend format (camelCase).
 */
function mapFromDb(row) {
  if (!row) return null;
  return {
    id: row.ticket_id || row.id,
    dbId: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    location: row.location,
    reporterName: row.reporter_name,
    reporterId: row.reporter_id,
    description: row.description,
    attachmentHint: row.attachment_hint || '',
    status: row.status,
    assignedDept: row.assigned_dept,
    staffRemarks: row.staff_remarks || '',
    date: row.created_at ? new Date(row.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Just now',
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  };
}

/**
 * Helper: Converts application frontend format (camelCase) to database row (snake_case).
 */
function mapToDb(problem) {
  return {
    ticket_id: problem.id,
    title: problem.title,
    category: problem.category,
    priority: problem.priority,
    location: problem.location,
    reporter_name: problem.reporterName,
    reporter_id: problem.reporterId,
    description: problem.description,
    attachment_hint: problem.attachmentHint || '',
    status: problem.status || 'Pending',
    assigned_dept: problem.assignedDept || problem.category,
    staff_remarks: problem.staffRemarks || ''
  };
}

// ==============================================================================
// STEP 2: ASYNCHRONOUS DATABASE FUNCTIONS
// ==============================================================================

/**
 * 1. FETCH ALL COMPLAINTS / PROBLEMS
 * Retrieves all complaints, newest first.
 * Supports Supabase with automatic fallback to localStorage.
 */
async function apiFetchComplaints() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }
      return (data || []).map(mapFromDb);
    } catch (err) {
      console.warn('Falling back to localStorage due to Supabase error:', err);
      return getProblems();
    }
  }

  // Fallback: LocalStorage
  return getProblems();
}

/**
 * 2. SUBMIT A NEW COMPLAINT
 * Inserts a new problem record into Supabase or localStorage.
 * @param {Object} complaintData
 */
async function apiSubmitComplaint(complaintData) {
  if (supabaseClient) {
    try {
      const dbRow = mapToDb(complaintData);
      const { data, error } = await supabaseClient
        .from('problems')
        .insert([dbRow])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      // Also keep local copy updated for fast UI response
      addProblem(complaintData);
      return mapFromDb(data[0]) || complaintData;
    } catch (err) {
      console.warn('Falling back to localStorage for submission:', err);
      addProblem(complaintData);
      return complaintData;
    }
  }

  // Fallback: LocalStorage
  addProblem(complaintData);
  return complaintData;
}

/**
 * 3. ASSIGN COMPLAINT TO A DEPARTMENT
 * Updates the assigned_dept field in Supabase.
 * @param {string} ticketId - e.g. 'PRB-1001'
 * @param {string} departmentName - e.g. 'Maintenance & Estate'
 */
async function apiAssignComplaint(ticketId, departmentName) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('problems')
        .update({ assigned_dept: departmentName })
        .eq('ticket_id', ticketId)
        .select();

      if (error) throw error;
      updateProblem(ticketId, { assignedDept: departmentName });
      return true;
    } catch (err) {
      console.warn('Falling back to localStorage for assignment:', err);
      updateProblem(ticketId, { assignedDept: departmentName });
      return true;
    }
  }

  // Fallback: LocalStorage
  updateProblem(ticketId, { assignedDept: departmentName });
  return true;
}

/**
 * 4. UPDATE COMPLAINT STATUS & STAFF REMARKS
 * Updates status ('Pending', 'In Progress', 'Resolved'), staff notes, and department.
 * @param {string} ticketId - e.g. 'PRB-1001'
 * @param {string} newStatus - 'Pending' | 'In Progress' | 'Resolved'
 * @param {string} staffRemarks - Resolution notes or activity logs
 * @param {string} assignedDept - Optional department reassignment
 */
async function apiUpdateComplaintStatus(ticketId, newStatus, staffRemarks = '', assignedDept = null) {
  const updatePayload = {
    status: newStatus
  };
  if (staffRemarks !== undefined && staffRemarks !== null) {
    updatePayload.staff_remarks = staffRemarks;
  }
  if (assignedDept) {
    updatePayload.assigned_dept = assignedDept;
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('problems')
        .update(updatePayload)
        .eq('ticket_id', ticketId)
        .select();

      if (error) throw error;

      // Update local storage representation
      const localUpdates = { status: newStatus };
      if (staffRemarks) localUpdates.staffRemarks = staffRemarks;
      if (assignedDept) localUpdates.assignedDept = assignedDept;
      updateProblem(ticketId, localUpdates);

      return true;
    } catch (err) {
      console.warn('Falling back to localStorage for status update:', err);
      const localUpdates = { status: newStatus };
      if (staffRemarks) localUpdates.staffRemarks = staffRemarks;
      if (assignedDept) localUpdates.assignedDept = assignedDept;
      updateProblem(ticketId, localUpdates);
      return true;
    }
  }

  // Fallback: LocalStorage
  const localUpdates = { status: newStatus };
  if (staffRemarks) localUpdates.staffRemarks = staffRemarks;
  if (assignedDept) localUpdates.assignedDept = assignedDept;
  updateProblem(ticketId, localUpdates);
  return true;
}

/**
 * 5. DELETE A COMPLAINT
 * Deletes a problem record (Admin action).
 * @param {string} ticketId - e.g. 'PRB-1001'
 */
async function apiDeleteComplaint(ticketId) {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('problems')
        .delete()
        .eq('ticket_id', ticketId);

      if (error) throw error;
      deleteProblem(ticketId);
      return true;
    } catch (err) {
      console.warn('Falling back to localStorage for deletion:', err);
      deleteProblem(ticketId);
      return true;
    }
  }

  // Fallback: LocalStorage
  deleteProblem(ticketId);
  return true;
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});
