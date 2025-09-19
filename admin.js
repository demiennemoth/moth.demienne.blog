// admin.js — авторизация, добавление постов, удаление из статьи
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
         addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc, POSTS } from './firebase.js';

const btnAdmin = document.getElementById('btn-admin');
const btnLogout = document.getElementById('btn-logout');
const loginModal = document.getElementById('login-modal');
const loginCancel = document.getElementById('login-cancel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const addForm = document.getElementById('add-form');
const btnClear = document.getElementById('btn-clear');
const btnDelCurrent = document.getElementById('btn-del-current');
const btnEditCurrent = document.getElementById('btn-edit-current');
const editIdInput = document.getElementById('edit-post-id');
const adminPanel = document.getElementById('admin-panel');

let isAdmin = false;

if (btnAdmin && loginModal && loginError){
  btnAdmin.addEventListener('click', ()=>{ loginModal.style.display = 'flex'; loginError.style.display = 'none'; });
}
if (loginCancel && loginModal){
  loginCancel.addEventListener('click', ()=>{ loginModal.style.display = 'none'; });
}
if (loginForm && loginModal && loginError){
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    try{
      await signInWithEmailAndPassword(auth, email, password);
      loginModal.style.display = 'none';
    }catch(err){
      loginError.textContent = 'Ошибка входа: ' + (err?.message || err);
      loginError.style.display = 'block';
    }
  });
}
if (btnLogout){
  btnLogout.addEventListener('click', ()=> signOut(auth));
}

onAuthStateChanged(auth, (user)=>{
  isAdmin = !!user && user.email === 'demienne.moth@gmail.com';
  if (adminPanel) adminPanel.hidden = !isAdmin;
  if (btnLogout) btnLogout.hidden = !isAdmin;
  if (btnAdmin) btnAdmin.hidden = isAdmin;
  // Сообщаем main.js о смене статуса
  window.dispatchEvent(new CustomEvent('auth:state', { detail:{ isAdmin } }));
});


// Режим редактирования
async function enterEditMode(id){
  if (!addForm || !id) return;
  try{
    const snap = await getDoc(doc(POSTS, id));
    if (!snap.exists()) { alert('Пост не найден'); return; }
    const data = snap.data();
    addForm.category.value = data.category || '';
    addForm.title.value = data.title || '';
    addForm.content.value = data.content || '';
    if (editIdInput) editIdInput.value = id;
    // Поменять подписи
    const submitBtn = addForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = '💾 Сохранить изменения';
    location.hash = '#admin';
    alert('Редактирование: ' + (data.title || id));
  }catch(err){
    alert('Ошибка загрузки для редактирования: ' + (err?.message || err));
  }
}
function exitEditMode(){
  if (!addForm) return;
  if (editIdInput) editIdInput.value = '';
  const submitBtn = addForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = '💾 Сохранить';
}
// Создание поста
if (addForm){
  addForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(addForm);
    const data = {
      category: String(fd.get('category') || '').trim() || 'Прочее',
      title: String(fd.get('title') || '').trim() || 'Без названия',
      content: String(fd.get('content') || ''),
      created: serverTimestamp(),
    };
    try{
      if (editIdInput && editIdInput.value){
        await updateDoc(doc(POSTS, editIdInput.value), { category: data.category, title: data.title, content: data.content, updated: serverTimestamp() });
        exitEditMode();
        alert('Изменения сохранены.');
      } else {
        await addDoc(POSTS, data);
        addForm.reset();
        alert('Сохранено.');
      }
      }catch(err){
      alert('Ошибка: ' + (err?.message || err));
    }
  });
}
if (btnClear && addForm){ btnClear.addEventListener('click', ()=> { addForm.reset(); exitEditMode(); }); }

// Удаление из открытой статьи
if (btnDelCurrent){
  btnDelCurrent.addEventListener('click', async ()=>{
    if (!isAdmin) return;
    const id = window.getCurrentPostId ? window.getCurrentPostId() : null;
    if (!id) return;
    if (!confirm('Удалить этот пост безвозвратно?')) return;
    try{
      await deleteDoc(doc(POSTS, id));
      alert('Пост удалён.');
      location.hash = '#home';
    }catch(err){
      alert('Ошибка удаления: ' + (err?.message || err));
    }
  });
}
