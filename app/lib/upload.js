var fs = require('fs'),
    path = require('path');

var baseUploadsPath = './public/uploads/';

var Upload = function() {

    var file = {}; // Info about the file to upload
    var extensions = []; //allowed extensions. if empty, are all allowed
    var mimes = []; //allowed mimes. if empty, all are allowed
    var overwrite = false;
    var createPath = false;
    var destination; //destination folder

    this.setFile = function(filepath) {
        if (fs.existsSync(filepath)) {
            var filedata = path.parse(filepath);
            file.basename = filedata.name;
            file.extension = filedata.ext;
            file.temp = filepath;
        }
    };

    this.setAllowedExtensions = function(ext) {
        extensions = ext;
    };

    this.setAllowedMimes = function(m) {
        mimes = m;
    };

    this.setOverwrite = function(value) {
        overwrite = value;
    };

    this.setDestination = function(dest) {
        if (dest.substr(-1) != '/') dest += '/';
        destination = baseUploadsPath + dest;
    };

    this.setCreatePath = function(value) {
        createPath = value;
    };

    this.move = function(cb) {
        if (!fs.existsSync(destination)) {
            if (createPath) {
                fs.mkdirSync(destination);
                if (!fs.existsSync(destination)) {
                    cb('error creating dir');
                    return;
                }
            } else {
                cb('Destination folder no exists');
                return;
            }
        }

        if (!isValidExtension()) {
            cb('invalid extension');
            return;
        }

        var filename = file.basename + file.extension;

        if (!overwrite && fs.existsSync(destination + filename)) {
            filename = generateFilename();
        }

        fs.rename(file.temp, destination + filename, function(err){
            if (err)
                cb('Error moving file');

            cb(err, filename);
        });

        this.deleteFile = function (path) {
            if (fs.existsSync(destination)) {
                fs.unlink(path, function(err){
                    return err;
                });
            }
        };
    };

    function isValidExtension() {
        if (extensions.length == 0) return true;
        return (extensions.indexOf(file.extension)!=-1);
    }

    function generateFilename() {
        var i = 1,
            name;

        do {
            name = file.basename + '_' + i + file.extension;
            i++;
        } while (fs.existsSync(destination + name));

        return name;
    }
};

module.exports = Upload;