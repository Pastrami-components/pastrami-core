// HMTLElement.nodeType
// http://www.w3schools.com/jsref/prop_node_nodetype.asp
export const NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
};


// tags that cannot be used for components
export const RESERVED_TAG_NAMES = [
  'body',
  'head',
  'html',
  'iframe',
  'link',
  'script',
  'img'
];

export const RESERVED_ATTRS = [
  'class',
  'style',
  'id',
  'name',
  'controller',
  'register'
];


export const REGEX = {
  NAME: /^[A-Za-z0-9 ]{3,20}$/,
  EMAIL: /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,
  PHONE: /\d{3}[\-|]?\d{3}[\-]?\d{4}/,
  PASSWORD: /^[A-Za-z0-9!@#$%^&*()_]{6,20}$/,
  STRONG_PASSWORD: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
  NUMBER: /^\s*(-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,
  URL: /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,
  PERCENT_0_100: /^(100|[1-9]?[0-9])$/,
  ISO_DATE_REGEXP: /^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,
  DATETIMELOCAL: /^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
  DATE: /^\d{2}([./-])\d{2}\1\d{4}$/,
  WEEK: /^(\d{4,})-W(\d\d)$/,
  MONTH: /^(\d{4,})-(\d\d)$/,
  TIME: /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
  TIME_12_HH_MM: /^(1[0-2]|0?[1-9]):([0-5]?[0-9])$/,
  TIME_12_HH_MM_SS: /^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
  TIME_24_HH_MM: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/,
  TIME_24_HH_MM_SS: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
  SSN: /^(?!000|666)(?:[0-6][0-9]{2}|7(?:[0-6][0-9]|7[0-2]))-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/
};
