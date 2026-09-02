const state = { token: localStorage.getItem('bookStoreToken'), user: JSON.parse(localStorage.getItem('bookStoreUser') || 'null') };
const $ = (selector) => document.querySelector(selector);

function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3000);
}

async function request(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'تعذر تنفيذ الطلب');
    return data;
}

function setSession(user, token) {
    state.user = user;
    state.token = token;
    if (user && token) {
        localStorage.setItem('bookStoreUser', JSON.stringify(user));
        localStorage.setItem('bookStoreToken', token);
    } else {
        localStorage.removeItem('bookStoreUser');
        localStorage.removeItem('bookStoreToken');
    }
    renderSession();
}

function renderSession() {
    const authenticated = Boolean(state.token && state.user);
    $('#auth-panel').classList.toggle('hidden', authenticated);
    $('#dashboard').classList.toggle('hidden', !authenticated);
    $('#logout-button').classList.toggle('hidden', !authenticated);
    $('#session-label').textContent = authenticated ? `${state.user.name} · ${state.user.role === 'admin' ? 'مشرف' : 'مستخدم'}` : 'زائر';
}

function renderBooks(books) {
    const list = $('#books-list');
    $('#books-empty').style.display = books.length ? 'none' : 'block';
    list.innerHTML = books.map((book) => `<tr><td><strong>${escapeHtml(book.title)}</strong></td><td>${Number(book.price).toFixed(2)}</td><td><button class="table-action" data-edit="${book._id}">تعديل</button><button class="table-action delete" data-delete="${book._id}">حذف</button></td></tr>`).join('');
    list.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => startEdit(books.find((book) => book._id === button.dataset.edit))));
    list.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteBook(button.dataset.delete)));
}

function renderUsers(users) {
    const list = $('#users-list');
    $('#users-empty').style.display = users.length ? 'none' : 'block';
    list.innerHTML = users.map((user) => `<tr><td>${escapeHtml(user.name)}</td><td dir="ltr">${escapeHtml(user.email)}</td><td><span class="role">${user.role === 'admin' ? 'مشرف' : 'مستخدم'}</span></td><td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td></tr>`).join('');
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

async function loadDashboard() {
    if (!state.token) return;
    try {
        $('#api-status').textContent = 'متصل';
        const [booksResponse, usersResponse] = await Promise.all([request('/books'), request('/users')]);
        renderBooks(booksResponse.data || []);
        renderUsers(usersResponse.users || []);
    } catch (error) {
        $('#api-status').textContent = 'تعذر الاتصال';
        showToast(error.message);
    }
}

function startEdit(book) {
    $('#book-form-title').textContent = 'تعديل كتاب';
    $('#book-form [name="id"]').value = book._id;
    $('#book-form [name="title"]').value = book.title;
    $('#book-form [name="price"]').value = book.price;
    $('#cancel-edit').classList.remove('hidden');
    $('#book-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetBookForm() {
    $('#book-form').reset();
    $('#book-form [name="id"]').value = '';
    $('#book-form-title').textContent = 'إضافة كتاب';
    $('#cancel-edit').classList.add('hidden');
}

async function deleteBook(id) {
    if (!confirm('هل تريد حذف هذا الكتاب؟')) return;
    try { await request(`/books/${id}`, { method: 'DELETE' }); showToast('تم حذف الكتاب'); await loadDashboard(); }
    catch (error) { showToast(error.message); }
}

$('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
        const result = await request('/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
        setSession(result.user, result.token); showToast('تم تسجيل الدخول بنجاح'); await loadDashboard();
    } catch (error) { showToast(error.message); }
});

$('#register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { await request('/register', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) }); showToast('تم إنشاء الحساب، يمكنك تسجيل الدخول'); event.currentTarget.reset(); }
    catch (error) { showToast(error.message); }
});

$('#book-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = form.get('id');
    const body = JSON.stringify({ title: form.get('title'), price: Number(form.get('price')) });
    try { await request(id ? `/books/${id}` : '/books', { method: id ? 'PUT' : 'POST', body }); showToast(id ? 'تم تحديث الكتاب' : 'تمت إضافة الكتاب'); resetBookForm(); await loadDashboard(); }
    catch (error) { showToast(error.message); }
});

$('#cancel-edit').addEventListener('click', resetBookForm);
$('#refresh-button').addEventListener('click', loadDashboard);
$('#logout-button').addEventListener('click', () => { setSession(null, null); showToast('تم تسجيل الخروج'); });
renderSession();
loadDashboard();
