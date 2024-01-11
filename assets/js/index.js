

document.addEventListener('DOMContentLoaded', function () {

    function loadPage(targetPage) {
        const previousActiveLink = document.querySelector('.uk-nav .uk-active');
        if(previousActiveLink){
            previousActiveLink.classList.remove("uk-active");
        }
        fetch(targetPage)
            .then(response => response.text())
            .then(html => {
                // Replace the content of the main section with the loaded content
                document.querySelector('.page-main').innerHTML = html;
                const NextActiveLink = document.querySelector(`a[href="${targetPage}"]`);
                if(NextActiveLink){
                    NextActiveLink.parentNode.classList.add("uk-active");
                }
                runMainScript();
            })
            .catch(error => console.error('Error loading page:', error));
    }

    document.querySelector('.uk-nav').addEventListener('click', function (event) {
        event.preventDefault();
        const link = event.target.closest('a');
        if(link){
            const targetPage = link.getAttribute('href');
            loadPage(targetPage);
        }
    });

    loadPage("03_home.html");
});