# Remember to run ganache-cli before this

cd packages/contracts/ && npm run deploy --silent | tee ../frontend/.env | tee ../backend/.env
echo 'BACKEND_URL=localhost:5566' >> ../frontend/.env
trap 'kill %1; kill %2' SIGINT
cd ../backend && npm run start
