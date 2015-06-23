var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type:String, index:{unique:true}},
    email: {type:String, index:{unique:true}},
    password: String
});

UserSchema.pre('save', function(next){
    mongoose.models['User'].findOne({$or:[
        {email: this.email}, {username: this.username}
    ]}, function(err, results){
        if (err) {
            next(err);
        } else if (results) {
            next(new Error('email and/or username must be unique'));
        } else {
            next();
        }
    });
});

UserSchema.statics = {
    generateHash: function(password, cb) {
        bcrypt.genSalt(10, function(err, salt){
            if (err) cb(err);

            bcrypt.hash(password, salt, null, function(err, hash){
                if (err) cb(err);
                cb(null, hash);
            });
        });
    },
    isUnique: function (username, email, excludeId, cb) {
        var where = {$or:[{username: username}, {email: email}]}

        if (excludeId != null) {
            where._id = {'$ne': excludeId};
        }
        console.log(where);
        this.findOne(where, cb);
    }
};

UserSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);