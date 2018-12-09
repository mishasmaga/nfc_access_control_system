// routes/index.js
const tagRoutes = require('./routes');
module.exports = function(app, db) {
    tagRoutes(app, db);
};