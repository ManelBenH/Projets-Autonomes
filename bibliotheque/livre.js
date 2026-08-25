// ============================================================
// RÉCUPÉRATION DES ÉLÉMENTS DU DOM
// ============================================================

// const bookContainer = document.querySelector(".book-container");

// .info contiendra : titre, auteur, bouton "détails", et les détails eux-mêmes
const info = document.querySelector(".info");

// .description contiendra le résumé du livre
const description = document.querySelector(".description");

// .cover contiendra l'image de couverture
const cover = document.querySelector(".cover");

// Clé pour accéder à l'API Google Books
const API_KEY = "AIzaSyCX-6Z3r693QWZC6nLzNYvaVJ8uX6apvI8";

console.log(info);
console.log(description);


// ============================================================
// CHARGEMENT DES DÉTAILS DU LIVRE DEPUIS L'URL
// ============================================================

async function loadBook() {

    // Récupère les paramètres présents dans l'URL de la page
    // (ex: livre.html?id=abc123 -> params contient "id=abc123")
    const params = new URLSearchParams(window.location.search);
    console.log(params)

    // Extrait uniquement la valeur du paramètre "id"
    // (c'est l'ID du livre Google Books, passé par showBook() dans app.js)
    const bookId = params.get("id");

    console.log("Book ID:", bookId);

    try {

        // Appel à l'API Google Books pour récupérer TOUS les détails d'UN livre précis
        // (différent de app.js qui cherche une LISTE de livres par mot-clé)
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${API_KEY}`
        );

        // Si la requête échoue (ex: ID invalide, livre supprimé, erreur réseau)
        // on déclenche une erreur qui sera attrapée par le catch plus bas
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        // Convertit la réponse en objet JavaScript
        const book = await response.json();

        // volumeInfo est l'objet qui contient toutes les infos utiles
        // (titre, auteurs, description, image, etc.) — le reste de la réponse
        // contient des métadonnées qu'on n'utilise pas ici
        const bookInfo = book.volumeInfo;
        console.log("on entre dans volumeInfo :", bookInfo);

        // Vide les conteneurs avant d'insérer les nouvelles infos
        // (utile si loadBook() était appelée plusieurs fois, évite les doublons)
        info.innerHTML = "";
        description.innerHTML = "";

        // ============================================================
        // FONCTION QUI CONSTRUIT ET AFFICHE TOUT LE CONTENU DU LIVRE
        // ============================================================
        // Reçoit book = bookInfo (les infos du livre)
        // Le paramètre "index" n'est jamais utilisé, il ne sert à rien ici
        function generateBook(book, index) {

            // --- Couverture ---
            const bookCover = document.createElement("img");
            bookCover.classList.add("book-cover");
            bookCover.src =
                book.imageLinks?.thumbnail ||
                "https://via.placeholder.com/300x450?text=Pas+de+couverture";

            cover.appendChild(bookCover);

            // --- Titre ---
            const bookTitle = document.createElement("h3");
            bookTitle.classList.add("book-title");
            bookTitle.textContent = book.title;
            info.appendChild(bookTitle);

            // --- Auteur ---
            const bookAuthor = document.createElement("p");
            bookAuthor.classList.add("book-author");
            // book.authors est un tableau (ex: ["J.K. Rowling"]) -> join(", ") les assemble
            // Si aucun auteur n'est fourni par l'API, on affiche "Inconnu"
            bookAuthor.textContent = `Auteur : ${book.authors?.join(", ") || "Inconnu"}`;
            info.appendChild(bookAuthor);

            // --- Bouton "Lire les détails" ---
            const readMoreBtn = document.createElement("button");
            readMoreBtn.classList.add("plusdetail")
            readMoreBtn.textContent = "Lire les détails ▼";
            info.appendChild(readMoreBtn);

            // --- Conteneur des détails (masqué par défaut via CSS .book-details) ---
            const details = document.createElement("div");
            details.classList.add("book-details");

            // Catégorie(s) du livre
            const categories = document.createElement("p");
            categories.textContent = ` Catégorie : ${book.categories?.join(", ") || "Aucune"}`;
            // info.appendChild(categories);  <- ligne désactivée, categories est ajouté à "details" plus bas à la place

            // Langue du livre
            const language = document.createElement("p");
            language.textContent =
                ` Langue : ${book.language || "Inconnue"}`;
            // info.appendChild(language);  <- idem, ajouté à "details" plus bas

            // Nombre de pages
            const pageCount = document.createElement("p");
            pageCount.textContent =
                `Nombre de page : ${book.pageCount || "Inconnu"}`;
            // info.appendChild(pageCount);  <- idem

            // Date de publication
            const publishedDate = document.createElement("p");
            publishedDate.textContent =
                `Date de publication : ${book.publishedDate || "Inconnue"}`;
            // info.appendChild(publishedDate);  <- idem

            // On assemble les 4 infos secondaires DANS le conteneur "details"
            // (donc elles restent cachées tant que l'utilisateur n'a pas cliqué sur le bouton)
            details.appendChild(categories);
            details.appendChild(language);
            details.appendChild(pageCount);
            details.appendChild(publishedDate);
            info.appendChild(details);

            // --- Comportement du bouton "Lire les détails" au clic ---
            readMoreBtn.addEventListener("click", () => {

                // Ajoute ou retire la classe "active" à chaque clic (bascule show/hide)
                // .active est définie en CSS avec display: block pour révéler le contenu
                details.classList.toggle("active");

                if (details.classList.contains("active")) {

                    // Quand on OUVRE les détails : on déplace le bouton EN DESSOUS
                    // du bloc details, pour qu'il reste juste après le contenu visible
                    details.appendChild(readMoreBtn);
                    readMoreBtn.textContent = "Masquer les détails ▲";

                } else {

                    // Quand on FERME les détails : on remet le bouton AVANT le bloc
                    // details (sa position d'origine), puisque details redevient invisible
                    info.insertBefore(
                        readMoreBtn,
                        details
                    );
                    readMoreBtn.textContent =
                        "Lire les détails ▼";
                }

            });

            // --- Résumé du livre ---
            // Certains livres n'ont pas de description dans l'API, d'où cette vérification
            if (book.description) {

                const bookDescription = document.createElement("p");

                // innerHTML (pas textContent) car book.description peut contenir
                // du HTML basique renvoyé par l'API (balises <p>, <br>, <b>, etc.)
                bookDescription.innerHTML =
                    `<strong>Résumé :</strong><br><br>${book.description}`;

                description.appendChild(bookDescription);
            }
        }

        // Appelle la fonction avec les infos du livre récupérées plus haut
        generateBook(bookInfo);

    } catch (error) {
        // Attrape les erreurs de fetch() ou le throw manuel plus haut
        // (ID invalide, pas de connexion, etc.)
        console.error("Erreur :", error);
    }
}

// Lance le chargement dès que le script s'exécute
loadBook();