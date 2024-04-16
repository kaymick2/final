let titleInput = document.getElementById('title');
let authorInput = document.getElementById('author');
let descInput = document.getElementById('desc');
let bookId = document.getElementById('book-id');
let descEditInput = document.getElementById('desc-edit');
let books = document.getElementById('books');
let data = [];
let selectedBook = {};
const api = 'http://127.0.0.1:8000';


document.getElementById('form-add').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleInput.value) {
    document.getElementById('msg').innerHTML = 'Title cannot be blank';
  } else if (!authorInput.value) {
    document.getElementById('msg').innerHTML = 'Author cannot be blank';
  } else {
    addBook(titleInput.value, authorInput.value, descInput.value);

    // close modal
    let add = document.getElementById('add');
    add.setAttribute('data-bs-dismiss', 'modal');
    add.click();
    (() => {
      add.setAttribute('data-bs-dismiss', '');
    })();
  }
});

let addBook = (title, author, description) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      const newBook = JSON.parse(xhr.responseText);
      data.push(newBook);
      refreshBooks();
    }
  };
  xhr.open('POST', `${api}/books`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, author, description }));
};

let refreshBooks = () => {
  books.innerHTML = '';
  data
    .sort((a, b) => b.id - a.id)
    .map((x) => {
      return (books.innerHTML += `
        <div id="book-${x.id}">
          <span class="text-white fw-bold fs-4 text-wrap">${x.title} - ${x.author}</span>
          <span class="options">
            <i onClick="tryEditBook(${x.id})" data-bs-toggle="modal" data-bs-target="#modal-edit" class="fas fa-edit"></i>
            <i onClick="deleteBook(${x.id})" class="fas fa-trash-alt"></i>
          </span>
          <pre class="text-white ps-3 text-wrap">${x.description}</pre>
        </div>
    `);
    });

  resetForm();
};

let tryEditBook = (id) => {
  const book = data.find((x) => x.id === id);
  selectedBook = book;
  bookId.innerText = book.id;
  descEditInput.value = book.description;
  document.getElementById('msg').innerHTML = '';
};

document.getElementById('form-edit').addEventListener('submit', (e) => {
  e.preventDefault();

  editBook();

  // close modal
  let edit = document.getElementById('edit');
  edit.setAttribute('data-bs-dismiss', 'modal');
  edit.click();
  (() => {
    edit.setAttribute('data-bs-dismiss', '');
  })();
});

let editBook = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      selectedBook.description = description;
      refreshBooks();
    }
  };
  title = selectedBook.title
  author = selectedBook.author
  description = descEditInput.value
  xhr.open('PUT', `${api}/books/${selectedBook.author}/${selectedBook.title}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({title, author, description}));
};

let deleteBook = (id) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = data.filter((x) => x.id !== id);
      refreshBooks();
    }
  };
  xhr.open('DELETE', `${api}/books/${selectedBook.author}/${selectedBook.title}`, true);
  xhr.send();
};

let resetForm = () => {
  titleInput.value = '';
  authorInput.value = '';
  descInput.value = '';
};

let getBooks = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = JSON.parse(xhr.responseText) || [];
      refreshBooks();
    }
  };
  xhr.open('GET', `${api}/books`, true);
  xhr.send();
};

(() => {
  getBooks();
})();
