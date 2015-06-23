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
    description: String
});

module.exports = mongoose.model('Blueprint', BlueprintSchema);