echo "create local cerificate authority (CA)?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) newCA.sh; break;;
        No ) exit;;
    esac
done

cd page
openssl req -x509 -newkey rsa:1024 -keyout key.pem -out cert.pem -passin pass:keyPass -passout pass:test -days 1 -batch
ls -gG *.pem
browserify body.js > bundle.js
ls -gG bundle.js