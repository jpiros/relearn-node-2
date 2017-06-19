const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

Todo.findOneAndRemove({_id: '594726b75be5966fd3cfce69'}).then((todo) => {

});

Todo.findByIdAndRemove('594726b75be5966fd3cfce69').then((todo) => {
  console.log(todo);
})