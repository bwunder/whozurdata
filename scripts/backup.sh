sudo rsync -av --progress $HOME/workspace $HOME/backup/ --delete --exclude demoCA/ --exclude node_modules/ --exclude v3/ --exclude .c9/ --exclude .git/