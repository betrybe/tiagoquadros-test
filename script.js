let cartItems = [];
const cartDOM = '.cart__items';

async function sumCartProducts() {
    let sum = 0;
    cartItems.forEach((e) => {
        sum += e.salePrice;
    });
    document.querySelector('.total-price').innerHTML = sum;
}

function toggleLoading() {
    const loading = document.querySelectorAll('.loading');
    if (loading.length === 0) {
        const e = document.createElement('div');
        e.className = 'loading';
        e.textContent = 'LOADING';
        document.body.appendChild(e);
    } else {
        loading[0].remove();
    }
}

function createProductImageElement(imageSource) {
    const img = document.createElement('img');
    img.className = 'item__image';
    img.src = imageSource;
    return img;
}

function createCustomElement(element, className, innerText) {
    const e = document.createElement(element);
    e.className = className;
    e.innerText = innerText;
    return e;
}

function createProductItemElement({ sku, name, image }) {
    const section = document.createElement('section');
    section.className = 'item';
    section.appendChild(createCustomElement('span', 'item__sku', sku));
    section.appendChild(createCustomElement('span', 'item__title', name));
    section.appendChild(createProductImageElement(image));
    section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
    return section;
}

function getSkuFromProductItem(item) {
    return item.querySelector('span.item__sku').innerText;
}

function fireRequest(callback, url) {
    toggleLoading();
    fetch(url)
    .then((response) => {
        response.json().then((data) => {
            callback(data);
            toggleLoading();
        });
    }).catch((error) => {
        console.error(`Algo deu errado: ${error}`);
    });
}
/*

        const req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200) {
                const data = JSON.parse(req.response);
                callback(data);
                toggleLoading();
            }
        };
        req.open('GET', url);
        req.send(attributes);
 */
function cartItemClickListener() {
    const node = [...this.parentElement.children].indexOf(this);
    if (node >= 0) {
        cartItems.splice(node, 1);
        localStorage.setItem('cartSession', JSON.stringify(cartItems));
        this.remove();
    }
    sumCartProducts();
}

function createCartItemElement({ sku, name, salePrice }) {
    const li = document.createElement('li');
    li.className = 'cart__item';
    li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
    li.addEventListener('click', cartItemClickListener);
    return li;
}

function addItemCartListener() {
    const target = getSkuFromProductItem(this.parentNode);
    toggleLoading();
    fetch(`https://api.mercadolibre.com/items/${target}`)
    .then((response) => {
        response.json().then((data) => {
            const product = { sku: data.id, name: data.title, salePrice: parseFloat(data.price) };
            const cartProduct = createCartItemElement(product);
            document.querySelector(cartDOM).appendChild(cartProduct);
            cartItems.push(product);
            localStorage.setItem('cartSession', JSON.stringify(cartItems));
            sumCartProducts();
            toggleLoading();
        });
    }).catch((error) => {
        console.error(`Algo deu errado: ${error}`);
    });
}

function loadPage(data) {
    data.results.forEach((e) => {
        const prod = createProductItemElement({ sku: e.id, name: e.title, image: e.thumbnail });
        prod.querySelector('.item__add').addEventListener('click', addItemCartListener);
        document.querySelector('.items').appendChild(prod);
    });
    const cart = localStorage.getItem('cartSession');
    if (cart !== null && cart !== '') {
        cartItems = JSON.parse(cart);
        cartItems.forEach((e) => {
            document.querySelector(cartDOM).appendChild(createCartItemElement(e));
        });
    }
    sumCartProducts();
}

function emptyCart() {
    document.querySelector(cartDOM).innerHTML = '';
    cartItems = [];
    localStorage.setItem('cartSession', cartItems);
    sumCartProducts();
}

window.onload = () => {
    fireRequest(loadPage, 'https://api.mercadolibre.com/sites/MLB/search?q=computador');
    document.querySelector('.empty-cart').addEventListener('click', emptyCart);
};