const bookmarksContainer = document.querySelector(".bookmarks");
const categorySuggestionsContainer = document.querySelector(".category-suggestions div");
const categoryButtonsContainer = document.querySelector(".category-buttons div");
const categoryInput = document.querySelector(".category");
const bookmarkForm = document.querySelector("#bookmark-form");
const showAllButton = document.querySelector(".all");
const bookmarkStatus = document.querySelector("#bookmark-status");
const storageKey = "bookmarks";
const activeCategoryKey = "active-category";
let activeCategory = readActiveCategory();

function setStatus(message, tone = "info") {
  if (!bookmarkStatus) return;
  bookmarkStatus.textContent = message;
  bookmarkStatus.dataset.tone = tone;
}

function readActiveCategory() {
  try {
    return localStorage.getItem(activeCategoryKey) || "";
  } catch (error) {
    console.error("Unable to read active category", error);
    return "";
  }
}

function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function readBookmarks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([category, entries]) => (
          typeof category === "string" && category.trim() && Array.isArray(entries)
        ))
        .map(([category, entries]) => [
          category.trim().slice(0, 60),
          entries.filter((bookmark) => (
            bookmark &&
            typeof bookmark.title === "string" && bookmark.title.trim() &&
            typeof bookmark.url === "string" && isSafeUrl(bookmark.url)
          )).map((bookmark) => ({
            title: bookmark.title.trim().slice(0, 120),
            url: bookmark.url.trim(),
          })),
        ])
        .filter(([, entries]) => entries.length > 0),
    );
  } catch (error) {
    console.error("Unable to read bookmarks", error);
    setStatus("Saved bookmarks could not be read from this browser.", "error");
    return {};
  }
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error("Unable to save bookmarks", error);
    setStatus("The bookmark could not be saved in this browser.", "error");
    return false;
  }
}

function setActiveCategory(category) {
  activeCategory = category;
  try {
    if (category) localStorage.setItem(activeCategoryKey, category);
    else localStorage.removeItem(activeCategoryKey);
  } catch (error) {
    console.error("Unable to save active category", error);
  }
  displayBookmarks();
  displayCategoryButtons();
}

function createBookmarkElement(category, bookmark, index, number) {
  const item = document.createElement("article");
  item.className = "bookmark-item";
  const numberElement = document.createElement("span");
  numberElement.className = "number";
  numberElement.textContent = String(number);
  const categoryElement = document.createElement("span");
  categoryElement.className = "cat";
  categoryElement.textContent = category;
  const linkContainer = document.createElement("div");
  linkContainer.className = "link";
  const link = document.createElement("a");
  link.href = bookmark.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = bookmark.title;
  linkContainer.appendChild(link);
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.category = category;
  deleteButton.dataset.index = String(index);
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${bookmark.title}`);
  item.append(numberElement, categoryElement, linkContainer, deleteButton);
  return item;
}

function displayBookmarks() {
  if (!bookmarksContainer) return;
  const allBookmarks = readBookmarks();
  if (activeCategory && !allBookmarks[activeCategory]) activeCategory = "";
  bookmarksContainer.replaceChildren();
  const categories = activeCategory ? [activeCategory] : Object.keys(allBookmarks);
  let renderedCount = 0;

  categories.forEach((category) => {
    (allBookmarks[category] || []).forEach((bookmark, index) => {
      renderedCount += 1;
      bookmarksContainer.appendChild(createBookmarkElement(category, bookmark, index, renderedCount));
    });
  });

  if (renderedCount === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No bookmarks saved yet. Add your first bookmark above.";
    bookmarksContainer.appendChild(emptyState);
  }
}

function displayCategorySuggestions() {
  if (!categorySuggestionsContainer) return;
  const categories = Object.keys(readBookmarks()).sort((a, b) => a.localeCompare(b));
  categorySuggestionsContainer.replaceChildren();
  if (categories.length === 0) {
    categorySuggestionsContainer.appendChild(document.createTextNode("No categories yet"));
    return;
  }
  categories.forEach((category) => {
    const categoryButton = document.createElement("button");
    categoryButton.type = "button";
    categoryButton.className = "category-chip";
    categoryButton.textContent = category;
    categoryButton.addEventListener("click", () => {
      categoryInput.value = category;
      categoryInput.focus();
    });
    categorySuggestionsContainer.appendChild(categoryButton);
  });
}

function displayCategoryButtons() {
  if (!categoryButtonsContainer) return;
  const categories = Object.keys(readBookmarks()).sort((a, b) => a.localeCompare(b));
  categoryButtonsContainer.replaceChildren();
  categories.forEach((category) => {
    const categoryButton = document.createElement("button");
    categoryButton.type = "button";
    categoryButton.className = "category-filter";
    categoryButton.textContent = category;
    const isActive = activeCategory === category;
    categoryButton.classList.toggle("active", isActive);
    categoryButton.setAttribute("aria-pressed", String(isActive));
    categoryButton.addEventListener("click", () => setActiveCategory(category));
    categoryButtonsContainer.appendChild(categoryButton);
  });
}

function saveBookmark(event) {
  event?.preventDefault();
  const titleInput = document.querySelector(".title");
  const urlInput = document.querySelector(".url");
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  const category = categoryInput.value.trim().slice(0, 60);

  if (!title || !url || !category) {
    setStatus("Please complete the title, URL, and category fields.", "error");
    return;
  }
  if (title.length > 120) {
    setStatus("The title must be 120 characters or fewer.", "error");
    return;
  }
  if (!isSafeUrl(url)) {
    setStatus("Enter a valid HTTP or HTTPS URL.", "error");
    return;
  }

  const allBookmarks = readBookmarks();
  if (!allBookmarks[category]) allBookmarks[category] = [];
  const alreadySaved = allBookmarks[category].some((bookmark) => bookmark.url === url);
  if (alreadySaved) {
    setStatus("This bookmark is already saved in that category.", "error");
    return;
  }
  allBookmarks[category].push({ title, url });
  if (!saveBookmarks(allBookmarks)) return;
  titleInput.value = "";
  urlInput.value = "";
  categoryInput.value = "";
  setActiveCategory("");
  displayCategorySuggestions();
  displayCategoryButtons();
  setStatus("Bookmark added successfully.", "success");
}

function deleteBookmark(category, index) {
  const allBookmarks = readBookmarks();
  if (!allBookmarks[category] || !allBookmarks[category][index]) return;
  const [removed] = allBookmarks[category].splice(index, 1);
  if (allBookmarks[category].length === 0) delete allBookmarks[category];
  if (!saveBookmarks(allBookmarks)) return;
  if (activeCategory && !allBookmarks[activeCategory]) activeCategory = "";
  displayBookmarks();
  displayCategorySuggestions();
  displayCategoryButtons();
  setStatus(`${removed.title} deleted.`, "success");
}

bookmarkForm?.addEventListener("submit", saveBookmark);
showAllButton?.addEventListener("click", () => setActiveCategory(""));
bookmarksContainer?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category][data-index]");
  if (!button) return;
  deleteBookmark(button.dataset.category, Number(button.dataset.index));
});

displayBookmarks();
displayCategorySuggestions();
displayCategoryButtons();
