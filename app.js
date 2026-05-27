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
  { q: "She remembered who she was and the game changed." },
  { q: "Protect your energy. You're building something rare." },
  { q: "Discipline is the bridge between goals and accomplishment.", a: "Jim Rohn" },
  { q: "You didn't come this far to only come this far." },
  { q: "Progress, not perfection." },
  { q: "The body achieves what the mind believes." },
  { q: "Every morning is a chance to get better." },
  { q: "She believed she could, so she did." },
  { q: "Your only limit is your mind." },
  { q: "Consistency over intensity. Show up every day." },
  { q: "Make yourself a priority." },
  { q: "Be the girl who decided to go for it." },
  { q: "The comeback is always stronger than the setback." },
  { q: "One day or day one. You decide." },
  { q: "The best project you'll ever work on is you." },
  { q: "Fall in love with taking care of yourself." },
  { q: "Don't stop when you're tired. Stop when you're done." },
  { q: "You are stronger than you think." },
  { q: "Nothing will work unless you do.", a: "Maya Angelou" },
  { q: "Rise up. Start fresh. See the bright opportunity in each new day." },
  { q: "She is clothed in strength and dignity." },
  { q: "Dream big. Work hard. Stay focused." },
  { q: "She turned her can'ts into cans and her dreams into plans." },
  { q: "Invest in yourself. It pays the best interest.", a: "Benjamin Franklin" },
  { q: "Strong women don't have attitudes. We have standards." },
  { q: "Be a girl with a mind, a woman with attitude, and a lady with class." },
  { q: "Make your body your best outfit." },
  { q: "Good things come to those who sweat." },
  { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { q: "Success is liking yourself, liking what you do, and liking how you do it.", a: "Maya Angelou" },
  { q: "Your health is your wealth." },
  { q: "Sweat, smile, repeat." },
  { q: "Hot girl summer is a mindset." },
  { q: "You are your own competition." },
  { q: "She is not afraid of hard work. She is afraid of a life unlived." }
];

function getDailyQuote(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return QUOTES[(y * 365 + m * 31 + d) % QUOTES.length];
}

// ════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════

const KEY = {
  START:          'hgs_start',
  WORKOUTS:       'hgs_workouts',
  SLEEP:          'hgs_sleep',
  BOOKS:          'hgs_books',
  BOOKS_VER:      'hgs_books_ver',
  REFLECTIONS:    'hgs_reflect',
  ONBOARDED:      'hgs_onboarded',
  NOTIF:          'hgs_notif',
  NOTIF_DATE:     'hgs_notif_date',
  DAILY_CHECKS:   'hgs_daily_checks',
  DAY_NOTES:      'hgs_day_notes',
  DAY_ADDITIONS:  'hgs_day_additions',
  DAY_REMOVALS:   'hgs_day_removals'
};

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ════════════════════════════════════════
// DEFAULT BOOKS & DAY SCHEDULES
// ════════════════════════════════════════

const BOOKS_VERSION = 2;
const DEFAULT_BOOKS = [
  { title: 'The High 5 Habit',           author: 'Mel Robbins',            weeks: 'Wks 1–2',   startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'The Alter Ego Effect',       author: 'Todd Herman',            weeks: 'Wks 3–4',   startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'Burnout',                    author: 'Emily & Amelia Nagoski', weeks: 'Wks 5–6',   startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'The Body Is Not an Apology', author: 'Sonya Renee Taylor',     weeks: 'Wks 7–8',   startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'Playing Big',                author: 'Tara Mohr',              weeks: 'Wks 9–10',  startDate: null, finishDate: null, completed: false, notes: [] },
  { title: 'Big Magic',                  author: 'Elizabeth Gilbert',      weeks: 'Wks 11–12', startDate: null, finishDate: null, completed: false, notes: [] },
];

const DAY_SCHEDULES = {
  1: [ // Monday — CF + Hot Yoga
    { id: 'wake',    time: '5:30 AM', label: 'Wake up',          notes: 'Hydrate immediately. Electrolytes if keto phase.', type: 'routine' },
    { id: 'cf',      time: '6:00 AM', label: 'CrossFit',         notes: 'Strength/WOD class. This is your anchor — go hard.', type: 'workout', cat: 'cf', wid: 'cf' },
    { id: 'shower',  time: '7:00 AM', label: 'Commute + Shower', notes: 'Head out. Shower at the gym or office.', type: 'routine' },
    { id: 'work',    time: '8:30 AM', label: 'Work',             notes: '8:30–4:30 work day.', type: 'routine' },
    { id: 'yoga',    time: '6:00 PM', label: 'Hot Yoga',         notes: 'Evening class. Recovery — let your body decompress.', type: 'workout', cat: 'yoga', wid: 'yoga' },
    { id: 'dinner',  time: '7:30 PM', label: 'Dinner',           notes: 'Keto or plant-based depending on phase. Prep ahead.', type: 'routine' },
    { id: 'reading', time: '8:30 PM', label: 'Reading',          notes: '30 min. Physical book only.', type: 'routine' },
    { id: 'lights',  time: '9:00 PM', label: 'Lights out',       notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
  2: [ // Tuesday — Yoga AM + Dance + Speed Puzzles
    { id: 'wake',    time: '5:30 AM', label: 'Wake up',          notes: 'Hydrate immediately.', type: 'routine' },
    { id: 'yoga_am', time: '5:45 AM', label: 'Yoga AM',          notes: 'Morning practice. Breathe deep, set your intention.', type: 'workout', cat: 'yoga', wid: 'yoga_am' },
    { id: 'shower',  time: '7:00 AM', label: 'Home + Shower',    notes: 'Quick reset. High protein breakfast.', type: 'routine' },
    { id: 'work',    time: '7:30 AM', label: 'Commute + Work',   notes: '8:30–4:30 work day.', type: 'routine' },
    { id: 'dance',   time: '4:15 PM', label: 'Dance',            notes: 'Class 4:15–5:00 PM. Joy as movement — energy up.', type: 'workout', cat: 'other', wid: 'dance' },
    { id: 'puzzles', time: '6:00 PM', label: 'Speed Puzzles 🍺', notes: 'Brewery with friends. 6–9 PM. Recharge socially.', type: 'routine' },
    { id: 'lights',  time: '9:30 PM', label: 'Lights out',       notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
  3: [ // Wednesday — CF + Hot Yoga + Trivia
    { id: 'wake',    time: '5:30 AM', label: 'Wake up',          notes: 'Hydrate immediately. Electrolytes if keto phase.', type: 'routine' },
    { id: 'cf',      time: '6:00 AM', label: 'CrossFit',         notes: 'Strength/WOD class. Push harder than last week.', type: 'workout', cat: 'cf', wid: 'cf' },
    { id: 'shower',  time: '7:00 AM', label: 'Commute + Shower', notes: 'Head out. Shower at the gym or office.', type: 'routine' },
    { id: 'work',    time: '8:30 AM', label: 'Work',             notes: '8:30–4:30 work day.', type: 'routine' },
    { id: 'yoga',    time: '6:00 PM', label: 'Hot Yoga',         notes: 'Evening class. Recovery — let your body decompress.', type: 'workout', cat: 'yoga', wid: 'yoga' },
    { id: 'trivia',  time: '7:00 PM', label: 'Trivia 🍺',        notes: 'Brewery with friends. 7–9 PM. Go get those points!', type: 'routine' },
    { id: 'lights',  time: '9:30 PM', label: 'Lights out',       notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
  4: [ // Thursday — Yoga AM + Bootcamp + Volunteer
    { id: 'wake',      time: '5:30 AM', label: 'Wake up',          notes: 'Hydrate immediately.', type: 'routine' },
    { id: 'yoga_am',   time: '5:45 AM', label: 'Yoga AM',          notes: 'Ground yourself before the day.', type: 'workout', cat: 'yoga', wid: 'yoga_am' },
    { id: 'shower',    time: '7:00 AM', label: 'Home + Shower',    notes: 'Quick reset. High protein breakfast.', type: 'routine' },
    { id: 'work',      time: '7:30 AM', label: 'Commute + Work',   notes: '8:30–4:30 work day.', type: 'routine' },
    { id: 'bootcamp',  time: '5:30 PM', label: 'Bootcamp',         notes: 'High intensity. Leave it all on the floor.', type: 'workout', cat: 'other', wid: 'bootcamp' },
    { id: 'volunteer', time: '6:00 PM', label: 'Volunteer Call',   notes: '30 min. Give back.', type: 'routine' },
    { id: 'dinner',    time: '7:00 PM', label: 'Dinner',           notes: 'Keto or plant-based depending on phase.', type: 'routine' },
    { id: 'reading',   time: '8:30 PM', label: 'Reading',          notes: '30 min. Physical book only.', type: 'routine' },
    { id: 'lights',    time: '9:00 PM', label: 'Lights out',       notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
  5: [ // Friday — CF + Hot Yoga
    { id: 'wake',    time: '5:30 AM', label: 'Wake up',          notes: 'Hydrate immediately. Electrolytes if keto phase.', type: 'routine' },
    { id: 'cf',      time: '6:00 AM', label: 'CrossFit',         notes: 'Friday strength. Finish the week strong.', type: 'workout', cat: 'cf', wid: 'cf' },
    { id: 'shower',  time: '7:00 AM', label: 'Commute + Shower', notes: 'Head out. Shower at the gym or office.', type: 'routine' },
    { id: 'work',    time: '8:30 AM', label: 'Work',             notes: '8:30–4:30 work day.', type: 'routine' },
    { id: 'yoga',    time: '6:00 PM', label: 'Hot Yoga',         notes: 'TGIF yoga. End the work week right.', type: 'workout', cat: 'yoga', wid: 'yoga' },
    { id: 'dinner',  time: '7:30 PM', label: 'Dinner',           notes: 'Keto or plant-based depending on phase.', type: 'routine' },
    { id: 'reading', time: '8:30 PM', label: 'Reading',          notes: '30 min. Physical book only.', type: 'routine' },
    { id: 'lights',  time: '9:00 PM', label: 'Lights out',       notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
  6: [ // Saturday — Walk with friend
    { id: 'wake',    time: '6:30 AM',  label: 'Wake up',          notes: 'Ease in. Slower morning — you earned it.', type: 'routine' },
    { id: 'walk',    time: '10:00 AM', label: '6-Mile Walk',      notes: 'With a friend. Steady pace. Good conversation.', type: 'workout', cat: 'other', wid: 'walk' },
    { id: 'brunch',  time: '12:00 PM', label: 'Enjoy the day 🙂', notes: 'Your time. Do what feels good.', type: 'routine' },
    { id: 'reading', time: '8:30 PM',  label: 'Reading',          notes: '30 min. Physical book only.', type: 'routine' },
    { id: 'lights',  time: '9:00 PM',  label: 'Lights out',       notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
  0: [ // Sunday — Yoga + Full Day
    { id: 'wake',    time: '6:30 AM',  label: 'Wake up',   notes: 'Ease in. Journaling or quiet morning.', type: 'routine' },
    { id: 'yoga',    time: '9:00 AM',  label: 'Yoga',      notes: 'Slow flow. Restore and reflect.', type: 'workout', cat: 'yoga', wid: 'yoga' },
    { id: 'prep',    time: '11:00 AM', label: 'Full Day',  notes: 'Set yourself up for the week — straighten up, meal prep, plan for the week.', type: 'routine' },
    { id: 'reading', time: '8:30 PM',  label: 'Reading',   notes: '30 min. Physical book only.', type: 'routine' },
    { id: 'lights',  time: '9:00 PM',  label: 'Lights out',notes: 'Sleep tight, beautiful.', type: 'routine' },
  ],
};

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

let state = {
  startDate: null,
  workouts: {},
  sleep: {},
  books: [],
  reflections: {},
  dailyChecks: {},
  dayNotes: {},
  dayAdditions: {},
  dayRemovals: {},
  notifEnabled: false,
  currentTab: 'challenge',
  challengeView: 'day',
  challengeSelectedDate: null,
  trackerSelectedDate: null,
  viewedWeekOffset: 0,
  monthViewDate: null
};

function loadState() {
  state.startDate             = load(KEY.START, null);
  state.workouts              = load(KEY.WORKOUTS, {});
  state.sleep                 = load(KEY.SLEEP, {});
  state.reflections           = load(KEY.REFLECTIONS, {});
  state.notifEnabled          = load(KEY.NOTIF, false);
  state.dailyChecks           = load(KEY.DAILY_CHECKS, {});
  state.dayNotes              = load(KEY.DAY_NOTES, {});
  state.dayAdditions          = load(KEY.DAY_ADDITIONS, {});
  state.dayRemovals           = load(KEY.DAY_REMOVALS, {});
  // Migrate old string-format notes to array format
  Object.keys(state.dayNotes).forEach(k => {
    if (typeof state.dayNotes[k] === 'string') {
      state.dayNotes[k] = state.dayNotes[k]
        ? [{ text: state.dayNotes[k], timestamp: new Date().toISOString() }]
        : [];
    }
  });
  state.trackerSelectedDate   = todayStr();
  state.challengeSelectedDate = todayStr();

  // Books version migration — replaces defaults if stale, keeps user-added books
  const storedVer = load(KEY.BOOKS_VER, 0);
  const rawBooks  = load(KEY.BOOKS, null);
  if (!rawBooks || storedVer < BOOKS_VERSION) {
    const userBooks = (rawBooks || []).filter(b => b.id && !b.id.startsWith('default_'));
    state.books = [
      ...DEFAULT_BOOKS.map((b, i) => ({ ...b, id: `default_${i}` })),
      ...userBooks
    ];
    save(KEY.BOOKS, state.books);
    save(KEY.BOOKS_VER, BOOKS_VERSION);
  } else {
    state.books = rawBooks;
  }
  state.books.forEach(b => { if (!b.notes) b.notes = []; });
}

function persist() {
  save(KEY.WORKOUTS,     state.workouts);
  save(KEY.SLEEP,        state.sleep);
  save(KEY.BOOKS,        state.books);
  save(KEY.REFLECTIONS,  state.reflections);
  save(KEY.DAILY_CHECKS,  state.dailyChecks);
  save(KEY.DAY_NOTES,     state.dayNotes);
  save(KEY.DAY_ADDITIONS, state.dayAdditions);
  save(KEY.DAY_REMOVALS,  state.dayRemovals);
}

// ════════════════════════════════════════
// DATE UTILS
// ════════════════════════════════════════

function todayStr() {
  return dateToStr(new Date());
}

function dateToStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function strToDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(dateStr, n) {
  const d = strToDate(dateStr);
  d.setDate(d.getDate() + n);
  return dateToStr(d);
}

function dayOfWeek(dateStr) {
  return strToDate(dateStr).getDay();
}

function programDay(dateStr) {
  if (!state.startDate) return 1;
  const diff = Math.floor((strToDate(dateStr) - strToDate(state.startDate)) / 86400000) + 1;
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
  const d = strToDate(dateStr);
  const dow = d.getDay();
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
// TIME UTILS
// ════════════════════════════════════════

function fmt24to12(val) {
  if (!val) return '';
  const [hh, mm] = val.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
}

function timeToMins(timeStr) {
  if (!timeStr) return 9999;
  const s = timeStr.trim().toUpperCase();
  if (s.includes('AM') || s.includes('PM')) {
    const isPM = s.includes('PM');
    const clean = s.replace(/[APM\s]/g, '');
    let [h, m] = clean.split(':').map(Number);
    if (isNaN(m)) m = 0;
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h * 60 + m;
  }
  let [h, m] = timeStr.split(':').map(Number);
  if (isNaN(m)) m = 0;
  return h * 60 + m;
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const [hh, mm] = timeStr.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
}

// ════════════════════════════════════════
// WORKOUT UTILS
// ════════════════════════════════════════

function scheduleForDate(dateStr) {
  const dow = dayOfWeek(dateStr);
  return WORKOUT_SCHEDULE[dow] || [];
}

// Workouts for progress tracking: standard minus removals, plus custom additions
function effectiveWorkoutsForDate(dateStr) {
  const removals = state.dayRemovals[dateStr] || [];
  const dow = dayOfWeek(dateStr);
  const standard = (WORKOUT_SCHEDULE[dow] || []).filter(w => !removals.includes(w.id));
  const custom = (state.dayAdditions[dateStr] || []).filter(i => i.type === 'workout');
  return [...standard, ...custom];
}

// Full day schedule for rendering: DAY_SCHEDULES minus removals, plus additions, sorted by time
function effectiveDaySchedule(dateStr) {
  const removals = state.dayRemovals[dateStr] || [];
  const dow = dayOfWeek(dateStr);
  const standard = (DAY_SCHEDULES[dow] || []).filter(i => !removals.includes(i.id));
  const additions = state.dayAdditions[dateStr] || [];
  return [...standard, ...additions].sort((a, b) => timeToMins(a.time) - timeToMins(b.time));
}

function workoutDataForDate(dateStr) {
  return state.workouts[dateStr] || {};
}

function isWorkoutComplete(dateStr, workoutId) {
  return !!(workoutDataForDate(dateStr)[workoutId]?.done);
}

function logWorkout(dateStr, workoutId, notes = null) {
  if (!state.workouts[dateStr]) state.workouts[dateStr] = {};
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  state.workouts[dateStr][workoutId] = { done: true, time: timeStr, notes };
  persist();
}

function unlogWorkout(dateStr, workoutId) {
  if (state.workouts[dateStr]) {
    delete state.workouts[dateStr][workoutId];
    if (Object.keys(state.workouts[dateStr]).length === 0) delete state.workouts[dateStr];
  }
  persist();
}

function dayStatus(dateStr) {
  const today = todayStr();
  const sched = effectiveWorkoutsForDate(dateStr);
  if (sched.length === 0) return 'rest';
  if (dateStr > today) return 'future';
  const data = workoutDataForDate(dateStr);
  const done = sched.filter(w => data[w.id]?.done).length;
  if (done === 0) return 'none';
  if (done === sched.length) return 'complete';
  return 'partial';
}

const CAT_ORDER = ['cf', 'yoga', 'other'];

function circleClass(dateStr) {
  const today = todayStr();
  if (dateStr > today) return 'future';
  if (state.startDate && dateStr < state.startDate) return 'future';

  const sched = effectiveWorkoutsForDate(dateStr);
  if (!sched.length) return 'rest';

  const data = workoutDataForDate(dateStr);
  const doneCats = [...new Set(sched.filter(w => data[w.id]?.done).map(w => w.cat))];

  if (!doneCats.length) return dateStr < today ? 'missed' : '';
  if (doneCats.length === 1) return `cat-${doneCats[0]}`;
  if (doneCats.length === 2) {
    const sorted = doneCats.sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b));
    return `split-${sorted.join('-')}`;
  }
  return 'triple';
}

function challengeWeekCircleClass(dateStr) {
  const today = todayStr();
  if (state.startDate && dateStr < state.startDate) return 'future';
  if (dateStr > today) return 'future';
  const sched = effectiveWorkoutsForDate(dateStr);
  if (!sched.length) return 'rest';
  if (dateStr === today) return 'wk-today';
  const data = workoutDataForDate(dateStr);
  const done = sched.some(w => data[w.id]?.done);
  return done ? 'wk-complete' : 'wk-missed';
}

function getCurrentStreak() {
  if (!state.startDate) return 0;
  let streak = 0;
  let d = todayStr();

  const todaySched = effectiveWorkoutsForDate(d);
  const todayHasLog = todaySched.some(w => isWorkoutComplete(d, w.id));
  if (!todayHasLog && todaySched.length > 0) d = addDays(d, -1);

  for (let i = 0; i < PROGRAM_DAYS; i++) {
    if (d < state.startDate) break;
    const sched = effectiveWorkoutsForDate(d);
    if (sched.length === 0) { d = addDays(d, -1); continue; }
    const hasLog = sched.some(w => isWorkoutComplete(d, w.id));
    if (hasLog) { streak++; d = addDays(d, -1); }
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
    const sched = effectiveWorkoutsForDate(d);
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
  if (wakeMins <= bedMins) wakeMins += 1440;
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
    if (state.startDate && d < state.startDate) return;
    const sched = effectiveWorkoutsForDate(d);
    scheduled += sched.length;
    sched.forEach(w => { if (isWorkoutComplete(d, w.id)) completed++; });
  });
  if (!scheduled) return 0;
  return Math.round((completed / scheduled) * 100);
}

function weeklyBreakdown(weekStart) {
  const days = getWeekDays(weekStart);
  const today = todayStr();
  const counts = { cf: 0, yoga: 0, other: 0 };
  days.forEach(d => {
    if (d > today) return;
    if (state.startDate && d < state.startDate) return;
    const sched = effectiveWorkoutsForDate(d);
    const data = workoutDataForDate(d);
    sched.forEach(w => { if (data[w.id]?.done) counts[w.cat]++; });
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
  const timeInMins = now.getHours() * 60 + now.getMinutes();

  if (timeInMins >= 330 && timeInMins < 540) {
    const day = programDay(today);
    const quote = getDailyQuote(today).q;
    const dayLabel = day >= 1 && day <= PROGRAM_DAYS ? `Day ${day} of ${PROGRAM_DAYS}` : 'Your Challenge';
    fireNotification(`Good Morning Hot Girl! 🌅 ${dayLabel}`, quote, 'morning');
    save(KEY.NOTIF_DATE, today);
  }
}

function checkCheckinNotification() {
  if (!state.notifEnabled) return;
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const timeInMins = now.getHours() * 60 + now.getMinutes();
  const today = todayStr();
  const checkinKey = 'hgs_checkin_' + today;
  if (load(checkinKey, false)) return;

  if (timeInMins >= 450 && timeInMins < 600) {
    const sched = scheduleForDate(today);
    if (sched.length > 0) {
      const names = sched.map(w => w.label).join(' & ');
      fireNotification("Check-in Time! 💪", `Don't forget: ${names} today. You've got this!`, 'checkin');
      save(checkinKey, true);
    }
  }
}

function fireNotification(title, body, tag) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag });
  } else if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: './icons/icon-192.png', tag });
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

  const dq = getDailyQuote(today);
  document.getElementById('daily-quote').innerHTML =
    `“${escHtml(dq.q)}”${dq.a ? `<span class="daily-quote-author">— ${escHtml(dq.a)}</span>` : ''}`;
  document.getElementById('day-counter').innerHTML = `${Math.max(1, Math.min(day, PROGRAM_DAYS))} <span>/ ${PROGRAM_DAYS}</span>`;
  document.getElementById('day-label').textContent = `Week ${week} of ${WEEKS}`;

  renderDayViewInChallenge();
  renderWeekViewInChallenge();
}

function renderDayViewInChallenge() {
  const today = todayStr();
  const dateStr = state.challengeSelectedDate || today;
  const isFuture = dateStr > today;
  const d = strToDate(dateStr);
  const schedule = effectiveDaySchedule(dateStr);

  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateFmt = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
  const isToday = dateStr === today;

  const grid = document.getElementById('today-workout-grid');

  let html = `<div class="day-nav-row">
    <button class="day-nav-btn" id="day-prev-btn">‹</button>
    <div class="day-nav-center">
      <div class="day-name-display">${dayName}</div>
      <div class="day-date-display">${dateFmt}</div>
    </div>
    <button class="day-nav-btn" id="day-next-btn">›</button>
  </div>
  ${!isToday ? `<button class="day-jump-today" id="day-jump-today">↩ Back to Today</button>` : ''}`;

  schedule.forEach(item => {
    let isDone;
    if (item.type === 'workout') {
      isDone = isWorkoutComplete(dateStr, item.wid);
    } else if (item.id === 'wake') {
      isDone = !!(state.sleep[dateStr]?.waketime);
    } else if (item.id === 'lights') {
      isDone = !!(state.sleep[dateStr]?.bedtime);
    } else {
      isDone = !!(state.dailyChecks[dateStr]?.[item.id]);
    }

    const cfNotes = item.type === 'workout' && item.cat === 'cf'
      ? (state.workouts[dateStr]?.[item.wid]?.notes || '')
      : '';

    const dotClass = item.type === 'workout' ? item.cat : 'routine';

    let subInfo = '';
    if (item.id === 'wake' && isDone) {
      const sl = state.sleep[dateStr];
      const hoursStr = sl.hours ? ` · ${sl.hours}h slept` : '';
      subInfo = `<div class="day-item-sub-info">${sl.waketime ? `🕐 ${sl.waketime}` : ''}${hoursStr}${sl.quality ? ` · ${sl.quality}` : ''}</div>`;
    } else if (item.id === 'lights' && isDone) {
      const sl = state.sleep[dateStr];
      subInfo = `<div class="day-item-sub-info">${sl.bedtime ? `🌙 ${sl.bedtime}` : ''}${sl.favPart ? `<div class="day-item-favpart">"${escHtml(sl.favPart)}"</div>` : ''}</div>`;
    }

    const isCustom = !!(item.isCustom);
    html += `
      <div class="day-sched-item ${isDone ? 'done-item' : ''} ${isFuture ? 'future-sched-item' : ''}"
           data-id="${item.id}" data-type="${item.type}" data-cat="${item.cat || ''}" data-wid="${item.wid || ''}" data-custom="${isCustom}">
        <button class="day-item-remove" data-id="${item.id}" data-custom="${isCustom}" aria-label="Remove">×</button>
        <div class="day-item-time">${formatTimeDisplay(item.time)}</div>
        <div class="day-item-dot ${dotClass}"></div>
        <div class="day-item-content">
          <div class="day-item-label ${isDone ? 'done-strike' : ''}">${item.label}</div>
          ${item.notes ? `<div class="day-item-notes">${item.notes}</div>` : ''}
          ${cfNotes ? `<div class="day-item-cf-notes">"${escHtml(cfNotes)}"</div>` : ''}
          ${subInfo}
        </div>
        <div class="day-item-check ${isDone ? 'checked' : ''} ${item.type === 'workout' ? item.cat : ''}"></div>
      </div>`;
  });

  html += `<button class="add-sched-item-btn" id="add-sched-item-btn">+ Add Workout 💪</button>`;
  html += `<button class="add-sched-item-btn" id="add-sched-event-btn">+ Add Event 📅</button>`;
  html += `<button class="add-sched-item-btn" id="add-day-note-btn">+ Add Note 📝</button>`;

  const dayNotesList = state.dayNotes[dateStr] || [];
  const notesHtml = dayNotesList.map((n, ni) => `
    <div class="day-note-item">
      <div class="day-note-text">${escHtml(n.text)}</div>
      <div class="day-note-meta">${new Date(n.timestamp).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>
      <button class="delete-day-note-btn" data-ni="${ni}">✕</button>
    </div>`).join('');

  html += `<div class="day-notes-wrap">
    <div id="day-notes-list">${notesHtml}</div>
    <div class="day-note-form hidden" id="day-note-form">
      <textarea class="day-notes-input" id="day-note-input" placeholder="How's your day going? Any wins, thoughts, reflections..."></textarea>
      <button class="modal-confirm-btn" id="save-day-note-btn" style="margin-top:10px">Save Note</button>
      <button class="skip-notes-btn" id="cancel-day-note-btn">Cancel</button>
    </div>
  </div>`;

  grid.innerHTML = html;

  document.getElementById('add-sched-item-btn').addEventListener('click', () => {
    openAddItemModal(dateStr, () => { renderDayViewInChallenge(); renderTrackerTab(); renderWeekViewInChallenge(); document.getElementById('streak-count').textContent = getCurrentStreak(); });
  });

  document.getElementById('add-sched-event-btn').addEventListener('click', () => {
    openAddEventModal(dateStr, () => { renderDayViewInChallenge(); renderWeekViewInChallenge(); });
  });

  grid.querySelectorAll('.day-item-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const isCustom = btn.dataset.custom === 'true';
      const item = schedule.find(s => s.id === id);
      const label = item?.label || id;
      if (!confirm(`Remove "${label}" from this day?`)) return;
      if (isCustom) {
        state.dayAdditions[dateStr] = (state.dayAdditions[dateStr] || []).filter(i => i.id !== id);
        if (state.workouts[dateStr]) delete state.workouts[dateStr][id];
      } else {
        if (!state.dayRemovals[dateStr]) state.dayRemovals[dateStr] = [];
        if (!state.dayRemovals[dateStr].includes(id)) state.dayRemovals[dateStr].push(id);
        if (state.workouts[dateStr]) delete state.workouts[dateStr][id];
        if (state.dailyChecks[dateStr]) delete state.dailyChecks[dateStr][id];
      }
      persist();
      renderDayViewInChallenge();
      renderTrackerTab();
      renderWeekViewInChallenge();
      document.getElementById('streak-count').textContent = getCurrentStreak();
    });
  });

  document.getElementById('day-prev-btn').addEventListener('click', () => {
    state.challengeSelectedDate = addDays(dateStr, -1);
    renderDayViewInChallenge();
  });
  document.getElementById('day-next-btn').addEventListener('click', () => {
    state.challengeSelectedDate = addDays(dateStr, 1);
    renderDayViewInChallenge();
  });
  if (!isToday) {
    document.getElementById('day-jump-today').addEventListener('click', () => {
      state.challengeSelectedDate = today;
      renderDayViewInChallenge();
    });
  }

  document.getElementById('add-day-note-btn').addEventListener('click', () => {
    const form = document.getElementById('day-note-form');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) document.getElementById('day-note-input').focus();
  });

  document.getElementById('cancel-day-note-btn').addEventListener('click', () => {
    document.getElementById('day-note-form').classList.add('hidden');
  });

  document.getElementById('save-day-note-btn').addEventListener('click', () => {
    const input = document.getElementById('day-note-input');
    const text = input.value.trim();
    if (!text) return;
    if (!state.dayNotes[dateStr]) state.dayNotes[dateStr] = [];
    state.dayNotes[dateStr].push({ text, timestamp: new Date().toISOString() });
    persist();
    renderDayViewInChallenge();
  });

  grid.querySelectorAll('.delete-day-note-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.dayNotes[dateStr].splice(Number(btn.dataset.ni), 1);
      persist();
      renderDayViewInChallenge();
    });
  });

  if (!isFuture) {
    grid.querySelectorAll('.day-sched-item').forEach(el => {
      el.addEventListener('click', () => {
        const id   = el.dataset.id;
        const type = el.dataset.type;
        const cat  = el.dataset.cat;
        const wid  = el.dataset.wid;

        if (type === 'workout') {
          if (isWorkoutComplete(dateStr, wid)) {
            unlogWorkout(dateStr, wid);
            renderDayViewInChallenge();
            renderTrackerTab();
            document.getElementById('streak-count').textContent = getCurrentStreak();
          } else if (cat === 'cf') {
            const item = schedule.find(s => s.id === id);
            openCfModal(wid, item.label, dateStr, () => {
              renderDayViewInChallenge();
              renderTrackerTab();
              document.getElementById('streak-count').textContent = getCurrentStreak();
            });
          } else {
            logWorkout(dateStr, wid);
            renderDayViewInChallenge();
            renderTrackerTab();
            document.getElementById('streak-count').textContent = getCurrentStreak();
          }
        } else {
          if (id === 'wake') {
            openWakeModal(dateStr, schedule.find(s => s.id === 'wake'), () => {
              renderDayViewInChallenge(); renderTrackerTab();
            });
          } else if (id === 'lights') {
            openLightsModal(dateStr, schedule.find(s => s.id === 'lights'), () => {
              renderDayViewInChallenge(); renderTrackerTab();
            });
          } else {
            if (!state.dailyChecks[dateStr]) state.dailyChecks[dateStr] = {};
            if (state.dailyChecks[dateStr][id]) {
              delete state.dailyChecks[dateStr][id];
            } else {
              state.dailyChecks[dateStr][id] = true;
            }
            persist();
            renderDayViewInChallenge();
          }
        }
      });
    });
  }
}

function renderWeekViewInChallenge() {
  const today = todayStr();
  const baseWeekStart = getMonday(today);
  const weekStart = addDays(baseWeekStart, state.viewedWeekOffset * 7);
  const days = getWeekDays(weekStart);

  // Week number relative to program start Monday (not ceil(programDay/7))
  let weekNum = 1;
  if (state.startDate) {
    const programMonday = getMonday(state.startDate);
    const daysDiff = Math.floor((strToDate(weekStart) - strToDate(programMonday)) / 86400000);
    weekNum = Math.floor(daysDiff / 7) + 1;
    weekNum = Math.max(1, Math.min(weekNum, WEEKS));
  }
  document.getElementById('week-nav-title').textContent = `WEEK ${weekNum} OF ${WEEKS}`;

  const row = document.getElementById('week-grid-row');
  row.innerHTML = days.map(d => {
    const cls = challengeWeekCircleClass(d);
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
  const schedule = effectiveDaySchedule(dateStr);
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const today = todayStr();
  const isFuture = dateStr > today;

  let html = `<div class="week-sched-header">${label}</div>`;

  if (!schedule.length) {
    html += `<div class="sched-rest">😌 Rest day — you've earned it!</div>`;
  } else {
    schedule.forEach(item => {
      let isDone;
      if (item.type === 'workout') {
        isDone = isWorkoutComplete(dateStr, item.wid);
      } else if (item.id === 'wake') {
        isDone = !!(state.sleep[dateStr]?.waketime);
      } else if (item.id === 'lights') {
        isDone = !!(state.sleep[dateStr]?.bedtime);
      } else {
        isDone = !!(state.dailyChecks[dateStr]?.[item.id]);
      }
      const cfNotes = item.type === 'workout' && item.cat === 'cf'
        ? (state.workouts[dateStr]?.[item.wid]?.notes || '')
        : '';
      const dotClass = item.type === 'workout' ? item.cat : 'routine';
      const isCustom = !!(item.isCustom);

      html += `
        <div class="day-sched-item ${isDone ? 'done-item' : ''} ${isFuture ? 'future-sched-item' : ''}"
             data-id="${item.id}" data-type="${item.type}" data-cat="${item.cat || ''}" data-wid="${item.wid || ''}" data-custom="${isCustom}">
          <button class="day-item-remove" data-id="${item.id}" data-custom="${isCustom}" aria-label="Remove">×</button>
          <div class="day-item-time">${formatTimeDisplay(item.time)}</div>
          <div class="day-item-dot ${dotClass}"></div>
          <div class="day-item-content">
            <div class="day-item-label ${isDone ? 'done-strike' : ''}">${item.label}</div>
            ${item.notes ? `<div class="day-item-notes">${item.notes}</div>` : ''}
            ${cfNotes ? `<div class="day-item-cf-notes">"${escHtml(cfNotes)}"</div>` : ''}
          </div>
          <div class="day-item-check ${isDone ? 'checked' : ''} ${item.type === 'workout' ? item.cat : ''}"></div>
        </div>`;
    });

    html += `<button class="add-sched-item-btn" id="week-add-sched-item-btn">+ Add Workout</button>`;
  }

  const weekNotes = state.dayNotes[dateStr] || [];
  if (weekNotes.length) {
    html += `<div class="day-notes-wrap week-notes-wrap">
      <div class="day-notes-label">Notes</div>
      ${weekNotes.map(n => `
        <div class="day-note-item">
          <div class="day-note-text">${escHtml(n.text)}</div>
          <div class="day-note-meta">${new Date(n.timestamp).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>
        </div>`).join('')}
    </div>`;
  }

  el.innerHTML = html;

  const refresh = () => {
    renderWeekDaySchedule(dateStr);
    renderWeekViewInChallenge();
    if (dateStr === state.challengeSelectedDate) renderDayViewInChallenge();
    renderTrackerTab();
    document.getElementById('streak-count').textContent = getCurrentStreak();
  };

  el.querySelector('#week-add-sched-item-btn')?.addEventListener('click', () => {
    openAddItemModal(dateStr, refresh);
  });

  el.querySelectorAll('.day-item-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const isCustom = btn.dataset.custom === 'true';
      const item = schedule.find(s => s.id === id);
      if (!confirm(`Remove "${item?.label || id}" from this day?`)) return;
      if (isCustom) {
        state.dayAdditions[dateStr] = (state.dayAdditions[dateStr] || []).filter(i => i.id !== id);
        if (state.workouts[dateStr]) delete state.workouts[dateStr][id];
      } else {
        if (!state.dayRemovals[dateStr]) state.dayRemovals[dateStr] = [];
        if (!state.dayRemovals[dateStr].includes(id)) state.dayRemovals[dateStr].push(id);
        if (state.workouts[dateStr]) delete state.workouts[dateStr][id];
        if (state.dailyChecks[dateStr]) delete state.dailyChecks[dateStr][id];
      }
      persist();
      refresh();
    });
  });

  if (!isFuture) {
    el.querySelectorAll('.day-sched-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const id   = itemEl.dataset.id;
        const type = itemEl.dataset.type;
        const cat  = itemEl.dataset.cat;
        const wid  = itemEl.dataset.wid;
        const schedItem = schedule.find(s => s.id === id);

        if (type === 'workout') {
          if (isWorkoutComplete(dateStr, wid)) {
            unlogWorkout(dateStr, wid);
            refresh();
          } else if (cat === 'cf') {
            openCfModal(wid, schedItem?.label || 'CrossFit', dateStr, refresh);
          } else {
            logWorkout(dateStr, wid);
            refresh();
          }
        } else {
          if (id === 'wake') {
            openWakeModal(dateStr, schedItem, refresh);
          } else if (id === 'lights') {
            openLightsModal(dateStr, schedItem, refresh);
          } else {
            if (!state.dailyChecks[dateStr]) state.dailyChecks[dateStr] = {};
            if (state.dailyChecks[dateStr][id]) delete state.dailyChecks[dateStr][id];
            else state.dailyChecks[dateStr][id] = true;
            persist();
            renderWeekDaySchedule(dateStr);
          }
        }
      });
    });
  }
}

// ════════════════════════════════════════
// RENDER – MONTH VIEW
// ════════════════════════════════════════

function renderMonthView() {
  if (!state.monthViewDate) state.monthViewDate = todayStr().substring(0, 7);
  const [y, m] = state.monthViewDate.split('-').map(Number);
  const monthName = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  document.getElementById('month-nav-title').textContent = monthName;
  const today = todayStr();
  const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(y, m, 0).getDate();
  const grid = document.getElementById('month-grid');
  let html = '';
  for (let i = 0; i < firstDow; i++) html += `<div class="month-cell month-empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === today;
    const isSel = dateStr === state.challengeSelectedDate;
    const cls = challengeWeekCircleClass(dateStr);
    const bg = cls === 'wk-complete' ? '#22c55e'
             : cls === 'wk-today'   ? '#eab308'
             : cls === 'wk-missed'  ? '#2a2a2a'
             : cls === 'rest'       ? '#1a1a1a'
             : '#222'; // future
    const dim = cls === 'future' || cls === 'rest';
    html += `<div class="month-cell ${isToday ? 'month-today' : ''} ${isSel ? 'month-sel' : ''}" data-date="${dateStr}">
      <div class="month-day-circle" style="background:${bg};${dim ? 'opacity:.3;' : ''}">
        <span class="month-day-num">${d}</span>
      </div>
    </div>`;
  }
  grid.innerHTML = html;
  document.getElementById('month-prev-btn').onclick = () => {
    let mo = m - 1, yr = y;
    if (mo < 1) { mo = 12; yr--; }
    state.monthViewDate = `${yr}-${String(mo).padStart(2,'0')}`;
    renderMonthView();
  };
  document.getElementById('month-next-btn').onclick = () => {
    let mo = m + 1, yr = y;
    if (mo > 12) { mo = 1; yr++; }
    state.monthViewDate = `${yr}-${String(mo).padStart(2,'0')}`;
    renderMonthView();
  };
  grid.querySelectorAll('.month-cell[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      state.challengeSelectedDate = cell.dataset.date;
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('btn-day-view').classList.add('active');
      document.getElementById('day-view').classList.remove('hidden');
      document.getElementById('week-view').classList.add('hidden');
      document.getElementById('month-view').classList.add('hidden');
      state.challengeView = 'day';
      renderDayViewInChallenge();
    });
  });
}

// Compact checklist used in Week view day panel
function renderOldStyleSchedule(dateStr, listEl) {
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
    const time = logged?.time || '';
    return `
      <div class="sched-item ${done ? 'sched-done' : ''} ${isFuture ? 'sched-future' : ''}"
           data-date="${dateStr}" data-workout="${w.id}">
        <div class="sched-check ${w.cat} ${done ? 'checked' : ''}"></div>
        <div class="sched-text">
          <span class="sched-name ${done ? 'sched-strike' : ''}">${w.label}</span>
          ${time ? `<span class="sched-time">${time}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  if (!isFuture) {
    listEl.querySelectorAll('.sched-item').forEach(item => {
      item.addEventListener('click', () => {
        const wid  = item.dataset.workout;
        const dstr = item.dataset.date;
        const w = sched.find(x => x.id === wid);
        if (isWorkoutComplete(dstr, wid)) {
          unlogWorkout(dstr, wid);
          renderWeekViewInChallenge();
          renderTrackerTab();
          document.getElementById('streak-count').textContent = getCurrentStreak();
        } else if (w.cat === 'cf') {
          openCfModal(wid, w.label, dstr, () => {
            renderWeekViewInChallenge();
            renderTrackerTab();
            document.getElementById('streak-count').textContent = getCurrentStreak();
          });
        } else {
          logWorkout(dstr, wid);
          renderWeekViewInChallenge();
          renderTrackerTab();
          document.getElementById('streak-count').textContent = getCurrentStreak();
        }
      });
    });
  }
}

// ════════════════════════════════════════
// RENDER – TRACKER TAB
// ════════════════════════════════════════

function renderTrackerTab() {
  const container = document.getElementById('weekly-snapshot-container');

  if (!state.startDate) {
    container.innerHTML = buildSnapshotCard(getMonday(todayStr()), 1, true);
    return;
  }

  const today = todayStr();
  const currentWeekStart = getMonday(today);
  const programMonday = getMonday(state.startDate);
  const daysDiff = Math.floor((strToDate(currentWeekStart) - strToDate(programMonday)) / 86400000);
  const currentWeekNum = Math.max(1, Math.min(Math.floor(daysDiff / 7) + 1, WEEKS));

  let html = buildSnapshotCard(currentWeekStart, currentWeekNum, true);
  for (let w = currentWeekNum - 1; w >= 1; w--) {
    const weekStart = addDays(programMonday, (w - 1) * 7);
    html += buildSnapshotCard(weekStart, w, false);
  }
  container.innerHTML = html;
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
    const cfNotes = logged?.notes || '';
    const time = logged?.time || '';
    return `
      <div class="workout-check-item ${done ? 'completed' : ''}" data-date="${dateStr}" data-workout="${w.id}" data-cat="${w.cat}">
        <div class="check-box ${w.cat} ${done ? 'checked' : ''}"></div>
        <div class="check-label">
          <div class="check-name ${done ? 'strike' : ''}">${w.label}</div>
          ${time ? `<div class="check-meta">${time}</div>` : ''}
          ${cfNotes ? `<div class="check-meta" style="color:var(--text-3);font-style:italic">"${escHtml(cfNotes)}"</div>` : ''}
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.workout-check-item').forEach(item => {
    item.addEventListener('click', () => {
      const wid  = item.dataset.workout;
      const dstr = item.dataset.date;
      const cat  = item.dataset.cat;
      const w = sched.find(x => x.id === wid);
      if (isWorkoutComplete(dstr, wid)) {
        unlogWorkout(dstr, wid);
        renderTrackerTab();
        if (dstr === todayStr()) renderDayViewInChallenge();
        document.getElementById('streak-count').textContent = getCurrentStreak();
      } else if (cat === 'cf') {
        openCfModal(wid, w.label, dstr, () => {
          renderTrackerTab();
          if (dstr === todayStr()) renderDayViewInChallenge();
          document.getElementById('streak-count').textContent = getCurrentStreak();
        });
      } else {
        logWorkout(dstr, wid);
        renderTrackerTab();
        if (dstr === todayStr()) renderDayViewInChallenge();
        document.getElementById('streak-count').textContent = getCurrentStreak();
      }
    });
  });
}

function loadSleepForm() {
  const dateStr = state.trackerSelectedDate;
  const existing = state.sleep[dateStr];

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

function buildSnapshotCard(weekStart, weekNum, isCurrent) {
  const today = todayStr();
  const counts = weeklyBreakdown(weekStart);

  const days = getWeekDays(weekStart);
  const sleepEntries = days
    .filter(d => d <= today && (!state.startDate || d >= state.startDate))
    .map(d => state.sleep[d])
    .filter(s => s && s.hours);
  const avgSleep = sleepEntries.length
    ? (sleepEntries.reduce((sum, s) => sum + parseFloat(s.hours), 0) / sleepEntries.length).toFixed(1)
    : null;

  const label = isCurrent ? `WEEK ${weekNum} · CURRENT` : `WEEK ${weekNum}`;

  return `
    <div class="snapshot-card ${isCurrent ? 'snapshot-current' : ''}">
      <div class="snapshot-week-label">${label}</div>
      <div class="snapshot-grid">
        <div class="snap-stat">
          <div class="snap-icon">🏋️</div>
          <div class="snap-val cf-color">${counts.cf}</div>
          <div class="snap-lbl">CrossFit</div>
        </div>
        <div class="snap-stat">
          <div class="snap-icon">🧘</div>
          <div class="snap-val yoga-color">${counts.yoga}</div>
          <div class="snap-lbl">Hot Yoga</div>
        </div>
        <div class="snap-stat">
          <div class="snap-icon">👟</div>
          <div class="snap-val other-color">${counts.other}</div>
          <div class="snap-lbl">Other</div>
        </div>
        <div class="snap-stat">
          <div class="snap-icon">😴</div>
          <div class="snap-val">${avgSleep !== null ? avgSleep : '—'}</div>
          <div class="snap-lbl">Avg Sleep Hrs</div>
        </div>
      </div>
    </div>`;
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
    const badge = book.completed ? '<span class="book-complete-badge">✓</span>' : '';
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
            ${badge}
          </div>
          ${book.author ? `<div class="book-author">${escHtml(book.author)}${book.weeks ? ' · <span class="book-weeks">' + escHtml(book.weeks) + '</span>' : ''}</div>` : ''}
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

const GRID_CF_COLOR    = '#ef4444';
const GRID_DIM         = '#222';

function progressCircleStyle(dateStr) {
  const today = todayStr();
  if (dateStr > today || (state.startDate && dateStr < state.startDate)) return null;
  const sched = effectiveWorkoutsForDate(dateStr);
  if (!sched.length) return null;
  const data = workoutDataForDate(dateStr);
  const cfDone    = sched.some(w => w.cat === 'cf'    && data[w.id]?.done);
  const yogaDone  = sched.some(w => w.cat === 'yoga'  && data[w.id]?.done);
  const otherDone = sched.some(w => w.cat === 'other' && data[w.id]?.done);
  if (!cfDone && !yogaDone && !otherDone) return 'background:#2a2a2a';
  const GREY = '#333';
  const yoga  = yogaDone  ? '#a855f7' : GREY;
  const other = otherDone ? '#22c55e' : GREY;
  const cf    = cfDone    ? GRID_CF_COLOR : GREY;
  // Hot Yoga: top-right (0-120°), Other: bottom (120-240°), CF: top-left (240-360°)
  return `background:conic-gradient(${yoga} 0deg 120deg, ${other} 120deg 240deg, ${cf} 240deg 360deg)`;
}

function renderProgressTab() {
  const today = todayStr();
  const streak = getCurrentStreak();
  const day = Math.max(1, Math.min(programDay(today), PROGRAM_DAYS));

  if (day > PROGRAM_DAYS && !document.getElementById('recap-card')) {
    const recap = document.createElement('div');
    recap.id = 'recap-card';
    recap.className = 'recap-card';
    recap.innerHTML = `
      <div class="recap-title"><span>Program Complete! 🏆</span></div>
      <div class="recap-sub">84 Days. You showed up.</div>
      <div class="recap-stats">
        <div class="recap-stat"><div class="recap-stat-val">${streak}</div><div class="recap-stat-lbl">Best Streak</div></div>
        <div class="recap-stat"><div class="recap-stat-val">${state.books.filter(b => b.completed).length}</div><div class="recap-stat-lbl">Books Read</div></div>
      </div>`;
    document.getElementById('challenge-grid-section').prepend(recap);
  }

  renderChallengeGrid();
  renderSleepGrid();

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
    const weekMonday = getMonday(weekAnchorDate);
    const days = getWeekDays(weekMonday);

    html += `<div class="grid-week-row"><div class="grid-week-label">${w}</div>`;
    days.forEach(d => {
      const isToday = d === today;
      const gradient = progressCircleStyle(d);
      let cls = '';
      let styleAttr = '';
      if (gradient) {
        styleAttr = `style="background:${gradient}"`;
      } else {
        const isFuture = d > today || (state.startDate && d < state.startDate);
        const sched = effectiveWorkoutsForDate(d);
        cls = isFuture ? 'future' : (!sched.length ? 'rest' : '');
      }
      html += `<div class="grid-circle ${cls} ${isToday ? 'today-ring' : ''}" ${styleAttr}></div>`;
    });
    html += `</div>`;
  }
  grid.innerHTML = html;
}

function renderSleepGrid() {
  const grid = document.getElementById('sleep-grid');
  if (!grid) return;
  if (!state.startDate) {
    grid.innerHTML = '';
    return;
  }
  const today = todayStr();
  let html = '';

  for (let w = 1; w <= WEEKS; w++) {
    const weekAnchorDate = addDays(state.startDate, (w - 1) * 7);
    const weekMonday = getMonday(weekAnchorDate);
    const days = getWeekDays(weekMonday);

    html += `<div class="grid-week-row"><div class="grid-week-label">${w}</div>`;
    days.forEach(d => {
      const isToday = d === today;
      const isFuture = d > today || d < state.startDate;
      const sleep = state.sleep[d];
      let cls = isFuture ? 'future' : '';
      let styleAttr = '';
      let inner = '';

      if (!isFuture && (sleep?.quality || sleep?.hours)) {
        const bg = sleep.quality === 'Great' ? '#22c55e'
                 : sleep.quality === 'Poor'  ? '#ef4444'
                 : '#eab308';
        styleAttr = `style="background:${bg}"`;
        if (sleep.hours) inner = `<span class="grid-sleep-hrs">${sleep.hours}h</span>`;
      }

      html += `<div class="grid-circle ${cls} ${isToday ? 'today-ring' : ''}" ${styleAttr}>${inner}</div>`;
    });
    html += `</div>`;
  }
  grid.innerHTML = html;
}

// ════════════════════════════════════════
// CF NOTES MODAL
// ════════════════════════════════════════

let cfPending = { date: null, workout: null, cb: null };

function openCfModal(workoutId, workoutLabel, dateStr, cb) {
  cfPending = { date: dateStr, workout: workoutId, cb };
  document.getElementById('cf-modal-sub').textContent = `${workoutLabel} · ${formatShortDate(dateStr)}`;
  document.getElementById('cf-notes-input').value = state.workouts[dateStr]?.[workoutId]?.notes || '';
  document.getElementById('cf-modal').classList.add('open');
  setTimeout(() => document.getElementById('cf-notes-input').focus(), 300);
}

function closeCfModal() {
  document.getElementById('cf-modal').classList.remove('open');
  cfPending = { date: null, workout: null, cb: null };
}

// ════════════════════════════════════════
// WAKE UP MODAL
// ════════════════════════════════════════

let wakePending = { date: null, item: null, cb: null };
let wakeSelectedQuality = null;

function openWakeModal(dateStr, schedItem, cb) {
  wakePending = { date: dateStr, item: schedItem, cb };
  wakeSelectedQuality = null;
  const existing = state.sleep[dateStr];
  document.getElementById('wake-modal-sub').textContent = schedItem ? `${schedItem.time} · ${schedItem.label}` : '';
  document.getElementById('wake-time-input').value = existing?.waketime || schedItem?.time?.replace(' AM','').replace(' PM','') || '';
  document.querySelectorAll('#wake-quality-row .sleep-q-btn').forEach(b => {
    b.classList.remove('selected');
    if (existing?.quality && b.dataset.quality === existing.quality) {
      b.classList.add('selected');
      wakeSelectedQuality = existing.quality;
    }
  });
  document.getElementById('wake-modal').classList.add('open');
}

function closeWakeModal() {
  document.getElementById('wake-modal').classList.remove('open');
  wakePending = { date: null, item: null, cb: null };
  wakeSelectedQuality = null;
}

// ════════════════════════════════════════
// LIGHTS OUT MODAL
// ════════════════════════════════════════

let lightsPending = { date: null, item: null, cb: null };

function openLightsModal(dateStr, schedItem, cb) {
  lightsPending = { date: dateStr, item: schedItem, cb };
  const existing = state.sleep[dateStr];
  document.getElementById('lights-time-input').value = existing?.bedtime || '';
  document.getElementById('lights-favpart-input').value = existing?.favPart || '';
  document.getElementById('lights-modal').classList.add('open');
}

function closeLightsModal() {
  document.getElementById('lights-modal').classList.remove('open');
  lightsPending = { date: null, item: null, cb: null };
}

// ════════════════════════════════════════
// ADD ITEM MODAL
// ════════════════════════════════════════

let addItemPending = { date: null, cb: null };
let addItemSelectedCat = 'other';

function openAddItemModal(dateStr, cb) {
  addItemPending = { date: dateStr, cb };
  addItemSelectedCat = 'other';
  document.getElementById('add-item-name-input').value = '';
  document.getElementById('add-item-time-input').value = '';
  document.querySelectorAll('.add-item-cat').forEach(b => {
    b.classList.toggle('selected', b.dataset.cat === 'other');
  });
  document.getElementById('add-item-other-group').classList.remove('hidden');
  document.getElementById('add-item-modal').classList.add('open');
  setTimeout(() => document.getElementById('add-item-name-input').focus(), 300);
}

function closeAddItemModal() {
  document.getElementById('add-item-modal').classList.remove('open');
  addItemPending = { date: null, cb: null };
}

// ════════════════════════════════════════
// ADD EVENT MODAL
// ════════════════════════════════════════

let addEventPending = { date: null, cb: null };

function openAddEventModal(dateStr, cb) {
  addEventPending = { date: dateStr, cb };
  document.getElementById('add-event-title-input').value = '';
  document.getElementById('add-event-time-input').value = '';
  document.getElementById('add-event-note-input').value = '';
  document.getElementById('add-event-modal').classList.add('open');
  setTimeout(() => document.getElementById('add-event-title-input').focus(), 300);
}

function closeAddEventModal() {
  document.getElementById('add-event-modal').classList.remove('open');
  addEventPending = { date: null, cb: null };
}

// ════════════════════════════════════════
// FEEL MODAL (kept for backwards compat, not actively triggered)
// ════════════════════════════════════════

let feelCallback = null;
let feelPending = { date: null, workout: null, selectedFeel: null };

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
  document.getElementById('settings-notif-switch').classList.toggle('on', state.notifEnabled);
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

  document.getElementById('streak-count').textContent = getCurrentStreak();

  switchTab('challenge');

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
    document.getElementById('month-view').classList.toggle('hidden', view !== 'month');
    if (view === 'month') renderMonthView();
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

  // Wake quality picker
  document.querySelectorAll('#wake-quality-row .sleep-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#wake-quality-row .sleep-q-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wakeSelectedQuality = btn.dataset.quality;
    });
  });

  // Wake modal confirm
  document.getElementById('wake-confirm-btn').addEventListener('click', () => {
    if (!wakePending.date) return;
    const waketime = document.getElementById('wake-time-input').value;
    const quality = wakeSelectedQuality || 'OK';
    const dateStr = wakePending.date;
    if (!state.sleep[dateStr]) state.sleep[dateStr] = {};
    state.sleep[dateStr].waketime = waketime;
    state.sleep[dateStr].quality = quality;
    // Hours = previous night's bedtime → this morning's wake time
    const prevDay = addDays(dateStr, -1);
    const prevBedtime = state.sleep[prevDay]?.bedtime;
    const hours = calcSleepHours(prevBedtime, waketime);
    if (hours) state.sleep[dateStr].hours = hours;
    persist();
    const cb = wakePending.cb;
    closeWakeModal();
    if (cb) cb();
  });
  document.getElementById('wake-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('wake-modal')) closeWakeModal();
  });

  // Lights modal confirm
  document.getElementById('lights-confirm-btn').addEventListener('click', () => {
    if (!lightsPending.date) return;
    const bedtime = document.getElementById('lights-time-input').value;
    const favPart = document.getElementById('lights-favpart-input').value.trim();
    const dateStr = lightsPending.date;
    if (!state.sleep[dateStr]) state.sleep[dateStr] = {};
    state.sleep[dateStr].bedtime = bedtime;
    if (favPart) state.sleep[dateStr].favPart = favPart;
    // No hours here — tomorrow's wake up will close the loop
    persist();
    const cb = lightsPending.cb;
    closeLightsModal();
    if (cb) cb();
  });
  document.getElementById('lights-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('lights-modal')) closeLightsModal();
  });

  // Add item modal — category picker
  document.querySelectorAll('.add-item-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.add-item-cat').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      addItemSelectedCat = btn.dataset.cat;
      document.getElementById('add-item-other-group').classList.toggle('hidden', addItemSelectedCat !== 'other');
    });
  });

  // Add item modal — confirm
  document.getElementById('add-item-confirm-btn').addEventListener('click', () => {
    if (!addItemPending.date) return;
    const cat = addItemSelectedCat || 'other';
    let label = cat === 'cf' ? 'CrossFit' : cat === 'yoga' ? 'Hot Yoga' : document.getElementById('add-item-name-input').value.trim();
    if (cat === 'other' && !label) { document.getElementById('add-item-name-input').focus(); return; }
    const id = `custom_${Date.now()}`;
    const timeRaw = document.getElementById('add-item-time-input').value;
    const time = timeRaw ? formatTimeDisplay(timeRaw) : '';
    const item = { id, wid: id, label, cat, type: 'workout', time, isCustom: true };
    const dateStr = addItemPending.date;
    if (!state.dayAdditions[dateStr]) state.dayAdditions[dateStr] = [];
    state.dayAdditions[dateStr].push(item);
    persist();
    const cb = addItemPending.cb;
    closeAddItemModal();
    if (cb) cb();
  });
  document.getElementById('add-item-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('add-item-modal')) closeAddItemModal();
  });
  document.getElementById('add-item-cancel-btn').addEventListener('click', closeAddItemModal);

  // Add event modal — confirm
  document.getElementById('add-event-confirm-btn').addEventListener('click', () => {
    if (!addEventPending.date) return;
    const title = document.getElementById('add-event-title-input').value.trim();
    if (!title) { document.getElementById('add-event-title-input').focus(); return; }
    const timeVal = document.getElementById('add-event-time-input').value;
    const timeStr = fmt24to12(timeVal);
    const notes = document.getElementById('add-event-note-input').value.trim();
    const id = `event_${Date.now()}`;
    const item = { id, wid: id, label: title, cat: 'routine', type: 'event', time: timeStr, notes: notes || null, isCustom: true };
    const dateStr = addEventPending.date;
    if (!state.dayAdditions[dateStr]) state.dayAdditions[dateStr] = [];
    state.dayAdditions[dateStr].push(item);
    persist();
    const cb = addEventPending.cb;
    closeAddEventModal();
    if (cb) cb();
  });
  document.getElementById('add-event-cancel-btn').addEventListener('click', closeAddEventModal);
  document.getElementById('add-event-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('add-event-modal')) closeAddEventModal();
  });

  // Settings back button
  document.getElementById('settings-back-btn').addEventListener('click', closeSettings);

  // Add book button
  document.getElementById('add-book-btn').addEventListener('click', openAddBookModal);

  // Book modal save
  document.getElementById('book-save-btn').addEventListener('click', () => {
    const title = document.getElementById('book-title-input').value.trim();
    if (!title) { document.getElementById('book-title-input').focus(); return; }
    const startDate = document.getElementById('book-start-input').value;
    const book = { id: Date.now().toString(), title, startDate, finishDate: null, completed: false, notes: [] };
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

  // Feel modal — close only (not actively used for logging anymore)
  document.querySelectorAll('.feel-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.feel-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      feelPending.selectedFeel = opt.dataset.feel;
    });
  });
  document.getElementById('feel-confirm-btn').addEventListener('click', closeFeelModal);
  document.getElementById('feel-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('feel-modal')) closeFeelModal();
  });

  // CF notes modal
  document.getElementById('cf-notes-save').addEventListener('click', () => {
    if (!cfPending.date || !cfPending.workout) return;
    const notes = document.getElementById('cf-notes-input').value.trim();
    logWorkout(cfPending.date, cfPending.workout, notes || null);
    const cb = cfPending.cb;
    closeCfModal();
    if (cb) cb();
  });
  document.getElementById('cf-notes-skip').addEventListener('click', () => {
    if (!cfPending.date || !cfPending.workout) return;
    logWorkout(cfPending.date, cfPending.workout, null);
    const cb = cfPending.cb;
    closeCfModal();
    if (cb) cb();
  });
  document.getElementById('cf-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('cf-modal')) closeCfModal();
  });

  // Close book modals by backdrop
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
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch {}
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
