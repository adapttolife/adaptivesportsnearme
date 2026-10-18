# Contributing

Thank you for being here. Adaptive Sports Near Me is built in public, and you don't need to write code to help.

## No code needed

- **Fix a listing.** Every listing on [adaptivesportsnearme.com](https://adaptivesportsnearme.com) has a Suggest a fix link. Know a program we're missing? Use [Add a program](https://adaptivesportsnearme.com/add/program). A person reads every one.
- **Test it.** Use the site with a screen reader, switch control, voice control or a keyboard, and [tell us what gets in the way](https://github.com/adapttolife/adaptivesportsnearme/issues/new?template=bug.yml).
- **Share an idea.** What tool would help you, your athletes or your program? [Start a discussion](https://github.com/adapttolife/adaptivesportsnearme/discussions/categories/ideas).
- **Write a guide.** Know a sport well? Email hello@adaptivesportsnearme.com.

## Code

1. **Pick an issue.** [Good first issues](https://github.com/adapttolife/adaptivesportsnearme/labels/good%20first%20issue) are small and well described. Comment on the issue to say you're working on it, so two people don't do the same thing. If you want to build something no issue covers, open an issue or a discussion first.
2. **Set up.** Fork the repository, then:
   ```sh
   git clone https://github.com/YOUR-NAME/adaptivesportsnearme.git
   cd adaptivesportsnearme
   git checkout staging
   npm run setup
   npm run dev       # http://localhost:8787
   ```
3. **Make a branch off `staging`.** `git checkout -b your-name/what-you-are-fixing`
4. **Make the change, with a test.** Tests live in `test/`. Run `npm test` before you push.
5. **Open a pull request into `staging`.** Never into `main`. Say what changed and how you checked it. For anything people see, add a phone screenshot and a desktop screenshot, before and after.
6. **Review.** A maintainer reviews every pull request. Merged work goes to the test site first, then to adaptivesportsnearme.com in the next release.

## What we care about

- **Accessibility comes first.** We aim for [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/). Everything works with a keyboard and a screen reader, and text is readable in light and dark mode.
- **Plain words.** Write like a person: short sentences, no jargon, no dashes in what people read. An **organization** is who runs things; a **program** is what it offers, like wheelchair basketball.
- **Only true claims.** Never invent a listing's details. If we don't know, the site says so.
- **Privacy.** Listings show a city and state. An organization's address, phone and email show only when the organization says yes. Never commit anyone's contact details, even in test data.
- **No money asks.** This site never asks for donations. That lives on [adapttolife.org](https://adapttolife.org).
- **Small pull requests.** One change each. They're easier to review and quicker to merge.

## Never commit

`.env`, `.dev.vars`, API keys, tokens or passwords. If you commit one by accident, tell a maintainer right away; don't just delete it in a later commit.

## Questions

Ask in [Discussions](https://github.com/adapttolife/adaptivesportsnearme/discussions/categories/q-a) or on the issue you're working on. There are no silly questions here.

Everyone here follows our [code of conduct](CODE_OF_CONDUCT.md). Maintainers' notes on deploys and environments: [docs/MAINTAINERS.md](docs/MAINTAINERS.md).
