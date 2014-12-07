    
    function getDb() {
      // get the Db dropdown selection
      return document.getElementById('db').value;
    }

    function showDb() {
      // make the store div of the selected Db visible  
//      document.getElementById(document.getElementById('db').value).style.display = 'inline-block';
    }
  
    function hideDb() {
//      for (i in document.getElementById('store').children ) {
//        if (document.getElementById('store').children[i].style) {
//          document.getElementById('store').children[i].style.display = 'none';
//        }
//      }
    }

    //change the Db dropdown selection
    function setDb(db) {
      hideDb();
      showDb();
    }
