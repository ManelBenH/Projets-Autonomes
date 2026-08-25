// ============================================================
// RÉCUPÉRATION DES ÉLÉMENTS DU DOM ET CONFIGURATION
// ============================================================

// Le conteneur où seront injectées les couvertures de livres populaires
const popularContainer = document.getElementById("popular-books-container");

// Clé pour accéder à l'API Google Books (limite de requêtes/jour selon le quota)
const API_KEY = "AIzaSyCX-6Z3r693QWZC6nLzNYvaVJ8uX6apvI8";

// Sélectionne TOUS les liens de genre (Art, Fiction, Manga, etc.)
// querySelectorAll renvoie une liste, pas un seul élément
const categoryButtons = document.querySelectorAll(".genre-link");


// ============================================================
// CLIC SUR UN BOUTON DE GENRE
// ============================================================

// On boucle sur chaque bouton de genre pour lui attacher un écouteur de clic
categoryButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        // Empêche le comportement par défaut du lien <a href="">
        // (sinon la page rechargerait ou sauterait en haut à cause du href vide)
        event.preventDefault();

        // dataset.category lit l'attribut data-category="..." du bouton cliqué
        // (ex: data-category="fiction" -> category = "fiction")
        const category = button.dataset.category;
        console.log(`La catégorie cliqué est:`, category)

        // Recharge les livres populaires, mais filtrés par cette catégorie
        loadPopularBooks(category)
    });
});


// ============================================================
// CHARGEMENT DES LIVRES POPULAIRES DEPUIS GOOGLE BOOKS API
// ============================================================

// category = "bestseller" par défaut si aucune catégorie n'est passée
// (ex: au premier chargement de la page, avant qu'un genre soit cliqué)
async function loadPopularBooks(category = "bestseller") {
    try {
        // Appel à l'API Google Books, recherche par sujet ("subject:")
        // maxResults=40 : demande jusqu'à 40 résultats
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&maxResults=40&key=${API_KEY}`
        );

        console.log(response.status); // Code HTTP (200 = succès, etc.)

        // Convertit la réponse brute en objet JavaScript utilisable
        const data = await response.json();
        console.log(data);

        // Vide le conteneur avant d'injecter les nouveaux résultats
        // (sinon les anciens livres resteraient affichés en plus des nouveaux)
        popularContainer.innerHTML = "";

        // Si l'API ne renvoie aucun résultat (data.items n'existe pas)
        if (!data.items) {
            popularContainer.innerHTML = "<p>Aucun livre trouvé.</p>";
            return; // On arrête la fonction ici, pas la peine de continuer
        }

        console.log("Nombre de livres reçus :", data.items.length);

        // On ne garde que les livres qui ont une description
        // (évite d'afficher des livres "vides" ou incomplets)
        const books = data.items.filter(
            book => book.volumeInfo.description
        );

        console.log("Après filtre :", books.length);

        // On répartit les livres filtrés en 3 groupes de 5 pour créer 3 rangées
        // (comme des étagères de bibliothèque empilées)
        const row1 = books.slice(0, 5);
        const row2 = books.slice(5, 10);
        const row3 = books.slice(10, 15);

        // Fonction interne qui transforme un groupe de livres en HTML
        // (une "rangée d'étagère" avec les couvertures + les tranches décoratives entre elles)
        function generateRowHTML(bookGroup) {
            let html = `<div class="shelf-row">`;

            bookGroup.forEach((book, index) => {
                const info = book.volumeInfo;

                // Récupère la couverture, ou une image de remplacement si absente
                let cover = info.imageLinks?.thumbnail || "https://via.placeholder.com/150x220?text=Pas+de+couverture";

                // Google renvoie parfois des URLs en http:// (non sécurisé)
                // on force https:// pour éviter les blocages de contenu mixte
                cover = cover.replace("http://", "https://");

                // Chaque livre est cliquable : au clic, appelle showBook() avec son ID
                html += `
                    <div class="book-card" onclick="showBook('${book.id}')">
                        <img src="${cover}" alt="${info.title}">
                    </div>
                `;

                // Ajoute des "tranches" décoratives (spine-block) entre chaque livre,
                // sauf après le dernier livre de la rangée
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

        // Assemble les 3 rangées avec une ligne de séparation (.shelf-line) entre chacune,
        // puis injecte le tout dans le conteneur en une seule fois
        popularContainer.innerHTML =
            generateRowHTML(row1) +
            '<div class="shelf-line"></div>' +
            generateRowHTML(row2) +
            '<div class="shelf-line"></div>' +
            generateRowHTML(row3);

    } catch (error) {
        // Si le fetch échoue (pas de connexion, erreur serveur, etc.)
        console.error("Erreur lors du chargement :", error);
        popularContainer.innerHTML = "<p>Erreur lors du chargement des livres.</p>";
    }
}

// Ne charge les livres populaires que si le conteneur existe sur cette page
// (protection : évite une erreur si ce script tourne sur une page sans #popular-books-container)
if (popularContainer) {
    loadPopularBooks();
}


// ============================================================
// REDIRECTION VERS LA PAGE D'UN LIVRE
// ============================================================

// Appelée au clic sur une couverture de livre (voir onclick dans generateRowHTML)
function showBook(bookId) {
    window.location.href = `livre.html?id=${bookId}`;
}


// ============================================================
// RECHERCHE DE LIVRES (deux champs indépendants)
// ============================================================

// Bouton "Rechercher" au milieu de la page d'accueil
const searchBtn = document.getElementById("search-btn");

// Champ de recherche du milieu de la page d'accueil
const searchInput = document.getElementById("search-input-livre");

// Champ de recherche dans le header (à côté de "Contact"), présent sur toutes les pages
const headerSearchInput = document.getElementById("search-input");

// "pageshow" se déclenche à chaque fois que la page s'affiche,
// y compris quand on revient en arrière avec le bouton précédent du navigateur.
// Ça vide les deux champs pour repartir sur une recherche propre.
window.addEventListener("pageshow", () => {
    searchInput.value = "";
    headerSearchInput.value = "";
});

// Fonction de recherche générique : reçoit en paramètre QUEL champ lire.
// Par défaut, si on ne précise rien, elle utilise searchInput (le champ du milieu).
async function searchBook(inputElement = searchInput) {

    // Récupère le texte tapé, sans espaces inutiles au début/fin
    const searchTerm = inputElement.value.trim();

    // Si le champ est vide, on prévient l'utilisateur et on arrête là
    if (!searchTerm) {
        alert("Veuillez saisir un titre, un auteur ou un thème.");
        return;
    }

    try {
        // Recherche libre (pas de "subject:", contrairement à loadPopularBooks)
        // encodeURIComponent() évite les problèmes avec espaces/caractères spéciaux dans l'URL
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=10&key=${API_KEY}`
        );

        const data = await response.json();

        // Si aucun résultat trouvé
        if (!data.items || data.items.length === 0) {
            alert("Aucun livre trouvé.");
            return;
        }

        // On prend le premier résultat de la recherche et on redirige vers sa fiche
        const bookId = data.items[0].id;
        window.location.href = `livre.html?id=${bookId}`;

    } catch (error) {
        console.error(error);
        alert("Erreur lors de la recherche.");
    }
}

// Champ du milieu : la recherche se déclenche UNIQUEMENT au clic sur le bouton
searchBtn.addEventListener("click", () => searchBook());

// Champ du header : la recherche se déclenche UNIQUEMENT avec la touche Entrée
headerSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchBook(headerSearchInput);
    }
});


// ============================================================
// MISE À JOUR DU TITRE AU CLIC SUR UN GENRE
// ============================================================

// Le <h2> dans le demi-cercle, qui affiche "Livres populaires" par défaut,
// ou le nom du genre sélectionné (ex: "• Fiction •")
const titreGenre = document.getElementById("titre-genre");

// On réutilise la même liste de boutons de genre pour ajouter un DEUXIÈME écouteur
// (en plus de celui déjà attaché plus haut qui appelle loadPopularBooks)
categoryButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.preventDefault();

        const category = button.dataset.category;

        // Change le texte du titre pour refléter le genre choisi
        // (ex: clique sur "Manga" -> le span contient "Manga" -> titre devient "• Manga •")
        titreGenre.textContent =
            `• ${button.querySelector("span").textContent} •`;

        loadPopularBooks(category);
    });
});