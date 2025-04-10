#!/bin/bash

# OneDrive Explorer Upload Script
# Generated for: {{SERVER_URL}}

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVER_URL="{{SERVER_URL}}"
DEFAULT_PATH="/"
PASSWORD=""
QUIET=false

# Function to print usage
print_usage() {
    echo "Usage: $0 [options] <file>"
    echo
    echo "Options:"
    echo "  -p, --password <password>    Authentication password"
    echo "  -d, --destination <path>     Destination path in OneDrive (default: /)"
    echo "  -q, --quiet                  Quiet mode (less output)"
    echo "  -h, --help                   Show this help message"
    echo
}

# Function to log messages
log() {
    local level=$1
    shift
    local message=$@

    if [ "$QUIET" = false ]; then
        case $level in
            "info")
                echo -e "${BLUE}[INFO]${NC} $message"
                ;;
            "success")
                echo -e "${GREEN}[SUCCESS]${NC} $message"
                ;;
            "error")
                echo -e "${RED}[ERROR]${NC} $message" >&2
                ;;
            "warn")
                echo -e "${YELLOW}[WARN]${NC} $message"
                ;;
        esac
    fi
}

# Function to verify password
verify_password() {
    local response
    local http_code
    response=$(curl -s -X POST "${SERVER_URL}/api/verify-password" \
        -H "Authorization: Bearer $PASSWORD" \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ $? -ne 0 ]; then
        log "error" "Failed to verify password"
        exit 1
    fi

    if [ "$http_code" != "200" ]; then
        log "error" "Invalid password (HTTP $http_code)"
        log "error" "Server response: $body"
        exit 1
    fi
}

# Function to upload a single file
upload_file() {
    local file=$1
    local destination=$2
    local filename=$(basename "$file")

    if [ ! -f "$file" ]; then
        log "error" "File not found: $file"
        return 1
    fi

    # Remove leading and trailing slashes from destination path
    destination=$(echo "$destination" | sed 's:^/*::' | sed 's:/*$::')

    log "info" "Uploading: $filename to /$destination"

    local response
    response=$(curl -s -X POST "${SERVER_URL}/api/upload" \
        -H "Authorization: Bearer $PASSWORD" \
        -F "file=@$file" \
        -F "path=$destination" \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" != "200" ]; then
        log "error" "Failed to upload: $filename (HTTP $http_code)"
        log "error" "Server response: $body"
        return 1
    fi

    if [[ $body == *"success\":true"* ]]; then
        log "success" "Successfully uploaded: $filename to /$destination"
        return 0
    else
        log "error" "Upload failed: $body"
        return 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--password)
            if [[ -z "$2" || "${2:0:1}" == "-" ]]; then
                log "error" "Password option requires a value"
                print_usage
                exit 1
            fi
            PASSWORD="$2"
            shift 2
            ;;
        -d|--destination)
            if [[ -z "$2" || "${2:0:1}" == "-" ]]; then
                log "error" "Destination option requires a value"
                print_usage
                exit 1
            fi
            DEFAULT_PATH="$2"
            shift 2
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        -*)
            log "error" "Unknown option: $1"
            print_usage
            exit 1
            ;;
        *)
            UPLOAD_PATH="$1"
            shift
            ;;
    esac
done

# Validate required parameters
if [ -z "$PASSWORD" ]; then
    log "error" "Password is required"
    print_usage
    exit 1
fi

if [ -z "$UPLOAD_PATH" ]; then
    log "error" "Upload path is required"
    print_usage
    exit 1
fi

# Verify password
verify_password

# Perform upload
if [ -f "$UPLOAD_PATH" ]; then
    upload_file "$UPLOAD_PATH" "$DEFAULT_PATH"
    exit $?
else
    log "error" "Invalid path: $UPLOAD_PATH"
    exit 1
fi
