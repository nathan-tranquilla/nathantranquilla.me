# Blog Publish

TRIGGER WHEN: publishing a blog post, removing draft status, or preparing a post for production

## Pre-publish Checklist

Before publishing a blog post in `src/pages/blogs/`, verify the following:

1. **Slug matches title.** The filename (slug) must match the `title` frontmatter, lowercased and hyphenated. For example, a title of "Teach Claude Your Project Once, Benefit Forever" should have the filename `teach-claude-your-project-once-benefit-forever.md`. If they don't match, rename the file to match the title.
2. **Draft frontmatter is removed.** Remove the `draft` field from the frontmatter entirely, or set it to `false`. Do not leave `draft: true`.
3. **Date is set to today.** Update the `date` frontmatter to today's date in `YYYY/MM/DD` format.

## Related Skills

| Skill | When to use |
|-------|-------------|
| blog-review | When reviewing or editing a draft before publishing |
