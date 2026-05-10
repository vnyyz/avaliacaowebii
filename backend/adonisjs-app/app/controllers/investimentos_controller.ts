import Investimento from '#models/investimento'
import ContaCorrente from '#models/conta_corrente'
import Movimentacao from '#models/movimentacao'
import { aplicacaoValidator, resgateValidator } from '#validators/investimento'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class InvestimentosController {
  async store({ request, response }: HttpContext) {
    const { cliente_id, tipo, valor } = await request.validateUsing(aplicacaoValidator) as {
      cliente_id: number
      tipo: 'poupanca' | 'titulos' | 'acoes'
      valor: number
    }

    // Verificar conta corrente do cliente
    const conta = await ContaCorrente.query().where('cliente_id', cliente_id).first()
    if (!conta) {
      return response.badRequest({ message: 'Cliente não possui conta corrente' })
    }

    // Verificar saldo suficiente
    if (conta.saldo < valor) {
      return response.badRequest({ message: 'Saldo insuficiente para aplicação' })
    }

    try {
      // Debitar da conta corrente
      conta.saldo -= valor
      await conta.save()

      // Criar investimento
      const investimento = await Investimento.create({
        clienteId: cliente_id,
        tipo,
        valorInvestido: valor,
        dataAplicacao: DateTime.local()
      })

      // Registrar movimentação
      await Movimentacao.create({
        contaOrigemId: conta.id,
        tipo: 'aplicacao',
        valor,
        descricao: `Aplicação em ${tipo}`
      })

      return response.created(investimento)
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao processar aplicação' })
    }
  }

  async resgate({ request, response }: HttpContext) {
    const { investimento_id } = await request.validateUsing(resgateValidator)

    // Verificar investimento
    const investimento = await Investimento.find(investimento_id)
    if (!investimento) {
      return response.notFound({ message: 'Investimento não encontrado' })
    }

    if (investimento.dataResgate) {
      return response.badRequest({ message: 'Investimento já foi resgatado' })
    }

    // Verificar conta corrente do cliente
    const conta = await ContaCorrente.query().where('cliente_id', investimento.clienteId).first()
    if (!conta) {
      return response.badRequest({ message: 'Conta corrente não encontrada' })
    }

    try {
      // Creditar na conta corrente
      conta.saldo += investimento.valorInvestido
      await conta.save()

      // Marcar investimento como resgatado
      investimento.dataResgate = DateTime.local()
      await investimento.save()

      // Registrar movimentação
      await Movimentacao.create({
        contaOrigemId: conta.id,
        tipo: 'resgate',
        valor: investimento.valorInvestido,
        descricao: `Resgate de ${investimento.tipo}`
      })

      return response.ok({ message: 'Resgate realizado com sucesso' })
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao processar resgate' })
    }
  }

  async index({ params }: HttpContext) {
    const investimentos = await Investimento.query()
      .where('cliente_id', params.cliente_id)
      .orderBy('created_at', 'desc')

    return investimentos
  }
}