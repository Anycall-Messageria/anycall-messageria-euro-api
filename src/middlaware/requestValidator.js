import { validationResult } from 'express-validator'
import response from '../../response.js'

var data=[
    {param:"company", field:"Empresa"},
    {param:"company_responsible",field:"Responsável"},
    {param:"company_password",field:"Senha"},
    {param:"company_email",field:"Email"},
    {param:"company_phone",field:"Telefone"},
    {param:"company_cpf",field:"CPF"},
    ];

const validate = (req, res, next) => {
  try {
    const errors = validationResult(req)
    const a =  errors.array()
    const newErrors = []
    if (!errors.isEmpty()) {
        let v = {}
        a.map(function(d){
        let translate = data.find(el => el.param === d.param);
        if(translate){
          const v = { Param: d.param, Field: translate["field"], Error: d.msg, Value: d.value}
        }else{
            const v = { Param: d.param, Error: d.msg, Value: d.value}
        }
        newErrors.push(v)
        })
       return response(res, 400, false, '(*) Por favor preencha todas as informações obrigatórias.', newErrors )
       //Please fill out all required input
    }
    next()
  } catch (err) {
    console.log(err)    
  }
}

export default validate