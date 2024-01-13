
function loadPage(targetPage) {
    console.log(targetPage);
    fetch(targetPage)
        .then(response => response.text())
        .then(html => {
            // Replace the content of the main section with the loaded content
            document.querySelector('.page-main').innerHTML = html;
            runMainScript();
            document.querySelector('.page-main').addEventListener('click', function(event) {
                const target = event.target.closest('a');
                // Check if the clicked element is an A tag with a specific class or other criteria
                if (target.id === 'GameProfile') {
                    event.preventDefault(); // Prevent the default behavior of the link
                    const targetPage = target.getAttribute('href');
                    loadPage(targetPage); // Load the new page
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

    loadPage("03_home.html");
    ActivateClass("03_home.html");
});