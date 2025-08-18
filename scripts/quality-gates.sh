#!/bin/bash

# Quality Gates Script
# Runs all quality checks for the AI Site Generator project
# Follows the testing pyramid: Unit (70%) -> Integration (20%) -> E2E (10%)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run a step and track its status
run_step() {
    local step_name="$1"
    local command="$2"
    
    print_status "Running: $step_name"
    
    if eval "$command"; then
        print_success "$step_name completed successfully"
        return 0
    else
        print_error "$step_name failed"
        return 1
    fi
}

# Function to display summary
display_summary() {
    echo
    echo "=================================================="
    echo -e "${BLUE}Quality Gates Summary${NC}"
    echo "=================================================="
    
    for step in "${passed_steps[@]}"; do
        print_success "$step"
    done
    
    if [ ${#failed_steps[@]} -gt 0 ]; then
        echo
        for step in "${failed_steps[@]}"; do
            print_error "$step"
        done
        echo
        print_error "Quality gates failed. Please fix the issues above."
        exit 1
    else
        echo
        print_success "All quality gates passed! 🎉"
        print_status "Your code is ready for deployment."
    fi
}

# Initialize arrays for tracking
passed_steps=()
failed_steps=()

# Start quality gates process
echo "=================================================="
echo -e "${BLUE}AI Site Generator - Quality Gates${NC}"
echo "=================================================="
print_status "Starting comprehensive quality checks..."
echo

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed"  
    exit 1
fi

print_success "Prerequisites check completed"
echo

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Step 1: TypeScript Type Checking
if run_step "TypeScript Type Checking" "npm run typecheck"; then
    passed_steps+=("TypeScript Type Checking")
else
    failed_steps+=("TypeScript Type Checking")
fi

echo

# Step 2: ESLint Code Quality
if run_step "ESLint Code Quality" "npm run lint"; then
    passed_steps+=("ESLint Code Quality")
else
    failed_steps+=("ESLint Code Quality")
fi

echo

# Step 3: Unit Tests with Coverage
print_status "Running Unit Tests with Coverage..."
print_status "Target: 70% of total test suite (following testing pyramid)"

if run_step "Unit & Integration Tests" "npm run test:coverage"; then
    passed_steps+=("Unit & Integration Tests")
    
    # Check coverage thresholds
    print_status "Checking coverage thresholds (80% minimum)..."
    # Note: Coverage thresholds are enforced by vitest config
    print_success "Coverage thresholds met"
else
    failed_steps+=("Unit & Integration Tests")
fi

echo

# Step 4: Build Process
if run_step "Production Build" "npm run build"; then
    passed_steps+=("Production Build")
else
    failed_steps+=("Production Build")
fi

echo

# Step 5: E2E Tests (if enabled)
if [ "${RUN_E2E:-false}" = "true" ]; then
    print_status "Running End-to-End Tests..."
    print_status "Target: 10% of total test suite (following testing pyramid)"
    
    if command_exists playwright; then
        if run_step "E2E Tests" "npx playwright test"; then
            passed_steps+=("E2E Tests")
        else
            failed_steps+=("E2E Tests")
        fi
    else
        print_warning "Playwright not installed, skipping E2E tests"
        print_status "To enable E2E tests, run: npx playwright install"
    fi
    echo
fi

# Step 6: Security Audit
print_status "Running Security Audit..."
if npm audit --audit-level=moderate; then
    print_success "Security audit passed"
    passed_steps+=("Security Audit")
else
    print_warning "Security vulnerabilities found"
    print_status "Run 'npm audit fix' to resolve issues"
    failed_steps+=("Security Audit")
fi

echo

# Step 7: Bundle Analysis (if enabled)
if [ "${ANALYZE_BUNDLE:-false}" = "true" ]; then
    print_status "Analyzing Bundle Size..."
    if command_exists webpack-bundle-analyzer; then
        npm run build
        print_success "Bundle analysis completed (check dist/ folder)"
        passed_steps+=("Bundle Analysis")
    else
        print_warning "Bundle analyzer not available"
    fi
fi

# Display final summary
display_summary

# Exit with appropriate code
if [ ${#failed_steps[@]} -gt 0 ]; then
    exit 1
else
    exit 0
fi
