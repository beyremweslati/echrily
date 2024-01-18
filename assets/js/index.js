


function updatePage(gameData,imgData) {
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

    const localGameDataUrl = 'assets/DB/localGameData.json';
    fetch(localGameDataUrl)
        .then(response => response.json())
        .then(localGameData => {
            const localGame = localGameData.find(game => game.id === gameData.id);
            document.querySelector('.game-profile-price__value').textContent = `${localGame.price} TND`;
            document.querySelector('.game-profile-card__media img').src = localGame.banner;

        })
        .catch(error => {
            console.error('Error fetching local game data:', error);
        });

}

const gameCache = {};

async function fetchGameDetails(gameId) {
    if(gameCache[gameId]){
        return gameCache[gameId];
    }else{
        const apiKey = "143ba22c4abd40a39b65306fdb7a36ba";
        const apiUrl = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;
        const apiImg = `https://api.rawg.io/api/games/${gameId}/screenshots?key=${apiKey}`;
        try {
            const urlResponse = await fetch(apiUrl);
            const imgResponse = await fetch(apiImg)
            const gameData = await urlResponse.json();
            const imgData = await imgResponse.json();
            gameCache[gameId] = {gameData , imgData};
            return {gameData , imgData}
        } catch (error) {
            console.error("Error fetching game details: ", error);
            return null;
        }
    }
}
async function fetchMarketPrices(gameId) {
    const localMarket = 'assets/DB/localMarketData.json';
    try {
        const response = await fetch(localMarket);
        const data = await response.json();
        const gameData = data.find(game => game.gameTitle === gameId);
        if(gameData){
            document.querySelector('.game-card__media2 img').src = gameData.ImgSrc;
            document.querySelector('.game-profile-card__intro span').innerHTML = gameData.description;
            document.querySelector('.game-profile-card__list li:nth-child(1) div:nth-child(2)').textContent = gameData.releaseDate;
            document.querySelector('.game-profile-card__list li:nth-child(2) div:nth-child(2)').textContent = gameData.developer;
            const optionsContainer = document.querySelector('.toggle');
            optionsContainer.innerHTML = `
                ${gameData.options.map((option, i) => `
                    <input id="input_${i}" type="radio" name="quantity" value="${option.price}" ${option.selected ? 'checked' : ''}>
                    <label for="input_${i}" class="radioLabel">${option.quantity} ${gameData.currency} </label><br>`).join('')}
                `;
            var quantityRadios = document.querySelectorAll('input[name="quantity"]');
            quantityRadios.forEach(function (radio) {
                radio.addEventListener('change', function () {
                    document.querySelector(".game-profile-price__value").innerHTML = `${this.value} TND`
                });
            });
        }
    } catch (error) {
        console.error(error);
    }
}
function fillGameCards(){
    const gameCards = document.querySelectorAll('.js-popular .swiper-slide');
    gameCards.forEach(async (card) => {
        const gameId = card.querySelector('.game-card__media a').getAttribute("data-game-id");
        const {gameData,imgData} = await fetchGameDetails(gameId);

        if(gameData){
            card.querySelector(".game-card__media img").src = gameData.background_image;
            card.querySelector(".game-card__info .game-card__title").textContent = gameData.name;
            card.querySelector(".game-card__info .game-card__rating-and-price .game-card__rating span").textContent = gameData.rating;
            card.querySelector(".game-card__info .game-card__genre span:nth-child(1)").textContent = gameData.genres[0].name;
            if(gameData.tags[0]){
                card.querySelector(".game-card__info .game-card__genre span:nth-child(2)").textContent = "/";
                card.querySelector(".game-card__info .game-card__genre span:nth-child(3)").textContent = gameData.tags[0].name;
            }
        }
    })
}

const pageCache = {};

async function loadPage(targetPage, previousPage) {
    try {
        let html;
        if (pageCache[targetPage]) {
            html = pageCache[targetPage];
        } else {
            const response = await fetch(targetPage);
            html = await response.text();
            pageCache[targetPage] = html;
        }

        document.querySelector('.page-main').innerHTML = html;
        const backbutton = document.querySelector(".back");
        if (backbutton) {
            backbutton.href = previousPage;
        }
        runMainScript();

        const currentPage = targetPage;
        if(currentPage == "Home.html"){
            fillGameCards();
        }
        const pageMain = document.querySelector('.page-main');
        if (pageMain._clickHandler) {
            pageMain.removeEventListener('click', pageMain._clickHandler);
        }

        pageMain._clickHandler = async function (event) {
            event.stopPropagation();
            const target = event.target.closest('a');

            if (target != null && target.id === 'GameProfile') {
                event.preventDefault();
                const targetPage = target.getAttribute('href');

                await loadPage(targetPage, currentPage);

                if (target.getAttribute("data-game-id") != null) {
                    const gameId = target.getAttribute("data-game-id");
                    const {gameData, imgData} = await fetchGameDetails(gameId);
                    updatePage(gameData, imgData);
                }
            }
            if (target != null && target.id === 'GameMarket') {
                event.preventDefault();
                const targetPage = target.getAttribute('href');

                await loadPage(targetPage, currentPage);

                if (target.getAttribute("data-game-id") != null) {
                    const gameId = target.getAttribute("data-game-id");
                    fetchMarketPrices(gameId);
                }
            }
        };
        pageMain.addEventListener("click", pageMain._clickHandler);
    } catch (error) {
        console.error('Error loading page:', error);
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
    const currentPage = "Home.html";
    document.querySelector('.uk-nav').addEventListener('click', function (event) {
        event.preventDefault();
        const link = event.target.closest('a');
        if (link) {
            const targetPage = link.getAttribute('href');
            loadPage(targetPage, currentPage);
            ActivateClass(targetPage);
        }
    });

    loadPage("Home.html");
    ActivateClass("Home.html");
});