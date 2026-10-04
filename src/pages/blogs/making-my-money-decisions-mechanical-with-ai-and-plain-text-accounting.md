---
layout: ../../layouts/Blog.astro
title: Making My Money Decisions Mechanical With AI and Plain-Text Accounting
hash: "95cdjm"
description: "An AI agent keeps my business and household books once hledger checks its work. The monthly money decisions now take about an hour and are no longer draining."
author: Nathan Tranquilla
date: "2026/10/01"
tags: ["AI", "Finance", "Automation"]
---


Managing the money for my business and my family now takes me about an hour a month, and it costs me almost nothing emotionally. For a long time, I dreaded it, and it drained me.

I run my own business, and the business collects taxes it has to remit, so I have to set that money aside and calculate what is owed. Every time I get paid, I also have to work out how much to pay myself and how much to hold back for my personal taxes at the end of the year. Then comes everything a household of five has: credit cards, lines of credit, checking, and savings, with hundreds of transactions a month running through them.

Going by gut instinct about what we could afford meant living with the stress of the unknown. Tracking every single purchase by hand, all the time, was more than I could keep up with. What I needed was a mechanical solution: something that knew my financial system and told me where to move the money.

It occurred to me that I didn't have to track our finances myself; an agent could do it for me. I'm far from the first person to think so, and an agent would be a key part of taking charge of my finances. But agents are prone to hallucination, and they will confidently claim something is correct whether it is or not. Tracking the integrity of a ledger over time needs something durable and tested, a source of truth the agent can work with. An agent alone doesn't come with those guarantees; tested ledger software does.


<aside data-ui="callout">
<p data-callout-label>A few terms before we go further</p>

- **Agent:** an AI assistant that can run commands and read and edit files on your computer. I use Claude Code.
- **hledger:** free, open-source accounting software that keeps your books in plain-text files.
- **Journal:** one of those plain-text files, where hledger records transactions.
- **Account:** hledger's name for a bucket of money, like `expenses:groceries`.
- **Reconcile:** to make your records match the balance your bank shows.
- **Skill:** a written set of instructions the agent follows for a particular job.

</aside>


## Why I Was So Fussy About the Tools

The first thing I needed was double-entry accounting. For anyone who hasn't met it, here is how it works. Money never just flows into an account; every transaction takes an amount out of one account and adds it to another, and those amounts must sum to zero. That means an entry that doesn't add up can't get in; hledger rejects anything that doesn't sum to zero. So if I could find a double-entry tool simple enough for an agent to use, the agent would get the right signals to make factual claims about my finances with confidence.

The second thing I needed was a tool an agent could work with easily, so that any claim about my finances could be checked just by running a command. Ideally that meant a command line interface, which an agent can run trivially.

Third, I wanted to standardize on plain text, for two reasons. I didn't want to be locked into one tool forever, and I wanted the whole process to be transparent and readable to an agent directly.

That's how I landed on hledger. I had known about it for a long time, but I lacked the time and commitment to learn it well enough to act as my own financial agent. Within the past year, it became obvious that AI agents already come knowing how to use hledger, and that they learn quicker than I could. I don't need to know every detail of how it uses the tool. Skipping that learning curve saved me time and energy, and I still get the benefits of double entry. I can trust the agent to take my higher-order ideas, use hledger to get the answers, and record the data, because it is instructed to back every claim with hledger, and the checks catch it when it doesn't.

This is the programmatic enforcement I wrote about in [Taking Responsibility for Your AI-Generated Code](/blogs/taking-responsibility-for-your-ai-generated-code/#start-with-programmatic-enforcement). An AI agent on its own could probably do a half-decent job of keeping track of my finances, but not reliably, and not without hallucinations. So instead, I hand it a tool it can use as a database, one that gives a strong signal whenever things don't balance. Beyond that, reconciling catches what is missing or wrong; if an account's balance doesn't match the bank's, the agent can't call it done.


## Bridging the Gap Between the Agent and hledger

So I had an agent and I had a tool, but the agent still needed onboarding to our particular financial situation. The first step was to download the statements for every one of our bank accounts. Then we made a mapping file for hledger that maps each merchant to an account, which is hledger's name for a bucket like `expenses:groceries`. For us, a purchase at Walmart is groceries, so whenever we buy something at Walmart, the ledger needs to recognize it as groceries. That is just one mapping. Onboarding is really the work of figuring out your accounts: the buckets you want your spending sorted into.

A mapping file looks something like this:

```
# import/credit-card/card.rules
fields date, description, amount
date-format %Y-%m-%d
skip 1

account1 liabilities:credit-card

# Anything no rule matches lands here, to be mapped next time
account2 expenses:other

if
WALMART
SUPERSTORE
 account2 expenses:groceries

if
TIM HORTONS
PIZZA
 account2 expenses:dining

if
PAYMENT THANK YOU
 account2 assets:checking
```

The second step was making the agent aware of my particular situation. That means tax information, federal and provincial, including how much HST applies to my invoices. It also means my debt paydown strategy and my preferred minimum balances for my personal and business checking accounts: anything specific to my finances that I want handled just so. For example, once I've set aside my business taxes, paid myself, and taken out my own taxes, where does the rest of the money go? Does it pay down debt or go to savings, and which credit cards carry the most interest?

You may collect many rules as you and your agent evolve together, but one rule has to be there for this setup. When the agent works with the data files, the plain-text files that hold all the financial information, every truth claim must be made using the hledger command line tool. In my setup, that rule loads in every session, so the agent is always told to back any balance, total, or amount with hledger.

Here is that rule:

````markdown
<!-- .claude/rules/ledger-truth.md -->
# The ledger is the source of truth

Applies project-wide: any time a balance, total, or amount comes up,
whether or not a journal file is open.

- Never state a balance, total, or amount from memory or by reading
  the file by eye. Run an hledger command and quote its output.
- Cite the account each number came from, for example
  `hledger balance assets:checking`.
- Do arithmetic in hledger where it can. When a calculation must
  happen outside hledger, show the hledger output it started from.
- Raw bank CSVs are inputs for importing and reconciling, not a
  source for stated figures.
- After editing a journal, run `hledger check` and report the result
  before saying the edit is done.
````


## The Monthly Run, End to End

Now we're ready to start reconciling, which I do monthly, because monthly feedback is all I need for a snapshot of our spending. I hand the agent each account's recent transactions, and a skill I've added to the project does the rest. It writes each transaction to the correct journal, runs `hledger check`, and won't consider an account done until its balance matches the bank's. When a transaction doesn't match anything it knows, it asks me what the spending was and which account it maps to in hledger.

When the reconciliation finishes, it hands off to a second skill, the financial advisor. The advisor relieves me of thinking about, and feeling the burden of, moving money: how much goes where. It can work that out precisely because it has the full financial picture, reconciled in the step before. The order the money flows in is yours to set, and it depends entirely on your situation; you might set aside taxes first, keep a minimum balance in checking, and send the rest to debt. You might pay off the smallest balances first or the highest-interest cards, or, with no debt, put a set amount into savings or an RRSP.

Here is an invented example of what its advice looks like. The household, the accounts, and every number are made up:

> **Money moves, in order** *(invented example)*
>
> After this month's $4,000 deposit:
>
> 1. **Set aside $900 for the quarterly tax instalment.** *Next instalment fully covered.*
> 2. **Add $400 to the emergency fund.** *That completes three months of expenses.*
> 3. **Move $350 to the vacation fund.** *On track for the summer trip.*
> 4. **Pay the full $1,650 card balance.** *No interest this month.*
> 5. **Send the remaining $700 to the student loan.** *This moves the payoff date two months closer.*
>
> Retirement savings stay on their automatic $300 a month.

Finally, there are budgets and reports. A budget is a feature of hledger itself: you define it in hledger files and run it through hledger commands. For me, the last step is a script that generates a report comparing what we budgeted with what we actually spent, broken down by category and set up for our situation. Commands like these are repeatable, but too complex to trust an agent to run the same way every time, so they are enforced programmatically by scripting them, in my case as a rake task.

The reports give us valuable feedback on our spending: a monthly summary of our transactions by category, and where we went over budget, whether that was groceries, personal spending, or dining out. From there, we can think back on our habits and adjust for the next month.


## Limitations

This setup doesn't solve automatic imports at all. Reconciling still means collecting transactions from your credit cards, your bank, and so on by hand. Depending on where you live and who you bank with, you may be able to set up automatic imports, but that isn't possible for me, so it isn't part of this setup. The money doesn't move itself either; the financial advisor tells you how to move it, and you do the moving. What it does relieve is the emotional stress of handling money and making the decisions.

It also isn't a real-time dashboard. Feedback comes when you reconcile your accounts, which for me is monthly, and feedback on my spending once a month is enough for me.

Security is always going to be a concern with financial data. Ideally, store it encrypted at rest, and if you back it up to a repository, make sure the repository is private, or encrypt it with a tool like git-crypt. Be aware that AI agents have access to whatever is inside your folder, so using one is a matter of trust as well as security. If that concerns you, you can turn off model training in your settings, though whether and how depends on the vendor.


My latest monthly session took about an hour, and it was almost entirely mechanical. I downloaded the transactions, dumped them into the chat, and told my agent which file was for my credit card and which was for my bank. When it finished reconciling, it needed one correction, and it made it. Then it told me how to move the money, I moved it, and every move passed my gut check.

That is a tremendous burden relieved. For me, the most draining part of managing money is the time, energy, and emotion spent thinking about it and feeling its weight. With the decisions made mechanical, there isn't much thinking left to do, and that has taken away so much of the stress.

<div class="mt-16 border-t border-[var(--border-primary)] pt-8">
  <p class="mb-6 font-sans text-[var(--text-secondary)]">
    If you're looking to reduce the stress and burden of managing the finances
    in your small business, I can help you build a system like this one.
  </p>
  <a href="/consultation" data-ui="button" data-variant="primary">
    Book a consultation
  </a>
</div>
