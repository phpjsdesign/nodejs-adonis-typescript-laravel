import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthController {
  public async registerShow({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async loginShow({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public async register({ request, response, auth }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email(), rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
      })]),
      password: schema.string({}, [rules.minLength(8)]),
    })
    const data = await request.validate({ schema: userSchema })
    const user = await User.create(data)
    await auth.login(user)

    return response.redirect('/')
  }

  public async login({ request, response, auth, session }: HttpContextContract) {
    const { uid, password } = request.only(['uid', 'password'])
    try {
      await auth.attempt(uid, password)
    } catch (error) {
      session.flash('form', 'Данные аудентификации некорректные')
      return response.redirect().back()
    }
    return response.redirect('/')
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout()
    return response.redirect().toRoute('auth.login.show')
  }
}
