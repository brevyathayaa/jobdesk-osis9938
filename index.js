import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AlzaSyDW_zwnrVC5R7-1lZ8dKTDuYF7Ir4qiMc",
  authDomain: "jobdesk-osis99.firebaseapp.com",
  databaseURL: "https://jobdesk-osis99-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jobdesk-osis99",
  storageBucket: "jobdesk-osis99.appspot.com",
  messagingSenderId: "1278665750482",
  appId: "1:1278665750482:web:094334b351aca87cb4ca0b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Data 31 Akun Pengguna
const userAccounts = {
  "keysa": "Keysa", "haerunnisa": "Haerunnisa", "winky": "Winky", "brevy": "Brevy",
  "ibam": "Ibam", "asyifa": "Asyifa", "mario": "Mario", "aulya": "Aulya",
  "faatiya": "Faatiya", "quinzha": "Quinzha", "lolita": "Lolita", "azizah": "Azizah",
  "danish": "Danish", "ameliatuzzahra": "Ameliatuzzahra", "syifa": "Syifa", "ibnu": "Ibnu",
  "sangaji": "Sangaji", "shadrina": "Shadrina", "tiara": "Tiara", "adya": "Adya",
  "luvna": "Luvna", "natasya": "Natasya", "eka": "Eka", "syahira": "Syahira",
  "marsya": "Marsya", "aura": "Aura", "rahma": "Rahma", "sazkia": "Sazkia",
  "auria": "Auria", "aurel": "Aurel", "alifah": "Alifah"
};

let currentUser = null;
let currentSelectedDivisi = "Free";
let allData = {};

// Element Selector
const loginModal = document.getElementById("login-modal");
const appContainer = document.getElementById("app-container");
const passwordInput = document.getElementById("password-input");
const togglePassword = document.getElementById("toggle-password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const userDisplay = document.getElementById("user-display");
const logoutBtn = document.getElementById("logout-btn");
const divCards = document.querySelectorAll(".div-card");
const detailSection = document.getElementById("division-detail");
const currentDivName = document.getElementById("current-division-name");
const membersList = document.getElementById("members-list");
const backBtn = document.getElementById("back-btn");

// Fitur Lihat/Sembunyikan Kata Sandi
togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.getAttribute("type") === "password";
  passwordInput.setAttribute("type", isPassword ? "text" : "password");
  togglePassword.innerText = isPassword ? "🙈" : "👁️";
});

// Login Logic
loginBtn.addEventListener("click", performLogin);
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") performLogin();
});

function performLogin() {
  const pass = passwordInput.value.trim().toLowerCase();
  if (userAccounts[pass]) {
    currentUser = userAccounts[pass];
    userDisplay.innerText = `Pengguna: ${currentUser}`;
    loginModal.classList.add("hidden");
    appContainer.classList.remove("hidden");
    loginError.innerText = "";
  } else {
    loginError.innerText = "Kata sandi salah. Gunakan nama Anda (huruf kecil).";
  }
}

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  appContainer.classList.add("hidden");
  loginModal.classList.remove("hidden");
  passwordInput.value = "";
  detailSection.classList.add("hidden");
});

// Realtime Listener Firebase
onValue(ref(db, "jobdesk/"), (snapshot) => {
  allData = snapshot.val() || {};
  if (!detailSection.classList.contains("hidden")) {
    renderMembers(currentSelectedDivisi);
  }
});

// Pilih Divisi
divCards.forEach(card => {
  card.addEventListener("click", () => {
    const divisi = card.getAttribute("data-divisi");
    currentSelectedDivisi = divisi;
    showDivision(divisi);
  });
});

backBtn.addEventListener("click", () => {
  detailSection.classList.add("hidden");
});

function showDivision(divisi) {
  currentDivName.innerText = `Divisi: ${divisi === 'Free' ? 'Belum Mengambil Jobdesk' : divisi}`;
  detailSection.classList.remove("hidden");
  renderMembers(divisi);
}

function renderMembers(divisi) {
  membersList.innerHTML = "";

  Object.keys(userAccounts).forEach(key => {
    const name = userAccounts[key];
    const userDiv = allData[name] || "Free";

    if ((divisi === "Free" && userDiv === "Free") || (userDiv === divisi)) {
      const item = document.createElement("div");
      item.className = "member-card";
      
      const isMe = name === currentUser;
      item.innerHTML = `
        <div class="member-info">
          <h4>${name} ${isMe ? '(Anda)' : ''}</h4>
          <p>Status: ${userDiv === 'Free' ? 'Belum Ada Divisi' : userDiv}</p>
        </div>
        ${isMe ? `<button class="btn btn-primary claim-btn" data-user="${name}">Pilih ke Divisi Ini</button>` : ''}
      `;

      membersList.appendChild(item);
    }
  });

  document.querySelectorAll(".claim-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetUser = e.target.getAttribute("data-user");
      set(ref(db, `jobdesk/${targetUser}`), currentSelectedDivisi);
    });
  });
}
