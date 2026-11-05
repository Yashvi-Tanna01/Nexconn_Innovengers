# ANTAH backend development

## Greenfield Community demo seed

From `backend`, run the repeatable development seed against a local SQLite
database:

```powershell
python scripts/seed_demo.py --database-url sqlite:///./demo_antah.db
```

The script replaces only the fixed Greenfield demo accounts and their related
reports, clusters, incidents, assignments, notifications, and activity logs.
It does not alter other application data. This dataset is for local
development/testing only and must not be used in production.

All demo accounts use the password `antah-demo-2026`:

- Residents: `resident01` through `resident08` at `@greenfield.antah.local`
- Coordinators: `coordinator01` and `coordinator02` at `@greenfield.antah.local`
- Responders: `responder01` through `responder03` at `@greenfield.antah.local`
