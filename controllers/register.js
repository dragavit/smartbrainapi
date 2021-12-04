const handleRegister = (req, res, db, bcrypt) => { // вставили через Dependancy Injection
    const { email, name, password} = req.body 
    if (!email || !name || !password) { // if any of these is empty
        return res.status(400).json('incorrect form submission')
    } // если не поставить return, то сработает код ниже; а с return функция сразу же возвращает результат, если сработало условие, и код ниже не срабатывает
    // код ниже был использован, чтобы получить hash на {"password": "apples"} (вбили через postman-post-body-raw-json-send)
    const hash = bcrypt.hashSync(password) // используем синхронный bcrypt, т.к. код короче (раее использовали асинхронный)
        // СОЗДАДИМ ТРАНЗАКЦИЮ (когда нужно сделать 2 дела за раз: апдейт и users, и login). Используем trj object вместо db
        db.transaction(trx => { // trx object
            trx.insert ({
                hash: hash, // hash, который мы получаем с bcrypt
                email: email // получаем с req.body
            })
            .into('login') // first update the login table
            .returning('email')
            .then(loginEmail => {
                return trx('users') // using loginEmail to return another trx transaction
                    .returning('*') // из арсенала knex для response
                    .insert({ // добавляем юзера в db
                        email: loginEmail[0], //  а то мы возвращаем array и мыло в users будет выглядеть так:  {"john@gmail.com"} 
                        name: name,
                        joined: new Date()
                    })
                    .then(user => { // db нам отвечает
                        res.json(user[0]) // закинем через postman юзера - он отразится в postman внизу, где respones - уже с номером и date, это и есть ответ от db. user[0] потому что, если мы регим юзера, то он будет одним в response
                            // отличие user от user[0] в том, что в postman в response будет в первом случае [{зареганый юзер}], а во втором просто {зареганый юзер}
                    })   
            })
            .then(trx.commit) // если все прошло, то коммитим изменения (1 добавляем юзера в users, 2 автозаполнение таблицы login с паролем хэше)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to register')) 
        // если прописать json(err) и попыт зарегить 2 раза - выдаст в риспонсе ошибку - "Key (email)=(vasya@gmail.com) already exists."
        // но лучше 'unable to register', чтобы юзер не видел инфу о системе в сообщении err (там комплкксный response)
}

// модули экспортирутся как объекты и к ним доступ через точку. В server.js: app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) } )
module.exports = {
    handleRegister: handleRegister
}