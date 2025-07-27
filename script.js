const openBtn = document.getElementById("openBookBtn");
const closeBtn = document.getElementById("closeBookBtn");
const book = document.getElementById("book");
const audio = document.getElementById("backgroundMusic");

// Elemen navigasi halaman
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicator = document.getElementById("pageIndicator");
const pageNavigation = document.getElementById("pageNavigation");

// State halaman dan animasi
let currentPage = 1;
const totalPages = 2;
let isAnimating = false;

// Debug function untuk tracking state
function debugState(action) {
  console.log(`[DEBUG] ${action} - currentPage: ${currentPage}, totalPages: ${totalPages}, isAnimating: ${isAnimating}`);
}

// Tombol Buka Buku dengan animasi yang lebih smooth
openBtn.addEventListener("click", () => {
  if (isAnimating) return;
  
  debugState("Opening book");
  isAnimating = true;
  book.classList.add("open");
  
  // Delay untuk menampilkan navigasi setelah cover terbuka
  setTimeout(() => {
    pageNavigation.style.display = "flex";
    setTimeout(() => {
      pageNavigation.style.opacity = "1";
    }, 100);
    updatePageNavigation();
    isAnimating = false;
    debugState("Book opened - animation complete");
  }, 1000);
  
  // Audio dengan fade in effect
  audio.volume = 0;
  audio.play().catch((err) => {
    console.log("Autoplay diblokir: ", err);
  });
  
  // Fade in audio
  let volume = 0;
  const fadeIn = setInterval(() => {
    if (volume < 0.4) {
      volume += 0.02;
      audio.volume = volume;
    } else {
      clearInterval(fadeIn);
    }
  }, 50);
});

// Tombol Tutup Buku dengan animasi yang lebih smooth
closeBtn.addEventListener("click", () => {
  if (isAnimating) return;
  
  debugState("Closing book");
  isAnimating = true;
  
  // Fade out navigasi
  pageNavigation.style.opacity = "0";
  
  setTimeout(() => {
    book.classList.remove("open");
    pageNavigation.style.display = "none";
    currentPage = 1;
    showPage(currentPage);
    
    setTimeout(() => {
      isAnimating = false;
      debugState("Book closed - animation complete");
    }, 800);
  }, 300);
  
  // Audio fade out
  let volume = audio.volume;
  const fadeOut = setInterval(() => {
    if (volume > 0) {
      volume -= 0.02;
      audio.volume = Math.max(0, volume);
    } else {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(fadeOut);
    }
  }, 50);
});

// Fungsi untuk menampilkan halaman dengan animasi flip yang realistis
function showPage(pageNumber, direction = 'next') {
  if (isAnimating) {
    debugState("showPage blocked - already animating");
    return;
  }
  
  debugState(`showPage called - page ${pageNumber}, direction: ${direction}`);
  
  const pages = document.querySelectorAll('.page');
  const currentPageElement = document.querySelector('.page.active');
  
  isAnimating = true;
  
  // Jika ada halaman yang sedang aktif, beri efek flipping
  if (currentPageElement && direction === 'next') {
    currentPageElement.classList.add('flipping');
    
    // Hapus class flipping setelah animasi selesai
    setTimeout(() => {
      currentPageElement.classList.remove('flipping');
    }, 1200);
  }
  
  // Delay untuk sinkronisasi dengan animasi flip
  setTimeout(() => {
    pages.forEach((page, index) => {
      page.classList.remove('active', 'prev', 'flipping');
      
      if (index + 1 === pageNumber) {
        page.classList.add('active');
      } else if (index + 1 < pageNumber) {
        page.classList.add('prev');
      }
    });
    
    updatePageNavigation();
    
    // Reset animating state setelah transisi selesai dengan fallback
    const resetAnimation = () => {
      isAnimating = false;
      debugState("showPage animation complete");
    };
    
    setTimeout(resetAnimation, 600);
    
    // Fallback untuk memastikan isAnimating ter-reset
    setTimeout(() => {
      if (isAnimating) {
        console.warn("Force resetting isAnimating state");
        isAnimating = false;
        updatePageNavigation();
      }
    }, 2000);
    
  }, direction === 'next' ? 600 : 0);
}

// Fungsi untuk update navigasi halaman
function updatePageNavigation() {
  pageIndicator.textContent = `Halaman ${currentPage} dari ${totalPages}`;
  
  // Update tombol prev
  const prevDisabled = currentPage === 1 || isAnimating;
  prevPageBtn.disabled = prevDisabled;
  
  // Update tombol next
  const nextDisabled = currentPage === totalPages || isAnimating;
  nextPageBtn.disabled = nextDisabled;
  
  debugState(`Navigation updated - prev disabled: ${prevDisabled}, next disabled: ${nextDisabled}`);
  
  // Visual feedback untuk debugging
  if (nextDisabled) {
    console.log("Next button disabled because:", currentPage === totalPages ? "Last page" : "Animating");
  }
  if (prevDisabled) {
    console.log("Prev button disabled because:", currentPage === 1 ? "First page" : "Animating");
  }
}

// Event listener untuk tombol halaman sebelumnya
prevPageBtn.addEventListener("click", () => {
  debugState("Prev button clicked");
  if (currentPage > 1 && !isAnimating) {
    currentPage--;
    showPage(currentPage, 'prev');
  } else {
    console.log("Prev button click ignored:", currentPage <= 1 ? "Already first page" : "Animation in progress");
  }
});

// Event listener untuk tombol halaman selanjutnya
nextPageBtn.addEventListener("click", () => {
  debugState("Next button clicked");
  if (currentPage < totalPages && !isAnimating) {
    currentPage++;
    showPage(currentPage, 'next');
  } else {
    console.log("Next button click ignored:", currentPage >= totalPages ? "Already last page" : "Animation in progress");
  }
});

// Tambahkan event listener untuk force reset jika terjadi masalah
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
    console.log("Force resetting animation state");
    isAnimating = false;
    updatePageNavigation();
  }
});

// Tambahkan event listener untuk keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!book.classList.contains('open') || isAnimating) return;
  
  switch(e.key) {
    case 'ArrowLeft':
      if (currentPage > 1) {
        currentPage--;
        showPage(currentPage, 'prev');
      }
      break;
    case 'ArrowRight':
      if (currentPage < totalPages) {
        currentPage++;
        showPage(currentPage, 'next');
      }
      break;
    case 'Escape':
      closeBtn.click();
      break;
  }
});

// Generate Bintang
const starsContainer = document.querySelector(".stars");
for (let i = 0; i < 100; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  star.style.top = Math.random() * 100 + '%';
  star.style.left = Math.random() * 100 + '%';
  star.style.animationDelay = Math.random() * 2 + 's';
  starsContainer.appendChild(star);
}