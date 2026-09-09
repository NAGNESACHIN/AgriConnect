const slotGrid = document.getElementById('slotGrid');
const refreshBtn = document.getElementById('refreshBtn');

async function loadSlots() {
  slotGrid.innerHTML = '<div class="loading">Loading procurement centres…</div>';
  try {
    const response = await fetch('/api/procurement/slots');
    const result = await response.json();
    slotGrid.innerHTML = result.data.map(slot => {
      const used = Math.round((slot.booked / slot.capacity) * 100);
      const limited = slot.capacity - slot.booked < 15;
      return `<article class="slot">
        <div class="slot-head"><span class="eyebrow">${slot.date}</span><span class="pill ${limited ? 'limited' : ''}">${limited ? 'Limited' : 'Open'}</span></div>
        <h3>${slot.centre}</h3>
        <p>${slot.time} · ${slot.capacity - slot.booked} spaces remaining</p>
        <div class="capacity"><i style="width:${used}%"></i></div>
        <button data-slot="${slot.id}">Book ${slot.time} →</button>
      </article>`;
    }).join('');
    document.querySelectorAll('[data-slot]').forEach(button => button.addEventListener('click', () => bookSlot(button.dataset.slot)));
  } catch (error) {
    slotGrid.innerHTML = '<div class="loading">Could not load slots. Check that the server is running.</div>';
  }
}

async function bookSlot(slotId) {
  const farmerName = window.prompt('Farmer name');
  if (!farmerName) return;
  const crop = window.prompt('Crop (e.g. wheat, rice, maize)');
  if (!crop) return;
  const quantity = window.prompt('Quantity in kg');
  if (!quantity) return;
  try {
    const response = await fetch('/api/procurement/book', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ farmerName, crop, quantity: Number(quantity), slotId })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Booking failed');
    alert(`Booking confirmed: ${result.booking.bookingId}\n${result.booking.centre}\n${result.booking.date} at ${result.booking.time}`);
    loadSlots();
  } catch (error) { alert(error.message); }
}

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const messages = document.getElementById('messages');

function addMessage(text, type) {
  const el = document.createElement('div');
  el.className = `bubble ${type}`;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  chatInput.value = '';
  addMessage('Thinking…', 'bot');
  const pending = messages.lastElementChild;
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ message })
    });
    const result = await response.json();
    pending.textContent = result.reply || result.message || 'I could not answer that right now.';
  } catch (_error) {
    pending.textContent = 'The assistant is temporarily unavailable. Please try again.';
  }
});

refreshBtn.addEventListener('click', loadSlots);
loadSlots();
