#???keep the administrator access inside the file to keep the pwd prompst inline???
#openssl req -x509 -newkey rsa:1024 -keyout key.pem -out cert.pem -passin pass:keyPass -passout pass:test -days 1 -batch
sudo chmod u+x scripts/newCA.sh
sudo chmod u+x scripts/newCert.sh
if [ ! -f ../demoCA/private/cakey.pem ]
then
    sudo scripts/newCA.sh
fi    
    sudo scripts/newCert.sh
#ls -gG *.pem
#browserify body.js > bundle.js
#ls -gG bundle.js

#serve the p2p client libs (and the webRTC adapter used in thier text example too) 
sudo cp node_modules/socket.io-p2p/socketiop2p.min.js -t public/javascripts --remove-destination
sudo cp socket.io-p2p-master/examples/chat/adapter.js -t public/javascripts --remove-destination
sudo browserify socket.io-p2p-master/examples/chat/src/index.js -o public/javascripts/bundle.js