const jwt = require('jsonwebtoken')

exports.generateAccessToken = (user) => {
    return jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 1800000 })
}

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    console.log('Headers reçus :', req.headers); // voir tous les headers
    console.log('Authorization header :', authHeader);


    const token = authHeader && authHeader.split(' ')[1]
    console.log('LE token --->', token)

    if (token == null) {
        console.log('Aucun token fourni !');
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        if (err) {
            console.log('Token invalide ou expiré :', err.message);
            return res.sendStatus(401)
        }
        console.log('Token vérifié, payload :', user);

        req.user = user;
        next();
    })

}