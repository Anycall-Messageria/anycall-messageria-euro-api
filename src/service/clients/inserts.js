import Sequelize, { QueryTypes }  from 'sequelize'
import database from "../../../database/dbPostgresClient.js"
import Client from '../../model/clients.model.js'
import AddresClient from '../../model/addressClients.model.js'
import PhoneClient from '../../model/phonesClients.model.js'


const createOne = async (client, phone, addres) => {
    
     const novocliente = await Client.create({
        name: client.name,
        cpf: client.cpf,
        rg: client.rg,
        email: client.email,
        data_nascimento: client.data_nascimento,
        login: client.login,
        office: client.office,
        company_id: client.company_id
      })

      let end = {}
      addres.map(function(a){
      end ={
            cpf: a.cpf,
            address: a.address,
            complement: a.complement,
            city: a.city,
            neighborhood: a.neighborhood,
            state: a.state,
            country: a.country, 
            zipcode: a.zipcode,
            clientId: novocliente.id,
            company_id: client.company_id
          }
      });
      const novoEndereco = await AddresClient.create(end)

      let ph = {}
      phone.map(function(f){
      ph = {
            cpf: f.cpf,
            phone: f.phone,
            type_phone: 1,
            clientId: novocliente.id,
            company_id: client.company_id
        }
      })
      const novoTelefone = await PhoneClient.create(ph)
    return `CPF ${client.cpf} - ${novocliente.id} inserido com sucesso!`
}

const findAll = async ( user_comp ) => {
    const clients = await Client.findAll({ where: { company_id: user_comp}})
    return clients
}

const findOne = async (id, user_comp ) => {
    let query = `select clients.id,	"name",	clients.cpf,	rg,	email,	data_nascimento,	login,	
    "password", tag, address,	complement,	city,	neighborhood,	state,	
    country,	zipcode, office,	clients.status from clients
    left join address_clients on address_clients."clientId" = clients.id
    where clients.id = ${id} and clients.company_id = ${user_comp} limit 1;`
    const clients = await database.query(query, { type: QueryTypes.SELECT });
    let sql = `select id, "clientId", phone, type_phone from phones_clients where "clientId" = ${id} 
   and phones_clients.company_id = ${user_comp};`
   const phonesClient = await database.query(sql, { type: QueryTypes.SELECT });
   const clientArray = clients[0] //[];
    return { clientArray, phonesClient }
}

export { createOne, findOne , findAll }