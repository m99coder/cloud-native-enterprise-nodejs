# TypeScript in Visual Studio Code

## Configuration

Some formatting settings like format on save using the [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for VSCode:

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.defaultFormatter": "dbaeumer.vscode-eslint",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
  ],
  "files.insertFinalNewline": true
}
```

To support [direnv](https://direnv.net/), everything you need to do is to define an `.envrc` that calls `dotenv` as described [here](https://github.com/direnv/direnv/issues/284#issuecomment-315275436).

## Fastify

The Fastify web framework comes bundled with Pino by default, as described [here](https://github.com/pinojs/pino/blob/master/docs/web.md#fastify). A pretty-printed variant can be achieved by piping stdout to [pino-pretty](https://github.com/pinojs/pino-pretty):

```shell
npm i -g pino-pretty
npm run dev | pino-pretty
```

Jay Wolfe has some nice blog posts about using Fastify the right way:

- [Setup Your Fastify Server With Logging The Right Way - No More Express](https://jaywolfe.dev/setup-your-fastify-server-with-logging-the-right-way-no-more-express-2/)
- [Setup A Fastify App with Jest Tests the Right Way](https://jaywolfe.dev/setup-a-fastify-app-with-jest-tests-the-right-way/)

## Testing

To make use of the coverage report it’s recommended to install the [Jest plugin](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest).

```shell
# run tests
npm test

# run tests and generate coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

## Running

```shell
# clean compile folder
npm run clean

# compile TypeScript to JavaScript
npm run build

# run application
npm start

# run application in development mode with hot-reloading
npm run dev

# lint sources
npm run lint

# format sources
npm run fmt
```

Environment variables

| Variable    | Type     | Default |
| ----------- | -------- | ------- |
| `LOG_LEVEL` | `string` | `info`  |
| `PORT`      | `number` | 3000    |

## Scaling

### Load Balancing

> [HAProxy](http://www.haproxy.org/) is a free and open source software that provides a high availability load balancer and reverse proxy for TCP and HTTP-based applications that spreads requests across multiple servers.

```shell
# start 3 server instances
PORT=3001 npm start
PORT=3002 npm start
PORT=3003 npm start
```

```shell
# install and start HAProxy
brew install haproxy
haproxy -f ./haproxy/haproxy.cfg
```

```shell
# open the stats dashboard
open http://localhost:3000/admin/stats

# call the API
curl -i http://localhost:3000

# terminate one of the API servers with `kill <pid>`
# HAProxy detects that the API is down
# re-start the API server and HAProxy will include it into load-balancing again
```

By default a health check is performed on Layer 4 (TCP). If `haproxy.cfg` defines `option httpchk GET /health` for a backend the health check is changing to be on Layer 7 (HTTP), as you can see in the stats dashboard (`LastChk` column).

In order to use gzip compression, you need to provide the respective header. The HAProxy configuration file defines the compression to be available for content types `application/json` and `text/plain`.

```shell
curl -s http://localhost:3000/ -H "Accept-Encoding: gzip" | gunzip
```

HAProxy can also be configured to close connections as soon as a maximum number of connections is reached to avoid back pressure.

### Load Testing

In order to load test one instance of the application, we stop HAProxy and start the instance without piping to `pino-pretty`.

> [AutoCannon](https://github.com/mcollina/autocannon#readme), is an HTTP/1.1 benchmarking tool written in Node.js, greatly inspired by [wrk](https://github.com/wg/wrk) and [wrk2](https://github.com/giltene/wrk2), with support for HTTP pipelining and HTTPS.

```shell
npm i -g autocannon
```

```shell
$ autocannon -d 60 -c 10 -l http://localhost:3003
Running 60s test @ http://localhost:3003/
10 connections


┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼───────┤
│ Latency │ 0 ms │ 0 ms │ 3 ms  │ 5 ms │ 0.72 ms │ 1.08 ms │ 45 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴───────┘
┌───────────┬────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 5255   │ 6863    │ 7747    │ 8399    │ 7765.04 │ 501.98  │ 5254   │
├───────────┼────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 956 kB │ 1.25 MB │ 1.41 MB │ 1.53 MB │ 1.41 MB │ 91.3 kB │ 956 kB │
└───────────┴────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 60

┌────────────┬──────────────┐
│ Percentile │ Latency (ms) │
├────────────┼──────────────┤
│ 75         │ 1            │
├────────────┼──────────────┤
│ 90         │ 2            │
├────────────┼──────────────┤
│ 97.5       │ 3            │
├────────────┼──────────────┤
│ 99         │ 5            │
├────────────┼──────────────┤
│ 99.9       │ 8            │
├────────────┼──────────────┤
│ 99.99      │ 15           │
├────────────┼──────────────┤
│ 99.999     │ 36           │
└────────────┴──────────────┘

466k requests in 60.02s, 84.8 MB read
```

> [wrk](https://github.com/wg/wrk) is a modern HTTP benchmarking tool capable of generating significant load when run on a single multi-core CPU.

```shell
brew install wrk
```

```shell
$ wrk -c10 -d60s http://localhost:3003
Running 1m test @ http://localhost:3003
  2 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.39ms    1.23ms  34.95ms   90.76%
    Req/Sec     4.07k   502.92     4.86k    85.67%
  485920 requests in 1.00m, 84.34MB read
Requests/sec:   8094.31
Transfer/sec:      1.40MB
```

Based on these numbers the application reaches a throughput of ~5,000 requests/s when run locally on my specific machine. TP99 (top percentile 99) is ~5 ms, while TP99.999 is ~36 ms.
