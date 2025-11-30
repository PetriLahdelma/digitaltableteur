#!/bin/bash
set -e
BACKUP_DIR="sanity-output/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="production_backup_${TIMESTAMP}.tar.gz"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
echo -e "${GREEN}Starting Sanity.io Production Backup...${NC}"
echo "Timestamp: ${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"
cd digitaltableteur-blog
echo -e "${YELLOW}Exporting production dataset...${NC}"
npx sanity dataset export production "../${BACKUP_DIR}/production_backup_${TIMESTAMP}.ndjson"
cd ..
echo -e "${YELLOW}Compressing backup...${NC}"
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_FILE}" "production_backup_${TIMESTAMP}.ndjson"
rm "production_backup_${TIMESTAMP}.ndjson"
echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo "Backup file: ${BACKUP_DIR}/${BACKUP_FILE}"
echo ""
echo "To restore this backup, use:"
echo "  cd digitaltableteur-blog && npx sanity dataset import ../${BACKUP_DIR}/${BACKUP_FILE} production"
