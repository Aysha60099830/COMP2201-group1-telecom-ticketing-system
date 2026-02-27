/**
 * External Telecom - Contact Support Logic
 * Handles dynamic field toggling and local ticket storage.
 */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize or load the shared ticket database
    let ticketsDB = JSON.parse(localStorage.getItem('telecom_tickets')) || {};

    // 2. DOM Elements
    const supportForm = document.querySelector('form');
    const contactMethodRadios = document.querySelectorAll('input[name="contact-method"]');
    
    // Containers for toggling
    const phoneInputContainer = document.getElementById('phoneInput');
    const emailField = document.getElementById('email-address');
    const phoneField = document.getElementById('phone-number');
    const emailInputContainer = emailField.parentElement; // Targets the .form-group wrapper

    // 3. Initial State: Hide specific contact fields until a method is chosen
    phoneInputContainer.style.display = 'none';
    emailInputContainer.style.display = 'none';

    // --- FUNCTION: Toggle Contact Visibility ---
    function toggleFields() {
        const selectedMethod = document.querySelector('input[name="contact-method"]:checked')?.value;

        if (selectedMethod === 'phone') {
            phoneInputContainer.style.display = 'block';
            emailInputContainer.style.display = 'none';
            phoneField.required = true;
            emailField.required = false;
        } else if (selectedMethod === 'email') {
            phoneInputContainer.style.display = 'none';
            emailInputContainer.style.display = 'block';
            phoneField.required = false;
            emailField.required = true;
        }
    }

    // 4. Attach Event Listeners to Radios
    contactMethodRadios.forEach(radio => {
        radio.addEventListener('change', toggleFields);
    });

    // --- FUNCTION: Handle Form Submission ---
    supportForm.addEventListener("submit", function (event) {
        // We allow the form to continue to the PHP action, but we save a copy locally first
        const nameVal = document.getElementById('name').value;
        const messageVal = document.getElementById('message').value;
        const selectedMethod = document.querySelector('input[name="contact-method"]:checked').value;

        // Generate a unique ID for the user to track later
        const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);

        // Create the ticket object
        const newTicket = {
            name: nameVal,
            issue: messageVal,
            status: 'Open - Received',
            date: new Date().toLocaleString(),
            method: selectedMethod,
            contactDetail: selectedMethod === 'phone' ? phoneField.value : emailField.value
        };

        // Save to the local database object
        ticketsDB[ticketId] = newTicket;

        // Sync with LocalStorage
        localStorage.setItem('telecom_tickets', JSON.stringify(ticketsDB));

        // Alert the user of their Tracking ID
        alert(`Thank you, ${nameVal}!\n\nYour support request has been logged locally.\nYour Tracking ID is: ${ticketId}\n\nClick OK to finalize submission to our servers.`);
    });

    // --- FUNCTION: Handle Reset ---
    supportForm.addEventListener("reset", function () {
        // Use a small timeout to let the default reset finish before hiding fields
        setTimeout(() => {
            phoneInputContainer.style.display = 'none';
            emailInputContainer.style.display = 'none';
            phoneField.required = false;
            emailField.required = false;
        }, 10);
    });
});