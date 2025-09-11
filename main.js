// Часы
const timeEl = document.getElementById('time');
function clock(){ const d=new Date(); timeEl.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
setInterval(clock, 1000); clock();

// Разделы страницы
const sections = {
  posts: document.getElementById('posts-list'),
  article: document.getElementById('article'),
  contact: document.getElementById('contact-panel'),
  help: document.getElementById('help-panel'),
  admin: document.getElementById('admin-panel')
};
const pad = document.getElementById('pad');
const pathEl = document.getElementById('path');
const leftNav = document.getElementById('left-nav');
const filesBody = document.getElementById('files-body');
const recentBox = document.getElementById('recent-box');
const recentList = document.getElementById('recent');
const adminColHead = document.getElementById('admin-col-head');
const btnDelCurrent = document.getElementById('btn-del-current');

let isAdmin = false;
let currentPostId = null;

function showOnly(names){
  for (const key in sections){
    sections[key].hidden = !names.includes(key);
  }
}

function openArticle(docId, data){
  showOnly(['article']);
  pad.textContent = data.content || '';
  document.getElementById('status-left').textContent = data.title;
  pathEl.textContent = 'C:\\Home\\Posts\\' + (docId || 'untitled') + '.txt';
  location.hash = '#post-' + docId;
  currentPostId = docId;
  btnDelCurrent.style.display = isAdmin ? 'inline-flex' : 'none';
}

function route(){
  const h = location.hash || '#home';
  document.querySelectorAll('[data-nav]').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`[data-nav][href="${h.startsWith('#post-') ? '#home' : h}"]`);
  if(nav) nav.classList.add('active');

  if(h === '#home'){ showOnly(['posts']); pathEl.textContent = 'C:\\Home\\Posts\\'; return; }
  if(h === '#contact'){ showOnly(['contact']); pathEl.textContent = 'C:\\Home\\Contact\\'; return; }
  if(h === '#help'){ showOnly(['help']); pathEl.textContent = 'C:\\Home\\Help\\'; return; }
  if(h === '#admin'){ showOnly(['admin']); pathEl.textContent = 'C:\\Home\\Admin\\'; return; }
  showOnly(['posts']);
}
window.addEventListener('hashchange', route); route();
