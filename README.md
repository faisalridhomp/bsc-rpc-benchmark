# bsc-rpc-benchmark

Measure which public BSC RPC endpoint is fastest right now.

Free-mint racers (like fastmint) fire the same call at 6 RPCs in parallel,
but knowing which endpoint is actually fastest — and which are dead —
saves the race. This script sends `eth_blockNumber` to each RPC 5 times
and ranks them by median latency.

## Usage

```bash
node bench.js
```

No dependencies — plain `fetch` (Node 18+).

```
benchmarking 11 BSC RPCs (eth_blockNumber x5 each)...

     55ms  bsc-dataseed1.ninicoin.io  (5/5 ok, block 133181820)
     67ms  bsc-dataseed1.binance.org  (5/5 ok, block 133181820)
     ...
  DEAD   binance.llamarpc.com
  DEAD   rpc.ankr.com/bsc

fastest: https://bsc-dataseed1.ninicoin.io (55ms)
```

Edit the `RPCS` list in `bench.js` to test your own endpoints.
