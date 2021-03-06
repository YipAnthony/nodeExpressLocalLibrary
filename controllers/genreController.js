// var mongoose = require('mongoose');
const Genre = require('../models/genre');
const Book = require('../models/book')
const async = require('async')
const { body, validationResult } = require('express-validator')

// Display list of all Genre.
exports.genre_list = function(req, res, next) {

    Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_genres) {
        if (err) {return next(err)}

        res.render('genre_list', {title: "Genre List", genre_list: list_genres})
    })

};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    // var id = mongoose.Types.ObjectId(req.params.id); 
    async.parallel(
        {
            genre: function(callback) {
                Genre.findById(req.params.id)
                .exec(callback)
            },
            genre_books: function(callback) {
                Book.find({ 'genre': req.params.id })
                .exec(callback)
            },
        },
        function(err, results) {
            if (err) { return next(err) }

            if (results.genre === null ) {
                const err = new Error('Genre not found')
                err.status = 404;
                return next(err)
            }

            res.render('genre_detail', {
                title: 'Genre: ',
                genre: results.genre,
                genre_books: results.genre_books
            })
        }
    )
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    
    res.render('genre_form', {title: 'Create Genre', genre: undefined, errors: null})

};

// Handle Genre create on POST.
// Needs to be an array of middleware functions
exports.genre_create_post = [

    // Body validator: Validate and sanitise the name field
    body('name', 'Genre name required').trim().isLength({min: 1}).escape(),

    // Process request after validation and sanitization 
    (req, res, next) => {
        
        // Extract the validation errors from a request
        const errors = validationResult(req)

        // Create a genre object with escaped and trimmed data
        const genre = new Genre(
            { name: req.body.name }
        )
        
        // There are errors.
        if (!errors.isEmpty()) {
            //  Render the form again with sanitized values/error messages. 
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()})
            return;
        }

        // Data from form is valid
        else {
            
            // Check if Genre with same name already exists
            Genre.findOne({'name': req.body.name})
                .exec( function(err, found_genre) {
                    if (err) {return next(err)}

                    // Genre exists
                    if (found_genre) {
                        // redirect to its detail page
                        res.redirect(found_genre.url);
                    }

                    else {

                        // Genre saved
                        genre.save(function(err) {
                            if (err) { return next(err) }

                            // Redirect to genre detail page
                            res.redirect(genre.url)
                        })
                    }
                })
        }

    }

]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        books: function(callback) {
            Book.find({'genre': req.params.id}).exec(callback)
        }
    }, function(err, results) {
        if (err) return next(err) 

        res.render ('genre_delete', {title: 'Delete Genre: ', genre: results.genre, books: results.books})        
    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        books: function(callback) {
            Book.find({'genre': req.params.id}).exec(callback)
        }
    }, function(err, results) {
        if (err) return next(err) 

        if(results.books.length > 0) {
            res.render ('genre_delete', {title: 'Delete Genre: ', genre: results.genre, books: results.books})        
        } else {
            Genre.findByIdAndRemove(req.body.genreid, function(err) {
                if (err) return next(err)

                res.redirect('/catalog/genres')
            })
        }
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {

    async.parallel({
        
    }, function(err, results) {

    })
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};  