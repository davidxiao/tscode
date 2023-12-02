## guideline

### reference

[frame data format](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#format)

### backend

Could run by `yarn run dev`

or `./bin/stan --file data.json --interval 15000`

### frontend

Could run by `yarn run dev`

## Notes

### How did you decide on the technical and architectural choices used as part of your solution?

Overview, it's not complex project, so no special architectural choice when doing with time pressure, but many details need to be careful.

Having said that, the tasks into below parts:

- ws lib

- start point, from `./server` or `./bin/stan` with option

- unit test

- frontend,

### What would you do differently if you were allocated more time?

- I think most of the system is good for me, but I can improve stability, edge cases, etc

- the bundling part probably can improve as well, especially need to compile into one single file, which ideally include all imported code, maybe need 3rd tools, or need more time to explore.

- I could improve the tests,

- I could improve the UI for front end

### Commit history

I will try to commit several times, or maybe we can discuss further if it's not what you want
