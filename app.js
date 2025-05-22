const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt'); // ← Lagt till
require('dotenv').config();

const app = express();
const PORT = 3000;

// Supabase-anslutning
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static('public'));
app.use('/login_static', express.static(path.join(__dirname, 'publicLogin')));
app.use('/register_static', express.static(path.join(__dirname, 'publicRegister')));
app.use('/index_static', express.static(path.join(__dirname, 'publicIndex')));
app.use('/public_static', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Sessionshantering
app.use(session({
  secret: 'hemlig-nyckel',
  resave: false,
  saveUninitialized: false,
}));


// Startsida
app.get('/', (req, res) => {
  res.redirect('/index');
});

// Index-sida som använder session
app.get('/index', (req, res) => {
  console.log("Session på /index:", req.session);
  res.render('index', { session: req.session });
});

// Inloggningssida
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Hantering av inloggning
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.render('login', { error: 'Fel e-post eller lösenord.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.render('login', { error: 'Fel e-post eller lösenord.' });
  }

  // Spara inloggning i session
  req.session.loggedIn = true;
  req.session.username = user.name;
  req.session.user_id = user.user_id;

  req.session.save(() => {
    res.redirect('/index');
  });
  
});

// Utloggning
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Något gick fel vid utloggning.');
    }
    res.redirect('/index');
  });
});

// Registreringssida
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Hantering av registrering
app.post('/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;


  // Kräver säkrare lösenord
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.render('register', { error: 'Lösenordet måste vara minst 8 tecken långt, innehålla minst en stor bokstav och minst en siffra.' });
  }

  // Kontrollera om e-post redan finns
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.render('register', { error: 'E-postadressen är redan registrerad.' });
  }

  // Hasha lösenordet
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Lägg till användare
  const { error: insertError } = await supabase
    .from('users')
    .insert([
      {
        name: firstname,
        last_name: lastname,
        email: email,
        password_hash: hashedPassword,
        auth: 'user'
      }
    ]);

  if (insertError) {
    return res.render('register', { error: 'Kunde inte skapa konto. Försök igen.' });
  }

  res.redirect('/login');
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});

// foodgalleri

app.get('/galleri', (req, res) => {
  if (req.session.loggedIn) {
    res.render('galleri', { session: req.session });
  } else {
    res.redirect('/login');
  }
});

//sushi meny

app.get('/menyer/sushi', (req, res) => {
  if (req.session.loggedIn) {
    res.render('sushi', { session: req.session })
  } else {
    res.redirect('/index');
  }
});


