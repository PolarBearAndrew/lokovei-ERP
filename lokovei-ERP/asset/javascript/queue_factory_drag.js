
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log('test', $(this).text() )
}

function drop(ev) {
    if( $(ev.target).hasClass('line') === true ){
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(data));
    }else{
      return false;
    }
}