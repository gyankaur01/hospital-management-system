/**
 * HMS Pro - Core System Logic
 * Premium Implementation with Online Booking & Toast System
 */

// 1. Data Initialization
const initializeData = () => {
    // Default Users
    if (!localStorage.getItem('hms_users')) {
        localStorage.setItem('hms_users', JSON.stringify([
            { id: 1, role: 'Admin', username: 'admin', password: '123' },
            { id: 2, role: 'Doctor', username: 'doctor', password: '123' },
            { id: 3, role: 'Patient', username: '9876543210', password: 'password' },
            { id: 4, role: 'Pharmacist', username: 'pharmacist', password: '123' }
        ]));
    }

    // Default Doctors (for Landing Page)
    if (!localStorage.getItem('hms_doctors') || JSON.parse(localStorage.getItem('hms_doctors')).length === 0) {
        localStorage.setItem('hms_doctors', JSON.stringify([
            { id: 1, name: 'Dr. Sameer Verma', spec: 'Cardiologist', contact: '9876500001', timings: '09:00 AM - 02:00 PM' },
            { id: 2, name: 'Dr. Anjali Rao', spec: 'Neurologist', contact: '9876500002', timings: '11:00 AM - 05:00 PM' },
            { id: 3, name: 'Dr. Rohan Mehra', spec: 'Orthopedic Surgeon', contact: '9876500003', timings: '02:00 PM - 08:00 PM' },
            { id: 4, name: 'Dr. Priya Sharma', spec: 'Pediatrician', contact: '9876500004', timings: '10:00 AM - 03:00 PM' }
        ]));
    }

    // Ensure all data keys exist
    ['patients', 'appointments', 'medicines', 'bills'].forEach(key => {
        if (!localStorage.getItem(`hms_${key}`)) {
            localStorage.setItem(`hms_${key}`, JSON.stringify([]));
        }
    });
};

// 2. Storage Helpers
const getData = (key) => JSON.parse(localStorage.getItem(`hms_${key}`)) || [];
const setData = (key, data) => localStorage.setItem(`hms_${key}`, JSON.stringify(data));

// 3. UI Helpers & Toasts
const showToast = (title, message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.style.borderLeft = `6px solid ${type === 'success' ? 'var(--success)' : 'var(--danger)'}`;
    
    toast.innerHTML = `
        <div style="font-size: 1.5rem; color: ${type === 'success' ? 'var(--success)' : 'var(--danger)'}">
            <i class="uil uil-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        </div>
        <div>
            <h4 style="margin: 0; font-size: 1rem;">${title}</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">${message}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
};

const openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);
        const content = modal.querySelector('.modal-content');
        if (content) content.style.transform = 'scale(1)';
    }
};

const closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.opacity = '0';
        const content = modal.querySelector('.modal-content');
        if (content) content.style.transform = 'scale(0.9)';
        setTimeout(() => modal.style.display = 'none', 400);
    }
};

// 4. Booking Logic (Landing Page)
const populatePublicDoctors = () => {
    const select = document.getElementById('book-doctor');
    if (!select) return;

    const doctors = getData('doctors');
    select.innerHTML = '<option value="" disabled selected>Select Specialist...</option>' + 
        doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('');
};

const handlePublicBooking = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('book-name').value;
    const age = document.getElementById('book-age').value;
    const gender = document.getElementById('book-gender').value;
    const contact = document.getElementById('book-contact').value;
    const doctor = document.getElementById('book-doctor').value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;

    // 1. Register Patient if new
    let patients = getData('patients');
    let patient = patients.find(p => p.contact === contact);
    
    if (!patient) {
        patient = { id: Date.now(), name, age, gender, contact };
        patients.push(patient);
        setData('patients', patients);

        // Create User Account
        let users = JSON.parse(localStorage.getItem('hms_users'));
        users.push({ id: patient.id, role: 'Patient', username: contact, password: 'password' });
        localStorage.setItem('hms_users', JSON.stringify(users));
        
        showToast('Registration Successful', `Account created! Login with Mobile: ${contact}, Pass: password`);
    }

    // 2. Create Appointment
    let appointments = getData('appointments');
    const newAppointment = {
        id: appointments.length + 101,
        patientName: name,
        doctorName: doctor,
        date: date,
        time: time,
        status: 'Active'
    };
    appointments.push(newAppointment);
    setData('appointments', appointments);

    // 3. Success Feedback
    showToast('Slot Secured!', `Appointment confirmed with ${doctor} on ${date}.`, 'success');
    closeModal('booking-modal');
    e.target.reset();
};

// 5. Auth & Core Logic
const login = (role, username, password) => {
    const users = JSON.parse(localStorage.getItem('hms_users'));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('hms_logged_in_user', JSON.stringify(user));
        if (user.role === 'Patient') window.location.href = 'patient_dashboard.html';
        else if (user.role === 'Doctor') window.location.href = 'doctor_dashboard.html';
        else window.location.href = 'dashboard.html';
        return true;
    }
    return false;
};

const logout = () => {
    localStorage.removeItem('hms_logged_in_user');
    window.location.href = 'login.html';
};

const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('hms_logged_in_user'));
    const path = window.location.pathname;
    const isPublicPage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('login.html');

    if (!user && !isPublicPage) {
        window.location.href = 'login.html';
    } else if (user) {
        const nameDisplay = document.getElementById('current-user-name');
        if (nameDisplay) nameDisplay.textContent = `${user.username} (${user.role})`;
    }
};

// 6. Admin Module Handlers
const renderDoctors = () => {
    const tbody = document.getElementById('doctors-tbody');
    if (!tbody) return;
    const doctors = getData('doctors');
    tbody.innerHTML = doctors.map(d => `
        <tr>
            <td><strong>#${d.id}</strong></td>
            <td>${d.name}</td>
            <td>${d.spec}</td>
            <td>${d.contact}</td>
            <td>${d.timings}</td>
            <td>
                <button class="btn p-5" onclick="HMS.editDoctor(${d.id})"><i class="uil uil-edit"></i></button>
                <button class="btn p-5 text-danger" onclick="HMS.deleteDoctor(${d.id})"><i class="uil uil-trash"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6">No doctors registered yet.</td></tr>';
};

const saveDoctor = (id, data) => {
    let doctors = getData('doctors');
    if (id) {
        const index = doctors.findIndex(d => String(d.id) === String(id));
        if (index > -1) doctors[index] = { ...doctors[index], ...data };
    } else {
        doctors.push({ id: Date.now(), ...data });
    }
    setData('doctors', doctors);
    renderDoctors();
    closeModal('doctor-modal');
    showToast('Success', 'Doctor profile updated.');
};

const renderAppointments = () => {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;
    const appointments = getData('appointments');
    tbody.innerHTML = appointments.map(a => `
        <tr>
            <td><strong>#${a.id}</strong></td>
            <td>${a.patientName}</td>
            <td>${a.doctorName}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td><span class="badge ${a.status === 'Active' ? 'success' : 'warning'}">${a.status}</span></td>
            <td>
                <button class="btn p-5"><i class="uil uil-check"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7">No appointments found.</td></tr>';
};

// 7. Medicine Module
const renderMedicines = () => {
    const tbody = document.getElementById('medicines-tbody');
    if (!tbody) return;
    const medicines = getData('medicines');
    tbody.innerHTML = medicines.map(m => {
        const status = m.quantity <= m.minStock ? 'Low Stock' : 'In Stock';
        const badgeClass = status === 'Low Stock' ? 'warning' : 'success';
        return `
        <tr>
            <td><strong>#${m.id}</strong></td>
            <td>${m.name}</td>
            <td>${m.quantity}</td>
            <td>₹${parseFloat(m.price).toFixed(2)}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
            <td>${m.expiry}</td>
            <td>
                <button class="btn p-5" onclick="HMS.editMedicine(${m.id})"><i class="uil uil-edit"></i></button>
                <button class="btn p-5 text-danger" onclick="HMS.deleteMedicine(${m.id})"><i class="uil uil-trash"></i></button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="7">No medicines in inventory.</td></tr>';
};

const saveMedicine = (id, data) => {
    let medicines = getData('medicines');
    if (id) {
        const index = medicines.findIndex(m => String(m.id) === String(id));
        if (index > -1) medicines[index] = { ...medicines[index], ...data };
    } else {
        medicines.push({ id: Date.now(), ...data });
    }
    setData('medicines', medicines);
    renderMedicines();
    closeModal('medicine-modal');
    showToast('Success', 'Medicine record saved.');
};

// 8. Bill Module
const renderBills = () => {
    const tbody = document.getElementById('bills-tbody');
    if (!tbody) return;
    const bills = getData('bills');
    tbody.innerHTML = bills.map(b => {
        const badgeClass = b.status === 'Paid' ? 'success' : 'warning';
        return `
        <tr>
            <td><strong>#${b.id}</strong></td>
            <td>${b.patientName}</td>
            <td>${b.date}</td>
            <td>&#8377;${parseFloat(b.amount).toFixed(2)}</td>
            <td><span class="badge ${badgeClass}">${b.status}</span></td>
            <td>
                <button class="btn p-5 action-btn" data-action="edit" data-id="${b.id}"><i class="uil uil-edit"></i></button>
                <button class="btn p-5 text-danger action-btn" data-action="delete" data-id="${b.id}"><i class="uil uil-trash"></i></button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="6">No invoices found.</td></tr>';
};

const saveBill = (id, data) => {
    let bills = getData('bills');
    if (id) {
        const index = bills.findIndex(b => String(b.id) === String(id));
        if (index > -1) bills[index] = { ...bills[index], ...data };
    } else {
        bills.push({ id: Date.now(), ...data });
    }
    setData('bills', bills);
    renderBills();
    closeModal('bill-modal');
    showToast('Success', 'Invoice saved successfully.');
};

// 9. Appointment Save
const saveAppointment = (id, data) => {
    let appointments = getData('appointments');
    if (id) {
        const index = appointments.findIndex(a => String(a.id) === String(id));
        if (index > -1) appointments[index] = { ...appointments[index], ...data };
    } else {
        appointments.push({ id: Date.now(), ...data });
    }
    setData('appointments', appointments);
    renderAppointments();
    closeModal('appointment-modal');
    showToast('Success', 'Appointment scheduled.');
};

// 10. Populate selects
const populatePatientSelects = () => {
    const patients = getData('patients');
    const opts = '<option value="" disabled selected>Select Patient...</option>' +
        patients.map(p => `<option value="${p.name}">${p.name} (#${p.id})</option>`).join('');
    ['app-patient', 'bill-patient'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = opts;
    });

    const doctors = getData('doctors');
    const dOpts = '<option value="" disabled selected>Select Doctor...</option>' +
        doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('');
    const appDoc = document.getElementById('app-doctor');
    if (appDoc) appDoc.innerHTML = dOpts;
};

// 11. Global API
window.HMS = {
    login, logout, openModal, closeModal,
    // Storage helpers exposed
    getData,
    setData,
    showToast,
    // Patient module
    renderPatients: () => {
        const tbody = document.getElementById('patients-tbody');
        if (!tbody) return;
        const patients = getData('patients');
        tbody.innerHTML = patients.map(p => `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>${p.name}</td>
                <td>${p.contact}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
                <td><span class="badge success">Active</span></td>
                <td>
                    <button class="btn p-5" onclick="HMS.editPatient(${p.id})"><i class="uil uil-edit"></i></button>
                    <button class="btn p-5 text-danger" onclick="HMS.deletePatient(${p.id})"><i class="uil uil-trash"></i></button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7">No patients found.</td></tr>';
    },
    editPatient: (id) => {
        const p = getData('patients').find(pat => String(pat.id) === String(id));
        if (!p) return;
        document.getElementById('patient-id').value = p.id;
        document.getElementById('patient-name').value = p.name;
        document.getElementById('patient-age').value = p.age;
        document.getElementById('patient-gender').value = p.gender;
        document.getElementById('patient-contact').value = p.contact;
        document.getElementById('patient-history').value = p.history || '';
        document.getElementById('patient-modal-title').textContent = 'Edit Patient';
        openModal('patient-modal');
    },
    deletePatient: (id) => {
        if (confirm('Are you sure you want to delete this patient?')) {
            setData('patients', getData('patients').filter(p => String(p.id) !== String(id)));
            showToast('Deleted', 'Patient record removed.', 'error');
            setTimeout(() => location.reload(), 800);
        }
    },
    // Doctor module
    renderDoctors,
    saveDoctor,
    editDoctor: (id) => {
        const d = getData('doctors').find(doc => String(doc.id) === String(id));
        if (!d) return;
        document.getElementById('doctor-id').value = d.id;
        document.getElementById('doctor-name').value = d.name;
        document.getElementById('doctor-spec').value = d.spec;
        document.getElementById('doctor-contact').value = d.contact;
        document.getElementById('doctor-timings').value = d.timings;
        document.getElementById('doctor-modal-title').textContent = 'Edit Doctor Profile';
        openModal('doctor-modal');
    },
    deleteDoctor: (id) => {
        if (confirm('Are you sure you want to remove this doctor?')) {
            setData('doctors', getData('doctors').filter(d => String(d.id) !== String(id)));
            renderDoctors();
            showToast('Deleted', 'Doctor profile removed.', 'error');
        }
    },
    // Appointment module
    renderAppointments,
    saveAppointment,
    populatePatientSelects,
    deleteAppointment: (id) => {
        if (confirm('Delete this appointment?')) {
            setData('appointments', getData('appointments').filter(a => String(a.id) !== String(id)));
            showToast('Deleted', 'Appointment removed.', 'error');
            setTimeout(() => location.reload(), 800);
        }
    },
    // Medicine module
    renderMedicines,
    saveMedicine,
    editMedicine: (id) => {
        const m = getData('medicines').find(med => String(med.id) === String(id));
        if (!m) return;
        document.getElementById('medicine-id').value = m.id;
        document.getElementById('med-name').value = m.name;
        document.getElementById('med-quantity').value = m.quantity;
        document.getElementById('med-min-stock').value = m.minStock;
        document.getElementById('med-price').value = m.price;
        document.getElementById('med-expiry').value = m.expiry;
        document.getElementById('medicine-modal-title').textContent = 'Edit Medicine';
        openModal('medicine-modal');
    },
    deleteMedicine: (id) => {
        if (confirm('Remove this medicine from inventory?')) {
            setData('medicines', getData('medicines').filter(m => String(m.id) !== String(id)));
            showToast('Deleted', 'Medicine removed.', 'error');
            setTimeout(() => location.reload(), 800);
        }
    },
    // Bill module
    renderBills,
    saveBill,
    populateBillPatientSelects: populatePatientSelects,
    editBill: (id) => {
        const b = getData('bills').find(bill => String(bill.id) === String(id));
        if (!b) return;
        // Re-populate patient dropdown so the correct name can be selected
        populatePatientSelects();
        document.getElementById('bill-id').value = b.id;
        const patSel = document.getElementById('bill-patient');
        if (patSel) {
            Array.from(patSel.options).forEach(o => {
                o.selected = (o.value === b.patientName);
            });
        }
        document.getElementById('bill-date').value = b.date;
        document.getElementById('bill-amount').value = b.amount;
        const statusSel = document.getElementById('bill-status');
        if (statusSel) {
            Array.from(statusSel.options).forEach(o => {
                o.selected = (o.value === b.status);
            });
        }
        document.getElementById('bill-modal-title').textContent = 'Edit Invoice';
        openModal('bill-modal');
    },
    deleteBill: (id) => {
        if (confirm('Delete this invoice?')) {
            setData('bills', getData('bills').filter(b => String(b.id) !== String(id)));
            showToast('Deleted', 'Invoice removed.', 'error');
            setTimeout(() => location.reload(), 800);
        }
    },
    // Search
    searchTable: (inputId, tbodyId) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('keyup', () => {
            const filter = input.value.toLowerCase();
            const rows = document.querySelectorAll(`#${tbodyId} tr`);
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    },
    // Pagination
    initPagination: (data, tbodyId, pageInfoId, prevBtnId, nextBtnId, renderFn, itemsPerPage = 5) => {
        let currentPage = 1;
        const update = () => {
            const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            renderFn(data.slice(start, end));
            const info = document.getElementById(pageInfoId);
            if (info) info.textContent = `Showing ${start + 1}-${Math.min(end, data.length)} of ${data.length}`;
            const prev = document.getElementById(prevBtnId);
            const next = document.getElementById(nextBtnId);
            if (prev) prev.disabled = currentPage === 1;
            if (next) next.disabled = currentPage === totalPages;
        };
        const prev = document.getElementById(prevBtnId);
        const next = document.getElementById(nextBtnId);
        if (prev) prev.onclick = () => { if (currentPage > 1) { currentPage--; update(); } };
        if (next) next.onclick = () => { if (currentPage < Math.ceil(data.length / itemsPerPage)) { currentPage++; update(); } };
        update();
    },
    // Export to CSV
    exportToCSV: (key, filename) => {
        const data = getData(key);
        if (!data || data.length === 0) return alert('No data to export!');
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + rows;
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    // Helpers
    formatDate: (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
};

// Boot System
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    checkAuth();
    
    // Landing Page Init
    const bookingForm = document.getElementById('public-booking-form');
    if (bookingForm) {
        populatePublicDoctors();
        bookingForm.addEventListener('submit', handlePublicBooking);
    }

    // Dashboard Init
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Dashboard Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            if (window.innerWidth <= 992) {
                if (sidebar) sidebar.classList.toggle('active');
            } else {
                if (sidebar) sidebar.classList.toggle('hidden');
                if (mainContent) mainContent.classList.toggle('full-width');
            }
        });
    }

    // Landing Page Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('uil-bars');
                icon.classList.toggle('uil-multiply');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('uil-bars');
                    icon.classList.remove('uil-multiply');
                }
            });
        });
    }
});