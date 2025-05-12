// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'publicLogin')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('users') 
    .select('*')
    .eq('email', email)
    .eq('password_hash', password) 
    .single();

  if (error || !data) {
    return res.render('login', { error: 'Fel e-post eller lösenord.' });
  }

  res.send(`Välkommen, ${data.email}!`);
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
