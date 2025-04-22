import Issuers from '../../model/issuers.model.js'
import Sequelize, { QueryTypes }  from 'sequelize'
import database from "../../../database/dbPostgresClient.js"



const findAll = async (user_comp) => {
    const issuers = await Issuers.findAll({ where:{company_id: user_comp}})
    return issuers
}

const findOne = async (id) => {
    const issuers = await Issuers.findOne({ where: {'id': id } })
    return issuers
}

export { findAll, findOne }