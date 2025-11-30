# AlterSelector
A plugin for prefixing chat messages for people with DID (or your own uses) and their alters. 

In case stuff like PluralKit isn't available in the scenario, such as group chats or DM's. 

> [!IMPORTANT]
>  Plugin is still a Work-In-Progress (as all my unfinished crud) so some things are a little jank.
> 
>  Don't expect it to be picture-perfect! Some features may not be fully integrated with Discord.

## Features 
- Simple prefixes in chat (with emojis, but emojis are a little harder to insert right now)

## Ideas
- status updates for fronting
  - triggers when message sent with new prefix (alter)
  - trigger with manual button push (dunno where to put said button)
- discord rpc integration
  - discord rpc is probably gonna follow something like above
  - custom profile pictures for rpc image + text and stuff like that
 
## How to install
1. Follow [this guide](https://docs.vencord.dev/installing/)
2. Create the userplugins folder as the second section says: [Installing custom plugins](https://docs.vencord.dev/installing/custom-plugins/)
3. Create a new AlterSelector folder inside the userplugins folder
4. Extract all the plugin files to the AlterSelector folder
5. In Command Prompt, go to the Vencord directory and run: ```pnpm build``` and ```pnpm inject```
6. Inject to your Discord install and launch Discord
