// Shared store logic: products, cart (localStorage), and rendering
function initStore(){
	if(!localStorage.getItem('products')){
		const sample = [
			{id: 'p1', name: 'Runner Pro', price: 59.99, stock: 100},
			{id: 'p2', name: 'Classic Sneaker', price: 49.99, stock: 100},
			{id: 'p3', name: 'Trail Blazer', price: 79.99, stock: 100},
            {id: 'p4', name: 'City Walker', price: 39.99, stock: 100},
		];
		localStorage.setItem('products', JSON.stringify(sample));
	}
	if(!localStorage.getItem('cart')){
		localStorage.setItem('cart', JSON.stringify({}));
	}
}

function getProducts(){
	return JSON.parse(localStorage.getItem('products') || '[]');
}

function saveProducts(products){
	localStorage.setItem('products', JSON.stringify(products));
}

function getCart(){
	return JSON.parse(localStorage.getItem('cart') || '{}');
}

function saveCart(cart){
	localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount(){
	const cart = getCart();
	const count = Object.values(cart).reduce((s,q)=>s+q,0);
	const els = document.querySelectorAll('#cart-count');
	els.forEach(e => e.textContent = count);
}

function renderProducts(){
	const container = document.getElementById('products');
	if(!container) return;
	const products = getProducts();
	container.innerHTML = '';
	products.forEach(p => {
		const card = document.createElement('article');
		card.className = 'product';
		card.innerHTML = `
			<h3>${p.name}</h3>
			<p class="price">$${p.price.toFixed(2)}</p>
			<p class="stock">In stock: <span class="stock-num">${p.stock}</span></p>
			<div class="actions">
				<button ${p.stock<=0? 'disabled':''} data-id="${p.id}" class="add-btn">Add to cart</button>
			</div>
		`;
		container.appendChild(card);
	});

	container.querySelectorAll('.add-btn').forEach(btn => {
		btn.addEventListener('click', function(){
			addToCart(this.dataset.id);
			renderProducts();
			updateCartCount();
		});
	});
}

function addToCart(productId, qty=1){
	const products = getProducts();
	const prod = products.find(p=>p.id===productId);
	if(!prod || prod.stock<=0) return alert('Product out of stock');
	const cart = getCart();
	cart[productId] = (cart[productId]||0) + qty;
	prod.stock -= qty;
	if(prod.stock < 0) prod.stock = 0;
	saveCart(cart);
	saveProducts(products);
}

function renderCartPage(){
	const container = document.getElementById('cart-items');
	if(!container) return;
	const cart = getCart();
	const products = getProducts();
	container.innerHTML = '';
	const keys = Object.keys(cart);
	if(keys.length === 0){
		container.innerHTML = '<p>Your cart is empty.</p>';
		return;
	}
	const list = document.createElement('div');
	list.className = 'cart-list';
	keys.forEach(id => {
		const prod = products.find(p=>p.id===id);
		const qty = cart[id];
		const row = document.createElement('div');
		row.className = 'cart-row';
		row.innerHTML = `
			<div class="cart-info">
				<strong>${prod ? prod.name : id}</strong>
				<div>Qty: <span class="qty">${qty}</span></div>
				<div>Unit: $${prod ? prod.price.toFixed(2): '0.00'}</div>
			</div>
			<div class="cart-controls">
				<button data-id="${id}" class="remove-btn">Delete from cart</button>
			</div>
		`;
		list.appendChild(row);
	});
	container.appendChild(list);

	container.querySelectorAll('.remove-btn').forEach(btn => {
		btn.addEventListener('click', function(){
			const id = this.dataset.id;
			removeFromCart(id);
			renderCartPage();
			updateCartCount();
		});
	});
}

function removeFromCart(productId){
	const cart = getCart();
	if(!cart[productId]) return;
	const qty = cart[productId];
	delete cart[productId];
	// restore stock
	const products = getProducts();
	const prod = products.find(p=>p.id===productId);
	if(prod) prod.stock += qty;
	saveCart(cart);
	saveProducts(products);
}

function clearCart(){
	const cart = getCart();
	const products = getProducts();
	Object.entries(cart).forEach(([id,qty]) => {
		const prod = products.find(p=>p.id===id);
		if(prod) prod.stock += qty;
	});
	saveProducts(products);
	saveCart({});
}

// expose some helper functions for pages
window.initStore = initStore;
window.renderProducts = renderProducts;
window.updateCartCount = updateCartCount;
window.getCart = getCart;
window.clearCart = clearCart;

