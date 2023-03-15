/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor () {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error.status === 404) {
      return ctx.response.status(error.status).json({
        error: {
          code: error.code,
          message: error.message
        }
      })
    }

    if (error.status >= 500) {
      return ctx.response.status(error.status).json({
        error: {
          code: error.code,
          message: error.message
        }
      })
    }

    return super.handle(error, ctx)
  }
}
