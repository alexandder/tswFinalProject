exports.index = function (req, res) {
    if (!req.user)
        res.redirect('/login');
    else
        res.redirect('/game');
};

exports.register = function (req, res) {
    if (!req.user)
        res.render('register', {
            title: 'Register'
        });
    else
        res.redirect('/game');
};

exports.login = function (req, res) {
    res.render('login', {
        title: 'Log in'
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