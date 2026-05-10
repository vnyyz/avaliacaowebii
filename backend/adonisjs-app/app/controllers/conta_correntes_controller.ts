import ContaCorrente from '#models/conta_corrente'
import Cliente from '#models/cliente'
import { contaCorrenteValidator } from '#validators/conta_corrente'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContaCorrentesController {
  async store({ request, response }: HttpContext) {
    const { cliente_id } = await request.validateUsing(contaCorrenteValidator)

    // Verificar se cliente existe
    const cliente = await Cliente.find(cliente_id)
    if (!cliente) {
      return response.badRequest({ message: 'Cliente não encontrado' })
    }

    // Verificar se cliente já tem conta corrente
    const contaExistente = await ContaCorrente.query().where('cliente_id', cliente_id).first()
    if (contaExistente) {
      return response.badRequest({ message: 'Cliente já possui conta corrente' })
    }

    // Gerar número da conta (simples para demonstração)
    const numeroConta = String(Math.floor(1000000000 + Math.random() * 9000000000))
    const agencia = '0001'

    const conta = await ContaCorrente.create({
      clienteId: cliente_id,
      numeroConta: numeroConta,
      agencia,
      saldo: 0
    })

    return response.created(conta)
  }

  async show({ params, response }: HttpContext) {
    const conta = await ContaCorrente.find(params.id)

    if (!conta) {
      return response.notFound({ message: 'Conta não encontrada' })
    }

    return conta
  }
}