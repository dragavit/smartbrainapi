const handleProfileGet = (req, res, db) => { 
    const { id } = req.params
    //делаем луп по database и сверяем id
    // используем синтаксис knex https://knexjs.org/
    db.select('*').from('users').where({id}) // ES6 - то же самое, что where({id:id})
    .then(user => {
        if (user.length) { // т.к. в случ. отсутств. юзера прогр. выдает пустой [], а это true и если поставить catch, то он не сработает
            res.json(user[0]) // выдаст запрашиваемого юзера без [{}], а просто {} (запрос через postman-get-номер id)
        } else {
            res.status(400).json('error getting user')
        }
    })
}

module.exports = {
    handleProfileGet: handleProfileGet
}

