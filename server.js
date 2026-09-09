require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const procurementSlots = [
  { id: 'AC-101', centre: 'Pune Central Procurement Centre', date: '2026-09-12', time: '09:00 AM', capacity: 80, booked: 54, status: 'Open' },
  { id: 'AC-102', centre: 'Baramati Grain Centre', date: '2026-09-12', time: '11:30 AM', capacity: 60, booked: 49, status: 'Limited' },
  { id: 'AC-103', centre: 'Nashik Market Yard', date: '2026-09-13', time: '10:00 AM', capacity: 100, booked: 31, status: 'Open' }
];

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'AgriConnect API', time: new Date().toISOString() });
});

app.get('/api/procurement/slots', (_req, res) => {
  res.json({ success: true, data: procurementSlots });
});

app.post('/api/procurement/book', (req, res) => {
  const { farmerName, crop, quantity, slotId } = req.body || {};
  if (!farmerName || !crop || !quantity || !slotId) {
    return res.status(400).json({ success: false, message: 'farmerName, crop, quantity and slotId are required.' });
  }
  const slot = procurementSlots.find((item) => item.id === slotId);
  if (!slot) return res.status(404).json({ success: false, message: 'Procurement slot not found.' });
  if (slot.booked >= slot.capacity) return res.status(409).json({ success: false, message: 'This slot is full.' });
  slot.booked += 1;
  res.status(201).json({
    success: true,
    booking: {
      bookingId: `AGR-${Date.now()}`,
      farmerName,
      crop,
      quantity,
      slotId,
      centre: slot.centre,
      date: slot.date,
      time: slot.time,
      status: 'Confirmed'
    }
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      success: true,
      mode: 'demo',
      reply: 'AI is not configured yet. Add OPENAI_API_KEY to your .env file to enable the live agricultural assistant. I can still help with procurement slots, booking, marketplace navigation and farmer workflows.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        instructions: 'You are AgriConnect Assistant. Give concise, practical answers for Indian farmers and buyers. Help with procurement scheduling, crop selling, marketplace usage, payments and general agriculture. Do not invent government prices, schemes or official status; clearly label estimates and advise users to verify official information.',
        input: message
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI error:', data);
      return res.status(502).json({ success: false, message: 'AI provider request failed.' });
    }

    const reply = data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text || '').filter(Boolean).join('\n') || 'I could not generate a response.';
    res.json({ success: true, mode: 'live', reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'AI service is temporarily unavailable.' });
  }
});

app.use((_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`AgriConnect running on http://localhost:${PORT}`));
