import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investimentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('cliente_id').unsigned().references('id').inTable('clientes').onDelete('CASCADE')
      table.enum('tipo', ['poupanca', 'titulos', 'acoes']).notNullable()
      table.decimal('valor_investido', 15, 2).notNullable()
      table.timestamp('data_aplicacao').notNullable()
      table.timestamp('data_resgate').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
