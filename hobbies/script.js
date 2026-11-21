// Keep anchor targets clear of the sticky header, including after text wrapping.
const header = document.querySelector('header');
const updateHeaderHeight = () => {
  document.documentElement.style.setProperty('--header-height', header.getBoundingClientRect().height + 'px');
};
updateHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);
else window.addEventListener('resize', updateHeaderHeight);

// Activities share one language selector; switching preserves open cards and roles.
const activities = document.querySelector('#activities');
const activityLanguage = activities.querySelector('.activities-language');
const activityTexts = Array.from(activities.querySelectorAll('[data-activity-ru]'), (element) => ({
  element, en: element.textContent, ru: element.dataset.activityRu
}));
activityLanguage.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-activities-language]');
  if (!button) return;
  const language = button.dataset.activitiesLanguage;
  activityTexts.forEach(({element, en, ru}) => {
    element.textContent = language === 'ru' ? ru : en;
    element.lang = language;
  });
  activityLanguage.querySelectorAll('button').forEach((option) => {
    option.setAttribute('aria-pressed', String(option === button));
  });
});
activityLanguage.hidden = false;

// Use a deadline so delayed background-tab ticks do not slow the countdown.
const timer = document.querySelector('.activity-timer');
const timerDisplay = timer.querySelector('.timer-display');
const timerToggle = timer.querySelector('.timer-toggle');
const timerReset = timer.querySelector('.timer-reset');
const timerStatus = timer.querySelector('.timer-status');
const timerDuration = 120000;
let remaining = timerDuration;
let deadline = 0;
let timerInterval = null;
let timerAudio;

const renderTimer = () => {
  const seconds = Math.ceil(remaining / 1000);
  timerDisplay.textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
};
const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};
const soundTimer = () => {
  if (!timerAudio || timerAudio.state !== 'running') return;
  try {
    for (let i = 0; i < 3; i++) {
      const oscillator = timerAudio.createOscillator();
      const gain = timerAudio.createGain();
      const start = timerAudio.currentTime + i * 0.35;
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      oscillator.connect(gain);
      gain.connect(timerAudio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.26);
    }
  } catch (_) { /* The visual completion message remains available without audio. */ }
};
const tickTimer = () => {
  remaining = Math.max(0, deadline - Date.now());
  renderTimer();
  if (remaining === 0) {
    stopTimer();
    timerToggle.textContent = 'Start';
    timer.dataset.finished = 'true';
    timerStatus.textContent = 'Time’s up!';
    soundTimer();
  }
};
timerToggle.addEventListener('click', () => {
  if (timerInterval !== null) {
    tickTimer();
    stopTimer();
    if (remaining > 0) {
      timerToggle.textContent = 'Resume';
      timerStatus.textContent = 'Paused';
    }
    return;
  }
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      if (!timerAudio) timerAudio = new AudioContext();
      if (timerAudio.state === 'suspended') timerAudio.resume().catch(() => {});
    }
  } catch (_) { /* Audio support is optional. */ }
  if (remaining === 0) remaining = timerDuration;
  timer.dataset.finished = 'false';
  timerStatus.textContent = '';
  deadline = Date.now() + remaining;
  timerToggle.textContent = 'Pause';
  renderTimer();
  timerInterval = setInterval(tickTimer, 200);
});
timerReset.addEventListener('click', () => {
  stopTimer();
  remaining = timerDuration;
  timerToggle.textContent = 'Start';
  timerStatus.textContent = '';
  timer.dataset.finished = 'false';
  renderTimer();
});
document.addEventListener('visibilitychange', () => {
  if (timerInterval !== null) tickTimer();
});
timer.hidden = false;

