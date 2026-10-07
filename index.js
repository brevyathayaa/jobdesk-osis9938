import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Tempelkan konfigurasi firebase milikmu di sini
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Data Akun Kunci
const userAccounts = {
  "keysa": "Keysa", "winky": "Winky", "alif": "Alif", "aqila": "Aqila",
  "dhafin": "Dhafin", "fakhri": "Fakhri", "zahra": "Zahra", "naufal": "Naufal"
};

let currentUser = null;
let allData = {};

// Element Selector
const loginModal = document.getElementById("login-modal");
const appContainer = document.getElementById("app-container");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const userDisplay = document.getElementById("user-display");
const logoutBtn = document.getElementById("logout-btn");
const divCards = document.querySelectorAll(".div-card");
const detailSection = document.getElementById("division-detail");
const currentDivName = document.getElementById("current-division-name");
const membersList = document.getElementById("members-list");
const backBtn = document.getElementById("back-btn");

// Login Logic
loginBtn.addEventListener("click", () => {
  const pass = passwordInput.value.trim().toLowerCase();
  if (userAccounts[pass]) {
    currentUser = userAccounts[pass];
    userDisplay.innerText = `Pengguna: ${currentUser}`;
    loginModal.classList.add("hidden");
    appContainer.classList.remove("hidden");
    loginError.innerText = "";
  } else {
    loginError.innerText = "Kata sandi salah. Coba lagi.";
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  appContainer.classList.add("hidden");
  loginModal.classList.remove("hidden");
  passwordInput.value = "";
});

// Realtime Listener Firebase
onValue(ref(db, "jobdesk/"), (snapshot) => {
  allData = snapshot.val() || {};
});

// Filter Divisi
divCards.forEach(card => {
  card.addEventListener("click", () => {
    const divisi = card.getAttribute("data-divisi");
    showDivision(divisi);
  });
});

backBtn.addEventListener("click", () => {
  detailSection.classList.add("hidden");
});

function showDivision(divisi) {
  currentDivName.innerText = `Divisi: ${divisi}`;
  membersList.innerHTML = "";
  detailSection.classList.remove("hidden");

  Object.keys(userAccounts).forEach(key => {
    const name = userAccounts[key];
    const userDiv = allData[name] || "Free";

    if ((divisi === "Free" && userDiv === "Free") || (userDiv === divisi)) {
      const item = document.createElement("div");
      item.className = "member-card";
      
      const isMe = name === currentUser;
      item.innerHTML = `
        <div class="member-info">
          <h4>${name}</h4>
          <p>Status: ${userDiv}</p>
        </div>
        ${isMe ? `<button class="btn btn-primary claim-btn" data-user="${name}">Pilih Ke Divisi Ini</button>` : ''}
      `;

      membersList.appendChild(item);
    }
  });

  document.querySelectorAll(".claim-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetUser = e.target.getAttribute("data-user");
      set(ref(db, `jobdesk/${targetUser}`), divisi);
    });
  });
}
