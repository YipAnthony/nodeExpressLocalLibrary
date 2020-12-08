const mongoose = require('mongoose')
const { DateTime } = require('luxon')

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, maxlength: 100},
        family_name: {type: String, required: true, maxlength: 100},
        date_of_birth: {type: Date}, 
        date_of_death: {type: Date},
    }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
// cannot use arrow functions when using mongoose b/c arrow fxs do not bind 'this' keyword
.get( function() { 
    return this.family_name + ', '  + this.first_name
})

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get( function() {
    const formattedDOB = this.date_of_birth ? 
    DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED): "unknown"

    const formattedDOD = this.date_of_death ? 
    DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED): "present"

    return formattedDOB + " - " + formattedDOD
})

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get( function() {
    return '/catalog/author/' + this._id
})

AuthorSchema
.virtual('dateBornFormatted')
.get(function() {
  return DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-MM-dd')
})

AuthorSchema
.virtual('datenDeadFormatted')
.get(function() {
  return DateTime.fromJSDate(this.date_of_death).toFormat('yyyy-MM-dd')
})

// Export module
module.exports = mongoose.model('Author', AuthorSchema)