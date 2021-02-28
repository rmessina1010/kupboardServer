const bodyQueryToObj = (qry) => qry.bod ? JSON.parse(decodeURI(qry.bod)) : {};

module.exports = { bodyQueryToObj };