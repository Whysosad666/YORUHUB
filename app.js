/* ===================== Yoru Hub ===================== */

/* ---------- Storage keys ---------- */
const LS_ANIME = 'yoru-hub-anime-static-v1';
const LS_PROFILE = 'yoru-hub-profile-v1';
const LS_THEME = 'yoru-hub-theme-v1';
const LS_PAGE = 'yoru-hub-page-v1';

/* ---------- Default data ---------- */
const DEFAULT_ANIME = [
  {id:1,title:'Демоны старшей школы',original:'High School DxD',year:2012,genres:['Этти','Экшен','Комедия','Романтика','Фэнтези','Школа'],status:'Просмотрено',rating:9,episodesWatched:12,episodesTotal:12,seasons:1,ageRating:'18+',favorite:true,watchUrl:'https://www.google.com/search?q=High+School+DxD+watch',poster:'posters/dxd.jpg',added:'15.05.2024',watchMinutes:null},
  {id:2,title:'Атака титанов',original:'Shingeki no Kyojin',year:2013,genres:['Экшен','Драма','Фэнтези','Триллер'],status:'Просмотрено',rating:10,episodesWatched:87,episodesTotal:'Final',seasons:4,ageRating:'16+',favorite:true,watchUrl:'https://www.google.com/search?q=Shingeki+no+Kyojin+watch',poster:'posters/aot.jpg',added:'10.05.2024',watchMinutes:null},
  {id:3,title:'Чёрный клевер',original:'Black Clover',year:2017,genres:['Экшен','Комедия','Магия','Фэнтези'],status:'Смотрю',rating:8,episodesWatched:98,episodesTotal:170,seasons:1,ageRating:'12+',favorite:false,watchUrl:'https://www.google.com/search?q=Black+Clover+watch',poster:'posters/black-clover.jpg',added:'01.05.2024',watchMinutes:null},
  {id:4,title:'Восхождение героя щита',original:'Tate no Yuusha',year:2019,genres:['Экшен','Фэнтези','Исекай'],status:'Планирую',rating:0,episodesWatched:15,episodesTotal:25,seasons:3,ageRating:'16+',favorite:false,watchUrl:'',poster:'posters/shield-hero.jpg',added:'21.04.2024',watchMinutes:null},
  {id:5,title:'Этот глупый свин не понимает...',original:'Bunny Girl Senpai',year:2018,genres:['Драма','Романтика','Школа'],status:'Брошено',rating:7,episodesWatched:5,episodesTotal:13,seasons:1,ageRating:'12+',favorite:false,watchUrl:'',poster:'posters/bunny.jpg',added:'02.04.2024',watchMinutes:null}
];

const DEFAULT_PROFILE = {name:'Eduard', avatar:''};

/* ---------- State ---------- */
let anime = loadJSON(LS_ANIME, DEFAULT_ANIME);
let profile = loadJSON(LS_PROFILE, DEFAULT_PROFILE);
let theme = localStorage.getItem(LS_THEME) || 'red';
let page = localStorage.getItem(LS_PAGE) || 'Главная';

let q = '', genre = 'Все жанры', status = 'Все статусы', sort = 'Дата';
let ratingMin = 1;

const app = document.getElementById('app');

const NAV = [
  {key:'Главная', icon:'🏠'},
  {key:'Мои аниме', icon:'📺'},
  {key:'Избранное', icon:'❤'},
  {key:'Смотреть позже', icon:'⏰'},
  {key:'Статистика', icon:'📊'},
  {key:'Поиск', icon:'🔍'},
  {key:'Добавить аниме', icon:'➕'},
  {key:'Новинки', icon:'🆕'},
  {key:'Экспорт / Импорт', icon:'🔁'},
  {key:'Настройки', icon:'⚙️'}
];
const WIDE_PAGES = ['Настройки', 'Экспорт / Импорт'];
const statuses = ['Просмотрено', 'Смотрю', 'Планирую', 'Брошено'];
const AGE_RATINGS = ['0+', '6+', '12+', '16+', '18+'];

/* ---------- Storage helpers ---------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (e) { return fallback; }
}
function saveAnime() { localStorage.setItem(LS_ANIME, JSON.stringify(anime)); }
function saveProfile() { localStorage.setItem(LS_PROFILE, JSON.stringify(profile)); }
function saveTheme() { localStorage.setItem(LS_THEME, theme); }
function savePage() { localStorage.setItem(LS_PAGE, page); }

/* ---------- Small utils ---------- */
function n(x) { return Number.isFinite(+x) ? +x : 0; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function parseRuDate(str) {
  if (!str) return null;
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(str.trim());
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1]);
}
function formatMinutes(total) {
  const min = Math.max(0, Math.round(total || 0));
  const days = Math.floor(min / 1440);
  const hours = Math.floor((min % 1440) / 60);
  const mins = min % 60;
  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${mins}м`;
  return `${mins}м`;
}

/* ---------- Derived data ---------- */
function stats() {
  const rated = anime.filter(a => a.rating > 0);
  const eps = anime.reduce((s, a) => s + n(a.episodesWatched), 0);
  const totalMinutes = anime.reduce((s, a) => s + (n(a.watchMinutes) || n(a.episodesWatched) * 24), 0);
  const genreCount = {};
  anime.forEach(a => (a.genres || []).forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; }));
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
  const sortedByAdded = [...anime].sort((a, b) => {
    const da = parseRuDate(a.added), db = parseRuDate(b.added);
    if (da && db) return db - da;
    return b.id - a.id;
  });
  return {
    total: anime.length,
    watched: anime.filter(a => a.status === 'Просмотрено').length,
    watching: anime.filter(a => a.status === 'Смотрю').length,
    plan: anime.filter(a => a.status === 'Планирую').length,
    drop: anime.filter(a => a.status === 'Брошено').length,
    fav: anime.filter(a => a.favorite).length,
    eps,
    totalMinutes,
    avg: rated.length ? (rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1) : '0.0',
    favoriteGenre: topGenres.length ? topGenres[0][0] : '—',
    lastAdded: sortedByAdded.length ? sortedByAdded[0].title : '—',
    topGenres
  };
}
function levelInfo() {
  const watched = anime.filter(a => a.status === 'Просмотрено').length;
  const level = Math.floor(watched / 2);
  const progressCount = watched % 2;
  const remaining = 2 - progressCount;
  return {level, progress: (progressCount / 2) * 100, watched, remaining};
}
function allGenres() { return ['Все жанры', ...new Set(anime.flatMap(a => a.genres || []))]; }
function getList(extra) {
  return anime
    .filter(a => (a.title + ' ' + a.original).toLowerCase().includes(q.toLowerCase()))
    .filter(a => genre === 'Все жанры' || (a.genres || []).includes(genre))
    .filter(a => status === 'Все статусы' || a.status === status)
    .filter(a => (a.rating || 0) === 0 || a.rating >= ratingMin)
    .filter(a => extra ? extra(a) : true)
    .sort((a, b) => {
      if (sort === 'Оценка') return b.rating - a.rating;
      if (sort === 'Год') return b.year - a.year;
      return b.id - a.id;
    });
}

/* ---------- Focus-preserving render ---------- */
function render() {
  const active = document.activeElement;
  const focusId = active && active.dataset ? active.dataset.focusId : null;
  const selStart = active && 'selectionStart' in active ? active.selectionStart : null;
  const selEnd = active && 'selectionEnd' in active ? active.selectionEnd : null;

  app.innerHTML = renderApp();

  if (focusId) {
    const el = app.querySelector(`[data-focus-id="${focusId}"]`);
    if (el) {
      el.focus();
      if (selStart != null && el.setSelectionRange) {
        try { el.setSelectionRange(selStart, selEnd); } catch (e) {}
      }
    }
  }
}

/* ---------- Top-level layout ---------- */
function renderApp() {
  const wide = WIDE_PAGES.includes(page);
  return `<div class="app ${theme}">
    ${renderSidebar()}
    <main class="main">
      ${renderHero()}
      <div class="content ${wide ? 'wide' : ''}">
        ${renderMain()}
        ${wide ? '' : renderRight()}
      </div>
    </main>
  </div>`;
}

function renderSidebar() {
  return `<aside class="sidebar">
    <div class="logo-wrap"><img class="logo" src="assets/logo.png" alt="Yoru Hub"></div>
    <div class="nav">
      ${NAV.map(item => `<button onclick="nav('${item.key}')" class="${page === item.key ? 'active' : ''}"><span class="ic">${item.icon}</span>${item.key}</button>`).join('')}
    </div>
    <div class="theme">
      <p>Тема</p>
      <button onclick="setTheme('red')" class="${theme === 'red' ? 'active' : ''}">🔴 Красная</button>
      <button onclick="setTheme('purple')" class="${theme === 'purple' ? 'active' : ''}">🟣 Фиолетовая</button>
      <button onclick="setTheme('blue')" class="${theme === 'blue' ? 'active' : ''}">🔵 Синяя</button>
    </div>
    <div class="sidebar-spacer"></div>
    <div class="sidechar"><img src="assets/issei-cut.png" alt=""></div>
  </aside>`;
}

function renderHero() {
  const lvl = levelInfo();
  return `<header class="hero">
    <div class="hero-glow"></div>
    <div class="hero-glow hero-glow2"></div>
    ${renderParticles()}
    <img class="hero-char hero-akeno" src="assets/akeno-cut.png" alt="Akeno Himejima">
    <img class="hero-char hero-rias" src="assets/rias-cut.png" alt="Rias Gremory">
    <div class="hero-text"><b>RIAS GREMORY</b><span>A queen never yields.</span></div>
    <div class="profile">
      <div class="avatar">${profile.avatar ? `<img src="${esc(profile.avatar)}" alt="">` : '👤'}</div>
      <div class="profile-info">
        <b>${esc(profile.name || 'Пользователь')}</b>
        <div class="sub">Lvl ${lvl.level}</div>
        <div class="lvl-bar"><i style="width:${lvl.progress}%"></i></div>
      </div>
      <button class="icon-btn" title="Настройки" onclick="nav('Настройки')">⚙️</button>
    </div>
  </header>`;
}

function renderParticles() {
  let out = '<div class="particles">';
  for (let i = 0; i < 22; i++) {
    const left = (Math.random() * 100).toFixed(1);
    const delay = (Math.random() * 12).toFixed(1);
    const duration = (10 + Math.random() * 10).toFixed(1);
    const size = (2 + Math.random() * 3).toFixed(1);
    out += `<span class="particle" style="left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;width:${size}px;height:${size}px"></span>`;
  }
  out += '</div>';
  return out;
}

/* ---------- Right column (stats / quick filters / links) ---------- */
function renderRight() {
  const s = stats();
  const genres = allGenres();
  return `<aside class="right">
    <section class="panel">
      <h2>Статистика</h2>
      <div class="circle">
        <div class="ring"><img src="assets/magic_circle.png" alt=""></div>
        <b>${s.total}</b><span>Всего аниме</span>
      </div>
      <p class="statline"><span>Эпизодов просмотрено</span><b>${s.eps}</b></p>
      <p class="statline"><span>Общее время просмотра</span><b>${formatMinutes(s.totalMinutes)}</b></p>
      <p class="statline"><span>Средняя оценка</span><b>${s.avg}</b></p>
      <p class="statline"><span>Любимый жанр</span><b>${esc(s.favoriteGenre)}</b></p>
      <button class="add" onclick="openModal()">＋ Добавить аниме</button>
    </section>
    <section class="panel filters">
      <h2>Быстрые фильтры</h2>
      <select onchange="genre=this.value;render()">${genres.map(g => `<option ${g === genre ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>
      <select onchange="status=this.value;render()"><option>Все статусы</option>${statuses.map(x => `<option ${x === status ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <label>Оценка от: <span id="ratingMinLabel">${ratingMin}</span>
        <input type="range" min="1" max="10" value="${ratingMin}" oninput="document.getElementById('ratingMinLabel').textContent=this.value" onchange="ratingMin=+this.value;render()">
      </label>
    </section>
    <section class="panel links">
      <h2>Ссылки</h2>
      <a href="https://www.google.com/search?q=watch+anime" target="_blank">Перейти на сайт <span>🔗</span></a>
      <a href="https://www.google.com/search?q=anime+watch+online" target="_blank">Открыть в новом окне <span>↗</span></a>
    </section>
  </aside>`;
}

/* ---------- Main column router ---------- */
function renderMain() {
  switch (page) {
    case 'Мои аниме': return renderLibraryPage('Мои аниме', null);
    case 'Избранное': return renderLibraryPage('Избранное', a => a.favorite);
    case 'Смотреть позже': return renderLibraryPage('Смотреть позже', a => a.status === 'Планирую');
    case 'Поиск': return renderSearchPage();
    case 'Статистика': return renderStatsPage();
    case 'Новинки': return renderRecentPage();
    case 'Экспорт / Импорт': return renderExportPage();
    case 'Настройки': return renderSettingsPage();
    default: return renderHomePage();
  }
}

function renderHomePage() {
  const s = stats();
  const continueWatching = anime.filter(a => a.status === 'Смотрю').concat(anime.filter(a => a.status !== 'Смотрю')).slice(0, 5);
  const list = getList();
  const genres = allGenres();
  return `<section class="left">
    <div class="top">
      <div class="hello"><p>Добро пожаловать обратно,</p><h1>${esc(profile.name || 'Пользователь')}!</h1></div>
      ${[['👁','Просмотрено',s.watched],['▶','Смотрю',s.watching],['▤','Планирую',s.plan],['✕','Брошено',s.drop],['❤','Любимое',s.fav]]
        .map(c => `<div class="card"><i>${c[0]}</i><span>${c[1]}</span><b>${c[2]}</b></div>`).join('')}
    </div>
    <section class="panel">
      <h2>Продолжить просмотр</h2>
      <div class="watch-grid">${continueWatching.map(watchCard).join('') || emptyState('Пока нечего продолжать')}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Мои аниме</h2>${listTools(genres)}</div>
      <div class="anime-list">${list.map(row).join('') || emptyState('Ничего не найдено')}</div>
    </section>
  </section>`;
}

function renderLibraryPage(title, extra) {
  const list = getList(extra);
  const genres = allGenres();
  return `<section class="left">
    <section class="panel">
      <div class="panel-head"><h2>${esc(title)}</h2>${listTools(genres)}</div>
      <div class="anime-list">${list.map(row).join('') || emptyState('Здесь пока пусто')}</div>
    </section>
  </section>`;
}

function renderSearchPage() {
  const list = getList();
  const genres = allGenres();
  return `<section class="left">
    <section class="panel">
      <div class="panel-head"><h2>Поиск</h2>${listTools(genres, true)}</div>
      <div class="anime-list">${q ? (list.map(row).join('') || emptyState('Ничего не найдено')) : emptyState('Введите название, чтобы начать поиск')}</div>
    </section>
  </section>`;
}

function listTools(genres, autofocus) {
  return `<div class="tools">
    <div class="searchbox">⌕ <input data-focus-id="search" ${autofocus ? 'autofocus' : ''} placeholder="Поиск аниме по названию..." value="${esc(q)}" oninput="q=this.value;render()"></div>
    <select onchange="genre=this.value;render()">${genres.map(g => `<option ${g === genre ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>
    <select onchange="status=this.value;render()"><option>Все статусы</option>${statuses.map(x => `<option ${x === status ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <select onchange="sort=this.value;render()"><option>Дата</option><option ${sort === 'Оценка' ? 'selected' : ''}>Оценка</option><option ${sort === 'Год' ? 'selected' : ''}>Год</option></select>
  </div>`;
}

function emptyState(text) {
  return `<div class="empty-state"><span class="big">🌙</span>${esc(text)}</div>`;
}

/* ---------- Stats page ---------- */
function renderStatsPage() {
  const s = stats();
  const lvl = levelInfo();
  const maxGenre = s.topGenres.length ? s.topGenres[0][1] : 1;
  return `<section class="left">
    <section class="panel">
      <h2>Статистика</h2>
      <div class="stats-grid">
        <div class="stat-block"><span>Уровень</span><b>Lvl ${lvl.level}</b></div>
        <div class="stat-block"><span>Всего аниме</span><b>${s.total}</b></div>
        <div class="stat-block"><span>Просмотрено</span><b>${s.watched}</b></div>
        <div class="stat-block"><span>Смотрю сейчас</span><b>${s.watching}</b></div>
        <div class="stat-block"><span>В планах</span><b>${s.plan}</b></div>
        <div class="stat-block"><span>Брошено</span><b>${s.drop}</b></div>
        <div class="stat-block"><span>Любимое</span><b>${s.fav}</b></div>
        <div class="stat-block"><span>Эпизодов просмотрено</span><b>${s.eps}</b></div>
        <div class="stat-block"><span>Общее время просмотра</span><b>${formatMinutes(s.totalMinutes)}</b></div>
        <div class="stat-block"><span>Средняя оценка</span><b>${s.avg}</b></div>
        <div class="stat-block"><span>Любимый жанр</span><b>${esc(s.favoriteGenre)}</b></div>
        <div class="stat-block"><span>Последнее добавленное</span><b>${esc(s.lastAdded)}</b></div>
      </div>
      <p class="subtitle">До следующего уровня: ${lvl.remaining} ${lvl.remaining === 1 ? 'аниме' : 'аниме'} (1 уровень = 2 полностью просмотренных аниме)</p>
    </section>
    <section class="panel">
      <h2>Жанры</h2>
      ${s.topGenres.length ? s.topGenres.map(([g, c]) => `<div class="bar-row"><span>${esc(g)}</span><div class="track"><div class="fill" style="width:${Math.round(c / maxGenre * 100)}%"></div></div><span>${c}</span></div>`).join('') : emptyState('Пока нет данных')}
    </section>
  </section>`;
}

/* ---------- Recently watched page ---------- */
function renderRecentPage() {
  const recent = anime
    .filter(a => a.status === 'Просмотрено')
    .sort((a, b) => {
      const da = parseRuDate(a.added), db = parseRuDate(b.added);
      if (da && db) return db - da;
      return b.id - a.id;
    })
    .slice(0, 5);
  return `<section class="left">
    <section class="panel">
      <h2>Новинки</h2>
      <div class="subtitle">5 последних полностью просмотренных аниме</div>
      <div class="watch-grid">${recent.map(watchCard).join('') || emptyState('Вы ещё не досмотрели ни одного аниме')}</div>
    </section>
  </section>`;
}

/* ---------- Export / Import page ---------- */
function renderExportPage() {
  return `<section class="left">
    <section class="panel">
      <h2>Экспорт / Импорт</h2>
      <div class="export-panel">
        <div class="export-card">
          <h3>Экспорт данных</h3>
          <p>Скачать всю вашу коллекцию аниме в виде JSON-файла — удобно для резервной копии или переноса на другое устройство.</p>
          <button class="btn primary" onclick="exportData()">⬇ Скачать JSON</button>
        </div>
        <div class="export-card">
          <h3>Импорт данных</h3>
          <p>Загрузите ранее сохранённый JSON-файл. Новые записи будут добавлены к вашей текущей коллекции.</p>
          <input class="file-input" type="file" accept="application/json" onchange="importData(this)">
        </div>
        <div class="export-card">
          <h3>Очистить коллекцию</h3>
          <p>Полностью удаляет все добавленные аниме. Это действие необратимо.</p>
          <button class="btn danger" onclick="clearAllAnime()">🗑 Очистить всё</button>
        </div>
      </div>
    </section>
  </section>`;
}

/* ---------- Settings page ---------- */
function renderSettingsPage() {
  return `<section class="left">
    <section class="panel">
      <h2>Настройки</h2>
      <form class="settings-form" onsubmit="saveSettings(event)">
        <div class="field">
          <label>Аватар</label>
          <div class="avatar-edit">
            <div class="avatar">${profile.avatar ? `<img src="${esc(profile.avatar)}" alt="">` : '👤'}</div>
            <div class="btn-row">
              <label class="btn">Загрузить фото<input type="file" accept="image/*" style="display:none" onchange="onAvatarFile(this)"></label>
              ${profile.avatar ? `<button type="button" class="btn danger" onclick="removeAvatar()">Удалить</button>` : ''}
            </div>
          </div>
          <span class="hint">Или укажите прямую ссылку на изображение:</span>
          <input type="url" placeholder="https://..." data-focus-id="avatarUrl" value="${profile.avatar && profile.avatar.startsWith('http') ? esc(profile.avatar) : ''}" oninput="onAvatarUrl(this.value)">
        </div>
        <div class="field">
          <label>Имя пользователя</label>
          <input name="name" data-focus-id="name" value="${esc(profile.name || '')}" placeholder="Ваше имя">
        </div>
        <div class="hint">Уровень профиля растёт автоматически: 1 Lvl = 2 полностью просмотренных аниме (статус «Просмотрено»). Отдельно настраивать его не нужно.</div>
        <div class="btn-row">
          <button type="submit" class="btn primary">Сохранить</button>
        </div>
      </form>
    </section>
  </section>`;
}

/* ---------- Cards / rows ---------- */
function poster(a, cls) {
  return `<img class="${cls || 'poster'}" src="${esc(a.poster)}" onerror="this.src='assets/Rias.png'" alt="">`;
}
function watchCard(a) {
  const pct = Math.min(100, (n(a.episodesWatched) / (n(a.episodesTotal) || n(a.episodesWatched) || 1)) * 100);
  const hasLink = !!a.watchUrl;
  const tag = hasLink ? 'a' : 'div';
  const linkAttrs = hasLink ? `href="${esc(a.watchUrl)}" target="_blank" title="Смотреть: ${esc(a.title)}"` : 'title="Ссылка не указана"';
  return `<${tag} class="watch ${hasLink ? '' : 'no-link'}" ${linkAttrs}>
    <div class="poster-wrap">${poster(a)}<span class="play">▶</span></div>
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.episodesWatched)}/${esc(a.episodesTotal)} серий</p>
    <div class="bar"><i style="width:${pct}%"></i></div>
  </${tag}>`;
}
function row(a) {
  return `<article class="row">
    ${poster(a)}
    <div>
      <h3>${esc(a.title)} <span>(${esc(a.original)})</span> <em>${esc(a.year)}</em></h3>
      <p>${(a.genres || []).join(', ')}</p>
      <div class="meta">
        <b class="status-dot">${esc(a.status)}</b>
        ${a.ageRating ? `<span class="age-badge">${esc(a.ageRating)}</span>` : ''}
        <span>Оценка: ${a.rating}</span>
        <span class="stars">${'★'.repeat(a.rating)}${'☆'.repeat(10 - a.rating)}</span>
        <span>Эпизоды: ${esc(a.episodesWatched)}/${esc(a.episodesTotal)}</span>
        ${a.seasons ? `<span>Сезонов: ${esc(a.seasons)}</span>` : ''}
        <span>Дата: ${esc(a.added)}</span>
      </div>
    </div>
    <div class="actions">
      <button onclick="fav(${a.id})" title="В избранное">${a.favorite ? '♥' : '♡'}</button>
      <a target="_blank" href="${a.watchUrl || '#'}" title="Смотреть">🔗</a>
      <button onclick="openModal(${a.id})" title="Редактировать">✎</button>
      <button onclick="delAnime(${a.id})" title="Удалить">🗑</button>
    </div>
  </article>`;
}

/* ---------- Navigation ---------- */
function nav(m) {
  if (m === 'Добавить аниме') { openModal(); return; }
  page = m;
  savePage();
  render();
  if (m === 'Поиск') {
    requestAnimationFrame(() => {
      const el = app.querySelector('[data-focus-id="search"]');
      if (el) el.focus();
    });
  }
}
function setTheme(t) { theme = t; saveTheme(); render(); }

/* ---------- Anime actions ---------- */
function fav(id) { anime = anime.map(a => a.id === id ? {...a, favorite: !a.favorite} : a); saveAnime(); render(); }
function delAnime(id) { if (confirm('Удалить аниме?')) { anime = anime.filter(a => a.id !== id); saveAnime(); render(); } }

function openModal(id) {
  const a = anime.find(x => x.id === id) || {
    title: '', original: '', year: new Date().getFullYear(), genres: [], status: 'Планирую',
    rating: 0, episodesWatched: 0, episodesTotal: 12, seasons: 1, ageRating: '12+', favorite: false, watchUrl: '',
    poster: 'posters/name.jpg', watchMinutes: null
  };
  const div = document.createElement('div');
  div.className = 'overlay';
  div.innerHTML = `<form class="modal" onsubmit="submitAnime(event,${id || 0})">
    <h2>${id ? 'Редактировать' : 'Добавить аниме'}</h2>
    <div class="field"><label>Название</label><input name="title" required placeholder="Название" value="${esc(a.title)}"></div>
    <div class="field"><label>Оригинальное название</label><input name="original" placeholder="Оригинальное название" value="${esc(a.original)}"></div>
    <div class="field"><label>Путь к постеру</label><input name="poster" placeholder="posters/dxd.jpg" value="${esc(a.poster)}"></div>
    <div class="field">
      <label>Ссылка где смотреть</label>
      <input name="watchUrl" placeholder="https://myanimelist.net/anime/... или любая другая" value="${esc(a.watchUrl)}">
      <span class="hint" data-autofill-status>По ссылке на MyAnimeList число серий подставится автоматически.</span>
    </div>
    <div class="field-grid">
      <div class="field"><label>Год</label><input name="year" type="number" placeholder="Год" value="${esc(a.year)}"></div>
      <div class="field"><label>Статус</label><select name="status">${statuses.map(x => `<option ${x === a.status ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Оценка (0–10)</label><input name="rating" type="number" min="0" max="10" placeholder="Оценка" value="${esc(a.rating)}"></div>
      <div class="field"><label>Возрастной рейтинг</label><select name="ageRating">${AGE_RATINGS.map(x => `<option ${x === a.ageRating ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Сезонов</label><input name="seasons" type="number" min="1" placeholder="1" value="${esc(a.seasons || 1)}"></div>
      <div class="field"><label>Эпизодов всего</label><input name="episodesTotal" placeholder="Эпизоды всего" value="${esc(a.episodesTotal)}"></div>
      <div class="field"><label>Эпизодов просмотрено</label><input name="episodesWatched" type="number" min="0" placeholder="Просмотрено серий" value="${esc(a.episodesWatched)}"></div>
      <div class="field"><label>Общее время просмотра (мин)</label><input name="watchMinutes" type="number" min="0" placeholder="Авто, если пусто" value="${a.watchMinutes != null ? esc(a.watchMinutes) : ''}"></div>
    </div>
    <div class="field"><label>Жанры (через запятую)</label><input name="genres" placeholder="Экшен, Фэнтези" value="${(a.genres || []).join(', ')}"></div>
    <label class="field checkbox-field"><input name="favorite" type="checkbox" ${a.favorite ? 'checked' : ''}> Добавить в избранное</label>
    <div class="modalBtns">
      <button type="button" onclick="this.closest('.overlay').remove()">Закрыть</button>
      <button>Сохранить</button>
    </div>
  </form>`;
  document.body.appendChild(div);
  const first = div.querySelector('input[name="title"]');
  if (first) first.focus();
  wireAutofill(div);
}

/* ---------- Auto-fill episodes/title from a watch link (Jikan / MyAnimeList public API) ---------- */
function wireAutofill(root) {
  const urlInput = root.querySelector('input[name="watchUrl"]');
  const titleInput = root.querySelector('input[name="title"]');
  const statusEl = root.querySelector('[data-autofill-status]');
  if (urlInput) urlInput.addEventListener('blur', () => tryAutofillFromUrl(root, statusEl));
  if (titleInput) titleInput.addEventListener('blur', () => {
    const epField = root.querySelector('input[name="episodesTotal"]');
    if (titleInput.value.trim() && epField && !epField.value) tryAutofillFromTitle(root, statusEl);
  });
}
async function tryAutofillFromUrl(root, statusEl) {
  const urlInput = root.querySelector('input[name="watchUrl"]');
  const url = urlInput.value.trim();
  const m = /myanimelist\.net\/anime\/(\d+)/.exec(url);
  if (!m) return;
  setAutofillStatus(statusEl, 'Ищу информацию об аниме...');
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${m[1]}`);
    if (!res.ok) throw new Error('bad response');
    const json = await res.json();
    applyAutofillData(root, json.data, statusEl);
  } catch (err) {
    setAutofillStatus(statusEl, 'Не удалось получить данные автоматически — заполните вручную.');
  }
}
async function tryAutofillFromTitle(root, statusEl) {
  const titleInput = root.querySelector('input[name="title"]');
  const q = titleInput.value.trim();
  if (!q) return;
  setAutofillStatus(statusEl, 'Ищу информацию об аниме...');
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`);
    if (!res.ok) throw new Error('bad response');
    const json = await res.json();
    const data = json.data && json.data[0];
    if (!data) { setAutofillStatus(statusEl, 'Ничего не найдено — заполните вручную.'); return; }
    applyAutofillData(root, data, statusEl);
  } catch (err) {
    setAutofillStatus(statusEl, 'Не удалось получить данные автоматически — заполните вручную.');
  }
}
function applyAutofillData(root, data, statusEl) {
  if (!data) { setAutofillStatus(statusEl, 'Ничего не найдено — заполните вручную.'); return; }
  const epField = root.querySelector('input[name="episodesTotal"]');
  const yearField = root.querySelector('input[name="year"]');
  const origField = root.querySelector('input[name="original"]');
  if (epField && data.episodes) epField.value = data.episodes;
  if (yearField && !yearField.value && data.year) yearField.value = data.year;
  if (origField && !origField.value && data.title) origField.value = data.title;
  setAutofillStatus(statusEl, data.episodes ? `Найдено: ${data.episodes} серий.` : 'Найдено, но число серий неизвестно — уточните вручную.');
}
function setAutofillStatus(statusEl, text) {
  if (statusEl) statusEl.textContent = text;
}

function submitAnime(e, id) {
  e.preventDefault();
  const f = e.target;
  const watchMinutesRaw = f.watchMinutes.value;
  const data = {
    id: id || Date.now(),
    title: f.title.value,
    original: f.original.value,
    year: +f.year.value,
    genres: f.genres.value.split(',').map(x => x.trim()).filter(Boolean),
    status: f.status.value,
    rating: +f.rating.value,
    ageRating: f.ageRating.value,
    seasons: +f.seasons.value || 1,
    episodesWatched: +f.episodesWatched.value,
    episodesTotal: f.episodesTotal.value,
    favorite: f.favorite.checked,
    watchUrl: f.watchUrl.value,
    poster: f.poster.value,
    watchMinutes: watchMinutesRaw === '' ? null : +watchMinutesRaw,
    added: id ? (anime.find(a => a.id === id)?.added || new Date().toLocaleDateString('ru-RU')) : new Date().toLocaleDateString('ru-RU')
  };
  anime = id ? anime.map(a => a.id === id ? data : a) : [data, ...anime];
  saveAnime();
  document.querySelector('.overlay').remove();
  render();
}

/* ---------- Settings actions ---------- */
function onAvatarFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { profile = {...profile, avatar: reader.result}; render(); };
  reader.readAsDataURL(file);
}
function onAvatarUrl(url) { profile = {...profile, avatar: url}; }
function removeAvatar() { profile = {...profile, avatar: ''}; render(); }
function saveSettings(e) {
  e.preventDefault();
  const f = e.target;
  profile = {...profile, name: f.name.value.trim() || 'Пользователь'};
  saveProfile();
  render();
}

/* ---------- Export / Import actions ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(anime, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'yoru-hub-export.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function importData(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('bad format');
      const existingIds = new Set(anime.map(a => a.id));
      const incoming = parsed.map(item => {
        let id = item.id;
        while (existingIds.has(id)) id = Date.now() + Math.floor(Math.random() * 1000);
        existingIds.add(id);
        return {...item, id};
      });
      anime = [...incoming, ...anime];
      saveAnime();
      render();
      alert(`Импортировано записей: ${incoming.length}`);
    } catch (err) {
      alert('Не удалось прочитать файл. Убедитесь, что это корректный JSON-экспорт.');
    }
  };
  reader.readAsText(file);
  input.value = '';
}
function clearAllAnime() {
  if (confirm('Удалить всю коллекцию аниме без возможности восстановления?')) {
    anime = [];
    saveAnime();
    render();
  }
}

/* ---------- Init ---------- */
render();
