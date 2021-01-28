const User = require('../models/user');

module.exports.getRegisterForm = (req, res) => { 
    res.render('users/register');
} 

module.exports.createUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => { 
            if (err) return next(err);
            req.flash('success', 'Welcome to Nafanya website!');
            res.redirect('/hikes');
        });

    } catch (e) { 
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.getLoginForm = (req, res) => { 
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/hikes';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => { 
    req.logout();
    req.flash('success','Goodbye!');
    res.redirect('/hikes');
}