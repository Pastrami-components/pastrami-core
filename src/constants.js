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
