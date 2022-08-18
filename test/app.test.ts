import build from '../src/app'

test('default root route', async () => {
  const app = build()
  const res = await app.inject({
    url: '/',
  })
  expect(res.json()).toEqual({ ok: true })
})

test('health check route', async () => {
  const app = build()
  const res = await app.inject({
    url: '/health',
  })
  expect(res.statusCode).toEqual(200)
  expect(res.body).toEqual('')
})
