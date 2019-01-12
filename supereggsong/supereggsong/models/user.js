module.exports = (sequelize, DataTypes) => {
    sequelize.define('user', {
        email:{
            type:DataTypes.STRING(40)
        }
    })
}