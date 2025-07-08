## Features

- Automatically renames a file for you **based on what it ends with**
- Optionally inserts some text into that file

## Why would I ever use this?

This extension is intended to boost productivity when you have to type longish file extensions.

My primary use case was using this to reduce time and misspelling in creating **.svelte** files for [SVELTE](https://svelte.dev/)

<img src="https://github.com/Jojoshua/auto-rename-file/raw/HEAD/animation.gif">

## Extension Configuration

Add entry into your VSCode settings.json file and configure like the example below

```
  "autoRenameFile": {
    "config": [
      {
        "from": ".sv",
        "to": ".svelte"
      },
      {
        "from": ".svt",
        "to": ".svelte",
         "insertText": "<script lang='ts'>\n\n</script>"
      }
    ]
  }
```

## Donation

If this software helped you, donate a cup of coffee :)

[![Donate](https://img.shields.io/badge/donate-Paypal-fd8200.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CEWVQRNQ7AEVW)
