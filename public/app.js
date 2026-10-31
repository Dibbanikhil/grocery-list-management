const form = document.getElementById("groceryForm");
const list = document.getElementById("groceryList");
const itemId = document.getElementById("itemId");
const nameInput = document.getElementById("name");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let groceries = [];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function loadGroceries() {
  list.innerHTML = '<div class="loading-state">Loading your groceries…</div>';
  try {
    groceries = await apiRequest("/api/groceries");
    renderGroceries();
    updateSummary();
  } catch (error) {
    list.innerHTML = "";
    const errorBox = document.createElement("div");
    errorBox.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = "Couldn't load your list";
    const detail = document.createElement("span");
    detail.textContent = error.message;
    errorBox.append(title, detail);
    list.appendChild(errorBox);
    showMessage("Check your server and database connection.", true);
  }
}

function updateSummary() {
  const remaining = groceries.filter(item => !item.purchased).length;
  const total = groceries.reduce((sum, item) => sum + item.quantity * item.price, 0);
  document.getElementById("totalItems").textContent = groceries.length;
  document.getElementById("remainingItems").textContent = remaining;
  document.getElementById("totalCost").textContent = total.toLocaleString("en-IN", {
    style: "currency", currency: "INR"
  });
  document.getElementById("itemCount").textContent =
    `${groceries.length} ${groceries.length === 1 ? "item" : "items"}`;
  document.getElementById("progressText").textContent = groceries.length
    ? `${groceries.length - remaining} of ${groceries.length} items completed`
    : "Your list is ready when you are.";
}

function makeButton(label, className, title, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.addEventListener("click", onClick);
  return button;
}

function renderGroceries() {
  list.replaceChildren();
  const search = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  const visibleItems = groceries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search) ||
      (item.category || "").toLowerCase().includes(search);
    const matchesFilter = filter === "all" ||
      (filter === "remaining" && !item.purchased) ||
      (filter === "purchased" && item.purchased);
    return matchesSearch && matchesFilter;
  });

  if (!visibleItems.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = groceries.length ? "No matching groceries" : "Your list is looking fresh!";
    const detail = document.createElement("span");
    detail.textContent = groceries.length
      ? "Try changing your search or filter."
      : "Add your first item using the form.";
    empty.append(title, detail);
    list.appendChild(empty);
    return;
  }

  visibleItems.forEach(item => {
    const card = document.createElement("article");
    card.className = `grocery-item${item.purchased ? " purchased" : ""}`;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "item-check";
    check.checked = item.purchased;
    check.setAttribute("aria-label", `Mark ${item.name} as ${item.purchased ? "not purchased" : "purchased"}`);
    check.addEventListener("change", () => updateItem(item._id, { purchased: check.checked }));

    const main = document.createElement("div");
    main.className = "item-main";
    const title = document.createElement("p");
    title.className = "item-name";
    title.textContent = item.name;
    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = `${item.category || "Other"} · Qty ${item.quantity}`;
    main.append(title, meta);

    const price = document.createElement("span");
    price.className = "item-price";
    price.textContent = (item.quantity * item.price).toLocaleString("en-IN", {
      style: "currency", currency: "INR"
    });

    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.append(
      makeButton("✎", "icon-button", `Edit ${item.name}`, () => editItem(item)),
      makeButton("×", "icon-button delete", `Delete ${item.name}`, () => deleteItem(item._id))
    );

    card.append(check, main, price, actions);
    list.appendChild(card);
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (name.length < 2 || name.length > 100 || !Number.isInteger(quantity) ||
      quantity < 1 || !Number.isFinite(price) || price < 0) {
    showMessage("Enter a valid name, positive whole quantity, and non-negative price.", true);
    return;
  }

  const payload = { name, quantity, price, category: categoryInput.value };
  const editing = Boolean(itemId.value);
  try {
    if (editing) {
      await apiRequest(`/api/groceries/${itemId.value}`, {
        method: "PUT", body: JSON.stringify(payload)
      });
      showMessage("Grocery item updated.");
    } else {
      await apiRequest("/api/groceries", {
        method: "POST", body: JSON.stringify(payload)
      });
      showMessage("Grocery item added.");
    }
    resetForm();
    await loadGroceries();
  } catch (error) {
    showMessage(error.message, true);
  }
});

function editItem(item) {
  itemId.value = item._id;
  nameInput.value = item.name;
  quantityInput.value = item.quantity;
  priceInput.value = item.price;
  categoryInput.value = item.category || "Other";
  document.getElementById("formTitle").textContent = "Edit grocery item";
  document.getElementById("submitButton").textContent = "Save changes";
  document.getElementById("cancelButton").classList.remove("hidden");
  nameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function updateItem(id, updates) {
  try {
    await apiRequest(`/api/groceries/${id}`, {
      method: "PUT", body: JSON.stringify(updates)
    });
    showMessage("Grocery item updated.");
    await loadGroceries();
  } catch (error) {
    showMessage(error.message, true);
    await loadGroceries();
  }
}

async function deleteItem(id) {
  const item = groceries.find(grocery => grocery._id === id);
  if (!window.confirm(`Delete "${item ? item.name : "this item"}" from your list?`)) return;
  try {
    await apiRequest(`/api/groceries/${id}`, { method: "DELETE" });
    showMessage("Grocery item deleted.");
    await loadGroceries();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function resetForm() {
  form.reset();
  itemId.value = "";
  quantityInput.value = "1";
  priceInput.value = "0";
  document.getElementById("formTitle").textContent = "Add to your list";
  document.getElementById("submitButton").textContent = "＋ Add grocery";
  document.getElementById("cancelButton").classList.add("hidden");
}

document.getElementById("cancelButton").addEventListener("click", () => {
  resetForm();
  showMessage("");
});
searchInput.addEventListener("input", renderGroceries);
filterSelect.addEventListener("change", renderGroceries);
document.getElementById("clearSearch").addEventListener("click", () => {
  searchInput.value = "";
  filterSelect.value = "all";
  renderGroceries();
});

loadGroceries();
