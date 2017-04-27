const { createFindExpression, isJQuerySelectExpression, addImportStatement } = require('../utils');

function createExpression(j, findArgs, attr) {
  return j.memberExpression(
    createFindExpression(j, findArgs),
    j.identifier(attr)
  );
}

function isJQueryExpression(j, node) {
  return j.CallExpression.check(node)
    && j.MemberExpression.check(node.callee)
    && isJQuerySelectExpression(j, node.callee.object)
    && j.Identifier.check(node.callee.property)
    && node.callee.property.name === 'prop'
    && node.arguments.length === 1
    && j.Literal.check(node.arguments[0]);
}

function transform(file, api) {
  let source = file.source;
  let j = api.jscodeshift;

  let root = j(source);

  let replacements = root
      .find(j.CallExpression)
      .filter(({ node }) => isJQueryExpression(j, node))
      .replaceWith(({ node }) => createExpression(j, node.callee.object.arguments, node.arguments[0].value))
    ;

  if (replacements.length > 0) {
    addImportStatement(j, root, ['find']);
  }

  return root.toSource({ quote: 'single' });
}

module.exports = transform;