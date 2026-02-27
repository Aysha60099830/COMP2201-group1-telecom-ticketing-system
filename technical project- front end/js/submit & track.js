// 1. Declare ticketsDB as 'let' so we can modify it (and remove the redundant global const)
let ticketsDB = JSON.parse(localStorage.getItem('telecom_tickets')) || {};

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticketForm');
    const submissionResult = document.getElementById('submission-result');
    const trackBtn = document.getElementById('trackBtn');
    const ticketIdInput = document.getElementById('ticketIdInput');
    const trackingResult = document.getElementById('tracking-result');
    const ticketListUI = document.getElementById('ticketList');
    
    // Make sure you have an element with id="clearAllBtn" in your HTML sidebar
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Update the sidebar immediately on load
    renderSidebar();

    function generateTicketId() {
        return 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    }

    // --- RENDER SIDEBAR FUNCTION ---
    function renderSidebar() {
        if (!ticketListUI) return;
        ticketListUI.innerHTML = ''; 

        const keys = Object.keys(ticketsDB);
        
        if (keys.length === 0) {
            ticketListUI.innerHTML = '<li class="empty-msg">No tickets submitted yet.</li>';
            return;
        }

        // Show tickets (Newest at the top)
        keys.reverse().forEach(id => {
            const li = document.createElement('li');
            li.className = 'ticket-item';
            
            // Create a container for the text so the button doesn't overlap
            const textContent = document.createElement('div');
            textContent.innerHTML = `<strong>${id}</strong><br><span class="ticket-user">${ticketsDB[id].name}</span>`;
            
            // --- ADDED: DELETE BUTTON FOR INDIVIDUAL TICKET ---
            const delBtn = document.createElement('button');
            delBtn.innerHTML = 'Delete';
            delBtn.className = 'delete-btn'; // Use the CSS class we discussed
            
            delBtn.onclick = (e) => {
                e.stopPropagation(); // Prevents clicking the ticket to track it while deleting
                if(confirm(`Delete ticket ${id}?`)) {
                    delete ticketsDB[id];
                    updateStorage();
                }
            };

            // Clicking the list item still tracks it
            li.onclick = () => {
                ticketIdInput.value = id;
                trackBtn.click();
                window.scrollTo({ top: document.getElementById('track-section').offsetTop, behavior: 'smooth' });
            };
            
            li.appendChild(textContent);
            li.appendChild(delBtn);
            ticketListUI.appendChild(li);
        });
    }

    // Helper function to save changes and refresh UI
    function updateStorage() {
        localStorage.setItem('telecom_tickets', JSON.stringify(ticketsDB));
        renderSidebar();
        // Hide tracking result if the ticket being viewed was deleted
        trackingResult.style.display = 'none';
    }

    // --- ADDED: CLEAR ALL FUNCTION ---
    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
            if (confirm("Clear all submitted tickets? This cannot be undone.")) {
                ticketsDB = {};
                updateStorage();
            }
        };
    }

    // --- HANDLE SUBMISSION ---
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('userName').value;
            const issue = document.getElementById('issueDesc').value;
            const newId = generateTicketId();

            ticketsDB[newId] = {
                name: name,
                issue: issue,
                status: 'Open - Pending Review',
                date: new Date().toLocaleString()
            };

            localStorage.setItem('telecom_tickets', JSON.stringify(ticketsDB));

            submissionResult.style.color = "#4db8ff";
            submissionResult.innerText = `✅ Success! Your ID: ${newId}`;
            
            ticketForm.reset();
            renderSidebar(); 
        });
    }

    // --- HANDLE TRACKING ---
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            const ticketId = ticketIdInput.value.trim().toUpperCase();
            const ticket = ticketsDB[ticketId];
            
            trackingResult.style.display = 'block'; 

            if (ticket) {
                trackingResult.innerHTML = `
                    <h3 style="margin-top:0; color:#4db8ff;">Status: ${ticket.status}</h3>
                    <p><strong>Ticket ID:</strong> ${ticketId}</p>
                    <p><strong>Submitted By:</strong> ${ticket.name}</p>
                    <p><strong>Date:</strong> ${ticket.date}</p>
                    <p><strong>Issue:</strong> ${ticket.issue}</p>
                `;
                trackingResult.style.borderLeftColor = "#4db8ff";
            } else {
                trackingResult.innerHTML = `<p style="color:#ff4d4d;">⚠️ Ticket ID "${ticketId}" not found.</p>`;
                trackingResult.style.borderLeftColor = "#ff4d4d";
            }
        });
    }
});