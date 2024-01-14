


function updatePage(data) {
    document.querySelector('h3.uk-text-lead').textContent = data.name;
    document.querySelector('.game-profile-card__intro span').innerHTML = data.description;
    document.querySelector('.game-profile-card__list li:nth-child(2) div:nth-child(2)').textContent = data.released;
    document.querySelector('.game-profile-card__list li:nth-child(3) div:nth-child(2)').textContent = data.developers[0].name;
    document.querySelector('.game-card__rating span').textContent = data.rating;
    document.querySelector('.game-profile-card__type li:first-child span').textContent = data.tags[0].name;
    document.querySelector('.game-profile-card__type li:nth-child(2) span').textContent = data.genres[0].name;
    document.querySelector('.game-profile-card__type li:last-child span').textContent = data.tags[2].name;
    document.querySelector('.game-profile-price__value').textContent = `${data.price} USD`;
    
    const BigGalleryContainer = document.querySelector('.js-gallery-big.gallery-big');
    BigGalleryContainer.querySelector('.swiper-slide:nth-child(1) img').src = data.background_image;
    BigGalleryContainer.querySelector('.swiper-slide:nth-child(2) img').src = data.background_image_additional;

    const SmallgalleryContainer = document.querySelector('.js-gallery-small.gallery-small');
    SmallgalleryContainer.querySelector('.swiper-slide:nth-child(1) img').src = data.background_image;
    SmallgalleryContainer.querySelector('.swiper-slide:nth-child(2) img').src = data.background_image_additional;
}


async function fetchGameDetails(gameId){
    const apiKey = "143ba22c4abd40a39b65306fdb7a36ba";
    const apiUrl = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;

    try{
        const response = await fetch(apiUrl);
        const data = await response.json();
        updatePage(data);
    }catch(error){
        console.error("Error fetching game details: ",error);
    }
}


function loadPage(targetPage) {
    fetch(targetPage)
        .then(response => response.text())
        .then(html => {
            // Replace the content of the main section with the loaded content
            document.querySelector('.page-main').innerHTML = html;
            runMainScript();
            document.querySelector('.page-main').addEventListener('click', function(event) {
                const target = event.target.closest('a');
                console.log(target);
                // Check if the clicked element is an A tag with a specific class or other criteria
                if (target.id === 'GameProfile') {
                    event.preventDefault(); // Prevent the default behavior of the link
                    const targetPage = target.getAttribute('href');
                    loadPage(targetPage); // Load the new page
                    if(target.getAttribute("data-game-id") != null){
                        const gameId = target.getAttribute("data-game-id");
                        fetchGameDetails(gameId);
                    }
                }
            });
        })
        .catch(error => console.error('Error loading page:', error));
}

function ActivateClass(targetPage){
    const previousActiveLink = document.querySelector('.uk-nav .uk-active');
        if(previousActiveLink){
            previousActiveLink.classList.remove("uk-active");
        }   
        const NextActiveLink = document.querySelector(`a[href="${targetPage}"]`);
        if(NextActiveLink){
            NextActiveLink.parentNode.classList.add("uk-active");
        }
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.uk-nav').addEventListener('click', function (event) {
        event.preventDefault();
        const link = event.target.closest('a');
        if(link){
            const targetPage = link.getAttribute('href');
            loadPage(targetPage);
            ActivateClass(targetPage);
        }  
    });

    loadPage("Home.html");
    ActivateClass("Home.html");

    

});