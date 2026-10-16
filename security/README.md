# ZAP assessment and viva evidence

This assessment uses the existing application code, a separate local MongoDB instance on `127.0.0.1:27029`, synthetic data, and an app instance on `http://127.0.0.1:4010`. Existing databases and external payment/email/upload services are not used. No vulnerabilities were added to increase the finding count.

Private local downloads, credentials, runtime configuration and sessions live in `.security-tools/`. Reports live in `security/reports/`. Both are excluded from Git because scan evidence can contain authentication tokens and sensitive responses.

Double-click `Open-ZAP.cmd` in the repository root to open the installed ZAP desktop with the saved assessment session. The launcher gracefully closes the background ZAP service first to release the session lock. Open `security/reports/optical-store-zap-report.html` for the native ZAP report, and `security/reports/VIVA-NOTES.md` for the evidence and suggested fixes.

## What the report means

- Automatic ZAP alerts are scanner observations and require review. Missing headers and informational messages must not be presented as proven high-impact exploits.
- Findings named `[Manual verified]` are application-specific tests performed through the ZAP proxy, with positive/negative controls where applicable. They are recorded as manual alerts in the ZAP session so ZAP can export them. They were not automatically discovered by a generic scan rule.
- Password-reset tests use a synthetic reset-token fixture generated with the application's reset signing logic. This avoids sending email. The tests establish acceptance/reuse of that token, not a working email-delivery flow.
- Separate findings for order payment ownership and payment-provider verification describe different required controls. Likewise, prescription confidentiality and integrity are separate impacts. Group these under their shared root causes when discussing remediation; do not describe each affected URL as another independent vulnerability.
- Local HTTP and the existing frontend build are test-environment properties. Validate deployed TLS, reverse-proxy headers, and frontend build freshness separately.

## Essential scope exclusions

Do not browse, spider, or scan `/api/seed`. Its unauthenticated GET handler removes all users and products. It is a source-reviewed issue, excluded from the verified HTTP count. Also exclude `/api/users/forget-password` to avoid email attempts and `/api/upload` to avoid external uploads. Keep payment-provider, Maps, Cloudinary and Mailgun hosts outside scope.

Suggested full-URL exclusion regex:

```text
http://127\.0\.0\.1:4010/api/(seed(?:[/?].*)?|users/forget-password(?:[/?].*)?|upload(?:[/?].*)?)
```

## Reproduce locally

The local helper scripts are in `.security-tools/`. They are deliberately restricted to the isolated target and database.

1. Start the dedicated MongoDB instance with `.security-tools/mongo-data` as its data directory, bound to `127.0.0.1:27029`. The existing system database service is unrelated.
2. Run `node .security-tools/start-demo.mjs` from the repository root. This creates a fresh random JWT secret and demo password, then starts the original server on port 4010 with the bundled frontend build.
3. Start ZAP using the supplied portable Java runtime, a dedicated ZAP home/session and a loopback proxy on port 8091. Keep the API key enabled. See `.security-tools/start-zap.ps1` when installation is complete.
4. Run `node .security-tools/seed-demo.mjs`. **This resets only the dedicated `optical_zap_viva` database on port 27029**, then creates synthetic users Alice/Bob and sample records.
5. Run `node .security-tools/verify-findings.mjs --zap`. This checks the application through ZAP and writes redacted evidence to `security/reports/manual-verification.json`.
6. Run `node .security-tools/export-zap.mjs` to associate verified findings with actual ZAP history messages and export reports. This requires the prepared ZAP API configuration.

Running verification without `--zap` is a direct HTTP diagnostic run. Its evidence explicitly says that ZAP recording is pending; it must not be described as a ZAP scan.

## Viva demonstration

Use the saved ZAP session and the HTML report. For one finding, show the exact endpoint, the ordinary user's role, the expected authorization result, the observed response, impact, and the proposed fix. For IDOR, compare the record owner's successful request, the anonymous rejected request, and the unrelated authenticated user's successful request.

For payment verification, explain that an empty request changing `isPaid` demonstrates a missing server-side verification step. For price tampering, compare the fixture catalog price of 100 with the accepted order total of 0.01. Use only synthetic card data.

Save screenshots of ZAP Alerts, the relevant History request/response, and the report summary. Preserve the distinction between automatic alerts, manually verified findings, and source-review-only concerns. A finding count is not a measure of overall security or completeness.

## Official ZAP documentation

- [Manual exploration and scanning](https://www.zaproxy.org/docs/desktop/start/)
- [Adding a manual alert](https://www.zaproxy.org/docs/desktop/ui/dialogs/addalert/)
- [Generating reports](https://www.zaproxy.org/docs/desktop/addons/report-generation/)
- [Report generation API](https://www.zaproxy.org/docs/desktop/addons/report-generation/api/)
