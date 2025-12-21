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
    }

    