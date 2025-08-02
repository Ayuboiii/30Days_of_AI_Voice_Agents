document.addEventListener('DOMContentLoaded', () => {
    const welcomeText = document.getElementById('welcome-text');
    const text = "Hello, Ayush! Welcome to 1 Day of Voice AI Agents";
    let index = 0;

    function type() {
        if (index < text.length) {
            welcomeText.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 150); // Typing speed
        }
    }

    // Fade in the text element before typing
    setTimeout(() => {
        if (welcomeText) {
            welcomeText.style.opacity = '1';
            type();
        }
    }, 500); // Initial delay
});