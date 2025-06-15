document.addEventListener('DOMContentLoaded', () => {
    class Carousel {
        constructor(element) {
            this.container = element;
            this.track = element.querySelector('.carousel-track');
            this.slides = Array.from(this.track.children);
            this.nextButton = element.querySelector('.carousel-button.next');
            this.prevButton = element.querySelector('.carousel-button.prev');
            this.dotsContainer = element.querySelector('.carousel-dots');
            
            this.setupInfiniteSlides();
            
            this.slideWidth = this.slides[0].getBoundingClientRect().width;
            this.currentIndex = this.slides.length / 3;
            this.slidesPerView = 3;
            
            this.initDots();
            this.addEventListeners();
            this.goToSlide(this.currentIndex, false);
        }
        
        setupInfiniteSlides() {
            const slidesToClone = this.slides.length;
            const clonesStart = this.slides.slice(0, slidesToClone).map(slide => slide.cloneNode(true));
            const clonesEnd = this.slides.slice(0, slidesToClone).map(slide => slide.cloneNode(true));
            
            clonesEnd.forEach(clone => this.track.appendChild(clone));
            clonesStart.reverse().forEach(clone => this.track.insertBefore(clone, this.track.firstChild));
            
            this.slides = Array.from(this.track.children);
        }
        
        initDots() {
            const dotsCount = 6; // Stała liczba kafelków
            for (let i = 0; i < dotsCount; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(i + this.slides.length / 3)); // Dodajemy offset
                this.dotsContainer.appendChild(dot);
        }
    }
        
        addEventListeners() {
            this.nextButton.addEventListener('click', () => this.next());
            this.prevButton.addEventListener('click', () => this.prev());
            this.track.addEventListener('transitionend', () => this.handleTransitionEnd());
        }
        
        handleTransitionEnd() {
            const totalSlides = this.slides.length;
            if (this.currentIndex >= totalSlides - this.slidesPerView) {
                this.goToSlide(this.slidesPerView, false);
            } else if (this.currentIndex <= 0) {
                this.goToSlide(totalSlides - this.slidesPerView * 2, false);
            }
        }
        
        goToSlide(index, withAnimation = true) {
            this.currentIndex = index;
            const offset = -this.currentIndex * (this.slideWidth + 20);
            
            if (!withAnimation) {
                this.track.style.transition = 'none';
                requestAnimationFrame(() => {
                    this.track.style.transform = `translateX(${offset}px)`;
                    requestAnimationFrame(() => {
                        this.track.style.transition = 'transform 0.5s ease-in-out';
                    });
                });
            } else {
                this.track.style.transform = `translateX(${offset}px)`;
            }
            
            this.updateDots();
        }
        
        updateDots() {
        // Aktualizujemy logikę zaznaczania aktywnej kropki
        const normalizedIndex = this.currentIndex % (this.slides.length / 3);
        const activeDotIndex = Math.floor(normalizedIndex % 6); // Modulo 6 dla 6 kafelków
        
        this.dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === activeDotIndex);
        });
    }
        
        next() {
            this.goToSlide(this.currentIndex + 1);
        }
        
        prev() {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    // Inicjalizacja karuzeli
    document.querySelectorAll('.carousel-container').forEach(carousel => {
        new Carousel(carousel);
    });
});