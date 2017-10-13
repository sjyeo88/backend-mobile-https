sudo npm install
sudo docker build --tag express .
sudo docker run -i -p 3000:3000 --name express --link db-vol express
