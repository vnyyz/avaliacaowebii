import vine from '@vinejs/vine'

export const pixValidator = vine.create({
  conta_origem_id: vine.number().positive(),
  numero_conta_destino: vine.string().minLength(10).maxLength(20),
  valor: vine.number().positive().min(0.01)
})