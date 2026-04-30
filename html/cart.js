document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartItemsDiv = document.getElementById("cartItems");

    const priceTable = {
        aluminum: 40,
        bronze: 60,
        gold: 80
    };

    const sizeMultiplier = {
        "5cm x 5cm": 1,
        "10cm x 10cm": 1.4,
        "15cm x 10cm": 1.6,
        "10cm x 15cm": 1.6,
        "20cm x 20cm": 2,
        "30cm x 20cm": 2.5,
        "20cm x 30cm": 2.5
    };

    function renderCart() {
        cartItemsDiv.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = cartItemsDiv.innerHTML = `
  <p class="empty-cart">Seu carrinho está vazio.</p>
`;;
            document.getElementById("shipping").innerText = "R$ 0";
            document.getElementById("total").innerText = "R$ 0";
            return;
        }

        cart.forEach((item, index) => {

            const basePrice = priceTable[item.metal] || 50;
            const multiplier = sizeMultiplier[item.sizeLabel] || 1;

            const price = Math.round(basePrice * multiplier);
            total += price;

            const div = document.createElement("div");
            div.classList.add("cart-item");

            div.innerHTML = `
  <img src="${item.image}" class="cart-img">

  <p><strong>${item.metalLabel || item.metal}</strong></p>
  <p>${item.sizeLabel || (item.width + " x " + item.height)}</p>
  <p>R$ ${price}</p>

  <button class="remove-btn" data-index="${index}">
    Remover
  </button>
`;

            cartItemsDiv.appendChild(div);
        });

        const shipping = cart.length * 10;
        const finalTotal = total + shipping;

        document.getElementById("shipping").innerText = "R$ " + shipping;
        document.getElementById("total").innerText = "R$ " + finalTotal;

        attachRemoveEvents();
    }

    function attachRemoveEvents() {
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = btn.dataset.index;

                cart.splice(index, 1);
                localStorage.setItem("cart", JSON.stringify(cart));

                renderCart();
            });
        });
    }

    document.getElementById("buy").addEventListener("click", async () => {
        const address = document.getElementById("address").value;

        if (!address) {
            alert("Digite um endereço!");
            return;
        }

        if (cart.length === 0) {
            alert("Carrinho vazio!");
            return;
        }

        const order = {
            items: cart,
            address: address,
            total: document.getElementById("total").innerText,
            date: new Date().toLocaleString()
        };

        try {
            const response = await fetch("http://localhost:3333/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(order)
            });

            const data = await response.json();

            alert(data.message);

            localStorage.removeItem("cart");
            window.location.href = "galeria.html";

        } catch (error) {
            console.error(error);
            alert("Erro ao realizar compra");
        }
    });
    renderCart();

});

