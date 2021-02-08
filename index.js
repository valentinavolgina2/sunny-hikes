if (process.env.NODE_ENV !== "production") { 
    require('dotenv').config();
}



const express = require('express'); //set up express
const path = require('path'); //set up ejs
const mongoose = require('mongoose'); //set up mongoose
const ejsMate = require('ejs-mate'); //ejs mate
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override'); // overriding method when submitting a form
const ExpressError = require('./utils/ExpressError'); // for error catching
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo')(session);

const hikeRoutes = require('./routes/hikes');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//DB_URL=mongodb+srv://admin_user:bnM8tcmz1HXYKQvm@cluster0.ayrym.mongodb.net/<dbname>?retryWrites=true&w=majority
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-hike';
//set up mongoose
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { 
    console.log('Database connected');
});

const app = express(); //set up express
app.engine('ejs', ejsMate); //ejs mate
app.set('view engine', 'ejs'); //set up ejs
app.set('views',path.join(__dirname,'views')); //set up ejs

// for req.body to be not empty (wjen submitting a form)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // overriding method when submitting a form
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
const secret = process.env.SECRET || 'somesecret';

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 3600 //in seconds
});

store.on("error", function (error) {
    console.log("Session store error", error);
})

const sessionConfig = {
    store,
    name: 'mysession',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
//        secure: true,  //open when deploying!!!!
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1 week
        maxAge:  1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//security
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlpn4rtaa/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//how to store and 'unstore' a user in a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//----------------------------

app.use((req, res, next) => { 
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/hikes', hikeRoutes);
app.use('/hikes/:id/reviews', reviewRoutes);

app.get('/', (req,res)=>{
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found',404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`listenning on ${port}`);
});