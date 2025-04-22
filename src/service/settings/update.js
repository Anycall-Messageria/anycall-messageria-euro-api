import Session from '../../model/sessions.model.js'
import Sequelize, { QueryTypes }  from 'sequelize'
import database from "../../../database/dbPostgresClient.js"

const updateSetting = async (values, condition) => {

    let result = await Session.update( values, condition ,  { multi: true } )
    return result
}



export { updateSetting }