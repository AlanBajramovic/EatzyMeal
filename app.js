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
app.use(express.static('public'));
app.use('/login_static', express.static(path.join(__dirname, 'publicLogin')));
app.use('/register_static', express.static(path.join(__dirname, 'publicRegister')));
app.use('/public_static', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect('/login');
});

// Inloggning
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

  res.send(`Välkommen, ${data.name}!`);
});

// Registrering
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // Kontrollera om e-post redan finns
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.render('register', { error: 'E-postadressen är redan registrerad.' });
  }

  // Lägg till användare
  const { error: insertError } = await supabase
    .from('users')
    .insert([
      {
        name: firstname,
        last_name: lastname,
        email: email,
        password_hash: password, 
        auth: 'user'        
      }
    ]);

  if (insertError) {
    return res.render('register', { error: 'Kunde inte skapa konto. Försök igen.' });
  }

  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
