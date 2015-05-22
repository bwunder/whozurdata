
function getDb() {
  return document.getElementById('db').value;
}

function getModule(that) {
  that.form.action = '/module?db=' + getDb();  
  that.form.submit();    
}

function getObject(that) {
  that.form.action = '/urData';  
  that.form.submit();    
}

function openDoc(that) {
  that.form.target = '_blank';
  that.form.action = that.value;  
  that.form.submit();    
}

function openSource(that) {
  that.form.target = '_blank';
  that.form.action = that.value;
  that.form.submit();    
}

function openTextarea(that) {
  var a = that.value.split('\n');
  for (var row in a) {
    if (a[row].length > that.cols) {
      that.cols = a[row].length;
    }    
    that.rows += 1;
  }
}

function closeTextarea(that) {
  that.cols = undefined;
  that.rows = undefined;
}

//http://stackoverflow.com/questions/1766861/
// find-the-exact-height-and-width-of-the-viewport-in-a-cross-browser-way-no-proto?rq=1
function getViewport() {
 return [window.innerWidth, window.innerHeight];
}
