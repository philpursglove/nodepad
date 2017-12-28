var mongoose = require('mongoose');
var noteSchema = new mongoose.Schema(
{
    Title: String,
    NoteText: String
});

mongoose.model('Note', noteSchema);