import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
const activeWorkersContainer = document.getElementById("active-workers-container");
const activeWorkersList = document.getElementById("active-workers-list");
const changeDivContainer = document.getElementById("change-div-container");
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
  activeWorkersList.innerHTML = "";
  changeDivContainer.innerHTML = "";

  let activeWorkers = [];

  Object.keys(userAccounts).forEach(key => {
    const name = userAccounts[key];
    const userData = allData[name] || { divisi: "Free", status: "idle" };
    
    // Jika tidak sedang working, divisi dianggap "Free" secara otomatis
    let userDiv = userData.status === "working" ? userData.divisi : "Free";
    let isWorking = userData.status === "working";

    // Kumpulkan nama anggota yang sedang aktif bekerja di divisi ini
    if (divisi !== "Free" && userDiv === divisi && isWorking) {
      activeWorkers.push(name);
    }

    // Tampilkan anggota jika sesuai dengan filter divisi yang dibuka
    if (userDiv === divisi) {
      const item = document.createElement("div");
      item.className = "member-card";
      
      const isMe = name === currentUser;

      item.innerHTML = `
        <div class="member-info">
          <h4>${name} ${isMe ? '(Anda)' : ''}</h4>
          <p>Status: <span class="badge ${isWorking ? 'badge-working' : 'badge-idle'}">${isWorking ? `Sedang Mengerjakan (${userData.divisi}) 🛠️` : 'Belum Mengambil Jobdesk'}</span></p>
        </div>
        <div class="member-actions">
          ${isMe && divisi !== "Free" ? `
            <button class="btn ${isWorking && userData.divisi === divisi ? 'btn-danger' : 'btn-success'} action-work-btn">
              ${isWorking && userData.divisi === divisi ? 'Selesai' : 'Kerjakan'}
            </button>
          ` : ''}
        </div>
      `;

      membersList.appendChild(item);

      // Logika Klik Tombol Kerjakan / Selesai
      if (isMe && divisi !== "Free") {
        const workBtn = item.querySelector(".action-work-btn");
        workBtn.addEventListener("click", () => {
          const isCurrentlyWorkingHere = isWorking && userData.divisi === divisi;

          if (isCurrentlyWorkingHere) {
            // Jika menekan SELESAI -> Kembalikan otomatis ke "Free" (Belum Mengambil Jobdesk)
            set(ref(db, `jobdesk/${currentUser}`), {
              divisi: "Free",
              status: "idle"
            });
          } else {
            // Jika menekan KERJAKAN -> Daftarkan ke divisi ini & ubah status ke "working"
            set(ref(db, `jobdesk/${currentUser}`), {
              divisi: divisi,
              status: "working"
            });
          }
        });
      }
    }
  });

  // Tampilkan daftar nama yang sedang mengerjakan tugas di bawah nama divisi
  if (divisi !== "Free" && activeWorkers.length > 0) {
    activeWorkersContainer.classList.remove("hidden");
    activeWorkers.forEach(worker => {
      const chip = document.createElement("span");
      chip.className = "worker-chip";
      chip.innerText = `👤 ${worker}`;
      activeWorkersList.appendChild(chip);
    });
  } else {
    activeWorkersContainer.classList.add("hidden");
  }
}
