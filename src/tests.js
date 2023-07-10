import fs from 'fs';
import * as csstree from 'css-tree';

const posAbsolute = async (stylesPath, fileName) => {
  const styles = fs.readFileSync(stylesPath, 'utf8');
  const errors = [];

  let shouldPush = true;
  try {
    const rule = styles.match(/\.visually-hidden\s*{[^}]*}/g)[0];
    if ((styles.match(/absolute/g) || []).length === (rule.match(/absolute/g) || []).length) {
      shouldPush = false;
    }
  } catch (e) { }
  if (shouldPush) {
    errors.push({
      id: 'styles.absolute',
      values: {
        fileName
      }
    });
  }

  return errors;
};

const pseudoElements = (cssPath) => {
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  const ast = csstree.parse(cssCode);

  const found = csstree.findAll(ast, (node) => node.type === 'PseudoClassSelector' || node.type === 'PseudoElementSelector');

  if (found.length < 3) {
    return [{ id: 'countPseudoElements' }];
  }

  return [];
};

export {
  posAbsolute,
  pseudoElements,
};
