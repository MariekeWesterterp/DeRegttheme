// Function to animate a single counter using requestAnimationFrame
function animateCounter(counterEl, delay = 0, duration = 2000) {
    const countSpan = counterEl.querySelector('.count');
    if (!countSpan) {
        return;
    }

    const endValue = parseInt(countSpan.textContent, 10);
    if (Number.isNaN(endValue)) {
        return;
    }

    // Reset counter start
    countSpan.textContent = '0';

    setTimeout(() => {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progress * endValue);

            countSpan.textContent = currentValue;

            // Apply grow animation (optional visual effect)
            countSpan.style.animation = 'grow 0.8s ease';
            setTimeout(() => {
                countSpan.style.animation = '';
            }, 800);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }, delay);
}

function initAnimatedCounters() {
    const wrappers = document.querySelectorAll('.animatednumbers__counter-wrapper');

    wrappers.forEach(wrapper => {
        const shouldAnimate = wrapper.dataset.animate !== 'false';
        if (!shouldAnimate) {
            return;
        }

        const counters = wrapper.querySelectorAll('.counter-container');
        if (!counters.length) {
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach((counter, index) => {
                        animateCounter(counter, index * 200, 2000); // 2000 ms = 2 sec
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(wrapper);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimatedCounters);
} else {
    initAnimatedCounters();
}
