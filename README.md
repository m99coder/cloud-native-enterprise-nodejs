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

The [Three Pillars of observability](https://grafana.com/blog/2019/10/21/whats-next-for-observability/) are metrics, logs, and traces.

- Metrics: [Prometheus](https://grafana.com/oss/prometheus/), [Grafana Mimir](https://grafana.com/oss/mimir/) for multi-tenant, long-term storage for Prometheus
- Logs: [Grafana Loki](https://grafana.com/oss/loki/)
- Traces: [Grafana Tempo](https://grafana.com/oss/tempo/)

```shell
# install plugin to allow applications to ship their logs to Loki
docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions

# start observability stack
docker compose -f ./observability/docker-compose.yaml \
  up -d

# stop observability stack
docker compose -f ./observability/docker-compose.yaml \
  down
# stop observability stack and remove volumes
docker compose -f ./observability/docker-compose.yaml \
  down -v
```

In [Grafana](http://localhost:3000/explore?orgId=1&left=%5B%22now-1h%22,%22now%22,%22Loki%22,%7B%22expr%22:%22%7Bcontainer_name%3D%5C%22observability-loki-1%5C%22%7D%20%7C%3D%20%5C%22traceID%5C%22%22%7D%5D) we can query for logs from the Loki container that contain a `traceID` using this query:

```promql
{container_name="observability_loki_1"} |= "traceID"
```

Drop down any log line of the result and click the “Tempo” link to jump directly from logs to traces.

```shell
npm install -g pino-loki@^1
PORT=4000 npm start | pino-loki --hostname=http://localhost:3100
```

You can see the application logs in [Grafana](http://localhost:3000/explore?orgId=1&left=%5B%22now-1h%22,%22now%22,%22Loki%22,%7B%22expr%22:%22%7Bapplication%3D%5C%22App%5C%22%7D%22%7D%5D).

*TODO:* Figure out why the we get this error:

```text
Attempting to send log to Loki failed with status '400: Bad Request' returned reason: entry with timestamp 2022-05-06 15:01:00.566 +0000 UTC ignored, reason: 'entry out of order' for stream: {application="App", level="info"},
total ignored: 1 out of 1
```

Maybe it’s better to use [pino-tee](https://github.com/pinojs/pino-tee) and configure [Promtail](https://grafana.com/docs/loki/latest/clients/promtail/) to pick the logs up from there.

### Resources

- [Run Grafana Docker image](https://grafana.com/docs/grafana/latest/installation/docker/)
- [Install Grafana Loki with Docker or Docker Compose](https://grafana.com/docs/loki/latest/installation/docker/)
- Getting started with Grafana Loki: [Guide](https://grafana.com/docs/loki/latest/getting-started/), [Code](https://github.com/grafana/loki/tree/main/examples/getting-started), [Scraping](https://grafana.com/docs/loki/latest/clients/promtail/scraping/#file-target-discovery)
- Grafana Tempo: [Documentation](https://grafana.com/docs/tempo/latest/), [Loki example](https://github.com/grafana/tempo/tree/main/example/docker-compose/loki)
- [A simple Loki setup with Grafana](https://github.com/livingdocsIO/monitoring)
- [Loki logging in Node.js using Fastify and Pino](https://skaug.dev/node-js-app-with-loki/)
- [OpenTelemetry – Grafana Demo](https://github.com/connorlindsey/otel-grafana-demo)
