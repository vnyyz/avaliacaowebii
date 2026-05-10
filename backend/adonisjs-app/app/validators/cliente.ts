import vine from '@vinejs/vine'

export const clienteValidator = vine.create({
  nome: vine.string().minLength(2).maxLength(255),
  email: vine.string().email().unique({ table: 'clientes', column: 'email' }),
  senha: vine.string().minLength(6).maxLength(32),
  cpf: vine.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).unique({ table: 'clientes', column: 'cpf' }),
  cidade: vine.string().minLength(2).maxLength(100),
  estado: vine.string().minLength(2).maxLength(50),
  rua: vine.string().minLength(2).maxLength(255),
  numero: vine.string().minLength(1).maxLength(20)
})