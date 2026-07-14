const bookmarksContainer = document.querySelector(".bookmarks");
const categorySuggestionsContainer = document.querySelector(".category-suggestions div");
const categoryButtonsContainer = document.querySelector(".category-buttons div");
const categoryInput = document.querySelector(".category");
const showAll = document.querySelector(".all");

localStorage.removeItem("active-category");

showAll.addEventListener("click", function () {
  displayBookmarks();
  // Method One
  const categoryButtons = document.querySelectorAll(".category-buttons div span");
  categoryButtons.forEach((button) => button.classList.remove("active"));
  localStorage.removeItem("active-category");
  // Method Two
  // location.reload();
});

function saveBookmark() {
  const title = document.querySelector(".title").value.trim();
  const url = document.querySelector(".url").value.trim();
  const category = document.querySelector(".category").value.trim(); // Education

  // Validation
  if (!title || !url || !category) {
    alert("Please Fill in all Fields");
    return;
  }

  const allBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
  // { Education: [{ title, url }, { title, url }, { title, url }] }
  if (!allBookmarks[category]) allBookmarks[category] = [];
  allBookmarks[category].push({ title, url });
  localStorage.setItem("bookmarks", JSON.stringify(allBookmarks));
  // console.log(allBookmarks);

  // Empty The Form
  document.querySelectorAll("input").forEach((input) => (input.value = ""));

  // Update Bookmarks List
  displayBookmarks();

  // Update Category Suggestions
  displayCategorySuggestions();

  // Update Category Buttons
  displayCategoryButtons();
}

function displayBookmarks() {
  bookmarksContainer.innerHTML = ""; // Empty The Container
  const allBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
  for (const category in allBookmarks) {
    // console.log(category);
    const categoryBookmarks = allBookmarks[category];
    // console.log(categoryBookmarks);
    categoryBookmarks.forEach((bookmark, index) => {
      // console.log(bookmark);
      const bookmarkElement = document.createElement("div");
      bookmarkElement.innerHTML = `
        <div class="cat">${category}</div>
        <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
        <button onclick="deleteBookmark('${category}', ${index})">Delete</button>
      `;
      bookmarksContainer.appendChild(bookmarkElement);
    });
  }
}

function filterBookmarksByCategory(category) {
  // cat = "Education"
  const allBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
  const categoryBookmarks = allBookmarks[category]; // Get "Education" Key From The Object
  bookmarksContainer.innerHTML = ""; // Empty The Container
  categoryBookmarks.forEach((bookmark, index) => {
    const bookmarkElement = document.createElement("div");
    bookmarkElement.innerHTML = `
      <span class="number">${index + 1}</span>
      <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
      <button onclick="deleteBookmark('${category}', ${index})">Delete</button>
    `;
    bookmarksContainer.appendChild(bookmarkElement);
  });
}

function displayCategorySuggestions() {
  const allBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
  const categories = Object.keys(allBookmarks);
  // console.log(categories);
  categorySuggestionsContainer.innerHTML = ""; // Empty The Container

  categories.forEach((category) => {
    const categoryElement = document.createElement("span");
    categoryElement.textContent = category;
    // categoryElement.onclick = () => (document.querySelector(".category").value = category);
    categoryElement.addEventListener("click", () => (categoryInput.value = category));
    categorySuggestionsContainer.appendChild(categoryElement);
  });
}

function displayCategoryButtons() {
  const allBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
  const categories = Object.keys(allBookmarks);
  categoryButtonsContainer.innerHTML = ""; // Empty The Container

  categories.forEach((category) => {
    const categoryElement = document.createElement("span");
    categoryElement.textContent = category;
    categoryElement.addEventListener("click", function () {
      filterBookmarksByCategory(category);
      localStorage.setItem("active-category", category);
      // Remove Active Class From All Buttons
      const categoryButtons = document.querySelectorAll(".category-buttons div span");
      categoryButtons.forEach((button) => button.classList.remove("active"));
      // Add Active Class To The Clicked Button
      this.classList.add("active");
    });

    const activeCategory = localStorage.getItem("active-category");
    if (activeCategory === category) categoryElement.classList.add("active");

    categoryButtonsContainer.appendChild(categoryElement);
  });
}

function deleteBookmark(category, index) {
  const allBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
  allBookmarks[category].splice(index, 1);

  // If The Category is Empty, Remove The Category
  if (allBookmarks[category].length === 0) delete allBookmarks[category];
  localStorage.setItem("bookmarks", JSON.stringify(allBookmarks));

  if (allBookmarks[category] && localStorage.getItem("active-category")) {
    filterBookmarksByCategory(category);
  } else {
    displayBookmarks();
  }

  displayCategorySuggestions();
  displayCategoryButtons();
}

// Show Bookmarks
displayBookmarks();

// Show Category Suggestions
displayCategorySuggestions();

// Show Category Buttons
displayCategoryButtons();
