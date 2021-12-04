const Clarifai = require('clarifai') // передвинули clarifai из фронтенда, чтобы не был виден ключ с network
//You must add your own API key here from Clarifai
const app = new Clarifai.App({
    apiKey: '7bb67f15d8a640f1b280b0ec2feccc9b'
  });

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)   
    .then(data => {
        res.json(data)
    })
    .catch(err => res.status(400).json('unable to work with API'))
}



const handleImage = (req, res, db) => {
    const { id } = req.body // в этот раз получим user's ID from the body, not params (не из строки)
    db('users').where('id','=', id) // не ===, потому что это SQL
    .increment('entries', 1) // увеличиваем на 1 (синтаксис с сайта knex)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
    handleImage,
    handleApiCall
}