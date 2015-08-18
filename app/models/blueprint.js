var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BlueprintSchema = new Schema({
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    description: String,
    images: [{
        filename: String
    }],
    downloadUrl: String
});

BlueprintSchema.methods = {
    appendImage: function (filename, cb) {
        var row = this;
        this.images.push({filename: filename});
        this.save(function(err){
            if (!err) {
                var lastId = row.images[row.images.length-1]._id;
                return cb(null, lastId);
            } else {
                return cb(err);
            }
        });
    }
};

module.exports = mongoose.model('Blueprint', BlueprintSchema);