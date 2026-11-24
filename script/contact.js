document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('contact-form');
  const response   = document.getElementById('contact-response');
  const submitBtn  = document.getElementById('contact-submit');
  if (!form || !response) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Button loading state
    submitBtn.disabled = true;

    // Hide previous response
    response.className = 'form-response';
    response.style.display = 'none';
    response.textContent = '';

    try {
      const res  = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
      });
      const text = await res.text();

      if (res.ok) {
        response.textContent  = text;
        response.className    = 'form-response success';
        form.reset();
      } else {
        response.textContent  = text || 'An error occurred. Please try again.';
        response.className    = 'form-response error';
      }
    } catch {
      response.textContent  = 'Could not connect to the server. Please try again.';
      response.className    = 'form-response error';
    }

    // Restore button
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Send Message <span class="arrow-circle"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></span>`;

    // Auto-hide after 5s
    setTimeout(() => {
      response.className = 'form-response';
    }, 5000);
  });
});