//Acesso à BD
import dotenv from 'dotenv'
import __dirname from './../dirname.js'
dotenv.config({ path: __dirname + '/.env'})
import { Sequelize } from 'sequelize'


const dbPost = new Sequelize(
        process.env.POSTGRES_DB, process.env.POSTGRES_USER,process.env.POSTGRES_PASSWORD, 
        {
            dialect: 'postgres', 
            host: process.env.POSTGRES_HOST
            ,logging: false
            ,pool: {
                max: 5,
                min: 0,
                acquire: 60000,
                idle: 10000,
              },
        }
    );

export default  dbPost 

