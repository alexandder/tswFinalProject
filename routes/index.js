exports.index = function (req, res) {
    if (!req.user)
        res.redirect('/login');
    else
        res.redirect('/game');
};

exports.register = function (req, res) {
    if (!req.user)
        res.render('register', {
            title: 'Register',
            errorMsg: ''
        });
    else
        res.redirect('/game');
};

exports.login = function (req, res) {
    res.render('login', {
        title: 'Log in',
        successMsg: '',
        errorMsg: ''
    });
};

exports.game = function (req, res) {
    if (!req.user)
        res.redirect('/login');
    else
        res.render('game', {
            title: 'Game',
            name: req.user.username
        });
};