#!/bin/sh

# Load environment variables from .env file
if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Install sshpass if not already installed
if ! command -v sshpass &> /dev/null
then
  echo "sshpass could not be found, installing..."
  sudo apt-get install sshpass -y
fi

# Install dependencies and build the application
echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

# Deploy the application via SFTP
echo "Deploying the application..."
export SSHPASS=$SERVER_PASSWORD
sshpass -e sftp $SERVER_USER@$SERVER_IP <<EOF
  cd ./apps/guacu-news-scrapping
  put -r dist
  put package.json
  put package-lock.json
  bye
EOF

# Install dependencies and start the application
echo "Installing dependencies..."
sshpass -e ssh $SERVER_USER@$SERVER_IP <<EOF
  cd ./apps/guacu-news-scrapping
  source ~/.nvm/nvm.sh
  npm install
  pm2 restart $SERVER_APP_NAME
EOF

echo "Deployed successfully!"
