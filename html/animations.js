document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.slide');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  elements.forEach(element => {
    observer.observe(element);
  });
});

const shader = document.querySelector('metallic-shader');

// Default selections
let selectedMetal = 'aluminum';
let selectedSize = { width: 400, height: 399 };
// Select all metal buttons
const metalButtons = document.querySelectorAll(".mb");

// Function to set selected metal visually and on the shader
metalButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove 'selected' from all buttons
        metalButtons.forEach(b => b.classList.remove("selected"));

        // Add 'selected' to clicked button
        btn.classList.add("selected");

        // Update the shader
        const metal = btn.dataset.metal || btn.dataset.metal.toLowerCase();
        shader.setAttribute("metal-type", metal);
    });
});

// Set a default on page load
const defaultMetal = metalButtons[0];
defaultMetal.classList.add("selected");
shader.setAttribute("metal-type", defaultMetal.dataset.metal || defaultMetal.textContent.toLowerCase());

// Size buttons
document.querySelectorAll('.size-button').forEach(btn => {
    const w = parseInt(btn.dataset.width);
    const h = parseInt(btn.dataset.height);

    // Set default selected
    if(w === selectedSize.width && h === selectedSize.height) btn.classList.add('selected');

    btn.addEventListener('click', () => {
        // Update shader attributes
        shader.setAttribute('width', w);
        shader.setAttribute('height', h);
        shader.style.width = w + 'px';
        shader.style.height = h + 'px';

        // Update canvas inside shadow DOM
        const canvas = shader.shadowRoot.querySelector('canvas');
        canvas.width = w;
        canvas.height = h;

        // Update button styles
        document.querySelectorAll('.size-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        selectedSize = { width: w, height: h };
    });
});

const autoLightCheckbox = document.getElementById('autoLightCheckbox');

autoLightCheckbox.addEventListener('change', () => {
    if(autoLightCheckbox.checked){
        shader.setAttribute('auto-light', '');
        shader.auto = true;
    } else {
        shader.removeAttribute('auto-light');
        shader.auto = false;
    }
});

const fileInput = document.getElementById("imageLoader");

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    shader.setImage(url);
});