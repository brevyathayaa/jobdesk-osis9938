// CONFIGURASI FIREBASE
// Ganti dengan konfigurasi Firebase Realtime Database Anda sendiri
const firebaseConfig = {
  apiKey: "AIzaSyDW_zwnrVC5R7-1lZ8dKTSDuYF7Ir4qiMc",
  authDomain: "jobdesk-osis99.firebaseapp.com",
  databaseURL: "https://jobdesk-osis99-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jobdesk-osis99",
  storageBucket: "jobdesk-osis99.firebasestorage.app",
  messagingSenderId: "278665750482",
  appId: "1:278665750482:web:094334b351aca87cb4ca0b",
  measurementId: "G-4Z0S6VRL5C"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DAFTAR AKUN TERDAPTAR (31 AKUN)
const validAccounts = [
  "keysa", "Haerunnisa", "Winky", "Brevy", "Ibam", "Asyifa", "Mario", 
  "Aulya", "Faatiya", "Quinzha", "Lolita", "Azizah", "Danish", 
  "Ameliatuzzahra", "Syifa", "Ibnu", "Sangaji", "Shadrina", "Tiara", 
  "Adya", "Luvna", "Natasya", "Eka", "Syahira", "Marsya", "Aura", 
  "Rahma", "Sazkia", "Auria", "Aurel", "Alifah"
];

// STRUKTUR JOBDESK
const jobdeskData = {
  "Acara": ["RD", "Jarkom", "Live Report"],
  "Humas": ["Jarkom", "Pusin"],
  "Keamanan": ["Gerbang Utama", "Pintu dekat FC", "Pintu dekat Pusin", "Pintu Kantin", "Gembok"],
  "Perlengkapan": ["Konsum", "Barang"],
  "Dokumentasi": ["IG Story", "IG Post"],
  "Perlombaan": ["Lomba A", "Lomba B", "Lomba C"]
};

let currentUser = null;
let currentDivision = null;

// ELEMEN DOM
const loginModal = document.getElementById('login-modal');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const appContainer = document.getElementById('app-container');
const currentUserNav = document.getElementById('current-user-name');
const logoutBtn = document.getElementById('logout-btn');

const divisionView = document.getElementById('division-view');
const jobdeskView = document.getElementById('jobdesk-view');
const jobdeskContainer = document.getElementById('jobdesk-container');
const selectedDivisionTitle = document.getElementById('selected-division-title');
const backBtn = document.getElementById('back-btn');

// SYSTEM LOGIN
loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

function handleLogin() {
  const inputVal = passwordInput.value.trim();
  const foundUser = validAccounts.find(acc => acc.toLowerCase() === inputVal.toLowerCase());

  if (foundUser) {
    currentUser = foundUser;
    currentUserNav.textContent = currentUser;
    loginModal.classList.add('hidden');
    appContainer.classList.remove('hidden');
    passwordInput.value = '';
    loginError.textContent = '';
    
    // Pantau status akun untuk memeriksa opsi "Free"
    listenToGlobalJobdeskStatus();
  } else {
    loginError.textContent = "Password/Akun tidak ditemukan.";
  }
}

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  appContainer.classList.add('hidden');
  loginModal.classList.remove('hidden');
});

// NAVIGASI DIVISI
document.querySelectorAll('.div-card[data-division]').forEach(card => {
  card.addEventListener('click', () => {
    currentDivision = card.getAttribute('data-division');
    openJobdeskView(currentDivision);
  });
});

backBtn.addEventListener('click', () => {
  jobdeskView.classList.add('hidden');
  divisionView.classList.remove('hidden');
  currentDivision = null;
});

function openJobdeskView(division) {
  selectedDivisionTitle.textContent = `Divisi ${division}`;
  divisionView.classList.add('hidden');
  jobdeskView.classList.remove('hidden');
  
  listenToJobdeskUpdates(division);
}

// REALTIME DATABASE MANAGEMENT
function listenToJobdeskUpdates(division) {
  const divisionRef = db.ref(`jobdesks/${division}`);
  
  divisionRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    renderJobdesks(division, data);
  });
}

function renderJobdesks(division, activeData) {
  jobdeskContainer.innerHTML = '';
  const list = jobdeskData[division] || [];

  list.forEach(jobName => {
    const assignedUser = activeData[jobName] || null;
    const isTaken = assignedUser !== null;
    const isTakenByMe = assignedUser === currentUser;

    const switchBtn = document.createElement('button');
    switchBtn.className = `jobdesk-switch ${isTaken ? 'on' : 'off'}`;
    
    switchBtn.innerHTML = `
      <div class="switch-title">${jobName}</div>
      <div class="switch-user">${isTaken ? assignedUser : 'Belum diambil'}</div>
    `;

    switchBtn.addEventListener('click', () => {
      toggleJobdesk(division, jobName, assignedUser);
    });

    jobdeskContainer.appendChild(switchBtn);
  });
}

function toggleJobdesk(division, jobName, assignedUser) {
  const jobRef = db.ref(`jobdesks/${division}/${jobName}`);

  if (assignedUser === null) {
    // Ambil Jobdesk
    jobRef.set(currentUser);
  } else if (assignedUser === currentUser) {
    // Lepas Jobdesk
    jobRef.remove();
  } else {
    alert(`Jobdesk ini sedang dikerjakan oleh ${assignedUser}`);
  }
}

// PANTAU APAKAH PENGGUNA MASUK DALAM KATEGORI "FREE"
function listenToGlobalJobdeskStatus() {
  const allJobdesksRef = db.ref('jobdesks');
  const freeCard = document.getElementById('free-card');

  allJobdesksRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    let hasJob = false;

    // Cek seluruh divisi apakah nama pengguna terdaftar
    Object.keys(data).forEach(div => {
      Object.keys(data[div]).forEach(job => {
        if (data[div][job] === currentUser) {
          hasJob = true;
        }
      });
    });

    if (!hasJob) {
      freeCard.style.backgroundColor = "#e2e8f0";
      freeCard.style.color = "#2d3748";
      freeCard.innerHTML = `<span>Status: <strong>Free</strong> (Belum memilih jobdesk)</span>`;
    } else {
      freeCard.style.backgroundColor = "#edf2f7";
      freeCard.style.color = "#a0aec0";
      freeCard.innerHTML = `<span>Status: <strong>Aktif bekerja</strong></span>`;
    }
  });
}
