document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // SLIDE ANIMATION OBSERVER
  // =========================
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

  elements.forEach(element => observer.observe(element));


  // =========================
  // SHADER SETUP
  // =========================
  const shader = document.querySelector('metallic-shader');

  if (!shader) {
    console.error("metallic-shader not found!");
    return;
  }

let selectedMetal = 'aluminum';
let selectedMetalLabel = 'Alumínio';

let selectedSize = { width: 400, height: 399 };
let selectedSizeLabel = '5cm x 5cm';


  // =========================
  // METAL BUTTONS
  // =========================
  const metalButtons = document.querySelectorAll(".mb");

metalButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        metalButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");

        selectedMetal = btn.dataset.metal;
        selectedMetalLabel = btn.dataset.label;

        shader.setAttribute("metal-type", selectedMetal);
    });
});

  // Default metal
  if (metalButtons.length > 0) {
    const defaultMetal = metalButtons[0];
    defaultMetal.classList.add("selected");

    selectedMetal = defaultMetal.dataset.metal;
    shader.setAttribute("metal-type", selectedMetal);
  }


  // =========================
  // SIZE BUTTONS
  // =========================
  const sizeButtons = document.querySelectorAll('.size-button');

  sizeButtons.forEach(btn => {
    const w = parseInt(btn.dataset.width);
    const h = parseInt(btn.dataset.height);

    // Default selected size
    if (w === selectedSize.width && h === selectedSize.height) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {

      shader.setAttribute('width', w);
      shader.setAttribute('height', h);
      shader.style.width = w + 'px';
      shader.style.height = h + 'px';

      const canvas = shader.shadowRoot?.querySelector('canvas');
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      } else {
        console.warn("Canvas not found inside shader");
      }

      sizeButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectedSize = { width: w, height: h };
      selectedSizeLabel = btn.dataset.label;
    });
  });


  // =========================
  // AUTO LIGHT TOGGLE
  // =========================
  const autoLightCheckbox = document.getElementById('autoLightCheckbox');

  if (autoLightCheckbox) {
    autoLightCheckbox.addEventListener('change', () => {
      if (autoLightCheckbox.checked) {
        shader.setAttribute('auto-light', '');
        shader.auto = true;
      } else {
        shader.removeAttribute('auto-light');
        shader.auto = false;
      }
    });
  }


  // =========================
  // IMAGE UPLOAD
  // =========================
  const fileInput = document.getElementById("imageLoader");

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const url = URL.createObjectURL(file);

      if (typeof shader.setImage === "function") {
        shader.setImage(url);
      } else {
        console.error("setImage method not found on shader");
      }
    });
  }


  // =========================
  // ADD TO CART
  // =========================
  const addToCartBtn = document.getElementById("addToCart");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const canvas = shader.shadowRoot?.querySelector("canvas");

      if (!canvas) {
        alert("Erro: não foi possível capturar a imagem.");
        return;
      }

      const imageData = canvas.toDataURL("image/png");

      const item = {
    image: imageData,

    // internal values (for logic)
    metal: selectedMetal,

    // DISPLAY values (for UI)
    metalLabel: selectedMetalLabel,
    sizeLabel: selectedSizeLabel,

    // keep px if needed
    width: selectedSize.width,
    height: selectedSize.height
};

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart));

      alert("Adicionado ao carrinho!");
    });
  }

});