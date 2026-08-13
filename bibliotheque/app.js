

const container = document.getElementById("science-books-container");

async function loadBooks() {
    const response = await fetch("https://openlibrary.org/search.json?subject=science_fiction&sort=new&limit=10");
    const data = await response.json();
    console.log(data);
    const books = data.docs .filter(book => book.cover_i) .slice(0, 3);

    books.forEach(book => {

        const cover = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : "https://via.placeholder.com/150x220";

    scienceContainer.innerHTML += `
        <div class="book-card">
            <img src="${cover}"> 
            <h3>${book.title}</h3>
            <p>${book.author_name?.[0] || "Auteur inconnu"}</p>
            <span>${book.first_publish_year || "Date inconnue"}</span>
        </div>
`;
    });
}




const scienceContainer = document.getElementById("science-books-container");
const API_KEY = "AIzaSyC7Jq2kBk1urVVnXkIdIeqr-KSHuuoaY8c";

async function loadPopularBooks() {

    const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=5&key=${API_KEY}`);

    const data = await response.json();

    data.items.forEach(book => {

        const info = book.volumeInfo;

        popularContainer.innerHTML += `
        <div class="book-card">
        ${info.imageLinks?.thumbnail || ''}
        <h3>${info.title}</h3>
        <p>${info.authors?.[0] || "Auteur inconnu"}</p>
        </div>
        `;
    });
}

loadScienceBooks();

loadPopularBooks();