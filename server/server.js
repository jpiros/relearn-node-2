const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

const swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'RESTful API with Swagger'
  },
  host: 'vast-shore-36257.herokuapp.com',
  basePath: '/',
};

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./server/server.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
     // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * definition:
 *   Todo:
 *     properties:
 *       text:
 *         type: string
 *   Patch:
 *     properties:
 *       text:
 *         type: string
 *       completed: 
 *         type: boolean
 */


/**
 * @swagger
 * /todos:
 *   post:
 *     tags:
 *       - Todos
 *     description: Creates a new todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: todo
 *         description: Todo object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Todo'
 *     responses:
 *       200:
 *         description: Sucessfully created
 */
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

/**
 * @swagger
 * /todos:
 *   get:
 *     tags:
 *       - Todos
 *     description: Returns all todos
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of todos
 *         schema:
 *           $ref: '#/definitions/Todo'
 */
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  })
});

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     tags:
 *       - Todos
 *     description: Returns a single todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Todo's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single todo
 *         schema:
 *           $ref: '#/definitions/Todo'
 */
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });

});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     tags:
 *       - Todos
 *     description: Deletes a single todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Todo's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Sucessfully deleted
 */
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

/**
 * @swagger
 * /todos/{id}:
 *   patch:
 *     tags:
 *       - Todos
 *     description: Updates a single todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Todo's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: todo
 *         description: Todo object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Patch'
 *     responses:
 *       200:
 *         description: Sucessfully updated
 */
app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
})

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };