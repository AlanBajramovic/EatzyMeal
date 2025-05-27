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

app.use(express.json());


// Sessionshantering

app.use(session({
  secret: 'hemlig-nyckel',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true
  }
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

//a

function ensureLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  res.redirect('/login');
}

app.get('/galleri', ensureLoggedIn, (req, res) => {
  console.log('Session på /galleri:', req.session);
  res.render('galleri', { session: req.session });
});


// foodgalleri

app.get('/galleri', (req, res) => {
  console.log('Session på /galleri:', req.session);
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  res.render('galleri', { session: req.session });
  res.render('galleri', { session: { username: user.email } });

});


//sushi meny

app.get('/sushi', (req, res) => {
  if (req.session.loggedIn) {
    res.render('menyer/sushi', { session: req.session });
  } else {
    res.redirect('/login');
  }
});

//hamburger meny

app.get('/hamburger', (req, res) => {
  if (req.session.loggedIn) {
    res.render('menyer/hamburger', { session: req.session })
  } else {
    res.redirect('/login');
  }
});

//pizza meny
app.get('/pizza', (req, res) => {
  if (req.session.loggedIn) {
    res.render('menyer/pizza', { session: req.session })
  } else {
    res.redirect('/login');
  }
});

//noodle meny
app.get('/noodle', (req, res) => {
  if (req.session.loggedIn) {
    res.render('menyer/noodle', { session: req.session })
  } else {
    res.redirect('/login');
  }
});

//grill meny
app.get('/grill', (req, res) => {
  if (req.session.loggedIn) {
    res.render('menyer/grill', { session: req.session })
  } else {
    res.redirect('/login');
  }
});

//spagetthi meny
app.get('/spagetthi', (req, res) => {
  if (req.session.loggedIn) {
    res.render('menyer/spagetthi', { session: req.session })
  } else {
    res.redirect('/login');
  }
});

//kassa

app.get('/kassa', async (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.redirect('/login'); // Redirect if the user is not logged in
  }
});

app.post('/api/place-order', async (req, res) => {
  if (!req.session.loggedIn || !req.session.user_id) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }

  const userId = req.session.user_id;
  const items = req.body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items provided.' });
  }

  try {
    const mealIds = items.map(item => item.meal_id);
    const { data: meals, error: mealError } = await supabase
      .from('meals')
      .select('meal_id, price')
      .in('meal_id', mealIds);

    if (mealError || !meals) throw mealError;

    const mealPriceMap = {};
    meals.forEach(meal => {
      mealPriceMap[meal.meal_id] = parseFloat(meal.price);
    });

    const totalPrice = items.reduce((total, item) => {
      return total + (mealPriceMap[item.meal_id] || 0) * item.quantity;
    }, 0);

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        order_date: new Date().toISOString(),
        total_price: totalPrice,
        status: 'pending'
      }])
      .select('order_id')
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: newOrder.order_id,
      meal_id: item.meal_id,
      quantity: item.quantity,
      user_id: userId
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(200).json({ message: 'Order placed successfully!' });

  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Server error placing order.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});