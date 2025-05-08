// Create a 'static' folder and save this as 'script.js' inside it
document.addEventListener('DOMContentLoaded', function() {
    // Load data when the page loads
    loadResidents();
    
    // Add event listener for form submission
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addItem();
    });
});

// Function to load residents from the database
function loadResidents() {
    fetch('/api/residents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const itemsList = document.getElementById('itemsList');
            itemsList.innerHTML = '';
            
            if (data.length === 0) {
                itemsList.innerHTML = '<tr><td colspan="5" class="empty-message">No residents found in the database</td></tr>';
                return;
            }
            
            data.forEach(resident => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${resident.resident_id}</td>
                    <td>${resident.first_name} ${resident.last_name}</td>
                    <td>Room ${resident.room_number}</td>
                    <td>${resident.admission_date}</td>
                    <td>
                        <button class="view-btn" onclick="viewResidentDetails(${resident.resident_id})">View Details</button>
                        <button class="delete-btn" onclick="deleteItem(${resident.resident_id})">Delete</button>
                    </td>
                `;
                itemsList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading residents:', error);
            // Fallback to regular items if residents table doesn't exist
            loadItems();
        });
}

// Function to load regular items (fallback)
function loadItems() {
    fetch('/api/items')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const itemsList = document.getElementById('itemsList');
            itemsList.innerHTML = '';
            
            if (data.length === 0) {
                itemsList.innerHTML = '<tr><td colspan="5" class="empty-message">No items found in the database</td></tr>';
                return;
            }
            
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.description || '-'}</td>
                    <td>${item.created_at}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
                    </td>
                `;
                itemsList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading items:', error);
            document.getElementById('itemsList').innerHTML = '<tr><td colspan="5" class="empty-message">Error loading data from database</td></tr>';
        });
}

// Function to view resident details
function viewResidentDetails(residentId) {
    fetch(`/api/residents/${residentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display resident details in a modal or details section
            const detailsDiv = document.getElementById('residentDetails');
            if (detailsDiv) {
                detailsDiv.style.display = 'block';
                
                const resident = data.resident;
                const guardian = data.guardian;
                const health = data.health;
                const food = data.food;
                
                detailsDiv.innerHTML = `
                    <div class="modal-content">
                        <span class="close-btn" onclick="closeDetails()">&times;</span>
                        <h2>Resident Details</h2>
                        <div class="detail-section">
                            <h3>Personal Information</h3>
                            <p><strong>Name:</strong> ${resident.first_name} ${resident.last_name}</p>
                            <p><strong>Date of Birth:</strong> ${resident.dob}</p>
                            <p><strong>Gender:</strong> ${resident.gender}</p>
                            <p><strong>Room Number:</strong> ${resident.room_number}</p>
                            <p><strong>Admission Date:</strong> ${resident.admission_date}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Guardian Information</h3>
                            <p><strong>Name:</strong> ${guardian.guardian_name || 'N/A'}</p>
                            <p><strong>Relationship:</strong> ${guardian.guardian_relationship || 'N/A'}</p>
                            <p><strong>Contact:</strong> ${guardian.guardian_contact || 'N/A'}</p>
                            <p><strong>Email:</strong> ${guardian.guardian_email || 'N/A'}</p>
                            <p><strong>Address:</strong> ${guardian.guardian_address || 'N/A'}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Health Information</h3>
                            <p><strong>Medical Conditions:</strong> ${health.medical_conditions || 'None'}</p>
                            <p><strong>Mobility Status:</strong> ${health.mobility_status || 'Unknown'}</p>
                            <p><strong>Cognitive Condition:</strong> ${health.cognitive_condition || 'Unknown'}</p>
                            <p><strong>Daily Routine:</strong> ${health.daily_routine || 'Not specified'}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Food Preferences</h3>
                            <p><strong>Dietary Restrictions:</strong> ${food.dietary_restrictions || 'None'}</p>
                            <p><strong>Preferred Cuisine:</strong> ${food.preferred_cuisine || 'Not specified'}</p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading resident details:', error);
            alert('Failed to load resident details');
        });
}

// Function to close the details modal
function closeDetails() {
    const detailsDiv = document.getElementById('residentDetails');
    if (detailsDiv) {
        detailsDiv.style.display = 'none';
    }
}

// Function to add a new item
function addItem() {
    const nameInput = document.getElementById('itemName');
    const descriptionInput = document.getElementById('itemDescription');
    
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!name) {
        alert('Please enter a name for the item');
        return;
    }
    
    const data = {
        name: name,
        description: description
    };
    
    fetch('/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        // Clear form inputs
        nameInput.value = '';
        descriptionInput.value = '';
        
        // Reload items to show the new one
        loadResidents();
    })
    .catch(error => {
        console.error('Error adding item:', error);
        alert('Failed to add item to the database');
    });
}

// Function to delete an item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`/api/items/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            // Reload items to reflect the deletion
            loadResidents();
        })
        .catch(error => {
            console.error('Error deleting item:', error);
            alert('Failed to delete item from the database');
        });
    }
}