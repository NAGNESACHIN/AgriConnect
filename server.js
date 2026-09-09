require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const procurementSlots = [
  { id: 'AC-101', centre: 'Pune Central Procurement Centre', date: '2026-09-12', time: '09:00 AM', capacity: 80, booked: 54, status: 'Open' },
  { id: 'AC-102', centre: 'Baramati Grain Centre', date: '2026-09-12', time: '11:30 AM', capacity: 60, booked: 49, status: 'Limited' },
  { id: 'AC-103', centre: 'Nashik Market Yard', date: '2026-09-13', time: '10:00 AM', capacity: 100, booked: 31, status: 'Open' }
];

const crops = [
  { id:'CR-001', name:'Premium Wheat', category:'Cereals', emoji:'🌾', price:25, quantity:1000, rating:4.8, farmer:'Ramesh Patil', description:'High-quality wheat suitable for flour and food processing.' },
  { id:'CR-002', name:'Basmati Rice', category:'Cereals', emoji:'🍚', price:48, quantity:800, rating:4.9, farmer:'Sunita Agro FPO', description:'Aromatic long-grain rice from a verified farmer group.' },
  { id:'CR-003', name:'Maize', category:'Cereals', emoji:'🌽', price:22, quantity:1200, rating:4.7, farmer:'Vijay More', description:'Fresh yellow maize with consistent grain quality.' },
  { id:'CR-004', name:'Onions', category:'Vegetables', emoji:'🧅', price:18, quantity:2000, rating:4.8, farmer:'Nashik Growers', description:'Firm onions packed for wholesale procurement.' },
  { id:'CR-005', name:'Tomatoes', category:'Vegetables', emoji:'🍅', price:24, quantity:500, rating:4.8, farmer:'Anita Shinde', description:'Fresh tomatoes harvested for same-week delivery.' },
  { id:'CR-006', name:'Potatoes', category:'Vegetables', emoji:'🥔', price:20, quantity:1500, rating:4.9, farmer:'Kisan Fresh', description:'Uniform-size potatoes for retail and processing.' },
  { id:'CR-007', name:'Mangoes', category:'Fruits', emoji:'🥭', price:70, quantity:300, rating:4.9, farmer:'Konkan Farms', description:'Premium seasonal mangoes with careful grading.' },
  { id:'CR-008', name:'Bananas', category:'Fruits', emoji:'🍌', price:30, quantity:800, rating:4.8, farmer:'Green Valley Farm', description:'Fresh bananas suited for bulk institutional buying.' },
  { id:'CR-009', name:'Tur Dal', category:'Pulses', emoji:'🫘', price:96, quantity:450, rating:4.7, farmer:'Sahyadri FPO', description:'Cleaned and graded pigeon pea for wholesale buyers.' },
  { id:'CR-010', name:'Chickpeas', category:'Pulses', emoji:'🫛', price:82, quantity:600, rating:4.8, farmer:'Matoshree Farms', description:'High-quality chickpeas with good shelf stability.' }
];

function readOffers(){try{return JSON.parse(fs.readFileSync(OFFERS_FILE,'utf8'));}catch{return []}}
function writeOffers(items){fs.writeFileSync(OFFERS_FILE, JSON.stringify(items,null,2))}

app.get('/api/health', (_req, res) => res.json({ ok:true, service:'AgriConnect API', time:new Date().toISOString() }));
app.get('/api/procurement/slots', (_req, res) => res.json({ success:true, data:procurementSlots }));
app.post('/api/procurement/book', (req,res)=>{
  const { farmerName, crop, quantity, slotId } = req.body || {};
  if(!farmerName || !crop || !quantity || !slotId) return res.status(400).json({success:false,message:'farmerName, crop, quantity and slotId are required.'});
  const slot=procurementSlots.find(x=>x.id===slotId); if(!slot)return res.status(404).json({success:false,message:'Procurement slot not found.'});
  if(slot.booked>=slot.capacity)return res.status(409).json({success:false,message:'This slot is full.'});
  slot.booked += 1;
  res.status(201).json({success:true,booking:{bookingId:`AGR-${Date.now()}`,farmerName,crop,quantity,slotId,centre:slot.centre,date:slot.date,time:slot.time,status:'Confirmed'}});
});

app.get('/api/crops', (_req,res)=>res.json({success:true,data:crops}));
app.get('/api/offers', (_req,res)=>res.json({success:true,data:readOffers()}));
app.post('/api/offers', (req,res)=>{
  const {cropId, quantity, offerPrice, note, role='buyer'} = req.body || {};
  const crop=crops.find(x=>x.id===cropId);
  if(!crop || !Number.isFinite(quantity) || quantity<=0 || !Number.isFinite(offerPrice) || offerPrice<=0) return res.status(400).json({success:false,message:'A valid crop, quantity and offer price are required.'});
  const offers=readOffers();
  const offer={id:`OFF-${Date.now()}`,cropId,cropName:crop.name,quantity,offerPrice,note:String(note||'').slice(0,500),role,status:'pending',createdAt:new Date().toISOString()};
  offers.push(offer);writeOffers(offers);res.status(201).json({success:true,offer});
});

app.post('/api/ai/chat', async (req,res)=>{
  const message=String(req.body?.message||'').trim();
  if(!message)return res.status(400).json({success:false,message:'Message is required.'});
  if(!process.env.OPENAI_API_KEY)return res.json({success:true,mode:'demo',reply:'AI is not configured yet. Add OPENAI_API_KEY to enable the live assistant. I can still help with procurement slots, marketplace navigation, offers and farmer workflows.'});
  try{
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5-mini',instructions:'You are AgriConnect Assistant for Indian farmers and buyers. Give concise practical guidance about procurement scheduling, crop selling, marketplace usage, offers, payments and general agriculture. Do not invent live prices or official government facts; clearly label estimates and advise verification.',input:message})});
    const data=await response.json();if(!response.ok)return res.status(502).json({success:false,message:'AI provider request failed.'});
    const reply=data.output_text||data.output?.flatMap(item=>item.content||[]).map(part=>part.text||'').filter(Boolean).join('\n')||'I could not generate a response.';res.json({success:true,mode:'live',reply});
  }catch(error){console.error(error);res.status(500).json({success:false,message:'AI service is temporarily unavailable.'});}
});

app.use((_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`AgriConnect running on http://localhost:${PORT}`));
