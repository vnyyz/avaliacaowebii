import vine from '@vinejs/vine'

export const aplicacaoValidator = vine.create({
  cliente_id: vine.number().positive(),
  tipo: vine.string().in(['poupanca', 'titulos', 'acoes']),
  valor: vine.number().positive().min(0.01)
})

export const resgateValidator = vine.create({
  investimento_id: vine.number().positive()
})