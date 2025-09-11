// код админки (вход/выход, добавление/удаление)
// ... полный код перенimport { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
         addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, POSTS } from './firebase.js';

const btnAdmin = document.getElementById('btn-admin');
const btnLogout = document.getElementById('btn-logout');
const loginModal = document.getElementById('login-modal');
const loginCancel = document.getElementById('login-cancel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const addForm = document.getElementById('add-form');
const btnClear = document.getElementById('btn-clear');
const btnDelCurrent = document.getElementById('btn-del-current');
const adminColHead = document.getElementById('admin-col-head');
const sections = {
  admin: document.getElementById('admin-panel')
};
const pad = document.getElementById('pad');
const pathEl = document.getElementById('path');
let isAdmin = false;
let currentPostId = null;

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
  sections.admin.hidden = !isAdmin;
  btnLogout.hidden = !isAdmin;
  btnAdmin.hidden = isAdmin;
  adminColHead.hidden = !isAdmin;
  btnDelCurrent.style.display = isAdmin && currentPostId ? 'inline-flex' : 'none';
});

addForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(addForm);
  const data = {
    category: fd.get('category').toString(),
    title: fd.get('title').toString(),
    content: fd.get('content').toString(),
    created: serverTimestamp()
  };
  try{
    await addDoc(POSTS, data);
    addForm.reset();
    alert('Сохранено.');
  }catch(err){
    alert('Ошибка: ' + (err?.message || err));
  }
});
btnClear.addEventListener('click', ()=> addForm.reset());

btnDelCurrent.addEventListener('click', async ()=>{
  if (!isAdmin || !currentPostId) return;
  if (!confirm('Удалить этот пост безвозвратно?')) return;
  try{
    await deleteDoc(doc(POSTS, currentPostId));
    alert('Пост удалён.');
    location.hash = '#home';
    location.reload();
  }catch(err){
    alert('Ошибка удаления: ' + (err?.message || err));
  }
});есён из index.html ...
