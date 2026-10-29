# Implementation notes

Source: `../Proposal Idea/GAIT Project Proposal.docx`, read October 29, 2026. The source document remains unchanged.

## Architecture

Browser modules provide a responsive web app with IndexedDB wardrobe persistence. The same pure outfit selection module is served to the browser and imported in unit tests. A dependency-free Node HTTP server serves public assets and proxies opt-in OpenAI operations. Keys remain on the server. No database or account is required for local development.

## Proposal coverage

| Proposal workflow | Initial implementation | Remaining work |
| --- | --- | --- |
| Try on your own clothes | Select wardrobe piece and person photo; request image edit | Dedicated FASHN adapter and quality comparison |
| Try on an inspiration outfit | Upload reference and person photos | Multi-garment fidelity evaluation |
| Identify closet and generate outfits | Vision labeling with review; local outfit combinations and spoken explanation | AI outfit reasoning, color matching, individual garment crops |
| Try on an outfit from a prompt | Person photo plus written outfit description | Evaluation over diverse poses and body types |
| Accessible spoken descriptions | Named colors, browser speech, stop control, keyboard-friendly forms | Qwen3-TTS, screen reader audit with users |
| Responsible use | Consent before provider calls; preservation prompt; AI preview labels | Consent usability study and measured identity preservation |

## Evaluation plan

Use photos from people who explicitly consent. Compare every preview against the original for facial identity, skin tone, body proportions, garment fidelity, and visible artifacts. Record latency, provider/model, approximate cost, and success or failure. Include different lighting, skin tones, poses, clothing patterns, and occlusion. Ask reviewers whether the described pieces match the actual wardrobe and whether outfit explanations are useful. Do not treat successful API responses as proof of visual fidelity.

## Technical checks

Automated tests cover incomplete wardrobe handling, occasion and temperature selection, one-pieces, input immutability, image input restrictions, missing credentials, malformed provider output, preservation instructions, public asset serving, nonpublic files, required consent, malformed requests, and cross-origin rejection. Provider tests use injected fixtures and do not incur charges. Browser walkthrough and live provider quality evaluation are separate checks.

Initial verification: 16 automated tests passed. The local server started successfully. Visual browser verification was attempted but blocked by an unavailable browser host and a timed-out native app connection. No live provider requests were made; model access, generated image quality, speech playback, and the full browser upload/persistence flow still need interactive evaluation.
