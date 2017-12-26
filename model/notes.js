var mongoose = require('mongoose');
var noteSchema = new mongoose.Schema(
{
    title: String,
    note: String
});

mongoose.model('Note', noteSchema);