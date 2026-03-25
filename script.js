// --- 1. Data & State Management ---
// Initial dummy data or load from localStorage
const getStoredNotes = () => JSON.parse(localStorage.getItem('notes')) || [];

let notes = getStoredNotes();
let selectedColor = '#ffffff'; // Default color for new notes

// --- 2. DOM Element Selectors ---
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const addNoteBtn = document.getElementById('addNoteBtn');

// Modal Elements
const modal = document.getElementById('noteModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const noteForm = document.getElementById('noteForm');
const noteIdInput = document.getElementById('noteId');
const noteTitleInput = document.getElementById('noteTitle');
const noteContentInput = document.getElementById('noteContent');
const colorTags = document.querySelectorAll('.color-tag');

// --- 3. Core Functions ---

/**
 * Save the current state of notes to localStorage
 */
function saveToStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

/**
 * Render notes to the DOM. Filters by search term if provided.
 */
function renderNotes(searchTerm = '') {
    notesContainer.innerHTML = ''; // Clear current view

    // Filter notes based on search term
    const filteredNotes = notes.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
        const contentMatch = note.content.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || contentMatch;
    });

    // If no notes found, show a message
    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); grid-column: 1/-1;">No notes found. Create one to get started!</p>';
        return;
    }

    // Generate HTML for each note
    filteredNotes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-card';
        // Apply the selected color as a left border
        noteEl.style.borderLeftColor = note.color;

        noteEl.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="edit-btn" onclick="openEditModal('${note.id}')" title="Edit">✏️</button>
                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete">🗑️</button>
            </div>
        `;

        notesContainer.appendChild(noteEl);
    });
}

/**
 * Helper: Prevent XSS by escaping HTML characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// --- 4. Modal & Form Handling ---

/**
 * Open modal for creating a new note
 */
function openAddModal() {
    modalTitle.textContent = "Add New Note";
    noteIdInput.value = ''; // Clear hidden ID
    noteTitleInput.value = '';
    noteContentInput.value = '';
    selectedColor = '#ffffff'; // Reset color
    updateColorSelection();
    modal.classList.remove('hidden');
}

/**
 * Open modal for editing an existing note
 * @param {string} id - The ID of the note to edit
 */
window.openEditModal = function(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    modalTitle.textContent = "Edit Note";
    noteIdInput.value = note.id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    selectedColor = note.color || '#ffffff';
    updateColorSelection();
    modal.classList.remove('hidden');
}

/**
 * Close the modal
 */
function closeModal() {
    modal.classList.add('hidden');
}

/**
 * Handle form submission (Add or Update)
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const id = noteIdInput.value;

    if (!title || !content) {
        alert("Please fill in both title and content.");
        return;
    }

    if (id) {
        // Update existing note
        notes = notes.map(note => {
            if (note.id === id) {
                return { ...note, title, content, color: selectedColor, updatedAt: Date.now() };
            }
            return note;
        });
    } else {
        // Create new note
        const newNote = {
            id: 'note_' + Date.now(),
            title,
            content,
            color: selectedColor,
            createdAt: Date.now()
        };
        notes.unshift(newNote); // Add to top
    }

    saveToStorage();
    renderNotes(searchInput.value);
    closeModal();
}

/**
 * Delete a note
 * @param {string} id - The ID of the note to delete
 */
window.deleteNote = function(id) {
    if (confirm("Are you sure you want to delete this note?")) {
        notes = notes.filter(note => note.id !== id);
        saveToStorage();
        renderNotes(searchInput.value);
    }
}

// --- 5. Event Listeners ---

// Search functionality
searchInput.addEventListener('input', (e) => {
    renderNotes(e.target.value);
});

// Add button opens modal
addNoteBtn.addEventListener('click', openAddModal);

// Close modal buttons
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Form submit
noteForm.addEventListener('submit', handleFormSubmit);

// Color Picker Logic
colorTags.forEach(tag => {
    tag.addEventListener('click', function() {
        selectedColor = this.getAttribute('data-color');
        updateColorSelection();
    });
});

/**
 * Visual helper to show which color is selected in the modal
 */
function updateColorSelection() {
    colorTags.forEach(tag => {
        if (tag.getAttribute('data-color') === selectedColor) {
            tag.classList.add('selected');
        } else {
            tag.classList.remove('selected');
        }
    });
}

// Close modal if clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// --- Initial Load ---
renderNotes();