# Cloud Native Node.js

## Build a 12-Factor Node.js App with Docker

> - <https://m.academy/courses/build-12-factor-nodejs-app-docker/>
> - <https://12factor.net/>

### 1. Codebase

- Git as version control system
- Semantic versioning for tags within the repository
- `main` branch used for releasing

> - <https://git-scm.com/book/en/v2>
> - <https://www.atlassian.com/git/tutorials>

### 2. Dependencies

- `npm` as packaging system
- `package.json` as dependency declaration manifest (using Semantic versioning again)
- `nvm` for isolation
- global packages and local packages
- deterministic build command, e.g. `npm install`
- add `node_modules` to `.gitignore`

> - <https://docs.npmjs.com/about-semantic-versioning>
> - <https://docs.npmjs.com/cli/v8/commands/npm-install>
> - <https://docs.npmjs.com/cli/v8/commands/npm-ci>
> - <https://docs.npmjs.com/cli/v8/commands/npx>
> - <https://www.youtube.com/watch?v=kK4Meix58R4>

### 3. Config

- resource handles to the database, cache, and other backing services
- credentials to external services
- per-deploy values such as the canonical hostname for the deploy
- strict separation of config from code
- internal config that does not vary is not included
- config is stored in environment variables that are never grouped (e.g. to environments)

> - <https://nodejs.dev/learn/how-to-read-environment-variables-from-nodejs>
> - <https://www.npmjs.com/package/dotenv>
> - <https://direnv.net/>

### 4. Backing services

- any service that is consumed over the network
- datastores, messaging/queueing systems, SMTP services, caching, etc.
- local and third party services are both treated as attached resources
- swapping out a local by a third party service should work without code changes
- each distinct backing service is a resource

### 5. Build, release, run

#### Build stage

- transform code into an executable bundle known as *build*
- using a version of the code at a specific commit (e.g. Git hash)
- fetches vendors dependencies
- compiles binaries and assets

#### Release stage

- combines a build with the deploy’s current config
- resulting *release* contains both the build and the config
- ready for immediate executing in the execution environment

#### Run stage

- runs the app in the execution environment
- launching some set of the app’s processes against a selected release

#### Releases

- append-only ledger
- releases cannot be mutated once created
- any change must create a new release

Docker (release)

> - <https://docs.docker.com/get-started/>
> - <https://docs.docker.com/engine/reference/builder/>
> - <https://docs.docker.com/engine/reference/builder/#dockerignore-file>
> - <https://docs.docker.com/engine/reference/commandline/cli/>
> - <https://docs.docker.com/engine/reference/commandline/build/>

Multi-stage builds

> - <https://docs.docker.com/develop/develop-images/multistage-build/>
> - <https://blog.alexellis.io/mutli-stage-docker-builds/>
> - <https://vsupalov.com/docker-image-layers/>
> - <https://docs.docker.com/engine/reference/commandline/history/>
> - <https://github.com/wagoodman/dive>

Docker Compose (run)

> - <https://docs.docker.com/compose/>
> - <https://docs.docker.com/compose/reference/>
> - <https://docs.docker.com/compose/environment-variables/>
> - <https://docs.docker.com/compose/env-file/>

### 6. Processes

- app is executed in the execution environment as one or more processes
- processes are stateless and share nothing
- any data that needs to persist must be stored in a stateful backing service
- “sticky sessions” should never be used or relied upon
- session state data is a good candidate for a datastore (Memcached, Redis)

> - <https://docs.docker.com/storage/>
> - <https://redis.com/solutions/use-cases/session-management/>

### 7. Port binding

- app is completely self-contained
- exports HTTP as a service by binding to a port
- a routing layer handles routing requests from a public-facing hostname to the port-bound web processes
- one app can become the backing service for another app, by providing the URL to the backing app as a resource handle in the config of the consuming app

> - <https://docs.docker.com/network/>
> - <https://docs.docker.com/compose/networking/>

### 8. Concurrency

- processes are first class citizen
- application must be able to span multiple processes running on multiple physical machines
- adding more concurrency is a simple and reliable operation: horizontal scaling
- array of process types and number of processes of each type is known as the *process formation*
- never daemonize or write PID files
- instead rely on the operating system’s process manager (`systemd`) to
  - manage output streams
  - respond to crashed processes
  - handle user-initiated restarts and shutdowns

> - <https://www.nginx.com/resources/glossary/load-balancing/>
> - <https://www.digitalocean.com/community/tutorial_series/from-containers-to-kubernetes-with-node-js>
> - <https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04>
> - <https://blog.logrocket.com/how-to-run-a-node-js-server-with-nginx/>
> - <https://github.com/docker/awesome-compose/tree/master/nginx-nodejs-redis>

### 9. Disposability

- processes are disposable (can be started and stopped at every time)
- processes should strive to minimize startup time
- processes should shut down gracefully when they receive a `SIGTERM` signal from the process manager
- a web process refuses to any new requests, allows any current requests to finish, and then exits
- a worker process returns the current job to the work queue (RabbitMQ: send a `NACK`)
- operation need to be idempotent or wrapped in a transaction for that purpose
- app is architected to handle unexpected, non-graceful terminations

> - <https://nodejs.org/api/process.html#signal-events>
> - <https://blog.dashlane.com/implementing-nodejs-http-graceful-shutdown/>
> - <https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html>
> - <https://docs.lagoon.sh/using-lagoon-advanced/nodejs/>
> - <https://docs.docker.com/config/containers/start-containers-automatically/>
> - <https://docs.docker.com/compose/compose-file/#restart>
> - <https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/>

### 10. Dev/prod parity

- app is designed for continuous deployment (CD) by keeping the gap between development and production small
- add adapters to use lightweight backing services locally if really necessary
- otherwise resist the urge to use different backing services between development and production
- all deploys of the app should be using the same type and version of each of the backing services

### 11. Logs

- logs are a *stream* of aggregated, time-ordered events collected from the output streams of all running processes and backing services
- logs in their raw format are typically a text format with one event per line
- app never concerns itself with routing or storage of its output stream
- each running process writes its event stream, unbuffered, to `stdout`
- archival destinations are completely managed by the execution environment

> - <https://www.twilio.com/blog/guide-node-js-logging>
> - <https://getpino.io/#/>
> - <https://skaug.dev/node-js-app-with-loki/>
> - <https://www.fluentd.org/>
> - <https://docs.fluentd.org/language-bindings/nodejs>
> - <https://docs.docker.com/config/containers/logging/>
> - <https://grafana.com/oss/loki/>
> - <https://grafana.com/docs/loki/latest/clients/promtail/>
> - <https://grafana.com/docs/loki/latest/installation/docker/>
> - <https://blog.ruanbekker.com/blog/2020/08/13/getting-started-on-logging-with-loki-using-docker/>
> - <https://thesmarthomejourney.com/2021/08/23/loki-grafana-log-aggregation/>
> - <https://github.com/nginxinc/docker-nginx/blob/master/mainline/alpine/Dockerfile#L117-L119>

### 12. Admin processes

- one-off administrative or maintenance tasks:
  - running database migrations
  - running a console (REPL) to run arbitrary code
  - running one-time scripts committed into the app’s repo
- they run against a release, using the same codebase and config
