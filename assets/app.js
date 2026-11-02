(function () {
  'use strict';

  var TZ = 'Asia/Shanghai';
  var WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  var els = {
    dayList: document.getElementById('day-list'),
    dayCount: document.getElementById('day-count'),
    entry: document.getElementById('entry'),
    search: document.getElementById('search'),
    todayLine: document.getElementById('today-line'),
    menuToggle: document.getElementById('menu-toggle'),
    scrim: document.getElementById('scrim'),
    sidebar: document.getElementById('sidebar')
  };

  var days = [];
  var currentDate = null;

  function shanghaiNow() {
    var parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      weekday: 'long', hour: '2-digit', minute: '2-digit'
    }).formatToParts(new Date());
    var get = function (type) {
      var p = parts.find(function (x) { return x.type === type; });
      return p ? p.value : '';
    };
    var weekdayEn = get('weekday');
    var weekday = WEEKDAYS.find(function (w) { return weekdayEn.indexOf(w.slice(2)) === 0; }) || weekdayEn;
    return {
      date: get('year') + '-' + get('month') + '-' + get('day'),
      weekday: weekday,
      time: get('hour') + ':' + get('minute')
    };
  }

  function todayInShanghai() {
    return shanghaiNow().date;
  }

  function weekdayOf(dateStr) {
    var m = dateStr.split('-');
    var d = new Date(Number(m[0]), Number(m[1]) - 1, Number(m[2]));
    return isNaN(d) ? '' : WEEKDAYS[d.getDay()];
  }

  function routeDate() {
    var m = location.hash.match(/^#\/(\d{4}-\d{2}-\d{2})$/);
    return m ? m[1] : null;
  }

  function stripFrontMatter(text) {
    if (text.startsWith('---')) {
      var end = text.indexOf('\n---', 3);
      if (end !== -1) return text.slice(text.indexOf('\n', end + 1) + 1);
    }
    return text;
  }

  function renderSidebar(filter) {
    var q = (filter || '').trim().toLowerCase();
    var visible = q
      ? days.filter(function (d) {
          return (d.title + ' ' + d.date + ' ' + (d.summary || '')).toLowerCase().indexOf(q) !== -1;
        })
      : days;

    var html = [];
    var lastMonth = '';
    visible.forEach(function (d) {
      var month = d.date.slice(0, 7);
      if (month !== lastMonth) {
        lastMonth = month;
        html.push('<div class="month-label">' + month.replace('-', ' 年 ') + ' 月</div>');
      }
      var classes = ['day-item'];
      if (d.date === currentDate) classes.push('active');
      if (d.date === todayInShanghai()) classes.push('today');
      html.push(
        '<a class="' + classes.join(' ') + '" href="#/' + d.date + '">' +
        '<span class="day-date">' + d.date + ' <span class="day-week">' + weekdayOf(d.date) + '</span></span>' +
        '<span class="day-title">' + (d.title || '（无标题）') + '</span>' +
        '</a>'
      );
    });

    els.dayList.innerHTML = html.length ? html.join('') : '<div class="list-empty">没有匹配的日记</div>';
    els.dayCount.textContent = '共 ' + days.length + ' 篇';
  }

  function showEntry(html) {
    els.entry.innerHTML = html;
  }

  function renderEntry(day, text) {
    var meta = [];
    if (day.weather) meta.push('<span>🌤 ' + day.weather + '</span>');
    if (day.mood) meta.push('<span>🙂 ' + day.mood + '</span>');
    meta.push('<span>' + weekdayOf(day.date) + '</span>');

    showEntry(
      '<header class="entry-header">' +
      '<h2 class="entry-title">' + (day.title || day.date) + '</h2>' +
      '<div class="entry-meta">' + meta.join('') + '</div>' +
      '</header>' +
      '<div class="entry-body">' + window.MiniMarkdown.render(text) + '</div>'
    );
    document.title = day.date + ' · Rayu 的日记';
  }

  function showError(date) {
    showEntry(
      '<div class="entry-empty">没有找到 ' + date + ' 的日记</div>'
    );
    document.title = 'Rayu 的日记';
  }

  function loadDay(date) {
    currentDate = date;
    renderSidebar(els.search.value);
    showEntry('<div class="entry-empty">加载中…</div>');
    fetch('diary/' + date + '.md')
      .then(function (res) {
        if (!res.ok) throw new Error('not found');
        return res.text();
      })
      .then(function (text) {
        var day = days.find(function (d) { return d.date === date; }) || { date: date, title: date };
        renderEntry(day, stripFrontMatter(text));
      })
      .catch(function () {
        showError(date);
      });
  }

  function onRoute() {
    var date = routeDate();
    if (date) {
      loadDay(date);
    } else if (days.length) {
      location.replace('#/' + days[0].date);
    } else {
      showEntry('<div class="entry-empty">还没有任何日记</div>');
    }
    if (document.body.classList.contains('sidebar-open')) closeSidebar();
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    els.scrim.hidden = true;
    els.menuToggle.setAttribute('aria-expanded', 'false');
  }

  els.menuToggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('sidebar-open');
    els.scrim.hidden = !open;
    els.menuToggle.setAttribute('aria-expanded', String(open));
    if (open) els.search.focus();
  });
  els.scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      closeSidebar();
      els.menuToggle.focus();
    }
  });
  els.search.addEventListener('input', function () {
    renderSidebar(els.search.value);
  });
  window.addEventListener('hashchange', onRoute);

  var now = shanghaiNow();
  els.todayLine.textContent = now.date + ' ' + now.weekday + ' ' + now.time + '（北京时间）';
  setInterval(function () {
    var n = shanghaiNow();
    els.todayLine.textContent = n.date + ' ' + n.weekday + ' ' + n.time + '（北京时间）';
  }, 30000);

  fetch('manifest.json')
    .then(function (res) {
      if (!res.ok) throw new Error('manifest');
      return res.json();
    })
    .then(function (manifest) {
      days = (manifest.days || []).slice().sort(function (a, b) {
        return b.date.localeCompare(a.date);
      });
      onRoute();
    })
    .catch(function () {
      els.dayList.innerHTML = '<div class="list-empty">manifest.json 加载失败</div>';
      showEntry('<div class="entry-empty">日记数据加载失败</div>');
    });
})();
