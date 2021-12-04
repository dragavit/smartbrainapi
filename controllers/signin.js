const handleSignin = (db, bcrypt) => (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json('incorrect form submission')
    }
    // we have a function (db, bcrypt) that returns another function (req, res) and then runs this:
        db.select('email', 'hash').from('login')
            .where('email', '=', email)
            .then(data => {
               const isValid = bcrypt.compareSync(password, data[0].hash) // сравним то, что воодится с хэшем юзера из ДБ
               if  (isValid) {
                   return db.select('*').from('users') // обязательно return, чтобы БД знала об этом
                   .where('email', '=', email)
                   .then(user => {
                       res.json(user[0])
                       console.log(user[0])
                   })
                   .catch(err => res.status(404).json('unable to get user'))           
                }
                else {
                    res.status(400).json('wrong credentials') // если не valid
                }
            })
            .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    handleSignin: handleSignin
}
