#!/bin/bash
set -e
BACKUP_DIR="sanity-output/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="blog_dataset_backup_${TIMESTAMP}.tar.gz"
DATASET_NAME="digitaltableteur-blog"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
echo -e "${GREEN}Starting Sanity.io Blog Dataset Backup...${NC}"
echo "Dataset: ${DATASET_NAME}"
echo "Timestamp: ${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"
cd digitaltableteur-blog
echo -e "${YELLOW}Exporting ${DATASET_NAME} dataset...${NC}"
npx sanity dataset export "${DATASET_NAME}" "../${BACKUP_DIR}/blog_dataset_backup_${TIMESTAMP}.ndjson"
cd ..
echo -e "${YELLOW}Compressing backup...${NC}"
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_FILE}" "blog_dataset_backup_${TIMESTAMP}.ndjson"
rm "blog_dataset_backup_${TIMESTAMP}.ndjson"
echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo "Backup file: ${BACKUP_DIR}/${BACKUP_FILE}"
echo ""
echo "To restore this backup, use:"
echo "  cd digitaltableteur-blog && npx sanity dataset import ../${BACKUP_DIR}/${BACKUP_FILE} ${DATASET_NAME}"
