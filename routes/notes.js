var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for notes
//this will be accessible from http://127.0.0.1:3000/notes if the default route for / is left unchanged
router.route('/')
    //GET all blobs
    .get(function(req, res, next) {
        //retrieve all blobs from Monogo
        mongoose.model('Note').find({}, function (err, notes) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/notes folder. We are also setting "notes" to be an accessible variable in our jade view
                    html: function(){
                        res.render('notes/index', {
                              title: 'All my Notes',
                              "notes" : notes
                          });
                    },
                    //JSON response will show all notes in JSON format
                    json: function(){
                        res.json(notes);
                    }
                });
              }     
        });
    })
    //POST a new blob
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var title = req.body.title;
        var note = req.body.note;
        //call the create function for our database
        mongoose.model('Note').create({
            NoteText : note,
            Title : title,
        }, function (err, note) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Note has been created
                  console.log('POST creating new note: ' + note);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("notes");
                        // And forward to success page
                        res.redirect("/notes");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(note);
                    }
                });
              }
        })
    });

/* GET New Blob page. */
router.get('/new', function(req, res) {
    res.render('notes/new', { title: 'Add New Note' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Note').findById(id, function (err, note) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Note').findById(req.id, function (err, note) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + note._id);
        res.format({
          html: function(){
              res.render('notes/show', {
                "note" : note
              });
          },
          json: function(){
              res.json(note);
          }
        });
      }
    });
  });

//GET the individual note by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the note within Mongo
    mongoose.model('Note').findById(req.id, function (err, note) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the blob
            console.log('GET Retrieving ID: ' + note._id);
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('notes/edit', {
                          title: 'Note' + note._id,
                          "note" : note
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(note);
                 }
            });
        }
    });
});

//PUT to update a note by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var title = req.body.title;
    var note = req.body.note;

   //find the document by ID
        mongoose.model('Note').findById(req.id, function (err, note) {
            //update it
            note.update({
                Title : title,
                NoteText : note
            }, function (err, blobID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/notes/" + note._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(note);
                         }
                      });
               }
            })
        });
});

//DELETE a Note by ID
router.delete('/:id/edit', function (req, res){
    //find note by ID
    mongoose.model('Note').findById(req.id, function (err, note) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            note.remove(function (err, note) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + note._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/notes");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : note
                               });
                         }
                      });
                }
            });
        }
    });
});

module.exports = router;