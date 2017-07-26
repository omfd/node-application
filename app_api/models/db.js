var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/loc8r';
mongoose.connect(dbURI);
var readline = require('readline');
if (process.platform === 'win32') {
    var r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r1.on("SIGINT", function () {
        process.emit("SIGINT");
    })
}

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected ');
});

gracefulShutDown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

//for nodemon restart
process.once('SIGUSR2', function () {
    gracefulShutDown('nodemon restart/termination', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});

//for app termination
process.on('SIGINT', function () {
    gracefulShutDown('app termination', function () {
        process.exit(0);
    });
});


