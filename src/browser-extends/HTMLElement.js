var range = document.createRange();
HTMLElement.prototype.empty = function () {
  range.selectNodeContents(this);
  range.deleteContents();
};
