document.addEventListener('DOMContentLoaded', function() {
    console.log("VocaSense App (Tailwind Core) iniciada correctamente");

    /* =========================================
       1. NAVBAR SCROLL LOGIC
    ========================================= */
    const navbar = document.getElementById('mainNavbar');
    const heroSection = document.getElementById('inicio');

    window.addEventListener('scroll', () => {
        const heroHeight = heroSection ? heroSection.offsetHeight : 600;
        if (window.scrollY > (heroHeight - 100)) {
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-visible');
        } else {
            navbar.classList.remove('navbar-visible');
            navbar.classList.add('navbar-hidden');
        }
    });

/* =========================================
   2. THEME TOGGLE LOGIC (Corregido)
========================================= */
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlEl = document.documentElement;
const icons = ['light_mode', 'dark_mode', 'computer'];

// Aseguramos que el valor sea un número válido (0, 1 o 2)
let storedState = localStorage.getItem('themeState');
let currentThemeState = (storedState !== null) ? parseInt(storedState) : 2;

function applyTheme(state) {
    // 0: Claro, 1: Oscuro, 2: Sistema
    if (state === 0) {
        htmlEl.classList.remove('dark');
    } else if (state === 1) {
        htmlEl.classList.add('dark');
    } else if (state === 2) {
        // Detección real del sistema
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            htmlEl.classList.add('dark');
        } else {
            htmlEl.classList.remove('dark');
        }
    }
    
    // Guardar estado y actualizar icono
    localStorage.setItem('themeState', state);
    if (themeIcon) themeIcon.textContent = icons[state];
}

// Escuchar cambios del sistema en tiempo real
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (currentThemeState === 2) {
        if (e.matches) htmlEl.classList.add('dark');
        else htmlEl.classList.remove('dark');
    }
});

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        currentThemeState = (currentThemeState + 1) % 3;
        applyTheme(currentThemeState);
    });
}

// Ejecución inmediata
applyTheme(currentThemeState);
   /* =========================================
       3. MODAL & GALLERY LOGIC
    ========================================= */
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modalBackdrop');
        if(modal && backdrop) {
            // Bloqueamos el scroll del body
            document.body.classList.add('overflow-hidden'); 
            
            backdrop.classList.remove('hidden');
            setTimeout(() => {
                backdrop.classList.remove('opacity-0');
                modal.classList.add('active');
            }, 10);
        }
    };

    window.openGalleryModal = function(imgSrc, title, desc) {
        const modal = document.getElementById('modalGallery');
        const imgEl = document.getElementById('galleryImage');
        const titleEl = document.getElementById('galleryTitle');
        const descEl = document.getElementById('galleryDesc');

        if(imgEl) imgEl.src = imgSrc;
        if(titleEl) titleEl.textContent = title;
        if(descEl) descEl.textContent = desc;

        // Esta función llama a openModal, por lo que el bloqueo de scroll 
        // ya está incluido aquí automáticamente.
        openModal('modalGallery');
    }

    window.closeAllModals = function() {
        const modals = document.querySelectorAll('.modal');
        const backdrop = document.getElementById('modalBackdrop');
        
        // Devolvemos el scroll al body
        document.body.classList.remove('overflow-hidden');

        modals.forEach(m => m.classList.remove('active'));
        if(backdrop) {
            backdrop.classList.add('opacity-0');
            setTimeout(() => {
                backdrop.classList.add('hidden');
            }, 300);
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    /* =========================================
       4. DOWNLOAD VERSION SELECTOR
    ========================================= */
    const btnDownloadOld = document.getElementById('btnDownloadOld');
    const versionSelector = document.getElementById('versionSelector');

    if (btnDownloadOld && versionSelector) {
        btnDownloadOld.addEventListener('click', function() {
            const url = versionSelector.value;
            if (url && url.startsWith('http')) {
                window.location.href = url;
            }
        });
    }

    /* =========================================
       5. LAZY LOADING VIDEOS
    ========================================= */
    const lazyVideos = document.querySelectorAll('.lazy-video');
    
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        video.load();
                        video.removeAttribute('data-src');
                    }
                    observer.unobserve(video);
                }
            });
        });
        lazyVideos.forEach(video => videoObserver.observe(video));
    }
});

