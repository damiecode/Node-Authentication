const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/nodeauth', { useNewUrlParser: true });
const db = mongoose.connection;

//User schema
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        createIndex: true
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileImage: {
        type: String
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    })
}

module.exports.getUserByUsername = (username, callback) => {
    const query = { username };
    User.findOne(query, callback);
}


module.exports.getUserById = (id, callback) => {
    User.findById(id, callback);
}


module.exports.createUser = (newUser, callback) => {
    bcrypt.hash(newUser.password, 10, (err, hash) => {
        if (err) throw err;

        //set hash password
        newUser.password = hash;
        //create User
        newUser.save(callback);
    });
}