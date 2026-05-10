import Cliente from '#models/cliente'
import { clienteValidator } from '#validators/cliente'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientesController {
  async store({ request, response }: HttpContext) {
    const { nome, email, senha, cpf, cidade, estado, rua, numero } = await request.validateUsing(clienteValidator)

    const cliente = await Cliente.create({
      nome,
      email,
      senha,
      cpf,
      cidade,
      estado,
      rua,
      numero
    })

    return response.created(cliente)
  }

  async index({ response }: HttpContext) {
    const clientes = await Cliente.query().orderBy('id', 'asc')
    return response.ok(clientes)
  }
}