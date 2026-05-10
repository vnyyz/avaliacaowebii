import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'movimentacoes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('conta_origem_id').unsigned().references('id').inTable('contas_correntes').onDelete('CASCADE')
      table.integer('conta_destino_id').unsigned().references('id').inTable('contas_correntes').nullable()
      table.enum('tipo', ['deposito', 'saque', 'transferencia', 'aplicacao', 'resgate']).notNullable()
      table.decimal('valor', 15, 2).notNullable()
      table.string('descricao').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
