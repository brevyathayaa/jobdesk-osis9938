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

// Daftar Jobdesk Per Divisi
const divisionJobdesks = {
  "Acara": ["Run Down", "Bagan", "Live Report", "Jarkom", "Rekap Hasil"],
  "Humas": ["Pusat Informasi", "Jarkom", "Perwakilan Divisi"],
  "Keamanan": ["Gerbang Utama", "Pintu Dekat FC", "Pintu Dekat Pusin", "Pintu Kantin", "Gembok"],
  "Perlengkapan": ["Konsum", "Barang"],
  "Dokumentasi": ["IG Story", "IG Post"],
  "Perlombaan": ["Perlombaan A", "Perlombaan B", "Perlombaan C", "Perlombaan D", "Perlombaan E"]
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

// Toggle Show/Hide Password
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

// Select Divisi
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

  // 1. TAMPILAN DIVISI DENGAN JOBDESK (Acara, Humas, Keamanan, Perlengkapan, Dokumentasi, Perlombaan)
  if (divisi !== "Free" && divisionJobdesks[divisi]) {
    const jobdesks = divisionJobdesks[divisi];

    jobdesks.forEach(jobdeskTitle => {
      const card = document.createElement("div");
      card.className = "jobdesk-card";

      // Cari siapa saja yang sedang mengerjakan jobdesk ini
      let activeWorkers = [];
      Object.keys(userAccounts).forEach(key => {
        const name = userAccounts[key];
        const userData = allData[name] || {};
        if (userData.divisi === divisi && userData.jobdesk === jobdeskTitle && userData.status === "working") {
          activeWorkers.push(name);
        }
      });

      const isMeWorkingHere = activeWorkers.includes(currentUser);

      card.innerHTML = `
        <div class="jobdesk-info">
          <h3>📌 ${jobdeskTitle}</h3>
          <div class="workers-container">
            <span class="worker-label">Sedang mengerjakan:</span>
            <div class="worker-tags">
              ${activeWorkers.length > 0 
                ? activeWorkers.map(w => `<span class="worker-chip">👤 ${w}</span>`).join('') 
                : '<span class="empty-text">Belum ada yang mengerjakan</span>'}
            </div>
          </div>
        </div>
        <div class="jobdesk-action">
          <button class="btn ${isMeWorkingHere ? 'btn-danger' : 'btn-success'} work-btn">
            ${isMeWorkingHere ? 'Selesai' : 'Kerjakan'}
          </button>
        </div>
      `;

      membersList.appendChild(card);

      const actionBtn = card.querySelector(".work-btn");
      actionBtn.addEventListener("click", () => {
        if (isMeWorkingHere) {
          // SELESAI -> Kembalikan otomatis ke "Belum Mengambil Jobdesk"
          set(ref(db, `jobdesk/${currentUser}`), {
            divisi: "Free",
            jobdesk: "-",
            status: "idle"
          });
        } else {
          // KERJAKAN -> Masukkan ke jobdesk ini secara khusus
          set(ref(db, `jobdesk/${currentUser}`), {
            divisi: divisi,
            jobdesk: jobdeskTitle,
            status: "working"
          });
        }
      });
    });

  // 2. TAMPILAN DAFTAR "BELUM MENGAMBIL JOBDESK"
  } else {
    Object.keys(userAccounts).forEach(key => {
      const name = userAccounts[key];
      const userData = allData[name] || { divisi: "Free", status: "idle" };

      // Muncul di daftar ini jika status tidak sedang mengerjakan tugas apapun
      if (userData.status !== "working" || userData.divisi === "Free") {
        const card = document.createElement("div");
        card.className = "member-card";

        const isMe = name === currentUser;
        card.innerHTML = `
          <div class="member-info">
            <h4>${name} ${isMe ? '(Anda)' : ''}</h4>
            <p>Status: <span class="badge badge-idle">Belum Mengambil Jobdesk</span></p>
          </div>
        `;
        membersList.appendChild(card);
      }
    });
  }
}
