var Oriento = require('oriento');

var server = Oriento({
  host: 'localhost',
  port: 2424,
  username: 'orientdb',
  password: 'orientdb'
});
var database = 'whozurdata';
var urClass = 'urData';

var dbix, cix;
server.list()
.then(function (dbs) {
  dbs.forEach( function (d) { 
//console.log('database', d.name);
    if (d.name === database) dbix = dbs.indexOf(d);
  });
//console.log(dbix);
  if (typeof dbix === 'undefined') {
    server.create({
      name: database,
      type: 'graph',
      storage: 'plocal'
    })
    .then(function (db) {
      console.log('Created database: ' + database);
    });
  }
  var db = server.use(database); 
  db.class.list()
  .then(function (classes) {
    classes.forEach( function (c) {
//console.log('class', c.name);
      if (c.name === urClass) cix = classes.indexOf(c);
    }); 
//console.log(cix);
  if (typeof cix === 'undefined') {
    db.class.create('urData')
    .then(function (urClass) {
      console.log('Created class: ' + urClass.name);
    });
  }      
  db.class.get(urClass)
  .then(function (urClass) {
//    console.log('urClass: ' + urClass.name);
    urClass.list()
    .then(function (records) {
      console.log('Found ' + records.length + ' records:\n', records);
    });
  });
  });
});

/*




  MyClass.create({
    name: 'John McFakerton',
    email: 'fake@example.com'
  })
  .then(function (record) {
    console.log('Created record: ', record);
  });
  
db.class.list()
.then(function (classes) {
  console.log('There are ' + classes.length + ' classes in the db:', classes);
});






  MyClass.create({
    name: 'Mary McFakerton',
    email: 'fake@example.com'
  })
  .then(function (record) {
    console.log('Created record: ', record);
  });

  MyClass.list()
  .then(function (records) {
      console.log('records', records);
    console.log('Found ' + records.length + ' records:');
  });

  MyClass.property.list()
  .then(function (properties) {
    console.log('The class has the following properties:', properties);
  });

  console.dir(MyClass);

  console.dir(MyClass);
}) db.class.drop(target)
  .then(function (theClass) {
    console.log('deleted class: ' + theClass.name);
  });

  
*/