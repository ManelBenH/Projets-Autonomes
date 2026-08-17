const popularContainer = document.getElementById("popular-books-container");
const API_KEY = "AIzaSyC7Jq2kBk1urVVnXkIdIeqr-KSHuuoaY8c";

async function loadPopularBooks() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=8&key=${API_KEY}`
        );
        const data = await response.json();

        popularContainer.innerHTML = "";

        if (!data.items) {
            popularContainer.innerHTML = "<p>Aucun livre trouvé.</p>";
            return;
        }

        // On prend 6 livres au total
        const books = data.items.slice(0, 6);

        // On sépare en 2 groupes de 3 livres
        const row1 = books.slice(0, 3);
        const row2 = books.slice(3, 6);

        // Fonction pour générer le HTML d'une rangée
        function generateRowHTML(bookGroup) {
            let html = `<div class="shelf-row">`;
            
            bookGroup.forEach((book, index) => {
                const info = book.volumeInfo;
                let cover = info.imageLinks?.thumbnail || "https://via.placeholder.com/150x220?text=Pas+de+couverture";
                cover = cover.replace("http://", "https://");

                html += `
                    <div class="book-card">
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
        popularContainer.innerHTML = generateRowHTML(row1)+ '<div class="shelf-line"></div>' + generateRowHTML(row2);

    } catch (error) {
        console.error("Erreur lors du chargement :", error);
        popularContainer.innerHTML = "<p>Erreur lors du chargement des livres.</p>";
    }
}

loadPopularBooks();