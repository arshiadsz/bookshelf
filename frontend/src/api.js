const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
async function register(userData) {
  const response = await fetch(API_URL + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function login(userData) {
  const response = await fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// ---------------- Books ----------------

async function getBooks(filters) {
  let url = API_URL + "/books?";
  if (filters.category) {
    url = url + "category=" + filters.category + "&";
  }
  if (filters.author) {
    url = url + "author=" + filters.author + "&";
  }
  if (filters.keyword) {
    url = url + "keyword=" + filters.keyword + "&";
  }
  if (filters.sort) {
    url = url + "sort=" + filters.sort + "&";
  }
  if (filters.page) {
    url = url + "page=" + filters.page + "&";
  }
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function getBook(id) {
  const response = await fetch(API_URL + "/books/" + id);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function createBook(bookData) {
  const response = await fetch(API_URL + "/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function updateBook(id, bookData) {
  const response = await fetch(API_URL + "/books/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function deleteBook(id, userId) {
  const response = await fetch(API_URL + "/books/" + id, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function addReview(id, reviewData) {
  const response = await fetch(API_URL + "/books/" + id + "/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function getReadingList(userId) {
  const response = await fetch(API_URL + "/reading-list?user_id=" + userId);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function addToReadingList(listData) {
  const response = await fetch(API_URL + "/reading-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function updateReadingListStatus(id, userId, status) {
  const response = await fetch(API_URL + "/reading-list/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, status: status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function removeFromReadingList(id, userId) {
  const response = await fetch(API_URL + "/reading-list/" + id, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function getUserBooks(id) {
  const response = await fetch(API_URL + "/users/" + id + "/books");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function getFavorites(userId) {
  const response = await fetch(API_URL + "/favorites?user_id=" + userId);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function addFavorite(userId, bookId) {
  const response = await fetch(API_URL + "/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, book_id: bookId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function removeFavorite(bookId, userId) {
  const response = await fetch(API_URL + "/favorites/" + bookId, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const api = {
  register,
  login,
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  addReview,
  getReadingList,
  addToReadingList,
  updateReadingListStatus,
  removeFromReadingList,
  getUserBooks,
  getFavorites,
  addFavorite,
  removeFavorite,
};
