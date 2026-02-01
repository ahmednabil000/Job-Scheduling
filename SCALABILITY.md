# System Scalability

To handle the load constraints (~10k users, ~1k job types, 6k RPM), I designed the scheduler with two key optimizations:

## 1. Concurrent Job Polling with `SKIP LOCKED`

Worker instances (not "services") fetch pending jobs using:

```sql
SELECT * FROM jobs
WHERE status = 'pending'
  AND next_run_at <= NOW()
ORDER BY next_run_at
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

## 2. Optimized Indexing for O(log n) Polling

```typescript
pollingIndex: d.index('polling_idx').on(t.nextRunAt, t.status);
```

Without this, polling would scan all jobs (O(n)), failing at 6k RPM.
With the index, PostgreSQL jumps to relevant rows (effectively O(log n)).

## 3. Modular Architecture

The system uses the **Factory Pattern** to create job processors and the **Strategy Pattern** to execute them. This ensures the scheduler remains open for extension but closed for modification (OCP).

### Result

- **6,000 RPM = 100 RPS** → easily handled by 2–5 worker instances.
- **Global users**: Stateless workers + connection pooling (PgBouncer) handle regional traffic.
- **No bottlenecks**: No central coordinator, no table locks, no race conditions.
