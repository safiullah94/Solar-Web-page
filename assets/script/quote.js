document.addEventListener('DOMContentLoaded', () => {

  // ── Selection toggles ──────────────────────────────────────────────────
  const groups = {
    property : { input: document.getElementById('input-property'), summary: document.getElementById('summary-property') },
    bill     : { input: document.getElementById('input-bill'),     summary: document.getElementById('summary-bill')     },
    system   : { input: document.getElementById('input-system'),   summary: null },
  };

  document.querySelectorAll('.quote-option-btn, .quote-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const value = btn.dataset.value;
      if (!group || !groups[group]) return;

      // Deactivate siblings in same group
      document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update hidden input
      if (groups[group].input) groups[group].input.value = value;

      // Update summary display
      if (groups[group].summary) groups[group].summary.textContent = value;
    });
  });

  // ── Form submission ────────────────────────────────────────────────────
  const form        = document.getElementById('quote-form');
  const response    = document.getElementById('quote-response');
  const finalizeBtn = document.getElementById('quote-finalize-btn');
  if (!form || !response || !finalizeBtn) return;

  finalizeBtn.addEventListener('click', async () => {
    // Basic validation
    const name  = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();

    if (!name || !email) {
      response.textContent = 'Please fill in your name and email address.';
      response.className   = 'form-response error';
      setTimeout(() => { response.className = 'form-response'; }, 5000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      response.textContent = 'Please enter a valid email address.';
      response.className   = 'form-response error';
      setTimeout(() => { response.className = 'form-response'; }, 5000);
      return;
    }

    // Loading state
    finalizeBtn.disabled     = true;
    finalizeBtn.textContent  = 'Sending...';
    response.className       = 'form-response';

    try {
      const res  = await fetch(form.action, {
        method : 'POST',
        body   : new FormData(form),
      });
      const text = await res.text();

      if (res.ok) {
        response.textContent = text;
        response.className   = 'form-response success';
        form.reset();
        // Reset selections to defaults
        document.querySelectorAll('[data-group="property"]').forEach((b, i) => b.classList.toggle('active', i === 0));
        document.querySelectorAll('[data-group="bill"]').forEach((b, i)     => b.classList.toggle('active', i === 1));
        document.querySelectorAll('[data-group="system"]').forEach((b, i)   => b.classList.toggle('active', i === 2));
        document.getElementById('input-property').value = 'Residential';
        document.getElementById('input-bill').value     = '$500-1000';
        document.getElementById('input-system').value   = 'Hybrid System';
        document.getElementById('summary-property').textContent = 'Residential';
        document.getElementById('summary-bill').textContent     = '$500-1000';
      } else {
        response.textContent = text || 'An error occurred. Please try again.';
        response.className   = 'form-response error';
      }
    } catch {
      response.textContent = 'Could not connect to the server. Please try again.';
      response.className   = 'form-response error';
    }

    // Restore button
    finalizeBtn.disabled  = false;
    finalizeBtn.innerHTML = `Finalize Request <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;

    setTimeout(() => { response.className = 'form-response'; }, 5000);
  });

});