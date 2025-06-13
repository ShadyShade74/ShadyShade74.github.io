document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.position-section');
    
    sections.forEach(section => {
        const expandButton = section.querySelector('.expand-button');
        const initialView = section.querySelector('.initial-view');
        const expandedView = section.querySelector('.expanded-view');
        
        // Hide expanded view by default
        expandedView.style.display = 'none';
        
        expandButton.addEventListener('click', () => {
            expandButton.disabled = true; // Prevent multiple clicks
            
            if (expandedView.style.display === 'none') {
                // Fade out initial view
                initialView.style.opacity = '0';
                initialView.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    initialView.style.display = 'none';
                    expandedView.style.display = 'flex';
                    
                    // Trigger reflow
                    void expandedView.offsetWidth;
                    
                    // Fade in expanded view
                    expandedView.classList.add('fade-in');
                    expandButton.textContent = 'Show Less';
                    expandButton.disabled = false;
                }, 300);
            } else {
                // Fade out expanded view
                expandedView.classList.remove('fade-in');
                
                setTimeout(() => {
                    expandedView.style.display = 'none';
                    initialView.style.display = 'flex';
                    
                    // Trigger reflow
                    void initialView.offsetWidth;
                    
                    // Fade in initial view
                    initialView.style.opacity = '1';
                    expandButton.textContent = 'Show More';
                    expandButton.disabled = false;
                }, 1000);
            }
        });
    });
});