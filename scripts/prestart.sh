
#openssl req -x509 -newkey rsa:1024 -keyout key.pem -out cert.pem -passin pass:keyPass -passout pass:test -days 1 -batch
chmod u+x scripts/newCA.sh
chmod u+x scripts/newCert.sh
if [ ! -f ../demoCA/private/cakey.pem ]
then
    sudo scripts/newCA.sh
fi    
sudo scripts/newCert.sh
#ls -gG *.pem
#browserify body.js > bundle.js
#ls -gG bundle.js