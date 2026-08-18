const bookContainer = document.querySelector(".book-container");
const API_KEY = "AIzaSyCX-6Z3r693QWZC6nLzNYvaVJ8uX6apvI8";

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
        console.log(`on entre dans volumeInfo :`, bookInfo);

        bookContainer.innerHTML = "";

        function generateBook(book, index) {

            const bookCover = document.createElement("img");
            bookCover.classList.add("book-cover");
            bookCover.src = book.imageLinks?.thumbnail;
            // bookCover.src = book.imageLinks.medium || book.imageLinks.thumbnail;
            bookContainer.appendChild(bookCover);

            const bookTitle = document.createElement("h3");
            bookTitle.classList.add("book-title");
            bookTitle.textContent = book.title;
            bookContainer.appendChild(bookTitle)


            const bookAuthor = document.createElement("p");
            bookAuthor.classList.add("book-author");
            bookAuthor.textContent = `Auteur : ${book.authors}`;;
            bookContainer.appendChild(bookAuthor);

            const bookDescription = document.createElement("p");
            bookDescription.innerHTML = book.description;
            bookContainer.appendChild(bookDescription);
        }

        generateBook(bookInfo);

    } catch (error) {

        console.error("Erreur :", error);

    }
}

loadBook();