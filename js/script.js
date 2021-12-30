    const root = document.querySelector('.container');
    const root2 = document.querySelector('.roo0t');


    const getResources= async (url) => {
        const res = await fetch(url);

        if(!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
        return await res.json();
    };

    const printQuantity = () => {
        const cart = document.querySelector('.cart');
        let productsListLength = cart.querySelector('.simplebar-content').children.length;
        document.querySelector('.cart__quantity').textContent = productsListLength;
        if(productsListLength > 0 ) {
            cart.classList.add('active')
        } else {
            cart.classList.remove('active');
        }
    };

    function deleteProducts(productParent) {
        let id = productParent.querySelector('.cart-product').dataset.id;
        productParent.remove();
        printQuantity();
    }

    class ComponentError extends Error {
        constructor(selectorError) {
            super('No selector was found');
            this.selectorError = selectorError;
        }
    }

    class BaseComponent {
        constructor(parentElement, src, alt, title, paragraph, price, url, loader = true, loadError = true) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.paragraph = paragraph;
            this.price = price;
            this.url = url;
            this.parentElement = document.querySelector(parentElement);
            this.loader = loader;
            this.loadError = loadError;

            if (typeof(this.parentElement) != 'undefined' && this.parentElement != null) {
                    console.log('selector')
                } else {
                    throw new ComponentError();
                }
        }

        async fetch() {
            try {
                this.showLoader();
                await getResources(this.url)
                this.showElement();
                this.render();
            } catch(e){
                this.showErrorState(`${e.name}: ${e.message}`);
            }
            return;
        }

        getRandomId = () => {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        createError(textMessage) {
                    const wrapper = document.createElement('div');
                    const btn = document.createElement('button');
                    const title = document.createElement('h3');
                    const text = document.createElement('p');

                    wrapper.classList.add('error-wrapper');
                    btn.classList.add('btn', 'btn-danger');
                    text.classList.add('lead');

                    title.textContent = 'Произошла ошибка';
                    text.textContent = textMessage

                    btn.textContent = 'Попробовать снова'

                    wrapper.append(title);
                    wrapper.append(text);
                    wrapper.append(btn);

                    btn.addEventListener('click', () => this.reload())

                    return wrapper;
        }

        createSpinner() {
            const spinner = document.createElement('div');
            spinner.classList.add('spinner');
            spinner.innerHTML = `
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            `;

            return spinner;
        }

        showErrorState(text) {
            if(this.loadError) {
                this.parentElement.innerHTML = '';
                this.parentElement.append(this.createError(text))
                throw new Error('Error here');
            }
        }

        showLoader() {
            if(this.loader) {
                this.parentElement.append(this.createSpinner());
            } else {
                return
            }
        }

        reload() {
            location.reload();
        }

        render() {
            const element = document.createElement('div');
            element.classList.add('card');
            element.setAttribute('data-id', this.getRandomId())
            element.innerHTML = `
                <img src=${this.src} alt=${this.alt} class="card-img-top">
                <div class="card-body">
                    <h3 class="card-title">${this.title}</h3>
                    <div class="card-descr">${this.paragraph}</div>
                    <div class="card-price">
                        <div class="card-cost">Цена:</div>
                        <div class="card-total"><span>${this.price}</span> руб</div>
                    </div>
                </div>
            `;

            element.append(this.getElement());

            return element
        }

        getElement() {
            const addBtn = document.createElement('button');
            addBtn.classList.add('btn', 'btn-dark', 'add-btn');
            addBtn.textContent = 'Добавить в корзину';

            return addBtn;

        }

        showElement() {
            this.loader = false;
            this.parentElement.append(this.render())
        }

        set loader (load) {
            this._loader = load;
            if(!this.loader) {
                document.querySelector('.spinner').remove()
            }
        }

        get loader() {
            return this._loader;
        }


    }



    class AddToCartComponent extends BaseComponent {
        constructor(parentElement, src, alt, title, paragraph, price, counter = 0 ,url) {
            super(parentElement, src, alt, title, paragraph, price, url)
            this.counter = counter;
        }

        set counter(time) {
            this._counter = time;
            if(this.currentCounterDisplay || this.currentProductDisplay) {
                this.currentCounterDisplay.textContent = time;
            }
        }

        get counter() {
            return this._counter;
        }


        getAddButton() {
            const addBtn = document.createElement('button');
            addBtn.classList.add('btn', 'btn-dark', 'add-btn');
            addBtn.textContent = 'Добавить в корзину';
            this.addItem(addBtn);

            return addBtn;
        }

        createCounterBtns() {
            const wrapper = document.createElement('div');
            const btnWrapper = document.createElement('div');
            const plusBtn = document.createElement('button');
            const minusBtn = document.createElement('button');
            const time = document.createElement('div');

            plusBtn.classList.add('btn', 'btn-success');
            minusBtn.classList.add('btn', 'btn-danger');
            plusBtn.textContent = '+';
            minusBtn.textContent = '-';

            time.classList.add('current-counter');
            btnWrapper.classList.add('wrapper-btns');
            wrapper.classList.add('wrapper-counter');

            btnWrapper.append(plusBtn);
            btnWrapper.append(time);
            btnWrapper.append(minusBtn);

            wrapper.append(btnWrapper);

            this.minus(minusBtn);
            plusBtn.addEventListener('click', () => this.plus());

            this.rootElement = wrapper;
            this.currentCounterDisplay = time;
            this.currentCounterDisplay.textContent = this.counter;

            return wrapper;
        }

        minus(element) {
            element.addEventListener('click', () => {
                if(this.counter <= 1) {
                    this.counter = 0;
                    let parent = element.closest(`.card`);
                    parent.querySelector('.wrapper-counter').remove();
                    parent.append(this.getAddButton());

                    const items = document.querySelectorAll(`.${this.alt}`);
                    if(items.length == 1) {
                        items[0].remove();
                    }
                }

                this.removeItem();
                printQuantity();
                --this.counter;
            });
        }

        plus() {
            document.querySelector('.cart').querySelector('.simplebar-content').insertAdjacentHTML('afterbegin', this.createCartContent());
            printQuantity();
            ++this.counter;

        }

        removeItem() {
            const items = document.querySelectorAll(`.${this.alt}`);
                let itemsAmount = items.length - 1;
                if(itemsAmount <= 0) {
                    return
                } else {
                    items[itemsAmount - 1].remove();
                }
        }

        checkItems(element) {
            if(document.querySelector('.cart').querySelector('.simplebar-content').children.length === 0) {
                let parent = element.closest(`.card`);
                    parent.querySelector('.wrapper-counter').remove();
                    parent.append(this.getAddButton());
                    return;
            }
        }

        addItem(element) {
            element.addEventListener('click', () => {
                let parent = element.closest(`.card`);
                parent.querySelector('.btn').remove();
                parent.append(this.createCounterBtns());
                document.querySelector('.cart').querySelector('.simplebar-content').insertAdjacentHTML('afterbegin', this.createCartContent());
                printQuantity();
                ++this.counter;
            });
        }



        getElement() {
            return this.getAddButton();
        }

        createCartContent(){
            return `
                <li class="cart-content__item ${this.alt}" data-id=${this.getRandomId()}>
                    <article class="cart-content__product cart-product">
                        <img src="${this.src}" alt=${this.alt} class="cart-product__img">
                        <div class="cart-product__text">
                            <h3 class="cart-product__title">${this.title}</h3>
                            <span class="cart-product__price">${this.price}</span>
                        </div>
                        <button class="cart-product__delete" aria-label="Удалить товар">&#10005;</button>
                    </article>
                </li>
            `;
        };

        deleteCartContent() {
            document.querySelector('.cart-content__list').addEventListener('click', (e) => {
                if (e.target.classList.contains('cart-product__delete')) {
                    deleteProducts(e.target.closest('.cart-content__item'));
                }

            })
        }


    }




getResources('https://zirreal-cart-server.herokuapp.com/watches')
    .then(data => {
        data.forEach(({img, altimg, title, descr, price}) => {
            new AddToCartComponent('.container', img, altimg, title, descr, price, 0, 'https://zirreal-cart-server.herokuapp.com//watches').fetch();

    });
});

const b = new AddToCartComponent('.container');
b.deleteCartContent()
