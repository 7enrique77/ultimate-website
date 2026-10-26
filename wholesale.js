const WHOLESALE_FORM_ENDPOINT = 'https://formspree.io/f/xaeqrvke';

const wholesaleForm = document.getElementById('wholesale-form');
const wholesaleConfirmation = document.getElementById('wholesale-confirmation');
const wholesaleError = document.getElementById('wholesale-error');

if (wholesaleForm) {
  wholesaleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(wholesaleForm);
    data.set('_subject', `Wholesale Inquiry - ${data.get('business-name')}`);
    data.set('_replyto', data.get('email'));

    const submitButton = wholesaleForm.querySelector('.wholesale-submit');
    submitButton.disabled = true;

    try {
      const res = await fetch(WHOLESALE_FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });

      if (!res.ok) throw new Error('Submission failed');

      wholesaleForm.hidden = true;
      wholesaleConfirmation.hidden = false;
    } catch (err) {
      if (wholesaleError) wholesaleError.hidden = false;
      submitButton.disabled = false;
    }
  });
}
