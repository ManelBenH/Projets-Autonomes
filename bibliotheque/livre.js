// const bookContainer = document.querySelector(".book-container");
const info = document.querySelector(".info");
const description = document.querySelector(".description");
const cover = document.querySelector(".cover");

const API_KEY = "AIzaSyCX-6Z3r693QWZC6nLzNYvaVJ8uX6apvI8";

console.log(info);
console.log(description);

async function loadBook() {

    const params = new URLSearchParams(window.location.search);
    console.log(params)
    const bookId = params.get("id");

    console.log("Book ID:", bookId);

    try {

        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const book = await response.json();
        const bookInfo = book.volumeInfo;
        console.log("on entre dans volumeInfo :", bookInfo);

        info.innerHTML = "";
        description.innerHTML = "";

        function generateBook(book, index) {

            // Couverture
            const bookCover = document.createElement("img");
            bookCover.classList.add("book-cover");
            bookCover.src =
                book.imageLinks?.thumbnail ||
                "https://via.placeholder.com/300x450?text=Pas+de+couverture";

            cover.appendChild(bookCover);

            // Titre
            const bookTitle = document.createElement("h3");
            bookTitle.classList.add("book-title");
            bookTitle.textContent = book.title;
            info.appendChild(bookTitle);

            // Auteur
            const bookAuthor = document.createElement("p");
            bookAuthor.classList.add("book-author");
            bookAuthor.textContent = `Auteur : ${book.authors?.join(", ") || "Inconnu"}`;
            info.appendChild(bookAuthor);

            const readMoreBtn = document.createElement("button");
            readMoreBtn.classList.add("plusdetail")
            readMoreBtn.textContent = "Lire les détails ▼";
            info.appendChild(readMoreBtn);


            const details = document.createElement("div");details.classList.add("book-details");


            // Categories
            const categories = document.createElement("p");
            categories.textContent = ` Catégorie : ${book.categories?.join(", ") || "Aucune"}`;

            // info.appendChild(categories);

            // Langue
            const language = document.createElement("p");
            language.textContent =
                ` Langue : ${book.language || "Inconnue"}`;

            // info.appendChild(language);

            // Nombre de page
            const pageCount = document.createElement("p");
            pageCount.textContent =
                `Nombre de page : ${book.pageCount || "Inconnu"}`;

            // info.appendChild(pageCount);

            // Date de publication
            const publishedDate = document.createElement("p");
            publishedDate.textContent =
                `Date de publication : ${book.publishedDate || "Inconnue"}`;

            // info.appendChild(publishedDate);


            details.appendChild(categories);
            details.appendChild(language);
            details.appendChild(pageCount);
            details.appendChild(publishedDate);
            info.appendChild(details);

           readMoreBtn.addEventListener("click", () => {

                details.classList.toggle("active");

                if(details.classList.contains("active")){

                    details.appendChild(readMoreBtn);

                    readMoreBtn.textContent = "Masquer les détails ▲";

                }else{

                    info.insertBefore(
                        readMoreBtn,
                         details
                    );

                    readMoreBtn.textContent =
                        "Lire les détails ▼";
                }

            });

            // Résumé
            if (book.description) {

                const bookDescription = document.createElement("p");

                bookDescription.innerHTML =
                    `<strong>Résumé :</strong><br><br>${book.description}`;

                description.appendChild(bookDescription);
            }
        }

        generateBook(bookInfo);

    } catch (error) {

        console.error("Erreur :", error);

    }
}

loadBook();