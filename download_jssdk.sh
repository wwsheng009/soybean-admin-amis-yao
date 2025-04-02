#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get the latest release tag
get_latest_release() {
    local repo_url="https://api.github.com/repos/baidu/amis/releases/latest"
    if command_exists curl; then
        curl -s "$repo_url" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'
    else
        wget -qO- "$repo_url" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'
    fi
}

# Get the latest release tag
latest_tag=$(get_latest_release)
if [ -z "$latest_tag" ]; then
    echo "Failed to retrieve the latest release tag."
    exit 1
fi

# Fetch the release page and grep for .tar.gz files
if command_exists curl; then
    assets_page=$(curl -s "https://api.github.com/repos/baidu/amis/releases/tags/$latest_tag")
    download_url=$(echo "$assets_page" | grep -o '"browser_download_url": *"[^"]*\.tar\.gz"' | sed -e 's/"browser_download_url": *"//' -e 's/"$//' | head -n 1)
else
    assets_page=$(wget -qO- "https://api.github.com/repos/baidu/amis/releases/tags/$latest_tag")
    download_url=$(echo "$assets_page" | grep -o '"browser_download_url": *"[^"]*\.tar\.gz"' | sed -e 's/"browser_download_url": *"//' -e 's/"$//' | head -n 1)
fi

if [ -z "$download_url" ]; then
    echo "No .tar.gz file found in the latest release."
    exit 1
fi

# Download the tar.gz file
echo "Downloading $download_url"
if command_exists curl; then
    curl -L -o latest_jssdk.tar.gz "$download_url"
else
    wget -O latest_jssdk.tar.gz "$download_url"
fi

if [ $? -ne 0 ]; then
    echo "Failed to download the .tar.gz file"
    exit 1
fi

# Remove the existing folder before extraction
echo "Removing existing public/amis/jssdk folder"
rm -rf public/amis/jssdk

# Ensure the target directory exists (it will be recreated by tar)
mkdir -p public/amis/jssdk

# Extract the downloaded tar.gz file
echo "Extracting latest_jssdk.tar.gz to public/amis/jssdk"
tar -xzf latest_jssdk.tar.gz -C public/amis/jssdk

if [ $? -ne 0 ]; then
    echo "Failed to extract latest_jssdk.tar.gz"
    rm latest_jssdk.tar.gz
    exit 1
fi

# Remove files with prefix "._" in the extraction directory and its subdirectories
echo "Removing files with prefix '._' in the extracted directory"
find public/amis/jssdk -type f -name "._*" -delete

# Clean up the downloaded file
rm latest_jssdk.tar.gz

echo "Successfully downloaded, extracted, cleaned, and updated public/amis/jssdk"
