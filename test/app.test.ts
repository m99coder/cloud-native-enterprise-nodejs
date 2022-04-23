import build from '../src/app'

test('default root route', async () => {
  const app = build()
  const res = await app.inject({
    url: '/',
  })
  expect(res.json()).toEqual({ ok: true })
})

test('hello route', async () => {
  const app = build()
  const res = await app.inject({
    url: '/hello',
  })
  expect(res.json()).toEqual({ ok: true })
})
