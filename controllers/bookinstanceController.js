var BookInstance = require('../models/bookinstance');
const Book = require('../models/book')
var async = require('async');
const { body, validationResult } = require('express-validator');
const { genre_detail } = require('./genreController');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
        
    BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
        if (err) {return next(err)}

        res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances})
    })

};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
        if(err) {return next(err)}

        if(bookinstance === null) {
            const err = new Error('Book copy not found')
            err.status = 404
            return next(err)
        }

        res.render('bookinstance_detail', {title: 'Copy: '+bookinstance.book.title, bookinstance: bookinstance })
    })
    
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {

    Book.find({}, 'title')
    .exec(function(err, books) {
        if (err) { return next(err)}

        res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, bookinstance: undefined, errors: null})
    })

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and sanitise fields
    body('book', 'Must specifiy book').trim().isLength({min: 1}).escape(),
    body('imprint', 'Must specify imprint').trim().isLength({min: 1}).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true}).isISO8601().toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        const bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            }
        )

        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err) }

                    res.render('bookinstance_form', 
                        {
                            title: 'Create BookInstance', 
                            book_list: books, 
                            selected_book: bookinstance.book._id,
                            errors: errors.array(), 
                            bookinstance: bookinstance
                        }
                    )
                })
            return
        } else {
            bookinstance.save(function(err) {
                if (err) { return next(err) }

                res.redirect(bookinstance.url)
            })
        }
    }

]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).exec(callback)
        }
    }, function(err, results){
        if (err) { return next(err)}

        res.render('bookinstance_delete', {title: 'Delete Book Instance', bookinstance: results.bookinstance})
    })

};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {

    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function(err) {
        if (err) { return next(err) }

        res.redirect('/catalog/bookinstances')
    })

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback)
        }, 
        books: function(callback) {
            Book.find({}, 'title').exec(callback)
        },
    }, function(err, results) {
        if (err) return next(err)

        console.log(results.bookinstance.dateAvailable)
        res.render(
            'bookinstance_form', 
            {
                title: 'Update BookInstance',
                bookinstance: results.bookinstance, 
                book_list: results.books, 
                errors: err
            }
        )
    })
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Book instance form only turns back string results. The genre section would 
    // return an array, but we don't have that in this form

    // Validate and sanitize form data
    body('book', 'Must select book').trim().isLength({min:1}).escape(),
    body('imprint', 'Must include imprint').trim().isLength({min:1}).escape(),
    body('due_back','Must include due back date').optional({ checkFalsy: true}).isISO8601().toDate(),
    body('status', 'Must include book status').trim().isLength({min:1}).escape(),

    // 
    (req, res, next) => {

        // Extract errors: results will be output as an array
        const errors = validationResult(req);

        // Create new book instance object to update database with:
        const bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
                _id: req.params.id //This is required, or a new ID will be assigned!
            }
        )
        console.log(req.body.due_back)
        // Re-output form if there are errors
        if (!errors.isEmpty()) {

            async.parallel({
                bookinstance: function(callback) {
                    BookInstance.findById(req.params.id).populate('book').exec(callback)
                }, 
                books: function(callback) {
                    Book.find({}, 'title').exec(callback)
                },
            }, function(err, results) {
                if (err) return next(err)
        
                res.render(
                    'bookinstance_form', 
                    {
                        title: 'Update BookInstance',
                        bookinstance: results.bookinstance, 
                        book_list: results.books, 
                        errors: errors.array()
                    }
                )
            })
        } 
        else {
            
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, theBookInstnace) {
                if (err) return next(err)

                res.redirect(theBookInstnace.url)
            })
        }

    }

]