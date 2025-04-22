import { processUpdateDebtors } from "../../controllers/importingController.js";



export default {
    key: 'updateDebtores',
    
    options: {
        delay: 5000,
    },
    async handle({ data }) {
      const { branch,  user_comp } = data;
      await processUpdateDebtors(branch,  user_comp)
    },
  };