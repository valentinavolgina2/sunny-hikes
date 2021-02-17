const User = require('../models/user');
const ExpressError = require('../utils/ExpressError'); 

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
            req.flash('success', 'Welcome to Seattle Sunny Seekers!');
            res.redirect('/hikes');
        });

    } catch (e) { 
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        if (!newPassword || newPassword == "") { 
            throw new ExpressError(`New password is not defined.`, 400);
        }
        if (!password || password == "") { 
            throw new ExpressError(`Old password is not defined.`, 400);
        }
        const user = await User.findById(req.user._id);
        await user.changePassword(password, newPassword);
        await user.save();

        req.flash('success', 'Password was updated!');
        res.redirect('/hikes');

    } catch (e) { 
        req.flash('error', 'Password is incorrect! Try again.');
        res.redirect('/profile');
    }
}

module.exports.updateUser = async (req, res) => {
    
    try {
        const { email, username} = req.body;
        const user = await User.findById(req.user._id);
        
        if (email) { 
            const userWithEmail = await User.findOne({ email: email });
            if (userWithEmail && !userWithEmail._id.equals(user._id)) {
                throw new ExpressError(`User with email ${email} already exists. Try another email.`, 400);
            }
            user.email = email;
        }
        if (username) { 
            const userWithUsername = await User.findOne({ username: username });
            if (userWithUsername) { 
                throw new ExpressError(`User with username ${username} already exists. Try another username.`, 400);
            }
            user.username = username;
        }
        await user.save();
        req.flash('success', 'Profile information was updated!');
        res.redirect('/hikes');

    } catch (e) { 
        req.flash('error', e.message);
        res.redirect('/profile');
    }

}

module.exports.getLoginForm = (req, res) => { 
    res.render('users/login');
}

module.exports.getProfileForm = (req, res) => { 
    res.render('users/edit');
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