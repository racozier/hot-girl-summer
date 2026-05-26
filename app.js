'use strict';

// ════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════

const PROGRAM_DAYS = 84;
const WEEKS = 12;

const WORKOUT_SCHEDULE = {
  1: [ // Monday
    { id: 'cf',   label: 'CrossFit', cat: 'cf' },
    { id: 'yoga', label: 'Yoga',     cat: 'yoga' }
  ],
  2: [ // Tuesday
    { id: 'yoga_am', label: 'Yoga AM', cat: 'yoga' },
    { id: 'dance',   label: 'Dance',   cat: 'other' }
  ],
  3: [ // Wednesday
    { id: 'cf',   label: 'CrossFit', cat: 'cf' },
    { id: 'yoga', label: 'Yoga',     cat: 'yoga' }
  ],
  4: [ // Thursday
    { id: 'yoga_am',  label: 'Yoga AM',  cat: 'yoga' },
    { id: 'bootcamp', label: 'Bootcamp', cat: 'other' }
  ],
  5: [ // Friday
    { id: 'cf',   label: 'CrossFit', cat: 'cf' },
    { id: 'yoga', label: 'Yoga',     cat: 'yoga' }
  ],
  6: [ // Saturday
    { id: 'walk', label: '6-Mile Walk', cat: 'other' }
  ],
  0: [ // Sunday
    { id: 'yoga', label: 'Yoga', cat: 'yoga' }
  ]
};

const PHASES = [
  { name: 'Foundation', weeks: '1–4',  startWeek: 1, endWeek: 4  },
  { name: 'Build',      weeks: '5–8',  startWeek: 5, endWeek: 8  },
  { name: 'Peak',       weeks: '9–12', startWeek: 9, endWeek: 12 }
];

const QUOTES = [
  "She remembered who she was and the game changed.",
  "Protect your energy. You're building something rare.",
  "Discipline is the bridge between goals and accomplishment.",
  "You didn't come this far to only come this far.",
  "Progress, not perfection.",
  "The body achieves what the mind believes.",
  "Every morning is a chance to get better.",
  "She believed she could, so she did.",
  "Your only limit is your mind.",
  "Consistency over intensity. Show up every day.",
  "Make yourself a priority.",
  "Be the girl who decided to go for it.",
  "The comeback is always stronger than the setback.",
  "One day or day one. You decide.",
  "The best project you'll ever work on is you.",
  "Fall in love with taking care of yourself.",
  "Don't stop when you're tired. Stop when you're done.",
  "You are stronger than you think.",
  "Nothing will work unless you do.",
  "Rise up. Start fresh. See the bright opportunity in each new day.",
  "She is clothed in strength and dignity.",
  "Dream big. Work hard. Stay focused.",
  "She turned her can'ts into cans and her dreams into plans.",
  "Invest in yourself. It pays the best interest.",
  "Strong women don't have attitudes. We have standards.",
  "Be a girl with a mind, a woman with attitude, and a lady with class.",
  "Make your body your best outfit.",
  "Good things come to those who sweat.",
  "The secret of getting ahead is getting started.",
  "Success is liking yourself, liking what you do, and liking how you do it.",
  "Your health is your wealth.",
  "Sweat, smile, repeat.",
  "Hot girl summer is a mindset.",
  "You are your own competition.",
  "She is not afraid of hard work. She is afraid of a life unlived."
];

// ════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════

const KEY = {
  START:      'hgs_start',
  WORKOUTS:   'hgs_workouts',
  SLEEP:      'hgs_sleep',
  BOOKS:      'hgs_books',
  REFLECTIONS:'hgs_reflect',
  ONBOARDED:  'hgs_onboarded',
  NOTIF:      'hgs_notif',
  NOTIF_DATE: 'hgs_notif_date'
};

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

let state = {
  startDate: null,
  workouts: {},
  sleep: {},
  books: [],
  reflections: {},
  notifEnabled: false,
  currentTab: 'challenge',
  challengeView: 'day',
  trackerSelectedDate: null,
  viewedWeekOffset: 0    // offset from current week for week view navigation
};

const DEFAULT_BOOKS = [
  { title: 'Atomic Habits',          startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'The 5 AM Club',          startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'You Are a Badass',       startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'Untamed',                startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'The Power of Now',       startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'Girl, Stop Apologizing', startDate: null, finishDate: null, completed: false, notes: [] },
];

function loadState() {
  state.startDate            = load(KEY.START, null);
  state.workouts             = load(KEY.WORKOUTS, {});
  state.sleep                = load(KEY.SLEEP, {});
  state.books                = load(KEY.BOOKS, null);
  state.reflections          = load(KEY.REFLECTIONS, {});
  state.notifEnabled         = load(KEY.NOTIF, false);
  state.trackerSelectedDate  = todayStr();
  state.challengeSelectedDate = todayStr();
  state.daySchedOpen         = true;

  // Seed default books on first run
  if (!state.books) {
    state.books = DEFAULT_BOOKS.map((b, i) => ({ ...b, id: `default_${i}` }));
    save(KEY.BOOKS, state.books);
  }
  // Ensure every book has a notes array (migration)
  state.books.forEach(b => { if (!b.notes) b.notes = []; });
}

function persist() {
  save(KEY.WORKOUTS, state.workouts);
  save(KEY.SLEEP, state.sleep);
  save(KEY.BOOKS, state.books);
  save(KEY.REFLECTIONS, state.reflections);
}

// ════════════════════════════════════════
// DATE UTILS
// ════════════════════════════════════════

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function dateToStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function strToDate(s) {
  // Parse without timezone offset issues
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(dateStr, n) {
  const d = strToDate(dateStr);
  d.setDate(d.getDate() + n);
  return dateToStr(d);
}

function dayOfWeek(dateStr) {
  // returns 0=Sun,1=Mon,...,6=Sat
  return strToDate(dateStr).getDay();
}

function programDay(dateStr) {
  if (!state.startDate) return 1;
  const start = strToDate(state.startDate);
  const current = strToDate(dateStr);
  const diff = Math.floor((current - start) / 86400000) + 1;
  return diff;
}

function programWeek(dateStr) {
  return Math.min(Math.max(Math.ceil(programDay(dateStr) / 7), 1), WEEKS);
}

function currentPhase(dateStr) {
  const week = programWeek(dateStr);
  if (week <= 4) return PHASES[0];
  if (week <= 8) return PHASES[1];
  return PHASES[2];
}

function getWeekStart(dateStr) {
  // Week starts on Monday
  const d = strToDate(dateStr);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return dateToStr(d);
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function formatDateLabel(dateStr) {
  const d = strToDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
}

function formatShortDate(dateStr) {
  const d = strToDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonday(dateStr) {
  const d = strToDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return dateToStr(d);
}

// ════════════════════════════════════════
// WORKOUT UTILS
// ════════════════════════════════════════

function scheduleForDate(dateStr) {
  const dow = dayOfWeek(dateStr);
  return WORKOUT_SCHEDULE[dow] || [];
}

function workoutDataForDate(dateStr) {
  return state.workouts[dateStr] || {};
}

function isWorkoutComplete(dateStr, workoutId) {
  return !!(workoutDataForDate(dateStr)[workoutId]?.done);
}

function logWorkout(dateStr, workoutId, feel) {
  if (!state.workouts[dateStr]) state.workouts[dateStr] = {};
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  state.workouts[dateStr][workoutId] = { done: true, time: timeStr, feel };
  persist();
}

function unlogWorkout(dateStr, workoutId) {
  if (state.workouts[dateStr]) {
    delete state.workouts[dateStr][workoutId];
    if (Object.keys(state.workouts[dateStr]).length === 0) delete state.workouts[dateStr];
  }
  persist();
}

// Day completion status: 'complete', 'partial', 'none', 'future', 'rest'
function dayStatus(dateStr) {
  const today = todayStr();
  const sched = scheduleForDate(dateStr);
  if (sched.length === 0) return 'rest';
  if (dateStr > today) return 'future';
  const data = workoutDataForDate(dateStr);
  const done = sched.filter(w => data[w.id]?.done).length;
  if (done === 0) return 'none';
  if (done === sched.length) return 'complete';
  return 'partial';
}

// Returns CSS class for workout circle based on completed categories
const CAT_ORDER = ['cf', 'yoga', 'other'];

function circleClass(dateStr) {
  const today = todayStr();
  if (dateStr > today) return 'future';
  if (state.startDate && dateStr < state.startDate) return 'future';

  const sched = scheduleForDate(dateStr);
  if (!sched.length) return 'rest';

  const data = workoutDataForDate(dateStr);
  const doneCats = [...new Set(sched.filter(w => data[w.id]?.done).map(w => w.cat))];

  if (!doneCats.length) return dateStr < today ? 'missed' : '';
  if (doneCats.length === 1) return `cat-${doneCats[0]}`;
  if (doneCats.length === 2) {
    // Use fixed category order so CSS class always matches: cf → yoga → other
    const sorted = doneCats.sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b));
    return `split-${sorted.join('-')}`;
  }
  return 'triple';
}

function getCurrentStreak() {
  let streak = 0;
  let d = todayStr();
  // If today has no logs yet, start from yesterday
  const todaySched = scheduleForDate(d);
  const todayDone = todaySched.filter(w => isWorkoutComplete(d, w.id)).length;
  if (todayDone === 0 && todaySched.length > 0) d = addDays(d, -1);

  for (let i = 0; i < PROGRAM_DAYS; i++) {
    const sched = scheduleForDate(d);
    if (sched.length === 0) { d = addDays(d, -1); continue; } // skip rest days
    const done = sched.filter(w => isWorkoutComplete(d, w.id)).length;
    if (done > 0) { streak++; d = addDays(d, -1); }
    else break;
  }
  return streak;
}

function totalSessionsCompleted() {
  let total = 0;
  if (!state.startDate) return 0;
  let d = state.startDate;
  const today = todayStr();
  while (d <= today) {
    const sched = scheduleForDate(d);
    sched.forEach(w => { if (isWorkoutComplete(d, w.id)) total++; });
    d = addDays(d, 1);
  }
  return total;
}

// ════════════════════════════════════════
// SLEEP UTILS
// ════════════════════════════════════════

function calcSleepHours(bedtime, waketime) {
  if (!bedtime || !waketime) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = waketime.split(':').map(Number);
  let bedMins = bh * 60 + bm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= bedMins) wakeMins += 1440; // next day
  return ((wakeMins - bedMins) / 60).toFixed(1);
}

function sleepColorClass(hours) {
  if (!hours) return '';
  const h = parseFloat(hours);
  if (h >= 8) return 'green';
  if (h >= 7) return 'yellow';
  return 'red';
}

function saveSleepLog(dateStr, quality, bedtime, waketime) {
  const hours = calcSleepHours(bedtime, waketime);
  state.sleep[dateStr] = { quality, bedtime, waketime, hours };
  persist();
}

// ════════════════════════════════════════
// WEEKLY STATS
// ════════════════════════════════════════

function weeklyWorkoutPct(weekStart) {
  const days = getWeekDays(weekStart);
  const today = todayStr();
  let scheduled = 0, completed = 0;
  days.forEach(d => {
    if (d > today) return;
    if (state.startDate && d < state.startDate) return; // exclude pre-program days
    const sched = scheduleForDate(d);
    scheduled += sched.length;
    sched.forEach(w => { if (isWorkoutComplete(d, w.id)) completed++; });
  });
  if (!scheduled) return 0;
  return Math.round((completed / scheduled) * 100);
}

function weeklySleepPct(weekStart) {
  const days = getWeekDays(weekStart);
  const today = todayStr();
  let logged = 0;
  const validDays = days.filter(d => d <= today && (!state.startDate || d >= state.startDate));
  validDays.forEach(d => {
    const s = state.sleep[d];
    if (s && parseFloat(s.hours) >= 7) logged++;
  });
  if (!validDays.length) return 0;
  return Math.round((logged / validDays.length) * 100);
}

function weeklyBreakdown(weekStart) {
  const days = getWeekDays(weekStart);
  const today = todayStr();
  const counts = { cf: 0, yoga: 0, other: 0 };
  days.forEach(d => {
    if (d > today) return;
    const sched = scheduleForDate(d);
    const data = workoutDataForDate(d);
    sched.forEach(w => {
      if (data[w.id]?.done) counts[w.cat]++;
    });
  });
  return counts;
}

// ════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════

async function requestNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function checkAndFireNotifications() {
  if (!state.notifEnabled) return;
  if (Notification.permission !== 'granted') return;

  const today = todayStr();
  const lastDate = load(KEY.NOTIF_DATE, null);
  if (lastDate === today) return;

  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const timeInMins = hour * 60 + min;

  // 5:30 AM morning notification window: 5:30–9:00
  if (timeInMins >= 330 && timeInMins < 540) {
    const day = programDay(today);
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const dayLabel = day >= 1 && day <= PROGRAM_DAYS ? `Day ${day} of ${PROGRAM_DAYS}` : 'Your Challenge';
    fireNotification(
      `Good Morning Hot Girl! 🌅 ${dayLabel}`,
      quote,
      'morning'
    );
    save(KEY.NOTIF_DATE, today);
  }
}

function checkCheckinNotification() {
  if (!state.notifEnabled) return;
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const timeInMins = hour * 60 + min;

  // 7:30 AM check-in window
  const today = todayStr();
  const checkinKey = 'hgs_checkin_' + today;
  if (load(checkinKey, false)) return;

  if (timeInMins >= 450 && timeInMins < 600) {
    const sched = scheduleForDate(today);
    if (sched.length > 0) {
      const names = sched.map(w => w.label).join(' & ');
      fireNotification(
        "Check-in Time! 💪",
        `Don't forget: ${names} today. You've got this!`,
        'checkin'
      );
      save(checkinKey, true);
    }
  }
}

function fireNotification(title, body, tag) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag });
  } else if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png', tag });
  }
}

// ════════════════════════════════════════
// RENDER – CHALLENGE TAB
// ════════════════════════════════════════

function renderChallengeTab() {
  const today = todayStr();
  const day = programDay(today);
  const week = programWeek(today);
  const phase = currentPhase(today);

  document.getElementById('phase-badge').textContent = `PHASE ${PHASES.indexOf(phase) + 1} · ${phase.name.toUpperCase()}`;
  document.getElementById('day-counter').innerHTML = `${Math.max(1, Math.min(day, PROGRAM_DAYS))} <span>/ ${PROGRAM_DAYS}</span>`;
  document.getElementById('day-label').textContent = `Week ${week} of ${WEEKS}`;

  renderDayViewInChallenge();
  renderWeekViewInChallenge();
  renderBreakdown();
}

// Shared schedule checklist — used by both day view and week view
function renderDaySchedule(dateStr, listEl) {
  const sched = scheduleForDate(dateStr);
  const data = workoutDataForDate(dateStr);
  const today = todayStr();
  const isFuture = dateStr > today;

  if (!sched.length) {
    listEl.innerHTML = `<div class="sched-rest">&#x1F60C; Rest day — you've earned it!</div>`;
    return;
  }

  listEl.innerHTML = sched.map(w => {
    const logged = data[w.id];
    const done = logged?.done;
    const feel = logged?.feel || '';
    const time = logged?.time || '';
    return `
      <div class="sched-item ${done ? 'sched-done' : ''} ${isFuture ? 'sched-future' : ''}"
           data-date="${dateStr}" data-workout="${w.id}">
        <div class="sched-check ${w.cat} ${done ? 'checked' : ''}"></div>
        <div class="sched-text">
          <span class="sched-name ${done ? 'sched-strike' : ''}">${w.label}</span>
          ${time ? `<span class="sched-time">${time}${feel ? ' · ' + feel : ''}</span>` : ''}
        </div>
        ${feel ? `<span class="sched-feel">${feel}</span>` : ''}
      </div>`;
  }).join('');

  if (!isFuture) {
    listEl.querySelectorAll('.sched-item').forEach(item => {
      item.addEventListener('click', () => {
        const wid = item.dataset.workout;
        const dstr = item.dataset.date;
        const w = sched.find(x => x.id === wid);
        if (isWorkoutComplete(dstr, wid)) {
          unlogWorkout(dstr, wid);
          renderChallengeTab();
          renderTrackerTab();
        } else {
          openFeelModal(wid, w.label, dstr, () => {
            renderChallengeTab();
            renderTrackerTab();
            document.getElementById('streak-count').textContent = getCurrentStreak();
          });
        }
      });
    });
  }
}

function renderDayViewInChallenge() {
  const dateStr = todayStr();
  document.getElementById('today-date-label').textContent = formatDateLabel(dateStr);

  const grid = document.getElementById('today-workout-grid');
  const open = state.daySchedOpen !== false;

  grid.innerHTML = `
    <div class="sched-block">
      <button class="sched-toggle-btn" id="sched-toggle-btn">
        <span>TODAY'S SCHEDULE</span>
        <span class="sched-arrow ${open ? 'open' : ''}">&#9660;</span>
      </button>
      <div class="sched-list-wrap ${open ? '' : 'collapsed'}" id="sched-list-wrap">
        <div id="today-sched-list"></div>
      </div>
    </div>`;

  renderDaySchedule(dateStr, document.getElementById('today-sched-list'));

  document.getElementById('sched-toggle-btn').addEventListener('click', () => {
    state.daySchedOpen = !state.daySchedOpen;
    document.getElementById('sched-list-wrap').classList.toggle('collapsed', !state.daySchedOpen);
    document.querySelector('#sched-toggle-btn .sched-arrow').classList.toggle('open', state.daySchedOpen);
  });
}

function renderWeekViewInChallenge() {
  const today = todayStr();
  const baseWeekStart = getMonday(today);
  const weekStart = addDays(baseWeekStart, state.viewedWeekOffset * 7);
  const days = getWeekDays(weekStart);

  const weekNum = programWeek(weekStart);
  document.getElementById('week-nav-title').textContent = `WEEK ${Math.max(1, weekNum)} OF ${WEEKS}`;

  const row = document.getElementById('week-grid-row');
  row.innerHTML = days.map(d => {
    const cls = circleClass(d);
    const isToday = d === today;
    const isSel = d === state.challengeSelectedDate;
    const dateNum = strToDate(d).getDate();
    return `
      <div class="week-cell ${isSel ? 'sel-day' : ''}" data-date="${d}">
        <div class="w-circle ${cls} ${isToday ? 'today-ring' : ''}"></div>
        <div class="week-cell-date ${isToday ? 'today-date' : ''}">${dateNum}</div>
      </div>`;
  }).join('');

  row.querySelectorAll('.week-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      state.challengeSelectedDate = cell.dataset.date;
      row.querySelectorAll('.week-cell').forEach(c => c.classList.remove('sel-day'));
      cell.classList.add('sel-day');
      renderWeekDaySchedule(cell.dataset.date);
    });
  });

  if (state.challengeSelectedDate) renderWeekDaySchedule(state.challengeSelectedDate);
}

function renderWeekDaySchedule(dateStr) {
  const el = document.getElementById('week-day-schedule');
  el.classList.remove('hidden');
  const d = strToDate(dateStr);
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  el.innerHTML = `
    <div class="week-sched-header">${label}</div>
    <div id="week-sched-list"></div>`;
  renderDaySchedule(dateStr, document.getElementById('week-sched-list'));
}

function renderBreakdown() {
  const today = todayStr();
  const weekStart = getMonday(today);
  const counts = weeklyBreakdown(weekStart);

  const items = [
    { cat: 'cf',    label: 'CrossFit', icon: '🏋️', count: counts.cf },
    { cat: 'yoga',  label: 'Hot Yoga', icon: '🧘', count: counts.yoga },
    { cat: 'other', label: 'Other',    icon: '👟', count: counts.other }
  ].filter(x => x.count > 0);

  const row = document.getElementById('breakdown-row');
  if (!items.length) {
    row.innerHTML = `<div style="padding:12px 16px;color:var(--text-3);font-size:13px">No workouts logged this week yet.</div>`;
    return;
  }
  row.innerHTML = items.map(x => `
    <div class="breakdown-stat">
      <div class="stat-icon">${x.icon}</div>
      <div class="stat-num" style="color:var(--${x.cat === 'cf' ? 'cf' : x.cat === 'yoga' ? 'yoga' : 'other'})">${x.count}</div>
      <div class="stat-lbl">${x.label}</div>
    </div>`).join('');
}

// ════════════════════════════════════════
// RENDER – TRACKER TAB
// ════════════════════════════════════════

function renderTrackerTab() {
  renderWeekStrip();
  renderTrackerWorkouts();
  loadSleepForm();
  renderWeeklySnapshot();
}

function renderWeekStrip() {
  const today = todayStr();
  const weekStart = getMonday(today);
  const days = getWeekDays(weekStart);
  const strip = document.getElementById('tracker-week-strip');
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  strip.innerHTML = days.map((d, i) => {
    const isToday = d === today;
    const isSelected = d === state.trackerSelectedDate;
    const st = dayStatus(d);
    const dotClass = st === 'complete' ? 'complete' : st === 'partial' ? 'partial' : '';
    const dateNum = strToDate(d).getDate();
    return `
      <div class="strip-day ${isToday ? 'today-strip' : ''} ${isSelected ? 'active' : ''}" data-date="${d}">
        <div class="strip-day-name">${dayLabels[i]}</div>
        <div class="strip-day-num">${dateNum}</div>
        <div class="strip-dot ${dotClass}"></div>
      </div>`;
  }).join('');

  strip.querySelectorAll('.strip-day').forEach(el => {
    el.addEventListener('click', () => {
      state.trackerSelectedDate = el.dataset.date;
      renderTrackerTab();
    });
  });
}

function renderTrackerWorkouts() {
  const dateStr = state.trackerSelectedDate;
  const sched = scheduleForDate(dateStr);
  const data = workoutDataForDate(dateStr);
  const container = document.getElementById('tracker-workout-list');

  if (!sched.length) {
    container.innerHTML = `<div class="rest-notice">😌 Rest day — you've earned it!</div>`;
    return;
  }

  container.innerHTML = sched.map(w => {
    const logged = data[w.id];
    const done = logged?.done;
    const feel = logged?.feel || '';
    const time = logged?.time || '';
    return `
      <div class="workout-check-item ${done ? 'completed' : ''}" data-date="${dateStr}" data-workout="${w.id}">
        <div class="check-box ${w.cat} ${done ? 'checked' : ''}"></div>
        <div class="check-label">
          <div class="check-name ${done ? 'strike' : ''}">${w.label}</div>
          ${time ? `<div class="check-meta">${time}${feel ? ' · ' + feel : ''}</div>` : ''}
        </div>
        ${feel ? `<div class="feel-chip">${feel}</div>` : ''}
      </div>`;
  }).join('');

  container.querySelectorAll('.workout-check-item').forEach(item => {
    item.addEventListener('click', () => {
      const wid = item.dataset.workout;
      const dstr = item.dataset.date;
      const w = sched.find(x => x.id === wid);
      if (isWorkoutComplete(dstr, wid)) {
        unlogWorkout(dstr, wid);
        renderTrackerTab();
        if (dstr === todayStr()) renderChallengeTab();
      } else {
        openFeelModal(wid, w.label, dstr, () => {
          renderTrackerTab();
          if (dstr === todayStr()) renderChallengeTab();
        });
      }
    });
  });
}

function loadSleepForm() {
  const dateStr = state.trackerSelectedDate;
  const existing = state.sleep[dateStr];

  // Quality buttons
  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (existing && btn.dataset.quality === existing.quality) btn.classList.add('selected');
  });

  if (existing) {
    document.getElementById('sleep-bedtime').value = existing.bedtime || '21:00';
    document.getElementById('sleep-waketime').value = existing.waketime || '05:30';
    updateSleepHoursDisplay();
    const btn = document.getElementById('save-sleep-btn');
    btn.textContent = 'Update Sleep Log';
    btn.classList.add('saved');
  } else {
    document.getElementById('sleep-bedtime').value = '21:00';
    document.getElementById('sleep-waketime').value = '05:30';
    updateSleepHoursDisplay();
    const btn = document.getElementById('save-sleep-btn');
    btn.textContent = 'Save Sleep Log';
    btn.classList.remove('saved');
  }
}

function updateSleepHoursDisplay() {
  const bedtime = document.getElementById('sleep-bedtime').value;
  const waketime = document.getElementById('sleep-waketime').value;
  const hours = calcSleepHours(bedtime, waketime);
  const el = document.getElementById('sleep-hours-display');
  if (hours) {
    el.textContent = `${hours} hrs`;
    el.className = `sleep-hours-value ${sleepColorClass(hours)}`;
  } else {
    el.textContent = '—';
    el.className = 'sleep-hours-value';
  }
}

function renderWeeklySnapshot() {
  const today = todayStr();
  const weekStart = getMonday(today);
  const wPct = weeklyWorkoutPct(weekStart);
  const sPct = weeklySleepPct(weekStart);
  document.getElementById('snap-workout-pct').textContent = wPct + '%';
  document.getElementById('snap-sleep-pct').textContent = sPct + '%';
}

// ════════════════════════════════════════
// RENDER – READING TAB
// ════════════════════════════════════════

function renderReadingTab() {
  const books = state.books;
  document.getElementById('reading-count').textContent =
    books.length === 0 ? 'Start tracking your reading journey'
    : `${books.length} book${books.length !== 1 ? 's' : ''} in your list`;

  const list = document.getElementById('book-list');
  if (!books.length) {
    list.innerHTML = `<div style="text-align:center;padding:32px 16px;color:var(--text-3);font-size:14px">No books yet.<br>Add your first one above!</div>`;
    return;
  }

  list.innerHTML = books.map(book => {
    const status = book.completed ? 'completed' : book.startDate ? 'reading' : 'unstarted';
    const badge = book.completed ? '&#x1F4AA;' : '';
    const statusLabel = book.completed ? 'Completed' : book.startDate ? 'Reading' : 'Up Next';
    const dateStr = book.startDate
      ? (book.completed
          ? `${formatShortDate(book.startDate)} → ${formatShortDate(book.finishDate)}`
          : `Started ${formatShortDate(book.startDate)}`)
      : '';
    const notes = book.notes || [];
    const notesHtml = notes.map((n, ni) => `
      <div class="book-note">
        <div class="note-text">${escHtml(n.text)}</div>
        <div class="note-meta">${new Date(n.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <button class="delete-note-btn" data-id="${book.id}" data-ni="${ni}">✕</button>
      </div>`).join('');

    return `
      <div class="book-item" data-id="${book.id}">
        <div class="book-spine ${status}"></div>
        <div class="book-info">
          <div class="book-title-row">
            <div class="book-title">${escHtml(book.title)}</div>
            ${badge ? `<span class="book-complete-badge">${badge}</span>` : ''}
          </div>
          ${dateStr ? `<div class="book-dates">${dateStr}</div>` : ''}
          <div class="book-status ${status}">${statusLabel}</div>
          <div class="book-actions">
            ${!book.completed ? `<button class="book-action-btn complete-btn" data-id="${book.id}">Mark Complete</button>` : ''}
            <button class="book-action-btn delete-book-btn" data-id="${book.id}">Remove</button>
          </div>
          <div class="book-notes-section">
            <div class="book-notes-header">
              <span class="book-notes-label">Notes ${notes.length ? `(${notes.length})` : ''}</span>
              <button class="add-note-btn" data-id="${book.id}">+ Add note</button>
            </div>
            ${notesHtml}
            <div class="note-form hidden" id="note-form-${book.id}">
              <textarea class="note-input" id="note-input-${book.id}" placeholder="Save a quote, thought, or insight..."></textarea>
              <button class="save-note-btn" data-id="${book.id}">Save</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openFinishBookModal(btn.dataset.id); });
  });
  list.querySelectorAll('.delete-book-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Remove this book?')) {
        state.books = state.books.filter(b => b.id !== btn.dataset.id);
        persist();
        renderReadingTab();
      }
    });
  });
  list.querySelectorAll('.add-note-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const form = document.getElementById(`note-form-${btn.dataset.id}`);
      form.classList.toggle('hidden');
      if (!form.classList.contains('hidden')) form.querySelector('textarea').focus();
    });
  });
  list.querySelectorAll('.save-note-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const bookId = btn.dataset.id;
      const input = document.getElementById(`note-input-${bookId}`);
      const text = input.value.trim();
      if (!text) return;
      const book = state.books.find(b => b.id === bookId);
      if (!book.notes) book.notes = [];
      book.notes.push({ text, timestamp: new Date().toISOString() });
      persist();
      renderReadingTab();
    });
  });
  list.querySelectorAll('.delete-note-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const book = state.books.find(b => b.id === btn.dataset.id);
      if (book) { book.notes.splice(Number(btn.dataset.ni), 1); persist(); renderReadingTab(); }
    });
  });
}

// ════════════════════════════════════════
// RENDER – PROGRESS TAB
// ════════════════════════════════════════

function renderProgressTab() {
  const today = todayStr();
  const streak = getCurrentStreak();
  const sessions = totalSessionsCompleted();
  const day = Math.max(1, Math.min(programDay(today), PROGRAM_DAYS));
  const phase = currentPhase(today);
  const phaseIdx = PHASES.indexOf(phase);
  const week = programWeek(today);
  const weekStart = getMonday(today);
  const wPct = weeklyWorkoutPct(weekStart);

  // Stats cards
  document.getElementById('progress-stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-val">${streak}</div>
      <div class="stat-sub">🔥 Day Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${sessions}</div>
      <div class="stat-sub">Total Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${day}</div>
      <div class="stat-sub">Day of ${PROGRAM_DAYS}</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${wPct}%</div>
      <div class="stat-sub">This Week</div>
    </div>`;

  // Phase progress
  const phaseStartDay = phaseIdx * 28 + 1;
  const phaseEndDay = (phaseIdx + 1) * 28;
  const phasePct = Math.min(100, Math.max(0, Math.round(((day - phaseStartDay) / 28) * 100)));
  document.getElementById('phase-progress-section').innerHTML = `
    <div class="phase-row">
      <div class="phase-name">Phase ${phaseIdx + 1}: ${phase.name}</div>
      <div class="phase-weeks">Weeks ${phase.weeks}</div>
    </div>
    <div class="phase-bar"><div class="phase-fill" style="width:${phasePct}%"></div></div>
    <div style="font-size:12px;color:var(--text-3);margin-top:8px">${phasePct}% complete</div>`;

  // Recap card if program done
  if (day > PROGRAM_DAYS) {
    const recapEl = document.getElementById('challenge-grid-section');
    if (!document.getElementById('recap-card')) {
      const recap = document.createElement('div');
      recap.id = 'recap-card';
      recap.className = 'recap-card';
      recap.innerHTML = `
        <div class="recap-title"><span>Program Complete! 🏆</span></div>
        <div class="recap-sub">84 Days. You showed up.</div>
        <div class="recap-stats">
          <div class="recap-stat"><div class="recap-stat-val">${sessions}</div><div class="recap-stat-lbl">Sessions</div></div>
          <div class="recap-stat"><div class="recap-stat-val">${streak}</div><div class="recap-stat-lbl">Best Streak</div></div>
          <div class="recap-stat"><div class="recap-stat-val">${state.books.filter(b => b.completed).length}</div><div class="recap-stat-lbl">Books Read</div></div>
        </div>`;
      recapEl.prepend(recap);
    }
  }

  // 12-week grid
  renderChallengeGrid();

  // Sunday reflection
  const dow = strToDate(today).getDay();
  const reflSec = document.getElementById('reflection-section');
  if (dow === 0) {
    reflSec.classList.remove('hidden');
    const existing = state.reflections[today];
    if (existing) document.getElementById('reflection-text').value = existing;
  } else {
    reflSec.classList.add('hidden');
  }
}

function renderChallengeGrid() {
  if (!state.startDate) return;
  const grid = document.getElementById('challenge-grid');
  const today = todayStr();
  let html = '';

  for (let w = 1; w <= WEEKS; w++) {
    const weekAnchorDate = addDays(state.startDate, (w - 1) * 7);
    const weekMonday = getMonday(weekAnchorDate); // align to calendar week Mon–Sun
    const days = getWeekDays(weekMonday);

    html += `<div class="grid-week-row"><div class="grid-week-label">${w}</div>`;
    days.forEach(d => {
      const cls = circleClass(d);
      const isToday = d === today;
      html += `<div class="grid-circle ${cls} ${isToday ? 'today-ring' : ''}"></div>`;
    });
    html += `</div>`;
  }
  grid.innerHTML = html;
}

// ════════════════════════════════════════
// FEEL MODAL
// ════════════════════════════════════════

let feelCallback = null;
let feelPending = { date: null, workout: null, selectedFeel: null };

function openFeelModal(workoutId, workoutLabel, dateStr, cb) {
  feelPending = { date: dateStr, workout: workoutId, selectedFeel: null };
  feelCallback = cb;

  document.getElementById('feel-modal-title').textContent = `How did ${workoutLabel} feel?`;
  document.getElementById('feel-modal-sub').textContent = formatShortDate(dateStr);

  document.querySelectorAll('.feel-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('feel-modal').classList.add('open');
}

function closeFeelModal() {
  document.getElementById('feel-modal').classList.remove('open');
  feelPending = { date: null, workout: null, selectedFeel: null };
  feelCallback = null;
}

// ════════════════════════════════════════
// BOOK MODALS
// ════════════════════════════════════════

function openAddBookModal() {
  document.getElementById('book-title-input').value = '';
  document.getElementById('book-start-input').value = todayStr();
  document.getElementById('book-modal').classList.add('open');
  document.getElementById('book-modal-title').textContent = 'Add a Book';
  setTimeout(() => document.getElementById('book-title-input').focus(), 300);
}

function closeBookModal() {
  document.getElementById('book-modal').classList.remove('open');
}

let pendingFinishBookId = null;

function openFinishBookModal(bookId) {
  pendingFinishBookId = bookId;
  const book = state.books.find(b => b.id === bookId);
  document.getElementById('finish-book-name').textContent = book?.title || '';
  document.getElementById('book-finish-input').value = todayStr();
  document.getElementById('finish-book-modal').classList.add('open');
}

function closeFinishBookModal() {
  document.getElementById('finish-book-modal').classList.remove('open');
  pendingFinishBookId = null;
}

// ════════════════════════════════════════
// SETTINGS / MENU
// ════════════════════════════════════════

function openSettings() {
  document.getElementById('settings-start-date').value = state.startDate || '';
  const sw = document.getElementById('settings-notif-switch');
  sw.classList.toggle('on', state.notifEnabled);
  document.getElementById('settings-overlay').classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
}

// ════════════════════════════════════════
// TAB ROUTING
// ════════════════════════════════════════

function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${tabId}"]`)?.classList.add('active');

  const titles = { challenge: 'HOT GIRL SUMMER', tracker: 'TRACKER', reading: 'READING', progress: 'PROGRESS' };
  document.getElementById('page-title').textContent = titles[tabId] || 'HOT GIRL SUMMER';

  if (tabId === 'challenge') renderChallengeTab();
  if (tabId === 'tracker')   renderTrackerTab();
  if (tabId === 'reading')   renderReadingTab();
  if (tabId === 'progress')  renderProgressTab();
}

// ════════════════════════════════════════
// UTILS
// ════════════════════════════════════════

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ════════════════════════════════════════
// ONBOARDING
// ════════════════════════════════════════

function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');

  const dateInput = document.getElementById('onboard-date');
  dateInput.value = todayStr();

  let notifWanted = true;
  const toggle = document.getElementById('notif-switch');
  const toggleRow = document.getElementById('notif-toggle-row');

  toggleRow.addEventListener('click', () => {
    notifWanted = !notifWanted;
    toggle.classList.toggle('on', notifWanted);
  });

  document.getElementById('onboard-submit').addEventListener('click', async () => {
    const startDate = dateInput.value;
    if (!startDate) { alert('Please select a start date.'); return; }

    save(KEY.START, startDate);
    state.startDate = startDate;
    state.notifEnabled = notifWanted;

    if (notifWanted) {
      const granted = await requestNotifPermission();
      state.notifEnabled = granted;
    }
    save(KEY.NOTIF, state.notifEnabled);
    save(KEY.ONBOARDED, true);

    document.getElementById('onboarding').classList.add('hidden');
    launchApp();
  });
}

// ════════════════════════════════════════
// LAUNCH APP
// ════════════════════════════════════════

function launchApp() {
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('onboarding').classList.add('hidden');

  // Streak badge
  const streak = getCurrentStreak();
  document.getElementById('streak-count').textContent = streak;

  // Initial tab
  switchTab('challenge');

  // Notification checks
  checkAndFireNotifications();
  checkCheckinNotification();
}

// ════════════════════════════════════════
// EVENT LISTENERS
// ════════════════════════════════════════

function attachEvents() {

  // Bottom nav
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  // View toggle (Challenge tab)
  document.querySelector('.view-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    const view = btn.dataset.view;
    state.challengeView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('day-view').classList.toggle('hidden', view !== 'day');
    document.getElementById('week-view').classList.toggle('hidden', view !== 'week');
  });

  // Week navigation
  document.getElementById('prev-week-btn').addEventListener('click', () => {
    state.viewedWeekOffset--;
    renderWeekViewInChallenge();
  });
  document.getElementById('next-week-btn').addEventListener('click', () => {
    state.viewedWeekOffset++;
    renderWeekViewInChallenge();
  });

  // Sleep quality picker
  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Sleep time inputs
  document.getElementById('sleep-bedtime').addEventListener('input', updateSleepHoursDisplay);
  document.getElementById('sleep-waketime').addEventListener('input', updateSleepHoursDisplay);

  // Save sleep
  document.getElementById('save-sleep-btn').addEventListener('click', () => {
    const quality = document.querySelector('.quality-btn.selected')?.dataset.quality || 'OK';
    const bedtime  = document.getElementById('sleep-bedtime').value;
    const waketime = document.getElementById('sleep-waketime').value;
    saveSleepLog(state.trackerSelectedDate, quality, bedtime, waketime);
    const btn = document.getElementById('save-sleep-btn');
    btn.textContent = '✓ Saved';
    btn.classList.add('saved');
    renderWeeklySnapshot();
    setTimeout(() => { btn.textContent = 'Update Sleep Log'; }, 2000);
  });

  // Add book button
  document.getElementById('add-book-btn').addEventListener('click', openAddBookModal);

  // Book modal save
  document.getElementById('book-save-btn').addEventListener('click', () => {
    const title = document.getElementById('book-title-input').value.trim();
    if (!title) { document.getElementById('book-title-input').focus(); return; }
    const startDate = document.getElementById('book-start-input').value;
    const book = { id: Date.now().toString(), title, startDate, finishDate: null, completed: false };
    state.books.push(book);
    persist();
    closeBookModal();
    renderReadingTab();
  });

  // Finish book modal
  document.getElementById('book-finish-btn').addEventListener('click', () => {
    if (!pendingFinishBookId) return;
    const finishDate = document.getElementById('book-finish-input').value;
    const book = state.books.find(b => b.id === pendingFinishBookId);
    if (book) {
      book.completed = true;
      book.finishDate = finishDate || todayStr();
      persist();
    }
    closeFinishBookModal();
    renderReadingTab();
  });

  // Feel modal options
  document.querySelectorAll('.feel-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.feel-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      feelPending.selectedFeel = opt.dataset.feel;
    });
  });

  // Feel modal confirm
  document.getElementById('feel-confirm-btn').addEventListener('click', () => {
    if (!feelPending.date || !feelPending.workout) return;
    const feel = feelPending.selectedFeel || '💪';
    logWorkout(feelPending.date, feelPending.workout, feel);
    const cb = feelCallback;
    closeFeelModal();
    if (cb) cb();
    // Update streak
    document.getElementById('streak-count').textContent = getCurrentStreak();
  });

  // Close feel modal by tapping backdrop
  document.getElementById('feel-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('feel-modal')) closeFeelModal();
  });

  // Close book modal by backdrop
  document.getElementById('book-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('book-modal')) closeBookModal();
  });
  document.getElementById('finish-book-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('finish-book-modal')) closeFinishBookModal();
  });

  // Menu button
  document.getElementById('menu-btn').addEventListener('click', openSettings);

  // Settings save date
  document.getElementById('settings-save-date').addEventListener('click', () => {
    const d = document.getElementById('settings-start-date').value;
    if (!d) return;
    state.startDate = d;
    save(KEY.START, d);
    closeSettings();
    switchTab(state.currentTab);
  });

  // Settings notification toggle
  document.getElementById('settings-notif-toggle').addEventListener('click', async () => {
    const sw = document.getElementById('settings-notif-switch');
    if (!state.notifEnabled) {
      const granted = await requestNotifPermission();
      state.notifEnabled = granted;
    } else {
      state.notifEnabled = false;
    }
    save(KEY.NOTIF, state.notifEnabled);
    sw.classList.toggle('on', state.notifEnabled);
  });

  // Reset
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Reset ALL data? This cannot be undone.')) {
      Object.values(KEY).forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  });

  // Settings close
  document.getElementById('settings-close-area').addEventListener('click', closeSettings);

  // Sunday reflection save
  document.getElementById('save-reflection-btn').addEventListener('click', () => {
    const text = document.getElementById('reflection-text').value.trim();
    if (text) {
      state.reflections[todayStr()] = text;
      persist();
      const btn = document.getElementById('save-reflection-btn');
      btn.textContent = '✓ Reflection Saved';
      setTimeout(() => { btn.textContent = 'Save Reflection'; }, 2000);
    }
  });
}

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════

async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) { /* non-critical */ }
  }

  loadState();

  const onboarded = load(KEY.ONBOARDED, false);
  attachEvents();

  if (!onboarded || !state.startDate) {
    showOnboarding();
  } else {
    launchApp();
  }
}

document.addEventListener('DOMContentLoaded', init);
