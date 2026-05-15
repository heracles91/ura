// Shared birthday target — countdown unlock & celebration trigger
window.URA_BIRTHDAY_TS = new Date("2026-05-17T00:00:00+02:00").getTime();

// Member shape mapping — design element not stored in Supabase
window.SHAPE_MAP = {
  kevin:    'square',
  yuan:     'circle',
  alexis:   'triangle',
  ayoub:    'hexagon',
  anton:    'diamond',
  marc:     'star',
  theo:     'pentagon',
  giovanni: 'octagon',
};

window.MEMBERS = [];

function _mapMember(row) {
  var shape  = window.SHAPE_MAP[row.slug] || 'circle';
  var handle = (row.slug || '').replace(/_/g, '.');
  var xpFrac = row.max_xp > 0 ? Math.min(1, (row.xp || 0) / row.max_xp) : 0;
  var joinDate = row.join_date
    ? new Date(row.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'May 2021';
  return {
    id:         row.slug,
    name:       row.name,
    handle:     handle,
    color:      row.color  || '#E14B3A',
    shape:      shape,
    title:      row.role   || '—',
    level:      row.level  || 1,
    xp:         xpFrac,
    joined:     joinDate,
    bio:        row.bio    || '',
    strengths:  row.strengths  || [],
    weaknesses: row.weaknesses || [],
    stats: {
      messages: row.message_count || 0,
      vc_hours: Math.round(row.voice_hours || 0),
      memes:    0,
    },
    catch: row.speech_bubble || '…',
  };
}

// Load members from Supabase; resolves once window.MEMBERS is populated
window.membersReady = window._supa
  .from('members')
  .select('*')
  .order('sort_order', { ascending: true })
  .then(function(res) {
    if (res.error) {
      console.error('[URA12] members load error:', res.error.message);
      return;
    }
    window.MEMBERS = res.data.map(_mapMember);
  });

// Member image resolver — picks the matching PNG in /images for a member
// kind = 'pdp' (profile picture) or 'full' (full body)
window.MEMBER_IMG_KEYS = ['kevin','yuan','alexis','ayoub','anton','marc','theo','giovanni'];
window.memberImg = function(m, kind) {
  if (!m) return null;
  var cands = [
    m.id,
    String(m.name || '').toLowerCase().split(/[\s._-]+/)[0],
    String(m.id   || '').split(/[._-]/)[0],
  ];
  for (var i = 0; i < cands.length; i++) {
    var c = cands[i];
    if (c && window.MEMBER_IMG_KEYS.indexOf(c) !== -1) return 'images/' + c + '_' + kind + '.png';
  }
  return 'images/' + m.id + '_' + kind + '.png';
};

// Shape SVG renderer — used for stickers AND avatars consistently
window.shapeSvg = function(shape, color, size) {
  size = size || 80;
  var s = size;
  var cx = s / 2, cy = s / 2;
  var path = '';
  if (shape === 'square') {
    path = '<rect x="' + (s*0.12) + '" y="' + (s*0.12) + '" width="' + (s*0.76) + '" height="' + (s*0.76) + '" rx="' + (s*0.08) + '"/>';
  } else if (shape === 'circle') {
    path = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (s*0.40) + '"/>';
  } else if (shape === 'triangle') {
    path = '<polygon points="' + cx + ',' + (s*0.10) + ' ' + (s*0.92) + ',' + (s*0.86) + ' ' + (s*0.08) + ',' + (s*0.86) + '"/>';
  } else if (shape === 'hexagon') {
    var r = s*0.42;
    var pts = Array.from({length:6}, function(_,i) {
      var a = Math.PI/3 * i + Math.PI/6;
      return (cx + r*Math.cos(a)) + ',' + (cy + r*Math.sin(a));
    }).join(' ');
    path = '<polygon points="' + pts + '"/>';
  } else if (shape === 'diamond') {
    path = '<polygon points="' + cx + ',' + (s*0.08) + ' ' + (s*0.92) + ',' + cy + ' ' + cx + ',' + (s*0.92) + ' ' + (s*0.08) + ',' + cy + '"/>';
  } else if (shape === 'star') {
    var R = s*0.42, ri = s*0.18, n = 5;
    var spts = [];
    for (var i = 0; i < n*2; i++) {
      var ang = (Math.PI/n)*i - Math.PI/2;
      var rad = i % 2 === 0 ? R : ri;
      spts.push((cx + rad*Math.cos(ang)) + ',' + (cy + rad*Math.sin(ang)));
    }
    path = '<polygon points="' + spts.join(' ') + '"/>';
  } else if (shape === 'pentagon') {
    var rp = s*0.42;
    var ppts = Array.from({length:5}, function(_,i) {
      var a = (Math.PI*2/5)*i - Math.PI/2;
      return (cx + rp*Math.cos(a)) + ',' + (cy + rp*Math.sin(a));
    }).join(' ');
    path = '<polygon points="' + ppts + '"/>';
  } else if (shape === 'octagon') {
    var ro = s*0.42;
    var opts = Array.from({length:8}, function(_,i) {
      var a = (Math.PI/4)*i + Math.PI/8;
      return (cx + ro*Math.cos(a)) + ',' + (cy + ro*Math.sin(a));
    }).join(' ');
    path = '<polygon points="' + opts + '"/>';
  }
  var gid   = 'g-'   + shape + '-' + color.slice(1);
  var gloss = 'gloss-' + shape + '-' + color.slice(1);
  return '\n    <svg viewBox="0 0 ' + s + ' ' + s + '" width="' + s + '" height="' + s + '" xmlns="http://www.w3.org/2000/svg">\n      <defs>\n        <linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">\n          <stop offset="0%"   stop-color="' + color + '" stop-opacity="1"/>\n          <stop offset="55%"  stop-color="' + color + '" stop-opacity="0.9"/>\n          <stop offset="100%" stop-color="#1A1612" stop-opacity="0.55"/>\n        </linearGradient>\n        <radialGradient id="' + gloss + '" cx="0.35" cy="0.28" r="0.5">\n          <stop offset="0%"   stop-color="white" stop-opacity="0.65"/>\n          <stop offset="100%" stop-color="white" stop-opacity="0"/>\n        </radialGradient>\n      </defs>\n      <g fill="url(#' + gid + ')" stroke="#1A1612" stroke-width="2.5" stroke-linejoin="round">' + path + '</g>\n      <g fill="url(#' + gloss + ')" stroke="none" style="pointer-events:none">' + path + '</g>\n    </svg>\n  ';
};
