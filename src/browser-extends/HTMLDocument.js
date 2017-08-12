var doc = document;

HTMLDocument.prototype.createFromMarkup = function (markup) {
  var tempDiv = doc.createElement('div');
  tempDiv.innerHTML = markup;
  return tempDiv.firstChild;
};
