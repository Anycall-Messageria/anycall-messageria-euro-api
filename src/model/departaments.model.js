import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Departaments = dbPost.define('departaments', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    departaments: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    status:{
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
},

    { timestamps: false },
            { createdAt: false },
            { updatedAt: false },
            {freezeTableName: true }

)

export default Departaments