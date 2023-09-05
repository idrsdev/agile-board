#!/bin/bash

# Define the default port (you can change this if needed)
DEFAULT_PORT=3001

# Check if a custom port argument is provided; otherwise, use the default
if [ $# -eq 0 ]; then
  echo "No custom port provided. Using the default port: $DEFAULT_PORT"
  PORT=$DEFAULT_PORT
else
  PORT=$1
fi

sleep 5

# Hit the endpoint to generate Swagger JSON (assuming it's available locally)
curl -o swagger-temp.json http://localhost:$PORT/swagger-json

# Define your GitHub repository and owner
repo_owner="idrsdev"
repo_name="agile-board"

# Commit and push the index.html and swagger.json files to the gh-pages branch
git checkout gh-pages
git pull origin gh-pages

# Replace the existing swagger.json in gh-pages with the updated version
mv swagger-temp.json swagger.json

# Add, commit, and push only the updated swagger.json file to the gh-pages branch
git add swagger.json
git commit -m "Update Swagger JSON"
git push origin gh-pages

# Delete the swagger.json file from the working directory to avoid conflicts
rm swagger.json

# Switch back to the main branch
git checkout main

# Stop the NestJS application
kill %1
