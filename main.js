// main.js — рендер постов, навигация, синхронизация с админкой
import { POSTS, onSnapshot, query, orderBy, doc, deleteDoc } from './firebase.js';

// Часы
const timeEl = document.getElementById('time');
function clock(){ const d=new Date(); if (timeEl) timeEl.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
setInterval(clock, 1000); clock();

// Разделы + элементы
const sections = {
  posts: document.getElementById('posts-list'),
  article: document.getElementById('article'),
  contact: document.getElementById('contact-panel'),
  help: document.getElementById('help-panel'),
  admin: document.getElementById('admin-panel'),
};
const pad = document.getElementById('pad');
const pathEl = document.getElementById('path');
const leftNav = document.getElementById('left-nav');
const filesBody = document.getElementById('files-body');
const recentBox = document.getElementById('recent-box');
const recentList = document.getElementById('recent');
const adminColHead = document.getElementById('admin-col-head');
const btnDelCurrent = document.getElementById('btn-del-current');
const btnEditCurrent = document.getElementById('btn-edit-current');

let isAdmin = false;
let currentPostId = null;

// Кэш постов для маршрутизации по #post-<id>
const postsCache = new Map();

function showOnly(names){
  for (const key in sections){ sections[key].hidden = !names.includes(key); }
}
function openArticle(docId, data){
  showOnly(['article']);
  if (pad) pad.textContent = data.content || '';
  const statusLeft = document.getElementById('status-left');
  if (statusLeft) statusLeft.textContent = data.title || '';
  if (pathEl) pathEl.textContent = 'C:\\Home\\Posts\\' + (docId || 'untitled') + '.txt';
  if (location.hash !== '#post-' + docId) location.hash = '#post-' + docId;
  currentPostId = docId;
  // сделаем доступным для админки
  window.currentPostId = currentPostId;
  \1
  if (btnEditCurrent) btnEditCurrent.style.display = isAdmin ? 'inline-flex' : 'none';
}
function route(){
  const h = location.hash || '#home';
  
  // Обработка прямых ссылок на посты: #post-<id>
  if (h.startsWith('#post-')){
    const id = h.slice(6);
    const data = postsCache.get(id);
    if (data){ openArticle(id, data); return; }
    // если кэш ещё не готов — временно показываем список
    showOnly(['posts']);
    return;
  }
  document.querySelectorAll('[data-nav]').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`[data-nav][href="${h.startsWith('#post-') ? '#home' : h}"]`);
  if(nav) nav.classList.add('active');
  if(h === '#home'){ showOnly(['posts']); if (pathEl) pathEl.textContent = 'C:\\Home\\Posts\\'; return; }
  if(h === '#contact'){ showOnly(['contact']); if (pathEl) pathEl.textContent = 'C:\\Home\\Contact\\'; return; }
  if(h === '#help'){ showOnly(['help']); if (pathEl) pathEl.textContent = 'C:\\Home\\Help\\'; return; }
  if(h === '#admin'){ showOnly(['admin']); if (pathEl) pathEl.textContent = 'C:\\Home\\Admin\\'; return; }
  showOnly(['posts']);
}
window.addEventListener('hashchange', route); route();

// Вспомогалки
function bytesFromString(s){ return new Blob([s || '']).size; }
function formatSize(b){ if (b < 1024) return b + ' Б'; if (b < 1024*1024) return Math.round(b/1024) + ' КБ'; return (b/1024/1024).toFixed(1) + ' МБ'; }
function formatDate(ts){
  const d = ts?.toDate ? ts.toDate() : new Date();
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function refreshAdminUI(){
  if (adminColHead) adminColHead.hidden = !isAdmin;
  if (btnDelCurrent) btnDelCurrent.style.display = isAdmin && currentPostId ? 'inline-flex' : 'none';
  if (btnEditCurrent) btnEditCurrent.style.display = isAdmin && currentPostId ? 'inline-flex' : 'none';
  if (recentBox) recentBox.hidden = (recentList && recentList.children.length === 0);
}

// Подписка на посты
onSnapshot(query(POSTS, orderBy('created','desc')), (snap)=>{
  // обновляем кэш перед перерисовкой
  postsCache.clear();
  const groups = {};
  if (filesBody) filesBody.innerHTML = '';
  if (leftNav) leftNav.innerHTML = '';
  if (recentList) recentList.innerHTML = '';
  let recentCount = 0;

  snap.forEach(docSnap=>{
    const data = docSnap.data();
    const id = docSnap.id;
    // кладём данные в кэш для мгновенного открытия по якорю
    postsCache.set(id, data);
    const cat = (data.category || 'Прочее').trim();
    (groups[cat] ||= []).push({ id, ...data });

    if (filesBody){
      const tr = document.createElement('tr');
      tr.className = 'row';
      tr.innerHTML = `<td class="icon-cell"><span class="ico-doc" aria-hidden="true"></span></td>
        <td><a href="#post-${id}">${(data.title || 'Без названия')}.txt</a></td>
        <td>${formatDate(data.created)}</td>
        <td>Текстовый документ</td>
        <td>${formatSize(bytesFromString(data.content))}</td>
        <td class="admin-col" ${isAdmin ? '' : 'hidden'}>
          <button class="btn95 btn-del" data-id="${id}">🗑 Удалить</button>
        </td>`;
      tr.querySelector('a').addEventListener('click', (e)=>{ e.preventDefault(); openArticle(id, data); });
      filesBody.appendChild(tr);
    }

    if (recentList && recentCount < 5){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#post-' + id;
      a.textContent = data.title || 'Без названия';
      a.addEventListener('click', (e)=>{ e.preventDefault(); openArticle(id, data); });
      li.appendChild(a);
      recentList.appendChild(li);
      recentCount++;
    }
  });

  // Левое «дерево»
  if (leftNav){
    Object.keys(groups).sort().forEach(cat=>{
      const label = document.createElement('div');
      label.className = 'folder';
      label.textContent = '📂 ' + cat;
      leftNav.appendChild(label);
      groups[cat].forEach(p=>{
        const a = document.createElement('a');
        a.href = '#post-' + p.id;
        a.textContent = '— ' + (p.title || 'Без названия');
        a.addEventListener('click', (e)=>{ e.preventDefault(); openArticle(p.id, p); });
        leftNav.appendChild(a);
      });
    });
  }

  // Удаление строк из таблицы (для админа)
  if (isAdmin){
    document.querySelectorAll('.btn-del').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('Удалить пост безвозвратно?')) return;
        try{ await deleteDoc(doc(POSTS, id)); if (currentPostId === id) { location.hash = '#home'; route(); } }
        catch(err){ alert('Ошибка удаления: ' + (err?.message || err)); }
      });
    });
  }
  
  // если при загрузке есть якорь на пост — открываем теперь, когда кэш готов
  if (location.hash && location.hash.startsWith('#post-')){
    const id = location.hash.slice(6);
    const data2 = postsCache.get(id);
    if (data2) openArticle(id, data2);
  }
  refreshAdminUI();
});

// Получаем статус админа из admin.js через кастомное событие
window.addEventListener('auth:state', (e)=>{
  isAdmin = !!e.detail?.isAdmin;
  // если при загрузке есть якорь на пост — открываем теперь, когда кэш готов
  if (location.hash && location.hash.startsWith('#post-')){
    const id = location.hash.slice(6);
    const data2 = postsCache.get(id);
    if (data2) openArticle(id, data2);
  }
  refreshAdminUI();
});

// Экспортируем в глобал для admin.js (только id)
window.getCurrentPostId = () => currentPostId;
