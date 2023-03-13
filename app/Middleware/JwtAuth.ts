import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class JwtAuth {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    await auth.use("jwt").authenticate();

    await next()
  }
}
