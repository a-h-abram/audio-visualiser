const path = require('path');

const Controller = {
    index(req, res) {
        res.render(path.resolve("src/views/home.html"));
    }
};

module.exports = Controller;