// bsc-rpc-benchmark — measure which public BSC RPC is fastest right now.
//
// fastmint races 6 RPCs in parallel, but knowing which one is actually
// fastest (and which are dead) saves the race. This script sends
// eth_blockNumber to each RPC 5 times and ranks them by median latency.
//
// Usage: node bench.js
// No dependencies — plain fetch (Node 18+).

const RPCS = [
    "https://bsc-dataseed.bnbchain.org",
    "https://bsc-dataseed1.binance.org",
    "https://bsc-dataseed2.binance.org",
    "https://bsc-dataseed3.bnbchain.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
    "https://bsc.publicnode.com",
    "https://bsc-rpc.publicnode.com",
    "https://binance.llamarpc.com",
    "https://rpc.ankr.com/bsc",
];

async function ping(url, rounds = 5) {
    const latencies = [];
    let block = null;
    for (let i = 0; i < rounds; i++) {
        const t0 = Date.now();
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
                signal: AbortSignal.timeout(8000),
            });
            const ms = Date.now() - t0;
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.error) throw new Error(json.error.message);
            block = parseInt(json.result, 16);
            latencies.push(ms);
        } catch (e) {
            latencies.push(null);
        }
    }
    const ok = latencies.filter((x) => x !== null);
    if (!ok.length) return { url, ok: 0, median: null, block };
    ok.sort((a, b) => a - b);
    return { url, ok: ok.length, median: ok[Math.floor(ok.length / 2)], block };
}

async function main() {
    console.log(`benchmarking ${RPCS.length} BSC RPCs (eth_blockNumber x5 each)...\n`);
    const results = await Promise.all(RPCS.map((u) => ping(u)));
    results.sort((a, b) => (a.median ?? 1e9) - (b.median ?? 1e9));
    for (const r of results) {
        const host = r.url.replace("https://", "");
        console.log(r.median === null
            ? `  DEAD   ${host}`
            : `  ${String(r.median).padStart(5)}ms  ${host}  (${r.ok}/5 ok, block ${r.block})`);
    }
    const best = results.find((r) => r.median !== null);
    if (best) console.log(`\nfastest: ${best.url} (${best.median}ms)`);
}

main();
