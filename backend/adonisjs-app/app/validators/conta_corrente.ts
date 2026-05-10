import vine from '@vinejs/vine'

export const contaCorrenteValidator = vine.create({
  cliente_id: vine.number().positive()
})