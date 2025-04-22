import Campaing from '../model/campaings.model.js'
import response from '../../response.js'

const list = async (req, res) => {
  const identificador = req.params.id
  const limit = req.query.limit || 50
  const page = +req.query.page || 0
  const user_comp = req.user.user_company // where: {company_id: user_comp}
 try {
  const r = Campaing.findAndCountAll(
    {   where: {
      identificador,
      company_id: user_comp
    }, 
    order: [
      ["id", "ASC"]
    ],
     offset: (page * limit),  
     limit:limit
    }) .then((results) => {
    const itemCount = results.count
    const pageCount = Math.floor(itemCount/limit);
    
    let lambda
    
    if(pageCount == page){
        lambda = page
    }else{
        lambda = page + 1
    }

    response(res, 200, true, 'List  campaings', {
      campaings: results.rows,
      currentPage: page,
      hasPreviousPage: page > 0,
      hasNextPage: (limit * page) < itemCount,
      nextPage: lambda,
      previousPage: page - 1,
      lastPage: Math.floor((pageCount)),
      totalResult: itemCount,
      limit: limit
    })
   
  })
 } catch (err) {
  response(res, 500, false, 'Failed application.')
 }
}

export { list }