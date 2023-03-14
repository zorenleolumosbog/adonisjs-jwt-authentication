// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema } from '@ioc:Adonis/Core/Validator'
import Post from 'App/Models/Post'

export default class PostsController {
    async index ({ request, response }) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        const posts = await Post.query()
        .preload('user')
        .preload('comments')
        .paginate(page, limit)

        return response.json(posts)
      }
    
      async show ({ params, response }) {
        const post = await Post.query()
        .where('id', params.id)
        .preload('user')
        .preload('comments')
        .firstOrFail();

        return response.json(post)
      }
    
      async store ({ auth, request, response }) {
        await auth.use('jwt').authenticate()
        const userId = auth.use('jwt').user!.id

        const postSchema = schema.create({
            title: schema.string(),
            body: schema.string(),
        })

        const payload = await request.validate({ schema: postSchema });
        const post = await Post.create({
            'userId': userId,
            'title': payload.title,
            'body': payload.body,
        })

        return response.json(post)
      }
    
      async update ({ auth, params, request, response }) {
        await auth.use('jwt').authenticate()
        const userId = auth.use('jwt').user!.id

        const postSchema = schema.create({
            title: schema.string(),
            body: schema.string(),
        })

        const payload = await request.validate({ schema: postSchema });

        const post = await Post.findOrFail(params.id)
        post.merge({
            'userId': userId,
            'title': payload.title,
            'body': payload.body,
        })
        await post.save()

        return response.json(post)
      }
    
      async destroy ({ params, response }) {
        const post = await Post.findOrFail(params.id)
        await post.delete()

        return response.json(null, 204)
      }
}
