# Frostbitten's fxhash minting site template

Everything you need to deploy your own custom minting website, host on your own domain.


## Getting started

1. Git clone this repo
2. Open a command shell inside the repo and run `npm i` to install the dependencies
3. Run `npm run dev`. It will create the `/project` folder with basic configuration files, and run the development server for you to create and test your site.

## Creating a project

Inside `/project/config.ts` you'll find a number of things to configure.
*  PROEJCT ID (`id`) - If your project is already published on fxhash you can supply its project ID and have all the data like name, description, author(s) automatically load. Otherwise if not published yet keep it commented out.
* The rest of the paramters are totally optional, mostly there for hardcoding values you'd prefer over what's found on the fxhash project page.

## Developing

Do not edit any of the files inside `/src` unless you are working on improving this template system on the whole, not just for your project.

You can modify the look and feel of the site completely from the `/project` folder.

* `styles.css` - override any of the default styles
* `Hero.svelte` - create and write to this file to make your own custom hero section.
* If you need new custom sections you can modify the `/src/routes/+page.svelte` to include the specific components you want. But you should only do this if you plan to submit these template changes upstream to potentially be included in this main template that everyone uses. This will ensure when you pull template updates it doesn't overwrite your personal customizations.

## Building

To create a production version of your site, run:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

You'll want to track with git the `/deploy` folder. This makes using a git-based host like Netlify very easy to use and manage.
