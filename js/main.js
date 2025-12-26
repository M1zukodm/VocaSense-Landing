document.addEventListener('DOMContentLoaded', function() {
    console.log("VocaSense App iniciada correctamente");

    // LÓGICA 1: Cerrar menú móvil al hacer click
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(menuToggle, {toggle: false});

    navLinks.forEach((l) => {
        l.addEventListener('click', () => {
            if (menuToggle.classList.contains('show')) {
                bsCollapse.hide();
            }
        });
    });

    // LÓGICA 2: Scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if(this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if(targetElement){
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // LÓGICA 3: NAVBAR APARECE DESPUÉS DEL HERO
    const navbar = document.getElementById('mainNavbar');
    const heroSection = document.getElementById('inicio');

    window.addEventListener('scroll', () => {
        // Obtenemos la altura del Hero (Video)
        const heroHeight = heroSection.offsetHeight;
        
        // Si el scroll bajó más que la altura del video (menos un pequeño margen de 50px)
        if (window.scrollY > (heroHeight - 100)) {
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-visible');
        } else {
            navbar.classList.remove('navbar-visible');
            navbar.classList.add('navbar-hidden');
        }
    });

    // LÓGICA 5: LAZY LOADING PARA VIDEOS TUTORIALES
    class LazyVideoLoader {
        constructor() {
            this.videos = document.querySelectorAll('.lazy-video');
            this.options = {
                root: null,
                rootMargin: '200px',
                threshold: 0.1
            };
            this.init();
        }

        init() {
            if (this.videos.length === 0) return;

            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
                this.videos.forEach(video => this.observer.observe(video));
            } else {
                // Fallback para navegadores antiguos
                this.loadAllVideos();
            }

            // Cargar videos al hacer hover (mejor UX)
            this.addHoverLoad();
            
            // Cargar videos cuando la sección de tutoriales esté cerca
            this.addNearSectionLoad();
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    this.loadVideo(video);
                    this.observer.unobserve(video);
                }
            });
        }

        loadVideo(video) {
            // Solo cargar si no se ha cargado ya
            if (video.getAttribute('data-loaded') === 'true') return;

            const videoSrc = video.getAttribute('data-src');
            const sources = video.querySelectorAll('source[data-src]');

            if (videoSrc) {
                video.src = videoSrc;
            }

            // Cargar todas las fuentes de video
            sources.forEach(source => {
                if (source.dataset.src) {
                    source.src = source.dataset.src;
                    source.removeAttribute('data-src');
                }
            });

            // Precargar solo metadata (no el video completo)
            video.load();
            video.setAttribute('data-loaded', 'true');

            // Evento cuando se cargue el metadata
            video.addEventListener('loadedmetadata', () => {
                console.log(`✅ Video cargado: ${videoSrc || 'video tutorial'}`);
            }, { once: true });
        }

        addHoverLoad() {
            this.videos.forEach(video => {
                video.addEventListener('mouseenter', () => {
                    if (video.getAttribute('data-loaded') !== 'true') {
                        this.loadVideo(video);
                    }
                }, { once: true });

                video.addEventListener('touchstart', () => {
                    if (video.getAttribute('data-loaded') !== 'true') {
                        this.loadVideo(video);
                    }
                }, { once: true, passive: true });
            });
        }

        addNearSectionLoad() {
            const tutorialsSection = document.getElementById('tutoriales');
            if (!tutorialsSection) return;

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Cuando la sección entra en viewport, cargar videos cercanos
                        this.loadVisibleVideos();
                        sectionObserver.unobserve(tutorialsSection);
                    }
                });
            }, { rootMargin: '300px' });

            sectionObserver.observe(tutorialsSection);
        }

        loadVisibleVideos() {
            this.videos.forEach(video => {
                if (this.isElementInViewport(video, 300)) {
                    this.loadVideo(video);
                }
            });
        }

        loadAllVideos() {
            this.videos.forEach(video => this.loadVideo(video));
        }

        isElementInViewport(el, offset = 0) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight + offset) &&
                rect.bottom >= (0 - offset) &&
                rect.left <= (window.innerWidth + offset) &&
                rect.right >= (0 - offset)
            );
        }
    }

    // Inicializar lazy loading de videos
    new LazyVideoLoader();

    // LÓGICA 6: OPTIMIZAR VIDEO HERO PARA DISPOSITIVOS
    function optimizeHeroVideo() {
        const heroVideo = document.querySelector('.hero-video');
        if (!heroVideo) return;

        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;

        // Para iOS Safari: forzar atributos para autoplay
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            heroVideo.setAttribute('playsinline', '');
            heroVideo.setAttribute('muted', '');
            
            // Intentar reproducir en iOS
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Fallback: reproducir al tocar
                    document.addEventListener('touchstart', function playVideo() {
                        heroVideo.play();
                        document.removeEventListener('touchstart', playVideo);
                    }, { once: true });
                });
            }
        }

        // Ajustar position para móviles
        if (isMobile && isPortrait) {
            heroVideo.style.objectPosition = 'center 30%';
        }

        // Detectar conexión lenta
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
                heroVideo.setAttribute('preload', 'metadata');
                console.log('✅ Modo ahorro de datos activado para video hero');
            }
        }
    }

    // Optimizar video hero
    optimizeHeroVideo();
    
    // Re-optimizar al cambiar tamaño
    window.addEventListener('resize', optimizeHeroVideo);
});

// LÓGICA 4: GALERÍA DINÁMICA
const galleryModal = document.getElementById('galleryModal');
if (galleryModal) {
    galleryModal.addEventListener('show.bs.modal', function (event) {
        // Botón que disparó el modal (la tarjeta)
        const button = event.relatedTarget;
        
        // Extraer info de los atributos data-*
        const imageSrc = button.getAttribute('data-image');
        const title = button.getAttribute('data-title');
        const description = button.getAttribute('data-description');
        
        // Actualizar el contenido del modal
        const modalImage = galleryModal.querySelector('#galleryImage');
        const modalTitle = galleryModal.querySelector('#galleryTitle');
        const modalDesc = galleryModal.querySelector('#galleryDesc');
        
        modalImage.src = imageSrc;
        modalTitle.textContent = title;
        modalDesc.textContent = description;
    });

    /* --- LÓGICA DE DESCARGA DE VERSIONES --- */
document.addEventListener('DOMContentLoaded', function() {
    
    const btnDownload = document.getElementById('btnDownload');
    const versionSelector = document.getElementById('versionSelector');

    // Solo activamos la lógica si el botón existe en la página
    if (btnDownload && versionSelector) {
        
        btnDownload.addEventListener('click', function() {
            // 1. Obtener la URL del select
            const url = versionSelector.value;
            
            // 2. Validar que no esté vacío (opcional)
            if (url) {
                // 3. Forzar la descarga
                window.location.href = url;
            }
        });
        
    }
});
}