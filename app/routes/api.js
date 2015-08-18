var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    fs = require('fs'),
    Upload = require('../lib/upload.js'),
    fnc = require('../lib/functions.js'),
    Blueprint = require('../models/blueprint.js'),
    User = require('../models/user.js');


/* USERS */
router.get('/users/:id', function(request, response) {
    var id = request.params.id;
    User.findOne({_id: id}, { username: 1, email: 1 }, function(err, user) {
        if (err)
            return response.json({status:'error', message: err});

        return response.json({status:'ok', user: user});
    });
});

router.post('/users', function(request, response) {
    var username = request.body.username,
        email = request.body.email,
        password = request.body.password;

    User.isUnique(username, email, null, function(err, user){
        if (!err && !user) {
            User.generateHash(password, function(err, hash) {
                if (!err) {
                    var  user = new User({
                        username: username,
                        email: email,
                        password: hash
                    });

                    user.save(function(err){
                        if (!err) {
                            return response.json({status:'ok'});
                        } else {
                            return response.json({status:'error', message: err});
                        }
                    });
                } else {
                    return response.json({status:'error', message: err});
                }
            });
        } else {
            return response.json({status:'error', message: 'username/email exists'});
        }
    });
});

router.put('/users/:id', fnc.checkSession, function(request, response) {
    var id = request.params.id,
        username = request.body.username,
        email = request.body.email;

    User.isUnique(username, email, id, function(err, user){
        if (!err && !user) {
            var data = {
                username: username,
                email: email
            };
            User.update({_id: id}, {$set: data}, function(err){
                if (!err) {
                    return response.json({status:'ok'});
                } else {
                    return response.json({status:'error', message: err});
                }
            });
        } else {
            return response.json({status:'error', message: 'username/email exists'});
        }
    });
});

router.put('/users/:id/password', fnc.checkSession, function(request, response) {
    var id = request.params.id,
        oldPassword = request.body.oldpassword,
        password = request.body.password;

    User.findOne({_id: id}, function(err, user){
        if (err || user === null) {
            return response.send(401, 'Invalid user');
        } else {
            user.comparePassword(oldPassword, function(err, isMatch){
                if (!err && isMatch) {
                    User.generateHash(password, function(err, hash) {
                        if (!err) {
                            var data = {
                                password: hash
                            };
                            User.update({_id: id}, {$set: data}, function(err){
                                if (!err) {
                                    return response.json({status:'ok'});
                                } else {
                                    return response.json({status:'error', message: err});
                                }
                            });
                        } else {
                            return response.json({status:'error', message: err});
                        }
                    });
                } else {
                    return response.json({status:'error', message: 'Invalid old password'});
                }
            });
        }
    });
});

router.delete('/users/:id', fnc.checkSession, function(request, response) {
    var id = request.params.id;

    User.findByIdAndRemove(id, function(err){
        if (!err) {
            return response.json({status:'ok'});
        } else {
            return response.json({status:'error', message: err});
        }
    });
});

router.post('/login', function(request, response){
    var username = request.body.username,
        password = request.body.password;

    User.findOne({username: username}, function(err, user){
        if (err || user === null) {
            return response.send(401, 'Invalid user');
        } else {
            user.comparePassword(password, function(err, isMatch){
                if (!err && isMatch) {
                   request.session.regenerate(function(){
                       request.session.username = username;
                       return response.json({id: user._id, username: username});
                   });
                } else {
                    return response.send(401, 'Bad login');
                }
            });
        }
    });
});

router.get('/logout', function(request, response) {
    request.session.destroy(function(){
        return response.send('user logged out');
    });
});

/* BLUEPRINTS */
router.get('/blueprints', function(request, response){
    var username = false,
        user = false,
        where = {},
        match = {};

    if (request.query.username!=undefined && request.query.username!='') {
        username = request.query.username;
        match.username = username;
    }

    if (request.query.user!=undefined && request.query.user!='') {
        user = request.query.user;
        where.user = user;
    }

    Blueprint.find(where)
        .populate('user', 'username', match)
        .sort('-createdAt')
        .exec(function(err, rows){
            if (username) {
                rows = rows.filter(function(row){
                    return (row.user != null);
                });
            }

            if (!err) {
                return response.json({status:'ok', data: rows});
            } else {
                return response.json({status:'error', message: err});
            }
        });
});

router.get('/blueprints/:id', function(request, response) {
    var id = request.params.id;
    Blueprint.findOne({_id: id}, {}, function(err, blueprint) {
        if (err)
            return response.json({status:'error', message: err});

        return response.json({status:'ok', blueprint: blueprint});
    }).populate('user', 'username');
});

router.post('/blueprints', fnc.checkSession, function(request, response){
    var user = mongoose.Types.ObjectId(request.body.user),
        title = request.body.title,
        description = request.body.description,
        downloadUrl = request.body.downloadUrl;

    var  blueprint = new Blueprint({
        title: title,
        description: description,
        user: user,
        downloadUrl: downloadUrl
    });

    blueprint.save(function(err){
        if (!err) {
            return response.json({status:'ok', id: blueprint._id});
        } else {
            return response.json({status:'error', message: err});
        }
    });
});

router.put('/blueprints/:id', fnc.checkSession, function(request, response){
    var id = request.params.id,
        title = request.body.title,
        description = request.body.description,
        downloadUrl = request.body.downloadUrl;

    var data = {
        title: title,
        description: description,
        updatedAt: Date.now(),
        downloadUrl: downloadUrl
    };

    Blueprint.update({_id: id}, {$set: data}, function(err){
        if (!err) {
            return response.json({status:'ok'});
        } else {
            return response.json({status:'error', message: err});
        }
    });
});

router.delete('/blueprints/:id', fnc.checkSession, function(request, response) {
    var id = request.params.id;

    Blueprint.findByIdAndRemove(id, function(err){
        if (!err) {
            return response.json({status:'ok'});
        } else {
            return response.json({status:'error', message: err});
        }
    });
});

router.post('/blueprints/:id/add-image', fnc.checkSession, function(request, response) {
    var id = request.params.id;

    if (request.files) {
        if (request.files.file.size === 0) {
            return response.status(500).send('No file was uploaded');
        }

        var upload = new Upload();
        upload.setAllowedExtensions(['.png', '.gif', '.jpg', '.jpeg']);
        upload.setDestination('blueprints/'+id);
        upload.setOverwrite(false);
        upload.setCreatePath(true);
        upload.setFile(request.files.file.path);
        upload.move(function(err, filename){
            if (err!=null) {
                return response.json({status:'error', message: err});
            } else {
                Blueprint.findOne({_id: id}, {}, function(err, blueprint) {
                    if (err) {
                        return response.json({status: 'error', message: err});
                    } else if (blueprint==null) {
                        return response.json({status: 'error', message: 'Item not found'});
                    }

                    blueprint.appendImage(filename, function(err, imageId){
                        if (err)
                            return response.json({status:'error', message: err});

                        var file = {
                            _id: imageId,
                            filename: filename
                        };

                        return response.json({status:'ok', file: file});
                    });
                });
            }
        });
    }
});

router.get('/blueprints/:id/delete-image/:imageId', fnc.checkSession, function(request, response) {
    var id = request.params.id,
        imageId = request.params.imageId;

    Blueprint.findOne({_id: id}, {}, function(err, blueprint) {
        var file = blueprint.images.id(imageId);
        blueprint.images.pull(imageId);
        blueprint.save(function(err){
            if (err)
                return response.json({status: 'error', message: err});

            var path = './public/uploads/blueprints/' + id + '/' + file.filename;
            fs.unlink(path, function(err){
                if (err)
                    return response.json({status: 'error', message: err});

                return response.json({status:'ok'});
            });
        });
    });
});

module.exports = router;