document.getElementById("buy").addEventListener("click", () => {
    const address = document.getElementById("address").value;

    if (!address) {
        alert("Digite um endereço!");
        return;
    }

    const order = {
        items: cart,
        address: address,
        date: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem("cart");

    alert("Compra realizada!");
    window.location.href = "galeria.html";
});