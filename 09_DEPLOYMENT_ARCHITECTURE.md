# Urban Help - Deployment Architecture

## 1. Deployment Overview

Urban Help uses AWS cloud infrastructure with containerized applications, automated deployments, and multi-environment setup.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                       │
│              urbanhelp.com.au / api.*                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌─────────────┐         ┌──────────────┐
    │  CloudFront │         │ API Gateway  │
    │  (CDN)      │         │  (optional)  │
    └──────┬──────┘         └──────┬───────┘
           │                       │
           ▼                       ▼
    ┌─────────────────────────────────────┐
    │  Application Load Balancer (ALB)    │
    │  HTTP(80) → HTTPS(443)              │
    │  SSL/TLS Termination                │
    └────────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌─────────────┐         ┌──────────────┐
    │  ECS Cluster│         │  ECS Cluster │
    │  Frontend   │         │  Backend     │
    │  (3+ tasks) │         │  (3+ tasks)  │
    └────────┬────┘         └──────┬───────┘
             │                     │
             ├─────────┬───────────┤
             │         │           │
             ▼         ▼           ▼
        ┌─────────────────────────────────┐
        │      RDS PostgreSQL             │
        │  (Multi-AZ)                     │
        │  Primary + 2 Read Replicas      │
        └─────────────────────────────────┘
             │
    ┌────────┴────────────┐
    │                     │
    ▼                     ▼
┌─────────────┐    ┌──────────────┐
│ ElastiCache │    │   S3 + CDN   │
│  (Redis)    │    │  (Images)    │
└─────────────┘    └──────────────┘
```

---

## 2. Environments

### 2.1 Development Environment

**Infrastructure:**
```
AWS Account: Dev Account
Region: ap-southeast-2 (Sydney)
VPC: 10.0.0.0/16
Database: PostgreSQL (single instance)
Cache: Redis (single node)
File Storage: S3 with local development
```

**Configuration:**
- Auto-scaling: Disabled (cost optimization)
- Backups: Daily (7-day retention)
- Monitoring: CloudWatch basic
- Logging: CloudWatch Logs
- Scale: 1 ECS task per service

**Setup:**
```bash
# Local development with Docker Compose
docker-compose -f docker-compose.dev.yml up

# Or deploy to AWS Dev
terraform apply -var-file=environments/dev.tfvars
```

### 2.2 Staging Environment

**Infrastructure:**
```
AWS Account: Dev Account
Region: ap-southeast-2 (Sydney)
VPC: 10.1.0.0/16
Database: PostgreSQL (Multi-AZ)
Cache: Redis (single node, replication enabled)
File Storage: S3
```

**Configuration:**
- Auto-scaling: Enabled (2-5 tasks per service)
- Backups: Daily (30-day retention)
- Monitoring: CloudWatch detailed
- Logging: CloudWatch Logs + ELK
- Replicate production as closely as possible

**Purpose:**
- User acceptance testing (UAT)
- Performance testing
- Security testing
- Deployment validation

### 2.3 Production Environment

**Infrastructure:**
```
AWS Account: Separate Prod Account
Region: ap-southeast-2 + ap-southeast-1 (Sydney + Singapore)
VPC: 10.2.0.0/16 (primary) + 10.3.0.0/16 (secondary)
Database: PostgreSQL (Multi-AZ, 2 regions)
Cache: Redis (Multi-AZ cluster)
File Storage: S3 with CloudFront CDN
```

**Configuration:**
- Auto-scaling: Enabled (3-10 tasks per service)
- Backups: Hourly (30-day retention) + Daily snapshots (1-year retention)
- Monitoring: CloudWatch enhanced + APM (New Relic/Datadog)
- Logging: Centralized logging with retention
- Data replication: Cross-region replication
- Disaster recovery: RTO 4 hours, RPO 1 hour

---

## 3. AWS Services

### 3.1 Compute (ECS Fargate)

**Frontend Service:**
```yaml
Name: urbanhelp-frontend
Image: 123456789.dkr.ecr.ap-southeast-2.amazonaws.com/frontend:latest
Memory: 512 MB
CPU: 256 units
Task Count: 3-10 (auto-scaling)
Health Check: GET /health -> 200 OK
Log: CloudWatch Logs (/ecs/frontend)
```

**Backend Service:**
```yaml
Name: urbanhelp-backend
Image: 123456789.dkr.ecr.ap-southeast-2.amazonaws.com/backend:latest
Memory: 1024 MB
CPU: 512 units
Task Count: 3-10 (auto-scaling)
Environment Variables: From Secrets Manager + Parameter Store
Port Mapping: 3000 -> 8000
Health Check: GET /health -> 200 OK
Log: CloudWatch Logs (/ecs/backend)
```

**Auto-Scaling Policy:**
```
Target CPU: 70%
Target Memory: 80%
Scale Up: +1 task when metric crosses threshold
Scale Down: -1 task after 5 minutes of low utilization
Min: 3 tasks, Max: 10 tasks
```

### 3.2 Database (RDS PostgreSQL)

**Configuration:**
```
Instance Class: db.t3.medium (dev), db.r5.large (prod)
Multi-AZ: Yes (production only)
Storage: 100 GB SSD, auto-scaling enabled
Backup Retention: 30 days
Backup Window: 03:00-04:00 UTC
Maintenance Window: Sunday 02:00-03:00 UTC
Encryption: AWS KMS
Performance Insights: Enabled (production)
Enhanced Monitoring: Enabled
```

**Read Replica Strategy:**
```
Primary: ap-southeast-2 (Sydney)
Read Replica 1: ap-southeast-2 (standby)
Read Replica 2: ap-southeast-1 (Singapore)

Read Distribution:
- Write: Primary only
- Read (local): Primary + Replica 1
- Read (backup): Replica 2 (if primary down)
```

**Connection Pooling:**
```
pgBouncer: 100 connections max
Pool Mode: Transaction
Idle Client Timeout: 900 seconds
```

### 3.3 Caching (ElastiCache Redis)

**Configuration:**
```
Engine: Redis 6.2+
Node Type: cache.t3.small (dev), cache.r6g.large (prod)
Number of Nodes: 1 (dev), 3 (prod, replication)
Automatic Failover: Enabled
Multi-AZ: Enabled (production)
Backup: Daily (30-day retention)
Engine Log Enabled: Yes
```

**Usage:**
- Session storage
- Rate limiting keys
- Cache for business profiles
- Search result caching
- Real-time availability

### 3.4 Storage (S3 + CloudFront)

**S3 Buckets:**

1. **urban-help-images** (Production)
   - Versioning: Enabled
   - Encryption: AES-256 or KMS
   - Access: CloudFront only (via OAI)
   - Lifecycle: Move to Glacier after 90 days

2. **urban-help-uploads** (Temporary)
   - Versioning: Disabled
   - Encryption: AES-256
   - Access: Private, signed URLs only
   - Lifecycle: Delete after 7 days

3. **urban-help-logs** (Logs Archive)
   - Access: Logs only
   - Encryption: AES-256
   - Lifecycle: Glacier after 30 days

**CloudFront CDN:**
```
Distribution: d1234567890.cloudfront.net
Origin: S3 bucket
Behavior:
  - /images/* -> S3, cache 1 year, compress
  - /uploads/* -> S3, cache 1 hour, compress
  - /* -> ALB, cache 0 seconds (no cache)
Viewer Protocol Policy: Redirect HTTP to HTTPS
TLS: TLS 1.2+
Geo-blocking: Allow AUS, NZ, SG
Origin Shield: Enabled (production)
```

### 3.5 Load Balancing (ALB)

**Application Load Balancer:**
```
Name: urbanhelp-alb
VPC: Production VPC
Scheme: Internet-facing
IP Address Type: IPv4
Security Groups: Allow 80, 443
Subnets: Public subnets across 2 AZs
```

**Listener Configuration:**
```
Port 80 (HTTP):
  - Rule: All requests
  - Action: Redirect to HTTPS (301)

Port 443 (HTTPS):
  - Certificate: ACM certificate
  - Rule 1: Host header = api.urbanhelp.com.au
    - Action: Forward to backend-tg
  - Rule 2: Host header = urbanhelp.com.au
    - Action: Forward to frontend-tg
  - Rule 3: Default (catch-all)
    - Action: Forward to frontend-tg
```

**Target Groups:**
```
Frontend TG:
  - Protocol: HTTP
  - Port: 3000
  - Health Check: GET / -> 200
  - Stickiness: DISABLED
  - Deregistration Delay: 30 seconds

Backend TG:
  - Protocol: HTTP
  - Port: 8000
  - Health Check: GET /health -> 200
  - Stickiness: ENABLED (Cookies)
  - Stickiness Duration: 1 day
  - Deregistration Delay: 30 seconds
```

### 3.6 Monitoring & Logging

**CloudWatch Dashboards:**
```
1. System Health
   - ECS CPU/Memory utilization
   - RDS CPU/Memory/Disk space
   - ElastiCache memory usage
   - ALB request count, latency

2. Application Metrics
   - API response times
   - Error rates
   - Booking success rate
   - Payment success rate

3. Security
   - Failed login attempts
   - Suspicious API patterns
   - Database access logs
   - File upload activity
```

**CloudWatch Alarms:**
```
Critical:
  - ECS task health check failures > 1
  - RDS replication lag > 5 seconds
  - API error rate > 1%
  - Payment processing failures > 5/hour

High Priority:
  - ALB response time > 2 seconds
  - CPU utilization > 80%
  - Memory utilization > 85%
  - Database connections > 80/max

Medium:
  - Unhandled exceptions logged
  - Auth failures > 100/hour
  - Rate limiting triggered > 10/hour
```

**Logging:**
```
CloudWatch Logs:
  - /ecs/frontend
  - /ecs/backend
  - /rds/postgresql
  - /lambda/functions
  - /waf/requests (samples)

Log Retention:
  - Development: 7 days
  - Staging: 30 days
  - Production: 90 days + archive to S3

Log Analysis:
  - CloudWatch Insights queries
  - Splunk/ELK integration
  - Real-time alerts
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflows

**Push to Feature Branch:**
```yaml
1. Run Tests
   - Unit tests (Jest)
   - Integration tests
   - E2E tests
2. Code Quality
   - ESLint, Prettier
   - TypeScript type checking
   - SonarQube analysis
3. Security
   - Dependency scanning (Snyk)
   - SAST (SonarQube)
4. Build
   - Docker image build
   - Push to ECR (if success)
```

**Push to Main Branch:**
```yaml
1. All above checks
2. Build & Push to ECR
   - Tag: latest, git-sha
3. Deploy to Staging
   - Terraform apply
   - Run smoke tests
4. Create release notes
5. Await approval for production
```

**Manual Deployment to Production:**
```yaml
1. Approval from 2 developers
2. Deploy with canary strategy
   - 10% traffic to new version
   - Monitor for errors
   - If OK, increase to 100%
3. Run smoke tests
4. Notify on Slack
5. Create deployment record
```

### 4.2 Deployment Strategy

**Blue-Green Deployment:**
```
Current (Blue):
  - ECS Service with current tasks
  - ALB pointing to blue tasks

New Version (Green):
  - Deploy to separate ECS service
  - Run tests/smoke tests
  - If OK: Switch ALB to green
  - Keep blue running for 1 hour rollback window
```

**Canary Deployment:**
```
1. Deploy new version (10% traffic)
2. Monitor error rate, latency, custom metrics
3. If metrics good: increase to 25%, 50%, 100%
4. If metrics bad: rollback to previous version
5. Auto-rollback if error rate > 5%
```

---

## 5. Infrastructure as Code (Terraform)

**Module Structure:**
```
terraform/
├── main.tf                    # Root module
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
├── providers.tf               # AWS provider config
├── environments/
│   ├── dev.tfvars
│   ├── staging.tfvars
│   └── production.tfvars
└── modules/
    ├── vpc/                   # VPC, subnets, security groups
    ├── rds/                   # Database
    ├── elasticache/           # Redis cache
    ├── ecs/                   # ECS cluster, services, tasks
    ├── alb/                   # Load balancer
    ├── s3/                    # S3 buckets
    ├── cloudfront/            # CDN
    ├── iam/                   # IAM roles, policies
    └── monitoring/            # CloudWatch
```

**Deployment:**
```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan -var-file=environments/production.tfvars

# Apply changes (requires approval)
terraform apply -var-file=environments/production.tfvars

# Destroy resources (for cleanup)
terraform destroy -var-file=environments/dev.tfvars
```

---

## 6. Docker Containerization

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8000
CMD ["node", "dist/main.js"]
```

**Build & Push:**
```bash
# Build image
docker build -t urbanhelp-backend:latest -f backend.Dockerfile .

# Tag for ECR
docker tag urbanhelp-backend:latest \
  123456789.dkr.ecr.ap-southeast-2.amazonaws.com/urbanhelp-backend:latest

# Push to ECR
aws ecr get-login-password --region ap-southeast-2 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.ap-southeast-2.amazonaws.com

docker push 123456789.dkr.ecr.ap-southeast-2.amazonaws.com/urbanhelp-backend:latest
```

---

## 7. Backup & Disaster Recovery

### 7.1 Backup Strategy

**Database Backups:**
- Automated daily at 03:00 UTC
- 30-day retention (prod), 7 days (dev)
- Cross-region replication (production)
- Point-in-time recovery (PITR) enabled

**S3 Backup:**
- Versioning enabled
- Cross-region replication
- Lifecycle policy: Archive after 90 days
- Backup retention: 1 year

**Configuration Backup:**
- Terraform state in S3 (encrypted)
- GitHub Actions secrets backed up (encrypted)
- Database migration scripts in Git
- Infrastructure-as-Code in version control

### 7.2 Disaster Recovery

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

**Recovery Procedures:**

1. **Database Failure:**
   - Automatic failover to read replica (2 minutes)
   - If replica down: Restore from backup (30 minutes)
   - Application continues with possible data loss < 1 hour

2. **Application Failure:**
   - ECS auto-scaling replaces failed tasks (5 minutes)
   - If entire service down: Redeploy from ECR (10 minutes)

3. **Regional Failure:**
   - Fail over to secondary region (30-60 minutes)
   - Update DNS records (Route 53)
   - Restore from replicated backups

**Runbooks:**
- Database recovery procedures
- Application re-deployment
- DNS failover
- Data recovery from backups
- Communication templates

---

## 8. Environment Variables & Secrets

**Parameter Store (Non-sensitive):**
```
/urbanhelp/production/app/log_level
/urbanhelp/production/app/timezone
/urbanhelp/production/features/dark_mode
```

**Secrets Manager (Sensitive):**
```
urbanhelp/production/database/password
urbanhelp/production/jwt/secret
urbanhelp/production/stripe/api_key
urbanhelp/production/twilio/auth_token
urbanhelp/production/sendgrid/api_key
urbanhelp/production/aws/s3_access_key
```

**ECS Task Definition Environment:**
```json
{
  "containerDefinitions": [{
    "environment": [
      {
        "name": "NODE_ENV",
        "value": "production"
      },
      {
        "name": "DATABASE_HOST",
        "value": "rds-instance.amazonaws.com"
      }
    ],
    "secrets": [
      {
        "name": "DATABASE_PASSWORD",
        "valueFrom": "arn:aws:secretsmanager:..."
      },
      {
        "name": "JWT_SECRET",
        "valueFrom": "arn:aws:secretsmanager:..."
      }
    ]
  }]
}
```

---

## 9. Health Checks & Monitoring

**Application Health Endpoint:**
```
GET /health
Response:
{
  "status": "healthy",
  "timestamp": "2026-06-24T10:30:00Z",
  "database": "connected",
  "redis": "connected",
  "uptime": 86400
}
```

**Load Balancer Health Check:**
```
Path: /health
Port: 8000
Protocol: HTTP
Interval: 30 seconds
Timeout: 5 seconds
Healthy Threshold: 2
Unhealthy Threshold: 3
```

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
