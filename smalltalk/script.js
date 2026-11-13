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
