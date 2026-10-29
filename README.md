# Sock Drawer

ECE:5230 Generative AI Tools · Team 4

A mobile-friendly wardrobe assistant where you can upload clothing, discover outfit combinations, hear descriptions, and preview clothing on yourself.

## Run locally

Requires Node.js 20.12 or newer. No dependencies or install step.

```powershell
npm start
```

Open **http://localhost:3000**. Use **Explore sample wardrobe** for a quick walkthrough, or **Add clothing** to start your own. Samples are illustrations, not real wardrobe photos.

```powershell
npm test
```

## Connect AI

```powershell
Copy-Item .env.example .env
```

Set `OPENAI_API_KEY` in `.env`, then restart the server. Never put keys in browser code or commit `.env`. The status panel reports key configuration, not verified account access.

The server integrates the proposal's `gpt-5.4-mini` through the Responses API for clothing identification, and `gpt-image-2` through the Images edits API for previews. Models can be overridden with `VISION_MODEL` and `IMAGE_MODEL`. Account model access and credits are required. Each AI operation requires photo consent and can incur API charges. Missing keys produce an explicit error, never a simulated AI result.

## First milestone

- Add, edit, remove, search, and filter clothing with compressed photos and editable labels.
- Save your wardrobe in browser IndexedDB across reloads.
- Identify multiple visible garments in a photo and review suggested labels before saving each piece.
- Match existing clothing by occasion and warmth, with explanations and alternate combinations. **Matching is local rules, not AI reasoning or color analysis.**
- Read outfit descriptions aloud using browser speech synthesis, with a stop control.
- Request virtual previews from a wardrobe piece, an inspiration photo, or a written prompt. The outfit studio can also hand a suggested combination to try-on.
- Download generated previews, with AI labeling and appearance preservation instructions.
- Responsive layout, keyboard controls, named inputs, native modal dialogs, status announcements, and explicit color names.

## Privacy and boundaries

Wardrobe images and labels live only in this browser. Clearing browser data deletes them. The local server does not persist photos. Personal try-on and generated images are held in tab memory. OpenAI receives photos only for explicitly requested AI actions; provider retention policies still apply. Browser speech processing depends on the selected voice and device. Photo imports are limited to JPEG, PNG, and WebP under 10 MB and resized to a maximum 1024 pixels before storage or processing.

The server binds to loopback only. This is a local development app, not a production deployment; add authentication, rate limits, durable storage, and deployment-specific origin handling before exposing an API key to other users.

## Next milestones

See [implementation notes](docs/IMPLEMENTATION.md) for proposal coverage and evaluation tasks. Native phone packaging, FASHN Try-On v1.6, Qwen3-TTS, AI outfit reasoning, automated photo cropping, accounts, and cloud sync remain future work. Browser speech is the initial accessible speech implementation. Live AI output quality and identity preservation require evaluation with consented test photos.

## API references

- [OpenAI image inputs](https://developers.openai.com/api/docs/guides/images-vision)
- [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
- [Image edits](https://developers.openai.com/api/reference/resources/images/methods/edit)
