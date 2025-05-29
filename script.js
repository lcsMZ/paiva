// Animate sections' content on scroll to create interactive waterfall effect
const observerOptions = {
    threshold: 0.2
};

const animateElements = document.querySelectorAll('.content.animate');

function animateOnIntersect(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}

const observer = new IntersectionObserver(animateOnIntersect, observerOptions);
animateElements.forEach(el => observer.observe(el));

// Update active nav link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        if (pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

