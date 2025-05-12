var User = require('../models/user');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

exports.getById = async (req, res, next) => {
    var id = req.params.id;
    try {
        let user = await User.findById(id);
        if (user) {
            return res.status(200).json(user);
        }
        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        return res.status(501).json(error);
    }
};

exports.add = async (req, res, next) => {
    var temp = ({
        name: req.body.name,
        firstname: req.body.firstname,
        email: req.body.email,
        password: req.body.password
    });

    try {
        let user = await User.create(temp);

        return res.status(201).json(user);
    } catch (error) {
        return res.status(501).json(error);
    }
};

exports.update = async (req, res, next) => {
    var id = req.params.id
    var temp = ({
        name: req.body.name,
        firstname: req.body.firstname,
        email: req.body.email,
        password: req.body.password
    });

    try {
        let user = await User.findOne({ _id: id });

        if (user) {
            Object.keys(temp).forEach((key) => {
                if (!!temp[key]) {
                    user[key] = temp[key];
                }
            });
            await user.save();
            return res.status(201).json(user);
        }

        return res.status(404).json('user_not-found');
    } catch (error) {
        return res.status(501).json(error);
    }
}

exports.delete = async (req, res, next) => {
    var id = req.params.id

    try {
        await User.deleteOne({ _id: id });
        return res.status(204).json('delete_ok');
    } catch (error) {
        return res.status(501).json(error);
    }
}

exports.authenticate = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json('user_not_found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json('wrong_credentials');
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        const expireIn = 24 * 60 * 60;
        const token = jwt.sign(
            { user: userResponse },
            process.env.SECRET_KEY,
            { expiresIn: expireIn }
        );

        // Stocker le token dans les cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expireIn * 1000
        });

        res.header('Authorization', 'Bearer ' + token);
        return res.status(200).json({ user: userResponse, token });
    } catch (error) {
        console.log(error);
        return res.status(501).json(error);
    }
};

// Obtenir tous les utilisateurs
exports.getAllUsers = async () => {
    try {
        return await User.find({}, '-password');
    } catch (error) {
        throw error;
    }
};