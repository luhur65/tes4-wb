
// Data pengguna (tetap sama)
const users = [
  { id: 1, name: "Budi Santoso", email: "budi.santoso@example.com", phone: "+62 812-3456-7890", website: "https://budisantoso.id", avatar: "male", bio: "Developer web berpengalaman dengan keahlian di bidang frontend dan backend. Suka mengerjakan proyek open source dan berbagi pengetahuan." },
  { id: 2, name: "Leanne Graham", email: "siti.rahayu@example.com", phone: "+62 878-9012-3456", website: "https://sitirahayu.id", avatar: "female", bio: "UI/UX Designer dengan fokus pada pengalaman pengguna yang intuitif. Memiliki pengalaman bekerja dengan berbagai startup teknologi." },
  { id: 3, name: "Agus Wijaya", email: "agus.wijaya@example.com", phone: "+62 857-1234-5678", website: "https://aguswijaya.id", avatar: "male", bio: "Product Manager dengan latar belakang teknis. Berpengalaman dalam mengembangkan produk digital yang berfokus pada kebutuhan pengguna." },
  { id: 4, name: "Dewi Lestari", email: "dewi.lestari@example.com", phone: "+62 822-3456-7890", website: "https://dewilestari.id", avatar: "female", bio: "Data Scientist dengan keahlian di bidang machine learning dan analisis data. Senang memecahkan masalah kompleks dengan pendekatan data-driven." },
  { id: 5, name: "Eko Prasetyo", email: "eko.prasetyo@example.com", phone: "+62 813-9876-5432", website: "https://ekoprasetyo.id", avatar: "male", bio: "DevOps Engineer yang berfokus pada otomatisasi dan infrastruktur cloud. Berpengalaman dengan AWS, Docker, dan Kubernetes." },
  { id: 6, name: "Rina Wati", email: "rina.wati@example.com", phone: "+62 877-6543-2109", website: "https://rinawati.id", avatar: "female", bio: "Content Creator dan Digital Marketer dengan pengalaman lebih dari 5 tahun. Ahli dalam strategi konten dan media sosial." },
  { id: 7, name: "Rina Wati", email: "rina.wati@example.com", phone: "+62 877-6543-2109", website: "https://rinawati.id", avatar: "female", bio: "Content Creator dan Digital Marketer dengan pengalaman lebih dari 5 tahun. Ahli dalam strategi konten dan media sosial." },
  { id: 8, name: "Dewi Lestari", email: "dewi.lestari@example.com", phone: "+62 822-3456-7890", website: "https://dewilestari.id", avatar: "female", bio: "Data Scientist dengan keahlian di bidang machine learning dan analisis data. Senang memecahkan masalah kompleks dengan pendekatan data-driven." },
];

// Fungsi untuk membuat kartu pengguna
function createUserCards() {
  const container = document.getElementById('user-container');

  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'user-card'; // Menggunakan class CSS native
    card.dataset.userId = user.id;

    // Menggunakan Dicebear v8.x dan avatar style yang benar
    const avatarStyle = 'avataaars';
    const avatarUrl = `https://api.dicebear.com/8.x/${avatarStyle}/svg?seed=${encodeURIComponent(user.name)}`;

    // HTML card dengan class CSS native
    card.innerHTML = `
  <div class="card-content">
    <div class="card-header">
      <div class="card-avatar-wrapper">
        <img src="${avatarUrl}" alt="${user.name}" class="card-avatar">
      </div>
      <h3 class="card-name">${user.name}</h3>
    </div>

    <div class="card-info">
      <div class="info-item">
        <i class="fas fa-envelope"></i>
        <a href="mailto:${user.email}">${user.email}</a>
      </div>
      <div class="info-item">
        <i class="fas fa-phone"></i>
        <span>${user.phone}</span>
      </div>
      <div class="info-item">
        <i class="fas fa-globe"></i>
        <a href="${user.website}" target="_blank">${user.website.replace('https://', '')}</a>
      </div>
    </div>

    <div class="card-actions">
      <button class="action-btn like-btn" title="Suka">
        <i class="fas fa-heart"></i>
      </button>
      <button class="action-btn view-profile-btn" title="Lihat Profil">
        <i class="fas fa-user"></i>
      </button>
      <button class="action-btn delete-btn" title="Hapus">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
  `;

    container.appendChild(card);

    // Event listener untuk tombol like
    card.querySelector('.like-btn').addEventListener('click', function () {
      this.classList.toggle('liked');
      showToast(this.classList.contains('liked') ? `Anda menyukai profil ${user.name}` : `Batal menyukai profil ${user.name}`);
    });

    // Event listener untuk tombol lihat profil
    card.querySelector('.view-profile-btn').addEventListener('click', () => showProfileModal(user));

    // Event listener untuk tombol hapus
    card.querySelector('.delete-btn').addEventListener('click', function () {
      const userCard = this.closest('.user-card');
      userCard.classList.add('delete-animation');
      setTimeout(() => {
        userCard.remove();
        showToast(`Profil ${user.name} telah dihapus`);
      }, 500);
    });
  });
}

// Fungsi untuk menampilkan modal profil
function showProfileModal(user) {
  const modal = document.getElementById('profileModal');
  const modalContent = document.getElementById('modalContent');

  const avatarStyle = user.avatar === 'female' ? 'avataaars-female' : 'avataaars';
  const avatarUrl = `https://api.dicebear.com/8.x/${avatarStyle}/svg?seed=${encodeURIComponent(user.name)}`;

  // HTML modal dengan class CSS native
  modalContent.innerHTML = `
  <div class="modal-profile-header">
    <div class="modal-avatar-wrapper">
      <img src="${avatarUrl}" alt="${user.name}" class="card-avatar">
    </div>
    <h3 class="modal-name">${user.name}</h3>
  </div>

  <div class="card-info" style="margin-bottom: 1rem;">
    <div class="info-item"><i class="fas fa-envelope"></i><a href="mailto:${user.email}">${user.email}</a></div>
    <div class="info-item"><i class="fas fa-phone"></i><span>${user.phone}</span></div>
    <div class="info-item"><i class="fas fa-globe"></i><a href="${user.website}" target="_blank">${user.website.replace('https://', '')}</a></div>
  </div>

  <div class="modal-bio-wrapper">
    <h4 class="modal-bio-title">Biografi:</h4>
    <p class="modal-bio-text">${user.bio}</p>
  </div>
  `;

  modal.classList.remove('modal-hidden');
}

// Fungsi untuk menutup modal
function closeModal() {
  document.getElementById('profileModal').classList.add('modal-hidden');
}

// Fungsi untuk menampilkan toast notification
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  createUserCards();

  document.getElementById('closeModal').addEventListener('click', closeModal);

  document.getElementById('profileModal').addEventListener('click', function (e) {
    if (e.target === this) {
      closeModal();
    }
  });
});