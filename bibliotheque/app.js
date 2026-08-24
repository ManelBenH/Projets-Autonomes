const popularContainer = document.getElementById("popular-books-container");
const API_KEY = "AIzaSyCX-6Z3r693QWZC6nLzNYvaVJ8uX6apvI8";

const categoryButtons = document.querySelectorAll(".genre-link");

categoryButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.preventDefault();
    
        // ---------------------------------------------- //
        // ---------------------------------------------- //
        const category = button.dataset.category;
        console.log(`La catégorie cliqué est:`, category)
        // ---------------------------------------------- //
        // ---------------------------------------------- //

        loadPopularBooks(category)
    });
});

async function loadPopularBooks(category = "bestseller") {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&maxResults=40&key=${API_KEY}`
            
        );
        console.log(response.status);
        const data = await response.json();
        console.log(data);
        
        popularContainer.innerHTML = "";

        if (!data.items) {
            popularContainer.innerHTML = "<p>Aucun livre trouvé.</p>";
            return;
        }

        console.log("Nombre de livres reçus :", data.items.length);

        const books = data.items.filter(
            book => book.volumeInfo.description
            );

        console.log("Après filtre :", books.length);


        // On prend 6 livres au total
        // const books = data.items.filter(book => book.volumeInfo.description).slice(0, 15);

        // On sépare en 2 groupes de 3 livres
        const row1 = books.slice(0, 5);
        const row2 = books.slice(5, 10);
        const row3 = books.slice(10, 15);
        // Fonction pour générer le HTML d'une rangée
        function generateRowHTML(bookGroup) {
            let html = `<div class="shelf-row">`;
            
            bookGroup.forEach((book, index) => {
                const info = book.volumeInfo;
                let cover = info.imageLinks?.thumbnail || "https://via.placeholder.com/150x220?text=Pas+de+couverture";
                cover = cover.replace("http://", "https://");

                html += `
                    <div class="book-card" onclick="showBook('${book.id}')">
                        
                        <img src="${cover}" alt="${info.title}">
                    </div>
                `;

                // Ajout des rectangles entre les livres
                if (index < bookGroup.length - 1) {
                    html += `
                        <div class="spine-block spine-tall"></div>
                        <div class="spine-block spine-short"></div>
                    `;
                }
            });

            html += `</div>`;
            return html;
        }

        // Injection des 2 rangées dans la page
        popularContainer.innerHTML = generateRowHTML(row1) + '<div class="shelf-line"></div>' + generateRowHTML(row2) + '<div class="shelf-line"></div>' + generateRowHTML(row3)  ;

    } catch (error) {
        console.error("Erreur lors du chargement :", error);
        popularContainer.innerHTML = "<p>Erreur lors du chargement des livres.</p>";
    }
}


if (popularContainer) {

    loadPopularBooks();

}


 function showBook(bookId){

    window.location.href = `livre.html?id=${bookId}`;

}




const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input-livre");
const headerSearchInput = document.getElementById("search-input");


window.addEventListener("pageshow", () => {
    searchInput.value = "";
    headerSearchInput.value = "";
});



async function searchBook(inputElement = searchInput) {

    const searchTerm = inputElement.value.trim();

    if (!searchTerm) {
        alert("Veuillez saisir un titre, un auteur ou un thème.");
        return;
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=10&key=${API_KEY}`
        );

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            alert("Aucun livre trouvé.");
            return;
        }

        const bookId = data.items[0].id;
        window.location.href = `livre.html?id=${bookId}`;

    } catch (error) {
        console.error(error);
        alert("Erreur lors de la recherche.");
    }
}

// Bouton du milieu : uniquement au clic
searchBtn.addEventListener("click", () => searchBook());

// Champ du haut : uniquement avec Entrée
headerSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchBook(headerSearchInput);
    }
});


searchBtn.addEventListener("click", searchBook);
searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchBook();
    }

});



const titreGenre = document.getElementById("titre-genre");
categoryButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.preventDefault();

        const category = button.dataset.category;

        titreGenre.textContent =
            `• ${button.querySelector("span").textContent} •`;

        loadPopularBooks(category);

    });

});