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

export {
  posAbsolute,
};
