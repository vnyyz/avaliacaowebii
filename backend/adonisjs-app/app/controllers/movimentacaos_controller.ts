import Movimentacao from '#models/movimentacao'
import ContaCorrente from '#models/conta_corrente'
import { pixValidator } from '#validators/movimentacao'
import type { HttpContext } from '@adonisjs/core/http'

export default class MovimentacaosController {
  async pix({ request, response }: HttpContext) {
    const { conta_origem_id, numero_conta_destino, valor } = await request.validateUsing(pixValidator)

    // Verificar conta origem
    const contaOrigem = await ContaCorrente.find(conta_origem_id)
    if (!contaOrigem) {
      return response.badRequest({ message: 'Conta de origem não encontrada' })
    }

    // Verificar saldo suficiente
    if (contaOrigem.saldo < valor) {
      return response.badRequest({ message: 'Saldo insuficiente' })
    }

    // Verificar conta destino
    const contaDestino = await ContaCorrente.query().where('numero_conta', numero_conta_destino).first()
    if (!contaDestino) {
      return response.badRequest({ message: 'Conta de destino não encontrada' })
    }

    // Evitar transferência para mesma conta
    if (contaOrigem.id === contaDestino.id) {
      return response.badRequest({ message: 'Não é possível transferir para a mesma conta' })
    }

    try {
      // Debitar da conta origem
      contaOrigem.saldo -= valor
      await contaOrigem.save()

      // Creditar na conta destino
      contaDestino.saldo += valor
      await contaDestino.save()

      // Registrar movimentação
      const movimentacao = await Movimentacao.create({
        contaOrigemId: contaOrigem.id,
        contaDestinoId: contaDestino.id,
        tipo: 'transferencia',
        valor,
        descricao: 'Transferência PIX'
      })

      return response.created(movimentacao)
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao processar transferência' })
    }
  }

  async saldo({ params, response }: HttpContext) {
    const conta = await ContaCorrente.find(params.id)
    if (!conta) {
      return response.notFound({ message: 'Conta não encontrada' })
    }

    return {
      saldo: conta.saldo,
      numero_conta: conta.numeroConta,
      agencia: conta.agencia
    }
  }

  async extrato({ params, response }: HttpContext) {
    const conta = await ContaCorrente.find(params.id)
    if (!conta) {
      return response.notFound({ message: 'Conta não encontrada' })
    }

    const movimentacoes = await Movimentacao.query()
      .where('conta_origem_id', conta.id)
      .orWhere('conta_destino_id', conta.id)
      .orderBy('created_at', 'desc')

    const extrato = movimentacoes.map((mov) => ({
      id: mov.id,
      tipo: mov.tipo,
      valor: mov.contaOrigemId === conta.id ? -mov.valor : mov.valor,
      descricao: mov.descricao,
      data: mov.createdAt,
    }))

    return {
      conta: {
        numero_conta: conta.numeroConta,
        agencia: conta.agencia,
      },
      extrato,
    }
  }
}