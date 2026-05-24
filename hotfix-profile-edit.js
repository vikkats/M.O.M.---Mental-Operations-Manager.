// Prevent ordinary form input changes from triggering the app-wide change handler.
// On mobile browsers, tapping Save can fire an input change before submit; the
// old handler re-rendered the form and erased the edited weight before saving.
document.addEventListener(
  "change",
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const isProfileFormInput = target.closest("#child-form, #medication-form");
    const isAppControlledChange = target.dataset.change || target.dataset.confirmation;

    if (isProfileFormInput && !isAppControlledChange) {
      event.stopImmediatePropagation();
    }
  },
  true
);
