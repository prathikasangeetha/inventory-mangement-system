const form = document.getElementById("itemForm");
const itemId = document.getElementById("itemId");
const productName = document.getElementById("productName");
const category = document.getElementById("category");
const quantity = document.getElementById("quantity");
const price = document.getElementById("price");
const supplier = document.getElementById("supplier");
const date = document.getElementById("date");
const tableBody = document.getElementById("itemTableBody");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const message = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

date.value = new Date().toISOString().split("T")[0];

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = `message ${type}`;
    setTimeout(() => message.className = "message hidden", 3500);
}

async function loadItems() {
    try {
        const params = new URLSearchParams();
        if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
        if (categoryFilter.value) params.set("category", categoryFilter.value);

        const response = await fetch(`/api/items/?${params.toString()}`);
        if (!response.ok) throw new Error("Could not load products.");
        const items = await response.json();
        renderItems(items);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty">${error.message}</td></tr>`;
    }
}

function renderItems(items) {
    if (!items.length) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty">No products found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${escapeHtml(item.product_name)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${item.quantity}</td>
            <td>₹${Number(item.price).toFixed(2)}</td>
            <td>${escapeHtml(item.supplier)}</td>
            <td>${item.date}</td>
            <td>
                <div class="actions">
                    <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    }[char]));
}

async function loadStats() {
    try {
        const response = await fetch("/api/stats/");
        const stats = await response.json();
        document.getElementById("totalProducts").textContent = stats.total_products;
        document.getElementById("totalQuantity").textContent = stats.total_quantity;
        document.getElementById("totalCategories").textContent = stats.total_categories;
        document.getElementById("totalValue").textContent =
            `₹${Number(stats.total_value).toLocaleString("en-IN", {minimumFractionDigits: 2})}`;
    } catch (error) {
        console.error(error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch("/api/categories/");
        const categories = await response.json();
        categoryFilter.innerHTML = `<option value="">All Categories</option>` +
            categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    } catch (error) {
        console.error(error);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = {
        product_name: productName.value.trim(),
        category: category.value.trim(),
        quantity: Number(quantity.value),
        price: Number(price.value),
        supplier: supplier.value.trim(),
        date: date.value
    };

    const id = itemId.value;
    const url = id ? `/api/items/${id}/` : "/api/items/";
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Operation failed.");
        }

        showMessage(result.message, "success");
        resetForm();
        await refreshAll();
    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function editItem(id) {
    try {
        const response = await fetch(`/api/items/${id}/`);
        const item = await response.json();

        if (!response.ok) throw new Error(item.error || "Product not found.");

        itemId.value = item.id;
        productName.value = item.product_name;
        category.value = item.category;
        quantity.value = item.quantity;
        price.value = item.price;
        supplier.value = item.supplier;
        date.value = item.date;

        formTitle.textContent = "Edit Product";
        submitBtn.textContent = "Update Product";
        cancelEditBtn.classList.remove("hidden");
        window.scrollTo({top: 0, behavior: "smooth"});
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`/api/items/${id}/`, {method: "DELETE"});
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Delete failed.");

        showMessage(result.message, "success");
        await refreshAll();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

function resetForm() {
    form.reset();
    itemId.value = "";
    formTitle.textContent = "Add New Product";
    submitBtn.textContent = "Add Product";
    cancelEditBtn.classList.add("hidden");
    date.value = new Date().toISOString().split("T")[0];
}

cancelEditBtn.addEventListener("click", resetForm);

let searchTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadItems, 250);
});
categoryFilter.addEventListener("change", loadItems);

async function refreshAll() {
    await Promise.all([loadItems(), loadStats(), loadCategories()]);
}

refreshAll();
