// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
    async index ({ request, response }) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        const users = await Database
                    .from('users')
                    .select('id', 'email', 'created_at', 'updated_at')
                    .paginate(page, limit)

        return response.json(users)
      }
    
      async show ({ params, response }) {
        const user = await User.find(params.id)

        return response.json(user)
      }
    
      async store ({ request, response }) {
        const userSchema = schema.create({
            email: schema.string({}, [
                rules.email(),
                rules.unique({
                    table: 'users',
                    column: 'email'
                })
            ]),
            password: schema.string({} ,[
                rules.confirmed(),
                rules.minLength(6)
            ]),
        })

        const payload = await request.validate({ schema: userSchema });
        const user = await User.create(payload)

        return response.json(user)
      }
    
      async login ({ auth, request, response }) {

        const email = request.input('email')
        const password = request.input('password')

        // Lookup user manually
        const user = await User
        .query()
        .where('email', email)
        .firstOrFail()

        // Verify password
        if (!(await Hash.verify(user.password, password))) {
            return response.status(401).json({
                error: {
                    message: 'Invalid credentials'
                }
            })
        }

        const token = await auth.use('jwt').generate(user)
        
        return response.json(token)
      }
    
      async logout ({ auth, response }) {
        await auth.use('jwt').revoke()
        
        return response.json({
            revoked: true
        })
      }
    
      async update ({ params, request, response }) {
        const userSchema = schema.create({
            password: schema.string({} ,[
                rules.confirmed(),
                rules.minLength(4)
            ]),
        })

        const payload = await request.validate({ schema: userSchema });

        const user = await User.findOrFail(params.id)
        user.merge(payload)
        await user.save()

        return response.json(user)
      }
    
      async destroy ({ params, response }) {
        const user = await User.findOrFail(params.id)
        await user.delete()

        return response.json(null, 204)
      }
}
