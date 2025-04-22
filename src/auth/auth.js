import bcrypt from 'bcryptjs'
import passport from 'passport-local'
const LocalStrategy = passport.Strategy
import Users from '../model/user.model.js'


export default  async (passport) => {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new LocalStrategy(
   // { passReqToCallback: true },
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async  (username, password, done)  => {
            try {
                const user = await Users.findOne({ where: { "email": username, status: 1, is_active: true}})
                if (!user) { return done(null, false, { message: 'Usuário ou senha inválido.' }) }
                const isValid = bcrypt.compareSync(password, user.password)
                if (!isValid) return done(null, false, { message: 'Usuário ou senha inválido.' })
                if (user.reset_password) { return done(null, false, { message: 'Foi solicitado reset de senha, verifique seu e-mail.' }) }

                return done(null, user)
            } catch (err) {
                done(err, false);
            }
        }
    ));
}
