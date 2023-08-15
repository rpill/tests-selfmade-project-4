import path from 'path';
import {
  launchBrowser,
  compareLayout,
  runTests,
  mkdir,
  mkfile,
  structure,
  stylelint,
  lang,
  titleEmmet,
} from 'lib-verstka-tests';
import ru from './locales/ru.js';
import {
  posAbsolute,
} from './tests.js';

const [, , PROJECT_PATH, LANG = 'ru'] = process.argv;

const app = async (projectPath, lng) => {
  const options = {
    projectPath,
    lang: lng,
    resource: ru,
  };

  const check = async () => {
    const tree = mkdir('project', [
      mkfile('index.html'),
      mkdir('styles', [
        mkfile('error.css'),
        mkfile('preloader.css'),
        mkfile('style.css'),
      ]),
      mkdir('fonts', []),
      mkdir('scripts', [
        mkfile('script.js'),
      ]),
    ]);
    const structureErrors = structure(projectPath, tree);

    if (structureErrors.length) {
      return structureErrors;
    }

    const baseUrl = 'http://localhost:3000';
    const viewport = { width: 1550, height: 1080 };
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const { browser, page } = await launchBrowser(baseUrl, { launchOptions, viewport });
    const errors = (await Promise.all([
      stylelint(projectPath),
      lang(page, lng),
      titleEmmet(page),
      posAbsolute(path.join(projectPath, 'styles', 'style.css'), 'styles|style.css'),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-1550.jpg',
        pageImage: 'layout-1550.jpg',
        outputImage: 'output-1550.jpg',
        browserOptions: { launchOptions, viewport: { width: 1550, height: 1080 } },
      }, {
        onBeforeScreenshot: async (p) => {
          await p.evaluate(() => {
            const cardsContainer = document.querySelector('.content__list');
            const videoContainer = document.querySelector('.result__video-container');
            const preloaderTmp = document.querySelector('.preloader-template');

            const nodeTmp1 = preloaderTmp.content.cloneNode(true);
            cardsContainer.append(nodeTmp1);
            const nodeTmp2 = preloaderTmp.content.cloneNode(true);
            videoContainer.append(nodeTmp2);
          });
        },
      }),
    ]))
      .filter(Boolean)
      .flat();

    await browser.close();

    return errors;
  };

  await runTests(options, check);
};

app(PROJECT_PATH, LANG);
