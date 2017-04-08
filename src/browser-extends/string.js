String.prototype.toBoolean = function () {
  return this == 'true';
};

String.prototype.isBoolean = function () {
  return this === 'true' || this === 'false';
};
