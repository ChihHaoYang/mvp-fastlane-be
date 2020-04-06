const express = require('express')
const fetch = require('isomorphic-fetch')
const cors = require('cors')
const Dataset = require('./models/datasetModel')
const config = require('./config')
const schedule = require('node-schedule')

// const scheduleRule = new schedule.RecurrenceRule()
// scheduleRule.minute = 0
const job = schedule.scheduleJob('0 * * * *', async function () {
  const res = await Dataset.deleteMany()
  console.log(res.deletedCount)

  const fetchJob = id => new Promise(resolve => {
    fetch(`${config.openDataUrl}?type=dataset&order=downloadcount&qs=&uid=&tag=dtid%3A${id}`)
      .then(res => res.json())
      .then(data => {
        resolve(data.map(ele => ({ ...ele, category: id.toString() })))
      })
  })

  Promise.all(config.datasetList.map(ele => fetchJob(ele.id)))
    .then((data) => {
      const collections = data.reduce((acc, current) => {
        acc = acc.concat(current)
        return acc
      }, [])
      console.log(collections.length)
      Dataset.insertMany(collections, function (err, docs) {
        if (err) {
          console.log(err)
        }
      })
    })
})

const app = express()
app.use(cors())

app.get('/datasets/:id', function (req, res, next) {
  // fetch(`${config.openDataUrl}?type=dataset&order=downloadcount&qs=&uid=&tag=dtid%3A${req.params.id}`)
  //   .then(res => res.json())
  //   .then(data => {
  //     res.json({
  //       success: true,
  //       data: data.map(ele => ({...ele, category: req.params.id}))
  //     })
  //   })
  Dataset.find({ category: req.params.id }, function (err, dataset) {
    if (err) {
      console.log(err)
      res.json({
        success: false,
        data: []
      })
      return
    }
    res.json({
      success: true,
      data: dataset
    })
  })
})


app.listen(8080, function () {
  console.log('Express listening on port 8080!');
})

