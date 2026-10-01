/* Shared URL contract for directory navigation. No network or DOM dependencies. */
globalThis.DirectoryRoutes = (() => {
  const defaults = {
    section: 'discover',
    sport: 'all',
    programId: null,
    grantId: null,
    db: 'programs',
    dbView: 'gallery',
    grantAudience: 'all',
    q: '',
    dist: 'any',
    cost: 'any',
    level: 'any',
    layout: 'grid',
    sort: 'rec',
    see: null,
    nearZip: '',
    nearCity: '',
    near: null
  };
  const params = {
    q: 'q',
    dist: 'dist',
    cost: 'cost',
    level: 'level',
    layout: 'layout',
    sort: 'sort',
    see: 'see',
    nearZip: 'zip',
    nearCity: 'city',
    dbView: 'view',
    grantAudience: 'audience'
  };
  const tables = ['sports', 'programs', 'providers', 'events', 'equipment', 'grants', 'resources'];
  function read(url, sports) {
    const s = { ...defaults };
    const path = url.pathname.replace(/\/$/, '');
    const parts = path.split('/').filter(Boolean);
    const qp = url.searchParams;
    for (const [key, param] of Object.entries(params)) if (qp.has(param)) s[key] = qp.get(param);
    const sport = parts[0] === 'sports' && parts[1] ? parts[1] : qp.get('sport');
    if (sports.includes(sport)) s.sport = sport;
    if (parts[0] === 'programs' && parts[1]) { s.section = 'program'; s.programId = parts[1]; }
    else if (parts[0] === 'grants' && parts[1]) { s.section = 'grant'; s.grantId = parts[1]; }
    else if (path === '/maps') s.section = 'mapx';
    else if (path === '/events') s.section = 'events';
    else if (path === '/profile' || qp.has('profile')) s.section = 'profile';
    else if (path === '/grants') { s.section = 'database'; s.db = 'grants'; }
    else if (parts[0] === 'directory' || qp.has('db')) {
      s.section = 'database';
      const db = parts[1] || qp.get('db');
      if (tables.includes(db)) s.db = db;
    }
    return s;
  }
  function write(s) {
    if (s.section === 'program' && s.programId) return '/programs/' + encodeURIComponent(s.programId);
    if (s.section === 'grant' && s.grantId) return '/grants/' + encodeURIComponent(s.grantId);
    let path = '/';
    if (s.section === 'mapx') path = '/maps';
    else if (s.section === 'events') path = '/events';
    else if (s.section === 'profile') path = '/profile';
    else if (s.section === 'database') path = s.db === 'grants' ? '/grants' : '/directory/' + encodeURIComponent(s.db);
    else if (s.sport && s.sport !== 'all') path = '/sports/' + encodeURIComponent(s.sport);
    const qp = new URLSearchParams();
    if (['discover', 'mapx', 'database'].includes(s.section)) {
      if (s.section !== 'discover' && s.sport !== 'all') qp.set('sport', s.sport);
      for (const [key, param] of Object.entries(params)) {
        if (s[key] != null && s[key] !== '' && s[key] !== defaults[key]) qp.set(param, s[key]);
      }
    }
    return path + (qp.size ? '?' + qp : '');
  }
  return { read, write };
})();
