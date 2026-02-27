function searchProducts() {
    // Get the input value and convert it to lowercase
    const input = document.getElementById('searchInput').value.toLowerCase();
    const products = document.querySelectorAll('.product');

    products.forEach(product => {
        const title = product.querySelector('h2').textContent.toLowerCase();
        // Check if the title includes the search input
        if (title.includes(input)) {
            product.style.display = ''; // Show the product
        } else {
            product.style.display = 'none'; // Hide the product
        }
    });
}