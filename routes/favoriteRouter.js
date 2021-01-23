const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach(campsite => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id);
                        }
                    });

                    return favorite.save()
                }
                else {
                    return Favorite.create({ user: req.user._id, campsites: req.body });
                }
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyAdmin, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                } else {
                    res.statusCode = 200;
                    res.end('You do not have any favorites to delete.');
                }
            })
            .catch(err => next(err));
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}.`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const campsiteId = req.params.campsiteId;
        Favorite.findOne({ user: req.user._id })
        .then((favorites) => {
            if (favorites) {
                if (!favorites.campsites.includes(campsiteId)) {
                    favorites.campsites.push(campsiteId);
                    return favorites.save()
                } else {
                    const err = new Error('That campsite is already in the list of favorites!'); // here could be used throw err - than it will go higher to the next err in the catch(err) method
                    err.status = 400;
                    throw err;
                    // return next(err);
                }
            } else {
                return Favorite.create({ user: req.user._id, campsites: [campsiteId] });
            }
        })
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.json(favorites);
            })
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const campsiteId = req.params.campsiteId;
        Favorite.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites) {
                    if (favorites.campsites.includes(campsiteId)) {
                        favorites.campsites.splice(favorites.campsites.indexOf(campsiteId), 1);
                    }
                    favorites.save().then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    });
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.send('There are no favorites to delete.');
                }
            })
            .catch((err) => next(err));
    })

module.exports = favoriteRouter;
