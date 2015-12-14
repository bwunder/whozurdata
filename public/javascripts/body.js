function toggle(view) {
  var div= document.getElementsByName(view)[0];
  if (!div.style.height) {
    div.style.height = "1em";
  } else {
    div.style.height = "";
  }
  document.activeElement.blur();
}  

function expand(txtArea) {
  var a = txtArea.value.split('\n');
  for (var row in a) {
    if (a[row].length > txtArea.cols) {
      txtArea.cols = a[row].length;
    }    
    txtArea.rows += 1;
  }
  return false;
}

function collapse(txtArea) {
  txtArea.cols = undefined;
  txtArea.rows = undefined;
}

// enter is ambiguous so is set off for the page - works in soft wrapping textarea
function stopRKey(evt) { 
  var evt = (evt) ? evt : ((event) ? event : null); 
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  if ((evt.keyCode == 13) && (node.type=="text"))  {
    return false;
  } 
} 

document.onkeypress = stopRKey; 

