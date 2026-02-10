#!/bin/bash
# Server setup script to configure Docker permissions for GitHub Actions deployment

set -e

USERNAME=$(whoami)

echo "=========================================="
echo "Docker Group Setup Script"
echo "=========================================="
echo "Current user: $USERNAME"
echo ""

# Check if user is already in docker group
if groups | grep -q docker; then
    echo "✓ User '$USERNAME' is already in the docker group"
    echo "Running: docker ps"
    docker ps
    exit 0
fi

echo "User '$USERNAME' is NOT in the docker group"
echo ""
echo "This script will:"
echo "  1. Add '$USERNAME' to the docker group"
echo "  2. Configure sudo for passwordless docker commands"
echo ""

# Add user to docker group
echo "Step 1: Adding user to docker group..."
sudo usermod -aG docker "$USERNAME"
echo "✓ User added to docker group"

# Configure sudoers for passwordless docker (optional but helpful for CI/CD)
echo ""
echo "Step 2: Configuring sudoers..."
echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/docker" | sudo tee /etc/sudoers.d/docker-"$USERNAME" > /dev/null
sudo chmod 440 /etc/sudoers.d/docker-"$USERNAME"
echo "✓ Sudoers configured"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "IMPORTANT: You must log out and log back in for the group changes to take effect"
echo ""
echo "Next steps:"
echo "  1. Log out: exit"
echo "  2. Log back in: ssh your_server"
echo "  3. Verify: docker ps"
echo ""
