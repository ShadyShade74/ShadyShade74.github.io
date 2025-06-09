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
});