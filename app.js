const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const {format} = require('date-fns')
const {isValid} = require('date-fns')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const formatthedate = dbobject => {
  return {
    id: dbobject.id,
    todo: dbobject.todo,
    priority: dbobject.priority,
    status: dbobject.status,
    category: dbobject.category,
    dueDate: formatof(dbobject.due_date),
  }
}

const formatof = obj => {
  return format(new Date(obj), 'yyyy-MM-dd')
}

const invalidcheck = (request, response, next) => {
  let {status, priority, category, date} = request.query
  s = ['TO DO', 'IN PROGRESS', 'DONE']
  p = ['HIGH', 'MEDIUM', 'LOW']
  c = ['WORK', 'HOME', 'LEARNING']
  if (!(status === undefined)) {
    if (!s.includes(status)) {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }
  if (!(priority === undefined)) {
    console.log(priority)
    if (!p.includes(priority)) {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
  if (!(category === undefined)) {
    if (!c.includes(category)) {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }
  if (date !== undefined) {
    try {
      if (!isValid(new Date(date))) {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
  next()
}

const invalidcheck2 = (request, response, next) => {
  let {status, priority, category, dueDate} = request.body
  s = ['TO DO', 'IN PROGRESS', 'DONE']
  p = ['HIGH', 'MEDIUM', 'LOW']
  c = ['WORK', 'HOME', 'LEARNING']
  if (!(status === undefined)) {
    console.log('status')
    if (!s.includes(status)) {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }
  if (!(priority === undefined)) {
    console.log(priority)
    if (!p.includes(priority)) {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
  if (!(category === undefined)) {
    if (!c.includes(category)) {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }
  if (dueDate !== undefined) {
    try {
      if (!isValid(new Date(dueDate))) {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
  next()
}

app.get('/todos/', invalidcheck, async (request, response) => {
  let {status = '', priority = '', search_q = '', category = ''} = request.query
  let query = `SELECT * FROM todo WHERE 
  status LIKE '%${status}%' AND priority LIKE '%${priority}' AND 
  category LIKE '%${category}' AND todo LIKE '%${search_q}%';`
  let result = await database.all(query)
  response.send(result.map(each => formatthedate(each)))
})

app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `SELECT * FROM todo WHERE id=${todoId};`
  let result = await database.get(query)
  response.send(formatthedate(result))
})

app.get('/agenda/', invalidcheck, async (request, response) => {
  let {date} = request.query
  let fdate = formatof(date)
  console.log(date, fdate)
  let query = `SELECT * FROM todo WHERE due_date='${fdate}';`
  let result = await database.all(query)
  response.send(result.map(each => formatthedate(each)))
})

app.post('/todos/', invalidcheck2, async (request, response) => {
  let {id, todo, priority, status, category, dueDate} = request.body
  let query = `INSERT INTO todo(id,todo,priority,status,category,due_date)
  VALUES(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`
  let result = await database.run(query)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', invalidcheck2, async (request, response) => {
  let {todo, priority, status, category, dueDate} = request.body
  let {todoId} = request.params
  switch (true) {
    case status !== undefined:
      let query1 = `UPDATE todo SET status='${status}' WHERE id=${todoId}`
      await database.run(query1)
      response.send('Status Updated')
      break
    case priority !== undefined:
      let query2 = `UPDATE todo SET priority='${priority}' WHERE id=${todoId}`
      await database.run(query2)
      response.send('Priority Updated')
      break
    case todo !== undefined:
      let query3 = `UPDATE todo SET todo='${todo}' WHERE id=${todoId}`
      await database.run(query3)
      response.send('Todo Updated')
      break
    case category !== undefined:
      let query4 = `UPDATE todo SET category='${category}' WHERE id=${todoId}`
      await database.run(query4)
      response.send('Category Updated')
      break
    case dueDate !== undefined:
      let query5 = `UPDATE todo SET due_date='${dueDate}' WHERE id=${todoId}`
      await database.run(query5)
      response.send('Due Date Updated')
      break
  }
})
app.delete('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `DELETE FROM todo WHERE id=${todoId};`
  let result = await database.run(query)
  response.send('Todo Deleted')
})

module.exports = app
