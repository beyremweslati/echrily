
const pageCache = {};
const storeCache = {};
const marketCache = {};
let carts = [];
let iconCartSpan = document.querySelector('.cartIconContainer span');
let totalItems = 0;
async function fetchLocalGameData(gameId) {
    if(storeCache[gameId]){
        return storeCache[gameId];
    }
    const localGameDataUrl = 'assets/DB/localGameData.json';

    try {
        const response = await fetch(localGameDataUrl);
        const localGameData = await response.json();
        const localGame = localGameData.find(game => game.id === gameId);
        
        if (localGame) {
            storeCache[localGame.id] = localGame;
            return localGame;
        } else {
            console.error('Local game data not found for the given game ID:', gameId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching local game data:', error);
        return null;
    }
}

// Store Page content
async function updateContentWithGameData(gameData,imgData) {
    document.querySelector('h3#gameTitle').textContent = gameData.name;
    document.querySelector('.game-profile-card__intro span').innerHTML = gameData.description;
    document.querySelector('.game-profile-card__list li:nth-child(2) div:nth-child(2)').textContent = gameData.released;
    document.querySelector('.game-profile-card__list li:nth-child(3) div:nth-child(2)').textContent = gameData.developers[0].name;
    document.querySelector('.game-card__rating span').textContent = gameData.rating;
    document.querySelector('.game-profile-card__type li:first-child span').textContent = gameData.genres[0].name;
    document.querySelector('.game-profile-card__type li:nth-child(2) span').textContent = gameData.tags[0]?.name || "";
    document.querySelector('.game-profile-card__type li:last-child span').textContent = gameData.tags[2]?.name || "";

    const BigGalleryContainer = document.querySelector('.js-gallery-big.gallery-big');
    const SmallgalleryContainer = document.querySelector('.js-gallery-small.gallery-small');

    
    BigGalleryContainer.querySelector('.swiper-slide:nth-child(1) img').src = gameData.background_image;
    SmallgalleryContainer.querySelector('.swiper-slide:nth-child(1) img').src = gameData.background_image;

    const imageUrls = imgData.results.map(result => result.image);

    if (imageUrls && imageUrls.length >= 4) {
        for(let i=0;i<=3;i++){
            BigGalleryContainer.querySelector(`.swiper-slide:nth-child(${i+2}) img`).src = imageUrls[i];
            SmallgalleryContainer.querySelector(`.swiper-slide:nth-child(${i+2}) img`).src = imageUrls[i];
        }   
    }
    const localGame = await fetchLocalGameData(gameData.id); 
    if (localGame) {
        document.querySelector('.game-profile-price__value').textContent = `${localGame.price} TND`;
        document.querySelector('.game-profile-card__media img').src = localGame.banner;
    } 
}

// Fetching game data of the store page using RawgApi
async function fetchGameDetails(gameId) {
    if(marketCache[gameId]){
        return marketCache[gameId];
    }else{
        const apiKey = "143ba22c4abd40a39b65306fdb7a36ba";
        const apiUrl = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;
        const apiImg = `https://api.rawg.io/api/games/${gameId}/screenshots?key=${apiKey}`;
        try {
            const urlResponse = await fetch(apiUrl);
            const imgResponse = await fetch(apiImg)
            const gameData = await urlResponse.json();
            const imgData = await imgResponse.json();
            marketCache[gameId] = {gameData , imgData};
            return {gameData , imgData}
        } catch (error) {
            console.error("Error fetching game details: ", error);
            return null;
        }
    }
}

// Fetching Price of game currrency of market page using the local data
async function fetchMarketPrices(gameId) {
    const localMarket = 'assets/DB/localMarketData.json';
    try {
        const response = await fetch(localMarket);
        const data = await response.json();
        const currencyData = data.find(game => game.gameTitle === gameId);
        if(currencyData){
            return currencyData;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

// updating currency values  
function updateContentWithCurrencyData(currencyData){
    document.querySelector('.game-card__media2 img').src = currencyData.ImgSrc;
    document.querySelector('.game-profile-card__intro span').innerHTML = currencyData.description;
    document.querySelector('.game-profile-card__list li:nth-child(1) div:nth-child(2)').textContent = currencyData.releaseDate;
    document.querySelector('.game-profile-card__list li:nth-child(2) div:nth-child(2)').textContent = currencyData.developer;
    const optionsContainer = document.querySelector('.toggle');
    optionsContainer.innerHTML = `
        ${currencyData.options.map((option, i) => `
            <input id="input_${i}" type="radio" name="quantity" value="${option.price}" ${option.selected ? 'checked' : ''}>
            <label for="input_${i}" class="radioLabel">${option.quantity} ${currencyData.currency} </label><br>`).join('')}
        `;
    var quantityRadios = document.querySelectorAll('input[name="quantity"]');
    quantityRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            document.querySelector(".game-profile-price__value").innerHTML = `${this.value} TND`
        });
    });
}

// Getting data of every game from rawg api and filling the page 
function fillGameCards(containerClass,subContainerClass){
    const gameCards = document.querySelectorAll(`.${containerClass} .${subContainerClass}`);
    gameCards.forEach(async (card) => {
        const gameId = card.querySelector('.game-card__media a').getAttribute("data-game-id");
        const {gameData,imgData} = await fetchGameDetails(gameId);

        if(gameData){
            renderGameCard(card, gameData);
        }
    })
}

// Render game cards with their content 
async function renderGameCard(card , gameData){
    
    card.querySelector(".game-card__media img").src = gameData.background_image;
    card.querySelector(".game-card__info .game-card__title").textContent = gameData.name;
    card.querySelector(".game-card__info .game-card__rating-and-price .game-card__rating span").textContent = gameData.rating;
    card.querySelector(".game-card__info .game-card__genre span:nth-child(1)").textContent = gameData.genres[0].name;
    if(gameData.tags[0]){
        card.querySelector(".game-card__info .game-card__genre span:nth-child(2)").textContent = "/";
        card.querySelector(".game-card__info .game-card__genre span:nth-child(3)").textContent = gameData.tags[0].name;
    }
    
    const localGame = await fetchLocalGameData(gameData.id);
    card.querySelector(".game-card__info .game-card__rating-and-price .game-card__price span").textContent = `${localGame.price} TND`;
} 

function CartButtonListener(gameData){
    const buttonContainer = document.querySelector(".game-profile-price");
    buttonContainer.addEventListener('click', async (event) => {
        const pos = event.target.closest('button'); 
        if(pos != null && pos.classList.contains('addCart')){
            const localGameData = await fetchLocalGameData(gameData.id);
            AddtoCart(localGameData);
        }
    })
}
function AddtoCart(Data){
    carts.push({
        id : Data.id,
        name : Data.title,
        price : Data.price,
        img : Data.banner
    });
    totalItems++;
    iconCartSpan.textContent = totalItems;
    AddtoMemory();
}
function removeFromCart(gameId){
    const positionItem = carts.findIndex(item => item.id = gameId);
    carts.splice(positionItem,1);
    AddtoMemory();
    displayCartItems();
}
function AddtoMemory(){
    localStorage.setItem('carts', JSON.stringify(carts));
}
function displayCartItems() {
    const cartContainer = document.querySelector('.ItemsContainer');
    cartContainer.innerHTML = "";
    if(carts.length === 0){

        const emptyCartMessage = document.createElement('div');
        emptyCartMessage.classList.add('empty-cart-message');
        
        const img = document.createElement('img');
        img.src = 'assets/img/icons/emptyCart.png';
        img.alt = 'Empty Cart Image';
        img.classList.add('cartIcon');
        emptyCartMessage.appendChild(img);

        const heading = document.createElement('h1');
        heading.textContent = 'Your cart is currently empty!';
        heading.classList.add('empty-cart-heading');
        emptyCartMessage.appendChild(heading);

        const subheading = document.createElement('h5');
        subheading.classList.add('empty-cart-subHeading');
        subheading.textContent = 'You must add some items before proceeding to checkout';
        emptyCartMessage.appendChild(subheading);

        cartContainer.appendChild(emptyCartMessage);
    }else{
        carts.forEach(item => {
            const newRow = document.createElement('div');
            newRow.classList.add('cart-item');
            newRow.innerHTML = `
            <div class="cartItem__media">
                <img src="${item.img}" alt="Game Image" class="">
            </div>
            <div class="cartItem__text">
                <h3 class="game-card__title">${item.name}</h3>
                <h4 class="game-card__price">${item.price} TND</h4>
            </div>
            <div class="cartItem__action" data-id="${item.id}">
                <button class="uk-button uk-button-danger rmButton">Remove</button>
            </div>`;
            cartContainer.appendChild(newRow);
        })
    }
}
async function loadPage(targetPage, previousPage) {
    try {
        const html = await getPageHTML(targetPage);

        renderHTML(html);
        setBackButton(previousPage);
        runMainScript();

        const currentPage = targetPage;
        if (currentPage === "home.html") {
            fillGameCards("js-popular", "swiper-slide");
        }
        if (currentPage === "store.html") {
            fillGameCards("CardsContainer", "Wrapper");
        }
        if (currentPage === "cart.html") {
            displayCartItems();
            const cartContainer = document.querySelector(".cartContainer");
            cartContainer.addEventListener("click", (event) => {
                const rmBtn = event.target.closest("button"); 
                if(rmBtn != null && rmBtn.classList.contains("rmButton")){
                    const gameContainer = event.target.parentNode;
                    removeFromCart(gameContainer.dataset.id);
                }
            })
        }
        setupClickHandler(currentPage);
    } catch (error) {
        console.error('Error loading page:', error);
    }
}

async function getPageHTML(targetPage) {
    if (pageCache[targetPage]) {
        return pageCache[targetPage];
    } else {
        const response = await fetch(targetPage);
        const html = await response.text();
        pageCache[targetPage] = html;
        return html;
    }
}

function renderHTML(html) {
    document.querySelector('.page-main').innerHTML = html;
}

function setBackButton(previousPage) {
    const backbutton = document.querySelector(".back");
    if (backbutton) {
        backbutton.href = previousPage;
    }
}

function setupClickHandler(currentPage) {
    const pageMain = document.querySelector('.page-main');
    if (pageMain._clickHandler) {
        pageMain.removeEventListener('click', pageMain._clickHandler);
    }

    pageMain._clickHandler = async function (event) {
        event.stopPropagation();
        const target = event.target.closest('a');

        if (target != null && target.id === 'GameProfile') {
            event.preventDefault();
            handleGameProfileClick(target, currentPage);
        }
        if (target != null && target.id === 'GameMarket') {
            event.preventDefault();
            handleGameMarketClick(target, currentPage);
        }
    };
    pageMain.addEventListener("click", pageMain._clickHandler);
}

async function handleGameProfileClick(target, currentPage) {
    const targetPage = target.getAttribute('href');
    await loadPage(targetPage, currentPage);

    if (target.getAttribute("data-game-id") != null) {
        const gameId = target.getAttribute("data-game-id");
        const {gameData, imgData} = await fetchGameDetails(gameId);
        updateContentWithGameData(gameData, imgData);
        CartButtonListener(gameData);
    }
}


async function handleGameMarketClick(target, currentPage) {
    const targetPage = target.getAttribute('href');
    await loadPage(targetPage, currentPage);

    if (target.getAttribute("data-game-id") != null) {
        const gameId = target.getAttribute("data-game-id");
        const currencyData = await fetchMarketPrices(gameId);
        updateContentWithCurrencyData(currencyData);
    }
}

function ActivateClass(targetPage) {
    const previousActiveLink = document.querySelector('.uk-nav .uk-active');
    if (previousActiveLink) {
        previousActiveLink.classList.remove("uk-active");
    }
    const NextActiveLink = document.querySelector(`a[href="${targetPage}"]`);
    if (NextActiveLink) {
        NextActiveLink.parentNode.classList.add("uk-active");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const currentPage = "home.html";
    document.querySelector('.uk-nav').addEventListener('click', function (event) {
        event.preventDefault();
        const link = event.target.closest('a');
        if (link) {
            const targetPage = link.getAttribute('href');
            loadPage(targetPage, currentPage);
            ActivateClass(targetPage);
        }
    });
    loadPage("home.html");
    ActivateClass("home.html");
    if(localStorage.getItem('carts') != null){
        carts = JSON.parse(localStorage.getItem('carts'));
        totalItems = carts.length;
        iconCartSpan.textContent = totalItems;
    }
    document.querySelector(".cartIconContainer").addEventListener('click', function (event) {
        event.preventDefault();
        loadPage("cart.html", currentPage);
    });
});