module.exports = {
    secret: 'd38f989e2dbd315793cb2675d29099a8',
    cookie: {
        maxAge: 9e6 // 900,000 ms = 15 min
    },
    adapter: 'redis',
    port: 6379,
    // ttl: <redis session TTL in seconds>,
    db: 7,
    // pass: <redis auth password>
    prefix: 'sess:'
}