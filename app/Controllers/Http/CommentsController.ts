// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Comment from 'App/Models/Comment'

export default class CommentsController {
    async index ({ request, response }) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        const comments = await Comment.query()
        .preload('user')
        .preload('post')
        .paginate(page, limit)

        return response.json(comments)
      }
    
      async show ({ params, response }) {
        const comment = await Comment.query()
        .where('id', params.id)
        .preload('user')
        .preload('post')
        .firstOrFail();

        return response.json(comment)
      }
    
      async store ({ auth, request, response }) {
        await auth.use('jwt').authenticate()
        const userId = auth.use('jwt').user!.id

        const commentSchema = schema.create({
            post_id: schema.number([
                rules.exists({
                  table: 'posts',
                  column: 'id'
                }),
            ]),
            body: schema.string(),
        })

        const payload = await request.validate({ schema: commentSchema });
        const comment = await Comment.create({
            'userId': userId,
            'postId': payload.post_id,
            'body': payload.body,
        })

        return response.json(comment)
      }
    
      async update ({ auth, params, request, response }) {
        await auth.use('jwt').authenticate()
        const userId = auth.use('jwt').user!.id

        const commentSchema = schema.create({
            post_id: schema.number([
                rules.exists({
                  table: 'posts',
                  column: 'id'
                }),
            ]),
            body: schema.string(),
        })

        const payload = await request.validate({ schema: commentSchema });

        const comment = await Comment.findOrFail(params.id)
        comment.merge({
            'userId': userId,
            'postId': payload.post_id,
            'body': payload.body,
        })
        await comment.save()

        return response.json(comment)
      }
    
      async destroy ({ params, response }) {
        const comment = await Comment.findOrFail(params.id)
        await comment.delete()

        return response.json(null, 204)
      }
}
