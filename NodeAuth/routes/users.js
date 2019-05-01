const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/user.js');

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.send('respond with a resource');
});

router.get('/register', (req, res, next) => {
    res.render('register', {
        'title': 'Register'
    });
});


router.get('/login', (req, res, next) => {
    res.render('login', {
        'title': 'Login'
    });
});

router.post('/register', (req, res, next) => {
    //Get form values
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;


    //Check for image field
    if (req.files.profileImage) {
        console.log('Uploading file...');

        //File Info
        const profileImageOriginalName = req.files.profileImage.originalName;
        var profileImageName = req.files.profileImage.name;
        const profileImageMime = req.files.profileImage.mimetype;
        const profileImagePath = req.files.profileImage.path;
        const profileImageext = req.files.profileImage.extension;
        const profileImageSize = req.files.profileImage.size;
    } else {
        //Set a default image
        var profileImageName = 'noImage.png';
    }

    //Form validation

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email not valid').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    //Check for errors
    const errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors,
            name,
            email,
            username,
            password,
            password2
        });
    } else {
        const newUser = new User({
            name,
            email,
            username,
            password,
            profileImage: profileImageName
        });

        //create user
        User.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user);
        });

        //Success message
        req.flash('success', 'You are now registered and may log in');

        res.location('/');
        res.redirect('/');
    }
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new localStrategy(
    (username, password, done) => {
        User.getUserByUsername(username, (err, user) => {
            if (err) throw err;
            if (!user) {
                console.log('Unknown user');
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user)
                } else {
                    console.log('Invalid Password');
                    return done(null, false, { message: 'Invalid Password' });
                }
            })

        });
    }
));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }), (req, res) => {
    console.log('Authentication Successful');
    req.flash('success', 'You are logged in');
    res.redirect('/');
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
});

module.exports = router;