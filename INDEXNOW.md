# Deploy-time IndexNow notifications

Every production deployment through `npm run deploy:production` builds the site, compares
content fingerprints with the last saved baseline, persists a pending URL queue,
deploys, and processes that queue. Added, edited and deleted canonical URLs are
included. Unchanged pages are omitted when the saved baseline matches the live
release. Deployment failure leaves the queue unready and sends nothing.

This follows the local website reference's deploy-time queue approach. The key
is public and specific to this host. No reference-project credentials or keys
are used. The implementation checks the live `/release.json` content hash and
public key before delivery, including a release check before each batch.

## First deployment and recovery

State lives in ignored `.indexnow/state.json`. Without a matching saved baseline,
the current sitemap is queued along with removed URLs found in the live sitemap.
If that sitemap is unavailable, all current pages are queued with a warning.
This intentionally replaces the old skip-on-missing-revision behavior.

Local deployments retain state on disk. Production Actions runs restore and save
it through a production-specific Actions cache, even after deployment or retry
failure. Runs are serialized and are not cancelled by a newer deployment. Cache
eviction or deployments from another machine can lose pending deleted URLs;
the live-sitemap bootstrap restores current-page coverage, not a lost delivery
history. Keep using the same deployment path for a continuous baseline.

## Retry without deployment

Run `npm run indexnow:retry` in the same checkout, or dispatch the production
workflow on `main` with `notify_only=true`. The latter restores the saved CI
queue and has no deployment step. If a release has been superseded, retry refuses
to submit its queue; the next deployment merges pending URLs into its new target.
If a deployment failed before completion, retry waits for a successful deployment.

Requests contain at most 10,000 unique same-host URLs. Accepted batches are removed
and persisted immediately. HTTP 200 is receipt; 202 is receipt with key validation
pending. Neither means indexing. Any failure retains remaining URLs, waits at
least ten minutes, and honors longer `Retry-After` seconds or HTTP dates. There
is one attempt per batch per invocation; a later deployment or explicit retry
processes the queue again. No scheduled resubmission is installed.

IndexNow unavailability emits a visible warning and summary without failing an
otherwise successful deployment. Retry-only commands exit unsuccessfully while
URLs remain, including during cooldown. Tests and `--dry-run` never submit or
change the queue. Build fingerprints may include shared asset changes and do
not advance editorial dates.

Use the npm production command rather than invoking Wrangler directly: raw
Wrangler commands bypass this orchestration. Live deployment and notification
receipt require separate production verification. See the
[IndexNow protocol](https://www.indexnow.org/documentation).
