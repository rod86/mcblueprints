
module.exports.checkSession = function(request, response, next) {
    if (request.session.username) next();
    else response.status(401).send('Authorization failed');
};
