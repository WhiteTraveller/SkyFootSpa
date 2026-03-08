# MusicEvents.chooseMusic

## Basic info

- Valid script types: [CLIENT]

- Has result? ✘

- Event class: ChooseMusicEvent (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| isPlayingMusic |  |  | boolean | ✘ |
| modifyWeights | WeightModificationCallback |  | void | ✘ |
| currentMusic |  |  | SoundInstance | ✘ |
| getBiome |  |  | Holder<Biome> | ✘ |
| getTracks |  |  | List<WeightedEntry.WeightedEntry$Wrapper<Music>> | ✘ |
| add | int, Music[] |  | void | ✘ |
| remove | Predicate<Music> |  | void | ✘ |
| getPlayer |  |  | Player | ✘ |
| getEntity |  |  | Entity | ✘ |
| hasGameStage | String |  | boolean | ✘ |
| removeGameStage | String |  | void | ✘ |
| addGameStage | String |  | void | ✘ |
| getLevel |  |  | Level | ✘ |
| getServer |  |  | MinecraftServer | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `boolean isPlayingMusic()`
```
Whether or not music is currently playing
```

- `void modifyWeights(WeightModificationCallback var0)`

  Parameters:
  - var0: WeightModificationCallback

```
Set the weights for each piece of music that can be played
```

- `SoundInstance currentMusic()`
```
Get the current active music instance
```

- `void add(int var0, Music[] var1)`

  Parameters:
  - var0: int
  - var1: Music[]

```
Add music with a weighted chance of being selected
```

- `void remove(Predicate<Music> var0)`

  Parameters:
  - var0: Predicate<Music>

```
Prevent any music that matches the given predicate from playing
```

- `boolean hasGameStage(String var0)`

  Parameters:
  - var0: String

```
Checks if the player has the specified game stage
```

- `void removeGameStage(String var0)`

  Parameters:
  - var0: String

```
Removes the specified game stage from the player
```

- `void addGameStage(String var0)`

  Parameters:
  - var0: String

```
Adds the specified game stage to the player
```

- `Object cancel(Object var0)`

  Parameters:
  - var0: Object

```
Cancels the event with the given exit value. Execution will be stopped **immediately**.

`cancel` denotes a `false` outcome.
```

- `Object cancel()`
```
Cancels the event with default exit value. Execution will be stopped **immediately**.

`cancel` denotes a `false` outcome.
```

- `Object exit()`
```
Stops the event with default exit value. Execution will be stopped **immediately**.

`exit` denotes a `default` outcome.
```

- `Object exit(Object var0)`

  Parameters:
  - var0: Object

```
Stops the event with the given exit value. Execution will be stopped **immediately**.

`exit` denotes a `default` outcome.
```

- `Object success(Object var0)`

  Parameters:
  - var0: Object

```
Stops the event with the given exit value. Execution will be stopped **immediately**.

`success` denotes a `true` outcome.
```

- `Object success()`
```
Stops the event with default exit value. Execution will be stopped **immediately**.

`success` denotes a `true` outcome.
```



### Example script:

```js
MusicEvents.chooseMusic((event) => {
	// This space (un)intentionally left blank
});
```

