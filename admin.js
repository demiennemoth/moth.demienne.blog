// admin.js — авторизация, добавление постов, удаление из статьи
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
         addDoc, serverTimestamp, deleteDoc, doc, POSTS } from './firebase.js';

const btnAdmin = document.getElementById('btn-admin');
const btnLogout = document.getElementById('btn-logout');
const loginModal = document.getElementById('login-modal');
const loginCancel = document.getElementById('login-cancel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const addForm = document.getElementById('add-form');
const btnClear = document.getElementById('btn-clear');
const btnDelCurrent = document.getElementById('btn-del-current');
const adminPanel = document.getElementById('admin-panel');

let isAdmin = false;

btnAdmin.addEventListener('click', ()=>{ loginModal.style.display = 'flex'; loginError.style.display = 'none'; });
loginCancel.addEventListener('click', ()=>{ loginModal.style.display = 'none'; });

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
btnLogout.addEventListener('click', ()=> signOut(auth));

onAuthStateChanged(auth, (user)=>{
  isAdmin = !!user && user.email === 'demienne.moth@gmail.com';
  adminPanel.hidden = !isAdmin;
  btnLogout.hidden = !isAdmin;
  btnAdmin.hidden = isAdmin;
  // Сообщаем main.js о смене статуса
  window.dispatchEvent(new CustomEvent('auth:state', { detail:{ isAdmin } }));
});

// Создание поста
addForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(addForm);
  const data = {
    category: String(fd.get('category') || '').trim() || 'Прочее',
    title: String(fd.get('title') || '').trim() || 'Без названия',
    content: String(fd.get('content') || ''),
    created: serverTimestamp(),
  };
  try{
    await addDoc(POSTS, data);
    addForm.reset();
    alert('Сохранено.');
  }catch(err){
    alert('Ошибка: ' + (err?.message || err));
  }
});
btnClear?.addEventListener('click', ()=> addForm.reset());

// Удаление из открытой статьи
btnDelCurrent?.addEventListener('click', async ()=>{
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
