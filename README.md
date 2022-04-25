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

> [wrk](https://github.com/wg/wrk) is a modern HTTP benchmarking tool capable of generating significant load when run on a single multi-core CPU.

```shell
brew install wrk
```

```shell
$ wrk -c10 -d60s --latency http://localhost:3001/health
Running 1m test @ http://localhost:3001/health
  2 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   752.68us    0.85ms  33.52ms   93.70%
    Req/Sec     7.73k     0.94k    9.52k    74.42%
  Latency Distribution
     50%  430.00us
     75%    0.93ms
     90%    1.32ms
     99%    3.45ms
  923474 requests in 1.00m, 108.33MB read
Requests/sec:  15388.55
Transfer/sec:      1.81MB
```

```shell
$ haproxy -f ./haproxy/passthrough.cfg
$ wrk -c10 -d60s --latency http://localhost:3000/health
Running 1m test @ http://localhost:3000/health
  2 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.90ms    1.54ms  49.85ms   90.55%
    Req/Sec    10.08k     2.29k   13.40k    66.08%
  Latency Distribution
     50%  347.00us
     75%  689.00us
     90%    2.33ms
     99%    6.89ms
  1203917 requests in 1.00m, 141.22MB read
Requests/sec:  20062.58
Transfer/sec:      2.35MB
```

Based on these numbers the application – run locally on my specific machine – reaches a throughput of ~15,000 requests/s and a TP99 (top percentile 99%) for latency of ~4 ms, when testing only one instance. Using HAProxy with a passthrough configuration reaches a throughput of ~20,000 requests/s and a TP99 for latency is ~7 ms.

## Observability

> This [Docker image](https://github.com/spujadas/elk-docker) provides a convenient centralised log server and log management web interface, by packaging Elasticsearch, Logstash, and Kibana, collectively known as ELK.

- Elasticsearch: Database (Port 9200, TCP)
- Logstash: Log ingestion (Port 7777, UDP)
- Kibana: Dashboard (Port 5601, TCP)

```shell
docker run --rm -it \
  -p 5601:5601 \
  -p 9200:9200 \
  -p 5044:5044 \
  -p 7777:7777/udp \
  -v $(pwd)/elk/udp.conf:/etc/logstash/conf.d/99-input-udp.conf \
  -e MAX_MAP_COUNT=262144 \
  --name elk sebp/elk:oss-8.1.0
```

[OpenTelemetry – Grafana Demo](https://github.com/connorlindsey/otel-grafana-demo)

> Demo application showing how to instrument a Node application with OpenTelemetry, Prometheus, Jaeger, Loki, and Grafana. Built with Next.js, Fastify, and Postgres.
