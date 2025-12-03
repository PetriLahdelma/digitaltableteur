# Sentry Alert Configuration Guide

This document describes how to configure Sentry alerts for security events and failed authentication attempts.

## Prerequisites

1. Sentry account and project set up
2. `VITE_SENTRY_DSN` configured in environment variables
3. Sentry integration initialized in `sentry.client.config.ts` and `sentry.server.config.ts`

## Alert Rules to Configure

### 1. Failed Authentication Attempts

**Alert Name**: Multiple Failed CV Password Attempts  
**Condition**: Security event `auth_failed` occurs more than 5 times from the same IP in 10 minutes  
**Severity**: Warning  
**Action**: Send email notification

**Configuration Steps**:

1. Go to Sentry → Alerts → Create Alert Rule
2. Select "Issues"
3. Set conditions:
   - `event.tags.security_event` equals `auth_failed`
   - `event.contexts.access_log.ip` (group by IP)
   - Threshold: 5 events in 10 minutes
4. Actions:
   - Send notification to: `mail@digitaltableteur.com`
   - Slack webhook (optional)

### 2. Rate Limit Exceeded

**Alert Name**: Rate Limit Violations  
**Condition**: `rate_limit_exceeded` events occur more than 10 times in 1 hour  
**Severity**: Warning  
**Action**: Send email notification, create Slack message

**Configuration**:

```javascript
{
  "name": "Rate Limit Exceeded",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_attribute.EventAttributeCondition",
      "attribute": "tags.security_event",
      "match": "eq",
      "value": "rate_limit_exceeded"
    }
  ],
  "frequency": 10,
  "timeWindow": 60,
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "Member",
      "targetIdentifier": "mail@digitaltableteur.com"
    }
  ]
}
```

### 3. Suspicious Activity

**Alert Name**: Suspicious Security Events  
**Condition**: Any `suspicious_activity` event occurs  
**Severity**: Error  
**Action**: Immediate notification (email + Slack)

**Configuration**:

- Trigger on first occurrence
- No threshold (alert immediately)
- Priority: High
- Notify: Email + Slack

### 4. High Volume of Failed Requests

**Alert Name**: High Error Rate on Security Endpoints  
**Condition**: >10 errors on `/api/download-cv` or `/api/gdpr/*` in 5 minutes  
**Severity**: Error  
**Action**: Email notification

### 5. GDPR Data Deletion Requests

**Alert Name**: Data Deletion Request Failed  
**Condition**: `data_deletion` event with `success: false`  
**Severity**: Warning  
**Action**: Email notification for manual review

## Sentry Integration Code

The SecurityLogger automatically sends events to Sentry:

```typescript
import { SecurityLogger } from "@/app/lib/security-logger";

// Log authentication attempt
SecurityLogger.logAuthAttempt(
  ip,
  userAgent,
  "/api/download-cv",
  false, // success = false
  "Invalid password",
);

// Log rate limit
SecurityLogger.logRateLimitExceeded(ip, userAgent, "/api/chat");

// Log GDPR deletion
SecurityLogger.logDataDeletion(
  ip,
  userAgent,
  email,
  true, // success
);
```

## Alert Notification Channels

### Email

- Primary: `mail@digitaltableteur.com`
- Configured in Sentry → Settings → Notifications

### Slack (Optional)

Create a Slack webhook:

1. Go to Slack App Directory → Incoming Webhooks
2. Add to your workspace
3. Copy webhook URL
4. Add to Sentry → Settings → Integrations → Slack
5. Configure alert rules to use Slack

### PagerDuty (Optional, for critical alerts)

For production critical alerts, consider integrating PagerDuty:

1. Create PagerDuty service
2. Get integration key
3. Add to Sentry → Integrations → PagerDuty
4. Configure critical alerts to trigger PagerDuty incidents

## Monitoring Dashboard

Create a custom Sentry dashboard for security monitoring:

### Widgets to Add:

1. **Failed Auth Timeline** - Line chart of `auth_failed` events over time
2. **Rate Limit by Endpoint** - Bar chart grouped by endpoint
3. **Top IPs with Failed Auth** - Table of IPs with most failures
4. **GDPR Requests** - Count of data deletion requests
5. **Security Event Distribution** - Pie chart of event types

### Example Dashboard Query:

```
event.tags.security_event:*
AND event.timestamp:>-7d
```

## Testing Alerts

Test each alert rule:

```bash
# Test failed auth alert
curl -X POST https://digitaltableteur.com/api/download-cv \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}' \
  # Repeat 6+ times to trigger threshold

# Test rate limit alert (requires rate limiting to be implemented)
for i in {1..15}; do
  curl https://digitaltableteur.com/api/chat
done

# Test GDPR deletion
curl -X POST https://digitaltableteur.com/api/gdpr/delete-data \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Alert Response Procedures

### Failed Authentication Alert

1. Review IP address in alert
2. Check if it's a known IP (team member, partner)
3. If suspicious, consider blocking IP in Vercel/Cloudflare
4. Review recent successful auth attempts

### Rate Limit Alert

1. Identify endpoint being hit
2. Check if it's legitimate traffic (monitoring, crawler)
3. Adjust rate limits if needed
4. Block IP if confirmed abuse

### Suspicious Activity Alert

1. **Immediate action required**
2. Review full event context
3. Check what triggered the suspicious activity flag
4. Consider temporary endpoint shutdown if under attack
5. Review logs for related suspicious activity

### GDPR Deletion Failed Alert

1. Check error reason in alert
2. Verify if it's a database connectivity issue
3. Manually process the deletion request if needed
4. Follow up with user if they're waiting for confirmation

## Maintenance

- **Weekly**: Review alert dashboard for trends
- **Monthly**: Adjust thresholds based on traffic patterns
- **Quarterly**: Review and update alert rules
- **Annually**: Audit all security logging and alerting

## Related Files

- `/app/lib/security-logger.ts` - SecurityLogger implementation
- `/app/api/download-cv/route.ts` - CV password authentication
- `/app/api/gdpr/delete-data/route.ts` - GDPR data deletion endpoint
- `sentry.client.config.ts` - Sentry client configuration
- `sentry.server.config.ts` - Sentry server configuration

## Environment Variables Required

```bash
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...  # For source maps and releases
SENTRY_ORG=digitaltableteur
SENTRY_PROJECT=frontend
```

## Support

For issues with Sentry configuration:

- Sentry Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Support: https://sentry.io/support/
