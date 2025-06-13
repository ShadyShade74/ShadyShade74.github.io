document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menu = document.querySelector('.menu');
    const closeBtn = document.querySelector('.close-btn');
    
    // Otwieranie menu
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        menu.classList.toggle('active');
        // Dodajemy opacity do hamburger menu
        hamburger.style.opacity = '0';
        hamburger.style.transition = 'opacity 0.3s ease';
    });

    // Zamykanie przez przycisk X
    closeBtn.addEventListener('click', function() {
        hamburger.classList.remove('active');
        menu.classList.remove('active');
        // Przywracamy widoczność hamburger menu
        hamburger.style.opacity = '1';
    });

    // Zamykanie przy kliknięciu poza menu
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
            hamburger.classList.remove('active');
            menu.classList.remove('active');
            // Przywracamy widoczność hamburger menu
            hamburger.style.opacity = '1';
        }
    });
    document.querySelectorAll('.scroll-to').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Zamknij menu po kliknięciu
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                hamburger.style.opacity = '1';

                // Płynne przewijanie
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    // ANIMACJA FALI DLA KAFELKÓW
    const kafelki = document.querySelectorAll('.kafelek');
    let startTime = null;
    const amplitude = 16; // wysokość fali w px
    const period = 2000; // czas pełnej fali w ms

    function animateWave(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;

        kafelki.forEach((kafelek, i) => {
            // Każdy kafelek ma przesunięcie fazy
            const phase = (elapsed + i * (period / kafelki.length)) % period;
            const angle = (phase / period) * 2 * Math.PI;
            const y = Math.sin(angle) * amplitude;
            kafelek.style.transform = `translateY(${y}px)`;
        });

        requestAnimationFrame(animateWave);
    }

    if (kafelki.length) {
        requestAnimationFrame(animateWave);
    }
});