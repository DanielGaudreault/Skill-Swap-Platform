// Firebase configuration (replace with your own)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileSection = document.getElementById('profileSection');
const browseSection = document.getElementById('browseSection');

// Auth state listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        profileBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'inline-block';
        
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        
        // Load user profile
        loadProfile(user.uid);
        
        // Show browse section
        browseSection.style.display = 'block';
        loadUsers();
    } else {
        // User is signed out
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        profileBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
        
        profileSection.style.display = 'none';
        browseSection.style.display = 'none';
    }
});

// Event Listeners
loginBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

registerBtn.addEventListener('click', () => {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
});

profileBtn.addEventListener('click', () => {
    profileSection.style.display = 'block';
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

document.getElementById('submitLogin').addEventListener('click', login);
document.getElementById('submitRegister').addEventListener('click', register);
document.getElementById('saveProfile').addEventListener('click', saveProfile);

// Auth functions
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            alert(error.message);
        });
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            // Create user document
            return db.collection('users').doc(cred.user.uid).set({
                name: name,
                email: email,
                skillsOffered: [],
                skillsWanted: [],
                location: ''
            });
        })
        .then(() => {
            alert('Registration successful!');
        })
        .catch(error => {
            alert(error.message);
        });
}

// Profile functions
function loadProfile(userId) {
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('skillsOffered').value = data.skillsOffered.join(', ');
                document.getElementById('skillsWanted').value = data.skillsWanted.join(', ');
                document.getElementById('userLocation').value = data.location || '';
            }
        });
}

function saveProfile() {
    const userId = auth.currentUser.uid;
    const skillsOffered = document.getElementById('skillsOffered').value.split(',').map(s => s.trim());
    const skillsWanted = document.getElementById('skillsWanted').value.split(',').map(s => s.trim());
    const location = document.getElementById('userLocation').value;
    
    db.collection('users').doc(userId).update({
        skillsOffered: skillsOffered,
        skillsWanted: skillsWanted,
        location: location
    })
    .then(() => {
        alert('Profile saved!');
        loadUsers(); // Refresh the user list
    })
    .catch(error => {
        alert(error.message);
    });
}

// Browse functions
function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    
    db.collection('users').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                if (doc.id !== auth.currentUser?.uid) {
                    const user = doc.data();
                    const userCard = document.createElement('div');
                    userCard.className = 'user-card';
                    userCard.innerHTML = `
                        <h3>${user.name}</h3>
                        <p><strong>Offers:</strong> ${user.skillsOffered.join(', ')}</p>
                        <p><strong>Wants:</strong> ${user.skillsWanted.join(', ')}</p>
                        <p><strong>Location:</strong> ${user.location}</p>
                        <button onclick="messageUser('${doc.id}')">Message</button>
                    `;
                    userList.appendChild(userCard);
                }
            });
        });
}

function messageUser(userId) {
    // In a real app, you would implement a messaging system
    alert('Messaging feature would be implemented here!');
}
