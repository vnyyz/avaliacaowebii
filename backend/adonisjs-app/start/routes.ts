import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.post('/signup', 'NewAccountController.store')
router.post('/login', 'AccessTokensController.store')
router.delete('/logout', 'AccessTokensController.destroy')
router.get('/profile', 'ProfileController.show')

router.post('/clientes', 'ClientesController.store')
router.get('/clientes', 'ClientesController.index').middleware(middleware.auth())
router.post('/contas', 'ContaCorrentesController.store')
router.get('/contas/:id', 'ContaCorrentesController.show')
router.get('/contas/:id/saldo', 'MovimentacaosController.saldo')
router.get('/contas/:id/extrato', 'MovimentacaosController.extrato')
router.post('/pix', 'MovimentacaosController.pix')

router.post('/investimentos', 'InvestimentosController.store')
router.post('/investimentos/resgate', 'InvestimentosController.resgate')
router.get('/clientes/:cliente_id/investimentos', 'InvestimentosController.index')
